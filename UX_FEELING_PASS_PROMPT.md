# GammaHR v2 — UX Feeling Pass

> Feed this file to Claude Code to run the UX Feeling Pass.
> This is a separate cycle from data-fix and feature-completeness passes.
> It has ONE goal: make the prototype feel like a single, premium, calm product.

---

## Your Role

You are the **Orchestrator** for the GammaHR v2 UX Feeling Pass.

This is NOT a bug-fix cycle. This is NOT a data integrity cycle.
This pass has one job: **make the prototype feel like Revolut built an HR tool.**

The product owner's specific complaints driving this pass:

1. **Too crowded** — too much text visible at once, especially `timesheets.html` and `leaves.html`. Users lose orientation. The app creates anxiety instead of calm.
2. **Inconsistent** — the same data is displayed differently page to page. Page skeletons feel different from each other. Some pages feel heavy, others light. The app does not feel like one product.
3. **No drill-down** — detail that belongs one click deeper is surfaced on every page. Everything should be clickable. List shows the summary; click opens the detail.
4. **Missing project detail page** — `projects.html` is a list only. Every other major entity (employees, clients) has a detail page. Projects do not. This is a CRITICAL omission that has been requested multiple times.

---

## What to Read First

Before dispatching any agent, read these files yourself:

1. `prototype/_tokens.css` — locked color palette (Earth & Sage — do not change)
2. `prototype/_components.css` — component library
3. `prototype/_layout.css` — app shell, sidebar, topbar, mobile nav
4. `prototype/_shared.js` — GHR utilities API
5. `.claude/memory/ux_philosophy.md` — **The UX vision. Read before dispatching any critic. Every issue and every fix must be evaluated against the four feelings: Ease, Calm, Completeness, Anticipation.**

---

## The Four Design Contracts

These four contracts apply to every agent, every file, without exception.

---

### Contract 1 — Page Anatomy

Every page in the prototype must follow this exact structure, in this order:

```
┌──────────────────────────────────────────────────────┐
│  PAGE HEADER                                         │
│  Left:  h1 page title + optional breadcrumb          │
│  Right: ONE primary CTA button (maximum)             │
│  Rules: No description paragraph. No sub-headers.    │
│         No tag clusters. No secondary buttons.       │
│         This row must be thin and clean.             │
├──────────────────────────────────────────────────────┤
│  KPI STRIP  (optional — only where it adds value)    │
│  Max 4 stat cards. Same height. Same component.      │
│  Rules: Never inside the filter bar. Never > 4.      │
│         Never on pages where no KPI is meaningful.   │
├──────────────────────────────────────────────────────┤
│  FILTER BAR  (standard — from _layout.css)           │
│  Left:   Search input                                │
│  Middle: Filter pills (status, date, department…)    │
│  Right:  View toggle (table/card) + Export button    │
│  Rules:  Exactly ONE filter bar per page.            │
│          Never stacked. Never duplicated.            │
├──────────────────────────────────────────────────────┤
│  CONTENT AREA                                        │
│  A table OR a card grid — never both at once.        │
│  Shows T1 columns only (3–5 fields, see Contract 2). │
│  Every row and every card is clickable.              │
├──────────────────────────────────────────────────────┤
│  PAGINATION                                          │
│  Same component on every page. Always at bottom.     │
└──────────────────────────────────────────────────────┘
```

**Exemptions** (visualization-first pages — still follow header + filter bar):
`gantt.html`, `planning.html`, `calendar.html`

---

### Contract 2 — Data Density Tiers

Every data point belongs to exactly one tier. Only T1 is visible on the list/table page.

| Tier | Visible when | Purpose |
|------|-------------|---------|
| **T1 — Surface** | Always, in the list/table | Scan and act. 3–5 fields max. |
| **T2 — Detail** | On row/card click → right drawer | Read and decide. All relevant fields. |
| **T3 — Deep** | On the entity's own detail page | Full history, audit trail, edit. |

**T1 column definitions — enforce these exactly:**

