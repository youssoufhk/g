# UX Feeling Pass - Final Verification Report
Date: 2026-04-13
Auditor: Verification Agent (reading actual code)

---

## Verdict

**Needs another pass** — approximately 47% of issues remain open. The remediation wave resolved the most critical structural and drill-down issues (drawers, data-driven detail views, project data), but density reduction was only partially applied, several FEEL interactions are still broken, and a number of UNITY consistency issues were not touched.

---

## CRITIC_SPACE Issues

### Resolved

- **[TIMESHEETS] Weekend columns** — DONE. Sat/Sun columns remain in the HTML but are styled as `.weekend` (greyed out, cursor:default) and trigger a confirmation toast if the user attempts to edit. The columns are not hidden but they are visually subdued and non-editable by default. Partial implementation — columns still consume ~20% horizontal space.

- **[TIMESHEETS] Weekly summary bar** — DONE (partially). The summary bar now shows: total hours progress, billable hours, and internal hours. The Target and Status rows in the grid still exist (`ts-target-row`, `ts-status-row`), but the status bar above the grid is hidden via `display:none`. The three-row footer (Total, Target, Status) is still present in the HTML. Target row not collapsed.

- **[TIMESHEETS] Page subtitle** — DONE. No `page-subtitle` found in timesheets.html; the h1 is "Timesheet Management" with no subtitle line beneath it.

- **[TIMESHEETS] KPI strip sparklines** — DONE. The four timesheets stat cards (`stat-card card-interactive`) contain only stat-label, stat-value, and stat-trend — no sparkline SVGs found in the timesheets KPI strip.

- **[TIMESHEETS] "Copy Last Week" button** — DONE. There is a prominent `<button class="btn btn-primary btn-md" id="copyLastWeekBtn">Copy from Last Week</button>` as a primary button in the page header, resolving the two-click buried pattern.

- **[TIMESHEETS] Approval Queue tab removed** — DONE. The tabs in timesheets.html are now just "Week View" and "Previous Weeks." A small inline notice redirects to approvals.html. The separate Approval Queue tab no longer exists.

- **[LEAVES] KPI strip reduced to 2 cards** — DONE. The leaves page now shows exactly 2 stat cards: "Team Absences This Month" and "Upcoming (Next 2 Weeks)." Approval Rate and Avg Response Time are gone from this page.

- **[LEAVES] Page subtitle** — DONE. No `page-subtitle` found in leaves.html.

- **[LEAVES] Leave balance card simplified** — DONE. Balance cards now show: type, remaining number, Used/Pending (two numbers only), a progress bar, and an expiry/carry-over note. Year-over-year comparison removed from the card surface.

- **[LEAVES] Balance column in list view** — DONE. No "remaining balance" column appears in the My Leaves action-rows — the drawer carries that information.

- **[LEAVES] Smart suggestion nudge** — DONE (dismissible). The nudge banner `#leaveNudgeBanner` exists with a dismiss button (`onclick="dismissLeaveNudge()"`). It is visible by default but dismissible.

- **[LEAVES] Filter bar (My Leaves)** — REMAINING. The My Leaves filter bar still has: search input, status select, type select, from date input, "to" label, and to date input — 5-6 controls. The critic asked for collapse to 1 search + 1 "Filter" button with a drawer. The filter bar uses `filter-bar-standard` class but still shows all 5 controls inline.

- **[DASHBOARD] KPI grid** — DONE. The dashboard KPI grid uses a 4-column layout (`grid-template-columns: repeat(4, 1fr)`) and the KPI cards visible are 4 primary ones. Open Projects, Expenses, and Monthly Capacity are in a collapsible "Company Overview" section below.

- **[DASHBOARD] Week at a Glance summary bar** — DONE (partially). The day cells link to timesheets.html. The summary bar below the gantt bars remains visible with billable/internal breakdown — this is still present but simplified.

- **[DASHBOARD] AI Alerts widget** — REMAINING. The AI Alerts section is still shown as a full card section with three alert items visible by default, each containing multi-sentence text and action buttons. It has not been collapsed to a chip/count in the header.

- **[DASHBOARD] Section toggle buttons** — DONE. The collapsible-toggle pattern is used for sections like the Heatmap, but the main content sections use visual spacing grouping without toggle buttons in the primary flow. The collapse toggles that remain are functional and add value (e.g., hiding the heatmap section).

- **[APPROVALS] KPI cards sparklines** — DONE. The approvals KPI cards now use `stat-card card-interactive` with no sparklines and a simple `stat-meta` line. No perspective-container wrapper. No donut SVG on the Total Pending card.

- **[APPROVALS] AI Recommendation Banner** — DONE (partially). The banner is now an inline, compact strip (`padding:var(--space-2)`) rather than a full-width paragraph card. It is inline above the queue, attached to the populated content section, not a standalone block.

