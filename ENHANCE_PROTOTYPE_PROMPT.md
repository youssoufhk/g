# GammaHR v2 — Prototype Enhancement Orchestration Prompt

> Feed this file to Claude Code as the starting prompt for a new enhancement cycle.
> Run it when the prototype needs to be made more complete, more polished, or richer in features.

---

## Your Role

You are the **Orchestrator** for the GammaHR v2 prototype enhancement cycle.
You coordinate a team of specialized critic and remediation agents to push the prototype to the next level of quality.

The prototype has already passed multiple audit cycles. This enhancement cycle must aim **higher** — critics must be more demanding than previous rounds.

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
EMPLOYEES (8 named people, 12 total in company):
  Sarah Chen      | 87% work time | Project Manager    | Engineering dept   | Online
  John Smith      | 82% work time | Senior Developer   | Engineering dept   | Online
  Marco Rossi     | 88% work time | Operations Lead    | Operations dept    | Away
  Carol Williams  | 90% work time | Design Lead        | Design dept        | Online
  Alice Wang      | 45% work time | On Leave Apr 14-18 | Engineering dept   | On Leave
  David Park      | 45% work time | Finance Lead       | Finance dept       | Offline
  Emma Laurent    | 78% work time | HR Specialist      | HR dept            | Online
  Bob Taylor      |  0% work time | Backend Developer  | Engineering dept   | Offline (Bench)

