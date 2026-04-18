"""Fan-out migration runner (ADR-001 follow-up, Phase 2-3).

Alembic in schema-per-tenant mode needs one upgrade per tenant schema.
Running them sequentially from one process is slow, error-prone, and
couples deploy duration to tenant count. The runner splits the work
into one Celery task per tenant schema and tracks each via a row in
``public.alembic_runs`` so ops can answer "did revision X deploy to
every tenant?" without polling each ``<schema>.alembic_version`` row.

Shape:

    run_migration(revision, direction="upgrade", triggered_by="deploy")
        |
        +-- public migration runs once (shared tables)
        |
        +-- for each row in public.tenants where status in
        |   ('provisioning','active'):
        |       migrate_tenant(schema, revision, direction, run_id)
        |
        +-- wait group, collect per-tenant results, roll up into
            {"public": {...}, "<schema>": {...}}.

The per-tenant task never raises; failures are recorded on the
``alembic_runs`` row and surfaced to the caller via the returned
summary. This keeps one bad tenant from blocking the rest of the
fleet (ADR-001 consequences).

Idempotency:
    * Re-running the same revision against a tenant that is already
      at or past that revision is a no-op. The DB-level check lives
      in Alembic's own version bookkeeping; the runner simply calls
      ``alembic upgrade`` which short-circuits when there is nothing
      to do.
    * The tracker row is inserted per-call, not per-revision, so you
      can see retry attempts separately from the original run. Query
      the latest ``finished_at`` per (schema, revision) to get the
      current state.

Phase 3a.4 ships the runner skeleton + tracking table + test
coverage. The actual ``alembic upgrade`` subprocess call is stubbed
behind ``_invoke_alembic`` so tests can swap it for a recorder.
Real invocation (subprocess + alembic.ini wiring) lands with the
first real tenant migration in Phase 5.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable
from dataclasses import dataclass
from typing import Any

from app.core.logging import get_logger
from app.tasks.celery_app import celery_app

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Pluggable collaborators. The runner does not import sqlalchemy or
# subprocess at module import time; tests inject fakes via setters so
# the control flow is exercised without a live DB or alembic process.
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class TenantRef:
    """One row from ``public.tenants``, narrowed to the fields the
    runner needs. Kept as a dataclass so tests can build fixtures
    without importing the real SQLAlchemy model."""

    id: int
    schema_name: str
    status: str


TenantLister = Callable[[], Iterable[TenantRef]]
AlembicInvoker = Callable[[str, str, str], None]
"""(schema, revision, direction) -> None. Raises on failure."""

RunRecorder = Callable[[str, str, str, str], int]
"""(schema, revision, direction, triggered_by) -> run_id."""

RunFinalizer = Callable[[int, str, str | None], None]
"""(run_id, status, error_or_none) -> None."""


def _default_tenant_lister() -> Iterable[TenantRef]:
    raise RuntimeError(
        "tenant_lister not configured; call set_tenant_lister() before "
        "invoking run_migration (production wiring lands with Phase 5)."
    )


def _default_alembic_invoker(schema: str, revision: str, direction: str) -> None:
    raise RuntimeError(
        "alembic_invoker not configured; call set_alembic_invoker() before "
        "invoking run_migration (production wiring lands with Phase 5)."
    )


def _default_run_recorder(
    schema: str, revision: str, direction: str, triggered_by: str
) -> int:
    raise RuntimeError(
        "run_recorder not configured; call set_run_recorder() before "
        "invoking run_migration (production wiring lands with Phase 5)."
    )


def _default_run_finalizer(run_id: int, status: str, error: str | None) -> None:
    raise RuntimeError(
        "run_finalizer not configured; call set_run_finalizer() before "
        "invoking run_migration (production wiring lands with Phase 5)."
    )


_tenant_lister: TenantLister = _default_tenant_lister
_alembic_invoker: AlembicInvoker = _default_alembic_invoker
_run_recorder: RunRecorder = _default_run_recorder
_run_finalizer: RunFinalizer = _default_run_finalizer


def set_tenant_lister(lister: TenantLister) -> None:
    global _tenant_lister
    _tenant_lister = lister


def set_alembic_invoker(invoker: AlembicInvoker) -> None:
    global _alembic_invoker
    _alembic_invoker = invoker


def set_run_recorder(recorder: RunRecorder) -> None:
    global _run_recorder
    _run_recorder = recorder


def set_run_finalizer(finalizer: RunFinalizer) -> None:
    global _run_finalizer
    _run_finalizer = finalizer


def reset_collaborators() -> None:
    """Test helper: restore the default guards so a missing fake in a
    future test fails loudly instead of silently using the previous
    test's state."""
    global _tenant_lister, _alembic_invoker, _run_recorder, _run_finalizer
    _tenant_lister = _default_tenant_lister
    _alembic_invoker = _default_alembic_invoker
    _run_recorder = _default_run_recorder
    _run_finalizer = _default_run_finalizer


