# GammaHR v2 — Master Issue List

**Consolidated from:** 5 audits + 5 cross-critiques (10 documents total)
**Date:** 2026-04-05
**Total Issues:** 55 (14 CRITICAL, 19 HIGH, 16 MEDIUM, 6 LOW)

---

## CRITICAL — App is unusable or misleading without this fix

### ISSUE-1: No bottom navigation bar on mobile
Page(s): ALL pages
Priority: CRITICAL
Category: Mobile
Description: The design system specifies a bottom nav bar with 5 items (Dashboard, Timesheets, Expenses, Leaves, More). This does not exist anywhere. Every navigation on mobile requires 3+ taps through a hamburger menu. This is the most important mobile pattern for an HR app where managers do quick approvals on their phones.
Fix required: Add a fixed bottom nav bar component visible at <640px with 5 items. Hide sidebar hamburger approach as secondary. Add to _layout.css and all HTML pages.

### ISSUE-2: No table-to-card transformation on mobile
Page(s): index.html, employees.html, timesheets.html, invoices.html, admin.html, insights.html, planning.html, gantt.html
Priority: CRITICAL
Category: Mobile
Description: Not a single `<table>` in the prototype collapses to cards on mobile. All data tables either overflow horizontally or get tiny. The design system explicitly requires "collapse to cards on mobile."
Fix required: Add mobile CSS that hides `<thead>`, converts each `<tr>` to a card block with `data-label` attributes for column labels. Apply to all data tables at <640px.

### ISSUE-3: Touch targets below 44px minimum on mobile
Page(s): ALL pages except auth.html
Priority: CRITICAL
Category: Mobile
Description: btn-xs (28px), btn-sm (32px), btn-md (36px), form-input (36px), checkboxes (16px) — nearly all interactive elements fail the 44px WCAG/design-system minimum. Only auth.html meets the standard.
Fix required: Add @media (max-width: 639px) block upsizing all interactive elements to 44px minimum height. Mobile approve/reject buttons must be 44px+.

### ISSUE-4: Gantt chart completely unusable on mobile
Page(s): gantt.html
Priority: CRITICAL
Category: Mobile
Description: 240px left panel + 1200px timeline = ~1440px minimum width. At 390px only 3.75 days visible. No mobile alternative exists. No page-specific mobile CSS at all.
Fix required: Create a mobile Gantt alternative — a simplified list/card view showing Employee -> Current Project -> Dates -> Utilization % as stacked cards. Link to desktop view for full detail.

### ISSUE-5: Timesheets unusable on mobile
Page(s): timesheets.html
Priority: CRITICAL
Category: Mobile
Description: 9-column grid table (~830px minimum width). Cell inputs are 28px. No mobile media queries. A user cannot meaningfully enter time on a phone.
Fix required: Create a mobile timesheet view — day-by-day or project-by-project card layout. Each card: project name, large hours input (44px+), note field. Day switcher at top.

### ISSUE-6: Analytics/Insights duplicate navigation entry
Page(s): ALL pages (sidebar)
Priority: CRITICAL
Category: Navigation
Description: insights.html appears twice: "Analytics" under Finance (bar-chart-3 icon) and "Insights" under AI (sparkles icon). Both go to the same file. Active state only highlights the AI entry. A user clicking Finance > Analytics sees an AI page. Confusing and misleading.
Fix required: Either split into two separate pages (financial analytics vs AI insights) or remove the duplicate entry. Rename as needed so labels match destinations.

### ISSUE-7: Broken link to non-existent analytics.html
Page(s): employees.html:483
Priority: CRITICAL
Category: Navigation
Description: employees.html links to `analytics.html` which does not exist. Every other page links to `insights.html` for the same nav item. Pure 404.
Fix required: Change href from `analytics.html` to `insights.html` on employees.html.

### ISSUE-8: No cost model — profitability is decorative
Page(s): projects.html
Priority: CRITICAL
Category: Missing Feature
Description: The "32% margin" stat card is an unsubstantiated number. No internal cost rate exists in the data model. No cost breakdown per employee. Revenue minus cost equals profit — this is the entire value proposition for a consulting firm, and it is absent.
Fix required: Add internal_cost_rate concept. Show Revenue, Cost, and Gross Margin per employee on the Team tab. Add totals row. Show margin waterfall on Overview tab. Make all financial math internally consistent.

