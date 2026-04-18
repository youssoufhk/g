from datetime import date, datetime

from pydantic import BaseModel


class InvoiceOut(BaseModel):
    id: int
    client_id: int
    client_name: str | None = None
    number: str
    issue_date: date
    due_date: date
    status: str
    currency: str
    subtotal_cents: int
    tax_total_cents: int
    total_cents: int
    sent_at: datetime | None
    paid_at: datetime | None
    pdf_status: str
    created_at: datetime


class InvoicesListResponse(BaseModel):
    items: list[InvoiceOut]
    total: int
