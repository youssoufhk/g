"""Timesheet filter tool for the LLM-as-router command palette.

``filter_timesheets`` takes a natural-language query (translated into
structured arguments by the LLM) and returns a filter spec that the
frontend uses to drive the /timesheets page URL state. The tool does
not page through the DB itself; it produces the same structured
parameters the page would see from a user clicking filters.

This preserves the "AI is a shell element, not a destination page"
principle: the palette sends the user to the already-designed list
view rather than rendering its own AI-native result surface.

See ``specs/AI_FEATURES.md §3.1`` for the catalog and §4 for the
command-palette surface.
"""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from app.ai.registry import ToolSpec, register


class FilterTimesheetsInput(BaseModel):
    employee_id: int | None = Field(
        default=None,
        description="employees.id to filter by; null for 'me' context",
    )
    project_id: int | None = Field(
        default=None,
        description="projects.id to filter by",
    )
    date_from: date | None = Field(
        default=None,
        description="inclusive start of week window (Monday)",
    )
    date_to: date | None = Field(
        default=None,
        description="inclusive end of week window (Sunday)",
    )
    status: str | None = Field(
        default=None,
        pattern=r"^(draft|submitted|approved|rejected)$",
        description="timesheet_weeks.status to filter on",
    )


class FilterTimesheetsOutput(BaseModel):
    url_state: dict[str, str]
    human_summary: str


SPEC = register(
    ToolSpec(
        name="filter_timesheets",
        feature="timesheets",
        description=(
            "List timesheet weeks or entries by employee, project, date range, "
            "or status. Returns URL query params the /timesheets page accepts."
        ),
        input_schema=FilterTimesheetsInput,
        output_schema=FilterTimesheetsOutput,
        handler=None,
        tags=("palette", "read-only"),
    )
)
