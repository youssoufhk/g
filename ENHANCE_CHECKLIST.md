# GammaHR v2 — Enhancement Checklist
**Generated:** 2026-04-06
**Critics:** 11 | **Total issues ingested:** ~460 | **After dedup:** 271

---

## Summary Table

| Page/File | CRIT | HIGH | MED | LOW | Total |
|-----------|------|------|-----|-----|-------|
| _shared.js / CSS | 3 | 7 | 6 | 3 | 19 |
| index.html | 5 | 9 | 7 | 4 | 25 |
| employees.html | 1 | 7 | 5 | 4 | 17 |
| timesheets.html | 2 | 6 | 6 | 3 | 17 |
| leaves.html | 2 | 5 | 4 | 2 | 13 |
| expenses.html | 3 | 5 | 5 | 1 | 14 |
| projects.html | 2 | 4 | 3 | 2 | 11 |
| clients.html | 2 | 5 | 3 | 2 | 12 |
| invoices.html | 2 | 5 | 3 | 2 | 12 |
| calendar.html | 2 | 5 | 3 | 2 | 12 |
| gantt.html | 2 | 6 | 3 | 3 | 14 |
| planning.html | 2 | 5 | 4 | 1 | 12 |
| approvals.html | 3 | 6 | 3 | 2 | 14 |
| insights.html | 3 | 7 | 5 | 2 | 17 |
| hr.html | 4 | 7 | 4 | 3 | 18 |
| admin.html | 3 | 5 | 3 | 2 | 13 |
| account.html | 0 | 2 | 4 | 2 | 8 |
| auth.html | 0 | 3 | 3 | 1 | 7 |
| portal/index.html | 3 | 6 | 4 | 3 | 16 |
| portal/auth.html | 0 | 1 | 1 | 0 | 2 |
| **TOTAL** | **44** | **110** | **81** | **44** | **279** |

> Note: Many items affect multiple pages; row counts reflect primary page assignments. Net unique items after deduplication: 271.

---

## Issue Count by Domain

| Domain | CRIT | HIGH | MED | LOW | Total |
|--------|------|------|-----|-----|-------|
| [FEEL] UX Feeling | 14 | 51 | 36 | 12 | 113 |
| [FEAT] Feature Completeness | 5 | 9 | 10 | 4 | 28 |
| [DATA] Data Integrity | 5 | 13 | 8 | 4 | 30 |
| [ANIM] Animation | 4 | 6 | 7 | 4 | 21 |
| [VIS] Visual Design | 5 | 9 | 13 | 6 | 33 |
| [MOB] Mobile | 4 | 9 | 8 | 6 | 27 |
| [INT] Interaction | 7 | 9 | 6 | 4 | 26 |
| [RBAC] Role Access | 5 | 8 | 5 | 3 | 21 |
| [EDGE] Empty States | 4 | 11 | 10 | 7 | 32 |
| [TYPO] Typography | 6 | 11 | 16 | 9 | 42 |
| [RICH] Data Richness | 4 | 11 | 10 | 6 | 31 |

---

## Top 10 Highest-Impact Items
(Plain language for a non-technical product owner)

1. **Every employee's name, role, and department is wrong across the whole app.** "Carol Kim" appears everywhere but should be "Carol Williams." Bob Taylor shows as active when he's on bench. Alice Wang has the wrong department. Any live demo will immediately surface these contradictions and destroy credibility.

2. **Modals snap shut with no animation.** When any popup closes — approving a timesheet, saving a client, generating an invoice — it disappears with a jarring flash. Every competitor has a smooth fade-out. This makes the product feel unfinished.

3. **There is no "Add Candidate" button in HR Recruitment.** The main action a hiring manager needs — adding a new candidate — doesn't exist anywhere on the page. The entire Recruitment Kanban is read-only.

4. **KPI numbers don't animate on load.** Competitors like Revolut and Linear show numbers counting up when a dashboard loads, creating a sense of live data. Our numbers appear as static text, making the dashboard look flat.

5. **Employees can approve other people's timesheets and expenses.** There's no permission gating: an employee who logs in can approve their own manager's expense claims, see all colleague salaries, and access company-wide financial data. This is a fundamental security and credibility problem.

6. **The "Send Invoice" button has no confirmation.** One click sends an invoice to a client with no preview, no "are you sure," and no ability to check the recipient. A misclick can send the wrong invoice to the wrong client.

7. **Most analytics charts have no date range filter.** Every chart in Insights is locked to hardcoded data. Users cannot ask "show me last quarter" or "compare to last year."

8. **The AI receipt scanner extracts data but never fills the form.** When a user uploads a receipt, the AI correctly identifies the vendor, amount, and date — then the user has to type it all in again manually. The whole point of AI extraction is defeated.

9. **Mobile users can't create calendar events.** The "Add Event" button does nothing. Clicking any day on the calendar also does nothing. The entire calendar is read-only on mobile.

10. **Numbers throughout the product use the wrong font style for financial data.** In premium financial software, numbers in tables "line up" because each digit takes the same width. Our numbers wobble — a subtle but immediately noticeable quality gap to anyone familiar with Stripe or Bloomberg.

---

## Systemic Patterns
(Fix once in shared CSS/JS — propagates to all pages automatically)

- **[SYSTEMIC-DATA]** "Carol Kim" name wrong across 11+ files — correct to "Carol Williams, Design Lead, Design dept, 90% work time" everywhere. Files: employees.html, gantt.html, index.html, admin.html, approvals.html, planning.html, timesheets.html, insights.html, clients.html, projects.html, portal/index.html. *Also flagged by: DATA, RICH, FEEL, VIS, FEAT*

- **[SYSTEMIC-DATA]** Bob Taylor work time shown as 72% in multiple files — correct value is 0% (Bench, no project). Files: employees.html, gantt.html, index.html, approvals.html, insights.html, expenses.html. *Also flagged by: DATA, RICH*

- **[SYSTEMIC-DATA]** David Park work time varies (45% canonical vs 65%, 72%, 60% shown) — correct value 45% everywhere. Files: employees.html, gantt.html, admin.html, approvals.html, insights.html. *Also flagged by: DATA*

- **[SYSTEMIC-TYPO]** `font-variant-numeric: tabular-nums` missing everywhere — add to `.stat-value`, `.font-mono`, and all financial/numeric displays in `_components.css`. *Also flagged by: VIS, TYPO, RICH*

- **[SYSTEMIC-ANIM]** Modal exit animation absent on all 21 HTML files — add `.removing` class + `@keyframes modalOut` (fade + scale to 0.95, 200ms) + delay-then-remove pattern to `_components.css`. *Also flagged by: ANIM, FEEL*

- **[SYSTEMIC-ANIM]** KPI counter roll animation absent on all data pages — add `countUp()` / number-roll function to `_shared.js`, call on page load for all `.stat-value` elements. *Also flagged by: ANIM, FEEL, RICH*

- **[SYSTEMIC-ANIM]** Chart draw-in animation missing on all pages — add SVG `stroke-dashoffset` animation + IntersectionObserver trigger in `_shared.js`. *Also flagged by: ANIM*

- **[SYSTEMIC-RBAC]** `data-min-role` / `data-sensitive` attributes missing on 12+ pages — add role-gating to admin.html (whole page), approvals.html, timesheets approval queue, expenses approval queue, leaves team tab, invoices.html, insights revenue/AI, hr.html, gantt.html, planning.html. *Also flagged by: RBAC, FEEL*

- **[SYSTEMIC-VIS]** Modal glassmorphism never fires — `.modal` uses `var(--color-surface-2)` flat; fix by moving `backdrop-filter: blur(20px) saturate(1.2)` and `--glass-bg` to `.modal` directly in `_components.css`. *Also flagged by: VIS*

- **[SYSTEMIC-TYPO]** `letter-spacing: 0.5px` hardcoded in 20+ locations — define `--letter-spacing-caps: 0.05em` token in `_tokens.css` and replace all instances. *Also flagged by: TYPO*

- **[SYSTEMIC-FEEL]** "Toggle Empty State" debug button visible in UI on multiple pages — must be removed from all production-facing HTML files. *Also flagged by: FEEL (x2)*

- **[SYSTEMIC-FEEL]** Command palette searches nav links only, not data entities — extend `_shared.js` command palette to search employees, clients, projects, invoices by name. *Also flagged by: FEEL, FEAT*

- **[SYSTEMIC-FEEL]** "Marie Kowalski, Resource Manager" appears as logged-in user in gantt.html — correct to "Sarah Chen, Admin" consistent with all other pages. *Also flagged by: FEEL, DATA*

- **[SYSTEMIC-RBAC]** Keyboard shortcuts G→S (admin.html) and G→I (invoices.html) fire for all roles without a role check — add guard to `GHR.gotoShortcuts` in `_shared.js`. *Also flagged by: RBAC*

- **[SYSTEMIC-ANIM]** Skeleton `GHR.initSkeletons()` not called on 8 pages — add call to approvals.html, insights.html, hr.html, admin.html, account.html, planning.html, portal/index.html, auth.html. *Also flagged by: ANIM*

---

## Full Issue List

---

### CRITICAL

- [x] [CRITICAL] [FEEL] [expenses.html] — EASE — "Scan with AI" extracts vendor, amount, date, and category but does NOT pre-fill the form fields below. User must re-enter all data the AI already holds. Fix: auto-scan on upload + auto-fill form fields. *Also flagged by: FEAT*

- [x] [CRITICAL] [FEEL] [leaves.html] — CALM — "Cancel Request" on a pending leave fires immediately with no confirmation dialog. One misclick cancels with no undo.

- [ ] [CRITICAL] [FEEL] [approvals.html] — CALM — "Approve All Visible" uses browser native `window.confirm()` dialog. Destroys the design language. Must use a custom confirmation modal.

- [ ] [CRITICAL] [FEEL] [invoices.html] — CALM — "Send to Client" fires immediately with no confirmation step, no email preview, no ability to review recipient. An invoice can be emailed to the wrong client in one click.

- [x] [CRITICAL] [FEEL] [hr.html] — EASE — Recruitment tab has no visible "Add Candidate" button. Primary action for a recruitment manager is absent. *Also flagged by: FEAT, INT*

- [ ] [CRITICAL] [FEEL] [projects.html] — EASE — Timeline view toggle renders a blank panel. Clicking "Timeline" shows an empty container. A core view is broken. *Also flagged by: INT*

- [ ] [CRITICAL] [FEEL] [clients.html] — EASE — Notes textarea has no autosave. Edits silently lost if user navigates away without clicking Save. No draft state or unsaved-changes warning.

- [ ] [CRITICAL] [FEEL] [gantt.html] — COMPLETENESS — Gantt view header displays "Marie Kowalski, Resource Manager" as logged-in user. Sarah Chen is the user everywhere else. Identity inconsistency destroys data trust. *Also flagged by: DATA*

- [ ] [CRITICAL] [FEEL] [admin.html] — EASE — Expense type "Edit" buttons call `openConfigEdit('Leave Type', ...)` — copy-paste bug. Clicking Edit on an Expense Type opens the Leave Type editor.

- [x] [CRITICAL] [FEEL] [portal/index.html] — EASE — Client invoice view has no payment button. The portal's primary conversion action is completely absent.

- [x] [CRITICAL] [FEEL] [index.html] — COMPLETENESS — Dashboard greeting says "Good morning, Sarah" with no context awareness. Sarah has 3 overdue approvals, 2 employees over capacity, an invoice due today. Wasted intelligence moment.

- [x] [CRITICAL] [FEEL] [timesheets.html] — EASE — Project rows in the weekly grid are not pre-populated from the employee's active assignments. Users must manually add every project they're assigned to, every week. Maximum Tempolia behavior.

