"""Cloud Run operations (stub, implementation planned Phase 2 week 3).

Owns Cloud Run service creation, revision deploys, traffic split for
blue/green rollouts, rollback, and health checks.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="gcp.cloudrun")


def create_service(
    name: str,
    image: str,
    region: str,
    min_instances: int = 0,
    max_instances: int = 10,
    env_vars: dict[str, str] | None = None,
    cpu: str = "1",
    memory: str = "512Mi",
    service_account: str | None = None,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a Cloud Run service. Idempotent.

    Purpose:
        Bootstrap the four Gamma services (gamma-ops, gamma-app, gamma-portal,
        gamma-worker) per ADR-008. Prod uses min_instances=1; staging uses 0.

    Parameters:
        name: Service name.
        image: Container image URL (Artifact Registry).
        region: GCP region.
        min_instances: Minimum instances (0 in staging, 1 in prod).
        max_instances: Maximum autoscale target.
        env_vars: Environment variables.
        cpu: vCPU allocation ("1", "2", "4").
        memory: Memory allocation ("512Mi", "1Gi", "2Gi").
        service_account: Service account email for the service identity.
        project_id: Override config project.

    Returns:
        Dict with service metadata.

    Raises:
        NotImplementedError: Phase 2 week 3.

    Idempotency notes:
        Will return existing service if present (matching ADR-008 blue/green
        model where `deploy_revision` is the day-to-day operation).
    """
    raise NotImplementedError("cloudrun.create_service planned for Phase 2 week 3")


def deploy_revision(
    service: str,
    image: str,
    traffic_percent: int = 0,
    region: str | None = None,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Deploy a new revision of a Cloud Run service.

    Purpose:
        Per ADR-008, new revisions deploy at 0% traffic, then smoke tests run
        against the tagged revision URL, then traffic_split moves traffic.

    Parameters:
        service: Service name.
        image: New container image URL.
        traffic_percent: Percent of traffic to send to the new revision (0-100).
        region: GCP region.
        project_id: Override config project.

    Returns:
        Dict with revision metadata.

    Raises:
        NotImplementedError: Phase 2 week 3.
    """
    raise NotImplementedError("cloudrun.deploy_revision planned for Phase 2 week 3")


def traffic_split(
    service: str,
    splits: dict[str, int],
    region: str | None = None,
    project_id: str | None = None,
) -> None:
    """Move traffic between revisions of a Cloud Run service.

    Purpose:
        Blue/green promotion. `splits` maps revision name to percent.
        Percents must sum to 100.

    Parameters:
        service: Service name.
        splits: Dict of revision -> percent.
        region: GCP region.
        project_id: Override config project.

    Raises:
        ValueError: if percents do not sum to 100.
        NotImplementedError: Phase 2 week 3.

    Idempotency notes:
        Setting the same split twice is a no-op.
    """
    raise NotImplementedError("cloudrun.traffic_split planned for Phase 2 week 3")


def rollback(
    service: str,
    to_revision: str,
    region: str | None = None,
    project_id: str | None = None,
) -> None:
    """Roll back 100% of traffic to a previous revision.

    Purpose:
        Emergency rollback per `docs/ROLLBACK_RUNBOOK.md`. Equivalent to
        `gcloud run services update-traffic --to-revisions=PREVIOUS=100`.

    Parameters:
        service: Service name.
        to_revision: Target revision ID.
        region: GCP region.
        project_id: Override config project.

    Raises:
        NotImplementedError: Phase 2 week 3.
    """
    raise NotImplementedError("cloudrun.rollback planned for Phase 2 week 3")


def health_check(
    service: str,
    path: str = "/health",
    region: str | None = None,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Hit the tagged revision health endpoint. Returns status code, latency, body.

    Purpose:
        Post-deploy smoke test before shifting traffic. Also used by CI.

    Parameters:
        service: Service name.
        path: Health endpoint path.
        region: GCP region.
        project_id: Override config project.

    Returns:
        Dict with `status_code`, `latency_ms`, `body`.

    Raises:
        NotImplementedError: Phase 2 week 3.

    Idempotency notes:
        Read-only; idempotent.
    """
    raise NotImplementedError("cloudrun.health_check planned for Phase 2 week 3")
