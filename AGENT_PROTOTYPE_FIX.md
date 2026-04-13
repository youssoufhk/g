# AGENT TASK: Fix GammaHR v2 Prototype — Demo-Ready Pass

## Context

You are fixing a static HTML/CSS/JS prototype for GammaHR v2, a premium HR operations platform
for consulting firms and agencies. The prototype lives entirely in `/prototype/`. There is no
build step — files are opened directly in a browser.

**Your goal:** Make this prototype safe for a live stakeholder demo with a sophisticated buyer.
Fix every issue listed below. Do not add new features. Do not refactor what is not broken.
Do not leave any issue partially fixed.

**Read these files first before touching anything:**
- `prototype/DESIGN_SYSTEM.md` — visual rules, banned patterns, locked terminology
- `prototype/_shared.js` — all canonical employee/project/client data lives here
- `REVIEW_VERDICT.md` — the full issue list you are fixing

---

## Canonical Data Reference (source of truth — never deviate)

### Employees (exactly 12)
| Name | Role | Work Time % | Status |
|------|------|-------------|--------|
| John Smith | Senior Consultant | **112.5% — OVERWORKED** | Amber bar + overwork badge |
| Marco Rossi | Frontend Developer | **107.5% — OVERWORKED** | Amber bar + overwork badge |
| Sarah Johnson | Project Manager | **100%** | Full bar, no overwork |
| Carol Williams | HR Manager | **100%** | Full bar |
| Emma Davis | UX Designer | **90%** | Normal |
| Michael Brown | Backend Developer | **88%** | Normal |
| David Park | Data Analyst | **85%** | Normal |
| Alice Wang | Finance Manager | **72%** | Normal |
| Liam O'Brien | DevOps Engineer | **65%** | Normal |
| Priya Sharma | Business Analyst | **55%** | Normal |
| Raj Patel | Junior Consultant | **40%** | Normal |
| Sophie Laurent | Marketing Manager | **30%** | Normal |

**Work time > 100% MUST render as an amber/orange bar that overflows the 100% mark.**
The overflow zone is the core visual value proposition. If John and Marco show as 82% and 88%
with green bars, the demo is dead.

### Clients (exactly 4)
- Acme Corp
- Globex Corp
- Initech
- Umbrella Corp

**"Contoso Inc" must not exist anywhere in the codebase.** It is a ghost entity.

### Projects (exactly 7)
- Alpha Platform (Acme Corp)
- Beta Integration (Globex Corp)
- Gamma Analytics (Initech)
- Delta Security (Umbrella Corp)
- Epsilon Design (Acme Corp)
- Zeta Migration (Globex Corp)
- Eta Consulting (Initech)

### Invoice canonical amounts
- INV-2026-041: **€9,800** everywhere (invoices.html AND portal/index.html)
- Outstanding total on portal: **€17,400**

### Alice Wang canonical leave
- Dates: **Apr 14–18, 2026** — on every page including approvals.html

---

## P0 — Fix These First (sale-killers)

### P0-1: Work-time percentages wrong everywhere

**Problem:** John Smith (canonical: 112.5%) shows as 82% throughout. Marco Rossi (107.5%) shows
as 88%. All other employees also have wrong values. This is the core value proposition of the
product and it is completely invisible.

**Files to fix:** `_shared.js`, `employees.html`, `timesheets.html`, `insights.html`,
`planning.html`, `gantt.html`, `admin.html`, `index.html`

**Fix:**
1. In `_shared.js`, update the employee data array so every `workTime` / `utilization` /
   `capacity` field matches the canonical table above exactly.
2. Search every HTML file for hardcoded percentage values tied to employee names.
   Replace all of them with the canonical values.
3. For John Smith and Marco Rossi: the progress bar fill must visually overflow the 100%
   mark using a separate amber segment. The bar should show 100% green + 12.5% / 7.5%
   amber overflow. This is defined in `DESIGN_SYSTEM.md` — do not use donut/pie charts.
4. Add an overwork badge or indicator next to John and Marco on any page that shows
   work-time context (employees list, timesheets, planning, Gantt, dashboard).

**Acceptance:** Open employees.html and find John Smith. His work-time bar must be >100% with
an amber overflow segment. Marco's must show the same. No other employee must show >100%.

---

### P0-2: Purge "Contoso Inc" — phantom client

