# GammaHR v2 — Feature Completeness Audit
**Date:** 2026-04-10
**Auditor:** Product Manager Critic (Harsh Mode)
**Scope:** Every section of `specs/APP_BLUEPRINT.md` vs every HTML file in `prototype/`

---

## Severity Key
- **P0** = Broken / user-reported issue still present
- **P1** = Feature described in spec is completely missing
- **P2** = Feature exists but is incomplete or non-functional
- **P3** = Feature present but deviates from spec in a meaningful way

---

## User-Reported Issues (Verification)

| # | Status | Issue |
|---|--------|-------|
| 1 | FIXED | No Project Detail view when clicking project names — ALL projects now have data in `projectData` map, all kanban cards have `onclick="showDetail(...)"` |
| 2 | VERIFY | HR Recruitment page horizontal overflow — kanban has `overflow-x: auto`, body has `overflow-x: hidden`. CSS looks correct but needs browser verification |
| 3 | FIXED | Admin cards must be clickable — all 4 KPI stat cards have `onclick` handlers |
| 4 | FIXED | "Colleague is viewing" notification is gone — no matches found anywhere |
| 5 | FIXED | Dashboard progressive disclosure — collapsible sections with "Details" section collapsed by default |
| 6 | FIXED | Filters side-by-side on desktop — `.filter-bar-standard` uses `flex-wrap: nowrap` on desktop, `wrap` on mobile |
| 7 | VERIFY | Expenses page alignment — needs visual browser check |
| 8 | FIXED | Work Days not duplicated in admin settings — appears exactly once at line 334 |
| 9 | FIXED | Capacity vs Allocation chart removed from planning.html — no matches found |

---

## Issues Found

### 1. [P1] invoices.html | Invoice detail missing status history timeline
**Spec (Section 11.3):** "Status history timeline" is required on invoice detail view.
**Prototype shows:** No timeline. Only a static "Status: Awaiting Payment" text field. No Draft -> Sent -> Paid progression visualization.

### 2. [P1] invoices.html | Invoice detail missing payment tracking
**Spec (Section 11.3):** "Payment tracking" is required on invoice detail view.
**Prototype shows:** No payment history, no partial payment tracking, no payment method recording. The "Record Payment" button fires a toast but doesn't show any payment log.

### 3. [P2] invoices.html | Invoice generation only handles hourly billing
**Spec (Section 11.2):** System should auto-calculate "Daily rates x days", "Fixed monthly fees", "Lump sum milestones" in addition to hourly timesheet rates.
**Prototype shows:** Generate Invoice modal only shows timesheet hours x rates and expenses. No support for daily rates, fixed fees, or milestone-based billing.

### 4. [P2] invoices.html | Invoice filter missing amount range
**Spec (Section 11.1):** "Filter by: Status, Client, Project, Date Range, Amount Range"
**Prototype shows:** Filters exist for Status, Client, and Date Range, but no Amount Range slider/inputs.

### 5. [P2] invoices.html | Credit Note button has no handler
**Spec:** Invoice detail has an "Issue Credit Note" button.
**Prototype shows:** Button exists at line 759 but has no onclick handler, no modal, and no JS function. Dead button.

### 6. [P1] _shared.js | Notification panel missing tabs (All / Unread / Mentions)
**Spec (Section 17.1):** Notification center should have `[All] [Unread (5)] [Mentions]` tabs.
**Prototype shows:** Only a flat list with a "Mark all read" button. No tab filtering for Unread or Mentions.

### 7. [P2] leaves.html | Missing WFH leave type and balance card
**Spec (Section 6.1):** Leave balance cards should show 4 types: Annual, Sick, Personal, WFH (5 left of 5).
**Prototype shows:** Only 3 balance cards (Annual, Sick, Personal). WFH leave type is completely absent from both the balance cards and the leave request type dropdown.

