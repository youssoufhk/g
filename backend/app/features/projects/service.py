from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.clients import service as clients_service
from app.features.projects.models import Project


async def list_projects(
    session: AsyncSession,
    *,
    tenant_id: int,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[Project], int]:
    result = await session.execute(
        select(Project)
        .where(Project.tenant_id == tenant_id)
        .order_by(Project.id)
        .limit(limit)
        .offset(offset)
    )
    items = list(result.scalars().all())

    count_result = await session.execute(
        select(func.count(Project.id)).where(Project.tenant_id == tenant_id)
    )
    total = int(count_result.scalar_one() or 0)
    return items, total


async def get_names_by_ids(
    session: AsyncSession, *, tenant_id: int, ids: list[int]
) -> dict[int, str]:
    """Return {id: name} for the given project ids, filtered to this tenant."""
    if not ids:
        return {}
    rows = await session.execute(
        select(Project.id, Project.name)
        .where(Project.tenant_id == tenant_id)
        .where(Project.id.in_(ids))
    )
    return {rid: name for rid, name in rows.all()}


async def count_projects(session: AsyncSession, *, tenant_id: int) -> int:
    result = await session.execute(
        select(func.count(Project.id)).where(Project.tenant_id == tenant_id)
    )
    return int(result.scalar_one() or 0)


async def count_active_projects(session: AsyncSession, *, tenant_id: int) -> int:
    result = await session.execute(
        select(func.count(Project.id))
        .where(Project.tenant_id == tenant_id)
        .where(Project.status == "active")
    )
    return int(result.scalar_one() or 0)


async def search_projects(
    session: AsyncSession,
    *,
    tenant_id: int,
    query: str,
    limit: int = 5,
) -> list[tuple[int, str, str | None]]:
    """Return (id, name, status) tuples matching query for topbar search."""
    pattern = f"%{query}%"
    rows = (
        await session.execute(
            select(Project)
            .where(Project.tenant_id == tenant_id)
            .where(Project.name.ilike(pattern))
            .order_by(Project.name)
            .limit(limit)
        )
    ).scalars().all()
    return [(p.id, p.name, p.status) for p in rows]


async def bulk_create_projects(
    session: AsyncSession,
    *,
    tenant_id: int,
    rows: list[dict[str, str]],
) -> int:
    """Insert projects. Resolves client_id via the client row id in the
    CSV (which is the position in clients.csv 1-indexed). The CSV
    client_id is a stable local identifier from the demo seed, not a
    database primary key; we map it by looking up client by name match
    if the CSV client_id does not resolve directly.
    """
    if not rows:
        return 0

    valid_ids = await clients_service.get_valid_client_ids(session, tenant_id=tenant_id)

    inserted = 0
    for row in rows:
        client_id = _parse_int(row.get("client_id"))
        if client_id not in valid_ids:
            continue
        project = Project(
            tenant_id=tenant_id,
            client_id=client_id,
            name=row.get("name", "").strip(),
            status=(row.get("status") or "active"),
            budget_minor_units=_parse_int(row.get("budget_minor_units")),
            currency=(row.get("currency") or "EUR").upper()[:3],
            start_date=_parse_date(row.get("start_date")),
            end_date=_parse_date(row.get("end_date")),
            owner_employee_id=_parse_int(row.get("owner_employee_id")),
        )
        session.add(project)
        inserted += 1
    await session.flush()
    return inserted


def _parse_date(value: str | None) -> object:
    if value is None or value == "":
        return None
    from datetime import date as date_cls

    try:
        return date_cls.fromisoformat(value)
    except ValueError:
        return None


def _parse_int(value: str | None) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
