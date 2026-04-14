# ADR-006: PDF generation

**Status:** Accepted

## Decision

WeasyPrint. HTML + CSS to PDF via Python library.

| Element | Detail |
|---------|--------|
| Templates | `backend/app/features/invoices/templates/*.html` via Jinja2 |
| Styles | Reference the same design token CSS variables as web |
| Fonts | Inter + JetBrains Mono bundled with the service |
| Storage | Rendered PDF saved to S3, URL returned to client |
| Path | Sync for single invoice, Celery job for batches |

## Rejected

- **Typst:** fast but non-Python runtime dependency.
- **ReportLab:** imperative, template-hostile.
- **wkhtmltopdf:** unmaintained upstream.
- **Headless Chrome:** heavyweight per render, extra container.

## Consequences

- CSS limited to WeasyPrint's supported subset.
- Font rendering differs slightly from Chrome; both tested.
- Invoice templates designed within WeasyPrint constraints.
- Storybook section for PDF-rendered components.
