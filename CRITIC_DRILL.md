# CRITIC_DRILL.md — Drill-Down Audit
**Auditor:** Interaction Design Critic
**Date:** 2026-04-13
**Method:** Full read of all 16 HTML prototype files

---

## SECTION 1: ISSUES

### CRITICAL

**#1 — projects.html | Project detail section | CONFIRMED PRESENT but routes are incomplete**
projects.html DOES have a `#detailView` section with tabs (Overview, Team, Timesheets, Expenses, Invoices, Milestones, Activity). This is NOT the critical missing item previously feared. However: only 3 project slugs have real data populated (`acme-web`, `globex-phase2`, `initech-api`). All other projects (`umbrella-portal`, `internal-portal`, `dataviz-dashboard`, `globex-migration`, `acme-mobile`) open an empty or near-empty detail with no meaningful content. The detail shell exists but is hollow for 5 of 8 projects. Every project that reaches detail must show real T2 data — budget, team, timesheets, milestones — not blank tabs.

---

### MISSING CLICKABLE ELEMENTS

**#2 — timesheets.html | Approval queue rows | Should open T2 drawer**
Each `action-row` in the approval queue has only Approve and Reject buttons. There is no detail/eye button and no row-click handler. Clicking anywhere on the row outside the action buttons does nothing. The user cannot see the day-by-day breakdown, project split detail, notes, or history without approving or rejecting blind.
T2 drawer needs: daily hour log (Mon–Fri breakdown), project split per day, billable vs non-billable split, previous week comparison, employee work time bar, overtime reason field, approve/reject with note.

**#3 — leaves.html | "My Leaves" tab — eye button fires toast, not drawer**
Each leave row on the "My Leaves" tab (the self-service view) has an eye button that calls `showToast('info','Details','Approved by...')`. A toast is not a drawer. There is no T2 detail surface at all. This also means the row itself is not clickable.
T2 drawer needs: leave type, date range, duration, approver name, approval date, approval note, remaining balance before/after, document upload history, calendar preview of the affected days.

**#4 — expenses.html | "My Expenses" tab items — not clickable**
The `expense-item` cards in the My Expenses tab have no `onclick`, no `cursor: pointer`, no detail handler. You can see amount and description on the surface but cannot drill into receipt image, approval notes, rejection reason details, or project linkage. The eye button exists only on the Team Expenses tab.
T2 drawer needs: receipt image/PDF viewer, category, project, billable flag, submission date, approver, approval/rejection note, reimbursement status, payment date.

**#5 — expenses.html | Team Expenses tab — eye button fires toast, not drawer**
All eye buttons in Team Expenses call `showToast('info','View','Viewing expense')`. A toast is not a drawer. There is no actual detail surface.
T2 drawer needs: same fields as #4 plus audit trail, flagging/dispute option, GL code.

**#6 — invoices.html | Invoice list row — navigates via hash but no right drawer exists**
Clicking an invoice link or the eye button sets `window.location.hash = 'detail'`. There is no actual T2 drawer or side panel — the page switches to a full invoice detail view (which is good), but this means the T1 list context is lost entirely on mobile. The "more-horizontal" button opens a context dropdown correctly, but "View" inside it also just sets the hash without loading invoice-specific data.
Actual issue: invoice detail view is not data-driven — it always shows the same hardcoded Acme Corp invoice regardless of which row was clicked. Clicking INV-2026-039 still shows "INV-2026-048 — Acme Corp."

**#7 — approvals.html | Approval item rows — detail opens a modal, not a right drawer**
The `detail-btn` (eye icon) on each approval card opens `detailModal`, a centered modal overlay. This is a design inconsistency: every other detail context should be a right-side drawer (consistent with the design direction), not a blocking modal. The modal also lacks full T2 fields.
T2 drawer needs: full day-by-day timesheet table (for timesheet type), conflict calendar (for leave type), receipt viewer (for expense type), policy check, comment thread, approve/reject with note field inside the drawer.

**#8 — leaves.html | Team Leaves tab — entire row is not clickable**
Each `team-leave-row` in the Team tab has Approve and Reject buttons but no row-click or detail button. There is no way to see why the person is requesting leave, view their leave balance history, or see the calendar conflict detail without approving blind. The "2 others off that week" conflict warning is visible but not expandable.
T2 drawer needs: leave type, full date range, remaining balance, approval history, conflict details (who else is off), manager comment, policy entitlement breakdown.

