"""Approvals hub service.

Approvals has no dedicated table; the hub aggregates pending items
from timesheets, expenses, and leaves. Cross-feature reads go
through each feature's own ``service.py`` (M3 rule: no direct model
imports from another feature).
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.features.expenses import service as expenses_service
from app.features.leaves import service as leaves_service
from app.features.timesheets import service as timesheets_service


@dataclass
class PendingApproval:
    id: str
    type: str
    requester_id: int
    subject: str
    submitted_at: datetime
    period: str | None = None
    amount_cents: int | None = None
    currency: str | None = None


def _week_period_label(iso_year: int, iso_week: int) -> str:
    return f"{iso_year}-W{iso_week:02d}"


def _leave_period_label(start: date, end: date) -> str:
    return f"{start.isoformat()} to {end.isoformat()}"


async def list_pending(
    session: AsyncSession, *, tenant_id: int, limit: int = 200
) -> list[PendingApproval]:
    out: list[PendingApproval] = []

    weeks, _ = await timesheets_service.list_weeks(
        session, tenant_id=tenant_id, limit=limit, offset=0
    )
    for w in weeks:
        if w.status == "submitted":
            out.append(
                PendingApproval(
                    id=f"timesheet:{w.id}",
                    type="timesheet",
                    requester_id=w.employee_id,
                    subject=f"Week {w.iso_week} timesheet",
                    submitted_at=w.submitted_at or w.created_at,
                    period=_week_period_label(w.iso_year, w.iso_week),
                )
            )

    expenses, _ = await expenses_service.list_expenses(
        session, tenant_id=tenant_id, limit=limit, offset=0
    )
    for e in expenses:
        if e.status == "submitted":
            out.append(
                PendingApproval(
                    id=f"expense:{e.id}",
                    type="expense",
                    requester_id=e.employee_id,
                    subject=e.merchant or "Expense",
                    submitted_at=e.created_at,
                    amount_cents=e.amount_cents,
                    currency=e.currency,
                )
            )

    leaves, _ = await leaves_service.list_leave_requests(
        session, tenant_id=tenant_id, limit=limit, offset=0
    )
    for lr in leaves:
        if lr.status == "submitted":
            out.append(
                PendingApproval(
                    id=f"leave:{lr.id}",
                    type="leave",
                    requester_id=lr.employee_id,
                    subject=f"Leave request ({lr.days} days)",
                    submitted_at=lr.created_at,
                    period=_leave_period_label(lr.start_date, lr.end_date),
                )
            )

    out.sort(key=lambda a: a.submitted_at, reverse=True)
    return out
