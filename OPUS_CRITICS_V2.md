# OPUS_CRITICS_V2.md

> **SUPERSEDED for gating purposes (2026-04-18).** The §18 "OPUS-V2 bar" (items 58-70) was merged into `docs/FLAWLESS_GATE.md` under `docs/decisions/ADR-012-unified-quality-gate.md`. The unified 70-item gate is now the single authoritative bar. This file is retained as an audit-findings record; its prose still documents *why* the delta items exist, but the items inside §18 are no longer a standalone gate.
>
> **Do not self-certify against this file.** Run the unified gate in `docs/FLAWLESS_GATE.md`.

> Second-pass deep-dive audit of GammaHR v2, conducted 2026-04-18, one day after `OPUS_CRITICS.md`. Six specialized critic agents (frontend, backend, specs/docs consistency, mock data + seed, prototype fidelity, plus a COO/CFO teardown reading the specs as a 200-person consulting buyer) opened every reachable file in `frontend/`, `backend/`, `specs/`, `docs/`, `prototype/`, `agents/`, `scripts/`, `infra/`. Cross-checked every finding against `CLAUDE.md`, `THE_PLAN.md`, `EXECUTION_CHECKLIST.md`, `FOUNDER_CHECKLIST.md`, `OPUS_CRITICS.md`, `HAIKU_CRITICS.md`, `opus_plan.md`, all 75 `DEF-NNN` deferrals, every ADR, `MODULARITY.md`, `TESTING_STRATEGY.md`, `FLAWLESS_GATE.md`, `DEGRADED_MODE.md`, `ROLLBACK_RUNBOOK.md`, `COMPLIANCE.md`, `GO_TO_MARKET.md`, `SCOPE.md`, `MOBILE_STRATEGY.md`, `AI_FEATURES.md`, `DATA_ARCHITECTURE.md`, `APP_BLUEPRINT.md`, `DESIGN_SYSTEM.md`.
>
> **Voice:** four senior critics in one document plus a cynical European COO/CFO. The kind of review a Series A lead does at hour 6 of due diligence with the term sheet drafted but not yet signed.
>
> **Methodology delta vs V1:** V1 audited at HEAD `2c149ce`. V2 audits at HEAD post-`518900f` (5 commits later: onboarding rewrite, imports commit endpoint, demo seed, M3 lint, auth persistence). V2 also adds three audit lanes V1 did not run: spec internal-consistency, mock-data + seed pipeline reality, prototype-to-frontend visual fidelity. The COO/CFO lane is also new.

---

## 0. Read this before reading anything else

V1 said "the gap between what was promised and what shipped is so wide that it is not a polish problem; it is a category error in how DONE was defined." V2 confirms that diagnosis and adds three new ones:

1. **The architecture is now lying to itself.** ADR-001 mandates schema-per-tenant. The Phase 4 migration `backend/migrations/versions/20260416_1000_phase4_core_data.py` lines 10-22 explicitly puts business tables in `public` with `tenant_id` columns and admits the deviation in its docstring. The very pattern ADR-001 §Alternatives rejected ("Row-level tenancy. Rejected. One missed `WHERE` leaks everything") is what shipped. No ADR amendment was filed. The glossary term "schema-per-tenant" is now a label that does not describe the database.

2. **The AI vendor is wrong.** `CLAUDE.md §1` and `specs/AI_FEATURES.md §0` lock Vertex AI Gemini 2.5 Flash (EU-resident). `backend/app/ai/client.py` ships `MockAIClient` plus `OllamaAIClient` (Gemma3 self-hosted). `VertexGeminiClient` is deferred to "§16 Deploy Track" in the docstring. `OllamaAIClient` is shadow architecture present in zero specs and zero ADRs. The data-residency story sold to RGPD-bound customers is not implemented.

3. **The seed script kills the demo on day 1.** `backend/scripts/seed_demo_tenant.py` lines 8 and 341-344 both confess: timesheets, leave requests, expenses, invoices, audit log, notifications, and any admin user are all deferred. Six of thirteen Tier 1 pages go dead the moment the frontend stops shadow-loading from `frontend/lib/mock-data.ts`. Step 1 of the 13-step MVP acceptance test (`EXECUTION_CHECKLIST.md §6.2`) fails before sign-in because no admin user is seeded.

The V1 root cause ("the build agent self-certified phases as DONE without running the 10-step quality chain") is unchanged. The PROMPT.md rewrite installed `senior-ui-critic` and `senior-ux-critic` subagents as mandatory pre-commit gates. They have not yet been invoked on a single commit. The 5 commits between `2c149ce` and HEAD (onboarding rewrite, imports commit, seed_demo_tenant, M3 lint, auth persistence fix) all bypassed both critics. The structural fix from V1 was implemented as policy and ignored as practice.

### Severity codes (unchanged from V1)
- **[BLOCK]** demo-blocking, must be fixed before merge.
- **[GATE]** must be fixed before founder review.
- **[POLISH]** must be fixed before public launch; acceptable to ship to a friendly pilot with this red.
- **[COMPLIANCE]** legal/regulatory exposure; fix before any data lands in production.

### The single number that frames everything

**€70,260.** That is the canonical 201-seat-tenant ACV at the 10/12 annual prepay (`docs/GO_TO_MARKET.md` line 60). Three years grandfathered = €210,780. The COO/CFO of the canonical buyer audited the v1.0 spec at that price and refused for five concrete reasons (§15 below). One of the reasons is that **0 of the 4 promised AI surfaces and 1 of the 16 promised AI tools are actually built today**, while the COO is being asked to pay for "the AI operations analyst your firm cannot afford to hire" (`docs/GO_TO_MARKET.md §1`).

---

## 1. Executive verdict + delta vs V1

V1 verdict: "The plan is brilliant. The architecture is locked. The execution did not deliver on any of it." V2 verdict: **same diagnosis, less excuse**. V1 said "do not blame the agent, blame the prompt." V2 cannot say that anymore: the prompt was rewritten, the critics were installed, and the next 5 commits skipped them anyway.

### What got better since V1 (small but real)
- `TenancyMiddleware._extract_from_jwt` is wired correctly (`backend/app/core/tenancy.py` lines 78-109). V1 flagged this as the Phase 2 carryover blocker; that bug is fixed.
- Auth session persistence Zustand hydration flag is in place (commit `1297a19`). Real fix, real bug.
- `imports/commit` endpoint exists with bulk-create delegation through service layers. Exemplary M3 compliance (`backend/app/features/imports/service.py` lines 23-30).
- Cross-feature model-import lint is wired into pre-commit (commit `f3b9360`).
- A `seed_demo_tenant.py` script now exists and seeds 201 employees + 120 clients + 260 projects with HSBC UK GBP-billing client (`backend/fixtures/demo/clients.csv` line 2).
- Onboarding page rewritten to wire the commit mutation, with i18n, a11y, AI explanation, skeleton, and error boundary (commit `518900f`). Closest the repo has come to OPUS-DONE on a single page.
- `lib/format.ts` is the canonical formatter with NBSP currency and locale-aware dates; consumed by 7 pages.
- `useUndoableAction` hook with 5s undo + idempotency UUID exists and is imported by approvals/leaves/expenses/invoices.
- `EN/FR` line counts identical at 665. Banned-word grep across the entire frontend is clean: 0 matches for "utilisation"/"utilization", 1 matches for em dash (a JSDoc comment in `frontend/components/patterns/multi-select-pill.tsx` line 25 - still a CLAUDE.md rule 5 violation).
- `tsc --noEmit` exits clean.

### What got worse or stayed broken
- The **DONE-lie cascade** is intact: `EXECUTION_CHECKLIST.md §6.2-6.3` still marks 10 features as "(2026-04-16, frontend done)". V2 confirms the backend folders for 5 of those features (`timesheets/`, `invoices/`, `expenses/`, `leaves/`, `approvals/`) contain only `__init__.py` and `__pycache__`. The check marks were not corrected. `THE_PLAN.md` Phase status now propagates the false claim into roadmap planning.
- Schema-per-tenant violation (§0 above): added in this period.
- Wrong AI vendor (§0 above): not corrected.
- Seed script ships at 30% of `DATA_ARCHITECTURE.md §12.10` and is documented as "Phase 5a" in its own footer.
- 5+ new patterns/atoms added since Phase 2 lock (`ai-recommendations.tsx`, `multi-select-pill.tsx`, `resources-filter-bar.tsx`, `timeline-window-selector.tsx`, `range-calendar.tsx`, `theme-toggle.tsx`) without ADR. CLAUDE.md §2 rule 4 explicitly forbids this without founder approval.
- Two competing quality gates: 15-item `FLAWLESS_GATE.md` (mirrored in `CLAUDE.md §7`) vs 57-item `OPUS_CRITICS.md §12`. No doc says which is operative. The next agent will pick whichever is more lenient.

