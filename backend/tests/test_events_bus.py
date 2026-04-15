import pytest

from app.events.bus import Event, EventBus


@pytest.mark.asyncio
async def test_subscribe_and_publish() -> None:
    bus = EventBus()
    received: list[Event] = []

    async def handler(event: Event) -> None:
        received.append(event)

    bus.subscribe("timesheet.approved", handler)
    await bus.publish(
        Event(name="timesheet.approved", payload={"week": 14}, tenant_schema="t_acme")
    )

    assert len(received) == 1
    assert received[0].payload == {"week": 14}
    assert received[0].tenant_schema == "t_acme"


@pytest.mark.asyncio
async def test_events_without_handlers_are_silent() -> None:
    bus = EventBus()
    await bus.publish(Event(name="nobody.listens", payload={}, tenant_schema=None))


@pytest.mark.asyncio
async def test_clear_removes_handlers() -> None:
    bus = EventBus()
    bus.subscribe("x", lambda e: None)  # type: ignore[arg-type]
    bus.clear()
    assert bus._handlers == {}
