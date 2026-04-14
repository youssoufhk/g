# CRITIC_SPACE.md — Density & Overwhelm Audit
**Scope:** All 17 prototype HTML files in `/prototype/`
**Date:** 2026-04-13
**Standard:** Every issue here caused a real moment of confusion, over-reading, or scan-failure on inspection.

---

## SECTION 1: ISSUES

### TIMESHEETS (most critical)

**[TIMESHEETS] | [Week grid — Saturday and Sunday columns] | [Two columns of em-dashes that are never editable, wasting ~20% of horizontal space and forcing horizontal scroll on mid-size screens where only 5 work-day columns matter] | [Collapse weekend entirely; show only if user worked a weekend day — reveal on demand or summarize in the Total column tooltip]**

**[TIMESHEETS] | [Three footer rows below the grid: Total, Target, Status] | [Three stacked rows of metadata appear after every entry block. Most users need only one signal: am I under or over? The Target row repeats the well-known 8h/day and the Status row repeats via icon what the color already says. This is 3× the cognitive load of 1×.] | [Collapse Target and Status into the Total row itself: color-code the total cell, tooltip shows target. Only surface a dedicated row if there is an exception.]**

**[TIMESHEETS] | [Weekly summary bar: 6 data points (Hours, progress bar, %, Billable hours, Billable %, Internal hours)] | [The bar below the grid lists Hours: 32h / 40h, a progress bar, 80%, Billable: 27h (67%), Internal: 5h (12%), and an overwork indicator — all simultaneously. A user glances at this and sees a wall of numbers, not a single answer to "am I done?"] | [Reduce to 3 points maximum: total / target progress bar / billable %. Everything else (internal hours, overwork delta) moves to a drawer or tooltip on the progress bar.]**

**[TIMESHEETS] | [Pre-filled notice banner + auto-save indicator + rejection callout + submitted banner — 4 possible banners stacked above the grid] | [On any given view-state, multiple banners may coexist, adding noise even when only one is relevant. The pre-filled notice appears unconditionally every visit.] | [One banner at a time, priority-ordered. Auto-save becomes a subtle icon in the grid corner only. Pre-fill notice moves to a dismissible chip attached to the first edited cell, not a full banner.]**

**[TIMESHEETS] | [KPI strip: 4 cards (Hours This Week, Billable Rate, Pending Approval, Overtime)] | [Each card contains: label, large number, sparkline SVG, delta text, and a secondary sub-line — 5 elements per card. The sparklines (banned per no-fun-things rule) also fire animation on load. At 4 cards × 5 elements = 20 data points before the user sees the grid.] | [Strip stays at 4 cards but trim each to: label + number + delta only. Remove sparklines. Move the progress circle (donut SVG on Hours card) to a drawer.]**

**[TIMESHEETS] | [Quick-entry tip bar below the grid] | [A persistent instructional block with 3 keyboard shortcuts (8, 4/4, 0) is shown every visit to every user. It occupies a full row of space for content a returning user never needs.] | [Show only on first 3 visits, then auto-hide. Or collapse into a ? icon tooltip on the Project column header.]**

