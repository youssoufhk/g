"""Topbar search service (non-AI).

Each search is a per-tenant lookup across employees (first + last +
email), clients (name + primary contact), projects (name). ILIKE over
short strings is sub-millisecond on indexes the Phase 4 entities already
carry. pg_trgm for fuzzy matching can be layered on later once the
search volume is high enough to measure; for the 201/120/260 canonical
tenant, ILIKE is already fast and exact enough.

The service returns at most `limit` hits per entity kind so the grouped
dropdown never flashes hundreds of rows.
"""

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.clients.models import Client
from app.features.employees.models import Employee
from app.features.projects.models import Project


async def search_entities(
    session: AsyncSession,
    *,
    tenant_id: int,
    query: str,
    types: set[str],
    limit_per_kind: int = 5,
) -> dict[str, list[tuple[int, str, str | None]]]:
    """Return grouped matches: {"employees": [(id, title, subtitle), ...], ...}.

    Empty `query` returns empty groups. Only the kinds in `types` are
    queried; others are empty lists.
    """
    q = query.strip()
    out: dict[str, list[tuple[int, str, str | None]]] = {
        "employees": [],
        "clients": [],
        "projects": [],
    }
    if not q:
        return out

    pattern = f"%{q}%"

    if "employees" in types:
        rows = (
            await session.execute(
                select(Employee)
                .where(Employee.tenant_id == tenant_id)
                .where(
                    or_(
                        Employee.first_name.ilike(pattern),
                        Employee.last_name.ilike(pattern),
                        Employee.email.ilike(pattern),
                    )
                )
                .order_by(Employee.last_name, Employee.first_name)
                .limit(limit_per_kind)
            )
        ).scalars().all()
        out["employees"] = [
            (
                e.id,
                f"{e.first_name} {e.last_name}",
                e.role if e.role else e.email,
            )
            for e in rows
        ]

    if "clients" in types:
        rows = (
            await session.execute(
                select(Client)
                .where(Client.tenant_id == tenant_id)
                .where(
                    or_(
                        Client.name.ilike(pattern),
                        Client.primary_contact_name.ilike(pattern),
                        Client.primary_contact_email.ilike(pattern),
                    )
                )
                .order_by(Client.name)
                .limit(limit_per_kind)
            )
        ).scalars().all()
        out["clients"] = [
            (c.id, c.name, c.primary_contact_name) for c in rows
        ]

    if "projects" in types:
        rows = (
            await session.execute(
                select(Project)
                .where(Project.tenant_id == tenant_id)
                .where(Project.name.ilike(pattern))
                .order_by(Project.name)
                .limit(limit_per_kind)
            )
        ).scalars().all()
        out["projects"] = [(p.id, p.name, p.status) for p in rows]

    return out