| Page | T1 columns (nothing more is acceptable) |
|------|----------------------------------------|
| `timesheets.html` | Employee name · Work time bar · Total hours · Status · Approve button |
| `leaves.html` | Employee name · Leave type · Date range · Status · Approve button |
| `expenses.html` | Employee name · Amount · Category · Status |
| `invoices.html` | Invoice # · Client name · Amount · Due date · Status |
| `approvals.html` | Type icon · Requester name · Summary (1 line max) · Date · Status |
| `employees.html` | Avatar · Name · Role · Department · Work time bar · Presence dot |
| `projects.html` | Name · Client sub-label · Status badge · Team size · Timeline bar |
| `clients.html` | Logo · Name · Active projects count · Total billed · Status |
| `hr.html` kanban | Candidate name · Role applied · AI fit % · Source tag |
| `admin.html` users | Avatar · Name · Role · Department · Status |

**T2 (drawer) content — what opens on click:**

| Row type | T2 drawer must contain |
|----------|----------------------|
| Timesheet row | Hours by day of week · Billable vs internal split · Project breakdown · Notes · Approve / Reject / Request revision |
| Leave request | Leave type · Full date range · Days remaining in balance · Reason · Team conflicts if any · Approve / Reject |
| Expense row | Receipt image (placeholder) · Full description · Project · Category · Submitted by · Approve / Reject |
| Invoice row | Line items table · Client contact · Due date · Payment terms · Send to Client / Download PDF / Record Payment |
| Approval item | Full request context (re-displays all fields) · Requester note · Approve / Reject with reason |
| Kanban candidate | Full name · Role applied · AI fit score · Key skills · Source · Resume link · Notes field · Move to next stage |

---

### Contract 3 — Universal Drill-Down Map

Every item in this table must be clickable. This is non-negotiable.

| What you click | Destination | Pattern |
|---|---|---|
| Employee name or avatar — **anywhere in the app** | `employees.html#[slug]` | Navigate |
| Project name — **anywhere in the app** | `projects.html#[slug]` — project detail section | Navigate |
| Client name — **anywhere in the app** | `clients.html#[slug]` — client detail section | Navigate |
| Department name | Employee list filtered to that department | Navigate |
| Timesheet row | Right-side drawer — T2 timesheet fields | Drawer |
| Leave request row | Right-side drawer — T2 leave fields | Drawer |
| Expense row | Right-side drawer — T2 expense fields | Drawer |
| Invoice row | Right-side drawer — T2 invoice fields | Drawer |
| Approval item | Right-side drawer — T2 approval fields | Drawer |
| Kanban candidate card | Right-side drawer — T2 candidate fields | Drawer |
| KPI number on dashboard | Underlying list, filtered to that metric | Navigate |
| Onboarding checklist task | Right-side drawer — task detail, assignee, due date | Drawer |

**Drawer implementation spec (same for every drawer in the app):**

```javascript
// Structure:
// <div class="drawer drawer-right" id="[entityType]Drawer">
//   <div class="drawer-backdrop"></div>
//   <div class="drawer-panel">
//     <div class="drawer-header">
//       <h2 class="drawer-title">[Entity Name]</h2>
//       <button class="drawer-close" aria-label="Close">×</button>
//     </div>
//     <div class="drawer-body">
//       [T2 fields here]
//     </div>
//     <div class="drawer-footer">
//       [Primary action button(s)]
//     </div>
//   </div>
// </div>

// Open:   drawer.classList.add('is-open')
// Close:  drawer.classList.remove('is-open')
// Close triggers: × button click, backdrop click, Escape key
// Width:  480px on desktop (md+), 100vw on mobile
// Overlay: semi-transparent backdrop blocks interaction with page behind
```

Add the drawer CSS to `_components.css` (Group A must do this first).
Every HTML group then implements the drawer for their assigned pages.

---

### Contract 4 — Component Dictionary

The same entity type must render identically on every page. No exceptions.

