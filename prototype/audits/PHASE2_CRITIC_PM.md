# GammaHR v2 Prototype -- Phase 2 PM Audit

> **Auditor Role:** Senior Product Manager (10+ SaaS products shipped)
> **Date:** 2026-04-05
> **Scope:** Complete prototype audit -- all 15 HTML files, 3 CSS files, 2 spec files
> **Verdict:** Promising foundation with critical structural gaps that would lose deals against BambooHR/Personio

---

## Executive Summary

GammaHR v2 is a well-designed operations platform for consulting firms that excels at time tracking, resource visualization, and financial workflows -- but it is fundamentally not an HR platform. The product is named "GammaHR" yet contains zero HR features: no recruitment pipeline, no onboarding workflows, no offboarding checklists, no performance reviews, no compensation management. This is a fatal naming/positioning mismatch that would confuse every buyer. The prototype's visual quality is genuinely premium (the Earth & Sage dark-mode palette is distinctive and the component library is solid), but the information architecture has too many navigation items (13 sidebar entries), several pages are surface-deep checkbox features rather than deep workflows, and the AI capabilities are decorative rather than genuinely transformative. A 300-person consulting firm evaluating this against Personio + Harvest/Toggl would find the operations side compelling but would immediately disqualify it for lacking core HR.

---

## Findings by Severity

### CRITICAL -- Deal-Breakers

#### C-1. Zero HR Features in a Product Called "HR" [CONFIRMED]
**Severity:** CRITICAL
**Files:** All sidebar navigation (every `.html` file), `specs/APP_BLUEPRINT.md`

The sidebar across all 15 pages contains: Dashboard, Timesheets, Expenses, Leaves, Projects, Clients, Resource Planning, Gantt Chart, Invoices, AI Insights, Team Directory, Approvals, Configuration. Not a single HR function exists:

- **No recruitment/ATS:** No job postings, no candidate pipeline, no interview scheduling
- **No onboarding:** The blueprint mentions onboarding as "step 2/3" for invited users (lines 203-221 of `APP_BLUEPRINT.md`) but this is just profile completion -- not HR onboarding (equipment provisioning, document signing, training plan, buddy assignment, 30/60/90 day milestones)
- **No offboarding:** No exit workflows, no equipment return tracking, no knowledge transfer checklists
- **No performance reviews:** No 1:1 tracking, no goal setting, no 360 feedback, no competency frameworks
- **No compensation management:** No salary bands, no compensation history, no pay run integration
- **No org chart:** The blueprint spec (Section 4.1, line 386-398) explicitly includes an Org Chart view toggle. The prototype `employees.html` only implements Grid and List views. The Org Chart button is completely absent.
- **No employee lifecycle management:** No contract types, no probation tracking, no work permit/visa tracking

**Impact:** Every procurement process for an "HR platform" will ask "Where is recruitment?" within the first 5 minutes of the demo. This is a disqualifying gap.

**Fix:** At minimum for v1: Add a sidebar section "HR" with Onboarding (checklist-based with templates), Employee Records (contract/compensation/emergency contacts), and a simple Org Chart view. Recruitment can be v2, but onboarding/offboarding are table stakes.

---

#### C-2. "Utilization" Terminology is Pervasive and Dehumanizing [CONFIRMED]
**Severity:** CRITICAL
**Files:** 130+ occurrences across 14 files (verified via grep)

The word "utilization" or "utiliz-" appears 130 times across the prototype. Key locations:

- `index.html` line 765: table header "Utilization"
- `employees.html`: 60+ occurrences in employee cards, profile stats, list view
- `gantt.html`: 25 occurrences in utilization badges, bar labels
- `insights.html`: 16 occurrences in analytics charts and AI insights
- `_tokens.css` and CSS files: comment references
- `APP_BLUEPRINT.md` / `DESIGN_SYSTEM.md`: semantic color mapping uses "Utilization healthy/low/critical"

The founder is right: calling employees "87% utilized" reduces humans to assets. Every competitor that has matured beyond startup phase has moved away from this language.

