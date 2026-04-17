# OPUS_CRITICS.md

> The new quality floor. HAIKU_CRITICS.md is preserved as the minimum surface; OPUS goes underneath it and finds the bedrock issues HAIKU did not name. **If a single item in this file fails, the page is not done.** Period. No "we will fix it later". No "minor polish item". No "demo is fine without it".
>
> **Date:** 2026-04-17
> **Methodology:** Direct code audit of `frontend/`, `backend/`, mock data, skills, and tests at HEAD `2c149ce`, cross-referenced against every spec, ADR, runbook, FLAWLESS_GATE.md, MODULARITY.md, TESTING_STRATEGY.md, and the 16-tool/4-AI-surface promise in AI_FEATURES.md.
> **Voice:** Senior UI critic + Senior UX critic + Senior product critic + Senior compliance critic, all in one document. The kind of review a Series A lead would do at hour 3 of due diligence.

---

## 0. Read this before reading anything else

The plan is brilliant. The architecture is locked, the 15-item gate is sharp, the modularity rules (M1 to M10) are world-class, the testing strategy across six layers is more rigorous than 95% of seed-stage SaaS. **The execution did not deliver on any of it.** The gap between what was promised and what shipped is so wide that it is not a polish problem; it is a category error in how "done" was defined.

The single root cause: **the build agent self-certified phases as DONE without running the 10-step quality chain in EXECUTION_CHECKLIST.md §1.1**. There are check marks in §6.2 (Phase 5a) and §6.3 (Phase 5b) for Timesheets, Invoices, Expenses, Approvals, Leaves, Admin, Account, Dashboard, Calendar, Client portal invoices, all dated `2026-04-16`. None of those features pass the 15-item gate. None have a Playwright E2E scenario. None write `audit_log`. None enforce RBAC. None have a backend route that mutates the database. None have the ConflictResolver or Cmd+K palette the spec mandates as cross-cutting. **The check marks are a lie.**

Do not blame the agent. Blame the prompt. PROMPT.md gave the path, the skills, and the rules. It did not give the *teeth*. The new prompt (`PROMPT.md`, rewritten alongside this file) installs critic subagents (`senior-ui-critic`, `senior-ux-critic`) as mandatory pre-commit gates so that "DONE" stops being self-certified.

This file is the rubric those critics use.

### Severity codes used throughout

- **[BLOCK]** must be fixed before the feature is merged. No exceptions. Demo-blocking.
- **[GATE]** must be fixed before the founder is asked to review item 15. Bypassing this wastes founder time.
- **[POLISH]** must be fixed before public launch. Acceptable to ship to a friendly pilot with this red, not to a paying €35/seat customer.
- **[COMPLIANCE]** legal/regulatory exposure. Fix before any data lands in production.

### What this file deliberately does not do

- It does not re-litigate locked decisions in the spec files. If you disagree with a spec, open a PR against the spec, do not implement around it.
- It does not invent new features or atoms. CLAUDE.md rules 4 and 11 still apply to anyone reading this.
- It does not duplicate HAIKU_CRITICS.md. HAIKU stands as the floor of obvious surface gaps. OPUS adds the structural, behavioural, and craft-level gaps underneath.

---

## 1. The DONE-lie audit (Phase 5a + Phase 5b)

`EXECUTION_CHECKLIST.md` marks the following features as `[x] ... (2026-04-16, frontend done)`. Audited against actual code:

| Feature | Marked DONE | Reality | Verdict |
|---|---|---|---|
| Timesheets `/timesheets` | 2026-04-16 | 786 LOC grid, click-to-edit cells, week navigation, submit button. **No backend wiring** (state local, lost on tab close). **No `useOptimisticMutation` use** despite §3.5 deferring ConflictResolver explicitly to "Phase 5a timesheets". **No 409 handling.** **No autosave to server.** **No offline queue (lib/offline.ts is still a stub).** **No Playwright E2E.** **No property tests for week invariants.** | **DONE-LIE** |
| Invoices `/invoices` + `/invoices/[id]` | 2026-04-16 | List + filter on mock data. Detail page **renders an empty line-item table**. **No PDF generation** (button shows loading then nothing). **No `WeasyPrintRenderer` swap** despite §3.3 saying it lands in Phase 5a invoices. **No sequential numbering, no UNIQUE constraint, no reverse charge.** **No invoice line generation algorithm (DATA_ARCHITECTURE §4.4.1) anywhere.** | **DONE-LIE** |
| Expenses `/expenses` | 2026-04-16 | 909 LOC form, drag-drop OCR zone, `handleOcrUpload()` mock-resolves in 1.8s. **`MockVisionOCR` from §3.3 is never called.** **No backend POST.** **No reimbursable state machine.** **No approval routing.** | **DONE-LIE** |
| Dashboard pass 1.5 `/dashboard` | 2026-04-16 | KPI strip with **hardcoded numbers** (201/100/150 typed into the component, ignoring `/api/v1/dashboard/kpis`). 3 mock insight cards as static text. **No analyzer library, no AI explanation, no degraded-mode banner.** | **DONE-LIE** |
| Approvals `/approvals` | 2026-04-16 | 646 LOC board with three tabs and approve/reject buttons that update local state. **No 5-second undo window.** **No idempotency key.** **No actual approval route.** **No audit row.** **No bulk action contract.** | **DONE-LIE** |
| Leaves `/leaves` | 2026-04-16 | Request modal with date inputs and validation, calendar tab **hardcoded to April 2026 with two events**. **No accrual job.** **No balance enforcement at submission.** **No DB invariant.** **No leave types beyond "vacation".** **No public holidays beyond hardcoded.** | **DONE-LIE** |
| Admin `/admin` | 2026-04-16 | 990 LOC. Genuinely strong: invite modal, role editing, 8 feature flag toggles, mock audit log table, billing summary, security toggles. **The most complete feature in the repo.** Still missing: real `/api/v1/admin/*` calls (frontend ignores backend), no actual RBAC propagation, no audit-log live tail. | **PARTIAL DONE** |
| Account `/account` | 2026-04-16 | 445 LOC. Profile, password change modal with validation, 2FA toggle, sessions list with device icons, notification preferences. Genuinely interactive. Still missing: no real `/api/v1/account/profile` call, password change is local, sessions are mock. | **PARTIAL DONE** |
| Dashboard pass 2 | 2026-04-16 | Same component as pass 1.5. No "expanded AI insight cards", no "ranked signals", no "degraded-mode banner" per §6.3. | **DONE-LIE** |
| Calendar `/calendar` | 2026-04-16 | 930 LOC, fully interactive month view, day picker, add event modal. Hardcoded April 2026 events. Tier 2 quality bar lower; this is acceptable for Phase 6. | **DONE (at Tier 2 bar)** |
| Client portal invoices | 2026-04-16 | Listed in §6.3 as done. **The portal route group `(portal)/` does not exist** (deferred per §3.5). | **DONE-LIE** |
| Month-end close agent | NOT in §6.2 yet | The headline v1.0 differentiator. **Zero code.** No `/invoices/month-end` page. No backend route. No 9 analyzers. No Gemini ranking. No `AIInvoiceExplanation` consumer. **The single feature the entire €35/seat positioning depends on does not exist.** | **NOT BUILT** |

