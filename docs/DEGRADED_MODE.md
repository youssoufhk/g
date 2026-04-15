# Degraded Mode

> **Who this is for.** The agent building any feature that touches AI, WebSocket, or another external dependency. Also the founder deciding whether to toggle a kill switch during an incident.
> **Scope.** What happens in the product when kill switches are on or external services are slow/unavailable. Defines user-visible behavior per feature.

Degraded mode is not an afterthought. Every Tier 1 feature has a designed fallback path that the founder can verify with `kill_switch.ai=on`. A feature that works when everything is healthy but crashes when a dependency is flaky fails the flawless gate.

This doc is the reference. The behavior matrix in section 2 is the contract.

---

## 1. Kill switches (inventory)

| Switch name | Owner | Scope | How to toggle | Triggers (auto or manual) | Default state |
|---|---|---|---|---|---|
| `kill_switch.ai` | Operator | Global or per-tenant | Operator console > Kill Switches | Spend overrun, prompt-injection incident, Vertex AI outage | off |
| `kill_switch.ocr` | Operator | Global or per-tenant | Operator console > Kill Switches | Vertex vision latency spike, OCR pipeline stuck | off |
| `kill_switch.command_palette` | Operator | Global | Operator console > Kill Switches | Cmd+K routing layer bug, prompt-injection incident | off |
| `kill_switch.insights` | Operator | Global or per-tenant | Operator console > Kill Switches | Cost overrun on nightly insights, bad prompt version | off |
| `kill_switch.websocket` | Operator | Global | Operator console > Kill Switches | WebSocket infra unstable, mass reconnect storm | off |
| `kill_switch.emails` | Operator | Global | Operator console > Kill Switches | Transactional email bounce storm, Workspace relay outage | off |
| `kill_switch.bulk_actions` | Operator | Global or per-tenant | Operator console > Kill Switches | Incident investigation (prevent large-scale writes while debugging) | off |

### 1.1 Switch semantics

- **Global scope** means every tenant is affected.
- **Per-tenant scope** means only the tenants listed in the switch's `tenant_ids` array are affected. Default is global unless an array is set.
- **Toggle** takes effect within 5 seconds. The `ai/client.py` gate reads from Redis every request; other gates read from a short-TTL cache.
- **Every toggle writes to `audit_log`** with actor, scope, reason, and timestamp.
- **Kill switches cannot be toggled from the regular tenant app.** Only the operator console (`ops.gammahr.com`).

### 1.2 Switch hierarchy

- `kill_switch.ai` is the master AI switch. When it is on, every AI feature is off (including OCR, insights, command palette NL routing).
- `kill_switch.ocr` is a sub-switch. When OCR is failing but other AI is fine, flip OCR alone to keep command palette and insights working.
- `kill_switch.insights` stops nightly insight generation only; manually-invoked AI features (command palette) stay up.
- Sub-switches can be on independently of the master. Turning off the master re-enables the sub-switches (they default to off when the master goes off).

---

## 2. Behavior matrix

The contract: for every Tier 1 feature, what happens in each degraded state, what fallback the user sees, what message appears.