**Fix:** Global find-and-replace "Utilization" with "Work Time" or "Allocation". In CSS class names: rename `.util-bar`, `.utilization-fill`, `.utilization-pct`, `.util-high/mid/low/over` to `.worktime-bar`, `.allocation-fill`, etc. In the `DESIGN_SYSTEM.md` semantic color table (line 187-189), replace "Utilization healthy/low/critical" with "Allocation healthy/low/critical".

---

#### C-3. Dashboard Layout Bug -- Cards Stack Vertically [CONFIRMED]
**Severity:** CRITICAL
**File:** `index.html` lines 28-34

The KPI grid is defined as:
```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-4);
}
```

This is correct CSS, but at typical laptop widths (1024-1439px), the responsive override on line 32 drops to `repeat(3, 1fr)`, and on tablet (max-width: 1023px) drops to `repeat(2, 1fr)`. The reported "vertical stacking" bug likely occurs because the 6-column grid at full width creates cards that are too narrow to be readable (each card gets ~170px at 1200px content width). The stat cards at lines 608-732 contain sparklines, trend badges, and warning indicators that need minimum ~220px to render properly.

**Fix:** Change the default to `repeat(3, 1fr)` for the 6 KPI cards, or reduce to 4 KPI cards that work better in a `repeat(4, 1fr)` grid. The current 6-card grid is too dense -- no user needs to see Active Employees, Hours This Week, Pending Approvals, Billable Hours %, Open Projects, AND Expenses all at once. Prioritize the 4 most actionable.

---

#### C-4. Progress Bars Hard-Capped at 100% [CONFIRMED]
**Severity:** CRITICAL
**Files:** `employees.html` lines 816-818, `_components.css`

The utilization bars use `width: X%` with CSS `overflow: hidden` on the parent (`.utilization-track` line 155 of `employees.html`). An employee working 60h in a 40h week (150% allocation) would render identically to someone at 100%. There is no visual distinction between "fully allocated" and "dangerously over-allocated."

In the Gantt chart (`gantt.html`), the `.util-over` class exists (line 301-304) but it only changes the badge color -- the bar itself still caps at 100%.

**Fix:** Allow bars to overflow the track container with a different color segment beyond 100%. Use the spec's own semantic colors: >100% should use `--color-error` with an animated pulse. Show the actual percentage (e.g., "150%") with a warning icon. The `.utilization-track` needs `overflow: visible` and the fill needs a two-tone approach: green up to 100%, then red beyond.

---

### HIGH -- Significant Gaps

#### H-1. Employee Directory Won't Scale Past 50 People
**Severity:** HIGH
**File:** `employees.html` lines 654-935

The directory renders 12 employee cards in a 3-column grid with no pagination, no virtual scrolling, and no alphabetical grouping. At 200+ employees:

- The grid view would generate 200+ DOM nodes with avatars, project badges, and utilization bars
- No alphabetical sidebar/jumpbar for quick navigation
- No department-grouped accordion view
- Search is client-side only (no indication of server-side search)
- The "12 team members across 6 departments" subtitle (line 600) is hardcoded

The list view (toggled via the view-toggle buttons at line 644) provides a table format but still lacks pagination in the HTML.

**Fix:** Add server-side pagination (25 per page), alphabetical jump sidebar, department-grouped accordion view, and a "Recently Viewed" section at top. For 200+ companies, this is the most-visited page -- it must be fast.

---

#### H-2. Client Overview is Dangerously Thin
**Severity:** HIGH
**File:** `clients.html`

The client detail view shows: logo, name, contact, active projects, team members, revenue chart, notes, and documents. Missing entirely:

- **% of total business:** A client representing 40% of revenue is a concentration risk. No indicator exists.
- **Revenue trends with period comparison:** The revenue bar chart shows monthly amounts but no YoY comparison or trend line
- **PM/Account ownership:** No "Account Manager" or "Client Lead" field
- **Client health score:** No NPS, no satisfaction tracking, no churn risk indicator
- **Contract value vs. actual:** No tracking of contracted spend vs. actuals
- **Profitability per client:** No margin tracking (revenue minus cost of team hours)
- **Communication history:** No log of meetings, calls, or important decisions

