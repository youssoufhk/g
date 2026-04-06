# GammaHR v2 — Prototype Enhancement Orchestration Prompt

> Feed this file to Claude Code as the starting prompt for a new enhancement cycle.
> It follows the exact agent orchestration model defined in `AGENT_WORKFLOW.md`.
> Run it when the prototype needs to be made more complete, more polished, or richer in features.

---

## Your Role

You are the **Orchestrator** for the GammaHR v2 prototype enhancement cycle.
You coordinate a team of specialized critic and remediation agents to push the prototype to the next level of quality.

The prototype is already complete and has passed a 9-critic audit (213 issues resolved, documented in `FINAL_CHECKLIST.md`). This enhancement cycle must aim **higher** than that baseline — critics must be more demanding than the last round.

---

## What You Must Read First

Before dispatching any agent, read these files yourself so you understand the full context:

1. `specs/APP_BLUEPRINT.md §0` — Architecture overview, page index, file map
2. `specs/APP_BLUEPRINT.md §21` — HR module (was missing from original spec; hr.html must not be skipped)
3. `FINAL_CHECKLIST.md` — Everything already resolved; critics must not re-flag fixed items
4. `prototype/_shared.js` — The GHR utilities API (hover cards, presence, toasts, skeleton, command palette)
5. `prototype/_tokens.css` — Locked color palette (Earth & Sage — do not propose palette changes)
6. `prototype/_components.css` — Full component library
7. `.claude/memory/ux_philosophy.md` — **The UX vision. Read this before dispatching any critic or remediation agent.** Every issue and every fix must be evaluated against the four feelings: Ease, Calm, Completeness, Anticipation.

---

## Canonical Data Contract

**Every agent that touches HTML gets this table. No exceptions.**

```
EMPLOYEES (8 people):
  Sarah Chen      | 87% work time | Project Manager    | Engineering dept   | Online
  John Smith      | 82% work time | Senior Developer   | Engineering dept   | Online
  Marco Rossi     | 88% work time | Operations Lead    | Operations dept    | Away
  Carol Williams  | 90% work time | Design Lead        | Design dept        | Online
  Alice Wang      | 45% work time | On Leave Apr 14-18 | Engineering dept   | On Leave
  David Park      | 45% work time | Finance Lead       | Finance dept       | Offline
  Emma Laurent    | 78% work time | HR Specialist      | HR dept            | Online
  Bob Taylor      |  0% work time | Bench              | Engineering dept   | Offline

KPI CONSTANTS:
  Active employees:   12
  Hours this week:    394h
  Open projects:      7
  Team work time:     82%
  Monthly capacity:   2,076h (12 × 173h)

CLIENTS (4):  Acme Corp | Globex Corp | Initech | Umbrella Corp
PROJECTS (7): 7 active projects spread across the 4 clients

FINANCIAL:
  INV-2026-041 → Acme Corp (not split across clients)
  Bob Taylor hotel expense (€340, Marriott Lyon) → Bob Taylor only
  Portal outstanding invoices: €17,400 (INV-2026-048 €12,400 + INV-2026-043 €5,000)

ADMIN COUNTS:
  6 departments, headcounts sum to 12 employees
  Admin user table: 12 users total

ALICE WANG: On Leave Apr 14–18 (canonical); presence shows "On Leave", not "Away"
BOB TAYLOR: Bench status = offline/away presence, zero project work
EMMA LAURENT: Status = Active in admin.html
```

---

## _shared.js API Contract

**Every agent that modifies HTML must know this API:**

```javascript
// Include before </body> on every page:
<script src="_shared.js"></script>

// Call in DOMContentLoaded on every page:
GHR.initHoverCard();         // Enables employee hover mini-profile cards
GHR.initPresence();          // Simulates real-time presence dots on avatars
GHR.initRoleSwitcher();      // Admin / PM / Employee role toggle in sidebar
GHR.initKeyboardShortcuts(); // G+key nav, Cmd+K palette, ? overlay, Esc
GHR.initSkeletons();         // Skeleton loading shimmer on page load

// Programmatic API:
GHR.showToast(type, title, message)
  // type: 'success' | 'error' | 'warning' | 'info'
  // Example: GHR.showToast('success', 'Saved', 'Changes have been saved.')

// Employee hover card data attributes (on any clickable employee name/avatar):
data-hovercard
data-name="Sarah Chen"
data-role="Project Manager"
data-dept="Engineering"
data-project="Acme Web Redesign"
data-worktime="87"
data-href="employees.html#sarah-chen"
```

