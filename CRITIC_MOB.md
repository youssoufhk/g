# Mobile QA Audit — GammaHR v2 Prototype
**Audited by:** Harsh Mobile QA (Claude Opus 4.6)
**Date:** 2026-04-10
**Breakpoints tested:** 320px, 390px, 768px
**Files audited:** All 19 HTML files + _layout.css + _components.css + _tokens.css

---

## Previously Reported Issues — Verification

- **HR Recruitment horizontal overflow:** FIXED. Kanban stacks vertically on mobile with stage tabs.
- **Filters stacking vertically on desktop:** FIXED. `filter-bar-standard` uses `flex-wrap: nowrap` on desktop.
- **Expenses page narrower than other pages:** FIXED. Uses same `page-content` class as all other pages.

---

## New Findings

### CRITICAL (blocks usability)

**[CRIT-1]** `account.html` | 320px-390px | **Sessions table won't collapse to card view on mobile.** The table uses class `sessions-table mobile-cards` but not `data-table`. The `_layout.css` mobile-cards transform targets `.data-table.mobile-cards` exclusively. At 320px the sessions table renders as a tiny horizontal table inside an `overflow-x:auto` wrapper, requiring horizontal scroll to see "Action" column. Fix: add `data-table` class alongside `sessions-table`.

**[CRIT-2]** `employees.html` | 320px | **Filter bar selects have inline `width: 160px / 140px / 130px` that override the `filter-bar-standard` mobile breakpoint.** The canonical mobile rule sets `.form-select { flex: 1; min-width: calc(50% - var(--space-2)) }` but the inline `style="width: 160px"` takes precedence. At 320px (296px usable), three selects at 160+140+130 = 430px total. Even wrapped, two won't fit side-by-side. The inline `width` prevents flex shrinking. Fix: remove inline `width`, use `min-width` or let the filter-bar-standard handle sizing.

**[CRIT-3]** `leaves.html` | 320px-390px | **Leave request modal `.form-row` has no mobile breakpoint.** Defined at line 464 as `grid-template-columns: 1fr 1fr` with no `@media (max-width: 639px)` collapse. Both `account.html` (line 138) and `expenses.html` (line 411) correctly add `.form-row { grid-template-columns: 1fr }` at 639px. At 320px inside a full-screen modal, each date input gets ~128px wide -- barely fits a date picker, and unusable on many devices. Fix: add the same mobile media query.

**[CRIT-4]** `calendar.html` | 320px | **Month grid overflows at 320px.** `.cal-day { min-width: 44px }` times 7 columns = 308px minimum. With page-content padding `var(--space-3)` (12px) on each side, usable width is 296px. The grid forces 308px content inside 296px, causing horizontal overflow. The overflow isn't caught by `overflow-x: auto` because the `.cal-grid` container uses `overflow: hidden`, not `overflow: auto`. Fix: reduce `min-width` to `38px` at 320px or wrap in `overflow-x: auto`.

**[CRIT-5]** `approvals.html` | 320px-390px | **Filter bar has `<label>` elements as separate flex children alongside selects, causing layout chaos on mobile.** The `filter-bar-standard` contains: `<label>Sort by</label>` + `<select min-width:120px>` + `<label>Department</label>` + `<select min-width:120px>` + `<label>Employee</label>` + `<select min-width:140px>`. At 320px these 6 items wrap chaotically -- labels float separately from their selects. No search input means the canonical filter-bar-standard mobile rule (`.filter-search { min-width: 100%; order: -1 }`) doesn't anchor anything. Fix: wrap each label+select pair in a container, or hide labels on mobile and use placeholder text instead.

### HIGH (significant UX degradation)

**[HIGH-6]** `invoices.html` | 320px | **Date range inputs overflow filter bar.** Two date inputs with inline `style="min-width: 140px"` plus the "to" text span = 280px+ required. At 320px with padding, only ~260px is available in a wrapped row. The `min-width` prevents shrinking. Fix: reduce `min-width` to `120px` or use `max-width: 100%` override at mobile.

**[HIGH-7]** `planning.html` | 320px | **Scenario chart SVG has `style="min-width:320px"` inline.** Even though there's a `@media (max-width: 400px)` rule reducing it to `280px`, the inline style `min-width:320px` has higher specificity and wins. The `overflow-x: auto` wrapper catches this, but the chart scrolls horizontally on every phone viewport, defeating the purpose of the responsive wrapper. Fix: move `min-width` to CSS class so the media query can override it.

**[HIGH-8]** `gantt.html` | 320px-639px | **Skills multi-select filter has inline `style="min-width:160px;height:auto;"`.** Inside the filter panel's `.filter-group`, this multi-select won't shrink below 160px. At 320px, `filter-group { min-width: 140px }` plus this 160px select means the filter row won't fit. The `@media (max-width: 639px)` rule unsets `filter-group min-width` but the select's inline style persists. Fix: remove inline `min-width` or override with `!important` in the mobile media query.

