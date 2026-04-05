# AUDIT: Component Quality & Visual Polish
## GammaHR v2 Prototype -- Critique Agent 5

**Auditor:** Design Director (pixel-perfect obsessive)
**Date:** 2026-04-05
**Scope:** All CSS token/component/layout files + 15 HTML pages + DESIGN_SYSTEM.md spec
**Verdict:** Solid foundation with serious polish gaps. Not yet at Linear/Stripe tier.

---

## OVERALL SCORE: 6.4 / 10

Premium software has zero visual inconsistencies. This prototype has dozens.

---

## 1. Design Token Adherence (Score: 7/10)

### What Works
- The token system in `_tokens.css` is well-structured and comprehensive: spacing, color, typography, radius, shadow, motion -- all present.
- `_components.css` and `_layout.css` predominantly use token references (var(--color-*), var(--space-*), etc.).
- Base body styles correctly reference tokens.
- Global `:focus-visible` and `::selection` use token values.
- `prefers-reduced-motion` is properly handled in `_tokens.css`.

### Hardcoded Hex Values -- CRITICAL

The following `#fff` and `#000` values appear throughout CSS and HTML, violating the token system. There is no `--color-white` or `--color-text-on-color` token defined.

**In `_components.css`:**
| Line | Value | Context |
|------|-------|---------|
| 64 | `color: #fff` | `.btn-destructive` |
| 101 | `border-top-color: #fff` | `.btn-loading::after` spinner |
| 100 | `rgba(255,255,255,0.3)` | `.btn-loading::after` border |
| 663 | `color: #fff` | `.avatar` |
| 997 | `color: #fff` | `.nav-item .nav-badge` |
| 1047 | `background: #fff` | `.toggle.active::after` |

**In `_layout.css`:**
| Line | Value | Context |
|------|-------|---------|
| 43 | `color: #fff` | `.sidebar-logo .logo-icon` |

**In HTML inline styles:**
| File | Value | Context |
|------|-------|---------|
| `gantt.html` (10+ instances) | `color:#fff` | Avatar inline styles |
| `clients.html` line 38 | `color: #fff` | `.client-logo` |
| `clients.html` line 92 | `color: #fff` | `.detail-logo` |
| `portal/index.html` line 37 | `color: #fff` | `.portal-client-logo` |
| `portal/auth.html` line 39 | `color: #fff` | `.client-logo` |
| `auth.html` line 41 | `color: #fff` | `.logo-3d` |
| `expenses.html` line 58 | `background: #fff` | `.toggle-switch::after` |
| `auth.html` line 320 | `background: #fff` | QR code container |
| `auth.html` lines 322-340 | `fill="#000"`, `fill="#666"` | QR code SVG rects |

**Recommendation:** Define `--color-white: #fff`, `--color-black: #000`, `--color-text-on-primary: #fff` tokens and use them everywhere.

### Hardcoded HSL Values in HTML -- CRITICAL

These bypass the token system entirely:

| File | Values | Context |
|------|--------|---------|
| `gantt.html` (12+ instances) | `hsl(155,30%,35%)`, `hsl(200,35%,40%)`, `hsl(270,35%,45%)`, `hsl(38,45%,40%)`, `hsl(340,35%,45%)`, `hsl(180,30%,38%)`, `hsl(15,40%,42%)`, `hsl(120,25%,38%)`, `hsl(290,30%,42%)`, `hsl(210,30%,42%)` | Avatar background colors, all inline |
| `leaves.html` (4 instances) | `hsl(270, 45%, 58%)`, `hsl(175, 35%, 45%)` | `.type-sick` and `.type-wfh` colors in page styles |
| `clients.html` (10+ instances) | `hsl(200,60%,45%)`, `hsl(155,40%,40%)`, `hsl(30,50%,45%)`, `hsl(270,40%,50%)`, etc. | Client logo and avatar gradients |
| `portal/index.html` (9 instances) | Various hsl values | Avatar inline gradients |
| `expenses.html` line 844 | `hsla(270, 45%, 58%, 0.14)` | Expense icon category color |
| `leaves.html` lines 1058, 1111, 1148 | `hsla(270,45%,58%,0.15)`, `hsla(175,35%,45%,0.15)` | Inline badge styles |
| `gantt.html` line 101 | `hsla(155, 26%, 46%, 0.25)` | Active filter border |
| `timesheets.html` line 322 | `hsla(38, 65%, 50%, 0.25)` | Inline border |

