# REVIEW 2 -- Mobile Readiness Audit (Fresh Eyes)

**Reviewer:** Independent Mobile Specialist (fresh review, no prior audit exposure)
**Date:** 2026-04-05
**Target viewport:** 390px (iPhone 15 Pro)
**CSS breakpoints reviewed:** <640px mobile, 640-1023px tablet, 1024-1439px desktop, 1440+ wide
**Files reviewed:** All 16 HTML files, _tokens.css, _components.css, _layout.css

---

## Executive Summary

GammaHR v2 has a **surprisingly well-built mobile foundation** compared to what I typically see in admin-dashboard prototypes. Someone clearly invested effort: there is a bottom navigation bar on every app page, a mobile day-by-day timesheet view, a card-based Gantt alternative, full-screen modals, 44px touch target enforcement, and a proper sidebar drawer with overlay. The framework-level mobile CSS in `_layout.css` covers the major patterns.

However, there are **real gaps** that would block a manager from completing their morning approval routine on a phone. Tables remain the biggest pain point -- while the CSS *defines* a `mobile-cards` table-to-card transformation, **zero HTML tables actually use the `mobile-cards` class**, so every data table in the prototype will horizontal-scroll on mobile. Several pages have no page-specific mobile CSS at all. And a few collision/overlap issues would make daily use frustrating.

**Overall mobile readiness: 6.5/10** -- Strong architecture, incomplete execution.

---

## 1. Bottom Navigation Bar

**Verdict: PASS -- Well implemented**

### What exists
- CSS in `_layout.css` lines 506-569: `.bottom-nav` with `display: none` by default, shown via `@media (max-width: 639px)` as a flex row.
- Height: 56px + `env(safe-area-inset-bottom)` for notch devices.
- z-index: 300.
- Page content automatically gets bottom padding: `calc(56px + var(--space-4) + env(safe-area-inset-bottom))`.

### What the 5 items are
Every app page contains the same bottom nav with these 5 items:
1. **Home** (layout-dashboard) -- links to index.html
2. **Time** (clock) -- links to timesheets.html
3. **Expenses** (receipt) -- links to expenses.html
4. **Leaves** (palm-tree) -- links to leaves.html
5. **More** (menu) -- opens sidebar drawer via `sidebar.classList.add('mobile-open')`

The active state is correctly set per page (e.g., `class="bottom-nav-item active"` on timesheets.html for the Time tab).

### Present on all 13 app pages
Confirmed via grep: index.html, timesheets.html, expenses.html, leaves.html, projects.html, clients.html, planning.html, gantt.html, invoices.html, insights.html, approvals.html, employees.html, admin.html.

Not present (correctly) on: auth.html, portal/auth.html, portal/index.html (portal has its own nav).

### Issues found
- **ISSUE-M1: Badge on bottom nav items uses `position: absolute` but `.bottom-nav-item` only gets `position: relative` at line 569** -- this technically works, but the badge CSS positions relative to the item center (`right: calc(50% - 18px)`) which may misalign on narrower or wider items. Minor visual risk.
- **ISSUE-M2: No "Approvals" shortcut in bottom nav.** The 5 items are Home, Time, Expenses, Leaves, More. For a manager whose primary mobile task is approving timesheets, there is no direct path to approvals without opening the "More" drawer. This is a UX concern, not a bug -- but it means the most critical mobile workflow (approve timesheets at 7am) requires an extra step.

**Bottom Nav Score: 8/10** -- Technically solid, but the item selection could be optimized for manager workflows.

---

## 2. Touch Targets

**Verdict: PASS -- Comprehensive enforcement**

