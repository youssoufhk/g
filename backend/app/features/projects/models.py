"""Project ORM model (Phase 4)."""

from datetime import date, datetime
from typing import ClassVar

from sqlalchemy import BigInteger, Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.tenants.id", ondelete="CASCADE")
    )
    client_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.clients.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    budget_minor_units: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    currency: Mapped[str] = mapped_column(String)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    owner_employee_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("public.employees.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime]
