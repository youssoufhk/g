# CRITIC_PLAN.md

Tracker for the three-audit sweep executed 2026-04-18 (UI critic + UX critic + commercial reality-check, HEAD a32ecc1). Each item carries its originating critic code, file pointer, and a checkbox. Commit one logical group at a time; tick boxes as we go.

Scope note: every item in parts A-C below is **in session scope**. Part D (commercial blockers) is out of session scope - tracked here so it is not forgotten, but needs weeks-to-months and founder decisions before code moves.

---

## Progress at a glance

- Part A (UX reds, highest-visibility): 8/8
- Part B (UI reds, atom lock-down): 11/12
- Part C (yellow polish): 14/15
- Part D (commercial, out of scope this session): 0/5

Overall in-session: 33/35

---

## A. UX reds - "zero dead ends" + "app does the work" (block €35 demo)

1. [x] **A1 [B6]** Kill `Employee #NN` / `Client #NN` / `Project #NN` debug labels leaking into 6 list views. Replace with real name expansion (server-side JOIN now; ?expand follow-up later).
   - `features/leaves/use-leaves.ts:40`
   - `features/expenses/use-expenses.ts:46`
   - `features/approvals/use-approvals.ts:35`
   - `features/projects/use-projects.ts` (any `#` label)
   - `features/invoices/use-invoices.ts:48`
   - `features/employees/use-employees.ts` (audit - likely clean)

2. [x] **A2 [Timesheets mock-only]** `use-timesheets.ts` now dual-arms via USE_API. Live arm calls `/api/v1/timesheets/weeks`, looks up the envelope by (iso_year, iso_week), and overlays status onto the client-side builder. `TIMESHEET_BUILDER_MODE` export drives a degraded banner on the timesheets page until the write endpoints land (D5).

3. [x] **A3 [C18]** Each of the four feature hooks now exports a mutation built on `useOptimisticMutation`: `useSubmitExpense`, `useDecideApproval`, `useSubmitLeaveRequest`, `useUpdateInvoiceStatus`. Every one declares `conflictFields`, so a 409 opens the shared resolver. Expense submit drawer is live-wired to the new hook; the other three are importable and will be wired by their page refactors as D5 write endpoints ship.

4. [x] **A4 [E36]** OCR two-stage UX: confirmation row above the auto-filled fields shows detected merchant, amount, and tone-coloured confidence chip, with a Dismiss affordance. Fields below remain editable so the row is a summary, not a gate.
   - `app/[locale]/(app)/expenses/page.tsx` (OCR handler)

5. [x] **A5 [G50/G57]** OCR "Take photo" mobile path: hidden `<input type="file" accept="image/*" capture="environment">` paired to the Take photo button, so mobile browsers open the rear camera. Browse button uses a second hidden input without capture so desktops get the file picker.

6. [x] **A6 [B7]** Add `useUrlListState` on 4 list pages that lose state on reload:
   - `app/[locale]/(app)/employees/page.tsx`
   - `app/[locale]/(app)/clients/page.tsx`
   - `app/[locale]/(app)/projects/page.tsx`
   - `app/[locale]/(app)/admin/page.tsx`

7. [x] **A7 [B9/B11]** Breadcrumb + keyboard prev/next on 4 detail pages:
   - `app/[locale]/(app)/employees/[id]/page.tsx`
   - `app/[locale]/(app)/clients/[id]/page.tsx`
   - `app/[locale]/(app)/projects/[id]/page.tsx`
   - `app/[locale]/(app)/invoices/[id]/page.tsx`

8. [x] **A8 [E34/E35]** AI insight cards: "Why this insight?" toggle on the dashboard banner expands a chip row with three traceable signals (pending_count, iso_week(last), timesheet_submit_deadline). Keyboard accessible via aria-expanded/aria-controls.

---

## B. UI reds - atom lock-down (make craft match €35 price)