**#9 — index.html | Dashboard approval widget items — no detail action, no link on name**
The `approval-item` cards in the dashboard Pending Approvals widget show avatar + name text + summary but: (a) employee names are plain text not linked (`<div class="approval-title">John Smith - Week 13</div>` — no anchor, no hovercard), (b) the entire item has no `onclick` handler. A user can only Approve or Reject. They cannot see the detail.
Fix: employee name must be a linked anchor with `data-hovercard`; the row itself should navigate to approvals.html with that item pre-selected or open a mini drawer.

**#10 — index.html | Work time heatmap cells — not clickable**
Each `heatmap-cell` has a CSS hover tooltip showing hours % but no `onclick` handler. Clicking a heatmap cell should navigate to the timesheets page filtered to that employee + that week.
T2 destination: timesheets.html filtered to the week represented by that cell, for the team aggregate view.

**#11 — index.html | Revenue bars in Revenue Trend chart — not clickable**
Each `.revenue-bar` has a CSS hover state (`filter: brightness(1.15)`) but no click handler. Clicking a month bar should navigate to insights.html or invoices.html filtered to that month.

**#12 — index.html | Revenue Snapshot bars — not clickable**
Same issue as #11. The bars in the Revenue Snapshot section (built by JS) have no `addEventListener('click')`. They render with hover brightness but click does nothing.

**#13 — employees.html | Department badge on employee cards — not clickable**
The `.employee-card-dept` div shows the department name as plain text (`<div class="employee-card-dept">Engineering</div>`). Per spec, clicking a department name should filter the employee list to that department. The `dept` value is available as `data-dept` on the employee name anchor but the department label itself has no click handler.

**#14 — employees.html | 5 employees missing slug-based profile hrefs**
Sophie Dubois, Yuki Tanaka, Marie Dupont, Liam O'Brien, and Lisa Martinez all have `data-href="employees.html"` (no slug). The JS click handler for `[data-employee]` always navigates to `#profile/timeline` regardless of which employee — so clicking any of these 5 always shows the first profile (Sarah Chen). Each needs a unique slug: `#profile-sophie`, `#profile-yuki`, `#profile-marie`, `#profile-liam`, `#profile-lisa`.

**#15 — admin.html | All user rows link to employees.html without slug**
Every employee link in the admin Users table points to `href="employees.html"` with no slug. Clicking "John Smith" in the admin panel drops you on the employees directory, not John Smith's profile. All 12 user rows need slug-anchored hrefs: `employees.html#profile-john` etc.

**#16 — admin.html | Department name in Departments table — not clickable**
Each department row shows the department name as `<td class="font-semibold">Engineering</td>` — plain text. Clicking a department name should navigate to `employees.html` filtered to that department. There is no onclick, no href, no cursor: pointer.

**#17 — hr.html | Onboarding checklist tasks — no task detail drawer**
Each checklist item in the onboarding cards is a `<label>` with an inline action button (e.g. "Send now", "Auto-schedule"). Clicking the label text or the task name does nothing — no detail, no context. The task title itself is not a link.
T2 drawer needs: task description, responsible person, due date, dependency on other tasks, completion history, notes, linked documents (e.g. DocuSign link for "Contract signed").

**#18 — hr.html | Kanban candidate card — opens detail drawer (CORRECT) but T2 content is thin**
The candidate drawer (`candidateDrawer`) is correctly triggered by clicking a kanban card. However the drawer content is very thin: name, role, AI fit %, tags, notes textarea, "Move to next stage" button. Missing T2 fields that belong in the drawer, not on the card surface.
T2 fields missing from drawer: work history (last 2 roles), availability date, expected salary, interview notes log, stage history with dates, rejection reason history, recruiter assignment, source detail (LinkedIn URL etc.), CV/portfolio link that actually works (currently `href="#"`).

**#19 — insights.html | KPI stat cards — not clickable**
The 4 stat cards in the Work Time analytics section (`Avg Work Time`, `Top Performer`, `Team Velocity`, `Overtime Hours`) are plain `<div class="stat-card">` elements with no link, no onclick. Per spec, KPI numbers must drill down to the underlying list filtered to that data. "Overtime Hours: 24h" should link to timesheets.html filtered to overtime entries. "Top Performer: Sarah Chen" should link to employees.html#profile-sarah.