---

## 2. The DONE-lie audit, refreshed

`EXECUTION_CHECKLIST.md §6.2-6.3` claims the following frontend features as `[x] (2026-04-16, frontend done)`. V2 audits them against actual code at HEAD:

| Feature | V1 verdict | V2 verdict (delta) | Backend reality |
|---|---|---|---|
| Timesheets | DONE-LIE | **DONE-LIE confirmed.** `features/timesheets/use-timesheets.ts:99` uses `console.log("[useSubmitTimesheet] submitted week:", ...)` instead of POST. `lib/offline.ts` is still a 32-LOC stub. No autosave, no pre-fill, no offline queue. | `backend/app/features/timesheets/` contains `__init__.py` only; no `routes.py`, no `models.py`, no `service.py`. **Empty folder.** |
| Invoices list + detail | DONE-LIE | **DONE-LIE confirmed.** List uses `useUrlListState` (good). Detail uses `useUndoableAction` for status changes. PDF download is a `useUndoableAction`-wrapped no-op. Hardcoded `CLIENT_NAMES` map at `app/[locale]/(app)/invoices/page.tsx:66-71`. | `backend/app/features/invoices/` empty. **No invoice line generation algorithm. No FX lock. No sequential numbering. No FR legal fields. No WeasyPrint swap.** |
| Expenses | DONE-LIE | **DONE-LIE confirmed.** OCR drag-drop fires a 1.8s local timer (`expenses/page.tsx` lines 721-723). `MockVisionOCR` from `app/ocr/vision.py` is registered as a wrapper but never called. | `backend/app/features/expenses/` empty. |
| Dashboard 1.5 | DONE-LIE | **DONE-LIE confirmed and worsened.** `features/dashboard/kpi-strip.tsx:33-70` ships static `"38" / "12" / "450" / "3"` despite `useDashboardKpis()` being defined in `features/dashboard/use-kpis.ts`. The hook exists and is called by no consumer. | Backend `dashboard` route returns stub. |
| Approvals | DONE-LIE | **PARTIALLY corrected.** Now wires `useUndoableAction` for approve/reject with 5s undo + idempotency UUID. Card-level setTimeout spinners removed. **But** mutations are still local-only against mock data; no backend route exists. | `backend/app/features/approvals/` empty. |
| Leaves | DONE-LIE | **PARTIALLY corrected.** RangeCalendar pattern landed; inline composer replaces drawer; `useUndoableAction` wires cancel with status restore on undo. **But** all leaves in mock data are 2025-MM-DD (`mock-data.ts:692`); zero future leaves visible from current date 2026-04-18. | `backend/app/features/leaves/` has `rules/` subfolder only. No models. No accrual engine. No `reason_encrypted` column. No holiday awareness despite `country_holidays` migration existing. |
| Admin | PARTIAL DONE | Same. 990 LOC, the most complete UI. Local mock state only. | `admin/routes.py` exists with stub routes. |
| Account | PARTIAL DONE | Same. 444 LOC. Hardcoded `#fff` at line 240 (token `--color-white` exists). | No `account/` module in backend. |
| Dashboard pass 2 | DONE-LIE | **DONE-LIE confirmed.** Same component as 1.5. | n/a |
| Calendar (Tier 2) | DONE at Tier 2 bar | Same. Hardcoded April 2026 events. Hardcoded `#fff` at line 520, `rgba(...)` at line 922. | n/a |
| Client portal invoices | DONE-LIE | **Worsened.** `(portal)` route group now exists in the frontend (`app/[locale]/(portal)/portal/invoices/page.tsx`), with two `console.log` calls at lines 93 and 349. Per `THE_PLAN.md` line 233 portal was deferred to Phase 6. Building it ahead of order while Tier 1 backend folders are empty is scope creep against the anti-scope rule. | No portal user table. No portal JWT audience verified. |
| Month-end close agent | NOT BUILT | **NOT BUILT.** Zero code, zero stub, zero analyzer, zero Gemini ranking. The single feature the entire €70,260 positioning depends on does not exist. | n/a |
| Onboarding | not in V1 list | **CLOSEST to OPUS-DONE.** Rewrite landed (commit `518900f`) with commit mutation, i18n, a11y, AI explanation, skeleton, ErrorBoundary. Still no critic-subagent gate ran on the commit. | `imports/` module is real and has a tested commit pipeline. |

### What the refresh reveals

V1 said the build agent treated "the page renders without TypeScript errors and has interactive UI controls" as the definition of done. V2 confirms that every commit in the V1→V2 window produced new visible UI without writing tests, without running critic subagents, without correcting the EXECUTION_CHECKLIST check marks, and without filing an ADR for any of the new patterns/atoms introduced. The PROMPT.md teeth installed in V1 were not bitten down on.

---

## 3. The five feel qualities, re-measured

### 3.1 Calm - still FAIL, slightly improved

- [GATE] Dashboard density unchanged from V1.
- [GATE] Invoice list 8-column scan is unchanged.
- [GATE] Employees list mixes 8 columns; no primary visual hierarchy.
- [POLISH] One accent color still doing five jobs.
- [POLISH] Inline `style={{...}}` spans 40 files. Tokens are referenced via CSS variables but the layer leak is wide; design tokens vs ad-hoc layout in the same file is fragile.

### 3.2 Ease - still FAIL, partially improved

- [BLOCK] Cmd+K palette: `frontend/components/shell/command-palette.tsx` is 467 LOC and handles navigation + entity search. **None of the 16 LLM-as-router tools (`filter_timesheets`, `compute_capacity`, etc.) are implemented.** Only nav and entity search.
- [BLOCK] Topbar global non-AI search: still missing. `topbar.tsx` has a search button that opens the palette, not an input. `OPUS_CRITICS.md §4.6` mandates both a palette AND a topbar input as the AI-off degraded-mode fallback.
- [BLOCK] Dead entity links: `OPUS_CRITICS.md §4.1` listed 20 instances. V2 confirms all 20 still red. Manager names, project tags, submitter avatars, line items, KPI deltas - none navigate.
- [GATE] Dashboard KPI cards: still inert (numbers are hardcoded; clicking anywhere goes nowhere).
- [GATE] Filter URL persistence: `hooks/use-url-list-state.ts` exists and is excellent. Used by **2 of 9** list pages (expenses, invoices). Employees, clients, projects, leaves, approvals, timesheets, admin still use local React state only. Cannot share a filtered view, cannot bookmark, browser back loses filter.
- [GATE] No empty state on any page leads to the "next obvious action" CTA.

### 3.3 Completeness - still FAIL

- [BLOCK] Loading state on dashboard: `Skeleton` atom exists; consumed inconsistently. Every card type renders a skeleton, but the skeletons are not pixel-shaped after the loaded layout, so the page jumps on data arrival.
- [BLOCK] Error state on dashboard: still nonexistent. `axios` 500 → blank.
- [BLOCK] Empty state on Timesheets: still no "Create week of <next Monday>" CTA.
- [BLOCK] Receipt OCR post-upload state: still silent magic auto-fill. No "Reading receipt... 1.8s" → "Detected: ..." transition.
- [BLOCK] ConflictResolver pattern: built (`components/patterns/conflict-resolver.tsx` 253 LOC, mounted via `conflict-resolver-provider.tsx` in `app-shell.tsx:51`, has a unit test) - but **no feature actually fires a 409**, so the resolver has never run in production paths.
- [GATE] No degraded-mode banner anywhere.
- [GATE] Pagination atom (`components/ui/pagination.tsx`) exists; **no list page imports it**. All 201 employees, 100 invoices, ~150 expenses render at once.
- [GATE] Breadcrumb atom exists (`components/ui/breadcrumb.tsx`) and is consumed only in `(app)/design-system/page.tsx`. Zero detail pages use it.

### 3.4 Anticipation - still FAIL

- [BLOCK] Timesheet pre-fill from last week: missing.
- [BLOCK] Expense form pre-fill currency from tenant base: missing.
- [BLOCK] Approvals pre-sort oldest-first: not enforced.
- [BLOCK] Insight cards: 24-analyzer library does not exist (`AI_FEATURES.md §6.1a`).
- [BLOCK] Month-end close agent: does not exist.
- [GATE] Onboarding wizard now has a real AI column-mapper tool (`backend/app/features/imports/ai_tools.py`). One of 16 implemented.

