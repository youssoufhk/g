# CRITIC: Mobile, Responsive & Visual Polish

## Verdict: CONDITIONAL — Would pay €50/user? MAYBE

The design system foundation is genuinely good: strong dark theme, coherent token set, thoughtful component library. But real-world mobile usage of 6+ pages would frustrate users enough to question the price tag. The CSS shows evidence of rapid reactive patching (FIX-38, CRIT-1 through CRIT-5, HIGH-6 through HIGH-10, MED-11 through MED-18) rather than mobile-first thinking. Many patches are brittle attribute selectors that break the instant an inline width changes by one character. A €50/seat product cannot have QA debt this visible in the source.

---

## Definite overflow/breakage at mobile

1. **Gantt controls bar (gantt.html) — 320px**: `.gantt-inner` has `min-width: 1120px` inside a scroll container (correct). The `.gantt-controls` bar above it — zoom group, nav buttons, date range label, Today button — is a flex row with no wrap and no overflow container. At 320px the date label and Today button clip off-screen with no scroll affordance.

2. **Timesheets week grid — tablet dead zone 640px–768px**: The mobile fallback (`.mobile-timesheet`) only activates below 639px. At 640–768px the desktop `.ts-grid` shows: 200px project column + 7 day columns + 70px total. The wrapper has `overflow: hidden` — columns are clipped silently, not scrollable. Data loss, not degradation.

3. **Leaves quarter view (leaves.html) — 320px, 390px**: `grid-template-columns: repeat(3,1fr)` with zero breakpoints. At 320px each month column is approximately 95px. Inner 7-column day grids with fixed 18px circles push outside their columns. No overflow wrapper exists.

4. **Leaves heatmap — 639px–768px**: The 32-column heatmap (`40px + repeat(31, 1fr)`) is hidden below 639px but fully visible at 640–768px with no horizontal scroll container. On a 768px viewport with 56px sidebar = 712px usable, 32 columns compress to approximately 22px each — untappable and unreadable.

5. **Insights filter bar with forced `flex-wrap: nowrap` (insights.html) — 320px**: A page-level inline style on `.filter-bar-standard` overrides the global 768px wrap rule. The global `min-width: 769px` rule forces `nowrap` only at wide viewports, but the inline style sets it at all widths. At 320px the bar overflows horizontally with no scroll affordance.

6. **HR Kanban — 640px–1023px**: `flex-wrap: nowrap` + `min-width: 160px` per column at `max-width: 1023px`. With 6+ pipeline stages, minimum content width is approximately 960px at 640px viewport. Full-page horizontal scroll appears before the mobile column-switcher activates at 639px. A demo on iPad portrait mode shows a broken kanban.

7. **Leaves modal balance chips — 320px**: Four leave-type chips each have `flex: 1; min-width: 100px`. Four × 100px = 400px minimum inside a 320px full-screen modal. These overflow without a scroll wrapper.

8. **Planning scenario SVG — 320px**: The HIGH-7 fix applies `min-width: 280px` via an attribute selector targeting inline `min-width: 320px`. At 320px viewport the SVG is 280px in a space providing 296px (320 − 24px total padding). One browser rounding event from overflow. Documented as fixed but structurally fragile.

9. **Timesheets inline edit cell input — mobile**: `.ts-cell-input` is `height: 28px` with no mobile override. The global rule upsizes `.form-input` to `min-height: 44px` but `.ts-cell-input` is a custom class not covered. A user tapping a timesheet cell gets a 28px edit field.

10. **Notification panel anchor at 320px (all pages)**: The mobile override positions the panel at `right: calc(-1 * var(--space-2))` = −8px outside the `header-right` container. On a 320px screen the 316px-wide panel can clip its left edge off-screen depending on where `header-right` sits.

11. **Employees org view — tablet 640px–1023px**: Org chart view is correctly hidden below 639px by the MED-17 fix. At 640–1023px there is no responsive handling for org chart node widths and absolute-positioned connector lines. These overflow at tablet width.

12. **`grid-6` collapses to 3 columns on mobile — too many at 320px**: At 320px in a `.grid-6` layout, 3 columns with 16px gaps = approximately 93px per column. Card content with icon + label stacks awkwardly. At 320px this should collapse to 2-col or 1-col.

---

## Touch target failures

13. **`header-icon-btn` at 36px — all pages, 640px–1023px**: The element is 36×36px at base. The 44px minimum override only applies at `max-width: 639px`. On every page at tablet width the notification bell, theme toggle, and header icon buttons are 36px — 8px short of minimum. Every page, every tablet user.

14. **`btn-xs` approve/reject/detail in approvals table rows — 768px**: `btn-xs` = 28px height. The upsizing rule applies only below 639px. At 768px the primary action buttons on the most critical workflow page miss the touch target floor by 16px.

15. **Pagination buttons mismatched class — all pages, mobile**: Buttons are `width: 32px; height: 32px` inside `.pagination-buttons` using generic `button` elements. The mobile upsizing rule targets the class `.pagination-btn`. The class selector does not match the actual elements. The fix never applies. Pagination stays at 32px on mobile for all users.

16. **`modal-close` at 32px — all modals, 640px–768px**: 32×32px at base. Mobile fix applies 44×44px minimum only below 639px. At 640–768px every modal close button is 32×32px — difficult to reliably tap on a tablet.

17. **Bottom nav label text at hardcoded 10px (all mobile pages)**: `font-size: 10px` is below the 12px legibility floor and below the `--text-overline` token (11px) already in the system. With accessibility font scaling the text scales but the nav item does not expand, causing label clipping.

