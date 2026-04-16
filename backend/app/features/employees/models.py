"""Employee ORM model (Phase 4)."""

from datetime import date, datetime
from typing import ClassVar

from sqlalchemy import BigInteger, Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.tenants.id", ondelete="CASCADE")
    )
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String)
    team: Mapped[str | None] = mapped_column(String, nullable=True)
    hire_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    manager_employee_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("public.employees.id", ondelete="SET NULL"), nullable=True
    )
    base_currency: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime]