| Feature | `kill_switch.ai` | `kill_switch.ocr` | `kill_switch.command_palette` | `kill_switch.websocket` | Graceful fallback | User-visible message |
|---|---|---|---|---|---|---|
| Dashboard | Insight cards hidden, KPI strip remains, charts remain | no impact | no impact | no realtime KPI refresh, 30s polling | KPI strip always visible (deterministic math) | "Insights are temporarily paused. KPIs are live." |
| Employees list + profile | no impact | no impact | no impact | no realtime updates, 30s polling | full CRUD works | - |
| Clients list + profile | no impact | no impact | no impact | no realtime updates, 30s polling | full CRUD works | - |
| Projects list + profile | no impact | no impact | no impact | no realtime updates, 30s polling | full CRUD works, budget math is deterministic | - |
| Timesheets (grid) | no impact (AI assist hidden) | no impact | no impact | conflict resolver falls back to optimistic + 409 banner | manual grid entry stays fully functional; offline queue works | "AI suggestions are temporarily paused. You can still enter hours manually." (only if AI assist was visible before) |
| Leaves | no impact (AI leave summary hidden) | no impact | no impact | no realtime updates, 30s polling | full CRUD works | - |
| Expenses | OCR disabled, manual entry required, banner shown | OCR disabled, manual entry required, banner shown | no impact | no realtime updates, 30s polling | manual entry form stays functional; receipt still uploads to GCS | "Receipt scan is temporarily paused. Please enter amount, date, and category manually." |
| Approvals hub | AI summary hidden, approvals list remains | no impact | no impact | no realtime updates, 30s polling | list and bulk approve remain | "Approval summaries are temporarily paused." |
| Invoices | AI draft hidden, manual creation flows remain | no impact | no impact | PDF status polling (5s) instead of WS push | manual invoice creation; PDF render via Celery unaffected | "AI draft is temporarily paused. You can create invoices manually." |
| Month-end close (`/invoices/month-end`) | AI explanation paragraph hidden, analyzer chips still show, draft queue fully functional. Neutral severity borders. | no impact | no impact | polling-based refresh instead of realtime draft-ready events, 30s cadence | full functionality without explanations | "AI explanations are temporarily unavailable. Analyzer signals still shown; review each draft manually." |
| Admin | no impact | no impact | no impact | no realtime updates | full CRUD works | - |
| Account | no impact | no impact | no impact | no impact | self-service works | - |
| Command palette (S1) | feature hidden entirely; global keyword search (topbar) remains | no impact | feature hidden entirely; global keyword search remains | no impact (command palette is request/response) | topbar search (non-AI, keyword-only) | Cmd+K shows nothing. Topbar search placeholder: "Search everything..." |
| Notifications drawer (S2) | no impact (notifications are deterministic events) | no impact | no impact | no realtime push, periodic 30s poll | drawer still opens on click, shows last poll | "Real-time notifications are paused." (shown once per session) |
| Notifications inbox (page) | no impact | no impact | no impact | no realtime push, 30s poll | page fully functional | - |
| Conflict resolver (S3) | no impact (conflict resolver is deterministic) | no impact | no impact | 409 responses show a one-shot banner instead of live merge | accept-theirs / keep-mine still works via manual refresh | "Live updates paused. Refresh to see the latest version." |

### 2.1 Interpretation rules

- **"no impact"** means the feature works identically to normal.
- **"feature hidden"** means the UI element is not rendered at all. No empty state, no placeholder, no hint. The user does not know the feature was supposed to be there.
- **"feature hidden, banner shown"** means the UI element is not rendered AND a yellow banner explains why.
- **"disabled"** means the element is rendered greyed-out with a tooltip on hover explaining why.
- **"read-only, no writes"** means mutations are blocked but reads work. The form submit button shows a tooltip.

---

## 3. User-visible treatment

Three UI patterns. Use exactly these; do not invent variants.

### 3.1 Yellow banner

A one-line banner at the top of the affected page.

- **Color.** Uses `--color-accent-warn-bg` and `--color-accent-warn-text` from `prototype/_tokens.css`. Do not use red (that is for errors) or blue (that is for info).
- **Content.** One sentence, present tense, no em dashes, no apologies. "X is temporarily paused" plus (if helpful) a one-clause reason.
- **Dismiss.** Dismissible per session, stored in `sessionStorage`. The banner re-appears on a fresh browser tab so the user is not left confused.
- **Position.** Below the topbar, above the page content. Not above the sidebar.
- **Example.** "Receipt scan is temporarily paused. Please enter amount and date manually."

### 3.2 Disabled button with tooltip

Applied to a specific button when that action is unavailable.

- **Appearance.** The button uses `--color-surface-2` background and `--color-text-muted` text, no hover effect.
- **Tooltip.** Appears on hover (desktop) and on long-press (mobile). "Temporarily unavailable. <reason>."
- **No click.** The button does not fire anything on click. No modal, no toast, no route change.
- **Example.** The "Scan receipt" button is disabled. Tooltip: "Temporarily unavailable. Receipt scanning is paused."

### 3.3 Feature hidden entirely

