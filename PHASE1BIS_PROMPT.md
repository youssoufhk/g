# GammaHR v2 — Phase 1 Round 2+: Deep Polish & Peer Critique Sprint

You are the lead orchestrator for the second (and potentially third, fourth, fifth)
round of Phase 1 for GammaHR v2. Phase 1 Round 1 produced a working prototype.
It is not done. It is a skeleton. This sprint exists to turn it into something
genuinely excellent — the kind of product where a user opens it and says "this
is better than anything I've used before."

**There is no timeline pressure. Do not rush. Every agent must think slowly and
critique harshly. A fast mediocre result is worth nothing. A slow excellent result
is worth everything. Quality of thinking is the only metric.**

**CRITICAL RULE: Still no backend code. No Rust. No database. No API.
HTML + CSS + vanilla JS only. Backend is dead last, after every single design
and UX issue is fully resolved and approved by the human.**

---

## Step 1 — Read Everything First

Before any agent writes a single line, read all of the following completely:

**Spec files:**
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/MASTER_PLAN.md
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/specs/APP_BLUEPRINT.md
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/specs/DESIGN_SYSTEM.md
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/specs/DATA_ARCHITECTURE.md

**Existing prototype files (read every single one):**
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/_tokens.css
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/_components.css
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/_layout.css
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/index.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/employees.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/gantt.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/expenses.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/timesheets.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/leaves.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/projects.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/clients.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/invoices.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/approvals.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/insights.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/planning.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/admin.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/auth.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/portal/index.html

---

## Step 2 — The Audit Phase (DO THIS BEFORE TOUCHING ANY FILE)

Spawn 5 critique agents in parallel. Each agent reads their assigned pages and
writes a brutal, senior-level audit. No politeness. No "this is good but...".
Every issue gets named directly. Think like a CTO who has used Linear, Figma,
Vercel, and Stripe every day for five years and is seeing your work for the
first time.

Save each audit to a file in `gammahr_v2/prototype/audits/`:

**Critique Agent 1 — Dashboard & Navigation Coherence**
Assigned: index.html, _layout.css, all nav items across ALL pages
Audit file: `audits/AUDIT_DASHBOARD_NAV.md`

Specific questions to answer ruthlessly:
- Does the dashboard tell a story at a glance, or is it just widgets?
- Is the information hierarchy clear — what's most important vs secondary?
- Are every single nav item label accurate to where they go?
- Are there any buttons or links that go nowhere, go to the wrong page,
  or are labelled misleadingly? (e.g. "Analytics" going to AI Insights)
- Are there dead ends anywhere — pages where the user gets stuck?
- Is the command palette actually reachable and useful?
- Does the header behave correctly on every page?
- Rate every section of the dashboard 1–10 and explain the score.

**Critique Agent 2 — Project & Client Depth**
Assigned: projects.html, clients.html, invoices.html
Audit file: `audits/AUDIT_PROJECTS_CLIENTS.md`

Specific questions to answer ruthlessly:
- Can you actually enter a project and see its full detail?
- Does the project detail page show: everyone working on it, their individual
  billing rates, their hours logged, the project's revenue (rate × hours),
  the project's cost (salary cost of those hours), and therefore its gross margin?
- Is there a project profitability view — not just total revenue but profit %?
- Can you see the full timeline of the project — milestones, start, end, progress?
- Does client detail show all projects under that client with aggregate revenue?
- Can you drill from client → project → employee in a natural chain?
- Does invoicing connect logically to projects and clients?
- What is missing from these pages that a consulting firm would absolutely need?

**Critique Agent 3 — Mobile & Responsiveness**
Assigned: ALL pages, viewed as if on a 390px wide iPhone 15 Pro screen
Audit file: `audits/AUDIT_MOBILE.md`

Specific questions to answer ruthlessly:
- Does every page have a proper mobile layout or does it just shrink and break?
- Is there a bottom navigation bar on mobile (most-used 5 items)?
- Are tables replaced with cards on mobile?
- Are touch targets at least 44×44px on every interactive element?
- Can the Gantt chart be used on mobile at all?
- Can timesheets be submitted on mobile?
- Can expenses be submitted on mobile (including the OCR flow)?
- Can a manager approve leaves, expenses, and timesheets from their phone?
- List every page that is unusable on mobile and why.