- [x] [CRITICAL] [FEEL] [index.html] — DATA — Alice Wang appears as "UX Designer" in the team table but hovercard says "Senior Developer." Role data inconsistent within the same page. *Also flagged by: DATA*

- [ ] [CRITICAL] [DATA] [employees.html, gantt.html, index.html, admin.html, approvals.html, planning.html, timesheets.html, insights.html, clients.html, projects.html, portal/index.html] — **SYSTEMIC** — Employee #5 named "Carol Kim" throughout; canonical name is "Carol Williams" — Design Lead, Design dept, 90% work time. *Also flagged by: RICH, FEEL, VIS, FEAT*

- [ ] [CRITICAL] [DATA] [employees.html, gantt.html, index.html, approvals.html] — Alice Wang shown as "Senior Developer" in Engineering dept; canonical is Design dept. *Also flagged by: FEEL*

- [ ] [CRITICAL] [DATA] [employees.html, gantt.html, index.html, approvals.html] — Bob Taylor's work time shown as 72% across files; canonical value is 0% (Bench). *Also flagged by: RICH*

- [ ] [CRITICAL] [DATA] [employees.html, gantt.html] — Carol shown as "HR Manager" dept "HR" 78% work time; canonical: Design Lead, Design, 90%. *Also flagged by: RICH*

- [ ] [CRITICAL] [DATA] [admin.html line 651] — Emma Laurent status is "Inactive" in admin users table; correct value: Active.

- [x] [CRITICAL] [DATA] [index.html] — Dashboard "Team Work Time" table values do not match canonical data contract. Must use: Sarah 87%, John 82%, Marco 88%, Carol 90%, Alice 45% On Leave, David 45%, Emma 78%, Bob 0% Bench. *Also flagged by: RICH*

- [x] [CRITICAL] [ANIM] [_layout.css] — Mobile sidebar drawer has no transform transition. `.sidebar` transition only covers `width`, not `transform`. Drawer snaps open/close instantly. Fix: add `transform var(--motion-normal) var(--ease-in-out)` to `.sidebar` transition.

- [x] [CRITICAL] [ANIM] [_components.css + all 21 HTML files] — **SYSTEMIC** — Modal exit animation completely absent on every page. No `.removing`, `@keyframes modalOut`, or delay-then-remove pattern. Every modal snaps away with no exit animation. *Also flagged by: FEEL*

- [x] [CRITICAL] [ANIM] [all data pages] — **SYSTEMIC** — KPI/stat counter roll animation completely missing. No `countUp`, `animateCounter`, or number-roll function exists in `_shared.js` or any page. KPI values appear as static text immediately on load. *Also flagged by: FEEL, RICH*

- [x] [CRITICAL] [ANIM] [all chart pages] — **SYSTEMIC** — Chart draw-in animation completely missing. All SVG charts are static with hardcoded `stroke-dasharray`. No animated `stroke-dashoffset`, `@keyframes chartDraw`, or IntersectionObserver anywhere.

- [ ] [CRITICAL] [VIS] [insights.html] — Work Time bar for Sarah Chen (95%) uses `var(--color-error)` incorrectly. Carol (90%) uses `var(--color-warning)` for a healthy-range value. Spec: success=75–100%, warning=50–75%, error only >110% or <50%.

- [x] [CRITICAL] [VIS] [_components.css] — **SYSTEMIC** — Modal glassmorphism never fires. `.modal` uses flat `var(--color-surface-2)`. Glassmorphism rule targets `.modal-content` but actual class is `.modal`. Every modal is a flat charcoal box with no blur. *Also flagged by: FEEL*

- [x] [CRITICAL] [VIS] [_layout.css mobile] — Mobile stat card trend `font-size: 0.65rem` (10.4px) is below 13px WCAG minimum. Below spec's `body-sm` threshold.

- [x] [CRITICAL] [VIS] [index.html] — Revenue bar chart Y-axis labels hardcoded at `font-size: 9px` inline. Below spec's minimum `--text-overline` (11px). Sub-pixel on high-DPI displays. *Also flagged by: TYPO*

- [ ] [CRITICAL] [VIS] [projects.html] — Gantt bars in project detail timeline use raw hardcoded `hsl(155,26%,38%)` and `hsl(200,40%,44%)` instead of CSS token variables. Bypasses design system. *Also flagged by: TYPO*

- [ ] [CRITICAL] [TYPO] [ALL PAGES — 14 pages affected] — `h2.page-title` in sticky top header and `h1.page-title` in content body both resolve to identical styling. Two heading-1s compete on every page. Header title should use `var(--text-heading-3)` / `var(--weight-medium)` or be `aria-hidden=true`.

- [x] [CRITICAL] [TYPO] [ALL PAGES — KPI stat cards] — **SYSTEMIC** — `.stat-value` has no `font-variant-numeric: tabular-nums` anywhere in CSS. All KPI metrics use proportional figures, causing column misalignment. *Also flagged by: VIS*

- [x] [CRITICAL] [TYPO] [_layout.css:387] — `.stat-card .stat-value` mobile override uses hardcoded `font-size: 1.25rem` instead of `var(--text-heading-2)`.

- [x] [CRITICAL] [TYPO] [_layout.css:388] — `.stat-card .stat-trend` mobile override uses hardcoded `font-size: 0.65rem` — off-grid, no token. Use `var(--text-overline)`.

- [ ] [CRITICAL] [TYPO] [projects.html:1144] — Gantt mini-chart bar `background: hsl(155,26%,38%)` hardcoded raw HSL. Use `var(--color-primary-active)`.

- [ ] [CRITICAL] [TYPO] [projects.html:1180] — Gantt mini-chart bar `background: hsl(200,40%,44%)` hardcoded raw HSL. Use `var(--color-info)` with adjusted opacity.

- [ ] [CRITICAL] [TYPO] [gantt.html:1247] — Finance group header `background: hsla(43,74%,66%,0.15)` — orphaned off-palette color. Use `var(--color-gold-muted)`.

- [x] [CRITICAL] [FEAT] [hr.html] — §21.2 — No "Add Candidate" button or modal on Recruitment Kanban. Users cannot create new candidates at all. *Also flagged by: INT, FEEL*

- [x] [CRITICAL] [FEAT] [hr.html] — §21.5 — Employee Records tab missing document storage (contract PDF, ID copy, certifications), emergency contact fields, and "Upload Document" action.

- [ ] [CRITICAL] [FEAT] [insights.html] — §15.1/§1.3 — No date range selector or period filter on any analytics tab. Users cannot filter analytics to any time period. *Also flagged by: FEEL*

- [ ] [CRITICAL] [FEAT] [planning.html] — §16.1 — Resource Allocation Matrix (employee × project grid) entirely absent. Page jumps from capacity chart to bench management with no cross-matrix view.

- [x] [CRITICAL] [FEAT] [expenses.html] — §7.1 — "Team Expenses" tab is missing. Blueprint specifies three tabs: My Expenses / Team Expenses / Analytics.

- [ ] [CRITICAL] [MOB] [clients.html] — Team tab inside client detail uses hard-coded pixel widths on sibling divs with no mobile stacking. Total inline width ~480px vs 320px viewport.

- [x] [CRITICAL] [MOB] [expenses.html] — Main expense list (`.expense-item`) horizontal flex with `min-width: 100px` and `flex-shrink: 0`. No mobile stacking breakpoint. Overflows at 320px.

- [x] [CRITICAL] [MOB] [expenses.html] — Analytics tab 4-column grid containing a `<table>` ("Top Spenders") with no `overflow-x:auto` wrapper and no `mobile-cards` class. Overflows below ~480px.

- [ ] [CRITICAL] [MOB] [calendar.html] — Week view collapses to 1 column on mobile. No day-switcher control or swipe indicator. Users at 320px cannot access 6 of 7 days.

- [ ] [CRITICAL] [MOB] [planning.html] — "What-If Scenarios" inline SVG `viewBox="0 0 700 200"` — chart bars and labels become ~7px and unreadable at 320px.

- [ ] [CRITICAL] [INT] [calendar.html] — "Add Event" button (`id="addEventBtn"`) has no event handler. Clicking does nothing. *Also flagged by: FEEL*

- [x] [CRITICAL] [INT] [portal/index.html] — "Export Report" button in Timesheets section has no onclick. Silently fails.

- [ ] [CRITICAL] [INT] [insights.html] — "Export" button in AI response panel — bare button with no handler.

- [ ] [CRITICAL] [INT] [insights.html] — "Show Data" button in AI response panel — no handler. Clicks produce nothing.

- [ ] [CRITICAL] [INT] [insights.html] — "View Profile" button on AI-recommended staff card (line 608) — no onclick, no href, no handler.

- [x] [CRITICAL] [INT] [hr.html] — Kanban drag-and-drop not implemented. No `draggable="true"`, no dragstart/dragover/drop handlers. Cards are visually interactive but immovable. *Also flagged by: FEEL*

- [x] [CRITICAL] [INT] [hr.html] — "Filter" button in Recruitment Pipeline header — no handler. Clicking does nothing.

- [x] [CRITICAL] [INT] [hr.html] — "Export" button in Recruitment Pipeline header — no handler. Completely dead.

- [x] [CRITICAL] [RBAC] [_shared.js] — Only 7 of 19 pages have any `data-min-role` attributes. Switching to Employee role changes nothing on 12 pages. All roles see identical content. *Also flagged by: FEEL*

- [ ] [CRITICAL] [RBAC] [admin.html] — Entire admin.html page renders fully for PM and Employee roles. Only one `data-min-role="admin"` on one KPI row. No permission gate, no redirect.

- [ ] [CRITICAL] [RBAC] [approvals.html] — Entire approvals page (Approve/Reject, Bulk Approve, Reject All) has zero `data-min-role` attributes. Employees can action team approvals.

- [x] [CRITICAL] [RBAC] [timesheets.html] — "Approval Queue" tab has no `data-min-role="pm"` gate. Employees see and can approve/reject colleagues' timesheets.

- [x] [CRITICAL] [RBAC] [expenses.html] — "Approval Queue" tab has zero `data-min-role` attributes. Employees can view and approve other employees' expense submissions.

- [x] [CRITICAL] [RBAC] [leaves.html] — "Team Leaves" tab has no `data-min-role="pm"` gate. Employees see the entire team's leave history.

- [x] [CRITICAL] [EDGE] [index.html] — Notification panel after "Mark all read" — no "All caught up!" empty state. Panel stays populated with stale items, no visual completion state.

- [x] [CRITICAL] [EDGE] [hr.html] — Recruitment Kanban columns have no per-column empty state. Empty columns render as blank white space.

- [x] [CRITICAL] [EDGE] [employees.html] — Employee search returning zero results shows blank white space. No "No employees match" message, no "Clear search" button.

- [x] [CRITICAL] [EDGE] [timesheets.html] — Approval Queue filter returning zero items collapses to empty space silently. No "No timesheets match your filters" state with "Clear Filters" CTA.

- [x] [CRITICAL] [EDGE] [portal/index.html] — `#sec-empty` element referenced in JS via `toggleEmptyState()` but never defined in HTML. Empty state toggle silently fails, rendering blank page for new clients.

- [x] [CRITICAL] [RICH] [index.html] — "Pending Approvals" KPI card has no sparkline and no trend percentage. Every other KPI card has one; this is conspicuously bare. *Also flagged by: FEEL*

- [x] [CRITICAL] [RICH] [employees.html] — Employee cards display incorrect work time percentages for all 8 canonical employees. Carol Williams absent (shows "Carol Kim / HR Manager"). *Also flagged by: DATA*