| Entity | Canonical rendering — use this everywhere |
|--------|------------------------------------------|
| **Employee** | 32px round avatar + full name. Always has `data-hovercard` `data-name` `data-role` `data-dept` `data-worktime` `data-href` attributes. Hover = mini-profile card. Click = navigate to `employees.html#[slug]`. |
| **Work time** | Horizontal bar. `var(--color-success)` fill ≤100%. `class="worktime-fill overflow"` in `var(--color-warning)` amber >100%. The bar can visually exceed its container to show overwork. **Never a donut. Never a standalone percentage number without a bar.** |
| **Status badge** | Pill badge using `_components.css` badge classes. Colors from `_tokens.css` semantic tokens only. Same size on every page. |
| **Project** | Bold project name + muted client name as sub-label in smaller text below. Always this 2-line format wherever a project reference appears. |
| **Client** | Client name only (no "Inc", no "Corporation"). Always "Globex Corp", never "Globex Corporation". |
| **Date range** | "Apr 14–18" format. Never "Apr 14 to Apr 18". Never ISO format. |
| **Money** | "€9,800" format. Always with currency symbol. Always with comma separator. |
| **Invoice number** | "INV-2026-041" format. 3-digit suffix only. Never "INV-2026-0041". |

---

## Project Detail Page — CRITICAL: MUST BUILD

**This section has been requested by the product owner multiple times and skipped every cycle. It is non-negotiable in this pass.**

`projects.html` must be updated to include a full project detail section that shows when a user clicks any project card or project name. Use the same pattern as `employees.html`: list view and detail view in the same file, toggled by click or URL hash (`#[project-slug]`).

**Project detail section structure:**

```
┌──────────────────────────────────────────────────────┐
│  PROJECT HEADER                                      │
│  ← Back to Projects (link)                          │
│  [Project Name]  [Client badge]  [Status badge]     │
│  [Start date] → [End date]       [Edit] [Archive]   │
├──────────────────────────────────────────────────────┤
│  KPI STRIP (4 cards)                                 │
│  Budget total · Amount invoiced · Remaining · Team   │
├───────────────────────────┬──────────────────────────┤
│  TEAM                     │  TIMELINE                │
│  Assigned employees       │  Mini bar per week       │
│  Avatar · Name · Role     │  showing project spans   │
│  Hours this week (bar)    │  and milestones          │
├───────────────────────────┴──────────────────────────┤
│  RECENT TIMESHEETS  (last 4 weeks, max 8 rows)       │
│  Employee · Hours · Billable % · Week label          │
│  Row click → timesheet drawer                        │
├──────────────────────────────────────────────────────┤
│  LINKED INVOICES                                     │
│  Invoice # · Amount · Status badge · Date            │
│  Row click → invoice drawer                          │
└──────────────────────────────────────────────────────┘
```

Assign plausible seed data to each of the 7 canonical projects. Use existing employees and clients. The project detail does not need to be editable — read-only display is sufficient for the prototype.

---

## Canonical Data Contract

**Every agent that touches HTML gets this block. No exceptions.**

```
EMPLOYEES (8 named people, 12 total in company):

Work time formula: (billableHours + internalHours) / 40 × 100. CAN exceed 100%.

  Employee         | Billable h | Internal h | Total h | Work Time% | Presence  | Role                | Dept
  Sarah Chen       |    34h     |     6h     |   40h   |    100%    | Online    | Project Manager     | Engineering
  John Smith       |    40h     |     5h     |   45h   |   112.5%   | Online    | Senior Developer    | Engineering  ← OVERWORK amber
  Marco Rossi      |    36h     |     7h     |   43h   |   107.5%   | Away      | Operations Lead     | Operations   ← OVERWORK amber
  Carol Williams   |    38h     |     2h     |   40h   |    100%    | Online    | Design Lead         | Design
  Alice Wang       |    16h     |     2h     |   18h   |     45%    | On Leave  | On Leave Apr 14–18  | Engineering
  David Park       |    28h     |     6h     |   34h   |     85%    | Offline   | Finance Lead        | Finance
  Emma Laurent     |    18h     |    18h     |   36h   |     90%    | Online    | HR Specialist       | HR
  Bob Taylor       |     0h     |     0h     |    0h   |      0%    | Offline   | Backend Developer   | Engineering (Bench)

  Unnamed 4: Liam O'Brien, Sophie Dubois, Lisa Martinez, + 1 other
  Each: ~34h billable + 1h internal ≈ 87.5% work time

KPI CONSTANTS:
  Active employees: 12 | Hours this week: 394h | Open projects: 7
  Team work time: 82% | Monthly capacity: 2,076h | Departments: 6

CLIENTS (4): Acme Corp | Globex Corp | Initech | Umbrella Corp
  "Globex Corp" NOT "Globex Corporation"
  "Contoso" does not exist — use "Umbrella Corp"

PROJECTS (7): 7 active projects spread across the 4 canonical clients

FINANCIAL:
  INV-2026-041 → Acme Corp, €9,800
  Invoice suffix: 3 digits only (INV-2026-041, not INV-2026-0041)
  Bob Taylor hotel expense: €340, Marriott Lyon
  Portal outstanding: €17,400 (INV-2026-048 €12,400 + INV-2026-043 €5,000)

ADMIN COUNTS:
  6 departments, headcounts sum to 12
  Admin user table: 12 users

ALICE WANG: On Leave Apr 14–18. Presence = "On Leave", not "Away".
BOB TAYLOR: "Backend Developer", not "Senior Developer". Bench = offline, 0h.
EMMA LAURENT: Status = Active in admin.html.
OVERWORK: John Smith (112.5%) and Marco Rossi (107.5%) must show amber bars everywhere.
NO DONUT CHARTS for hours/capacity anywhere — horizontal bars only.
```