**Gantt.html is the worst offender:** Every avatar in the Gantt page is constructed with fully inline styles including hardcoded hsl backgrounds, hardcoded font-size (11px), hardcoded font-weight (600), and `#fff`. This page was clearly built by someone who did not internalize the token system.

---

## 2. Badge Compliance (Score: 5/10)

### Spec Requirement (DESIGN_SYSTEM.md Section 9.4):
> "All badges include semantic icons (not just color)."

### Badges WITHOUT Icons -- SPEC VIOLATION

This is a major accessibility and design-system failure. The spec explicitly states all badges must use icon + color + text, yet dozens of badges are text-only or dot-only:

**planning.html:**
- `<span class="badge badge-warning">3 on bench</span>` -- NO icon
- `<span class="badge badge-primary">Interviewing (3)</span>` -- NO icon
- `<span class="badge badge-default">Open</span>` -- NO icon
- `<span class="badge badge-default">Planned Q3</span>` -- NO icon

**employees.html:**
- `<span class="badge badge-warning">BENCH</span>` -- NO icon (appears 2x)
- `<span class="badge badge-primary">Rust</span>` -- NO icon (skill badge)
- `<span class="badge badge-primary">Three.js</span>`, `<span class="badge badge-primary">Docker</span>` -- NO icon
- `<span class="badge badge-primary">Annual</span>` -- NO icon (appears 3x in leave history)
- `<span class="badge badge-error">Sick</span>` -- NO icon (appears 2x in leave history)

**expenses.html:**
- `<span class="badge badge-default">Hotel</span>` -- NO icon
- `<span class="badge badge-default">Meals</span>` -- NO icon
- `<span class="badge badge-default">Equipment</span>` -- NO icon
- `<span class="badge badge-default">Transport</span>` -- NO icon

**leaves.html:**
- `<span class="badge badge-info">Annual</span>` -- NO icon (appears 4x)
- `<span class="badge badge-accent">Personal</span>` -- NO icon
- Inline-styled badges for Sick and WFH -- NO icon

**clients.html:**
- `<span class="badge badge-success">On Track</span>` -- NO icon (appears 2x in projects table)
- `<span class="badge badge-warning">At Risk</span>` -- NO icon
- `<span class="badge badge-success">Completed</span>` -- NO icon (appears 2x)

**insights.html:**
- `<span class="badge badge-error">High</span>` -- NO icon
- `<span class="badge badge-warning">Medium</span>` -- NO icon
- `<span class="badge badge-info">Low</span>` -- NO icon
- `<span class="badge badge-success">Positive</span>` -- NO icon
- `<span class="badge badge-default">Neutral</span>` -- NO icon
- `<span class="badge badge-accent">Recommendation</span>` -- NO icon (appears 3x)
- `<span class="badge badge-success">Healthy</span>` -- NO icon (appears 2x)
- `<span class="badge badge-warning">At Risk</span>` -- NO icon
- `<span class="badge badge-error">Critical</span>` -- NO icon
- `<span class="badge badge-info">Internal</span>` -- NO icon

**admin.html:**
- `<span class="badge badge-error">Admin</span>` -- NO icon (appears 2x)
- `<span class="badge badge-warning">PM</span>` -- NO icon (appears 3x)
- `<span class="badge badge-default">Employee</span>` -- NO icon (appears 5x)

**Total: 50+ badges without icons across the prototype.** This is a systemic failure, not an isolated oversight.

### Badges Using badge-dot (CSS ::before dot instead of SVG icon)