- [ ] [CRITICAL] [RICH] [insights.html] — Team Performance chart: Bob Taylor at 42% (canonical 0%), Carol at 85% (non-canonical name + wrong value). Contradiction between AI tab and chart destroys demo credibility. *Also flagged by: DATA*

- [ ] [CRITICAL] [RICH] [insights.html] — Revenue tab donut chart legend inconsistent with canonical client list. "Umbrella Corp" missing. Total €268k incompatible with dashboard Revenue Snapshot €68,400. *Also flagged by: DATA*

- [x] [CRITICAL] [RICH] [employees.html] — Employee profile (Sarah Chen) has no work time history chart. Profile looks like a basic HR card without the most important visualization — week-by-week work time trend.

---

### HIGH

- [x] [HIGH] [FEEL] [index.html] — EASE — AI Alerts panel shows generic "Dismiss" / "Investigate" buttons. Contextual actions absent: "Alice Wang's contract expires in 14 days" should offer "Renew Contract."

- [x] [HIGH] [FEEL] [index.html] — CALM — Mini Gantt preview shows allocation bars but no overallocation indicator. The one signal that would cause a manager to act is missing. *Also flagged by: RICH*

- [x] [HIGH] [FEEL] [index.html] — CALM — "Toggle Empty State" debug button visible in production prototype UI. Must be removed.

- [x] [HIGH] [FEEL] [index.html] — CALM — Shimmer loading placeholders use `visibility:hidden` then transition to content abruptly. No fade-in. *Also flagged by: ANIM*

- [x] [HIGH] [FEEL] [index.html] — ANTICIPATION — Activity feed shows raw event strings with no grouping, no threading, no ability to act on items directly from the feed. This is a log, not an intelligence surface.

- [x] [HIGH] [FEEL] [index.html] — EASE — KPI cards show current values but no trend arrows or period-over-period comparison. A manager cannot tell if revenue is up or down. *Also flagged by: RICH*

- [x] [HIGH] [FEEL] [timesheets.html] — EASE — "Copy" dropdown and "Copy Last Week" button perform overlapping functions. Duplication creates decision paralysis.

- [x] [HIGH] [FEEL] [timesheets.html] — CALM — Mobile day-switcher generates day cards via JS but employee names may appear blank due to DOM timing. *Also flagged by: MOB*

- [x] [HIGH] [FEEL] [timesheets.html] — CALM — Status bar ("3 of 5 days complete") and weekly summary panel ("Total: 24h") duplicate the same progress signal. One should be removed.

- [x] [HIGH] [FEEL] [timesheets.html] — COMPLETENESS — Rejection reason from a manager not displayed anywhere in the week view. An employee whose timesheet was rejected has no idea why.

- [x] [HIGH] [FEEL] [timesheets.html] — CALM — After clicking "Submit for Approval," no confirmation state, no timeline, no indication anything changed. Button disappears silently.

- [x] [HIGH] [FEEL] [expenses.html] — EASE — Receipt scan result shown in read-only preview panel but no "Apply to form" button. Extracted data displayed but never used.

- [x] [HIGH] [FEEL] [expenses.html] — CALM — Date input for expense date does not default to today. Most common scenario requires unnecessary interaction.

- [x] [HIGH] [FEEL] [expenses.html] — COMPLETENESS — No duplicate detection. Same receipt amount and vendor submitted twice in a month triggers no warning.

- [x] [HIGH] [FEEL] [expenses.html] — CALM — Rejection reason for a declined expense not shown inline on the expense card. Users must navigate into detail view to discover why.

- [x] [HIGH] [FEEL] [leaves.html] — EASE — Manager field in leave request form not auto-populated from the employee's reporting line. Users must manually select their own manager.

- [x] [HIGH] [FEEL] [leaves.html] — CALM — Leave balance bar at 100% (full balance unused) visually identical to 100% used balance bar. Direction of indicator ambiguous. *Also flagged by: VIS*

- [x] [HIGH] [FEEL] [leaves.html] — EASE — Date filter in leave history table defaults to 2-year window. Most common use case (current year) requires manual range adjustment.

- [x] [HIGH] [FEEL] [leaves.html] — COMPLETENESS — Team calendar does not show who is approving leave for a given period. During manager absence, pending requests have no visible fallback approver.

- [ ] [HIGH] [FEEL] [approvals.html] — CALM — Detail modal body contains literal placeholder text "would appear here in the full application." Visible to any user who opens an approval detail.

- [ ] [HIGH] [FEEL] [approvals.html] — EASE — Reject button has identical visual weight to Approve button on flagged items. Dangerous actions should not be equal in prominence.

- [ ] [HIGH] [FEEL] [approvals.html] — COMPLETENESS — Bob Taylor's timesheet shows only 8 hours for the week. System surfaces for approval with no alert that it is severely under the contracted 40h.

- [ ] [HIGH] [FEEL] [approvals.html] — EASE — No "approve with note" option. Approvers can only approve silently or reject with a note. Conditional approvals are impossible.

- [ ] [HIGH] [FEEL] [invoices.html] — CALM — Client dropdown and Project dropdown in invoice generation modal are unlinked. User can generate invoice for Acme Corp billed against a Globex project. No cross-validation.

- [ ] [HIGH] [FEEL] [invoices.html] — EASE — Invoice detail header contains 6 action buttons with no visual hierarchy. All buttons are equal weight. Primary action is not distinguished.

- [ ] [HIGH] [FEEL] [invoices.html] — CALM — Invoice list dates display month and day only ("Mar 15") with no year. Invoices from previous years are indistinguishable.

- [ ] [HIGH] [FEEL] [invoices.html] — COMPLETENESS — AI "Revenue Insight" card surfaces cross-sell recommendation with no action button. Insight cannot be acted on.

- [x] [HIGH] [FEEL] [hr.html] — COMPLETENESS — Clara Bergmann's onboarding checklist is 0% complete with start date 15 days away. No automated task assignments, no email triggers, no escalation visible.

- [x] [HIGH] [FEEL] [hr.html] — EASE — Offboarding task list has no owner assigned and no due date on any task. Static checklist with no accountability mechanism.

- [x] [HIGH] [FEEL] [hr.html] — CALM — Candidate score badges (e.g., "85/100") have no tooltip or explanation of scoring methodology.

- [x] [HIGH] [FEEL] [hr.html] — COMPLETENESS — No offer letter generation from the kanban. Moving a candidate to "Offer" stage requires exiting to a separate workflow.

- [x] [HIGH] [FEEL] [employees.html] — EASE — Header search bar opens command palette searching nav links, not employee directory entries. Typing "Alice" finds nothing.

- [x] [HIGH] [FEEL] [employees.html] — CALM — Page title in header reads "Timesheets" — copy-paste bug from shared template. Employees directory is labeled incorrectly.

- [x] [HIGH] [FEEL] [employees.html] — COMPLETENESS — Employee directory has no "Last Timesheet Submitted" or "Timesheet Status" column. Managers cannot identify late submissions from directory view.

- [ ] [HIGH] [FEEL] [planning.html] — COMPLETENESS — AI Bench Recommendations states "Bob Taylor on bench 3 weeks" but allocation matrix may simultaneously show Bob assigned to a project. AI and data surfaces contradict each other. *Also flagged by: DATA*

- [ ] [HIGH] [FEEL] [planning.html] — EASE — Allocation matrix cells not inline-editable. Changing an allocation requires 4 steps: click cell → modal → change value → save.

- [ ] [HIGH] [FEEL] [planning.html] — EASE — "Run Scenario" requires a button press and waiting state instead of live preview as inputs change.

- [ ] [HIGH] [FEEL] [projects.html] — CALM — "Health: On Track" and "Status: Active" are redundant badges on every project card. Same signal in two labels.

- [ ] [HIGH] [FEEL] [projects.html] — COMPLETENESS — Planning-stage projects with 0 assigned members show no forward staffing warning. System knows no one is allocated but does not surface this as risk.

- [ ] [HIGH] [FEEL] [clients.html] — CALM — AI Intelligence insight card positioned above client's basic identity and contact information. Secondary intelligence should not appear before primary facts.

- [ ] [HIGH] [FEEL] [clients.html] — COMPLETENESS — AI recommendation ("cross-sell data pipeline to TechCorp") provides no action button. Insight cannot be converted into a task or follow-up.

- [ ] [HIGH] [FEEL] [calendar.html] — EASE — View toggle buttons (Month/Week/Quarter/Year) use icon-only labels with no visible text on mobile. Users cannot identify current view. *Also flagged by: MOB*

- [ ] [HIGH] [FEEL] [calendar.html] — EASE — Clicking empty calendar date does not open new event form. Most expected interaction is absent. *Also flagged by: INT, EDGE*

- [ ] [HIGH] [FEEL] [calendar.html] — CALM — Public holidays hardcoded to single locale. No user-configurable holiday calendar.

- [ ] [HIGH] [FEEL] [gantt.html] — EASE — Gantt bars drag-to-edit on desktop but no touch-native alternative on mobile. Resource managers on tablets/phones cannot adjust allocations. *Also flagged by: MOB*

- [ ] [HIGH] [FEEL] [gantt.html] — CALM — Today marker (vertical line) not visually distinct from project boundary lines. Current date cannot be quickly located on a dense Gantt.

- [ ] [HIGH] [FEEL] [insights.html] — EASE — "Ask AI" section positioned below all static charts, requiring scroll past all analytics to reach the most intelligent feature on the page.

- [ ] [HIGH] [FEEL] [insights.html] — CALM — Sarah Chen shows 95% work time with red indicator but no action button. System surfaces a problem it cannot help you solve from this page.

- [ ] [HIGH] [FEEL] [insights.html] — COMPLETENESS — No scheduled report delivery. Managers cannot set up a weekly insights email. *Also flagged by: FEAT*

- [ ] [HIGH] [FEEL] [admin.html] — CALM — Delete action in Departments table triggers a toast "Are you sure?" A toast auto-dismisses. Delete may have already fired.

- [ ] [HIGH] [FEEL] [admin.html] — CALM — Destructive "Delete" buttons in settings tables are visually and spatially identical to "Edit" buttons. Misclick-deletion is a real risk.

- [ ] [HIGH] [FEEL] [account.html] — CALM — No "do not disturb" or focus-mode option in notification settings. Users in deep work cannot suppress non-critical pings.

- [x] [HIGH] [FEEL] [auth.html] — EASE — No magic link / passwordless login option. Email + password is the only authentication path.

- [x] [HIGH] [FEEL] [auth.html] — CALM — MFA setup step displays error message "Expected **123456** for this demo" — a visible prototype artifact. Must never appear in a product.

- [x] [HIGH] [FEEL] [auth.html] — EASE — Timezone not auto-detected from browser during company registration. New companies must manually set timezone.

- [x] [HIGH] [FEEL] [portal/index.html] — EASE — Pending approvals not surfaced at top of portal on login. Clients must scroll through all content to find what requires action.

- [x] [HIGH] [FEEL] [portal/index.html] — EASE — Timesheet table shows 24 entries with no ability to filter to "Pending Approval" only.

- [x] [HIGH] [FEEL] [portal/index.html] — CALM — Approval flag forms can be opened simultaneously on multiple timesheet rows. No mutual exclusivity. Multiple open forms create visual chaos.

- [x] [HIGH] [FEEL] [portal/index.html] — COMPLETENESS — No bulk approve action in the portal. A client approving a month of timesheets must click Approve on every individual row.

- [ ] [HIGH] [FEEL] [CROSS-CUTTING] — CALM — Sidebar navigation badge counts (Approvals "3" etc.) are hardcoded and do not update when items are approved during the prototype session.

