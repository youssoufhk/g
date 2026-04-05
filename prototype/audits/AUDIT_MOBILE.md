# GammaHR v2 Prototype -- Mobile & Responsiveness Audit

**Auditor:** Critique Agent 3 -- Mobile & Responsiveness
**Date:** 2026-04-05
**Device Reference:** iPhone 15 Pro (390px viewport)
**Files Reviewed:** 3 CSS files, 15 HTML files, DESIGN_SYSTEM.md

---

## Executive Summary

**Overall Mobile Readiness: 3/10 -- FAILING**

The prototype is a desktop-first build with superficial mobile accommodations. The layout system (_layout.css) provides a basic hamburger menu and single-column grid collapse, but **zero pages** implement the mobile-specific patterns promised in the design system (Section 11): no bottom navigation bar, no table-to-card transforms, no swipe gestures, no pull-to-refresh, no FAB. Most pages will display desktop-width tables and complex layouts that simply shrink to 390px, forcing horizontal scroll or making content illegibly small. For a platform where "most users will be on mobile," this is a critical failure.

---

## Global Infrastructure Issues

### G1. NO Bottom Navigation Bar [CRITICAL]

The design system (Section 11) specifies:
> "Bottom navigation bar (5 items: Dashboard, Timesheets, Expenses, Leaves, More)"

**This does not exist anywhere in the prototype.** Not in CSS, not in HTML, not in any `@media` query. On mobile, the user's only navigation is a hamburger menu that opens a full-width sidebar overlay. This is the single most important mobile pattern for an HR app where managers are doing quick approvals on their phones, and it is completely absent.

**Impact:** Every navigation action requires: tap hamburger -> wait for sidebar animation -> find item -> tap. That is 3 interactions instead of 1 for the 5 most-used pages.

### G2. NO Table-to-Card Transformation [CRITICAL]

The design system (Section 9.5) specifies:
> "Responsive: collapse to cards on mobile"

Not a single `<table>` in the prototype collapses to cards on mobile. Every data table (Team Availability on dashboard, employees table, timesheets grid, invoices table, admin tables, insights tables, planning tables) is wrapped in `overflow-x: auto` at best, creating horizontal scroll. Several are not even wrapped, so they overflow the viewport.

**Pages with bare tables that will overflow at 390px:**
- `index.html` -- Team Availability table (5 columns, ~700px natural width)
- `timesheets.html` -- Timesheet grid (9 columns: project + 7 days + total)
- `admin.html` -- 6+ tables (leave types, holidays, approval chains, roles, integrations, audit log)
- `insights.html` -- Revenue breakdown table, employee analytics table
- `invoices.html` -- Invoice list table
- `planning.html` -- Resource allocation table
- `gantt.html` -- Entire chart structure

### G3. NO Swipe Gestures [CRITICAL]

The design system specifies:
> "Swipe gestures (swipe to approve/reject in lists)"

Zero implementation. No touch event handlers, no swipe detection, no gesture-based UI anywhere. The approval flow requires tapping tiny buttons.

### G4. NO Pull-to-Refresh [MODERATE]

The design system specifies pull-to-refresh for mobile. Not implemented.

### G5. NO Floating Action Button (FAB) [MODERATE]

The design system specifies a FAB for the primary action on each page. Not implemented. On mobile, "New Expense" or "Submit Timesheet" buttons are buried in page headers that are less prominent on small screens.

### G6. Touch Targets Below 44x44px Minimum [CRITICAL]

WCAG 2.2 and the design system (Section 12) require:
> "Touch targets: Minimum 44x44px on mobile"

The majority of interactive elements across the prototype fail this requirement:

