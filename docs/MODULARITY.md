# Modularity

> **Who this is for.** The engineer making an architectural decision. The founder deciding whether to accept a "just one small shortcut" that would violate a boundary. The agent writing code that must not couple across feature modules.
> **What this is.** The ten rules that make Gamma's architecture drop-a-component-and-the-core-survives. The rules are not opinions; they are enforced in CI.
> **Why this matters commercially.** A pioneer in operations software has to outlive its vendor choices. Vertex AI Gemini might be replaced by Claude or a local model. WeasyPrint might be replaced by Gotenberg. Stripe might be replaced by a regional processor in Morocco or Niger. Customers should never feel any of these migrations. This document is the architectural discipline that makes those migrations one-file changes instead of rewrites.

---

## 1. The ten rules (M1 to M10)

### M1. Every vendor sits behind an abstract interface. No exceptions.

Vendor SDKs are imported from exactly ONE wrapper module per vendor. The rest of the codebase imports from the wrapper, never from the vendor SDK directly.

The wrappers:

| Wrapper module | Interface class | v1.0 implementation | Future swaps |
|---|---|---|---|
| `backend/app/ai/client.py` | `AIClient` | `VertexGeminiClient` | Claude Haiku, OpenAI gpt-5-mini, local Mistral |
| `backend/app/pdf/renderer.py` | `PDFRenderer` | `WeasyPrintRenderer` | Gotenberg, Chromium-based |
| `backend/app/storage/blob.py` | `BlobStorage` | `GCSBlobStorage` | S3, Azure Blob, local filesystem |
| `backend/app/email/sender.py` | `EmailSender` | `WorkspaceSMTPRelaySender` | SendGrid, Mailgun, Postmark |
| `backend/app/billing/provider.py` | `PaymentProvider` | (manual path in v1.0; Stripe registered but not active) | Revolut, Paddle, Flutterwave, CinetPay, Orange Money |
| `backend/app/tax/calculator.py` | `TaxCalculator` | `StrategyRegistry({fr,uk})` | ca, ma, ne, de, us, etc. |
| `backend/app/ocr/vision.py` | `VisionOCR` | `GeminiVisionOCR` | AWS Textract, Azure Vision, Tesseract |
| `backend/app/monitoring/telemetry.py` | `TelemetryClient` | `CloudMonitoringClient` | Datadog, New Relic, Prometheus+Grafana |
| `backend/app/notifications/provider.py` | `NotificationProvider` | local in-process event bus | Cloud Pub/Sub, Kafka |

**CI enforcement:** a lint rule scans every file outside those wrappers for vendor imports (`google.cloud`, `stripe.`, `anthropic.`, `weasyprint.`, `sendgrid.`, etc.) and blocks merge on any match. The only exception is the wrapper module itself and its tests.

### M2. Feature modules are self-contained folders.

Each Tier 1 feature is a folder under `backend/app/features/` that owns: `routes.py`, `schemas.py`, `service.py`, `models.py`, `tasks.py`, `ai_tools.py` (if the feature exposes AI tools), `tests/`. The frontend mirrors: `frontend/features/{feature}/`.

**The drop-and-check test:** running `rm -rf backend/app/features/{feature}/` must leave the rest of the app startable. Core routes respond. Other features still work (they may lose capability that depended on the dropped feature, but they must not crash).

**CI enforcement:** a scheduled test runs monthly. For each feature module, it removes the module, starts the app, hits 20 canonical endpoints across other features, and asserts 200 responses. If removing `expenses` breaks `invoices`, the dependency is flagged and must be refactored into an event subscription or a service-layer call (see M3 and M5).

### M3. Cross-feature calls go through service layers only.

Never `from features.X.models import ...` in `features.Y.service.py`. Always `from features.X.service import get_x_by_id(...)`. The service layer is the contract; models are private implementation detail.

**CI enforcement:** a lint rule forbids imports of `.models` from any file outside the same feature module. Blocks merge on violation.

### M4. Foreign keys have explicit ON DELETE behavior, and orphans are impossible.

