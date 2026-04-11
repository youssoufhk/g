# CRITIC_MOB — Mobile QA Audit
**Generated:** 2026-04-11
**Tested viewports:** 320px, 390px, 768px

---

## MOB-01 — CRITICAL — timesheets.html — 320px/390px
**Approval Queue filter bar inputs are 32px tall on mobile — below 44px touch target**

`.aq-filter-bar .form-select` and `.form-input` are hardcoded to `height: 32px` in the page `<style>` block (line 680). This overrides the global `_layout.css` mobile fix (`.form-input-sm { min-height: 44px }` at 640px) because the selects carry class `form-select` only, not `form-input-sm`. The `.btn-xs, .btn-sm, .btn-md { min-height: 44px }` rule does not cover `.form-select` explicitly when a page-level `height: 32px` rule exists with equal selector specificity. On mobile at 320px, the three dropdowns in the Approval Queue tab are untappable.

---

## MOB-02 — CRITICAL — expenses.html — 320px/390px
**Approval queue items have no mobile stacking — `.approval-employee` has `min-width: 160px` and `.approval-actions` has `min-width: 140px` with no @media override**

The `.approval-employee` element (line 313 in page `<style>`) is set to `min-width: 160px` with no mobile breakpoint. The `.approval-actions` block (line 358) uses `min-width: 140px` with no mobile override. At 320px, the flex row of `approval-employee + approval-info + approval-amount + approval-actions` has a minimum content width of ~560px, causing horizontal overflow that `body { overflow-x: hidden }` clips silently — the approval items are cut off and buttons are unreachable.

---

## MOB-03 — CRITICAL — invoices.html — 320px
**Line totals block overflows on 320px — no mobile override for `line-total-row` gap and min-widths**

`.line-total-row` uses `gap: var(--space-8)` (32px) and contains `.line-total-label` at `min-width: 100px` and `.line-total-value` at `min-width: 120px`. At 320px the content width after padding is 272px. The grand total row containing label ("Tax (0% — B2B reverse charge)") at 100px min + value at 120px min + 32px gap = 252px minimum before text overflow. On 320px the `.line-totals` section clips visually with no scroll. There is no `@media` rule on the page for this component.

---

## MOB-04 — CRITICAL — employees.html — 320px/390px
**Org chart `min-width: 700px` is un-scrollable on mobile — `body { overflow-x: hidden }` clips it without a scroll handle**

`.org-chart-inner` has `min-width: 700px` (line 391). The parent `.org-chart` has `overflow-x: auto`. However, `body { overflow-x: hidden }` in `_layout.css` prevents the horizontal scroll from activating. The org chart becomes a 700px element silently clipped at the viewport edge with no user escape. The CSS rule hiding `.view-org` on mobile applies only to the toggle button, not the tab content — if the org tab is the active tab when at mobile size, users see a broken layout with no way to exit.

---

## MOB-05 — CRITICAL — gantt.html — 768px (tablet)
**Gantt chart `min-width: 1120px` inner element is trapped inside `.gantt-wrapper { overflow: hidden }` at tablet width**

`.gantt-inner` has `min-width: 1120px` (line 223 in page `<style>`). The wrapping `.gantt-outer` uses `overflow-x: auto`. But `.gantt-wrapper` (line 209) has `overflow: hidden` — this clips the scrollable `.gantt-outer` at the wrapper level. At 768px the main content area is ~704px wide. The `.gantt-mobile-view` fallback only shows at 639px and below. At 768px the user sees the full Gantt UI but overflow-clipped with no horizontal scroll accessible through the wrapper's `overflow: hidden`.

---

## MOB-06 — HIGH — timesheets.html — 390px
**`ts-progress-wrap` has `min-width: 180px` — combines with `flex-shrink: 0` on status text to push content past viewport on 320px**

`.ts-progress-wrap` is set to `min-width: 180px` (line 38 in page style). `.ts-status-text` uses `flex-shrink: 0`. On the status bar row, the text + 180px progress bar + action buttons require approximately 480px minimum before the `flex-wrap` rule activates. The wrapped layout places the progress bar on its own line but its `min-width: 180px` exceeds the 272px content width on 320px — the progress percentage label visually clips outside the right edge of the bar.

---

