from datetime import datetime

from pydantic import BaseModel


class TimesheetWeekOut(BaseModel):
    id: int
    employee_id: int
    iso_year: int
    iso_week: int
    status: str
    submitted_at: datetime | None
    approved_at: datetime | None
    created_at: datetime


class TimesheetWeeksListResponse(BaseModel):
    items: list[TimesheetWeekOut]
    total: int
