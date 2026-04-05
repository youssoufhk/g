# GammaHR v2 Prototype -- UX Review #2

**Reviewer:** Fresh UX auditor (no prior exposure to this prototype)
**Date:** 2026-04-05
**Scope:** All 13 prototype HTML files reviewed against APP_BLUEPRINT.md and DESIGN_SYSTEM.md
**Method:** Code-level inspection of every page's structure, CSS, interactivity, linking, and data coherence

---

## Executive Summary

The prototype is impressively thorough for a static HTML/CSS/JS mockup. It covers 13 pages spanning the full application, uses a well-implemented design token system, and achieves the premium dark-mode aesthetic described in the spec. The navigation is consistent, the information density is high, and the overall impression is that of a serious, polished tool.

However, several systemic issues diminish the prototype's value as a faithful representation of the final product. The most critical: **entity links are largely fake** (most employee/project/client links point to generic list pages, not to specific profile or detail views), the **date shown on the dashboard is wrong** relative to the stated current date, and **some pages have inconsistent data** that undermines the data storytelling.

**Overall Grade: 7.2 / 10**

---

## Global Issues (Apply to Multiple Pages)

### CRITICAL: Universal Clickable Identity is Broken

The blueprint (Section 1.1-1.2) mandates that **every employee name, project name, and client name is a clickable link to its specific detail page**. In practice:

- **Employee links throughout dashboard, Gantt mini-chart, presence panel, activity feed, AI alerts** all point to `employees.html` (the directory list page), not to a specific employee profile. The spec requires navigation to the individual employee's profile page.
- **Project links** in the dashboard table, employee cards, and various pages all point to `projects.html` (the list page), not to a specific project detail view.
- **Client links** similarly point to `clients.html` rather than a specific client detail.
- This violates the core "Universal Entity Linking" principle from Section 1.2.

**Impact:** Clicking "Sarah Chen" anywhere in the app lands on the same generic directory page. A user trying to quickly check someone's profile from an approval card or activity feed gets lost.

### HIGH: Inconsistent Data Storytelling Across Pages

- Dashboard greeting says "Monday, April 6, 2026" but today is 2026-04-05 (Sunday). If the intent is that today is Monday Apr 6, then the date in the system reminder is off. Either way, one is wrong.
- Dashboard KPI shows "Active Employees: 48" but the team directory only lists 12 employees. The scale mismatch makes the prototype feel disconnected.
- Dashboard shows "1,842h" hours this week, but with 48 employees and 5 working days that implies ~7.7h/day average -- plausible. With 12 employees it implies 30+ hours/day each -- impossible.
- Revenue of EUR 45k/month is plausible for a 48-person consulting firm but extreme for a 12-person team at the rates shown.

### HIGH: Sidebar Badge Counts Are Static and Inconsistent

- Every single page's sidebar shows identical badge counts: Timesheets 7, Expenses 2, Leaves 3, Approvals 12. These never update, even though prototype interactions (e.g., approving items on the dashboard) should conceptually decrement them.
- The Approvals badge says 12, but the Approvals page shows 7 timesheets + 3 leaves + 2 expenses = 12. That adds up -- good. But the individual badges (7+2+3=12) also add up to 12, creating double-counting in the sidebar representation.

### MEDIUM: Mini Profile Hover Cards Are Missing

Blueprint Section 4.3 specifies that hovering on any employee name shows a mini profile card (name, role, dept, status, utilization). No page in the prototype implements this. Employee names have basic CSS hover color changes but no tooltip/popover behavior.

### MEDIUM: No Breadcrumbs Anywhere

The blueprint implies breadcrumb navigation (Section 1.1 mentions "Breadcrumbs mentioning an employee"). No page in the prototype has breadcrumbs. Detail views use "Back" buttons but lack breadcrumb trails for orientation.

### LOW: Inconsistent Email Addresses

Sarah Chen's email varies across pages: `sarah.chen@gammahr.io` (dashboard, admin), `sarah.chen@gamma.io` (employees.html), `sarah.chen@gammahr.com` (clients.html). Should be standardized.

### LOW: Command Palette Only on Dashboard

The Cmd+K command palette with full search results is only coded in `index.html`. Other pages reference `searchTrigger` and `cmdPalette` but the palette markup is inconsistent or simplified across pages. Blueprint Section 18 specifies a universal command palette.

---

## Page-by-Page Review

---

### 1. Dashboard (index.html) -- Score: 8/10