18. **Gantt zoom buttons base height approximately 25px**: Computed height = 13px font + 6px top/bottom padding = approximately 25px. The `_layout.css` rule `.zoom-btn { min-height: 44px }` should fix this, but the base is so far below 44px that any specificity conflict produces an untappable button in primary Gantt navigation.

---

## Visual polish gaps (looks like a prototype, not a product)

19. **`--text-overline` at 11px used 69 times across 12 files**: Applied to sidebar section labels, badge counts, Gantt day-column headers, heatmap day letters, chart group labels, and calendar weekday abbreviations. The Gantt day-column headers are the worst case — users must squint to read dates they need to tap in the primary time-tracking UI.

20. **Quarter calendar built from 120 lines of inline style attributes (leaves.html)**: Each day cell is a `<span>` with a complete inline style declaration covering background, border-radius, width, height, display, align-items, justify-content, margin, and color. Unmaintainable, unthemeable (light mode breaks because dark-mode colors are hardcoded inline), and the single most visible prototype artifact in the codebase.

21. **Patch comments visible in production stylesheet**: `FIX-38`, `CRIT-2`, `HIGH-6`, `MED-15` scattered through `_layout.css` signal reactive patchwork to any engineer reviewing the code. These should be replaced with descriptive comments or moved to a changelog before any external review.

22. **`color-mix()` used for Gantt alternating rows**: `color-mix(in srgb, ...)` is unsupported in Firefox before version 113 and Samsung Internet. HR enterprise users frequently use managed browsers on older Windows systems. Silent fallback means no zebra striping on the primary timeline view.

23. **Collapsed sidebar badge `font-size: 8px` — all tablet views**: At 640–1023px the sidebar is always collapsed, always showing nav badges at `font-size: 8px`. The pending approvals count is approximately 2mm tall on a 10-inch iPad. A blob with no readable number is not a notification badge.

24. **Bottom nav active state is color-only, no shape indicator**: `.bottom-nav-item.active` changes only text and icon color to sage green. No background pill, indicator bar, or underline. Color-only active state fails WCAG 1.4.1 for users with color vision deficiency — unacceptable for enterprise HR at this price point.

25. **Dashboard greeting pushes KPI data below fold on mobile (index.html)**: 36px display headline plus `margin-bottom: 40px` means the first KPI card appears well below the fold on an iPhone SE. A manager opening the app before a meeting sees a decorative greeting and must scroll to see any data.

26. **`state-toggle` dev tool present in every page DOM**: Every HTML file ships a `.state-toggle` button triggered by `Shift+E`. The comment labels it a prototype demo tool. Leaving it in the DOM during any customer-facing review is a credibility risk that must not reach a sales demo.

27. **Light mode toggle implementation inconsistency**: The complete light mode token override exists in `_tokens.css` but its activation via `data-theme="light"` is not uniformly wired across all pages. Users who apply the theme mid-navigation may encounter pages where the toggle is absent.

28. **Inline style proliferation creates unthemeable one-offs**: Particularly in `clients.html`, `employees.html`, and `leaves.html`, inline styles mix hardcoded pixel values with token references. A future palette update propagates through class-based rules but leaves inline token references stranded next to hardcoded dimensions.

29. **No loading or error states for SVG charts**: All charts are static hardcoded SVG in the HTML source. There is no pattern for loading, API error, or empty data states. This visual gap was never designed and will be jarring in production.

30. **`modal-xl` (960px) has no tablet treatment at 768px viewport**: At 768px, `modal-xl` collapses to `calc(100vw - 32px)` = 736px. Content designed for 960px is compressed into 736px with no layout adjustment. Side-by-side form fields inside `modal-xl` will overflow or stack without a tablet-specific breakpoint.

---

## Pages that look production-ready

- **employees.html** — Three-view toggle (card/list/org), mobile-cards fallback on all data tables, profile slide panel, and well-structured filter system. The strongest mobile handling of any page in the product.
- **approvals.html** — The action-row pattern is information-dense and clever. Bulk action bar handles mobile positioning with the bottom nav correctly. Empty and all-caught-up states are polished.
- **account.html** — Clean settings tab structure, form-row grid with correct mobile collapse, session management table with proper overflow handling.
- **leaves.html (month view only)** — Leave balance cards with type-coded accents, progress bars, and the request submission flow are cohesive with the design system.

---

## Overall design system consistency verdict

The token layer in `_tokens.css` is the standout strength: the Earth/Sage palette is distinctive and internally consistent, the 4px spacing grid is disciplined throughout, the semantic color set is thorough, and the shadow ramp is well-calibrated for dark mode. The component library handles most desktop interactions correctly. Where the system breaks down is the enforcement gap between having design tokens and actually using them. Page-level style blocks freely shadow system classes, introduce one-off component names such as `filter-bar-approvals`, `kanban-stage-tabs`, `ts-status-bar`, and `heatmap-grid`, and reach for hardcoded pixel values when tokens exist. There is no mechanism preventing this drift, and the proliferation of per-page micro-fixes in `_layout.css` is the consequence.

The responsive story is the most damaging issue for the €50/user price point. The FIX-N/CRIT-N/HIGH-N/MED-N comment trail in `_layout.css` documents a desktop-built product being retrofitted for mobile rather than designed mobile-first. The attribute selector targeting inline style strings for `min-width` values is the clearest signal: the stylesheet is trying to override HTML it cannot control. Until inline-style proliferation in HTML files is replaced with utility or component classes governed by the shared system, mobile stability will remain brittle. The product is 65% of the way to €50/seat readiness. The token system, component library, and primary desktop UX are there. The mobile layer needs a structural pass, not more targeted patches.
