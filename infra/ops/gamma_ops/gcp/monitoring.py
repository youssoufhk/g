"""Cloud Monitoring operations (stub, implementation planned Phase 2 week 4).

Owns dashboard creation, alert policy management, and multi-region label
enforcement per ADR-008 Phase 2 checklist.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="gcp.monitoring")


def create_dashboard(
    name: str,
    config: dict[str, Any],
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a Cloud Monitoring dashboard from a config dict. Idempotent.

    Purpose:
        Provision the Gamma dashboards (request rate, error rate, p95 latency,
        AI spend, Celery queue depth, DB connection count).

    Parameters:
        name: Dashboard display name.
        config: Dashboard layout JSON (see GCP dashboards API).
        project_id: Override config project.

    Returns:
        Dict with dashboard metadata.

    Raises:
        NotImplementedError: Phase 2 week 4.

    Idempotency notes:
        Will update the existing dashboard by name instead of creating duplicates.
    """
    raise NotImplementedError("monitoring.create_dashboard planned for Phase 2 week 4")


def create_alert_policy(
    name: str,
    conditions: list[dict[str, Any]],
    notification_channels: list[str],
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create an alert policy. Idempotent.

    Purpose:
        Gamma alerts: error rate > 1%, p95 latency > 1s, AI spend > daily cap,
        Celery queue depth > 1000, Cloud SQL connections > 80%.

    Parameters:
        name: Policy name.
        conditions: Alert conditions list.
        notification_channels: Notification channel IDs.
        project_id: Override config project.

    Returns:
        Dict with policy metadata.

    Raises:
        NotImplementedError: Phase 2 week 4.

    Idempotency notes:
        Will update existing policy by name.
    """
    raise NotImplementedError("monitoring.create_alert_policy planned for Phase 2 week 4")


def list_dashboards(project_id: str) -> list[dict[str, Any]]:
    """List dashboards in a project.

    Parameters:
        project_id: Host project.

    Returns:
        List of dashboard metadata dicts.

    Raises:
        NotImplementedError: Phase 2 week 4.
    """
    raise NotImplementedError("monitoring.list_dashboards planned for Phase 2 week 4")
