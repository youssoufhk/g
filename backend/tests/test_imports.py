"""Unit tests for backend/app/features/imports/*.

These tests mock the AIClient so they run offline. The live-LLM eval
against Ollama lives at backend/app/ai/evals/column_mapper/ and is run
in the agent/founder eval loop, not on every commit.
"""

from __future__ import annotations

import io

import pytest
from fastapi.testclient import TestClient

from app.ai.client import AIResponse, MockAIClient
from app.features.imports import service
from app.features.imports.ai_tools import map_columns
from app.features.imports.validators import target_fields, validate_row
from app.main import app


def _csv_bytes(rows: list[dict[str, str]], headers: list[str]) -> bytes:
    buf = io.StringIO()
    buf.write(",".join(headers) + "\n")
    for row in rows:
        buf.write(",".join(row.get(h, "") for h in headers) + "\n")
    return buf.getvalue().encode("utf-8")


@pytest.mark.asyncio
async def test_map_columns_fuzzy_fallback_when_llm_silent() -> None:
    mock_ai = MockAIClient()
    # MockAIClient returns a canned "[mock] no canned response" string so
    # _parse_llm_json returns None and we fall through to fuzzy matching.
    result = await map_columns(
        headers=["first_name", "last_name", "email", "role", "team"],
        entity_type="employees",
        ai_client=mock_ai,
    )
    mapping_by_source = {m.source_header: m for m in result.mapping}
    assert mapping_by_source["first_name"].target_field == "first_name"
    assert mapping_by_source["last_name"].target_field == "last_name"
    assert mapping_by_source["email"].target_field == "email"
    assert mapping_by_source["role"].target_field == "role"
    assert mapping_by_source["team"].target_field == "team"


@pytest.mark.asyncio
async def test_map_columns_handles_french_legacy_headers() -> None:
    mock_ai = MockAIClient()
    result = await map_columns(
        headers=["Prenom", "Nom", "Email pro", "Poste", "Equipe"],
        entity_type="employees",
        ai_client=mock_ai,
    )
    mapping_by_source = {m.source_header: m for m in result.mapping}
    # fuzzy matching hits synonyms for prenom -> first_name, nom -> last_name
    assert mapping_by_source["Prenom"].target_field == "first_name"
    assert mapping_by_source["Nom"].target_field == "last_name"


@pytest.mark.asyncio
async def test_map_columns_returns_none_target_for_junk_header() -> None:
    mock_ai = MockAIClient()
    result = await map_columns(
        headers=["Internal Notes", "random_garbage"],
        entity_type="clients",
        ai_client=mock_ai,
    )
    for mapping in result.mapping:
        # Neither should map to a real client field
        assert mapping.target_field is None or mapping.confidence < 0.7


@pytest.mark.asyncio
async def test_map_columns_uses_llm_output_when_parseable() -> None:
    canned = MockAIClient()
    canned.register(
        "You are a CSV column mapping assistant",
        AIResponse(
            text=(
                '{"alpha":{"target_field":"name","confidence":0.95,"reason":"exact"},'
                '"beta":{"target_field":null,"confidence":0.0,"reason":"no match"}}'
            ),
            tool_calls=[],
            tokens_in=20,
            tokens_out=30,
        ),
    )
    result = await map_columns(
        headers=["alpha", "beta"],
        entity_type="clients",
        ai_client=canned,
    )
    by_source = {m.source_header: m for m in result.mapping}
    assert by_source["alpha"].target_field == "name"
    assert by_source["alpha"].confidence == pytest.approx(0.95)
    assert by_source["beta"].target_field is None


def test_validate_row_flags_missing_required_fields() -> None:
    errors = validate_row(
        0,
        {"first_name": "Claire", "last_name": "", "email": "", "role": "owner"},
        entity_type="employees",
    )
    missing = {e.field for e in errors}
    assert "last_name" in missing
    assert "email" in missing
    assert "first_name" not in missing


def test_validate_row_accepts_complete_row() -> None:
    errors = validate_row(
        0,
        {
            "first_name": "Claire",
            "last_name": "Dubois",
            "email": "claire@acme.eu",
            "role": "owner",
        },
        entity_type="employees",
    )
    assert errors == []


def test_target_fields_known_entity_types() -> None:
    assert any(f.name == "email" for f in target_fields("employees"))
    assert any(f.name == "country_code" for f in target_fields("clients"))
    assert any(f.name == "budget_minor_units" for f in target_fields("projects"))
    assert any(f.name == "name" for f in target_fields("teams"))


@pytest.mark.asyncio
async def test_preview_csv_end_to_end_happy_path() -> None:
    csv_bytes = _csv_bytes(
        [
            {
                "first_name": "Claire",
                "last_name": "Dubois",
                "email": "claire@acme.eu",
                "role": "owner",
                "team": "Finance",
                "hire_date": "2024-01-15",
            },
            {
                "first_name": "Oliver",
                "last_name": "Smith",
                "email": "oliver@acme.eu",
                "role": "pm",
                "team": "Tech",
                "hire_date": "2023-06-10",
            },
        ],
        headers=["first_name", "last_name", "email", "role", "team", "hire_date"],
    )
    result = await service.preview_csv(
        raw_bytes=csv_bytes,
        entity_type="employees",
        ai_client=MockAIClient(),
    )
    assert result.row_count == 2
    assert result.headers == [
        "first_name",
        "last_name",
        "email",
        "role",
        "team",
        "hire_date",
    ]
    assert len(result.preview_rows) == 2
    assert result.preview_rows[0]["first_name"] == "Claire"
    assert result.errors == []


@pytest.mark.asyncio
async def test_preview_csv_reports_validation_errors() -> None:
    csv_bytes = _csv_bytes(
        [{"first_name": "X", "last_name": "", "email": "", "role": ""}],
        headers=["first_name", "last_name", "email", "role"],
    )
    result = await service.preview_csv(
        raw_bytes=csv_bytes,
        entity_type="employees",
        ai_client=MockAIClient(),
    )
    missing = {e.field for e in result.errors}
    assert "last_name" in missing
    assert "email" in missing
    assert "role" in missing


def test_imports_route_rejects_empty_upload() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/imports/preview",
            data={"entity_type": "employees"},
            files={"file": ("empty.csv", b"", "text/csv")},
        )
    assert response.status_code == 400


def test_imports_route_parses_valid_csv() -> None:
    csv_bytes = _csv_bytes(
        [
            {
                "first_name": "Claire",
                "last_name": "Dubois",
                "email": "claire@acme.eu",
                "role": "owner",
            }
        ],
        headers=["first_name", "last_name", "email", "role"],
    )
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/imports/preview",
            data={"entity_type": "employees"},
            files={"file": ("e.csv", csv_bytes, "text/csv")},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["entity_type"] == "employees"
    assert body["row_count"] == 1
    assert len(body["mapping"]) == 4


def test_imports_commit_returns_501() -> None:
    with TestClient(app) as client:
        response = client.post("/api/v1/imports/commit")
    assert response.status_code == 501