Many badges use `badge-dot` which generates a colored dot via CSS. While this provides a non-color indicator, it is NOT an icon. The spec says "semantic icons." A dot is not semantic -- it does not communicate meaning to screen readers or convey the nature of the status.

Files using dot-only badges: `employees.html`, `projects.html`, `clients.html`, `planning.html`

---

## 3. Financial Number Typography (Score: 6/10)

### Spec Requirement:
> "JetBrains Mono -- For code, numbers in tables, currency amounts."

### Correctly Using Monospace
- Dashboard stat cards: `class="stat-value font-mono"` -- CORRECT
- Dashboard approval subs: `<span class="font-mono">` wrapping amounts -- CORRECT
- Dashboard revenue values: CSS `.revenue-value { font-family: var(--font-mono); }` -- CORRECT
- Portal table cells: `class="font-mono"` on rate and amount cells -- CORRECT
- Portal stat values: `class="stat-value font-mono"` -- CORRECT
- Client revenue: `.client-revenue { font-family: var(--font-mono); }` -- CORRECT
- Data table cell-mono class: `.data-table .cell-mono` defined in employees.html -- CORRECT
- Utilization percentages: `.util-pct`, `.utilization-pct` use `var(--font-mono)` -- CORRECT

### Financial Numbers NOT in Monospace -- VIOLATION

| File | Location | Value | Issue |
|------|----------|-------|-------|
| `index.html` line 472 | Notification panel | "INV-2026-0041 ... (euro12,400)" | Monetary value in plain sans-serif inside `.notif-title` |
| `index.html` line 802 | AI alert | "euro340 hotel" | Monetary value in plain sans-serif inside `.ai-alert-text` |
| `expenses.html` line 629 | Notification | "(euro450)" | Monetary value in notification text, no mono wrapper |
| `expenses.html` line 636 | Notification | "(euro1,200)" | Monetary value in notification text, no mono wrapper |
| `portal/index.html` line 304 | Stat value | "euro20,600" | Missing `font-mono` class on stat-value element |
| `portal/index.html` line 434 | Notification | "euro12,400" | Notification text, no mono wrapper |

### Invoice IDs Not in Monospace
Invoice numbers like "INV-2026-0041" and "INV-2026-048" appear in plain text without monospace formatting. These are code-like identifiers that should use `font-mono`.

---

## 4. Shadow & Surface Depth Hierarchy (Score: 8/10)

### What Works
- Surface levels are used correctly: `--color-bg` < `--color-surface-0` < `--color-surface-1` < `--color-surface-2` < `--color-surface-3`.
- Cards consistently use `--color-surface-0` with `--shadow-1`.
- Modals use `--color-surface-2` with `--shadow-4` -- correct per spec.
- Dropdowns/popovers use `--color-surface-3` with `--shadow-3` -- correct.
- Toasts use `--shadow-5` -- correct.
- Hover states on cards correctly deepen to `--shadow-3`.
- Glassmorphism is correctly applied to header and command palette only.

### Minor Issues
- `stat-card:hover` uses `--shadow-2` while `card-interactive:hover` uses `--shadow-3`. Inconsistent depth on hover for cards at the same elevation level.
- The notification panel uses `--shadow-4` (modal level) but it is a dropdown, not a modal. Should be `--shadow-3`.
- No shadow on sidebar (`--shadow-0` implicit) -- acceptable since it uses border, but the spec says sidebar should be at "Surface" level with `--shadow-1`.

---

## 5. Spacing Consistency (Score: 6/10)

### What Works
- Most page-level styles use `var(--space-N)` tokens correctly.
- `_layout.css` and `_components.css` are very disciplined about token usage.
- Grid gaps, card padding, section spacing -- all tokenized.

### Hardcoded Spacing Values in CSS

