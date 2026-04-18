from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.invoices.models import Invoice


async def list_invoices(
    session: AsyncSession,
    *,
    tenant_id: int,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[Invoice], int]:
    result = await session.execute(
        select(Invoice)
        .where(Invoice.tenant_id == tenant_id, Invoice.deleted_at.is_(None))
        .order_by(Invoice.issue_date.desc(), Invoice.id.desc())
        .limit(limit)
        .offset(offset)
    )
    items = list(result.scalars().all())

    count_result = await session.execute(
        select(func.count(Invoice.id)).where(
            Invoice.tenant_id == tenant_id, Invoice.deleted_at.is_(None)
        )
    )
    total = int(count_result.scalar_one() or 0)
    return items, total
