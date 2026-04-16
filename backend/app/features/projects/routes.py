from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.projects import service
from app.features.projects.schemas import ProjectOut, ProjectsListResponse

router = APIRouter()


@router.get("", response_model=ProjectsListResponse)
async def list_projects(
    session: Annotated[AsyncSession, Depends(get_session)],
    tenant_id: Annotated[int, Depends(get_tenant_id)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> ProjectsListResponse:
    items, total = await service.list_projects(
        session, tenant_id=tenant_id, limit=limit, offset=offset
    )
    return ProjectsListResponse(
        items=[_to_out(p) for p in items],
        total=total,
    )


def _to_out(p) -> ProjectOut:  # type: ignore[no-untyped-def]
    return ProjectOut(
        id=p.id,
        name=p.name,
        client_id=p.client_id,
        status=p.status,
        budget_minor_units=p.budget_minor_units,
        currency=p.currency,
        start_date=p.start_date,
        end_date=p.end_date,
        owner_employee_id=p.owner_employee_id,
        created_at=p.created_at,
    )