## MOB-07 — HIGH — planning.html — 320px
**Allocation popover is `position: fixed` with `min-width: 220px` and no mobile positioning clamp**

`#allocPopover` (line 810 in HTML) uses inline `position:fixed;min-width:220px`. The popover is positioned via click coordinates with no viewport-edge clamping. On 320px the popover can render fully off-screen to the right with no detection logic in the JavaScript. There is no `max-width: calc(100vw - 32px)` or right-edge guard.

---

## MOB-08 — HIGH — invoices.html — 320px/390px
**Invoice detail header action button row has no mobile stacking rule**

The `.invoice-detail-header` wraps with `flex-wrap: wrap` but the right-side actions container holds three buttons in a non-wrapping `display: flex; gap: var(--space-3)` row. At 320px this button group (Edit / Record Payment / More) cannot fit alongside the invoice title block and no `@media` rule splits the button group onto separate lines or reduces it to an icon-only row.

---

## MOB-09 — HIGH — calendar.html — 320px
**Leave popup is `position: fixed; right: var(--space-4); width: 280px` — at 320px it overflows left edge**

`.leave-popup` is `width: 280px` + `right: 16px (space-4)` = requires 296px from the right edge, leaving only 24px on the left of a 320px viewport. The popup has internal padding and text content that worsens the overflow. The mobile breakpoint override for this element only adjusts `bottom` position (line 540), not `width` or `right`. The popup is functionally unusable at 320px.

---

## MOB-10 — HIGH — hr.html — 390px
**Recruitment Kanban collapses columns to `display: none` on mobile with no stage-switching UI**

At 639px the kanban columns switch to `display: none` with only the first visible column rendered (Applied). There is no tab bar, select, or horizontal swipe indicator to navigate between the 5 recruitment stages (Applied, Screening, Interview, Offer, Hired). The stage summary pill row (showing counts for all stages) at lines 729–737 is visible but is not interactive — it does not switch the displayed column. On 390px a recruiter can see the "Applied" column only with no path to Interview or Offer stages.

---

## MOB-11 — HIGH — clients.html — 390px
**Client detail "Team" tab flex header has `min-width:min(100%,140px)` + `min-width:min(100%,180px)` + `min-width:min(100%,120px)` columns = 440px minimum at 390px content width**

The team member rows (lines 1060–1064) use three inline-styled flex columns. The CSS `min()` function with `100%` resolves to the element's own percentage width — at 390px content width the three minimums still sum to 140+180+120 = 440px, overflowing the 358px available. This section has no `@media` override or responsive collapse logic.

---

## MOB-12 — HIGH — admin.html — 390px
**Roles and Permissions table missing `mobile-cards` class — renders as unreadable horizontal-scroll table on mobile**

The Roles & Permissions tab table (lines 768–856) sits inside an `.overflow-x-auto` wrapper but the `<table>` element has no `mobile-cards` class. At 390px this table has 5 columns (Permission, Description, Admin, PM, Employee) and does not transform to stacked card layout. The user must scroll horizontally within a small, unmarked scroll zone to see all columns. Every other data table in the admin page correctly uses `mobile-cards`.

---

## MOB-13 — MEDIUM — account.html — 320px
**MFA setup step internal 2-column layout has no mobile breakpoint in page `<style>`**

The MFA modal step contains a QR code (`width: 180px; height: 180px`) and accompanying setup instructions in a side-by-side layout. The global `_layout.css` forces `.modal` to full-screen on mobile, but the internal grid columns within the modal body have no `@media (max-width: 639px)` single-column override in account.html's style block. At 320px (288px modal body width after padding), the 180px QR image overflows its column.

---

## MOB-14 — MEDIUM — timesheets.html — 768px
**`aq-filter-bar` has `min-width: 140px` on selects — at 768px tablet the bar wraps awkwardly, putting "Saved Views" on its own line**

At 768px the `aq-filter-bar` is set to `flex-wrap: wrap` (only locks to `nowrap` at `min-width: 769px`). Three selects at `min-width: 140px` each (420px) plus a "Clear" button and "Saved Views" dropdown button exhaust the 704px available content width. The "Saved Views" button wraps to a second line in isolation, making the filter bar look broken at tablet width.

---