**[HIGH-9]** `calendar.html` | 320px | **`.cal-nav .month-label { min-width: 180px }` combined with two nav buttons and the view toggle overflows the calendar header.** At 320px, the `.cal-header` flex-wraps, but `min-width: 180px` on the month label plus the nav buttons (~88px) = 268px, which is fine. However combined with `.cal-view-toggle` on the same row, the total exceeds available width before wrapping kicks in. Fix: reduce `min-width` to `140px` on mobile.

**[HIGH-10]** `leaves.html` | 320px | **Leave calendar `min-width: 480px` inline style.** The calendar grid at line 1224 has `style="min-width: 480px"` inside an `overflow-x: auto` wrapper. This forces horizontal scroll on every mobile device. While the scroll wrapper prevents page overflow, requiring horizontal scroll on a 7-column calendar that could potentially compress to fit ~296px (42px per day) is poor UX. Fix: reduce `min-width` to `308px` (7*44px) to match the main calendar pattern.

### MEDIUM (noticeable but workable)

**[MED-11]** `approvals.html` | 320px | **Bulk action bar `max-width: 100vw` but `left: 50%; transform: translateX(-50%)` can cause horizontal overflow.** The bulk bar is positioned at `left: 50%` then shifted back, but its `max-width: 100vw` plus padding means at 320px the bar can extend past viewport edges. The `overflow-x: auto` on the bar helps, but the bar itself clips against the viewport. Fix: add `left: 0; transform: none; width: calc(100% - 2 * var(--space-3)); margin: 0 auto;` at mobile breakpoint.

**[MED-12]** `clients.html` | 320px | **`.client-revenue { min-width: 120px }` forces revenue column to always take 120px.** Inside a `.client-card` flex row with `client-logo` (48px) + `client-info` (flex: 1) + `client-revenue` (120px) = 168px fixed + flex. At 320px (296px usable), `client-info` gets only 128px -- not enough for client name + meta row which truncates aggressively. Fix: reduce `min-width` to `80px` or remove it on mobile.

**[MED-13]** `insights.html` | 320px-390px | **Team Performance table employee links have inline `style="min-width:100px"`.** Eight employee name links at `min-width: 100px` inside table cells that are converting to mobile cards. The `min-width` is harmless in card mode but the surrounding performance bar containers may not adapt well. Also, the `#tab-team-performance a[style*="min-width"] { min-width: 80px !important; }` override at 639px is a fragile attribute selector that depends on exact inline style string matching.

**[MED-14]** `hr.html` | 320px | **Onboarding/Offboarding checklist items have no horizontal overflow protection.** The `.checklist-item` rows display as flex with labels that could be long text strings. While most content is short, the `.onboard-card-header` at 320px with avatar (40px) + info (flex) + date display can cause text overlap when card width is 296px and padding is applied.

**[MED-15]** `timesheets.html` | 768px | **Status bar `.ts-status-bar` doesn't wrap at tablet.** The status bar is a flex row with `gap: var(--space-4)` containing status text, progress bar (`min-width: 180px`), and action buttons. At 768px (with sidebar collapsed = 56px, leaving 712px), this fits. But at exactly 768px with some content variations, the `min-width: 180px` progress wrap plus buttons can push against the edge. No `flex-wrap: wrap` is set on the bar. Fix: add `flex-wrap: wrap`.

**[MED-16]** `portal/index.html` | all mobile | **Portal nav tabs rely solely on horizontal scroll.** The portal navigation tabs use `overflow-x: auto` but there is no scroll indicator or gradient fade hint. On a 320px screen, only the first 3-4 tabs are visible. Users may never discover the Messages or Documents tabs. Fix: add scroll-fade indicators or convert to a dropdown/select on mobile.

**[MED-17]** `employees.html` | 320px | **View toggle is hidden on mobile (`display: none !important` at 639px) but the org chart view is only accessible via view toggle.** If a user navigates to the org chart view on desktop then resizes to mobile, they're stuck in org view with no way to switch back. The card/list/org toggle disappears. Fix: force card view on mobile or show a simplified toggle.

**[MED-18]** `leaves.html` | 320px | **Calendar nav `.month-label { min-width: 160px }` in the leave calendar header.** Combined with two nav buttons and the view toggle, the calendar header wraps in a confusing way at 320px. The month label takes 160px, nav buttons take ~88px, leaving almost nothing for the view toggle which wraps to a second row. Not broken but visually awkward. Fix: reduce `min-width` to `120px` on mobile.

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| HIGH | 5 |
| MEDIUM | 8 |
| **Total** | **18** |

**Top priority fixes:** CRIT-1 through CRIT-5 are all layout-breaking at 320px and should be fixed before any demo on a phone. The most impactful single fix would be CRIT-4 (calendar grid overflow) since it breaks the most-used page layout.
