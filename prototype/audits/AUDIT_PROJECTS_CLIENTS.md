# AUDIT: Projects, Clients & Invoices -- Depth & Profitability

**Auditor:** Critique Agent 2 -- Project & Client Depth  
**Date:** 2026-04-05  
**Scope:** `projects.html`, `clients.html`, `invoices.html` vs. APP_BLUEPRINT.md (sections 9-11) and DATA_ARCHITECTURE.md (section 2.5-2.7)  
**Perspective:** CTO of a consulting firm who needs to track project profitability down to the individual contributor level

---

## EXECUTIVE SUMMARY

The prototype demonstrates a solid visual framework: Kanban boards, list views, detail pages with tabbed navigation, and a clearly thought-through data model in the specs. The invoice detail page is genuinely impressive in its line-item breakdown. However, from the standpoint of a CTO who lives and dies by gross margin per project, the prototype has a critical structural gap: **it shows revenue without showing cost, making the "32% margin" stat card an unverifiable magic number.** The entire profitability story -- the single most important data chain in a consulting firm -- is decorative rather than functional. You can see the surface. You cannot verify the math.

**Overall Score: 5.5/10** -- Promising scaffolding, but the financial core is hollow.

---

## SECTION 1: PROJECT DETAIL PAGE

### 1.1 Can You Enter a Project and See Its Full Detail?

**Score: 7/10**

Yes. The prototype implements a working two-view pattern: `#listView` (kanban board + table) and `#detailView`, toggled via JavaScript `showDetail()` / `showList()` functions. Clicking any project card or table row fires `showDetail('acme-web')` (projects.html, line 761-778 for the card, line 909 for the table row).

**What works:**
- Board view with 3 columns (Planning/Active/Completed) -- spec-compliant per section 9.1
- List view table with Project, Client, Billing, Team Size, Budget %, Health, Status columns -- matches spec wireframe
- Detail page has 7 tabs: Overview, Team, Timesheets, Expenses, Invoices, Milestones, Activity
- Back-link navigation (`showList()`) returns cleanly

**What is broken:**
- **CRITICAL: Only one detail view is hardcoded.** The detail view always shows "Acme Corp -- Website Redesign" regardless of which project card you click. Lines 1048-1049:
  ```html
  <div class="project-detail-title">Acme Corp &mdash; Website Redesign</div>
  <div class="project-detail-client">Client: <a href="clients.html">Acme Corp</a></div>
  ```
  Clicking "Initech API Integration" or "Globex Phase 2" shows the exact same Acme detail. This is prototype-acceptable but needs to be flagged prominently -- any demo reviewer will notice this immediately.
- The `showDetail()` function (line 1850 area) simply toggles views. It does not parameterize content. The `data-project` attribute on cards is passed to the function but never consumed for content switching.

### 1.2 Does the Project Detail Show Everyone Working On It, Their Billing Rates, and Hours Logged?

**Score: 7/10**

Yes, the Team tab (lines 1206-1282) shows a proper table with columns: Member, Role, Rate, Hours Logged. The sample data:

| Member | Role | Rate | Hours |
|--------|------|------|-------|
| Sarah Chen | Lead Developer | 85/h | 120h |
| John Smith | Project Manager | 95/h | 80h |
| Alice Wang | Designer | 75/h | 88h |
| Marco Rossi | Frontend Developer | 85/h | 65h |
| Liam O'Brien | Junior Developer | 65/h | 35h |

**What works:**
- Per-employee billing rates are visible (matches `project_assignments.hourly_rate` from DATA_ARCHITECTURE.md line 363)
- Employee names are clickable links to `employees.html` (compliant with Global Pattern 1.1)
- "Add Team Member" button exists
- Rates differ by individual (not a flat project rate), which is correct for consulting firms

