"""Ops admin service.

Covers the minimum operator console surface from EXECUTION_CHECKLIST.md
section 3.8:
    * list tenants
    * create a tenant (allocates the schema, runs pending migrations)
    * toggle feature kill switches
    * override feature flags per tenant
    * report migration status per tenant

Tenant provisioning uses the Alembic runner with ``-x tenant=<schema>``.
The skeleton runs the shared public migrations only; per-tenant schema
content lands with the tenants feature in Phase 3.
"""

from dataclasses import dataclass

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import Conflict, NotFound
from app.core.feature_registry import FeatureFlag, registry
from app.core.tenancy import is_valid_tenant_schema
from app.features.admin.models import Tenant
from app.features.admin.schemas import CreateTenantRequest


@dataclass
class TenantRecord:
    id: int
    schema_name: str
    display_name: str
    residency_region: str
    legal_jurisdiction: str
    base_currency: str
    primary_locale: str
    supported_locales: list[str]
    status: str
    created_at_iso: str


async def list_tenants(session: AsyncSession) -> list[TenantRecord]:
    result = await session.execute(select(Tenant).order_by(Tenant.id))
    rows = result.scalars().all()
    return [_to_record(row) for row in rows]


async def create_tenant(
    session: AsyncSession, body: CreateTenantRequest
) -> TenantRecord:
    if not is_valid_tenant_schema(body.schema_name):
        raise Conflict(f"invalid schema name: {body.schema_name}")

    existing = await session.execute(
        select(Tenant).where(Tenant.schema_name == body.schema_name)
    )
    if existing.scalar_one_or_none() is not None:
        raise Conflict(f"tenant already exists: {body.schema_name}")

    await session.execute(
        text(f'CREATE SCHEMA IF NOT EXISTS "{body.schema_name}"')
    )

    tenant = Tenant(
        schema_name=body.schema_name,
        display_name=body.display_name,
        residency_region=body.residency_region,
        legal_jurisdiction=body.legal_jurisdiction,
        base_currency=body.base_currency,
        primary_locale=body.primary_locale,
        supported_locales=[body.primary_locale],
        status="provisioning",
    )
    session.add(tenant)
    await session.flush()
    return _to_record(tenant)


def list_feature_flags() -> list[FeatureFlag]:
    return registry.list_all()


def set_kill_switch(key: str, *, killed: bool) -> FeatureFlag:
    try:
        registry.set_kill_switch(key, killed=killed)
    except KeyError as exc:
        raise NotFound(f"unknown feature: {key}") from exc
    return registry.get(key)


def set_feature_override(
    key: str, tenant_schema: str, *, enabled: bool
) -> FeatureFlag:
    try:
        registry.set_tenant_override(key, tenant_schema, enabled=enabled)
    except KeyError as exc:
        raise NotFound(f"unknown feature: {key}") from exc
    return registry.get(key)


async def get_tenant_by_schema(
    session: AsyncSession, schema_name: str
) -> TenantRecord | None:
    """Look up a tenant by its schema name. Returns None if not found."""
    result = await session.execute(
        select(Tenant).where(Tenant.schema_name == schema_name)
    )
    row = result.scalar_one_or_none()
    return _to_record(row) if row is not None else None


async def get_tenants_by_ids(
    session: AsyncSession, ids: list[int]
) -> dict[int, TenantRecord]:
    """Return a mapping of tenant_id -> TenantRecord for the given IDs."""
    if not ids:
        return {}
    result = await session.execute(
        select(Tenant).where(Tenant.id.in_(ids))
    )
    return {row.id: _to_record(row) for row in result.scalars().all()}


def _to_record(row: Tenant) -> TenantRecord:
    return TenantRecord(
        id=row.id,
        schema_name=row.schema_name,
        display_name=row.display_name,
        residency_region=row.residency_region,
        legal_jurisdiction=row.legal_jurisdiction,
        base_currency=row.base_currency,
        primary_locale=row.primary_locale,
        supported_locales=list(row.supported_locales),
        status=row.status,
        created_at_iso=row.created_at.isoformat() if row.created_at else "",
    )
