from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.errors import Conflict, NotFound
from app.core.feature_registry import registry
from app.features.admin import service
from app.features.admin.schemas import (
    CreateTenantRequest,
    FeatureFlagOut,
    SetFeatureOverrideRequest,
    SetKillSwitchRequest,
    TenantOut,
)

router = APIRouter()


# ----- tenants ---------------------------------------------------------------


@router.get("/tenants", response_model=list[TenantOut])
async def list_tenants(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[TenantOut]:
    records = await service.list_tenants(session)
    return [_tenant_record_to_out(r) for r in records]


@router.post(
    "/tenants",
    response_model=TenantOut,
    status_code=status.HTTP_201_CREATED,
)
# z2-lint: ok -- TODO Phase 7 operator-console rebuild apply
# @audited(action="ops.tenant.create") + @gated_feature("ops.tenants").
async def create_tenant(
    body: CreateTenantRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TenantOut:
    try:
        record = await service.create_tenant(session, body)
    except Conflict as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=exc.message
        ) from exc
    await session.commit()
    return _tenant_record_to_out(record)


# ----- feature flags ---------------------------------------------------------


@router.get("/features", response_model=list[FeatureFlagOut])
async def list_features() -> list[FeatureFlagOut]:
    return [_flag_to_out(flag) for flag in registry.list_all()]


@router.post("/features/{key}/kill-switch", response_model=FeatureFlagOut)
# z2-lint: ok -- TODO Phase 7 operator-console rebuild apply
# @audited(action="ops.flag.kill") + @gated_feature("ops.flags").
async def set_kill_switch(key: str, body: SetKillSwitchRequest) -> FeatureFlagOut:
    try:
        service.set_kill_switch(key, killed=body.killed)
    except NotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        ) from exc
    return _flag_to_out(registry.get(key))


@router.post("/features/{key}/overrides", response_model=FeatureFlagOut)
# z2-lint: ok -- TODO Phase 7 operator-console rebuild apply
# @audited(action="ops.flag.override") + @gated_feature("ops.flags").
async def set_override(
    key: str, body: SetFeatureOverrideRequest
) -> FeatureFlagOut:
    try:
        service.set_feature_override(
            key, body.tenant_schema, enabled=body.enabled
        )
    except NotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        ) from exc
    return _flag_to_out(registry.get(key))


# ----- helpers ---------------------------------------------------------------


def _tenant_record_to_out(record: service.TenantRecord) -> TenantOut:
    from datetime import datetime

    created_at = (
        datetime.fromisoformat(record.created_at_iso)
        if record.created_at_iso
        else datetime.now()
    )
    return TenantOut(
        id=record.id,
        schema_name=record.schema_name,
        display_name=record.display_name,
        residency_region=record.residency_region,
        legal_jurisdiction=record.legal_jurisdiction,
        base_currency=record.base_currency,
        primary_locale=record.primary_locale,
        supported_locales=list(record.supported_locales),
        status=record.status,
        created_at=created_at,
    )


def _flag_to_out(flag) -> FeatureFlagOut:  # type: ignore[no-untyped-def]
    return FeatureFlagOut(
        key=flag.key,
        description=flag.description,
        default_enabled=flag.default_enabled,
        kill_switch=flag.kill_switch,
        tenant_overrides=dict(flag.per_tenant_overrides),
    )