### 3.5 Consistency - mixed

- [GATE] Table row heights still drift across pages (V1 verdict unchanged).
- [GATE] Filter bar shape: `ResourcesFilterBar` is now used by employees + clients + projects + expenses + invoices + leaves. Real progress; previous `FilterBar` deleted. Approvals + timesheets still divergent.
- [GATE] Modal dimensions: still drift.
- [GATE] Date format: `lib/format.ts` is canonical; `features/dashboard/insight-banner.tsx:7` still uses inline `Intl.DateTimeFormat`. Not yet uniform.
- [POLISH] Hardcoded `#fff` / `rgba()` in `account/page.tsx:240`, `calendar/page.tsx:520,922`, `(portal)/layout.tsx:86`. Token `--color-white` exists.

---

## 4. Polish & visual craft

### 4.1 Typography rhythm
- [GATE] No `font-feature-settings: "tnum"` global rule. Monetary columns jitter horizontally.
- [GATE] KPI hierarchy: number, label, delta still at similar weight.
- [POLISH] Status badges still sentence case (acceptable; not in current spec).
- [POLISH] Currency NBSP fix done globally in `lib/format.ts`. PASS for consumers; some non-consumers (insight-banner) drift.

### 4.2 Surface ladder unused
- [GATE] Dashboard cards: still surface-2 directly against surface-0.
- [GATE] Modals: `bg-black/50` overlay; no surface-3 + backdrop-blur.
- [GATE] Hover states on rows: most rows still have none.

### 4.3 Iconography discipline
- [GATE] Stroke widths drift: lucide-react default 2px; some pages use `strokeWidth={1.5}`. No wrapper enforces.
- [GATE] Icon sizes drift across 12/14/16/18/20/24.
- [POLISH] Icon-only button aria-labels missing on some buttons.

### 4.4 Microinteractions
- [GATE] Buttons no `:active` state.
- [GATE] Rows no `:hover` state on most pages; cursor does not change to pointer on clickable rows.
- [GATE] Modal open instant (no 200ms fade).

### 4.5 Dark mode contrast audit
- [GATE] No automated WCAG AA contrast check on contrast pairs.
- [GATE] Focus ring sometimes disappears against surface-2.

### 4.6 New finding from prototype-fidelity audit
- [GATE] **`--sidebar-wide: 256px` token missing in `frontend/styles/tokens.css`** but present in `prototype/_tokens.css` line 187. The wide-mode override at `@media min-width 1440px` was removed from `frontend/styles/layout.css` per the recent token cleanup. If the spec requires the wide variant, the frontend cannot honor it.
- [GATE] **Google Fonts `@import` for Inter, JetBrains Mono, Fraunces** is present in the prototype but absent from frontend tokens. Verify `next/font` loads them in `app/[locale]/layout.tsx`; if not, typography rhythm silently falls back to system fonts.
- [GATE] **`/invoices/month-end` route does not exist** in `app/[locale]/(app)/invoices/`. The `AIInvoiceExplanation` atom (`components/ui/ai-invoice-explanation.tsx`) exists solely to serve that route per `DESIGN_SYSTEM.md §5.10`. Atom shipped without consumer.
- [GATE] **No `components/charts/` Visx wrapper folder exists.** Any chart-bearing page (insights, project margin, capacity heatmap) cannot land.
- [GATE] **`ai-insight-card` and `ai-invoice-explanation` are misfiled under `components/ui/`** (atom layer) instead of `components/patterns/`. They are domain-specific compositions, not atoms.

---

## 5. IA & interconnection (URL state, dead links, breadcrumbs)

V1 §4 declared the dead-link inventory the single biggest IA failure. V2 confirms all 20 entries still red.

### 5.1 New finding: URL state coverage matrix

| Page | Uses `useUrlListState`? | Filter persists? | Sort persists? | Pagination persists? |
|---|---|---|---|---|
| employees | NO | no | no | no pagination at all |
| clients | NO | no | no | none |
| projects | NO | no | no | none |
| timesheets | n/a | n/a | n/a | none |
| leaves | NO | no | no | none |
| expenses | YES | yes | partial | none |
| approvals | NO | no | no | none |
| invoices | YES | yes | partial | none |
| admin | NO | no | no | none |

`useUrlListState` is well-built. Coverage is 2/9 list pages.

### 5.2 New finding: 6 of the 13 Tier 1 pages will go dead the moment the frontend stops shadow-loading mock data

Per the seed-pipeline audit (§13 below), the seed script does not yet insert timesheets, leaves, expenses, invoices, audit log, or notifications. When the frontend hooks switch from `import { X } from "@/lib/mock-data"` to real API calls, the following pages break:

- Timesheets: empty week every time
- Invoices list/detail: zero rows; KPI strip = 0; no detail ID to navigate to
- Expenses: zero rows; no receipt asset for OCR
- Leaves: zero rows; calendar empty
- Approvals: nothing to approve
- Dashboard: KPI strip mostly zeros except employees/clients/projects

Six of thirteen pages dead on the first real-API switch. **[BLOCK]**

---

## 6. Trust signals, error recovery, conflict, audit

### 6.1 Optimistic mutations + rollback
- [BLOCK] V1 said "no mutation in the codebase uses `useOptimisticMutation`." V2 corrects: `lib/optimistic.ts` is a 191 LOC well-built three-layer 409 resolver that **no feature actually invokes on a mutation that hits a real backend**. Status unchanged at the contract level.
- [BLOCK] ConflictResolver: defined, mounted, never fires.

### 6.2 Idempotency
- [GATE] Frontend now generates idempotency keys via `useUndoableAction` (UUID v4 fallback at `lib/use-undoable-action.ts:53`). [POLISH] timer at line 86 never clears on unmount; race risk if user navigates within 5s.
- [BLOCK] Backend never reads `Idempotency-Key` header. `imports/schemas.py:47` declares the field on a Pydantic model; no route consumes it. POST `/api/v1/imports/commit` will double-import on retry.

### 6.3 Inline validation
- [GATE] Forms still HTML5 + placeholder-as-label.

### 6.4 Undo windows
- [GATE] V1 said missing. **V2 corrects:** `useUndoableAction` is now wired into approvals/leaves/expenses/invoices. Toast atom extended to support action button + duration. EN/FR `common.undo` keys added. **But** undo only reverses local state - no real backend mutation exists to commit or roll back at the 5s mark.

### 6.5 Audit visibility
- [BLOCK] No "Activity" tab on any detail page.
- [BLOCK][COMPLIANCE] `@audited` decorator defined at `backend/app/core/audit.py:62`. Applied to **zero** feature routes. Every mutating route in admin, auth, imports carries `# z2-lint: ok -- TODO Phase ...` deferral comments. The append-only audit_log trigger exists; the writer side is blank. Flawless-gate item 9 ("every mutation is audited") is failing.
- [BLOCK][COMPLIANCE] `@gated_feature` decorator defined at `backend/app/core/rbac.py:46`. Applied to **zero** routes. Kill switches and entitlements unenforceable.

### 6.6 Observability + error boundaries
- [GATE → CORRECTED] V1 flagged no `<ErrorBoundary>` route wrap. V2 confirms it now wraps `(app)/layout.tsx` children. Real fix.
- [GATE] No frontend error tracking (Sentry deferred per `DEF-NNN`).
- [GATE] `console.log` in `(portal)/portal/invoices/page.tsx:93,349` and `features/timesheets/use-timesheets.ts:99`.

### 6.7 Network failure UX
- [GATE] No global retry banner.

### 6.8 Toast and aria-live
- [GATE] Toast component sets `role="status"` on success but no `role="alert"` for errors. `aria-live` not differentiated.

### 6.9 Compliance posture (NEW V2 emphasis)
- [COMPLIANCE BLOCK] No rate limiting active anywhere. `core/rate_limit.py:23` is `NullRateLimiter` and never imported. Auth login (`auth/routes.py:60`) has zero brute-force protection.
- [COMPLIANCE BLOCK] Confidential-tier tables missing entirely: `employee_compensation`, `employee_banking`, `leave_requests.reason_encrypted`, `employees.protected_status_encrypted`. Grep returns zero matches in `app/` and `migrations/`.
- [COMPLIANCE BLOCK] Retention sweep Celery job: not scheduled. `app/tasks/celery_app.py:16` is `include=[]` with comment "features append themselves as they are added." No feature has done so. No nightly 04:00 UTC analyzer cron either. **Celery is dressed up and inert.**
- [COMPLIANCE BLOCK] DSR endpoints absent.
- [COMPLIANCE BLOCK] DPA workflow is "founder emails PDF, customer signs and returns, founder files manually in Google Drive" (`DEF-036`).
- [COMPLIANCE BLOCK] Sub-processor change notification: manual email blast (`DEF-035`). RGPD Article 28 requires prior written notice mechanisms.