**What is missing:**
- **No "Revenue per employee" column (rate x hours).** The math is trivially derivable (Sarah: 85 x 120 = 10,200) but the prototype does not show it. A CTO glancing at this table cannot instantly see who is generating the most revenue.
- **No cost column.** The DATA_ARCHITECTURE spec includes `hourly_rate` on project_assignments but there is no concept of employee cost rate (salary / working hours). The prototype cannot show cost-side economics at all.
- **No allocation percentage displayed.** The data model has `allocation_pct` (line 365) but the Team tab does not show it. A PM needs to know if Sarah is 100% or 50% allocated.
- **No daily rate support.** The data model supports `daily_rate` on assignments (line 364), but the Team tab only shows hourly rates. Projects billed on daily rates have no representation.

### 1.3 Does the Project Show Revenue (Rate x Hours)?

**Score: 5/10**

The Overview tab (lines 1102-1136) shows four stat cards:
- Total Hours: 288h
- Budget Used: 49%
- Revenue: 24,500
- Margin: 32%

The revenue figure exists but is an opaque number. There is no breakdown showing how 24,500 was derived. Quick sanity check against the Team tab: (85x120) + (95x80) + (75x88) + (85x65) + (65x35) = 10,200 + 7,600 + 6,600 + 5,525 + 2,275 = 32,200. But the stat card says 24,500. The numbers do not reconcile. This is a prototype with static data, so numerical consistency across views was clearly not validated.

**This matters enormously.** If a real CTO sees different revenue numbers on the same project depending on which tab they check, trust in the platform evaporates.

### 1.4 Does the Project Show Cost and Gross Margin?

**Score: 3/10**

The "Margin: 32%" stat card exists but is completely unsubstantiated. There is:
- No visible cost number anywhere on the page
- No cost breakdown per employee (internal cost rate x hours)
- No cost vs. revenue comparison visualization
- No explanation of how 32% was calculated
- No distinction between gross margin (revenue - direct labor cost) and net margin (revenue - all costs including overhead)

**The spec itself (APP_BLUEPRINT.md section 9.2) calls for "Revenue" and "Margin" stat cards, so the prototype faithfully implements the spec -- but the spec itself is deficient.** It defines "Margin" as a stat without specifying where cost data comes from. The DATA_ARCHITECTURE has no `cost_rate` or `salary_cost_per_hour` field on the `users` table or `project_assignments` table.

This is the single biggest gap in the entire prototype. A consulting firm's core business question is: "For every euro we bill, how many cents do we keep?" Without a cost model, this question is unanswerable.

### 1.5 Project Timeline, Milestones, Progress?

**Score: 8/10**

The Milestones tab (lines 1432-1514) is well-executed:
- 6 milestones with distinct visual states: complete (green check), in-progress (blue loader), upcoming (gray circle)
- Date ranges for each phase
- Progress bar on the active milestone (60%)
- Logical sequence: Discovery -> Design -> Dev Sprint 1 -> Dev Sprint 2 -> Testing -> Launch

The project header (lines 1066-1085) shows:
- Budget progress: 24,500 / 50,000 (49%) with progress bar
- Timeline progress: Feb 1 -- Jul 31 (55%) with progress bar
- Start date badge: Feb 1, 2026

**What is missing:**
- **No end date badge** in the header (only start date shown at line 1061-1062)
- No Gantt-style visualization within the project detail (the sidebar links to a separate gantt.html)
- No dependency links between milestones
- Milestone amounts not shown (the data model has `project_milestones.amount` for milestone-based billing at line 384, but this is not rendered)
- No "days remaining" or "days overdue" calculation on upcoming milestones

---

## SECTION 2: CLIENT DETAIL PAGE

### 2.1 Does Client Detail Show All Projects Under That Client with Aggregate Revenue?

**Score: 6/10**

The client detail page (clients.html, lines 644-1065) shows Acme Corp with tabs: Overview, Projects (5), Team (8), Invoices (6), Documents (3).