| Element | Actual Size | Required | Violation |
|---------|-------------|----------|-----------|
| `.btn-xs` | 28px height | 44px | 16px under |
| `.btn-sm` | 32px height | 44px | 12px under |
| `.btn-md` (default) | 36px height | 44px | 8px under |
| `.btn-icon` (default) | 36x36px | 44x44px | 8px under |
| `.btn-icon.btn-xs` | 28x28px | 44x44px | 16px under |
| `.btn-icon.btn-sm` | 32x32px | 44x44px | 12px under |
| `.header-icon-btn` | 36x36px | 44x44px | 8px under |
| `.mobile-menu-btn` | 36x36px | 44x44px | 8px under |
| `.form-input` (default) | 36px height | 44px | 8px under |
| `.form-input-sm` | 32px height | 44px | 12px under |
| `.form-select` (default) | 36px height | 44px | 8px under |
| Pagination buttons | 32x32px | 44x44px | 12px under |
| Checkbox inputs | 16x16px | 44x44px | 28px under |
| `.nav-btn` (Gantt) | 32x32px | 44x44px | 12px under |
| `.zoom-btn` (Gantt) | ~28px height | 44px | 16px under |
| `.toggle` switch | 40x22px | 44x44px | Under on height |
| `.modal-close` | 32x32px | 44x44px | 12px under |
| Dropdown items | ~36px effective | 44px | 8px under |
| `.tab` buttons | ~40px effective | 44px | Borderline |

Only `.btn-lg` (44px), `.btn-xl` (52px), auth page inputs (44px), and auth page buttons (44px) meet the minimum. **On mobile, not a single interactive element should use btn-xs, btn-sm, or btn-md, yet every page does.**

There is no mobile media query that upsizes touch targets. The CSS does not differentiate button sizes between desktop and mobile.

### G7. Modals Do Not Go Full-Screen on Mobile [MODERATE]

The `.modal` class has `max-width: calc(100vw - 32px)` and `max-height: calc(100vh - 64px)`. On a 390px screen, a 560px modal will shrink to 358px wide, which is technically fine for display but:

- No mobile media query converts modals to full-screen
- Modal body padding (`24px` = `var(--space-6)`) is not reduced on mobile
- Complex form modals (e.g., expense submission, leave request, invoice creation) will be cramped
- The modal close button is 32x32px (fails touch target minimum)

### G8. Notification Panel Overflows on Mobile [MODERATE]

`.notif-panel` is `width: 380px`. On a 390px viewport with the panel positioned `right: 0` inside the header, this leaves only 10px of margin. Depending on the header padding, it could overflow. There is no mobile media query to make the notification panel full-width.

### G9. Header Search Hidden but No Mobile Alternative [LOW]

The `@media (max-width: 639px)` rule hides `.header-search`. This is correct (the search box is too wide), but no mobile-friendly search alternative (e.g., search icon that expands to full-width input) is provided. The command palette (`Cmd+K`) is desktop-only and has no mobile trigger.

### G10. Breakpoint Inconsistency [LOW]

The design system defines `mobile: < 640px`, and _layout.css uses `max-width: 639px`. But `admin.html` uses `max-width: 768px` for its settings grid. This inconsistency means admin will break differently than other pages at tablet sizes.

---

## Per-Page Audit

### 1. Dashboard (`index.html`) -- Mobile Score: 4/10

**What works:**
- KPI grid has `@media (max-width: 639px)` to collapse to single column
- `grid-60-40` layout (in _layout.css) collapses to single column
- Hamburger menu is present and wired up
- Stat cards stack vertically

**What breaks:**
- Team Availability table: 5 columns, wrapped in `overflow-x: auto` but at 390px the table is ~700px wide -- user must scroll horizontally to see Utilization and Status columns. No card alternative.
- Mini Gantt widget: hardcoded `grid-template-columns: repeat(5, 1fr)` with a 100px name column prefix. At 390px, each day cell is ~50px, which barely works but labels are tiny.
- Revenue bars chart: works but `var(--text-overline)` labels (11px) are very small.
- Donut chart + legend side-by-side: `.donut-wrap` uses `display: flex` with no mobile stacking. The SVG donut and legend will compete for space.
- AI Alerts: buttons are `btn-xs` (28px) and `btn-sm` (32px) -- too small for touch.
- Approval items: approve/reject buttons are `btn-icon btn-xs` (28x28px) -- dangerously small.
- Status toggle button (bottom-right): will overlap content on mobile.

