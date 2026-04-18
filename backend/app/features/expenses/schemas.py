from datetime import date, datetime

from pydantic import BaseModel


class ExpenseOut(BaseModel):
    id: int
    employee_id: int
    employee_name: str | None = None
    category_id: int
    project_id: int | None
    project_name: str | None = None
    client_id: int | None
    client_name: str | None = None
    expense_date: date
    merchant: str | None
    amount_cents: int
    currency: str
    tax_amount_cents: int
    status: str
    reimbursement_status: str
    approved_at: datetime | None
    reimbursed_at: datetime | None
    created_at: datetime


class ExpensesListResponse(BaseModel):
    items: list[ExpenseOut]
    total: int