**Fix:** Add a "Client Health" card at the top with: % of total revenue (with risk coloring if >25%), trailing 12-month trend sparkline, assigned account manager (clickable to employee profile), and a simple health score (green/yellow/red) derived from project statuses and payment history.

---

#### H-3. AI Insights Are Decorative, Not Actionable [CONFIRMED]
**Severity:** HIGH
**Files:** `index.html` lines 872-919, `insights.html`

The dashboard AI alerts (index.html) show three items:
1. "Unusual expense pattern detected for Bob Taylor" -- with "Dismiss" and "Investigate" buttons
2. "Timesheet gap: David Park has no entries for March 28-29" -- same buttons
3. "Resource conflict: Sarah Chen allocated 120% next week" -- same buttons

These are just rule-based alerts dressed up with a sparkles icon. They are not AI insights. Real AI insights would:

- **Predict** churn risk: "Client Acme's engagement is down 15% month-over-month; 3 similar clients churned after this pattern"
- **Recommend** actions: "If you reassign Sarah Chen from Initech to the new Globex project, team utilization increases from 78% to 86% and revenue improves by 12K/month"
- **Detect patterns** across time: "Your team consistently submits timesheets 2 days late in weeks containing company holidays"
- **Forecast** revenue: "Based on current pipeline and allocation, Q3 revenue is projected at 340K, 12% below target"

The `insights.html` page is better -- it has a natural language query bar with suggested queries and a more detailed insight feed. But the insights themselves are still just pre-written cards with static content, not dynamically generated.

**Fix:** In the prototype, rewrite the AI alert cards to show genuinely predictive content. Add entity-level AI: on each employee profile, show "AI Summary" (predicted bench risk, skill growth trajectory); on each client, show "Revenue forecast" and "Churn risk score"; on each project, show "Budget overrun probability."

---

#### H-4. Sidebar Has 13 Items -- Information Architecture Overload
**Severity:** HIGH
**Files:** All HTML files, sidebar navigation

The sidebar contains 13 items across 4 sections:
- **Main (4):** Dashboard, Timesheets, Expenses, Leaves
- **Work (4):** Projects, Clients, Resource Planning, Gantt Chart
- **Finance (2):** Invoices, AI Insights
- **Admin (3):** Team Directory, Approvals, Configuration

Problems:
1. **Resource Planning AND Gantt Chart are redundant.** The Gantt chart IS resource planning. Having both confuses users about which to use. Verified: `planning.html` shows capacity forecasting and bench analysis while `gantt.html` shows the timeline view. These should be tabs within a single "Resource Planning" page.
2. **AI Insights under Finance makes no sense.** AI insights cover utilization, team health, expense anomalies -- not just finance. It should be its own top-level item or integrated contextually into each page.
3. **Team Directory under Admin is wrong.** Every employee accesses the directory daily. It is not an admin function. It should be under Main or Work.
4. **No Calendar page exists.** The blueprint (Section 12, line 1182) specifies a full Calendar page. It is completely missing from the prototype. No `calendar.html` file exists, and no sidebar link points to one.

**Fix:** Consolidate to 10 items max:
- Main: Dashboard, Timesheets, Expenses, Leaves
- People: Team Directory, (future: HR module)
- Work: Projects, Clients, Resource Planning (with Gantt as a tab)
- Finance: Invoices
- Admin: Approvals, Configuration
Move AI Insights to contextual panels on each page rather than a standalone page.

---

#### H-5. No Calendar Page Despite Being in the Spec
**Severity:** HIGH
**Files:** `APP_BLUEPRINT.md` Section 12 (lines 1182-1199), sidebar in all HTML files

The blueprint spec defines a full Calendar page at `/calendar` with Day/Week/Month/Year views, event type filtering (Leaves, Projects, Holidays, Milestones), and integration with all scheduling data. This page does not exist in the prototype. There is no `calendar.html` file and no sidebar link to it. For a consulting firm managing 50-500 employees across multiple client projects, a unified calendar view is essential for capacity planning and conflict detection.

