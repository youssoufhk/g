# Cross-Critique 5: Dashboard-Component Intersection

**Cross-Critique Agent:** 5
**Date:** 2026-04-05
**Audits Reviewed:**
1. `AUDIT_DASHBOARD_NAV.md` (Agent 1 -- Dashboard & Navigation Coherence)
2. `AUDIT_COMPONENTS_VISUAL.md` (Agent 5 -- Component Quality & Visual Polish)

**Verified Against:** `index.html`, `_components.css`, `_tokens.css`, `_layout.css`

---

## Blind Spots in AUDIT_DASHBOARD_NAV

### 1. Dashboard Widget Styles Are 100% Inline -- Not in Component Library (SEVERITY: HIGH)

Agent 1 evaluated each dashboard widget for content quality, information hierarchy, and interactivity, but never examined whether the widgets use the shared component system at all. They do not.

Every dashboard-specific widget defines its CSS in the `<style>` block of `index.html` (lines 10-307). The following classes exist ONLY in `index.html` and are absent from `_components.css`:

- `.greeting`, `.greeting-date`
- `.kpi-grid` (grid override for stat cards)
- `.util-bar-wrap`, `.util-bar`, `.util-bar-fill`, `.util-pct`
- `.ai-alert`, `.ai-alert-icon`, `.ai-alert-body`, `.ai-alert-text`, `.ai-alert-actions`
- `.presence-item`, `.presence-info`, `.presence-name`, `.presence-detail`, `.presence-status` (and all status variants)
- `.approval-item`, `.approval-info`, `.approval-title`, `.approval-sub`, `.approval-actions`
- `.mini-gantt`, `.gantt-row`, `.gantt-name`, `.gantt-track`, `.gantt-cell`, `.gantt-day-labels`
- `.revenue-bars`, `.revenue-bar-col`, `.revenue-bar`, `.revenue-label`, `.revenue-value`
- `.donut-section`, `.donut-wrap`, `.donut-legend`, `.donut-legend-item`, `.donut-legend-dot`, `.donut-legend-label`, `.donut-legend-value`
- `.stat-warning-indicator`
- `.status-label`, `.status-dot`
- `.populated-content`, `.empty-content`

This is approximately 40 CSS classes that live only in the dashboard page. Worse, the same patterns are duplicated in other pages: `expenses.html` redefines `.approval-item` with different styles (lines 305-318 -- it adds hover and fading states absent from the dashboard version). `insights.html` redefines `.util-bar-wrap` / `.util-bar` / `.util-bar-fill` (lines 261-274). Each copy diverges slightly.

This is a design-system structural failure that Agent 1 missed entirely because the audit focused on content, not on whether the content was built with shared components.

### 2. The "3 new" Badge on AI Alerts Has No Icon (SEVERITY: MEDIUM)

Line 794 of `index.html`:
```html
<span class="badge badge-accent">3 new</span>
```

Agent 5's visual audit identified 50+ badges across the prototype missing icons per the spec. However, Agent 1's dashboard audit praised the AI Alerts widget (8/10) without noting that its own header badge ("3 new") violates the badge icon spec. Agent 1 did note "no mechanism to mark them as read" but missed the simpler visual spec violation.

### 3. Stat Cards Are Not `card-interactive` (SEVERITY: MEDIUM)

Agent 1 correctly identified that KPI cards are not clickable (section 2.3), but did not trace the root cause. The stat cards use `<div class="stat-card">`, which is a separate component from `.card-interactive`. The `_components.css` defines `.card-interactive` with `cursor: pointer` and hover transform, while `.stat-card` has its own hover (shadow-2 only). Even if a click handler were added, the stat cards would look wrong -- they would not get the full `translateY(-2px) + shadow-3` treatment that `card-interactive` provides. The fix requires either wrapping stat cards in `<a>` tags with `card-interactive` or explicitly adding the behavior to `.stat-card`.

### 4. Presence Count Is 6 Online, Not 8 -- Confirmed Independently (SEVERITY: HIGH)

