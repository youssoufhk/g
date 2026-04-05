# GammaHR v2 -- Phase 2 Master Fix Plan

**Consolidated from:** Founder feedback (48 issues) + 4 Expert Critic audits (PM, UX, Architecture, Domain)
**Date:** 2026-04-05
**Total unique fixes:** 62 (22 CRITICAL, 24 HIGH, 16 MEDIUM)

---

## CRITICAL -- Must Fix (Prototype is broken or fundamentally misleading without these)

### FIX-1: Build HR Module from Scratch
Page(s): NEW hr.html, ALL sidebar navs
Priority: CRITICAL
Source: Founder #36, Critic-PM C-1, Critic-DOMAIN #1-5
Description: The app is called "GammaHR" but contains ZERO HR features. No recruitment, onboarding, offboarding, performance reviews, or employee lifecycle management. Every procurement evaluation will disqualify this in the first 5 minutes.
Fix required:
- Create `hr.html` with tabs: Recruitment, Onboarding, Offboarding, Directory
- **Recruitment tab:** Job postings list with status badges (Open/Closed/Draft), candidate pipeline as Kanban (Applied → Screening → Interview → Offer → Hired/Rejected), interview scheduling cards, candidate detail with profile/CV/interviewer comments/rating/offer status
- **Onboarding tab:** Checklist templates (configurable per role/dept), active onboardings showing employee name + progress bar + pending items, document collection tracker, equipment provisioning list
- **Offboarding tab:** Exit checklist (knowledge transfer, equipment return, access revocation), active offboardings with progress
- Add "HR" nav section to sidebar on ALL 15+ pages (between "Main" and "Work" sections)
- Add sidebar badge count for HR (e.g., "5" for pending onboarding tasks)

### FIX-2: Rename All "Utilisation" to "Work Time"
Page(s): ALL files (130+ occurrences across 14 files)
Priority: CRITICAL
Source: Founder #1, Critic-PM C-2, Critic-DOMAIN terminology
Description: "Utilisation" is dehumanizing. Appears 130+ times in HTML text, CSS class names, and comments. Must be fully eradicated.
Fix required:
- Global rename in all HTML: "Utilisation" → "Work Time", "Utilization" → "Work Time", "Utilized" → "Allocated"
- CSS class renames: `.util-bar` → `.worktime-bar`, `.utilization-fill` → `.worktime-fill`, `.utilization-track` → `.worktime-track`, `.util-high/mid/low/over` → `.worktime-high/mid/low/over`, `.utilization-pct` → `.worktime-pct`
- Chart labels, tooltip text, table headers, badge text -- every instance
- In DESIGN_SYSTEM.md semantic color table: "Utilization healthy/low/critical" → "Allocation healthy/low/critical"

