# GammaHR Quantum v2 -- Phase 2 Brutal UX/UI Audit

**Auditor perspective:** Senior UX/UI Designer (Linear/Figma caliber)
**Date:** 2026-04-05
**Files reviewed:** 3 CSS files, 15 HTML pages, 1 design system spec -- all read in full

---

## Executive Summary

GammaHR Quantum v2 is a prototype that demonstrates solid *ambition* but falls short of *execution* at nearly every level that separates a premium product from a competent one. The design system specification is genuinely excellent -- it reads like something from a company that has shipped world-class dark-mode products. The token file faithfully implements it. And then every HTML page proceeds to circumvent, duplicate, or ignore the system in dozens of small ways that compound into a product that feels inconsistent, unfinished, and nowhere near screenshot-ready.

The core problems:

1. **1,089 inline style attributes** across 15 HTML pages. This is not a design system. This is a styled prototype wearing a design system as a costume.
2. **Zero HTML tables use the `mobile-cards` class.** The CSS defines a thorough mobile table-to-card system. No page connects to it. Every table horizontal-scrolls on mobile.
3. **68 badges use `badge-dot` (CSS-generated dot) instead of semantic SVG icons.** The spec explicitly requires icons on all badges. This is a systemic violation.
4. **Filter bars are implemented 4+ different ways.** A standardized `.filter-bar-standard` class exists in `_layout.css`. Zero pages use it. Each page re-implements its own `.filter-bar` in page-specific `<style>` blocks.
5. **No breadcrumbs anywhere.** The CSS defines a `.breadcrumbs` component. No page uses it.
6. **No skeleton/shimmer loading states in any HTML.** The CSS defines `.skeleton` classes. No page uses them.
7. **No mini profile hover cards.** The spec implies them; nothing exists.

If this prototype were submitted to a design review at Linear, it would be sent back as "foundations good, integration failing."

---

## Page-by-Page Beauty Ratings

### 1. Dashboard (index.html) -- 7/10

**What works:** The greeting + KPI cards + two-column layout is solid structural design. Sparkline SVGs on stat cards are genuinely nice -- gradient fills with area plots. The "Week at a Glance" hero card gives immediate context. Revenue bars and donut chart in the right column add visual richness.

**What fails:**
- **CRITICAL: The "Week at a Glance" card is built entirely from inline styles.** Lines 545-600 contain a 5-column grid where every single element -- day labels, progress bars, summary row -- is styled inline. This is roughly 55 inline style declarations in one card. A change to the design means editing raw HTML, not CSS.
- **CRITICAL: The "Recent Activity" feed is 100% inline-styled.** Lines 1001-1058 contain 5 activity rows, each assembled from inline `display:flex`, `font-size`, `color`, `gap` etc. No reusable component class.
- **HIGH: 194 total inline style attributes on this page alone.** The dashboard -- the page every user sees first -- has the worst CSS hygiene.
- **MEDIUM: The KPI grid uses a custom `.kpi-grid` class** defined in page `<style>` rather than the system `.grid-6` from `_layout.css`. This creates a parallel grid system.
- **MEDIUM: No loading state.** When this dashboard loads, there is no skeleton shimmer. KPI cards either exist or they do not.
- **LOW: Team Availability table links all point to `employees.html` generically** -- not to specific employee profiles. This is a dead-end click path.

**Visual hierarchy:** The greeting draws the eye first (correct). KPI cards scan well as a row. But the two-column layout below is visually dense with no clear entry point -- the eye bounces between "Team Availability" (a table) and "Live Presence" (a list). A more opinionated hierarchy would make one of these visually dominant.

### 2. Employees / Team Directory (employees.html) -- 7/10

**What works:** Card view and list view toggle is a good pattern. Employee cards are well-structured with avatar, name, role, utilization bar, and project tags. The profile detail view (activated via JS) is comprehensive with timeline, projects tab, leave tab, expenses tab. The hero profile section with large avatar and meta items is visually strong.

**What fails:**
- **HIGH: 135 inline styles.** The profile view especially relies on inline styling.
- **HIGH: Filter bar is page-specific CSS** (`.filter-bar` defined in `<style>` block). Different from every other page's filter bar. This one uses `background: var(--color-surface-0)` with no border and no wrapping card, while expenses.html wraps its filter bar in a bordered card.
- **HIGH: Badge-dot usage.** 24 badges use `badge-dot` (CSS dot) instead of SVG icons. "Online", "Offline", "Away", "On Leave" statuses all violate the spec requirement for icon + color.
- **MEDIUM: Utilization bars are capped at 100%.** The spec mentions showing overwork (>110%). The `utilization-fill` width is set inline, and the employee "Sarah Chen" on the dashboard shows 95% util with red color, but the employee card view shows her at 87% green. Data inconsistency between pages.
- **LOW: Employee card hover lifts are fine but there are no hover-to-preview cards** (profile hover cards that the spec implies for "EmployeeLink" components).

**Visual hierarchy:** Card view works well. List/table view is functional but generic. Profile view has good hierarchy with the hero section dominating.

### 3. Gantt Chart (gantt.html) -- 6/10

**What works:** The structural layout -- sticky left panel with employees, scrollable right timeline with day columns -- is correct. Legend is clear. Tooltip markup exists. The bar types (billable, non-billable, leave, bench) are visually distinct with border-left + pattern backgrounds.

