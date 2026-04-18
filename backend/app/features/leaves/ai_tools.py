"""Leave filter tool for the command palette."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from app.ai.registry import ToolSpec, register


class FilterLeavesInput(BaseModel):
    employee_id: int | None = Field(default=None)
    leave_type_code: str | None = Field(
        default=None,
        description="leave_types.code: annual, sick, parental, unpaid, rtt, etc.",
    )
    status: str | None = Field(
        default=None,
        pattern=r"^(draft|pending|approved|rejected|cancelled)$",
    )
    date_from: date | None = Field(default=None)
    date_to: date | None = Field(default=None)


class FilterLeavesOutput(BaseModel):
    url_state: dict[str, str]
    human_summary: str


SPEC = register(
    ToolSpec(
        name="filter_leaves",
        feature="leaves",
        description=(
            "List leave requests by employee, type, status, or date range."
        ),
        input_schema=FilterLeavesInput,
        output_schema=FilterLeavesOutput,
        handler=None,
        tags=("palette", "read-only"),
    )
)