---

## 7. Mobile + PWA reality

### 7.1 Mobile audit
- [BLOCK] FLAWLESS_GATE item 2 ("no horizontal scroll at 320px") still unverified on a single page. No Playwright mobile project visible. No real-device test.
- [BLOCK] Touch targets unverified (44x44px minimum).
- [BLOCK] Form input height unverified at 48px on mobile.

### 7.2 OCR camera capture
- [BLOCK] `<input type="file" capture="environment">` still missing.

### 7.3 Offline timesheet queue
- [BLOCK] `lib/offline.ts` still 32 LOC stub (in-memory array, comment "Phase 5 fills in real IndexedDB").

### 7.4 PWA manifest
- [POLISH] Deferred to Phase 6.

---

## 8. Accessibility (WCAG 2.2 AA)

V1 listed 11 a11y items mostly red. V2 confirms most still red. Net new items:

- [GATE] `aria-current="page"` on active sidebar item: **NOW PRESENT** (`sidebar.tsx:161`). Fixed.
- [GATE] Modal focus trap: still absent.
- [GATE] Status changes (after approve/reject) not announced via `aria-live`.
- [GATE] Tab order on detail pages still does not match visual order.
- [GATE] Skip-to-content link: missing.
- [GATE] Hardcoded English strings remain in: `employees/[id]/page.tsx:42,48,53` ("Active"/"On leave"/"Inactive"), `approvals/page.tsx` `TYPE_LABEL` map (lines ~38-43). i18n key parity for these strings is therefore impossible.

---

## 9. Feature & data completeness

### 9.1 Per-feature gap matrix (refreshed)

#### Timesheets
- [B] Backend routes: missing (folder empty)
- [B] Week-as-entity state machine: missing
- [B] Optimistic mutation + 409 ConflictResolver: missing
- [B] Autosave: missing
- [B] Offline queue: stub only
- [B] Property tests for week invariants: zero
- [G] Pre-fill from last week: missing
- [G] Keyboard navigation: not implemented
- [G] Sub-day 1-hour minimum floor: not enforced

#### Invoices + Month-end close
- All 17 V1 items still red.
- [G NEW] Hardcoded `CLIENT_NAMES` map at `app/[locale]/(app)/invoices/page.tsx:66-71`. Frontend invents client names rather than reading from API.
- [G NEW] `Invoice.tax_rate = 0.20` for both EUR and GBP rows in mock data (`mock-data.ts:548`). EU consulting export to UK is reverse-charge 0%. Tax math shown to founder is wrong for HSBC. Per `DEF-007` multi-rate VAT is deferred; manual mock data should at least be correct.

#### Expenses
- All 11 V1 items still red.
- [G NEW] `Expense` type has no `receipt_url` / `receipt_image` field. The OCR demo has no asset to reveal at the post-upload state.

#### Approvals hub
- [B] Backend routes: missing.
- [B] Audit row written per action: cannot, no backend.
- [G → CORRECTED] 5-second undo with countdown toast: now wired via `useUndoableAction`.
- [G → CORRECTED] Idempotency keys: now generated client-side.
- [B] Bulk action contract: missing.
- [B] Reject-with-reason modal: button exists, modal not implemented.
- [G] Delegation UI: not built.

#### Leaves
- [B] Backend routes + accrual + types beyond "vacation": missing.
- [B] Backend folder has only `rules/` subfolder.
- [B] Calendar tab data-driven: now driven by `RangeCalendar` pattern with status-toned events, but mock data is 2025-only so the calendar is empty for current date 2026-04-18.

#### Admin / Account
- Same as V1.

#### Dashboard pass 1.5 + 2
- [B] KPI numbers from real `/api/v1/dashboard/kpis`: still hardcoded `"38"/"12"/"450"/"3"` at `kpi-strip.tsx:33-70`. The hook to read live data exists and is unused.

### 9.2 Mock data narrative gaps (refreshed)

Counts in `frontend/lib/mock-data.ts`:

| Entity | Mock count | Spec target (§12.10) | Coverage |
|---|---|---|---|
| Employees | 201 | 201 | 100% |
| Clients | 120 | 120 | 100% |
| Projects | 260 | 260 | 100% |
| Invoices | 100 | 900/yr | 11% |
| Expenses | 150 | 8,400/yr | 1.8% |
| Leaves | 100 | 700 | 14% |
| Audit log | 0 | continuous | 0% |
| AI insights | 0 | populated | 0% |
| Notifications | 0 | populated | 0% |
| Idempotency keys | 0 | populated | 0% |

Narrative drift findings:
- HSBC UK GBP-billing client: PRESENT (good). Only 1 GBP client; revenue YTD `300_000` is small relative to spec's "first customer's largest client".
- Bench employees (`work_time_pct = 0` while active): NOT DESIGNED. Only inactive/on-leave zero out.
- Over-allocated (>100%): work_time clamps at 94% (`mock-data.ts:230`). **Capacity timeline cannot demo over-allocation conflict** - the Revolut-like value moment.
- All leaves are 2025-MM-DD; zero future-dated leaves. Calendar empty from current date.
- Owner identity drift: frontend forces `Youssouf Kerzika`; backend CSV row 1 is `Timothée Marie` (`backend/fixtures/demo/employees.csv:2`). After API switch, the persisted memory ("Owner = Youssouf Kerzika") becomes wrong.
- Status enum mismatch: frontend `"active"|"inactive"|"on_leave"`; backend seed sets all to `"active"`. Status diversity vanishes after import.

### 9.3 Database table coverage

`DATA_ARCHITECTURE.md` mandates ~52 tables (28 public + 24 per-tenant). The 5 migrations actually written create ~13 tables. **Coverage = 25%.**

Missing for v1.0 ship:
- Every Tier 1 finance/time table: `timesheet_weeks`, `timesheet_entries`, `expenses`, `expense_lines`, `expense_attachments`, `invoices`, `invoice_lines`, `invoice_numbering_sequence`, `leave_requests`, `leave_balances`, `leave_types`, `approvals`, `approval_delegations`, `employee_rates`, `project_rates`, `project_milestones`.
- Operational public tables: `subscription_invoices`, `fx_rates`, `ai_events`, `idempotency_keys`, `entity_revisions`, `feature_flags`, `notifications`, `dpa_versions`, `feedback`, `import_checkpoints`, `tenant_entitlements`.
- Confidential-tier tables: `employee_compensation`, `employee_banking`, encrypted leave reasons, encrypted protected status.

---

## 10. AI surfaces (the €70k moats - currently 1/16)

### 10.1 Tool inventory
`AI_FEATURES.md §3.1` lists **16 named tools**. Implemented:

| Tool | Status |
|---|---|
| `onboarding_column_mapper` | EXISTS (`backend/app/features/imports/ai_tools.py`) |
| Other 15 (`filter_timesheets`, `filter_invoices`, `filter_expenses`, `filter_leaves`, `filter_approvals`, `get_project_summary`, `get_client_summary`, `get_employee_summary`, `compute_budget_burn`, `compute_contribution`, `compute_capacity`, `find_overdue_items`, `extract_receipt_data`, `navigate_to`, `explain_invoice_draft`) | NOT BUILT |

**Coverage = 6.25%.**

### 10.2 LLM-as-router enforcement
- [BLOCK] `OllamaAIClient.run_tool` (`client.py` lines 113-141) **ignores the `tools` argument**. Comment: "Gemma-family models do not support tool calling." Free-form `content` is returned. The architectural promise from `CLAUDE.md` glossary ("the model classifies user intent and dispatches to pre-registered deterministic tools, never performs free-form completion") is not enforced.

### 10.3 Budget enforcement + kill switch
- [BLOCK] `client.py:64-141` accepts `budget_tokens` but never compares to spent. No `tokens_in × $cost` accumulator. No call to `feature_registry.is_enabled("ai")` before dispatch. Per-tenant AI kill switch is impossible.
- [BLOCK] No cost telemetry. `app/monitoring/telemetry.py` is 29 LOC stdout wrapper.

