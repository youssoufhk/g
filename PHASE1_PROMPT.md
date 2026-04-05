# GammaHR v2 — Phase 1: Full Interactive HTML Prototype Sprint

You are the lead orchestrator for building a complete interactive HTML prototype
of GammaHR v2 ("Quantum") — a premium dark-mode HR operations platform.

**CRITICAL RULE: No backend code. No Rust. No database. No API. Nothing beyond
HTML, CSS, and vanilla JavaScript. The entire purpose of this sprint is to produce
a clickable prototype that covers every page, every state, every interaction —
so the human can validate the full product before a single line of backend code
is written. Backend is dead last, after prototype is fully approved.**

---

## Step 1 — Read All Existing Specs (do this before anything else)

Read all four files completely:
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/MASTER_PLAN.md
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/specs/APP_BLUEPRINT.md
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/specs/DESIGN_SYSTEM.md
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/specs/DATA_ARCHITECTURE.md

APP_BLUEPRINT.md is your primary reference — every page, every tab, every
interaction is defined there. DESIGN_SYSTEM.md has all component specs.
Do not invent features not in these specs. Do not omit features that are in them.

---

## Step 2 — Locked Design Tokens (use exactly these values)

The palette is final. Do not propose alternatives.

```css
:root {
  /* Backgrounds */
  --color-bg:             hsl(35, 16%, 5%);
  --color-surface-0:      hsl(35, 13%, 8%);
  --color-surface-1:      hsl(35, 11%, 11%);
  --color-surface-2:      hsl(35, 9%, 15%);
  --color-surface-3:      hsl(35, 7%, 19%);

  /* Primary — Soft Sage */
  --color-primary:        hsl(155, 26%, 46%);
  --color-primary-hover:  hsl(155, 26%, 52%);
  --color-primary-active: hsl(155, 26%, 40%);
  --color-primary-muted:  hsla(155, 26%, 46%, 0.14);

  /* Accent — Terracotta */
  --color-accent:         hsl(30, 58%, 50%);
  --color-accent-hover:   hsl(30, 58%, 56%);
  --color-accent-muted:   hsla(30, 58%, 50%, 0.14);

  /* Semantic */
  --color-success:        hsl(152, 22%, 44%);
  --color-warning:        hsl(38, 65%, 50%);
  --color-error:          hsl(5, 65%, 52%);
  --color-info:           hsl(200, 40%, 52%);

  /* Financial */
  --color-gold:           hsl(38, 60%, 48%);

  /* Text */
  --color-text-1:         hsl(40, 28%, 90%);
  --color-text-2:         hsl(35, 10%, 55%);
  --color-text-3:         hsl(35, 8%, 38%);
  --color-text-inv:       hsl(35, 16%, 5%);

  /* Borders */
  --color-border:         hsl(35, 10%, 14%);
  --color-border-subtle:  hsl(35, 8%, 10%);
  --color-border-strong:  hsl(35, 12%, 22%);

  /* Typography */
  --font-sans:  'Inter Variable', 'Inter', -apple-system, sans-serif;
  --font-mono:  'JetBrains Mono Variable', 'JetBrains Mono', monospace;

  /* Spacing base: 4px */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 12px;
  --radius-xl: 16px; --radius-full: 9999px;

  /* Shadows */
  --shadow-1: 0 1px 2px rgba(0,0,0,.3), 0 1px 3px rgba(0,0,0,.15);
  --shadow-2: 0 2px 4px rgba(0,0,0,.3), 0 4px 8px rgba(0,0,0,.2);
  --shadow-3: 0 4px 8px rgba(0,0,0,.3), 0 8px 16px rgba(0,0,0,.2);
  --shadow-4: 0 8px 16px rgba(0,0,0,.3), 0 16px 32px rgba(0,0,0,.25);

  /* Glassmorphism */
  --glass-bg:     rgba(23, 21, 18, 0.75);
  --glass-border: rgba(255, 248, 235, 0.06);
}
```

---

## Step 3 — Prototype Architecture

Create this exact file structure:

