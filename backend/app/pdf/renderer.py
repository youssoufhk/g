"""PDF renderer wrapper (M1).

Dev stub emits a deterministic byte string so unit tests can assert
template output without WeasyPrint being installed. Real
``WeasyPrintRenderer`` is wired in §3.11 with the PDF/A-1b constraint
from ADR-006.
"""

from dataclasses import dataclass
from typing import Protocol


@dataclass
class PDFDocument:
    content: bytes
    content_type: str = "application/pdf"


class PDFRenderer(Protocol):
    async def render(self, *, html: str, base_url: str | None = None) -> PDFDocument: ...


class StubPDFRenderer:
    """Returns an opaque bytes payload that includes the SHA256 of the HTML.

    Good enough for unit tests that assert template content rendered
    without actually producing a PDF.
    """

    async def render(self, *, html: str, base_url: str | None = None) -> PDFDocument:
        import hashlib

        digest = hashlib.sha256(html.encode("utf-8")).hexdigest()
        body = f"%PDF-STUB\n{digest}\n%%EOF".encode("ascii")
        return PDFDocument(content=body)


def get_renderer() -> PDFRenderer:
    return StubPDFRenderer()