**What Works Well:**
- Information hierarchy is strong: greeting, week-at-a-glance hero, 6 KPI cards, then two-column layout with detailed widgets
- KPI cards are all clickable links to their respective detail pages -- good
- Sparkline charts on KPIs add visual context
- Revenue trend bar chart uses gold color correctly per the design system
- Pending approvals widget has tabbed interface (Timesheets/Leaves/Expenses) with inline approve/reject
- Donut chart for billable vs internal hours with interactive hover
- Empty state is implemented with meaningful CTA
- Live presence panel with status dots and current activity descriptions

**Issues:**

| Severity | Issue |
|----------|-------|
| CRITICAL | Date mismatch: "Monday, April 6, 2026" but current date is April 5 |
| HIGH | All employee links in presence panel, activity feed, AI alerts, and team table go to `employees.html` generic list, not individual profiles |
| HIGH | All project links in team availability table go to `projects.html` generic list |
| MEDIUM | Utilization color thresholds inconsistent: Sarah Chen at 95% shows red, Carol Kim at 90% shows warning (yellow), but spec says green > 75% |
| MEDIUM | Mini Gantt chart at bottom lacks project labels on bars -- only visible via the legend below. Hard to parse at a glance |
| MEDIUM | "This Week at a Glance" duplicated semantically -- hero section AND mini Gantt card both claim this title |
| LOW | Donut chart circumference math is hardcoded; tooltip behavior is JS-dependent |

---

### 2. Employees / Team Directory (employees.html) -- Score: 8.5/10

**What Works Well:**
- Dual-view with grid and list toggle, both fully populated with 12 employees
- Employee cards show avatar with status dot, name, title, department, current projects, utilization bar, and status badge
- Utilization bars use correct color coding (green/yellow/red) per thresholds
- Full employee profile view is built inline with timeline, tabs (Projects, Leaves, Timesheets, Expenses, Skills, Documents), and rich data
- Bench state clearly called out with warning badge
- Search and filter dropdowns (department, role, status) are present
- List view includes checkbox selection for bulk actions

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Employee card names use `data-employee` attribute for JS navigation but no `href` -- they are not real links. Screen readers and right-click context menus will not work |
| HIGH | Profile view appears to be toggled by JS within the same page -- URL does not change. Not bookmarkable, not shareable |
| MEDIUM | Profile view only exists for Sarah Chen. Clicking other employees likely shows the same profile or nothing |
| MEDIUM | List view "Actions" column has a "..." button but no dropdown menu is implemented |
| LOW | No Org Chart view, though the spec (Section 4.1) calls for Grid/List/Org Chart |
| LOW | Employee count "12 team members across 6 departments" is hardcoded -- doesn't match dashboard's 48 |

---

### 3. Projects (projects.html) -- Score: 8/10

**What Works Well:**
- Kanban board with three columns (Planning, Active, Completed) is well-structured
- Project cards show client name, team size, billing type, budget bar, and relevant metadata
- Client names on cards are linked (though to generic `clients.html`)
- List view alternative is implemented with sortable table
- Full project detail view with tabs (Overview, Team, Milestones, Activity, Invoices)
- Budget/timeline progress bars use semantic colors correctly
- Team members in detail view link to `employees.html`
- "New Project" modal with form fields and color picker

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Project card names are plain text, not links -- only the parent card div is clickable. No `<a>` tags on project names |
| HIGH | Client links go to `clients.html` generic page, not specific client detail |
| MEDIUM | Board view shows 2 Planning + 4 Active + 3 Completed = 9 projects, but dashboard KPI says 14 open |
| MEDIUM | No "Timeline" view option despite the spec calling for Board/List/Timeline |
| LOW | Avatar-based team members in project detail show initials but are not linked to employee profiles |

---

### 4. Clients (clients.html) -- Score: 7.5/10

**What Works Well:**
- Client list with logo placeholders, metadata (industry, projects count, contacts), and revenue figures
- Detail view for Acme Corp with tabs (Overview, Projects, Contacts, Invoices, Documents, Notes)
- Revenue chart in client detail using gold bars
- Contact cards with name, role, email
- Search and filter bar present
- Team members working on client projects shown with roles

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Only one client detail (Acme Corp) is fully built. Clicking other clients presumably shows nothing or the same detail |
| HIGH | Employee names in "Assigned Team" section link to `employees.html` generic, not profiles |
| MEDIUM | Project links in client detail go to `projects.html` generic |
| MEDIUM | "New Client" modal: form exists but several fields use basic selects where the spec implies richer input (e.g., contact management) |
| LOW | Revenue figures in client cards (EUR 180k, EUR 95k, etc.) don't correlate with dashboard revenue of EUR 45k/month |

