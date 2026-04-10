# CRITIC_EDGE.md -- Empty States & Edge Case Audit
**Auditor:** Harsh UX Critic
**Date:** 2026-04-10
**Scope:** All 19 HTML files in prototype/

---

## Findings

### CRITICAL -- Data is shown but zero-data path has no feedback

[CRITICAL] projects.html | Filter dropdowns (Status, Client, Billing) | Filters exist in DOM (`#filterStatus`, `#filterClient`, `#filterBilling`) but have NO JavaScript change handlers. Selecting a filter does literally nothing. No filtering, no "no results" message, nothing. Dead UI.

[CRITICAL] projects.html | Project detail: Team tab | No empty state for a new project with zero team members. The `#tab-team` panel shows the Acme hardcoded table. When JS swaps to a generic project (like "Internal Portal v2" which is marked "No team assigned"), there is a `#generic-team-tab` div that gets dynamically populated -- but if it renders with zero rows, there is no "No team members assigned yet" empty state. The table just shows headers with no body.

[CRITICAL] projects.html | Project detail: Timesheets tab | No empty state for a project with zero timesheets. `#generic-timesheets-tab` is rendered dynamically but has no fallback for zero rows. A new project would show a table header and nothing else.

[CRITICAL] projects.html | Project detail: Expenses tab | Same issue. `#generic-expenses-tab` has no empty state. A new project with zero expenses shows nothing.

[CRITICAL] projects.html | Project detail: Invoices tab | Same pattern. `#generic-invoices-tab` can render with zero rows and no fallback message.

[HIGH] clients.html | Client detail: Team tab | No empty state. If a client has no team members assigned to any project, the tab shows the hardcoded Acme team list or nothing. There is no "team-empty-state" div for the team tab (confirmed: `team-empty` grep returns zero results in clients.html).

[HIGH] clients.html | Client detail: Invoices tab | No empty state. If a client has zero invoices, the tab shows the data table with headers and no rows. No "No invoices yet" message (confirmed: `invoices-empty` grep returns zero results in clients.html).

[HIGH] hr.html | Recruitment kanban search | The `#kanbanSearch` input hides non-matching cards via `card.style.display = 'none'`, but when ALL cards are hidden (search returns zero), there is no "No candidates match your search" message. The kanban columns just look empty with the generic dashed-border "No candidates in this stage" per column (which is misleading -- it implies no candidates exist, not that the search filtered them out).

[HIGH] hr.html | Records tab: Lifecycle Events table | The filter button shows a toast "coming soon" but the table itself has no search or filter. If the table were empty (new company, zero lifecycle events), there is no empty state for this section. The Records tab relies on the global empty state toggle but has no per-section empty state for the lifecycle events table specifically.

[HIGH] admin.html | Individual tab empty states | When the global empty state is toggled, ALL tabs go empty at once with one generic message "No settings data." But individual tabs (Users, Departments, Leave Types, Expense Types, Holidays, Audit Log) have no per-tab empty state. A new company might have zero departments but some users. The search no-results rows exist (e.g., "No users match your search") but there is no "You haven't created any departments yet" style onboarding empty state per tab.

[HIGH] invoices.html | Invoice detail view | The detail view always shows a fully populated invoice (INV-2026-048). There is no handling for what a draft invoice with zero line items looks like, or what happens when viewing an invoice that has been voided/deleted.

[MEDIUM] calendar.html | Brand new company | The calendar renders an empty grid with no events. When no events exist at all, day cells just show the date number. There is a `searchEmptyState` for search, but no overall "No events scheduled" empty state for a completely empty calendar. A new user sees a blank grid with no guidance.

[MEDIUM] gantt.html | Filter panel: no-results | The Gantt chart has extensive filters (department, project, skills, status). When filtering returns zero matching employees, there is JS to create a "no-results message" (`line ~2207`) but it relies on dynamic rendering. The filter panel itself has no visual "Clear all filters" button within the no-results state to reset.

[MEDIUM] insights.html | Scheduled Reports tab | The tab content shows 3 pre-built scheduled reports. There is no empty state for a user who has not set up any scheduled reports. The "insufficient data" empty states are injected into analytics tabs but NOT into the Scheduled Reports tab.

[MEDIUM] insights.html | Forecasting tab | Same issue as Scheduled Reports. The forecasting tab shows pre-populated projection data. No empty state for when there is insufficient historical data to generate a forecast (different from "insufficient data for this view" which is about the current filter).

[MEDIUM] leaves.html | Team tab: search/filter no-results | The Team approval tab shows a table of team leave requests. There is no search or filter on this tab and no "No results" state if a manager's team has submitted zero leave requests that match their view (the global empty state covers the completely-empty case, but not a partial case like "no pending requests").

[MEDIUM] expenses.html | Team Expenses tab: filter state | `#teamExpenseEmpty` exists (display:none by default) for "no results," but there is no "Clear filters" CTA in that empty state to help the user recover. The user sees "No matching expenses" but has to manually reset filters.

[MEDIUM] timesheets.html | Approval Queue tab | `#approvalQueueEmpty` exists for zero results from filters, but when ALL timesheets in the queue are approved and cleared, the empty state says "No timesheet submissions match your filter" which is the wrong message. It should say "All timesheets approved" with a success/celebration state (like approvals.html does correctly).

[LOW] employees.html | Profile: Leaves tab | The profile has empty states for Timeline, Projects, Timesheets, Expenses, Skills, and Documents tabs. But the Leaves tab content always shows hardcoded leave history rows. There is no `profile-tab-empty` div inside the Leaves tab for a new employee with zero leave history.

[LOW] portal/index.html | Timesheet flagging: empty reason field | The flag action has an input for "Reason for flagging..." but no validation that the reason field is actually filled in before submitting. A client could flag a timesheet entry with an empty reason.

[LOW] clients.html | Add Client modal | The modal has required fields marked with `*` (Client Name, Contact Name, Email) but no JavaScript validation logic for the form. No `field-error-text` elements, no red border on invalid fields, no error toast on empty submission. The form just closes on submit.

[LOW] hr.html | Add Candidate modal | Required fields (Candidate Name, Role) use native HTML `required` attribute but there is no custom validation UX (inline error messages, field highlighting). The native browser tooltip is the only feedback.

[LOW] account.html | Notification Preferences | The notification toggles are static checkboxes. There is no feedback for save state, no "Preferences saved" confirmation, and no error state if saving fails.

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 5     |
| HIGH     | 5     |
| MEDIUM   | 6     |
| LOW      | 5     |
| **TOTAL**| **21**|

### Worst offenders by page:
1. **projects.html** -- 5 issues (filter dropdowns are dead, 4 detail tabs have no empty states)
2. **clients.html** -- 3 issues (Team tab, Invoices tab, Add Client form)
3. **hr.html** -- 3 issues (kanban search no-results, records filter, candidate form)
4. **admin.html** -- 1 issue but it affects 6 sub-tabs
5. **insights.html** -- 2 issues (Scheduled Reports + Forecasting tabs)

### Pattern: The global "Toggle Empty State" mechanism is solid but masks per-section gaps.
Most pages have a dev-toggle that swaps the entire page between populated and empty. This was clearly built for demo purposes. But real users don't experience "fully empty" or "fully populated" -- they experience partial states (some tabs have data, others don't; some filters match, others don't). The per-section, per-tab, per-filter empty states are where the gaps are.
