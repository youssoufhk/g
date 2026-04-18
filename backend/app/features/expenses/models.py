"""Expense ORM models.

Mirrors the shape created in migration 20260418_1200 so feature
code (service.py, routes.py, AI tools) can read the row set.
Scope here is the list read surface that the frontend
`features/expenses` hooks call; write paths land with the expense
approval agent.
"""

from datetime import date, datetime
from typing import ClassVar

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.tenants.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    code: Mapped[str] = mapped_column(Text, nullable=False)
    gl_account: Mapped[str | None] = mapped_column(Text, nullable=True)
    tax_rate: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Expense(Base):
    __tablename__ = "expenses"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.tenants.id", ondelete="CASCADE"), nullable=False
    )
    employee_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.employees.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.expense_categories.id", ondelete="RESTRICT"), nullable=False
    )
    project_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("public.projects.id", ondelete="SET NULL"), nullable=True
    )
    client_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("public.clients.id", ondelete="SET NULL"), nullable=True
    )
    expense_date: Mapped[date] = mapped_column(Date, nullable=False)
    merchant: Mapped[str | None] = mapped_column(Text, nullable=True)
    amount_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    currency: Mapped[str] = mapped_column(Text, nullable=False, default="EUR")
    tax_amount_cents: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    exchange_rate: Mapped[float | None] = mapped_column(Numeric(18, 8), nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="draft")
    approved_by: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("public.employees.id", ondelete="SET NULL"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    reimbursement_status: Mapped[str] = mapped_column(Text, nullable=False, default="pending")
    reimbursed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