---

### 5. Timesheets (timesheets.html) -- Score: 8.5/10

**What Works Well:**
- Weekly grid with inline-editable cells is well designed with proper column widths
- Project names in grid are clickable links (to projects.html)
- Week navigation with prev/next buttons and "Today" shortcut
- Status bar showing weekly progress (hours/target with percentage)
- Footer rows showing daily totals, targets, and met/miss status icons
- Weekend columns visually differentiated
- "Copy from last week" dropdown menu
- Approval queue tab with employee names, hours, and approve/reject
- Mobile-responsive day-switcher for small screens
- Submitted state banner with lock indication

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Employee names in approval queue link to employees.html generic, not profiles |
| MEDIUM | Project links in approval cards go to generic projects.html |
| MEDIUM | "Add Project Row" adds a select dropdown but the interaction to actually add is JS-only and may not complete the flow in the prototype |
| MEDIUM | No Month View tab content is visible, though tabs suggest it exists |
| LOW | Summary shows "Billable: 38h (95%)" and "Non-billable: 2h (5%)" -- totals 40h, consistent -- good |
| LOW | Approval queue shows 7 items matching sidebar badge -- consistent -- good |

---

### 6. Expenses (expenses.html) -- Score: 8/10

**What Works Well:**
- Three tabs: My Expenses, Team Expenses, Submit New
- KPI summary cards (Total, Pending, Approved, Rejected) with proper values
- Expense items show amount, type, project, status, billable tag, and receipt indicator
- AI receipt scanning simulation in Submit tab with upload zone, spinner, and AI-detected fields
- Policy compliance checks (daily limit, receipt required)
- Rejection reasons displayed with red text
- Filter bar with status, type, project, billable toggle

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Employee links in Team Expenses tab go to generic employees.html |
| MEDIUM | Project links in expense items go to generic projects.html |
| MEDIUM | "Analytics" tab mentioned in spec (Section 7.1) but not present in the prototype |
| LOW | AI scan result shows "Marriott Hotel Lyon" and EUR 340 -- consistent with dashboard AI alert about Bob Taylor -- good data coherence |

---

### 7. Leaves (leaves.html) -- Score: 8/10

**What Works Well:**
- Leave balance cards with colored top borders, remaining/used/pending breakdown, and progress bars
- Three tabs: My Leaves, Team Leaves, Calendar
- Leave request cards with date range, type icon, days count, status, and notes
- Heatmap calendar showing leave days across months with color coding
- Team leaves table with conflict warnings
- Request Leave modal with date pickers, type select, day calculation, and balance preview
- Bulk approve/reject in Team Leaves tab

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Employee names in Team Leaves go to generic employees.html |
| MEDIUM | Calendar tab likely shows a basic month grid but lacks the ability to click days to request leave as spec requires |
| MEDIUM | Conflict detection mentioned in spec ("warns if too many people from same project/department are off") -- only a basic "conflict warning" badge is shown, not project-aware |
| LOW | Balance cards use four leave types (Annual, Sick, Personal, WFH) which adds WFH beyond the typical spec examples -- nice addition |

---

### 8. Approvals (approvals.html) -- Score: 8.5/10

**What Works Well:**
- Unified approval hub with tabs: All (12), Timesheets (7), Leaves (3), Expenses (2)
- Urgent items highlighted with red left border and "Urgent" section label
- Each approval card shows employee avatar, name, details, context info, and approve/reject buttons
- Bulk selection with checkboxes and floating bulk action bar at bottom
- Warning tags on items (e.g., "Overdue 3 days", "3 others off")
- Submitted timestamps for urgency context
- Empty state implemented

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Employee name links go to generic employees.html -- violates Universal Clickable Identity |
| MEDIUM | No detail expansion or slide-out panel. Spec Section 13 implies clicking an approval item shows full context (project impact, historical patterns). Only approve/reject is available |
| MEDIUM | "Overdue" items exist but there's no way to see how they became overdue or what the SLA policy is |
| LOW | Filter bar has selects but no active filter chip display |

---

### 9. Invoices (invoices.html) -- Score: 8/10

