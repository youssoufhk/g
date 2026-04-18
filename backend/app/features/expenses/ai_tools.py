"""Expense AI tools: list filter + receipt OCR extraction.

``filter_expenses`` drives /expenses URL state.

``extract_receipt_data`` is the second AI surface from
``specs/AI_FEATURES.md §5``. It takes a ``files.id`` pointer (the
receipt image already in GCS + scanned by ClamAV) plus the tenant's
expected currency and expense-category list, and returns structured
expense fields the user reviews and submits. Vision is the only tool
in the v1.0 catalog that needs a multi-modal LLM; the OllamaAIClient
can call a local vision model in dev, production uses Gemini vision.
"""

from __future__ import annotations

from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.ai.registry import ToolSpec, register


class FilterExpensesInput(BaseModel):
    employee_id: int | None = Field(default=None)
    status: str | None = Field(
        default=None,
        pattern=r"^(draft|submitted|approved|rejected|reimbursed)$",
    )
    category: str | None = Field(
        default=None, description="expense_categories.code"
    )
    amount_min_cents: int | None = Field(default=None, ge=0)
    amount_max_cents: int | None = Field(default=None, ge=0)
    date_from: date | None = Field(default=None)
    date_to: date | None = Field(default=None)

    @model_validator(mode="after")
    def _amount_range(self) -> FilterExpensesInput:
        lo, hi = self.amount_min_cents, self.amount_max_cents
        if lo is not None and hi is not None and lo > hi:
            raise ValueError("amount_min_cents must be <= amount_max_cents")
        return self


class FilterExpensesOutput(BaseModel):
    url_state: dict[str, str]
    human_summary: str


class ExtractReceiptInput(BaseModel):
    file_id: UUID = Field(..., description="public.files.id of the scanned receipt image")
    expected_currency: str | None = Field(
        default=None,
        min_length=3,
        max_length=3,
        description="ISO 4217; tenant default when null",
    )
    expected_category_list: list[str] = Field(
        ...,
        min_length=1,
        description=(
            "allowed expense_categories.code values; the LLM must pick "
            "from this list or return null"
        ),
    )


class ExtractReceiptOutput(BaseModel):
    merchant: str
    receipt_date: date
    amount_cents: int = Field(..., ge=0)
    currency: str = Field(..., min_length=3, max_length=3)
    category_code: str | None
    vat_cents: int | None = Field(default=None, ge=0)
    confidence: float = Field(..., ge=0.0, le=1.0)


FILTER_SPEC = register(
    ToolSpec(
        name="filter_expenses",
        feature="expenses",
        description=(
            "List expenses by employee, status, category, amount range, or date."
        ),
        input_schema=FilterExpensesInput,
        output_schema=FilterExpensesOutput,
        handler=None,
        tags=("palette", "read-only"),
    )
)


EXTRACT_SPEC = register(
    ToolSpec(
        name="extract_receipt_data",
        feature="expenses",
        description=(
            "Call the vision model on a scanned receipt image and return "
            "structured expense fields (merchant, date, amount, category)."
        ),
        input_schema=ExtractReceiptInput,
        output_schema=ExtractReceiptOutput,
        handler=None,
        tags=("ocr", "vision", "essential"),
    )
)
