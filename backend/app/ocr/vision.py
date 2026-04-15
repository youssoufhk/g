"""OCR vision wrapper (M1)."""

from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class OCRField:
    name: str
    value: str
    confidence: float


@dataclass
class OCRResult:
    text: str
    fields: list[OCRField] = field(default_factory=list)
    currency: str | None = None
    total_minor_units: int | None = None


class VisionOCR(Protocol):
    async def extract(self, *, image_bytes: bytes, mime_type: str) -> OCRResult: ...


class MockVisionOCR:
    """Returns a fixture receipt."""

    async def extract(self, *, image_bytes: bytes, mime_type: str) -> OCRResult:
        return OCRResult(
            text="ACME CAFE\nTOTAL EUR 12.50",
            fields=[
                OCRField(name="merchant", value="ACME CAFE", confidence=0.97),
                OCRField(name="total", value="12.50", confidence=0.92),
                OCRField(name="currency", value="EUR", confidence=0.99),
            ],
            currency="EUR",
            total_minor_units=1250,
        )


def get_ocr() -> VisionOCR:
    from app.core.config import settings

    if settings.ocr_backend == "mock":
        return MockVisionOCR()
    raise RuntimeError(
        f"real OCR backend not wired yet (§3.11): {settings.ocr_backend!r}"
    )