**Problem:** "Contoso Inc" appears as a client card, invoice rows, a project, a planning column,
and in the insights revenue chart. It is not in the canonical client list.

**Files to fix:** `clients.html`, `invoices.html`, `projects.html`, `planning.html`,
`gantt.html`, `insights.html`

**Fix:**
Replace every occurrence of "Contoso Inc" with "Umbrella Corp". This includes:
- Client cards and list rows
- Invoice `client` fields and filter tags
- Project `client` assignments
- Planning column headers
- Insights chart labels and revenue breakdown rows
- Any tooltip or hover text

**Acceptance:** `grep -r "Contoso" prototype/` must return zero results.

---

### P0-3: Ghost employee "James Wilson" must be replaced

**Problem:** "James Wilson" is not in the 12-employee canonical roster. He appears in the Gantt
data array and in AI insights canned responses, which actively destroys the AI credibility story.

**Files to fix:** `gantt.html`, `insights.html`

**Fix:**
Replace every occurrence of "James Wilson" with "Liam O'Brien". Update:
- Gantt row data (name, avatar initials: "LO", assignment)
- AI insights natural language response strings that reference James Wilson
- Any filter chip or legend entry referencing him

**Acceptance:** `grep -r "James Wilson" prototype/` must return zero results.

---

### P0-4: Dashboard KPI cards — wrong labels and arithmetic

**Problem:**
- "Billable Hours % 87%" → wrong label, wrong value
- Active Employees sub-label arithmetic sums to 9, not 12

**File to fix:** `index.html`

**Fix:**
1. Change "Billable Hours %" label to "Team Work Time"
2. Change value from 87% to **82%** (weighted average of all 12 employees)
3. Fix the Active Employees sub-label so the breakdown sums to **12**
   (e.g., "10 active · 1 on leave · 1 bench" — exact numbers must sum to 12)
4. While on this page: confirm the monthly capacity figure reads "2,076h" or add it
   if missing

---

## P1 — Fix Before Any Demo

### P1-1: Cross-page data discrepancies

**Problem:** Same entity shows different values on different pages.

**Fix each:**

1. **INV-2026-041 amount:**
   - `invoices.html` shows €9,800 ✓ (keep as-is)
   - `portal/index.html` shows €8,200 → change to **€9,800**

2. **Alice Wang leave dates:**
   - Most pages show Apr 14–18 ✓ (keep as-is)
   - `approvals.html` shows Apr 28–29 → change to **Apr 14–18, 2026**

3. **David Park work-time hovercard:**
   - Hovercard in `_shared.js` shows 45% (copy-pasted from Alice Wang) → change to **85%**
   - Confirm timesheet row also shows 85%

---

### P1-2: hr.html — candidate slide panel (replace toast-on-click)

**Problem:** Clicking any candidate card fires a toast notification. The Kanban pipeline
shows 47 candidates in the header but only 12 cards are rendered.

**Fix:**
1. Fix the candidate count: count the rendered cards and set the header badge to that number.
   Do not fabricate more cards — match header to rendered reality.
2. Replace the toast-on-click with a right-side slide panel (drawer). The drawer must show:
   - Candidate name, role applied for, AI fit score (e.g., "87% match")
   - Current Kanban stage (e.g., "Technical Interview")
   - Resume link (can be `#`)
   - Notes textarea (can be non-persistent)
   - "Move to Next Stage" button (fires a toast confirming stage change — acceptable)
   - "Reject" button (fires a rejection toast — acceptable)
3. The drawer must open on card click and close on Escape or clicking outside.
4. Drag-and-drop is NOT required. Remove `draggable="true"` from cards if there are no
   drag event handlers. A decorative attribute without handlers is misleading.

---

### P1-3: "Create Project" must append a visible row

**Problem:** "Create Project" fires a success toast but the project list is unchanged.

**File to fix:** `projects.html`

**Fix:**
When the create project form is submitted:
1. Insert a new project row/card into the list with the form values (name, client, status)
2. The new item can be hardcoded with sensible defaults for fields not in the form
3. Update the project count in the page header (e.g., "7 Projects" → "8 Projects")
4. Scroll the new item into view

---

### P1-4: "Generate Invoice from Timesheets" must append a visible row

**Problem:** "Generate Invoice" fires a toast but the invoice table is unchanged.

**File to fix:** `timesheets.html` (and `invoices.html` if the flow navigates there)