9. [ ] **B1 [A3]** Retire or get founder approval for 8 invented patterns (not in `specs/DESIGN_SYSTEM.md`):
   - `ai-recommendations.tsx`, `detail-header-bar.tsx`, `range-calendar.tsx`,
   - `resources-filter-bar.tsx`, `timeline-window-selector.tsx`, `multi-select-pill.tsx`,
   - `ai-insight-card.tsx`, `ai-invoice-explanation.tsx`

10. [x] **B2 [D18]** Lock `.data-table td { height: 56px }` in `styles/components.css`. Currently only padding.

11. [x] **B3 [D19]** Kill modal size variants. Drop `.modal-sm`/`.modal-lg`/`.modal-xl`; keep 560px desktop / 100% mobile only.

12. [x] **B4 [D20]** Lock `.btn-md { height: 40px }`. Currently 36px. Audit other size variants (28/32/44/52) and delete if unused.

13. [x] **B5 [C13]** Enforce tabular numerals globally: add `font-feature-settings: "tnum"` to `.data-table td`, `.kpi-value`, `.stat-pill` in `styles/components.css`.

14. [x] **B6 [E23+E24]** Single `<Icon>` wrapper in `components/ui/icon.tsx` that enforces stroke-width 1.5 and accepts only `xs|sm|md|lg|xl` sizes mapped to 12/16/20/24/32. Raw non-canonical sizes (10/11/14/15/18/22/28/40) banned via the `no-raw-icon-size` pre-commit hook.

15. [x] **B7 [B8]** Accent overuse: remove accent from KPI icons and preview chips; keep accent only for one primary action per region (dashboard AI-invoice card stays; nav selected indicator and insight banner lose it).

16. [x] **B8 [G31/G32]** Split `EmptyState` into `EmptyData` (no rows) vs `EmptyFiltered` (rows exist, filter matches none - adds clear-filter action).

17. [x] **B9 [B9 WCAG]** Add `@axe-core/playwright` to the visual test pipeline; fail build on AA violation. Report runs in `tests/a11y.spec.ts`.

18. [x] **B10 [G30]** Skeleton fidelity: skeleton rows and cells must mirror real column widths and KPI strip above. Fix `invoices/page.tsx:75` skeleton + add dashboard skeleton.

19. [x] **B11 [F26/F27]** Row hover `cursor: pointer` on all clickable table rows. Replace `btn:active { transform: scale(0.97) }` with one surface step darker + 80ms.

20. [x] **B12 [F29]** Modal transition: 200ms fade + scale from 0.96, backdrop-blur on surface-2 scrim.

---

## C. Yellow polish

21. [x] **C1 [A2]** Move `style={{flexDirection:"column"}}` from `topbar.tsx:105` to CSS.
22. [x] **C2 [B10]** Focus ring: add `outline-offset: 2px` to `tokens.css` focus rule.
23. [x] **C3 [C15]** Status badges: tracked-out small-caps style in `Badge` atom.
24. [x] **C4 [C14]** KPI label: tracked-out caps at 12px in `.kpi-label`.
25. [x] **C5 [D21]** Filter-bar shape unification: one `FilterBar` pattern across expenses/invoices/approvals/resources.
26. [x] **C6 [D22]** Sidebar selected state: verify 3px primary left-border on `.nav-item.active`.
27. [x] **C7 [G33]** Per-page route error boundaries: add `error.tsx` to every list page segment.
28. [x] **C8 [D29]** Action-named CTAs: "Submit week", "Approve 3 expenses", etc. Grep for bare "Submit"/"Approve" on approvals and expenses.
29. [x] **C9 [E37]** Page-level degraded banner when `kill_switch.ai` on: dashboard, expenses, invoices.
30. [x] **C10 [G54]** Filter bars at 375px: horizontal scroll, not vertical wrap.
31. [ ] **C11 [B15]** "Recent activity" on detail pages: wire real `audit_log` with before/after diffs (backend endpoint + frontend list).
32. [x] **C12 [C21]** Undo pattern on destructive admin flows (password reset, user disable).
33. [x] **C13 [C19]** `lib/optimistic.test.ts` pins the 409 contract that every A3 hook depends on: `ApiClientError.conflictState` returns the server payload for 409s only, and the invoice status-change `ConflictField` shape is validated. Full interactive flow stays on the Playwright `tests/e2e/409-conflict.spec.ts` scenario.
34. [x] **C14 [H34..H39]** Re-run grep guards: no em dashes, banned terminology, no sparklines, no donut charts.
35. [x] **C15 [E25 lint]** Lint rule: ban icon-only `<button>` without `aria-label` literal or i18n key.