### 10.4 Eval suite
- [BLOCK] `app/ai/evals/column_mapper/examples.jsonl` has **5 lines** for **1** of 4 AI surfaces. Spec target: 5 minimum per surface = 20+. The "blocks merge on regression" CI rule has nothing to bite on. **Coverage = 25% of one surface, 0% of the other three.**

### 10.5 Prompts
- [BLOCK] `app/ai/prompts/` is **empty**. No Jinja2 templates. The versioned-filename governance from CLAUDE.md is vacuous.

### 10.6 The four surfaces (recap)
- Cmd+K palette: 1/16 tools (`column_mapper`).
- Receipt OCR: not wired to any backend route. `MockVisionOCR` registered, never called.
- Insight cards: 24-analyzer library does not exist. No nightly 04:00 UTC Celery cron.
- Month-end close agent: zero code. Headline differentiator absent.

---

## 11. Backend & infrastructure (the spine)

### 11.1 Routes implemented vs needed
- 7 router groups mounted (auth, employees, clients, projects, dashboard-stub, admin-stubs, imports).
- Missing: timesheets, leaves, expenses, invoices, invoices/month-end, approvals, account, search, feedback, notifications inbox, insights, command-palette tool dispatch.

### 11.2 Tenancy
- [BLOCK][COMPLIANCE] Schema-per-tenant ADR-001 violated by Phase 4 migration. Single-schema with FK filtering chosen instead. The very pattern ADR-001 §Alternatives rejected.
- [GATE] `get_tenant_id` resolution does an extra DB round-trip per request to translate `schema_name → id`. Not cached. Should be JWT-claim-cached at pilot scale.
- [POLISH] `database.py:79` builds `SET LOCAL search_path` via f-string. Schema regex-validated upstream so safe today; future SQLi vector if regex weakened.

### 11.3 M1-M10 modularity
- M1 wrappers: PASS in shape, 0% in coverage. All real providers (Stripe, GCS, WeasyPrint, Vertex Gemini, Vision OCR) are `RuntimeError`-on-use.
- M2 self-contained features: vacuous because 5 of 12 feature folders are empty.
- M3 cross-feature `.models` import lint: NOW WIRED in pre-commit (commit `f3b9360`). [GATE → CORRECTED]
- M4 ON DELETE explicit: PASS for tables that exist. Orphan-row test absent.
- M5 event bus: present (`backend/app/events/bus.py`), zero subscribers.
- M7 reversible migrations: PASS for the 5 written.
- M8 API versioning: PASS.
- M9 module-level feature flags: PRESENT but never enforced (`@gated_feature` applied nowhere).
- M10 no utils.py / helpers.py / common.py: PASS.

### 11.4 Tests
- 20 test files in `backend/tests/` (flat, no unit/integration/property/e2e/contract subfolder split).
- **Zero E2E.** Spec target: 8 by Phase 5a. Frontend has 2; backend has 0.
- `test_property_invoice_math.py` exists but no invoice service exists for it to test against. Either tests Decimal arithmetic in the abstract or imports a missing module.
- No coverage gate enforced. The 85% unit / 100% financial-math target is unenforceable.

### 11.5 Audit + RBAC + idempotency
- [BLOCK][COMPLIANCE] All three decorators defined, applied nowhere. Three explicit deferral comments per `auth/routes.py`, `admin/routes.py`, `imports/routes.py`.
- [BLOCK] No `Idempotency-Key` header reading on any route despite the field appearing in `imports/schemas.py:47`.

### 11.6 Other infrastructure smells
- [POLISH] `main.py:67-74` exposes `docs_url`, `redoc_url`, `openapi_url` in all environments. Should be gated behind `app_env != "prod"`.
- [POLISH] `core/security.py:14` uses bcrypt without SHA-256 pre-hash for 72-byte input truncation handling.
- [POLISH] `core/config.py:36` has `jwt_secret_key` default in code with no startup assertion that prod overrode it.
- [POLISH] `audit.py:124` writes audit AFTER mutation commits; if audit table is down, mutation is committed silently un-audited. Should run inside same transaction or fail-closed for sensitive ops.
- [POLISH] `database.py:60-72` mixes commit-on-success-from-session-scope with explicit `await session.commit()` in route handlers. Pick one.
- [POLISH] `main.py:29-41` imports each feature module purely for registration side-effect with `# noqa: F401`. Stray formatter run could remove imports and silently disable features.

---

## 12. Specs & docs internal contradictions (NEW V2 SECTION)

The plan, the architecture, and the agent contracts disagree with each other in load-bearing places. Forward agents will read whichever doc they hit first and pick the lenient interpretation.

### 12.1 ADR-001 vs Phase 4 migration
- [BLOCK][COMPLIANCE] `ADR-001-tenancy.md §Decision`: schema-per-tenant `t_<slug>`. `migrations/versions/20260416_1000_phase4_core_data.py` lines 10-22: tables in `public` with `tenant_id` FK. The migration's docstring openly admits the deviation. **No ADR amendment filed.**

### 12.2 CLAUDE.md vs backend AI vendor
- [BLOCK] CLAUDE.md §1 + AI_FEATURES.md §0 lock Vertex AI Gemini 2.5 Flash. `backend/app/ai/client.py` ships MockAIClient + OllamaAIClient. VertexGeminiClient deferred to "§16 Deploy Track" by docstring fiat. **OllamaAIClient is shadow architecture mentioned in zero specs.**

### 12.3 Phase status: EXECUTION_CHECKLIST vs reality
- [BLOCK] EXECUTION_CHECKLIST.md §6.2-6.3 marks 10 features as "(2026-04-16, frontend done)". Backend folders for 5 of those features are empty. THE_PLAN.md propagates the false status into roadmap planning.

### 12.4 Two competing quality gates
- [GATE] CLAUDE.md §7 = 15-item gate, mirrors FLAWLESS_GATE.md. OPUS_CRITICS.md §12 = 57-item bar. CLAUDE.md §0 says "If something here conflicts with any other doc, this file wins" - therefore the 15-item gate is operative and OPUS bar is aspirational. But OPUS_CRITICS.md §0 self-asserts supremacy. **No doc reconciles them.** Pick one before the next agent self-certifies.

### 12.5 SCOPE.md anti-scope vs new patterns
- [GATE] SCOPE.md anti-scope forbids "new atoms / new patterns without ADR." Since Phase 2 lock, the following landed without ADR: `ai-recommendations.tsx`, `multi-select-pill.tsx`, `resources-filter-bar.tsx`, `timeline-window-selector.tsx`, `range-calendar.tsx`, `theme-toggle.tsx`, plus `(portal)` route group. Five new patterns + one new shell component + one ahead-of-schedule route group, zero ADRs.

### 12.6 Glossary drift
- [POLISH] `schema-per-tenant` is a glossary term that no longer describes the database (§12.1).
- [POLISH] CLAUDE.md uses week-N framing; EXECUTION_CHECKLIST.md uses calendar dates 2026-04-15/16. The two cannot be reconciled by a reader.
- [POLISH] CLAUDE.md glossary missing "production build" date anchor and "Phase 5a hard-stop" agent-control concept.

### 12.7 TESTING_STRATEGY.md sales claim is false today
- [BLOCK] TESTING_STRATEGY.md §3 claim "we run 45 end-to-end scenarios on every code change" - actual coverage 2/45 = 4.4%. **Quoting this to a CFO today would be misrepresentation.** Doc must be re-cast as roadmap, not present-tense.

---

## 13. Mock data + seed pipeline reality (NEW V2 SECTION)

### 13.1 What the seed actually inserts
`backend/scripts/seed_demo_tenant.py` is 355 LOC. It reads 3 of 4 fixture CSVs and writes to 4 tables.

| Entity | Spec §12.10 | Seed actual | Coverage |
|---|---|---|---|
| Employees | 201 | 201 | 100% |
| Clients | 120 | 120 | 100% |
| Projects | 260 | 260 | 100% |
| Team allocations | implicit | ~480-1280 deterministic | n/a |
| Teams | 12 | 0 (CSV exists, never read) | 0% |
| Timesheet weeks | ~10,400 | 0 | 0% |
| Leave requests | 700 | 0 | 0% |
| Expenses | ~8,400 | 0 | 0% |
| Invoices | 900 | 0 | 0% |
| Audit log | continuous | 0 | 0% |
| Admin user | ≥1 | 0 | 0% |