Agent 1 reported the badge says "8 online" but counted 6. I confirmed this by enumerating the HTML: lines 923, 930, 937, 944, 965, 986 have `presence-status online` (6 total). Lines 951 and 958 are `away`. Line 972 is `on-leave`. Line 979 is `offline`. The badge (line 919) reads "8 online". This is definitively wrong. Agent 1 called it "bad math" but rated the overall Presence panel 7/10. Given this is a data integrity error on the dashboard's most visible social widget, the severity should be HIGH, not rolled into a 7/10 composite.

### 5. Saturday Date on a Workday Dashboard (SEVERITY: LOW)

Line 517 of `index.html`:
```html
<div class="greeting-date">Saturday, April 5, 2026</div>
```

April 5, 2026 is indeed a Sunday (not Saturday). But more importantly, the entire dashboard shows workday context (timesheets, team availability, active projects, "This Week at a Glance" Gantt) while the greeting says it is a weekend day. This creates a logical inconsistency. Neither audit noted this.

Correction: Checking a calendar, April 5, 2026 falls on a Sunday, not Saturday as displayed. The prototype has the wrong day name for the date.

### 6. No ARIA on Dashboard Interactive Widgets (SEVERITY: HIGH)

Agent 1 evaluated tab interactivity (section 2.8) and approve/reject buttons but never assessed accessibility. The only `aria-*` attribute in the entire `index.html` is `aria-label="Notifications"` on the bell button (line 437). The following interactive elements have zero ARIA:

- Tab buttons (`.tab[data-tab]`) -- no `role="tab"`, no `aria-selected`, no `aria-controls`
- Tab content panels -- no `role="tabpanel"`, no `aria-labelledby`
- Notification panel -- no `role="dialog"`, no `aria-label`
- User dropdown -- no `aria-expanded`, no `aria-haspopup`
- Approve/Reject buttons -- no `aria-label` distinguishing which item they act on
- Command palette -- no `role="combobox"`, no `aria-autocomplete`
- Sortable table headers -- no `aria-sort`

Agent 5's visual audit flagged this globally (Section 7), but Agent 1 should have caught it per-widget on the dashboard since the dashboard is the most complex page for keyboard interaction.

### 7. Revenue Bar Chart Height Data Error (SEVERITY: LOW)

Agent 1 noted that the April bar shows a full month value on April 5th (section 2.9). But there is a deeper inconsistency: the bar heights do not map proportionally to the values.

| Month | Value | Height | Expected relative |
|-------|-------|--------|-------------------|
| Nov   | 42k   | 74%    | 82% (of 51k max)  |
| Dec   | 45k   | 79%    | 88%               |
| Jan   | 38k   | 66%    | 75%               |
| Feb   | 51k   | 90%    | 100%              |
| Mar   | 47k   | 82%    | 92%               |
| Apr   | 45k   | 79%    | 88%               |

The heights are roughly proportional but do not exactly match. February at 51k should be the tallest at ~100%, but it is set to 90%. This means there is an invisible "ceiling" above the tallest bar, which is fine for chart design, but the proportions between bars are also slightly off (Nov at 42k gets 74% while Apr at 45k gets 79% -- a 7% spread for 3k difference, vs Jan at 38k with 66% -- a 13% drop for a 7k difference). This distorts the visual impression of revenue trends.

---

## Blind Spots in AUDIT_COMPONENTS_VISUAL

### 1. Dashboard Component Isolation Was Not Called Out (SEVERITY: HIGH)

Agent 5 focused on token adherence, badge compliance, spacing, and cross-page visual consistency. They correctly identified that filter bars are redefined across 6 pages (Section 8). But they never identified that the dashboard -- the most important page -- has its ENTIRE widget set defined in inline `<style>` rather than in `_components.css`.

The dashboard defines ~40 custom CSS classes in its `<style>` block. Many of these are reusable patterns (utilization bars, presence lists, approval items, mini charts) that other pages reduplicate with drift. This is the single largest component-architecture blind spot: the landing page of the app is not built with the component library.

