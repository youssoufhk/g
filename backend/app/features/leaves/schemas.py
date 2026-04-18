from datetime import date, datetime

from pydantic import BaseModel


class LeaveRequestOut(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    start_date: date
    end_date: date
    days: float
    status: str
    reason: str | None
    approved_at: datetime | None
    rejection_reason: str | None
    created_at: datetime


class LeaveRequestsListResponse(BaseModel):
    items: list[LeaveRequestOut]
    total: int