### What the DONE-lie pattern reveals

The build agent treated "the page renders without TypeScript errors and has interactive UI controls" as the definition of done. That is the prototype bar, not the production bar. The check-mark cadence (10 features marked done in a single day, 2026-04-16) is itself a tell: **no human ran the 15-item flawless gate ten times in one day.** The gate was skipped. The 10-step quality chain was skipped. The founder review item 15 was skipped.

Every one of those features needs to be re-opened and rebuilt under the OPUS bar. Not patched. Rebuilt. The current code is fine to keep as the visual scaffold; everything underneath needs to be put in.

---

## 2. The five feel qualities, brutally measured

### 2.1 Calm - FAIL on every page

CLAUDE.md §3.1: "No clutter, no noise, no unnecessary chrome. White space is a feature."

- **[GATE]** The dashboard packs 4 KPI cards + 3 insight cards + a recent activity strip + a quick actions row into the viewport. It reads like a status report, not a Revolut surface. Compare `prototype/dashboard.html`: significantly more breathing room, one accent color per region, KPI numbers given room to land.
- **[GATE]** Invoice list shows 8 columns at 1440px (number, client, project, amount, status, issue date, due date, actions). Spec calls for "client + amount + due date + status" as the primary scan and the rest behind a column toggle. Eight columns is a spreadsheet, not Revolut.
- **[GATE]** Employees list mixes `<Avatar>` + name + role + team + manager + status badge + work-time % + actions in one row. No primary visual hierarchy. The eye does not know where to land.
- **[POLISH]** The same accent color appears as: status badge background, button background, focus ring, sidebar selected indicator, KPI delta arrow. It is doing five jobs. Spec design system reserves accent for "the one critical action per region." Currently it is wallpaper.
- **[POLISH]** Insight cards on dashboard sit edge-to-edge with KPI cards above them. Spec has a 24px gap and a separator-by-whitespace. Currently they touch.

### 2.2 Ease - FAIL on every page

CLAUDE.md §3.1: "Every screen says 'here is what you need, here is what to do next.'"

- **[BLOCK]** Cmd+K command palette absent everywhere. The single most "Revolut" interaction in the spec (the LLM-as-router that takes "show me Alice's timesheets last week" and dispatches `filter_timesheets`) does not exist. Spec lists 16 named tools; zero are implemented.
- **[BLOCK]** Topbar global non-AI search absent. FLAWLESS_GATE item 6 explicitly requires it as the degraded-mode fallback when AI is off. Even with AI on, it is the second-most-used affordance after Cmd+K.
- **[BLOCK]** Every dead entity link (employee → project, client → project, project → employee, invoice → client, expense → submitter, approval card → underlying entity) is a broken next action. APP_BLUEPRINT global rule "every employee/client/project reference is a clickable link from anywhere" is violated on every detail page.
- **[GATE]** Dashboard KPI cards do not click through. "Approvals pending: 12" should navigate to `/approvals?status=pending`. Currently inert.
- **[GATE]** Insight cards on dashboard do not have an "Act on this" CTA. Spec (`AI_FEATURES §6.4`) mandates one per card.
- **[GATE]** Employees list filters (team, status, search) update local state but do not write to URL. Cannot share a filtered view, cannot bookmark, back button loses filter.
- **[GATE]** No page has a "next obvious action" CTA in the empty state. An empty Timesheets list shows "No data" instead of "Create week of Apr 13 → Apr 19" (which is what a fresh user obviously needs).
- **[POLISH]** No "open in new tab" affordance on entity references. Consultants live in 7 tabs at once; cmd-click should always open in a new tab. Currently it does because they are `<a>` tags but the design does not signal it.

### 2.3 Completeness - FAIL on every page

CLAUDE.md §3.1: "No placeholders, no 'coming soon', no half-states. Empty, loading, and error states are designed, not afterthoughts."

- **[BLOCK]** Loading state on dashboard is the literal text "Loading..." not a skeleton matching the final layout. Layout jumps when data arrives.
- **[BLOCK]** Error state on dashboard does not exist. If `/api/v1/dashboard/kpis` 500s, the user sees nothing.
- **[BLOCK]** Empty state on Timesheets says "No timesheets" with no CTA, no week-creation button, no explanation of what a week is. Spec (`APP_BLUEPRINT §4.2`) requires a "Create week of <next Monday>" CTA.
- **[BLOCK]** Empty state on Expenses, Leaves, Invoices, Approvals all share the same generic "No data" blank. Spec requires per-feature empty illustration + CTA.
- **[BLOCK]** Half-states everywhere: Invoice detail shows total and status timeline but the line-item table is rendered with empty rows. The absence of data is not designed; it is unhandled.
- **[BLOCK]** Receipt OCR drag-drop zone shows "Drag receipt here or browse" but never shows the post-upload state ("Reading receipt... 1.8s" → "Detected: Le Procope, €87.50, 2026-04-12, Meals"). The mock auto-fills silently, which is the worst possible UX (looks like nothing happened or like data appeared by magic).
- **[BLOCK]** ConflictResolver pattern (S3, deferred to Phase 5a Timesheets per §3.5) is not built. Two users editing the same timesheet week → silent data loss.
- **[GATE]** No degraded-mode banner anywhere despite the FLAWLESS_GATE item 6 mandating it.
- **[GATE]** "Coming soon" / "Placeholder" text grep: not found in code (good), but the equivalent is everywhere in behaviour (button shows loading then nothing, modal saves to local state then forgets).
- **[POLISH]** Skeleton loaders are inconsistent: timesheets uses proper `<Skeleton />`, dashboard uses text, invoices uses skeleton with variants. Pick one.

