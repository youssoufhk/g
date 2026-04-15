"""In-process event bus (M5).

Feature A publishes an event; feature B subscribes to it. Neither feature
imports the other. v1.0 dispatch is synchronous inside the request
transaction so failures rollback with the writer. Swapping to Cloud Pub/Sub
at scale is a one-file change (this file), not a caller change.
"""

from collections import defaultdict
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any

EventHandler = Callable[["Event"], Awaitable[None]]


@dataclass(frozen=True)
class Event:
    name: str
    payload: dict[str, Any]
    tenant_schema: str | None


class EventBus:
    def __init__(self) -> None:
        self._handlers: dict[str, list[EventHandler]] = defaultdict(list)

    def subscribe(self, name: str, handler: EventHandler) -> None:
        self._handlers[name].append(handler)

    async def publish(self, event: Event) -> None:
        for handler in self._handlers.get(event.name, []):
            await handler(event)

    def clear(self) -> None:
        """Test helper. Reset the bus between unit tests."""
        self._handlers.clear()


bus = EventBus()
