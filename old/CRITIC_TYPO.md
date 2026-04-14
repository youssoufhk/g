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

---

## Round 2 Findings — 2026-04-11

---

### Issue 26 — Undefined token `--text-display-sm` used in `account.html` MFA input
**Severity:** HIGH
**File:** `prototype/account.html:1461`
`font-size: var(--text-display-sm)` is used for the 6-digit MFA verification code input. This token does NOT exist in `_tokens.css`. Defined display tokens are only `--text-display-xl` and `--text-display-lg`. The undefined token silently falls back to the inherited body font size (14px), making the large verification code field look no different from a regular input — the opposite of what was intended. Should use `var(--text-display-lg)` or `var(--text-heading-1)`.

---

### Issue 27 — Hardcoded pixel font-sizes `10px`, `9px`, `8px` in `_layout.css` bottom nav and collapsed sidebar
**Severity:** MEDIUM
**File:** `prototype/_layout.css:604, 629, 85, 400`
- Bottom nav label: `font-size: 10px` (line 604) — no 10px token. Nearest is `var(--text-caption)` (12px).
- Bottom nav badge: `font-size: 9px` (line 629) — no 9px token.
- Collapsed sidebar badge: `font-size: 8px` (lines 85, 400) — no 8px token.
These sub-caption sizes are used in high-density chrome elements (badges, labels on navigation items). They bypass the token system and will not scale with any planned responsive type scaling.

---

### Issue 28 — Hardcoded `font-size: 10px` on `employees.html` timesheet history badges (15+ occurrences)
**Severity:** MEDIUM
**File:** `prototype/employees.html:2142–2268`
Every Billable/Non-billable badge in the employee timesheet history tab uses an inline `style="font-size:10px;"`. The token `var(--text-caption)` is 12px. These 10px values are below the minimum readable size on most screens. All should be replaced with `var(--text-caption)` to align with the badge system in `_components.css`.

---

### Issue 29 — Hardcoded `font-size: 11px` in `admin.html` `.help-icon` class
**Severity:** MEDIUM
**File:** `prototype/admin.html:40`
`.help-icon { font-size: 11px; }` — hardcoded pixel value outside the token system. The token `var(--text-overline)` is 11px (0.6875rem) and would be semantically appropriate here. All hardcoded pixel font-sizes in inline `<style>` blocks should reference tokens.

---

### Issue 30 — Heading hierarchy: all pages have `<h2 class="page-title">` in sticky top header AND `<h1 class="page-title">` in main content
**Severity:** HIGH
**File:** All 14 main app pages (e.g. `index.html:617 + 668`, `expenses.html:500 + 553`, `leaves.html:574 + 627`, etc.)
Every page presents two headings for the same concept — the page title: an `<h2>` inside the mobile sticky header and an `<h1>` in the main page body. Semantically there should be exactly one `<h1>` per page. The sticky header title is the same text as the page body h1, creating a duplicate landmark and a heading hierarchy where an `h2` precedes the `<h1>` in DOM order on pages where the sticky header renders before main content. Additionally, `gantt.html` only has the `<h1>` version (no sticky header h2 was found), making it inconsistent with other pages.

---

### Issue 31 — `<h4>` used directly after `<h1>` in `expenses.html` Policy Compliance panel (skips h2 and h3)
**Severity:** MEDIUM
**File:** `prototype/expenses.html:937`
`<h4>Policy Compliance</h4>` appears inside the AI scan sidebar of the Submit Expense form. The nearest ancestor heading is the page-level `<h1>`. There is no `<h2>` or `<h3>` in the form section — the `h4` skips two levels. This breaks screen reader navigation (users navigating by heading level will not find this section). Should be `<h3>`.

---

### Issue 32 — `<h4>` styled as `--text-heading-3` in `clients.html` Add Client modal (visual identity mismatch)
**Severity:** MEDIUM
**File:** `prototype/clients.html:1446`
`<h4 style="font-size: var(--text-heading-3);">Primary Contact</h4>` — the element is semantically an h4 but sized to look like an h3. This is both a heading hierarchy violation (no h3 precedes it in the modal body) and a token usage confusion. Should be `<h3>` to match visual size and correct the hierarchy.

---

### Issue 33 — `section-title` defined at `--text-heading-2` in `employees.html` local style but `.card-title` uses `--text-heading-3` globally
**Severity:** MEDIUM
**File:** `prototype/employees.html:376–380` vs `prototype/_components.css:314–317`
The local `.section-title` class is defined in `employees.html`'s `<style>` block as `font-size: var(--text-heading-2)` (20px). The global `.card-title` in `_components.css` is `--text-heading-3` (16px). Employee profile section headings (Active Projects, Leave History, etc.) render 25% larger than card titles on every other page, creating visual inconsistency between the employee profile and all other detail views.

---

### Issue 34 — `settings-section-title` class used on `<div>` in `account.html` vs `<h3>` in `admin.html` — semantic inconsistency
**Severity:** MEDIUM
**File:** `prototype/account.html:820, 865, 889, 924, 969, 989` vs `prototype/admin.html:265, 292, 336, 368`
In `admin.html`, `.settings-section-title` is applied to `<h3>` elements — correct. In `account.html`, the same class is applied to `<div>` elements for section labels ("Basic Information", "Work Email", "Change Password", etc.). These divs are not semantically headings, making the account settings page inaccessible to screen reader users navigating by headings. All should be `<h3>`.

---

### Issue 35 — Mixed `letter-spacing` raw pixels vs token: `0.5px` vs `var(--letter-spacing-caps)`
**Severity:** LOW
**File:** Multiple HTML files — `gantt.html:338, 687, 856`, `leaves.html:399`, `employees.html:734`, `clients.html:816, 821, 826, 1061–1064`, `expenses.html:1499–1502`, `timesheets.html:126, 252, 268`; and CSS files `_components.css:380, 516, 946, 1033, 1088, 2206`
Uppercase label letter-spacing is applied both as `letter-spacing: 0.5px` (hardcoded pixel) and `letter-spacing: 0.05em` / `var(--letter-spacing-caps)`. The `_tokens.css` defines `--letter-spacing-caps: 0.05em`. At 14px base size, `0.05em = 0.7px` — close to `0.5px` but not identical. All uppercase label letter-spacing must be standardized to `var(--letter-spacing-caps)`.

---

### Issue 36 — Inconsistent section-between spacing: `space-10` vs `space-8` vs `space-12` with no documented rule
**Severity:** MEDIUM
**File:** `prototype/index.html:824, 899, 970` (space-10); `index.html:1231`, `auth.html:34, 199` (space-8); `admin.html:15` (space-12)
Major content sections between cards use varying margin-bottom values with no documented grid rhythm rule: `var(--space-8)` (32px), `var(--space-10)` (40px), and `var(--space-12)` (48px) are all used for the same semantic purpose — separation between major content cards within a page. There should be a single canonical "section spacing" token (e.g., `--space-section: var(--space-8)`) applied consistently.

---

### Summary — Round 2 Addition

| Severity | Count (Round 2) |
|----------|-----------------|
| HIGH     | 2               |
| MEDIUM   | 8               |
| LOW      | 1               |
| **Round 2 Total** | **11** |
| **Grand Total (both rounds)** | **36** |
