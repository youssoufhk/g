from datetime import date, datetime

from pydantic import BaseModel


class EmployeeOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    team: str | None
    hire_date: date | None
    manager_employee_id: int | None
    base_currency: str
    status: str
    created_at: datetime


class EmployeesListResponse(BaseModel):
    items: list[EmployeeOut]
    total: int