```
gammahr_v2/prototype/
  _tokens.css        ← CSS custom properties (the block above, fully expanded)
  _components.css    ← All reusable component styles (buttons, inputs, cards,
                        badges, tables, modals, toasts, avatars, tabs, etc.)
  _layout.css        ← Sidebar (224px expanded / 56px collapsed), top header,
                        main content area, responsive breakpoints
  index.html         ← Dashboard (Command Center)
  auth.html          ← Login, forgot password, 2FA setup
  employees.html     ← Employee directory + individual profile (all tabs)
  gantt.html         ← Resource Gantt with all filters
  leaves.html        ← Leave list, submit form, approval queue
  expenses.html      ← Expense list, submit form, OCR upload flow, approval
  timesheets.html    ← Timesheet week grid, submit, approval
  projects.html      ← Project list + project detail page
  clients.html       ← Client list + client detail page
  invoices.html      ← Invoice list + invoice builder
  approvals.html     ← Unified approvals hub (all pending items)
  insights.html      ← AI insights, analytics charts, anomaly alerts
  planning.html      ← Resource planning & forecasting views
  admin.html         ← Admin configuration, company settings, user roles
  portal/
    index.html       ← Client portal (separate auth shell, different branding)
```

Every HTML file must:
1. Load `../_tokens.css`, `../_components.css`, `../_layout.css` (or `_tokens.css`
   etc. for files in portal/)
2. Have the full sidebar with all nav items linking to the correct .html files
3. Have a top header bar with search, notifications bell, user avatar dropdown
4. Use realistic fake data (real names, real numbers, real dates — not "Lorem ipsum")
5. Show at least 2 states: populated state AND empty state (toggle via JS button)
6. Have working tabs (click tab → content switches)
7. Have working modals (click "Add" or row → modal opens with form)
8. Have working dropdowns, filters, and sort controls (open/close and look correct)
9. Every employee name anywhere is clickable and goes to employees.html
10. Every project name links to projects.html, every client name to clients.html

---

## Step 4 — Deliverable Quality Bar (non-negotiable)

Each page must match the quality level of the best SaaS dashboards (Linear,
Vercel, Stripe). Specifically:

**Layout & Density:**
- Information-dense — no empty space, no padding waste
- Sidebar nav has icons + labels, active state uses --color-primary background
- Tables have sortable column headers, row hover, checkbox selection
- Stats/KPI cards show number + trend sparkline + delta vs last period
- Every table has a toolbar: search input, filter button, sort button, export button

**Typography:**
- Page titles: 24px/600 weight in --color-text-1
- Section headers: 16px/600 in --color-text-1
- Body/table text: 14px/400 in --color-text-1
- Secondary text: 14px/400 in --color-text-2
- Timestamps, labels: 12px/500 in --color-text-2
- All financial numbers: var(--font-mono)

**Status indicators:**
- Always icon + color + text label (never color alone)
- Approved/Active: soft sage badge
- Pending: aged gold badge
- Rejected/Overdue: brick red badge

**Interactions (vanilla JS, no frameworks):**
- Sidebar collapse toggle (icon-only ↔ full labels)
- Tab switching (URL hash-based so back button works)
- Modal open/close (click outside or X to close)
- Dropdown menus (click to open, click outside to close)
- Toast notification demo (button triggers a sample toast)
- Command palette (Cmd+K or click search → overlay with fake results)

---

## Step 5 — Page-Specific Requirements

### index.html — Dashboard
- Greeting: "Good morning, [Name]" with current date
- 6 KPI stat cards: Active Employees, Hours This Week, Pending Approvals,
  Billable Hours %, Open Projects, Expenses This Month — each with sparkline SVG
- Team availability table: name (clickable), role, current project, utilization %, status
- Live presence panel (right sidebar): who's online now with green dot
- AI alerts widget: 3 anomaly cards (unusual expense, timesheet gap, resource conflict)
- Mini Gantt preview (this week only)
- Billable vs Internal hours donut chart
- Pending approvals widget (leaves + expenses + timesheets, latest 5 each)
- Revenue trend chart (last 6 months, aged gold line)

### employees.html
Two views in one file, toggle via URL hash:
- #directory — grid/table of all employees, search, filter by dept/status/role,
  both grid card view and table view (toggle button)
- #profile — individual profile page, shown when clicking any employee name

Profile page must have all 7 tabs:
- Overview: photo, contact info, contract type, salary band, manager, direct reports
- Timeline: chronological work history (join date, current projects, past projects,
  leaves taken, timesheets approved, expenses submitted, skill additions)
- Projects: table of all projects assigned past + current, role and hours
- Leaves: leave balances by type + full history table
- Timesheets: submitted timesheet history with approval status
- Expenses: expense history with amounts and approval status
- Documents: uploaded documents list (contracts, ID, certificates)

### gantt.html
- Full-width Gantt, rows = employees, columns = weeks
- Bars show project assignments, colored by project
- Filter panel (left side, collapsible): department, client, project, billing status,
  employee status, utilization range, skills, role, availability
- Quick filter chips above chart: Unbilled, On Leave, Bench, Over-allocated,
  Available Next Week, Ending Soon
