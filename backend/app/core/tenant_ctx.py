"""Helpers to resolve the current tenant_id (int) from the tenancy ContextVar.

``app.core.tenancy`` stores the tenant ``schema_name`` (``t_<slug>``) in a
``ContextVar``. Feature service layers and route dependencies need the
numeric ``tenant_id`` to filter queries. This module provides the lookup.

The lookup is cheap on a warm session because SQLAlchemy returns the
tenants row from the session's identity map on repeat queries in the
same transaction.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.errors import Unauthorized
from app.core.tenancy import get_current_tenant
from app.features.admin.models import Tenant


async def resolve_tenant_id(session: AsyncSession) -> int:
    """Look up the numeric tenant id for the schema in the ContextVar.

    Raises Unauthorized if the request has no tenant context or the
    schema name does not match a row in public.tenants.
    """
    schema = get_current_tenant()
    if schema is None:
        raise Unauthorized("missing tenant context")
    result = await session.execute(
        select(Tenant.id).where(Tenant.schema_name == schema)
    )
    tenant_id = result.scalar_one_or_none()
    if tenant_id is None:
        raise Unauthorized(f"unknown tenant: {schema}")
    return tenant_id


async def get_tenant_id(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> int:
    """FastAPI dependency that returns the current tenant_id."""
    return await resolve_tenant_id(session)