---

## _shared.js API Contract

**Every agent that modifies HTML must include this:**

```javascript
// Before </body> on every page:
<script src="_shared.js"></script>

// In DOMContentLoaded on every page:
GHR.initHoverCard();
GHR.initPresence();
GHR.initRoleSwitcher();
GHR.initKeyboardShortcuts();
GHR.initSkeletons();

// Notifications — centralized, never hand-coded in pages:
<div id="notifPanel"></div>

// Toasts:
GHR.showToast('success' | 'error' | 'warning' | 'info', title, message)

// Hovercard attributes on every employee name/avatar:
data-hovercard
data-name="Sarah Chen"
data-role="Project Manager"
data-dept="Engineering"
data-project="Acme Web Redesign"
data-worktime="100"
data-href="employees.html#sarah-chen"
```

---

## Wave 1 — UX Critics

Run in batches of 2. Wait for each batch to complete before launching the next.

**Batch 1:** Critics SPACE + UNITY (run together)
**Batch 2:** Critics DRILL + FEEL (run together)

After all 4 critics complete — **STOP. Do not launch Wave 2 yet.**
Read the OPEN QUESTIONS section from each CRITIC file.
Compile them, grouped by page, and ask the product owner.
Wait for answers. Paste the answers into every relevant remediation agent prompt.

---

### Critic 1 — Density & Breathing Room [SPACE]

```
You are a harsh UX designer obsessed with whitespace and calm. Your only job: find
every place in the GammaHR v2 prototype where a user is shown too much information
at once and feels overwhelmed or loses orientation.

Read EVERY HTML file in prototype/. For each page, run this checklist:

DENSITY CHECKS:
1. Main table: how many columns are visible? If >5, flag each excess column by name.
2. Cards: how many data points per card? If >5, flag each excess field by name.
3. Page header area: is there descriptive text, sub-headers, or tag clusters above the
   content? Flag anything that isn't a clean h1 + one CTA.
4. Filter area: are there multiple filter bars or toolbars stacked? Flag stacking.
5. KPI strip: more than 4 cards? Flag the excess.
6. Is any information repeated — shown in both the header AND the table row?
7. Are there any text blocks (paragraphs, label clusters) that could move to a drawer?

PAY SPECIAL ATTENTION TO:
- timesheets.html — most critical. Name every column and field that should move to drawer.
- leaves.html — second most critical. Same treatment.
- For every other page: at minimum count the visible columns and flag if >5.

OUTPUT FORMAT:
--- SECTION 1: ISSUES ---
For each issue: [PAGE] | [ELEMENT] | [WHY IT'S TOO DENSE] | [WHERE IT SHOULD MOVE]
Minimum 20 issues. Be specific — name the actual fields and columns.

--- SECTION 2: OPEN QUESTIONS ---
List only decisions you cannot make without product owner input. Be specific:
"timesheets.html — should the project breakdown column move to the drawer entirely, or
stay collapsed by default with an expand toggle in the row? This affects whether a
manager can scan all 12 employees' project splits at a glance without clicking."
```

