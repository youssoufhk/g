"""Invoice AI tools: list filter + month-end-close draft explainer.

``filter_invoices`` drives the /invoices page URL state from a natural-
language query.

``explain_invoice_draft`` is the month-end-close agent building block.
The founder clicks into one of the 20 drafts the agent prepared; this
tool takes the invoice draft + its analyzer signals (overdue items
detected, budget burn delta, expense line reconciliation) and returns
a 2-3 sentence plain-text explanation plus the top 3 ranked signals.
The batch size is pinned at 20 per prompt so Gemini Flash costs stay
under the per-close budget in ``specs/AI_FEATURES.md §7.4``.
"""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from app.ai.registry import ToolSpec, register


class FilterInvoicesInput(BaseModel):
    client_id: int | None = Field(
        default=None, description="clients.id to filter by"
    )
    project_id: int | None = Field(
        default=None, description="projects.id to filter by"
    )
    status: str | None = Field(
        default=None,
        pattern=r"^(draft|issued|sent|paid|overdue|voided)$",
    )
    date_from: date | None = Field(
        default=None, description="inclusive invoice_date lower bound"
    )
    date_to: date | None = Field(
        default=None, description="inclusive invoice_date upper bound"
    )
    overdue_only: bool = Field(
        default=False,
        description="shortcut for status=overdue; composes with date window",
    )


class FilterInvoicesOutput(BaseModel):
    url_state: dict[str, str]
    human_summary: str


class ExplainInvoiceDraftInput(BaseModel):
    invoice_id: int = Field(..., description="draft invoices.id to explain")
    analyzer_signals: list[str] = Field(
        ...,
        description=(
            "pre-computed signal tags from the month-end-close analyzer, "
            "e.g. 'budget_exceeded', 'hours_out_of_range', 'fx_drift'"
        ),
    )


class InvoiceSignalRank(BaseModel):
    name: str
    weight: float
    rationale: str


class ExplainInvoiceDraftOutput(BaseModel):
    explanation: str = Field(
        ...,
        description="2-3 sentence plain-text summary for the founder UI",
    )
    top_signals: list[InvoiceSignalRank] = Field(
        ...,
        max_length=3,
        description="top 3 ranked signals driving the explanation",
    )


FILTER_SPEC = register(
    ToolSpec(
        name="filter_invoices",
        feature="invoices",
        description=(
            "List invoices by client, project, status, or date range. "
            "Returns URL query params the /invoices page accepts."
        ),
        input_schema=FilterInvoicesInput,
        output_schema=FilterInvoicesOutput,
        handler=None,
        tags=("palette", "read-only"),
    )
)


EXPLAIN_SPEC = register(
    ToolSpec(
        name="explain_invoice_draft",
        feature="invoices",
        description=(
            "Given a month-end-close draft invoice and its analyzer signals, "
            "return a 2-3 sentence explanation plus the 3 strongest signals."
        ),
        input_schema=ExplainInvoiceDraftInput,
        output_schema=ExplainInvoiceDraftOutput,
        handler=None,
        tags=("close-agent", "read-only"),
    )
)
