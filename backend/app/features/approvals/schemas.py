from datetime import datetime

from pydantic import BaseModel


class ApprovalOut(BaseModel):
    id: str
    type: str
    requester_id: int
    requester_name: str | None = None
    subject: str
    submitted_at: datetime
    period: str | None = None
    amount_cents: int | None = None
    currency: str | None = None


class ApprovalsListResponse(BaseModel):
    items: list[ApprovalOut]
    total: int
