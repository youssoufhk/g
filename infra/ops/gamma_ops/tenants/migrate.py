"""Tenant migration fan-out (stub, implementation planned Phase 2 week 5).

Runs Alembic migrations against one tenant schema or across every tenant
in parallel. Wraps the backend Celery fan-out runner per ADR-001.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="tenants.migrate")


def migrate_tenant(
    tenant_id: str,
    target_revision: str = "head",
) -> dict[str, Any]:
    """Run Alembic migrations on one tenant schema. Idempotent.

    Purpose:
        Targeted migration for debugging, re-running a failed tenant after
        a bad deploy, or manual reconciliation after drift.

    Parameters:
        tenant_id: Tenant UUID or slug.
        target_revision: Alembic revision (default "head").

    Returns:
        Dict with `tenant_id`, `from_revision`, `to_revision`, `duration_ms`.

    Raises:
        MigrationError: on failure.
        NotImplementedError: Phase 2 week 5.

    Idempotency notes:
        Alembic is itself idempotent: running "upgrade head" when already
        at head is a no-op.
    """
    raise NotImplementedError("tenants.migrate_tenant planned for Phase 2 week 5")


def migrate_all_tenants(
    target_revision: str = "head",
    parallelism: int = 5,
) -> dict[str, Any]:
    """Fan-out Alembic migrations across every active tenant.

    Purpose:
        Standard deploy-time migration step. Runs up to `parallelism`
        concurrent migrations. Blocks until every tenant reports success or
        any tenant fails.

    Parameters:
        target_revision: Alembic revision.
        parallelism: Max concurrent workers. ADR-001 recommends 5 for
            Phase 2-3, scaling up as tenant count grows.

    Returns:
        Dict with `total`, `succeeded`, `failed`, `duration_ms`, `failures`
        (list of `(tenant_id, error)`).

    Raises:
        MigrationError: if any tenant fails.
        NotImplementedError: Phase 2 week 5.

    Idempotency notes:
        Repeated runs are safe (individual tenant migrations are idempotent).
        Failed tenants on the previous run will be retried.
    """
    raise NotImplementedError("tenants.migrate_all_tenants planned for Phase 2 week 5")