**In `_layout.css`:**
| Line | Value | Should Be |
|------|-------|-----------|
| 45 | `font-size: 14px` | `var(--text-body)` |
| 79-82 | `top: 2px; right: 2px; min-width: 14px; height: 14px; font-size: 8px; padding: 0 3px;` | `var(--space-0-5)`, `var(--text-overline)` or similar |
| 172 | `padding: 1px 6px` | `var(--space-0-5) var(--space-1-5)` |
| 201-202 | `top: 6px; right: 6px; width: 8px; height: 8px` | `var(--space-1-5)` etc. |

**In `_components.css`:**
| Line | Value | Should Be |
|------|-------|-----------|
| 86 | `text-underline-offset: 2px` | `var(--space-0-5)` |
| 89 | `padding: 1px 8px` | Should use space tokens |
| 99-100 | `width: 16px; height: 16px; border: 2px solid` | Acceptable for spinner |
| 328 | `padding: 2px var(--space-2)` | `var(--space-0-5)` for the 2px |
| 633 | `margin-top: 2px` | `var(--space-0-5)` |
| 637 | `padding: 2px` | `var(--space-0-5)` |
| 712 | `margin-left: -8px` | `calc(-1 * var(--space-2))` |
| 762 | `padding: 1px 6px` | Space tokens |
| 952 | `border-radius: 3px` | `var(--radius-sm)` |
| 954 | `font-size: 10px` | `var(--text-overline)` minus 1px, or define a new token |

**In page-specific `<style>` blocks:**

Many files define page-specific styles with hardcoded values:
- `gantt.html` line 345: `font-size: 9px` -- no token for this
- `gantt.html` line 430: `font-size: 11px` -- should use `var(--text-overline)`
- `gantt.html` line 481: `font-size: 9px` -- no token for this
- `leaves.html` line 402: `font-size: 10px` -- no token for this
- `admin.html` line 30: `@media (max-width: 768px)` -- inconsistent with the system breakpoints (639px and 1023px defined in `_layout.css`)

### Inline Style Spacing Violations

Numerous inline `style=""` attributes on HTML elements use `var(--space-N)` tokens (good) but several also use raw pixel values:
- `gantt.html`: `font-size:11px` in ~13 inline avatar styles
- `gantt.html`: `font-weight:600` instead of `var(--weight-semibold)`
- `auth.html` line 320: `width: 180px; height: 180px` -- raw pixels (acceptable for fixed QR code)
- `planning.html` line 518-522: `width: 12px; height: 12px` -- raw pixels for legend dots

---

## 6. Hover States (Score: 7/10)

### Interactive Elements WITH Proper Hover States
- All `.btn-*` variants: hover defined
- `.card-interactive:hover`: translateY + shadow
- `.stat-card:hover`: translateY + shadow
- `.nav-item:hover`: background + color
- `.data-table tr:hover td`: background highlight
- `.dropdown-item:hover`: background
- `.notif-item:hover`: background
- `.header-icon-btn:hover`: background + color
- `.header-user:hover`: background
- `.header-search:hover`: border + background
- `.quick-filter:hover`: background + color + border
- `.cmd-palette-item:hover`: background
- `.tab:hover`: color change
- `.filter-chip .remove-filter:hover`: opacity
- `.toast-close:hover`: color
- `.sidebar-collapse-btn:hover`: background + color
- Employee cards, project cards, client cards, expense items: all have hover states

### Interactive Elements MISSING Hover States

| Element | File | Issue |
|---------|------|-------|
| `.mobile-menu-btn` | `_layout.css` | No hover state defined. Has cursor:pointer but no visual feedback |
| `.form-check` (checkboxes) | `_components.css` | Label container has cursor:pointer but no hover feedback |
| `.toggle` | `_components.css` | No hover state -- only active state defined |
| `.tag` | `_components.css` | No hover or interactive state, though tags may be static. If used as removable tags, they need hover |
| `.state-toggle` button | `_layout.css` | Has hover -- CORRECT |
| `.portal-user` | `portal/index.html` | Has hover -- CORRECT |
| Breadcrumb links | Not applicable (breadcrumb component exists in CSS but not visibly used in most pages) |

---

## 7. Focus States & Keyboard Navigation (Score: 5/10)