---

### Critic 2 — Cross-Page Consistency [UNITY]

```
You are a harsh design systems engineer. Your job: find every place where the
GammaHR v2 prototype fails to feel like a single unified product.

Read EVERY HTML file in prototype/. Check every category below:

PAGE SKELETON:
Does each page follow: Page Header → KPI Strip (optional) → Filter Bar → Content → Pagination?
Flag every page that deviates. State exactly what's different about the structure.

COMPONENT CONSISTENCY — check these entity types on every page they appear:
- Employee display: is it always avatar + name + hovercard? Or sometimes name-only? Sometimes avatar-only?
- Work time: is it always a horizontal bar? Or sometimes a donut, sometimes a number, sometimes a bar?
- Status badges: same pill component, same colors, same sizing on every page?
- Project references: always "bold name + muted client sub-label"? Or different formats?
- Money values: always "€9,800" format? Or inconsistent?
- Date ranges: always "Apr 14–18"? Or different formats on different pages?
- Action buttons: same button styles for same action types across pages?
- Triple-dot menus: present consistently on all tables that need them?

VISUAL WEIGHT:
Identify pages that feel noticeably heavier or lighter than average.
Name specifically what's making them feel different (font sizes, padding, color usage,
number of elements in the viewport).

TYPOGRAPHY:
Are h1 page titles the same size and weight everywhere?
Are table column headers the same style everywhere?
Are filter bar labels the same style everywhere?
Are there pages with noticeably smaller or larger body text than others?

OUTPUT FORMAT:
--- SECTION 1: ISSUES ---
For each issue: [PAGE(S)] | [WHAT DIFFERS] | [WHICH VERSION IS CORRECT]
(If you cannot determine which version is correct, note it in Section 2.)
Minimum 25 issues.

--- SECTION 2: OPEN QUESTIONS ---
Cases where two different pages each have a valid approach and you cannot determine
which should be the standard without product owner input.
```

---

### Critic 3 — Drill-Down & Clickability [DRILL]

```
You are a harsh interaction designer. Your job: find every place where the
GammaHR v2 prototype fails to implement the drill-down principle:
everything meaningful is clickable; detail lives one level deeper, not on the surface.

Read EVERY HTML file in prototype/. Check against this complete drill-down map:

REQUIRED CLICKABLE ELEMENTS:
- Employee name / avatar anywhere in app → employees.html#[slug]
- Project name anywhere → projects.html#[slug] (project detail section)
- Client name anywhere → clients.html#[slug]
- Department name → employee list filtered to dept
- Timesheet row → right drawer with T2 timesheet detail
- Leave request row → right drawer with T2 leave detail
- Expense row → right drawer with T2 expense detail
- Invoice row → right drawer with T2 invoice detail
- Approval item → right drawer with T2 approval context + actions
- Kanban candidate card → right drawer with T2 candidate detail
- KPI numbers on dashboard → underlying list filtered to that data
- Onboarding checklist task → right drawer with task detail

FLAG:
1. Every element in the list above that is NOT clickable
2. Every employee name or avatar missing data-hovercard attributes
3. projects.html: confirm there is NO project detail section (this is CRITICAL — must be built)
4. Any triple-dot (⋯) menu that doesn't open a dropdown (toast-only is broken)
5. Any form action that doesn't update the list after submit
6. Any T2 detail (fields beyond T1 columns) currently visible on the list surface
   that should move to the drawer

OUTPUT FORMAT:
--- SECTION 1: ISSUES ---
For each missing clickable: [PAGE] | [ELEMENT] | [WHAT IT SHOULD DO]
For each missing drawer: [PAGE] | [ROW TYPE] | [WHICH T2 FIELDS THE DRAWER NEEDS]
Minimum 20 issues. Confirm projects.html missing detail page as CRITICAL item #1.

--- SECTION 2: OPEN QUESTIONS ---
Cases where you're unsure if something should open a drawer vs navigate to a full page.
```

---

### Critic 4 — Anti-Tempolia Feeling [FEEL]