**What fails:**
- **CRITICAL: 63 inline style attributes.** This is the Gantt chart. The bars themselves use `grid-column` positioning via inline style (which is somewhat unavoidable for dynamic positioning), but many other elements are unnecessarily inline-styled.
- **CRITICAL: Hardcoded HSL values in the page CSS.** `.gantt-day-header.weekend` uses `background: hsla(35, 10%, 8%, 0.6)` -- this should be a token. `.gantt-timeline-row:hover` uses `background: hsla(35, 10%, 11%, 0.4)`. `.gantt-bar-billable` uses `background: hsla(155, 26%, 46%, 0.3)`. The `.gantt-bar-leave` and `.gantt-bar-bench` classes use hardcoded `hsla()` in `background-image` repeating-linear-gradients. These are all "close enough" to token values but are manually calculated opacity variants, not actual token references.
- **HIGH: Filter panel is a unique `.filter-panel` component** with collapsible header, filter rows, and filter groups -- completely different from every other page's filter approach. This is filter implementation #3 (alongside employees' bare `.filter-bar` and expenses' card-wrapped `.filter-bar`).
- **HIGH: No mobile story at all.** A 30-column fixed-width grid (30 x 40px = 1200px minimum) cannot work on mobile. There is no responsive fallback. The page will be unusable below 1200px viewport width.
- **MEDIUM: Font size `9px` used for day-name labels** (line 348: `font-size: 9px;`). This is below the `--text-overline` token (11px / 0.6875rem) and is not part of the type scale. WCAG compliance concern.

**Visual hierarchy:** The employee panel draws the eye (bright sage-colored names), which is correct. But the timeline grid is dense and the bars, while visually differentiated, do not clearly communicate "what should I be looking at?" A today-marker exists but competes with the overall density.

### 4. Expenses (expenses.html) -- 7/10

**What works:** Expense items as horizontal cards (icon + amount + details + status + actions) is a strong pattern. The AI receipt scanning flow (upload -> spinner -> extracted data) is well thought out with clear visual states. Policy checks section with green checkmarks is satisfying.

**What fails:**
- **HIGH: 53 inline styles.** The notification panel items use inline-styled SVG colors.
- **HIGH: The toggle switch for "My expenses only" is custom-built in page CSS** (`.toggle-switch` class with `.active` state). There is already a `.toggle` component in `_components.css`. This is a duplicate implementation with different dimensions (36x20 page vs 40x22 component).
- **HIGH: Filter bar is implementation #4** -- wrapped in a card with padding and background, but uses its own `.filter-bar` class with different properties than other pages.
- **MEDIUM: The `.billable-tag` component is defined page-locally** when it should be a badge variant. It uses `padding: 2px var(--space-2)` and `border-radius: var(--radius-sm)` -- different from the badge's `border-radius: var(--radius-full)`.
- **MEDIUM: `#fff` fallback in toggle switch CSS:** `background: var(--color-white, #fff)` on line 58. This is a hardcoded fallback.

**Visual hierarchy:** Good. The amount is visually prominent (heading-2 size, mono font, bold). Status badges are readable. The upload zone draws attention appropriately.

### 5. Timesheets (timesheets.html) -- 8/10

**What works:** This is the strongest page. The weekly timesheet grid is a proper spreadsheet-like experience with clear column headers (Mon-Sun), project rows, totals row, target row, and status indicators. The inline cell editing pattern (click to input) is well-defined. The progress bar in the status bar gives immediate weekly completion context. The week navigation with prev/next is standard and correct.

**What fails:**
- **HIGH: 29 inline styles** (lowest count of any content page, which is good relatively).
- **MEDIUM: No mobile story.** The timesheet grid is a fixed-layout table. Below 1024px it will horizontal-scroll. The mobile-cards transformation does not apply because the table lacks the `mobile-cards` class (and a timesheet grid genuinely needs special mobile treatment -- not just card conversion).
- **MEDIUM: The `ts-add-row` uses `!important` overrides** (lines 199, 202, 206). Three `!important` declarations for styling a button row is a specificity smell.
- **LOW: The timesheet grid `table-layout: fixed` with `col` elements for column widths** is good practice, but the day columns use `width: auto` which means they may compress unevenly.

**Visual hierarchy:** Excellent. The progress bar at top gives immediate context. The grid is scannable. Color coding for weekends (subtle background) and under-target days (warning muted) works well.

### 6. Leaves (leaves.html) -- 7/10

**What works:** Leave balance cards with colored top-borders per type (annual=blue, sick=purple, personal=terracotta, WFH=teal) are visually distinctive. The usage bars within balance cards communicate remaining days well. Leave request cards with type-colored icons are clear.

**What fails:**
- **CRITICAL: Hardcoded HSL values.** `hsl(270, 45%, 58%)` appears 5 times for "sick" leave type, and `hsl(175, 35%, 45%)` appears 5 times for "WFH" type. These are defined as "chart-5" in the token file (`--color-chart-5: hsl(270, 45%, 58%)`) but the leaves page does not reference the token. It hardcodes the raw value. Similarly, `hsl(175, 35%, 45%)` is not even in the token system at all -- it is an off-palette color.
- **HIGH: 45 inline styles.**
- **HIGH: The heatmap calendar is an ambitious visualization** but with 31 columns per row, it is unreadable at any viewport below ~1200px. Cells become sub-pixel width. No responsive fallback.
- **HIGH: Filter bar implementation #5** -- no background card, no padding, just a bare flex row.
- **MEDIUM: `hsla(270, 45%, 58%, 0.15)` and `hsla(175, 35%, 45%, 0.15)` used for icon backgrounds** in `.leave-request-icon.sick` and `.leave-request-icon.wfh`. These should be token-derived muted variants.

**Visual hierarchy:** Balance cards dominate (correct). Request list is secondary. The heatmap, while conceptually interesting, is too small to actually read.

### 7. Projects (projects.html) -- 7/10

**What works:** Kanban board with three columns (Planning, Active, Completed) is the right default view. Project cards are information-dense but readable: name, client, meta items (team size, dates), budget progress bar, and avatar group. The detail view with tabbed content (Overview, Budget, Team, Timeline) is comprehensive.