The Overview tab has stat cards:
- Total Revenue: 145,000
- Active Projects: 3
- Team Members: 12
- Avg Project Health: On Track

The Projects tab (lines 800-877) shows a proper table with columns: Project Name, Status, Billing, Budget Used, Health. Five projects are listed (Acme Web Redesign, Acme Mobile App, CRM Integration, Brand Guidelines, Security Audit 2025).

**What works:**
- Revenue chart showing last 6 months of bar data (Nov-Apr)
- Projects table with health indicators
- Budget utilization progress bars per project

**What is fatally missing:**
- **No per-project revenue column in the Projects tab.** You can see there are 5 projects, you can see overall revenue is 145k, but you cannot see how that 145k breaks down. Which project generated 80k and which generated 5k? The information needed to decide where to focus is absent.
- **No profitability per project from the client view.** A CTO looking at a client account needs to instantly see: "Project A has 42% margin, Project B has 8% margin -- we need to renegotiate Project B." This view does not exist.
- **No lifetime value (LTV) calculation.** Client since Jan 2024, but only YTD revenue is shown. What is total historical revenue? Contract value pipeline?
- **No billing type column shows actual rates.** The Projects tab column says "Time & Materials" or "Fixed Price" but does not show the actual rate/amount. This is critical for comparing profitability across projects.

### 2.2 Can You Drill from Client -> Project -> Employee?

**Score: 6/10**

The navigation chain partially exists:
1. **Client list -> Client detail:** Click a client card to open detail view (JS event handlers on `.client-card`)
2. **Client detail -> Project:** Project names in the Projects tab link to `projects.html` (line 815: `<a href="projects.html">Acme Web Redesign</a>`)
3. **Client detail -> Employee:** Team tab shows employee names linking to `employees.html` (line 894)
4. **Project detail -> Client:** Client name links to `clients.html` (line 1049)
5. **Project detail -> Employee:** Team tab names link to `employees.html` (line 1229)

**What is broken:**
- **All cross-page links are generic.** `href="projects.html"` and `href="employees.html"` do not carry any parameter or hash. Clicking "Acme Web Redesign" from the client page opens the projects page at the list view, not at the Acme Web detail. The drill-down chain is conceptually correct but practically broken.
- **No breadcrumb trail.** When you drill from Client -> Project, there is no way to see "Clients > Acme Corp > Acme Web Redesign" and navigate back up the chain. The back button only goes to the Projects list.
- **No employee -> project back-reference.** You can go Client -> Employee, but you cannot see from an employee profile which projects they are working on for this client. (This would be on employees.html, outside audit scope, but the data chain is incomplete.)

### 2.3 Client Team Tab

**Score: 5/10**

The Team tab (lines 880-970) shows 8 team members with columns: Name, Role, Current Project, Hours This Month.

**What is missing:**
- **No billing rate per team member.** For a consulting firm, knowing that Sarah Chen costs 85/h or is billed at 85/h per project is essential. The team tab shows role but not rate.
- **No revenue contribution per member.** Hours are shown but not revenue (hours x rate).
- **Members are listed flat, not grouped by project.** A client with 3 active projects and 12 team members should show a grouped view: Project A (5 people), Project B (4 people), Project C (3 people).

---

## SECTION 3: INVOICES PAGE

### 3.1 Does Invoicing Connect Logically to Projects and Clients?

**Score: 8/10**

The invoice list table (invoices.html, lines 478-635) includes columns: Invoice number, Client, Project, Amount, Status, Issue Date, Due Date, Actions. Every row links to both the client (via `clients.html`) and the project (via `projects.html`).

The invoice detail (lines 660-822) shows:
- Header with "Client: Acme Corp" and "Project: Acme Web Redesign" (both clickable)
- Line items table with Description, Employee, Qty, Rate, Amount
- Subtotal, Tax (20%), Grand Total
- Status timeline: Created -> Sent -> Awaiting Payment -> Paid

