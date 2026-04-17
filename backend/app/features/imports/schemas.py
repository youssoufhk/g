"""CSV import schemas.

Shape of the Phase 3a onboarding wizard flow:

    1. POST /api/v1/imports/preview with a CSV file + entity_type.
       Response: parsed headers, AI-suggested column mapping, first 5 rows,
       validation errors per row, and a preview of what would be imported.

    2. POST /api/v1/imports/commit (returns 501 until Phase 4). This will
       insert the validated rows into the target tenant tables once the
       employees/clients/projects feature modules exist.

The AI column mapper is part of step 1 and uses the configured AIClient
(OllamaAIClient in dev, VertexGeminiClient in §16 Deploy Track).
"""

from typing import Literal

from pydantic import BaseModel, Field

EntityType = Literal["employees", "clients", "projects", "teams"]


class ColumnMapping(BaseModel):
    """One mapping from a source CSV header to a target field name."""

    source_header: str
    target_field: str | None
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str | None = None


class RowValidationError(BaseModel):
    row_index: int
    field: str | None
    message: str


class PreviewResponse(BaseModel):
    entity_type: EntityType
    headers: list[str]
    row_count: int
    mapping: list[ColumnMapping]
    preview_rows: list[dict[str, str]]
    errors: list[RowValidationError]
    ai_explanation: str | None = None
    idempotency_key: str | None = None


class CommitResponse(BaseModel):
    entity_type: EntityType
    imported: int
    skipped: int
    errors: list[RowValidationError]