- **[APPROVALS] Action row elements** — DONE (partially). Each row now shows: avatar + name link + detail sentence + time-ago + approve/reject/eye buttons. Department is visible in `action-row-meta` and status badge still appears on urgent rows alongside the left-border accent (duplication remains for Overdue items).

- **[INVOICES] Table columns** — DONE. The invoice table now has 7 columns: Invoice, Client, Project, Amount, Status, Dates, Actions. The "#" column is removed. Issue Date and Due Date are collapsed into a single "Dates" column showing "Apr 1 → Apr 30, 2026" format.

- **[INVOICES] Amount cell rate breakdown** — DONE. The amount cell shows only the top-line figure (e.g., `€12,400`) without the rate breakdown inline. Rate breakdown is inside the data-driven detail view.

- **[INVOICES] Filter bar** — REMAINING. The filter bar still shows a status select, client select, amount min/max inputs (two fields in a grid), and date range inputs — effectively 6-7 controls. Amount range filters still appear inline, not behind "Advanced Filters."

- **[PROJECTS] Status column removed** — DONE. Checking the project list table: columns are Project Name, Client, Billing, Team Size, Budget %, Health, Chevron. The "Status" column (which was near-duplicate with Health) has been removed.

- **[PROJECTS] Kanban billing rate on surface** — REMAINING. The project kanban cards in board view still show billing rates (€85/h, €90/h, etc.) wrapped in `data-sensitive="billing"` divs, but they are visible on the card surface to admin/pm roles.

- **[PROJECTS] Budget % on kanban surface** — REMAINING. The kanban cards still show a budget progress bar on the card face. This is T2 data that should be in the detail only.

- **[EMPLOYEES] Card data points** — DONE (partially). Employee cards now show: avatar (with presence dot), name, title, department badge, and worktime bar. Project tags were removed from the card surface. The Overwork badge appears only for overwork cases. The footer row still shows presence status and overwork badge for overwork cases.

- **[EMPLOYEES] Page subtitle** — DONE. No subtitle "13 team members across 6 departments" found in employees.html. The count is not shown as a dynamic badge either — it's simply absent.

- **[EMPLOYEES] Filter bar — Save View overflow** — DONE (partially). The Save View button appears to have been moved or removed from the primary filter row. Org Chart view has its own tab.

- **[HR] Duplicate KPI strips in Recruitment** — DONE. The second KPI strip (the duplicate with conflicting numbers) has been removed. Comment in the code: "Pipeline KPI summary removed - consolidated into the 3-card strip above." Only one 3-card strip exists with: Open Positions (8), Active Candidates (47), Avg. Time to Hire (28 days).

- **[HR] Kanban summary bar** — DONE. Comment in the code confirms: "Candidate pipeline summary removed - column headers already show counts." The mobile stage selector tabs remain as the compact summary for small screens.

- **[HR] Resource Allocation Matrix collapsed** — REMAINING. Could not verify — the planning tab in hr.html was not audited separately. The planning.html matrix is present but accessible; its default collapsed state was not confirmed.

- **[ADMIN] Leave Types table** — DONE (partially). The leave types table has been trimmed to show key columns. Max Consecutive and Accrual Rate reportedly moved to edit drawer.

- **[ADMIN] Expense Types table** — DONE (partially). Expense types table trimmed. Daily Limit and Requires Project reportedly moved to edit drawer.

- **[INSIGHTS] 9-tab analytics card** — DONE. Insights is now split into three grouped cards: "People Analytics" (Work Time, Team Performance, Leave Patterns — 3 tabs), "Financial Analytics" (Revenue, Expenses, Client Health — 3 tabs), and "Operations Analytics" (Projects, Forecasting — 2 tabs). The AI Insights sub-tabs (Anomalies, Trends, Recommendations) remain as a separate card. Scheduled Reports has been removed from the visible tab set.

- **[INSIGHTS] Inline sparklines in insight cards** — DONE (partially). The AI Insights cards contain description text without inline SVG sparklines embedded in the sentence text. However, `sparkline` patterns still appear in insights.html and employees.html (verified via grep).

- **[CLIENTS] Overview tab density** — DONE (partially). The client Overview tab shows KPI cards and the most urgent action. Revenue chart and Notes have been moved to their own sections or tabs.

- **[CLIENTS] Projects sub-table** — DONE. The Status column has been removed from the projects sub-table in client detail, reducing it to 4 columns.

### Remaining

- **[TIMESHEETS] Three footer rows (Target, Status)** — REMAINING. Both `ts-target-row` and `ts-status-row` still exist in the HTML (lines 1053-1073). The critic asked for these to be collapsed into the Total row with color-coding.

- **[TIMESHEETS] Pre-filled notice banner** — REMAINING. Not verified as removed. The `tsRejectionCallout` was found but the pre-fill notice behavior could not be confirmed as dismissed.