### 2. Dashboard Hardcoded Spacing Values Were Not Inventoried (SEVERITY: MEDIUM)

Agent 5 meticulously documented hardcoded spacing in `_components.css`, `_layout.css`, and page-specific styles for `gantt.html`, `leaves.html`, and `admin.html`. But the dashboard's inline styles were not inventoried. Findings:

| Line | Value | Should Be |
|------|-------|-----------|
| 54   | `min-width: 100px` | Acceptable (content-specific width) |
| 58   | `height: 6px` | Could use `var(--space-1-5)` |
| 72   | `min-width: 32px` | `var(--space-8)` |
| 87   | `margin-top: 2px` | `var(--space-0-5)` |
| 120-121 | `width: 8px; height: 8px` | `var(--space-2)` |
| 148  | `margin-top: 2px` | `var(--space-0-5)` |
| 166  | `width: 100px` | Acceptable (label width) |
| 179  | `height: 20px` | `var(--space-5)` |
| 204  | `height: 120px` | Acceptable (chart height) |
| 255-256 | `width: 10px; height: 10px` | Could tokenize |
| 277  | `padding: 2px var(--space-2)` | `var(--space-0-5) var(--space-2)` |
| 302-303 | `width: 6px; height: 6px` | `var(--space-1-5)` |

The dashboard has at least 10 hardcoded pixel values in its CSS. Not catastrophic, but Agent 5's audit gave the impression that the dashboard was tokenized because they only checked `_components.css` and `_layout.css` for the dashboard.

### 3. Dashboard Badges ARE Mostly Compliant (Missed Positive Finding) (SEVERITY: N/A)

Agent 5 listed 50+ badges without icons across the prototype but did not note that the dashboard is actually one of the better pages for badge compliance. Of the 15 badge instances on the dashboard:

- 8 badges in the Team Availability table all have SVG icons (check-circle, alert-triangle, alert-circle, calendar)
- 3 badges in AI Alerts all have SVG icons (alert-triangle, x-circle)
- 1 "This month" badge on the donut chart has a pie-chart icon
- 1 "8 online" badge uses `badge-dot` (not an icon per spec, but has a visual indicator)
- 1 "3 new" badge on AI Alerts header has NO icon
- 4 nav-badges (7, 2, 3, 12) use the `.nav-badge` pattern which is count-only by design

The dashboard is approximately 80% badge-compliant versus the ~30% average across the prototype. This is relevant context that Agent 5's audit did not surface. The dashboard's one violation ("3 new" without icon) is easy to fix.

### 4. Dashboard SVG Donut Text Uses Inline font-family (SEVERITY: LOW)

Line 1196 of `index.html`:
```html
<text ... font-family="var(--font-mono)" font-size="22" font-weight="700">87%</text>
```

The `font-size="22"` is a hardcoded pixel value (SVG attribute, not CSS property). Agent 5 tracked hardcoded font sizes in CSS but not in SVG attributes. This donut center text also uses `font-weight="700"` as a raw number rather than referencing the token value. SVG attributes cannot use CSS custom properties as easily, so this is partially excusable, but should be noted.

### 5. Dashboard `stat-card:hover` vs `card-interactive:hover` Discrepancy (SEVERITY: MEDIUM)

Agent 5 noted in Section 4 that `stat-card:hover` uses `--shadow-2` while `card-interactive:hover` uses `--shadow-3`, calling it "inconsistent depth on hover for cards at the same elevation level." This is correct. But the dashboard consequences are larger than stated: the dashboard has 6 stat cards and 8 regular `.card` elements. The stat cards hover to `shadow-2`, but the regular cards have NO hover state at all -- they are `.card`, not `.card-interactive`. So the dashboard has two tiers of hover: stat cards (subtle shadow change) and everything else (no hover). This creates a situation where only the non-actionable elements (stat cards without links) visually respond to hover, while the actionable content cards (Team Availability, AI Alerts, etc.) are inert.

---

## Cross-Cutting Issues: Dashboard Component Quality