- [ ] [HIGH] [FEEL] [CROSS-CUTTING] — EASE — Command palette (⌘K) searches nav links only, not data entities. Searching "Alice Wang" returns zero results. *Also flagged by: FEAT*

- [ ] [HIGH] [FEEL] [CROSS-CUTTING] — COMPLETENESS — "Toggle Empty State" debug button visible on multiple pages. Developer tool must not appear in user-facing UI.

- [ ] [HIGH] [FEEL] [CROSS-CUTTING] — CALM — Modal backdrop clicks do not consistently close modals. Some close on backdrop click; others require explicit × button. No consistent contract.

- [ ] [HIGH] [DATA] [approvals.html] — Marco Rossi hovercard shows role="Project Manager" dept="Engineering"; canonical: Operations Lead, Operations.

- [ ] [HIGH] [DATA] [approvals.html line 539] — John Smith hovercard shows data-worktime="88%"; canonical work time is 82%.

- [x] [HIGH] [DATA] [timesheets.html line 1219] — John Smith hovercard shows role="Engineering Manager" worktime="95"; canonical: Senior Developer, 82%.

- [ ] [HIGH] [DATA] [admin.html line 597] — Carol listed in dept="Analytics"; no Analytics dept in the canonical 6-department list. Correct: dept=Design.

- [x] [HIGH] [DATA] [index.html line 1102] — Carol hovercard shows role="HR Manager" dept="HR" worktime="78"; all wrong. Correct: Design Lead, Design, 90%.

- [ ] [HIGH] [DATA] [clients.html lines 1071/1175] — Alice Wang hovercard shows worktime="90"; canonical work time for Alice (on leave) is 45%.

- [ ] [HIGH] [DATA] [insights.html line 1381] — Carol hovercard shows role="PM" dept="Analytics" worktime="85"; all wrong. Correct: Design Lead, Design, 90%.

- [ ] [HIGH] [DATA] [gantt.html line 1841 comment] — Comment says "Marco Rossi - 95%" but canonical work time is 88%.

- [ ] [HIGH] [DATA] [projects.html line 2170] — "Add Member" modal shows work time with banned term "util." instead of "Work Time". Affects lines 2171-2172.

- [ ] [HIGH] [DATA] [projects.html line 2172] — Carol listed as "Finance Analyst" in Add Member dropdown; canonical role is Design Lead.

- [ ] [HIGH] [DATA] [David Park — all files] — David Park work time varies: 45% canonical vs 65% (employees/gantt), 72% (admin/approvals), "60%" (insights AI). Correct value: 45% everywhere.

- [ ] [HIGH] [DATA] [admin.html lines 557/563] — Sarah Chen listed with dept="Engineering" worktime="95"; canonical: Design dept, 87%.

- [ ] [HIGH] [ANIM] [approvals.html, insights.html, hr.html, admin.html, account.html, planning.html, portal/index.html, auth.html] — **SYSTEMIC** — Skeleton loading not initialized on 8 data-heavy pages. `GHR.initSkeletons()` not called. Stat cards and tables appear fully rendered immediately.

- [x] [HIGH] [ANIM] [expenses.html] — New expense list-item enter animation references undefined `@keyframes slideIn`. No such keyframe defined anywhere. New items appear without animation.

- [ ] [HIGH] [ANIM] [clients.html, invoices.html, hr.html, planning.html, insights.html, approvals.html, timesheets.html, leaves.html, calendar.html, portal/index.html] — `card-interactive` hover lift class absent from clickable cards on 10 pages.

- [ ] [HIGH] [ANIM] [approvals.html, insights.html, hr.html, planning.html] — Stat card perspective container missing. KPI grid wrappers don't receive `perspective: 1200px`, disabling 3D hover effect.

- [ ] [HIGH] [ANIM] [all pages with tabs] — Tab content switch is instant (display:none → display:block) with no fade transition. Abrupt content flash on every tab switch across 8+ pages.

- [ ] [HIGH] [ANIM] [invoices.html, clients.html, hr.html, projects.html] — Primary CTA submit buttons have no loading state. `btn-loading` absent from "Record Payment," "Generate Invoice," "Create Client," "Create Project," "Submit Application."

- [x] [HIGH] [VIS] [_components.css] — `.sidebar` uses fully opaque `var(--color-surface-0)` with no backdrop-filter. Sidebar appears as hard flat panel with no atmosphere or depth.

- [x] [HIGH] [VIS] [_components.css] — `.modal-backdrop` blur is only `blur(4px)` — significantly weaker than `var(--glass-blur)` (blur(20px)). Should be `backdrop-filter: var(--glass-blur)`.

- [ ] [HIGH] [VIS] [invoices.html] — "Sent" status badge uses `badge-warning` (amber). "Sent" is informational/neutral. Should use `badge-info` (steel blue).

- [ ] [HIGH] [VIS] [insights.html] — Chart X-axis tick labels at `font-size="9"` — too small on desktop, unreadable on mobile. Spec requires `caption` size (12px).

- [x] [HIGH] [VIS] [_components.css] — `.user-dropdown` uses flat opaque `var(--color-surface-3)`. Spec requires glass treatment for dropdowns/popovers. Visible in every page topbar.

- [ ] [HIGH] [VIS] [account.html] — Theme preview section uses hardcoded `hsl()` values at lines 394-431 instead of CSS variables.

- [x] [HIGH] [VIS] [portal/auth.html] — Portal auth card uses `background: var(--color-surface-0)` with no glassmorphism. Flat and cheap for first impression.

- [x] [HIGH] [VIS] [index.html] — Donut chart center "1,842h total" sub-label uses `font-size:9px` inline. 9px is below minimum on a primary KPI visualization. *Also flagged by: TYPO*

- [x] [HIGH] [VIS] [employees.html] — Filter search input has `height: 36px` hardcoded, contradicting canonical `min-height: 44px`. Mobile touch target regression on most-visited employee page.

- [ ] [HIGH] [MOB] [invoices.html] — Mobile card transformation activates at `max-width: 767px` instead of canonical 639px boundary.

- [ ] [HIGH] [MOB] [calendar.html] — Page header view toggle (4 buttons ~200px) + "Add Event" button compete for 390px header space. No breakpoint-specific treatment.

- [x] [HIGH] [MOB] [leaves.html] — Team Calendar 7-column heatmap has no `overflow-x:auto` wrapper. Event text unreadable when columns narrow below 48px.

- [x] [HIGH] [MOB] [employees.html] — Org chart has `overflow-x: auto` + `min-width: 700px` but no mobile alternative. No `-webkit-overflow-scrolling: touch` for smooth iOS scroll.

- [x] [HIGH] [MOB] [timesheets.html] — Month view heatmap responsive CSS injected as dynamic `<style>` tag via JS. If JS fails or runs after first paint, text overflows narrow day cells.

- [ ] [HIGH] [MOB] [insights.html] — AI Ask tab query input and submit button in flex row with no mobile stacking breakpoint. Input compresses to ~200px at 320px.

- [x] [HIGH] [MOB] [hr.html] — Offboarding tab tables have no `overflow-x:auto` wrapper. Offboarding progress tracker has no documented mobile breakpoint.

- [ ] [HIGH] [MOB] [approvals.html] — Filter bar has three `<select>` elements with fixed inline widths (140px, 160px) conflicting with `.filter-bar-standard` mobile rule at 320px.

- [ ] [HIGH] [MOB] [calendar.html] — `.quarter-view` renders `repeat(3, 1fr)` with no mobile breakpoint. At 320px day columns ~14px — illegible. No mobile fallback.

- [ ] [HIGH] [MOB] [calendar.html] — `.year-view` renders `repeat(4, 1fr)` with no mobile breakpoint. At 390px day columns ~12px — completely illegible. No mobile fallback.

- [ ] [HIGH] [INT] [gantt.html] — "Export" button — no onclick or event handler. Should trigger CSV/PDF export.

- [ ] [HIGH] [INT] [gantt.html] — "Help" button — no handler. Should open keyboard shortcuts panel.

- [ ] [HIGH] [INT] [planning.html] — "Export" button — no onclick. Should export planning data as CSV/PDF.

- [ ] [HIGH] [INT] [planning.html] — "View Profile" buttons (x2) in Bench Forecast AI Recommendations — both bare buttons with no handlers.

- [ ] [HIGH] [INT] [admin.html] — "Export" button in Audit Log filter bar — no handler.

- [ ] [HIGH] [INT] [admin.html] — Audit Log search input and filter selects have no event listeners. Typing or changing filter does not filter table rows.

- [ ] [HIGH] [INT] [approvals.html] — "Export to CSV" dropdown item — no onclick.

- [ ] [HIGH] [INT] [approvals.html] — "Reject All Selected" dropdown item — no onclick.

- [ ] [HIGH] [INT] [approvals.html] — "Approve" button inside View Details modal footer — no onclick.

- [x] [HIGH] [INT] [employees.html] — Export button toast call uses wrong function signature: `showToast('Export started...')` vs expected `showToast(title, message, type)`.

- [x] [HIGH] [INT] [employees.html] — Sophie Dubois, Yuki Tanaka, Marie Dupont, Liam O'Brien cards have no `data-hovercard` or `data-href`. Clicking their names does nothing.

- [x] [HIGH] [INT] [employees.html] — "Reports to: Marie Dupont" link in Sarah Chen profile hero is dead. No profile route exists for `marie-dupont`.

- [ ] [HIGH] [RBAC] [invoices.html] — Entire invoices.html (invoice list, Generate Invoice, Record Payment, Send to Client) has zero `data-min-role` attributes. Invoicing is Finance/Admin only.

- [ ] [HIGH] [RBAC] [insights.html] — Revenue tab, Client Health tab, and AI assistant returning company-wide financial intelligence have zero role-gating. Employees see all financial data.

- [ ] [HIGH] [RBAC] [projects.html] — Billing rates (€95/h, €85/h, etc.) visible on every project Kanban card with zero `data-sensitive` gating. Employees see client billing rates.

- [ ] [HIGH] [RBAC] [calendar.html] — Calendar renders all team members' leave events with no `data-min-role` gate. Employees see leave dates of all colleagues.

- [x] [HIGH] [RBAC] [hr.html] — Entire HR page (recruitment, onboarding, offboarding with salary adjustment records) has zero `data-min-role` attributes.

- [ ] [HIGH] [RBAC] [gantt.html] — Gantt shows all 12 employees' allocations and work-time percentages. Zero `data-min-role` gating. No personal-only filter for Employee role.

- [ ] [HIGH] [RBAC] [planning.html] — Resource Planning shows full team capacity, bench employees, What-If Scenarios. Zero role-gating. Employees can assign colleagues to projects.

- [x] [HIGH] [RBAC] [index.html] — Dashboard approval widget (lines 1524-1607) shows other employees' timesheets with Approve/Reject accessible to Employee role.

- [x] [HIGH] [EDGE] [hr.html] — Onboarding tab has no empty state for zero new hires being onboarded.

- [x] [HIGH] [EDGE] [hr.html] — Offboarding tab has no empty state for zero active departures.

- [x] [HIGH] [EDGE] [hr.html] — Employee Records tab has no empty state for a new company with no records.

- [ ] [HIGH] [EDGE] [projects.html] — Project detail "Activity" tab has no empty state for a brand-new project.

- [ ] [HIGH] [EDGE] [projects.html] — Project detail "Milestones" tab has no empty state. Needs "Add Milestone" CTA.

- [ ] [HIGH] [EDGE] [clients.html] — Client detail "Documents" tab has no empty state. Needs "Upload Document" CTA.

