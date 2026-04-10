# User-Reported Issues — CRITICAL Priority

These issues were reported directly by the product owner. They MUST be flagged as CRITICAL and fixed first.

---

## Wave 1 Issues (Original)

## UI1 — Remove "colleague is viewing this page" notification
The real-time "colleague is viewing" notification is unwanted. Remove it entirely.

## UI2 — Dashboard is too packed
Too much information competing for attention. Needs breathing room and hierarchy.

## UI3 — Admin view is too packed
Same issue as dashboard — too dense, needs better visual hierarchy.

## UI4 — HR Recruitment page overflows horizontally
The recruitment kanban/page is wider than viewport, requires horizontal scrolling. Must fit within the viewport width.

## UI5 — Remove "Capacity vs Allocation" graph
The capacity vs allocation chart is not liked. Remove it.

## UI6 — Filter/search bars stacked vertically on desktop
On ALL pages, the filter buttons and search bar are stacked vertically when they should be side by side on desktop. This is a systemic layout issue.

## UI7 — Inconsistent page alignment
Some pages (like Expenses) are aligned differently from others. All pages must have consistent left alignment and content width.

## UI8 — "Work Days" duplicated in Settings
The work days setting appears twice in account.html settings page.

## UI9 — Admin cards not clickable
The admin overview cards (Pending Invites, etc.) should all be clickable/actionable.

## UI10 — No Project Detail view
Clicking a project name should open a detailed project view. This is missing or broken.

---

## Wave 2 Issues (Product Owner Review — April 11, 2026)

---

## UI11 — FOUC: Stat cards flash side-by-side then collapse to stacked
**Pages affected: admin.html, index.html (dashboard), approvals.html**

On page load, stat/KPI cards briefly appear in their correct multi-column grid layout, then instantly collapse to a stacked single-column layout. This is a jarring flash that makes the design look broken.

Root cause: grid layout is applied via CSS but a later CSS rule or JS class addition overrides it. Specifically:
- `admin.html` stat cards use an inline `grid-template-columns: repeat(4,1fr)` that gets overridden by a media query or JS-added class
- The browser renders the initial HTML, then applies a conflicting rule after paint

Fix requirement: Stat card grids must render in their correct final layout on first paint, with no visible reflow. The desktop layout (3–4 columns) must not collapse to 1 column unless the viewport is genuinely narrow.

---

## UI12 — Notification panel cannot be closed
**All pages**

The notification bell/panel opens but cannot be reliably closed. Clicking the bell again, clicking outside, or pressing Escape does not dismiss it on many pages.

Root cause (from audit): The outside-click handler in `_shared.js` exists but may be blocked by `stopPropagation()` calls on child elements, or the panel close logic is not re-registering after the panel content is re-rendered. Additionally, there is no explicit "×" close button on the panel itself.

Fix requirements:
- Clicking the bell button a second time must always close the panel
- Clicking anywhere outside the panel must close it
- Pressing Escape must close it
- Add an explicit "×" close button inside the panel header as a fallback

---

## UI13 — Timesheet overwork calculation is wrong
**timesheets.html**

The current implementation hardcodes billable % as either 100% or 0% rather than calculating it from real hours.

**Required calculation:**
- Baseline = 40 billable hours = 100% billable, 100% total work time
- If someone works 40h billable + 4h internal: show **100% billable + 10% internal = 110% total work time**
- If someone works 36h billable + 4h internal: show **90% billable + 10% internal = 100% total work time**
- Any hours beyond the 40h billable threshold are "overwork" — shown as a separate visual indicator with a distinct color (e.g. warning/amber)
- The total work time percentage can exceed 100% — this must be visually distinct (bar overflows, color changes to warning)
- This logic must apply to: individual employee rows, team summary, the approval queue, and any stat cards showing work time

---

## UI14 — Gantt chart: employee rows not synchronised with chart bars
**gantt.html**

The current gantt has TWO independently scrollable panes: a left employee list and a right chart area. When you scroll the employee list, the chart doesn't follow (and vice versa). The user cannot tell which employee a chart bar belongs to.

**Required design:**
- ONE unified scrollable area: employee name column is FIXED/STICKY on the left, the chart area scrolls horizontally
- The whole gantt scrolls vertically as one unit (one row = one employee, always aligned)
- The employee name is visible at the start of every row at all times, even when scrolled far right
- The chart area scrolls both left/right (time axis) and up/down (as the page scrolls)
- Do NOT have two separate scrollable panes — this is the core UX failure
- Month/date headers at the top of the chart must also stick when scrolling vertically

---

