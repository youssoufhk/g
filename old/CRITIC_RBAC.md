# CRITIC_RBAC.md — Role-Based Access Control Audit
**Auditor:** Security critic (automated)
**Date:** 2026-04-11
**Scope:** All HTML files in `prototype/`, plus `_shared.js` role switcher logic
**Supersedes:** Previous CRITIC_RBAC.md (2026-04-10) — this is a full re-audit of current code state

---

## RBAC Architecture Summary

Three roles: `admin > pm > employee`.
- `data-min-role="admin"` hides from PM and Employee via `_applyRoleVisibility()`.
- `data-min-role="pm"` hides from Employee only.
- `data-sensitive="financials|billing|salary|hr"` hides from Employee role.
- Sidebar `Work` section is now correctly gated under `<span data-min-role="pm">`.
- Keyboard G+ navigation: `restrictedForEmployee` blocklist exists but has gaps.
- All gating is client-side CSS only (prototype limitation acknowledged).

---

## CRITICAL Findings

### [CRITICAL] insights.html | AI Insights card — Anomalies/Trends/Recommendations tabs | No `data-min-role` gate
The entire "AI Insights" card with three tabs (`#tab-anomalies`, `#tab-trends`, `#tab-recommendations`) has **no role gate**. An Employee who navigates directly to `insights.html` via URL sees:
- Anomalies tab: Bob Taylor's €340 hotel expense is 2× his average (another employee's personal expense data)
- Anomalies tab: David Park has no timesheet entries for Mar 28–29 (colleague's attendance data)
- Anomalies tab: Carol Williams submitted similar €85 meals expense twice (another employee's expense pattern)
- Anomalies: "Notify Employee" action button — an Employee could trigger HR notifications about their own colleagues
- Trends tab: team-wide work time trajectory analysis
- Recommendations tab: management recommendations about headcount and assignments

The `aiResponse` div is correctly gated with `data-min-role="pm" data-sensitive="financials"`, but the entire insight card section above it is not.

### [CRITICAL] insights.html | Analytics section — all tabs except Revenue and Client Health | No `data-min-role` gate
The Analytics section at line 836 onward includes tabs: Work Time (`#tab-worktime`), Expenses (`#tab-expenses`), Projects (`#tab-projects`), Leave Patterns (`#tab-leave-patterns`), Team Performance (`#tab-team-performance`), Scheduled Reports (`#tab-scheduled-reports`), Forecasting (`#tab-forecasting`). None of these have `data-min-role` attributes.

The `tab-revenue` and `tab-client-health` tabs are correctly gated, but the remaining 7 analytics tabs expose team performance rankings, individual employee work time percentages, expense analytics by employee, and leave pattern data to any Employee who navigates directly to `insights.html`.

### [CRITICAL] _shared.js sidebar | `employees.html` nav item | Employee can access full Team Directory with no gate
The sidebar emits `navItem('employees.html', 'users', 'Team Directory')` at line 1059 with no `data-min-role`. The employees.html profile view exposes each colleague's:
- Work time percentage (in the profile hero)
- Expense history amounts (the Expenses tab in profile detail)
- Project revenue contributions (via the Timesheets tab in detail)
- Skills, proficiency levels, and performance history

None of these sections within employees.html have `data-sensitive` or `data-min-role` gates. An Employee can view any colleague's complete financial profile.

### [CRITICAL] projects.html | "Add Team Member" button and modal | No `data-min-role="pm"` gate
The `#addTeamMemberBtn` button (line 1380) and the `#addTeamMemberModal` div (line 2059) have **no `data-min-role`** attribute. The `newProjectBtn` is correctly gated with `data-min-role="pm"`, but inside the project detail view, the "Add Team Member" action is ungated. An Employee viewing a project detail can click this button and trigger the team assignment modal.

Additionally, the dynamically rendered `generic-team-tab` content (line 2717) renders an "Add Team Member" button inline with no role gate:
```
<button class="btn btn-primary btn-sm" onclick="document.getElementById('addTeamMemberModal').classList.add('active')">
```
This button appears for any role.

### [CRITICAL] admin.html | Edit/Deactivate user buttons in Users table | No `data-min-role` on individual action buttons
The Users table rows (lines 445–545) each contain `Edit` and `Deactivate` buttons with no `data-min-role` attribute. The parent `populated-content` div IS gated with `data-min-role="admin"` (line 221), but the individual action buttons themselves have no independent gating. If DOM manipulation, role flash, or CSS override reveals the table, the destructive Deactivate buttons are fully operable with no secondary gate.

### [CRITICAL] admin.html | Departments/Holidays tab — Delete buttons | No `data-min-role` gate
The Departments tab (lines 598–638) and Holidays tab (lines 921–984) each have `Edit` and `Delete` buttons with **no `data-min-role`** attribute. The page-level `data-min-role="admin"` gate is on the parent `populated-content`, but the delete buttons themselves — `onclick="openDeleteDeptModal('Engineering')"` etc. — have no independent authorization check. Defense in depth is absent.

---

## HIGH Findings

### [HIGH] index.html | Dashboard "Recent Activity" feed | Employee sees management-level activity about all colleagues
The Recent Activity feed (line 1342) contains items like "John Smith approved Alice Wang's leave (Apr 14–18)" and "Invoice INV-2026-041 generated for Acme Corp." These items have no `data-min-role` gate (the invoice item at line 1383 has `data-sensitive="financials"` for the financial amount, but the item itself is visible). An Employee sees a live management-level log of HR decisions and approvals affecting their colleagues.

### [HIGH] insights.html | "Notify Employee" action button | Employee can dispatch HR notifications
Inside `#tab-anomalies`, the "Notify Employee" button (line 671) executes `data-action="notify"` with the handler showing a toast "Notification sent to employee." This button has no `data-min-role` gate. An Employee who reaches this page could trigger fake HR notification actions.

### [HIGH] insights.html | Query suggestion chips | Employee can execute PM-level queries
The suggestion chips on the AI query bar (lines 546–550) include:
- "Show me unbilled hours in March" — billing data
- "Which projects are running over budget?" — financial/PM data
- "Who has capacity next week?" — resource planning data

These chips are visible and clickable by any role with no gate. Clicking them populates the query input. The `aiResponse` output div is gated with `data-min-role="pm"`, but the chips themselves and the query input have no role restriction, creating a confusing UX where an Employee can interact with PM-level query chips but gets no response.

### [HIGH] account.html | Entire page has zero `data-min-role` or `data-sensitive` gates
`account.html` has no RBAC attributes anywhere. The page contains a "Danger Zone" with a "Delete My Account" workflow, 2FA setup, active session management with revoke buttons, and API key / integration settings. None of these are differentiated by role. A PM or Employee has the exact same account page as an Admin with no restrictions or Admin-only sections marked.

### [HIGH] portal/index.html | No authentication gate or role check
The Client Portal (`portal/index.html`) has **no access control whatsoever**. The page does not check that the visitor is an authorized client contact. Any user with the URL can view all client timesheets, approve/reject entries, download invoices, and send messages. The page doesn't load `_shared.js` (it correctly doesn't use GHR.currentRole), but that means there's also no guard against an internal employee accidentally navigating to the portal URL and performing client-side approvals.

### [HIGH] employees.html | Expense amounts in employee profile Expenses tab | No `data-sensitive` gate
The Expenses tab in any employee's profile detail shows amounts like expense totals and individual claim values. Grepping `data-sensitive` in employees.html returns no results. An Employee viewing a colleague's profile can see their complete expense history with amounts — this is financial data about a peer that should be gated with `data-sensitive="financials"`.

---

## MEDIUM Findings

### [MEDIUM] timesheets.html | Inline rate display in dynamic entry modal | No `data-sensitive` on rate
In the `timesheets.html` entry modal for logging hours, the project dropdown dynamically injects: `<span data-min-role="pm">€` + proj.rate + `/h</span>` (line 2583). The `data-min-role="pm"` gate is present — **this is correctly gated**. However, the full project name and client name visible in the dropdown are accessible to Employees, revealing which client the company bills through.

### [MEDIUM] insights.html | AI query input bar | No `data-min-role` — Employee can submit queries
The `#nlQueryInput` textarea and `#nlQuerySubmit` button have no `data-min-role`. The response output IS gated, but the query interface and chips are fully visible and interactive for Employees. This creates a broken UX: Employee interacts with the AI interface but silently gets no response (the response div is hidden). Should show an "Access Restricted" message or hide the query interface from Employees entirely.

### [MEDIUM] leaves.html | Team tab leave list | Individual leave request rows show colleague personal information
The `#team` tab (line 1004) is correctly gated with `data-min-role="pm"`, but the individual leave request rows within it contain employee personal medical status (sick leave vs. annual leave type) with no finer-grained `data-sensitive="hr"` tagging. A PM seeing sick leave details for another PM-level colleague sees personal health information without a differentiated gate.

### [MEDIUM] approvals.html | Bulk approve/reject buttons (`#bulkApproveBtn`, `#bulkRejectBtn`) | No `data-min-role`
The bulk action buttons in the sticky bulk action bar (line 715) have no `data-min-role`. While they only appear via JS when checkboxes are checked, and the entire approvals page is gated from Employee sidebar navigation, the buttons themselves have no independent role guard.

### [MEDIUM] planning.html | Allocation matrix cells | `openAllocPopover()` callable without role check
Each cell in the allocation matrix calls `openAllocPopover(this, name, project, pct)` inline on click. The matrix card is inside `data-min-role="pm"` (line 691), but the `openAllocPopover` JS function itself (line ~1150+) has no `GHR.currentRole` check. If an Employee reaches the planning page via direct URL, clicking any allocation cell opens the edit popover with a number input and Save button — no role check inside the popover logic.

### [MEDIUM] employees.html | "Edit Profile" action group | Shown to Employee viewing own profile
Line 1644: `<div style="display:flex;gap:var(--space-2);" data-min-role="pm">` — the Edit Profile actions (edit, export, deactivate) are correctly gated `data-min-role="pm"`. However, there is a separate `<button class="btn btn-primary btn-md" data-min-role="admin">` at line 1613. In between, the Profile tab content (personal details, contact info) has no `data-sensitive` gating. An Employee sees their own full profile, which is appropriate, but there is no distinction between what an Employee sees about themselves vs. what they see on a colleague's profile — everything is ungated.

---

## LOW Findings

### [LOW] _shared.js | `renderNotifications()` | "Mark all read" button does not re-filter by role
`GHR.renderNotifications()` correctly filters notification items by `minRole` (line 837). However, the "Mark all read" button handler (line ~908+) calls `GHR.renderNotifications()` without passing the current filter, causing the panel to re-render with `filter='all'` by default. This is minor but causes the active unread/mentions tab to reset after marking read.

### [LOW] _shared.js | `GHR.currentRole` defaults to `'admin'` | New session defaults to admin
Line 245: `GHR.currentRole = localStorage.getItem('ghrRole') || 'admin'`. If localStorage is cleared (private browsing, fresh session, cookie clear), the user starts as Admin. In production this is fine, but in the prototype it means a demo reviewer who clears storage unexpectedly gets Admin access. Should default to `'employee'` for safety.

### [LOW] calendar.html | No `data-min-role` on any content | Employee sees full team calendar
`calendar.html` has only one gated element: the `leaveStatusPill` (line 855, `data-min-role="pm"`). The entire calendar grid renders all team events — leave events, project deadlines, team meetings — for all roles with no filtering. An Employee can see Alice Wang is "On Leave Apr 14-18" and other colleagues' scheduled events.

### [LOW] admin.html | "Deactivate Selected" bulk button | No `data-min-role`
The `#deactivateSelectedBtn` button (line 402) appears in the Users tab bulk action bar with no `data-min-role` attribute. Parent section is admin-gated, but the button itself is ungated.

---

## Mismatch Table (Updated)

| Page | Sidebar Gate | Keyboard G+key Blocked | Page-level Gate |
|------|-------------|----------------------|-----------------|
| admin.html | YES (admin section) | YES (s blocked) | YES (data-min-role="admin") |
| invoices.html | YES (pm span) | YES (i blocked) | YES (main gated pm) |
| insights.html | YES (pm section) | YES (n blocked) | NONE — full page visible |
| approvals.html | YES (pm footer) | YES (a blocked) | PARTIAL (KPIs gated, bulk buttons not) |
| hr.html | YES (pm span) | YES (h blocked) | YES (content gated, access msg shown) |
| clients.html | YES (pm span) | YES (c blocked) | PARTIAL (Add Client gated pm, rest open) |
| gantt.html | YES (pm span) | YES (g blocked) | PARTIAL (chart gated pm, but page shell open) |
| planning.html | YES (pm span) | YES (r blocked) | PARTIAL (sections gated, popover not) |
| projects.html | YES (pm span) | YES (p blocked) | PARTIAL (newProject gated, addTeamMember not) |
| calendar.html | NO (no gate) | Not in map | NONE — full page visible |
| employees.html | NO (no gate) | Not in map | NONE — no data-sensitive on financial data |
| account.html | NO (no gate) | Not in map | NONE — no role differentiation |

---

## Total Issue Count: 20

- CRITICAL: 6
- HIGH: 5
- MEDIUM: 5
- LOW: 4
