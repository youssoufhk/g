"""Retention sweep (GDPR + DGFIP + operational TTLs).

Runs monthly at 02:00 UTC on the 1st. Deletes expired
``idempotency_keys`` rows (24h TTL), soft-deletes records past their
GDPR retention window, and prunes expired audit partitions (7 years
for money-touching rows per French accounting law, 3 years for
operational).

Living here rather than under ``app/features/<x>/tasks.py`` because
retention is cross-cutting: no single feature owns it. The schedule
registration is in ``app/tasks/schedules.py``.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.tasks.celery_app import celery_app

logger = get_logger(__name__)


@celery_app.task(name="retention.sweep.monthly", queue="bulk")
def monthly_sweep() -> dict[str, int]:
    """Monthly retention sweep.

    Phase 3a.3 ships the schedule + no-op body; wiring lands as
    each feature's retention window is confirmed with legal in
    Phase 6 (see ``docs/COMPLIANCE.md`` section 4).
    """
    logger.info("retention.sweep.monthly.start")
    # TODO: DELETE FROM public.idempotency_keys
    #         WHERE expires_at < now();
    # TODO: UPDATE <feature>_table SET deleted_at = now()
    #         WHERE deleted_at IS NULL
    #           AND created_at < now() - INTERVAL '<retention_years>';
    # TODO: DROP PARTITION audit_log_y2019 (> 7 years).
    result = {
        "idempotency_keys_expired": 0,
        "records_soft_deleted": 0,
        "audit_partitions_dropped": 0,
    }
    logger.info("retention.sweep.monthly.done", **result)
    return result
