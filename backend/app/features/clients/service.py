from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.clients.models import Client


async def list_clients(
    session: AsyncSession,
    *,
    tenant_id: int,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[Client], int]:
    result = await session.execute(
        select(Client)
        .where(Client.tenant_id == tenant_id)
        .order_by(Client.id)
        .limit(limit)
        .offset(offset)
    )
    items = list(result.scalars().all())

    count_result = await session.execute(
        select(func.count(Client.id)).where(Client.tenant_id == tenant_id)
    )
    total = int(count_result.scalar_one() or 0)
    return items, total


async def count_clients(session: AsyncSession, *, tenant_id: int) -> int:
    result = await session.execute(
        select(func.count(Client.id)).where(Client.tenant_id == tenant_id)
    )
    return int(result.scalar_one() or 0)


async def bulk_create_clients(
    session: AsyncSession,
    *,
    tenant_id: int,
    rows: list[dict[str, str]],
) -> int:
    if not rows:
        return 0
    inserted = 0
    for row in rows:
        client = Client(
            tenant_id=tenant_id,
            name=row.get("name", "").strip(),
            country_code=(row.get("country_code") or "FR").upper()[:2],
            currency=(row.get("currency") or "EUR").upper()[:3],
            primary_contact_name=row.get("primary_contact_name") or None,
            primary_contact_email=row.get("primary_contact_email") or None,
            size_band=(row.get("size_band") or "mid"),
            status="active",
        )
        session.add(client)
        inserted += 1
    await session.flush()
    return inserted