### What exists
`_layout.css` lines 572-588 define a mobile media query that forces `min-height: 44px` on:
- `.btn-xs`, `.btn-sm`, `.btn-md`
- `.btn-icon`, `.btn-icon.btn-xs`, `.btn-icon.btn-sm`
- `.form-input`, `.form-select`, `.form-textarea`, `.form-input-sm`
- `.form-check input[type="checkbox"]`, `.form-check input[type="radio"]` (also gets min-width: 44px)
- `.header-icon-btn`, `.mobile-menu-btn`, `.modal-close`
- `.pagination-btn`, `.tab`, `.toggle`, `.dropdown-item`
- `.nav-btn`, `.zoom-btn`

The `.bottom-nav-item` also has `min-height: 44px` and `min-width: 56px`.

The timesheet `.day-switcher-btn` explicitly sets `min-height: 44px` in the page-specific CSS.

### Issues found
- **ISSUE-M3: `.header-icon-btn` base size is only 36x36px** (line 189 of `_layout.css`). The mobile override forces 44px minimum, but the visual hit area (the hover background) may still only render at 36px -- the extra 8px of touch target is invisible padding, which is correct for touch but could cause unexpected layout shifts if adjacent buttons are tightly packed.
- **ISSUE-M4: `.card-actions` buttons in approvals.html (`.btn-xs`, `.btn-sm`) get min-height 44px on mobile, but the `.approval-card` layout is `display: flex; align-items: flex-start;`** -- the inflated button heights could cause cards to look unusually tall on mobile. Not a blocker but visually awkward.
- **ISSUE-M5: Links within body text (e.g., employee name links in AI alerts, activity feed items) have no minimum touch target size.** These are inline `<a>` tags, not buttons, so they bypass the 44px enforcement entirely. On mobile, tapping "Bob Taylor" in an AI alert would require precision tapping on a ~14px-high text link.

**Touch Targets Score: 8/10** -- Framework enforcement is solid; inline text links are the gap.

---

## 3. Tables on Mobile

**Verdict: FAIL -- Architecture exists but is not connected to HTML**

### What exists in CSS
`_layout.css` lines 591-632 define a thorough `.data-table.mobile-cards` system:
- Hides `<thead>`
- Converts table/tbody/tr/td to `display: block`
- Gives each `<tr>` a card appearance: border, radius, padding, shadow
- Uses `td::before { content: attr(data-label); }` to show column labels
- First cell gets bold styling as a card title

This is a textbook mobile table-to-card implementation.

### What exists in HTML
**Zero tables use the `mobile-cards` class.** Confirmed via grep: `mobile-cards` appears nowhere in any HTML file.

Furthermore, **almost zero `<td>` elements have `data-label` attributes.** Only `index.html` (3 occurrences) and `insights.html` (19 occurrences) use `data-label` at all, and none of these tables have the `mobile-cards` class either.

### What actually happens at 390px
Every data table in the prototype falls back to `overflow-x: auto` (either explicitly via wrapping `<div style="overflow-x: auto;">` or via the `.data-table-wrapper` component which has `overflow: hidden`). This means:

- **Dashboard team availability table** -- horizontal scroll in a card
- **Employees list view** -- horizontal scroll
- **Invoices list** -- horizontal scroll
- **Projects/Clients tables** -- horizontal scroll
- **Admin settings tables (roles, cost centers, holidays, etc.)** -- horizontal scroll
- **Planning skills matrix** -- horizontal scroll
- **Insights profitability table** -- horizontal scroll
- **Leaves history table** -- horizontal scroll

Horizontal-scrolling 5-7 column data tables on a 390px screen is functional but far from ideal. The CSS solution was built but never applied.

### Issues found
- **ISSUE-M6 (CRITICAL): No HTML table uses `class="mobile-cards"` or `data-label` attributes.** The entire mobile table system is dead CSS. Every table horizontal-scrolls on mobile instead of transforming to cards.
- **ISSUE-M7: The heatmap grid on leaves.html (`grid-template-columns: 40px repeat(31, 1fr)`) has no mobile override.** At 390px, this creates 32 columns in roughly 350px of available space -- each cell would be about 10px wide. Completely unusable. No `@media` adjustment exists.

**Tables on Mobile Score: 3/10** -- The CSS architecture is excellent, but 0% of tables actually use it.

