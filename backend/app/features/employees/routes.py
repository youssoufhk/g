from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.employees import service
from app.features.employees.schemas import EmployeeOut, EmployeesListResponse

router = APIRouter()


@router.get("", response_model=EmployeesListResponse)
async def list_employees(
    session: Annotated[AsyncSession, Depends(get_session)],
    tenant_id: Annotated[int, Depends(get_tenant_id)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> EmployeesListResponse:
    items, total = await service.list_employees(
        session, tenant_id=tenant_id, limit=limit, offset=offset
    )
    return EmployeesListResponse(
        items=[_to_out(e) for e in items],
        total=total,
    )


def _to_out(employee) -> EmployeeOut:  # type: ignore[no-untyped-def]
    return EmployeeOut(
        id=employee.id,
        first_name=employee.first_name,
        last_name=employee.last_name,
        email=employee.email,
        role=employee.role,
        team=employee.team,
        hire_date=employee.hire_date,
        manager_employee_id=employee.manager_employee_id,
        base_currency=employee.base_currency,
        status=employee.status,
        created_at=employee.created_at,
    )
