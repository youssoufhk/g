# ADR-006: PDF generation

**Status:** Accepted (refreshed 2026-04-15 to align with ADR-005 GCS storage and the DEF-049 Storybook deferral)
**Last updated:** 2026-04-15

## Decision

WeasyPrint. HTML + CSS to PDF via Python library. Render runs **out of band in Celery** for the invoice flow (`pdf_status` flips from `pending` to `ready` per `specs/DATA_ARCHITECTURE.md` section 3.3); the inline render path is reserved for previews only.

| Element | Detail |
|---------|--------|
| Templates | `backend/app/features/invoices/templates/*.html` via Jinja2, versioned alongside the feature module |
| Styles | Reference the same `prototype/_tokens.css` design token variables as web; subset compatible with WeasyPrint's CSS support |
| Fonts | Inter + JetBrains Mono bundled with the worker container, declared via `@font-face` |
| Storage | Rendered PDF uploaded to **Google Cloud Storage** (per ADR-005), bucket `gammahr-<env>-files`, key `{tenant_id}/invoices/{yyyy}/{mm}/{invoice_id}.pdf`. Signed download URLs (V4, 15 min) returned to clients. |
| Path | Celery job `render_invoice_pdf(invoice_id)` enqueued at the end of the invoice creation transaction. Sync render is allowed only for the staff preview endpoint, never for customer-facing invoices. |
| Internal SLO | p95 < 3 s for a single-page invoice render, measured at the Celery task boundary, including upload to GCS. Goal not measured baseline. |
| Compliance | PDF/A-1b archival format (French DGFIP requires it for >= 5,000 EUR invoices; acceptable for all EU). Sequential invoice numbering with no gaps (void invoices keep their number). VAT ID displayed on both sender and recipient sides when applicable. Country-specific fields (FR, UK, DE at minimum) rendered from a per-country template fragment. 10-year retention for FR, 6 for UK, per `docs/COMPLIANCE.md`. |

## Rejected

- **Typst:** fast but non-Python runtime dependency.
- **ReportLab:** imperative, template-hostile.
- **wkhtmltopdf:** unmaintained upstream.
- **Headless Chrome:** heavyweight per render, extra container.

## Consequences

- CSS limited to WeasyPrint's supported subset.
- Font rendering differs slightly from Chrome; both tested before each Phase ship.
- Invoice templates designed within WeasyPrint constraints. The HTML preview in the (app) UI uses the same templates so visual parity is automatic.
- A failed render leaves `invoices.pdf_status = 'failed'`. The operator console surfaces failures and the founder can retry. Rendering is idempotent: replaying the task replaces the GCS object atomically.
- **Idempotent rendering.** The Celery task `render_invoice_pdf(invoice_id)` can replay safely. GCS object writes use generation-match preconditions so a retry overwrites the object atomically; SHA256 of the prior object is compared and logged. Replaying yields a byte-identical PDF if inputs are unchanged.
- **Font loading.** Invoice templates use three bundled fonts (Inter, JetBrains Mono, and a locale fallback for Cyrillic/Asian if a client name contains non-Latin characters), loaded from the container filesystem at startup. No runtime font downloads. Missing-glyph fallback to Noto Sans.
- **CI compliance validation.** CI validates generated invoices against `verapdf` to assert PDF/A-1b compliance.
- **E-invoicing URN** per EU Directive 2014/55/EU is deferred (new DEF entry in `docs/DEFERRED_DECISIONS.md`; triggers when a customer in a B2G contract requires Peppol or a national e-invoicing portal).
- **Storybook for PDF-rendered components is deferred (DEF-049).** Visual regression on PDFs is done via image diff snapshots in CI against a pinned set of canonical invoices.

## Related decisions

- **ADR-005** (file storage) - GCS is the destination, CMEK encryption applies if the invoice contains Confidential-tier data (e.g., a banking attachment), per-tenant keyring.
- **DEF-049** (Storybook deferred) - PDF visual regression uses image-diff snapshots, not Storybook.
- `specs/DATA_ARCHITECTURE.md` section 3.3 (invoice sequence concurrency and the out-of-band render contract).
- `docs/SCOPE.md` Tier 1 row 10 (invoices) - the gate budget for the WeasyPrint template alone is one full week, per `THE_PLAN.md` Phase 5 task 5.
