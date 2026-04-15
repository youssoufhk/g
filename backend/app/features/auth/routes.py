from typing import Annotated

from fastapi import APIRouter, Depends, Header, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.errors import Unauthorized
from app.features.admin.models import Tenant
from app.features.auth import service
from app.features.auth.models import AppUser
from app.features.auth.schemas import (
    LoginRequest,
    MembershipOut,
    MeResponse,
    RegisterRequest,
    TokenPair,
    UserOut,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenPair,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    body: RegisterRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TokenPair:
    user = await service.register_user(
        session,
        email=body.email,
        password=body.password,
        display_name=body.display_name,
        tenant_schema=body.tenant_schema,
        locale=body.locale,
    )
    await session.commit()
    tokens = service.issue_tokens_for_user(
        user=user, tenant_schema=body.tenant_schema
    )
    return TokenPair(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        expires_in_seconds=tokens.expires_in_seconds,
    )


@router.post("/login", response_model=TokenPair)
async def login(
    body: LoginRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TokenPair:
    user = await service.authenticate_user(
        session, email=body.email, password=body.password
    )
    tenant_schema = await service.resolve_tenant_for_user(
        session, user=user, requested_schema=body.tenant_schema
    )
    await session.commit()
    tokens = service.issue_tokens_for_user(user=user, tenant_schema=tenant_schema)
    return TokenPair(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        expires_in_seconds=tokens.expires_in_seconds,
    )


@router.get("/me", response_model=MeResponse)
async def me(
    session: Annotated[AsyncSession, Depends(get_session)],
    authorization: str | None = Header(default=None),
) -> MeResponse:
    if authorization is None or not authorization.lower().startswith("bearer "):
        raise Unauthorized("missing bearer token")
    token = authorization[7:].strip()
    claims = service.claims_from_access_token(token)

    result = await session.execute(
        select(AppUser)
        .where(AppUser.id == claims.id)
        .options(selectinload(AppUser.memberships))
    )
    user = result.scalar_one_or_none()
    if user is None or user.status != "active":
        raise Unauthorized("user not found")

    tenant_ids = [m.tenant_id for m in user.memberships]
    tenant_rows = await session.execute(
        select(Tenant).where(Tenant.id.in_(tenant_ids))
    )
    tenants_by_id = {t.id: t for t in tenant_rows.scalars().all()}

    memberships = [
        MembershipOut(
            tenant_id=m.tenant_id,
            tenant_schema=tenants_by_id[m.tenant_id].schema_name,
            tenant_display_name=tenants_by_id[m.tenant_id].display_name,
            role=m.role,
        )
        for m in user.memberships
        if m.tenant_id in tenants_by_id
    ]

    return MeResponse(
        user=UserOut(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            locale=user.locale,
            status=user.status,
            created_at=user.created_at,
            last_login_at=user.last_login_at,
        ),
        memberships=memberships,
        active_tenant_schema=claims.tenant_schema,
    )
