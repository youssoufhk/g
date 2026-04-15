"""Tenant deletion (stub, implementation planned Phase 2 week 5).

Per ADR-001 and the GDPR retention policy, tenant deletion is a two-phase
process: (1) soft-suspend, (2) after a 30-day grace window, `DROP SCHEMA
tenant_<slug> CASCADE`. This function wraps the whole flow.
"""

from __future__ import annotations

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="tenants.delete")


def delete_tenant(
    tenant_id: str,
    export_first: bool = True,
    grace_days: int = 30,
    confirm: bool = False,
) -> None:
    """Delete a tenant permanently with an optional export and grace window.

    Purpose:
        Destructive operation. Marks the tenant as suspended, optionally
        exports a full logical dump to the backup bucket, then after
        `grace_days` drops the schema.

    Parameters:
        tenant_id: Tenant UUID or slug.
        export_first: Run `pg_dump -n tenant_<slug>` into the backup bucket first.
        grace_days: How long to wait before the hard drop. Zero means immediate.
        confirm: Must be True to proceed.

    Raises:
        ValueError: if confirm is False.
        TenantError: on failure.
        NotImplementedError: Phase 2 week 5.

    Idempotency notes:
        Running on an already-deleted tenant raises ResourceNotFound.
        Running on an already-suspended tenant is a no-op until the grace
        window elapses.
    """
    raise NotImplementedError("tenants.delete_tenant planned for Phase 2 week 5")
