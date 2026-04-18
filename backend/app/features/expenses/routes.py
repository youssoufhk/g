from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.clients import service as clients_service
from app.features.employees import service as employees_service
from app.features.expenses import service
from app.features.expenses.models import Expense
from app.features.expenses.schemas import ExpenseOut, ExpensesListResponse
from app.features.projects import service as projects_service

router = APIRouter()


@router.get("", response_model=ExpensesListResponse)
async def list_expenses(
    session: Annotated[AsyncSession, Depends(get_session)],
    tenant_id: Annotated[int, Depends(get_tenant_id)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> ExpensesListResponse:
    items, total = await service.list_expenses(
        session, tenant_id=tenant_id, limit=limit, offset=offset
    )
    emp_names = await employees_service.get_names_by_ids(
        session, tenant_id=tenant_id, ids=[e.employee_id for e in items]
    )
    proj_ids = [e.project_id for e in items if e.project_id is not None]
    proj_names = await projects_service.get_names_by_ids(
        session, tenant_id=tenant_id, ids=proj_ids
    )
    cli_ids = [e.client_id for e in items if e.client_id is not None]
    cli_names = await clients_service.get_names_by_ids(
        session, tenant_id=tenant_id, ids=cli_ids
    )
    return ExpensesListResponse(
        items=[
            _to_out(
                e,
                employee_name=emp_names.get(e.employee_id),
                project_name=proj_names.get(e.project_id) if e.project_id else None,
                client_name=cli_names.get(e.client_id) if e.client_id else None,
            )
            for e in items
        ],
        total=total,
    )


def _to_out(
    e: Expense,
    *,
    employee_name: str | None,
    project_name: str | None,
    client_name: str | None,
) -> ExpenseOut:
    return ExpenseOut(
        id=e.id,
        employee_id=e.employee_id,
        employee_name=employee_name,
        category_id=e.category_id,
        project_id=e.project_id,
        project_name=project_name,
        client_id=e.client_id,
        client_name=client_name,
        expense_date=e.expense_date,
        merchant=e.merchant,
        amount_cents=e.amount_cents,
        currency=e.currency,
        tax_amount_cents=e.tax_amount_cents,
        status=e.status,
        reimbursement_status=e.reimbursement_status,
        approved_at=e.approved_at,
        reimbursed_at=e.reimbursed_at,
        created_at=e.created_at,
    )
