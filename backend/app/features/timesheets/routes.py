from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.timesheets import service
from app.features.timesheets.models import TimesheetWeek
from app.features.timesheets.schemas import TimesheetWeekOut, TimesheetWeeksListResponse

router = APIRouter()


@router.get("/weeks", response_model=TimesheetWeeksListResponse)
async def list_timesheet_weeks(
    session: Annotated[AsyncSession, Depends(get_session)],
    tenant_id: Annotated[int, Depends(get_tenant_id)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> TimesheetWeeksListResponse:
    items, total = await service.list_weeks(
        session, tenant_id=tenant_id, limit=limit, offset=offset
    )
    return TimesheetWeeksListResponse(
        items=[_to_out(w) for w in items],
        total=total,
    )


def _to_out(w: TimesheetWeek) -> TimesheetWeekOut:
    return TimesheetWeekOut(
        id=w.id,
        employee_id=w.employee_id,
        iso_year=w.iso_year,
        iso_week=w.iso_week,
        status=w.status,
        submitted_at=w.submitted_at,
        approved_at=w.approved_at,
        created_at=w.created_at,
    )
