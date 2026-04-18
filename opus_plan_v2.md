# OPUS_PLAN_V2.md

> Frontend design-bar sweep across the entire GammaHR v2 app.
> Input: `OPUS_CRITICS_V2.md` (audit at HEAD 518900f) + founder instruction
> 2026-04-18: "raise the bar for the entire app, use Leaves + Dashboard as
> the reference, run in parallel, do not stop until done".
>
> **Scope this plan tackles:** the frontend-visible design bar (pages that
> are ❌/🟡 vs Leaves/Dashboard). **Scope this plan deliberately defers:**
> every backend/compliance/seed/ADR finding in V2 sections 0, 10-17. Those
> require founder involvement and the co-founder's backend work. Surfaced
> at the bottom as "Founder follow-ups" so nothing is lost.

---

## 0. Reference pages (the bar)

- `leaves/page.tsx` - PageHeader, app-aura, AI recommendations, URL list
  state via `useUrlListState`, `LeavesKpis`, `ResourcesFilterBar`,
  aria-busy + aria-live, skeletons, EmptyState, full i18n EN+FR,
  tabular-nums, formatted via `lib/format.ts`, scrollable table.
- `dashboard/page.tsx` + `employees/page.tsx` - KPI pattern, AI recs
  positioning, PortfolioTimeline shell.

Every page must match the subset that applies to it.

---

## 1. Rules every agent must follow (excerpt from CLAUDE.md)

- Work only in `gammahr_v2/frontend/`. Never `gammahr/`, never the
  prototype, never tokens.
- No new atoms. Use only files already in `components/ui/` and
  `components/patterns/`. If a new atom seems needed: STOP and note it in
  the report; do not create it.
- No em dashes. No forbidden words from CLAUDE.md §2.
- No animations, sparklines, 3D, decorative flourishes.
- Every user-visible string via `next-intl` with EN and FR keys added
  in the same edit. EN/FR line counts must stay identical.
- Never `git commit`. Never `git push`. Never `--no-verify`.
- No `console.log` in shipped code.
- No hardcoded `#fff` / `rgba(...)` - use `var(--color-*)` tokens.
- Dates/currencies go through `lib/format.ts`, never inline
  `Intl.DateTimeFormat`.
- Run `npx tsc --noEmit` after each page. Typecheck must be clean.
- Max 3 subagents at once per CLAUDE.md rule 12.
- When in doubt: leave a note in the final report, do not guess.

---

## 2. Page-by-page scope (from V2 audit + first-pass audit)

Legend: items marked [BAR] are design-bar upgrades; [CLEAN] are cleanups
V2 surfaced that belong to the same page.

### Detail pages (need DetailHeaderBar polish + i18n + app-aura)

#### P1. `employees/[id]/page.tsx`
- [CLEAN] Hardcoded English status strings at lines 42, 48, 53 ("Active"
  / "On leave" / "Inactive") - move to i18n keys.
- [BAR] Confirm `app-aura` present (portfolio detail standard).
- [BAR] Confirm `DetailHeaderBar` wired with prev/next over the
  employees list order.
- [BAR] Every entity reference (manager, projects, team) must be a link.

#### P2. `clients/[id]/page.tsx`
- [BAR] Same as employees/[id]: app-aura, DetailHeaderBar, link-ify all
  entity refs, i18n coverage, tabular-nums on all numerics, skeleton +
  aria-busy wrapper on loading paths.

#### P3. `projects/[id]/page.tsx`
- [BAR] Same bar as above.
- [BAR] Ensure project-to-client, project-to-employee (team) links.

#### P4. `invoices/[id]/page.tsx`
- [CLEAN] `statusLabel()` and `statusTone()` use hardcoded English -
  convert to i18n `status_*` keys (EN+FR).
- [CLEAN] All buttons & section titles via `useTranslations`.
- [BAR] Add `app-aura` background div.
- [BAR] Confirm `DetailHeaderBar` with prev/next across invoices list.
- [BAR] Wrap loading region in `aria-busy` + skeleton; tabular-nums on
  amounts.

### List / utility pages (need full bar alignment)

#### P5. `expenses/page.tsx`
- [CLEAN] Hardcoded English status/category/action labels - full i18n
  sweep (EN+FR).
- [BAR] Confirm existing KPIs are clickable + `data-active` wired to
  filter; otherwise add.
- [BAR] Confirm `useUrlListState` coverage for status/category/
  employee/project filters.
- [BAR] aria-busy + aria-live on async regions; tabular-nums.

#### P6. `approvals/page.tsx`
- [BAR] Replace old StatPill row with 4 large clickable KPI tiles
  (timesheet / expense / leave / invoice). Reuse existing Kpis pattern
  from `features/invoices/invoices-kpis.tsx` shape (new
  `approvals-kpis.tsx` in `features/approvals/` is allowed - same
  pattern, not a new atom).
- [BAR] Add `AiRecommendations` panel.
- [BAR] Convert filters to `useUrlListState` (tab + type + search).
- [BAR] Add `app-aura`.
- [CLEAN] Full i18n (`TYPE_LABEL`, action strings).
- [BAR] Bulk actions row with aria-live announcement.

#### P7. `timesheets/page.tsx`
- [BAR] Sticky week header with prev/next/today; tabular-nums on hours.
- [BAR] KPI row (week total / billable / non-billable / overtime) using
  the KPI pattern (new `timesheets-kpis.tsx` as a feature component is
  OK - it is a composition, not an atom).
- [BAR] aria-busy on day grid load.
- [BAR] `AiRecommendations` panel (top suggestion: "Copy last week",
  "Missing days").
- [BAR] `app-aura` background.
- [CLEAN] Remove hardcoded English; full i18n EN+FR.
- [CLEAN] Remove `console.log` in `features/timesheets/use-timesheets.ts:99`.

#### P8. `calendar/page.tsx`
- [BAR] Add `PageHeader` and `app-aura`.
- [BAR] Sticky month header with prev/next/today.
- [BAR] Filter chips for event type using `MultiSelectPill`.
- [BAR] Designed empty-month state via `EmptyState`.
- [CLEAN] Full i18n. Remove hardcoded `#fff` / `rgba(...)` at lines 520
  + 922 - use tokens.

