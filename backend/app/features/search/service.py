"""Topbar search service (non-AI).

Each search delegates to the owning feature's service layer so search
never reaches into another feature's models directly (M3). ILIKE over
short strings is sub-millisecond on indexes the Phase 4 entities carry.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.features.clients import service as clients_service
from app.features.employees import service as employees_service
from app.features.projects import service as projects_service


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

    if "employees" in types:
        out["employees"] = await employees_service.search_employees(
            session, tenant_id=tenant_id, query=q, limit=limit_per_kind
        )

    if "clients" in types:
        out["clients"] = await clients_service.search_clients(
            session, tenant_id=tenant_id, query=q, limit=limit_per_kind
        )

    if "projects" in types:
        out["projects"] = await projects_service.search_projects(
            session, tenant_id=tenant_id, query=q, limit=limit_per_kind
        )

    return out