- [ ] [HIGH] [EDGE] [admin.html] — Audit Log tab has no "filtered to zero" empty state.

- [ ] [HIGH] [EDGE] [invoices.html] — No "filtered to zero" empty state when filter/search combination returns zero invoices.

- [x] [HIGH] [EDGE] [timesheets.html] — "Previous Weeks" tab has no empty state for a brand-new employee.

- [ ] [HIGH] [EDGE] [insights.html] — Seven analytics tabs have no per-tab empty state for insufficient data.

- [x] [HIGH] [EDGE] [portal/index.html] — Portal timesheets section has no empty state. New client sees empty table with only header row.

- [x] [HIGH] [EDGE] [portal/index.html] — Portal documents section has no empty state. New client sees blank card body.

- [x] [HIGH] [FEAT] [hr.html] — §21.2 — No "Add Candidate" modal/form defined anywhere. "New Job Posting" button shows only a toast. *Also flagged by: FEEL, INT*

- [ ] [HIGH] [FEAT] [calendar.html] — §12 — Day view is missing. Spec requires 5 views: Day/Week/Month/Quarter/Year.

- [ ] [HIGH] [FEAT] [gantt.html] — §5.4 — Click on empty cell does not open quick-assign dialog. Primary interaction path for resource planning absent.

- [ ] [HIGH] [FEAT] [gantt.html] — §5.4 — Click on leave bar does NOT open leave detail modal.

- [ ] [HIGH] [FEAT] [gantt.html] — §5.4/§5 — Over-allocation visual indicator absent on individual bars. No visual hatching, red stripe, or warning icon on over-allocated bars.

- [ ] [HIGH] [FEAT] [insights.html] — §15.1 — No "Show Chart" CTA in AI response that renders a visualization inline.

- [ ] [HIGH] [FEAT] [insights.html] — §15.1 — Scheduled Reports feature entirely absent. *Also flagged by: FEEL*

- [ ] [HIGH] [FEAT] [planning.html] — §16.1 — Forecasting horizon controls (1M/3M/6M/1Y) missing. Capacity chart hardcoded to 3 months.

- [x] [HIGH] [FEAT] [employees.html] — §4.2 Leaves Tab — 52-week leave heatmap (mini year view, colored by leave type) missing.

- [x] [HIGH] [FEAT] [_shared.js / all pages] — §4.3 Mini Profile Card — Hover mini-profile card missing "Send Message" CTA.

- [x] [HIGH] [RICH] [index.html] — "Your Week at a Glance" widget shows 28h/40h but no on-track/behind/ahead signal, no billable vs non-billable split.

- [x] [HIGH] [RICH] [index.html] — Revenue Snapshot bars have no hardcoded heights — may render empty in static demo environment without JS.

- [x] [HIGH] [RICH] [index.html] — Mini Gantt "Team Allocation This Week" has no per-cell context: no hours, no project name, no legend. Solid color blocks with no differentiation.

- [x] [HIGH] [RICH] [employees.html] — Employee profile stat cards show single values with no sparklines or comparison context.

- [ ] [HIGH] [RICH] [clients.html] — Client list cards show YTD Revenue as plain number with no trend indicator or sparkline.

- [ ] [HIGH] [RICH] [clients.html] — Client detail "Overview" tab revenue bar chart has no Y-axis labels, no gridlines, no actual euro values on bars.

- [ ] [HIGH] [RICH] [clients.html] — Client detail stats (4 stat cards) have no sparklines and no comparison periods. "Avg Project Health: On Track" is pure text.

- [ ] [HIGH] [RICH] [approvals.html] — KPI summary row has 4 plain number cards with no visual breakdown. "Total Pending: 12" should show mini donut. Cards need data-dense secondary lines.

- [ ] [HIGH] [RICH] [planning.html] — Capacity chart shows only 3 months with only 2 bars per month. No stacked "Bench/Unallocated" segment. No Y-axis line. Chart looks structurally incomplete.

- [ ] [HIGH] [RICH] [planning.html] — Skills Matrix Gap column shows raw numbers with no visual magnitude indicator. Missing "Proficiency level" dimension.

- [ ] [HIGH] [RICH] [invoices.html] — Invoice stat cards (Total Outstanding, Paid This Month, Overdue, Avg Payment Time) all lack sparklines.

- [ ] [HIGH] [RICH] [invoices.html] — Invoice list "Amount" column shows only total with no breakdown of billable hours + rate (e.g. "€12,400 · 124h @ €100/h").

---

### MEDIUM

- [x] [MEDIUM] [FEEL] [index.html] — CALM — Dashboard has no loading priority order. KPIs, AI alerts, mini gantt, activity feed all render simultaneously.

- [x] [MEDIUM] [FEEL] [index.html] — COMPLETENESS — No "your day at a glance" section: no meetings, no pending approvals count at the top, no deadlines due today.

- [x] [MEDIUM] [FEEL] [index.html] — ANTICIPATION — No quick-action shortcuts on the dashboard for top 3 daily tasks (submit timesheet, approve pending, log expense).

- [x] [MEDIUM] [FEEL] [index.html] — EASE — Welcome section takes up significant vertical space before any actionable content. On mobile this pushes all KPIs below the fold.

- [x] [MEDIUM] [FEEL] [timesheets.html] — EASE — No bulk-fill option for standard weeks. Users entering the same hours every day must fill all 5 cells per project individually.

- [x] [MEDIUM] [FEEL] [timesheets.html] — COMPLETENESS — Total hours per day shown but no comparison to expected contracted hours.

- [x] [MEDIUM] [FEEL] [timesheets.html] — ANTICIPATION — No "start from template" feature for recurring project allocations. Every new week begins blank.

- [x] [MEDIUM] [FEEL] [timesheets.html] — CALM — Approval queue mixed into the timesheet page creates cognitive overload. Employees and managers share same view.

- [x] [MEDIUM] [FEEL] [expenses.html] — EASE — Category dropdown requires manual selection even though AI scan already identified the category.

- [x] [MEDIUM] [FEEL] [expenses.html] — COMPLETENESS — No spending summary by category visible during expense entry.

- [x] [MEDIUM] [FEEL] [expenses.html] — ANTICIPATION — No recurring expense feature for monthly subscriptions.

- [x] [MEDIUM] [FEEL] [leaves.html] — CALM — Leave type icons are decorative only and not labelled on mobile.

- [x] [MEDIUM] [FEEL] [leaves.html] — COMPLETENESS — No carry-over balance indicator. Users cannot see how many days expire at year end if unused.

- [x] [MEDIUM] [FEEL] [leaves.html] — ANTICIPATION — No smart suggestion: "You have 8 days remaining and 3 bank holidays in December — book now." The Revolut nudge is absent.

- [ ] [MEDIUM] [FEEL] [approvals.html] — CALM — Mixed approval queue (timesheets + leaves + expenses) has no visual separation between item types beyond a small badge.

- [ ] [MEDIUM] [FEEL] [approvals.html] — EASE — Bulk approval selects by checkbox but "Approve Selected" not available — only "Approve All Visible."

- [ ] [MEDIUM] [FEEL] [invoices.html] — EASE — No partial payment recording. Invoices are either Paid or Unpaid.

- [ ] [MEDIUM] [FEEL] [invoices.html] — COMPLETENESS — No automatic late-payment alert. Overdue invoices show red badge but no email reminder is queued.

- [ ] [MEDIUM] [FEEL] [invoices.html] — ANTICIPATION — No invoice template library. Every new invoice begins from scratch.

- [x] [MEDIUM] [FEEL] [hr.html] — CALM — Recruitment kanban columns have no WIP (work-in-progress) limits.

- [x] [MEDIUM] [FEEL] [hr.html] — ANTICIPATION — No probation end-date tracking. No automatic 90-day probation review reminder.

- [x] [MEDIUM] [FEEL] [employees.html] — COMPLETENESS — No "reporting structure" view. Directory is a flat list with no org chart relationship view.

- [x] [MEDIUM] [FEEL] [employees.html] — ANTICIPATION — No contract renewal alert column. Employees with contracts expiring within 30 days not flagged.

- [ ] [MEDIUM] [FEEL] [planning.html] — CALM — Scenarios cannot be compared side by side. User can only view one at a time.

- [ ] [MEDIUM] [FEEL] [planning.html] — COMPLETENESS — Skills matrix shows skill levels but no "last verified" date.

- [ ] [MEDIUM] [FEEL] [projects.html] — EASE — No project template functionality. Every new project starts with a blank form.

- [ ] [MEDIUM] [FEEL] [clients.html] — EASE — Client contact list has no "primary contact" designation. Invoice generator cannot pre-select billing contact.

- [ ] [MEDIUM] [FEEL] [calendar.html] — CALM — Day detail panel close button (x) appears in same region as browser close/back button on mobile.

- [ ] [MEDIUM] [FEEL] [gantt.html] — COMPLETENESS — Leave bars on gantt do not cross-reference approved vs pending. A bar may represent unconfirmed leave.

- [ ] [MEDIUM] [FEEL] [insights.html] — EASE — Chart filters reset to default on every tab switch within Insights. Users lose filter context when moving between tabs.

- [ ] [MEDIUM] [FEEL] [admin.html] — EASE — No bulk operations in admin tables. Deleting 10 leave types requires 10 individual click sequences.

- [ ] [MEDIUM] [FEEL] [account.html] — CALM — Page title shows "Settings" in both browser tab and page header simultaneously. Labels doubled.

- [ ] [MEDIUM] [FEEL] [account.html] — COMPLETENESS — No locale auto-detection from browser. Users must manually set language and timezone.

- [x] [MEDIUM] [FEEL] [auth.html] — CALM — OTP resend button has no countdown timer or cooldown state. Users can spam the resend button.

- [x] [MEDIUM] [FEEL] [auth.html] — COMPLETENESS — Company registration wizard does not collect fiscal year start date. Every financial report will default to incorrect year boundary.

- [x] [MEDIUM] [FEEL] [portal/index.html] — CALM — Portal has no loading state between tab switches. Content flashes in without transition. *Also flagged by: ANIM*

- [x] [MEDIUM] [FEEL] [portal/index.html] — ANTICIPATION — No client notification when a new timesheet or invoice is submitted for their review.

- [ ] [MEDIUM] [FEEL] [CROSS-CUTTING] — EASE — Back button behavior inconsistent. Some detail views support browser Back; others break browser history.

- [ ] [MEDIUM] [FEEL] [CROSS-CUTTING] — CALM — Toast notification positioning varies between pages (bottom-right vs top-center). No consistent placement contract.

- [ ] [MEDIUM] [FEEL] [CROSS-CUTTING] — COMPLETENESS — No cross-page "related items" linking. Invoices don't link to timesheets. Leave requests don't link to affected project allocations.

- [ ] [MEDIUM] [DATA] [clients.html lines 1071/1101] — Bob Taylor appears in Acme Corp client team roster as role="QA Engineer" worktime="85"; canonical: on Bench, not assigned to any client project.

- [ ] [MEDIUM] [DATA] [gantt.html lines 1231/1434] — Carol in Gantt shows role="HR Manager" dept="HR" worktime="78"; should be Design Lead, Design, 90%.

- [ ] [MEDIUM] [DATA] [insights.html line 1729] — AI response references "Sarah Chen (95% work time)"; canonical: 87%.

- [ ] [MEDIUM] [DATA] [insights.html line 1729] — Same AI response references "Bob Taylor (42% work time)"; canonical: 0% (Bench).

- [x] [MEDIUM] [DATA] [_shared.js line 201] — David Park presence initialized as 'online'; canonical: Offline.