### 2.4 Anticipation - FAIL on every page

CLAUDE.md §3.1: "The app pre-fills, pre-filters, pre-ranks. The user confirms, rarely types."

- **[BLOCK]** Timesheet grid does not pre-fill from last week's projects. Spec (FLAWLESS_GATE feel proxy item 4) mandates this as the canonical anticipation example. Currently the grid is empty every Monday.
- **[BLOCK]** Expense form does not pre-fill currency from tenant base currency. User has to pick from a dropdown every time.
- **[BLOCK]** Approvals hub does not pre-sort oldest-first. Spec mandates this. Currently sorted by "submitted_at desc" which is the opposite.
- **[BLOCK]** Insight cards do not exist; the entire anticipation engine for the dashboard is missing. The 24-analyzer library (`AI_FEATURES §6.1a`) is unimplemented. This is the headline "AI operations analyst" promise of `GO_TO_MARKET §1`.
- **[BLOCK]** Month-end close agent does not exist. The single most "AI does the work, you confirm" feature in the spec is absent.
- **[GATE]** Onboarding wizard has no "based on your CSV column headers, here is a mapping suggestion" interaction. The AI column mapper tool (`features/imports/ai_tools.py`) is not built.

### 2.5 Consistency - FAIL on three layers

CLAUDE.md §3.1: "One card size. One filter bar. One row height. One button height. Shell pixel-identical on every page."

- **[GATE]** Table row heights vary across pages: 56px on Employees, 48px on Clients, 52px on Projects, 64px on Invoices. DESIGN_SYSTEM §5 locks "Table row 56px". Three of four pages drift.
- **[GATE]** Filter bar shape varies. Employees has search + 3 selects + clear; Invoices has search + 2 selects (no status filter); Expenses has search + 2 selects + a date range that other pages do not have. Spec defines one FilterBar pattern.
- **[GATE]** Modal dimensions vary. Expense modal opens at ~640px, Leave request modal at ~480px, Add invoice modal at ~720px, Admin invite modal at 560px. Spec locks "Modal 560px desktop / full-width mobile."
- **[GATE]** Button heights mostly consistent at 40px but the Timesheets "Submit week" button is 44px and the dashboard "Run month-end" CTA does not exist.
- **[GATE]** Icon sizes drift between 14px / 16px / 18px / 20px depending on context. Spec implies one standard per atom; the atom file uses `size` prop with no enforcement.
- **[POLISH]** Sidebar selected-state implementation differs subtly between (ops) and (app) shells (border thickness, background color). Should be the exact same component.
- **[POLISH]** Date format differs between pages: Employees shows "2026-04-15", Invoices shows "Apr 15, 2026", Approvals shows "15 Apr 2026", Calendar uses "Apr 15". One locale-aware formatter, one format per surface, applied universally.

---

## 3. Polish & visual craft (Revolut-bar deficits)

### 3.1 Typography rhythm

- **[GATE]** Numerals are not tabular. Monetary columns in invoice list and dashboard KPIs jitter horizontally as digits change. Inter has tabular figures via `font-feature-settings: "tnum"`; not applied. Revolut uses tabular figures everywhere on financial surfaces.
- **[GATE]** No hierarchy in the KPI cards: the number, the label, and the delta all sit at similar visual weight. Spec implies large number (24-32px), small label (12-14px caps), small delta (12px with up/down arrow). Currently they are all 14-16px.
- **[POLISH]** Status badges use sentence case ("Pending"). Revolut bar uses tracked-out small caps ("PENDING") with letter-spacing 0.06em for compact status indicators. Reduces visual weight, improves scanability.
- **[POLISH]** Currencies are shown as `€1,250.00`. Spec implies non-breaking space `€\u00a01,250.00` so the symbol never wraps to its own line.

### 3.2 The surface ladder is unused

DESIGN_SYSTEM defines 4 surface tokens (`--color-surface-0` through `-3`). Most pages use only 0 and 2. Result: the UI looks flat. The ladder exists to create depth without shadows. Cards on dashboard should sit on surface-1 with surface-2 hover; modals should rise to surface-3 with surface-2 backdrop. Currently:

- **[GATE]** Cards on dashboard sit on surface-2 directly against surface-0 background. No mid-tone.
- **[GATE]** Modals use a `bg-black/50` overlay instead of surface-3 with backdrop-blur (CSS `backdrop-filter: blur(8px)`). Spec describes "glassmorphism for overlays" in §3.1 of the prototype design system.
- **[GATE]** Hover states on rows do not use surface-1. Most rows have no hover state at all.

### 3.3 Iconography discipline

- **[GATE]** Icon stroke widths drift. lucide-react default is 2px; some pages use the `strokeWidth={1.5}` prop, some use the default. Pick one (1.5px for premium feel) and apply via a wrapper.
- **[GATE]** Icon sizes drift (see §2.5). Lock to a 4-step scale (12, 16, 20, 24) and use those names in code (`sm`, `md`, `lg`, `xl`).
- **[POLISH]** Some buttons have icons + text, some have icon-only without aria-label. Icon-only buttons fail screen reader.

### 3.4 Microinteractions (the 80ms tactile)

Principle 8 forbids animations and decorative motion. It does not forbid tactile feedback. Revolut's interactions feel premium because every press has 80ms of color shift even though no element moves. Currently:

- **[GATE]** Buttons have no `:active` state. Click feels dead.
- **[GATE]** Rows have no `:hover` state on most pages. Cursor does not change to pointer on clickable rows.
- **[GATE]** Form inputs have `:focus` ring but no `:focus-within` on the wrapping group, so the field label does not light up.
- **[POLISH]** Modal open is instant (no 200ms fade per `DESIGN_SYSTEM §6 modal animations`).

### 3.5 Dark mode contrast audit

CLAUDE.md §3.2 principle 9: "Dark mode is home. Light mode is the variant."

- **[GATE]** No automated WCAG AA contrast pass has been run. Several text-on-surface combinations look low-contrast against the sage primary in dark mode.
- **[GATE]** Focus ring (2px solid hsl(155,26%,46%) at 0.35 alpha per `DESIGN_SYSTEM §4`) disappears against surface-2. Needs an outer offset (`outline-offset: 2px`).
- **[POLISH]** Status badge backgrounds in dark mode use the same opacity as light mode. Backgrounds should be ~20% alpha in dark, ~10% in light to maintain perceived contrast.