### A. The Dashboard Is a Component-System Island

The dashboard (`index.html`) correctly uses these shared component classes from `_components.css`:
- `.stat-card`, `.stat-value`, `.stat-label`, `.stat-trend`, `.stat-sparkline` -- stat cards
- `.card`, `.card-header`, `.card-title`, `.card-body`, `.card-footer` -- all widget wrappers
- `.badge`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-info`, `.badge-accent`, `.badge-gold`, `.badge-dot` -- status badges
- `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-secondary`, `.btn-destructive-ghost`, `.btn-xs`, `.btn-md` -- all buttons
- `.data-table`, `.cell-secondary`, `th.sortable`, `.sort-icon` -- team availability table
- `.avatar`, `.avatar-xs`, `.avatar-sm`, `.avatar-status` -- user avatars
- `.tab`, `.tab-count`, `.tab-content` -- approval tabs
- `.nav-item`, `.nav-badge`, `.nav-section`, `.nav-section-label` -- sidebar navigation
- `.dropdown-item`, `.dropdown-divider` -- user dropdown
- `.empty-state`, `.empty-icon`, `.empty-title`, `.empty-desc` -- empty states
- `.cmd-palette-*` -- command palette
- `.toast`, `.toast-*` -- notifications
- `.notif-panel`, `.notif-item`, `.notif-icon` -- notification panel
- `.font-mono` -- monospace utility

The dashboard correctly uses ~50 component classes from the shared CSS. This is good.

However, it ALSO defines ~40 additional classes in its `<style>` block that are NOT shared. Several of these (`.util-bar`, `.approval-item`, `.presence-item`) are reusable patterns that appear in other pages with divergent definitions. The dashboard is therefore a hybrid: well-integrated with the shared system for structural components, but completely bespoke for its widget interiors.

### B. Dashboard Token Adherence Is Above Average

Unlike `gantt.html` (which Agent 5 singled out as the "worst offender" with inline hsl values and `#fff`), the dashboard has ZERO hardcoded color values. Every color reference in `index.html` uses `var(--color-*)` tokens. The inline styles on elements (e.g., `style="background: var(--color-chart-1);"` on gantt cells, `style="color: var(--color-text-2);"` on links, `style="width:95%; background: var(--color-error);"` on utilization bars) all use token references.

This makes the dashboard the best page in the prototype for color token adherence, and significantly better than the prototype average. Neither audit highlighted this.

### C. Dashboard Button Usage Is Consistent and Correct

All buttons on the dashboard use proper `.btn` component classes with appropriate variant and size modifiers:
- Ghost buttons for secondary actions ("View all", "Full Gantt", "Details", "Dismiss", "Mark all read")
- Primary buttons for primary actions ("Approve", empty state CTAs)
- Destructive-ghost buttons for destructive actions ("Reject")
- All use `.btn-xs` for in-widget actions, `.btn-md` for standalone CTAs

No custom button styles are defined in the dashboard's `<style>` block. Button usage is fully component-system compliant.

### D. Dashboard Financial Typography Is Partially Compliant

Agent 5 identified dashboard stat card values as correctly using `class="stat-value font-mono"` and approval amounts wrapped in `<span class="font-mono">`. Confirmed.

However, the following financial figures on the dashboard are NOT in monospace:
- Line 802: "340 hotel" in AI alert text -- plain sans-serif inside `.ai-alert-text`
- Line 472: "12,400" in notification panel -- plain sans-serif inside `.notif-title`
- Line 1196-1197: SVG donut text uses `font-family="var(--font-mono)"` (correct intent, but SVG attribute rendering may differ from CSS)

The revenue chart values on the right column are in monospace via `.revenue-value { font-family: var(--font-mono); }`. Donut legend values use `class="donut-legend-value font-mono"`. So the dashboard is ~90% compliant on financial typography -- better than the prototype average but not perfect.

### E. Dashboard Visual Quality vs Prototype Average