### 2. Employees / Team Directory (`employees.html`) -- Mobile Score: 5/10

**What works:**
- Employee card grid has `@media (max-width: 639px)` for single column
- Profile hero has mobile flex-direction:column stacking
- Profile stats grid collapses to single column

**What breaks:**
- Table view of employees has no mobile handling -- the data-table is desktop-width
- Filter bar wraps but individual filter inputs are 36px height (too small for touch)
- View toggle buttons (Table/Grid) are ~32px height -- under touch minimum
- Employee card action buttons (View Profile, etc.) if present would be undersized

### 3. Gantt Chart (`gantt.html`) -- Mobile Score: 1/10

**What works:**
- Has `meta viewport` tag
- Hamburger menu is present

**What breaks -- EVERYTHING:**
- The Gantt chart is a fixed 240px left panel + 30-column right panel where each column is 40px (`grid-template-columns: repeat(30, 40px)`). Total right panel width: 1200px minimum.
- No mobile media queries whatsoever in the page-specific CSS
- No mobile-alternative view (e.g., list view, simplified weekly view)
- At 390px, the user sees only the 240px left panel plus ~150px of the timeline -- about 3.75 days visible
- Gantt bars are 32px tall with 11px text -- unreadable and untappable for interaction
- Filter panel: filter inputs are 32px height, zoom buttons are ~28px height
- The entire page is fundamentally unusable on mobile. There is no responsive adaptation.
- No mention of a mobile-friendly alternative (e.g., "Resource Planning" page or simplified view)

**Verdict:** The Gantt chart cannot be used on mobile. Period. The design system should specify a mobile alternative (perhaps a simplified list/card view showing assignments by employee).

### 4. Expenses (`expenses.html`) -- Mobile Score: 5/10

**What works:**
- Stats grid has proper 3-tier responsive: 4col -> 2col -> 1col
- Form rows have `@media (max-width: 639px)` to go single column
- Expense items use a card-based layout (not a table), which is inherently more mobile-friendly
- Upload zone has reasonable tap area
- Submit layout has `@media (max-width: 1023px)` to go single column

**What breaks:**
- Expense item layout: at 390px, the row has icon (44px) + amount (100px min) + details (flex) + right section (badges + actions). That is at least 300px of fixed content competing for 358px of usable space (390 - 2*16 padding). It will be extremely tight or will break.
- Filter bar: select inputs are 32px height, min-width 140px -- multiple selects will wrap but each is too small for touch
- Approval action buttons: `btn-sm` (32px) and `btn-xs` (28px) -- too small for touch
- Receipt indicator is 14px text -- very small on mobile
- OCR flow: the scanning overlay works, but AI result grid is `grid-template-columns: 1fr 1fr` with no mobile override
- Rejection modal: no full-screen on mobile; textarea inside is tappable but modal chrome is tight
- The approve/reject flow uses small buttons that a manager fumbling on their phone at 7am will misclick

**Can expenses be submitted on mobile?** Technically yes -- the form fields and upload zone render, and the layout does collapse. But the experience is degraded: small buttons, no mobile-optimized flow, no camera-first upload prompt.

**Can a manager approve expenses on mobile?** Barely. The approve/reject buttons are 28-32px -- below the touch minimum. There's no swipe-to-approve.

### 5. Timesheets (`timesheets.html`) -- Mobile Score: 2/10

**What works:**
- Hamburger menu is present
- Status bar and week navigation flex-wrap