```
You are a harsh UX director. Read .claude/memory/ux_philosophy.md before you start.

Your job: find every place in the GammaHR v2 prototype where the user is forced to
do work the app should have done. Where the experience creates anxiety. Where completing
a task feels like relief rather than satisfaction.

Read EVERY HTML file in prototype/. For each page and each flow, ask:

EASE — Is the app doing the work, or is the user?
- Forms: are fields pre-filled with everything the app already knows?
- Are there fields requiring the user to type something the app could look up?
- Are there multi-step flows that could be one step?

CALM — Does anything create anxiety or confusion?
- Is the user always clear about where they are?
- Are action outcomes always visible? (submitting something: does the list update?)
- Are there states where the user doesn't know if something worked?
- Does anything feel like it could be dangerous (no confirmation on destructive actions)?
- Is there too much on screen at once? (coordinate with SPACE critic — flag separately)

COMPLETENESS — Does the app feel like it's working for you?
- Empty states: is there an empty state on every list, table, tab, and kanban column?
- Zero-state (new company): what does a new user see? Is it helpful or just empty?
- After approving/rejecting: does the item disappear cleanly or stay awkwardly?

ANTICIPATION — Does completing something feel satisfying?
- After submitting a timesheet: is there a clean "all done" state?
- After approving a batch: does the queue empty with clear feedback?
- After creating something: does the list update immediately?

DO NOT FLAG: missing animations, sparklines, 3D effects, color schemes, gradients,
"would be nice" suggestions. Only real friction.

SEVERITY:
CRITICAL = feels like Tempolia — the user is doing manual work the app should do
HIGH = unnecessary friction — more steps than needed, confusing state
MEDIUM = neutral when it should be positive — no feedback, no satisfaction

OUTPUT FORMAT:
--- SECTION 1: ISSUES ---
[SEVERITY] | [PAGE] | [FLOW OR ELEMENT] | [WHAT THE FRICTION IS] | [WHAT IT SHOULD FEEL LIKE]
Minimum 20 issues.

--- SECTION 2: OPEN QUESTIONS ---
Cases where fixing the friction requires a product decision you cannot make alone.
Example: "timesheets.html — should the app auto-approve when work time is within
normal range, requiring the manager to only review outliers? Or is manual approval
of every row the intended flow? This changes whether the approve button should be
prominent or de-emphasized."
```

---

## Orchestrator Pause — Ask the Product Owner

After Wave 1 completes, before launching any remediation:

1. Read the `--- SECTION 2: OPEN QUESTIONS ---` from each CRITIC file
2. Group questions by page
3. Remove duplicates (multiple critics may flag the same question)
4. Present the consolidated list to the product owner in plain language
5. Wait for their answers
6. Add a `## PRODUCT OWNER ANSWERS` block to each relevant remediation prompt

**Do not launch Wave 2 until you have answers to the open questions.**

---

## Wave 2 — Remediation

Same file groups as the enhancement pass. **Group A runs FIRST, alone.**
All other groups: run in batches of 2–3. Wait for each batch before launching the next.

**Group A — Core CSS & JS** ← FIRST, alone, before any HTML agents
Files: `_tokens.css`, `_components.css`, `_layout.css`, `_shared.js`

**Group B — Dashboard & Auth**
Files: `index.html`, `auth.html`

**Group C — People**
Files: `employees.html`, `hr.html`

**Group D — Work Tracking**
Files: `timesheets.html`, `leaves.html`, `expenses.html`

**Group E — Projects & Clients & Invoices** ← builds project detail page
Files: `projects.html`, `clients.html`, `invoices.html`

**Group F — Planning & Visualization**
Files: `gantt.html`, `planning.html`, `calendar.html`, `insights.html`

**Group G — Operations & Admin**
Files: `approvals.html`, `admin.html`, `account.html`

**Group H — Portal**
Files: `portal/index.html`, `portal/auth.html`

---

### Remediation Agent Prompt Template

