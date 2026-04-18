"""Invoice ORM model.

Mirrors the shape created in migration 20260418_1300 so feature
code (service.py, routes.py, AI tools) can read the row set.
Write paths stay out of scope until the invoicing agent (§8.8) is
wired end-to-end; this model exists to unblock the list + detail
read surfaces that the frontend `features/invoices` hooks call.
"""

from datetime import date, datetime
from typing import ClassVar

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.tenants.id", ondelete="CASCADE"), nullable=False
    )
    client_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.clients.id", ondelete="RESTRICT"), nullable=False
    )
    number: Mapped[str] = mapped_column(Text, nullable=False)
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="draft")
    currency: Mapped[str] = mapped_column(Text, nullable=False, default="EUR")
    subtotal_cents: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    tax_total_cents: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    total_cents: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    fx_rate_to_base: Mapped[float | None] = mapped_column(Numeric(18, 8), nullable=True)
    tax_mention: Mapped[str | None] = mapped_column(Text, nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    pdf_status: Mapped[str] = mapped_column(Text, nullable=False, default="pending")
    pdf_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