### What Exists
- Global `:focus-visible` in `_tokens.css`: 2px solid primary, 2px offset, radius-md. This is correct per DESIGN_SYSTEM.md Section 12.
- Form inputs have custom `:focus` styles with ring: `box-shadow: 0 0 0 3px var(--color-primary-muted)`.

### What Is Missing -- CRITICAL FOR ACCESSIBILITY

The global `:focus-visible` in `_tokens.css` provides a baseline, but:

1. **No component-specific focus styling.** The global outline will clash with rounded components. A button with `border-radius: var(--radius-md)` gets an outline with that same radius (correct), but elements like `.toggle`, `.avatar`, tabs, and pagination buttons may need adjusted focus ring positioning.

2. **Form inputs use `:focus` not `:focus-visible`.** This means mouse clicks on inputs also show the focus ring, which is visually noisy. Premium apps use `:focus-visible` on inputs so the ring only appears during keyboard navigation.

3. **No skip-to-content link.** Required for WCAG 2.2 AA keyboard navigation.

4. **No focus trapping in modals.** The modal component has no JavaScript for focus trapping. When a modal is open, Tab can reach elements behind the backdrop.

5. **No `role` or `aria-*` attributes on interactive custom components:**
   - `.toggle` buttons have no `role="switch"` or `aria-checked`
   - `.dropdown` triggers have no `aria-expanded` or `aria-haspopup`
   - `.tab` buttons have no `role="tab"` or `aria-selected`
   - `.notif-panel` has no `role="dialog"` or `aria-label`
   - `.cmd-palette` has no `role="combobox"` or `aria-autocomplete`

6. **Command palette keyboard navigation:** The footer shows keyboard hints (arrows, enter, escape) but there is no visible focus indicator on the selected result item beyond a background highlight. Needs a distinct focus ring.

---

## 8. Cross-Page Visual Consistency (Score: 6/10)

### Consistent Elements Across All Pages
- Sidebar navigation: identical structure, tokens, and behavior across all 13 app pages.
- Top header: identical glassmorphism header across all app pages.
- Card styling: consistent use of `surface-0`, `border`, `radius-lg`, `shadow-1`.
- Button usage: consistent variant/size class usage.
- Typography hierarchy: page titles use `heading-1`, card titles use `heading-3`.

### Inconsistencies Between Pages

**Filter Bar Pattern -- 4 Different Implementations:**

| Page | Implementation |
|------|---------------|
| `employees.html` | `.filter-bar` with no background, no border, flex gap-3 |
| `expenses.html` | `.filter-bar` with `background: var(--color-surface-0)`, border, radius-lg, padding |
| `leaves.html` | `.filter-bar` with no background, no border |
| `gantt.html` | `.filter-panel` with collapsible header, full card treatment |
| `invoices.html` | `.filter-bar` with no background, no border |
| `approvals.html` | `.filter-bar` with no background, no border |

The filter bar should be ONE component with a single visual pattern. Currently it looks like 4 different developers built it.

**View Toggle Pattern -- 2 Implementations:**

| Page | Implementation |
|------|---------------|
| `employees.html` | `.view-toggle-btn` with `background: var(--color-surface-0)`, active = `primary-muted` |
| `projects.html` | `.view-toggle-btn` with `background: transparent`, active = `primary` (solid) |

These look visually different. One uses a muted highlight for the active state; the other uses a solid primary background.

**Empty/Populated State Toggle:**
- `index.html`, `admin.html`, `gantt.html`, `expenses.html`, `timesheets.html`, `leaves.html` have state toggles -- good consistency.
- But the CSS for `.populated-content` / `.empty-content` is redefined in `index.html` and `admin.html` inline styles rather than in `_components.css`.

**Title Inconsistency:**
- Some pages use `<title>Page - GammaHR Quantum</title>` (with hyphen)
- Others use `<title>Page -- GammaHR Quantum</title>` (with em dash)
- One uses `<title>Page &mdash; GammaHR Quantum</title>` (HTML entity em dash)
- `gantt.html` alone uses `<title>Gantt Chart - GammaHR v2 Quantum</title>` (includes "v2")