### ISSUE-9: Revenue/financial numbers don't reconcile across pages
Page(s): projects.html, invoices.html, clients.html
Priority: CRITICAL
Category: Data/Content
Description: Multiple contradictions: (a) Project revenue 24,500 but team hours x rates = 32,200. (b) INV-2026-048 shows 12,400 in list but 13,044 in detail. (c) Budget shows 49% on project detail but 72% on client Projects tab for same project. (d) "Acme" vs "Acme Corp" naming inconsistency. Every number that appears in more than one place must reconcile.
Fix required: Audit every financial number. Pick canonical values. Make hours x rates = revenue displayed. Make invoice amounts consistent between list and detail views.

### ISSUE-10: Invoice number collisions across pages
Page(s): projects.html, invoices.html
Priority: CRITICAL
Category: Data/Content
Description: INV-2026-042 appears on the project Invoices tab (Draft, 8,500, Acme) AND on the invoices list page (Paid, 30,000, Initech/Security Audit). Same number, different client, project, amount, status, date. Zero common invoice records between project detail and invoice list for the Acme project.
Fix required: Assign unique invoice numbers across all pages. Ensure project detail invoices appear in the main invoice list with matching data.

### ISSUE-11: Inter-page data pipeline doesn't exist
Page(s): timesheets.html, expenses.html, projects.html, invoices.html
Priority: CRITICAL
Category: Missing Feature
Description: Each page tells its own financial story in isolation. No "Invoiced" status exists for timesheets or expenses. A pending expense appears on an invoice. Approved timesheet hours have no path to project financials. The Generate Invoice modal is entirely static (changing inputs doesn't update preview). This chain IS the product for a consulting firm.
Fix required: Add consistent sample data across pages. Show "Invoiced" badge on timesheet/expense entries that appear on invoices. Make Generate Invoice modal show dynamic preview. Ensure project financial totals match timesheet/expense data.

### ISSUE-12: All detail views hardcoded to single entity
Page(s): projects.html, clients.html
Priority: CRITICAL
Category: UX Flow
Description: Every project click shows "Acme Web Redesign" regardless of which card was clicked. Same for clients. Cross-page links (clients.html -> projects.html) carry no parameters. Drill-down chain is conceptually present but practically broken.
Fix required: Create at least 2-3 distinct detail view variants per entity (different projects, different clients) to demonstrate the data model works. Use hash-based routing to switch content.

### ISSUE-13: 50+ badges missing icons — systemic spec violation
Page(s): planning.html, employees.html, expenses.html, leaves.html, clients.html, insights.html, admin.html
Priority: CRITICAL
Category: Visual
Description: Design system requires "All badges include semantic icons (not just color)." 50+ badges across the prototype are text-only. This is both an accessibility failure (color is the sole differentiator) and a design-system violation.
Fix required: Add appropriate Lucide SVG icons to every badge. Status badges: check-circle (success), clock (pending), x-circle (error), alert-triangle (warning). Category badges: relevant icons per type.

### ISSUE-14: gantt.html bypasses component system entirely
Page(s): gantt.html
Priority: CRITICAL
Category: Visual
Description: 13+ avatar elements built with fully inline styles including 10 hardcoded hsl colors not in the token system, hardcoded font-size:11px, font-weight:600, and #fff. The existing .avatar CSS class is completely ignored. Worst-polished page in the prototype (3/10).
Fix required: Replace all inline avatar styles with proper `.avatar` component classes. Define avatar background colors as CSS custom properties. Remove all hardcoded values.

---

## HIGH — A real user would be frustrated or confused

### ISSUE-15: Sidebar template drift (employees.html + gantt.html)
Page(s): employees.html, gantt.html
Priority: HIGH
Category: Navigation
Description: These two pages were built from a different template version: different badge counts (3 vs 12 for Approvals), missing badges on Timesheets/Expenses/Leaves, different Approvals icon (check-circle vs check-square), different sidebar collapse button IDs, different user dropdown patterns.
Fix required: Sync both pages to match the sidebar template used by all other pages (index.html as reference).

### ISSUE-16: Expense submission produces no visible result
Page(s): expenses.html
Priority: HIGH
Category: UX Flow
Description: submitExpense() fires a success toast and switches tabs, but no new expense item appears in the "My Expenses" list. No form clearing. User has zero visual confirmation their expense was recorded. Broken completion state.
Fix required: Dynamically insert a new expense card into My Expenses list with "Pending" badge, clear the form, and show the new item highlighted.

### ISSUE-17: Leave rejection has no reason prompt
Page(s): leaves.html
Priority: HIGH
Category: UX Flow
Description: Team leave rejection fires immediately with no reason modal. Expense and timesheet rejection correctly require reasons. Inconsistent and wrong — rejected employees deserve to know why.
Fix required: Add the same rejection reason modal pattern used for expenses/timesheets to the team leave rejection flow.

### ISSUE-18: Timesheet grid doesn't lock after submission
Page(s): timesheets.html
Priority: HIGH
Category: UX Flow
Description: After clicking "Submit for Review," the grid remains fully editable. Should become read-only with a "Submitted for review" banner and disabled inputs.
Fix required: Add a submitted state that disables all cell inputs, shows a status banner, and changes the Submit button to "Recall Submission."

### ISSUE-19: Approvals hub detail modal is empty placeholder
Page(s): approvals.html
Priority: HIGH
Category: UX Flow
Description: "View Details" opens a modal with just placeholder text. A manager reviewing a timesheet needs the full hour breakdown. Reviewing an expense needs the receipt. This is the single most important feature for thoughtful approval.
Fix required: Populate the detail modal with type-appropriate content: timesheet grid breakdown, expense details with receipt preview, leave details with calendar context.

### ISSUE-20: No ARIA attributes on interactive components
Page(s): ALL pages
Priority: HIGH
Category: Visual (Accessibility)
Description: No role, aria-expanded, aria-checked on custom interactive components. No focus trapping in modals. No skip-to-content link. Toggles have no role="switch". Tabs have no role="tab". Command palette has no role="combobox".
Fix required: Add ARIA attributes to all custom interactive elements. Implement focus trapping in modals. Add skip-to-content link.

### ISSUE-21: Hardcoded #fff and inline hsl values throughout
Page(s): _components.css, _layout.css, gantt.html, clients.html, leaves.html, portal/index.html, auth.html
Priority: HIGH
Category: Visual
Description: 6+ instances of #fff in _components.css, 30+ inline hsl() values in HTML files. No --color-white or --color-text-on-primary token exists. Bypasses the token system.
Fix required: Define --color-white and --color-text-on-primary tokens. Replace all hardcoded color values with token references.

### ISSUE-22: Filter bar implemented 4+ different ways
Page(s): employees.html, expenses.html, leaves.html, gantt.html, invoices.html, approvals.html
Priority: HIGH
Category: Visual
Description: Some filter bars have background/border/radius card treatment, others are bare flex rows. Looks like 4 different developers built it.
Fix required: Create ONE standardized .filter-bar component in _components.css with modifier classes. Apply uniformly.

### ISSUE-23: All employee/project name links go to list pages, not profiles
Page(s): index.html, approvals.html, projects.html, clients.html
Priority: HIGH
Category: Navigation
Description: Clicking "Sarah Chen" anywhere goes to employees.html (the directory), not to her profile. Clicking "Acme Web Redesign" goes to projects.html (the list), not to the project detail. Blueprint rule: "Every employee name is a clickable link to their profile page."
Fix required: Add hash-based routing so links go to specific entity detail views (e.g., employees.html#sarah-chen, projects.html#acme-web).

### ISSUE-24: Dashboard KPI cards not clickable
Page(s): index.html
Priority: HIGH
Category: UX Flow
Description: Blueprint says "Click: navigates to relevant detail page." KPI cards are just div.stat-card, not links. "12 Pending Approvals" should click through to approvals.html.
Fix required: Wrap stat cards in anchor tags or add click handlers that navigate to relevant pages.

### ISSUE-25: Dashboard missing "Week at a Glance" hero widget
Page(s): index.html
Priority: HIGH
Category: Missing Feature
Description: The blueprint's centerpiece — a personal mini week timeline showing hours logged per day with "Quick Log Today's Time" CTA — is completely absent. The dashboard has no personal timesheet context. Replaced by a team-level mini Gantt which serves a different purpose.
Fix required: Add the hero section above KPI cards showing Mon-Fri with progress bars for hours logged, today highlighted, and a quick-log CTA.

### ISSUE-26: Client detail lacks per-project revenue and margin
Page(s): clients.html
Priority: HIGH
Category: Missing Feature
Description: Client Projects tab shows 5 projects with status and budget % but no revenue or margin per project. A CTO cannot see which project is most profitable. No profitability comparison across projects for the same client.
Fix required: Add Revenue, Cost, Margin columns to the client Projects tab table. Add totals row.

### ISSUE-27: Presence badge count incorrect
Page(s): index.html
Priority: HIGH
Category: Data/Content
Description: Badge says "8 online" but counting green dots shows 6 online. Math is wrong on the landing page — erodes trust immediately.
Fix required: Fix count to match actual green-dot entries.

### ISSUE-28: Dashboard greeting shows wrong day of week
Page(s): index.html
Priority: HIGH
Category: Data/Content
Description: Says "Saturday, April 5, 2026" but April 5, 2026 is a Sunday. Shows workday content for a weekend day.
Fix required: Change to "Sunday, April 5, 2026" or adjust the date to a weekday (e.g., "Monday, April 6, 2026").

### ISSUE-29: ~40 dashboard widget CSS classes defined inline
Page(s): index.html
Priority: HIGH
Category: Visual
Description: Classes like .presence-item, .ai-alert, .approval-item, .revenue-bar, .donut-*, .util-bar, .gantt-row are all in index.html's style block, not in _components.css. Other pages redefine the same patterns with divergent styles.
Fix required: Move reusable widget styles to _components.css. Keep only truly page-specific overrides inline.

### ISSUE-30: No ARIA on any dashboard interactive widget
Page(s): index.html
Priority: HIGH
Category: Visual (Accessibility)
Description: The entire dashboard has exactly 1 aria-label (notification bell). Tabs, approve/reject buttons, dropdowns, sortable headers, command palette have zero ARIA. Dashboard is the most interaction-dense page and the worst for accessibility.
Fix required: Add aria-label, role, aria-expanded, aria-selected attributes to all dashboard interactive elements.

### ISSUE-31: Missing 3 dashboard widgets from blueprint
Page(s): index.html
Priority: HIGH
Category: Missing Feature
Description: Blueprint specifies Action Required panel, Upcoming (7-day events), and Recent Activity Feed. None exist. The Utilization Heatmap is replaced by a Team Availability table (acceptable alternative). Dashboard blueprint compliance is only 25%.
Fix required: Add Upcoming Events section (right column). Add Recent Activity Feed (left column). Action Required can be merged with existing Approvals widget.

### ISSUE-32: Generate Invoice modal is entirely static
Page(s): invoices.html
Priority: HIGH
Category: UX Flow
Description: Changing client, project, or date range does not update the invoice preview. The preview summary is hardcoded. This is the core revenue conversion mechanism.
Fix required: Wire the dropdowns to dynamically update preview amounts based on selected project's team rates and hours.

### ISSUE-33: No "Invoiced" status in timesheet/expense lifecycle
Page(s): timesheets.html, expenses.html
Priority: HIGH
Category: Missing Feature
Description: Once timesheet hours are approved, there's no indication they've been billed. Once expenses are approved, no path to an invoice. A pending expense even appears on an invoice. The revenue recognition chain has no visibility.
Fix required: Add "Invoiced" badge/status to approved timesheet entries and expenses that appear on invoices.

---

## MEDIUM — Reduces quality but doesn't block core usage

### ISSUE-34: Logout label inconsistent across pages
Page(s): Multiple
Priority: MEDIUM
Category: Navigation
Description: Three variants: "Logout", "Sign out", "Sign Out" across different pages.
Fix required: Pick one label and apply everywhere.

### ISSUE-35: User dropdown element type inconsistent
Page(s): clients.html, invoices.html, employees.html vs others
Priority: MEDIUM
Category: Navigation
Description: Some pages use `<a>` tags with hrefs, others use `<button>` with no handlers. Buttons do nothing.
Fix required: Standardize all dropdown items as `<a>` tags with appropriate hrefs.

### ISSUE-36: "Profile" link goes to team directory
Page(s): ALL pages with user dropdown
Priority: MEDIUM
Category: Navigation
Description: User dropdown "Profile" link goes to employees.html (the team directory), not the current user's profile.
Fix required: Link to employees.html#profile or a dedicated profile hash.

### ISSUE-37: Command palette items not navigable
Page(s): ALL pages
Priority: MEDIUM
Category: UX Flow
Description: Palette opens and closes correctly, but clicking results doesn't navigate anywhere. "Dashboard" in Pages section, "Log Time" in Quick Actions — no handlers.
Fix required: Add click handlers to palette items that navigate to relevant pages.

### ISSUE-38: Financial numbers not monospace in notifications
Page(s): index.html, expenses.html, portal/index.html
Priority: MEDIUM
Category: Visual
Description: Monetary values in notification text (e.g., "INV-2026-0041... 12,400") appear in plain sans-serif. Invoice IDs also lack mono treatment.
Fix required: Wrap inline monetary values and invoice IDs in `<span class="font-mono">`.

### ISSUE-39: Missing Calendar page
Page(s): N/A (doesn't exist)
Priority: MEDIUM
Category: Missing Feature
Description: Calendar is listed in the blueprint nav but completely absent from the prototype. Core feature for an HR app.
Fix required: Create calendar.html with month/week/day views showing leaves, holidays, and milestones.

### ISSUE-40: Timesheet status bar data mismatch on load
Page(s): timesheets.html
Priority: MEDIUM
Category: Data/Content
Description: Static HTML says "32.5h logged" but grid values sum to 40h. JS corrects it on interaction but first impression is wrong.
Fix required: Make static HTML match the grid values.

### ISSUE-41: No form validation on expense submission
Page(s): expenses.html
Priority: MEDIUM
Category: UX Flow
Description: submitExpense() succeeds regardless of whether any fields are filled. No inline validation, no error states.
Fix required: Add required-field validation with inline error messages and red borders.

### ISSUE-42: Edit/Cancel buttons on pending expenses non-functional
Page(s): expenses.html
Priority: MEDIUM
Category: UX Flow
Description: Buttons exist but have no click handlers. User who made a typo cannot fix it.
Fix required: Wire Edit to re-open the form pre-filled. Wire Cancel to show confirmation then remove.

### ISSUE-43: No half-day support in leave requests
Page(s): leaves.html
Priority: MEDIUM
Category: Missing Feature
Description: Blueprint specifies half-day support. Form only allows full days.
Fix required: Add a half-day toggle (morning/afternoon) that adjusts the working days calculation.

### ISSUE-44: Modals don't go full-screen on mobile
Page(s): ALL pages with modals
Priority: MEDIUM
Category: Mobile
Description: Modals have max-width/max-height but no mobile media query for full-screen. Complex forms will be cramped at 390px. Modal close button is 32px (below touch target).
Fix required: Add @media (max-width: 639px) { .modal { width: 100vw; height: 100vh; max-width: 100vw; border-radius: 0; } }

### ISSUE-45: Admin breakpoint inconsistent
Page(s): admin.html
Priority: MEDIUM
Category: Visual
Description: Uses 768px breakpoint while system defines 639px and 1023px.
Fix required: Change to system-consistent breakpoint.

### ISSUE-46: Portal doesn't import _layout.css
Page(s): portal/index.html
Priority: MEDIUM
Category: Mobile
Description: Missing import means no mobile grid collapse, no hamburger menu logic. Portal nav has no responsive handling.
Fix required: Either import _layout.css or add portal-specific responsive CSS.

### ISSUE-47: No loading/saving states on any buttons
Page(s): ALL pages
Priority: MEDIUM
Category: UX Flow
Description: Every action is instant. No spinner or "Submitting..." state. The .btn-loading class exists in CSS but is never used in any HTML.
Fix required: Add loading states to primary action buttons (Submit, Approve, Save Draft).

### ISSUE-48: Notifications are static and not clickable
Page(s): ALL pages
Priority: MEDIUM
Category: UX Flow
Description: Notification panel items cannot be clicked to navigate to the relevant entity. "Mark all read" does nothing. No indication of which page a notification relates to.
Fix required: Add click handlers to notification items. Wire "Mark all read" to remove unread styles.

### ISSUE-49: Currency inconsistency across pages
Page(s): employees.html, gantt.html vs other pages
Priority: MEDIUM
Category: Data/Content
Description: Most pages use Euro. employees.html profile and gantt.html project budgets use Dollar ($). Should be consistent.
Fix required: Standardize all currency to Euro across the prototype.

---

## LOW — Polish and refinement

### ISSUE-50: Sidebar collapse button ID inconsistent
Page(s): employees.html, gantt.html
Priority: LOW
Category: Navigation
Description: Uses `sidebarToggle` while all other pages use `sidebarCollapseBtn`.
Fix required: Standardize ID.

### ISSUE-51: Title separator format inconsistent
Page(s): ALL pages
Priority: LOW
Category: Visual
Description: Mix of hyphen, em dash, and HTML entity em dash in `<title>` tags. gantt.html includes "v2".
Fix required: Standardize all titles to "Page — GammaHR Quantum" format.

### ISSUE-52: Breadcrumb component defined but never used
Page(s): _components.css
Priority: LOW
Category: Visual
Description: .breadcrumb CSS exists but no page uses it. Blueprint suggests breadcrumbs for drill-down navigation.
Fix required: Add breadcrumbs to detail views (Client > Acme Corp > Acme Web Redesign).

### ISSUE-53: No light mode toggle
Page(s): ALL pages
Priority: LOW
Category: Missing Feature
Description: Light mode CSS variables are defined in the spec but no theme toggle exists in the prototype.
Fix required: Add a theme toggle in the header or user dropdown.

### ISSUE-54: No print stylesheet
Page(s): ALL pages
Priority: LOW
Category: Missing Feature
Description: An HR/finance app needs printable views for invoices, timesheets, and reports.
Fix required: Add @media print rules hiding sidebar, header, and non-content elements.

### ISSUE-55: Donut chart redundant and non-interactive
Page(s): index.html
Priority: LOW
Category: UX Flow
Description: Full-width donut repeats the "87% billable" already shown in KPI cards. Not actionable, no drill-down, no hover interactivity.
Fix required: Either remove or make it interactive with hover tooltips and click-through to analytics.

---

## Summary by Priority

| Priority | Count | Action |
|----------|-------|--------|
| CRITICAL | 14 | Must all be resolved |
| HIGH | 19 | Must all be resolved |
| MEDIUM | 16 | Should be resolved |
| LOW | 6 | Resolve if time permits |

## Fix Order Recommendation

**Phase A — Foundation (do first, enables everything else):**
1. Sync sidebar templates (ISSUE-15, 7, 6, 50) — establishes single source of truth
2. Fix financial data consistency (ISSUE-9, 10, 27, 28, 40, 49)
3. Move inline CSS to _components.css (ISSUE-29, 22, 14, 21)

**Phase B — Mobile (parallel track):**
4. Bottom nav bar (ISSUE-1)
5. Touch target upsizing (ISSUE-3)
6. Table-to-card transforms (ISSUE-2)
7. Mobile timesheet view (ISSUE-5)
8. Mobile Gantt alternative (ISSUE-4)
9. Full-screen modals (ISSUE-44)

**Phase C — Missing Features:**
10. Project profitability/cost model (ISSUE-8, 26)
11. Multiple detail view variants (ISSUE-12)
12. Dashboard hero widget + missing widgets (ISSUE-25, 31, 24)
13. Inter-page data pipeline consistency (ISSUE-11, 33, 32)

**Phase D — UX Flow Fixes:**
14. Expense submission completion (ISSUE-16)
15. Leave rejection reason (ISSUE-17)
16. Timesheet post-submit lock (ISSUE-18)
17. Approvals detail modal (ISSUE-19)
18. Entity deep links (ISSUE-23)
19. Badge icons (ISSUE-13)

**Phase E — Accessibility & Polish:**
20. ARIA attributes (ISSUE-20, 30)
21. Remaining MEDIUM and LOW issues
