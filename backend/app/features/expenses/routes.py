from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.expenses import service
from app.features.expenses.models import Expense
from app.features.expenses.schemas import ExpenseOut, ExpensesListResponse

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
    return ExpensesListResponse(
        items=[_to_out(e) for e in items],
        total=total,
    )


def _to_out(e: Expense) -> ExpenseOut:
    return ExpenseOut(
        id=e.id,
        employee_id=e.employee_id,
        category_id=e.category_id,
        project_id=e.project_id,
        client_id=e.client_id,
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