# ---------------------------------------------------------------------------
# Celery tasks. The runner exposes two: a top-level orchestrator that
# discovers tenants and spawns subtasks, and a per-tenant worker. Both
# live on the default queue because migrations are short-lived and we
# want them ahead of ``bulk`` but behind ``critical`` user traffic.
# ---------------------------------------------------------------------------


ACTIVE_STATUSES: frozenset[str] = frozenset({"provisioning", "active"})
"""Tenant statuses the runner migrates. Suspended tenants are held
in a zombie state where their data is readable for the 60-day GDPR
window but no schema changes are applied. ``legal_hold`` and
``offboarded`` are likewise skipped: ``legal_hold`` freezes the
schema at a known revision so exports match the audit state,
``offboarded`` schemas are ``DROP SCHEMA``'d at day 60 and have
nothing to migrate."""


def _migrate_schema(
    schema: str,
    revision: str,
    direction: str,
    triggered_by: str,
) -> dict[str, Any]:
    """Run one migration, record it in alembic_runs, return a
    result dict. Never raises; failures come back as
    ``{"status": "failed", "error": "..."}``."""
    run_id = _run_recorder(schema, revision, direction, triggered_by)
    try:
        _alembic_invoker(schema, revision, direction)
    except Exception as exc:
        # Per-tenant isolation is the whole point of this runner; a
        # failure here must never propagate and abort the rest of the
        # fan-out. Captured + recorded for ops, never re-raised.
        error_repr = repr(exc)
        logger.exception(
            "migration_runner.tenant_failed",
            schema=schema,
            revision=revision,
            direction=direction,
            error=error_repr,
        )
        _run_finalizer(run_id, "failed", error_repr)
        return {
            "schema": schema,
            "run_id": run_id,
            "status": "failed",
            "error": error_repr,
        }
    _run_finalizer(run_id, "success", None)
    return {
        "schema": schema,
        "run_id": run_id,
        "status": "success",
        "error": None,
    }


@celery_app.task(name="migrations.tenant", queue="default")
def migrate_tenant(
    schema: str,
    revision: str,
    direction: str = "upgrade",
    triggered_by: str = "deploy",
) -> dict[str, Any]:
    """Celery entry point for one tenant. Thin wrapper so tests can
    exercise ``_migrate_schema`` directly without a Celery broker."""
    return _migrate_schema(schema, revision, direction, triggered_by)


@celery_app.task(name="migrations.fan_out", queue="default")
def run_migration(
    revision: str,
    direction: str = "upgrade",
    triggered_by: str = "deploy",
) -> dict[str, Any]:
    """Run ``revision`` against ``public`` then fan out to every
    active tenant schema. Returns a roll-up dict the deploy pipeline
    can assert against before flipping the release traffic."""
    if direction not in ("upgrade", "downgrade"):
        raise ValueError(
            f"direction must be 'upgrade' or 'downgrade', got {direction!r}"
        )

    logger.info(
        "migration_runner.start",
        revision=revision,
        direction=direction,
        triggered_by=triggered_by,
    )
    summary: dict[str, Any] = {
        "revision": revision,
        "direction": direction,
        "triggered_by": triggered_by,
        "public": _migrate_schema("public", revision, direction, triggered_by),
        "tenants": [],
    }

    tenants = [
        tenant
        for tenant in _tenant_lister()
        if tenant.status in ACTIVE_STATUSES
    ]
    for tenant in tenants:
        summary["tenants"].append(
            _migrate_schema(tenant.schema_name, revision, direction, triggered_by)
        )

    failed = [
        entry
        for entry in [summary["public"], *summary["tenants"]]
        if entry["status"] == "failed"
    ]
    summary["ok"] = not failed
    summary["failed_count"] = len(failed)
    logger.info(
        "migration_runner.done",
        revision=revision,
        direction=direction,
        tenants_migrated=len(summary["tenants"]),
        failed_count=summary["failed_count"],
    )
    return summary
