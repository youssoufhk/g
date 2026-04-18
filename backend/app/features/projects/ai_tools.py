"""Project AI tools: summary + budget burn calculator."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from app.ai.registry import ToolSpec, register


class GetProjectSummaryInput(BaseModel):
    project_id: int = Field(..., description="projects.id")


class ProjectAllocationLine(BaseModel):
    employee_id: int
    employee_label: str
    allocation_pct: float = Field(..., ge=0.0, le=100.0)
    role: str | None


class GetProjectSummaryOutput(BaseModel):
    project_id: int
    name: str
    client_label: str
    status: str
    budget_minor_units: int
    currency: str
    allocations: list[ProjectAllocationLine]
    pipeline_stage: str | None
    last_activity_at: str | None


class ComputeBudgetBurnInput(BaseModel):
    project_id: int = Field(..., description="projects.id")
    as_of: date | None = Field(
        default=None,
        description="reference date for the calculation; null = today",
    )


class ComputeBudgetBurnOutput(BaseModel):
    project_id: int
    budget_minor_units: int
    consumed_minor_units: int
    consumed_pct: float = Field(..., ge=0.0)
    forecast_eol_minor_units: int = Field(
        ...,
        description="straight-line end-of-life forecast of total spend at project close",
    )
    status: str = Field(
        ...,
        pattern=r"^(ok|warn|over)$",
        description="ok <80%, warn 80-100%, over >100%",
    )


SUMMARY_SPEC = register(
    ToolSpec(
        name="get_project_summary",
        feature="projects",
        description=(
            "Return a project overview: client, status, budget, allocations, "
            "pipeline stage, last activity."
        ),
        input_schema=GetProjectSummaryInput,
        output_schema=GetProjectSummaryOutput,
        handler=None,
        tags=("palette", "read-only"),
    )
)


BURN_SPEC = register(
    ToolSpec(
        name="compute_budget_burn",
        feature="projects",
        description=(
            "Calculate budget vs actuals for a project and return a "
            "straight-line end-of-life forecast."
        ),
        input_schema=ComputeBudgetBurnInput,
        output_schema=ComputeBudgetBurnOutput,
        handler=None,
        tags=("analytics", "read-only"),
    )
)