The seed script's own footer (lines 341-344) admits "Phase 5a will extend this script with timesheet_weeks, leave_requests, expenses, and invoices once those tables exist." Phase 5a is the active phase. **The script knows it is incomplete and so do its docs.**

### 13.2 13-step MVP acceptance test viability

| # | Step | Verdict | Evidence |
|---|---|---|---|
| 1 | Sign in as seeded admin | **FAIL** | No admin user is seeded. Step 1 fails before sign-in. |
| 2 | Upload 201-employee CSV via wizard <5 min | PARTIAL | Onboarding rewrite present but not E2E-tested. |
| 3 | See seeded rows | PASS (frontend-only) | Reads from mock-data.ts. |
| 4 | Log timesheet entries | **FAIL** | Backend folder empty; no rows seeded. |
| 5 | Manager approves timesheets | **FAIL** | Same. |
| 6 | Trigger month-end close | **FAIL** | Zero code. |
| 7 | See draft invoices with AI explanations | **FAIL** | No `ai_explanation` field on type. |
| 8 | Confirm invoice → WeasyPrint PDF | **FAIL** | No backend invoices; PDF not wired. |
| 9 | Dashboard KPIs reflect new numbers | PARTIAL | KPIs computed at module-import time, not reactive. |
| 10 | Submit expense with receipt; OCR auto-fill | **FAIL** | Expense type has no `receipt_url`. |
| 11 | Approve expense | PARTIAL | Status enum supports it; mutation hook is local. |
| 12 | 1440px + 320px + dark mode | PARTIAL | Outside data scope. |
| 13 | Zero horizontal scroll at 320px | PARTIAL | Same. |

**Score: 1 PASS / 5 PARTIAL / 7 FAIL.** Demo not runnable end-to-end today.

### 13.3 Specific bugs surfaced
- Owner identity drift: mock = Youssouf Kerzika; CSV = Timothée Marie.
- `Employee.status` enum mismatch: frontend has 3 states; seed sets all to `"active"`.
- Frontend `Client` has industry/team_size/revenue_ytd; CSV has only country_code/currency/contact/size_band. Client KPIs go blank after switch.
- Project shape: frontend expects `phase`; backend CSV has none. Phase coloring defaults.
- HSBC GBP invoices in mock charge 20% VAT instead of EU reverse-charge 0% (`mock-data.ts:548`).
- `Expense` type has no `receipt_url` field.
- `teams.csv` (12 rows) exists but is never read by the seed script.
- `make help` does not list `seed-demo-tenant`. Tenant prerequisite (`t_dev` must exist) is undocumented.
- No test pins seed quantities; a regression dropping 50 rows would not fail CI.

---

## 14. Prototype-to-frontend visual fidelity (NEW V2 SECTION)

### 14.1 Token sync
- [GATE] `--sidebar-wide: 256px` missing in `frontend/styles/tokens.css` (present in prototype line 187).
- [GATE] Google Fonts `@import` (Inter, JetBrains Mono, Fraunces) present in prototype, absent from frontend tokens. Verify `next/font` loads them in `app/[locale]/layout.tsx`; if not, typography rhythm silently falls back to system fonts.
- All other tokens (colors, surfaces, spacing, radii, shadows, weights, motion, sidebar 224/56) match byte-for-byte.

### 14.2 Atom inventory
Prototype `_components.css` declares ~207 class blocks. Frontend `components/ui/` has 28 atom files. **Mostly clean 1:N mapping.** No bare-invented atoms found.

Misfiled (atoms-vs-patterns layer leak):
- [GATE] `ai-insight-card.tsx` and `ai-invoice-explanation.tsx` are misfiled under `components/ui/`. They are domain-specific compositions, not atoms. Should live under `components/patterns/`.

### 14.3 Pattern coverage
- [OK] PortfolioTimeline triplet (employees/clients/projects) honors the locked §4.1 contract: same shell (AiRecommendations + PageHeader + TimelineWindowSelector + 3-KPI strip + ResourcesFilterBar + Timeline body). Three KPI components shipped.
- [GATE] `components/charts/` Visx wrapper folder does not exist. No chart-bearing page can land.
- [GATE] `/invoices/month-end` route does not exist; the `AIInvoiceExplanation` atom exists solely to serve it (DESIGN_SYSTEM.md §5.10).
- [GATE] Topbar has search + theme toggle + notifications + avatar but **no AI shell entrypoint**. Spec §3.3 + core principle 7 ("AI is a shell element, not a destination page") require one.

### 14.4 Prototype pages without frontend equivalents
- `prototype/auth.html` → no `(auth)/login` route group visible in `app/[locale]/`. Verify login lives somewhere.
- `prototype/hr.html`, `prototype/insights.html` → not built. Tier 2 per CLAUDE.md §5; acceptable but track in DEFERRED.
- `prototype/gantt.html`, `prototype/planning.html` → DELETED per memory (consolidated into PortfolioTimeline). Correct.

### 14.5 Frontend pages without prototype equivalents
- `(app)/onboarding`: justified - DATA_INGESTION + CSV onboarding flow per CLAUDE.md §5.
- `(app)/design-system`: justified internally; should be excluded from prod build.

---

## 15. COO/CFO teardown at €70,000/year (NEW V2 SECTION)

The cynical COO + CFO of a 200-person European consulting firm (Workday + Jira + Salesforce + Sage Intacct + DocuSign + heavy Excel) read THE_PLAN.md, APP_BLUEPRINT.md, DATA_ARCHITECTURE.md, AI_FEATURES.md, SCOPE.md, GO_TO_MARKET.md, DEFERRED_DECISIONS.md, MOBILE_STRATEGY.md, ADR-001..010 - and refused.

### 15.1 Pricing reality

€70,260 ACV (per `GO_TO_MARKET.md` line 60: 200 × €35 + 1 × €26, 10/12 annual prepay) is not a discount; it is the standard list price for the canonical 201-employee tenant. Three years grandfathered = €210,780.

Comparables for the same job:
- Lucca (FR market leader: Timmi + Cleemy + Pagga + Figgo): €19k - €34k/year for 201 seats.
- Spendesk (expenses alone): ~€10k/year.
- SAP Concur add-on against existing finance stack: ~€15k.
- Incumbent stack (already paid + depreciated): €0 incremental.

**The marginal pain Gamma fixes (Excel capacity + month-end close) is closer to a €25k/year problem.** Gamma is asking 14× the size of the actual pain.

### 15.2 The five reasons we refuse

#### Reason 1: Two-founder bus factor on a system we would feed time, expenses, invoices, and payroll
- **Objection:** THE_PLAN.md lines around the founder profile: "non-technical product owner, 20 h/week" + co-founder "20 to 30 h/week." Combined productive build time **24-34 hours/week**. That is a side project, not a vendor.
- **Switching cost reality:** Migrating 201 employees off Workday Time + Jira time logging is 4-6 person-months HRIS analyst + IT integration, plus 2 months change management. If Gamma evaporates in year 2, we eat all of that and migrate again.
- **Missing wedge:** SLA is **DEF-017 deferred**. SOC 2 Type 1 lands "by customer 3-4" per `THE_PLAN.md` Phase 7. **We would be customer 1.** Public status page is **DEF-016 deferred**. No 24/7 on-call - both founders sleep.
- **Competitor default:** Workday is not going bankrupt next quarter. We extend the Workday Time Tracking module for ~€18k/year and accept the ugliness.
- **Cumulative friction:** ~120 person-days.

#### Reason 2: The Month-End Close Agent is unproven vapor priced as flagship value
- **Objection:** Per `AI_FEATURES.md §7.1`, this is the load-bearing feature. Per THE_PLAN.md "Pre-customer-2 commitment", "if measured savings are less than **90 minutes per month**, STOP before signing customer 2." The founders have written down a hard gate that admits they do not yet know whether this thing works. Targets in §7.5 ("85% severity agreement, 80% top-signal relevance") on 900 invoices/year = **135 wrong severity calls + 180 mis-ranked signals my finance team chases per year.**
- **Switching cost reality:** Our actual close runs in Sage Intacct against pre-validated Jira/Workday exports - 3 days, 2 finance staff. To move to Gamma we would migrate billing master data (project codes, rate cards by grade × client × geography, intercompany allocations) out of Sage. Rate precedence in spec is "project_employee_rate > project_rate > employee_default_rate > tenant_default_rate." Our actual rate model has rate-card grids by role × seniority × client framework agreement × language premium. **It does not map.**
- **Missing wedge:** Multi-rate VAT is **DEF-007 deferred** ("Single tenant-default rate + EU reverse-charge boolean"). We invoice UK GBP, French intra-EU reverse-charge, Swiss TVA. Out of scope on day one. Multi-currency Gamma billing is **DEF-067 deferred**. Retainer billing is **DEF-006 deferred** - 30% of our book is retainer. Peppol / Chorus Pro is **DEF-065 deferred** - mandatory for our French public-sector clients in 2026-2027.
- **Competitor default:** Two finance analysts × 3 days × 12 months = 72 days/year ≈ €60k loaded cost. Even if Gamma genuinely halved it, I save €30k/year against a €70k subscription. **Math is negative before integration cost.**
- **Cumulative friction:** ~200 person-days.

