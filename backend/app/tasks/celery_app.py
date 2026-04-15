"""Celery application.

One queue per priority level: ``critical``, ``default``, ``bulk``. Feature
modules declare their tasks in their own ``tasks.py`` and route them via
the ``task_routes`` entry below when they need non-default priority.
"""

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "gamma",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[],  # features append themselves as they are added
)

celery_app.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    task_time_limit=600,
    task_soft_time_limit=540,
    task_default_queue="default",
    task_queues={
        "critical": {"exchange": "critical", "routing_key": "critical"},
        "default": {"exchange": "default", "routing_key": "default"},
        "bulk": {"exchange": "bulk", "routing_key": "bulk"},
    },
    timezone="UTC",
    enable_utc=True,
)