**What breaks:**
- The timesheet grid is a `<table>` with `table-layout: fixed` and columns: 200px project + 7 day columns + 70px total. That is ~200 + 7*(~80) + 70 = ~830px minimum width. At 390px, this requires massive horizontal scrolling.
- No `@media` queries for mobile in page-specific CSS for the grid
- Inline edit inputs (`.ts-cell-input`) are 28px height -- too small for touch
- Day column cells are narrow and the monospace text + click target is tiny
- The "Add Project Row" button is `btn-sm` (32px)
- Action buttons (Save Draft, Submit) are in a flex row that may overflow
- Weekly summary bar wraps but dividers and progress bars get compressed
- Approval queue cards: approval buttons are `btn-sm` (32px) -- too small
- The Previous Weeks tab shows another table with same overflow issues

**Can timesheets be submitted on mobile?** Effectively no. The grid requires horizontal scrolling to even see all days of the week. Entering hours requires tapping on cells that are roughly 50px wide with 28px-high inputs. A user in a taxi cannot meaningfully use this. The design system should specify a mobile-friendly alternative: day-by-day entry view, or a vertical card-per-project layout.

### 6. Leaves (`leaves.html`) -- Mobile Score: 5/10

**What works:**
- Leave balance grid: proper 3-tier responsive (4col -> 2col -> 1col)
- Balance cards are card-based, not tabular -- mobile friendly
- Hamburger menu present

**What breaks:**
- Calendar view: no responsive handling visible for whatever calendar widget is used
- Leave history likely uses a data-table that will overflow
- Request Leave modal: not full-screen on mobile
- Form inputs default to 36px height -- below touch minimum
- The approve/reject buttons in the manager view would be undersized

**Can a manager approve leaves from their phone?** Depends on where the approve UI lives. If in the leaves page, the buttons are undersized. If through the Approvals page, see that audit below. Either way, no swipe-to-approve.

### 7. Projects (`projects.html`) -- Mobile Score: 5/10

**What works:**
- Kanban board has `@media (max-width: 1023px)` to go single column
- Project cards are card-based layout, inherently mobile-friendly
- Overview stats grid has mobile single-column fallback
- View toggle and filter bar flex-wrap

**What breaks:**
- Table view: data-table with many columns will overflow at 390px
- Project detail slide panel is 480px width (from _components.css) with `max-width: 100vw` -- this would fill mobile screen, which is OK, but the panel content may not be optimized
- View toggle buttons are ~28px height -- too small for touch
- Filter selects are 32px height
- Budget progress bars and text inside project cards may get very compressed

### 8. Clients (`clients.html`) -- Mobile Score: 5/10

**What works:**
- Client cards use flex layout that can wrap
- Detail header has `flex-wrap: wrap`
- Card-based design is inherently more mobile-friendly than tables

**What breaks:**
- Client card: at 390px, the row has logo (48px) + info (flex) + revenue (120px min-width). That is 168px + padding competing with ~358px usable. Tight but probably OK.
- Detail view: tabs for Projects/Invoices/Contacts will overflow-x scroll (from _components.css tabs styling)
- Detail tables (projects under client, invoices) will overflow
- Contact list items -- if using data-table format, will overflow
- No mobile-specific media queries in this page's CSS at all
- Notes textarea and forms use default 36px inputs

### 9. Invoices (`invoices.html`) -- Mobile Score: 3/10

**What works:**
- Invoice info grid uses `repeat(auto-fit, minmax(180px, 1fr))` -- this is responsive by nature
- Filter bar flex-wraps
- Invoice detail header flex-wraps

**What breaks:**
- Invoice list table: multi-column data-table will overflow at 390px
- Filter inputs are 36px height -- below touch minimum
- Invoice detail line-items table will overflow
- No mobile media queries in page-specific CSS
- Action buttons (Send, Download, Mark Paid) in detail view need mobile layout
- The financial data display requires enough width for monetary values in monospace

### 10. Approvals (`approvals.html`) -- Mobile Score: 4/10

