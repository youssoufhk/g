from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.features.clients import service as clients_service
from app.features.employees import service as employees_service
from app.features.projects import service as projects_service


@dataclass
class DashboardKpis:
    employees_total: int
    clients_total: int
    projects_total: int
    projects_active: int


async def load_kpis(
    session: AsyncSession, *, tenant_id: int
) -> DashboardKpis:
    return DashboardKpis(
        employees_total=await employees_service.count_employees(
            session, tenant_id=tenant_id
        ),
        clients_total=await clients_service.count_clients(
            session, tenant_id=tenant_id
        ),
        projects_total=await projects_service.count_projects(
            session, tenant_id=tenant_id
        ),
        projects_active=await projects_service.count_active_projects(
            session, tenant_id=tenant_id
        ),
    )