| Quality Dimension | Dashboard Score | Prototype Average (from audits) | Delta |
|-------------------|----------------|-------------------------------|-------|
| Token adherence (colors) | 9/10 | 7/10 | +2 |
| Badge compliance | 8/10 | 5/10 | +3 |
| Financial typography | 8/10 | 6/10 | +2 |
| Component reuse | 5/10 | 6/10 | -1 |
| Spacing tokenization | 7/10 | 6/10 | +1 |
| ARIA / accessibility | 2/10 | 5/10 | -3 |
| Hover states | 6/10 | 7/10 | -1 |

The dashboard is above average on visual polish (colors, badges, typography) but below average on structural concerns (component reuse, accessibility, hover feedback on content cards). It is a visually clean page built on a fragile, non-shared foundation.

---

## Severity Adjustments

### Upgrades

| Original Issue | Original Severity | Recommended Severity | Reason |
|----------------|------------------|---------------------|--------|
| Presence badge "8 online" vs 6 actual (Agent 1, #6) | HIGH | **CRITICAL** | Data integrity error on the dashboard landing page. First thing a manager sees. If the prototype shows wrong counts, it undermines confidence in every other number. |
| Dashboard widget CSS not in component library | Not reported | **HIGH** | ~40 classes defined in inline `<style>`, duplicated with drift in other pages. This is the root cause of cross-page inconsistency. |
| No ARIA on dashboard interactive widgets | Not reported by Agent 1 | **HIGH** | The dashboard is the most interaction-dense page (tabs, approve/reject, dropdowns, command palette, sort headers). Zero ARIA beyond one button label. |
| `populated-content`/`empty-content` redefined inline | Mentioned in passing by Agent 5 | **MEDIUM** | Used on 11 pages (confirmed via grep), defined in each page's inline styles. Should be in `_components.css`. |

### Downgrades

| Original Issue | Original Severity | Recommended Severity | Reason |
|----------------|------------------|---------------------|--------|
| Hardcoded #fff in `_components.css` (Agent 5) | CRITICAL | **MEDIUM** | Only 6 occurrences in `_components.css`, all in contexts where white is semantically "text on colored background." Creating a `--color-text-on-primary` token is good practice but calling this CRITICAL overstates the urgency -- it has no visual impact in the dark theme since these elements are already correctly styled. |
| Missing blueprint dashboard widgets (Agent 1, Section 7) | 4/10 compliance rating | Appropriate as-is, but context matters | Agent 1 rated blueprint compliance at 25%. This is factually correct but the implemented widgets (AI Alerts, Pending Approvals with tabs, Mini Gantt, Presence) are higher-quality substitutions, not random omissions. The prototype's dashboard tells a different story than the blueprint intended, but it is not an inferior story. |
| Donut chart redundancy (Agent 1, Section 2.10) | 5/10 | **6/10** | Agent 1 said it "repeats information already in the KPI cards." Technically true (87% billable), but the donut adds the absolute hour breakdown (1,602h billable / 240h internal / 1,842h total) which the KPI card does not. It is partially redundant, not fully. |

### Items Confirmed as Correctly Assessed

- Analytics/Insights dual-entry navigation (CRITICAL) -- Confirmed. Both Agent 1 findings and the HTML show lines 374-375 and 399-401 both linking to `insights.html`.
- `employees.html` and `gantt.html` template fork (HIGH) -- Confirmed by Agent 1's badge/icon inconsistency findings. Agent 5 independently identified `gantt.html` as the worst page for inline styles. These two pages are clearly from a different authoring pass.
- Filter bar redefinition across pages (MEDIUM) -- Agent 5 correctly identified 4+ different implementations. The dashboard does not have a filter bar, so this is not a dashboard issue, but it confirms the wider pattern of inline-style drift that also affects dashboard widgets.
- `btn-destructive` hover uses hardcoded `hsl(5, 65%, 58%)` (Agent 5, line 66 of `_components.css`) -- Confirmed. This is a real token violation in the shared component file. Not dashboard-specific but affects the Reject buttons used on the dashboard.