---

## 4. Gantt on Mobile

**Verdict: PASS -- Card-based alternative implemented**

### What exists
In `gantt.html`, lines 717-722 define mobile-specific CSS:
```css
.gantt-mobile-view { display: none; }
@media (max-width: 639px) {
  .gantt-mobile-view { display: block; }
  .filter-panel, .gantt-controls, .gantt-wrapper, .gantt-summary { display: none; }
}
```

The HTML (starting line 1226) provides a full card-based alternative with 10 employee cards, each showing:
- Avatar + employee name (linked)
- Role
- Utilization badge with color coding (high/mid/low)
- Project assignments with date ranges

On desktop, the full Gantt timeline with horizontal bars renders. On mobile, the entire desktop Gantt is hidden and replaced with the card list.

### Issues found
- **ISSUE-M8: The mobile Gantt view is read-only with no interactivity.** You cannot tap a card to see project details, whereas the desktop version has a slide panel for project details. The cards show static text only.
- **ISSUE-M9: No filter or search on the mobile Gantt view.** Desktop has a collapsible filter panel with project, department, and date range filters. The mobile view shows all employees with no way to filter. For a team of 48 employees, this would be a very long scroll.
- **ISSUE-M10: Utilization badge classes (`.util-high`, `.util-mid`, `.util-low`) are used in the HTML but not defined in any CSS file I reviewed.** These badges may render without proper styling.

**Gantt Mobile Score: 6/10** -- Major improvement over nothing, but lacks interactivity and filtering.

---

## 5. Timesheets on Mobile

**Verdict: PASS -- Purpose-built mobile view exists**

### What exists
Timesheets.html has a dedicated mobile experience (lines 533-593 of `<style>`):

**Day switcher** (`.day-switcher`): A segmented control with 7 day buttons (Mon-Sun), allowing day-by-day entry. Each button is `min-height: 44px` with the active day highlighted in primary color.

**Mobile daily total** (`.mobile-daily-total`): Shows the current day's total hours prominently.

**Visibility toggle**:
```css
.mobile-timesheet { display: none; }
@media (max-width: 639px) {
  .mobile-timesheet { display: block; }
  .ts-grid-wrapper { display: none; }
}
```

The desktop 7-column grid table is hidden, replaced by the mobile day-by-day view.

### Issues found
- **ISSUE-M11: The `.ts-status-bar` (progress bar showing "32.5h logged, 7.5h remaining") has no mobile-specific layout.** It is a horizontal flex row with `gap: var(--space-4)`. At 390px, the status text + progress bar + percentage text could wrap awkwardly because `flex-wrap` is not set on this element.
- **ISSUE-M12: The `.ts-summary` bar does get `flex-direction: column` on mobile (line 538), which is correct.** But the summary divider (a 1px x 20px vertical line) would render oddly in a column layout as a tiny dot.
- **ISSUE-M13: The week navigation buttons (`#weekPrev`, `#weekNext`) are icon buttons at 32x32px.** The mobile touch target override bumps `.btn-icon.btn-sm` to 44px minimum, so these should be fine -- but the `week-nav .btn-icon` has explicit `width: 32px; height: 32px` that may override the min-height.
- **ISSUE-M14: The "Approval Queue" tab within timesheets (Tab 3) shows approval cards that are desktop-oriented.** Each card has avatar, info, hours value, meta, and actions in a horizontal flex row. No mobile-specific layout is defined for the `.approval-card` class within timesheets.html.

**Timesheets Mobile Score: 7/10** -- The day-by-day view is a strong mobile pattern. Some polish needed on the approval queue tab and status bar.

---

## 6. Modals on Mobile

**Verdict: PASS -- Full-screen modal system implemented**

### What exists
`_layout.css` lines 635-647:
```css
@media (max-width: 639px) {
  .modal {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
  .modal-body { padding: var(--space-4); }
  .modal-header { padding: var(--space-3) var(--space-4); }
  .modal-footer { padding: var(--space-3) var(--space-4); }
}
```

