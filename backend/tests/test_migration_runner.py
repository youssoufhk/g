"""Lock the fan-out migration runner (Phase 3a.4).

The runner is the one piece that makes schema-per-tenant actually
practical: one deploy line triggers a per-tenant wave of migrations.
If it silently skips a tenant, or masks a failed tenant as success,
the fleet drifts and ADR-001's strong-isolation claim breaks.

These tests exercise the control flow with in-memory fakes for the
four collaborators the runner is allowed to touch (tenant lister,
alembic invoker, run recorder, run finalizer). No DB, no subprocess,
no broker.
"""

from __future__ import annotations

from typing import Any

import pytest

from migrations import runner
from migrations.runner import TenantRef


class _FakeTracker:
    """Records recorder / finalizer calls so tests can assert the
    alembic_runs row lifecycle is complete (pending -> success or
    pending -> failed, always finalized)."""

    def __init__(self) -> None:
        self.rows: list[dict[str, Any]] = []

    def record(
        self, schema: str, revision: str, direction: str, triggered_by: str
    ) -> int:
        row_id = len(self.rows) + 1
        self.rows.append(
            {
                "id": row_id,
                "schema": schema,
                "revision": revision,
                "direction": direction,
                "triggered_by": triggered_by,
                "status": "pending",
                "error": None,
            }
        )
        return row_id

    def finalize(self, run_id: int, status: str, error: str | None) -> None:
        for row in self.rows:
            if row["id"] == run_id:
                row["status"] = status
                row["error"] = error
                return
        raise AssertionError(f"finalize() called for unknown run_id={run_id}")


@pytest.fixture
def tracker() -> _FakeTracker:
    return _FakeTracker()


@pytest.fixture(autouse=True)
def _reset() -> Any:
    runner.reset_collaborators()
    yield
    runner.reset_collaborators()


def _configure(
    tenants: list[TenantRef],
    tracker: _FakeTracker,
    invocations: list[tuple[str, str, str]],
    fail_on: set[str] | None = None,
) -> None:
    runner.set_tenant_lister(lambda: tenants)
    runner.set_run_recorder(tracker.record)
    runner.set_run_finalizer(tracker.finalize)

    def _invoke(schema: str, revision: str, direction: str) -> None:
        invocations.append((schema, revision, direction))
        if fail_on and schema in fail_on:
            raise RuntimeError(f"simulated alembic failure for {schema}")

    runner.set_alembic_invoker(_invoke)


def test_run_migration_fans_out_to_every_active_tenant(
    tracker: _FakeTracker,
) -> None:
    tenants = [
        TenantRef(id=1, schema_name="t_acme", status="active"),
        TenantRef(id=2, schema_name="t_beta", status="active"),
        TenantRef(id=3, schema_name="t_provi", status="provisioning"),
    ]
    invocations: list[tuple[str, str, str]] = []
    _configure(tenants, tracker, invocations)

    summary = runner.run_migration("20260418_1600", direction="upgrade")

    schemas_hit = [call[0] for call in invocations]
    assert schemas_hit == ["public", "t_acme", "t_beta", "t_provi"]
    assert summary["ok"] is True
    assert summary["failed_count"] == 0
    assert summary["public"]["status"] == "success"
    assert {t["schema"] for t in summary["tenants"]} == {
        "t_acme",
        "t_beta",
        "t_provi",
    }
    assert all(t["status"] == "success" for t in summary["tenants"])


def test_suspended_and_offboarded_tenants_are_skipped(
    tracker: _FakeTracker,
) -> None:
    """Suspended tenants are read-only during the 60-day GDPR
    window; legal_hold schemas are frozen at a known revision;
    offboarded schemas are about to be DROP SCHEMA'd. None of
    them should see a migration."""
    tenants = [
        TenantRef(id=1, schema_name="t_active", status="active"),
        TenantRef(id=2, schema_name="t_suspended", status="suspended"),
        TenantRef(id=3, schema_name="t_hold", status="legal_hold"),
        TenantRef(id=4, schema_name="t_offboarded", status="offboarded"),
    ]
    invocations: list[tuple[str, str, str]] = []
    _configure(tenants, tracker, invocations)

    runner.run_migration("20260418_1600")

    schemas_hit = [call[0] for call in invocations]
    assert schemas_hit == ["public", "t_active"]


def test_failed_tenant_does_not_abort_others(
    tracker: _FakeTracker,
) -> None:
    """If t_beta blows up mid-upgrade, t_gamma must still get
    its migration. That is the whole point of isolating the
    fan-out per-tenant. The summary carries the failure so the
    deploy pipeline can decide whether to roll forward."""
    tenants = [
        TenantRef(id=1, schema_name="t_alpha", status="active"),
        TenantRef(id=2, schema_name="t_beta", status="active"),
        TenantRef(id=3, schema_name="t_gamma", status="active"),
    ]
    invocations: list[tuple[str, str, str]] = []
    _configure(tenants, tracker, invocations, fail_on={"t_beta"})

    summary = runner.run_migration("20260418_1600")

    assert [call[0] for call in invocations] == [
        "public",
        "t_alpha",
        "t_beta",
        "t_gamma",
    ]
    assert summary["ok"] is False
    assert summary["failed_count"] == 1
    statuses = {t["schema"]: t["status"] for t in summary["tenants"]}
    assert statuses == {
        "t_alpha": "success",
        "t_beta": "failed",
        "t_gamma": "success",
    }


def test_every_attempted_run_is_finalized_in_tracker(
    tracker: _FakeTracker,
) -> None:
    """alembic_runs rows start at pending; an orphan pending row
    means the worker crashed or the finalizer was skipped. Both
    would confuse the deploy gate ("did every tenant land?")."""
    tenants = [
        TenantRef(id=1, schema_name="t_one", status="active"),
        TenantRef(id=2, schema_name="t_two", status="active"),
    ]
    invocations: list[tuple[str, str, str]] = []
    _configure(tenants, tracker, invocations, fail_on={"t_two"})

    runner.run_migration("20260418_1600")

    assert len(tracker.rows) == 3  # public + 2 tenants
    assert all(row["status"] in ("success", "failed") for row in tracker.rows)
    failed_rows = [r for r in tracker.rows if r["status"] == "failed"]
    assert len(failed_rows) == 1
    assert failed_rows[0]["schema"] == "t_two"
    assert "simulated alembic failure" in (failed_rows[0]["error"] or "")


def test_invalid_direction_is_rejected(tracker: _FakeTracker) -> None:
    _configure([], tracker, invocations=[])
    with pytest.raises(ValueError, match="direction"):
        runner.run_migration("20260418_1600", direction="sideways")


def test_downgrade_direction_is_accepted_and_propagated(
    tracker: _FakeTracker,
) -> None:
    tenants = [TenantRef(id=1, schema_name="t_solo", status="active")]
    invocations: list[tuple[str, str, str]] = []
    _configure(tenants, tracker, invocations)

    runner.run_migration(
        "20260418_1500", direction="downgrade", triggered_by="manual"
    )

    assert all(call[2] == "downgrade" for call in invocations)
    assert all(row["direction"] == "downgrade" for row in tracker.rows)
    assert all(row["triggered_by"] == "manual" for row in tracker.rows)


def test_migrate_tenant_task_is_registered_on_celery_app() -> None:
    """The fan-out task schedules migrate_tenant via apply_async;
    if the name is missing from the registry Celery drops the
    message silently."""
    from app.tasks.celery_app import celery_app

    assert "migrations.tenant" in celery_app.tasks
    assert "migrations.fan_out" in celery_app.tasks