## MOB-15 — MEDIUM — leaves.html — 320px
**Leave request modal balance selector: four cards with `min-width: 100px` in a flex row with no `flex-wrap` — overflows at 320px**

Lines 1427–1439: four balance cards with `flex:1; min-width:100px` in a row. At 320px content width ~272px, four cards at 100px minimum = 400px required. The flex container has no `flex-wrap: wrap` attribute on the parent div and no `@media` override in the page style block. The four cards compress below their minimums and overlap.

---

## MOB-16 — MEDIUM — projects.html — 390px
**Project detail header has no `@media` override — `padding: var(--space-6)` on all sides and no mobile font-size reduction for the heading**

`.project-detail-header` uses `padding: var(--space-6)` (24px sides = 48px total horizontal padding). `.project-detail-title` uses `var(--text-heading-1)`. At 390px, a title like "Acme Corp — Website Redesign" wraps to 3 lines with these constraints. The `.project-detail-badges` flex row of 5+ items with no mobile wrap rule overflows. No `@media` rule in the page or `_components.css` addresses this component at mobile widths.

---

## MOB-17 — MEDIUM — insights.html — 390px
**Date range filter inputs outside `.filter-bar-standard` use `max-width: 140px` with no mobile wrapping rule**

Multiple insight tab filter rows (e.g. lines 840–842, 988–990) use two date inputs at `max-width: 140px` each in a flex container that also contains a label and apply button. These date inputs are NOT inside `.filter-bar-standard`, so the `_layout.css` override rule for `filter-bar-standard input[type="date"]` does not apply. At 390px the flex rows overflow before wrapping, misaligning the Apply button outside the visible area.

---

## MOB-18 — MEDIUM — _layout.css — global
**`body { overflow-x: hidden }` is a masking pattern — it silently clips all overflowing content instead of fixing it**

The checklist marks this as "fixed" but it is a suppression technique. Every overflow bug listed in MOB-01 through MOB-05 is hidden behind this rule, not corrected. Users on 320px lose access to clipped interactive elements (form controls, buttons, table columns) with zero visual feedback that anything is missing. This rule must stay only as a last-resort safety net, not as the primary fix for any specific overflow.

---

## MOB-19 — MEDIUM — gantt.html — 390px
**Gantt mobile view cards have no action buttons — users cannot navigate to projects, employees, or take any action**

The `.gantt-mobile-view` cards (lines 1149+) show employee name, work-time bar, and project date text only. There are zero CTAs — no "View", no "→ Project", no "See Details" links. The desktop Gantt has drag, resize, and right-click context menus, none of which are replaced on the mobile fallback. The mobile Gantt is a read-only list with no discoverability or actionability.

---

## MOB-20 — MEDIUM — approvals.html — 320px
**Static timesheet detail table in approval modal has no `overflow-x: auto` wrapper**

At line 768 in approvals.html, the static approval detail view has a `<table style="width:100%;...">` with no wrapping `overflow-x: auto` container. At 320px inside the full-screen modal, the detail grid table (showing Mon–Sun timesheet entries per project) clips without scrolling. The dynamically injected version (line 1137) does have the scroll wrapper, but the static version in the HTML does not.

---

## MOB-21 — MEDIUM — index.html — 320px
**Heatmap `.heatmap-day-header` cells have no mobile font-size reduction — at 320px the 48px-wide day columns clip their header labels**

The `@media (max-width: 639px)` rule on the dashboard heatmap (line 394) reduces cell height and week label size but does NOT reduce `.heatmap-day-header` font-size. At 320px each day column is approximately 48px wide. Day header labels ("Mon", "Tue", "Wed") at the default `var(--text-overline)` size with `letter-spacing: 0.06em` collide with adjacent cells on narrow columns.

---

## MOB-22 — LOW — account.html — mobile
**Sessions table `mobile-cards` functionality depends on dual class `sessions-table data-table mobile-cards` — fragile coupling that will silently break if either class is removed**

The `_layout.css` defines duplicate rules for `.data-table.mobile-cards` AND `.sessions-table.mobile-cards` as two separate class selectors. The account.html sessions table (line 993) uses all three classes. If the `data-table` class is ever removed during a refactor, the `.data-table.mobile-cards` rule silently stops applying — there is no single source of truth for which selector governs the mobile card transform behavior for this table.