The `.modal-close` button gets `min-width: 44px; min-height: 44px` via the touch target enforcement.

### Issues found
- **ISSUE-M15: The `!important` overrides are necessary here given the `.modal-sm`, `.modal-lg`, `.modal-xl` size variants, but the pattern means any inline modal width styling would also be overridden.** This is actually correct behavior for mobile.
- **ISSUE-M16: The command palette (`.cmd-palette`) does NOT get the full-screen treatment.** It remains at `width: 560px; max-width: calc(100vw - 32px)` on mobile. While it would still fit (at 358px width), it opens at 20vh from the top, which means the keyboard on iOS would likely obscure the results list.
- **ISSUE-M17: The Gantt slide panel (`.slide-panel` in gantt.html) has `width: 420px` with no mobile override.** At 390px viewport, this panel would overflow the screen by 30px. The slide panel is defined locally in gantt.html, not using the global `.modal` class.

**Modals Mobile Score: 8/10** -- Core modal system is correct. Edge cases (command palette, slide panels) need attention.

---

## 7. Sidebar as Slide-in Drawer

**Verdict: PASS -- Properly implemented**

### What exists
`_layout.css` lines 370-414:

At `<640px`:
- Sidebar gets `transform: translateX(-100%)` (hidden off-screen left)
- `.sidebar.mobile-open` triggers `transform: translateX(0)` (slides in)
- z-index: 200
- `.sidebar-overlay` (z-index: 199) provides a dark backdrop
- `.main-wrapper` gets `margin-left: 0` (full width)

Every app page has:
- A `.mobile-menu-btn` in the header (hamburger icon, only displayed at <640px)
- A `.sidebar-overlay` div
- JavaScript wiring: hamburger toggles `mobile-open`, overlay click removes it

The "More" button in the bottom nav also triggers the sidebar open.

### Issues found
- **ISSUE-M18: The sidebar does not have a close button visible in the mobile drawer state.** The "Collapse" button at the bottom changes sidebar width, but does not close the drawer. Users must tap the overlay to close it. A more explicit close affordance (X button or swipe gesture) would be better.
- **ISSUE-M19: The sidebar navigation items do not have `min-height: 44px` enforcement.** The touch target enforcement in `_layout.css` covers many component classes but does not include `.nav-item`. The sidebar nav items use `padding: var(--space-2) var(--space-4)` which is 8px + line-height, resulting in approximately 34-36px total height. Below the 44px threshold.

**Sidebar Drawer Score: 7/10** -- Functional implementation with missing close affordance and undersized nav items.

---

## 8. Notification Panel on Mobile

**Verdict: PASS with caveats**

### What exists
`_layout.css` lines 650-656:
```css
@media (max-width: 639px) {
  .notif-panel {
    width: calc(100vw - var(--space-4));
    right: calc(-1 * var(--space-2));
    max-height: 70vh;
  }
}
```

The notification panel expands to nearly full viewport width (390px - 16px = 374px) and limits height to 70vh with overflow scroll.

### Issues found
- **ISSUE-M20: The notification panel is positioned `absolute` relative to a parent `div style="position: relative"` in the header.** On mobile, with the header being 56px tall and the panel appearing below it, the panel has `top: calc(100% + 8px)`. This should work, but at `max-height: 70vh`, the panel would extend to about 590px from the header, which is fine for scrolling.
- **ISSUE-M21: Each `.notif-item` has no minimum touch target enforcement.** The items use `padding: var(--space-3) var(--space-4)` (12px + line-height), which is approximately 40-44px depending on text wrapping. Borderline acceptable.
- **ISSUE-M22: The "Mark all read" button inside the panel is `.btn.btn-ghost.btn-xs` which would get min-height 44px on mobile.** This is correct but may look oversized inside the compact notification header.

**Notification Panel Score: 7/10** -- Fits on screen, functional, but touch targets inside are borderline.