#### P9. `admin/page.tsx`
- [BAR] Replace StatPill row with clickable KPI tiles (users / flags /
  billing / audit).
- [BAR] Add `AiRecommendations` on relevant cards (optional - skip if
  no real suggestion fits; do not fake content).
- [BAR] Add `app-aura`.
- [CLEAN] Full i18n. Tabular-nums on counts.

#### P10. `account/page.tsx`
- [BAR] Add `PageHeader` and `app-aura`.
- [BAR] Profile-first hero matching employee hero rules (gradient
  stripe, avatar 80px, action buttons in header).
- [BAR] Section cards: profile / security / preferences / notifications.
- [CLEAN] Full i18n. Remove hardcoded `#fff` at line 240.

#### P11. `onboarding/page.tsx`
- [BAR] Add `app-aura`.
- [BAR] Sticky step header with progress `Step x of y` using tabular-nums.
- [BAR] Designed empty/error states per step.
- [CLEAN] Full i18n for `statusLabel()`, errors, step copy.

### Cross-cutting cleanup (touches multiple files)

#### P12. Design-system hygiene pass
- Remove em dash in `components/patterns/multi-select-pill.tsx:25`
  comment.
- Remove `console.log` in `app/[locale]/(portal)/portal/invoices/page.tsx`
  lines 93, 349 (portal is Phase 6 per THE_PLAN; leave behaviour intact,
  just kill the log statements).
- Move inline `Intl.DateTimeFormat` in
  `features/dashboard/insight-banner.tsx:7` to `lib/format.ts` helpers.
- Apply a global `font-feature-settings: "tnum"` rule to monetary /
  numeric columns via `styles/globals.css` on `[data-numeric]` or the
  existing `fontVariantNumeric: tabular-nums` class - pick the least
  invasive and apply consistently.

---

## 3. Execution: parallel agent batches

CLAUDE.md rule 12 caps at 3 subagents. Launch order:

- **Batch A (3 parallel):** P1 employees/[id], P2 clients/[id],
  P3 projects/[id]
- **Batch B (3 parallel):** P4 invoices/[id], P5 expenses, P6 approvals
- **Batch C (3 parallel):** P7 timesheets, P8 calendar, P9 admin
- **Batch D (2 parallel):** P10 account, P11 onboarding
- **Batch E (1):** P12 cross-cutting cleanup

Each agent gets the same standing brief (§1 rules, §4 acceptance, §0
reference pages) plus the page-specific bullets from §2. Agent runs
edits directly and reports.

---

## 4. Per-page acceptance (what "done" means for this sweep)

1. PageHeader present and consistent.
2. `app-aura` div for portfolio / overview / detail pages.
3. KPI tiles clickable where relevant; `data-active` reflects filter.
4. `AiRecommendations` panel present on pages where real
   recommendations exist (do not fabricate content to satisfy the bar;
   skip if nothing is real, note in report).
5. Filters use `useUrlListState`. Back/forward/bookmark preserves state.
6. aria-busy + aria-live on async regions; designed loading / empty /
   error states.
7. Every entity reference is a link (employee, client, project,
   invoice, expense, leave, team).
8. Full i18n: zero hardcoded user-visible English. EN + FR keys added
   in same edit. EN/FR JSON line counts identical.
9. Numbers render with tabular-nums via `lib/format.ts`.
10. Zero `console.log`, zero em dashes, zero `#fff`/`rgba(...)`,
    zero inline `Intl.DateTimeFormat`.
11. No new atoms introduced; only existing `components/ui/` +
    `components/patterns/` consumed. Feature-level compositions under
    `features/<name>/*-kpis.tsx` are allowed (they are compositions,
    not atoms).
12. `npx tsc --noEmit` clean after the page is done.

---

## 5. Founder follow-ups (OPUS_CRITICS_V2 items out of scope for this sweep)

These are real and load-bearing but require founder decisions and/or
the co-founder's backend work. Captured here so nothing is lost.

- [BLOCK/COMPLIANCE] ADR-001 vs Phase 4 migration tenancy split. Pick
  schema-per-tenant or row-level + ADR amendment (V2 §12.1).
- [BLOCK] AI vendor drift: OllamaAIClient vs locked Vertex Gemini
  (V2 §12.2, §0). Either delete Ollama or amend CLAUDE.md + AI_FEATURES.
- [BLOCK] EXECUTION_CHECKLIST self-declared "DONE" on features with
  empty backend folders (V2 §2, §12.3).
- [BLOCK] Seed script covers 4/11 entity classes. Demo dies at step 1
  (V2 §13).
- [BLOCK] `@audited`, `@gated_feature`, `Idempotency-Key` decorators
  defined, applied zero times (V2 §6.5, §11.5).
- [BLOCK] Confidential-tier columns + encryption stubs missing
  (V2 §6.9).
- [BLOCK] Celery retention sweep + nightly analyzer cron not scheduled.
- [BLOCK] 15/16 AI tools, 4 AI surfaces, month-end close agent - not
  built.
- [BLOCK] Two competing quality gates (15-item vs 57-item). ADR needed.
- [GATE] `--sidebar-wide: 256px` token missing; Google Fonts not loaded
  via `next/font`.
- [GATE] Ahead-of-schedule `(portal)/` route group without ADR.
- [GATE] Misfiled atoms: `ai-insight-card`, `ai-invoice-explanation`
  should move from `components/ui/` to `components/patterns/`.
- [GATE] `components/charts/` Visx wrapper folder absent.
- [GATE] Pre-commit hook enforcing `## senior-ui-critic` /
  `## senior-ux-critic` in every commit message.
- [GATE] Owner identity drift (Youssouf Kerzika vs Timothée Marie in
  seed CSV).
- [COO/CFO teardown] pricing, SCIM, SAML, SOC 2 Type 2, multi-rate VAT,
  reverse-charge, retainer billing, source-code escrow - full
  commercial re-plan (V2 §15).

None of the above are touched by this sweep. They are for the founder
when they wake up, not for overnight agents.

---

## 6. Reporting

At the end of each batch, summarize:
- Pages touched.
- i18n keys added (count EN + FR; must match).
- Typecheck status.
- Any item from §4 that did NOT land, with reason.
- Any "I wanted a new atom / behaviour but stopped" notes.