**[TIMESHEETS] | [Page header: h1 "Timesheet Management" + subtitle "Track hours, review submissions, and manage team timesheets" + breadcrumb + Saved Views dropdown + Export button] | [The subtitle is generic and describes the app's purpose, not a user-specific state. It adds a full text line that never changes and teaches nothing.] | [Remove subtitle entirely. h1 + CTAs only.]**

**[TIMESHEETS] | [Approval Queue tab — action-row detail field shows: week range · hours · project splits · overtime warning tag, all in one line] | [Example: "Week Mar 23–29 · 42h · Acme Corp (32h), Internal (10h) [+2h overtime]". This is 5 discrete facts crammed into a single inline sentence with no visual hierarchy. A manager reviewing 7 timesheets must parse this each time.] | [Primary line: Employee name + week + total hours (colored). Secondary line (subdued): project split. Warning tag: only if exception. Everything else — notes, individual day breakdown — moves to the drawer opened by the eye button.]**

**[TIMESHEETS] | [Month View tab — heatmap with 12 rows × 31 columns + legend + month summary rows] | [The month view heatmap is 372 cells. On desktop it's readable but visually identical cells with no labeling except on hover. There is no way to instantly spot a problematic week without hovering each cell. The worked-days summary row appears inline within the grid adding a 13th element per month block.] | [Reduce heatmap to weekly totals (5 week columns per month) with the daily breakdown accessible on click. Move month summary rows to a side panel or tooltip on the month label.]**

---

### LEAVES (second most critical)

**[LEAVES] | [Leave balance cards — each card has 7 data points: type label, remaining number, "of X days", Used count, Pending count, progress bar, expiry warning, year-over-year comparison] | [Seven pieces of information on a card whose only useful primary message is "how many days do I have left?" The year-over-year comparison ("Last year at this point: 10 used") appears for every card and requires prior-year recall to interpret.] | [Primary: remaining days + bar. Secondary: Used / Pending (two numbers). Everything else (expiry warning, YoY comparison) collapses to a tooltip or appears only in the drawer when the card is clicked. Expiry warning stays only if within 60 days.]**

**[LEAVES] | [Smart suggestion nudge card above the leave request list] | [A blue info panel reading "Book your remaining days soon / You have 8 days remaining and 3 bank holidays in December — consider booking before year-end" appears unconditionally on every visit, regardless of urgency. It adds a third visual band (after the KPI cards and filter bar) before the user sees their actual leave list.] | [Show only when expiry is within 90 days. Otherwise remove. Never persist after first dismissal in the session.]**

**[LEAVES] | [My Leaves filter bar: 5 controls (search input, status select, type select, from date, to date)] | [Five filter controls in a row is excessive for a personal leave list that typically holds fewer than 10 entries. The date range occupies 3 UI slots (from input, "to" label, to input). Combined with the nudge card above, the user hits 3 full rows of controls before reaching content.] | [Collapse to 1 search + 1 combined "Filter" button that opens a filter drawer. Date range can live in the drawer since most users view the current year by default (already set).]**

**[LEAVES] | [Leave request list — action-row shows: checkbox + icon + detail text + balance + status badge + action button] | [The "balance" column (e.g., "18 remaining balance") duplicates information already visible in the leave balance card grid directly above. A user who just read the annual leave card (18/25) now reads "18 remaining balance" again in the row.] | [Remove the balance column from the list. It's repeated. Show it only in the detail drawer when a row is opened.]**

**[LEAVES] | [KPI strip: 4 stat cards (Team Absences This Month, Approval Rate, Upcoming, Avg Response Time)] | [All four cards have secondary text lines and sparklines. "Approval Rate" showing 94% with a sparkline and "Consistent over 6 months" is interesting but belongs in Insights, not the leave request management page where a manager's job is approving/denying, not reviewing 6-month trends.] | [Reduce to 2 cards: Team Absences This Month + Upcoming (Next 2 Weeks). Approval Rate and Response Time move to Insights.]**

**[LEAVES] | [Page subtitle: "Manage leave requests, balances, and team availability"] | [Generic subtitle that describes the whole module. Not actionable. Every page in the app has this pattern.] | [Remove. h1 + CTA only in the page header.]**

**[LEAVES] | [Team Leaves tab — filter bar has 5 controls (All Departments, All Statuses, from date, "to" label, to date) with no search] | [Five filter controls with no search for a table that has 8 employees. On smaller screens this wraps into multiple lines. The date range alone takes 3 UI slots.] | [Collapse to 2 controls: Departments dropdown + Status dropdown. Date range moves behind a "Date Range" chip/button that expands inline.]**

---

### DASHBOARD (index.html)

**[DASHBOARD] | [KPI grid: 7 cards (Active Employees, Hours This Week, Pending Approvals, Team Work Time, Open Projects, Expenses This Month, Monthly Capacity)] | [Seven KPI cards at load is above the maximum of 4. A user must scan 7 cards before reaching the "Your Week at a Glance" section. The grid is 3-column on desktop which means it wraps and creates a second row, fragmenting attention further. Cards 5–7 (Open Projects, Expenses, Monthly Capacity) are arguably secondary to the daily workflow view.] | [Limit to 4 primary KPI cards: Active Employees, Hours This Week, Pending Approvals, Team Work Time. Move Open Projects, Expenses, and Monthly Capacity to a collapsed "Company Overview" section below the fold.]**

**[DASHBOARD] | [Week at a Glance card — bottom summary bar shows 3 sub-items: target badge + progress bar + 28h/40h, then a second line with "24h billable · 4h internal · 87% billable rate"] | [The Week at a Glance already shows daily bars with numbers (8h, 8h, 7h, 5h, --). The summary bar below it then repeats the aggregate in 3 different ways simultaneously. This is the third representation of "how many hours have I logged" on this page (KPI card, day bars, summary bar).] | [Bottom summary bar: keep progress bar + weekly total only. Remove the billable/internal breakdown line — it belongs in the Timesheets page. The KPI card already shows 394h team total.]**

**[DASHBOARD] | [AI Alerts widget showing 3 alert items with full text, badges, and action buttons — visible by default at full expansion] | [Three AI alerts with overwork details, redistribution suggestions, and multi-sentence explanations appear in a full card section visible on page load. Combined with 7 KPI cards and the Week at a Glance card, this is the third major content block before the user can scroll to Presence or Approvals.] | [Collapse AI Alerts to a single-line "3 alerts" summary chip in the page header or top-right corner. Expand into a drawer. Never show full alert text inline on the dashboard.]**

**[DASHBOARD] | [Dashboard section toggles for "Overview" and other sections — section labels add an additional navigation row between content groups] | [The collapsible section headers (Overview, etc.) add toggle buttons that duplicate the visual weight of the page header. They appear as mini-headers within the content flow.] | [Remove explicit section toggle buttons. Let visual grouping (spacing and card borders) do the job. Only use a toggle if a section is collapsed by default and user must opt in.]**

---

### APPROVALS (approvals.html)

**[APPROVALS] | [KPI cards: 4 cards each with label + number + mini-sparkline + two secondary text lines] | [Each approval KPI card (Total Pending, Timesheets, Leaves, Expenses) contains: a number, a sparkline SVG, a secondary stat line ("294h total logged", "8 days requested"), and a delta line ("+2 vs last week"). That is 4–5 elements per card × 4 cards = 16–20 elements before the queue. The sparklines are banned per policy.] | [Remove sparklines. Trim each card to: label + number + one secondary line. The delta ("vs last week") is secondary; make it optional on hover.]**

**[APPROVALS] | [AI Recommendation Banner + URGENT section label + filter bar = 3 full-width rows before the first approvable item] | [On load: breadcrumb, page header, KPI cards (4), tabs, AI banner, filter bar, URGENT label, then first item. That is 8 rows of chrome before a manager can act. The AI banner itself contains a paragraph of text and two buttons.] | [Move AI bulk-approve suggestion to a single inline action at the top of the queue list itself (not a full-width banner). Reduce pre-queue chrome to: tabs + filter bar only.]**

**[APPROVALS] | [Approval queue action-row — each row shows: checkbox + type icon + avatar + name + detail sentence + department + time-ago + status badge + 3 action buttons] | [That is 9 distinct UI elements per row. The department ("Engineering") and time-ago ("3d ago") appear in the action-row-meta slot but are low-signal for the primary approval decision. The status badge ("Overdue") is also shown by the red left-border accent, so it's duplicated.] | [Reduce each row to: avatar + name + request summary + time-ago + approve/reject buttons. Department and status badge move to the row's drawer. Remove the status badge from rows where the left-border accent already communicates urgency.]**

---

### INVOICES (invoices.html)

**[INVOICES] | [Invoice table: 9 columns (#, Invoice, Client, Project, Amount, Status, Issue Date, Due Date, Actions)] | [Nine columns is 4 over the maximum. The "#" column is purely an index with no scan value. The "Issue Date" and "Due Date" are two separate date columns occupying adjacent space.] | [Remove "#" column. Collapse Issue Date and Due Date into a single "Dates" column showing "Apr 1 → Apr 30" format. That brings the table to 6 columns: Invoice, Client, Amount, Status, Dates, Actions.]**

**[INVOICES] | [Amount cell contains two lines: the amount + the rate breakdown ("144h @ €85/h")] | [The rate breakdown is secondary detail that disrupts table scan. A manager reviewing 10 invoices reads 20 lines in the amount column instead of 10.] | [Move rate breakdown to the invoice detail drawer. Amount cell shows only the top-line figure.]**

**[INVOICES] | [Filter bar: 7 controls (Saved Views dropdown, Status, Client, From date, "to" label, To date, Amount min, Amount max)] | [Seven filter controls — including a 2-field amount range — make the filter bar wrap on all but the widest screens and requires significant horizontal space. Amount range filters for invoices are edge-case needs.] | [Default filter bar: Status + Client. Date range and amount range collapse behind an "Advanced Filters" button or drawer. Saved Views stays.]**

---

### PROJECTS (projects.html)

**[PROJECTS] | [List view table: 8 columns (Project Name, Client, Billing, Team Size, Budget %, Health, Status, Chevron)] | [Eight columns, two of which are near-duplicates: Health ("On Track" badge) and Status ("Completed" badge) appear side-by-side and carry the same semantic. For active projects, Status is blank — making it noise on 7 of 10 rows.] | [Remove Status column. Health column already carries On Track / At Risk / Complete / Planning. Chevron stays. That brings the table to 6 columns.]**

**[PROJECTS] | [Project kanban cards contain: name, client link, billing rate (€/h), team size count, health badge, budget % label + bar] | [Six elements per card. The billing rate (€85/h) is financial metadata that a project manager scanning the board for health status doesn't need at a glance. It also has a data-sensitive attribute suggesting it may be hidden for some roles — yet it still occupies layout space.] | [Remove billing rate from the card surface. Leave: name, client, health badge, budget bar. Billing rate goes in the detail drawer.]**

---

### EMPLOYEES (employees.html)

**[EMPLOYEES] | [Employee grid cards contain: avatar + presence dot, name, title, department, project tags (1–2 chips), work time bar + percentage, footer badge (Online/Offline + Overwork)] | [Seven data points per card. The footer row shows both the presence status badge and an "Overwork" badge — two badges on one card footer is crowded and the Overwork badge often overlaps the Online badge visually.] | [Reduce card to: avatar, name, title, work time bar + %. Presence dot on the avatar is sufficient for online/offline. Department and projects move to hover tooltip or card drawer. Overwork badge stays — only show it when overwork is the defining exception for that card.]**

**[EMPLOYEES] | [Directory page subtitle: "13 team members across 6 departments"] | [The subtitle repeats a count that will change and is also visible in the filter dropdowns. It adds a text row that will silently become wrong.] | [Remove. Or promote the count into a dynamic badge next to the h1 ("Team Directory · 13").]**

**[EMPLOYEES] | [Filter bar: search + Departments + Roles + Status + Save View + View toggle (Grid/List/Org)] | [Six controls. "Save View" is a feature-level CTA that competes with the filters for visual attention. The Org Chart view toggle is a third view mode buried next to filter controls.] | [Save View moves to a secondary "..." overflow menu. Org Chart view gets its own tab in the page tabs, not a cramped button in the filter bar.]**

---

### HR (hr.html)

**[HR] | [Recruitment tab: 3 KPI cards (Open Positions, Active Candidates, Avg Time-to-Hire) + a second separate 4-card strip (Open Roles, Total Candidates, Offers Pending, Avg Time-to-Hire) rendered within the same tab] | [Two separate KPI strips appear within a single tab. The first has 3 cards, the second has 4 cards. "Open Roles" and "Open Positions" appear to measure the same thing with different numbers (8 vs 3). "Avg Time-to-Hire" appears in both strips with different values (28 days vs 18 days). This is not just dense — it may be factually contradictory.] | [Consolidate to one 3-card strip per tab. Remove the duplicate strip entirely. Resolve the contradiction between "Open Positions: 8" and "Open Roles: 3" before shipping.]**

**[HR] | [Candidate count summary bar above the kanban board — lists all 5 pipeline stages with counts] | [The summary bar (Applied: 3 | Screening: 2 | Interview: 3 | Offer: 2 | Hired: 2) repeats the exact information already visible in the kanban column headers (column title + count badge). It adds a full-width row that users must visually skip every time to reach the kanban.] | [Remove the summary bar. The kanban headers are sufficient. If a compact summary is needed for small screens, generate it from the mobile stage selector tabs — which already exist.]**

**[HR] | [Planning tab — Resource Allocation Matrix: 8 employee rows × 9 columns (Employee + 7 projects + Total)] | [A 9-column table is technically not a list table — it is a matrix. On most screens it requires horizontal scroll. Empty cells show "—" making most of the visible table surface noise (sparse matrix). A user must scan 72 cells to understand 12 meaningful allocations.] | [Keep the matrix for power users but hide it behind a toggle (collapsed by default). Above the matrix, show a compact list of the 3 anomalies: overwork, bench, and under-allocated — the only cells that require action.]**

---

### ADMIN (admin.html)

**[ADMIN] | [Leave Types table: 9 columns (color dot, Name, Default Balance, Requires Approval, Max Consecutive, Carryover Max, Accrual Rate, Status, Actions)] | [Nine columns for a configuration table with 6 leave types. "Requires Approval" (Yes/No) and "Status" (Active badge) are the only truly distinct per-row values most of the time. The Accrual Rate column shows text like "2.08/month" which requires domain knowledge to interpret.] | [Trim to 6 columns: Name, Balance, Requires Approval, Carryover Max, Status, Actions. Move Max Consecutive and Accrual Rate to the edit drawer.]**

**[ADMIN] | [Expense Types table: 8 columns (icon, Name, Max Amount, Daily Limit, Requires Receipt, Requires Project, Status, Actions)] | [Eight columns. "Requires Receipt" and "Requires Project" are boolean (Yes/No) columns that rarely differ across types and add cognitive load for columns users almost never filter on.] | [Trim to 5 columns: Name, Max Amount, Requires Receipt, Status, Actions. Move Daily Limit, Requires Project to the edit drawer.]**

---

### INSIGHTS (insights.html)

**[INSIGHTS] | [Analytics card tabs: 9 tabs (Work Time, Revenue, Expenses, Projects, Leave Patterns, Team Performance, Client Health, Scheduled Reports, Forecasting)] | [Nine tabs in a single card is the maximum possible tab count before overflow. On a 1280px screen these tabs wrap. A user arriving at Insights cannot see all available analytics sections without first noticing the overflow — or the tabs run off screen on laptop sizes.] | [Split Insights into 3 top-level sections: People (Work Time, Team Performance, Leave Patterns), Financial (Revenue, Expenses, Client Health), Operations (Projects, Forecasting). Each section uses a 3-tab card. Scheduled Reports moves to Admin.]**

**[INSIGHTS] | [AI Insights card: three sub-tabs (Anomalies, Trends, Recommendations) each containing insight cards with: icon + title + severity badge + 1–2 sentence description + sparkline (inline SVG) + meta line (Affected, Detected time) + 2 action buttons] | [Each insight card has 6–7 elements. The inline sparkline SVGs (bar charts embedded within the description text) make the description line visually broken and hard to scan. They appear at text size within a sentence, making them unreadable. The meta line "Detected: 2 hours ago" is irrelevant for most decisions.] | [Remove inline sparklines from insight descriptions. Show them only in an expanded detail view. Reduce meta line to one item: the affected person or scope. Remove detection time unless it is directly relevant (e.g., "still active").]**

---

### CLIENTS (clients.html)

**[CLIENTS] | [Client detail view Overview tab: 4 stat cards + Outstanding Invoices widget + Revenue chart + Notes textarea — all visible simultaneously above the fold] | [The client detail Overview loads with 4 KPI cards, then immediately an outstanding invoices widget (3 figures: awaiting payment + overdue + satisfaction score), then a 6-bar revenue chart, then a notes textarea. This is 4 + 3 + chart + textarea = 8+ dense elements before the user even scrolls to Projects, Team, Timesheets, or Invoices tabs.] | [On the Overview tab, show only the 4 KPI cards + the single most urgent action (e.g., overdue invoice amount with one CTA). Revenue chart and Notes move to their own tabs in the client detail tabs.]**

**[CLIENTS] | [Client detail — Projects sub-table has 6 columns: Project Name, Status, Revenue, Budget Used, Margin, Health] | [Six columns for a list that may have 2–3 rows per client. "Status" (Active badge) and "Health" (On Track badge) are near-duplicates — an active project is virtually always On Track or At Risk; the health badge supersedes the status badge.] | [Remove Status column. Trim to: Project Name, Revenue, Budget Used, Health. That's 4 columns — scannable.]**

---

## SECTION 2: OPEN QUESTIONS

1. **timesheets.html — The Weekly Summary bar below the grid shows billable hours AND internal hours separately ("Billable: 27h (67%) · Internal: 5h (12%)"). Should the internal hours be removed entirely from the summary bar (moving it to the drawer) or replaced with a single "Non-billable: 5h" figure? This affects whether a manager can see the billable ratio on the same screen as the timesheet grid without opening a drawer — which matters if they're approving timesheets against a client contract.**

2. **timesheets.html — The Approval Queue tab within Timesheets is identical in structure to the top-level Approvals page. Should the Approval Queue tab be removed from Timesheets entirely (directing managers to the Approvals page), or should it remain as a filtered view? Keeping it means double-maintaining the same UI pattern; removing it may confuse managers who navigate to Timesheets expecting to approve there.**

3. **timesheets.html — The month view heatmap shows 12 months × 31 days = 372 cells. The proposal to collapse to weekly totals would reduce this to 12 months × 5 weeks = 60 cells. However, the product value of the heatmap is precisely the day-level granularity (spotting a pattern like "consistently no logging on Fridays"). Is weekly granularity sufficient for the month view, or should the day-level heatmap stay and the scanning problem be solved differently (e.g., row-level summary + heatmap only on hover)?**

4. **leaves.html — The balance card shows "Last year at this point: 10 used" for each leave type. This year-over-year comparison is only useful if the employee tracks their own usage patterns historically. Should this field be removed from the card entirely, shown only in an annual report drawer, or made optional via a user preference? The answer changes the information architecture of the balance card significantly.**

5. **leaves.html — The "Smart suggestion nudge" card (Book your remaining days soon) is currently always visible when annual leave balance > 0 and < 10. Should there be a dismissal mechanism that persists across sessions (stored in user preferences), or should it auto-hide after December 1 each year only? Permanent dismissal may cause users to miss genuinely important expiry warnings.**

6. **index.html (Dashboard) — The dashboard currently shows 7 KPI cards in a 3-column grid. The proposal to limit to 4 would remove "Open Projects", "Expenses This Month", and "Monthly Capacity". These three metrics are likely critical for founders and PM-role users. Should roles above PM see all 7 cards while employees see 4? This requires the role-based rendering system to apply not just to sections but to individual KPI card counts — is that currently supported or would it need new JS?**

7. **approvals.html — The AI Recommendation Banner ("4 routine timesheets match last week's pattern — bulk-approve safely") currently appears as a full-width card above the queue. If this is demoted to an inline suggestion at the top of the queue list, it needs a different visual treatment. Should it be: (a) a single sticky row at the top of the table/queue, (b) a toast notification that appears on page load and auto-dismisses in 8 seconds, or (c) a count badge on the "Bulk Actions" button with a tooltip? Each has different click-discovery implications.**

8. **insights.html — The 9-tab Analytics card is currently one flat card. The proposal to split into 3 sectioned groups (People / Financial / Operations) would fundamentally change the page layout. Should these become separate full-width cards with their own headers, or should the tab bar be reorganized with visual section dividers (pipe separators or grouped tab labels) to avoid breaking the existing card chrome? The former requires more vertical space; the latter may make the tab bar too wide on 1280px screens.**

9. **planning.html (Resource Allocation Matrix) — The 9-column Employee × Project matrix is proposed to be collapsed by default. However, this matrix is the primary planning tool for capacity management. Should it be the default expanded view for users with PM or Admin roles (who use it daily) while being collapsed for HR Specialist and below? This requires knowing the primary persona for the Planning page before deciding the default state.**

10. **clients.html — The client detail Notes field is a freeform textarea visible in the Overview tab alongside the KPI cards and revenue chart. The proposal to move it to its own tab removes it from the at-a-glance view. However, account managers may rely on seeing notes in context while reviewing the financial overview. Should Notes remain as a collapsed accordion panel in the Overview tab (visible but not expanded by default), or move to a dedicated tab?**