---

## 9. Page-by-Page Mobile Readiness Ratings

### Dashboard (`index.html`) -- Mobile Score: 7/10

**What works well:**
- KPI grid collapses to single column (`grid-template-columns: 1fr` at <640px)
- "Week at a Glance" hero card has a 5-column grid for days that would compress but remain readable at 390px (each day gets ~62px)
- Two-column grid (`grid-60-40`) collapses to single column
- Bottom nav present, hamburger menu present

**What breaks:**
- Team Availability table: horizontal scroll only (no `mobile-cards` class)
- Mini Gantt preview: the `.gantt-name` is 100px fixed width + flex track, which compresses reasonably but the gantt cells become very small (~40px each)
- Revenue chart bars are in a flex row with `gap: 8px` -- at 390px with 6 bars this works but labels may overlap
- Donut chart section (`.donut-wrap`) uses `flex` with `gap: 24px` -- at 390px the SVG donut + legend side by side would be very cramped. No `flex-wrap` override for mobile

**Critical for morning routine:** The "Pending Approvals" KPI card links to approvals.html. The dashboard approval widget (right column) has approve/reject buttons that would be accessible after scrolling past the entire left column. Long scroll path to key actions.

---

### Timesheets (`timesheets.html`) -- Mobile Score: 7/10

(Covered in section 5 above)

**What works well:**
- Day-by-day mobile view with day switcher
- Desktop grid table hidden on mobile
- Full-width action buttons on mobile

**What breaks:**
- Status bar layout cramped
- Approval queue tab has no mobile layout
- "Previous Weeks" tab has a horizontal-scroll table

---

### Expenses (`expenses.html`) -- Mobile Score: 6/10

**What works well:**
- Stats grid collapses to 1 column at <640px
- Form layout collapses to 1 column at <640px
- Expense cards (`.expense-item`) use flexbox that could work on mobile
- Bottom nav present

**What breaks:**
- Expense list items are `display: flex` with icon (44px) + amount (100px min) + details (flex 1) + right actions side by side. At 390px minus padding (16px x 2 = 32px), that leaves 358px. With all elements, this row would overflow or look very cramped.
- No `flex-wrap` on `.expense-item` for mobile
- Upload zone in Submit tab requires file picker -- works on mobile browsers but no camera shortcut
- Filter bar has no search field collapse for mobile (unlike the standardized `filter-bar-standard` in `_layout.css`)

---

### Leaves (`leaves.html`) -- Mobile Score: 5/10

**What works well:**
- Leave balance grid collapses to 1 column at <640px
- Leave request cards use flex layout that wraps reasonably

**What breaks:**
- **Heatmap calendar is completely broken on mobile.** `grid-template-columns: 40px repeat(31, 1fr)` creates 32 columns. At 390px - 32px padding = 358px usable width. Each of 31 day cells gets about 10px. This is unusable -- you cannot see or interact with individual days. No mobile override exists.
- Leave history data table: horizontal scroll only
- Calendar month view (if JS-generated) has no documented mobile override

---

### Approvals (`approvals.html`) -- Mobile Score: 5/10

**What works well:**
- Approval cards are flex-based and can wrap
- Bottom nav present
- Card structure with type icon + body + actions

**What breaks:**
- **No `@media (max-width: 639px)` rules at all in the page-specific CSS.** The page relies entirely on the global layout system.
- `.approval-card` is `display: flex; align-items: flex-start; gap: 12px; padding: 16px`. With card-check (16px) + type-icon (36px) + card-body (flex 1) + card-actions -- this could overflow at 390px.
- **Bulk action bar (`#bulkBar`) is `position: fixed; bottom: 24px` and would overlap with the bottom nav (fixed at bottom: 0, height: 56px).** The bulk bar would sit partially behind the bottom nav.
- `.filter-bar` in approvals has no mobile-specific collapse

---

### Projects (`projects.html`) -- Mobile Score: 5/10