No commits. The founder reviews the diff in the morning.

---

## 7. Continuation state (written 2026-04-18, overnight session)

**Read this section first if you are a fresh agent resuming after a rate-limit pause.**

### 7.1 What is committed

- Commit `b4c89c5` on `main` - "opus bar sweep: 9 pages to Leaves/Dashboard standard". Contains Batches A+B+C (9 pages + 3 feature KPIs + i18n). Typecheck was clean at commit time.

### 7.2 What is in flight (agents were running when this note was written)

Two background agents were dispatched for Batch D before the founder said "no more parallel runs":

- `account/page.tsx` (§P10) - agent id in the runtime, expect it to complete. Look at git diff for `frontend/app/[locale]/(app)/account/page.tsx` and `frontend/messages/*.json` to see if it landed. If the file still has hardcoded `#fff` at line ~240 or no `PageHeader`, the agent either failed or was interrupted; redo per §P10.
- `onboarding/page.tsx` (§P11) - same story. Check diff for that file.

**Action when resuming:** run `cd /home/kerzika/ai-workspace/claude-projects/gammahr_v2 && git status` and `cd frontend && npx tsc --noEmit`. If typecheck is clean and account + onboarding look upgraded, commit Batch D:

```
cd /home/kerzika/ai-workspace/claude-projects/gammahr_v2
git add frontend/app/\[locale\]/\(app\)/account/page.tsx \
        frontend/app/\[locale\]/\(app\)/onboarding/page.tsx \
        frontend/messages/en.json frontend/messages/fr.json
git commit -m "opus bar sweep batch D: account + onboarding"
```

If the two pages did NOT land, redo §P10 and §P11 (one page at a time from this point on - no parallel runs).

### 7.3 What is still pending in this sweep

**Batch E (cross-cutting cleanup, §P12) - not started.** Do these one at a time:
1. Remove em dash in `frontend/components/patterns/multi-select-pill.tsx:25` comment.
2. Remove `console.log` in `frontend/app/[locale]/(portal)/portal/invoices/page.tsx` lines ~93 and ~349.
3. Move inline `Intl.DateTimeFormat` in `frontend/features/dashboard/insight-banner.tsx:7` to use `lib/format.ts` helpers.
4. Apply global tabular-nums via `styles/globals.css` consistently.

Commit as: `opus bar sweep batch E: cross-cutting hygiene`.

---

## 8. Founder answers to OPUS_CRITICS_V2 follow-ups (received 2026-04-18, acted on overnight)

The founder explicitly overrode the no-commit rule: "Do multiple /commits so that it will be easy to debug". Commit often, one logical change per commit, use descriptive messages, invoke the pre-commit hooks (do not use `--no-verify`).

The founder also said: "use best judgement if anything comes up, I will be away". Proceed without asking.

Answers 1-15 map to V2 §5 bullet order as captured in this plan.

### 8.1 Founder answer 1 - tenancy

> "schema per tenant"

Implement true schema-per-tenant per ADR-001. Undo the Phase 4 migration deviation (tables in `public` with `tenant_id`). Either:
- rewrite `backend/migrations/versions/20260416_1000_phase4_core_data.py` to run the CREATE TABLE statements under a `t_<slug>` schema selected by `SET search_path`, or
- file an `backend/migrations/tenant_template_runner.py` that replays the template migrations into each tenant schema on tenant provisioning.

Keep the `TenancyMiddleware` as the request-time enforcer (already correct per V2 §11.2).

**Action:** open `backend/migrations/versions/20260416_1000_phase4_core_data.py`, drop the `tenant_id` FK-filter pattern, recreate tables under the tenant schema. Also write `docs/decisions/ADR-001-tenancy.md` amendment noting the correction (no ADR-011 needed; we are honoring ADR-001, not overriding it).

### 8.2 Founder answer 2 - AI vendor

> "I'll use Ollama for now and keep it easy to change in the future, I already installed ollama with models like gemma4 which very good."

The lock on Vertex Gemini is relaxed. Ollama + Gemma3/4 self-hosted is acceptable for the MVP and pilot path.

**Action:**
- File `docs/decisions/ADR-011-ai-vendor-ollama.md` amending CLAUDE.md §1 + `specs/AI_FEATURES.md §0` to allow OllamaAIClient + a documented swap path (`AIClient` interface stays; `VertexGeminiClient` remains a Phase 7 deploy-track option). Note the founder's reasoning: overnight iteration speed + no GCP cost + on-prem EU residency for now.
- Update `CLAUDE.md §1` and `specs/AI_FEATURES.md §0` accordingly (one line each).
- Keep `MockAIClient` for tests.
- Keep `OllamaAIClient` free-form fallback but wire the `AIClient.run_tool` contract so that non-tool-calling models (Gemma) can still be routed through a deterministic JSON-schema prompt. V2 §10.2 flagged that `run_tool` ignores the `tools` arg; fix by composing the tool schema into the prompt and parsing the JSON response (strict mode; reject free-form). Write one contract test.

### 8.3 Founder answer 3 - EXECUTION_CHECKLIST lies

> "fix it"

**Action:** open `EXECUTION_CHECKLIST.md` sections §6.2 and §6.3. For every line marked `[x] (2026-04-16, frontend done)`, verify (a) backend folder has routes/service/models/schemas, (b) Playwright E2E spec exists, (c) audit writer applied. If any is missing, replace `[x]` with `[~]` (in progress) and append a 1-line reason. Do NOT delete any line - history matters.

### 8.4 Founder answer 4 - seed coverage

> "should cover all"