## UI15 — ANTI-PATTERN: Stacked cards for compact list items (SYSTEMIC)
**approvals.html, timesheets.html (approval queue), expenses.html (team expenses), leaves.html (request list), index.html (AI alerts)**

The product owner explicitly hates stacked full-width cards for list items that contain small/compact information. This is a SYSTEMIC design failure across multiple pages.

**Rule:** If an item has fewer than 5 data points and fits comfortably in a horizontal row, it MUST be a row — not a card. Cards are for rich content (profiles, project summaries, kanban items). Cards are WRONG for:
- Approval queue items (employee, type, hours/days, status, action buttons)
- Expense list items (employee, amount, category, date, status, action)
- Leave request items (employee, dates, type, balance, status, action)
- Timesheet approval items (employee, week, hours, billable %, action)
- AI alert items (icon, message, action) — compact list, not cards

**Per-page requirements:**
- `approvals.html`: All approval items → compact table rows. Checkbox, type icon, employee, details, status badge, and action buttons on ONE horizontal line
- `timesheets.html` approval queue: compact table rows
- `expenses.html` team expenses: compact table rows (not stacked expense cards)
- `leaves.html` leave request list: compact table rows
- `index.html` AI alerts: compact list items with left icon, text, and right-aligned action button — NOT cards with padding and borders

---

## UI16 — Too much text on multiple pages causes anxiety
**Systemic — affects index.html, approvals.html, admin.html, insights.html, hr.html, planning.html**

Verbose multi-sentence descriptions, long tooltips, dense settings labels, and walls of explanatory text make pages feel overwhelming rather than calm. 

**Rule:** Maximum 1 sentence per item. If something needs explanation, it goes in a tooltip or collapsed detail, not on the page surface. The visible page surface must show only the minimum needed to act.

**Specific violations found:**
- `index.html` AI alerts: 2–3 sentence descriptions per alert. Reduce to 1 short sentence + action button only
- `approvals.html` AI recommendation banner: over-explains what was found; cut to 1 sentence max
- `admin.html` settings forms: long label descriptions inline next to inputs (should be tooltips)
- `insights.html`: section descriptions and chart labels are verbose
- `hr.html` onboarding/offboarding checklists: task descriptions are too long; should be single-line items
- `planning.html` scenario descriptions: paragraphs of text explaining scenarios

---

## UI17 — Billable percentage is hardcoded, not calculated
**timesheets.html** (related to UI13)

In `timesheets.html` the JavaScript calculates `billPct = grandTotal > 0 ? '100%' : '0%'` — this is a hardcoded value, not a real calculation. The billable percentage should be `(billableHours / totalHours * 100)%`.

This means the UI always shows 100% billable or 0% billable, which is incorrect and misleading for any employee with a mix of billable and internal hours.

---

## UI18 — Gantt chart: secondary issues
**gantt.html**

Beyond the main layout issue (UI14), the gantt also has:
- No visual distinction between billable project bars and internal/bench bars
- Bob Taylor (bench) bar end date was "TBD" — now fixed to May 30 but needs to look visually different (dashed border? grey color?) to signal it's a placeholder
- The timeline header (months/days) should show current date with a vertical "today" line
- Zooming in/out (day/week/month view) is missing or incomplete — the chart should support at minimum week and month views

---

## UI19 — Leaves icon may not be rendering
**All pages — sidebar**

The product owner reported not seeing an icon for Leaves in the sidebar. The code assigns the `palm-tree` icon, but this icon may not exist in the icon library being used (Lucide). Verify the icon renders visually and replace with a known-good alternative (e.g., `calendar-off`, `umbrella`, or `sun`) if `palm-tree` is missing.

---

## UI20 — Filter bars still stacking on some pages despite systemic fix
**Multiple pages** (related to UI6 — may not be fully resolved)

Even with the `_layout.css` fix for `.filter-bar-standard`, individual pages may have page-level `<style>` blocks or inline styles that override the fix. Pages to verify:
- `expenses.html` — historically had its own filter bar alignment
- `approvals.html` — has a complex filter bar with labels + selects
- `hr.html` — recruitment tab filter bar
- `insights.html` — analytics filter bar

Each must be checked to confirm the filter bar renders as a single horizontal row on desktop (≥768px).

---

## UI21 — Approval cards in the approval queue are vertically stacked
**approvals.html** (specific callout, already covered by UI15 but needs separate tracking)

The approvals page shows each pending approval as a large full-width card. On a page designed to show 10–20 pending items, this means the user has to scroll through an enormous list of cards to process their queue. This is the opposite of efficient — it is the definition of "Tempolia-style punishment."

The page should feel like an inbox where you can scan and act on items quickly. Compact rows with inline action buttons are the correct pattern.
