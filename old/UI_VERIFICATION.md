# UI Verification — 21 User-Reported Issues
**Date:** April 12, 2026
**Verified by:** Enhancement pass agent

---

| Issue | Title | Status | Notes |
|-------|-------|--------|-------|
| UI1 | Remove "colleague is viewing" notification | FIXED | Zero instances remain in any file |
| UI2 | Dashboard is too packed | FIXED | Collapsible sections + spacing added; hierarchy improved |
| UI3 | Admin view is too packed | FIXED | Tabbed UI isolates concerns; breathing room via section padding |
| UI4 | HR Recruitment page overflows horizontally | FIXED | Mobile kanban collapses to tabs; body overflow-x:hidden |
| UI5 | Remove "Capacity vs Allocation" graph | FIXED | Zero instances remain in any file |
| UI6 | Filter/search bars stacked vertically | FIXED | `.filter-bar-standard` in `_layout.css` enforces row on desktop |
| UI7 | Inconsistent page alignment | FIXED | All pages use `.page-content` with `max-width: 1400px; margin: auto` |
| UI8 | "Work Days" duplicated in Settings | FIXED | "Work Days" appears exactly once (admin.html) |
| UI9 | Admin cards not clickable | FIXED | All 4 stat cards have `cursor:pointer` + `onclick` handlers |
| UI10 | No Project Detail view | FIXED | Full detail view with 7 tabs, `showDetail()`, Escape-to-close |
| UI11 | FOUC on stat cards | FIXED-NOW | Added `body.show-populated .populated-content .grid-4 { display: grid; }` in admin.html |
| UI12 | Notification panel cannot be closed | FIXED | Backdrop, Escape, X button, bell toggle all working |
| UI13 | Timesheet overwork calculation wrong | FIXED | Uses `billableHours / BASELINE * 100` (BASELINE=40) |
| UI14 | Gantt two independent scroll panes | FIXED | Single `.gantt-container` with sticky `.gantt-name-col` |
| UI15 | Stacked cards for compact list items | FIXED | All 5 locations use `action-row` pattern |
| UI16 | Too much text causes anxiety | FIXED-NOW | Shortened planning.html scenario descs to 1 sentence; trimmed approvals.html AI banner |
| UI17 | Billable % hardcoded | FIXED | `recalculate()` uses canonical formula `billableHours / 40 × 100` |
| UI18 | Gantt secondary issues | FIXED | Billable/internal colors distinct; bench dashes; today line; zoom controls present |
| UI19 | Leaves icon not rendering | FIXED | Sidebar uses `umbrella` (valid Lucide icon), not `palm-tree` |
| UI20 | Filter bars stacking on some pages | FIXED-NOW | Added `@media (min-width: 769px) { flex-wrap: nowrap }` to approvals.html; switched insights.html toolbar to `filter-bar-standard` |
| UI21 | Approval cards vertically stacked | FIXED | All items use `action-row` compact horizontal layout |

---

**Summary:** 21/21 issues addressed. 18 were already FIXED. 3 fixed in this pass (UI11, UI16, UI20).
