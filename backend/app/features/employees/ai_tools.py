"""Employee AI tools: summary + contribution + capacity.

The three tools here honour CLAUDE.md §2 hard-rule 6 on banned
vocabulary. The analytic tools return "work time" (booked billable
hours / capacity) and "capacity" (contract hours minus leave minus
holidays) as canonical names.
"""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field, model_validator

from app.ai.registry import ToolSpec, register


class GetEmployeeSummaryInput(BaseModel):
    employee_id: int = Field(..., description="employees.id")


class GetEmployeeSummaryOutput(BaseModel):
    employee_id: int
    display_name: str
    team_label: str | None
    manager_label: str | None
    current_allocations: list[dict[str, str | int | float]]
    contribution_last_month_pct: float | None = Field(
        default=None,
        ge=0.0,
        description="billable hours divided by capacity last month, 0.0-1.0",
    )
    pto_balance_days: float | None = Field(default=None)


class _DateRange(BaseModel):
    """Shared base for the two analytic tools: enforce start <= end and
    a sane upper bound (1 year) so an overly greedy LLM does not scan
    the whole history of the tenant for a single palette query."""

    employee_id: int = Field(..., description="employees.id")
    date_from: date
    date_to: date

    @model_validator(mode="after")
    def _check_range(self) -> _DateRange:
        if self.date_to < self.date_from:
            raise ValueError("date_to must be on or after date_from")
        if (self.date_to - self.date_from).days > 400:
            raise ValueError("range larger than ~1 year is not allowed")
        return self


class ComputeContributionInput(_DateRange):
    """`contribution` = billable hours / capacity. Canonical brand term
    per CLAUDE.md §2 hard-rule 6."""


class ComputeContributionOutput(BaseModel):
    employee_id: int
    date_from: date
    date_to: date
    billable_hours: float = Field(..., ge=0.0)
    capacity_hours: float = Field(..., ge=0.0)
    contribution_pct: float = Field(..., ge=0.0)


class ComputeCapacityInput(BaseModel):
    team_id: int | None = Field(
        default=None,
        description="teams.id; null = single employee via employee_id",
    )
    employee_id: int | None = Field(
        default=None,
        description="employees.id; null = whole team via team_id",
    )
    date_from: date
    date_to: date

    @model_validator(mode="after")
    def _one_scope(self) -> ComputeCapacityInput:
        if (self.team_id is None) == (self.employee_id is None):
            raise ValueError(
                "exactly one of team_id / employee_id must be set"
            )
        if self.date_to < self.date_from:
            raise ValueError("date_to must be on or after date_from")
        if (self.date_to - self.date_from).days > 400:
            raise ValueError("range larger than ~1 year is not allowed")
        return self


class ComputeCapacityOutput(BaseModel):
    scope_label: str
    date_from: date
    date_to: date
    working_days: int = Field(..., ge=0)
    leave_days: float = Field(..., ge=0.0)
    holiday_days: int = Field(..., ge=0)
    net_capacity_hours: float = Field(..., ge=0.0)


SUMMARY_SPEC = register(
    ToolSpec(
        name="get_employee_summary",
        feature="employees",
        description=(
            "Return an employee overview: team, manager, allocations, "
            "last-month contribution, PTO balance."
        ),
        input_schema=GetEmployeeSummaryInput,
        output_schema=GetEmployeeSummaryOutput,
        handler=None,
        tags=("palette", "read-only"),
    )
)


CONTRIBUTION_SPEC = register(
    ToolSpec(
        name="compute_contribution",
        feature="employees",
        description=(
            "Calculate contribution (billable hours / capacity) for one "
            "employee over a date range."
        ),
        input_schema=ComputeContributionInput,
        output_schema=ComputeContributionOutput,
        handler=None,
        tags=("analytics", "read-only"),
    )
)


CAPACITY_SPEC = register(
    ToolSpec(
        name="compute_capacity",
        feature="employees",
        description=(
            "Calculate net capacity (working days minus leave minus "
            "holidays) for one employee or a whole team."
        ),
        input_schema=ComputeCapacityInput,
        output_schema=ComputeCapacityOutput,
        handler=None,
        tags=("analytics", "read-only"),
    )
)
