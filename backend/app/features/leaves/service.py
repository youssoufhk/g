from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.leaves.models import LeaveRequest


async def list_leave_requests(
    session: AsyncSession,
    *,
    tenant_id: int,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[LeaveRequest], int]:
    result = await session.execute(
        select(LeaveRequest)
        .where(LeaveRequest.tenant_id == tenant_id)
        .order_by(LeaveRequest.start_date.desc(), LeaveRequest.id.desc())
        .limit(limit)
        .offset(offset)
    )
    items = list(result.scalars().all())

    count_result = await session.execute(
        select(func.count(LeaveRequest.id)).where(LeaveRequest.tenant_id == tenant_id)
    )
    total = int(count_result.scalar_one() or 0)
    return items, total