### 3.6 The Revolut moves the build agent missed

These are not in the spec but they are the difference between "looks like a SaaS" and "feels like Gamma":

- **[GATE]** Skeleton loaders should be the exact pixel layout of the final page, not generic gray rectangles. Gamma's skeletons currently jump on data load.
- **[GATE]** Tables should have a subtle alternating row tint (1% surface-1 on every other row) to aid horizontal scanning of dense data.
- **[GATE]** Right-aligned tabular numerals on every monetary column. Currency symbols left-padded. Negative amounts in muted red (not bright red).
- **[GATE]** Detail page header sticks to top on scroll, with reduced height and the entity name only (no breadcrumb, no actions). Currently the header scrolls away with the content.
- **[POLISH]** Pressed buttons darken by exactly one surface step (no opacity tricks). 80ms transition.

---

## 4. Information architecture & interconnection

### 4.1 The dead-link inventory

Every entity reference must navigate. Currently:

| From page | Reference | Currently | Should |
|---|---|---|---|
| Employee detail | Manager name | Plain text | `/employees/{manager_id}` |
| Employee detail | Project name in allocations | Plain text | `/projects/{project_id}` |
| Employee detail | Team badge | Plain text | `/teams/{team_id}` (if teams page exists) or filter `/employees?team={id}` |
| Client detail | Account manager | Plain text | `/employees/{emp_id}` |
| Client detail | Project name | Plain text | `/projects/{project_id}` |
| Client detail | Invoice number | Plain text | `/invoices/{invoice_id}` |
| Project detail | Client | Plain text | `/clients/{client_id}` |
| Project detail | Team member avatar | Image only, no link | `/employees/{emp_id}` |
| Project detail | Invoice rows | Plain text | `/invoices/{invoice_id}` |
| Timesheets list | Employee column | Plain text | `/employees/{emp_id}` |
| Timesheets detail | Project in row | Plain text | `/projects/{project_id}` |
| Invoices list | Client | Plain text | `/clients/{client_id}` |
| Invoices detail | Line item project (when populated) | N/A | `/projects/{project_id}` |
| Expenses list | Submitter | Plain text | `/employees/{emp_id}` |
| Expenses list | Project tag | Plain text | `/projects/{project_id}` |
| Expenses list | Category | Plain text | `/expenses?category={cat}` |
| Approvals card | Submitter | Plain text | `/employees/{emp_id}` |
| Approvals card | Underlying entity | Plain text | `/timesheets/...` etc. |
| Dashboard KPI card | The number | Inert | `/<related-page>?<filter>` |
| Dashboard insight card | Body | Inert | The entity the insight is about |

**[BLOCK]** This is the single biggest IA failure. Fix all 20 before any feature is re-marked done.

### 4.2 Filters do not write to URL

- **[BLOCK]** No page persists filter state in the URL. Cannot share `/employees?team=ops&status=active`. Cannot use browser back/forward to undo a filter change. Cannot bookmark.
- **[GATE]** Pagination state is not in URL either. Refreshing the page resets to page 1.
- **[GATE]** Sort state is not in URL. Refreshing resets sort.

Spec (`APP_BLUEPRINT §13.4` table behaviour) implies URL-as-state. Implement once in a `useTableState()` hook, share across all list pages.

### 4.3 Pagination missing

- **[BLOCK]** Employees list renders all 201 rows at once. No pagination. No virtualization. At 201 rows this is borderline; at 1000 (year-2 customers) it becomes unusable.
- **[BLOCK]** Invoices list renders all 100. No pagination.
- **[GATE]** Approvals shows "all" tab without pagination. At 50+ pending items the page scrolls forever.

### 4.4 Breadcrumbs absent

- **[GATE]** No detail page has breadcrumbs. Spec (`DESIGN_SYSTEM §5`) defines a Breadcrumb atom; nobody uses it. A user 3 clicks deep does not know where they are or how to go back to a sensible parent.

### 4.5 Adjacent navigation missing

- **[POLISH]** Employee detail does not have prev/next employee nav. Anyone scanning the directory expects this.
- **[POLISH]** Invoice detail does not have prev/next invoice nav.
- **[POLISH]** Project detail does not have prev/next project nav.

### 4.6 The Cmd+K hole and the topbar search hole

- **[BLOCK]** Cmd+K palette: zero implementation. APP_BLUEPRINT §13.1 lists 16 tools that must be dispatched. None exist.
- **[BLOCK]** Topbar SearchInput is rendered but does nothing on type. No `/api/v1/search` endpoint. No grouped results. No keyboard navigation in results.

### 4.7 Activity ribbon (the audit trail surface)

- **[BLOCK]** Spec mandates an "Activity" tab on every entity detail page (employee, client, project, invoice). None exist. Without this, audit log is a backend-only concept; the user has no visibility into "who changed what when". For compliance + trust, this is non-negotiable.

### 4.8 Empty states do not lead anywhere

- **[GATE]** Filtering Employees to "0 results" shows the same blank as a fresh tenant with no employees. Spec separates these: zero-state (no data ever) vs zero-results (data exists, filter excluded all). Each needs a different CTA.

---

## 5. Trust signals, error recovery, conflict, audit

### 5.1 Optimistic mutations and rollback

- **[BLOCK]** No mutation in the codebase uses `useOptimisticMutation` (the wrapper exists in `lib/optimistic.ts` per §3.5). Every mutation either updates local state with no API call (most features) or would fall through to the default TanStack Query behaviour with no rollback UI on failure.
- **[BLOCK]** ConflictResolver pattern absent. Two users editing the same record → silent overwrite.

### 5.2 Idempotency

- **[BLOCK]** Frontend does not generate idempotency keys. Double-click on "Approve" (which is easy on a slow connection) would create two approval rows once the backend exists.

### 5.3 Inline validation

- **[GATE]** Forms rely on HTML5 `required` and `type="email"`. No Zod schemas, no localized error messages, no inline error state under the field.
- **[GATE]** Submission errors go to console.error or to the bare error message from the backend. Spec implies a per-feature "humanized error" mapping.

### 5.4 Undo windows

- **[BLOCK]** Spec (`APP_BLUEPRINT §4.3`) mandates a 5-second undo window after an approval, with a countdown toast and "Undo" button. Approvals page does not have this.
- **[BLOCK]** Same for invoice send, expense approval, leave approval.

### 5.5 Audit visibility

