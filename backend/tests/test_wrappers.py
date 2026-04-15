"""Tests that every M1 wrapper can be instantiated via its factory and that
the stub implementations satisfy their Protocol contract at runtime."""

import pytest

from app.ai.client import AIResponse, MockAIClient, get_client
from app.billing.provider import NullPaymentProvider, get_provider
from app.email.sender import InMemoryEmailSender, OutgoingEmail
from app.monitoring.telemetry import Metric, StdoutTelemetryClient, get_telemetry
from app.notifications.provider import (
    LocalNotificationProvider,
    Notification,
    get_notifications,
)
from app.ocr.vision import MockVisionOCR, get_ocr
from app.pdf.renderer import StubPDFRenderer, get_renderer
from app.storage.blob import LocalFilesystemBlobStorage, get_storage
from app.tax.calculator import build_default_calculator


def test_ai_get_client_returns_mock_in_dev() -> None:
    client = get_client()
    assert isinstance(client, MockAIClient)


@pytest.mark.asyncio
async def test_mock_ai_client_canned_responses() -> None:
    client = MockAIClient()
    client.register(
        "draft invoice",
        AIResponse(text="ok", tool_calls=[], tokens_in=3, tokens_out=1),
    )
    out = await client.run_tool(
        prompt="draft invoice for acme",
        tools=[],
        tenant_schema="t_acme",
    )
    assert out.text == "ok"


@pytest.mark.asyncio
async def test_local_blob_storage_round_trip(tmp_path) -> None:
    storage = LocalFilesystemBlobStorage(str(tmp_path))
    ref = await storage.put(key="receipts/r1.txt", content=b"hello", content_type="text/plain")
    assert ref.size_bytes == 5
    assert (await storage.get(key="receipts/r1.txt")) == b"hello"
    await storage.delete(key="receipts/r1.txt")


def test_blob_factory_returns_local_in_dev() -> None:
    storage = get_storage()
    assert isinstance(storage, LocalFilesystemBlobStorage)


@pytest.mark.asyncio
async def test_in_memory_email_sender_captures_sent_mail() -> None:
    sender = InMemoryEmailSender()
    await sender.send(
        OutgoingEmail(
            to=["claire@acme.eu"],
            subject="Hello",
            text_body="body",
            from_address="noreply@gamma.local",
        )
    )
    assert len(sender.sent) == 1
    assert sender.sent[0].subject == "Hello"


@pytest.mark.asyncio
async def test_stub_pdf_renderer_returns_pdf_bytes() -> None:
    renderer = StubPDFRenderer()
    doc = await renderer.render(html="<p>hello</p>")
    assert doc.content.startswith(b"%PDF-STUB")
    assert doc.content_type == "application/pdf"


def test_pdf_factory() -> None:
    assert isinstance(get_renderer(), StubPDFRenderer)


@pytest.mark.asyncio
async def test_null_payment_provider_lifecycle() -> None:
    provider = NullPaymentProvider()
    intent = await provider.create_intent(
        amount_minor_units=3500,
        currency="EUR",
        customer_ref="c_1",
        metadata={"source": "test"},
    )
    assert intent.status == "requires_capture"
    captured = await provider.capture(intent_id=intent.id)
    assert captured.status == "succeeded"


def test_billing_factory() -> None:
    assert isinstance(get_provider(), NullPaymentProvider)


def test_tax_fr_intra_eu_b2b_uses_reverse_charge() -> None:
    calc = build_default_calculator()
    out = calc.compute(
        seller_country="FR",
        buyer_country="DE",
        subtotal_minor_units=100_00,
        currency="EUR",
        buyer_vat_registered=True,
    )
    assert out.lines[0].reverse_charge is True
    assert out.total_minor_units == 100_00


def test_tax_fr_domestic_applies_20_percent_tva() -> None:
    calc = build_default_calculator()
    out = calc.compute(
        seller_country="FR",
        buyer_country="FR",
        subtotal_minor_units=100_00,
        currency="EUR",
        buyer_vat_registered=True,
    )
    assert out.lines[0].amount_minor_units == 20_00
    assert out.total_minor_units == 120_00


def test_tax_uk_domestic_applies_20_percent_vat() -> None:
    calc = build_default_calculator()
    out = calc.compute(
        seller_country="GB",
        buyer_country="GB",
        subtotal_minor_units=50_00,
        currency="GBP",
        buyer_vat_registered=True,
    )
    assert out.total_minor_units == 60_00


@pytest.mark.asyncio
async def test_mock_vision_ocr_returns_fixture() -> None:
    ocr = MockVisionOCR()
    result = await ocr.extract(image_bytes=b"", mime_type="image/png")
    assert result.currency == "EUR"
    assert result.total_minor_units == 1250


def test_ocr_factory() -> None:
    assert isinstance(get_ocr(), MockVisionOCR)


def test_stdout_telemetry_client_does_not_raise() -> None:
    client = StdoutTelemetryClient()
    client.record(Metric(name="test", value=1.0, tags={"k": "v"}))


def test_telemetry_factory() -> None:
    assert isinstance(get_telemetry(), StdoutTelemetryClient)


@pytest.mark.asyncio
async def test_notifications_fan_out_via_event_bus() -> None:
    from app.events.bus import Event, bus

    received: list[Event] = []

    async def handler(event: Event) -> None:
        received.append(event)

    bus.subscribe("invoice.draft_ready", handler)
    provider = LocalNotificationProvider()
    await provider.publish(
        Notification(
            channel="invoice.draft_ready",
            payload={"invoice_id": "inv_1"},
            tenant_schema="t_acme",
        )
    )
    assert len(received) == 1
    assert received[0].name == "invoice.draft_ready"
    bus.clear()


def test_notifications_factory() -> None:
    assert isinstance(get_notifications(), LocalNotificationProvider)
