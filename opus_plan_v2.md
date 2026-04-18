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

End of plan.