**What fails:**
- **CRITICAL: 117 inline style attributes.** The project detail view is the primary offender.
- **HIGH: The `.view-toggle` button group is redefined in page CSS** when a similar component exists elsewhere (employees.html also defines `.view-toggle`). These are independent implementations that happen to look similar but are not shared.
- **HIGH: Progress bars capped at 100%.** Budget usage bars use `progress-bar-fill` with percentage widths, but there is no visual treatment for over-budget projects. A project at 115% budget should show overflow.
- **MEDIUM: Filter bar is implementation #6** -- yet another page-specific `.filter-bar`.
- **MEDIUM: 53 badges on this page, many without icons.** Project status badges like "Active", "Planning", "Completed" use `badge-dot` when the spec requires SVG icons.

**Visual hierarchy:** Kanban view works well -- columns create clear sections. Detail view is thorough but the tabbed content section lacks visual hierarchy within each tab.

### 8. Clients (clients.html) -- 7/10

**What works:** Client list cards with logo placeholder, meta items, and revenue amount are well-structured. The detail view with contact cards, revenue chart, team members, and documents is comprehensive.

**What fails:**
- **HIGH: 76 inline styles.** The detail view header, stat cards, and notification panel all use inline styling.
- **HIGH: Revenue chart (bar chart) is duplicated from the dashboard.** The `.revenue-bars`, `.revenue-bar-col`, `.revenue-bar`, `.revenue-label`, `.revenue-value` classes are defined again in page-specific CSS. This is copy-paste component duplication.
- **HIGH: Client logo backgrounds use hardcoded gradient strings** in inline styles (confirmed by 30 badge-related matches plus additional inline color specs).
- **MEDIUM: Filter bar implementation #7.**
- **LOW: The notes textarea uses a page-specific `.notes-area` class** that duplicates `.form-textarea` from the component library with minor differences (min-height: 100px vs 80px).

**Visual hierarchy:** Client list is clean. Detail view has too many equal-weight sections competing for attention. The revenue number should be more visually prominent in the detail header.

### 9. Invoices (invoices.html) -- 7/10

**What works:** Invoice list with status badges, amount, and date is clear. The detail view with status timeline (Created -> Sent -> Viewed -> Paid) is an excellent pattern. Line items table with totals section is well-formatted. The grand total in gold color for financial emphasis is correct semantic color usage.

**What fails:**
- **HIGH: 40 inline styles.**
- **HIGH: The status timeline in the detail view** (`.status-timeline`, `.timeline-step`, `.timeline-dot`, `.timeline-line`) is a page-specific component that should be generalized. The leaves page has a different timeline implementation, and the employees page has yet another.
- **MEDIUM: The "Generate Invoice" modal preview section** uses page-specific CSS for a pattern that could be a reusable "key-value list" component.
- **LOW: Filter bar implementation #8.**

**Visual hierarchy:** Good. Invoice number and amount dominate the detail view correctly. The status timeline provides clear progression context.

### 10. Approvals (approvals.html) -- 8/10

**What works:** This is one of the better pages. Approval cards with type icons (timesheet=blue, leave=green, expense=gold), employee info, details, and approve/reject actions are well-structured. The urgent section with red left-border accent is a clear visual priority signal. The bulk action bar (floating bottom bar when items are checked) is a premium interaction pattern.

**What fails:**
- **HIGH: 91 inline styles.** The notification panel is the main offender.
- **HIGH: `.card-body` class is redefined in page CSS** (line 86: `.card-body { flex: 1; min-width: 0; }`) -- this overrides the global `.card-body` from `_components.css` which has `padding: var(--space-4)`. This means any card body on the approvals page loses its padding.
- **MEDIUM: No inline loading indicator** for the approve/reject action. When you click "Approve", there should be a button loading state (the `btn-loading` class exists but is not used).
- **MEDIUM: The `.warning-tag` is a page-specific component** that duplicates badge functionality.

**Visual hierarchy:** Strong. The urgent section draws the eye (red accent). The tabbed navigation (Timesheets/Leaves/Expenses tabs) segments content clearly. Approve/reject buttons are visually prominent.

### 11. Insights (insights.html) -- 7/10

**What works:** The natural language query bar with sparkle icon is a premium feature. Query chips for suggested questions are a good onboarding pattern. The AI response card with left-border accent is distinctive. Insight cards with severity icons (high=red, medium=amber, low=blue, positive=green) are well-differentiated.

**What fails:**
- **HIGH: 46 inline styles.**
- **HIGH: SVG charts are decorative rather than functional.** The line charts and bar charts are hardcoded SVG with static data. They have no axis labels, no gridlines, and no interactive tooltips beyond basic CSS hover. The spec requires "Gridlines: Subtle, dashed, low opacity (0.1)" and "Tooltips: Glass morphism, compact, with icon + label + value." None of this exists.
- **HIGH: The utilization table redefines `.util-bar-wrap`, `.util-bar`, `.util-bar-fill`, `.util-pct`** in page CSS. These exact same classes are already defined on the dashboard page. Neither page shares them through a common stylesheet.
- **MEDIUM: No "typing" or "thinking" animation for the AI response.** When a query is submitted, the response should have a progressive reveal, not an instant appearance.

**Visual hierarchy:** The query bar is visually dominant (correct for an insights page). Insight cards below have good information hierarchy. Charts are secondary but need polish.

### 12. Planning (planning.html) -- 6/10

**What works:** Capacity cards showing total hours, allocated, and gap (surplus/warning/deficit) are useful. The skills matrix table is information-dense. The scenario modeling section (what-if analysis) with loading state is ambitious.

