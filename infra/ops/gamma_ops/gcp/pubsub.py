"""Pub/Sub operations (stub, implementation planned Phase 2 week 4).

Owns topic and subscription creation, publish, and delete. Used to bridge
Cloud Scheduler cron triggers to Celery workers (Scheduler publishes a
message, Celery subscribes).
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="gcp.pubsub")


def create_topic(
    name: str,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a Pub/Sub topic. Idempotent.

    Parameters:
        name: Topic short name.
        project_id: Override config project.

    Returns:
        Dict with topic metadata.

    Raises:
        NotImplementedError: Phase 2 week 4.

    Idempotency notes:
        Will return existing topic if present.
    """
    raise NotImplementedError("pubsub.create_topic planned for Phase 2 week 4")


def create_subscription(
    topic: str,
    subscription: str,
    endpoint: str | None = None,
    ack_deadline_seconds: int = 60,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a subscription (push or pull). Idempotent.

    Parameters:
        topic: Topic name.
        subscription: Subscription short name.
        endpoint: Push endpoint HTTPS URL, or None for pull.
        ack_deadline_seconds: Ack deadline.
        project_id: Override config project.

    Returns:
        Dict with subscription metadata.

    Raises:
        NotImplementedError: Phase 2 week 4.
    """
    raise NotImplementedError("pubsub.create_subscription planned for Phase 2 week 4")


def publish(
    topic: str,
    payload: dict[str, Any],
    project_id: str | None = None,
) -> str:
    """Publish a JSON payload to a topic. Returns message ID.

    Parameters:
        topic: Topic name.
        payload: JSON-serializable dict.
        project_id: Override config project.

    Returns:
        Pub/Sub message ID.

    Raises:
        NotImplementedError: Phase 2 week 4.
    """
    raise NotImplementedError("pubsub.publish planned for Phase 2 week 4")


def delete_topic(
    name: str,
    confirm: bool = False,
    project_id: str | None = None,
) -> None:
    """Delete a topic. Requires confirm=True.

    Parameters:
        name: Topic short name.
        confirm: Must be True.
        project_id: Override config project.

    Raises:
        ValueError: if confirm is False.
        NotImplementedError: Phase 2 week 4.
    """
    raise NotImplementedError("pubsub.delete_topic planned for Phase 2 week 4")