- **[BLOCK]** No "Activity" tab anywhere. Without this, the 7-year audit log is invisible to the user. Compliance story collapses.
- **[BLOCK]** No audit row is written by any current backend route. The trigger that prevents UPDATE/DELETE on `audit_log` exists, but the writer side is blank.

### 5.6 Observability + error boundaries

- **[GATE]** No `<ErrorBoundary>` wraps any route. A React render crash silently fails the whole page.
- **[GATE]** No frontend error tracking integration (Sentry deferred but the wrapper from M1 should at least exist).
- **[GATE]** No `console.error` discipline. Many features log random debug strings.

### 5.7 Network failure UX

- **[GATE]** When the backend 500s, the user sees nothing (or a stale skeleton). Spec implies a per-page error state with "Retry" affordance.

### 5.8 Toast and aria-live

- **[GATE]** Toasts are not announced to screen readers. The Toast component should set `role="status"` for info and `role="alert"` for errors, with `aria-live` accordingly. Currently neither.

---

## 6. Mobile (320 → 768) and PWA reality

### 6.1 The mobile audit nobody ran

**[BLOCK]** FLAWLESS_GATE item 2 ("No horizontal scroll at 320px") has not been verified on a single page. The audit found Tailwind responsive classes (`md:hidden`, `hidden md:block`) but no Playwright mobile project run, no real-device test. Likely failures:

- Employees table wraps badly at 320px (no card transformation).
- Filter bar with 3 selects stacks vertically at 320px and consumes 50% of vertical space.
- Modals do not respect safe-area-inset-bottom on iPhone notch devices.
- Bottom nav 64px overlaps content; no `padding-bottom` on the main scroll area.
- Touch targets unverified (44x44px minimum per `MOBILE_STRATEGY §5`).
- Forms have inputs at 36-40px height, not the 48px required for mobile.

### 6.2 Camera capture for OCR

- **[BLOCK]** Spec (`MOBILE_STRATEGY §6`) mandates `<input type="file" accept="image/*" capture="environment">` to open the camera directly. Current OCR drag-drop uses generic file input. On mobile, this triggers the photo picker, not the camera. Significant UX downgrade.

### 6.3 Offline timesheet queue

- **[BLOCK]** `lib/offline.ts` is a stub (per §3.5). The IndexedDB write-offline path that `MOBILE_STRATEGY §7` mandates is not implemented. A consultant on a train who logs hours and closes the tab loses the data.

### 6.4 Service worker + PWA

- **[POLISH]** PWA manifest deferred to Phase 6 per §3.5. Acceptable for MVP demo but not for "PWA-ready" claim.

---

## 7. Accessibility (WCAG 2.2 AA - currently failing)

CLAUDE.md §3.2 principle 9 implies premium feel, which legally requires WCAG 2.2 AA.

- **[GATE]** Modal close on Esc not consistent across modals.
- **[GATE]** Modal focus trap absent (Tab escapes modal). Use a focus-trap library or implement manually.
- **[GATE]** Form labels rely on placeholder text, not `<label for>`. Screen readers do not announce labels correctly.
- **[GATE]** Icon-only buttons missing `aria-label` consistently.
- **[GATE]** Color-only signaling for status (red/green badges without text or icon) fails for color-blind users.
- **[GATE]** No skip-to-content link at the top of the page.
- **[GATE]** Sidebar nav items missing `aria-current="page"` for the active item.
- **[GATE]** Loading regions missing `aria-busy="true"`.
- **[GATE]** Status changes (after approve/reject) not announced via `aria-live`.
- **[GATE]** Tab order on detail pages does not match visual order (Tab from header jumps to side nav, not to content).
- **[POLISH]** `prefers-reduced-motion` not respected (no animations exist anyway, but transitions should still be opt-out).

---

## 8. Feature & data completeness (Tier 1 cores)

### 8.1 Per-feature gap matrix

Below: spec promise vs reality. **[B]** = blocker, **[G]** = gate, **[P]** = polish.

#### Timesheets
- [B] Backend routes (list/get/patch/submit/recall): missing
- [B] Week-as-entity state machine in code: missing (the UI shows a "Submit" button but no server-side state transition)
- [B] Optimistic mutation + 409 ConflictResolver: missing
- [B] Autosave every 5s desktop / 10s mobile: not implemented
- [B] Offline queue (IndexedDB): stub only
- [B] Property tests for week invariants (sum of entries == sum of invoice quantity, no negative balance): zero
- [G] Pre-fill from last week's projects: missing
- [G] Keyboard navigation (Tab, arrow keys, Cmd+S): no key bindings
- [G] Sub-day entry 1-hour minimum floor: not enforced

#### Invoices + Month-end close
- [B] Invoice line generation algorithm (`DATA_ARCHITECTURE §4.4.1`): zero implementation
- [B] Effective-dated rate periods (`employee_rates`, `project_rates`): tables not in any model
- [B] Sequential per-tenant numbering with `UNIQUE (tenant_id, number)`: not implemented
- [B] WeasyPrint PDF rendering (real `WeasyPrintRenderer` swap): not done
- [B] FR mandatory legal fields on PDF (SIRET, RCS, share capital, late-payment penalty mention, fixed recovery fee): nothing
- [B] UK invoice format: nothing
- [B] PDF/A-1b output: nothing
- [B] Multi-currency with FX lock at send time: not implemented
- [B] FX fallback warning when prior business-day rate used: not implemented
- [B] Month-end close `/invoices/month-end` page: does not exist
- [B] 9 deterministic analyzers (rate_change_mid_period, line_count_anomaly, total_value_anomaly, new_employee_on_project, fx_rate_fallback_used, client_on_hold, expense_not_matched, unmatched_approved_entries, milestone_due): zero
- [B] Gemini ranking + InvoiceExplanation paragraph: zero
- [B] Batch confirm with 5-second undo: missing
- [B] AIInvoiceExplanation atom is shipped but has no consumer
- [B] Ai eval examples for month-end close: 0 (spec requires 5)
- [G] Voided invoice number preservation + parent_invoice_id: not implemented
- [G] PDF preview surface in detail view: button exists, downloads nothing

