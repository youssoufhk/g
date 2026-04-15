from fastapi import APIRouter, HTTPException, status

from app.core.feature_registry import registry
from app.features.admin.schemas import (
    FeatureFlagOut,
    SetFeatureOverrideRequest,
    SetKillSwitchRequest,
)

router = APIRouter()


@router.get("/features", response_model=list[FeatureFlagOut])
async def list_features() -> list[FeatureFlagOut]:
    return [
        FeatureFlagOut(
            key=flag.key,
            description=flag.description,
            default_enabled=flag.default_enabled,
            kill_switch=flag.kill_switch,
            tenant_overrides=dict(flag.per_tenant_overrides),
        )
        for flag in registry.list_all()
    ]


@router.post("/features/{key}/kill-switch", response_model=FeatureFlagOut)
async def set_kill_switch(key: str, body: SetKillSwitchRequest) -> FeatureFlagOut:
    try:
        registry.set_kill_switch(key, killed=body.killed)
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"unknown feature: {key}"
        ) from exc
    flag = registry.get(key)
    return FeatureFlagOut(
        key=flag.key,
        description=flag.description,
        default_enabled=flag.default_enabled,
        kill_switch=flag.kill_switch,
        tenant_overrides=dict(flag.per_tenant_overrides),
    )


@router.post("/features/{key}/overrides", response_model=FeatureFlagOut)
async def set_override(
    key: str, body: SetFeatureOverrideRequest
) -> FeatureFlagOut:
    try:
        registry.set_tenant_override(
            key, body.tenant_schema, enabled=body.enabled
        )
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"unknown feature: {key}"
        ) from exc
    flag = registry.get(key)
    return FeatureFlagOut(
        key=flag.key,
        description=flag.description,
        default_enabled=flag.default_enabled,
        kill_switch=flag.kill_switch,
        tenant_overrides=dict(flag.per_tenant_overrides),
    )