**Critique Agent 4 — UX Flows & Completeness**
Assigned: leaves.html, expenses.html, timesheets.html, approvals.html
Audit file: `audits/AUDIT_WORKFLOWS.md`

Specific questions to answer ruthlessly:
- Can you complete the full leave request flow start to finish without confusion?
- Can you complete the full expense submission flow including OCR?
- Can you complete a full timesheet week, submit it, and see it in the approval queue?
- Does the approvals hub show all three types (leaves, expenses, timesheets) in a
  unified, easy-to-process view? Can a manager handle their full queue in one sitting?
- Are there any points in any flow where the user would be confused about
  what to do next?
- Are confirmation states, success states, and error states all present?
- What flows are completely missing that should exist?

**Critique Agent 5 — Component Quality & Visual Polish**
Assigned: _components.css, _tokens.css, all pages for visual consistency
Audit file: `audits/AUDIT_COMPONENTS_VISUAL.md`

Specific questions to answer ruthlessly:
- Are all components visually consistent across pages or does each page look like
  it was built by a different person?
- Are the color tokens used correctly everywhere or are there hardcoded values?
- Do all badges use icon + color + text or are some color-only?
- Are all financial numbers in monospace font?
- Are shadows and surface levels used consistently to create proper depth hierarchy?
- Are there spacing inconsistencies — places where padding/margin is eyeballed
  rather than using the token system?
- Are hover states present on every interactive element?
- Are focus states (keyboard navigation) present and visible?
- What components are missing entirely that are referenced in the blueprint?

---

## Step 3 — The Cross-Critique (agents review each other's audits)

After all 5 audit files are written, spawn 5 new agents where each agent reads
TWO of the other agents' audits and adds their own observations. This catches
blind spots.

Save cross-critiques to:
- `audits/CROSSCRITIQUE_1.md` — reads AUDIT_PROJECTS_CLIENTS and AUDIT_MOBILE
- `audits/CROSSCRITIQUE_2.md` — reads AUDIT_WORKFLOWS and AUDIT_COMPONENTS_VISUAL
- `audits/CROSSCRITIQUE_3.md` — reads AUDIT_DASHBOARD_NAV and AUDIT_MOBILE
- `audits/CROSSCRITIQUE_4.md` — reads AUDIT_PROJECTS_CLIENTS and AUDIT_WORKFLOWS
- `audits/CROSSCRITIQUE_5.md` — reads AUDIT_DASHBOARD_NAV and AUDIT_COMPONENTS_VISUAL

---

## Step 4 — The Master Issue List

After all audits and cross-critiques are written, the orchestrator reads all 10
audit files and produces a single consolidated issue list.

Save to: `audits/MASTER_ISSUES.md`

Format each issue as:
```
### ISSUE-[N]: [Short title]
Page(s): [which files]
Priority: CRITICAL / HIGH / MEDIUM / LOW
Category: Navigation | UX Flow | Mobile | Visual | Missing Feature | Data/Content
Description: [What is wrong and why it matters]
Fix required: [Exactly what needs to change]
```

Priority definitions:
- CRITICAL: The app is unusable or misleading without this fix
- HIGH: A real user would be frustrated or confused by this
- MEDIUM: This reduces quality but doesn't block core usage
- LOW: Polish and refinement — noticeable to discerning eyes

---

## Step 5 — The Fix Phase

After MASTER_ISSUES.md is written, fix issues in priority order.
CRITICAL and HIGH issues must all be resolved. MEDIUM issues should be resolved.
LOW issues should be resolved if time permits.

### Known Issues to Fix (minimum — audits will find more)

**Navigation & Dashboard:**
- Every nav item label must accurately reflect where it goes. Review all sidebar
  items. If "Analytics" goes to AI Insights, either rename the nav item to
  "AI Insights" or create a separate proper analytics page. No misleading labels.
- Dashboard must feel like a command center — the first thing a CEO or HR director
  opens in the morning. It should answer: How is my team doing? What needs my
  attention today? What does the business look like this week?
- Every dashboard widget must be clickable and go somewhere logical
  (e.g. "Pending Approvals: 7" → goes to approvals.html, not a dead end)
- The presence panel, AI alerts, and all widgets must link to relevant entity pages