### FIX-3: Fix Dashboard Grid Layout
Page(s): index.html
Priority: CRITICAL
Source: Founder #4, Critic-PM C-3, Critic-UX
Description: Dashboard KPI cards use a 6-column grid that creates cards too narrow to read at typical laptop widths. Founder reports cards stack vertically. The `.kpi-grid` is defined inline in page CSS, not using the shared grid system.
Fix required:
- Change `.kpi-grid` to `grid-template-columns: repeat(3, 1fr)` as default (2 rows of 3 cards)
- At tablet: `repeat(2, 1fr)`; at mobile: `1fr`
- Reduce from 6 KPI cards to 4 (most actionable: Hours This Week, Pending Approvals, Work Time %, Revenue This Month) OR keep 6 but in 3x2 grid
- Move "Billable vs Internal Hours" chart from bottom to TOP of the right column (Founder #7)
- Redesign the overall dashboard as a responsive grid, NOT a vertical stack

### FIX-4: Fix Mobile -- Apply mobile-cards to ALL Tables
Page(s): ALL HTML files with `<table class="data-table">`
Priority: CRITICAL
Source: Founder #13, Critic-UX C2, Critic-MOBILE
Description: The CSS defines a thorough `.data-table.mobile-cards` table-to-card system. ZERO HTML tables use the class. ZERO `<td>` elements have `data-label` attributes. Every data table horizontal-scrolls on mobile.
Fix required:
- Add `class="mobile-cards"` to every `<table class="data-table">` in every HTML file
- Add `data-label="Column Name"` to every `<td>` in every table
- Pages affected: index.html, employees.html, timesheets.html, expenses.html, leaves.html, projects.html, clients.html, invoices.html, approvals.html, insights.html, planning.html, admin.html, gantt.html

### FIX-5: Fix All Cross-Page Data Consistency
Page(s): ALL files
Priority: CRITICAL
Source: Critic-ARCH (1.1-1.8, 4.1-4.4, 5.1-5.4)
Description: Every page tells its own story with its own fabricated data. Invoice numbers collide, employee roles mutate, financial figures contradict. Trust is impossible.
Fix required:
- **Standardize email domain:** `@gammahr.io` everywhere (currently 3 different domains for Sarah Chen)
- **Fix employee roles/titles:** One canonical title per person across ALL pages:
  - Sarah Chen: "Engineering Lead" everywhere
  - John Smith: "Senior Developer" everywhere
  - Bob Taylor: "Backend Developer" (BENCH status, NOT assigned to Helix)
  - Emma Laurent: "QA Engineer" everywhere (NOT simultaneously on leave and online)
  - Carol Kim: "Data Analyst" everywhere
- **Fix employee count:** Either scale directory to ~48 entries OR reduce dashboard KPIs to match 12 employees. Recommend: add 36 more employee cards to employees.html with pagination
- **Fix project names:** Dashboard uses "Quantum Platform", "Meridian Portal", "Helix Migration" while other pages use "Acme Web Redesign", "Globex Phase 2". Standardize all to match projects.html
- **Remove "Meridian Corp" ghost entity** from dashboard notifications/activity feed (doesn't exist as a client)
- **Fix invoice number collisions:** INV-2026-042 used for both Initech and Acme. Assign unique numbers.
- **Fix invoice financial math:** Outstanding EUR 28,400 doesn't match sum of sent+overdue invoices (should be EUR 33,400). Fix to reconcile.
- **Fix Acme YTD revenue:** clients.html shows EUR 95,900 but invoice sum is EUR 45,700. Reconcile.
- **Fix hours period:** Dashboard uses 1,842h for both "This Week" and "This Month" -- fix one.
- **Fix impossible states:** Emma can't be on leave AND online at 100%. Bob can't be bench AND working. Alice can't have 4 conflicting leave date ranges.

### FIX-6: Fix Entity Deep Links
Page(s): ALL pages with employee/project/client links
Priority: CRITICAL
Source: Founder #44, Critic-PM H-6, Critic-UX, Critic-ARCH
Description: Every employee name links to `employees.html` generic. Every project to `projects.html`. Every client to `clients.html`. No hash-based routing to specific entities.
Fix required:
- All employee name links: `employees.html#sarah-chen`, `employees.html#john-smith`, etc.
- All project links: `projects.html#acme-web-redesign`, `projects.html#globex-phase-2`, etc.
- All client links: `clients.html#acme-corp`, `clients.html#globex`, etc.
- Add JS on each target page to detect hash on load and show the appropriate detail view
- Create at least 3 distinct employee profiles, 3 project details, and 3 client details

### FIX-7: Add SVG Icons to All Badges
Page(s): ALL pages (68+ badges affected)
Priority: CRITICAL
Source: Founder (from Phase 1), Critic-UX C3
Description: Spec requires "All badges include semantic icons (not just color)." 68+ badges use `badge-dot` (CSS dot) instead of SVG icons. This is both an accessibility violation (color as sole indicator) and a design system violation.
Fix required:
- Replace every `badge-dot` with appropriate Lucide SVG icons:
  - Success/Approved/Active/Online: check-circle
  - Pending/Warning: clock / alert-triangle
  - Error/Rejected/Overdue: x-circle
  - Info: info
  - On Leave: palm-tree
  - Bench: pause-circle
  - Away: moon
  - Offline: circle (gray)
- Update employees.html (24 badges), admin.html (39 badges), planning.html (3), gantt.html (1), index.html (1)

### FIX-8: Fix Progress Bars to Support >100%
Page(s): employees.html, index.html, gantt.html, insights.html, planning.html, timesheets.html
Priority: CRITICAL
Source: Founder #2, Critic-PM C-4, Critic-UX H3
Description: Progress/work-time bars cap at 100%. Someone working 60h in a 40h week (150%) shows identically to 100%. No visual distinction between "fully allocated" and "dangerously over-allocated."
Fix required:
- Change `.worktime-track` (formerly `.utilization-track`) to `overflow: visible`
- For values >100%: show green fill up to 100% mark, then red/terracotta fill extending beyond with `--color-error` background
- Show actual percentage text (e.g., "150%") with warning icon
- Add animated pulse on the overflow segment
- Add CSS class `.worktime-overflow` for the >100% state

### FIX-9: Add AI Insights to ALL Entity Views
Page(s): employees.html, projects.html, clients.html, invoices.html
Priority: CRITICAL
Source: Founder #14-15, Critic-PM H-3
Description: Entity overview pages lack AI-powered contextual intelligence. Every entity detail must have a smart, context-aware AI summary card.
Fix required:
- **Employee AI card:** "Work pattern analysis: Sarah has averaged 42h/week this quarter, up 8% from Q1. No vacation scheduled in 6 weeks -- recommend manager check-in. Strongest skill growth in React (3 projects). Career trajectory suggests readiness for Tech Lead role in 6-12 months."
- **Project AI card:** "Budget alert: Acme Web Redesign is burning budget 15% faster than planned. At current rate, budget exhausted by May 20. Team velocity declining -- 2 sprints behind. Recommend: reduce Sprint 3 scope or renegotiate timeline with client. Risk score: 7/10."
- **Client AI card:** "Acme Corp represents 35% of total revenue -- concentration risk. Payment behavior: average 18 days (excellent). Revenue trending +12% YoY. Relationship health: strong. Recommendation: propose Phase 2 engagement to deepen relationship."
- **Invoice AI card:** "Payment prediction: 85% likely to be paid within terms based on Acme's payment history. If unpaid by May 10, recommend automated follow-up. Aging analysis: 0 invoices >60 days for this client."

### FIX-10: Standardize Filter Bars
Page(s): ALL pages with filter bars (9 different implementations)
Priority: CRITICAL
Source: Critic-UX C4, Critic-ARCH 7.1
Description: 9 different filter bar implementations exist across pages. A standardized `.filter-bar-standard` class exists in `_layout.css` but ZERO pages use it.
Fix required:
- Replace all page-specific `.filter-bar` CSS with the shared `.filter-bar-standard`
- Ensure every filter bar has: search input, filter dropdowns, consistent padding/background/border
- Add active filter chips (`.filter-chip` class exists in `_components.css`, unused)
- Pages to fix: employees, expenses, leaves, projects, clients, invoices, approvals, admin, gantt

### FIX-11: Fix Charts -- Add Axes, Gridlines, Tooltips
Page(s): index.html, insights.html, clients.html, planning.html
Priority: CRITICAL
Source: Critic-UX C5
Description: All SVG charts are decorative -- no axis labels, no gridlines, no interactive tooltips. Spec requires "Gridlines: subtle, dashed, low opacity (0.1)" and "Tooltips: glass morphism, compact."
Fix required:
- Add Y-axis labels (values) and X-axis labels (months/categories) to all bar/line charts
- Add horizontal dashed gridlines at regular intervals (opacity: 0.1)
- Add tooltip on hover showing exact value (use glass morphism CSS from tokens)
- Specifically redesign: Revenue trend bars (index.html), Revenue trend (insights.html), Capacity chart (planning.html), Client revenue chart (clients.html)

### FIX-12: Add Breadcrumbs to All Detail Views
Page(s): employees.html, projects.html, clients.html, invoices.html
Priority: CRITICAL
Source: Founder #43, Critic-PM N-1, Critic-UX C6
Description: No breadcrumbs exist on any page. CSS `.breadcrumbs` component is defined but unused. Detail views use "Back" buttons but users lose context in multi-level navigation.
Fix required:
- Add breadcrumbs to all detail/profile views:
  - Employee profile: `Team Directory > Sarah Chen`
  - Project detail: `Projects > Acme Web Redesign`
  - Client detail: `Clients > Acme Corp`
  - Invoice detail: `Invoices > INV-2026-048`
- Use the existing `.breadcrumbs` component from `_components.css`

### FIX-13: Eliminate Inline Styles (1,089 total)
Page(s): ALL HTML files
Priority: CRITICAL
Source: Critic-UX C1, Critic-ARCH 6.3
Description: 1,089 inline `style=""` attributes across 15 pages. Dashboard alone has 194. This makes the prototype unmaintainable and impossible to theme.
Fix required:
- Move common inline patterns to new utility/component classes in `_components.css`:
  - `.notif-icon-wrap` for notification panel icon wrappers
  - `.activity-item` for activity feed items
  - `.presence-item` for live presence panel
  - `.week-day-col` for week-at-a-glance columns
  - `.ai-alert-item` for AI alert cards
  - `.approval-mini-item` for dashboard approval widget items
- Replace `style="display:flex;align-items:center;gap:..."` with existing flex utility classes
- Replace `style="margin-bottom: var(--space-6)"` with `.mb-6`
- Target: reduce to <50 inline styles total (some data-driven styles like chart positioning are acceptable)

### FIX-14: Fix Client Overview -- Add Business Intelligence
Page(s): clients.html
Priority: CRITICAL
Source: Founder #15, Critic-PM H-2, Critic-DOMAIN
Description: Client detail view is too thin. Missing: % of total business, PM ownership, revenue trends with comparison, profitability, payment behavior, relationship health.
Fix required:
- Add "Client Health" card at top of detail view with:
  - % of total revenue (with warning color if >25% = concentration risk)
  - Assigned Account Manager (clickable employee link)
  - Client health score badge (green/yellow/red)
  - Payment behavior metric (avg days to pay)
  - Outstanding balance / overdue amount
- Add per-project revenue and margin columns to Projects tab
- Add revenue trend sparkline with YoY comparison
- Add AI relationship recommendation card (see FIX-9)

### FIX-15: Fix Dashboard Graphs and Layout
Page(s): index.html
Priority: CRITICAL
Source: Founder #5, #6, #7, #8, #9
Description: Dashboard graphs are unclear. "Billable vs Internal" is buried at bottom. Quick Log Time needs leave support. Project search needs unassigned support.
Fix required:
- Redesign "Billable vs Internal Hours" chart and move to TOP of right column
- Improve all chart readability (proper labels, gridlines -- see FIX-11)
- Add leave logging option to Quick Log Time widget (dropdown: "Log Time" / "Log Leave")
- Add project search to Quick Log Time that shows assigned projects by default, all projects via search
- Unassigned project time entries show "Requires Approval" indicator
- Add AI wellbeing alerts: "2 team members haven't taken leave in 3+ months", "3 employees consistently logging >45h/week"

---

## HIGH -- Must Fix (Real users would be frustrated or confused)

### FIX-16: Build calendar.html
Page(s): NEW calendar.html, ALL sidebar navs
Priority: HIGH
Source: Founder #40, Critic-PM H-5
Description: Calendar is in the spec (Section 12) but completely absent from the prototype. No calendar.html exists.
Fix required:
- Create `calendar.html` with month/week views
- Show: leaves (colored by type), public holidays, project milestones, deadlines
- Month view: day cells with event dots/badges, click to expand
- Add "Calendar" to sidebar navigation on all pages
- Include filters: by team, department, event type

### FIX-17: Fix Employee Directory -- Scale to 200+
Page(s): employees.html
Priority: HIGH
Source: Founder #28-29, Critic-PM H-1
Description: Directory shows only 12 cards with no pagination, no alphabetical jump, and no org chart view. Won't scale to 200+ employees.
Fix required:
- Add pagination controls ("Showing 1-24 of 248 team members" with prev/next)
- Add alphabetical jump sidebar (A-Z quick links)
- Add Org Chart view toggle (Grid | List | Org Chart)
- Org chart: hierarchical tree showing department heads, team leads, individual contributors with reporting lines
- Add search with server-side search indication (debounce, loading spinner)
- Increase sample data to show scale (add more employee cards, even if simplified)

### FIX-18: Fix Admin / Configuration Page
Page(s): admin.html
Priority: HIGH
Source: Founder #30-35, Critic-DOMAIN
Description: Company Settings has useless fields (Company Size, Industry). Missing: logo upload, tax/VAT number, approval chain config, standard work hours/days. Users panel lacks filtering. Audit log not manageable at scale. Holidays need auto-import.
Fix required:
- **Company Settings:** Remove "Company Size" and "Industry" fields. Add: logo upload area, tax/fiscal number, VAT number, approval chain configuration (multi-level), standard work hours per day, standard work days per week
- **Users panel:** Add filters (department, role, status) + sorting (name, role, last login, status)
- **Audit Log:** Add date range filter, user filter, action type filter, search, export button, retention policy display, proper pagination ("Showing 1-20 of 4,847")
- **Holidays:** Add "Import Public Holidays" button with country/year selector + manual add/edit/remove

### FIX-19: Fix Resource Planning Layout
Page(s): planning.html
Priority: HIGH
Source: Founder #10-12, Critic-UX
Description: "Hours with Gap/Surplus" widget is confusing. Layout is too stacked. Needs AI bench forecast. Planning page overloaded with equal-weight sections.
Fix required:
- Redesign to card-based layout with clear visual hierarchy
- Kill "Hours with Gap/Surplus" -- replace with clear Capacity vs Demand visual (stacked bars with gap clearly labeled)
- Add AI bench forecast: "Bob Taylor has had no billable hours for 3 weeks. Recommend assigning to Globex Phase 2 (85% skill match). Lisa Kim available from May 1 -- consider Initech API."
- Progressive disclosure: show Capacity Overview and Bench Forecast prominently, Scenarios and Skills Matrix collapsed/secondary
- Rename all "Utilisation" labels (covered by FIX-2)

### FIX-20: Fix Team Leaves Calendar
Page(s): leaves.html
Priority: HIGH
Source: Founder #21-24
Description: Team calendar won't scale to 200+ people. No search, no filters, no multi-day booking, no "More Details" popup.
Fix required:
- Add search input and filters: department, team, project, client, leave type
- Add pagination/virtual scroll for large teams (show 20 at a time with "Load More")
- Add multi-day booking: date range selection in request modal (already partially exists)
- Add "More Details" popup (bottom-right corner) showing all employees on leave for selected day with name, type, dates, and filter by leave type
- Make heatmap calendar responsive (at mobile: hide heatmap, show simplified list of leave days)

### FIX-21: Fix Fixed-Fee Project Display
Page(s): projects.html
Priority: HIGH
Source: Founder #25-27, Critic-DOMAIN
Description: Fixed-fee projects show budget as percentage. Should show contract value, revenue earned to date, and projected timeline. Project detail must exist for ALL project types.
Fix required:
- Fixed-fee projects: Show "Contract: EUR 85,000 | Earned: EUR 52,000 | Remaining: EUR 33,000" instead of "72% budget used"
- Hourly projects: Keep percentage but also show "Budget: EUR 120,000 | Spent: EUR 86,400"
- Retainer projects: Show "Monthly fee: EUR 15,000/mo | Hours included: 100h | Used: 72h"
- Ensure project detail view works for all 3 types with appropriate financial sections
- Add full project detail: duration, health status, milestones, team, delay flags, all financials

### FIX-22: Add Mini Profile Hover Cards
Page(s): ALL pages with employee name links
Priority: HIGH
Source: Founder #45, Critic-PM, Critic-UX H6
Description: Spec section 4.3 requires hovering on any employee name shows a mini profile card. Completely missing.
Fix required:
- Create `.profile-hover-card` component (CSS tooltip/popover)
- Show on hover: avatar, name, role, department, status dot, work time %, current project
- Position: appears near the mouse, stays open while hovering, closes on mouse leave
- Implement on all employee name links across all pages

### FIX-23: Add Command Palette to All Pages
Page(s): ALL pages
Priority: HIGH
Source: Founder #48, Critic-PM N-10
Description: Command palette Cmd+K hint exists but no palette is implemented on most pages. Dashboard has markup but items don't navigate.
Fix required:
- Ensure full command palette markup exists on ALL pages (not just index.html)
- Palette items should navigate: "Dashboard" → index.html, "Timesheets" → timesheets.html, etc.
- Add "Quick Actions" section: Log Time, Request Leave, Submit Expense, New Invoice
- Add "Search" section with employee/project/client results
- Wire Cmd+K keyboard shortcut on all pages

### FIX-24: Fix Sidebar Navigation
Page(s): ALL pages
Priority: HIGH
Source: Critic-PM H-4, Critic-DOMAIN
Description: Sidebar has 13 items with redundant entries (Planning + Gantt should be merged) and misplaced items (Team Directory under Admin). No HR section.
Fix required:
- Restructure sidebar sections:
  - **Main:** Dashboard, Timesheets, Expenses, Leaves
  - **HR:** Recruitment, Onboarding, Team Directory (moved from Admin)
  - **Work:** Projects, Clients, Resource Planning (merge Gantt as tab), Calendar
  - **Finance:** Invoices, Insights
  - **Admin:** Approvals, Configuration
- Total: 13 items (same count but better organized with HR section)
- Update ALL 15+ HTML files with new sidebar structure

### FIX-25: Fix Leave History and Calendar
Page(s): leaves.html
Priority: HIGH
Source: Founder #18-20
Description: Leave history lacks worked-days count per month. Calendar squares can be smaller. Leave logging should be possible from timesheet.
Fix required:
- Add worked-days count summary per month (e.g., "18 days worked in November")
- Compact calendar squares with summary row (worked days, personal, sick, annual, WFH)
- Connect leave logging to dashboard Quick Log Time widget (cross-reference with FIX-15)

### FIX-26: Fix Expense Project Dropdown
Page(s): expenses.html
Priority: HIGH
Source: Founder #17
Description: Expense project dropdown has same broken logic as timesheets. Should default to assigned projects, allow search for all, require approval for unassigned.
Fix required:
- Default dropdown shows assigned projects only
- Add search input to dropdown to find all projects
- Selecting unassigned project adds "Requires Manager Approval" badge
- Same logic as timesheet project dropdown (FIX-15)

### FIX-27: Tokenize All Hardcoded Colors
Page(s): gantt.html, leaves.html, auth.html, portal
Priority: HIGH
Source: Critic-UX H2
Description: ~30 hardcoded HSL values in page CSS. Gantt uses `hsla(155, 26%, 46%, 0.3)` instead of tokens. Leaves uses `hsl(175, 35%, 45%)` which is NOT in the palette at all.
Fix required:
- Add new tokens to `_tokens.css`: `--color-chart-5-muted`, `--color-surface-weekend`, `--color-bar-billable-bg`, `--color-bar-leave-bg`, `--color-bar-bench-bg`
- Replace all hardcoded HSL in gantt.html, leaves.html with token references
- Fix `hsl(175, 35%, 45%)` (WFH color) -- use an existing chart color or add a new token
- Replace `fill="#000"` in auth.html QR code with `currentColor`

### FIX-28: Extract Duplicate Components
Page(s): _components.css, all HTML files
Priority: HIGH
Source: Critic-UX H4, Critic-ARCH 6.1-6.4
Description: Revenue bars, utilization bars, back buttons, toggle switches, empty states, and filter bars are all defined independently per page.
Fix required:
- Move to `_components.css`: `.revenue-chart`, `.worktime-bar`, `.back-link`, `.activity-item`, `.presence-item`, `.approval-mini-card`
- Deduplicate `@keyframes fadeSlideIn` (defined in insights + planning)
- Deduplicate `@keyframes spin` (defined in _components + planning)
- Remove page-specific redefinitions and reference shared classes

### FIX-29: Add Skeleton Loading States
Page(s): ALL major pages
Priority: HIGH
Source: Critic-UX H1, Critic-ARCH 9.4
Description: `_components.css` defines `.skeleton`, `.skeleton-text`, `.skeleton-card` classes. Zero pages use them. No perceived performance optimization.
Fix required:
- Add skeleton loading markup to key sections of each page (behind empty-state toggle or separate state)
- At minimum: dashboard KPI cards, employee grid, project kanban, invoice table
- Use existing skeleton CSS classes

### FIX-30: Add Button Loading States
Page(s): ALL pages with action buttons
Priority: HIGH
Source: Critic-UX H5
Description: `.btn-loading` class exists in CSS with spinner animation. No button ever uses it. Submit, Approve, Reject, Save actions have no loading feedback.
Fix required:
- Add loading state simulation to: Submit Timesheet, Approve/Reject (all), Save Draft, Generate Invoice, Request Leave, Submit Expense
- Show spinner for 500ms then complete action (toast notification)

### FIX-31: Fix Notifications -- Clickable + Mark All Read
Page(s): ALL pages
Priority: HIGH
Source: Founder #38-39, Critic-PM
Description: Notification items are not clickable and don't navigate to relevant entities. "Mark all read" does nothing.
Fix required:
- Make each notification item a link to the relevant page/entity
- Wire "Mark all read" to remove `.unread` class from all notification items
- Add notification type icons and color coding

### FIX-32: Add Print Stylesheet
Page(s): ALL pages (new _print.css)
Priority: HIGH
Source: Founder #41
Description: HR/finance app needs printable views for invoices, timesheets, and reports.
Fix required:
- Create `_print.css` with `@media print` rules
- Hide: sidebar, header, bottom nav, action buttons, notification panel
- Show: content area full-width, tables with borders, proper page breaks
- Special treatment: invoice detail view as print-ready document

### FIX-33: Fix Permission Model Indicators
Page(s): index.html, employees.html, admin.html
Priority: HIGH
Source: Founder #16, Critic-ARCH 3.1, Critic-PM M-4
Description: Entire prototype shows Admin view only. No indication of what PM or Employee would see.
Fix required:
- Add a role switcher in the top header (Admin | PM | Employee toggle)
- When "Employee" selected: hide Approvals tab, hide Team Expenses, hide admin, show "My" views only
- When "PM" selected: show team data, hide admin config, show client billing
- Visual indicators: show lock icons on sections the role can't access

### FIX-34: Consolidate Planning + Gantt
Page(s): planning.html, gantt.html, sidebar on ALL pages
Priority: HIGH
Source: Critic-PM N-7, Critic-DOMAIN
Description: Planning and Gantt serve the same user at the same decision point ("who is available?"). Two separate pages force context-switching.
Fix required:
- Make Gantt a tab within Resource Planning (Capacity | Timeline | Bench | Skills | Scenarios)
- OR keep as separate pages but add clear cross-links and remove one sidebar entry
- Rename sidebar: "Resource Planning" (single entry that contains Gantt as timeline view)

### FIX-35: Fix Mobile Search Button
Page(s): ALL app HTML files
Priority: HIGH
Source: Critic-MOBILE M25
Description: `.mobile-search-btn` CSS defined in `_layout.css` but no HTML file includes the element. Search is invisible on mobile.
Fix required:
- Add `<button class="mobile-search-btn">` with search icon to header of ALL app pages
- Wire click to open command palette or search overlay

### FIX-36: Fix State Toggle and Bulk Bar Mobile Collisions
Page(s): ALL pages, approvals.html
Priority: HIGH
Source: Critic-MOBILE M23
Description: State toggle button (fixed bottom-right) collides with bottom nav. Bulk action bar on approvals overlaps bottom nav.
Fix required:
- State toggle: move to `bottom: calc(56px + var(--space-4) + env(safe-area-inset-bottom))` on mobile
- Bulk action bar: same treatment -- position above bottom nav on mobile
- Add `@media (max-width: 639px)` rules for both

### FIX-37: Add Light Mode Toggle
Page(s): ALL pages (header area)
Priority: HIGH
Source: Founder #42, Critic-PM N-6
Description: Light mode CSS tokens defined in `_tokens.css` but no toggle exists. Enterprise buyers need light mode for presentations.
Fix required:
- Add sun/moon icon toggle in top header (next to notification bell)
- Toggle sets `data-theme="light"` on `<html>` element
- Persist preference in localStorage

### FIX-38: Fix Sidebar Nav Touch Targets
Page(s): _layout.css
Priority: HIGH
Source: Critic-MOBILE M19
Description: Sidebar navigation items don't have 44px min-height enforcement. Nav items are ~34-36px, below the 44px WCAG minimum for touch.
Fix required:
- Add `.nav-item { min-height: 44px; }` to the mobile media query in `_layout.css`

### FIX-39: Fix Leaves Heatmap on Mobile
Page(s): leaves.html
Priority: HIGH
Source: Critic-MOBILE M7
Description: Heatmap with 32 columns (40px + 31 x 1fr) is completely unusable at 390px. Each cell becomes ~10px.
Fix required:
- At mobile: hide heatmap grid, show simplified leave summary list instead
- Or: make heatmap horizontally scrollable with snap points and reduced columns

---

## MEDIUM -- Should Fix (Reduces quality but doesn't block core usage)

### FIX-40: Add Half-Day Leave Support
Page(s): leaves.html
Priority: MEDIUM
Source: Critic-DOMAIN
Description: Leave request modal has start/end date but no AM/PM or half-day toggle.
Fix required: Add radio buttons: Full Day | Morning Half | Afternoon Half. Adjust working days calculation.

### FIX-41: Fix WFH Category
Page(s): leaves.html, admin.html
Priority: MEDIUM
Source: Critic-DOMAIN
Description: WFH is categorized as a "Leave" type. WFH is NOT absence -- it's a work location. Having it as leave is conceptually wrong.
Fix required: Either rename to "Remote Work" under a separate "Work Location" feature, or keep as a leave-like category but add explanation text "Work from home (not deducted from leave balance)."

### FIX-42: Add Multi-Currency Display
Page(s): invoices.html, expenses.html
Priority: MEDIUM
Source: Critic-DOMAIN, Critic-PM M-10
Description: All financials in EUR. Multi-currency needed for international clients.
Fix required: Show currency selector on invoice generation. Expense form already has currency dropdown -- ensure it displays correctly.

### FIX-43: Fix Approval Chain Display
Page(s): admin.html, approvals.html
Priority: MEDIUM
Source: Critic-DOMAIN
Description: Only single-level approval visible. Need multi-level approval chain configuration.
Fix required: In admin Approval Chain section, show: Level 1 (Direct Manager) → Level 2 (Department Head, for amounts > EUR 1,000) → Level 3 (Finance Director, for amounts > EUR 5,000). Show approval chain on approval cards.

### FIX-44: Fix Invoice Status Timeline on Mobile
Page(s): invoices.html
Priority: MEDIUM
Source: Critic-MOBILE
Description: Status timeline (Created → Sent → Viewed → Paid) is horizontal flex that overflows at 390px.
Fix required: At mobile, convert to vertical timeline with steps stacking top-to-bottom.

### FIX-45: Add Credit Note Mechanism
Page(s): invoices.html
Priority: MEDIUM
Source: Critic-DOMAIN
Description: No credit note mechanism. Legally required in EU for corrections/disputes.
Fix required: Add "Issue Credit Note" button on invoice detail. Show credit note as a linked line item with negative amount.

### FIX-46: Fix Font Size Minimum on Gantt
Page(s): gantt.html
Priority: MEDIUM
Source: Critic-UX M2
Description: Gantt uses `font-size: 9px` for day-name labels, below minimum `--text-overline` (11px).
Fix required: Change to `font-size: var(--text-overline)` (11px).

### FIX-47: Add Error States
Page(s): Key pages
Priority: MEDIUM
Source: Critic-ARCH 9.3
Description: Zero pages show error states (network error, validation error, permission denied).
Fix required: Add at least 1 form validation example (expense form with required field errors), 1 permission denied state, 1 network error banner.

### FIX-48: Add Client Portal Messages Tab
Page(s): portal/index.html
Priority: MEDIUM
Source: Critic-PM H-7
Description: Spec requires Messages tab for client-team communication. Missing entirely.
Fix required: Add "Messages" tab with threaded conversation UI per project. Simple message list with compose input.

### FIX-49: Fix Page-Specific Mobile CSS
Page(s): admin.html, insights.html, approvals.html, clients.html, projects.html
Priority: MEDIUM
Source: Critic-MOBILE
Description: 5 pages have zero page-specific mobile CSS. They rely entirely on global layout collapse.
Fix required: Add `@media (max-width: 639px)` rules for page-specific components: admin form layouts, insight chart containers, approval card actions, client detail sections, project kanban columns.

### FIX-50: Standardize Currency to EUR
Page(s): employees.html, gantt.html
Priority: MEDIUM
Source: Critic-ARCH
Description: Most pages use EUR. employees.html profile and gantt.html use Dollar ($).
Fix required: Change all $ to EUR across the prototype.

### FIX-51: Fix Logout Label Consistency
Page(s): ALL pages
Priority: MEDIUM
Source: Critic-ARCH
Description: Three variants: "Logout", "Sign out", "Sign Out" across different pages.
Fix required: Standardize to "Sign Out" everywhere.

### FIX-52: Add Minimum Billing Increment Indicator
Page(s): timesheets.html
Priority: MEDIUM
Source: Critic-DOMAIN
Description: Grid accepts any decimal. No configuration for 15/30-minute minimum increments.
Fix required: Show note under timesheet grid: "Billing increment: 0.25h (15 min)". Round displayed values appropriately.

### FIX-53: Fix Title Tags
Page(s): ALL pages
Priority: MEDIUM
Source: Critic-ARCH
Description: Mix of hyphens, em dashes, HTML entities. gantt.html includes "v2".
Fix required: Standardize all to "Page Name -- GammaHR" format.

### FIX-54: Add Worked Days to Timesheet Summary
Page(s): timesheets.html
Priority: MEDIUM
Source: Founder
Description: Leave logging from timesheet must be possible. Keep dedicated Leaves view for personal analytics.
Fix required: Add "Log Leave" option in the timesheet view's "Add Row" dropdown. When selected, opens a simplified leave request form.

### FIX-55: Fix Portal Empty States
Page(s): portal/index.html
Priority: MEDIUM
Source: Critic-UX M7
Description: Portal has no empty states for when client has no projects/invoices.
Fix required: Add empty states for each portal tab.

---

## Execution Order

### Phase A: Global Foundation (do FIRST -- enables everything else)
1. FIX-2: Rename "Utilisation" globally
2. FIX-5: Fix cross-page data consistency (roles, names, emails, numbers)
3. FIX-24: Restructure sidebar (add HR section)
4. FIX-10: Standardize filter bars
5. FIX-7: Add SVG icons to all badges
6. FIX-13: Eliminate inline styles (move to _components.css)
7. FIX-27: Tokenize hardcoded colors
8. FIX-28: Extract duplicate components

### Phase B: Critical New Features (build in parallel)
9. FIX-1: Build hr.html (THE most critical feature)
10. FIX-16: Build calendar.html
11. FIX-17: Employee directory overhaul + org chart

### Phase C: Dashboard + Entity Views
12. FIX-3: Fix dashboard grid layout
13. FIX-15: Fix dashboard graphs and layout
14. FIX-9: Add AI insights to entity views
15. FIX-6: Fix entity deep links
16. FIX-12: Add breadcrumbs
17. FIX-22: Add mini profile hover cards
18. FIX-14: Fix client overview

### Phase D: Page-Specific Fixes
19. FIX-8: Fix progress bars >100%
20. FIX-11: Fix charts
21. FIX-18: Fix admin page
22. FIX-19: Fix resource planning
23. FIX-20: Fix team leaves calendar
24. FIX-21: Fix fixed-fee project display
25. FIX-25: Fix leave history
26. FIX-26: Fix expense project dropdown
27. FIX-34: Consolidate Planning + Gantt

### Phase E: Mobile
28. FIX-4: Apply mobile-cards to all tables
29. FIX-35: Fix mobile search button
30. FIX-36: Fix mobile collisions (state toggle, bulk bar)
31. FIX-38: Fix sidebar nav touch targets
32. FIX-39: Fix leaves heatmap on mobile
33. FIX-44: Fix invoice timeline on mobile
34. FIX-49: Page-specific mobile CSS

### Phase F: Polish
35. FIX-23: Command palette on all pages
36. FIX-29: Skeleton loading states
37. FIX-30: Button loading states
38. FIX-31: Fix notifications
39. FIX-32: Print stylesheet
40. FIX-33: Permission model indicators
41. FIX-37: Light mode toggle
42. All remaining MEDIUM fixes (40-55)