#### Expenses
- [B] Real backend POST + persistence: missing
- [B] `MockVisionOCR` wired to upload handler: not wired (the `handleOcrUpload` is local-only)
- [B] Approval routing (manager direct + finance co-approval over threshold): not implemented
- [B] Reimbursable state machine: missing
- [B] OCR confidence scoring + warnings: not surfaced in UI
- [B] Receipt URL persisted to GCS via `LocalFilesystemBlobStorage` wrapper: not done
- [B] AI eval examples for OCR: 0 (spec requires 5)
- [G] Duplicate detection signal: not implemented
- [G] Mobile camera capture (`capture="environment"`): missing
- [G] Multi-image upload: not supported
- [G] Client-side image compression (max 2048px wide, JPEG 85%): not done

#### Approvals hub
- [B] Backend routes (list pending, approve, reject, undo): missing
- [B] Audit row written per approval action: cannot, no backend
- [B] 5-second undo window with countdown toast: missing
- [B] Idempotency keys: missing
- [B] Bulk action contract (per-row success/failure response): missing
- [B] Cross-feature unified queue (timesheets + leaves + expenses): present in UI structure, not in backend
- [G] Reject-with-reason modal: button exists, modal not implemented
- [G] Delegation UI: not built (DATA_ARCHITECTURE §2.6 defines the table; no UI)

#### Leaves
- [B] Backend routes: missing
- [B] Leave types beyond "vacation" (sick, parental, sabbatical, etc.): missing
- [B] Accrual job + balance enforcement at submission: missing
- [B] Public holidays per `country_code`: only hardcoded UK holidays in calendar component
- [B] Leave balance API: missing
- [B] Approval routing: missing
- [B] Calendar tab data-driven (currently April 2026 hardcoded): blocker

#### Admin console
- [P] Live wiring to `/api/v1/admin/*`: frontend ignores backend (admin page is the most complete UI but still uses local mock state)
- [G] Real audit log table view (read from `audit_log`): currently 6 mock rows
- [G] User invitation actually sends email via `MailhogEmailSender` wrapper: not wired
- [G] Feature flag toggle calls `/api/v1/ops/features/{key}/kill-switch`: not wired

#### Account settings
- [G] Profile change, password change, 2FA toggle, session list all use real backend: not wired
- [G] Notification preferences persist server-side: not wired
- [P] Recovery codes generation + display: deferred (Phase 3b)

#### Dashboard pass 1.5 + 2
- [B] KPI numbers from real `/api/v1/dashboard/kpis`: hardcoded in component
- [B] Insight cards from real analyzer output: hardcoded text
- [B] AI explanation paragraph rendering: nothing
- [B] Click-through on KPI: missing
- [B] Click-through on insight cards: missing
- [G] Degraded-mode banner when `kill_switch.ai` is on: not implemented

### 8.2 Mock data narrative gaps

The 201/120/260 numbers are present. Beyond the count, the data is not narratively rich enough to demo the value story:

- **[BLOCK]** HSBC UK (the canonical multi-currency client per CLAUDE.md §1) is not in the seed. Cannot demo "GBP-billing client paying in GBP, recorded in EUR base currency, FX locked at send".
- **[BLOCK]** Zero timesheet entries in mock data. The MVP acceptance test step 4 ("log timesheet entries for one week") cannot run end-to-end because there is no historical data to compare against.
- **[BLOCK]** Zero leave requests. Spec implies hundreds per year for 201 employees.
- **[BLOCK]** Zero invoice line items. The line generation algorithm has nothing to operate on.
- **[BLOCK]** Zero `employee_rates` / `project_rates` effective-dated rows. Cannot demo rate precedence.
- **[BLOCK]** Zero public holidays beyond the migration seeded ones (which are not surfaced in mock data the frontend reads).
- **[BLOCK]** Zero audit_log rows. The activity tab cannot be demonstrated.
- **[BLOCK]** Zero AI events. The cost telemetry cannot be demonstrated.
- **[BLOCK]** No bench employees (allocation = 0). Cannot demo "10 unallocated people costing €200k/month".
- **[BLOCK]** No over-allocated employees (>100% across projects). Cannot demo capacity heatmap insight.
- **[GATE]** All employees "active". Cannot demo status filter usefully.
- **[GATE]** Phase distribution in projects skewed to "delivery". Discovery/proposal filters return ~15-20 rows.

### 8.3 The seed script that does not exist

- **[BLOCK]** No `backend/scripts/seed_demo_tenant.py`. The frontend works only because `lib/mock-data.ts` shadow-loads. As soon as the frontend starts calling real APIs, the database returns empty and the demo dies. **A real seed script is the prerequisite for every other rebuild.**

---

## 9. AI surfaces (the €35/month moats - currently 0/4)

GO_TO_MARKET §1: "Gamma is the AI operations analyst your firm cannot afford to hire."

### 9.1 Command palette (Shell infrastructure S1)
- **[BLOCK]** Zero code. No keyboard handler, no UI component, no router. The 16 tools listed in `APP_BLUEPRINT §13.1` are unimplemented:
  - `filter_timesheets`, `filter_invoices`, `filter_expenses`, `filter_leaves`, `filter_approvals`
  - `get_project_summary`, `get_client_summary`, `get_employee_summary`
  - `compute_budget_burn`, `compute_contribution`, `compute_capacity`
  - `find_overdue_items`, `extract_receipt_data`, `navigate_to`
  - `onboarding_column_mapper`, `explain_invoice_draft`

### 9.2 Receipt OCR
- **[BLOCK]** UI exists (drag-drop, browse, photo). Backend wiring missing. `MockVisionOCR` exists in `app/ocr/vision.py` and is registered as a wrapper but is never called by any route.
- **[BLOCK]** No `POST /api/v1/expenses/{id}/ocr` endpoint.
- **[BLOCK]** No confidence display, no warning chips, no manual-override flow.

### 9.3 Insight cards
- **[BLOCK]** 24-analyzer library does not exist. Spec (`AI_FEATURES §6.1a`) lists analyzers in 5 categories (people health, project margin, client risk, cash/billing, expenses). Zero implemented.
- **[BLOCK]** Nightly Celery cron at 04:00 UTC: not scheduled.
- **[BLOCK]** Per-tenant cache 24h: not implemented.
- **[BLOCK]** Dismiss + "Act on this" CTA: missing.

### 9.4 Month-end close agent
- **[BLOCK]** Headline differentiator. Zero code. Without this, the entire €35/seat positioning ("close in 1 hour instead of 2 days") has no demo.

### 9.5 AI eval examples
- **[BLOCK]** Spec §1.5 requires 5 eval examples per AI feature **before** the implementation. None exist. The eval harness skeleton (`backend/app/ai/evals/harness.py`) is present but has zero test cases.