**#20 — insights.html | Employee names in bar charts — link to employees.html (no slug)**
In the "Work Time by Employee" horizontal bar chart, employee names like "Carol Williams" are linked with `href="employees.html"` — no slug. Same issue as admin.html: drops you on the directory, not the person's profile.

**#21 — projects.html | Billing rate visible on list surface (T2 data leak)**
Both the board view kanban cards and the list view table show `€85/h`, `€90/h`, `€95/h` billing rates on the surface. Per the T1 spec, the list should show: Name, Client sub-label, Status badge, Team size, Timeline bar. Billing rate is a financial detail that belongs inside the project detail, not on the surface of the card/row.

**#22 — projects.html | Budget % progress bar visible on list surface (T2 data leak)**
Active project kanban cards show a "Budget" progress bar with percentage on the card face. This is T2 data. The T1 card should show only a timeline bar (start→end). The budget burn % belongs in the project detail Overview tab.

**#23 — expenses.html | Project link in Team Expenses detail column links to `projects.html#detail` (wrong)**
Lines like `<a href="projects.html#detail" ...>Acme Web Redesign</a>` navigate to a non-specific hash. Every project link in the expenses list must use the real project slug: `projects.html#detail/acme-web`, `projects.html#detail/globex-phase2`, etc.

**#24 — clients.html | Some project links in client detail have no slug**
In the Acme client detail, projects "CRM Integration", "Brand Guidelines", "Security Audit" link to `href="projects.html"` without a slug — they drop on the project list. Only "Web Redesign" and "Mobile App" have correct `#detail/` links. All projects in client detail need their slug.

**#25 — index.html | "Week at a Glance" day cells fire toast, not drill-down**
The Mon–Fri day cells call `window.showDayToast && window.showDayToast('Thu')`. This should navigate to timesheets.html pre-filtered to that day, showing the user's own time log entries for that day.

---

## SECTION 2: OPEN QUESTIONS

**Q1 — invoices.html: Drawer vs full-page detail?**
The invoice detail currently replaces the full page view (master-detail pattern). This is defensible for invoices since they are long documents (line items, payment history, audit trail). But it loses list context. Consider: should invoices open in a right drawer wide enough to show line items, or is the current full-page swap acceptable? The risk with full-page is that on mobile the back navigation is not prominent.

**Q2 — clients.html: Client detail uses a full-page swap (like projects) — correct pattern?**
Both clients and projects use a `showList()` / `showDetail()` toggle pattern that replaces the list view. This feels consistent and correct for data-rich entities. However the pattern diverges from simpler pages that use drawers (hr.html, approvals.html). Should there be a rule: entities with many sub-tabs (project/client) use full-page detail; simple records (leave, expense, timesheet) use right drawer?

**Q3 — hr.html onboarding: Should the whole onboard-card be clickable?**
Currently the onboard-card for each new hire shows the checklist inline on the surface. An alternate pattern: the card is a compact row (name, role, start date, progress %) and clicking it opens a full onboarding detail panel with the checklist inside. This would clean up the surface significantly. Is the inline checklist approach intentional?

**Q4 — calendar.html: Day-click opens a side panel — is this the right T2 surface?**
calendar.html already has a `day-detail-panel` with `id="dayDetail"` that activates on day click. This is the right pattern. Open question: should clicking a calendar event (e.g. Alice Wang OOO) within the day panel navigate to the leave detail drawer on leaves.html, or should the leave detail appear nested within the calendar day panel?

**Q5 — admin.html: User row edit vs profile navigation**
Each user row has an "Edit" button that opens an edit modal. The row itself is not clickable as a whole. Should clicking anywhere on the row open the user's employee profile (employees.html#profile-x), with editing accessed via a button inside that profile? Or is admin the right place to edit user roles/permissions separately from the employee profile?

**Q6 — planning.html: Project name in assignment recommendation — links to projects.html#globex-phase-2 (correct hash format?)**
planning.html line 619 links to `projects.html#globex-phase-2` but the projects.html detail alias map uses `#globex-phase2` (no second hyphen). Verify: does the alias `'#globex-phase-2': '#detail/globex-phase2'` in projects.html actually resolve? Check the alias dictionary in projects.html JS for completeness — `#acme-web-redesign` maps but `#globex-phase-2` may not.