```markdown
## CONTEXT
You are improving the GammaHR v2 prototype as part of a UX Feeling Pass.
This is NOT a bug-fix cycle. Your job: make your assigned pages feel spacious,
calm, consistent, and unified. The product owner's standard: Revolut-level clarity.

## YOUR FILES — touch ONLY these
[LIST FILES]
Do not touch any other file.

## CANONICAL DATA
[paste canonical data block — required in every agent]

## SHARED JS API
[paste _shared.js API block — required in every agent]

## THE FOUR DESIGN CONTRACTS — apply to every file

### Contract 1 — Page Anatomy
Every page must follow: Page Header → KPI Strip (optional, ≤4) → Filter Bar (1 only)
→ Content (table OR cards, never both) → Pagination.
Restructure pages that don't follow this. Do not just tweak — rebuild the structure.

### Contract 2 — Data Density
T1 columns only in tables/lists. Everything else moves to the right-side drawer.
T1 columns for your pages:
[paste the T1 definitions for the pages in this group]

Drawer spec:
- 480px wide on desktop, full-width on mobile
- Structure: drawer-header (title + × close) / drawer-body (T2 fields) / drawer-footer (actions)
- Open on row click. Close on: × button, backdrop click, Escape key.
- CSS classes: .drawer .drawer-right .is-open .drawer-backdrop .drawer-panel
  .drawer-header .drawer-close .drawer-body .drawer-footer
  (These classes are defined in _components.css by Group A — use them, don't redefine)

### Contract 3 — Clickable Elements
Every employee name → employees.html#[slug] (with data-hovercard attributes)
Every project name → projects.html#[slug]
Every client name → clients.html#[slug]
Every table/list row → right-side drawer (implement for your pages)
[paste the relevant rows from the drill-down map for this group's pages]

### Contract 4 — Component Dictionary
Employee: avatar (32px) + name + data-hovercard. Hover = mini-card. Click = navigate.
Work time: horizontal bar only. Green ≤100%. Amber overflow >100%. Never donut.
Status: pill badge, _tokens.css colors only. Same size everywhere.
Project: bold name + muted client sub-label. Always 2-line format.
Money: €9,800 format always. Date range: "Apr 14–18" format always.

## ISSUES TO FIX
Read these critic files and fix EVERY issue affecting your assigned files:
- CRITIC_SPACE.md — density and breathing room issues
- CRITIC_UNITY.md — consistency issues
- CRITIC_DRILL.md — missing clickables and drawers
- CRITIC_FEEL.md — friction and feeling issues

Fix CRITICAL, HIGH, and MEDIUM severity issues. No SKIPPED items.

## PRODUCT OWNER ANSWERS
[paste the answers to open questions relevant to this group's files]

## SPECIAL INSTRUCTION — Group E only
projects.html MUST have a project detail section built from scratch.
Spec is in the UX_FEELING_PASS_PROMPT.md file under "Project Detail Page".
This is non-negotiable. If you cannot build it completely, build it partially
and flag exactly what remains.

## CROSS-CUTTING — apply to every file
- <script src="_shared.js"></script> before </body>
- All 5 GHR.init*() calls in DOMContentLoaded
- data-hovercard attributes on every employee name/avatar
- <div id="notifPanel"></div> for notifications (not hand-coded HTML)
- No hardcoded colors, font sizes, or spacing — CSS variables from _tokens.css only
- No page-level CSS overriding _layout.css filter-bar-standard

## PROCESS
1. Read each file FULLY before touching it — never edit blind
2. Apply Contract 1: restructure the page skeleton if it's wrong
3. Apply Contract 2: strip the table to T1 columns; build the drawer for each row type
4. Apply Contract 3: wire up all clickable entity names and row clicks
5. Apply Contract 4: standardize all entity component rendering
6. Fix all issues from the CRITIC files
7. Verify HTML is valid and all tags are properly closed
8. Report every item: DONE or CANNOT FIX (with reason and proposed alternative)
```

---

## Group A Special Instructions — Core CSS & JS

Group A runs alone, first. Every other agent depends on its output.

Group A must deliver:

**`_components.css` additions:**
- `.drawer`, `.drawer-right`, `.drawer-backdrop`, `.drawer-panel` — full drawer system
- `.drawer-header`, `.drawer-close`, `.drawer-body`, `.drawer-footer`
- `.drawer.is-open` — transition (slide in from right, 300ms ease)
- `.drawer-backdrop.is-open` — semi-transparent overlay
- Verify `.worktime-fill.overflow` uses `var(--color-warning)` — amber, not red
- Verify all badge/pill sizes are consistent