**Project Detail (CRITICAL missing feature):**
Create a full project detail view inside projects.html, accessible by clicking
any project name anywhere in the app (from clients.html, employees.html,
dashboard, gantt, etc.)

The project detail page must show:
- Header: project name, client name (clickable), status badge, dates, budget vs spent
- Team tab: table of everyone assigned to this project with:
  - Their name (clickable → employee profile)
  - Their role on the project
  - Their billing rate (e.g. £120/h external, £65/h internal cost)
  - Hours logged on this project (total + this month)
  - Revenue generated (billing rate × hours)
  - Cost (internal hourly cost × hours)
  - Gross margin per person
  - Table totals row at the bottom
- Financials tab:
  - Total budget, total revenue billed, total cost, gross profit, margin %
  - Month-by-month revenue vs cost chart (grouped bars, aged gold = revenue,
    terracotta = cost, sage = profit)
  - Budget burn gauge (how much of budget is used)
  - Projected completion cost vs budget
- Milestones tab: milestone list with dates, status, owner (clickable)
- Timesheets tab: all timesheet entries for this project, grouped by employee,
  filterable by date range
- Activity tab: chronological log of everything that happened on this project

**Client Detail (CRITICAL missing feature):**
Inside clients.html, clicking any client name must open a full client detail view:
- Header: client name, industry, contact info, account manager (clickable)
- Projects tab: all projects for this client (past and present) with status,
  budget, revenue, margin — table with totals
- Financials tab: total revenue from this client (all time + by year),
  outstanding invoices, payment history, average project margin
- Contacts tab: list of people at the client company with name, role, email, phone
- Invoices tab: all invoices for this client with status
- Documents tab: contracts and shared files with this client
- Notes tab: internal notes about the client (not visible in client portal)

**Mobile (CRITICAL — most users will be on mobile):**
Every page must have a complete mobile layout. This is not optional.

For every page, implement:
- At 768px and below: sidebar collapses to a slide-in drawer (hamburger button)
- At 480px and below: bottom navigation bar with 5 items:
  Dashboard, Timesheets, Expenses, Leaves, More (opens a drawer for the rest)
- All data tables convert to card lists on mobile — no horizontal scroll tables
- All modals go full-screen on mobile
- All form inputs are large enough to tap (min 44px height)
- The timesheet week grid on mobile: show one day at a time with day switcher
- The Gantt chart on mobile: show employee list with utilization bars only
  (not the full Gantt — link to desktop view for detail)
- The expense OCR flow must be fully mobile-friendly (camera upload)
- Approval queue on mobile: swipeable cards (swipe right = approve, left = reject)

**Employees — Profile completeness:**
- The Timeline tab must feel like a real work history, not a placeholder.
  Show at least 8 events in chronological order with icons per event type.
- Skills section must show proficiency level (1-5 stars or a bar)
- The Overview tab must show the org chart position (manager above, direct reports below)

**Consistency pass:**
- Every page that shows employees must show them as clickable EmployeeLink components
- Every page that shows projects must show them as clickable links to project detail
- Every page that shows clients must show them as clickable links to client detail
- No page should have a button that does nothing

---

## Step 6 — The Second Peer Review Round

After all fixes are applied, spawn 3 fresh critique agents who have NOT seen the
previous audits. Give them only the fixed prototype files and the original specs.
Ask them to find anything that still falls below the quality bar.

Save to:
- `audits/REVIEW2_UX.md` — fresh UX review of the whole app
- `audits/REVIEW2_MOBILE.md` — fresh mobile review
- `audits/REVIEW2_FLOWS.md` — fresh flow completion review

If these reviews find CRITICAL or HIGH issues, fix them before proceeding.
If they find only MEDIUM/LOW issues, compile them into `audits/POLISH_LIST.md`
and fix them all.

---

## Step 7 — The Polish Pass

This is the final pass before human validation. No new features. Pure refinement.

For every single page, a polish agent checks:

**Micro-interactions:**
- [ ] Every button has a hover state (cursor changes, background lightens)
- [ ] Every clickable row has a hover state
- [ ] Active sidebar item is visually distinct (primary color bg, full width)
- [ ] Focused inputs have a visible ring (2px primary color)
- [ ] Loading states exist for any action that would take time (skeleton shimmer)
- [ ] Success states exist for completed actions (green toast)
- [ ] Error states exist for failed actions (red toast with message)