### 8. [P2] employees.html | Employee profile missing [Edit] and [More] buttons
**Spec (Section 4.2):** Profile header should show `← Back to Team | Sarah Chen | [Edit] [More ▾]`.
**Prototype shows:** Only "Back to Team" button and breadcrumbs. No Edit button, no More dropdown for administrative actions.

### 9. [P2] employees.html | Timesheet tab missing drill-down on month click
**Spec (Section 4.2):** "Click month -> expands to show daily breakdown by project"
**Prototype shows:** Monthly summary table is static. No expand/collapse, no daily breakdown, no drill-down interaction. Rows are plain `<tr>` elements with no click handlers.

### 10. [P1] timesheets.html | No auto-save functionality
**Spec (Section 8.3):** "Auto-save: Every 30 seconds, saved as draft"
**Prototype shows:** No auto-save timer, no "Last saved" indicator, no draft status. Only manual "Save Draft" and "Submit" buttons.

### 11. [P2] timesheets.html | Missing "Save as Template" for weeks
**Spec (Section 8.3):** "Templates: Save a week as a template; apply to future weeks"
**Prototype shows:** "Start from Template" exists in the Copy dropdown (applying a generic 8h/day template), but there is no "Save current week as template" button or named template management.

### 12. [P2] calendar.html | Missing "+ Quick Leave" button in header
**Spec (Section 12.1):** Page header should show `Calendar [+ Quick Leave]`.
**Prototype shows:** Header has "Add Event" button only. No dedicated Quick Leave shortcut that pre-fills the leave request form from the calendar context.

### 13. [P1] Multiple pages | Saved Views missing from timesheets, employees, leaves, approvals
**Spec (Section 1.3):** "Saved Views: Users can save filter combinations as named views, share with team" — applies to EVERY list/table.
**Prototype shows:** Saved Views exist on gantt.html, clients.html, expenses.html, invoices.html, projects.html. Completely missing from: timesheets.html, employees.html, leaves.html, approvals.html.

### 14. [P2] clients.html | Client detail overview missing Outstanding Invoices widget
**Spec (Section 10.2):** Client detail should show "Outstanding invoices" in the overview.
**Prototype shows:** Overview tab has stat cards (Revenue, Projects, Team, Health) and a Revenue chart + Notes section. No dedicated Outstanding Invoices summary widget. Invoices are only in a separate tab.

### 15. [P3] clients.html | Client detail missing satisfaction score
**Spec (Section 10.2):** Client detail should show "Satisfaction score (if tracked)".
**Prototype shows:** No satisfaction score anywhere in the client detail view. The "Avg Project Health" stat card is a proxy but not the same as a client satisfaction metric.

### 16. [P2] portal/index.html | Projects section missing burndown charts and budget consumption
**Spec (Section 10.3):** Portal Projects should show "See burndown charts and budget consumption".
**Prototype shows:** Projects section shows team members and milestones table only. No burndown chart, no budget consumption bar, no progress visualization.

### 17. [P2] insights.html | Analytics tabs missing date range selection and comparison mode
**Spec (Section 15.1):** "Each analytics view: interactive charts, drill-down, date range selection, comparison mode (vs. last period), export to PDF/CSV"
**Prototype shows:** Analytics tabs (Work Time, Revenue, Expenses, etc.) show charts but have no date range picker and no "Compare vs last period" toggle.

### 18. [P1] _shared.js | Sidebar footer missing "Help & Shortcuts" link
**Spec (Section 0.6, 20.1):** Sidebar footer should contain "Help & Shortcuts".
**Prototype shows:** Sidebar footer only has Account link and Collapse button. No Help & Shortcuts link despite FINAL_CHECKLIST claiming this was fixed. The keyboard shortcuts panel exists (triggered by `?` key) but there is no sidebar navigation link to access it.