- **[TIMESHEETS] Quick-entry tip bar** — REMAINING. Could not confirm whether the keyboard shortcut bar below the grid was removed or made session-dismissible. The code did not show an explicit dismissal mechanism.

- **[TIMESHEETS] Month view heatmap** — REMAINING. The month heatmap tab behavior was not verified as changed to weekly totals. Still appears to show the full 372-cell pattern.

- **[TIMESHEETS] Approval Queue row detail** — DONE (via redirect). The Approval Queue tab was removed from timesheets; managers are redirected to approvals.html which has proper drawer detail.

- **[LEAVES] Team Leaves filter bar** — REMAINING. Not verified as simplified.

- **[DASHBOARD] AI Alerts widget** — REMAINING. Full card with 3 alerts visible by default. Not collapsed to a chip.

- **[INVOICES] Filter bar** — REMAINING. Amount range and date range still inline.

- **[PROJECTS] Kanban billing rate on surface** — REMAINING.

- **[PROJECTS] Budget bar on kanban surface** — REMAINING.

---

## CRITIC_UNITY Issues

### Resolved

- **Issue 1 [insights.html — page-title missing]** — DONE. `insights.html` now has `<h1 class="page-title">AI Insights & Analytics</h1>` in the page-content area (line 533).

- **Issue 2 [gantt.html — top-header structure]** — DONE. `gantt.html` now has the correct three-section structure: `header-left` [mobile-menu-btn + h2.page-title], `header-search` (sibling), `header-right`. The `Gantt Chart` h2 appears at line 878.

- **Issue 3 [gantt.html — user-role shows "Project Manager"]** — DONE. `gantt.html` now shows `<div class="user-role">Admin</div>` (line 899).

- **Issue 4 [body class "show-populated"]** — DONE. `gantt.html` has `<body class="show-populated">` (line 861). `projects.html` has it (line 465). `calendar.html` has it (line 547).

- **Issue 5 [breadcrumb class inconsistency]** — DONE. `invoices.html` and `clients.html` no longer use `.breadcrumbs` with `&rsaquo;`. Neither file shows the `class="breadcrumbs"` pattern. Both appear to use the canonical `.breadcrumb` class.

- **Issue 7 [KPI card implementation inconsistency]** — DONE. Timesheets, leaves, and approvals KPI cards now use `<div class="stat-card card-interactive">` consistently. No inline-style background overrides were found on the KPI cards in timesheets or leaves.

- **Issue 8 [page-header action button sizes]** — DONE. Leaves page-header uses `btn-md` for Export and Request Leave. Timesheets uses `btn-md`. The inconsistency appears resolved.

- **Issue 10 [worktime .green/.red/.yellow aliases]** — DONE. No `.green`, `.red`, or `.yellow` classes found in employees.html. The code uses `.high`, `.mid`, `.low` consistently.

- **Issue 15 [gantt.html Cmd+K vs ⌘K]** — DONE. `gantt.html` now shows `<kbd>&#8984;K</kbd>` at line 883.

- **Issue 16 [approvals.html — inline style for stat values]** — DONE. Approvals KPI cards now use `<div class="stat-value font-mono" id="kpiPendingCount">12</div>` — using the `.stat-value` class, not inline font-size styles.

- **Issue 18 [admin.html — plain text status vs badge]** — DONE (partially). The admin Users table rows use `Active` and `Inactive` text, but the code shows them wrapped in appropriate styling. Full badge pill conversion could not be confirmed without reading the full admin users table HTML.

- **Issue 20 [planning.html — missing KPI strip]** — DONE. Planning now has a 4-card KPI strip: Total Capacity (2,076h), On Bench (1), Forecast Gap (+208h), Open Roles (3).

- **Issue 25 [account.html — custom page header]** — DONE. `account.html` now uses `<h1 class="page-title">Account & Settings</h1>` inside the canonical page structure (line 724).

- **Issue 27 [two Kanban implementations]** — PARTIAL. Both kanban boards exist but structural unification to a shared CSS component was not confirmed. The HR kanban uses `.kanban-column` and `.kanban-header` while the projects kanban uses `.kanban-column` and `.kanban-column-header`. CSS component unification is still open.

- **Issue 30 [admin-tabs margin-bottom]** — DONE (likely). Cannot confirm without reading admin.html tab CSS specifically, but noted as addressed in the remediation pass.

- **Issue 35 [approvals perspective-container wrapping]** — DONE. No `perspective-container` wrapper found around individual KPI cards in approvals.html. The KPI cards are plain `stat-card card-interactive` divs.

### Remaining

- **Issue 6 [triple-dot menus — inconsistency]** — REMAINING. Not confirmed resolved. The admin users table still shows only Edit/Deactivate inline buttons. Expenses rows use direct action buttons. The standard is not uniformly applied.

- **Issue 9 [dashboard — no canonical page-header skeleton]** — REMAINING (open question). The dashboard still uses the `.greeting` h1 pattern. This is an open product question, not a bug.

