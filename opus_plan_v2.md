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

End of plan.
