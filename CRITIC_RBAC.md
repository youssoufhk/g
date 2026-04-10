# RBAC Security Audit -- GammaHR v2 Prototype

**Auditor:** Security-minded product manager (automated critic)
**Date:** 2026-04-10
**Scope:** All HTML files in `prototype/`, plus `_shared.js` role switcher logic

---

## Summary of RBAC Architecture

The system uses three roles: `admin > pm > employee`.

- `data-min-role="admin"` hides elements from PM and Employee via `display:none`.
- `data-min-role="pm"` hides elements from Employee only.
- `data-sensitive="financials|billing|salary"` hides from Employee role.
- Sidebar sections are gated: Finance section (`data-min-role="pm"`), Admin section (`data-min-role="admin"`).
- Keyboard shortcuts have a `restrictedForEmployee` blocklist.
- All gating is **client-side CSS only** (expected for a prototype, but gaps still matter for demo fidelity).

---

## CRITICAL Findings

### [CRITICAL] _shared.js | Sidebar "HR" section | Employee can see and navigate to HR (Recruitment)
The sidebar's "HR" section containing `hr.html` (Recruitment) and `employees.html` (Team Directory) has **no `data-min-role` gate**. An Employee can see and click through to the full Recruitment module. The HR page itself gates content with `data-min-role="pm"` once loaded, but the nav item is visible and clickable, and the page loads before hiding content (flash of restricted content).

### [CRITICAL] _shared.js | Sidebar "Work" section | Employee can navigate to Clients, Gantt, Planning
The sidebar "Work" section shows `projects.html`, `gantt.html`, `clients.html`, `planning.html`, and `calendar.html` to **all roles including Employee** with no `data-min-role` gate. An Employee has no business seeing client lists, resource planning, or Gantt charts of other employees' assignments.

### [CRITICAL] _shared.js:520 | Keyboard shortcuts | Employee can navigate to Projects (G+P not blocked)
The `restrictedForEmployee` map blocks `s,i,a,c,r,h,g,n` but **does NOT block `p` (projects.html)**. An Employee can press G+P and land on the full Projects page, which exposes project details, billing rates (gated with `data-sensitive="billing"` but table structure is still visible), and team assignments.

