from pydantic import BaseModel


class DashboardKpisResponse(BaseModel):
    employees_total: int
    clients_total: int
    projects_total: int
    projects_active: int
