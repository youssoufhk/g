"""Auth service: account creation, login, token issuance.

Business logic only. No FastAPI imports here; routes.py wraps these
functions and maps the dataclass returns to Pydantic schemas.
"""

from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.errors import Conflict, NotFound, Unauthorized
from app.core.security import (
    decode_access_token,
    hash_password,
    issue_access_token,
    verify_password,
)
from app.features.admin.models import Tenant
from app.features.auth.models import AppUser, TenantMembership


@dataclass
class AuthenticatedUser:
    id: int
    email: str
    display_name: str
    locale: str
    tenant_schema: str | None


@dataclass
class IssuedTokens:
    access_token: str
    refresh_token: str
    expires_in_seconds: int


async def register_user(
    session: AsyncSession,
    *,
    email: str,
    password: str,
    display_name: str,
    tenant_schema: str,
    locale: str,
    role: str = "owner",
) -> AppUser:
    existing = await session.execute(select(AppUser).where(AppUser.email == email))
    if existing.scalar_one_or_none() is not None:
        raise Conflict(f"email already registered: {email}")

    tenant_row = await session.execute(
        select(Tenant).where(Tenant.schema_name == tenant_schema)
    )
    tenant = tenant_row.scalar_one_or_none()
    if tenant is None:
        raise NotFound(f"tenant not found: {tenant_schema}")

    user = AppUser(
        email=email,
        password_hash=hash_password(password),
        display_name=display_name,
        locale=locale,
        status="active",
    )
    session.add(user)
    await session.flush()

    membership = TenantMembership(
        user_id=user.id,
        tenant_id=tenant.id,
        role=role,
    )
    session.add(membership)
    await session.flush()
    return user


async def authenticate_user(
    session: AsyncSession,
    *,
    email: str,
    password: str,
) -> AppUser:
    result = await session.execute(
        select(AppUser)
        .where(AppUser.email == email)
        .options(selectinload(AppUser.memberships))
    )
    user = result.scalar_one_or_none()
    if user is None or user.status != "active":
        raise Unauthorized("invalid credentials")
    if not verify_password(password, user.password_hash):
        raise Unauthorized("invalid credentials")
    user.last_login_at = datetime.now(UTC)
    await session.flush()
    return user


async def resolve_tenant_for_user(
    session: AsyncSession,
    *,
    user: AppUser,
    requested_schema: str | None,
) -> str | None:
    """Pick which tenant the issued token will be scoped to.

    If the request names a schema, it must match a membership. Otherwise
    pick the first (lowest id) membership. Users with no memberships get
    a token with ``tenant_schema=None`` and can only access public routes.
    """
    memberships = user.memberships
    if not memberships:
        return None

    tenant_ids = [m.tenant_id for m in memberships]
    tenant_rows = await session.execute(
        select(Tenant).where(Tenant.id.in_(tenant_ids))
    )
    tenants_by_id = {t.id: t for t in tenant_rows.scalars().all()}

    if requested_schema is not None:
        for membership in memberships:
            tenant = tenants_by_id.get(membership.tenant_id)
            if tenant is not None and tenant.schema_name == requested_schema:
                return tenant.schema_name
        raise Unauthorized(f"user is not a member of tenant {requested_schema}")

    first_membership = min(memberships, key=lambda m: m.tenant_id)
    tenant = tenants_by_id.get(first_membership.tenant_id)
    return tenant.schema_name if tenant is not None else None


def issue_tokens_for_user(
    *,
    user: AppUser,
    tenant_schema: str | None,
) -> IssuedTokens:
    access = issue_access_token(
        subject=str(user.id),
        audience="app",
        tenant_schema=tenant_schema,
        extra={"email": user.email, "display_name": user.display_name},
    )
    # Phase 3a: refresh is just a longer-lived access token. A real refresh
    # table (public.app_user_sessions) with rotation ships in Phase 3b
    # alongside MFA + session invalidation.
    refresh = issue_access_token(
        subject=str(user.id),
        audience="app",
        tenant_schema=tenant_schema,
        extra={"typ": "refresh"},
    )
    return IssuedTokens(
        access_token=access,
        refresh_token=refresh,
        expires_in_seconds=settings.jwt_access_ttl_seconds,
    )


def claims_from_access_token(token: str) -> AuthenticatedUser:
    claims = decode_access_token(token, audience="app")
    return AuthenticatedUser(
        id=int(claims["sub"]),
        email=claims.get("email", ""),
        display_name=claims.get("display_name", ""),
        locale=claims.get("locale", "en-GB"),
        tenant_schema=claims.get("tenant_schema"),
    )