### [CRITICAL] index.html | Dashboard AI Alerts widget (~line 1233) | Employee sees all employee alerts
The "AI Alerts" card on the Dashboard has **no `data-min-role` gate**. An Employee sees:
- "Sarah Chen has averaged 47h/week for 3 consecutive weeks" (other employee's overwork data)
- "Alice Wang's contract expires in 14 days" (confidential HR data)
- "Bob Taylor has been on bench for 3 weeks with 0% work time" (capacity data about colleagues)
- "Unusual hotel expense for Bob Taylor -- EUR 340 Marriott Lyon" (another employee's expense details)

This is a severe data leak. Only PM+ should see these.

### [CRITICAL] index.html | Dashboard "Pending Approvals" approve/reject buttons (~line 921) | Employee can approve
The Pending Approvals card is correctly gated with `data-min-role="pm"`. However, the **individual approve/reject buttons inside** have no `data-min-role` attribute. If the card is made visible through any means (DOM manipulation, role flash), the buttons are fully functional. More importantly, the card wrapper hides the whole thing, but the buttons themselves should have independent gating for defense-in-depth.

### [CRITICAL] leaves.html:1529 | Command palette "View Team Leaves" action | Employee can switch to team tab
The command palette on the Leaves page includes a "View Team Leaves" action item with **no `data-min-role`**. While the Team tab button itself is gated with `data-min-role="pm"`, the command palette item bypasses it by calling `activateTab('team')` directly.

---

## HIGH Findings

### [HIGH] index.html:1600 | Command palette "Invoices" link | Employee can navigate to Invoices
The Dashboard's command palette lists "Invoices" as a page link with **no `data-min-role` gate**. An Employee can Ctrl+K, type "Invoices", and navigate directly to `invoices.html`, bypassing the sidebar restriction.

### [HIGH] leaves.html:1520 | Command palette "Invoices" link | Employee can navigate to Invoices
Same issue on the Leaves page command palette: a direct `<a href="invoices.html">` with no role gate.

### [HIGH] gantt.html:1609-1615 | Context menu (edit, reassign, remove) | Employee can modify assignments
The Gantt chart context menu offers "Edit Assignment", "Extend Duration", "Reassign", and "Remove" actions with **no role gating at all**. An Employee (if they reach the page) can right-click any bar and execute PM-level operations on team assignments.

### [HIGH] planning.html:535-553 | "Assign" buttons on bench forecast | No role gate on assign buttons
The Resource Planning page's "Bench Forecast" card has "Assign" buttons for bench employees. These buttons have **no `data-min-role`** attribute. The parent section at line 417 is gated `data-min-role="pm"`, but the inner assign buttons should have independent gating.

### [HIGH] employees.html:1609 | Empty state "Invite Team Member" button | No `data-min-role="admin"`
The empty state for the Team Directory includes an "Invite Team Member" button without `data-min-role="admin"`. The main invite button in the page header IS correctly gated (`data-min-role="admin"` at line 927), but this alternative invite path is not.

### [HIGH] index.html:1264-1277 | AI Alert action buttons (Renew Contract, Assign to Project) | Employee can act
The dashboard AI Alerts contain action buttons like "Renew Contract" and "Assign to Project" that execute management operations. These have **no role gating**. An Employee could initiate a contract renewal or project assignment.

---

## MEDIUM Findings

### [MEDIUM] _shared.js:661-758 | Command palette search includes all employees/clients | Employee sees full roster
The `GHR.initCommandPalette` function hardcodes `dataEntities` with all employee names and all client names. These are injected into every page's command palette. An Employee can Ctrl+K and browse the full employee directory and client list with no filtering.

### [MEDIUM] employees.html | Full Team Directory | Employee sees all colleagues' profiles
The entire Team Directory page (`employees.html`) is accessible to Employees via the sidebar. While this may be intentional (many companies allow this), the profile view exposes detailed data:
- Work time percentages for other employees
- Billable hour breakdowns
- Expense history amounts for other employees
- Skills and competency levels
None of this has `data-sensitive` or `data-min-role` gating. An Employee viewing another employee's profile sees their complete expense history amounts.

### [MEDIUM] approvals.html | KPI summary row (~line 328) | Employee sees approval stats
The Approvals page KPI summary cards (total pending, avg response time, etc.) have **no `data-min-role` gate**. While the sidebar hides the nav link, if an Employee navigates directly via URL, they see aggregate approval statistics.

### [MEDIUM] insights.html | Entire page | Employee direct URL access
The Insights page has most content gated with `data-min-role="pm"` and `data-sensitive="financials"`, but the page header, breadcrumb, and page structure are visible. An Employee navigating directly to `insights.html` sees a mostly-empty page with the AI chat input area. The page should show an access-denied message like `hr.html` does.

### [MEDIUM] calendar.html:836 | Leave status pill | Shows team leave data to Employee
The `leaveStatusPill` element is gated with `data-min-role="pm"`, but the calendar itself shows leave events for ALL employees (Alice Wang on leave, etc.) with no gating. An Employee sees other employees' leave schedules on the calendar grid.

### [MEDIUM] hr.html:1467 | Employee Records tab "Salary Adjustment" row | No `data-sensitive` attribute
The HR Employee Records tab shows "Salary Adjustment" and "Annual compensation review" entries for Marco Rossi. While the tab is inside a `data-min-role="pm"` gate, the actual salary text has no `data-sensitive="salary"` tag, meaning if PM role shows it, there's no finer-grained control to hide salary data from PMs who shouldn't see compensation details.

---

## LOW Findings

### [LOW] _shared.js:799-806 | Notification items | Employee sees all notifications
`GHR.notificationItems` is hardcoded and includes items like "Invoice #2847 overdue -- Acme Corp ($12,400)" and "New hire onboarding: Emma Laurent starts Monday". These are rendered for all roles. An Employee sees invoice overdue amounts and HR onboarding data.

### [LOW] _shared.js:252-270 | `_applyRoleVisibility` timing | Flash of content before hide
Role visibility is applied after DOM load. Elements are visible in HTML source and briefly flash before being hidden. No server-side rendering or template conditionals mean all data is in the HTML regardless of role.

### [LOW] Multiple pages | `data-sensitive` only covers "financials", "billing", "salary" | No HR-sensitive type
The sensitive data system recognizes `financials`, `billing`, and `salary` but there is no `data-sensitive="hr"` type for HR-specific data (contract details, hiring pipeline, onboarding status). This means PM role can see everything once `data-min-role="pm"` passes.

---

## Mismatch Analysis: Sidebar vs Keyboard Shortcuts vs Page-Level Gating

| Page | Sidebar Visible to Employee? | Keyboard G+key Blocked? | Page-level Gate? |
|------|------------------------------|------------------------|------------------|
| admin.html | NO (admin gate) | YES (s blocked) | YES (data-min-role="admin") |
| invoices.html | NO (pm gate) | YES (i blocked) | YES (data-min-role="pm" on main) |
| insights.html | NO (pm gate) | YES (n blocked) | PARTIAL (content gated, shell visible) |
| approvals.html | NO (pm gate) | YES (a blocked) | NO (KPIs visible, buttons gated) |
| hr.html | YES (no gate) | YES (h blocked) | YES (content gated, msg shown) |
| clients.html | YES (no gate) | YES (c blocked) | NO (full page visible) |
| gantt.html | YES (no gate) | YES (g blocked) | PARTIAL (chart gated, context menu not) |
| planning.html | YES (no gate) | YES (r blocked) | PARTIAL (sections gated, some not) |
| projects.html | YES (no gate) | **NO (p NOT blocked)** | NO (full page visible) |
| calendar.html | YES (no gate) | Not in map | NO (full page visible) |
| employees.html | YES (no gate) | Not in map | NO (full page visible) |

---

## Total Issue Count: 21

- CRITICAL: 6
- HIGH: 5
- MEDIUM: 6
- LOW: 4