---

## Prototype File Inventory

```
prototype/
├── _tokens.css         ← Design tokens (DO NOT change color palette)
├── _components.css     ← Component library
├── _layout.css         ← App shell, sidebar, topbar, mobile nav
├── _shared.js          ← Shared JS utilities (GHR namespace)
├── index.html          ← Dashboard
├── employees.html      ← Team Directory + Employee Profile
├── timesheets.html     ← Timesheet Management
├── leaves.html         ← Leave Management
├── expenses.html       ← Expense Management
├── projects.html       ← Projects + Project Detail
├── clients.html        ← Clients + Client Detail
├── invoices.html       ← Invoices
├── calendar.html       ← Calendar (day/week/month/quarter/year)
├── gantt.html          ← Resource Gantt Chart
├── planning.html       ← Resource Planning & Forecasting
├── approvals.html      ← Approvals Hub
├── insights.html       ← AI Insights & Analytics
├── hr.html             ← HR Module (recruitment, onboarding, offboarding, records)
├── admin.html          ← Administration
├── account.html        ← Account & Settings
├── auth.html           ← Authentication (login, register, MFA)
└── portal/
    ├── index.html      ← Client Portal
    └── auth.html       ← Client Portal Auth
```

---

## Enhancement Areas (Brief All Critics On These)

The previous audit cycle found and fixed bugs. This cycle targets **elevation** — making an already-working prototype feel premium, complete, and impressive. Critics must evaluate against these dimensions.

### E0 — The UX Philosophy (Overrides Everything Else)

> Read `.claude/memory/ux_philosophy.md` in full before evaluating anything else.

The product vision: **GammaHR should feel like Revolut built an HR tool.** The enemy is Tempolia — manual, draining, punishing. The four feelings to engineer are Ease, Calm, Completeness, and Anticipation.

**The single most important test for any page:**
> "Would an employee dread doing this task weekly, or would they look forward to an app that does it for them?"

Any flow that fails this test is CRITICAL regardless of what other critics say about it. A timesheet that works but feels like Tempolia is broken. Features serve feeling — not the other way around.

### E1 — Feature Completeness vs. APP_BLUEPRINT.md
Every section of `specs/APP_BLUEPRINT.md` (§1–§21) maps to a prototype page. Are all features from the spec visible in the prototype? Anything in the blueprint but missing from the HTML is a gap.

### E2 — Data Richness & Visual Density
Premium SaaS tools (Linear, Stripe, Vercel) show real numbers everywhere. Audit: are KPI cards showing meaningful trends? Do tables have enough rows to feel like real data? Are charts populated with realistic data? Are sparklines or mini-trend lines present where the blueprint specifies them?

### E3 — Micro-interactions & Animation
The design system specifies a full animation catalog (`specs/DESIGN_SYSTEM.md §8`). Audit: are transitions present on card hover? Do modals animate in/out (scale + fade)? Are buttons loading states implemented? Is the skeleton shimmer running on initial load? Are counters animated?

### E4 — 3D Depth & Premium Effects
`specs/DESIGN_SYSTEM.md §7` specifies 3D CSS depth on stat cards (perspective + rotateX/Y on hover), glassmorphism on the app header and modals, and parallax depth. Audit: which pages are missing these effects? Are stat cards flat when they should have 3D hover?

### E5 — Mobile Experience (320px → 768px)
Every page must work flawlessly at 320px, 390px (iPhone 14), and 768px (tablet). The pattern is `md:hidden` stat-card grid + `hidden md:block` data table. Audit: are there overflow issues? Are touch targets ≥44px? Is the bottom mobile nav bar present and correct on all pages? Are forms usable on mobile?

### E6 — Role-Based View Correctness
The role switcher (Admin / PM / Employee) is in every sidebar. When role is switched, certain elements should show/hide. Audit: are admin-only actions correctly gated? Does an Employee see only their own data? Does a PM see team data but not admin config?

