"""Approval AI tools: pending-items filter + cross-feature overdue scan.

``filter_approvals`` returns the current user's pending approvals
(timesheets, expenses, leaves, invoices awaiting sign-off).

``find_overdue_items`` is the one cross-feature tool: it walks every
feature's "waiting on someone" bucket and flags items past their SLA
threshold. Implementation fans out to each feature's ``service.py``
via the event bus rather than importing models (M3).
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.ai.registry import ToolSpec, register


class FilterApprovalsInput(BaseModel):
    entity_type: str | None = Field(
        default=None,
        pattern=r"^(timesheet|expense|leave|invoice)$",
        description="restrict to one kind of approval; null = all kinds",
    )
    urgent_only: bool = Field(
        default=False,
        description="shortcut for items past SLA or blocking payroll",
    )


class PendingApproval(BaseModel):
    id: int
    entity_type: str
    subject_label: str
    requested_by: str
    requested_at: str
    age_hours: int
    sla_breached: bool


class FilterApprovalsOutput(BaseModel):
    items: list[PendingApproval]
    human_summary: str


class FindOverdueInput(BaseModel):
    scope: str = Field(
        default="me",
        pattern=r"^(me|team|tenant)$",
        description="me = own pending; team = my direct reports; tenant = admin-scope",
    )
    include_kinds: list[str] = Field(
        default_factory=lambda: [
            "timesheet",
            "invoice",
            "approval",
            "leave",
        ],
        description="which overdue buckets to scan",
    )


class OverdueItem(BaseModel):
    kind: str
    id: int
    label: str
    overdue_by_hours: int
    owner_label: str


class FindOverdueOutput(BaseModel):
    items: list[OverdueItem]
    human_summary: str


FILTER_SPEC = register(
    ToolSpec(
        name="filter_approvals",
        feature="approvals",
        description=(
            "List approvals waiting on the current user, optionally narrowed "
            "to a single entity kind or urgent items only."
        ),
        input_schema=FilterApprovalsInput,
        output_schema=FilterApprovalsOutput,
        handler=None,
        tags=("palette", "read-only"),
    )
)


OVERDUE_SPEC = register(
    ToolSpec(
        name="find_overdue_items",
        feature="approvals",
        description=(
            "Return overdue timesheets, invoices, leaves and approvals for "
            "the user, their direct reports, or the whole tenant."
        ),
        input_schema=FindOverdueInput,
        output_schema=FindOverdueOutput,
        handler=None,
        tags=("palette", "cross-feature", "read-only"),
    )
)