#### Reason 3: No integrations. None. With anything we run.
- **Objection:** Search the specs for "Workday", "Jira", "Salesforce", "Sage", "Okta", "SCIM", "SAML", "webhook". Findings: **SCIM is DEF-024 deferred**, SAML is **DEF-025 deferred**, outbound webhooks are **DEF-009 deferred**, HRIS sync (Workday/Personio/BambooHR) is **DEF-060 deferred**, bidirectional payroll sync is **DEF-062 deferred**, bank feed integration is **DEF-010 deferred**, public API is v1.1+ deferred. SCOPE.md anti-scope: "Integrations (Slack, Teams, Zapier, calendar sync) - never ship silently."
- **Switching cost reality:** We provision/deprovision 201 employees through Okta + Workday → SCIM into every downstream system. Gamma does not accept SCIM. So joiner/mover/leaver becomes manual CSV upload by HR ops. ~200 hours/year of HR analyst work that does not exist today, ~€12k of new labor. Salesforce → Jira webhook today; Gamma cannot receive it. Either dual-key or build Mulesoft/Workato middleware: ~3 person-months + ~€20k/year platform cost.
- **Missing wedge:** OIDC alone is not SSO for our procurement bar. We need SCIM lifecycle + SAML federation + audit log streaming to Splunk. None present, all deferred.
- **Competitor default:** Lucca, Personio, BambooHR all ship SCIM in their base tier. So does literally every enterprise PSA tool.
- **Cumulative friction:** ~150 person-days/year recurring.

#### Reason 4: The data model does not match a real 200-person consulting firm
- **Objection:** SCOPE.md First-customer must-haves names "201 employees + 120 clients + 260 projects." We have 340 active project codes, ~80 of them intercompany between our French SAS and our UK Ltd, with transfer-pricing rules. Multi-entity intercompany is not in any spec we can find. Cost-center hierarchy is not in DATA_ARCHITECTURE's locked tables. Sub-day billing rules: founder memory says "days/half-days, 1h floor"; we bill in 0.25-day increments for some clients and per-deliverable for others. Custom fields exist (per pricing page) but are not described as queryable by AI tools.
- **Switching cost reality:** Re-modelling 340 project codes + 7 cost centers + 4 legal-entity intercompany flows into Gamma's locked schema is 4-6 months of data architecture. The spec says new tables "outside the locked set... require founder approval" (SCOPE.md anti-scope). Translation: we cannot extend the schema. We bend our process to their model.
- **Missing wedge:** Approval workflow is **DEF-001 deferred** - "Single-hop direct manager... 4-6 weeks to add multi-hop." Our expense policy requires manager → BU lead → finance > €5k → CFO > €25k. Performance reviews/1:1s reserved Tier 1.1, not built. Recruitment reserved Tier 1.1.
- **Competitor default:** We keep Excel + Power BI for capacity (€0), keep Sage for finance, and the only real gap left is OCR'd expense submission - which Spendesk does for €15k/year with bank-feed reconciliation Gamma will never have (DEF-010).
- **Cumulative friction:** ~240 person-days.

#### Reason 5: GDPR and security posture is "trust us, we are working on it"
- **Objection:** SOC 2 Type 1 lands "by customer 3-4" - **post our signature**. BYOK is **DEF-033 deferred**. DPA e-signature flow is **DEF-036 deferred** ("Founder emails DPA PDF, customer signs and returns, founder files manually in Google Drive"). Self-service DSR is **DEF-034 deferred**. Sub-processor change notification is a **manual email blast** (DEF-035). Distributed tracing is **DEF-015 deferred** - meaning when something breaks at 3am, two founders read raw Cloud Logging.
- **Switching cost reality:** Our DPO requires SOC 2 Type 2 + ISO 27001 or equivalent for any system touching employee compensation-adjacent data. RGPD Article 28 requires sub-processor list with prior written notice mechanisms. Manual blasts do not satisfy this. We would commission our own pen-test before deployment: ~€25k.
- **Missing wedge:** No legal SLA, no incident-response runbook tested in prod, two-founder team means **no separation of duties** for production access - audit finding waiting to happen.
- **Competitor default:** Workday is SOC 1 + SOC 2 Type 2 + ISO 27001 + ISAE 3402. Sage Intacct same. Our stack passed our last audit. Gamma forces re-audit cycle.
- **Cumulative friction:** ~90 person-days plus €25k pen-test.

### 15.3 The "one thing right"
Sell the Month-End Close Agent (AI_FEATURES.md §7) as a **standalone Sage Intacct / NetSuite / Sage 50 add-on at €15-25k/year**, not a full ops platform. Build it as a connector that ingests our approved-time export, drafts invoices in our ERP, emails the explanations. Earn trust on one painful workflow, generate the customer-1 video the founders need anyway, sell in 6 weeks instead of 6 months. Once we trust them on close, *then* we talk about the rest.

### 15.4 Pilot preconditions (the only path to a signature)
- Free 90-day pilot, 10 of our consultants, one BU. Zero cost. Pull plug any time, full data export within 7 days.
- SOC 2 Type 2 in hand or written commitment with auditor name and engagement letter dated before pilot start.
- DPA signed against our template, not theirs. EU sub-processor list with 30-day prior notice in writing.
- Working Workday SCIM connector or written commitment with delivery date before pilot day 1.
- Multi-rate VAT and reverse-charge for FR + UK + CH working in pilot tenant (DEF-007 lifted for us).
- Pen-test report from NCC / Synacktiv / Bishop Fox, not older than 6 months.
- Named technical account manager with documented response times.
- Source-code escrow with NCC Group or equivalent. Two-founder bus factor must be hedged contractually.
- Measured month-end close savings ≥ 4 hours per cycle on our actual data, not the canonical seed, before we discuss pricing.

### 15.5 The number we would actually pay to try
**€8,000 for the year, all-in, capped, contractual right to terminate at month 6 with 100% refund** if any missing item is not delivered. To convert to firm-wide deployment after pilot, the right number for year 1 is **€28,000-€34,000 (~€140-€170/seat/year)**, reflecting Lucca + Spendesk equivalent comparables, and only after SOC 2 Type 2, SCIM, multi-rate VAT, and a published SLA are live in production. **€70,000 is a number for a vendor that has shipped. Gamma has not.**

---

## 16. The two competing gates problem

CLAUDE.md §0 says "If something here conflicts with any other doc, this file wins." CLAUDE.md §7 lists 15 gate items mirroring `docs/FLAWLESS_GATE.md`. OPUS_CRITICS.md §12 self-declares a 57-item bar as "what DONE must mean from now on." The two are not reconcilable: OPUS items 13-20 (URL state, breadcrumbs, sticky headers, prev/next nav, dead-link inventory) are net-new requirements not in the 15. OPUS items 56-57 (critic subagent invocations) are net-new structural gates.

**Per CLAUDE.md §0 the operative gate is the 15-item gate.** OPUS bar is aspirational unless and until CLAUDE.md / FLAWLESS_GATE.md is rewritten to incorporate it via an ADR. Today, two competing gates is a recipe for the next agent self-certifying against whichever is more lenient.

**Recommendation:** OPUS_CRITICS.md and OPUS_CRITICS_V2.md should be downgraded to "audit findings" or their items merged into FLAWLESS_GATE.md with an explicit ADR. Pick one, file the ADR, delete or rebrand the other.

---

## 17. Process critique refresh

V1 listed 5 process failures and concluded "the new PROMPT.md installs critic subagents as mandatory pre-commit checks." V2 audits whether that fix worked.

1. **PROMPT enforcement**: PROMPT.md was rewritten. The 5 commits between V1 and V2 (`a4e579e`, `eea3ba9`, `f3b9360`, `1297a19`, `518900f`) **invoked neither `senior-ui-critic` nor `senior-ux-critic`**. The structural fix exists as policy and was bypassed in practice on every commit. **Status: failed in execution.**