**What works well:**
- Bottom nav present
- Kanban cards would stack in a single column at <640px via the grid system

**What breaks:**
- Multiple data tables (budget tracking, team allocation, milestones, tasks) all use `data-table-wrapper` with no `mobile-cards` class
- Project detail view uses `grid-60-40` which collapses to 1fr -- this works but creates a very long scroll
- No page-specific mobile CSS

---

### Clients (`clients.html`) -- Mobile Score: 5/10

**What works well:**
- Bottom nav present
- Client cards in grid would stack to 1 column

**What breaks:**
- Multiple tables in client detail (projects, invoices, contacts, activity) all horizontal-scroll
- No page-specific mobile CSS
- Client detail slide panel (if any) may not be full-screen

---

### Planning (`planning.html`) -- Mobile Score: 4/10

**What works well:**
- Capacity grid collapses to 1 column at <640px
- Bottom nav present

**What breaks:**
- Skills matrix table: horizontal scroll with 5 columns, no mobile card alternative
- Resource allocation table: horizontal scroll
- No mobile-specific CSS beyond the single grid override
- The core value of resource planning -- visual allocation grid -- is essentially unusable at 390px

---

### Gantt (`gantt.html`) -- Mobile Score: 6/10

(Covered in section 4 above)

**What works well:**
- Full card-based mobile alternative
- Desktop Gantt completely hidden

**What breaks:**
- No filtering on mobile view
- No interactivity (no slide panel)
- Missing CSS for utilization badges

---

### Invoices (`invoices.html`) -- Mobile Score: 5/10

**What works well:**
- Bottom nav present
- Invoice info grid uses `auto-fit, minmax(180px, 1fr)` which adapts to mobile

**What breaks:**
- Invoice list table: horizontal scroll
- Line items table in invoice detail: horizontal scroll
- Status timeline is horizontal flex with no mobile wrap -- at 390px, 4-5 steps would overflow
- No page-specific mobile CSS

---

### Insights (`insights.html`) -- Mobile Score: 4/10

**What works well:**
- Bottom nav present
- NL query bar is full-width flex, adapts to mobile
- Query chips wrap via `flex-wrap: wrap`

**What breaks:**
- **No mobile-specific CSS at all.** No `@media` rules in the page-specific styles.
- Chart grids (grid-2, grid-3) rely on global collapse -- this works for the grid but the charts themselves (SVG-based bar charts, donut charts) have no mobile scaling
- Data tables (Top 5 Employees, Project Profitability) horizontal scroll
- The dashboard layout with multiple chart cards in a 2-column grid collapses to 1 column, but each chart card may have internal elements too wide for 390px

---

### Employees / Team Directory (`employees.html`) -- Mobile Score: 6/10

**What works well:**
- Employee card grid collapses to 1 column at <640px
- Profile hero section collapses to column layout at <640px: `flex-direction: column; align-items: center; text-align: center`
- Bottom nav present

**What breaks:**
- Employee list view (table): horizontal scroll, no mobile-cards
- Profile detail tables (projects, timesheets, expenses, leaves, documents): all horizontal scroll
- Filter bar has no mobile collapse for search field

---

### Admin / Configuration (`admin.html`) -- Mobile Score: 4/10

**What works well:**
- Bottom nav present
- Tab navigation would scroll horizontally (tabs have `overflow-x: auto`)

**What breaks:**
- **No mobile-specific CSS at all**
- 5+ data tables (Roles & Permissions, Cost Centers, Expense Policies, Holiday Calendar, Integrations, Audit Log): all horizontal scroll
- Settings forms may work reasonably via global input sizing
- This is a rarely-used-on-mobile page, so lower priority

---

### Auth Pages (`auth.html`, `portal/auth.html`) -- Mobile Score: 9/10

**What works well:**
- Centered card layout with `max-width: 420px` and `padding: var(--space-4)` on the page
- Form inputs are 44px height
- Submit buttons are full width, 44px height
- MFA code input is large and centered
- No sidebar, no complex layout