**Fix:**
When the generate invoice action is confirmed:
1. Append a new invoice row to the visible invoice list (or the timesheets approval section)
2. The new row must have: a generated INV number (e.g., INV-2026-049), client name,
   amount derived from the selected timesheets (can be hardcoded), status "Draft"
3. Update any invoice count badge visible on the page

---

### P1-5: Client portal tab navigation

**Problem:** The portal has navigation tabs (Overview, Invoices, Projects, Documents) but
clicking any tab does not change the visible content — the portal is a single static screen.

**File to fix:** `portal/index.html`

**Fix:**
Add ~20 lines of JavaScript:
1. Each tab click hides all tab content sections and shows only the clicked one
2. Active tab gets a visual active state (the CSS class likely already exists)
3. The default active tab on page load is "Overview"
4. This does not need to be sophisticated — simple show/hide with `display: none` is fine

---

### P1-6: Gantt zoom buttons and filter dropdowns

**Problem:** The zoom in/out buttons do nothing. Filter dropdowns (By Team, By Client, etc.)
do not filter rows.

**File to fix:** `gantt.html`

**Fix (minimum viable):**
1. Zoom buttons: toggle between two hardcoded zoom levels (e.g., 2-week view and 6-week view)
   by changing the column width CSS variable or class. Two levels are enough for a demo.
2. Filter dropdowns: implement client-side filter for the "Status" filter chip group
   (Bench / On Leave / Over-allocated). Clicking a chip should show/hide Gantt rows by status.
   The team/client dropdowns can remain visual-only with a tooltip "Filtering coming soon"
   — but at least one filter must actually work.

---

## P2 — Polish (do after P0 and P1 are complete)

### P2-1: Mobile — fix horizontal scroll on key pages

The following pages are unusable on screens narrower than 1280px. Add a horizontal scroll
container wrapper with a minimum width, plus a "Best on desktop" banner at <768px:
- `gantt.html`
- `timesheets.html` (grid)
- `planning.html` (matrix)

Do not attempt a full mobile redesign. A contained horizontal scroll is sufficient.

### P2-2: AI Insights page — add a "last updated" timestamp

The insights page is entirely static. Add a hardcoded "Data as of Apr 13, 2026 · 09:14" label
near the top. This small change prevents the "is this live?" question from derailing a demo.

### P2-3: Pagination touch targets

Any pagination button smaller than 44×44px should be increased. This is a WCAG minimum.
Affects: `employees.html`, `invoices.html`, `projects.html`, `clients.html`.

---

## Execution Rules

1. **Read the file before editing it.** Do not make assumptions about the current state.
2. **One file at a time.** Complete each file's fixes fully before moving to the next.
3. **After each P0 fix, verify with grep.** `grep -r "Contoso" prototype/` must return 0.
   `grep -r "James Wilson" prototype/` must return 0.
4. **Do not change the design system.** Colors, typography, spacing — touch nothing in
   `_tokens.css` or `_components.css` unless a fix explicitly requires it.
5. **Do not add new pages.** Fix what exists.
6. **Do not add placeholder "coming soon" messages** except where explicitly noted above.
7. **After completing all fixes**, open `index.html` mentally and walk through the full
   demo path: Dashboard → Employees (check John's amber bar) → Timesheets → Approvals →
   HR (click a candidate) → Clients (confirm no Contoso) → Portal (navigate tabs).
   Every step must work.

## Completion Checklist

- [ ] John Smith shows 112.5% with amber overflow bar
- [ ] Marco Rossi shows 107.5% with amber overflow bar
- [ ] `grep -r "Contoso" prototype/` → 0 results
- [ ] `grep -r "James Wilson" prototype/` → 0 results
- [ ] Dashboard KPI: "Team Work Time 82%", Active Employees sums to 12
- [ ] INV-2026-041 is €9,800 on both invoices.html and portal/index.html
- [ ] Alice Wang leave is Apr 14–18 on all pages including approvals.html
- [ ] David Park hovercard shows 85%
- [ ] hr.html candidate click opens a slide panel, not a toast
- [ ] hr.html candidate count header matches rendered card count
- [ ] "Create Project" appends a new project to the list
- [ ] "Generate Invoice" appends a new invoice row
- [ ] Portal tabs navigate between sections
- [ ] Gantt: at least one filter chip works; zoom has two functional levels