**What works:**
- Approval cards use a flex layout with wrapping
- Card-based design (not table) for approval items
- Filter bar wraps
- Tabs scroll horizontally (from _components.css)

**What breaks:**
- Approval card layout: checkbox (16px) + type icon (36px) + body (flex) + actions (flex-shrink:0). At 390px this will be very compressed.
- Action buttons: the prototype likely uses `btn-sm` or `btn-xs` for approve/reject -- too small for touch
- Bulk actions bar: if present, will be cramped
- No mobile media queries in page-specific CSS
- Card context items (date, project, department) may wrap excessively and become hard to read
- Checkbox inputs are 16x16px -- far below 44px touch target

**Can a manager approve timesheets/expenses/leaves from their phone?** Technically, the approval cards render. But:
1. The approve/reject buttons are likely 28-32px (below touch minimum)
2. No swipe-to-approve gesture
3. The rejection reason input is 28px height
4. Multiple items require scrolling with no batch-approve gesture
5. The experience is functional but hostile to mobile users

### 11. Insights / Analytics (`insights.html`) -- Mobile Score: 3/10

**What works:**
- NL Query bar is a single input -- works on mobile
- Query chips wrap with flex-wrap

**What breaks:**
- Chart visualizations: no mobile simplification (the spec says "simplified on mobile, fewer data points")
- Revenue breakdown table: data-table will overflow
- Employee analytics table: will overflow
- Insights grid layouts (grid-3, grid-4) do collapse via _layout.css, but chart content inside may not resize well
- Tables wrapped in `overflow-x: auto` require horizontal scroll
- No page-specific mobile media queries

### 12. Resource Planning (`planning.html`) -- Mobile Score: 4/10

**What works:**
- Capacity grid has proper 3-tier responsive (3col -> 2col -> 1col)
- Capacity cards are card-based, mobile-friendly
- Bench forecast items use flex layout

**What breaks:**
- Resource allocation table (wrapped in `overflow-x: auto`): multi-column table will require horizontal scroll
- Forecast sections with stacked bar charts may not render well at 390px
- No mobile-specific treatment for the planning heatmap/matrix if present
- Action buttons would be undersized

### 13. Administration (`admin.html`) -- Mobile Score: 3/10

**What works:**
- Settings grid has responsive at 768px (note: inconsistent breakpoint vs 639px everywhere else)
- Tab navigation scrolls horizontally

**What breaks:**
- 6+ data tables across tabs (leave types, holidays, approval chains, roles, integrations, audit log): ALL wrapped in `overflow-x: auto` but ALL will require horizontal scrolling
- Settings forms: inputs are 36px (below touch minimum)
- Workdays row: checkbox arrangement may compress
- Audit log: changes-preview uses `max-width: 200px` with text-overflow, but the table itself overflows
- Admin is not a primary mobile use case, but it should still be functional

### 14. Auth / Login (`auth.html`) -- Mobile Score: 8/10

**What works:**
- Centered single-column layout with `max-width: 420px` -- works perfectly on mobile
- Inputs are 44px height -- meets touch target minimum
- Submit button is 44px height with `width: 100%`
- Alternative login buttons are 44px height
- Auth container has `padding: var(--space-4)` on the page -- 16px margins
- MFA input area is centered and large

**What breaks:**
- Auth card padding is `var(--space-10) var(--space-8)` (40px 32px). At 390px with 16px page padding: 390 - 32 - 64 = 294px of usable card width. Tight but workable.
- Forgot link (`text-align: right`) and small text: touch target for the link may be small
- Password toggle button has only 4px padding -- touch target is too small

**This is the best mobile page in the prototype.** It was clearly designed with mobile in mind.

### 15. Client Portal (`portal/index.html`) -- Mobile Score: 3/10

**What works:**
- Stat cards use `grid-4` which collapses via _layout.css (but this page does not import _layout.css!)
- Project cards are card-based
- Team grid uses `auto-fill, minmax(200px, 1fr)` -- responsive