**Data realism:**
- [ ] All names are real-sounding (not "User 1", "Employee A")
- [ ] All numbers are plausible (not £1,000,000 revenue on a 2-person project)
- [ ] Dates are internally consistent (hire dates before project start dates, etc.)
- [ ] Utilization percentages add up correctly on the Gantt
- [ ] Project financials are internally consistent (hours × rate = revenue shown)

**Typography & spacing:**
- [ ] No two adjacent text elements are the same size and weight
- [ ] Section headings are visually distinct from body text everywhere
- [ ] All financial figures use var(--font-mono)
- [ ] Consistent spacing between sections — no page feels cramped, no page
      has unexplained large gaps

**Colour discipline:**
- [ ] Zero hardcoded hex, rgb, or hsl values in any HTML file — only CSS vars
- [ ] Zero hardcoded values in any component — only CSS vars
- [ ] All status badges: icon + color + text (never color alone)
- [ ] Sage for success/approved, gold for pending/warning, brick red for rejected/error

---

## Step 8 — Final Human Validation Checklist

Before declaring Phase 1 fully complete, every item must be checked:

**Navigation:**
- [ ] Every sidebar nav item goes to the correct page
- [ ] Every nav item label accurately describes its destination
- [ ] Clicking the logo goes to the dashboard
- [ ] Back button works correctly (hash-based navigation)
- [ ] No dead-end pages exist — every page has clear next actions

**Deep linking:**
- [ ] Clicking any employee name anywhere goes to their profile
- [ ] Clicking any project name anywhere goes to project detail
- [ ] Clicking any client name anywhere goes to client detail
- [ ] Dashboard widgets link to their respective full pages

**Core flows (complete start to finish):**
- [ ] Leave request → submitted → approved (manager view) → appears in employee profile
- [ ] Expense → OCR upload → categorized → submitted → approved → appears in project financials
- [ ] Timesheet → week filled → submitted → approved → appears in project financials
- [ ] New project created → employee assigned → shows in Gantt → shows in employee profile
- [ ] Invoice created from project → sent to client → visible in client portal

**Project financials:**
- [ ] Project detail shows individual billing rates per team member
- [ ] Project detail shows revenue, cost, and gross margin
- [ ] Project financials are consistent with timesheet hours logged

**Mobile:**
- [ ] All pages usable on 390px width
- [ ] Bottom navigation present on mobile
- [ ] Tables converted to cards on mobile
- [ ] Full approval workflow completable on mobile
- [ ] Full expense submission completable on mobile

**Visual quality:**
- [ ] At 1440px: every page looks like a premium SaaS product
- [ ] At 390px: every page is clean, functional, and not broken
- [ ] Command palette opens with Cmd+K on every page
- [ ] No Lorem ipsum anywhere

---

## Guiding Principles for Every Agent in This Sprint

**On quality:**
Think of the best software you know — Linear for clarity, Figma for collaboration,
Stripe for data presentation, Notion for content. GammaHR should feel like it
belongs in that category. Not "pretty good for an HR tool." Just good, full stop.

**On critique:**
When reviewing another agent's work, be a harsh critic. "This is fine" is not
acceptable feedback. If something is fine, explain exactly why it is fine and
what would make it better. If something is wrong, name it precisely.
Senior engineers and designers do not protect feelings — they protect quality.

**On speed:**
Do not rush. A page that takes twice as long to produce but is genuinely excellent
is worth ten pages that are mediocre. Read the spec thoroughly. Think about the
user before writing a line of code. Consider edge cases. Consider the mobile user.
Consider the manager who opens this at 7am on their phone to approve the team's
timesheets. Consider the CEO who looks at the dashboard to understand the business.
Build for those real people.

**On completeness:**
If the spec says a feature exists, it must exist in the prototype. If you find
something in the spec that is not in the prototype, build it. Do not leave
placeholder text, empty sections, or "TODO" comments anywhere.

**On consistency:**
The app must feel like one product built by one team with one vision. If you
are touching a page, look at two adjacent pages in the nav and make sure yours
matches their patterns. Component names, spacing rhythms, and color usage must
be identical everywhere.

---

Begin with Step 1 — read all spec files and all prototype files. Then spawn the
5 critique agents in parallel. Do not skip the audit phase. Do not go straight
to fixing. Understand the full scope of what needs work before writing a line.