Every FK in every migration specifies `ON DELETE {CASCADE, SET NULL, RESTRICT}`. `CASCADE` is used for child-of-entity relationships (invoice lines belong to invoice). `SET NULL` is used for soft references (a terminated employee's former project owner). `RESTRICT` is used when deletion must be blocked at the DB level (you cannot delete a tenant that has paid invoices).

**CI enforcement:** a pytest runs "delete a test tenant" and then "SELECT * from every table where tenant_id = ?" to assert zero orphan rows. Runs against a seeded test tenant on every PR.

### M5. Cross-feature signaling uses the event bus, not direct calls.

When feature A needs to react to an event in feature B (timesheet approved to invoice line draft created), the pattern is: B publishes an event via `notifications.provider.publish("timesheet.approved", payload)`; A subscribes via its own task handler. No direct import of B from A.

v1.0 implementation is an in-process event bus (`backend/app/events/bus.py`) that dispatches synchronously in the same transaction. Swapping to Cloud Pub/Sub later (for cross-region fan-out at scale) is a wrapper change, not a caller change.

**The value of the bus:** dropping feature A in production (via feature flag) means A stops publishing events; B keeps running. B stops firing when its own feature flag turns off. Neither feature has to know about the other's lifecycle.

### M6. Feature flags at the module level, not just per-user.

Each feature module registers itself in `backend/app/core/feature_registry.py` with a default flag. Turning off the flag: routes return 404, Celery tasks skip, event subscribers are inactive, UI hides the navigation entry. The flag check happens in the route middleware and the task decorator, not inside every service call.

This enables **dropping a component in production without deploying a new build**. If the expenses feature has a latent bug discovered at 03:00, the operator flips the flag in the operator console, expenses disappear, everything else keeps running, fix ships the next morning.

### M7. Schema migrations are reversible.

Every Alembic migration has a `down_revision` that actually works. No "we'll fix downgrade later" migrations.

**CI enforcement:** every PR runs `alembic upgrade head && alembic downgrade -1 && alembic upgrade head` against a seeded test tenant. If downgrade fails, merge is blocked.

Exception: migrations that intentionally destroy data (dropping a deprecated column after 90 days) carry a `# NON_REVERSIBLE` comment and require two approvals including the founder. These are rare and logged.

### M8. API versioning is in place from day 1, even though v1.0 has only v1.

All endpoints live under `/api/v1/*`. When a breaking change is needed later, `/api/v2/*` co-exists for 6 months. Deprecated endpoints return a `Sunset` header (RFC 8594) with a future date and a `Link` header pointing at the replacement. Frontend and mobile clients can migrate at their own pace.

v1.0 does not ship v2. The versioning scheme is in place so that v2 (when it arrives, perhaps in v1.1 or v1.2) does not require a routing refactor.

### M9. Frontend feature co-location mirrors backend.

`frontend/features/{feature}/` for every backend feature. Dropping a backend feature and its frontend folder is the same mental operation. Prevents the drift where frontend components reference backend concepts that no longer exist.

### M10. One domain concept per file.

Invoice math in `backend/app/features/invoices/line_generator.py`. Leave accrual in `backend/app/features/leaves/accrual.py`. Timesheet validation in `backend/app/features/timesheets/validator.py`. Tax rules in one file per country in `backend/app/features/tax/rules/{fr,uk}.py`. No `utils.py`, no `helpers.py`, no dumping grounds.

**Why:** when you want to understand how a concept works, you open one file. When you want to rewrite it, you replace one file. When you want to drop it, you remove one file.

---

## 2. What M1-M10 protect you from (and what they do not)

### Protected:

- **Vendor churn.** Vertex AI Gemini changes pricing or goes down. One file change in `ai/client.py` swaps to Claude Haiku. Eval harness confirms behavior unchanged.
- **Vendor exit.** WeasyPrint stops receiving maintenance. One file change in `pdf/renderer.py` swaps to Gotenberg.
- **Regulatory region change.** A new country requires a local payment provider. One file added under `billing/providers/`. No refactor.
- **Feature cut.** A Tier 1 feature doesn't land with customers. One folder removed, feature flag off, done.
- **Scale migration.** Redis-based notification queue becomes Cloud Pub/Sub for cross-region. One wrapper change. Callers unchanged.
- **Accidental coupling.** An engineer wants to reach across modules directly. CI lint blocks them at the import statement.

### NOT protected:

- **Architectural drift over years.** Rules are not a substitute for discipline. If the team stops following M1-M10 because they feel "blocked", the architecture erodes quietly. Enforce via CI, but also via code review culture.
- **Shared domain concepts.** Money, time, currency, dates, country codes are genuinely shared. They live in `backend/app/core/` and are used by every feature. Core utilities are NOT feature modules and are NOT expected to be droppable.
- **Data migrations.** If a feature is dropped after it has written data, the data remains. Cleanup is a separate operation, not a module-drop consequence.
- **Protocol changes that span modules.** If the JWT format changes, every feature that validates auth has to be updated. Protocol-level concerns are not isolated per feature.

---

## 3. Enforcement checklist

This is what CI enforces, broken down by rule:

| Rule | CI check | Frequency | Blocks merge? |
|---|---|---|---|
| M1 | Vendor-SDK import lint | Every commit | Yes |
| M2 | Drop-and-check integration test | Monthly scheduled | Surfaces to the founder; drift fixed within 1 week |
| M3 | Cross-feature `.models` import lint | Every commit | Yes |
| M4 | Orphan-row test after tenant delete | Every PR | Yes |
| M5 | No `from features.X import` in features.Y service.py for direct calls | Covered by M3 | Yes |
| M6 | Module feature flag registration test | Every PR | Yes (module must register) |
| M7 | Alembic upgrade-downgrade-upgrade test | Every PR | Yes |
| M8 | OpenAPI spec diff against the last release (backwards-compat check) | Every PR | Yes for v1; manual review for v2+ |
| M9 | Frontend `features/` mirror backend `features/` | Every PR | Warning only in v1.0 |
| M10 | No files named `utils.py`, `helpers.py`, or `common.py` in feature modules | Every commit | Yes |

---

## 4. Relationship to the flawless gate

The modularity rules are design-time structural discipline. The flawless gate (`docs/FLAWLESS_GATE.md`) is per-feature quality discipline. They complement each other:

- A feature can pass the flawless gate and still violate M3 (cross-feature coupling). CI catches this.
- A feature can respect M1-M10 and still fail the gate (bad UX, missing empty state, wrong feel). Founder review catches this.

Both checks are required. Neither substitutes for the other.

---

## 5. Relationship to the testing strategy

See `docs/TESTING_STRATEGY.md`. The modularity rules make testing much easier because well-bounded modules have clear test boundaries. In particular:

- M1 vendor wrappers make AI tests easy (mock the wrapper, not the SDK).
- M2 self-contained modules make unit test discovery natural.
- M3 service-layer contracts are exactly what contract tests assert.
- M5 event bus subscribers are individually testable.

---

## 6. When to propose changing these rules

Never. The rules are locked.

If a rule genuinely needs to change (because a new class of problem emerges), the change requires:
1. A written proposal with the specific scenario the rule fails to handle.
2. Founder approval.
3. An ADR documenting the change and the old rule.
4. A CI update to reflect the new rule.

Do NOT weaken a rule to unblock a single PR. Refactor the PR, not the rule.
