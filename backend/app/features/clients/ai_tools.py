"""Client summary AI tool."""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.ai.registry import ToolSpec, register


class GetClientSummaryInput(BaseModel):
    client_id: int = Field(..., description="clients.id")


class ClientProjectRef(BaseModel):
    project_id: int
    name: str
    status: str


class GetClientSummaryOutput(BaseModel):
    client_id: int
    name: str
    country_code: str
    currency: str
    active_projects: list[ClientProjectRef]
    open_invoice_count: int
    open_invoice_total_minor_units: int
    lifetime_revenue_minor_units: int
    primary_contact_label: str | None


SPEC = register(
    ToolSpec(
        name="get_client_summary",
        feature="clients",
        description=(
            "Return a client overview: active projects, open invoices, "
            "lifetime revenue, primary contact."
        ),
        input_schema=GetClientSummaryInput,
        output_schema=GetClientSummaryOutput,
        handler=None,
        tags=("palette", "read-only"),
    )
)