The Generate Invoice modal (lines 831-915) correctly has:
- Client selector
- Project selector
- Date range for timesheet hours
- Payment terms
- Preview summary with billable hours, hours total, expenses, subtotal, tax, estimated total

**What works extremely well:**
- The line items breakdown (lines 720-762) shows individual employees, their hours, their rates, and resulting amounts. This is exactly what a consulting firm invoice should look like.
- The connection between timesheets and invoices is implied by the date-range-based generation flow
- Expenses are included as separate line items (travel, hotel)

**What is missing:**
- **No invoice editing capability.** The spec (section 11.2 step 4) says "Preview line items -- user can edit/add/remove." The prototype shows a static table with no edit controls, no add-row button, no delete-row capability.
- **No credit note or adjustment mechanism.** Real consulting invoicing frequently needs adjustments.
- **No split invoice support.** Sometimes a project needs multiple invoices per period (e.g., different cost centers at the client).
- **No recurring invoice setup.** Retainer billing models should auto-generate monthly invoices. The data model supports `billing_model = 'retainer'` but there is no UI for configuring auto-generation.
- **The project dropdown in the Generate modal is hardcoded** (lines 852-857) to only Acme projects. It does not dynamically filter based on the selected client.

### 3.2 Invoice Stat Cards

**Score: 7/10**

The stat cards (lines 434-455) show: Total Outstanding (28,400), Paid This Month (45,200), Overdue (12,800), Avg Payment Time (18 days).

This is useful operational data. Missing: **Aging report** (how long invoices have been outstanding, bucketed by 30/60/90 days). Also missing: **Revenue forecast** based on sent-but-unpaid invoices.

---

## SECTION 4: SPEC COMPLIANCE SCORECARD

| Spec Requirement | Present? | Notes |
|---|---|---|
| **9.1** Board/List/Timeline views | PARTIAL | Board and List work; Timeline shows a toast "Coming soon" |
| **9.1** Filter by Status/Client/Billing | YES | All three filter dropdowns present (lines 678-699) |
| **9.2** Project header with budget/timeline bars | YES | Both progress bars with percentages (lines 1066-1085) |
| **9.2** Overview stats (Hours/Budget/Revenue/Margin) | YES | Four stat cards present (lines 1103-1136) |
| **9.2** Team table with Rate and Hours | YES | Full table with 5 members (lines 1214-1282) |
| **9.2** Milestones tracker | YES | 6 milestones with states (lines 1432-1514) |
| **9.2** Hours Trend chart | YES | SVG area chart (lines 1142-1175) |
| **9.2** Budget Burndown chart | YES | SVG line chart with ideal line (lines 1179-1199) |
| **10.1** Client cards with revenue | YES | 5 clients with YTD revenue (lines 534-628) |
| **10.2** Client contacts | YES | 3 contacts with roles (lines 671-701) |
| **10.2** Revenue history chart | YES | 6-month bar chart (lines 742-795) |
| **10.2** All projects listed | YES | 5 projects in table (lines 800-877) |
| **10.2** Satisfaction score | NO | Not implemented |
| **10.3** Client Portal | NO | Not prototyped (separate auth scope) |
| **11.1** Invoice list with filters | YES | Status, Client, Date range filters (lines 458-475) |
| **11.2** Generate invoice flow | PARTIAL | Modal with preview but no line-item editing |
| **11.3** Line items with employee names | YES | Full breakdown (lines 710-762) |
| **11.3** PDF preview | NO | Download button exists but no embedded preview |
| **11.3** Status timeline | YES | 4-step visual timeline (lines 793-821) |

---

## SECTION 5: WHAT IS MISSING THAT A CONSULTING FIRM ABSOLUTELY NEEDS

### 5.1 The Profitability Stack (CRITICAL -- not prototyped at all)

A consulting firm needs this data chain to survive:

