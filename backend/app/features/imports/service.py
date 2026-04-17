"""CSV import service: parse + map + validate.

Phase 3a scope: parse the CSV, call the AI column mapper, run structural
validation, return a preview. The commit path (actual DB inserts into
per-tenant tables) lands in Phase 4 when employees/clients/projects
modules exist.
"""

from __future__ import annotations

import csv
import io
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import AIClient
from app.features.clients import service as clients_service
from app.features.employees import service as employees_service
from app.features.imports.ai_tools import map_columns
from app.features.imports.schemas import (
    ColumnMapping,
    CommitResponse,
    EntityType,
    PreviewResponse,
    RowValidationError,
)
from app.features.imports.validators import validate_row
from app.features.projects import service as projects_service

MAX_PREVIEW_ROWS = 5
MAX_VALIDATION_ERRORS = 50


@dataclass
class ImportPreview:
    headers: list[str]
    mapping: list[ColumnMapping]
    preview_rows: list[dict[str, str]]
    errors: list[RowValidationError]
    row_count: int


async def preview_csv(
    *,
    raw_bytes: bytes,
    entity_type: EntityType,
    ai_client: AIClient,
) -> PreviewResponse:
    text = _decode(raw_bytes)
    reader = csv.DictReader(io.StringIO(text))
    headers = reader.fieldnames or []
    rows = list(reader)

    mapper_result = await map_columns(
        headers=headers,
        entity_type=entity_type,
        ai_client=ai_client,
    )

    target_to_source: dict[str, str] = {}
    for mapping in mapper_result.mapping:
        if mapping.target_field and mapping.target_field not in target_to_source:
            target_to_source[mapping.target_field] = mapping.source_header

    translated_rows: list[dict[str, str]] = []
    for row in rows:
        translated = {
            target: row.get(source, "")
            for target, source in target_to_source.items()
        }
        translated_rows.append(translated)

    errors: list[RowValidationError] = []
    for index, row in enumerate(translated_rows):
        errors.extend(validate_row(index, row, entity_type))
        if len(errors) >= MAX_VALIDATION_ERRORS:
            break

    preview_rows = translated_rows[:MAX_PREVIEW_ROWS]

    return PreviewResponse(
        entity_type=entity_type,
        headers=headers,
        row_count=len(rows),
        mapping=mapper_result.mapping,
        preview_rows=preview_rows,
        errors=errors[:MAX_VALIDATION_ERRORS],
        ai_explanation=mapper_result.ai_explanation,
    )


async def commit_csv(
    *,
    session: AsyncSession,
    tenant_id: int,
    raw_bytes: bytes,
    entity_type: EntityType,
    confirmed_mapping: list[ColumnMapping],
) -> CommitResponse:
    """Apply the confirmed column mapping and insert rows into the target table.

    Delegates to the feature-specific bulk_create service so the import
    module never touches the data model of another feature directly (M3).
    """
    text = _decode(raw_bytes)
    reader = csv.DictReader(io.StringIO(text))
    all_rows = list(reader)

    target_to_source: dict[str, str] = {}
    for m in confirmed_mapping:
        if m.target_field and m.target_field not in target_to_source:
            target_to_source[m.target_field] = m.source_header

    translated: list[dict[str, str]] = []
    for row in all_rows:
        translated.append(
            {target: row.get(source, "") for target, source in target_to_source.items()}
        )

    errors: list[RowValidationError] = []
    valid_rows: list[dict[str, str]] = []
    for i, row in enumerate(translated):
        row_errors = validate_row(i, row, entity_type)
        if row_errors:
            errors.extend(row_errors)
        else:
            valid_rows.append(row)

    imported = 0
    if entity_type == "employees":
        imported = await employees_service.bulk_create_employees(
            session, tenant_id=tenant_id, rows=valid_rows
        )
    elif entity_type == "clients":
        imported = await clients_service.bulk_create_clients(
            session, tenant_id=tenant_id, rows=valid_rows
        )
    elif entity_type == "projects":
        imported = await projects_service.bulk_create_projects(
            session, tenant_id=tenant_id, rows=valid_rows
        )
    # "teams" not yet backed by a DB table; skip silently for now.

    await session.commit()

    return CommitResponse(
        entity_type=entity_type,
        imported=imported,
        skipped=len(all_rows) - len(valid_rows),
        errors=errors[:MAX_VALIDATION_ERRORS],
    )


def _decode(raw_bytes: bytes) -> str:
    """Decode a CSV upload as UTF-8 with BOM stripping."""
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            return raw_bytes.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw_bytes.decode("utf-8", errors="replace")
