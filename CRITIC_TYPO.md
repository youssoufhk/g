# CRITIC_TYPO — Typography & Spacing Audit

**Auditor:** Design Systems Critic
**Date:** 2026-04-10
**Scope:** All 19 HTML files in `prototype/`, plus `_tokens.css`

---

## 1. Hardcoded Font Sizes

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **HIGH** | `leaves.html:439` | `font-size: 10px` in `.calendar-event` style block | Use `var(--text-overline)` (11px) — 10px is not on the type scale at all |

---

## 2. Heading Hierarchy Violations

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 2 | **HIGH** | `approvals.html:891` | `<h3>` styled as `font-size:var(--text-heading-2)` — tag says h3, visual weight says h2 | Use `<h2>` or keep h3 with `--text-heading-3` |
| 3 | **HIGH** | `calendar.html:806` | `<h3>` day-view date styled as `font-size:var(--text-heading-2)` | Use `<h2>` for the day view heading |
| 4 | **HIGH** | `planning.html:977` | `<h3>` empty state styled as `font-size:var(--text-heading-2)` | Use `<h2>` for empty state headings |
| 5 | **HIGH** | `insights.html:1823` | `<h3>` empty state styled as `font-size:var(--text-heading-2)` | Use `<h2>` for empty state headings |
| 6 | **HIGH** | `leaves.html:846` | `<h3>` filter-empty styled as `font-size:var(--text-heading-2)` | Use `<h2>` or remove the heading-2 override |
| 7 | **MED** | `calendar.html:842` | `<h4>On Leave Today</h4>` appears as a popup heading with no `<h3>` ancestor in that context | Use `<h3>` — the popup is not inside any h3 section |
| 8 | **MED** | `admin.html:349` | `<h4>Approval Chain Configuration</h4>` sits under a settings tab that uses `<h3>` section titles — acceptable hierarchy, but the h4 has no semantic parent `<section>` | Wrap in a `<section>` or use `<h3>` with a smaller visual size |
| 9 | **MED** | `auth.html:1175-1190` | Four `<h4>` tags (Timesheets, Leave Requests, Expenses, Your Team) inside the onboarding tour — no `<h3>` precedes them in the flow | Use `<h3>` for tour card titles, or add an `<h3>` heading above the grid |

---

## 3. Hardcoded Border-Radius (should use `var(--radius-*)` tokens)

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 10 | **HIGH** | `insights.html` (13 occurrences, lines 1070-1437) | `border-radius:99px` on all progress bars | Use `var(--radius-full)` which is `9999px` — same visual result, token-based |
| 11 | **MED** | `index.html:339,391,419` | `border-radius: 3px`, `border-radius: 2px`, `border-radius: 3px 3px 0 0` in heatmap/chart styles | Use `var(--radius-sm)` (4px). The 2px/3px values are off-scale |
| 12 | **MED** | `leaves.html:222,248,441` | `border-radius: 2px` and `border-radius: 3px` in mini-calendar and event styles | Use `var(--radius-sm)` (4px) |
| 13 | **MED** | `hr.html:23` | `.kanban::-webkit-scrollbar-thumb { border-radius: 3px; }` | Use `var(--radius-sm)` |
| 14 | **LOW** | `account.html:542` | `border-radius: 1px` on a password-strength segment | Use `var(--radius-none)` (0px) — 1px is not on the scale |

---

## 4. Hardcoded Spacing (should use `var(--space-*)` tokens)

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 15 | **HIGH** | `insights.html` (15 inline occurrences) | `margin-bottom:4px` repeated across all progress-bar labels | Use `var(--space-1)` |
| 16 | **HIGH** | `auth.html` (9 inline occurrences) | `margin-right:4px` on icon spans throughout auth flows | Use `var(--space-1)` |
| 17 | **HIGH** | `employees.html` (10 inline occurrences) | `margin-right:4px` on skill/legend icon spans | Use `var(--space-1)` |
| 18 | **MED** | `employees.html` (3 inline occurrences, line 1967+) | `gap:6px` in legend rows | Use `var(--space-1-5)` |
| 19 | **MED** | `gantt.html:544` | `margin-top: 34px` in `.gantt-bar.bar-row-2` | This is not on the 4px spacing scale. Use `var(--space-8)` (32px) or `var(--space-9)` (36px) |
| 20 | **MED** | `account.html:149` | `right: 10px` in `.input-action-btn` positioning | Use `var(--space-2)` (8px) or `var(--space-3)` (12px) |

---

## 5. Hardcoded Font-Weight

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 21 | **MED** | `calendar.html:1422` | `font-weight:600` in JS-generated day header style | Use `var(--weight-semibold)` |

---

## 6. Hardcoded Colors (should use `var(--color-*)` tokens)

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 22 | **HIGH** | `employees.html:654` | `color: #fff` on active pagination button | Use `var(--color-text-on-primary)` |
| 23 | **HIGH** | `hr.html:409` | `color: #fff` on active kanban stage tab | Use `var(--color-text-on-primary)` |

---

## 7. Semantic HTML / Page Structure Issues

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 24 | **HIGH** | `portal/auth.html` | No `<main>` element. Content is in `<div class="portal-auth">` directly inside `<body>` | Wrap in `<main>` for accessibility |
| 25 | **MED** | `gantt.html:907` | `id="mainContent"` (camelCase) while every other page uses `id="main-content"` (kebab-case) | Change to `id="main-content"` for consistency; update any JS references |

---

## Summary

| Severity | Count |
|----------|-------|
| HIGH     | 9     |
| MED      | 14    |
| LOW      | 1     |
| **Total**| **25**|

### Systemic Patterns Requiring Bulk Fix

1. **`border-radius:99px` in inline styles** — 13+ instances in `insights.html` alone. All should be `var(--radius-full)`.
2. **`margin-right:4px` / `margin-bottom:4px` in inline styles** — ~35 instances across `auth.html`, `employees.html`, `insights.html`. All should be `var(--space-1)`.
3. **`<h3>` visually overridden to `--text-heading-2`** — 5 pages do this for empty states. Either use `<h2>` or stop overriding the size.
4. **`#fff` instead of `var(--color-text-on-primary)`** — 2 pages. Will break if someone changes the primary color to a light shade.
