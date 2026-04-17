"""Topbar search route (Phase Z.6).

GET /api/v1/search?q=...&types=employees,clients,projects

Tenant-scoped. Returns at most 5 hits per entity kind. Empty query
returns all-empty groups (clients render an honest empty state, not a
loading spinner).
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.search import service
from app.features.search.schemas import SearchGroupedResponse, SearchHit

router = APIRouter()

_ALLOWED_KINDS = {"employees", "clients", "projects"}


@router.get("", response_model=SearchGroupedResponse)
async def topbar_search(
    session: Annotated[AsyncSession, Depends(get_session)],
    tenant_id: Annotated[int, Depends(get_tenant_id)],
    q: str = Query(default="", max_length=120),
    types: str = Query(default="employees,clients,projects"),
) -> SearchGroupedResponse:
    requested = {t.strip() for t in types.split(",") if t.strip()}
    kinds = requested & _ALLOWED_KINDS
    if not kinds:
        kinds = set(_ALLOWED_KINDS)

    grouped = await service.search_entities(
        session, tenant_id=tenant_id, query=q, types=kinds
    )

    employees = [
        SearchHit(kind="employees", id=eid, title=title, subtitle=sub)
        for (eid, title, sub) in grouped["employees"]
    ]
    clients = [
        SearchHit(kind="clients", id=cid, title=title, subtitle=sub)
        for (cid, title, sub) in grouped["clients"]
    ]
    projects = [
        SearchHit(kind="projects", id=pid, title=title, subtitle=sub)
        for (pid, title, sub) in grouped["projects"]
    ]

    return SearchGroupedResponse(
        employees=employees,
        clients=clients,
        projects=projects,
        total=len(employees) + len(clients) + len(projects),
    )
