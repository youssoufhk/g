"""Notification provider wrapper (M1).

Wraps the event bus for cross-process fan-out in production (Cloud
Pub/Sub). In dev the bus is in-process so this wrapper is a thin
delegation layer. Feature modules publish notifications through this
wrapper, never directly through the bus.
"""

from dataclasses import dataclass
from typing import Any, Protocol

from app.events.bus import Event, bus


@dataclass
class Notification:
    channel: str
    payload: dict[str, Any]
    tenant_schema: str | None


class NotificationProvider(Protocol):
    async def publish(self, notification: Notification) -> None: ...


class LocalNotificationProvider:
    async def publish(self, notification: Notification) -> None:
        await bus.publish(
            Event(
                name=notification.channel,
                payload=notification.payload,
                tenant_schema=notification.tenant_schema,
            )
        )


def get_notifications() -> NotificationProvider:
    return LocalNotificationProvider()