2. **Test-first abandoned**: All 5 commits added code; only `f3b9360` (M3 lint) added a test mechanism. The onboarding rewrite (`518900f`) shipped without an E2E spec authored before the implementation. **Status: unchanged.**

3. **Feel-proxy checklist never run**: Same.

4. **Spec ambiguities = silent assumptions**: Same. New ambiguities surfaced (rate-card grid model, intercompany flows, custom fields, sub-day billing increments) - all decided by silence.

5. **Self-certification**: EXECUTION_CHECKLIST.md check marks were never corrected.

**Diagnosis:** The fix loop is broken at the human-incentive layer, not the policy layer. Critic subagents are a one-line skill invocation; they take 60-90 seconds per commit. The cost is trivial. They are skipped because no enforcement bites if they are skipped. Possible fix: a pre-commit hook that grepped the commit message for `## senior-ui-critic` and `## senior-ux-critic` headers and refused the commit if either was missing. The hook is 10 lines of bash. It is not in `.pre-commit-config.yaml`.

---

## 18. The OPUS-V2 bar (delta items)

Net-new items hardened by V2. These are additions to OPUS_CRITICS.md §12 if and when the two are merged into FLAWLESS_GATE.md.

58. ADR amendment present whenever an architectural decision in CLAUDE.md, ADR-001..010, or `specs/*.md` is overridden in code. Grep for "deviation" / "for the MVP demo path" / "phase X carryover" in source files; each match must point to an ADR-NNN amendment.

59. Seed script row counts equal `DATA_ARCHITECTURE.md §12.10` exactly. CI test pins counts. Regression dropping rows fails CI.

60. Tier 1 backend feature folder must contain `routes.py`, `service.py`, `models.py`, `schemas.py`, `tests/`. Empty folder = build break.

61. EXECUTION_CHECKLIST.md "DONE" check marks are CI-validated against the existence of (a) backend route, (b) Playwright E2E spec, (c) audit_log writer, (d) RBAC decorator. Any false check fails CI.

62. AI client: real LLM-as-router enforcement (return only registered tool calls; reject free-form completion). Test asserts the router rejects an injected free-form response.

63. Idempotency: every mutating route reads `Idempotency-Key` and stores in `idempotency_keys` table. Test sends same key twice; second response is the cached first response.

64. Confidential-tier columns exist in schema (`employee_compensation`, `employee_banking`, `leave_requests.reason_encrypted`, `employees.protected_status_encrypted`) even if encryption stub is in place; CMEK is Phase 7 but the column shapes must be present now.

65. Frontend mock data must be a strict subset of what the backend seed inserts. Type drift between `features/*/types.ts` and backend Pydantic schemas is a CI break.

66. `make help` lists every Make target the contributor can run, with prerequisites named.

67. `(portal)` route group cannot be built ahead of Phase 6 without an ADR amendment.

68. New patterns/atoms cannot land without an ADR-NNN under `docs/decisions/`.

69. `console.log` in shipped frontend code is a CI break (one allowed per file via `// eslint-disable-next-line no-console` with a reason).

70. Single date-format helper in `lib/format.ts` is the only authorized formatter; `Intl.DateTimeFormat` outside `lib/format.ts` is a CI break.

---

## 19. The fix order (revised since V1)

**Phase Z (1.5 weeks): the spine + the lies.** Nothing else moves until this is green.

1. **File ADR amendment for Phase 4 schema choice.** Either commit to per-tenant schema runner (real `t_<slug>` migrations + `set_local search_path`) or amend ADR-001 to row-level tenancy with explicit risk acceptance. **Pick one and write the ADR.**
2. **Correct EXECUTION_CHECKLIST.md.** Remove every "(2026-04-16, frontend done)" check mark not backed by a backend route + an E2E spec + an audit writer. Replace with `[ ]` or `[~]` (in progress). The doc must stop lying.
3. **Extend `seed_demo_tenant.py`** to insert: 1 admin user, 700 leave requests across all types and date ranges (past/present/future), 8,400 expenses (with receipt assets), 900 invoices with full line items via the real generation algorithm, 10,400 timesheet weeks × entries, audit_log seed, 30 notifications, 5 idempotency-key examples. Pin counts in a CI test.
4. **Wire the audit decorator + apply to every existing route.** CI lint blocks routes without it.
5. **Wire the `@gated_feature(key)` decorator + apply to every existing route.** CI lint blocks routes without it.
6. **Wire `Idempotency-Key` reader middleware** + `idempotency_keys` table + replay test.
7. **Implement pre-commit hook** that refuses any commit whose message lacks `## senior-ui-critic` and `## senior-ux-critic` sections (the policy is in PROMPT.md; install the teeth in `.pre-commit-config.yaml`).
8. **Pick one quality gate.** Merge OPUS_CRITICS.md + OPUS_CRITICS_V2.md into FLAWLESS_GATE.md via ADR. Delete or rebrand the OPUS files.
9. **Either delete the `(portal)/` route group** or file an ADR moving it from Phase 6 to Phase 5.
10. **Either delete `OllamaAIClient`** or file an ADR amending CLAUDE.md §1 + AI_FEATURES.md §0 to allow self-hosted Gemma3 as a parallel option (with the EU-residency story re-explained for any RGPD-bound buyer).

**Phase 3a (1 week, restart):** finish what is open from Phase 2 carryover (audit/RBAC/idempotency wiring; M4 orphan-row test, M7 alembic up/down/up CI). Already partially done in spec.

**Phase 4 (2 weeks, restart):** Employees, Clients, Projects, Dashboard pass 1. Rebuild every page under the unified-gate bar with critic subagents enforced. Current scaffolds are reference, not foundation.

**Phase 5a (3 weeks, restart):** Timesheets, Invoices, Month-end close agent (the headline differentiator), Expenses, Dashboard 1.5. Rebuild under the unified-gate bar. Test-first. Critic-gated. Ends with the 13/13 MVP acceptance test green.

**STOP at the end of Phase 5a.** Hand to the founder for the demo decision. Then run the COO/CFO teardown again with the rebuilt product and see whether any of the 5 reasons in §15 above has been answered.

**Phase 5b, 6, 7, §16 Deploy Track all founder-triggered.**

---

## 20. The hard truths

- The €70,260 ACV positioning depends on **the month-end close agent** being demonstrably real on the buyer's data. It currently does not exist as code. Building it is the single highest-leverage two weeks of work in the entire roadmap.
- The MVP acceptance test (`EXECUTION_CHECKLIST.md §6.2`, 13 steps) **fails at step 1** today (no admin user seeded). Steps 4-11 cannot run because the backend folders are empty.
- The current frontend is a polished mockup that demos by clicking forward and dies on every sideways or back click, on every refresh that resets a filter, and on every step that requires the seed to have inserted a row that was never inserted. A pilot prospect at hour 2 of an evaluation will discover this, will lose trust, and will not sign.
- The COO/CFO of the canonical 200-person buyer would not pay €70,260 for the v1.0 spec as written. They would pay €8,000 to try a 10-person pilot with conditions that the founders cannot meet today (SOC 2 Type 2, SCIM, multi-rate VAT, source-code escrow). Repricing reality: ~€140-€170 per seat per year for the bundled v1.0 product as it should ship; ~€15-25k flat for a standalone month-end close add-on against existing ERP.
- The fix is not "more critics yelling at the same agent." V2 proved that. The fix is the missing pre-commit hook that makes it impossible to commit without a critic-pass.
- ADR-001 says one thing. Phase 4 migration says the opposite. CLAUDE.md says one AI vendor. The backend ships another. EXECUTION_CHECKLIST.md says DONE. The folders are empty. **Until the docs and the code agree, every agent will continue to read the doc and ship the lie.**

If a single OPUS-V2 item is left red on a feature, the feature is not done. If two competing gates exist, the lenient one wins by default. If the seed cannot run the demo, the demo cannot be sold. If the pricing assumes value that has not shipped, the pricing is fiction.

The only acceptable outcome is: pass all 70 items per page (57 from V1 + 13 from V2), across all 13 Tier-1 features, with the ADRs and the docs and the code in agreement, with the seed running a clean 13/13 MVP test, with the COO/CFO checklist (§15.4) answered point by point. Anything less and v1.0 ships at a quality the founder will be embarrassed by at hour 2 of pilot 1.

---

**End of OPUS_CRITICS_V2.md.**