**Page Content Width:**
- No page uses `.page-content-narrow` (defined in `_layout.css` with `max-width: 1200px`). All pages let content expand to full width. This may be intentional for data-heavy pages, but portal pages do use `max-width: 1200px` directly.

---

## 9. Missing Components Referenced in Blueprint (Score: 7/10)

Based on DESIGN_SYSTEM.md, the following specified components exist in `_components.css`:

| Component | Status |
|-----------|--------|
| Buttons (all variants/sizes) | PRESENT |
| Inputs (text, select, textarea, checkbox, radio) | PRESENT |
| Cards (default, stat, glass, interactive) | PRESENT |
| Badges (all semantic variants) | PRESENT |
| Data Tables (sortable, hoverable, paginated) | PRESENT |
| Modals/Dialogs (sm, md, lg, xl) | PRESENT |
| Avatars (all sizes, status dots, groups) | PRESENT |
| Toast Notifications (success, error, warning, info) | PRESENT |
| Command Palette | PRESENT |
| Tabs | PRESENT |
| Dropdowns | PRESENT |
| Tooltips | PRESENT |
| Skeleton Loading | PRESENT |
| Empty States | PRESENT |
| Slide Panel | PRESENT |
| Progress Bars | PRESENT |
| Toggle/Switch | PRESENT |
| Filter Chips | PRESENT |
| Breadcrumbs | PRESENT (CSS only, not used in any page) |
| Quick Filters | PRESENT |
| Dividers | PRESENT |
| Tags | PRESENT |

### Components Missing or Incomplete

| Component | Issue |
|-----------|-------|
| **Light mode** | `[data-theme="light"]` is defined in the spec but there is no theme toggle anywhere in the prototype. No way to test light mode. |
| **Bottom mobile navigation** | Spec says: "Bottom navigation bar (5 items)." Not implemented. |
| **FAB (Floating Action Button)** | Spec says mobile should have a FAB. Not implemented. |
| **Swipe gestures** | Spec says: "Swipe to approve/reject in lists." Not implemented (expected for prototype). |
| **Pull to refresh** | Spec says this should exist. Not implemented. |
| **Gradient card variant** | Spec defines `gradient` card variant. Not implemented in `_components.css`. |
| **Outlined card variant** | Spec defines `outlined` card variant. Not implemented. |
| **High contrast mode** | Spec says: "Support `prefers-contrast: more`." Not implemented. |
| **3D elements** | Spec describes 3D logo, empty states, dashboard hero. Only the auth page logo has a float animation. Acceptable for an HTML/CSS prototype. |
| **Number roll animation** | Spec says counter updates should have digit-by-digit roll animation. Not implemented. |
| **Sidebar 3D icons** | Spec describes 3D-rendered sidebar icons. Prototype uses Lucide SVGs (acceptable for prototype). |

---

## 10. Gantt.html -- Special Disgrace (Score: 3/10)

This page is the worst-polished page in the entire prototype. It warrants its own section.

### Inline Style Explosion
The Gantt page has 13+ avatar elements constructed entirely with inline styles:
```html
style="background:hsl(155,30%,35%);color:#fff;display:flex;align-items:center;
justify-content:center;font-weight:600;font-size:11px;border-radius:var(--radius-full);
flex-shrink:0;"
```

Every single property here should be handled by the existing `.avatar` CSS class. The avatar component already handles:
- Background gradient
- Color
- Display flex + centering
- Font weight, size
- Border radius
- Flex shrink

But this page ignores the component entirely and hardcodes everything inline. The JS template literal on line 1650 also constructs avatars with the same inline approach.

### Hardcoded Colors
10 unique hsl values that exist nowhere in the token system: `hsl(155,30%,35%)`, `hsl(200,35%,40%)`, `hsl(270,35%,45%)`, `hsl(38,45%,40%)`, `hsl(340,35%,45%)`, `hsl(180,30%,38%)`, `hsl(15,40%,42%)`, `hsl(120,25%,38%)`, `hsl(290,30%,42%)`, `hsl(210,30%,42%)`.

