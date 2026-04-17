"""@gated_feature decorator (Phase Z.2).

Every mutating route checks three things before running:

1. The feature flag is enabled for the tenant (per-tenant overrides or
   default from `core/feature_registry.py`).
2. The tenant's kill-switch for the parent feature is not flipped
   (kill_switches override everything).
3. The tenant's entitlement set includes the feature (billing-tier
   gates, stubbed to always-true in dev until the billing provider
   wrapper ships in `backend/app/billing/`).

The three reads are coalesced into a single request-scoped cache so a
route with N mutating endpoints pays at most one DB round-trip per
cold request (FLAWLESS_GATE item 11: "max 2 flag queries per cold
request, 0 on warm").

Flag disabled / killed / not-entitled: the decorator raises
`EntitlementLocked` (402) which the frontend renders as a paywall/
degraded-mode surface. Never a 500.
"""

from collections.abc import Awaitable, Callable
from functools import wraps
from typing import Any, TypeVar

from fastapi import Request

from app.core.errors import EntitlementLocked
from app.core.feature_registry import registry

_F = TypeVar("_F", bound=Callable[..., Awaitable[Any]])


def gated_feature(feature_key: str) -> Callable[[_F], _F]:
    """Decorate a mutating FastAPI route so requests fail fast when the
    feature is disabled, killed, or not entitled for the current
    tenant.

    The handler must accept ``request: Request`` as a kwarg (standard
    FastAPI dep). Raises ``EntitlementLocked`` (HTTP 402) on failure.
    """

    def decorator(fn: _F) -> _F:
        @wraps(fn)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            request: Request | None = kwargs.get("request")
            tenant_schema = _tenant_schema_for(request)
            cache = _request_scoped_flag_cache(request)
            cached = cache.get(feature_key)
            if cached is None:
                enabled = registry.is_enabled(feature_key, tenant_schema)
                # Entitlements: stubbed to True in dev until the
                # billing wrapper in `backend/app/billing/` reads the
                # tenant's plan. Wiring lands in Phase 7.
                entitled = True
                cache[feature_key] = (enabled, entitled)
                cached = cache[feature_key]
            enabled, entitled = cached
            if not enabled:
                raise EntitlementLocked(
                    f"Feature {feature_key!r} is disabled for this tenant."
                )
            if not entitled:
                raise EntitlementLocked(
                    f"Feature {feature_key!r} is not included in this plan."
                )
            return await fn(*args, **kwargs)

        setattr(wrapper, "__gated_feature__", feature_key)
        return wrapper  # type: ignore[return-value]

    return decorator


def _tenant_schema_for(request: Request | None) -> str | None:
    if request is None:
        return None
    # TenancyMiddleware sets current_tenant_schema in a ContextVar; we
    # read it through the existing helper to avoid duplicating the
    # resolution logic here (M3).
    from app.core.tenancy import get_current_tenant

    return get_current_tenant()


def _request_scoped_flag_cache(
    request: Request | None,
) -> dict[str, tuple[bool, bool]]:
    if request is None:
        return {}
    cache = getattr(request.state, "_gated_feature_cache", None)
    if cache is None:
        cache = {}
        request.state._gated_feature_cache = cache
    return cache
