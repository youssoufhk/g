from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.timesheets.models import TimesheetWeek


async def list_weeks(
    session: AsyncSession,
    *,
    tenant_id: int,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[TimesheetWeek], int]:
    result = await session.execute(
        select(TimesheetWeek)
        .where(TimesheetWeek.tenant_id == tenant_id)
        .order_by(
            TimesheetWeek.iso_year.desc(),
            TimesheetWeek.iso_week.desc(),
            TimesheetWeek.id.desc(),
        )
        .limit(limit)
        .offset(offset)
    )
    items = list(result.scalars().all())

    count_result = await session.execute(
        select(func.count(TimesheetWeek.id)).where(TimesheetWeek.tenant_id == tenant_id)
    )
    total = int(count_result.scalar_one() or 0)
    return items, total