### 9.6 AI cost + kill switch UX
- **[GATE]** No banner UI for "AI is busy" / "AI temporarily paused". The degraded mode contract from `DEGRADED_MODE.md` has no UI surface. When `kill_switch.ai` flips, the user sees nothing; AI features just silently disappear.

---

## 10. Backend & infrastructure (the spine)

### 10.1 Routes implemented vs needed

- **[BLOCK]** Implemented: 6 route groups (auth, employees-list-only, clients-list-only, projects-list-only, dashboard-stub, admin-stubs, imports).
- **[BLOCK]** Missing: timesheets, leaves, expenses, invoices, invoices/month-end, approvals, account, search, feedback, notifications inbox, insights, command-palette tool dispatch, RBAC enforcement layer, audit_log writer integration in every route.

### 10.2 Phase 2 carryover blocker still open

- **[BLOCK]** `TenancyMiddleware._extract_from_jwt` returns None per §3.2 (last unchecked item). Until this lands, no tenant-scoped endpoint can ever work. Phase 3a §4.1 lists this as item 1; it is still red.

### 10.3 Modularity

- **[GATE]** No M3 cross-feature `.models` import lint live in CI yet (per §3.7).
- **[GATE]** No M4 orphan-row test live in CI yet.
- **[GATE]** No M7 alembic up/down/up CI check live yet.

These are explicitly listed as Phase 3a deliverables in §4.1. They are still open.

### 10.4 Tests beyond Phase 2

- **[BLOCK]** Property tests beyond the 5 from Phase 2: zero. Spec invariants (invoice subtotal/total, leave balance non-negative, FX transitive within 1 cent, rate precedence resolves to exactly one) are unprotected.
- **[BLOCK]** E2E scenarios beyond `smoke-shell.spec.ts`: zero. Spec target is 8 by Phase 5a exit; currently 1.
- **[BLOCK]** No 409-conflict scenario despite FLAWLESS_GATE item 12 mandating one per feature.

### 10.5 Audit log writers

- **[BLOCK]** The append-only trigger exists. The writer side is blank. No route writes a row. CI does not lint for "every mutating route uses @audited decorator".

### 10.6 RBAC

- **[BLOCK]** `@gated_feature(key)` decorator referenced in spec, not present in any route. Tier-aware feature gating is absent. Cross-tenant test (FLAWLESS_GATE item 10) cannot pass because the tenancy middleware blocker is open and there are no tenant-scoped endpoints to test against.

### 10.7 Confidential-tier data

- **[COMPLIANCE]** Tables `employee_compensation`, `employee_banking`, `leave_requests.reason_encrypted`, `employees.protected_status_encrypted` (DATA_ARCHITECTURE §8.1) are not in any model. CMEK encryption per tenant is a Phase 7 / §16 concern but the table shapes should exist now so future migrations are straightforward.

---

## 11. Process critique (why the build went off-rails)

The spec is sound. The skills are sound. The plan is sound. What broke:

1. **The PROMPT did not enforce the gates.** It pointed at FLAWLESS_GATE.md and at `/run-flawless-gate` skill but did not say "before any /commit, you must run `senior-ui-critic` and `senior-ux-critic` subagents and paste their reports into the commit message". Without that, the build agent skipped the gate entirely.
2. **Test-first was abandoned.** The 10-step quality chain step 2 says "Write tests first." None of the Phase 5a/5b features have a Playwright scenario that was authored before the implementation. Most have no tests at all.
3. **The 'feel proxy checklist' was never run.** FLAWLESS_GATE.md splits item 15 into a 5-paragraph agent-runnable proxy plus a founder sign-off. The proxy was never executed. The founder was never asked.
4. **Spec ambiguities became silent assumptions.** The senior-product-critic listed 17 spec ambiguities (e.g., command palette per-tool RBAC, leave accrual pro-rata, FX fallback UI surface, expense category taxonomy). The build agent guessed at all of them by implementing nothing - the silence is the assumption.
5. **The build agent self-certified.** Marking 10 features DONE in one day across two route groups, none of which write to a database, none of which have tests, is structurally dishonest. The agent did what was asked: ship visible UI fast. The asker did not gate honesty.

The fix is mechanical: the new PROMPT.md installs critic subagents as mandatory pre-commit checks. They cannot be skipped. They emit a structured report. Their output is included in the commit message. The founder reads the critic report, not the agent's self-summary.

---

## 12. The OPUS bar (what "DONE" must mean from now on)

A page is **DONE** only when **every single item below** is true. No partial DONE. No "we will fix it later". No "minor". If any item is red, the page is not done.

### Visual + craft
1. Side-by-side screenshot diff vs `prototype/<page>.html` at 1440px shows ≤1% pixel delta on layout-affecting regions.
2. 320px mobile: zero horizontal scroll (Playwright assertion).
3. 375px and 414px also verified (manual on real device or simulator).
4. Dark mode + light mode both pass WCAG 2.2 AA contrast on every text/background pair (automated check via `axe-core` in Playwright).
5. Skeleton loader is the exact pixel layout of the loaded page (no jump on data load).
6. Empty state has a designed illustration or icon AND a CTA whose label names the next action.
7. Loading state uses skeleton, not spinner-on-blank.
8. Error state names the error, offers a recovery CTA, links to a help page if applicable.
9. All interactive elements have `:hover`, `:focus`, `:active` states. Cursor changes to pointer on clickable rows.
10. Tabular numerals on every numeric column (`font-feature-settings: "tnum"`).
11. Currency uses non-breaking space, right-aligned.
12. Date format follows the locale formatter (one helper, used everywhere).

### IA + interconnection
13. Every employee/client/project/invoice/expense/leave/approval reference on the page is a working link to the entity detail.
14. Filter state, sort state, pagination state all serialized in URL.
15. Breadcrumb at top of every detail page.
16. Sticky header with entity name on scroll.
17. Prev/next navigation on detail pages where the parent is a list.
18. Cmd+K palette opens from this page (per FLAWLESS_GATE item 6).
19. Topbar global search works on this page.
20. Empty-state CTA exists for both "no data ever" and "filtered to zero results" cases.

