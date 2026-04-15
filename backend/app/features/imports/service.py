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

from app.ai.client import AIClient
from app.features.imports.ai_tools import map_columns
from app.features.imports.schemas import (
    ColumnMapping,
    EntityType,
    PreviewResponse,
    RowValidationError,
)
from app.features.imports.validators import validate_row

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


def _decode(raw_bytes: bytes) -> str:
    """Decode a CSV upload as UTF-8 with BOM stripping."""
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            return raw_bytes.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw_bytes.decode("utf-8", errors="replace")