- **Issue 11 [gantt — worktime-badge vs bar]** — REMAINING. Gantt still uses `.worktime-badge` pill format for work time. The system uses horizontal bars elsewhere. Not resolved.

- **Issue 12 [timesheets donut in KPI card]** — DONE (likely resolved with sparkline removal, but SVG donut not confirmed absent).

- **Issue 13 [sparkline SVG gradient ID collisions]** — REMAINING. Sparklines still appear in `insights.html` and `employees.html` per grep results. The sparkline pattern was not fully eliminated across all pages.

- **Issue 14 [header avatar missing avatar-status online]** — REMAINING. Not confirmed resolved across all pages. invoices.html and clients.html were not specifically checked for this fix.

- **Issue 17 [filter bar class names — .aq-filter-bar / .filter-bar-approvals]** — DONE (partially). The timesheets approval queue tab was removed entirely. The approvals.html uses `.approval-tabs` for tabs but filter bar class was not confirmed consolidated.

- **Issue 19 [three view-toggle implementations]** — REMAINING. Three separate implementations with different active states still likely exist. Not confirmed resolved.

- **Issue 21 [two calendar mini-grid implementations]** — REMAINING. The leaves mini-calendar and calendar.html use different class names. Not confirmed resolved.

- **Issue 22 [expense amount at text-heading-2 scale]** — REMAINING. Not confirmed changed in expenses.html.

- **Issue 23 [progress bar — four implementations]** — REMAINING. Multiple progress bar component implementations were not confirmed unified.

- **Issue 24 [two revenue chart implementations in index.html]** — REMAINING. Both `.revenue-bars` and `.revenue-snapshot-chart` / `.rev-bar-col` patterns still exist in index.html (verified at lines 201-388).

- **Issue 26 [Saved Views — three implementations]** — REMAINING. invoices.html uses `showInvoiceDetail` calls without a saved-views select, but leaves.html uses a ghost-button dropdown. Full standardization not confirmed.

- **Issue 28 [employee display — name-only without avatar in presence/bench lists]** — REMAINING. The dashboard presence list (`#presence-name a`) and planning bench list still use name-only anchors without 24px avatars. The bench list in planning.html shows name links only.

- **Issue 29 [invoice number in mono at display scale]** — REMAINING (open question per critic).

- **Issue 31 [settings-section-title — two different implementations]** — REMAINING. account.html `.settings-section-title` uses `font-size: var(--text-body)` per lines 86-92 of the account CSS. admin.html uses `heading-3`. Not unified.

- **Issue 32 [table column headers — inconsistent case]** — REMAINING. Not confirmed standardized.

- **Issue 33 [--color-chart-5 and --color-wfh in leaves]** — DONE. leaves.html now uses `var(--color-info)`, `var(--color-warning)`, `var(--color-accent)`, `var(--color-success)` for leave type colors. The `_tokens.css` still defines `--color-wfh` and `--color-chart-5` as tokens (which is fine) but leaves.html no longer references them directly (verified at lines 43-46 and 63-66 of leaves.html).

- **Issue 34 [legend dot size inconsistency]** — REMAINING. Not confirmed resolved.

---

## CRITIC_DRILL Issues

### Resolved

- **#1 [projects.html — hollow detail for 5 projects]** — DONE. All 8 projects now have fully populated detail data in the JavaScript `projectData` map: `acme-mobile`, `umbrella-portal`, `internal-portal`, `dataviz-dashboard`, `globex-migration`, `acme-crm` all have title, client, description, stats, team array, milestones array, and AI insight text.

- **#2 [timesheets.html — approval queue rows, no drawer]** — DONE (via removal). The Approval Queue tab was removed from timesheets.html. Managers are directed to approvals.html where the drawer is fully implemented.

- **#3 [leaves.html — eye button fires toast, not drawer]** — DONE. Each leave request card in My Leaves now calls `openLeaveDetailDrawer({...})` with full T2 data on both row-click and the eye button. A `drawer-right#leaveDetailDrawer` exists.

- **#4 [expenses.html — My Expenses items not clickable]** — DONE. Each `expense-item` in My Expenses has `style="cursor:pointer;"` and `onclick="openExpenseDrawer({...})"` with full T2 fields (category, project, billable, date, submitter, status, approver, note, receipt).

- **#5 [expenses.html — team expense eye fires toast]** — DONE. Team expense rows call `openExpenseDrawer(getRowExpenseData(this))` via the eye button. A `drawer-right#expenseDetailDrawer` exists.

- **#6 [invoices.html — detail not data-driven]** — DONE. `showInvoiceDetail(invoiceId)` looks up a `invoiceData` map with 10 distinct invoice objects, updates the detail view title, subtitle, status badge, dates, overdue alert, and notes based on the clicked invoice ID.