- Zoom: Day / Week / Month / Quarter view switcher
- Utilization color coding: sage (75-100%), gold (50-75%), red (<50% or >110%)
- Click bar → slide-over panel showing assignment detail
- Drag handles on bars (visual only)

### expenses.html
Three sub-views (tabs):
- My Expenses: list of own submitted expenses with status badges
- Submit Expense: form with receipt upload drop zone, "Scan with AI" button that
  triggers a loading spinner then auto-populates amount/vendor/date fields with
  fake OCR result, category selector, project/client selector, notes field
- Approval Queue: manager view — list of pending expense approvals with
  receipt image preview, approve/reject buttons, comment field

### timesheets.html
- Week grid: rows = projects, columns = Mon–Sun
- Each cell is an editable time entry (click → inline number input)
- Row totals (right column), day totals (bottom row), grand total cell
- "+ Add project row" button to add a new project to the week
- Submit for approval button (shows warning if under 40h)
- Status bar at top: "Week of Apr 6 — 32.5h logged, 7.5h remaining to reach 40h"
- Tab: Previous weeks (read-only, shows approval status per week)

### insights.html
- AI insight cards in 3 categories: Anomalies, Trends, Recommendations
- Each card: title, plain-language explanation, affected employee/project link,
  severity badge (High/Medium/Low), Dismiss + Investigate action buttons
- Charts: utilization over time (line), expense categories (donut),
  project profitability table, headcount trend (bar)
- NL query bar at top: "Ask anything about your team..." with sample chips:
  "Who has capacity next week?", "Show me unbilled hours in March",
  "Which projects are running over budget?"

### portal/index.html
- Completely different shell: client-facing, lighter and cleaner feel, same palette
- Client sees: their active projects, team members assigned (no salaries/internal data),
  invoices with payment status, approved timesheets as proof of work,
  milestone tracker, shared documents
- Separate login page at portal/auth.html
- Top bar shows client logo + "Powered by GammaHR" in small text

---

## Step 6 — Execution Plan

Use the TodoWrite tool to track every file. Execute in this order:

**Batch 1 — Foundation (sequential, all pages depend on these):**
1. `_tokens.css` — expand the CSS vars into a complete file with comments
2. `_components.css` — full component library: buttons (all 6 variants × 6 sizes),
   inputs (text, select, textarea, date, file upload), cards (all variants),
   badges (all semantic variants), data tables (with toolbar), modals (all sizes),
   toast notifications, avatar (all sizes + group stack), tabs, dropdowns,
   command palette shell, sidebar nav, stat cards with sparkline area
3. `_layout.css` — sidebar + header + content shell + responsive rules

**Batch 2 — Core pages (spawn 3 parallel agents after Batch 1 is done):**
- Agent A: `index.html` (Dashboard)
- Agent B: `employees.html` (Directory + Profile)
- Agent C: `gantt.html` (Resource Gantt)

**Batch 3 — Workflow pages (spawn 4 parallel agents):**
- Agent A: `expenses.html`
- Agent B: `timesheets.html`
- Agent C: `leaves.html`
- Agent D: `projects.html`

**Batch 4 — Supporting pages (spawn 3 parallel agents):**
- Agent A: `clients.html` + `invoices.html`
- Agent B: `approvals.html` + `admin.html`
- Agent C: `insights.html` + `planning.html`

**Batch 5 — Final pages (sequential or parallel):**
- `auth.html`
- `portal/index.html` + `portal/auth.html`

---

## Step 7 — Final Validation Checklist

Before declaring Phase 1 complete, verify every file passes:

- [ ] Opens in browser without console errors
- [ ] Sidebar links work between all pages
- [ ] All tabs switch correctly
- [ ] At least one modal opens and closes on each page
- [ ] No Lorem ipsum anywhere — all data is realistic
- [ ] Employee names are clickable and navigate to employees.html
- [ ] Every page looks premium at 1440px viewport width
- [ ] Empty state is reachable (toggle button or shown when no data)
- [ ] Command palette opens with Cmd+K on every page
- [ ] Colors match the locked tokens exactly — no hardcoded hex or rgb values
- [ ] All financial numbers use var(--font-mono)
- [ ] Status badges always have icon + text, not just color

---

## Final Reminder

**Backend is dead last.**

No Rust files. No database migrations. No API endpoint implementations. No Docker
or infrastructure config. Nothing. The human must open every HTML file in a browser,
click through every page and flow, and explicitly approve the complete prototype
before Phase 2 (backend) begins.

Any work outside of `gammahr_v2/prototype/` is out of scope for this session.

Begin with Step 1 — read all four spec files completely, then proceed to Batch 1.