**What breaks:**
- Does NOT import `_layout.css` -- so NO mobile grid collapse, NO hamburger menu logic
- Portal nav: horizontal tab navigation with no responsive handling. At 390px, 5 tabs with icons and text will overflow with no scroll indicator.
- Portal header: client name + "Powered by GammaHR" + user menu + logout button -- will compress or overflow at 390px
- User dropdown text (name + role + chevron) in header -- very tight
- Invoice tables in the portal: will overflow
- Milestone tracker: horizontal step layout with lines -- at 390px with 6 steps, each step gets ~65px. Labels ("Discovery", "Sprint 1", "Launch") will overlap.
- Document list items: functional but doc-item padding may need mobile optimization
- No mobile media queries anywhere in the page

---

## Feature-Specific Mobile Assessment

### Can timesheets be submitted on mobile?
**NO (effectively).** The 9-column grid table requires horizontal scrolling. Cell inputs are 28px. There is no day-by-day mobile entry view. A user would have to scroll right to see Thursday-Sunday, tap a tiny cell, type in a 28px input, scroll back, tap another cell. This is unusable for the stated use case of "employees submit from taxis."

### Can expenses be submitted on mobile (including OCR flow)?
**BARELY.** The form layout does collapse to single column. The upload zone is tappable. The OCR simulation works. But:
- No camera-first flow (the upload zone says "drag & drop or click" -- mobile needs a camera button)
- Form inputs are 36px (below touch target)
- The submit button placement in `form-actions` with `justify-content: flex-end` may push it to a position that is not thumb-friendly
- AI result grid is 2-column with no mobile override

### Can the Gantt chart be used on mobile?
**NO.** The chart is a 240px left panel + 1200px scrollable timeline. It is fundamentally a desktop component with no mobile alternative. Even basic viewing requires extensive horizontal scrolling with tiny (40px wide x 52px tall) cells.

### Can a manager approve leaves, expenses, and timesheets from their phone?
**POORLY.** The approval actions render, but:
- Approve/reject buttons are 28-32px (below 44px touch minimum)
- No swipe-to-approve gesture
- No batch approve gesture
- Rejection requires typing into a 28px input
- The manager must navigate via hamburger menu (no bottom nav bar for quick access)
- The overall flow is: hamburger -> sidebar -> Approvals -> scroll -> find item -> tap small button. This is 5+ interactions for the most common mobile action.

---

## Missing Mobile Patterns (per DESIGN_SYSTEM.md Section 11)

| Pattern | Specified | Implemented | Status |
|---------|-----------|-------------|--------|
| Bottom nav bar (5 items) | Yes | No | MISSING |
| Cards instead of tables | Yes | No | MISSING |
| Swipe to approve/reject | Yes | No | MISSING |
| Pull to refresh | Yes | No | MISSING |
| FAB for primary action | Yes | No | MISSING |
| Touch targets 44px+ | Yes | Only on auth page | MISSING everywhere else |
| Modals full-screen on mobile | Implied | No | MISSING |
| Responsive charts | Yes ("simplified on mobile") | No | MISSING |

---

## Page Scores Summary

| Page | Score | Primary Issue |
|------|-------|---------------|
| auth.html | **8/10** | Minor touch target issues on secondary elements |
| employees.html | **5/10** | Table view unusable, touch targets too small |
| expenses.html | **5/10** | Tight layout, small buttons, no camera-first upload |
| leaves.html | **5/10** | Balance cards OK, but forms and actions undersized |
| projects.html | **5/10** | Kanban OK, table view breaks, small controls |
| clients.html | **5/10** | Card layout helps, but detail tables break |
| planning.html | **4/10** | Capacity cards OK, tables break |
| index.html (Dashboard) | **4/10** | Stats OK, table and widgets break |
| approvals.html | **4/10** | Cards render but action buttons dangerously small |
| admin.html | **3/10** | Six tables, all overflow, inconsistent breakpoint |
| insights.html | **3/10** | Charts not simplified, tables overflow |
| invoices.html | **3/10** | All tables, no card alternative |
| portal/index.html | **3/10** | Missing _layout.css import, no nav responsive, tables overflow |
| timesheets.html | **2/10** | Grid table is fundamentally unusable at 390px |
| gantt.html | **1/10** | Completely unusable, no mobile alternative |

