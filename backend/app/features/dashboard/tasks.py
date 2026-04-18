"""Dashboard Celery tasks.

Registered on import by ``app/tasks/schedules.py``. Currently one
scheduled task; add more here rather than in another feature, so
the dashboard analyzer stays owned by one module.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.tasks.celery_app import celery_app

logger = get_logger(__name__)


@celery_app.task(name="dashboard.analyzer.nightly", queue="bulk")
def nightly_analyzer() -> dict[str, int]:
    """Regenerate dashboard insights for every tenant.

    Phase 3a.3 ships the schedule + no-op body; the real analyzer
    lands with §8.8 AI tools. Returning a dict makes the Flower
    worker-ui show a useful summary per run.
    """
    logger.info("dashboard.analyzer.nightly.start")
    # TODO §8.8: iterate tenants, call compute_budget_burn +
    # find_overdue_items, persist results in dashboard_insights.
    result = {"tenants_processed": 0, "insights_generated": 0}
    logger.info("dashboard.analyzer.nightly.done", **result)
    return result