These are avatar-specific colors, but they should be defined as CSS custom properties and applied via data attributes or utility classes, not inline.

### Hardcoded Font Sizes
- `font-size: 9px` (lines 345, 481) -- below any defined text token
- `font-size: 11px` (line 430 and all inline avatars) -- should be `var(--text-overline)`

---

## 11. Miscellaneous Issues

### Currency Inconsistency
- Dashboard and most pages use Euro (euro) as the currency symbol.
- `employees.html` profile detail and Gantt.html project budgets use Dollar ($).
- A real product would be locale-consistent. Even in a prototype, pick one.

### Missing `_layout.css` Import
- `portal/index.html` and `portal/auth.html` do not import `_layout.css`. This is acceptable since they use a different layout (no sidebar), but it means layout utility classes (`.flex`, `.gap-*`, `.mb-*`) are unavailable in these pages.
- `auth.html` also does not import `_layout.css` -- same reasoning, acceptable.

### Breakpoint Inconsistency
- `admin.html` line 30 uses `@media (max-width: 768px)` -- this is NOT one of the defined breakpoints (639px, 1023px, 1439px). It should use 639px or 1023px per the design system.

### Redundant Component Redefinitions
The `.filter-bar` class is redefined from scratch in at least 6 different HTML files with slightly different padding, background, and border treatments. This should be a single component in `_components.css` with modifier classes.

Similarly, `.view-toggle` and `.view-toggle-btn` are defined in both `employees.html` and `projects.html` with different active state treatments.

---

## SUMMARY: Top 10 Fixes for Premium Quality

| Priority | Issue | Severity | Effort |
|----------|-------|----------|--------|
| **1** | Add SVG icons to all 50+ icon-less badges | HIGH | Medium |
| **2** | Replace all inline hsl() values in gantt.html avatars with proper .avatar class usage | HIGH | Low |
| **3** | Define `--color-white`/`--color-text-on-primary` token; replace all #fff/#000 | HIGH | Low |
| **4** | Wrap all inline financial figures in `<span class="font-mono">` | MEDIUM | Low |
| **5** | Standardize filter bar component -- ONE pattern in _components.css | MEDIUM | Medium |
| **6** | Standardize view toggle component -- ONE active-state treatment | MEDIUM | Low |
| **7** | Add `role`, `aria-*` attributes to toggle, tabs, dropdown, modal, command palette | HIGH | Medium |
| **8** | Change form input `:focus` to `:focus-visible` | MEDIUM | Low |
| **9** | Fix admin.html breakpoint from 768px to 1023px | LOW | Trivial |
| **10** | Normalize `<title>` separator format across all pages | LOW | Trivial |

---

## AREA SCORES SUMMARY

| Area | Score | Notes |
|------|-------|-------|
| Token System Adherence | 7/10 | Good foundation, but #fff and inline hsl plague it |
| Badge Spec Compliance | 5/10 | 50+ badges missing icons -- systemic failure |
| Financial Typography | 6/10 | Most data tables correct, notification text is not |
| Shadow/Depth Hierarchy | 8/10 | Mostly correct, minor inconsistencies |
| Spacing Consistency | 6/10 | Tokens used in shared CSS; raw values leak in page styles |
| Hover States | 7/10 | Most interactive elements covered, a few gaps |
| Focus States & A11y | 5/10 | Global focus-visible exists, but no ARIA, no focus trapping, no skip link |
| Cross-Page Consistency | 6/10 | Sidebar/header consistent; filter bars are a mess |
| Component Completeness | 7/10 | Most spec components exist; mobile-specific patterns missing |
| Gantt Page Quality | 3/10 | Inline style disaster, fully bypasses component system |

**OVERALL: 6.4/10** -- Not ready for a premium product demo. Needs a focused polish pass on badges, inline styles, ARIA attributes, and component standardization.