### E7 — Empty States
Every list, table, and tab needs an empty state. When filters return no results, when a module has no data yet — the empty state should have an explanation, a primary CTA, and ideally a 3D illustration placeholder. Audit for missing empty states.

### E8 — Interaction Completeness
Every button, link, form, and modal in the prototype must have a working interaction — even if simulated. Audit: are there dead buttons? Forms that submit but nothing happens? Modals with no close handler? Dropdowns that don't open?

### E9 — Typography & Spacing Consistency
The design system defines a strict type scale and 4px base spacing grid. Audit: are there places where font sizes are hardcoded instead of using CSS variables? Are there spacing values that break the 4px grid? Inconsistent heading hierarchy?

### E10 — Cross-Page Data Consistency
The same entity (employee, project, invoice, client) appears on multiple pages. Audit: does Sarah Chen show as 87% work time everywhere she appears? Does INV-2026-041 always link to Acme Corp? Are project names and statuses identical across dashboard, projects, gantt, and planning?

---

## Execution Plan

Run this cycle in 4 sequential waves. Within each wave, all agents run in parallel.

---

### Wave 1 — Critic Audit (run all 11 critics in parallel)

Dispatch 10 critic agents simultaneously. Each reads ALL prototype files but through one expert lens. Output: individual `CRITIC_[TAG].md` files.

**Critic 1 — Feature Completeness [FEAT]**
> You are a Product Manager who has memorized `specs/APP_BLUEPRINT.md` in its entirety (§0–§21). You are auditing the prototype to find every feature described in the spec that is missing, incomplete, or incorrectly implemented in the HTML. You do not care about visuals — only whether the feature EXISTS and WORKS as specified. Focus heavily on §21 (HR module — hr.html) which was added late and may have gaps.
>
> For every issue: severity (CRITICAL/HIGH/MEDIUM/LOW), file, section reference from APP_BLUEPRINT.md, exact gap.
> Output ONLY the issue list. No preamble. No positives. Minimum 20 issues.

**Critic 2 — Data Integrity [DATA]**
> You are a data analyst with OCD about consistency. You are auditing the GammaHR prototype for any number, name, date, count, or relationship that contradicts another occurrence of the same data. You have the canonical data contract (above) memorized. Any deviation from it is a bug.
>
> Check: employee names/roles/percentages, department headcounts, invoice numbers and amounts, project counts per client, KPI values, leave dates, financial totals. Cross-reference every page against every other page.
> Output ONLY the issue list. Minimum 15 issues.

**Critic 3 — Micro-interactions & Animation [ANIM]**
> You are a motion designer who has read `specs/DESIGN_SYSTEM.md §8` (Animation Catalog). Every animation in that catalog must exist in the prototype. You are checking whether transitions are implemented, whether they use the correct timing tokens, whether reduced-motion is respected, and whether any interactive element is missing a visual feedback state.
>
> Check: card hover lifts, button press scale, modal enter/exit, toast slide-in, skeleton shimmer, 3D perspective on stat cards, sidebar expand, counter animations, chart draw-in. Flag every missing animation.
> Output ONLY the issue list. Minimum 15 issues.

**Critic 4 — Visual Design & Polish [VIS]**
> You are a senior UI designer from a Linear/Stripe caliber studio. You are reviewing whether the prototype looks like a €50/user/month premium B2B product. You are brutal about: inconsistent type hierarchy, wrong color usage (check the semantic color table in DESIGN_SYSTEM.md §2.4), missing glassmorphism where spec says it should be, card variants used incorrectly, badge colors that don't match their semantic meaning, chart quality, avatar rendering.
>
> Output ONLY the issue list. Minimum 20 issues.

**Critic 5 — Mobile & Responsive [MOB]**
> You are a mobile QA engineer. You are checking every prototype page at three breakpoints: 320px (small Android), 390px (iPhone 14), 768px (tablet/iPad). You look for: horizontal overflow, touch targets smaller than 44px, text truncation that cuts off meaning, missing bottom nav bar, tables that don't collapse to cards, forms that are unusable on small screens, fixed widths that break layout, modals that overflow the viewport, filter toolbars that stack incorrectly.
>
> Check every single HTML file. Output ONLY the issue list. Minimum 20 issues.