**Fix:** Build `calendar.html` as specified. At minimum: Month view with leave overlay, holiday markers, and project milestone dots. This can share infrastructure with the leave calendar mini-view.

---

#### H-6. All Employee Links Go to the Same Page
**Severity:** HIGH
**Files:** `index.html` lines 771-865

Every employee name in the dashboard's "Team Availability" table links to `employees.html` -- not to that specific employee's profile. For example, line 771: `<a href="employees.html">Sarah Chen</a>`. This violates the spec's Universal Clickable Identity rule (Section 1.1, lines 39-55) which states that clicking any employee name should navigate to their profile page.

The same issue exists in the activity feed (lines 1009-1054), presence panel (lines 1077-1143), and approval widgets. Every employee link is `href="employees.html"` rather than `href="employees.html#sarah-chen"` or `href="employees.html?id=sarah-chen"`.

**Fix:** All employee links should include an identifier. In the prototype, use hash links (`employees.html#sarah-chen`) and add JavaScript to scroll to / display the profile view for that employee on load.

---

#### H-7. Client Portal Missing "Messages" Tab
**Severity:** HIGH
**File:** `portal/index.html` line 272-293

The blueprint spec (Section 10.3, lines 1138-1142) specifies a Messages tab in the client portal for "threaded communication with project team, attach files, @mention team members." The portal navigation in the prototype has: Dashboard, Projects, Timesheets, Invoices, Documents. No Messages tab exists. For client-facing consulting firms, this is the primary communication channel.