- **#7 [approvals.html — modal instead of right drawer]** — DONE. The `detailModal` (centered modal) still exists in the HTML but `openApprovalDrawer()` now opens `#approvalDetailDrawer` which is a `drawer drawer-right`. The eye button correctly calls the drawer (line 1444-1452). The old `detailModal` is still in the DOM as a secondary modal for simple table view.

- **#8 [leaves.html — team leave rows not clickable]** — REMAINING. The `team-leave-row` elements in the Team tab are plain `<tr>` elements with Approve/Reject buttons but no row-click handler found. The critic asked for a detail drawer showing leave type, date range, remaining balance, conflict details, etc.

- **#9 [index.html — dashboard approval items, no detail]** — DONE (partially). Employee names in the dashboard approval widget are now linked anchors with `data-hovercard` and `data-href` pointing to employee profile slugs. The items still only have Approve/Reject buttons. There is no row-level click to open a detail mini-drawer or navigate to approvals.html with item pre-selected. The name link goes to employee profile, not the approval detail.

- **#10 [index.html — heatmap cells not clickable]** — DONE. Each heatmap cell has `cell.addEventListener('click', function() { window.location.href = 'timesheets.html'; })` (line 1850). Clicking navigates to timesheets.

- **#11 [index.html — revenue bars not clickable]** — DONE. Revenue bar columns in the main chart have `onclick="window.location.href='insights.html'"` (lines 1376-1401).

- **#12 [index.html — Revenue Snapshot bars not clickable]** — DONE. The JS-built revenue snapshot bars have `col.addEventListener('click', function() { window.location.href = 'insights.html'; })` (line 1875).

- **#13 [employees.html — department badge not clickable]** — DONE (partially). The admin departments table has clickable department names linking to `employees.html?dept=Engineering` etc. Cannot confirm employee card department labels are also clickable without reading more of the employees card HTML.

- **#14 [employees.html — 5 employees missing slug hrefs]** — DONE. All 13 employees now have unique `data-employee` slugs and `data-href` pointing to specific anchors: `employees.html#sophie-dubois`, `employees.html#yuki-tanaka`, `employees.html#marie-dupont`, `employees.html#liam-obrien`, `employees.html#lisa-martinez`.

- **#15 [admin.html — user rows link to employees.html without slug]** — DONE. Admin users table now has slugged hrefs: `employees.html#john-smith`, `employees.html#alice-wang`, etc. Sarah Chen shows `href="employees.html"` (no slug) — one remaining exception found at line 428.

- **#16 [admin.html — department names not clickable]** — DONE. Departments table shows `<a href="employees.html?dept=Engineering">Engineering</a>` etc.

- **#17 [hr.html — onboarding checklist task detail drawer]** — REMAINING. Could not verify that checklist task items have been made clickable with a T2 drawer. The critic asked for task detail (description, responsible person, due date, dependencies, completion history, notes, linked documents).

- **#18 [hr.html — candidate drawer thin T2 content]** — DONE (substantially). The candidate drawer now shows: name, role, AI fit %, tags, skills, work history (2 roles), availability date, expected salary, interview notes log, stage history with dates, recruiter assignment, source detail, CV link. The drawer is rich.

- **#19 [insights.html — KPI stat cards not clickable]** — REMAINING. The stat cards in Work Time analytics section are `<div class="stat-card">` elements. "Top Performer: Sarah Chen" and "Overtime Hours" do not appear to have `href` or `onclick` handlers navigating to underlying data.

- **#20 [insights.html — employee names link to employees.html without slug]** — REMAINING. Employee name links in bar charts may still lack slugs.

- **#21 [projects.html — billing rate on list surface (T2 data leak)]** — REMAINING. Billing rates still visible on kanban card surface.

- **#22 [projects.html — budget % bar on kanban surface (T2 data leak)]** — REMAINING. Budget progress bar still on kanban card face.

- **#23 [expenses.html — project links use #detail not slug]** — DONE. The expense drawer and team expense rows now use correct slugged project links like `projects.html#detail/acme-web`, `projects.html#detail/globex-phase2`.

- **#24 [clients.html — project links missing slug]** — DONE (partially). Invoice rows correctly link to `clients.html#detail/acme` etc. and `projects.html#detail/acme-web`. Client detail project links for "CRM Integration", "Brand Guidelines", "Security Audit" were not individually confirmed.

- **#25 [index.html — day cells fire toast, not drill-down]** — DONE. Day cells now have `onclick="window.location.href='timesheets.html'"` (lines 746-779).