**Critic 6 — Interaction Completeness [INT]**
> You are a QA engineer who clicks every interactive element in the prototype. Any button, link, tab, modal trigger, dropdown, form, or action that does not have a working JavaScript handler (even a simulated one) is broken. You also check: do modals have close buttons? Do forms have submit handlers that show toasts or feedback? Do tabs switch content? Do filters update the visible list?
>
> Check every single HTML file. Output ONLY the issue list. Minimum 20 issues.

**Critic 7 — Role-Based Access [RBAC]**
> You are a security-minded product manager. The role switcher (Admin/PM/Employee) in the sidebar should control what is visible on each page. You are checking: are admin-only actions (invite user, delete, configure) hidden when role is Employee? Does an Employee see only their own timesheets, leaves, and expenses — not the full team view? Does a PM see team data but not system administration? Are role-gated items actually using the CSS class `role-admin`, `role-pm`, `role-employee` and are those classes being toggled by the role switcher?
>
> Output ONLY the issue list. Minimum 10 issues.

**Critic 8 — Empty States & Edge Cases [EDGE]**
> You are a UX designer who thinks about what happens when there is no data. Every list, table, kanban board, and tab panel needs an empty state. You are checking: is there an empty state when search/filter returns nothing? Is there an empty state for a new company with zero employees? Do empty states have a clear explanation, a primary CTA to create the first item, and a helpful illustration or icon? Are loading/skeleton states defined for every data-heavy section?
>
> Output ONLY the issue list. Minimum 15 issues.

**Critic 9 — Typography & Spacing [TYPO]**
> You are a design systems engineer. You are checking that every font size, font weight, line height, and spacing value in the HTML uses a CSS variable from `_tokens.css` rather than a hardcoded pixel value. You also check: is the type hierarchy correct (heading-1 → heading-2 → heading-3 → body → caption)? Are there places where text is too small, too large, or the wrong weight for its context? Are spacing values consistent (multiples of 4px)?
>
> Output ONLY the issue list. Minimum 15 issues.

**Critic 10 — Data Richness & Density [RICH]**
> You are a product designer who has studied Bloomberg Terminal, Linear, and Stripe Dashboard. Premium tools show real numbers, trends, and sparklines everywhere. You are checking: are KPI stat cards showing trend arrows and comparison values? Do tables feel sparse or rich? Are charts visually impressive or placeholder-level? Are there sections that should have mini-charts or sparklines but show raw text instead? Are AI insight sections rich and believable?
>
> Output ONLY the issue list. Minimum 15 issues.

**Critic 11 — UX Feeling & Anti-Tempolia Audit [FEEL]**
> You are a UX experience director who has deeply studied two reference products: **Revolut** (the gold standard — does more than competitors, feels simpler than all of them, daily use is invisible friction) and **Tempolia HR** (the anti-reference — manual, draining, every action costs energy instead of saving it).
>
> Your sole job is to audit whether GammaHR feels like Revolut or like Tempolia. You do not care about bugs, missing features, or visual polish — other critics handle those. You care exclusively about **feeling**.
>
> For every page, ask these four questions and flag every failure:
>
> **1. EASE — Does the app do the work, or does it make the user do the work?**
> Flag any form field the app could have pre-filled but didn't. Flag any information the user has to type that the app already knows. Flag any action that requires more steps than necessary. Flag any flow where the user has to make a decision the app could have made for them. The standard: timesheets and expenses should feel like reviewing and confirming, not creating from scratch.
>
> **2. CALM — Does any element create anxiety, confusion, or overwhelm?**
> Flag information overload — too many things competing for attention with no clear hierarchy. Flag any state where the user might not know where they are, what just happened, or what to do next. Flag any error message that doesn't explain what to do. Flag any destructive action without clear confirmation. Flag visual noise — competing colors, unclear badges, cluttered layouts.
>
> **3. COMPLETENESS — Does the AI/system demonstrate that it knows the user?**
> Flag any place where the app could show a personalized suggestion, smart default, or learned pattern but shows a blank field instead. Flag any place where the app asks for information it already has. Flag any section labeled "AI-powered" or "Smart" that shows generic content rather than personalized content. The standard: after 1 month of use, the app should feel like a personal assistant, not a form.
>
> **4. ANTICIPATION — Would a user want to come back, or dread it?**
> Flag any completion state (after submitting a timesheet, approving a request, generating an invoice) that feels flat, empty, or unsatisfying. Flag any missing positive feedback moment — places where a small animation, a "all done" message, or a visible progress state would create a sense of accomplishment. Flag any page where the primary value of the app is not immediately obvious to a new user.
>
> **The Anti-Tempolia Test (most important):**
> For every single flow in the app — timesheets, expenses, leave requests, project assignments, employee onboarding, invoice generation, approval queues, HR recruitment, resource planning, calendar events, account settings, everything — ask: "Is there ANYTHING here that feels like manual work the app should have done?" If yes, flag it CRITICAL. No module is exempt.
>
> Severity guide:
> - CRITICAL: This flow feels like Tempolia. A user would dread doing this repeatedly.
> - HIGH: This interaction adds friction or cognitive load that should not exist.
> - MEDIUM: This moment is neutral when it should be positive.
> - LOW: A small delight opportunity is being missed.
>
> Output ONLY the issue list. No positives. Minimum 20 issues — if you find fewer, you are not being honest about how much friction still exists.

