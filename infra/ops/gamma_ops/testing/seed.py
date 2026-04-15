"""Canonical seed tenant provisioning (stub, implementation planned Phase 2 week 6).

Creates the 201-employee consulting-firm seed tenant documented in
`specs/DATA_ARCHITECTURE.md` section 12.10. Used by every E2E scenario
and by local dev.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="testing.seed")


def seed_canonical_tenant() -> dict[str, Any]:
    """Create the canonical 201-employee seed tenant. Idempotent.

    Purpose:
        Provision the reference tenant used by every automated test and
        every founder manual demo: 1 owner, 2 admins, 4 finance, 15 managers,
        177 employees, 2 readonly, 260 projects, 52 weeks of timesheets, 700
        leaves, ~8,400 expenses, 900 invoices/year, HSBC UK as GBP-billing
        client.

    Returns:
        Dict with `tenant_id`, `slug`, `owner_email`, `stats` (counts by
        entity type).

    Raises:
        TenantError: on failure.
        NotImplementedError: Phase 2 week 6.

    Idempotency notes:
        Running twice returns the existing seed tenant without recreating it.
        Running with GAMMA_ENV=prod is forbidden and raises ConfigError.

    Example:
        >>> tenant = seed_canonical_tenant()
        >>> tenant["stats"]["employees"]
        201
    """
    raise NotImplementedError("testing.seed_canonical_tenant planned for Phase 2 week 6")


def clear_tenant(tenant_id: str, confirm: bool = False) -> None:
    """Wipe every row from a test tenant while preserving schema structure.

    Purpose:
        Fast reset between E2E scenarios. Faster than drop + re-create.

    Parameters:
        tenant_id: Tenant UUID or slug.
        confirm: Must be True.

    Raises:
        ValueError: if confirm is False.
        NotImplementedError: Phase 2 week 6.

    Idempotency notes:
        Running twice is safe; the second run is a no-op on an empty schema.
    """
    raise NotImplementedError("testing.clear_tenant planned for Phase 2 week 6")
