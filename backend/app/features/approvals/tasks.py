"""Approval Celery tasks.

Registered on import by ``app/tasks/schedules.py``. The nightly
delegation-cycle detector prevents A -> B -> C -> A loops that would
otherwise freeze approvals. See ``specs/DATA_ARCHITECTURE.md``
section 2.6 (``approval_delegations``).
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.tasks.celery_app import celery_app

logger = get_logger(__name__)


@celery_app.task(name="approvals.cycle_check.nightly", queue="default")
def cycle_check() -> dict[str, int]:
    """Detect approval-delegation cycles and alert ops if any.

    A cycle of the form user_a -> user_b -> user_c -> user_a breaks
    approval routing. The service-layer insert already rejects new
    cycles; this nightly job catches the old ones (entered before
    the service-layer guard shipped) and any that slipped in via
    SQL. Phase 3a.3 ships the schedule + no-op body; wiring lands
    with the approvals feature.
    """
    logger.info("approvals.cycle_check.nightly.start")
    # TODO: WITH RECURSIVE cycle_cte traversal over
    # approval_delegations, alert on any detected loop.
    result = {"delegations_scanned": 0, "cycles_detected": 0}
    logger.info("approvals.cycle_check.nightly.done", **result)
    return result