---

### Wave 2 — Master Checklist Consolidation (1 agent, runs after all critics complete)

**Instructions for the consolidation agent:**

Read all 11 `CRITIC_[TAG].md` files produced in Wave 1.

1. Deduplicate: if multiple critics flag the same issue, it becomes ONE item (note how many critics flagged it — more flags = higher priority)
2. Sort strictly: CRITICAL → HIGH → MEDIUM → LOW
3. Within each level: **[FEEL] issues from the UX Feeling critic take priority over all other tags at the same severity level** — these are product-defining, not just quality issues
4. Within each level after FEEL: most pages affected first
5. Flag systemic issues (same pattern across 3+ pages) as a single item with a note

Output: `ENHANCE_CHECKLIST.md` with:
- **Summary table:** issue count per page, issue count per domain
- **Top 10 highest-impact items** in plain language (for the product owner) — lead with any FEEL/CRITICAL items
- **The Anti-Tempolia List:** all [FEEL] CRITICAL items isolated in their own section — these must be fixed before anything else
- **Systemic patterns** (cross-page issues — fix once in shared CSS/JS, propagate everywhere)
- **Full sorted list:** `[ ] [SEVERITY] [TAG] [description] | [files affected]`

Target: 150–250 items total. Fewer than 100 means critics were not harsh enough.

---

### Wave 3 — Remediation (parallel agents by file group)

After `ENHANCE_CHECKLIST.md` exists, split all files into groups with **zero file overlap** and dispatch remediation agents in parallel. Suggested grouping:

**Group A — Core CSS & JS (run first, alone — everything depends on this)**
Files: `_tokens.css`, `_components.css`, `_layout.css`, `_shared.js`
Fix: systemic CSS/JS issues, missing animation classes, missing component variants, mobile breakpoint fixes that affect all pages.

**Group B — Dashboard & Auth**
Files: `index.html`, `auth.html`

**Group C — People**
Files: `employees.html`, `hr.html`

**Group D — Work Tracking**
Files: `timesheets.html`, `leaves.html`, `expenses.html`

**Group E — Projects & Clients**
Files: `projects.html`, `clients.html`, `invoices.html`

**Group F — Planning & Visualization**
Files: `gantt.html`, `planning.html`, `calendar.html`, `insights.html`

**Group G — Operations & Admin**
Files: `approvals.html`, `admin.html`, `account.html`

**Group H — Portal**
Files: `portal/index.html`, `portal/auth.html`

**Remediation agent prompt template (copy + customize per group):**

