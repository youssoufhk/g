# GammaHR architecture summary (baked facts)

This reference file contains the architectural facts that page-building work usually needs. It is a compressed substitute for the full `specs/DATA_ARCHITECTURE.md` (which is 60 KB). Read this file when a page touches anything beyond the top-level invariants in `SKILL.md`. The full spec is still authoritative; reload it only if this summary is silent or ambiguous on a question.

## Table of contents

1. Three-audience identity model
2. Global rules that apply to every (app) page
3. Component layer boundary
4. Backend feature module structure
5. Frontend state boundary
6. Money, time, rate, currency conventions
7. Version column whitelist (conflict resolution)
8. Soft-delete whitelist
9. Idempotency keys on high-value endpoints
10. Audit log conventions
11. Timesheet week-as-entity state machine
12. Confidential-tier columns (NEVER in AI prompts or UI forms)
13. Real-time transport per feature
14. AI layer rules
15. Feature gating (the three gates)
16. Pricing tiers and entitlements
17. Notification kinds enum
18. Celery background job patterns
19. Known deferred items that often get forgotten

---

## 1. Three-audience identity model

GammaHR serves three distinct audiences from one codebase with three subdomains, three Next.js route groups, three API surfaces, and three independent identity tables. No crossover between identity spaces.

| Audience | Subdomain | Identity table | Session table | Auth strategy | Has Cmd+K? |
|---|---|---|---|---|---|
| Operator (founder's team) | `ops.gammahr.com` | `public.operators` | `public.operator_sessions` | WebAuthn passkey only. No password. No TOTP fallback. | No |
| User (customer employee) | `app.gammahr.com` | `public.users` (FK to tenants) | `public.sessions` | OIDC (Google Workspace, Microsoft Entra) primary → WebAuthn passkey → bcrypt password fallback | Yes |
| Portal user (customer's client) | `portal.gammahr.com` | `public.portal_users` (FK to tenants) | `public.portal_sessions` | WebAuthn passkey → password → TOTP. No SSO in v1.0. Ships Phase 6. | No |

Impersonation is operator → user only, audited via `audit_log.actor_type = operator` + `on_behalf_of_id = user_id`. The UI for impersonation is deferred (see `docs/DEFERRED_DECISIONS.md` DEF-002), but the JWT contract is defined now.

Next.js route groups match the audiences: `frontend/app/[locale]/(ops)/`, `(app)/`, `(portal)/`. API surfaces: `/api/v1/ops/*`, `/api/v1/*`, `/api/v1/portal/*`.

## 2. Global rules for every (app) page

1. Shell is identical on every page. Sidebar 224px, topbar, bottom nav on mobile <768px. Never hand-edit the shell in a page; it lives in `components/shell/`.
2. Cmd+K command palette reachable. Triggers the LLM-as-router AI flow.
3. Every employee, client, project reference is a clickable link. Zero dead ends.
4. Every mutation emits an `audit_log` row via `service.py`, never in `routes.py` directly.
5. Every feature action uses the `@gated_feature(feature_key)` decorator which checks entitlements + flags + kill switches.
6. Dark mode default, light mode variant. Both verified.
7. All strings go through next-intl, EN + FR complete. No hardcoded text.
8. Optimistic mutations use `useOptimisticMutation` from `lib/optimistic.ts`. It handles the three-layer HTTP 409 reconciliation: optimistic rollback, field-level diff modal via `<ConflictResolver>`, revision history via `public.entity_revisions`.
9. Forms 3+ fields deep render as bottom sheets on mobile <768px.
10. The `<Table>` atom renders as `<CardList>` below 768px. Never render a desktop table at mobile width.

## 3. Component layer boundary

```
frontend/components/
  ui/           ← atoms (Button, Input, Card, Table, Badge, Avatar, ...). NEVER invent new atoms.
  patterns/     ← reusable mid-level compositions (EmptyState, FilterBar, StatPill, ListPage, ConflictResolver, JobProgress)
  shell/        ← Sidebar, Topbar, CommandPalette, BottomNav, PageHeader
frontend/features/<domain>/
  components/   ← feature-specific, business-aware
  use-<domain>.ts  ← TanStack Query hooks
  schemas.ts    ← Zod forms
  types.ts
```

**Import rule** enforced by `eslint-plugin-boundaries`:

- `features/<A>` can import from `components/ui/`, `components/patterns/`, `components/shell/`, `lib/`, `hooks/`
- `features/<A>` CANNOT import from `features/<B>`. Cross-feature data access goes through TanStack Query hooks (which fetch via API, not via other features' code).

## 4. Backend feature module structure

```
backend/app/features/<domain>/
  routes.py       ← FastAPI endpoints. Thin. Calls service.py.
  schemas.py      ← Pydantic in/out models
  service.py      ← business logic. Tenant scoping + RBAC + audit log happen here.
  models.py       ← SQLAlchemy models
  ai_tools.py     ← per-feature AI tool definitions (auto-discovered by ai/client.py)
  tests/          ← pytest + pytest-asyncio + httpx
```

**Golden rule**: cross-feature calls go through another feature's `service.py`, never reach into its `models.py`. Schema changes only via Alembic migrations (see section on migration patterns).

## 5. Frontend state boundary (the strict rule)

- **Server data** → always TanStack Query. Never mirror into Zustand.
- **UI state** (command palette open, sidebar collapsed, theme preference, selected filter chips, form drafts) → small Zustand slices per domain, 20-50 lines each.
- **Shareable view state** (filters in a URL the user can bookmark or paste, pagination page, sort column) → URL via `useSearchParams`.
- **Auth'd user profile** → TanStack Query `/me` endpoint. Never duplicate the user object into Zustand.
- **Form drafts that survive tab close** → Zustand with `persist` middleware to sessionStorage.

**The one rule that catches most bugs**: if data came from an API, it lives in TanStack Query, period. Components subscribe to the TanStack query directly, never to a Zustand mirror.

## 6. Money, time, rate, currency

| Thing | Storage | Notes |
|---|---|---|
| Monetary amount | `BIGINT` integer minor units (cents) | Exact, no float bugs, no rounding drift |
| Rate | `NUMERIC(14,4)` | Higher precision than amounts because rates multiply |
| Time worked | `INTEGER` minutes, in `timesheet_entries.duration_minutes` | Duration is the source of truth. Day unit is a UI concept via `tenants.hours_per_day`. No `started_at`/`ended_at` timestamps (kills the DST bug class). |
| Allocation percent | `INTEGER` 0-100 | |
| FX rate | `NUMERIC(18,8)` | Exchange rates need more precision than business rates |

**Day-based billing rules**: consulting firms bill days. The UI shows days and half-days. Storage is integer minutes. Conversion: `display_days = duration_minutes / (hours_per_day * 60)`. `hours_per_day` resolves as `employees.hours_per_day` → `tenants.hours_per_day` → 8.0 default. Sub-day entries require `projects.allow_hourly_entry = true` and respect a 1-hour minimum floor.

**Multi-currency**: each tenant has a base currency (`tenants.currency`). Invoices can be issued in any currency (`invoices.currency`). `invoices.fx_rate_to_base` records the rate used for margin/budget reporting in base currency. GammaHR's own subscription billing to tenants is EUR-only in v1.0.

## 7. Version column whitelist (optimistic concurrency)

These tables have `version INTEGER NOT NULL DEFAULT 0`:

```
projects
invoices
invoice_lines
clients
employees
timesheet_weeks
timesheet_entries
expenses
leave_requests
```

Every UPDATE on these tables uses `WHERE id = ? AND version = ?` and increments `version` on success. If the UPDATE returns 0 rows affected, the service layer raises `ConflictError`, the API returns HTTP 409 with `{"error": {"code": "VERSION_CONFLICT", "current_version": N, "your_version": M, "diff": [...]}}`, and the frontend's `useOptimisticMutation` wrapper triggers the three-layer resolution:

1. Optimistic lock catches the race at the DB level
2. Field-level diff modal (`<ConflictResolver>` pattern component) compares base/yours/theirs, auto-merges disjoint fields, forces manual pick on overlap
3. Revision history (`public.entity_revisions`) lets the user scroll back and restore

All other tables hard-write without version locking.

## 8. Soft-delete whitelist

These tables have `deleted_at TIMESTAMPTZ NULL`:

```
employees
clients
projects
invoices
```

All other tables hard-delete. Soft-deleted rows auto-purged 90 days after `deleted_at` via a nightly Celery job. Un-delete is admin-only, audit-logged. Query helpers inject `WHERE deleted_at IS NULL` by default; opt out via explicit `.include_deleted()`.

## 9. Idempotency keys on high-value endpoints

Required ONLY on these endpoints:

- `POST /api/v1/invoices` (invoice generation)
- `POST /api/v1/expenses/{id}/submit` (expense submission)
- `POST /api/v1/invoices/{id}/payments` (payment recording)
- `POST /api/v1/imports` (CSV imports)

Client sends `Idempotency-Key: <uuid>` header. Server stores `(tenant_id, key, request_hash, response_status, response_body)` in `public.idempotency_keys` with 24h TTL. Replay returns the cached response.

Everything else relies on the version column for race protection, not idempotency keys.

## 10. Audit log conventions

`public.audit_log` is partitioned monthly by `occurred_at`. Every mutation writes one row via the service layer (never from `routes.py`).

Columns: `id, tenant_id NULL, actor_type ∈ {user, operator, portal_user, system}, actor_id, on_behalf_of_id NULL, entity_type, entity_id, action, metadata JSONB, ip, user_agent, request_id, occurred_at`.

`tenant_id NULL` for operator-level global actions (e.g., operator listed all tenants). `on_behalf_of_id` set during approval delegation or operator impersonation.

Retained 7 years per French accounting law, then partitions dropped.

## 11. Timesheet week-as-entity state machine

`timesheet_weeks` is the parent entity. `timesheet_entries` are children (one per day per project).

```
draft ──[submit]──> submitted ──[approve]──> approved
  ↑                     │
  │                  [recall] while no approval action yet
  │                     ↓
  └──[reject]── submitted (same state, manager rejects, entries become mutable again)
```

- Submit/approve/reject operate on the WEEK, never a single day.
- Entries become IMMUTABLE once `timesheet_weeks.status = 'submitted'`.
- Recall button available only while status is `submitted` AND no approval action has happened yet.
- Week uniqueness: `UNIQUE (employee_id, iso_year, iso_week)`. ISO Monday is fixed, no configuration.

This was introduced to kill the approval race condition. Never bypass the state machine in a mutation.

## 12. Confidential-tier columns

These columns MUST NEVER appear in any AI prompt, API response to non-privileged roles, log message, Sentry-equivalent crash report, or generic query result.

```
employee_compensation.*         (salary_cents, bonus_cents, effective_from, etc.)
employee_banking.*              (iban_encrypted, bic_encrypted, bank_name, account_holder)
leave_requests.reason_encrypted (GDPR Art. 9 medical-implied leaves)
employees.protected_status_encrypted (GDPR Art. 9 protected categories)
```

All four are stored in physically separate tables, CMEK-encrypted at rest via Cloud KMS with a per-tenant keyring, accessible only via the finance/admin role path in each feature's `service.py`. Access is audit-logged with action `compensation.read` / `banking.read` / etc.

A pytest metatest greps all AI tool definitions and prompt templates for references to these table names and blocks merge on violation.

## 13. Real-time transport per feature

| Feature | Transport | Notes |
|---|---|---|
| Notifications feed | WebSocket | Single `/ws/notifications` channel per user, auth via short-lived ticket, reconnect with exponential backoff |
| Background job progress (OCR, CSV import, invoice PDF render) | SSE | `/api/v1/jobs/{job_id}/stream`, short-lived, one stream per job |
| Dashboard live numbers | TanStack Query polling | `refetchInterval: 30s` + `refetchOnWindowFocus: true` |
| Lists / profiles / detail pages | Refetch on focus only | No push, no polling |

WebSocket horizontal scale (Redis pub/sub fan-out) deferred; single backend instance is fine for Phase 2-3.

## 14. AI layer rules

GammaHR uses **Vertex AI Gemini 2.5 Flash** in `europe-west9` (Paris) via `backend/app/ai/client.py`. The pattern is **LLM-as-router with deterministic tools**: the model picks a tool, the tool (in `backend/app/features/<domain>/ai_tools.py`) does the work with full tenant scoping and RBAC inherited from `service.py`.

Rules that cannot be broken:

- Never hardcode model IDs. Use `MODELS.DEFAULT` or `MODELS.VISION` from `backend/app/ai/models.py`.
- Every AI call goes through `ai/client.py` for budget enforcement + kill-switch gate.
- Never include Confidential-tier columns in any prompt (section 12).
- Log only meter data to `public.ai_events` (tokens, cost, tool, latency). NEVER log prompt content.
- Tenant opt-out: `tenants.ai_enabled BOOL`. User opt-out: `users.ai_enabled BOOL`. Both default true.

Degraded mode (at 80% budget OR 10x hourly burn anomaly): OCR stays on (essential), command palette returns "AI busy", insight card generation skipped for the day.

v1.0 tool set (in `features/<domain>/ai_tools.py`):

```
filter_timesheets, filter_invoices, filter_expenses, filter_leaves, filter_approvals,
get_project_summary, get_client_summary, get_employee_summary,
compute_budget_burn, compute_contribution, compute_capacity,
find_overdue_items, extract_receipt_data, navigate_to, onboarding_column_mapper
```

## 15. Feature gating (the three independent gates)

Any "can this user use feature X" check is three gates combined:

```python
can_use_feature(user, tenant, feature_key) = (
    entitlements.is_entitled(tenant, feature_key)    # did they PAY for it?
    and flags.is_enabled(feature_key, tenant, user)   # is it rolled out to them?
    and not kill_switches.active(feature_key)          # is it emergency-disabled?
)
```

Use the `@gated_feature("feature_key")` decorator on every mutation route. It calls all three gates in one place.

- **Entitlements** live in `public.tenant_entitlements(tenant_id, feature_key, enabled, quota_int NULL, metadata_jsonb)`. Populated from `tenants.list_tier` by a background task, overridable per row.
- **Feature flags** live in `public.feature_flags(key, scope_type ∈ {global, tenant, user}, scope_id NULL, enabled, rules_jsonb NULL)`. In-house implementation, ~200 lines.
- **Kill switches** are rows in the same `public.feature_flags` table with `key LIKE 'kill_switch.*'` and `scope_type = 'global'`. Current set: `kill_switch.ai`, `kill_switch.signups`, `kill_switch.invoicing`, `kill_switch.email`, `kill_switch.ocr_uploads`, `kill_switch.webhooks`, `kill_switch.payment_processing`.

## 16. Pricing tiers and entitlements

Volume-band per-seat pricing (band pricing, not cliff pricing):

| Tier | 1-50 seats | 51-100 | 101-200 | >200 |
|---|---|---|---|---|
| Starter | €9/seat/mo | €8/seat/mo | €7/seat/mo | custom contract |
| Pro | €15/seat/mo | €13/seat/mo | €11/seat/mo | custom contract |
| Enterprise | custom contract only |

**Starter includes**: core time, clients, projects, invoices, expenses, leaves, basic dashboards, email support.
**Pro adds**: AI command palette, AI OCR, AI insight cards, resource planning, custom fields, advanced reports, priority support.
**Enterprise adds**: SSO/SAML/SCIM (post-deferral), audit exports, negotiated DPA, dedicated support, uptime SLA.

**Seat = active user in last 30 days.** Reference users (in data but never log in) are NOT billable.

When building a page, check which tier its feature belongs to. Pro features must render a locked state with "Upgrade to Pro" CTA for Starter tenants. Use `entitlements.require(feature_key, tenant_id)` on the backend (returns HTTP 402 if not entitled) and `useEntitlement(feature_key)` on the frontend (hides or grays out the UI).

## 17. Notification kinds enum

```
approval_requested, approval_decided, import_finished, invoice_sent, mention,
payment_failed, payment_succeeded, trial_ending, tenant_suspended,
security_alert, digest_daily
```

Each kind has an `is_essential` property defined in the notifications service layer. Essential kinds (auth, invoice delivery, legal) bypass the `users.email_status` suppression and always send.

Default channel routing (set in code, overridable per user via `public.notification_preferences`):

- Most kinds: `{in_app: true, push: true, email: false}`
- `invoice_sent` (to client): `{email: true}` only, because the recipient is an external client who has no in-app presence
- Auth-related: `{email: true}` always, because the user may be locked out
- `digest_daily`: `{email: true, in_app: false, push: false}`, opt-in only

## 18. Celery background job patterns

Celery workers run on a small Compute Engine VM (not Cloud Run). Redis is the broker (also on a small Compute Engine VM). Both upgrade to managed services later.

Patterns you will use when building a page:

- **OCR pipeline**: GCS presigned upload → ClamAV virus scan → Gemini vision via Vertex AI → structured JSON via Pydantic → `expenses` row in `draft` status → user confirms. Entire pipeline runs in Celery, not in the HTTP request.
- **CSV import**: chunked runner with `public.import_checkpoints` for resumability, batch size 500 rows per transaction, progress streamed via WebSocket on the notifications channel.
- **Invoice PDF render**: invoice creation commits with `pdf_status = 'pending'`, Celery renders via WeasyPrint, flips to `'ready'`.
- **Nightly insight card generation**: Celery beat job per tenant at 4am local tenant TZ, deterministic analyzers produce signals, Gemini ranks them and writes explanations.
- **Retention jobs**: nightly per-entity, log counts of deleted rows to audit log, anomaly alarm if deletion count exceeds 10x the 7-day moving average.

## 19. Known deferred items that trip up page building

Check `docs/DEFERRED_DECISIONS.md` before adding any of these. They are all explicitly NOT in v1.0:

- Multi-hop or conditional approval routing (DEF-001). v1.0 is single-hop direct manager + finance co-approval for expenses above threshold only.
- Operator impersonation UI (DEF-002). The JWT contract exists but the UI doesn't.
- Per-tenant subdomain (DEF-005). All tenants on `app.gammahr.com`.
- Retainer project billing (DEF-006). Only T&M and fixed-price.
- Multi-rate VAT (DEF-007). Single tenant-default rate + EU reverse-charge boolean.
- Portal SSO (DEF-008). Portal users use local auth only.
- Outbound webhooks (DEF-009). Table shape documented but feature not shipped.
- Bank feed integration (DEF-010). Not in v1.0.
- Email-to-expense ingestion (DEF-011). Manual upload only.
- Live presence indicators (DEF-012). Optimistic lock + conflict diff + revision history is the chosen path.
- Self-serve signup (DEF-028). Tenants are created by the founder in the operator console.
- Stripe or Revolut integration (DEF-029). Phase 2 does manual PDF invoicing.
- Storybook (DEF-049). Components are documented via code only until a second frontend developer joins.
- Full offline support (DEF-047). Only timesheet entry works offline.

If a task is blocked by a deferred item, stop and ask the founder. Do not work around a deferral without explicit founder approval.

---

## When this summary is not enough

Read the relevant section of `specs/DATA_ARCHITECTURE.md` only when:

- The page touches a topic not covered above
- You find a contradiction between this summary and the page's APP_BLUEPRINT row
- The founder explicitly asks "what does the spec say about X"

Otherwise trust this summary. Reloading the 60 KB spec per invocation is what the skill system is designed to prevent.
