"""Cloud Scheduler operations (stub, implementation planned Phase 2 week 4).

Owns cron jobs that trigger Celery tasks via Pub/Sub or HTTPS endpoints.
Typical Gamma jobs: nightly file orphan cleanup, weekly schema drift check,
nightly GDPR sweep.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="gcp.scheduler")


def create_job(
    name: str,
    schedule: str,
    target: str,
    payload: dict[str, Any] | None = None,
    region: str | None = None,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a Cloud Scheduler job. Idempotent.

    Purpose:
        Provision recurring jobs on a cron schedule.

    Parameters:
        name: Job name.
        schedule: Cron string, e.g. `0 2 * * 0` (Sundays 02:00).
        target: HTTPS URL or Pub/Sub topic to trigger.
        payload: Optional JSON payload.
        region: GCP region.
        project_id: Override config project.

    Returns:
        Dict with job metadata.

    Raises:
        NotImplementedError: Phase 2 week 4.

    Idempotency notes:
        Will update existing job by name.
    """
    raise NotImplementedError("scheduler.create_job planned for Phase 2 week 4")


def pause_job(
    name: str,
    region: str | None = None,
    project_id: str | None = None,
) -> None:
    """Pause a running job. Idempotent.

    Parameters:
        name: Job name.
        region: GCP region.
        project_id: Override config project.

    Raises:
        NotImplementedError: Phase 2 week 4.
    """
    raise NotImplementedError("scheduler.pause_job planned for Phase 2 week 4")


def resume_job(
    name: str,
    region: str | None = None,
    project_id: str | None = None,
) -> None:
    """Resume a paused job. Idempotent.

    Parameters:
        name: Job name.
        region: GCP region.
        project_id: Override config project.

    Raises:
        NotImplementedError: Phase 2 week 4.
    """
    raise NotImplementedError("scheduler.resume_job planned for Phase 2 week 4")


def list_jobs(
    region: str | None = None,
    project_id: str | None = None,
) -> list[dict[str, Any]]:
    """List Cloud Scheduler jobs in a project and region.

    Parameters:
        region: GCP region.
        project_id: Override config project.

    Returns:
        List of job metadata dicts.

    Raises:
        NotImplementedError: Phase 2 week 4.
    """
    raise NotImplementedError("scheduler.list_jobs planned for Phase 2 week 4")