```markdown
## CONTEXT
You are fixing enhancement issues in the GammaHR v2 prototype.
This is Wave 3 remediation. The prototype already works — you are elevating it.

## FILES — STRICT ASSIGNMENT
Only touch these files: [LIST YOUR GROUP FILES]
Do not touch any other file.

## CANONICAL DATA
[paste the canonical data contract from above — same for every agent]

## SHARED UTILITIES API
[paste the _shared.js API block from above — same for every agent]

## CROSS-CUTTING (apply to every file in your assignment)
- Every page must have <script src="_shared.js"></script> before </body>
- Every page must call all 5 GHR.init*() functions in DOMContentLoaded
- Employee names/avatars must have data-hovercard attributes
- Breadcrumb nav must be present below the page header on every page
- Role switcher classes (role-admin, role-pm, role-employee) must gate admin-only elements
- Mobile bottom nav bar must be present and have correct active item

## ISSUES TO FIX
[paste all CRITICAL and HIGH items from ENHANCE_CHECKLIST.md that affect your files]
[paste MEDIUM items that affect your files]
[paste LOW items if time permits]

## QUALITY RULES
- Read each file fully before editing — never edit blind
- Preserve all existing functionality — only add or fix, do not remove working features
- Use CSS variables from _tokens.css — never hardcode colors, font sizes, or spacing
- After editing, re-read the modified sections to verify HTML is valid and tags are closed
- Report every item: DONE ✅ | SKIPPED (reason) | PARTIAL (what remains)
```

---

### Wave 4 — Final Audit & Cleanup (1 agent, runs after all remediation complete)

**Instructions for the final audit agent:**

1. Read `ENHANCE_CHECKLIST.md` — the master list of all issues
2. Read every prototype HTML file and the CSS/JS files
3. For each item in the checklist, verify it has been resolved
4. Write `ENHANCE_FINAL.md` with:
   - All resolved items marked ✅
   - Any unresolved items marked ❌ with reason
   - Any regressions introduced during remediation
   - A final quality verdict: "Ready for stakeholder review" or "Needs another pass"
5. Delete all `CRITIC_[TAG].md` files (they are superseded by the final report)
6. Do NOT delete `ENHANCE_CHECKLIST.md` or `ENHANCE_FINAL.md`

---

## Rules the Orchestrator Must Follow

These are the golden rules from `AGENT_WORKFLOW.md`. Violate any of them and the cycle fails.

1. **One file, one agent.** Before dispatching Wave 3 groups, verify zero file overlap between groups. If a file needs changes from two different domain fixes, assign it to one group and include all its issues in that group's prompt.

2. **CSS/JS first.** Group A (shared CSS and JS) must complete before any HTML agents start Wave 3. Changes to `_components.css` affect every page — if two agents edit it simultaneously, one overwrites the other.

3. **Canonical data in every prompt.** Copy the data contract into every agent prompt that touches HTML. Do not write "refer to the canonical data above" — agents run in isolation and cannot see other prompts.

4. **Self-contained prompts.** Each agent prompt must contain everything it needs. No "see Wave 1 output" — include the relevant checklist items directly in the prompt.

5. **Critics must be brutal.** If a critic returns fewer than 15 issues, assume it was not harsh enough and ask it to re-audit more aggressively.

6. **Do not re-fix items in FINAL_CHECKLIST.md.** Those 213 items are resolved. Critics must be briefed to skip anything that matches the final checklist — focus on NEW gaps and elevation, not old bugs.

7. **Prototype wins over spec when they conflict.** `specs/DESIGN_SYSTEM.md §1.5` establishes this: if the prototype and a spec document contradict, the prototype is the approved visual target. Update the spec, not the prototype.

---

## What "Done" Looks Like

The enhancement cycle is complete when:

- [ ] `ENHANCE_FINAL.md` exists and says "Ready for stakeholder review"
- [ ] All CRITICAL and HIGH items from `ENHANCE_CHECKLIST.md` are resolved ✅
- [ ] The Anti-Tempolia List is fully cleared — zero [FEEL] CRITICAL items remain
- [ ] Every prototype page passes a visual check at 390px and 1440px
- [ ] Every interactive element on every page has a working handler
- [ ] All 10 canonical data points are consistent across all pages
- [ ] The prototype feels like a €50/user/month premium product in a live browser demo
- [ ] Every data entry flow across all modules (timesheets, expenses, leaves, projects, onboarding, invoices, approvals — everything) feels like reviewing and confirming, not manual data entry
- [ ] Every completion state (submit timesheet, approve request, generate invoice) has a satisfying, positive response
- [ ] A first-time user opening any page can immediately see what the page does and what action to take next
