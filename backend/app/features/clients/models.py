"""Client ORM model (Phase 4)."""

from datetime import datetime
from typing import ClassVar

from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Client(Base):
    __tablename__ = "clients"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.tenants.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String)
    country_code: Mapped[str] = mapped_column(String)
    currency: Mapped[str] = mapped_column(String)
    primary_contact_name: Mapped[str | None] = mapped_column(String, nullable=True)
    primary_contact_email: Mapped[str | None] = mapped_column(String, nullable=True)
    size_band: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime]