```
Employee internal cost rate (salary / billable hours capacity)
    x Hours worked on Project X
    = Direct labor cost for Project X

Billing rate for Employee on Project X
    x Billable hours on Project X
    = Revenue for Project X

Revenue - Direct Labor Cost = Gross Profit
Gross Profit / Revenue = Gross Margin %
```

**None of this math is exposed in the prototype.** The "32% margin" stat card is a static string with no supporting data. There is no `cost_rate` field in the data model, no cost breakdown table, no margin waterfall visualization.

Without this, the entire project management module is an activity tracker, not a profitability management tool. Any consulting firm evaluating GammaHR against competitors (Mavenlink/Kantata, Harvest + Forecast, Scoro) will immediately notice this gap.

### 5.2 Utilization Rate (CRITICAL -- not prototyped)

The number one KPI for consulting firms is utilization rate: billable hours / available hours. There is no utilization view per employee, per project, per team, or per company. The data model supports it (timesheets have `is_billable` per entry), but no UI surfaces the calculation.

### 5.3 Budget vs. Actual by Phase/Milestone (HIGH)

Milestones show progress status but not financial status. "Development Sprint 1 is 60% done" tells you nothing about whether it is over budget. "Sprint 1 budgeted at 15,000, spent 12,000 at 60% complete" tells you it is trending 20% over budget. This view does not exist.

### 5.4 Rate Card Management (HIGH)

The data model correctly separates project-level rates from employee-level rate overrides (project_assignments.hourly_rate vs projects.hourly_rate). But there is no UI for managing a rate card. Consulting firms negotiate rate cards per client per year. The client detail page shows a "Rate Card 2026.xlsx" in the Documents tab (clients.html line 1047) as a flat file -- it should be structured data in the system.

### 5.5 Forecast / EAC (Estimate at Completion) (HIGH)

Given current burn rate, when will the budget be exhausted? The Budget Burndown chart shows an ideal vs. actual line, but there is no numeric "EAC" or "Estimated Completion Date at Current Burn" indicator. If burn is tracking above ideal, the system should calculate the projected overrun amount and date.

### 5.6 Multi-Currency Support (MEDIUM)

The data model has `currency VARCHAR(3) DEFAULT 'EUR'` on projects and invoices. The prototype only shows Euro amounts. No currency conversion, no multi-currency invoice support, no exchange rate management. For any consulting firm with international clients, this is a hard requirement.

### 5.7 Contract / SOW Management (MEDIUM)

Projects reference clients and have billing models, but there is no contract entity linking them. A real consulting engagement has: MSA -> SOW -> Project -> Invoices. The MSA sets terms, the SOW defines scope and budget, the project tracks execution. The current model collapses SOW into the project entity, which breaks when one SOW spawns multiple projects or when SOW amendments change rates mid-project.

### 5.8 Write-offs and Non-Billable Tracking (MEDIUM)

The timesheet has `is_billable` per entry, but there is no project-level view showing: "120h billable + 18h non-billable = 138h total, write-off ratio: 13%". Non-billable time is the silent margin killer in consulting.

### 5.9 Approval Workflow for Rate Changes (MEDIUM)

If a PM changes an employee's billing rate on a project, there is no approval flow or audit trail shown. Rate changes directly impact revenue and should require authorization.

### 5.10 Revenue Recognition Status (MEDIUM)

For accrual-basis accounting: revenue is recognized when the work is done (timesheet approved), not when the invoice is paid. No earned-but-not-yet-invoiced (accrued revenue) metric exists. This is a standard accounting requirement for consulting firms.

---

## SECTION 6: DATA INTEGRITY ISSUES IN PROTOTYPE

These are not bugs per se (static prototype), but they indicate insufficient attention to data consistency during prototyping:

1. **Revenue mismatch:** Project detail Overview shows Revenue: 24,500. But Team tab members: (85x120)+(95x80)+(75x88)+(85x65)+(65x35) = 32,200. These are on the same page.