No UI element at all. The user does not know the feature exists.

- **When to use.** Command palette when `kill_switch.ai` or `kill_switch.command_palette` is on, insight cards when `kill_switch.insights` is on, AI summary sections, AI draft buttons.
- **Why.** Showing an empty state or "feature coming back soon" teases the user with something they cannot have. Cleaner to hide it. The founder will not accept "AI suggestions will return shortly" placeholders.
- **Exception.** If the feature was visible in the current session before the switch flipped (rare), a one-shot toast can explain the disappearance. The toast is shown once, then hidden forever for this session.

---

## 4. Graceful fallback contracts

For every AI feature, this is the non-AI fallback that must always work. The fallback is maintained and tested even when AI is healthy. It is not "emergency code" that rots; it is the baseline the AI sits on top of.

| AI feature | Non-AI fallback |
|---|---|
| Command palette (Cmd+K, natural language) | Global keyword search in the topbar. Hits the existing `/api/v1/search` endpoint which is a deterministic Postgres full-text search across employees, clients, projects, invoices. No NL parsing. Results are ranked by keyword frequency and recency. |
| Dashboard insight cards | Cards hidden. The KPI strip (work time, capacity, revenue, invoices due) remains because it is computed by deterministic analyzers, not by AI. |
| OCR on expense upload | Empty form with blank fields. User fills: vendor, amount, currency, date, category, payment method, VAT. The receipt still uploads to GCS; only the field extraction is missing. |
| Timesheet AI summary | Summary section hidden. The timesheet grid itself is unaffected. |
| AI import column mapper | Manual column mapper UI (a dropdown per source column pointing at a target field). The manual mapper is already built as the fallback, not as an afterthought; the AI just pre-selects the dropdown values. |
| AI-generated email drafts (client communication) | Blank draft. User writes from scratch. |
| Approval summaries | Summary section hidden. Approvals list stays. |
| Invoice AI draft | AI draft hidden. Manual invoice creation flow (line items, client, period) stays. |

**Design principle:** every AI feature is an enhancement of a deterministic baseline that already works. AI pre-fills; the user confirms. If the pre-fill is missing, the user types. Nothing is ever "AI-only".

---

## 5. Alerting and runbook triggers

When a kill switch flips on (automatically or manually), the operator receives:

- **Email alert** to `ops@gammahr.com` with: timestamp, actor (auto-trigger name or human operator), scope (global or tenant list), reason, current value before and after.
- **Slack webhook** to the ops channel with the same content, formatted as a Slack attachment.
- **Automatic post** in the status.gammahr.com incident log. The status page is a Cloudflare Worker that reads from a public kv store; the kill-switch service writes on every flip.

### 5.1 Auto-triggers

| Switch | Auto-trigger condition | Cooldown before next flip |
|---|---|---|
| `kill_switch.ai` | Weekly AI cost > 200% of 7-day moving average OR hourly cost > 1 EUR/hour per tenant (hard ceiling) | 15 minutes |
| `kill_switch.ocr` | OCR latency p95 > 30 s for 5 consecutive minutes | 15 minutes |
| `kill_switch.insights` | Nightly insight job cost > 2x the previous night's cost | 1 hour |
| `kill_switch.websocket` | Never auto-flips. Operator-only. | N/A |
| `kill_switch.emails` | Bounce rate > 5% of the last 100 emails, sustained 5 minutes | 15 minutes |
| `kill_switch.bulk_actions` | Never auto-flips. Operator-only. | N/A |
| `kill_switch.command_palette` | Never auto-flips. Operator-only. | N/A |

**Auto-trigger semantics:**
- The Celery beat task `monitor_degraded_mode` runs every minute, evaluates each metric, and writes flip decisions.
- A flip writes to `audit_log` with `actor_type = 'system'` and `actor_id = 'monitor_degraded_mode'`.
- The cooldown prevents oscillation: after a flip, the same switch cannot be flipped again (in either direction) for the cooldown period unless an operator overrides.
- Operators can override the cooldown at any time via the operator console; the override is audited.

### 5.2 Manual triggers

