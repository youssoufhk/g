from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.dashboard import service
from app.features.dashboard.schemas import DashboardKpisResponse

router = APIRouter()


@router.get("/kpis", response_model=DashboardKpisResponse)
async def get_kpis(
    session: Annotated[AsyncSession, Depends(get_session)],
    tenant_id: Annotated[int, Depends(get_tenant_id)],
) -> DashboardKpisResponse:
    kpis = await service.load_kpis(session, tenant_id=tenant_id)
    return DashboardKpisResponse(
        employees_total=kpis.employees_total,
        clients_total=kpis.clients_total,
        projects_total=kpis.projects_total,
        projects_active=kpis.projects_active,
    )