**What fails:**
- **CRITICAL: 49 inline styles.**
- **HIGH: The "scenario loading" spinner** is defined in page CSS (`.scenario-loading .spinner`) when `_components.css` already defines `@keyframes spin` and the `.btn-loading::after` spinner. Another duplicate.
- **HIGH: Multiple page-specific component classes** (`.capacity-card`, `.capacity-gap`, `.bench-item`, `.hiring-item`, `.ai-rec`, `.forecast-section`, `.scenario-stat`, `.impact-section`) that are unique to this page. This is not inherently wrong, but the styling patterns within them (flex layouts, spacing, typography) are not using utility classes consistently.
- **MEDIUM: The capacity cards use a `.capacity-grid` with `repeat(3, 1fr)` in page CSS** rather than the `.grid-3` utility class from `_layout.css`.
- **LOW: `@keyframes fadeSlideIn` is defined here AND on insights.html.** Duplicate keyframe definitions.

**Visual hierarchy:** The page tries to show too many things at once. Capacity cards, bench forecast, skills matrix, scenario modeling, and hiring pipeline all compete. There is no clear information hierarchy or progressive disclosure.

### 13. Admin (admin.html) -- 6/10

**What works:** Tabbed settings (Company, Leave Policies, Holidays, Users, Audit Log) is the correct pattern for admin. Form fields use the design system properly (`.form-group`, `.form-label`, `.form-input`). The audit log table is a useful feature.

**What fails:**
- **HIGH: 79 inline styles.** The notification panel and various section headers use inline styling.
- **HIGH: 39 badges use `badge-dot` without SVG icons.** Status badges in the users table ("Active", "Inactive"), action badges in the audit log ("created", "updated", "deleted", "approved") -- nearly all badges on this page lack icons.
- **HIGH: The `.settings-grid` uses `repeat(2, 1fr)` in page CSS** rather than `.grid-2`.
- **MEDIUM: Color dots for leave types use a page-specific `.color-dot` class** that is essentially just a colored circle. This should reference the same color system as the leaves page, but uses different styling.

**Visual hierarchy:** The tabbed layout provides structure, but within each tab the content is a flat list of form fields with no visual grouping beyond section titles. Settings pages at Linear/Figma use card-based grouping within sections.

### 14. Auth (auth.html) -- 8/10

**What works:** The login card is clean and centered. The floating logo animation is a nice premium touch. Password strength meter, MFA section, forgot password flow, and reset confirmation are all present. The QR code for authenticator setup (in the set-password view) shows attention to the full auth flow.

**What fails:**
- **HIGH: 20 inline styles** (much lower than content pages, which is expected for a simpler page).
- **HIGH: Hardcoded `#000` fills in the QR code SVG** (lines 322-339). These should use `var(--color-text-1)` or at minimum `currentColor` for theme compatibility.
- **HIGH: Hardcoded `#666` fill** in QR code text label (line 340).
- **MEDIUM: The `password` field has a pre-filled value** (`value="password123"`). This is a prototype convenience but creates a security concern if deployed.
- **LOW: The shake animation on error is good but should also have `aria-live="assertive"` on the error message for screen readers.** Currently, the error message is `display: none` / `display: block` toggled, which some screen readers may miss.

**Visual hierarchy:** Clean. The logo and form are the clear focus. The "or" divider separating password login from SSO/passkey options is standard and correct.

### 15. Client Portal (portal/index.html) -- 7/10

**What works:** A dedicated client-facing portal is a differentiating feature. The simplified navigation (Dashboard, Projects, Timesheets, Invoices, Documents) is appropriate for external users. Milestone trackers on projects with completed/active/pending dots and connecting lines are visually clear.

**What fails:**
- **HIGH: 49 inline styles.** Portal header user info, section headings, and various elements use inline styling.
- **HIGH: The portal reuses the internal app's token/component CSS** but adds its own shell (`.portal-app`, `.portal-header`, `.portal-nav`). This means the portal inherits all the visual weight of the internal app when a lighter treatment might be more appropriate for external users.
- **MEDIUM: No empty states in the portal.** If a client has no invoices or documents, what do they see?
- **LOW: The "Powered by GammaHR" branding text has no link.** A marketing link here would be a growth vector.

**Visual hierarchy:** Good for a simpler page. The section tabs clearly segment content. Project cards are dominant.

---

## Design System Violations

### Badges Missing Icons (Spec: "All badges include semantic icons")

| Page | Violation Count | Examples |
|------|----------------|---------|
| employees.html | 24 | "Online" (badge-dot), "Offline" (badge-dot), "Away" (badge-dot), "On Leave" (badge-dot) |
| admin.html | ~39 | "Active" (badge-dot), "Inactive" (badge-dot), action badges in audit log |
| planning.html | 3 | "High" priority (badge-dot), "Medium" (badge-dot), "Low" (badge-dot) |
| gantt.html | 1 | utilization summary badge |
| index.html | 1 | "6 online" presence count (badge-dot) |
| **Total** | **~68** | All should have SVG icons per spec |

The `badge-dot` class uses a CSS `::before` pseudo-element to create a 6px colored circle. The spec requires an actual SVG icon (check-circle for success, alert-triangle for warning, etc.) as the semantic indicator, because "color is never the sole indicator" (accessibility requirement).

### Color Violations (Off-palette values)