**`_layout.css` fixes:**
- `.filter-bar-standard` must be a single-row component, never wrapping by default
- Page header zone: padding that creates breathing room without being wasteful
- KPI strip: consistent height, consistent gap between cards on all viewport sizes

**`_shared.js` additions:**
- `GHR.openDrawer(drawerId, data)` — opens a drawer and populates it with data object
- `GHR.closeDrawer(drawerId)` — closes and resets a drawer
- Escape key listener that closes any open drawer
- Backdrop click listener on `.drawer-backdrop` elements

**`_tokens.css`:**
- Add `--drawer-width: 480px` token if not present
- Verify `--color-warning` exists and is amber

---

## Wave 3 — Final Verification

One agent. Runs after ALL remediation is complete.

1. Read all 4 CRITIC files
2. Read every prototype HTML file and CSS/JS files
3. For each issue in each critic file: verify it is resolved
4. Manually trace the drill-down map — click each entity type mentally and verify the handler exists
5. Write `UX_FEELING_FINAL.md`:
   - All resolved items: ✓ DONE
   - Unresolved items: ✗ REMAINING + reason
   - Any regressions introduced during remediation
   - Verdict: "Ready for stakeholder review" or "Needs another pass"
6. Do NOT delete CRITIC files — they are the audit trail

---

## Orchestrator Rules

1. **CSS/JS first.** Group A alone. No HTML agents start until Group A is done.
2. **Pause after Wave 1.** Collect open questions. Ask product owner. No Wave 2 without answers.
3. **Batches of 2–3.** Never more than 3 simultaneous agents.
4. **Canonical data in every prompt.** Agents run in isolation — they cannot read each other's context.
5. **Project detail page is non-negotiable.** If Group E skips it, re-run Group E with explicit escalation.
6. **No regressions.** Preserve all working JS handlers, data, and interactions. Add and restructure — do not remove.
7. **Critics must find real problems.** If a critic returns fewer than 10 issues, re-run it.
8. **No cosmetic wishlist.** Critics flag friction, inconsistency, and missing drill-down only. Not animations, not sparklines, not 3D effects.
9. **Drawers are not optional.** Every row type in every table must have a drawer. If an agent reports "drawer not implemented," that agent has failed.
10. **One page structure.** Every agent must restructure pages that don't follow Contract 1. "The page already has content" is not a reason to skip restructuring.

---

## What "Done" Looks Like

**Page Structure:**
- [ ] Every page follows the Page Anatomy Contract: header → KPI strip → filter bar → content → pagination
- [ ] Every page has exactly one filter bar
- [ ] Page headers are clean: h1 + one CTA, nothing else

**Data Density:**
- [ ] Every table/list shows T1 columns only (≤5 fields)
- [ ] Every row click opens a right-side drawer with T2 detail
- [ ] `timesheets.html` feels calm and scannable — a manager can process the whole team in 10 seconds
- [ ] `leaves.html` feels calm and scannable — same standard

**Drill-Down:**
- [ ] Every employee name/avatar in the entire app navigates to their profile
- [ ] Every project name in the entire app opens the project detail section
- [ ] Every client name navigates to the client detail section
- [ ] Every table row has a working drawer implementation
- [ ] `projects.html` has a full project detail section (built from scratch)

**Consistency:**
- [ ] Work time is ALWAYS a horizontal bar — no donuts, no standalone percentages
- [ ] Status badges use the same pill component on every page
- [ ] Employee rendering is identical across all pages
- [ ] The app looks and feels like one product, not 18 independent pages

**Feeling:**
- [ ] Opening `timesheets.html` feels like a calm overview, not a data dump
- [ ] A new user on any page immediately understands what it shows and what to do next
- [ ] Every action has feedback — nothing completes silently
- [ ] Every list has an empty state — nothing shows a blank screen

**Completion:**
- [ ] `UX_FEELING_FINAL.md` exists and says "Ready for stakeholder review"
- [ ] All CRITIC file issues are resolved or have a documented reason why not