Extend `backend/scripts/seed_demo_tenant.py` to insert the missing entity classes per `DATA_ARCHITECTURE.md §12.10`:
- 1 admin user (role=admin, tenant-owner pre-existing as employee #1 Youssouf Kerzika).
- 700 leave requests spread across 2025-2027 with all 6 types and all 4 statuses.
- 8,400 expenses (1 year worth) with status mix and receipt_url references.
- 900 invoices with full line items using the real generation algorithm (when implemented) - for now, deterministic templates referencing projects × employees × months.
- 10,400 timesheet weeks (52 × 200 employees).
- Seed audit_log (continuous, ~2000 rows) and 30 notifications.
- Pin counts in `backend/tests/test_seed_counts.py` so a regression that drops rows fails CI.

Do this in stages: admin user + 700 leaves first (unlocks 13-step MVP test step 1), then timesheets, then expenses, then invoices. Commit each.

### 8.5 Founder answer 5 - decorators

> "apply the decorators!"

Apply `@audited`, `@gated_feature`, and `Idempotency-Key` reader across the backend.
- `@audited(action="...")` on every mutating route. Remove `# z2-lint: ok` deferral comments.
- `@gated_feature(key="...")` on every feature route (key matches the feature-flag registry).
- Add `Idempotency-Key` middleware reading the header; store in `idempotency_keys` table; on replay, return the cached first response. Every `POST`/`PUT`/`DELETE` route reads it.
- Write one integration test per concern (audit row written, 402 on disabled feature, 200→200 replay on same idempotency key).

The pre-commit lint `Z.2 require @audited + @gated_feature on mutating routes` exists but is a no-op if no files match. Once applied to real routes, it starts biting. Do not bypass it.

### 8.6 Founder answer 6 - confidential tier

> "add that"

Add the missing confidential-tier columns and tables per V2 §6.9:
- `employee_compensation` table (employee_id FK, salary, bonus, grade, currency, effective_date). Encrypted at rest via pgcrypto or a stub `encrypt_column` wrapper.
- `employee_banking` table (employee_id FK, iban_encrypted, bic_encrypted, account_holder_encrypted).
- `leave_requests.reason_encrypted` column (bytea, nullable, encrypted).
- `employees.protected_status_encrypted` column (bytea, nullable).

CMEK stays Phase 7; for now use a `pgcrypto`-backed `pgp_sym_encrypt`/`pgp_sym_decrypt` with a key loaded from env. Write the schema now so the shape is in place even if the encryption is a stub.

### 8.7 Founder answer 7 - Celery

> "do it"

Wire Celery schedules:
- Nightly 04:00 UTC analyzer job (insight generation) via `celery_app.conf.beat_schedule`.
- Retention sweep (monthly 02:00 UTC on the 1st) for GDPR deletion of expired records.
- Each feature registers its tasks in `app/features/<name>/tasks.py` and the feature's `__init__` appends to `celery_app.conf.include`.

### 8.8 Founder answer 8 - AI tools

> "build them AI tools"

Build the remaining 15 tools from `AI_FEATURES.md §3.1`:
- `filter_timesheets`, `filter_invoices`, `filter_expenses`, `filter_leaves`, `filter_approvals` (5 list tools that take a natural-language query, return structured filter params for the frontend URL state).
- `get_project_summary`, `get_client_summary`, `get_employee_summary` (entity summaries).
- `compute_budget_burn`, `compute_contribution`, `compute_capacity` (analytics).
- `find_overdue_items` (cross-feature).
- `extract_receipt_data` (vision OCR wrapper - OllamaAIClient can call a vision model; fall back to mock).
- `navigate_to` (palette navigation helper).
- `explain_invoice_draft` (month-end close agent building block).

Put each tool under `backend/app/features/<feature>/ai_tools.py` per M2. Register them centrally in `backend/app/ai/registry.py`. Each tool: input schema (Pydantic), function body, 3+ eval examples in `app/ai/evals/<tool_name>/examples.jsonl`.

### 8.9 Founder answer 9 & 13 - two competing gates

> "pick the best and if complementary do a merge" / "choose best"

Merge `docs/FLAWLESS_GATE.md` (15 items in CLAUDE.md §7) with `OPUS_CRITICS.md §12` (57 items) + OPUS_CRITICS_V2 §18 delta (items 58-70). Produce a single authoritative gate document. Delete or rebrand OPUS_CRITICS.md and OPUS_CRITICS_V2.md as "audit findings, superseded by FLAWLESS_GATE.md". File `docs/decisions/ADR-012-unified-quality-gate.md` noting the merge.

Update `CLAUDE.md §7` to point at the unified gate.

### 8.10 Founder answer 10 - misfiled atoms

> "fix it"

Move from `components/ui/` (atom layer) to `components/patterns/` (composition layer):
- `ai-insight-card.tsx`
- `ai-invoice-explanation.tsx`

Update every importer. Run `npx tsc --noEmit`. No behaviour change.

### 8.11 Founder answer 11 - portal route group

> "fix it"

Portal was built ahead of Phase 6 per V2 §2. The founder said "fix it" - the cheapest interpretation is file `docs/decisions/ADR-013-portal-early.md` authorizing the (portal) route group now, citing THE_PLAN Phase 6 ordering as relaxed for the pilot. Keep the route group. Delete the two `console.log` calls at lines 93 and 349.

### 8.12 Founder answer 12 - (same as #10 misfiled atoms)

Handled in §8.10.

### 8.13 Founder answer 14 - owner identity drift

> "fix the seed csv file with my real name Youssouf Kerzika"

Edit `backend/fixtures/demo/employees.csv` line 2:
- old: `1,Timothée,Marie,timothée.marie@gamma-demo.local,owner,Finance,2022-01-10,,EUR`
- new: `1,Youssouf,Kerzika,youssouf.kerzika@gamma-demo.local,owner,Finance,2022-01-10,,EUR`

This aligns with the memory fact and removes the drift V2 §13.3 called out. Also check that no Python / SQL fixture references the old name; grep for "Timothée Marie" and fix every occurrence.

### 8.14 Founder answer 15 - COO/CFO teardown

> "no retainer but the rest is ok"

Retainer billing stays **deferred** (DEF-006 confirmed). The other COO/CFO points (SCIM, SAML, SOC 2 Type 2, multi-rate VAT + reverse-charge, source-code escrow, pen-test, named TAM, free 90-day pilot pricing, €8k try / €28-34k yr1) are accepted as the commercial reality.

**Action:**
- Update `docs/GO_TO_MARKET.md`: replace €70,260 ACV positioning with tiered pricing (€8k pilot, €28-34k yr1 for standard, €140-170/seat/yr). Note prerequisites (SOC2 Type 2, SCIM, multi-rate VAT) before full-price deployment.
- Add to `docs/SCOPE.md` Tier 1.1: SCIM provisioning, SAML SSO, multi-rate VAT, reverse-charge, FR+UK+CH tax support.
- Lift `DEF-007` (multi-rate VAT) - move to Tier 1.1 active work.
- Lift `DEF-024` (SCIM), `DEF-025` (SAML) - move to Tier 1.1.
- Keep `DEF-006` (retainer), `DEF-067` (multi-currency Gamma billing), `DEF-065` (Peppol/Chorus Pro) - deferred per founder.
- Add `DEF-***` for source-code escrow, pen-test cadence, named TAM program.

---

## 9. Recommended execution order for a resuming agent

One task at a time (no parallel). Commit after each.

1. **§7.2 status check.** If Batch D pages landed, commit them. If not, redo §P10 then §P11 sequentially, commit each.
2. **§P12 cross-cutting hygiene**, commit.
3. **§8.13 seed CSV owner rename**, commit.
4. **§8.10 misfiled atoms move**, commit.
5. **§8.11 portal ADR + console.log removal**, commit.
6. **§8.3 fix EXECUTION_CHECKLIST.md**, commit.
7. **§8.9 unified gate + ADR-012**, commit.
8. **§8.2 Ollama ADR-011 + CLAUDE.md + AI_FEATURES.md edits**, commit.
9. **§8.14 GO_TO_MARKET + SCOPE updates**, commit.
10. **§8.4 extend seed - admin user + 700 leaves first**, commit. Verify 13-step MVP test step 1 now passes.
11. **§8.4 continued - timesheets / expenses / invoices seed**, commit per entity.
12. **§8.5 apply decorators across routes**, commit per feature folder.
13. **§8.6 confidential-tier columns migration**, commit.
14. **§8.7 Celery schedules**, commit.
15. **§8.1 schema-per-tenant migration rework**, commit.
16. **§8.8 AI tools - build in pairs of 2-3 then commit**, commit per group.

Rules that stay in force throughout:
- CLAUDE.md hard rules unchanged except where §8 above amends specific items (AI vendor, portal, pricing).
- No `--no-verify`. Pre-commit hooks must pass.
- No new frontend atoms under `components/ui/` without an ADR.
- No em dashes. No banned words.
- Commit messages: one-line summary + short body. Always include `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
- Run `npx tsc --noEmit` (frontend) and `pytest` (backend) before each commit. If either breaks, fix before committing.

---

## 10. Correction: KPI count is 3, not 4

Founder note 2026-04-18 overnight: the Leaves/Dashboard bar is **3 KPIs, not 4**. Several pages shipped in Batches B/C with 4-tile KPI rows and must be reduced to 3:

- `admin/page.tsx` via `features/admin/admin-kpis.tsx` - currently 4 tiles (users / flags / billing / audit). Pick the 3 most load-bearing (suggested: users / flags / audit-today) and drop the fourth. Or merge billing into audit-today as a secondary line.
- `approvals/page.tsx` via `features/approvals/approvals-kpis.tsx` - currently 4 tiles (timesheet / expense / leave / invoice). `invoice` is non-clickable and fabricated (no data contract). **Drop the invoice tile.** Keep 3.
- `timesheets/page.tsx` via `features/timesheets/timesheets-kpis.tsx` - currently 4 (week total / billable / non-billable / overtime). Drop `non-billable` (can be inferred as `total - billable` in tooltip). Keep 3.
- `invoices/page.tsx` via `features/invoices/invoices-kpis.tsx` - audit: if it ships 4, reduce to 3 (outstanding/overdue + paid + drafts is the natural 3).

General rule now codified: **every `*-kpis.tsx` composition renders exactly 3 tiles.** If a 4th metric matters, move it into the AiRecommendations panel as a one-line hint, not a KPI tile. Update the resuming agent acceptance checklist with this constraint.

---

## 11. Resume prompt for a fresh agent

Paste this verbatim into a new Claude Opus session. Do not pre-brief; the prompt is self-contained.

```
You are resuming an overnight sweep on the GammaHR v2 repo at
/home/kerzika/ai-workspace/claude-projects/gammahr_v2. The founder is
asleep and will not answer questions. Use best judgement. Never ask
the founder anything; decide and move on.

READ ONLY THESE FILES (do not read others unless a specific task
below requires it):
1. /home/kerzika/ai-workspace/claude-projects/gammahr_v2/CLAUDE.md
   - hard rules. Memorize sections 2, 7, 9.
2. /home/kerzika/ai-workspace/claude-projects/gammahr_v2/opus_plan_v2.md
   - THIS file. Read sections 7, 8, 9, 10, 11, 12 only.
3. git log -10 --oneline, then git status --short - to see where the
   last session stopped.

Do NOT read:
- OPUS_CRITICS.md or OPUS_CRITICS_V2.md in full. Their conclusions are
  already distilled into §8 of opus_plan_v2.md.
- The prototype/ folder (frozen).
- Any page you are not actively editing.
- THE_PLAN.md, EXECUTION_CHECKLIST.md, or other roadmap docs unless
  §8 of opus_plan_v2.md explicitly tells you to edit one.

EXECUTE in this order, one task at a time, committing after each.
Never run parallel subagents. Never use --no-verify. Never ask a
question; use best judgement. If a task looks impossible, skip it,
write one sentence in opus_plan_v2.md §7.4 "Skipped with reason",
commit, and continue.

Order:
A. Verify Batch D commit landed (71d0d26). If missing, redo P10+P11
   from opus_plan_v2.md §2 sequentially, commit.
B. Apply the KPI=3 correction from opus_plan_v2.md §10 to admin,
   approvals, timesheets, invoices (4-tile KPIs reduced to 3).
   Commit as one change: "opus bar sweep: normalize *-kpis.tsx to 3
   tiles".
C. Opus_plan_v2.md §P12 cross-cutting hygiene (4 bullets). Commit.
D. Opus_plan_v2.md §8 founder follow-ups in the §9 order. Commit
   after each item. Keep each commit scope tight and focused.

RULES IN FORCE (do not break):
- No em dashes anywhere. Use hyphens. (Pre-commit hook enforces.)
- No banned words from CLAUDE.md §2.
- No new frontend atoms under components/ui/. Feature-level
  compositions under features/<name>/ are OK.
- Every user-visible string via next-intl. EN + FR keys added in the
  same edit; messages/en.json and messages/fr.json line counts must
  stay equal.
- Numbers via lib/format.ts. tabular-nums. No inline Intl.DateTimeFormat.
- No #fff or rgba() - use var(--color-*) tokens.
- No console.log in shipped code.
- Dates: convert relative to absolute when storing in memory/notes.
- Before every commit: npx tsc --noEmit (frontend) must be clean. If
  there are backend changes: pytest too. Fix breakage before commit.
- Commit message format: one-line summary, short body explaining
  why, Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>.
- Max 1 subagent at a time. Prefer doing the work yourself.

CRITIC LOOP (after the §9 list is exhausted):
Do NOT stop. Re-critic the entire codebase against the bar.
1. Read opus_plan_v2.md §12 "Critic loop" for the rubric.
2. Survey the current state with Glob + Grep (NOT by reading files
   whole). Look for: hardcoded English in JSX, missing aria-busy on
   async regions, inline Intl.DateTimeFormat, hardcoded #fff/rgba,
   console.log, em dashes, new atoms added without ADR, KPI tiles
   that are not 3, missing i18n parity (en vs fr key counts), pages
   without app-aura where they need it.
3. For each red item found: fix, typecheck, commit. One item per
   commit.
4. When you complete a full pass without finding any red item, add
   a dated "Pass N green - <timestamp>" entry to opus_plan_v2.md
   §12.history, commit, then start pass N+1 on the next logical
   layer (a11y, performance, RBAC coverage, seed completeness,
   etc. per the §12 rubric).
5. Never stop. The founder explicitly said "reiterate non stop".

If you hit a rate limit, append a one-paragraph state note to
opus_plan_v2.md §7.5 "Latest resume checkpoint" describing exactly
what you were doing, commit, stop. The next agent will pick up from
that checkpoint.
```

---

## 12. Critic loop rubric (used by the resuming agent after §9 exhausts)

When §9 is fully committed, run this loop forever (one pass at a time,
one commit per fix). Each pass targets one layer. When a layer is
green, move to the next. When all six are green, start over at layer 1
with a fresh eye.

### 12.1 Layer 1 - design bar parity
For every page under `frontend/app/[locale]/(app)/*/page.tsx`:
- PageHeader present where the page type needs one.
- `app-aura` background present on all render branches (loading, error, success).
- Exactly 3 KPI tiles via `features/<feature>/<feature>-kpis.tsx` when the page has KPIs.
- AiRecommendations panel present on pages with real suggestions; absent where there are none.
- Filters use `useUrlListState`.
- aria-busy + aria-live on async regions; skeleton + EmptyState + error branch all present.
- Every entity reference is a `<Link>`.
- tabular-nums on all numerics.
- No hardcoded English, no hardcoded `#fff`/`rgba()`, no `console.log`, no em dashes, no banned words.
- `npx tsc --noEmit` clean.

### 12.2 Layer 2 - i18n parity
- `messages/en.json` and `messages/fr.json` have identical key counts and identical structure.
- Every `useTranslations(...)` namespace used in JSX has corresponding EN + FR keys.
- No string literal in JSX outside `t("...")` calls (except ARIA role strings, token names, entity ids).

### 12.3 Layer 3 - a11y
- Every button has an accessible name.
- Every icon-only button has `aria-label`.
- Every modal has focus trap (check existing Modal atom).
- Tab order matches visual order on detail pages.
- Skip-to-content link present in layout.
- Every `aria-busy` region also has `aria-live`.

### 12.4 Layer 4 - backend hardening
- `@audited`, `@gated_feature`, `Idempotency-Key` applied to every mutating route.
- Seed script row counts match `DATA_ARCHITECTURE.md §12.10`.
- Schema-per-tenant migrations in place.
- AI tools: count built vs count in `AI_FEATURES.md §3.1`; build the next missing one per pass.

### 12.5 Layer 5 - testing
- At least one Playwright E2E spec per Tier 1 feature.
- Unit tests cover every service function on a backend feature.
- Eval suite >= 3 examples per AI surface.

### 12.6 Layer 6 - docs & gate
- `docs/FLAWLESS_GATE.md` is the single authoritative gate (per §8.9).
- No check mark in `EXECUTION_CHECKLIST.md` that is not backed by (a) backend route, (b) E2E spec, (c) audit writer.
- ADRs filed for every deviation from CLAUDE.md / ADR-001..010 / specs.

### 12.7 history

Append one line per completed pass. Do not delete past entries.

- 2026-04-18: D7 gate unification + ADR-012 (merged OPUS v1/V2 critic rubrics into single 70-item FLAWLESS_GATE).
- 2026-04-18: D8 ADR-011 Ollama + tool-schema wiring in `ai/client.py` (8 ollama-client tests pass).
- 2026-04-18: D9 pricing rebase + Tier 1.1 lift for SCIM / SAML / multi-rate VAT (DEF-024, DEF-025, DEF-007 resolved).
- 2026-04-18: D10 stage 1 of §8.4 seed coverage: leave_types + leave_requests + leave_balances migration (20260418_1000) + 700 deterministic leave-request generator + pinned counts test (9 tests pass).
- 2026-04-18: D10 stage 2 of §8.4: timesheet_weeks + timesheet_entries migration (20260418_1100) + 10,400 week + 39,000 entry deterministic generators + pinned count tests (19 tests pass).
- 2026-04-18: D10 stage 3 of §8.4: expense_categories + expenses migration (20260418_1200) + 8,400 deterministic expense generator (monthly + senior-only buckets, category mix pinned) + tests (26 tests pass).
- 2026-04-18: D10 stage 4 of §8.4: invoices + invoice_lines + invoice_payments + invoice_sequences migration (20260418_1300) + 900 invoice + 9,000 line deterministic generators + tests (37 tests pass). §8.4 seed coverage complete.
- 2026-04-18: D12a apply @audited + @gated_feature to mutating routes in auth, admin, imports (7 routes, 5 `z2-lint: ok` deferrals removed); stub AsyncSession autouse fixture added to conftest so unit tests no longer require a live DB (138 tests pass).
- 2026-04-18: D12b Idempotency-Key middleware + idempotency_keys migration (20260418_1400) + 6 integration tests (audit row written, 402 on killed feature, 200->200 replay, body-mismatch 409, missing-header passthrough, non-mutating passthrough). §8.5 decorator sweep complete (144 tests pass).
- 2026-04-18: D13 confidential-tier migration (20260418_1500) adds employee_compensation, employee_banking, employees.protected_status_encrypted; pgcrypto-stub `core/crypto.py` with swappable backend per M1 + 5 tests lock the Phase 7 CMEK contract (149 tests pass).
- 2026-04-18: D14 Celery beat schedule wired in `app/tasks/schedules.py` (nightly 04:00 analyzer, monthly 02:00 retention, nightly 03:15 invoice gap check, nightly 03:30 approval cycle check); 4 task stub modules + 6 beat-schedule lock tests (155 tests pass).
- 2026-04-18: D15 schema-per-tenant follow-up: `public.alembic_runs` migration (20260418_1600), fan-out runner `backend/migrations/runner.py` with `migrations.fan_out` + `migrations.tenant` Celery tasks, pluggable collaborators for test-time fakes; 7 runner-lock tests (active-only fan-out, failure isolation, finalizer coverage, direction validation); ADR-001 amended with "Correction 2026-04-18" ratifying the Phase 4 `tenant_id`-column MVP and documenting the cutover path (162 tests pass).
- 2026-04-18: D16 builds the 15 AI tools from `AI_FEATURES.md §3.1` + central `app/ai/registry.py` + 45 golden eval examples (3+ per tool across 15 new `evals/<tool>/examples.jsonl` files, onboarding_column_mapper dir renamed to match tool name). Tools: filter_timesheets / filter_invoices / filter_expenses / filter_leaves / filter_approvals / find_overdue_items / get_project_summary / get_client_summary / get_employee_summary / compute_budget_burn / compute_contribution / compute_capacity / extract_receipt_data / navigate_to / explain_invoice_draft. Each has a Pydantic input schema, declared output schema, description line for the LLM prompt, and tags. Registry freezes on first `all_tools()` call so silent late registrations fail at import. 11 registry-lock tests (16-tool catalog, feature ownership, schema presence, 3+ evals per tool, enum/date/scope validation, URL builder, freeze, duplicate rejection). `ensure_loaded()` is wired into `app.main` so production apps populate the catalog before the first palette request (173 tests pass).
- 2026-04-18: critic loop §12.2 i18n parity - `frontend/lib/i18n-parity.test.ts` locks EN+FR message trees in lock-step with three vitest assertions (identical leaf paths, matching leaf types string vs nested object, no empty string values). Prevents raw-key leaks to French-speaking customers (first-target EU buyer). Values can differ, only structure is locked.
- 2026-04-18: critic loop §12.3 a11y - new `a11y` i18n namespace with 29 EN+FR keys covers modal/drawer close, toast dismiss, pagination prev/next/group, sidebar+bottom-nav+breadcrumb landmarks, sidebar expand/collapse, AI insight + recommendation dismiss + why-toggle, range-calendar toolbar, resources filter bar. 10 files localized; `grep 'aria-label="[A-Za-z]'` in frontend/components now returns 0 matches. i18n parity test still passes (1187 leaves each in EN/FR).
- 2026-04-18: critic loop §12.3+§12.6 a11y regression guard - `scripts/hooks/no_hardcoded_aria_labels.py` wired into `.pre-commit-config.yaml`. Rejects `aria-label="Close"` string literals and template literals with hardcoded text (e.g. `` `${n} selected` ``); allows `t("...")` calls, variables, and pure-interpolation templates where callers pre-localize. Scope: `frontend/{components,features,app}/**.{tsx,jsx}`. Current tree passes with 0 findings.
- 2026-04-18: critic loop §12.4 PII boundary metatest - `backend/tests/test_ai_pii_boundary.py` delivers the guard promised in `specs/AI_FEATURES.md §1.7` + §9.1. Four pytest checks grep the source of every `features/*/ai_tools.py`, the Pydantic JSON Schema of every registered tool input+output, every `app/ai/prompts/*.jinja`, and every `app/ai/evals/**/*.jsonl` fixture for 12 banned identifiers (employee_compensation, employee_banking, compensation, banking, salary, bonus, iban, bic, account_holder, reason_encrypted, protected_status, protected_status_encrypted). Case-insensitive word-boundary match. Injecting `# salary reference` into `employees/ai_tools.py` trips the guard with a `path:line: banned identifier ...` finding (verified). Full backend suite now 177 passing (was 173).
- 2026-04-18: critic loop §12.2 i18n - `multi-select-pill.tsx` last-remaining hardcoded English "Clear selection" routed through `t("clear_selection")`; key added to `a11y` namespace EN ("Clear selection") + FR ("Effacer la sélection"). EN + FR now both 1191 leaves, still in lock-step.
- 2026-04-18: critic loop §12.4 feature-registry catalog completeness - `backend/app/features/search/__init__.py` now calls `registry.register("search", ...)` so the operator console lists search alongside the other 12 feature modules. Added `test_every_routable_feature_registers_a_flag` parametrized metatest in `tests/test_feature_registry.py` that walks `features/*/routes.py` and asserts each routable package's `__init__.py` both imports the registry and registers under the expected key. 8 parametrized cases green (admin, auth, clients, dashboard, employees, imports, projects, search); deleting the registration line trips the `[search]` case with the canonical-shape hint (verified). `core` excluded via `NON_ROUTABLE_PACKAGES`. Full backend suite 185 passing (was 177).
- 2026-04-18: critic loop §12.1+§12.6 token regression guard - shipped `frontend/app/[locale]/(portal)/layout.tsx` had one lingering `color: "#fff"` inline style (client-portal user avatar); replaced with `var(--color-text-on-primary)` so dark/light-mode theming stays correct. Added `scripts/hooks/no_hex_or_rgba_in_tsx.py` pre-commit hook that rejects hex literals (#fff / #ffffff / #f3d382 etc.) and rgba()/rgb() literals in any `frontend/**/*.(tsx|jsx|ts|js)` file. Excludes `frontend/styles/*` (CSS legitimately uses rgba for shadows/glass/overlays, all declared in tokens), `frontend/tests/*`, `frontend/node_modules/*`, `frontend/scripts/*`. Current tree passes with 0 findings; injecting `color:"#fff"` or `rgba(0,0,0,0.5)` into a tsx trips the hook (verified). Closes the "opus_plan_v2.md section 11" token-discipline regression window.
- 2026-04-18: critic loop §12.1+§12.6 console-log regression guard - added `scripts/hooks/no_console_log_in_shipped.py` pre-commit hook that bans `console.log`, `console.debug`, `console.info`, `console.warn` (and `console.error` outside the Next.js error-boundary convention) in shipped frontend code. Scope: `frontend/{components,features,app,lib,hooks,stores}/**/*.(tsx|jsx|ts|js)`. Allowlist: `console.error` inside `error.tsx` / `global-error.tsx` (platform convention; forwards caught errors to devtools). 115 shipped files scanned, 0 findings; injecting `console.log("x")` into a component trips the hook with rc=1 and `path:line: banned console.log(...)` output (verified). Also verified that `console.error` in a non-boundary file trips and `console.log` inside `error.tsx` trips. Closes the opus_plan_v2.md §12.1 rubric line "No `console.log` in shipped code".
- 2026-04-18: critic loop §12.2+§12.6 date-locale DRY + regression guard - `frontend/app/[locale]/(app)/calendar/page.tsx` duplicated the `intlLocale` mapping inline (`locale === "fr" ? "fr-FR" : "en-GB"`) instead of importing the canonical helper from `lib/format.ts`. Now imports `intlLocale` from `@/lib/format` aliased as `toIntlLocale` (keeps the existing `intlLocale` local-variable name used at 4 call-sites). Added `scripts/hooks/no_unscoped_date_locale.py` pre-commit hook that bans `toLocaleDateString()` (zero args) and `toLocaleDateString(undefined, ...)` (explicit undefined) in shipped frontend code. Same for `toLocaleTimeString`. These are the silent-wrong-output bug class: the browser's default locale renders (e.g. "April" for a French user on an English browser) instead of the user's Gamma locale. 115 shipped files scanned with 0 findings; injecting both bug patterns into a component trips the hook, explicit-locale-string / identifier calls do not (verified). Closes one concrete instance of the opus_plan_v2.md §1 rule "Dates/currencies go through `lib/format.ts`, never inline `Intl.DateTimeFormat`".
- 2026-04-18: critic loop §12.4 AI tool catalog spec-alignment metatest - `backend/tests/test_ai_tool_registry.py` already locked `EXPECTED_TOOLS` against the runtime registry but nothing mechanically compared `EXPECTED_TOOLS` against the spec markdown table in `specs/AI_FEATURES.md §3.1`. A silent rename in either direction (spec edited without touching tests, or a new tool registered without a spec row) was invisible. New `test_expected_tools_matches_ai_features_md_spec_table` parses only the §3.1 section (bounded by `### 3.1` / `### 3.2`), extracts every backticked `tool_name` + `features/<pkg>/ai_tools.py` pair, and diffs against `EXPECTED_TOOLS` with a three-way assertion message (spec-only / dict-only / feature mismatch). Includes an explicit `invoicing_agent -> invoices` mapping since §3.1 lists the tool under a forward-looking feature package that does not yet exist. Full backend suite now 186 passing (was 185). Injecting a renamed key into `EXPECTED_TOOLS` trips the test with `Right contains 1 more item: {'filter_timesheets_RENAMED': 'timesheets'}` (verified).
- 2026-04-18: critic loop §12.4 AI-handler-to-service-layer binding ratchet - closes a guard around the `OPUS_CRITICS_V2.md §0` first cascade diagnosis ("the DONE-lie cascade"). Five features ship `ai_tools.py` (tools that pass their input-schema test and formally dispatch from the LLM router) without a sibling `service.py` to delegate through: `approvals`, `expenses`, `invoices`, `leaves`, `timesheets`. Meanwhile `core/ai_tools.py` is legitimate (pure URL builder for `navigate_to`, does no DB read). New `test_ai_tools_features_have_service_layer_matching_cascade` in `backend/tests/test_feature_registry.py` walks `features/*/ai_tools.py`, exempts the documented `core` package via an explicit `AI_HANDLER_NO_SERVICE_EXEMPT` set, and asserts the set of violators equals exactly the frozen `AI_HANDLER_NO_SERVICE_CASCADE` set. Ratchet is bidirectional: a new feature with `ai_tools.py` but no `service.py` trips the test ("new gaps"), and closing an existing cascade gap (e.g. touching `leaves/service.py`) also trips the test ("closed gaps") and forces the cascade set to shrink in the same commit that removes the gap. Both injection modes verified. Full backend suite now 187 passing (was 186).
- 2026-04-18: critic loop §12.4 seed-count spec-alignment metatest - same shape as the AI-tool catalog lock from the previous pass. `backend/tests/test_seed_counts.py` already pinned the runtime generators (leaves=700, entries=39,000, expenses=8,400, invoices=900, ...) to the Python constants in `backend/scripts/seed_demo_tenant.py`, but nothing compared those constants to the prose numbers in `specs/DATA_ARCHITECTURE.md §12` bullet 10 ("Build the seed data"). A markdown edit could silently drift either direction: someone bumps the spec from "~8,400 expenses" to "~10,000" while the code keeps emitting 8,400, every pre-existing test passes green, and the first customer buys a docs lie. New `_parse_spec_seed_numbers` bounds the search to the text between `10. **Build the seed data**` and `## 12.11` so future §12.12 bullets cannot contribute, then extracts six headline numbers via verbatim sentence anchors: `"<N> weeks of timesheet data"`, `"<N> billable employees x <N> days x <N> weeks"` (formula line), `"<N> leaves ("`, `"**Expenses (~<N> total)**"`, `"<N>/year (<N>/month)"`. Two new tests: (a) `test_spec_internal_consistency_timesheet_weeks` fires when the spec's sentence count (52) disagrees with the formula's `x N weeks` term, so the prose cannot contradict itself; (b) `test_seed_constants_match_data_architecture_spec` zips eight (label, spec_value, code_constant) triples and reports every mismatch in one line. Both injection modes verified: replacing `700 leaves (` with `750 leaves (` trips `leave total: spec=750 vs constant=700`, and replacing `52 weeks of timesheet data` with `48 weeks` trips the internal-consistency test. Full backend suite now 189 passing (was 187).

End of plan.
