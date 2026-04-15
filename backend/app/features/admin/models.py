"""Admin / ops models.

The public.tenants table is already created by the first migration. This
module declares the SQLAlchemy ORM mapping so the ops service can query
it through the session.
"""

from datetime import datetime
from typing import ClassVar

from sqlalchemy import BigInteger, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Tenant(Base):
    __tablename__ = "tenants"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    schema_name: Mapped[str] = mapped_column(String, unique=True)
    display_name: Mapped[str] = mapped_column(String)
    residency_region: Mapped[str] = mapped_column(String)
    legal_jurisdiction: Mapped[str] = mapped_column(String)
    base_currency: Mapped[str] = mapped_column(String)
    primary_locale: Mapped[str] = mapped_column(String)
    supported_locales: Mapped[list[str]] = mapped_column(ARRAY(String))
    created_at: Mapped[datetime]
    status: Mapped[str] = mapped_column(String)