**What breaks:**
- Minor: password toggle button is small (just `padding: 4px`) without explicit minimum size
- Auth page does not import `_layout.css`, so no global mobile overrides apply, but the page is simple enough that it does not need them

---

### Client Portal (`portal/index.html`) -- Mobile Score: 5/10

**What works well:**
- Portal nav items get `min-height: 44px` at <640px
- Portal nav container gets `overflow-x: auto` for horizontal scrolling
- No sidebar (simpler layout)

**What breaks:**
- No bottom navigation bar (portal has its own nav, which is fine, but it's a horizontal nav at the top that scrolls)
- Portal data tables (project hours, invoices, documents): no mobile-cards class
- Milestone tracker is horizontal flex with no mobile wrap
- Team member grid uses `auto-fill, minmax(200px, 1fr)` which would create 1 column at 390px -- this works
- No page-specific mobile CSS beyond the nav override

---

## 10. Cross-Cutting Issues

### ISSUE-M23: State toggle button collides with bottom nav
The `.state-toggle` button is `position: fixed; bottom: var(--space-4); right: var(--space-4)` (bottom: 16px, right: 16px) with z-index: 800. The bottom nav is `position: fixed; bottom: 0; height: 56px; z-index: 300`. The toggle button would sit **behind** the bottom nav since it is only 16px from the bottom but the nav is 56px tall. The z-index (800 vs 300) would place the toggle above the nav, but it would visually overlap/collide with the rightmost nav item ("More").

This toggle is present on **every app page** (13 pages).

### ISSUE-M24: Toast notifications may be obscured
`.toast-container` is `position: fixed; top: var(--space-4); right: var(--space-4)` with `min-width: 320px; max-width: 420px`. At 390px viewport, a 320px toast with 16px right offset means the toast starts at 390 - 320 - 16 = 54px from the left. This barely fits but leaves only 54px of visible screen to the left. No mobile width override exists for toasts.

### ISSUE-M25: Search bar is hidden with no replacement
At <640px, `.header-search { display: none; }`. A `.mobile-search-btn` CSS class is defined in `_layout.css` (lines 659-672) that shows at <640px, but **no HTML file actually includes a `.mobile-search-btn` element**. Grep confirms: 0 occurrences of `mobile-search-btn` in any HTML file. The global search (Cmd+K command palette) is still accessible but has no visible trigger button on mobile.

### ISSUE-M26: No `meta viewport` issues detected
All pages correctly include `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. Good.

---

## 11. Morning Approval Routine -- Can a Manager Complete It?

**Scenario:** Manager wakes up at 7am, grabs phone, needs to:
1. See what needs approval
2. Review timesheet submissions
3. Approve or reject them
4. Check for any flagged expenses

### Step-by-step walkthrough at 390px:

1. **Open app** -- Dashboard loads. Grids collapse to 1 column. KPI cards are visible. "Pending Approvals: 12" card is visible after scrolling past the Week at a Glance hero and 5 other KPI cards. Tapping it navigates to approvals.html. **Friction: medium scroll to find it.**

2. **Approvals page** -- Cards load in a vertical list. Each card shows employee name, type icon, details, and approve/reject buttons. The card layout at 390px would be tight but functional since it's flex with wrapping content. **Friction: buttons may be small, bulk actions overlap bottom nav.**

3. **Review a timesheet** -- Tapping a timesheet approval card... there is no drill-down link to view the employee's actual timesheet. The approve/reject buttons are right on the card. **Friction: no way to review details before approving.**

4. **Alternative: Timesheets page** -- Navigate via bottom nav "Time" button. Mobile day-by-day view loads. Tabs show "Approval Queue" tab. This tab shows approval cards similar to the approvals page. **Friction: adequate path exists.**

5. **Check flagged expenses** -- Bottom nav "Expenses" button. The expense list loads. Filter bar is visible but cramped. Expense cards show with amounts and flags. **Friction: functional but tight layout.**

**Verdict: A manager CAN complete the routine, but with friction.** The critical path works. The main pain points are: (a) no direct "Approvals" button in bottom nav, (b) approval cards are cramped at 390px, (c) no drill-down to review actual timesheet data before approving, (d) bulk approve bar overlaps bottom nav.

---

## 12. Summary Scores

| Page | Mobile Score | Key Issue |
|------|-------------|-----------|
| auth.html | **9/10** | Nearly perfect, minor password toggle size |
| portal/auth.html | **9/10** | Nearly perfect |
| index.html (Dashboard) | **7/10** | Tables horizontal-scroll, donut chart cramped |
| timesheets.html | **7/10** | Strong day-by-day view, approval tab needs work |
| gantt.html | **6/10** | Card alternative works, no filter/interactivity |
| employees.html | **6/10** | Card grid works, profile tables horizontal-scroll |
| expenses.html | **6/10** | Card items tight at 390px, stats collapse works |
| approvals.html | **5/10** | No mobile CSS, bulk bar overlaps bottom nav |
| projects.html | **5/10** | Many tables, no mobile-cards |
| clients.html | **5/10** | Many tables, no mobile-cards |
| invoices.html | **5/10** | Tables, status timeline overflow |
| leaves.html | **5/10** | Heatmap completely broken at 390px |
| portal/index.html | **5/10** | No bottom nav, tables horizontal-scroll |
| planning.html | **4/10** | Core matrix unusable at 390px |
| insights.html | **4/10** | No mobile CSS, charts may not scale |
| admin.html | **4/10** | No mobile CSS, many tables |

**Weighted average (by usage frequency for mobile):** ~6.5/10

---

## 13. Priority Fix List

### P0 -- Blocking mobile usage
1. **Add `mobile-cards` class and `data-label` attributes to all primary data tables** -- approvals list, expense list, invoice list, employee list. This is the single highest-impact fix. The CSS is already written and waiting.
2. **Fix bulk action bar z-index/position to not overlap bottom nav** on approvals.html. Move it to `bottom: calc(56px + var(--space-4) + env(safe-area-inset-bottom))` on mobile.
3. **Fix state-toggle button position on mobile** -- either hide it or move it above the bottom nav.

### P1 -- Significantly improves mobile experience
4. **Add `mobile-search-btn` HTML element to all app pages** -- the CSS exists, the HTML does not.
5. **Add mobile override for leaves heatmap** -- either hide it and show a simplified list, or make it horizontally scrollable with snap points.
6. **Add sidebar nav item touch target sizing** -- `.nav-item { min-height: 44px; }` in the mobile media query.
7. **Consider swapping "Leaves" for "Approvals" in bottom nav for manager role** (or make bottom nav role-aware).

### P2 -- Polish
8. Add `flex-wrap` to `.expense-item` on mobile for cramped layouts.
9. Add mobile override for donut chart section on dashboard (stack vertically).
10. Add mobile override for invoice status timeline (vertical instead of horizontal).
11. Add interactivity to mobile Gantt view (tap card to open slide panel).
12. Ensure command palette does not get obscured by iOS keyboard.

---

## 14. Architecture Assessment

The mobile architecture in this prototype is **well-designed at the CSS framework level**. The patterns are correct:
- Bottom nav with safe area insets
- Sidebar as slide-in drawer with overlay
- Full-screen modals
- Touch target enforcement
- Grid collapse system
- Table-to-card CSS (unused but ready)
- Dedicated mobile views for complex components (timesheets, Gantt)

The gap is in **execution and connection** -- the CSS patterns exist but many pages either don't use them (mobile-cards, mobile-search-btn) or have no page-specific mobile CSS at all (admin, insights, approvals).

This is a prototype where the mobile *framework* is an 8/10 but the mobile *application* of that framework is a 5/10. Closing that gap requires mostly HTML attribute additions and targeted page-specific `@media` rules -- not architectural changes.