**Weighted Average (by user frequency):** ~3.5/10
Timesheets, Expenses, Approvals, and Leaves are the highest-frequency mobile pages. Their average is 4/10.

---

## Priority Remediation List

### P0 -- Must fix before any mobile testing

1. **Add bottom navigation bar** -- Dashboard, Timesheets, Expenses, Leaves, More (hamburger for rest). Fixed to bottom, 56px height, above safe area.
2. **Upsize all touch targets to 44px on mobile** -- Add a `@media (max-width: 639px)` block that overrides `.btn-sm`, `.btn-md`, `.btn-icon`, `.form-input`, `.form-select`, pagination buttons, checkboxes, etc. to 44px minimum.
3. **Create mobile timesheet entry view** -- Day-by-day or project-by-project card layout instead of the grid table. Each row: project name, hours input (large), note field.
4. **Add table-to-card CSS for mobile** -- For each data-table, add a `@media (max-width: 639px)` that hides `<thead>`, converts each `<tr>` to a card block, and uses `data-label` attributes on `<td>` for column labels.
5. **Create mobile Gantt alternative** -- Even a read-only list view showing: Employee -> Current Project -> Dates -> Utilization % as stacked cards would be better than the current 1200px timeline.

### P1 -- Must fix before launch

6. **Make modals full-screen on mobile** -- Add `@media (max-width: 639px) { .modal { width: 100vw; height: 100vh; max-width: 100vw; max-height: 100vh; border-radius: 0; } }`
7. **Add notification panel mobile layout** -- Full-width on mobile, perhaps slide-up from bottom.
8. **Add camera-first expense upload** -- On mobile, the upload zone should show "Take Photo" as the primary action, not drag-and-drop.
9. **Add swipe-to-approve on approval cards** -- JavaScript swipe handler: swipe right to approve, swipe left to reject with confirmation.
10. **Add FAB on key pages** -- Timesheets (Submit), Expenses (New Expense), Leaves (Request Leave).
11. **Fix notification panel width** -- `@media (max-width: 639px) { .notif-panel { width: 100vw; right: -16px; }` or similar.
12. **Fix portal page** -- Import _layout.css, add responsive handling for portal nav, header, and milestone tracker.
13. **Fix admin breakpoint** -- Change 768px to 639px for consistency.

### P2 -- Nice to have

14. Add pull-to-refresh interaction.
15. Add mobile search alternative (icon expands to full-width input).
16. Optimize chart rendering for mobile (fewer data points, larger labels).
17. Add haptic feedback indicators on approve/reject actions.
18. Consider a dedicated "mobile approval" flow -- full-screen card per item, large approve/reject buttons, swipe navigation between items.

---

## Conclusion

The GammaHR v2 prototype was built as a desktop application with a CSS grid collapse bolted on. The _layout.css provides the skeleton (hamburger menu, single-column grids) but every page-specific feature -- tables, charts, forms, action buttons, modals -- is desktop-sized and desktop-shaped. The design system specification (Section 11) describes a thoughtful mobile strategy with bottom nav, card layouts, swipe gestures, and FABs, but **none of these have been implemented**.

For a platform where "most users will be on mobile -- managers approve timesheets on their phones at 7am, employees submit expenses from taxis," this prototype would be rejected by users on day one. The two highest-frequency mobile tasks (timesheet submission and expense approval) score 2/10 and 4/10 respectively.

The auth page proves the team knows how to build for mobile. That standard needs to be applied to every page.