Other employees (Liam O'Brien, Sophie Dubois, Lisa Martinez, etc.) must have CONSISTENT
roles and departments across ALL pages they appear on. If an employee appears on 5 pages
with 3 different roles, that is a CRITICAL bug.

KPI CONSTANTS:
  Active employees:   12
  Hours this week:    394h
  Open projects:      7
  Team work time:     82%
  Monthly capacity:   2,076h (12 × 173h)

CLIENTS (4):  Acme Corp | Globex Corp | Initech | Umbrella Corp
  - "Globex Corp" NOT "Globex Corporation"
  - If "Contoso" appears anywhere, use ONE consistent name
  - All 4 canonical clients must appear on clients.html

PROJECTS (7): 7 active projects spread across the 4 clients

FINANCIAL:
  INV-2026-041 → Acme Corp (NOT Globex, NOT split across clients)
  Invoice number format: 3-digit suffix (INV-2026-041, NOT INV-2026-0041)
  Bob Taylor hotel expense (€340, Marriott Lyon) → Bob Taylor only
  Portal outstanding invoices: €17,400 (INV-2026-048 €12,400 + INV-2026-043 €5,000)

ADMIN COUNTS:
  6 departments (NOT 5), headcounts sum to 12 employees
  Admin user table: 12 users total

ALICE WANG: On Leave Apr 14–18 (canonical); presence shows "On Leave", not "Away"
  - NO "Apr 1-11" or "Apr 7-11" anywhere — those are stale dates
BOB TAYLOR: Backend Developer (NOT "Senior Developer"), bench = offline/away, zero project work
EMMA LAURENT: Status = Active in admin.html; vacation = Apr 14-18 if shown
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

// Notifications are CENTRALIZED — do NOT hand-code notification HTML in pages.
// Just include <div id="notifPanel"></div> in the notification dropdown.
// GHR.renderNotifications() handles the content automatically.

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

## What Critics Must Focus On

Critics must find things that are **BROKEN, WRONG, INCONSISTENT, or MISSING**. 

### What to flag
- Dead buttons (no onclick handler)
- Broken navigation (links to nowhere)
- Data inconsistencies (same entity with different values on different pages)
- Missing features from the spec (APP_BLUEPRINT.md says it should exist, HTML doesn't have it)
- Layout problems (overflow, misalignment, elements not fitting the viewport)
- Empty states missing (filter returns nothing, no helpful message shown)
- Role-based access gaps (employee can see admin-only actions)
- Forms that don't work (submit does nothing, no feedback)
- Duplicate content (same setting appearing twice)
- Terminology violations ("utilisation" instead of "Work Time")

### What NOT to flag (save for a future "add all the fun things" batch)
- Missing sparklines or trend charts on stat cards
- Missing staggered animations on card grids
- Missing 3D depth/perspective effects on hover
- Chart draw-in animations not wired up
- Counter digit-roll animations
- Glassmorphism not applied somewhere
- "Would be nice if..." suggestions
- Any cosmetic polish that doesn't fix a real problem

**The rule: if a user wouldn't notice or care about it during a demo, don't flag it.**

---

## Execution Plan

Run this cycle in **3 waves** (NO consolidation step — agents read critic files directly).

---

### Wave 1 — Critic Audit (run in batches of 2-3 to avoid rate limits)

Dispatch critics in batches. Each reads ALL prototype files through one expert lens. Output: individual `CRITIC_[TAG].md` files. **Do NOT delete these files — remediation agents will read them directly.**

Run critics in batches of 2-3 at a time. Wait for each batch to complete before launching the next.

**Critic 1 — Feature Completeness [FEAT]**
> You are a HARSH Product Manager who has memorized `specs/APP_BLUEPRINT.md` (§0–§21). Audit the prototype for every feature that is MISSING, INCOMPLETE, or BROKEN. You do not care about visuals — only whether the feature EXISTS and WORKS. Do NOT suggest cosmetic improvements. Do NOT flag "nice to have" items. Only flag things that are genuinely broken or missing from the spec. Focus heavily on §21 (HR module). Verify all 10 previously-reported issues above.
>
> For every issue: severity (CRITICAL/HIGH/MEDIUM), file, section reference from APP_BLUEPRINT.md, exact gap.
> Output ONLY the issue list. No preamble. No positives. Minimum 20 issues.

**Critic 2 — Data Integrity [DATA]**
> You are a HARSH data analyst. Audit for any number, name, date, count, role, department, or relationship that contradicts the canonical data contract or another occurrence on a different page. Cross-reference EVERY page against EVERY other page. Check secondary employees (Liam, Sophie, Lisa) too — they often have inconsistent data across pages.
>
> Output ONLY the issue list. Minimum 15 issues.

**Critic 3 — Interaction Completeness [INT]**
> You are a HARSH QA engineer who clicks EVERY interactive element. Any button, link, tab, modal trigger, dropdown, form, or action without a working JS handler is BROKEN. Check: modals close correctly, forms submit with feedback, tabs switch content, filters actually filter, action buttons (Edit/Delete/Approve/Reject) work, triple-dot menus open, links navigate. Do NOT flag missing animations or loading states.
>
> Check every single HTML file. Output ONLY the issue list. Minimum 20 issues.

**Critic 4 — Mobile & Responsive [MOB]**
> You are a HARSH mobile QA engineer checking at 320px, 390px, and 768px. Look for: horizontal overflow, touch targets < 44px, tables that don't collapse, forms unusable on mobile, fixed widths breaking layout, modals overflowing, filter bars stacking when they shouldn't, kanban boards overflowing. Check CSS `<style>` blocks in HTML pages — page-level overrides of `_layout.css` rules are a common source of bugs. Do NOT suggest animation improvements.
>
> Check every single HTML file. Output ONLY the issue list. Minimum 15 issues.

**Critic 5 — Role-Based Access [RBAC]**
> You are a HARSH security-minded PM. Check: admin-only actions (invite, delete, configure) gated with `data-min-role="admin"`? Employee sees only own data? PM sees team but not admin config? Financial data cells gated with `data-sensitive`? Keyboard shortcuts blocked for unauthorized pages? Check that the role switcher actually toggles visibility of gated elements.
>
> Output ONLY the issue list. Minimum 10 issues.

**Critic 6 — Empty States & Edge Cases [EDGE]**
> You are a HARSH UX designer checking what happens with no data. Every list, table, tab panel, and kanban board needs an empty state. Check: search returning nothing, new company with zero data, all items approved/cleared from queue, tab selected with no content. Do NOT suggest illustration improvements.
>
> Output ONLY the issue list. Minimum 15 issues.

**Critic 7 — Typography & Spacing [TYPO]**
> You are a HARSH design systems engineer. Check: hardcoded pixel font sizes (should use CSS variables), heading hierarchy violations (h3 styled as h2, h4 skipping h3), inconsistent spacing, page alignment differences between pages, duplicate content sections. Do NOT suggest aesthetic improvements.
>
> Output ONLY the issue list. Minimum 10 issues.

**Critic 8 — UX Feeling & Anti-Tempolia [FEEL]**
> You are a HARSH UX director. For every page and every flow, ask: "Does this feel like manual work the app should have done?" Flag ONLY genuine friction — forms that should be pre-filled, actions that take too many steps, confusing states, missing feedback after completing an action, overwhelming layouts. Do NOT flag cosmetic wishlist items like "add sparklines" or "add animation." Focus on REAL friction a user would feel.
>
> Severity: CRITICAL = feels like Tempolia. HIGH = unnecessary friction. MEDIUM = neutral when should be positive.
> Output ONLY the issue list. Minimum 15 issues.

---

### Wave 2 — Remediation (agents read CRITIC files directly, fix EVERYTHING)

**IMPORTANT: There is NO consolidation step. Remediation agents read the original CRITIC_*.md files directly.**

Split files into groups with **zero file overlap** and dispatch remediation agents in **batches of 2-3** (not all at once — avoid rate limits). Wait for each batch to complete before launching the next.

**Group A — Core CSS & JS (run FIRST, alone — everything depends on it)**
Files: `_tokens.css`, `_components.css`, `_layout.css`, `_shared.js`

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

**Remediation agent prompt template:**

```markdown
## CONTEXT
You are fixing issues in the GammaHR v2 prototype. Fix EVERYTHING — no exceptions, no skipping.

## FILES — STRICT ASSIGNMENT
Only touch these files: [LIST FILES]
Do not touch any other file.

## CANONICAL DATA
[paste the canonical data contract — same for every agent]

## SHARED UTILITIES API
[paste the _shared.js API block — same for every agent]

## ISSUES TO FIX
Read these CRITIC files and fix EVERY issue that affects your assigned files:
[list which CRITIC_*.md files to read]

Extract all issues mentioning your files. Fix ALL of them — CRITICAL, HIGH, and MEDIUM.

## CROSS-CUTTING (apply to every file)
- Every page must have <script src="_shared.js"></script> before </body>
- Every page must call all 5 GHR.init*() functions in DOMContentLoaded
- Employee names/avatars must have data-hovercard attributes
- Notifications must use <div id="notifPanel"></div> (centralized, not hand-coded)
- Role switcher classes must gate admin-only elements
- Mobile bottom nav bar must be present with correct active item
- No page-level CSS that overrides _layout.css filter-bar-standard

## QUALITY RULES
- Read each file FULLY before editing — never edit blind
- Preserve all existing functionality — only add or fix, do not remove working features
- Use CSS variables from _tokens.css — never hardcode colors, font sizes, or spacing
- After editing, verify HTML is valid and tags are closed
- Report EVERY item as DONE. No SKIPPED. If you can't fix something, explain why and propose an alternative.
```

---

### Wave 3 — Final Verification (1 agent, runs after ALL remediation complete)

**Instructions for the final verification agent:**

1. Read ALL `CRITIC_[TAG].md` files — these are the source of truth
2. Read every prototype HTML file and the CSS/JS files
3. For EACH issue in EACH critic file, verify it has been resolved
4. Write `ENHANCE_FINAL.md` with:
   - All resolved items marked DONE
   - Any unresolved items marked REMAINING with reason
   - Any regressions introduced during remediation
   - A final quality verdict: "Ready for stakeholder review" or "Needs another pass"
5. Do NOT delete the `CRITIC_[TAG].md` files — they are the audit trail
6. Verify ALL 10 previously-reported issues are fixed

---

## Rules the Orchestrator Must Follow

1. **One file, one agent.** Zero file overlap between groups. If a file needs changes from two different domains, assign it to one group with all its issues.

2. **CSS/JS first.** Group A must complete before any HTML agents start.

3. **Canonical data in every prompt.** Copy the data contract into every agent prompt. Agents run in isolation.

4. **Self-contained prompts.** Each agent must have everything it needs. Include which CRITIC files to read.

5. **Critics must be harsh but focused.** If a critic returns fewer than 10 issues, re-run it. But critics must NOT flag cosmetic polish items — only real problems.

6. **Do not re-fix items in FINAL_CHECKLIST.md.** Those items are resolved.

7. **No consolidation step.** Remediation agents read CRITIC files directly. The consolidation step loses information and context.

8. **Fix EVERYTHING.** No "SKIPPED" items. No "remaining for next session." Every issue from every critic must be addressed.

9. **Batch agents (2-3 at a time).** Do NOT launch 7+ agents simultaneously — they will hit rate limits and produce zero work. Launch 2-3, wait for completion, launch next batch.

10. **Previously-reported issues are CRITICAL.** The 10 issues listed above have been reported multiple times by the product owner. If any are still broken after remediation, the cycle has failed.

---

## What "Done" Looks Like

The enhancement cycle is complete when:

- [ ] `ENHANCE_FINAL.md` exists and says "Ready for stakeholder review"
- [ ] ALL issues from ALL `CRITIC_[TAG].md` files are resolved
- [ ] ALL 10 previously-reported issues are verified fixed
- [ ] Every interactive element on every page has a working handler
- [ ] All canonical data is consistent across all pages
- [ ] Every page works at 390px and 1440px without overflow
- [ ] Every data entry flow feels like reviewing and confirming, not manual data entry
- [ ] Every completion state has satisfying feedback
- [ ] A first-time user opening any page can immediately see what it does