2. **Budget inconsistency:** The Acme Web Redesign card on the kanban shows "Budget 49%" and the detail shows "24,500 / 50,000 (49%)". But 24,500 / 50,000 = 49% while the Team tab hours at their rates yield 32,200 which would be 64.4% of 50,000. The budget number and the hours x rates number tell different stories.

3. **Invoice total mismatch:** The invoice detail for INV-2026-048 shows the grand total as 13,044 (subtotal 10,870 + tax 2,174). But the invoice list shows this invoice as 12,400. These should be the same number.

4. **Client projects mismatch:** The client list card says "3 active projects" for Acme Corp. The client detail Projects tab lists 5 projects (3 active + 2 completed). The client detail Overview stat card says "Active Projects: 3" -- consistent with the card but the tab label says "Projects (5)". This is actually correct behavior, but it should be clearer that the card count is active-only.

5. **Client names inconsistent across pages:** Projects page card says "Client: Acme" (line 867), another says "Client: Acme Corp" (line 763). The client detail page says "Acme Corp". Name consistency matters for data integrity signaling.

---

## SECTION 7: RATINGS SUMMARY

| Area | Score | Verdict |
|------|-------|---------|
| Project List View (Kanban + Table) | 7/10 | Solid, matches spec, filters work |
| Project Detail -- Structure & Tabs | 7/10 | All 7 tabs present, well-organized |
| Project Detail -- Team & Rates | 7/10 | Shows individual rates and hours per member |
| Project Detail -- Financial (Revenue/Cost/Margin) | 3/10 | Revenue is an unverifiable number; cost and margin are fabricated |
| Project Detail -- Timeline & Milestones | 8/10 | Best-in-class among the pages audited |
| Client List View | 7/10 | Clean cards with YTD revenue, contact info |
| Client Detail -- Overview | 6/10 | Revenue chart and stats present but shallow |
| Client Detail -- Projects Breakdown | 4/10 | No per-project revenue, no profitability comparison |
| Client -> Project -> Employee Drill-down | 5/10 | Links exist but are all generic (no parameters) |
| Invoice List | 8/10 | Proper table with client/project links, status filters |
| Invoice Detail | 8/10 | Excellent line-item breakdown per employee |
| Invoice Generation Flow | 6/10 | Preview works but no line-item editing per spec |
| Cross-page Data Consistency | 3/10 | Multiple numerical contradictions |
| Profitability Depth (the core use case) | 2/10 | Essentially absent; no cost model, no real margin calculation |

**Weighted Overall: 5.5/10**

---

## SECTION 8: TOP 5 ACTIONS FOR NEXT ITERATION

1. **Add a cost model.** Introduce `internal_cost_rate` to the users table or a separate `employee_cost_rates` table with effective dates. Compute cost per project as SUM(cost_rate x hours). Show revenue, cost, and margin side-by-side on every project detail.

2. **Build a Project Profitability Dashboard.** A dedicated view (or a tab on the project detail) showing: Revenue waterfall (by employee), Cost waterfall (by employee), Gross margin trend over time, Budget vs. Actual vs. Forecast, and a comparison against other projects.

3. **Parameterize detail views.** The hardcoded detail views must resolve to unique data per entity. Even in a static prototype, create 2-3 project detail variants to demonstrate the data model works across different project types (hourly, fixed, retainer).

4. **Add per-project revenue to the Client Projects tab.** The table needs at minimum: Revenue (actual), Budget (total), and Margin columns so a CTO can compare profitability across projects for the same client.

5. **Fix numerical consistency.** Before any demo, audit every number that appears in more than one place and ensure they reconcile. The current contradictions (24,500 revenue vs. 32,200 from hours x rates; 12,400 vs. 13,044 invoice totals) undermine credibility.

---

*End of audit. The bones are good. The muscles are missing. Build the profitability layer or this is just a pretty timesheet app.*