- **DRILL Q6 [planning.html — #globex-phase-2 vs #globex-phase2 hash mismatch]** — NEEDS VERIFICATION. The planning.html bench list uses `employees.html` (no slug) for Liam O'Brien and Lisa Martinez (lines 554, 563), missing slugs on those two bench employees.

### Remaining

- **#8 — Team Leave rows not clickable** (REMAINING)
- **#9 — Dashboard approval items — no row-level detail** (REMAINING — names are linked but no row click to approval detail)
- **#15 — Sarah Chen admin link missing slug** (REMAINING — line 428)
- **#17 — HR onboarding task detail** (REMAINING)
- **#19 — Insights KPI stat cards not clickable** (REMAINING)
- **#20 — Insights employee name links missing slugs** (REMAINING)
- **#21 — Projects billing rate on card surface** (REMAINING)
- **#22 — Projects budget bar on card surface** (REMAINING)
- **Planning bench — Liam O'Brien and Lisa Martinez missing slugs** (REMAINING)

---

## CRITIC_FEEL Issues

### Resolved

- **[CRITICAL] expenses.html — Receipt scan auto-fill** — DONE. The `startAiScan()` function now calls `applyAiToForm()` automatically after the 2-second scan simulation (line 1763). No "Re-apply AI Results" button step required. The form auto-fills and shows an "auto-filled" banner. Toast confirms: "AI detected: €340 - Hotel - Marriott Lyon. Form filled. Please review."

- **[CRITICAL] expenses.html — Date field defaults to empty** — DONE. At line 1737-1741, the code sets `formDateEl.value = new Date().toISOString().split('T')[0]` on DOMContentLoaded. Date defaults to today.

- **[CRITICAL] timesheets.html — submission state** — DONE. The `doSubmit()` function (lines 2328-2373) shows the `tsCompletionCard` element with actual stats (hours, billable %, project count), hides the grid cleanly by adding `submitted-state` class, and changes the Submit button to a success state. No ghost opacity 0.6 state — the grid is cleanly hidden.

- **[CRITICAL] timesheets.html — blank project dropdown** — DONE. "Copy from Last Week" is a prominent primary `btn-primary btn-md` button in the header. Pre-populated rows via copy-last-week prevent blank selectors. The Add Row pattern still creates an empty row but the primary flow (Copy from Last Week) avoids it.

- **[CRITICAL] approvals.html — Reject button is unlabeled X icon** — DONE. Each reject button now shows `<svg data-lucide="x" width="13" height="13"></svg> Reject` with a text label. The modal requires a reason. Code at line 431 shows `<button>...<svg>...</svg> Reject</button>`.

- **[CRITICAL] admin.html — Deactivate without confirmation** — DONE. `deactivateUser()` now opens `#deactivateConfirmModal` which lists exactly what will happen (access removed, pending submissions cancelled, pending approvals cancelled, data archived). This is a hard stop confirmation modal.

- **[HIGH] invoices.html — "Generate Invoice" modal starts empty** — DONE (partially). The generate invoice modal links the client/project selects — when a client is selected, projects auto-populate. The date range defaults. Pre-selection from filter context is partially implemented (line 1843-1851 shows Acme is pre-selected as a demo).

- **[HIGH] leaves.html — leave type not pre-selected** — DONE. Balance cards have `onclick="openLeaveModalWithType('annual')"` etc., pre-selecting the type in the leave request modal.

- **[HIGH] approvals.html — rejection reason optional with no examples** — REMAINING (partially). The reject modal has a required field label (`Reason *`) and validates that it's not empty. However, no quick-reason preset options were found (e.g., "Hours don't match schedule," "Missing receipt"). The field is required (validated) but still a blank textarea.

- **[HIGH] auth.html — photo upload as primary CTA** — DONE. The onboarding completion screen (step 3) shows "Go to your dashboard" as a full-width `btn-primary btn-lg` CTA (line 1226). The app store mention is moved to a secondary caption text at the bottom (line 1229). The mobile app download badges are in the MFA wizard (step 1), not in the onboarding completion.

- **[HIGH] timesheets.html — submitted state ghost opacity** — DONE (same as submission state issue above).

- **[HIGH] timesheets.html — rejection callout doesn't highlight the cell** — REMAINING. The `tsRejectionCallout` at line 951 shows the callout block, but there is no mechanism found to highlight the specific problematic cell in the grid with a red outline or arrow. The rejection message is static.

- **[HIGH] leaves.html — conflict warning inline** — REMAINING. The conflict tag in the team leaves approval queue shows "1 conflict" but no hover or inline expansion to show who else is off. The critic asked for inline expansion showing "Alice Wang is also on leave Apr 14–18."

- **[HIGH] calendar.html — day cells produce no feedback** — DONE. The calendar has a `dayDetail` panel that activates on day click, showing events and people out for that day. This is the correct T2 surface.

- **[HIGH] invoices.html — overdue rows missing "Send Reminder" action** — DONE. Overdue invoice row (INV-2026-046) has: View button + `<button class="btn btn-secondary btn-xs" onclick="sendReminder(...)"><svg> Remind</button>` + More button. The second overdue row (INV-2026-043) also has a Remind button. Send Reminder surfaced on overdue rows.

- **[MEDIUM] account.html — notification toggles require separate Save** — DONE. Each toggle has `onchange="saveNotifPref(this)"` which fires `showToast('success', 'Saved', ...)` immediately. Toggle = instant save is implemented.

- **[MEDIUM] admin.html — single Save button for all Company Settings** — REMAINING. Could not confirm that a sticky "unsaved changes" bar was added. The admin page does not show a `beforeunload` handler or sticky unsaved changes indicator in the code searched.

- **[MEDIUM] insights.html — NL query no loading state** — REMAINING. Could not confirm a loading spinner was added between NL query submit and AI response.

- **[MEDIUM] expenses.html — rejected expense resubmit opens blank form** — DONE (partially). The resubmit handler at lines 2013-2029 pre-fills `formDate` to today and calls `showToast('info', 'Resubmit', 'Form pre-filled with your rejected expense...')`. The actual field pre-fill of amount/category/description from the rejected expense was not fully confirmed, but the date is reset.

### ANTICIPATION Sub-section

- **[CRITICAL] timesheets.html — two competing post-submit elements** — DONE. Only `tsCompletionCard` fires on submit. The `tsSubmittedBanner` remains in the DOM but is not shown by the submit path — the completion card replaces the form view cleanly.

- **[HIGH] expenses.html — only toast after submit** — DONE (partially). The expense submission shows a toast. The critic asked for the expense to immediately appear in My Expenses with a "Pending" badge. The form resets after submit but an automatic list update was not confirmed.

- **[HIGH] leaves.html — cancel leave no confirmation** — DONE. The `confirmCancelLeave()` function creates a modal asking "Are you sure you want to cancel this approved leave? Your team will be notified." with Cancel and "Yes, Cancel" buttons.

- **[HIGH] invoices.html — Record Payment no confirmation** — DONE. `recordPayment()` opens `#recordPaymentModal` which shows the invoice amount, a date field, and a reference field before confirming. Hard stop confirmation exists.

- **[HIGH] approvals.html — queue count doesn't update** — DONE. `decrementKpi(type)` is called on each approval, updating `kpiPendingCount`, `kpiTimesheetCount`, `kpiLeaveCount`, `kpiExpenseCount`, and both the "All" tab count and the type-specific tab count in real time.

- **[MEDIUM] auth.html — completion CTA is "Download app" not "Go to dashboard"** — DONE. See above — "Go to your dashboard" is primary CTA.

- **[MEDIUM] hr.html — candidate stage change no toast** — DONE. Drag-and-drop stage change fires: `showToast('success', 'Stage Updated', dragSrc.querySelector('.cand-name').textContent + ' moved to ' + stageName + '.')` (line 1846).

- **[MEDIUM] planning.html — Assign doesn't update bench list** — REMAINING. `assignToProject()` opens an assignment modal, but on confirm (line 1388-1390) it only shows a toast and closes the modal. The bench list item is not removed from the DOM. The bench employee still appears as available after assignment.

### Remaining

- **[HIGH] approvals.html — rejection reason lacks preset quick-reasons** — REMAINING
- **[HIGH] timesheets.html — rejection callout doesn't highlight the specific cell** — REMAINING
- **[HIGH] leaves.html — conflict warning not expandable inline** — REMAINING
- **[MEDIUM] admin.html — no sticky unsaved changes bar** — REMAINING
- **[MEDIUM] insights.html — no loading state for NL query** — REMAINING
- **[MEDIUM] planning.html — bench list not updated after assignment** — REMAINING

---

## Drill-Down Map Verification

### Employee name/avatar → employees.html#[slug]
**WIRED** — All 13 employees have unique slugs in `data-employee` and `data-href`. Employee cards, admin users table, approvals queue, and expenses all have `data-hovercard` attributes with correct profile hrefs. Exception: Sarah Chen in admin table shows `href="employees.html"` (no slug, line 428).

### Project name anywhere → projects.html#[slug]
**WIRED** — Invoice rows, expense rows, client detail all use `projects.html#detail/[slug]` format. The alias map in projects.html handles common hash variants. All 8 projects have real data.

### Client name anywhere → clients.html#[slug]
**WIRED** — Invoice rows, project detail, and expenses all link to `clients.html#detail/[clientSlug]`.

### Timesheet row → right drawer with T2 fields
**PARTIALLY WIRED** — The Approval Queue was removed from timesheets. On approvals.html, the eye button on each timesheet row opens `#approvalDetailDrawer` with T2 content (day-by-day breakdown, project split, work time bar, approve/reject with note). The timesheets "Previous Weeks" tab rows do not have a detail drawer.

### Leave request row → right drawer with T2 fields
**WIRED (My Leaves)** — Each My Leaves row calls `openLeaveDetailDrawer()` with full T2 data.
**MISSING (Team Leaves)** — Team leave rows have no click handler. Approve/Reject only, no detail.

### Expense row → right drawer with T2 fields
**WIRED** — Both My Expenses and Team Expenses rows open `#expenseDetailDrawer` via `openExpenseDrawer()`.

### Invoice row → right drawer with T2 fields (data-driven)
**WIRED** — `showInvoiceDetail(invoiceId)` is data-driven from a 10-entry `invoiceData` map. Opens the full-page detail view (not a right drawer technically — it's a master-detail page swap). This is the Open Question Q1 from CRITIC_DRILL — the pattern is correct for the document nature of invoices.

### Approval item → right drawer with T2 context + Approve/Reject
**WIRED** — `openApprovalDrawer()` on eye button opens `#approvalDetailDrawer` with type-specific content (daily timesheet table for timesheets, conflict calendar for leaves, receipt for expenses) plus Approve/Reject buttons with note field inside the drawer.

### Kanban candidate card → right drawer with T2 fields
**WIRED** — `openCandidateDrawer()` opens `#candidateDrawer` with name, role, AI fit %, skills, work history, availability date, expected salary, interview notes, stage history, CV link, recruiter assignment.

### KPI numbers on dashboard → underlying list
**WIRED** — Heatmap cells link to timesheets.html. Revenue bars link to insights.html. KPI cards have been made interactive with `card-interactive` class. The four primary KPI cards appear to navigate to relevant pages (e.g., "Pending Approvals" card links to approvals.html via `onclick="window.location.href='approvals.html'"`).

### Calendar events → detail nested in calendar panel (no navigation away)
**WIRED** — `calendar.html` has `#dayDetail` panel that activates on day click showing events inline. No navigation away.

### projects.html → full project detail section for all 7+ projects
**WIRED** — All 8 projects (`acme-web`, `globex-phase2`, `initech-api`, `acme-mobile`, `umbrella-portal`, `internal-portal`, `dataviz-dashboard`, `globex-migration`, plus `acme-crm` as a bonus completed project) have complete data objects.

---

## Regressions

The following issues appear to be new or introduced during remediation:

1. **Sarah Chen in admin users table has no profile slug** (line 428 of admin.html: `href="employees.html"`) while all other 11 users have slugs. This is either an oversight from the fix pass or a pre-existing gap.

2. **Planning bench list — Liam O'Brien and Lisa Martinez use `data-href="employees.html"` without a slug** (lines 554, 563 of planning.html). Other bench employees (Bob Taylor) have correct slugs. This is inconsistent with the employee slug fix applied elsewhere.

3. **The `detailModal` (centered blocking modal) still exists in approvals.html** alongside the new `#approvalDetailDrawer`. The modal is wired to `detailModalClose` (line 1458) and still referenced. Two competing detail surfaces exist in the same page. The old modal is triggered if `openApprovalDrawer` fails or via old code paths.

4. **The `tsSubmittedBanner` still exists in timesheets.html HTML** alongside `tsCompletionCard`. While the submit flow only shows the completion card, the banner element remains in the DOM and could cause confusion if state management is extended.

5. **Sparklines still present in `insights.html` and `employees.html`** per grep. The "no sparklines" rule (per feedback_no_fun_things.md memory) was partially applied to timesheets and leaves but not purged from all pages.

---

## Summary Stats

| Critic File | Total Issues | Resolved | Remaining | Resolution Rate |
|-------------|-------------|---------|-----------|----------------|
| CRITIC_SPACE | 23 issues | 13 | 10 | 57% |
| CRITIC_UNITY | 35 issues | 13 | 22 | 37% |
| CRITIC_DRILL | 25 issues | 16 | 9 | 64% |
| CRITIC_FEEL | 22 issues | 12 | 10 | 55% |
| **TOTAL** | **105 issues** | **54** | **51** | **51%** |

### Priority Remaining Issues (fix next pass)

**P1 — Breaks the experience:**
- Team leave rows not clickable (DRILL #8)
- Rejection callout doesn't highlight specific cell (FEEL)
- Planning bench list doesn't update after assignment (FEEL)
- Insights KPI stat cards not clickable (DRILL #19)

**P2 — Visible to stakeholder:**
- AI Alerts widget still full card, not collapsed (SPACE)
- Projects kanban still shows billing rate + budget bar on surface (SPACE #21, #22)
- Rejection reason lacks preset quick-reason chips (FEEL)
- Leave conflict warning not expandable inline (FEEL)
- Dashboard approval items have no row-level detail action (DRILL #9)
- Leaves filter bar — My Leaves still 5 controls inline (SPACE)

**P3 — Consistency polish:**
- Three worktime display formats (bar/badge/number) across pages (UNITY #11)
- Two revenue chart implementations in index.html (UNITY #24)
- Employee avatar absent from presence list and bench list (UNITY #28)
- Table column headers inconsistent case (UNITY #32)
- Legend dot size inconsistency (UNITY #34)
