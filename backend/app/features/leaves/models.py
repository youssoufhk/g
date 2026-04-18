"""Leave ORM models.

Mirrors migration 20260418_1000 so the read surface can populate the
frontend `features/leaves` hooks. Write paths (submit/approve) land
with the leave approval agent.
"""

from datetime import date, datetime
from typing import ClassVar

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, LargeBinary, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class LeaveType(Base):
    __tablename__ = "leave_types"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.tenants.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    code: Mapped[str] = mapped_column(Text, nullable=False)
    accrual_rate: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0)
    max_balance: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    paid: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    color: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_medical: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.tenants.id", ondelete="CASCADE"), nullable=False
    )
    employee_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.employees.id", ondelete="CASCADE"), nullable=False
    )
    leave_type_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.leave_types.id", ondelete="RESTRICT"), nullable=False
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    days: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="draft")
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    reason_encrypted: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    approved_by: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("public.employees.id", ondelete="SET NULL"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
