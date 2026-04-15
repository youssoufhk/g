"""Tenant schema drift detection (stub, implementation planned Phase 2 week 5).

Weekly Celery job per ADR-001: fingerprints each tenant schema (tables,
columns, indexes, constraints) and compares to the canonical baseline.
Divergent tenants have their migration pipeline halted until manual
reconciliation.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="tenants.drift")


def detect_drift(tenant_id: str) -> dict[str, Any]:
    """Fingerprint one tenant's schema and diff against the canonical baseline.

    Purpose:
        Per-tenant drift check. Produces a structured report suitable for
        direct inclusion in `docs/ROLLBACK_RUNBOOK.md` drift reconciliation.

    Parameters:
        tenant_id: Tenant UUID or slug.

    Returns:
        Dict with `tenant_id`, `fingerprint`, `canonical_fingerprint`,
        `diffs` (list of `{kind, object_type, object_name, detail}`),
        `has_drift` (bool).

    Raises:
        TenantError: on failure.
        NotImplementedError: Phase 2 week 5.

    Idempotency notes:
        Read-only; trivially idempotent.
    """
    raise NotImplementedError("tenants.detect_drift planned for Phase 2 week 5")


def detect_drift_all() -> list[dict[str, Any]]:
    """Run detect_drift across every active tenant. Returns drift reports.

    Purpose:
        Weekly scheduled call. Alerts on any non-zero drift to ops@gammahr.com.

    Returns:
        List of drift report dicts, one per tenant.

    Raises:
        NotImplementedError: Phase 2 week 5.
    """
    raise NotImplementedError("tenants.detect_drift_all planned for Phase 2 week 5")