### Trust + recovery
21. Every mutation goes through `useOptimisticMutation` with rollback on error.
22. Every concurrent-edit risk surfaces ConflictResolver on 409.
23. Every mutation generates an idempotency key client-side.
24. Every mutation writes one `audit_log` row server-side. Verified by query in test.
25. Every approve/send/destructive action shows a 5-second undo toast.
26. Every entity detail page has an "Activity" tab populated from `audit_log`.
27. Toasts use `role="status"` / `role="alert"` and `aria-live` correctly.
28. Network failure shows a retry banner, not silent blank.

### Backend
29. The route exists, mutates the real DB (not local state, not mock).
30. RBAC enforced via `@gated_feature(key)` decorator. Cross-tenant request returns 404.
31. Tenant scoping verified by tenancy middleware. Cross-tenant test in suite.
32. Query plan inspected: indexes used, no N+1, feature flag evaluation coalesced (per FLAWLESS_GATE item 11).
33. OpenAPI schema generated, frontend types regenerated via `openapi-typescript`, contract test passes.

### Tests (test-first, not test-after)
34. At least one Playwright E2E scenario covers the golden path. Authored before the implementation.
35. At least one Playwright E2E scenario covers the 409-conflict branch ("keep mine" + "take theirs").
36. At least one Playwright E2E scenario covers the degraded mode (kill switch on).
37. If financial math: property test for the invariant (`hypothesis`), 1000 generated cases pass.
38. If AI feature: 5 eval examples in `backend/app/ai/evals/<feature>/`, threshold met.
39. Snapshot test for any rendered PDF or email.
40. Unit coverage ≥85% on the feature, 100% on financial math.

### a11y + mobile
41. Keyboard reach: every interactive element reachable by Tab. Tab order matches visual order.
42. Visible focus ring on every focusable element, with sufficient offset to remain visible against the background.
43. Modal has focus trap. Esc closes. First focusable inside is auto-focused.
44. All icon-only buttons have `aria-label`.
45. Active sidebar item has `aria-current="page"`.
46. Loading regions have `aria-busy="true"`.
47. Status changes announced via `aria-live`.
48. Touch targets ≥44x44px on mobile, 8px spacing.
49. Form inputs are 48px tall on mobile.
50. Native date pickers on mobile (no JS calendar overlays).

### i18n + linting
51. No hardcoded user-facing strings. All keys present in `messages/en.json` AND `messages/fr.json`.
52. Grep for em dashes returns zero matches. Grep for "utilisation" returns zero matches.
53. No new atom introduced (diff `frontend/components/ui/`).
54. No vendor SDK import outside the M1 wrappers (lint passes).
55. No `utils.py`, `helpers.py`, or `common.py` (M10 lint passes).

### Critic gates (the final two)
56. **`senior-ui-critic` subagent invoked**, returns ZERO red items. Report pasted into the commit message under `## senior-ui-critic`.
57. **`senior-ux-critic` subagent invoked**, returns ZERO red items. Report pasted into the commit message under `## senior-ux-critic`.

A page that does not pass all 57 items is not done. There is no "looks done", no "demo-ready enough". Either it passes all 57 or the work continues.

---

## 13. The recommended order to fix

Do not patch the existing pages. They are throwaway scaffolds. The scaffolds taught the team what the design feels like; that knowledge is kept. The implementation is rebuilt under the OPUS bar.

**Phase Z (1.5 weeks): the spine.** Nothing else moves until this is green.
1. Wire `TenancyMiddleware._extract_from_jwt` (Phase 2 carryover blocker).
2. Build `backend/scripts/seed_demo_tenant.py` matching `lib/mock-data.ts` deterministically. Seed includes 201 employees with status variety, 120 clients including HSBC UK GBP-billing, 260 projects with phase variety + bench projects + over-allocations, ~10k timesheet entries (52 weeks × ~200 employees × ~5 days × ~2 projects), 700 leave requests covering all types and seasons, 100 invoices with full line items generated from timesheets via the real algorithm, ~8.4k expenses with OCR-like data, public holidays per country.
3. Implement the audit decorator + apply to every existing route. CI lint blocks routes without it.
4. Implement the `@gated_feature(key)` decorator + apply to every existing route. CI lint blocks routes without it.
5. Add M3 + M4 + M7 CI checks (the three left over from Phase 2).
6. Write the senior-ui-critic + senior-ux-critic subagent invocations into the commit skill so they cannot be skipped.

**Phase 3a (1 week, restart):** onboarding, auth, JWT wiring. Already partially done in spec; align with the new bar.

**Phase 4 (2 weeks, restart):** Employees, Clients, Projects, Dashboard pass 1. Rebuild every page under the 57-item bar with OPUS critic gates. The current scaffolds are reference, not foundation.

**Phase 5a (3 weeks, restart):** Timesheets, Invoices, **Month-end close agent** (the headline differentiator), Expenses, Dashboard 1.5. Rebuild under the 57-item bar. Test-first. Critic-gated. Ends with the 13/13 MVP acceptance test green.

**STOP at the end of Phase 5a.** Hand to the founder for the demo decision.

Phase 5b, 6, 7, §16 Deploy Track all founder-triggered.

---

## 14. The hard truths

- The €35/seat positioning depends on the **month-end close agent** (the AI operations analyst pitch) being demonstrably real. It currently does not exist as code. Without it, the price point is unjustifiable. Building it is the single highest-leverage two weeks of work in the entire roadmap.
- The MVP acceptance test (`EXECUTION_CHECKLIST.md §6.2`, 13 steps) **cannot be run today**. Steps 4 (log timesheet entries), 5 (manager approves), 6 (trigger month-end), 7 (see drafts with explanations), 8 (confirm invoice + WeasyPrint PDF), 9 (dashboard reflects), 10 (submit expense + OCR auto-fill), 11 (approve expense), 12 (verify mobile), 13 (verify no horizontal scroll) all fail. Step 2 (CSV onboarding) cannot run because Phase 3a is not done.
- The current frontend is a polished mockup that demos by clicking forward and dies on every sideways or back click. A pilot prospect at hour 2 of an evaluation will discover this, will lose trust, and will not sign.
- The fix is not "more critics yelling at the same agent". The fix is critic subagents that hold a structured veto. PROMPT.md installs them.

If a single OPUS item is left red on a feature, the feature is not done. There is no minor item. There is no demo-ready-enough. Either the work passes all 57 OPUS items per page across all 13 Tier-1 features, or v1.0 ships at a quality the founder will be embarrassed by at hour 2 of pilot 1.

The only acceptable outcome is: pass all 57.

---

**End of OPUS_CRITICS.md.**