**What Works Well:**
- KPI cards for financial overview (Total Invoiced, Outstanding, Paid, Overdue) with gold color for revenue
- Invoice table with number, client, project, amount, status badges, dates
- Full invoice detail view with status timeline (Generated, Sent, Viewed, Paid)
- Line items table with employee, hours, rate, amount, project reference
- Totals section with subtotal, tax, grand total in gold
- "Generate Invoice" modal with client/project/period selection and live preview
- Payment recording via "Record Payment" modal
- Export and send actions

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Client names in invoice list/detail link to generic clients.html |
| HIGH | Employee names in line items are not linked at all -- they are plain text |
| MEDIUM | Only one invoice detail (INV-2026-0042) is fully built |
| MEDIUM | "Overdue" invoice (INV-2026-0038) shows amount EUR 8,400 but no late fee or penalty indicator as might be expected |
| LOW | Status timeline step rendering is CSS-only, works well visually |

---

### 10. Gantt Chart (gantt.html) -- Score: 9/10

**What Works Well:**
- The most complex and impressive page in the prototype
- Full filter panel with department, client, project, billing, status, skills, utilization dropdowns
- Quick filter chips (Unbilled, On Leave, Bench, Over-allocated, Available Next Week, Ending Soon)
- Active filter tags with remove buttons
- Saved Views dropdown
- Zoom controls (1W, 2W, 1M, 3M, 6M, 1Y) with navigation arrows and Today button
- Dual-pane layout: sticky left panel with employee info, scrollable right timeline
- Gantt bars with proper color differentiation (billable, non-billable, leave, bench)
- Today line marker with dot indicator
- Weekend columns visually differentiated
- Utilization badges per employee (high/mid/low/over)
- Tooltip on bar hover with project details
- Legend bar and summary statistics
- Employee names are clickable links to employees.html with hover color change

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Employee links still go to generic employees.html, not individual profiles |
| MEDIUM | Drag-to-resize and drag-to-move on bars is spec'd (Section 5.4) but not possible in static prototype -- acceptable for prototype stage |
| MEDIUM | Right-click context menu on bars (spec'd: Edit, Remove, View Project, View Employee) is not implemented |
| LOW | Stacked bars for multi-project employees (bar-row-2 class) may overlap at certain zoom levels |
| LOW | No "Summary Bar" stat like "Showing 48/52 team members" is visible -- spec calls for it |

---

### 11. AI Insights (insights.html) -- Score: 8.5/10

**What Works Well:**
- Natural language query bar at the top with AI spark icon and suggested query chips
- AI response card with slide-in animation and action buttons
- Insight cards categorized by tabs: Anomalies (3), Trends (2), Recommendations (3)
- Each insight has severity icon, title with badge, description, affected entity, timestamp, and action buttons
- Dismiss functionality with removing animation
- Charts section: Revenue trend (line chart with SVG), utilization heatmap (per-employee bars), expense donut chart, billable hours stacked bar
- Employee utilization table with bars

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Employee links in insight cards go to generic employees.html |
| MEDIUM | Project links in recommendations go to generic projects.html |
| MEDIUM | Charts are static SVGs with limited interactivity in prototype form. The tooltip mechanism exists but data points are hardcoded |
| LOW | "Show Data" and "Export" buttons in AI response card are non-functional |
| LOW | Natural language query is simulated -- only pre-defined responses work |

---

### 12. Resource Planning (planning.html) -- Score: 7.5/10

**What Works Well:**
- Three-month capacity forecast cards (April, May, June) showing demand vs supply and gap
- Bench forecast with employee names, skills, and days on bench
- AI recommendations for bench employees (e.g., "Assign Bob Taylor to Initech API" with confidence score)
- Skills gap matrix with demand vs supply columns
- What-If scenario planner with form inputs and calculated impact
- Hiring pipeline section with open positions and stage badges
- Capacity trend chart

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | Employee names in bench forecast link to generic employees.html |
| MEDIUM | What-If scenario results are shown via JS toggle but the calculations are hardcoded -- understandable for prototype |
| MEDIUM | Skills matrix shows "Frontend: 4 needed, 3 available, -1 gap" but no link to see which employees have which skills |
| MEDIUM | Hiring pipeline items are not linked to any ATS or detail view |
| LOW | Tab structure for Capacity/Bench/Skills/Scenarios is well organized |

---

### 13. Admin / Configuration (admin.html) -- Score: 8/10

**What Works Well:**
- Seven tabs covering all admin areas: Company Settings, Users, Departments, Leave Types, Expense Types, Holidays, Audit Log
- Company Settings form with proper field grouping (General, Regional, Work Rules, Approval Chain)
- Users table with role badges, status, last login, edit/deactivate actions
- Department management with employee counts and managers
- Leave type configuration with color dots, allocation days, carryover rules
- Expense type management with limits and receipt requirements
- Holiday calendar with year navigation and country selection
- Audit log with user, action type, timestamp, and changes preview
- Toast notification on save

**Issues:**

| Severity | Issue |
|----------|-------|
| HIGH | User names in admin tables link to generic employees.html, not to a user management detail |
| MEDIUM | No confirmation dialog for destructive actions (Deactivate user, Delete department) |
| MEDIUM | Audit log "changes" column shows truncated preview but no way to expand and see full diff |
| MEDIUM | No integration settings tab (the spec mentions SSO, webhooks, API keys) |
| LOW | "Invite User" modal exists but the invite flow (role assignment, department assignment, welcome email) is minimal |
| LOW | Sophie Dubois listed as Engineering department in Users table but shown as Operations on employees page |

---

## Cross-Cutting Design System Compliance

### Color System

The Earth & Sage palette is well-implemented. All pages use CSS custom properties from `_tokens.css`. Spot checks confirm:
- Primary sage green on buttons, active nav, links -- correct
- Terracotta accent on secondary CTAs and highlights -- correct
- Gold on financial figures (revenue, invoice totals) -- correct
- Semantic colors (success/warning/error) used appropriately on badges
- Background surfaces follow the elevation hierarchy (bg, surface-0, surface-1, surface-2, surface-3)

**One concern:** The Gantt chart uses some hardcoded HSL values (e.g., `hsla(155, 26%, 46%, 0.3)`) instead of CSS variables. These should reference tokens for maintainability.

### Typography

Inter and JetBrains Mono are correctly applied. Financial values, hours, and percentages use monospace. Headings use semibold/bold weights. Caption text uses the overline token for section labels.

### Spacing and Elevation

The 4px base unit system is consistently applied. Cards use shadow-1, hover states use shadow-3, modals use shadow-4. The glassmorphism on the header toolbar is not implemented (it uses a solid background instead of the backdrop-filter spec).

---

## Summary Scorecard

| Page | Score | Top Issue |
|------|-------|-----------|
| Dashboard | 8.0 | Date mismatch, all entity links are generic |
| Employees | 8.5 | No real href on names, profile not bookmarkable |
| Projects | 8.0 | Project names not linked, missing Timeline view |
| Clients | 7.5 | Only one detail view built, generic entity links |
| Timesheets | 8.5 | Approval queue links generic, no Month View |
| Expenses | 8.0 | Generic links, missing Analytics tab |
| Leaves | 8.0 | Generic links, calendar click-to-request missing |
| Approvals | 8.5 | No detail expansion, generic employee links |
| Invoices | 8.0 | Line item employees not linked, only one detail |
| Gantt | 9.0 | Best page in prototype; employee links still generic |
| Insights | 8.5 | Generic entity links, charts are static |
| Planning | 7.5 | Generic links, skill matrix not interactive |
| Admin | 8.0 | No confirmation dialogs, missing integration tab |

**Overall Prototype Score: 7.2 / 10**

---

## Prioritized Fix List

### Must Fix (CRITICAL / HIGH)

1. **Entity linking everywhere:** Every employee, project, and client name must be a real `<a href>` to a specific detail view (e.g., `employees.html#sarah-chen` or `employees.html?id=sarah-chen`), not to the generic list page. This is the single most impactful fix for prototype credibility.

2. **Dashboard date:** Fix "Monday, April 6, 2026" to match the actual intended date.

3. **Data coherence:** Either scale the employee directory to ~48 to match dashboard KPIs, or scale dashboard KPIs down to match 12 employees. Numbers must tell a believable story.

4. **Invoice line item employee names:** Add links to these -- currently plain text, violating Universal Clickable Identity.

5. **Employee card names need real `<a>` tags:** Currently use `data-employee` attribute with JS navigation. Should be proper links for accessibility, right-click, and middle-click.

### Should Fix (MEDIUM)

6. Add mini profile hover cards on employee name hover (at least a CSS-only tooltip with name, role, department)
7. Add breadcrumbs to all detail views
8. Implement Month View tab content on Timesheets page
9. Add Analytics tab to Expenses page
10. Add detail expansion or slide-out panel for Approval items
11. Add confirmation dialogs for destructive admin actions
12. Standardize email domain across all pages
13. Build at least 2-3 client detail views and 2-3 project detail views so navigation feels real
14. Add header glassmorphism (backdrop-filter) per design system spec

### Nice to Fix (LOW)

15. Add Org Chart view to Employee directory
16. Add Timeline view to Projects
17. Add command palette markup to all pages (not just dashboard)
18. Add "Summary Bar" to Gantt footer showing filtered employee count
19. Use CSS custom properties instead of hardcoded HSL in Gantt bars

---

*End of review.*