- Operator console has a "Kill Switches" page with one row per switch.
- Each row shows: current state, last flipped at, last flipped by, last reason.
- Flipping requires: confirmation modal, typed reason (minimum 10 characters), MFA re-challenge (the operator must re-enter their TOTP even if their session is fresh).
- On flip, the Slack + email + status-page notifications fire synchronously.

---

## 6. Recovery

### 6.1 Auto-trigger recovery

Each auto-triggered switch has recovery criteria. When these are met continuously for the recovery window, the monitor task flips the switch back off. Operators can also manually flip off at any time.

| Switch | Recovery criterion | Recovery window |
|---|---|---|
| `kill_switch.ai` (cost overrun) | Projected daily cost within 120% of the 7-day moving average | 1 hour stable |
| `kill_switch.ai` (manual after prompt injection) | Requires manual operator confirmation; no auto-recovery. | N/A |
| `kill_switch.ocr` (latency) | OCR latency p95 < 15 s | 10 minutes stable |
| `kill_switch.insights` (cost) | Previous night's cost within 150% of the night before | 1 night stable |
| `kill_switch.emails` (bounce rate) | Bounce rate < 1% of last 100 | 10 minutes stable |

### 6.2 Manual recovery

For switches that never auto-flip or require manual confirmation, the operator:
1. Diagnoses the root cause (see `docs/ROLLBACK_RUNBOOK.md` if a deploy or migration is implicated).
2. Writes a recovery plan in the incident doc.
3. Flips the switch off via the operator console. MFA re-challenge required.
4. Verifies the feature works end-to-end on a canary tenant before full recovery.
5. Updates the status page.

### 6.3 Post-incident review

Every switch flip (auto or manual) with user impact > 15 minutes requires a post-incident review using the template in `docs/ROLLBACK_RUNBOOK.md` section 7. Short-lived auto-flips (< 5 minutes total) that recovered without intervention are summarized in a weekly report, not individually.

---

## 7. Testing and verification

Every Tier 1 feature's flawless-gate run MUST include one pass with `kill_switch.ai=on` to verify the behavior matrix row is true. Failure to handle degraded mode is a gate fail (`docs/FLAWLESS_GATE.md` item 6).

### 7.1 Test harness

- Playwright E2E tests include a `degradedMode` fixture that sets kill switches via the test backend before the test runs.
- Each feature test suite has at least one test per relevant kill switch: `expenses-kill-switch-ocr.spec.ts`, `dashboard-kill-switch-ai.spec.ts`, etc.
- Visual regression: a snapshot is captured with each switch on and compared to the expected "degraded" layout.
- Assertions: the expected fallback element is present, the AI element is absent, the banner (if any) is visible, no console errors.

### 7.2 Gate requirement

- Before a feature ships, the founder runs `pnpm run gate:<feature>` which includes the degraded-mode pass.
- Gate failure on degraded mode blocks the ship. The feature does not advance to the next phase.

### 7.3 Production verification

- Quarterly drill: the founder flips `kill_switch.ai` on a single tenant (the staging-copy of the pilot customer) for 15 minutes and walks through the app. Every feature must work or degrade gracefully. Results logged in `docs/incidents/drills/YYYY-Q<n>.md`.

---

## 8. Cross-references

- `specs/AI_FEATURES.md` section 8 (budget, cost enforcement, kill-switch gate in `ai/client.py`)
- `specs/AI_FEATURES.md` section 9 (privacy, prompt data handling)
- `docs/FLAWLESS_GATE.md` item 6 (degraded mode check is part of the gate)
- `docs/decisions/ADR-004-realtime.md` (WebSocket fallback path to HTTP polling)
- `docs/decisions/ADR-005-storage.md` (GCS signed URLs, independent of AI switches)
- `docs/decisions/ADR-006-pdf.md` (PDF render is out of band, independent of AI switches)
- `docs/ROLLBACK_RUNBOOK.md` (migration and deploy failures, also an incident class)
- `docs/COMPLIANCE.md` section 7 (AI prompt meter logging, what gets stored)
- `specs/APP_BLUEPRINT.md` - operator console section (ops pages that toggle switches)