### 19. [P3] Spec inconsistency | Sidebar structure differs between Section 0.6 and Section 20.1
**Spec (Section 0.6):** Calendar under MAIN. Clients under WORK (no role gate). Approvals in FOOTER.
**Spec (Section 20.1):** Calendar under MAIN. Clients under WORK (PM/Admin). Invoices + Analytics under FINANCE (PM/Admin). Approvals under ADMIN (Admin only).
**Prototype shows:** Follows Section 0.6 structure. Calendar is under Work (not Main). Clients has no role gate. Approvals is under Finance with PM gating.

### 20. [P2] Multiple pages | Department names are not clickable links
**Spec (Section 1.2):** "Department -> clicking it goes to Department view (filtered employee list). Hover shows: Name, head count, manager."
**Prototype shows:** Department names appear as plain text in employee cards, admin tables, and profile views. Not clickable, no hover card, no filtered view.

### 21. [P2] employees.html | Missing "Send Message" in mini profile card
**Spec (Section 4.3):** Mini profile card should show `[View Profile] [Send Message]`.
**Prototype shows:** Mini profile hover card (from `_shared.js`) shows View Profile link but no Send Message action.

### 22. [P3] Multiple pages | Entity hover cards incomplete
**Spec (Section 1.2):** Projects should show hover card with "name, client, status, team size." Clients should show "name, active projects count, total revenue." Leave Requests should show "Status, dates, approver, balance impact."
**Prototype shows:** Only Employee hover cards are implemented via `_shared.js`. No hover cards for Project names, Client names, or Leave Request references when they appear as linked text across pages.

### 23. [P2] leaves.html | Team Leaves view missing conflict detection for same project/department
**Spec (Section 6.3):** "Conflict detection: warns if too many people from same project/department are off"
**Prototype shows:** The leave request modal has basic conflict detection (checks hardcoded date overlap with Alice Wang). The Team Leaves table has static "2 others off" text. No dynamic project/department-level conflict analysis or warnings.

### 24. [P2] timesheets.html | Missing cell hover tooltips
**Spec (Section 8.2):** "Hover cell -> Show tooltip: 'Acme Web Redesign -- 6 hours'"
**Prototype shows:** Timesheet cells show editable numbers but no hover tooltip showing the full project name and hours context.

### 25. [P2] timesheets.html | Missing weekend entry warning
**Spec (Section 8.2):** "Weekend cells -> Darker background; warn if entering hours"
**Prototype shows:** Weekend cells exist with different styling but there is no warning dialog or toast when a user attempts to enter hours on a weekend cell.

### 26. [P3] admin.html | Missing Department hierarchy management
**Spec (Section 14.1):** "Department management (create, assign managers, hierarchy)"
**Prototype shows:** Departments tab shows a flat table with name, manager, headcount, cost center. No hierarchy/tree view, no parent-department relationship, no drag-to-reorder.

### 27. [P2] admin.html | System health card shows only toast, no detail page
**Spec (Section 14.1):** "System health monitoring" implies a monitoring dashboard or at minimum a detail view.
**Prototype shows:** The System Health KPI card shows a toast when clicked with static text ("All systems operational. API: 99.97% uptime..."). No actual system health page, no historical uptime chart, no incident log.

---

## Summary

| Severity | Count |
|----------|-------|
| P0 (Broken) | 0 (user-reported issues all appear fixed in code) |
| P1 (Missing) | 5 |
| P2 (Incomplete) | 16 |
| P3 (Deviation) | 4 |
| **Total** | **27** |

### Top Priority Fixes
1. **Invoice detail** needs status timeline + payment tracking (P1) -- most visible gap in a revenue-critical flow
2. **Notification panel** needs tab filtering (P1) -- core UX pattern broken
3. **Saved Views** missing on 4 pages (P1) -- spec says every list page gets them
4. **Auto-save** on timesheets (P1) -- anti-Tempolia violation: users can lose work
5. **Sidebar "Help & Shortcuts"** link missing (P1) -- FINAL_CHECKLIST says fixed but it is not
