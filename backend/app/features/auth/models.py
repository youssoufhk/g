"""Auth ORM models.

The physical tables are created by the migration at
``backend/migrations/versions/20260416_0900_auth_tables.py``. This file
declares the SQLAlchemy mapping so the service layer can query them.
"""

from datetime import datetime
from typing import ClassVar

from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AppUser(Base):
    __tablename__ = "app_users"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    password_hash: Mapped[str] = mapped_column(String)
    display_name: Mapped[str] = mapped_column(String)
    locale: Mapped[str] = mapped_column(String)
    oidc_subject: Mapped[str | None] = mapped_column(String, nullable=True)
    oidc_provider: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime]
    last_login_at: Mapped[datetime | None] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(String)

    memberships: Mapped[list["TenantMembership"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class TenantMembership(Base):
    __tablename__ = "tenant_memberships"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.app_users.id", ondelete="CASCADE")
    )
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.tenants.id", ondelete="CASCADE")
    )
    role: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime]

    user: Mapped["AppUser"] = relationship(back_populates="memberships")


class AppUserSession(Base):
    __tablename__ = "app_user_sessions"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "public"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("public.app_users.id", ondelete="CASCADE")
    )
    refresh_token_hash: Mapped[str] = mapped_column(String, unique=True)
    user_agent: Mapped[str | None] = mapped_column(String, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String, nullable=True)
    issued_at: Mapped[datetime]
    expires_at: Mapped[datetime]
    revoked_at: Mapped[datetime | None] = mapped_column(nullable=True)
