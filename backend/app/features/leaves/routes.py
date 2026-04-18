from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.employees import service as employees_service
from app.features.leaves import service
from app.features.leaves.models import LeaveRequest
from app.features.leaves.schemas import LeaveRequestOut, LeaveRequestsListResponse

router = APIRouter()


@router.get("", response_model=LeaveRequestsListResponse)
async def list_leave_requests(
    session: Annotated[AsyncSession, Depends(get_session)],
    tenant_id: Annotated[int, Depends(get_tenant_id)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> LeaveRequestsListResponse:
    items, total = await service.list_leave_requests(
        session, tenant_id=tenant_id, limit=limit, offset=offset
    )
    emp_names = await employees_service.get_names_by_ids(
        session, tenant_id=tenant_id, ids=[lr.employee_id for lr in items]
    )
    return LeaveRequestsListResponse(
        items=[_to_out(lr, emp_names.get(lr.employee_id)) for lr in items],
        total=total,
    )


def _to_out(lr: LeaveRequest, employee_name: str | None) -> LeaveRequestOut:
    return LeaveRequestOut(
        id=lr.id,
        employee_id=lr.employee_id,
        employee_name=employee_name,
        leave_type_id=lr.leave_type_id,
        start_date=lr.start_date,
        end_date=lr.end_date,
        days=float(lr.days),
        status=lr.status,
        reason=lr.reason,
        approved_at=lr.approved_at,
        rejection_reason=lr.rejection_reason,
        created_at=lr.created_at,
    )