**Fix:** Add a Messages tab with threaded conversations per project. Even a simple chat UI (like Basecamp's message board) would satisfy the requirement.

---

### MEDIUM -- Notable Gaps

#### M-1. No Keyboard Shortcuts Implemented
**Severity:** MEDIUM
**Files:** All HTML files

The blueprint spec (Section 1.5, lines 100-114) defines keyboard shortcuts including Cmd+K for command palette, Cmd+N for new item, and G+D/T/E/L/P/G/C for navigation. None are implemented in any HTML file. The search bar shows `Cmd+K` as a hint (e.g., `index.html` line 447: `<kbd>&#8984;K</kbd>`) but no JavaScript handler exists. For a "power user" tool targeting consultants, keyboard-first navigation is expected.

---

#### M-2. No Saved Views or Custom Filters
**Severity:** MEDIUM
**Files:** `gantt.html`, all filter bars

The blueprint spec (Section 1.3, lines 88-90) defines "Saved Views: Users can save filter combinations as named views, share with team." The Gantt filter panel mentions saved views in its design but the implementation is a static dropdown. No pages implement the ability to save, name, or share a filter combination. Power users in consulting firms rely heavily on saved views for recurring reports.

---

#### M-3. Inconsistent Notification Badge Counts
**Severity:** MEDIUM
**Files:** All sidebar navs

The sidebar shows: Timesheets (7), Expenses (2), Leaves (3), Approvals (12). These badge counts are hardcoded and identical across every page. When a user approves a timesheet from the dashboard, the badge should decrement. More importantly, 7 + 2 + 3 = 12, which matches the Approvals badge -- suggesting these are the same items counted twice.

---

#### M-4. No Role-Based View Differentiation
**Severity:** MEDIUM
**Files:** All pages

The blueprint spec (Section 3.2, lines 305-309) defines role-aware dashboard cards:
- Employee sees: My hours, My utilization, My pending, My leave balance
- PM sees: Team hours, Team utilization, Pending approvals, Active projects
- Admin sees: Company hours, Company utilization, All pending, Revenue

The prototype shows only the Admin view everywhere. There is no indication of what a regular Employee would see. For a demo to a 300-person company, the buyer will immediately ask "What does a junior consultant see?" and the current prototype cannot answer.

---

#### M-5. Empty States Need Work
**Severity:** MEDIUM
**Files:** `index.html` lines 735-744, `admin.html` lines 104-122

The empty state implementation uses `body.show-populated` / `body.show-empty` CSS toggles, which is clever for prototyping. However, the empty states themselves are generic. The dashboard empty state (line 740) says "Start tracking timesheets and expenses to see your dashboard KPIs populate with real data" -- this is correct but not every page has one. The Gantt, Projects (list/kanban views), Clients, and Planning pages need distinct empty states.

---

#### M-6. No Data Export Functionality Demonstrated
**Severity:** MEDIUM
**Files:** Multiple pages

Export buttons exist on Expenses, Team Directory, and other pages, but none demonstrate what the export would look like. For consulting firms that feed data into client billing systems, the export format (CSV columns, PDF layout, date ranges) is a critical evaluation criterion.

---

#### M-7. Timesheet Grid Missing Copy/Template Features
**Severity:** MEDIUM
**File:** `timesheets.html`

The blueprint spec (Section 8.3, lines 973-981) defines "Copy forward" and "Templates" features. The timesheet page has a "Copy" button reference in the spec wireframe but the prototype implementation does not include it. For consultants who work on the same projects weekly, copying last week's timesheet is the most-used feature.

---

#### M-8. Projects Page Missing Timeline View
**Severity:** MEDIUM
**File:** `projects.html`

The spec (Section 9.1, line 993) defines three project views: Board, List, Timeline. The prototype implements Board (Kanban) and List but not Timeline. The Timeline view would show projects on a horizontal timeline similar to a Gantt chart -- essential for PMs managing project portfolios.

---

#### M-9. Invoice Generation Flow is Underspecified
**Severity:** MEDIUM
**File:** `invoices.html`

The invoice detail view exists and is well-designed with status timeline, line items, and totals. However, the "Generate Invoice" flow (spec Section 11.2, lines 1157-1170) -- which auto-calculates from timesheet hours, rates, and approved expenses -- is not demonstrated. This is the highest-value workflow for consulting firms (turning time into money) and needs a full modal walkthrough.

---

#### M-10. No Multi-Currency Support Visible
**Severity:** MEDIUM
**Files:** All financial displays

Every financial figure in the prototype is in EUR (euro). For consulting firms with international clients, multi-currency is a day-one requirement. No currency selector appears on invoices, expenses, or project billing settings.

---

## What a Competitor Would Do Better

### BambooHR Would Beat GammaHR On:
1. **Complete HR lifecycle** -- BambooHR has recruitment (ATS), onboarding workflows with task checklists, performance management with goal tracking, and offboarding. GammaHR has none of these.
2. **Self-service employee portal** -- BambooHR lets employees update their own addresses, emergency contacts, bank details, and view pay stubs. GammaHR's employee profile is admin-controlled.
3. **Compliance and document management** -- BambooHR tracks I-9 forms, visa expiration dates, required certifications with automated reminders. GammaHR's document tab is a flat file list with no metadata or expiration tracking.

### Personio Would Beat GammaHR On:
1. **Payroll integration** -- Personio connects to payroll providers and can calculate pay based on timesheet hours, leave deductions, and expense reimbursements. GammaHR stops at invoicing.
2. **Absence management depth** -- Personio handles accrual rules, carry-over policies, country-specific leave laws (e.g., French RTT, German Elternzeit). GammaHR's leave system is a flat balance tracker.
3. **Approval workflow engine** -- Personio lets admins design custom approval chains (e.g., expenses > 500 require VP + Finance approval). GammaHR's approvals are a flat list with no configurable routing.

### Harvest/Toggl Would Beat GammaHR On:
1. **Timer-based time tracking** -- Harvest has a running timer that employees start/stop throughout the day. GammaHR only has manual grid entry.
2. **Integrations** -- Harvest integrates with Jira, Asana, Slack, QuickBooks, Xero. GammaHR shows zero integrations.
3. **Rounding rules and billing rates** -- Harvest has sophisticated rounding (round to nearest 15min), multiple billing rates per employee per project, and rate change effective dates. GammaHR shows a single rate per employee.

### Where GammaHR Could Win:
- The **Gantt chart** and **resource planning** combination is genuinely better than anything BambooHR, Personio, Harvest, or Toggl offers
- The **client portal** is a differentiator -- none of those competitors have it
- The **AI insights** concept (if made real) would be unique in the market
- The **dark-mode-first premium design** is visually superior to every competitor listed

---

## Missing Features That Would Lose Deals

### Tier 1 -- "We can't buy this without it" (Blocks 80%+ of deals)
| Feature | Why It Blocks | Priority |
|---------|--------------|----------|
| **Onboarding workflows** | "How do we onboard a new hire?" is asked in every demo | P0 |
| **Employee records (compensation, contracts)** | Legal/compliance requirement for any company | P0 |
| **Org chart** | Every company with 50+ employees needs to see reporting structure | P0 |
| **Timer-based time tracking** | Consultants will not switch from Harvest without a timer | P0 |
| **Integrations page** | "Does it connect to our accounting software?" kills deals when the answer is no | P0 |

### Tier 2 -- "We'll need this within 6 months" (Blocks 40% of deals)
| Feature | Why It's Expected |
|---------|-----------------|
| **Performance reviews / 1:1s** | Growing consulting firms need structured feedback |
| **Custom approval routing** | Finance teams need multi-tier expense approvals |
| **Multi-currency** | Any firm with international clients |
| **Calendar view** | Already in spec, just not built |
| **Payroll export/integration** | HR teams need end-to-end flow |
| **Recruitment pipeline (basic ATS)** | Growing firms hire 5-15 people/year |

### Tier 3 -- "Nice to have for shortlist" (Differentiator, not blocker)
| Feature | Why It Helps |
|---------|-------------|
| **Slack/Teams integration** | Approval notifications in chat |
| **Mobile app (native)** | Expense receipt capture on the go |
| **SSO (SAML/OIDC)** | Enterprise security requirement |
| **Compensation benchmarking** | VP HR will ask for this |
| **Custom reporting / report builder** | Finance teams want their own reports |

---

## Dead Ends in User Journeys

| Dead End | Location | Impact |
|----------|----------|--------|
| Employee links all go to `employees.html` without anchoring to the specific person | `index.html` dashboard, activity feed, presence panel | User clicks "Sarah Chen" and lands on the directory, not Sarah's profile |
| "Investigate" button on AI alerts has no destination | `index.html` lines 889, 903, 915 | User clicks and nothing happens |
| Project links in employee cards go to `projects.html` without project anchoring | `employees.html` employee card project badges | User clicks "Acme Web Redesign" and sees the full project list, not that project |
| "Quick Log Time" on dashboard goes to `timesheets.html` not a quick-entry modal | `index.html` line 539 | New user expects inline time entry, gets full timesheet page |
| Client portal "Documents" tab is static | `portal/index.html` | No upload flow; client cannot share documents back |
| Admin "Audit Log" has no drill-down | `admin.html` | User sees "Sarah Chen changed leave balance" but cannot click to see what changed |
| No "back to list" after viewing a client/project detail | `clients.html`, `projects.html` | Browser back button works but there is no visible breadcrumb trail on all detail views |
| Notification items are not clickable/linked | `index.html` notification panel lines 463-498 | Notification says "Timesheet reminder" but clicking it does nothing |

---

## New Findings (Not in Founder's Known Issues)

### N-1. No Breadcrumb Navigation Anywhere
**Severity:** HIGH
The app uses back buttons (`<- Back to Team`, `<- Clients`) on detail pages but has no breadcrumb trail. For a multi-level hierarchy (Dashboard > Projects > Acme Web Redesign > Team > Sarah Chen), users lose context quickly. Every modern SaaS app uses breadcrumbs.

### N-2. Date on Dashboard is Hardcoded Wrong
**Severity:** LOW
**File:** `index.html` line 532
The greeting shows "Monday, April 6, 2026" but today is April 5, 2026 (a Sunday). This is a prototype nit, but if shown to investors/buyers, it signals lack of attention to detail.

### N-3. No Bulk Actions on Any Table
**Severity:** MEDIUM
The approval cards in `approvals.html` have individual checkboxes but no "Select All" / "Bulk Approve" toolbar. At 50+ pending items (common in a 300-person company at month-end), approving one-by-one is unusable.

### N-4. No Notification Preferences or Settings
**Severity:** MEDIUM
The notification panel exists across all pages but there is no way to configure which notifications you receive, how (email vs. in-app vs. push), or to snooze/mute specific types. The admin page has Company Settings, Leave Settings, Holidays, Users, and Audit Log -- but no Notification Settings.

### N-5. Portal Has No Timesheet Approval Flow
**Severity:** HIGH
**File:** `portal/index.html`
The blueprint spec (Section 10.3, line 1130) states the client portal should let clients "Approve/flag timesheet entries." The portal's Timesheets tab shows hours logged but no approval buttons, no flagging mechanism, and no way for the client to dispute hours. This is a core consulting workflow -- clients must be able to verify hours before invoicing.

### N-6. No Dark/Light Mode Toggle Visible
**Severity:** MEDIUM
The design system spec defines both dark and light mode with full token sets. The CSS in `_tokens.css` includes `[data-theme="light"]` overrides. But no toggle button exists in the UI. Given the spec says "Dark Mode is Home, Light mode is the variant," this is fine for v1 -- but enterprise buyers often need light mode for presentations and screen sharing.

### N-7. Planning and Gantt Pages Duplicate Effort
**Severity:** MEDIUM
**Files:** `planning.html`, `gantt.html`
The Planning page shows: Capacity Overview (3 months), Bench Forecast, Skills Gap Matrix, and Scenario Planning. The Gantt page shows the resource timeline with the same employee data. These serve the same user (Resource Manager) at the same decision point ("who is available for the next project?"). Having two separate pages forces users to context-switch.

### N-8. No Activity Feed Pagination or "Load More"
**Severity:** LOW
**File:** `index.html` lines 996-1059
The Recent Activity section shows 5 items with no "Load More" or infinite scroll. For an actively used system, this would show only the last hour of activity.

### N-9. Invoice PDF Generation Not Demonstrated
**Severity:** MEDIUM
**File:** `invoices.html`
The spec mentions "Generate -> PDF created (Typst)" but the invoice detail page has no PDF preview or download button. For consulting firms, the invoice PDF format (logo placement, line item detail, payment terms layout) is heavily scrutinized. A PDF preview would significantly strengthen the demo.

### N-10. No Way to Create Anything from the Command Palette
**Severity:** LOW
**Files:** All pages, search bar
The `Cmd+K` search bar hint exists but there is no command palette implemented. For a tool inspired by Linear and Notion (per the design spec, line 28), the command palette is not optional -- it is a core interaction pattern that power users expect.

---

## Scoring Summary

| Category | Score (1-10) | Notes |
|----------|-------------|-------|
| Visual Design | 9/10 | Premium, distinctive, dark-mode-first. Best-in-class for the segment. |
| Information Architecture | 5/10 | Too many top-level items, redundant pages, missing HR section |
| Feature Completeness (HR) | 1/10 | Effectively zero HR features |
| Feature Completeness (Ops) | 7/10 | Strong time/expense/invoice. Missing timer, templates, integrations |
| User Journey Quality | 5/10 | Many dead ends, no deep linking, generic navigation |
| AI Value Proposition | 3/10 | Decorative alerts, not genuinely predictive or actionable |
| Scalability (200+ employees) | 4/10 | Directory and approval flows will break at scale |
| Client Portal | 6/10 | Good foundation, missing messages and timesheet approval |
| Mobile Readiness | 7/10 | Bottom nav, table-to-card, touch targets all present |
| Competitive Readiness | 4/10 | Would not survive a head-to-head against Personio for any deal requiring HR |

**Overall: 5.1/10 -- Strong prototype with a fatal positioning gap. Fix the HR module absence and the product becomes 7+/10.**

---

*End of audit. All findings reference specific files and line numbers in the prototype codebase.*
