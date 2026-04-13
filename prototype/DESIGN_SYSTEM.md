# GammaHR v2 — Design System

**Purpose:** Every page in GammaHR must feel like part of ONE platform. This document defines the rules.

---

## Page Anatomy (every page follows this order)

1. **Page header** — `h1` + subtitle (1 line max) + primary action button (top-right)
2. **Stat row** — 3-4 KPI cards in a single horizontal row. NEVER stacked on desktop.
3. **Filter bar** — Search input LEFT + filter chips/selects RIGHT. Always one horizontal line on >= 768px.
4. **Main content** — Table OR card grid OR kanban (based on density rules below)
5. **Detail drawer** — Slides in from right. Never a new page for detail views.

---

## Content Density Rules

- Items with <= 5 data points -> **compact table row** (NEVER a card)
- Rich content (profile, project summary, kanban item) -> **card**
- Card grids: 3 columns desktop, 2 tablet, 1 mobile

**What MUST be rows (not cards):**
- Approval queue items
- Expense list items
- Leave request items
- Timesheet approval items
- AI alert items (compact list, not cards)

---

## CSS Conventions

### `.page-header`
Page title `h1` + subtitle + action button. Flexbox row, space-between.

### `.stat-row` / `.kpi-grid` / `.grid-3` / `.grid-4`
3-4 column KPI grid. `display: grid` with `grid-template-columns: repeat(N, 1fr)`.
NEVER collapses to 1 column on desktop. Mobile: 2 columns minimum.

### `.filter-bar-standard`
Flexbox row, `flex-wrap: nowrap` on desktop (>= 769px). Wraps on mobile.
Defined in `_layout.css`. All pages MUST use this class for filter bars.

### `.content-table` / `.action-table`
Standard table with sticky header. Rows use `.action-row` for compact interactive items.

### `.detail-drawer`
Right-side slide-in panel. Uses `position: fixed; right: 0; z-index: 200`.

---

## Work Time Visualization Rule (CRITICAL)

**Donut/pie charts are BANNED for hours and capacity.**

Reason: They cap at 100% and cannot represent overwork. A developer at 112.5% work time is invisible in a donut.

**Correct pattern:** Horizontal progress bar with an overflow zone that turns amber past 100%.

```
[========== billable (85%) ==========][=== internal (15%) ===]  -> 100% total
[============ billable (100%) ============][== internal (12.5%) ==|AMBER OVERFLOW]  -> 112.5% total
```

If ANY donut chart shows hours/capacity anywhere: REMOVE IT and replace with a horizontal bar.

---

## Admin Resource Management View

One row per employee in a scannable table:
```
[Name] [Role] [Billable bar] [Internal bar] [Total %] [Overwork indicator if >100%]
```

This is the ONLY correct way to display employee work time.

---

## Terminology

- "Work Time" (NOT "Utilisation" or "Utilization")
- "Capacity" (NOT "Utilisation")
- "Contribution" (acceptable alternative)
- "Globex Corp" (NOT "Globex Corporation")
- Invoice format: `INV-2026-XXX` (3-digit suffix)
