"""Celery beat schedule wiring (Phase 3a.3).

Keeps the beat configuration in one place so adding a new scheduled
job is one line on ``BEAT_SCHEDULE`` plus the task module registration
in ``celery_app.conf.include``. Without this central list the beat
worker silently drops schedules when a feature module forgets to
import itself.

Current schedule (UTC):

* 04:00 daily - nightly analyzer: regenerates dashboard insights,
  flags overdue invoices, refreshes materialized views used by
  manager-scope queries.
* 02:00 on the 1st of every month - retention sweep: deletes
  expired idempotency_keys rows, soft-deletes records past
  their GDPR retention window, prunes expired audit partitions
  per French accounting law (7y for money, 3y for operational).

Beat runs in a dedicated ``beat`` deployment so worker restarts do
not interrupt the schedule; see ``infra/docker/docker-compose.dev.yml``
for the local equivalent.

The schedule below is declarative; beat consumes it at startup. The
task bodies live in each feature's ``tasks.py`` and are registered
under ``celery_app.conf.include`` below.
"""

from celery.schedules import crontab

from app.tasks.celery_app import celery_app

# Feature task modules. Each module registers its tasks at import.
# Missing any of these from the include list makes beat happily log
# "Received task ..." and then drop the job because the worker does
# not know the task signature. Keep alphabetical.
celery_app.conf.include = [
    "app.features.approvals.tasks",
    "app.features.dashboard.tasks",
    "app.features.invoices.tasks",
    "app.tasks.retention",
]


BEAT_SCHEDULE = {
    "nightly-analyzer": {
        "task": "dashboard.analyzer.nightly",
        "schedule": crontab(hour=4, minute=0),
        "options": {"queue": "bulk"},
    },
    "retention-sweep-monthly": {
        "task": "retention.sweep.monthly",
        "schedule": crontab(hour=2, minute=0, day_of_month=1),
        "options": {"queue": "bulk"},
    },
    "invoice-gap-check-nightly": {
        "task": "invoices.gap_check.nightly",
        "schedule": crontab(hour=3, minute=15),
        "options": {"queue": "default"},
    },
    "approval-cycle-check-nightly": {
        "task": "approvals.cycle_check.nightly",
        "schedule": crontab(hour=3, minute=30),
        "options": {"queue": "default"},
    },
}


celery_app.conf.beat_schedule = BEAT_SCHEDULE
