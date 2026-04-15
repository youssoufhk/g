"""Module-level feature flag registry (M6).

Each feature module registers itself once at import time. The registry is
the source of truth for:
    - whether a feature is enabled globally (default)
    - whether a feature is overridden per-tenant (set in operator console)
    - whether a feature is killed (a kill switch from `docs/DEGRADED_MODE.md`)

Route middleware and Celery task decorators consult the registry before
dispatching, so turning off a feature removes its routes, tasks, event
subscribers, and UI entry in a single flip.
"""

from dataclasses import dataclass, field
from threading import Lock


@dataclass
class FeatureFlag:
    key: str
    description: str
    default_enabled: bool = True
    kill_switch: bool = False
    per_tenant_overrides: dict[str, bool] = field(default_factory=dict)

    def is_enabled(self, tenant_schema: str | None) -> bool:
        if self.kill_switch:
            return False
        if tenant_schema is not None and tenant_schema in self.per_tenant_overrides:
            return self.per_tenant_overrides[tenant_schema]
        return self.default_enabled


class FeatureRegistry:
    def __init__(self) -> None:
        self._flags: dict[str, FeatureFlag] = {}
        self._lock = Lock()

    def register(
        self,
        key: str,
        *,
        description: str,
        default_enabled: bool = True,
    ) -> FeatureFlag:
        with self._lock:
            if key in self._flags:
                return self._flags[key]
            flag = FeatureFlag(
                key=key,
                description=description,
                default_enabled=default_enabled,
            )
            self._flags[key] = flag
            return flag

    def get(self, key: str) -> FeatureFlag:
        return self._flags[key]

    def is_enabled(self, key: str, tenant_schema: str | None) -> bool:
        flag = self._flags.get(key)
        if flag is None:
            return False
        return flag.is_enabled(tenant_schema)

    def set_kill_switch(self, key: str, *, killed: bool) -> None:
        self._flags[key].kill_switch = killed

    def set_tenant_override(
        self, key: str, tenant_schema: str, *, enabled: bool
    ) -> None:
        self._flags[key].per_tenant_overrides[tenant_schema] = enabled

    def list_all(self) -> list[FeatureFlag]:
        return sorted(self._flags.values(), key=lambda f: f.key)


registry = FeatureRegistry()
