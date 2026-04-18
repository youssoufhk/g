"""Invoice Celery tasks.

Registered on import by ``app/tasks/schedules.py``. Nightly gap check
guards French DGFIP fiscal compliance; see ``specs/DATA_ARCHITECTURE.md``
section 3.3.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.tasks.celery_app import celery_app

logger = get_logger(__name__)


@celery_app.task(name="invoices.gap_check.nightly", queue="default")
def invoice_gap_check() -> dict[str, int]:
    """Scan for missing invoice numbers per (tenant_id, year).

    A gap can appear when a sequence-bumped transaction rolls back
    after the counter advances. The nightly sweep flags gaps to
    ops@gammahr.com so the founder can investigate before auditors
    do. Phase 3a.3 ships the schedule + no-op body; wiring lands
    with the invoices feature in Phase 5a.
    """
    logger.info("invoices.gap_check.nightly.start")
    # TODO Phase 5a: SELECT year, number FROM invoices
    # GROUP BY tenant_id, year ORDER BY number; flag any (tenant,
    # year) whose max(number) != count(number).
    result = {"tenants_scanned": 0, "gaps_detected": 0}
    logger.info("invoices.gap_check.nightly.done", **result)
    return result
