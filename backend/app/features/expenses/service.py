from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.expenses.models import Expense


async def list_expenses(
    session: AsyncSession,
    *,
    tenant_id: int,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[Expense], int]:
    result = await session.execute(
        select(Expense)
        .where(Expense.tenant_id == tenant_id)
        .order_by(Expense.expense_date.desc(), Expense.id.desc())
        .limit(limit)
        .offset(offset)
    )
    items = list(result.scalars().all())

    count_result = await session.execute(
        select(func.count(Expense.id)).where(Expense.tenant_id == tenant_id)
    )
    total = int(count_result.scalar_one() or 0)
    return items, total