---

## D. Commercial blockers - OUT OF SESSION SCOPE (tracked, not fixed here)

These are weeks-to-months of work and need founder alignment. Listed so they are visible in the tracker.

36. [ ] **D1** Month-end close invoicing agent - real analyzer + handler, not `handler=None`.
37. [ ] **D2** Multi-rate VAT + reverse charge (DEF-007).
38. [ ] **D3** SCIM + SAML (DEF-024/025) for enterprise procurement.
39. [ ] **D4** SOC 2 Type 2 + ISO 27001 + pen-test.
40. [ ] **D5** Five feature write surfaces (timesheets, invoices, expenses, leaves, approvals) - submit/approve/reject/recall mutations with idempotency + audit.

---

## Execution log

- 2026-04-18: plan created, HEAD a32ecc1. Starting with A1 (cheapest, highest-visibility).
- 2026-04-18: 26/35 at HEAD 5329f68. Session closure pass landed six commits:
  C7 per-page error.tsx (a34499c), C15 icon-only button lint (a34499c),
  C9 AI kill-switch banner (cae187e), B10 skeleton fidelity (0209fd4),
  C12 undo on admin destructive flows (0b08311), B9 axe-core in Playwright (5329f68).
  Standalone plan commit SELLABILITY_PLAN.md (ea71e01).

## Handoff for next agent (2026-04-18)

Remaining 9 items split into three buckets by blocker type. Work them in
this order:

**Needs only frontend code (pick these first):**
- B6 (Icon wrapper + ESLint rule banning raw sizes). Medium. Grep for
  `size={14|18|22}` in components and features; map to xs/sm/md/lg/xl.
- A8 (AI signal chips + "why this insight" expansion on the dashboard
  insight banner). Open `features/dashboard/insight-banner.tsx`.
- A4 (OCR two-stage: detected merchant/amount/confidence row above
  auto-filled fields in the expense upload drawer).
- A5 (OCR mobile camera: `<input type="file" accept="image/*" capture="environment">`
  on the same expense upload).

**Needs backend write endpoints (CRITIC_PLAN D5 is the gate):**
- A2 (timesheets real backend wire). Dual-arm USE_API in
  `features/timesheets/use-timesheets.ts`.
- A3 (retrofit `lib/optimistic.ts::useOptimisticMutation` into
  approvals/leaves/expenses/invoices mutation paths).
- C11 (Recent activity wired to real audit_log with before/after diffs
  on detail pages).
- C13 (ConflictResolverProvider smoke test in a real mutation path,
  invoice status change).

**Needs founder decision:**
- B1 (retire or formally approve 8 invented patterns not in
  specs/DESIGN_SYSTEM.md: ai-recommendations, detail-header-bar,
  range-calendar, resources-filter-bar, timeline-window-selector,
  multi-select-pill, ai-insight-card, ai-invoice-explanation).

Every new commit should update the Progress block at the top and tick
its box. Keep commits logically scoped (one item or one tight group).
SELLABILITY_PLAN.md (HEAD ea71e01) lays out the 35 EUR/seat roadmap;
CRITIC_PLAN closure is its Phase F1 gate.