| File | Violation | Correct Token |
|------|-----------|---------------|
| leaves.html | `hsl(175, 35%, 45%)` (5 uses) | Not in palette -- needs a new token or use `--color-chart-1` |
| leaves.html | `hsl(270, 45%, 58%)` (5 uses) | Should reference `--color-chart-5` |
| leaves.html | `hsla(270, 45%, 58%, 0.15)` (2 uses) | Needs a `--color-chart-5-muted` token |
| leaves.html | `hsla(175, 35%, 45%, 0.15)` (2 uses) | Not in palette |
| gantt.html | `hsla(35, 10%, 8%, 0.6)` weekend bg | Should be a token |
| gantt.html | `hsla(35, 10%, 11%, 0.4)` row hover | Should be a token |
| gantt.html | `hsla(155, 26%, 46%, 0.3)` billable bar | Should be `--color-primary-muted` (but different opacity) |
| gantt.html | `hsla(200, 40%, 52%, 0.08)` leave pattern | Needs token |
| gantt.html | `hsla(38, 65%, 50%, 0.08)` bench pattern | Needs token |
| gantt.html | `font-size: 9px` on day-name labels | Below minimum type scale (`--text-overline` = 11px) |
| auth.html | `fill="#000"` in QR code SVG (18 uses) | Should be `var(--color-text-1)` or `currentColor` |
| auth.html | `fill="#666"` in QR text label | Should be `var(--color-text-3)` |
| expenses.html | `#fff` fallback in toggle switch | Token already defines `--color-white: #fff` |
| portal/auth.html | `color: #fff` | Should use `--color-white` |
| _tokens.css | `--color-white: #fff` | Spec does not define a `--color-white` token; should be `--color-text-inv` for on-color text |
| _tokens.css | `--color-text-on-primary: #fff` | Raw hex value -- should reference `--color-white` or be defined as `hsl(0, 0%, 100%)` for consistency |
| _components.css | `rgba(255,255,255,0.3)` in `.btn-loading::after` | Should use token |

### Missing Components (Spec defined, not used)

| Component | CSS Status | HTML Usage |
|-----------|-----------|------------|
| Breadcrumbs (`.breadcrumbs`) | Defined in `_components.css` lines 1236-1246 | **Zero pages use it** |
| Skeleton loading (`.skeleton`, `.skeleton-text`, `.skeleton-title`, `.skeleton-avatar`, `.skeleton-card`) | Defined in `_components.css` lines 1082-1099 | **Zero pages use it** |
| Standardized filter bar (`.filter-bar-standard`) | Defined in `_layout.css` lines 675-727 | **Zero pages use it** |
| Mobile table-to-card (`.data-table.mobile-cards`) | Defined in `_layout.css` lines 591-632 | **Zero HTML tables use it** |
| Slide panel (`.slide-panel`, `.slide-panel-backdrop`) | Defined in `_components.css` lines 1130-1156 | **Zero pages use it** |
| Mini profile hover card | Spec implies it for "EmployeeLink" | **Not defined in CSS. Not in HTML.** |

### Filter Bar Fragmentation

The `_layout.css` file defines `.filter-bar-standard` (line 675) as the canonical filter bar with:
- Card wrapper with background, border, border-radius
- Integrated search input with icon
- `.form-select` dropdowns
- Mobile responsive breakpoint

Instead, the following pages each define their own `.filter-bar` in page `<style>` blocks:

| Page | Filter Implementation | Differences from Standard |
|------|----------------------|--------------------------|
| employees.html | Bare flex row, no background card | No border, no border-radius, no background |
| expenses.html | Card-wrapped with padding, toggle switch | Includes custom toggle, different padding |
| leaves.html | Bare flex row, selects and inputs | No search input, no background |
| projects.html | Bare flex row, selects only | No search, no background |
| clients.html | Flex row with search wrapper | Background: surface-0, different than standard's surface-0 |
| invoices.html | Flex row, selects and inputs | Height: 36px (vs standard's 36px -- actually same) |
| approvals.html | Bare flex row with labels | Labels on filters (unique) |
| admin.html | `.audit-filters` class | Completely separate class name |
| gantt.html | `.filter-panel` collapsible | Entirely different pattern (collapsible accordion) |

This is 9 different filter implementations. The standard one exists and is unused.

---

## CSS Architecture Issues

### Inline Style Severity

| Page | Inline `style=""` Count | Severity |
|------|------------------------|----------|
| index.html | 194 | CRITICAL |
| employees.html | 135 | CRITICAL |
| projects.html | 117 | CRITICAL |
| approvals.html | 91 | HIGH |
| admin.html | 79 | HIGH |
| clients.html | 76 | HIGH |
| gantt.html | 63 | HIGH |
| expenses.html | 53 | HIGH |
| portal/index.html | 49 | HIGH |
| planning.html | 49 | HIGH |
| insights.html | 46 | HIGH |
| leaves.html | 45 | HIGH |
| invoices.html | 40 | HIGH |
| timesheets.html | 29 | MEDIUM |
| auth.html | 20 | MEDIUM |
| **TOTAL** | **~1,089** | **CRITICAL** |

Common inline patterns that should be classes:
- `style="position: relative;"` -- used on notification button wrappers on every page
- `style="font-weight: var(--weight-semibold); font-size: var(--text-body);"` -- notification panel header on every page
- `style="color: var(--color-warning);"` on SVG icons in notification items
- `style="display:flex;align-items:center;gap:var(--space-2);"` -- repeated dozens of times
- `style="font-size:var(--text-body-sm);color:var(--color-text-1);"` -- activity feed items
- `style="margin-bottom: var(--space-6);"` -- used when `.mb-6` utility class exists

### Duplicated Component Definitions

| Component | Defined In | Also Defined In |
|-----------|-----------|-----------------|
| `.filter-bar` | 9 different page `<style>` blocks | Different in each |
| `.view-toggle` / `.view-toggle-btn` | employees.html `<style>` | projects.html `<style>` (different styling) |
| `.revenue-bars` / `.revenue-bar-col` | index.html `<style>` | clients.html `<style>` (copy-paste) |
| `.util-bar-wrap` / `.util-bar` / `.util-bar-fill` | index.html `<style>` | insights.html `<style>` (copy-paste) |
| `.toggle-switch` | expenses.html `<style>` | Conflicts with `_components.css` `.toggle` |
| `.back-btn` / `.back-link` / `.profile-back` | clients.html, projects.html, employees.html | Three different implementations of "go back" |
| `.empty-state` | `_components.css` | Overridden in approvals.html, admin.html `<style>` |
| `@keyframes fadeSlideIn` | insights.html `<style>` | planning.html `<style>` (identical duplicate) |
| `@keyframes spin` | `_components.css` | planning.html `<style>` (identical duplicate) |

### Specificity Issues

- `!important` used in timesheets.html (3 occurrences: lines 199, 202, 206)
- `!important` used in `_layout.css` mobile modal override (line 637-642: 6 occurrences)
- `!important` used in `_tokens.css` reduced-motion override (line 222-225: 3 occurrences -- justified for accessibility)
- `!important` used in `_components.css` `.btn-loading` (line 92: `color: transparent !important;`)

### Missing CSS Token Usage

Token defined but never referenced in page CSS:
- `--motion-instant: 0ms` -- never used
- `--motion-gentle: 500ms` -- used only in `_layout.css` for the Gantt filter panel (indirectly via `--ease-gentle`)
- `--space-0-5: 2px` -- used only in `_tokens.css` definition
- `--space-16: 64px` -- used only in empty state padding
- `--space-20: 80px` -- never used
- `--radius-2xl: 24px` -- never used
- `--radius-none: 0px` -- never used
- `--shadow-0: none` -- never used (cards always start at shadow-1)
- `--glass-bg`, `--glass-border`, `--glass-blur` -- used only in top header and command palette, never on cards or modals as spec implies

---

## Chart/Graph Quality Audit

### Dashboard Charts

| Chart | Type | Quality | Issues |
|-------|------|---------|--------|
| KPI sparklines (6) | SVG polyline + polygon fill | Decorative | No axis, no labels, no tooltip, no interactivity. These are visual sugar, not data viz. |
| Revenue bars | HTML div bars | Functional | 6-month bars with labels and values. Hover state changes color. But no Y-axis, no gridlines. |
| Donut chart | SVG circles | Functional | Legend with values. Hover increases stroke-width. Decent. |
| Mini Gantt | HTML grid cells | Functional | Shows weekly allocation. Color-coded with legend. Simple but effective. |

### Insights Page Charts

| Chart | Type | Quality | Issues |
|-------|------|---------|--------|
| Revenue Trend line chart | SVG polyline | **Inadequate** | No Y-axis labels, no X-axis labels, no gridlines, no tooltip. Hardcoded data points. Barely qualifies as a chart. |
| Billable vs Non-billable bar chart | SVG rects | **Inadequate** | Same issues. No axis context means the viewer cannot interpret absolute values. |
| Expense by Category donut | SVG circles | Functional | Has legend. Better than line/bar charts. |
| Utilization by Department bars | SVG rects | **Inadequate** | No axis labels. |

### Planning Page Charts

| Chart | Location | Quality | Issues |
|-------|----------|---------|--------|
| Capacity vs Demand bar chart | Capacity section | **Inadequate** | SVG bars with no axis labels. Cannot determine scale. |

**Overall chart assessment:** The charts fail to meet the spec requirement for "Gridlines: Subtle, dashed, low opacity (0.1)" and "Axis labels: caption size, text-tertiary color." None of the SVG charts have gridlines. None have proper axis labels. None have interactive tooltips meeting the spec ("Glass morphism, compact, with icon + label + value"). The insights page defines a `.chart-tooltip` in CSS but it requires JavaScript to position and is not connected to any chart element.

---

## Spacing Rhythm Analysis

### Consistent Patterns (Good)
- Card padding: consistently `var(--space-4)` (16px) via `.card-body`
- Card headers: consistently `var(--space-4)` padding with border-bottom
- Page content: consistently `var(--space-6)` (24px) padding via `.page-content`
- Section gaps: generally `var(--space-6)` (24px) via `.mb-6` or `gap-6`

### Inconsistent Patterns (Bad)
- **Card body padding-top removal:** Multiple pages use `style="padding-top:0;"` on `.card-body` to remove top padding when the card has no header. This should be a `.card-body-flush` modifier class.
- **Margin-bottom on page headers:** `.page-header` uses `margin-bottom: var(--space-6)` in the layout CSS. But many pages add additional margin via inline styles.
- **Notification panel margins:** Inline `style="margin-top: 2px;"` appears on notification icons across every page. This should be built into the `.notif-icon` class.
- **The dashboard "Week at a Glance" card** uses `margin-bottom: var(--space-6)` inline instead of `.mb-6` utility class.

---

## Typography Hierarchy Analysis

### What Works
- Headings use `--weight-semibold` (600) consistently
- Display titles use `--weight-bold` (700) consistently
- Body text defaults to `--weight-regular` (400)
- Mono font used correctly for numbers, currency, codes
- Caption/overline sizing used for labels and metadata
- Stat card values at `--text-heading-1` with mono font is a strong pattern

### What Fails
- **Gantt page uses `font-size: 9px`** (below minimum `--text-overline` of 11px). [MEDIUM]
- **Gantt bar labels use `font-size: 11px`** which happens to match `--text-overline` but is hardcoded as a pixel value instead of referencing the token. [LOW]
- **The `badge` component uses `--text-caption` (12px)** which makes badge text quite small, especially when combined with 12px SVG icons. At 12px, the badge text can be hard to read for users with moderate vision impairment. [MEDIUM]
- **Notification panel title** is styled inline as `font-weight: var(--weight-semibold); font-size: var(--text-body);` on every single page. This should be a class. [HIGH -- duplication not typography]

---

## Interactive Feedback Audit

### Button Loading States
- `_components.css` defines `.btn-loading` with spinner animation. **MEDIUM: No HTML page demonstrates this state.** None of the "Approve", "Reject", "Submit", "Save" buttons ever show loading feedback.

### Toast Notifications
- `_components.css` defines `.toast-container`, `.toast`, `.toast-success`, `.toast-error` etc. with enter/exit animations. **HIGH: Only the approvals page and a few others have functional toast triggers.** Most pages' action buttons do not produce any confirmation feedback.

### Hover States
- Card hover lift (translateY -2px + shadow-3): **Working** on all card types.
- Button hover color shifts: **Working** on all button variants.
- Table row hover: **Working** via `.data-table tr:hover td`.
- Gantt bar hover (brightness + scaleY): **Working** and is a premium touch.
- Nav item hover: **Working** via `.nav-item:hover`.

### Missing Interactive Feedback
- **No focus-visible indicators on custom components.** The global `:focus-visible` style exists, but custom toggle switches, filter chips, and view toggle buttons do not have visible focus indicators. [HIGH -- accessibility violation]
- **No confirmation dialogs for destructive actions.** "Reject" buttons on approvals perform the action without asking "Are you sure?" [MEDIUM]
- **No undo mechanism.** After approving a timesheet, there is no "Undo" toast or reversal option. [MEDIUM]

---

## Empty States Audit

| Page | Has Empty State? | Quality |
|------|-----------------|---------|
| index.html | Yes | KPI section replaced with a single card + CTA. Adequate but uses same empty-state component as other pages. |
| employees.html | Yes | Card with icon + title + description + CTA. Good. |
| gantt.html | Yes | Standard empty state. |
| expenses.html | Yes | Standard empty state. |
| timesheets.html | Yes | Standard empty state with "Log Your First Timesheet" CTA. |
| leaves.html | Yes | Standard empty state. |
| projects.html | Yes | Standard empty state. |
| clients.html | Yes | Standard empty state. |
| invoices.html | Yes | Standard empty state. |
| approvals.html | Yes | Standard empty state. |
| insights.html | Yes | Standard empty state. |
| planning.html | Yes | Standard empty state. |
| admin.html | Yes | Standard empty state. |
| auth.html | N/A | Auth forms are always visible. |
| portal/index.html | **No** | No empty state. If a client has no projects or invoices, what appears? |

**Assessment:** Every internal page has an empty state (toggled via `body.show-empty`), which is good. However, **all empty states are visually identical**: same Lucide icon (different per page), same text layout, same CTA button. Linear's empty states use unique illustrations per context. Notion uses subtle animations. GammaHR's empty states are functional but not memorable.

---

## Mobile at 390px Audit

### What the CSS provides:
- Grid collapse: `.grid-2`, `.grid-3`, `.grid-4`, `.grid-6` all go to `1fr` below 640px
- Sidebar: slides off-screen with hamburger trigger
- Bottom navigation: 5-item bar with icons
- Touch targets: minimum 44px height on buttons, inputs, nav items
- Full-screen modals
- Notification panel: full-width minus padding
- Mobile search icon: replaces hidden search bar

### What is missing:
1. **CRITICAL: No table uses `mobile-cards` class.** Every data table (employees list, invoices list, admin users, audit log, project budget tracking, team allocation, client documents, etc.) will horizontal-scroll on mobile. The CSS for table-to-card transformation is written and waiting. Zero tables use it.
2. **CRITICAL: No `<td>` elements have `data-label` attributes** (required for the mobile-cards CSS to show column headers on each card cell).
3. **HIGH: The Gantt chart is a 1200px-wide fixed grid.** Below desktop width it is completely unusable. No responsive fallback exists.
4. **HIGH: The timesheet grid is a fixed-width table.** No mobile treatment.
5. **HIGH: The heatmap calendar (leaves page) has 31 columns.** Unreadable on mobile.
6. **HIGH: The Kanban board (projects page) collapses to single column** at 1023px, which is correct. But project cards within each column maintain full desktop padding and layout.
7. **MEDIUM: No swipe gestures.** The spec describes "Swipe gestures (swipe to approve/reject in lists)." Not implemented.
8. **MEDIUM: No pull-to-refresh.** Spec mentions it. Not implemented.
9. **MEDIUM: No FAB (floating action button).** Spec mentions it for primary action on mobile. Not implemented.

---

## What Linear/Figma Would Do Differently

### 1. Zero Inline Styles (CRITICAL)
Linear ships with a component system where inline styles are a code review blocker. Every layout pattern -- activity feed rows, notification items, stat card internals, weekly grid cells -- would be a named, reusable component class. The 1,089 inline styles would be replaced with ~30-40 new utility/component classes.

### 2. Tokens All the Way Down (HIGH)
Linear's dark mode does not have `hsla(35, 10%, 8%, 0.6)` anywhere in component code. Every opacity variant, every muted color, every hover shade is a named token. The ~30 hardcoded HSL values in the Gantt and Leaves pages would be tokenized as `--color-surface-weekend`, `--color-bar-billable-bg`, `--color-chart-5-muted`, etc.

### 3. Single Source Filter Component (HIGH)
Linear has one filter bar pattern. One. It appears on every list view identically. Dropdowns, search, and active filter chips are consistent everywhere. GammaHR has 9 implementations. This would be designed once, componentized, and reused.

### 4. Chart Library Integration (HIGH)
Linear's charts are built with a dedicated charting library (or a tightly controlled internal one). They have consistent axis styling, gridlines, tooltips, and responsive behavior. GammaHR's hand-rolled SVG charts lack all of these. For a premium product, this is unacceptable. The correct approach: define chart styles as tokens (gridline color, axis label style, tooltip glass morphism) and render all charts through a single system.

### 5. Progressive Loading (MEDIUM)
Figma shows skeleton screens for every panel that loads data. The first time you open a project, you see shimmer placeholders for the canvas, the layers panel, and the properties panel. GammaHR defines skeleton CSS but never uses it. Every page should show skeletons on initial render.

### 6. Breadcrumbs for Context (MEDIUM)
When you navigate Client > Project > Task in Linear, you always know where you are. GammaHR's detail views (Employee profile, Project detail, Client detail, Invoice detail) use "Back" buttons that only go one level. There is no breadcrumb trail showing the navigation path. The `.breadcrumbs` component exists in CSS. Use it.

### 7. Profile Hover Cards (MEDIUM)
In Linear, hovering over a user mention shows a mini profile card with their avatar, name, role, and status. GammaHR links to employee names everywhere but never shows preview information on hover. This would reduce the need to navigate away from the current context.

### 8. Keyboard Shortcuts Everywhere (LOW)
Linear is keyboard-first. Every action has a shortcut. The command palette (Cmd+K) is defined in GammaHR's CSS and HTML, which is good. But individual page actions (A to approve, R to reject, N for new) are not present. The spec mentions "keyboard-first" as a design principle but the prototype does not deliver on it.

### 9. Motion That Communicates (LOW)
Linear's animations are purposeful -- items sliding in from their origin, removed items fading toward where they went. GammaHR's animations are basic (fade-in, slide-down). The `spring physics` presets in the spec (`--spring-snappy`, `--spring-gentle`, `--spring-bouncy`) are defined but never used. The approval item removal animation (`.removing-item { transform: translateX(20px); }`) is a step in the right direction but is the only instance.

---

## Priority-Ranked Issue Summary

### CRITICAL (Ship-Blockers)

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| C1 | 1,089 inline styles across all pages | Unmaintainable, unscalable, kills theming | High (systematic refactor) |
| C2 | Zero tables use `mobile-cards` class | Every data table broken on mobile | Low (add class + data-label attrs) |
| C3 | 68+ badges use `badge-dot` without SVG icons | Accessibility violation (color-only status) | Medium (add SVG to each badge) |
| C4 | 9 different filter bar implementations | Inconsistent UX, maintenance nightmare | Medium (standardize on `filter-bar-standard`) |
| C5 | Charts lack axes, gridlines, tooltips | Data visualization is decorative, not functional | High (chart system overhaul) |
| C6 | Zero breadcrumbs on any page | Users get lost in detail views | Low (add breadcrumbs component) |

### HIGH (Quality Blockers)

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| H1 | Zero skeleton loading states in HTML | No perceived performance optimization | Low (add skeleton markup) |
| H2 | ~30 hardcoded HSL values (Gantt, Leaves) | Design system integrity | Low (tokenize) |
| H3 | Progress bars capped at 100% -- overwork not visualized | Misleading data | Low (CSS overflow treatment) |
| H4 | Component duplication across pages (revenue bars, util bars, back buttons, toggle switches) | Maintenance drift | Medium (extract to `_components.css`) |
| H5 | No button loading states in any HTML | No feedback for async actions | Low (add `btn-loading` to submit buttons) |
| H6 | No profile hover cards | Requires full navigation to see person info | Medium (new component) |
| H7 | No toast confirmations on most actions | No feedback for approve/reject/save | Medium (wire up toast triggers) |
| H8 | Gantt chart unusable below 1200px | Zero mobile Gantt story | High (needs fundamentally different mobile view) |
| H9 | `_components.css` `.card-body` overridden by approvals.html page CSS | Global class pollution | Low (rename page-specific class) |

### MEDIUM (Polish Blockers)

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| M1 | Empty states are visually identical across all pages | Feels template-y, not premium | Medium (unique illustrations) |
| M2 | Gantt uses `font-size: 9px` (below type scale minimum) | Accessibility and consistency | Low (increase to `--text-overline`) |
| M3 | No undo mechanism for destructive actions | User anxiety on irreversible clicks | Medium (undo toast pattern) |
| M4 | No swipe gestures, pull-to-refresh, or FAB on mobile | Spec promises not delivered | High (JS implementation) |
| M5 | Duplicate `@keyframes` definitions across pages | Code smell | Low (move to `_components.css`) |
| M6 | `!important` overrides in timesheets.html | Specificity debt | Low (restructure selectors) |
| M7 | Portal has no empty states | Incomplete for external-facing product | Low (add empty states) |
| M8 | No AI "thinking" animation for insights responses | Feels instant rather than intelligent | Low (CSS animation) |
| M9 | Planning page overloaded -- too many sections with equal visual weight | Cognitive overload | Medium (progressive disclosure) |

---

## Final Verdict

**Overall Score: 6.5 / 10**

The design system specification is a 9/10. The token implementation is an 8/10. The component CSS library is a 7/10. But the pages themselves -- the actual product that users see and touch -- are a 5.5/10 because they systematically bypass the system that was built to make them good.

The most damning finding: there are four CSS features specifically designed to solve known problems (`.filter-bar-standard`, `.mobile-cards`, `.breadcrumbs`, `.skeleton`) that exist in the stylesheets but are used by exactly zero HTML pages. Someone built the tools. Nobody used them.

This prototype is not screenshot-ready for a marketing site. Individual components (stat cards, approval cards, timesheet grid) could be screenshotted in isolation. But full-page screenshots would reveal the inconsistencies, the missing polish, and the inline-style chaos that lives beneath the surface.

The path from 6.5 to 8.5 is primarily a cleanup job, not a redesign. The bones are good. The palette is good. The component CSS is good. The fix is disciplined: eliminate inline styles, use the components that already exist, tokenize the remaining hardcoded values, add icons to badges, and connect the mobile CSS to the HTML that needs it.
