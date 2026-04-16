from datetime import date, datetime

from pydantic import BaseModel


class ProjectOut(BaseModel):
    id: int
    name: str
    client_id: int
    status: str
    budget_minor_units: int | None
    currency: str
    start_date: date | None
    end_date: date | None
    owner_employee_id: int | None
    created_at: datetime


class ProjectsListResponse(BaseModel):
    items: list[ProjectOut]
    total: int
