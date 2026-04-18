"""Lock the Celery beat schedule shape (Phase 3a.3).

Adding or deleting a scheduled job should be a single line in
``app/tasks/schedules.py``; this test makes accidental drops
visible on every commit. We assert:

  * beat_schedule contains every declared task entry,
  * every task entry points at a task name that is actually
    registered on the Celery app (otherwise beat will happily
    dispatch a job no worker can run),
  * cron cadence matches the canonical timings documented in
    ``specs/AI_FEATURES.md`` section 5 + CLAUDE.md §5.
"""

from __future__ import annotations

from celery.schedules import crontab

from app.tasks.celery_app import celery_app
from app.tasks.schedules import BEAT_SCHEDULE  # noqa: F401


def _load_tasks() -> None:
    """Import task modules so celery_app.tasks is populated. The
    schedules module normally triggers these imports via the
    include list at worker boot, but the test runner does not
    spin up a worker."""
    import importlib

    for mod in celery_app.conf.include:
        importlib.import_module(mod)


def test_beat_schedule_has_all_four_jobs() -> None:
    _load_tasks()
    keys = set(celery_app.conf.beat_schedule.keys())
    assert keys == {
        "nightly-analyzer",
        "retention-sweep-monthly",
        "invoice-gap-check-nightly",
        "approval-cycle-check-nightly",
    }


def test_beat_tasks_are_registered_on_celery_app() -> None:
    _load_tasks()
    declared_tasks = {
        entry["task"] for entry in celery_app.conf.beat_schedule.values()
    }
    registered_tasks = set(celery_app.tasks.keys())
    missing = declared_tasks - registered_tasks
    assert not missing, (
        f"beat schedule references tasks that no module has "
        f"registered: {missing}. Add their module to "
        f"celery_app.conf.include in app/tasks/schedules.py."
    )


def test_nightly_analyzer_runs_at_04_00_utc() -> None:
    entry = celery_app.conf.beat_schedule["nightly-analyzer"]
    schedule = entry["schedule"]
    assert isinstance(schedule, crontab)
    assert schedule.hour == {4}
    assert schedule.minute == {0}


def test_retention_sweep_runs_on_first_of_month_at_02_00() -> None:
    entry = celery_app.conf.beat_schedule["retention-sweep-monthly"]
    schedule = entry["schedule"]
    assert isinstance(schedule, crontab)
    assert schedule.hour == {2}
    assert schedule.minute == {0}
    assert schedule.day_of_month == {1}


def test_bulk_jobs_go_to_bulk_queue() -> None:
    """Nightly analyzer + retention sweep are long-running; they
    must route to the bulk queue so they do not starve the
    critical / default queues."""
    for key in ("nightly-analyzer", "retention-sweep-monthly"):
        entry = celery_app.conf.beat_schedule[key]
        assert entry["options"]["queue"] == "bulk"


def test_include_list_has_every_feature_task_module() -> None:
    """Beat dispatches to tasks by name; if a module is missing
    from include, the worker registry skips it and beat logs
    'Received unregistered task' every cron tick."""
    expected = {
        "app.features.approvals.tasks",
        "app.features.dashboard.tasks",
        "app.features.invoices.tasks",
        "app.tasks.retention",
    }
    assert set(celery_app.conf.include) == expected