- [x] [MEDIUM] [DATA] [_shared.js line 200] — Carol presence initialized as 'away'; canonical Carol Williams presence: Online.

- [x] [MEDIUM] [DATA] [expenses.html line 1396] — Bob Taylor hovercard in expense detail shows worktime="92" project="Globex Phase 2"; canonical: 0%, no project.

- [ ] [MEDIUM] [DATA] [admin.html departments table] — "Analytics" dept exists in users table but not in departments list. Tables internally contradictory.

- [ ] [MEDIUM] [DATA] [admin.html line 707] — Operations dept manager listed as John Smith; canonical Operations Lead is Marco Rossi.

- [x] [MEDIUM] [ANIM] [_components.css] — Table row hover has no background transition. `.data-table tr:hover td` snaps on/off with hard cut. Needs 100-200ms ease-out transition.

- [x] [MEDIUM] [ANIM] [_components.css] — Notification badge (`.nav-badge`) has no new-item scale-pulse animation when count increments. Spec: scale pulse 1 → 1.2 → 1, 400ms.

- [x] [MEDIUM] [ANIM] [_components.css — #shortcutsPanel] — Keyboard shortcuts panel (`?` key) opens/closes with zero animation. Toggles display:none/flex with no transition.

- [ ] [MEDIUM] [ANIM] [all pages] — No page-load fade-in animation on `.page-content`. `@keyframes fadeSlideIn` exists but only used locally in 2 pages, never globally.

- [x] [MEDIUM] [ANIM] [portal/index.html, portal/auth.html] — Portal pages do not load `_shared.js`. No toast system, no hover card init, no skeleton loading. Portal slide panel has no backdrop transition coordination.

- [ ] [MEDIUM] [ANIM] [gantt.html] — Gantt bars lack position transition on snap-to-column during drag simulation. No smooth snap feedback.

- [x] [MEDIUM] [ANIM] [auth.html] — Multi-step wizard step transitions have no enter/exit animation. Steps toggle display:none/block with zero transition.

- [x] [MEDIUM] [VIS] [_components.css] — `.stat-card::before` gradient always runs from `--color-primary` to `--color-accent` for every card. Financial KPI cards should use `--color-gold` top accent.

- [ ] [MEDIUM] [VIS] [insights.html] — Team Performance table labels "Top 5 Most Utilized Employees" — directly violates banned terminology. Must use "Work Time" or "Capacity."

- [ ] [MEDIUM] [VIS] [calendar.html / index.html] — Calendar event text and mobile heatmap cells use `font-size: 9px` via inline `style.cssText`. Below spec minimum; illegible on non-retina screens.

- [x] [MEDIUM] [VIS] [expenses.html] — Expense icon uses raw `hsla(270,45%,58%,0.14)` and `hsl(270,45%,58%)` instead of `var(--color-chart-5)` and `var(--color-chart-5-muted)`.

- [x] [MEDIUM] [VIS] [_components.css] — `.avatar-status.on-leave::after` uses `var(--color-info)` (blue); but `.presence-status.on-leave` correctly uses `var(--color-error)` (red). Semantic conflict — must be consistent.

- [ ] [MEDIUM] [VIS] [planning.html / insights.html] — KPI stat cards for capacity metrics use generic `--color-text-1` for all values. Surplus/warning/deficit states look identical.

- [x] [MEDIUM] [VIS] [hr.html] — Candidate score badge universally uses `--color-warning-muted` regardless of score. High score (85+) should use `--color-success`; low (<50) should use `--color-error`.

- [ ] [MEDIUM] [VIS] [gantt.html] — `.active-filter` chip uses hardcoded `border: 1px solid hsla(155,26%,46%,0.25)` instead of `var(--color-primary-muted)`.

- [x] [MEDIUM] [VIS] [portal/index.html] — `portal-body` CSS class overrides background/surface tokens with raw `hsl()` literals instead of CSS custom properties.

- [x] [MEDIUM] [VIS] [index.html] — Greeting section uses `--text-display-lg` (30px); spec §3 specifies `display-xl` (36px / weight 700) for "Dashboard greeting."

- [ ] [MEDIUM] [VIS] [all pages] — Sidebar has minimal visual separation from background (~3% lightness difference). Needs stronger border, box-shadow, or elevated background for depth hierarchy.

- [ ] [MEDIUM] [VIS] [insights.html] — Multi-series charts render identical colored bars. Revenue should use gold (chart-2), operational should use primary (chart-1). Six-series palette not applied.

- [ ] [MEDIUM] [VIS] [approvals.html] — Bulk action bar `.bulk-bar` uses flat `var(--color-surface-3)`. As a floating command surface (z-index 800), should receive full glass treatment.

- [x] [MEDIUM] [VIS] [timesheets.html] — Overdue timesheet row in admin queue shows only `badge-error` text indicator. Row background should use `--color-error-muted` tint to differentiate overdue from submitted.

- [x] [MEDIUM] [MOB] [expenses.html] — Filter bar date inputs have hardcoded `style="width: 150px"` overriding responsive behavior. Row overflows or wraps chaotically at 390px.

- [ ] [MEDIUM] [MOB] [clients.html] — Client detail "Invoices" tab table `<td>` elements have no `data-label` attributes. Mobile card labels will render empty strings.

- [ ] [MEDIUM] [MOB] [gantt.html] — Filter panel has filter group with `style="min-width:200px;"` and skills multi-select at `min-width:160px; height:auto`. Can expand to 4-5 rows of text on mobile.

- [ ] [MEDIUM] [MOB] [planning.html] — "Assign to Project" modal internal `grid-2` does not collapse to 1 column on mobile. Form fields ~160px wide at 390px — too narrow.

- [ ] [MEDIUM] [MOB] [admin.html] — "Permissions Matrix" tab uses multi-column `<table>` (Read/Write/Delete x 6 sections) without overflow container. Will exceed viewport at 390px.

- [ ] [MEDIUM] [MOB] [account.html] — Active sessions table has `overflow-x:auto` but no `mobile-cards` class. No card fallback on mobile.

- [x] [MEDIUM] [MOB] [index.html] — Dashboard mini-Gantt `.gantt-day-labels { margin-left: calc(100px + var(--space-3)) }` is a fixed offset that doesn't respond to actual container width at 320px.

- [x] [MEDIUM] [MOB] [leaves.html] — Team Leaves table action buttons in `mobile-cards` layout at 320px: two `btn-xs` buttons side-by-side may clip text. No `min-width` set.

- [x] [MEDIUM] [MOB] [hr.html] — HR page tab bar (4 long tabs including "Employee Records") has no `overflow-x: auto` or text truncation. At 320px near-certain overflow.

- [x] [MEDIUM] [INT] [portal/index.html] — Pagination buttons (pages 2, 3, 4) in Timesheets section have no onclick. "Showing 6 of 24 entries" but paging is dead.

- [ ] [MEDIUM] [INT] [calendar.html] — Day detail panel has no "Add event on this day" button scoped to the selected date. (Primary Add Event also broken — see CRITICAL.)

- [x] [MEDIUM] [INT] [auth.html] — "Use a recovery code" link at line 440 — no onclick. Should show recovery-code input as alternative MFA path.

- [x] [MEDIUM] [INT] [portal/auth.html] — "Forgot password?" link — no onclick. Should show password reset form.

- [x] [MEDIUM] [INT] [timesheets.html] — "Copy Last Week" button shows a toast but does NOT call `copyLastWeek()`. The actual copy function exists but is never invoked.

- [ ] [MEDIUM] [INT] [insights.html] — "View Profile" ghost buttons in multiple insight cards have no onclick or navigation handler.

- [ ] [MEDIUM] [INT] [admin.html] — Audit Log pagination buttons (pages 2, 3, last) have no onclick. "Showing 1-20 of 4,847 entries" but pages are dead.

- [ ] [MEDIUM] [INT] [admin.html] — Users table pagination (pages beyond 1) has no onclick. "Showing 1-10 of 12 users" but page 2/3 buttons do nothing.

- [ ] [MEDIUM] [RBAC] [_shared.js / all pages] — Keyboard shortcut G→S navigates directly to `admin.html` for all roles. No role check before navigation.

- [ ] [MEDIUM] [RBAC] [_shared.js / all pages] — Keyboard shortcut G→I navigates to `invoices.html` for all roles. No role check performed.

- [ ] [MEDIUM] [RBAC] [approvals.html / hr.html / timesheets.html / expenses.html] — Command palette includes direct link to `admin.html` labeled "Configuration" with no `data-min-role` attribute.

- [ ] [MEDIUM] [RBAC] [admin.html] — "ADMIN" nav-section in sidebar not wrapped in any `data-min-role` container. Settings link visible to all roles.

- [x] [MEDIUM] [RBAC] [employees.html] — Employee Directory shows all employees with role, department, work-time %, project assignments. No role-gating for Employee vs full directory view.

- [x] [MEDIUM] [RBAC] [expenses.html] — Analytics tab shows team-level expense analytics with department totals without `data-min-role` gate.

- [x] [MEDIUM] [EDGE] [leaves.html] — Team Leaves tab empty state missing a CTA. Should have "Submit Leave for Team Member" button.

- [ ] [MEDIUM] [EDGE] [approvals.html] — Per-tab filter empty state uses generic message with no icon and no contextual action button ("Go to Leaves" / "Go to Expenses").

- [ ] [MEDIUM] [EDGE] [calendar.html] — `#filterSearch` input has no logic to show "No team members match" message.

- [ ] [MEDIUM] [EDGE] [gantt.html] — Gantt empty state imprecise. Same message for "no filter matches" and "date range out of scope." Needs "No projects scheduled in this date range" with "Return to Today" CTA.

- [ ] [MEDIUM] [EDGE] [planning.html] — No "fully allocated" state when all employees are at 100% capacity. No summary message: "No available capacity this month."

- [ ] [MEDIUM] [EDGE] [clients.html] — Client search returning zero results shows empty grid. Needs icon, "No clients match your search," and "Clear Search" / "Add Client" CTA.

- [x] [MEDIUM] [EDGE] [expenses.html] — No "filter returns zero" state for expense list. Category + status combo returning zero results collapses to empty space.

- [ ] [MEDIUM] [EDGE] [admin.html] — Users tab search has no "no results" state. Empty tbody renders silently.

- [x] [MEDIUM] [EDGE] [index.html] — Dashboard "Recent Activity" feed has no empty state for a brand-new account with zero activity events.

- [x] [MEDIUM] [EDGE] [hr.html] — Recruitment board has no "no jobs posted" state per-role filter. All 5 kanban columns emptying simultaneously shows blank board with no aggregate message.

- [ ] [MEDIUM] [FEAT] [notifications / all pages] — §17.1 — Notification panel missing [All] / [Unread (N)] / [Mentions] filter tabs.

- [x] [MEDIUM] [FEAT] [timesheets.html] — §8.2/§8.3 — Copy dropdown missing "same week last month" option.

- [x] [MEDIUM] [FEAT] [timesheets.html] — §8.3 — Timesheet auto-save (every 30 seconds) not implemented.

- [x] [MEDIUM] [FEAT] [timesheets.html] — §8.2/§8.3 — Holiday integration absent. Company holidays should appear inline in timesheet grid as greyed cells.

- [x] [MEDIUM] [FEAT] [timesheets.html] — §1.3 — Saved Views dropdown absent from timesheets.html filter bar.

- [ ] [MEDIUM] [FEAT] [projects.html] — §1.3 — Saved Views dropdown absent from projects list filter bar.

- [ ] [MEDIUM] [FEAT] [approvals.html] — §1.3 — Saved Views dropdown absent from approvals.html.

- [x] [MEDIUM] [FEAT] [leaves.html] — §1.3 — Saved Views dropdown absent from leaves.html.

- [ ] [MEDIUM] [FEAT] [expenses.html / invoices.html / projects.html / timesheets.html] — §1.3 — Bulk selection + bulk action absent from these list pages. Only approvals.html and leaves.html implement it.

- [x] [MEDIUM] [FEAT] [employees.html] — §4.2 Leaves Tab — "Approver" column missing from leaves table.

- [x] [MEDIUM] [FEAT] [employees.html] — §4.2 Projects Tab — Past projects missing "Client satisfaction" star rating.

- [ ] [MEDIUM] [FEAT] [insights.html] — §15.1 — "Forecasting" analytics section absent from analytics tab bar.

- [ ] [MEDIUM] [FEAT] [gantt.html] — §5.4 — Pinch-to-zoom gesture not implemented on touch devices.

- [x] [MEDIUM] [RICH] [index.html] — "Active Employees: 12" KPI card shows "+3 this month" but no composition context (7 active / 1 bench / 1 on leave).

- [x] [MEDIUM] [RICH] [index.html] — "Team Work Time: 82%" card shows average but no distribution (6 above target / 2 below / 1 bench).

- [x] [MEDIUM] [RICH] [employees.html] — Skills tab shows proficiency bars with no benchmark context. "87% proficiency in React" means nothing without "vs team avg 72%."

- [x] [MEDIUM] [RICH] [employees.html] — Profile "Projects" tab shows allocation % but no hours-per-week equivalent, no budget burn context, no deadline urgency indicator.

- [ ] [MEDIUM] [RICH] [insights.html] — Anomalies section: 3 insights have no inline mini sparkline showing the anomaly. "Bob Taylor's €340 hotel is 2x his average" should show comparison chart.

- [ ] [MEDIUM] [RICH] [insights.html] — "Review Acme project budget" insight shows "€142,000 of €180,000" as plain text with no visual budget burn progress bar.

- [ ] [MEDIUM] [RICH] [insights.html] — Work Time chart shows only single data series. Should add dashed "target line" at 80% and optionally top 3 employees as faint lines.

- [ ] [MEDIUM] [RICH] [insights.html] — Revenue tab shows only "Revenue by Client" donut. No "Revenue by Project (Top 5)" breakdown.

- [ ] [MEDIUM] [RICH] [clients.html] — Client list cards show no revenue trend mini-chart. Static number only.

- [ ] [MEDIUM] [RICH] [clients.html] — Client detail "Team" tab shows members with role/name but no work time bar, no hours logged this month, no allocation percentage.

- [ ] [MEDIUM] [RICH] [approvals.html] — Approval cards show hours but no visual "above/below target" comparison. "42h / 40h target" should show mini progress bar indicating overtime.

- [x] [MEDIUM] [RICH] [hr.html] — Recruitment Kanban cards have no "days in stage" counter. Candidate 14 days in "2nd Round" looks identical to one who entered yesterday.

- [x] [MEDIUM] [RICH] [hr.html] — Recruitment page has no KPI summary row (open roles / total candidates / offers pending / avg time-to-hire).

- [ ] [MEDIUM] [RICH] [gantt.html] — Gantt bars show project allocations but no "budget burn" overlay or percentage-complete annotation on each bar.

- [ ] [MEDIUM] [RICH] [planning.html] — Capacity cards show Available/Allocated as text rows but no mini bar or donut. "208h surplus" has no visual scale.

- [x] [MEDIUM] [TYPO] [index.html:330,375,406] — Heatmap and revenue chart CSS uses `font-size: 10px`, `font-size: 9px` hardcoded. Use `var(--text-overline)`.

- [x] [MEDIUM] [TYPO] [index.html:318,383,392] — Revenue snapshot `gap: 3px`, `gap: 5px` violate 4px grid. Use `var(--space-1)` and `var(--space-1-5)`.

- [ ] [MEDIUM] [TYPO] [calendar.html:1314,1334,1391] — JS-generated inline styles inject `font-size:9px`, `font-size:10px`, `font-weight:bold`, `color:white` — all hardcoded. Use tokens.

- [ ] [MEDIUM] [TYPO] [projects.html:1120-1222] — All 7 Gantt timeline row status badges use `font-size:10px; padding:2px 6px` as inline styles. Use `.badge-xs` class instead.

- [ ] [MEDIUM] [TYPO] [projects.html:1127,1144,1162,1180,1198] — Five Gantt bar elements use `font-size:11px` inline. Use `var(--text-overline)`.

- [x] [MEDIUM] [TYPO] [portal/index.html:67,85] — `.portal-logo-badge { font-size: 13px }` and `.portal-client-logo { font-size: 14px }` hardcoded. Use `var(--text-body-sm)` and `var(--text-body)`.

- [x] [MEDIUM] [TYPO] [auth.html:43] — `.auth-logo-icon { font-size: 24px }` hardcoded. Use `var(--text-heading-1)`.

- [x] [MEDIUM] [TYPO] [portal/auth.html:41] — `.portal-logo .client-logo { font-size: 28px }` — off-scale value with no token. Use `var(--text-heading-1)`.

- [ ] [MEDIUM] [TYPO] [clients.html:91] — `.detail-logo { font-size: 28px }` hardcoded off-scale. Use `var(--text-heading-1)`.

- [ ] [MEDIUM] [TYPO] [account.html:231] — `.profile-photo-avatar { font-size: 24px }` hardcoded. Use `var(--text-heading-1)`.

- [x] [MEDIUM] [TYPO] [leaves.html:1293,1305,1317] — Mini calendar grid containers use `font-size:10px` inline. Use `var(--text-overline)`.

- [ ] [MEDIUM] [TYPO] [gantt.html:422,430,449] — `.gantt-bar-label { padding: 6px 0 }`, `.gantt-bar { font-size: 11px }`, `.gantt-bar::before { font-size: 10px }` all hardcoded. Use tokens.

- [x] [MEDIUM] [TYPO] [leaves.html:1295,1296,1299,1311] — `color:#fff` on mini calendar day highlight spans. Use `var(--color-white)`.

- [ ] [MEDIUM] [TYPO] [projects.html:1127,1144,1180,1198] — `color:#fff` inline on Gantt bar labels. Use `var(--color-text-on-primary)`.

- [x] [MEDIUM] [TYPO] [employees.html:694] — Pagination active button `color: #fff` hardcoded. Use `var(--color-text-on-primary)`.

- [x] [MEDIUM] [TYPO] [portal/auth.html:39] — `.portal-logo .client-logo { color: #fff }` hardcoded hex. Use `var(--color-white)`.

- [ ] [MEDIUM] [TYPO] [calendar.html:1334,1390] — JS-injected `color:white` strings. Use `color:var(--color-white)`.

- [x] [MEDIUM] [TYPO] [auth.html:736,1093] — SVG check icons use `style="color: white;"`. Use `var(--color-white)`.

- [ ] [MEDIUM] [TYPO] [account.html:199] — `.pw-strength-bar { margin-bottom: 6px }` hardcoded. Use `var(--space-1-5)`.

- [ ] [MEDIUM] [TYPO] [insights.html:1248-1251] — Four `gap:6px` inline in chart legend items. Use `var(--space-1-5)`.

- [x] [MEDIUM] [TYPO] [leaves.html:1329-1421] — Eight `gap:6px` inline on calendar legend rows. Use `var(--space-1-5)`.

- [ ] [MEDIUM] [TYPO] [projects.html:1235-1248] — Five `gap:6px` inline on timeline legend. Use `var(--space-1-5)`.

- [x] [MEDIUM] [TYPO] [expenses.html:1361-1373] — Four `gap:2px` on donut chart segment labels. Use `var(--space-0-5)`.

- [x] [MEDIUM] [TYPO] [leaves.html:1351-1407] — Twelve month cell wrappers use `gap:2px` inline. Use `var(--space-0-5)`.

- [ ] [MEDIUM] [TYPO] [account.html:334] — `border-radius: 24px` inline hardcoded. Use `var(--radius-2xl)`.

- [ ] [MEDIUM] [TYPO] [account.html:403,411,423,432] — Multiple `border-radius: 3px` in inline style blocks. Use `var(--radius-sm)` (4px).

- [ ] [MEDIUM] [TYPO] [account.html:570] — Activity chart bar `border-radius: 1px`. Use `var(--radius-none)` or `var(--radius-sm)`.

- [x] [MEDIUM] [TYPO] [portal/index.html:482] — Header notification badge `font-size:10px; padding: 1px 6px` hardcoded. Use `.badge-xs` class.

- [ ] [MEDIUM] [TYPO] [approvals.html:64] — Approval card transition `0.3s ease-out` hardcoded. Use `var(--motion-slow) var(--ease-out)`.

- [x] [MEDIUM] [TYPO] [portal/index.html:327] — Portal slide panel transition `0.3s ease` hardcoded. Use `var(--motion-slow) var(--ease-out)`.

- [ ] [MEDIUM] [TYPO] [account.html:205] — Password strength fill transitions use hardcoded `0.3s ease`. Use `var(--motion-slow) var(--ease-out)`.

- [x] [MEDIUM] [TYPO] [auth.html:591] — MFA QR code container `padding: 12px` hardcoded inline. Use `var(--space-3)`.

- [x] [MEDIUM] [TYPO] [_layout.css:82,356] — Collapsed sidebar badge `font-size: 8px` in two locations. Below lowest token. Use `var(--text-overline)`.

- [x] [MEDIUM] [TYPO] [_layout.css:554,579] — `.bottom-nav-item { font-size: 10px }` and `.bnav-badge { font-size: 9px }` hardcoded. Use `var(--text-overline)`.

---

### LOW

- [x] [LOW] [FEEL] [index.html] — CALM — Date shown in the header is static/hardcoded. On refresh the date does not update dynamically.

- [x] [LOW] [FEEL] [index.html] — EASE — Sidebar navigation has no active-state indicator that updates on scroll within long pages.

- [x] [LOW] [FEEL] [timesheets.html] — EASE — Tab order on the time entry grid not consistent with visual left-to-right, top-to-bottom reading order on mobile.

- [x] [LOW] [FEEL] [timesheets.html] — CALM — "Week of Mar 10-16" date range header uses inconsistent date format (no year).

- [x] [LOW] [FEEL] [expenses.html] — CALM — Upload area shows no file size limit warning upfront. Users discover limits only after uploading an oversized file.

- [x] [LOW] [FEEL] [leaves.html] — EASE — End-date field does not disable dates before the selected start date. Users can accidentally select an end date earlier than start date.

- [ ] [LOW] [FEEL] [approvals.html] — ANTICIPATION — No approval SLA indicator. Requests don't show how long they've been waiting or flag items approaching a policy deadline.

- [ ] [LOW] [FEEL] [invoices.html] — CALM — "Duplicate Invoice" creates a copy with no confirmation of which client/project it will be duplicated to. Copy appears silently.

- [x] [LOW] [FEEL] [hr.html] — EASE — Candidate card "drag to move" has no touch-friendly alternative on mobile.

- [x] [LOW] [FEEL] [employees.html] — EASE — Filter chips (Department, Role, Status) reset on page navigation. Users returning via Back button get unfiltered directory.

- [ ] [LOW] [FEEL] [planning.html] — CALM — Bench forecast references "Carol" without full name or clickable link. Violates Universal Clickable Identity rule (§1.1).

- [ ] [LOW] [FEEL] [projects.html] — CALM — Project card budget figures show currency symbol without specifying which currency.

- [ ] [LOW] [FEEL] [clients.html] — ANTICIPATION — No client health score trend line. Health badge shows current state only, no historical trajectory.

- [ ] [LOW] [FEEL] [calendar.html] — COMPLETENESS — Calendar does not show leave request status indicators on day tiles. Approved leave looks identical to pending.

- [ ] [LOW] [FEEL] [gantt.html] — ANTICIPATION — No "zoom to today" button to snap back to current week after scrolling far out.

- [ ] [LOW] [FEEL] [insights.html] — CALM — Revenue chart y-axis shows values without currency symbol. Axis reads "0, 50000, 100000" with no euro sign.

- [ ] [LOW] [FEEL] [account.html] — ANTICIPATION — No account activity log visible to the user. Employees cannot see their own login history.

- [x] [LOW] [FEEL] [portal/index.html] — EASE — Invoice download button is inside a detail modal behind 2 clicks. No direct download from invoice list row.

- [ ] [LOW] [FEEL] [CROSS-CUTTING] — ANTICIPATION — No keyboard shortcut reference visible in the UI. Command palette implies power-user shortcuts but no discovery mechanism.

- [ ] [LOW] [FEEL] [CROSS-CUTTING] — CALM — Focus ring styles (keyboard navigation outlines) absent or suppressed across the prototype. Accessibility failure.

- [x] [LOW] [DATA] [index.html line 1084] — Bob Taylor dashboard table shows data-worktime="72"; canonical: 0%.

- [ ] [LOW] [DATA] [clients.html line 1101] — Bob Taylor hovercard shows role="QA Engineer"; canonical: Backend Developer (on Bench).

- [ ] [LOW] [DATA] [gantt.html line 1812 comment] — Comment says "John Smith - 92%" but canonical work time is 82%.

- [ ] [LOW] [DATA] [invoices.html line 694] — INV-2026-041 listed at €8,500 but dashboard notification shows the same invoice at €12,400. Requires reconciliation.

- [ ] [LOW] [DATA] [admin.html line 647] — Emma Laurent hovercard worktime="78" (actually correct) but compounds the Active/Inactive bug on same row. Both bugs need simultaneous correction.

- [x] [LOW] [ANIM] [_components.css — .mini-profile] — Legacy `.mini-profile.visible` toggles display:none/block with no animation. Inconsistency risk.

- [x] [LOW] [ANIM] [index.html — donut chart] — Dashboard donut chart SVG segments are static. No `@keyframes` or JS animation drives the donut reveal on mount.

- [x] [LOW] [ANIM] [_tokens.css] — `@media (prefers-reduced-motion: reduce)` sets `animation-duration: 0.01ms !important` globally, disabling functional transitions (focus ring, toast, dropdowns). WCAG 2.2 requires functional transitions to remain perceivable. Exempt them from the override.

- [x] [LOW] [ANIM] [employees.html] — Employee skeleton uses locally-defined `@keyframes skeleton-pulse` (opacity dim) instead of canonical gradient shimmer from `_components.css`. Inconsistent implementations.

- [ ] [LOW] [VIS] [all pages] — `.card` base class uses `--shadow-1` (nearly invisible on dark background). Cards need at minimum `--shadow-2` for visible depth separation.

- [x] [LOW] [VIS] [leaves.html] — Mini calendar inside leave request form uses `color: #fff` for selected day numbers. Use `var(--color-white)`.

- [x] [LOW] [VIS] [auth.html] — MFA QR code SVG uses `color: #1a1a1a` raw hex. Use `var(--color-text-inv)` for theme compatibility.

- [x] [LOW] [VIS] [_layout.css] — `.nav-badge` in collapsed sidebar uses `font-size: 8px`. A badge showing "12" at 8px is functionally illegible. Use colored dot without number, or maintain 10px minimum.

- [x] [LOW] [VIS] [portal/index.html] — Portal active nav uses `--color-accent` (terracotta) vs main app active = sage/primary. Cross-app inconsistency.

- [ ] [LOW] [VIS] [calendar.html] — Calendar weekend days use `opacity: 0.55` on entire cell including text. Day numbers potentially below WCAG 3:1 ratio. Should dim background, not foreground text.

- [x] [LOW] [VIS] [_components.css] — `.badge-dot::before` at 6x6px uses color-only indicator with no icon/text fallback. Contradicts accessibility principle.

- [ ] [LOW] [MOB] [gantt.html] — Mobile Gantt card project assignment text has no truncation. Long project names wrap to 2-3 lines.

- [ ] [LOW] [MOB] [approvals.html] — Bulk action bar (`.bulk-bar`) may be wider than 320px viewport, clipping at edges of smallest Android devices.

- [ ] [LOW] [MOB] [invoices.html] — "Generate Invoice" modal has `grid-2` internal layout that does not collapse to single column on mobile. Form fields ~128px wide — too narrow.

- [ ] [LOW] [MOB] [insights.html] — Team Performance inline row with `min-width:120px` + `min-width:40px` constraints. On 320px the progress bar between them compresses to near zero.

- [ ] [LOW] [MOB] [admin.html] — "Holiday Management" table "Actions" column has `data-label=""`. Action buttons rendered in unexpected full-width position in card view.

- [x] [LOW] [MOB] [portal/index.html] — `.portal-content` uses `padding: var(--space-6)` with no mobile breakpoint. 48px of padding on 390px viewport is 12.3% of screen width.

- [x] [LOW] [MOB] [portal/index.html] — Slide panel header uses `padding: var(--space-5) var(--space-6)` with no mobile reduction. At 320px the title + close button are very tight.

- [ ] [LOW] [INT] [clients.html] — Client website links are `href="#"` with no onclick to open in a new tab.

- [x] [LOW] [INT] [employees.html] — Four document download buttons in Sarah Chen profile Documents tab have no onclick.

- [x] [LOW] [INT] [portal/index.html] — Footer links "GammaHR," "Privacy Policy," "Terms" are all dead `href="#"` links.

- [ ] [LOW] [INT] [gantt.html] — Gantt filter inputs (Search, Department, Client selects) have no event listeners. Quick filter chips only toggle CSS class without filtering rows.

- [ ] [LOW] [INT] [planning.html] — "Assign to Project" modal submit shows a toast without closing the modal or updating the bench list. User left staring at still-open modal.

- [x] [LOW] [RBAC] [_shared.js] — `GHR.currentRole` defaults to `'admin'` on first load. Safer default: `'employee'` to prevent accidental admin escalation in incognito/fresh sessions.

- [ ] [LOW] [RBAC] [account.html] — "Delete Account" flow has no PM-or-Admin confirmation requirement.

- [x] [LOW] [RBAC] [portal/index.html] — "Back to GammaHR Admin" link appears unconditionally in portal, implying any portal viewer is a GammaHR admin.

- [x] [LOW] [EDGE] [timesheets.html] — Month view heatmap "no hours logged" state missing. Future months render day cells without color but no explanatory text.

- [ ] [LOW] [EDGE] [account.html] — Active Sessions "single session" / "no other sessions" empty state absent.

- [x] [LOW] [EDGE] [portal/index.html] — Portal messages thread has no "start of conversation" empty state. New clients see blank `.messages-list` with no visual prompt.

- [x] [LOW] [EDGE] [hr.html] — Recruitment KPI cards ("Open Positions 47") become misleading if company has no active positions. No zero-data variant of the KPI card row.

- [ ] [LOW] [EDGE] [invoices.html] — "Generate Invoice" modal shows no warning when no unbilled timesheets exist for the selected client/period.

- [x] [LOW] [EDGE] [leaves.html] — Leave Calendar tab has no "no leaves this month" state. Future months with no approved leaves render empty day cells with no explanatory text.

- [x] [LOW] [FEAT] [employees.html] — §0.6 — "Recruitment" and "Onboarding" sidebar links link to `hr.html` without tab query params (`?tab=recruitment`, `?tab=onboarding`).

- [ ] [LOW] [FEAT] [gantt.html] — §5.4 — Shift+Click multi-sort on column headers not implemented.

- [x] [LOW] [FEAT] [hr.html] — §21.2 — "Filter" button above Kanban board shows a toast stub with no actual filter panel.

- [x] [LOW] [FEAT] [hr.html] — §21.3 — "Create Onboarding Plan" workflow does not exist beyond a toast.

- [x] [LOW] [RICH] [index.html] — Dashboard AI Alerts have no inline sparkline showing the trend that triggered each alert.

- [x] [LOW] [RICH] [index.html] — Dashboard heatmap has no tooltip showing individual employee breakdown on hover.

- [x] [LOW] [RICH] [timesheets.html] — Timesheet weekly grid footer totals are plain numbers with no color-coding per cell.

- [x] [LOW] [RICH] [leaves.html] — Leave balance cards show remaining days as plain numbers with no progress bar of days consumed vs total entitlement.

- [x] [LOW] [RICH] [portal/index.html] — Client portal KPI cards have no sparklines and no trend indicators.

- [ ] [LOW] [RICH] [admin.html] — "System Health" admin KPI card shows a badge rather than a specific metric. Should show "99.8% uptime (30d)" with a green sparkline.

- [x] [LOW] [TYPO] [index.html:1424] — Donut chart center label `font-size:9px` and `margin-top:1px` — both hardcoded, both off-scale.

- [ ] [LOW] [TYPO] [gantt.html:571,600] — `border-radius: 2px` and `border-radius: 1px` in Gantt CSS block. Use `var(--radius-sm)` and `var(--radius-none)`.

- [x] [LOW] [TYPO] [index.html:339,370,398] — `border-radius: 3px`, `2px`, `3px 3px 0 0` on heatmap and revenue bar elements. Use `var(--radius-sm)`.

- [x] [LOW] [TYPO] [leaves.html:243,269,462] — `border-radius: 2px` and `3px` in leave calendar CSS. Use `var(--radius-sm)`.

- [ ] [LOW] [TYPO] [calendar.html:76,154] — Calendar event chip `border-radius: 3px` in two places. Use `var(--radius-sm)`.

- [x] [LOW] [TYPO] [employees.html:1168-1175] — Skeleton cards use `margin-bottom:8px` and `margin-bottom:6px` inline. Use `var(--space-2)` and `var(--space-1-5)`.

- [x] [LOW] [TYPO] [_components.css + 20+ HTML files] — **SYSTEMIC** — `letter-spacing: 0.5px` hardcoded in 20+ locations. Define `--letter-spacing-caps: 0.05em` in `_tokens.css` and replace all instances.

- [ ] [LOW] [TYPO] [planning.html:622] — "Currently on Bench" section label has duplicate `font-size` properties (one overrides the other). Quality defect.

- [x] [LOW] [TYPO] [hr.html:49,118,131,303] — `padding: 1px 8px` off-grid on status elements. Use `var(--space-0-5) var(--space-2)`.

- [ ] [LOW] [TYPO] [projects.html:89] — Project status badge `padding: 1px 8px`. The `1px` is off-grid. Use `var(--space-0-5)`.

- [x] [LOW] [TYPO] [auth.html:372] — Auth step indicator `padding: 2px 8px`. Use `var(--space-0-5) var(--space-2)`.

- [ ] [LOW] [TYPO] [gantt.html:1699] — Separator `<hr>` `style="margin:4px 0;"` — hardcoded 4px should reference `var(--space-1)`.

- [x] [LOW] [TYPO] [index.html:1694-1698] — Five Y-axis label `<span>` elements with hardcoded `font-size:9px` and `line-height:1`. Use `var(--text-overline)` or `var(--text-caption)`.

- [x] [LOW] [TYPO] [portal/auth.html:41] — `color: #fff` raw hex on portal logo badge. Use `var(--color-white)`.
