# CRITIC_EDGE.md — Empty States & Edge Cases Audit
**Auditor:** UX critic (automated)
**Date:** 2026-04-11
**Scope:** All 19 HTML files in `prototype/` + `portal/index.html`
**Supersedes:** Previous CRITIC_EDGE.md (2026-04-10) — re-audit of current code

---

## Summary Note

Several issues from the April 10 audit have been partially or fully fixed:
- `projects.html` detail tabs now have proper empty states in JS (team, timesheets, expenses, invoices all render empty states correctly)
- `clients.html` team, invoices, and timesheets detail tabs now have empty state divs
- `insights.html` Scheduled Reports and Forecasting tabs now have empty state divs
- `hr.html` kanban search per-column empty states are now injected by JS

The following are new or remaining unresolved issues found in the current code.

---

## CRITICAL Findings

### [CRITICAL] projects.html | Filter dropdowns still dead — no change handlers wired
`#filterStatus`, `#filterClient`, and `#filterBilling` select elements now DO have a `filterProjects` function (line ~3080) called via `addEventListener`. However: the empty state check at line 3099 only shows the empty state when `visibleCount === 0 && (statusVal || clientVal || billingVal)`. If filtering is removed (user resets a dropdown to "All"), the empty state correctly hides — BUT the condition `(statusVal || clientVal || billingVal)` evaluates the raw select value, not `!== 'all'`. The check `billingVal` uses the raw option text like "Hourly" or "Fixed Price", and compares via `billingAliases`. If no `billingAliases` match (because the dropdown value doesn't correspond to any alias), `billingMatch` stays `true` for all rows and no empty state triggers even when zero rows should match. The filter gives silently wrong results for Billing filter combinations.

### [CRITICAL] portal/index.html | Timesheet filter — no empty state when filter returns 0 rows
`applyTsFilter()` at line 1842 hides rows but never shows/hides the `#tsEmptyState` div. If a client has approved all timesheets and clicks "Pending Approval" filter, the table body becomes empty but no empty state message appears — the table shows only headers with a blank body. The `#tsEmptyState` div exists but is never toggled by the filter function. Only the initial load (no timesheets at all) shows it. A filtered-empty state ("No pending timesheets right now — all caught up!") is missing.

### [CRITICAL] planning.html | No empty states on any section
The entire Resource Planning page has zero empty state handling. Sections affected:
- Capacity overview month cards: if no employees or projects exist, cards show empty grids with no "Add your first employee" prompt
- Bench forecast section: if nobody is on bench, section body is empty with no "All team members are assigned!" message
- Allocation matrix: if no employees or projects exist, shows an empty table with column headers only
- What-If Scenarios: if there is no historical capacity data to model against, the scenario still renders a projection chart with hardcoded values
- The "Toggle empty state" developer control does NOT exist on this page (unlike most others)

### [CRITICAL] insights.html | AI Anomalies/Trends/Recommendations tabs | No empty state for zero anomalies
The `#tab-anomalies`, `#tab-trends`, and `#tab-recommendations` tabs have no empty state. The `insufficient-data` empty state is injected into analytics tabs (line 2225) but NOT into these three AI insight tabs. If all anomalies are dismissed (the "Mark as OK" / "Dismiss" buttons remove cards via `card.remove()`), the tab panel becomes completely empty — just whitespace. There is no "No anomalies detected — your team is running smoothly" empty state.

### [CRITICAL] calendar.html | Filter/search returns zero events — no empty state
The calendar page has a filter bar with category buttons (Meetings, Leaves, Deadlines, Birthdays) and a `#filterSearch` input. The JS at line ~1818 filters the visible event list but provides no empty state when zero events match the search term. Typing a search term that matches nothing leaves the calendar grid unchanged and the event sidebar list blank with no "No events matching your search" message.

---

## HIGH Findings

### [HIGH] leaves.html | "My Requests" tab — no empty state for a new employee with zero requests
The "My Requests" tab shows a list of the current employee's submitted leave requests. The `empty-content` div (line ~1207) covers the entire leaves page when toggled, but the `#my-requests` section within the populated view has no per-section empty state for an employee who has never submitted a leave. They see the balance cards at the top (correctly populated) and then an empty table below with no "You haven't requested any leave yet" message.

### [HIGH] timesheets.html | Month view heatmap — no empty state for a month with zero timesheets
The `#tab-month` tab has an `#tab-month-empty` div (line 1231) for the dev toggle but this only appears when `isEmptyState` is toggled globally. For a real partial-empty case — a month where the user logged some weeks but not all — the heatmap renders days with no hours as blank cells. There is no inline "No timesheets logged this month" message for months where the user has submitted zero timesheets. The blank heatmap with grey cells is indistinguishable from "data is loading" vs "no data exists".

### [HIGH] employees.html | Profile — switching to a different employee (generic profile) | Most tabs show hardcoded Sarah Chen data
When navigating to `employees.html#john-smith` or any non-Sarah employee, the profile JS switches to a generic profile. However, the Leaves tab (line 1974) always shows the same hardcoded leave history table and leave balance cards regardless of which employee is selected. The tab-content is never cleared or replaced for the non-default employee. Only the `profile-tab-empty` div is togglable by the dev toggle — the real non-Sarah profile always shows Sarah's leave data.

### [HIGH] admin.html | Departments tab and Leave Types tab | No per-tab empty state for zero records
The Departments tab shows a table with 6 departments. If all departments were deleted, the table shows just the header row with no "Add your first department" prompt. Same issue on the Leave Types and Expense Types tabs. Unlike the Users tab which has a "No users match your search" row, there is no "You haven't created any departments yet" onboarding empty state for zero-record scenarios. The global `empty-content` empty state is too coarse.

### [HIGH] clients.html | Projects tab in client detail — no "all projects completed" state
The Projects tab in the client detail view shows active and completed projects. When ALL projects for a client are completed (archive state), the tab still shows the completed project list. There is no "All projects completed for this client — start a new project" state that appears when no active projects exist. The `#projects-empty-state` div (line 984) only shows for a client with zero projects total.

### [HIGH] insights.html | AI query bar — no loading state shown when waiting for response
When a user submits a query via `#nlQueryInput`, the `nlQuerySubmit` handler shows a loading state in the button, but the `#aiResponse` div (which is hidden until a response exists) has no inline "Thinking..." skeleton state. There is a delay before the response appears and during this period the UI looks frozen — no spinner, no progress indicator, nothing in the response area. This creates uncertainty about whether the query registered.

### [HIGH] gantt.html | Filter panel — "Clear filters" button in no-results state has no handler
The `#filterNoResults` div (injected at line 2152–2157) shows "No team members match your search." but has no "Clear filters" button. A user who has applied department + skills + project filters and gets zero results has to manually identify and reset each filter. The no-results message should include a "Clear all filters" CTA that resets all filters and the search input. This was flagged in the prior audit (MEDIUM) but remains unfixed.

---

## MEDIUM Findings

### [MEDIUM] expenses.html | Team Expenses tab — no "all cleared" celebration state
When all team expenses in the approval queue are approved, `#approvalEmpty` is shown (line 1238). But for the Team Expenses tab (`#tab-team-expenses`), when all expenses are approved, the tab shows zero expense rows with no cleared state. The `#teamExpenseEmpty` div (line 1049) now correctly shows with a "Clear filters" CTA when filters yield no results, but NOT when all items are approved and removed. These are two different scenarios that need two different messages.

### [MEDIUM] leaves.html | Team tab — search/filter combination: no "no results" state
The Team Leaves tab shows a table of all team members' leave requests. There is no search or filter on this tab. If a PM is managing a small team where nobody has submitted any leave requests yet, the tab shows an empty table with column headers and no "Your team has no pending leave requests" message. The `#team-empty` section exists as a global dev toggle target but it replaces the entire page body, not just the team tab section.

### [MEDIUM] timesheets.html | Approval Queue — wrong empty state message when all items are cleared
`#aqEmptyState` is shown when `filterApprovalQueue()` finds zero results. The message reads "No timesheet submissions match your filter" — this is the correct filter-empty message. But when ALL timesheets in the queue are approved one by one (via approve buttons), the same message appears. It should say "All timesheets approved — great work!" with a success visual (matching the pattern in `approvals.html`).
The `approvals.html` page has a contextual empty state with a pulsing checkmark and personalized message. The `timesheets.html` approval queue uses the same generic filter-empty message for both scenarios.

### [MEDIUM] hr.html | Onboarding tab — "active onboardings" list has no filter/search
The onboarding tab shows a list of employees currently in onboarding. There is an "All-complete empty state" (line 1005) for zero onboardings. But there is no search or filter on this tab. If a company has 20 employees onboarding simultaneously, the list is unnavigable. More critically, there is no filter for "Week 1", "Week 2", "Completed checklist items" etc. The tab has no partial-empty or filter-empty state for any filtered view.

### [MEDIUM] insights.html | Tab-count badges on AI insight tabs show stale numbers after dismiss
The tabs at line 607 show `<span class="tab-count">3</span>` for Anomalies, `<span class="tab-count">2</span>` for Trends, `<span class="tab-count">3</span>` for Recommendations. When a user dismisses an anomaly card (via "Mark as OK" or "Dismiss" button, which calls `card.remove()`), the badge count on the tab is NOT updated. After dismissing all 3 anomalies, the Anomalies tab still shows "Anomalies 3" with an empty panel body. The tab-count should decrement on each dismiss and clear (or hide) when it reaches 0.

### [MEDIUM] account.html | Notification Preferences tab — no save confirmation or error state
The Notification Preferences section (in the Preferences tab) shows a list of toggle checkboxes for email/push notification settings. There is no "Save Preferences" button — changes appear to auto-save (or not save at all). No confirmation toast fires when toggles are changed, no "Saved" indicator appears, and no error state is shown if saving hypothetically failed. The user has no feedback that their preference changes were recorded.

### [MEDIUM] portal/index.html | Messages tab — no "composing" or "sent" state
The Messages tab has a reply input and "Send" button. After sending a message (clicking Send), the handler fires `GHR.showToast()` but the message does not appear in the conversation thread. The thread shows only the pre-seeded messages. A new user sending their first message gets no confirmation that it was sent, and the thread doesn't update to show their message.

---

## LOW Findings

### [LOW] projects.html | Board view (Kanban) — no per-column empty state
The Kanban board view has columns for Planning, Active, and Completed projects. The global empty state is correctly shown when zero projects exist. But there is no per-column empty state. If all Active projects complete and move to Completed, the "Active" column shows just the column header with an empty drop zone and no "No active projects — great velocity!" message.

### [LOW] expenses.html | My Expenses tab — no empty state for specific receipt category filter
The My Expenses tab has a category filter. If a user selects "Travel" and has no travel expenses, the expense list shows empty. The `#emptyExpenses` div (line 851) is shown for zero total expenses, but not for zero expenses in a specific category filter. The user sees a blank list with no "No travel expenses logged" message.

### [LOW] clients.html | Add Client modal — no validation UX on required fields
The Add Client modal marks fields with `*` (required) but JavaScript form submission at the "Add Client" button has no inline validation. Clicking "Add Client" with empty Name or Email fields closes the modal without validation — a toast appears but no field-level error is shown. Required field validation should highlight the empty field with a red border and inline error text.

### [LOW] hr.html | Add Candidate modal — native browser validation only
The Add Candidate modal uses the native HTML `required` attribute, resulting in browser-native tooltip validation. This is inconsistent with the rest of the app which uses custom GHR validation styling. The modal should use custom validation (red border, inline error text beneath the field) matching the pattern used in `approvals.html` reject modal.

### [LOW] invoices.html | Invoice detail — no state for a voided/cancelled invoice
The invoice detail view always shows a fully editable invoice. There is no handling for what a voided invoice looks like — no "Voided" badge treatment, no locked/read-only state for a cancelled invoice, no "This invoice has been voided" banner. The status filter has "Cancelled" as an option but the detail view has no corresponding UI state.

### [LOW] auth.html | Company registration wizard step 4 (Customize) — no validation before completion
Step 4 of the company registration wizard allows finishing with no logo, no timezone selected (it defaults to a value), and no team size confirmed. The "Complete Setup" button fires immediately with no validation of whether critical fields are filled. A new company with a completely blank customization step proceeds to the dashboard without any confirmation of what settings were applied.
