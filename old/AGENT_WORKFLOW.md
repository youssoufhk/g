# GammaHR v2 — Agent Orchestration Meta-Prompt

> This file is the **master orchestration guide** for building GammaHR with Claude Code agents.
> It captures the full three-phase model plus the exact patterns that produced the best results on this project.
> Anyone (human or agent) reading this file should be able to run the entire project correctly from scratch.

---

## The Three-Phase Model

```
╔══════════════════════════════════════════════════════════════╗
║  PHASE 0: PROTOTYPE (HTML/CSS/JS)                            ║
║  Purpose: Validate every UX decision before writing          ║
║  production code. Stakeholder approval on real screens.      ║
║  Output: /prototype/ directory, FINAL_CHECKLIST.md           ║
╠══════════════════════════════════════════════════════════════╣
║  PHASE 1: DESIGN & SPECIFICATION (80% of total effort)       ║
║  Purpose: Lock every architectural decision in writing.      ║
║  Code review passes for any code that contradicts the spec.  ║
║  Output: specs/ directory, complete API contract             ║
╠══════════════════════════════════════════════════════════════╣
║  PHASE 2: IMPLEMENTATION (20% of total effort)               ║
║  Purpose: Execute the locked blueprint. Fast because all     ║
║  decisions were made in Phase 0 and Phase 1.                 ║
║  Output: src/backend/ (Rust), src/frontend/ (Next.js)        ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Phase 0: Prototype Orchestration

### Why prototype first

The prototype is not a throwaway — it is the most important artifact in the project. It:
- Catches UX dead-ends before they are coded in React
- Forces every feature to be visualized before it is specified
- Lets the product owner review the full product in a browser, not in a doc
- Produces the canonical data set that seeds the real database
- Locks the design token set so Next.js can import identical values

### Phase 0 execution model

```
Step 1 — Foundation (CSS + shared JS first, always)
  One agent writes: _tokens.css, _layout.css, _components.css, _shared.js
  No other agents start until this is done.

Step 2 — Parallel page build (non-overlapping file groups)
  Split all HTML files into groups with zero overlap.
  Each agent owns its files exclusively — never share a file between agents.
  All groups run in parallel.

Step 3 — Multi-domain critic audit
  9 specialized critics run in parallel, each reading ALL prototype files
  from a single expert perspective. They produce CRITIC_*.md files.

Step 4 — Master checklist consolidation
  One agent reads all CRITIC_*.md files, deduplicates, prioritizes,
  produces MASTER_CHECKLIST.md (CRITICAL > HIGH > MEDIUM > LOW).

Step 5 — Remediation waves
  Wave 1: Fix all CRITICAL items (parallel agents by file group)
  Wave 2: Fix all HIGH items (parallel agents by file group)
  Wave 3: Fix MEDIUM + LOW (parallel agents by file group)

Step 6 — Final audit + cleanup
  One agent reads all CRITIC_*.md files, verifies all items addressed,
  deletes audit files, writes FINAL_CHECKLIST.md with grouped ✅ items.
```

---

## The Golden Rules of Parallel Agent Orchestration

These rules were learned from running 30+ parallel agents on this project. Violating them causes silent file corruption, conflicting edits, or wasted work.

### Rule 1: Strict file ownership — one file, one agent, always

Every file is owned by exactly one agent at a time. Before dispatching agents, list every file and assign it. If two agents need the same file, split them into sequential waves, not parallel.

```
WRONG:
  Agent A: index.html, admin.html
  Agent B: index.html, employees.html   ← CONFLICT: index.html in both

CORRECT:
  Agent A: index.html, admin.html
  Agent B: employees.html, clients.html
```

### Rule 2: Foundation before features

CSS/shared JS files must be complete before any page agent starts. CSS changes affect every page; if an agent builds a page while the CSS is still being written, the page will be wrong.

```
Wave 1 (alone): _tokens.css, _layout.css, _components.css, _shared.js
Wave 2 (parallel): all HTML page files
```

### Rule 3: Canonical data contract defined before any agent writes data

Before dispatching ANY agent that touches data, define the canonical dataset in the prompt. Every agent gets the same table. No exceptions.

```markdown
## CANONICAL DATA (copy this into every agent prompt that touches HTML)

EMPLOYEES:
- Sarah Chen | 87% | Design Lead | Design dept
- John Smith | 82% | Senior Developer | Engineering dept
- Alice Wang | 75% | On Leave Apr 14-18 | Engineering dept
- Carol Kim | 78% | HR Manager | HR dept
- David Park | 65% | Finance Lead | Finance dept
- Marco Rossi | 88% | Operations Lead | Operations dept
- Emma Laurent | 78% | HR Specialist | HR dept
- Bob Taylor | 72% | Senior Developer | Engineering dept

KPIs: 12 employees · 394h/week · 7 open projects · 82% work time
INV-2026-041 → Acme Corp
Bob Taylor hotel expense (€340) → Bob Taylor only
```

### Rule 4: Read before every edit

Every agent prompt must explicitly say: "Read the file fully before editing." Agents that edit without reading produce broken HTML (unclosed tags, wrong context, duplicate sections).

### Rule 5: The prompt structure that works

Every well-performing agent prompt follows this exact structure:

```markdown
## CONTEXT
[What this agent is doing and why]

## FILES — STRICT ASSIGNMENT
Only touch these files: [list]. Do not touch any other file.

## CANONICAL DATA
[The data table — same for every agent]

## SHARED UTILITIES API
[If _shared.js exists: describe its API so agents know what's available]
Include <script src="_shared.js"></script> before </body> in all files.
Call in DOMContentLoaded: GHR.initHoverCard(); GHR.initPresence(); etc.

## CROSS-CUTTING (apply to every file in this assignment)
[Things that go on every page: breadcrumbs, Ask AI nav item, etc.]

## [FILE 1.html] — SPECIFIC BUILDS
[Numbered list of exactly what to build, with code examples for complex items]

## [FILE 2.html] — SPECIFIC BUILDS
[Same pattern]

## QUALITY CHECK
After editing, read back modified sections to verify HTML is valid.
Report every item completed and every item skipped (with reason).
```

### Rule 6: Self-contained prompts — no inter-agent dependencies

Agents run in parallel and cannot communicate. If Agent B needs something from Agent A, either:
- Make A sequential before B (add to an earlier wave), OR
- Include A's output directly in B's prompt (copy the relevant parts)

Never write "see Agent A's output" in a prompt — Agent B has no access to it.

### Rule 7: Critics must be brutal

The value of a critic agent is proportional to how harsh it is. A critic that writes "looks great overall with a few minor issues" has failed. Brief the critic to assume everything is broken and prove it isn't.

```
BAD critic briefing: "Review the prototype and note any issues you find."

GOOD critic briefing:
"You are a [ROLE] who has seen dozens of failed SaaS products. You are
reviewing this prototype with extreme skepticism. Your job is to find every
single thing that would embarrass us in a live demo, confuse a user, or
contradict a spec. Do not mention anything positive. Every issue gets:
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- File + location
- Exact description of the problem
- Why it matters
Be exhaustive. A short list means you didn't look hard enough."
```

### Rule 8: Grouped checklist, not per-page checklist

When consolidating issues into a master checklist or final checklist, group by domain and pattern — not by page. "Employee names link to directory root instead of profile" is ONE item covering all pages, not 12 items (one per page). This keeps the list actionable and prevents duplication fatigue.

---

## Phase 0: Critic Agent Roster

Run all 9 critics in parallel. Each reads ALL prototype files but through one expert lens.

| Agent | Domain | Tag | Focus |
|-------|--------|-----|-------|
| Critic — Data Integrity | Data | [DATA] | Numbers that contradict, names that differ, counts that don't reconcile, dates that conflict |
| Critic — UX Flows | User Flows | [UX-FLOW] | Dead ends, missing confirmation states, flows that can't complete, missing error paths |
| Critic — UX IA & Nav | Information Architecture | [UX-IA] | Sidebar structure, breadcrumbs, URL patterns, nav consistency across pages, missing links |
| Critic — UX Interaction | Interaction | [UX-INT] | Broken JS, missing handlers, keyboard nav, focus management, modal behaviour, tab state |
| Critic — UI Components | Components | [UI-COMP] | Component classes used incorrectly, variants defined but never used, badge colors wrong |
| Critic — UI Visual | Visual Design | [UI-VIS] | Chart quality, typography hierarchy, spacing issues, color usage errors, missing labels |
| Critic — UI Polish | Polish | [UI-POL] | Missing animations, hover states, glassmorphism absent, skeleton states missing |
| Critic — Product/PM | Product | [PM] | Missing features from spec, self-service gaps, role security, spec §N violations |
| Critic — Mobile | Mobile | [MOB] | Touch targets <44px, overflow issues, no mobile fallbacks, bottom nav gaps |

### Critic prompt template

```markdown
You are a [ROLE] conducting a brutal quality audit of the GammaHR v2 prototype.

Your exclusive focus: [DOMAIN]. Ignore everything outside your domain.

Files to audit (read ALL of them):
[list all HTML files, CSS files, _shared.js]

For every issue you find, output exactly:
- [ ] [SEVERITY] [TAG] Description of the problem — what it is, where it is, why it matters. | affected files

Severity levels:
- CRITICAL: Would destroy a live demo or is completely broken
- HIGH: Significant user experience or spec compliance failure
- MEDIUM: Noticeable quality issue
- LOW: Minor polish or code quality issue

Do not group issues. One bullet = one specific, actionable problem.
Do not mention anything that is working correctly.
Be exhaustive. If you find fewer than 15 issues you are not looking hard enough.
Output ONLY the issue list — no preamble, no summary.
```

---

## Phase 0: Master Checklist Agent

After all 9 critics complete, one consolidation agent produces MASTER_CHECKLIST.md.

```markdown
You are reading 9 critic reports for the GammaHR v2 prototype.

Files to read: [all CRITIC_*.md files]

Your job:
1. Read every issue from every critic file
2. Deduplicate: if 3 critics flag "employee names link to root", that is ONE item
   (note how many critics flagged it — more flags = higher priority)
3. Sort by severity: CRITICAL first, then HIGH, MEDIUM, LOW
4. Within each severity: sort by impact (most pages affected first)
5. For items flagged by multiple critics: add "(flagged by X agents)" note

Output format: MASTER_CHECKLIST.md with:
- Summary table: issues per page, issues per domain
- Top 5 most critical issues in plain language (for the product owner)
- Systemic problems (same issue appearing on 3+ pages)
- Full list: [ ] [SEVERITY] [TAG] [description] | [affected files]

Total item count: typically 150-250 items for a 15-page prototype.
If you have fewer than 100 items, the critics were not harsh enough.
```

---

## Phase 0: Remediation Agent Pattern

When fixing issues in waves, always use this pattern:

```markdown
## Wave [N] Remediation — [CRITICAL/HIGH/MEDIUM/LOW] items

You are fixing [SEVERITY] issues in the GammaHR v2 prototype.

STRICT FILE ASSIGNMENT — only touch these files:
[list]

CANONICAL DATA:
[data table]

SHARED UTILITIES:
_shared.js is already built. Include <script src="_shared.js"></script>
before </body> in all files. Available API:
- GHR.showToast(type, title, message)
- GHR.initHoverCard() — call in DOMContentLoaded
- GHR.initPresence() — call in DOMContentLoaded
- GHR.initRoleSwitcher() — call in DOMContentLoaded
- GHR.initKeyboardShortcuts() — call in DOMContentLoaded
- GHR.initSkeletons() — call in DOMContentLoaded
Employee links need: data-hovercard data-name="" data-role="" data-dept=""
  data-project="" data-worktime="87" data-href="employees.html#profile-slug"

ISSUES TO FIX (from MASTER_CHECKLIST.md — your file group only):
[paste all checklist items for your files]

Read each file fully before editing.
After editing, verify by reading back modified sections.
Report every item: DONE, SKIPPED (reason), or PARTIAL (what remains).
```

---

## Phase 1: Design & Specification Workflow

### Round 1: Draft (Parallel — 5 agents)

```
Batch 1 (no dependencies — run in parallel):
  Agent po  → specs/FEATURES.md + specs/USER_STORIES.md
  Agent sec → specs/SECURITY.md + specs/THREAT_MODEL.md
  Agent be  → specs/API_SPEC.md + specs/DOMAIN_EVENTS.md
  Agent ops → specs/INFRA.md + specs/CI_CD.md
  Agent qa  → specs/TEST_STRATEGY.md

Batch 2 (depends on Batch 1):
  Agent ux  → specs/WIREFRAMES.md + specs/USER_FLOWS.md + specs/INTERACTIONS.md
  Agent fa  → specs/FE_ARCH.md + specs/COMPONENT_TREE.md + specs/STATE_MGMT.md
  Agent rt  → specs/REALTIME.md + specs/WS_PROTOCOL.md

Batch 3 (depends on Batch 2):
  Agent ui  → designs/PALETTE_A.md + PALETTE_B.md + COMPONENT_SPECS.md + MOCKUPS.md
```

### Round 2: Cross-Review Matrix

| Deliverable | Author | Reviewer 1 | Reviewer 2 |
|---|---|---|---|
| FEATURES.md | Product Owner | UX Architect | QA Engineer |
| USER_STORIES.md | Product Owner | Backend Architect | Frontend Architect |
| SECURITY.md | Security Engineer | Backend Architect | DevOps Engineer |
| API_SPEC.md | Backend Architect | Frontend Architect | Security Engineer |
| WIREFRAMES.md | UX Architect | UI Designer | Product Owner |
| USER_FLOWS.md | UX Architect | Frontend Architect | QA Engineer |
| FE_ARCH.md | Frontend Architect | Backend Architect | UI Designer |
| REALTIME.md | Real-time Engineer | Frontend Architect | Security Engineer |
| COMPONENT_SPECS.md | UI Designer | Frontend Developer | UX Architect |

### Review output format

```markdown
## Review: [Deliverable]
Reviewer: [Agent]
Status: APPROVED / NEEDS_CHANGES / BLOCKED

### Issues (must fix)
- [ ] [HIGH/MEDIUM/LOW] Description | reason it matters

### Conflicts with my domain
- [Any contradiction with the reviewer's own deliverables]
```

### Round 3: Refinement + Orchestrator sign-off

Authors address all HIGH and MEDIUM issues. Orchestrator:
1. Collects all reviews
2. Identifies conflicting feedback (A says X, B says not-X)
3. Logs resolution in `specs/DECISIONS.md`
4. Verifies all HIGH issues resolved
5. Signs off on each deliverable

### Round 4: User Approval Checkpoint

Present to user:
- 3 color palette options → user picks one
- Key screen mockups (Dashboard, Employee Profile, Gantt) → user approves
- Feature P0/P1/P2 priorities → user confirms
- Navigation structure → user approves
- Real-time feature scope → user confirms

### Round 5: Final Lock

All gates must pass before Phase 2:

```
□ All deliverables reviewed by 2+ agents
□ All HIGH issues resolved
□ No unresolved conflicts (all logged in DECISIONS.md)
□ User approved: palette, mockups, priorities, navigation
□ API spec complete — every endpoint documented
□ Data model complete — every entity, every field
□ Proof-of-concept validated:
    □ Rust + Axum + multi-tenant middleware
    □ WebSocket broadcast at 100+ connections
    □ React Three Fiber 3D at 60fps
    □ Virtual Gantt with 500+ rows
    □ Claude API receipt OCR returns structured data
```

---

## Phase 2: Sprint Execution

### Sprint structure (10 sprints)

```
Sprint 1:  Foundation — Rust scaffolding, auth skeleton, Next.js shell, Docker
Sprint 2:  Authentication — JWT, WebAuthn, MFA, auth flows
Sprint 3:  Users & Departments — CRUD, profiles, <EmployeeLink>, hover card
Sprint 4:  Leave Management — types, balances, approval workflow, conflict detection
Sprint 5:  Expenses & AI — OCR pipeline, categorization, approval workflow
Sprint 6:  Timesheets & Projects — week grid, month view, project lifecycle
Sprint 7:  Clients, Invoices & Portal — PDF generation, portal auth
Sprint 8:  Gantt, Calendar & Planning — virtualized chart, drag, forecasting
Sprint 9:  Real-time, Notifications & AI — WebSocket, presence, NL insights
Sprint 10: Polish, 3D & Launch — Three.js, animations, QA, security audit
```

### Sprint agent pattern

```
Each sprint: Backend agent + Frontend agent run in parallel
  BE agent → Rust handlers + migrations + unit tests
  FE agent → React components + page + API integration
  (never share src/ files between BE and FE agent)

After each sprint: QA agent + UI designer agent review
  QA → run test suite, write E2E tests, report bugs
  UI → visual QA against prototype (prototype is the spec)
```

### Sprint gate (must pass before next sprint)

```
□ All planned features implemented
□ Unit tests passing (>90% coverage on new code)
□ Visual QA: implementation matches prototype exactly
□ Security review passed (auth/RBAC sprints)
□ API matches spec (no undocumented deviations)
□ No P0 bugs open
```

---

## Conflict Resolution Protocol

| Conflict Type | Resolution |
|---|---|
| Design vs. Technical | Frontend Architect proposes alternative achieving same feel |
| UX vs. Security | Orchestrator weighs risk; log decision in DECISIONS.md |
| Feature vs. Timeline | Orchestrator proposes P1→P2 demotion or scope reduction |
| Spec Contradiction | Both agents align; update both docs; log in DECISIONS.md |
| Performance vs. Richness | UI provides fallback; Frontend lazy-loads the rich version |

Principle priority order for tie-breaking:
1. Security — never compromise
2. Usability — user experience trumps technical elegance
3. Performance — no jank ships
4. Maintainability — code Claude can modify
5. Aesthetics — premium look matters, but never at cost of 1-4
6. Feature completeness — fewer features done perfectly > many done poorly

---

## Quality Gates Summary

| Gate | When | Key checks |
|---|---|---|
| Gate 0 | Before Phase 0 | MASTER_PLAN approved, design system tokens locked |
| Gate 1 | Before Phase 1 | Prototype fully audited, FINAL_CHECKLIST.md complete, all CRITICAL items resolved |
| Gate 2 | After Round 1 | Every spec file exists and is non-empty |
| Gate 3 | After Rounds 2-3 | All HIGH review issues resolved, no open conflicts |
| Gate 4 | User approval | Palette, mockups, priorities, nav approved |
| Gate 5 | Before Phase 2 | Proof-of-concepts validated, specs frozen |
| Gate 6 | Each sprint | Tests passing, visual QA approved, API matches spec |
| Gate 7 | Launch | E2E tests, perf benchmarks, security audit, i18n complete |

---

## Communication Artifacts (File Map)

```
gammahr_v2/
├── MASTER_PLAN.md              — Vision, tech stack, prototype overview
├── AGENT_TEAM.md               — 12 agent definitions (Phase 0, 1, 2 roles)
├── AGENT_WORKFLOW.md           — This file: orchestration meta-prompt
├── FINAL_CHECKLIST.md          — All prototype issues resolved (✅)
├── prototype/                  — Static HTML/CSS/JS design prototype
│   ├── _tokens.css             — Design tokens (source of truth for Next.js)
│   ├── _components.css         — Component library
│   ├── _layout.css             — App shell layout
│   ├── _shared.js              — Global JS utilities (hover cards, presence, etc.)
│   ├── index.html              — Dashboard
│   ├── employees.html          — Team directory + employee profile
│   ├── gantt.html              — Resource Gantt chart
│   ├── timesheets.html         — Timesheet entry + approval
│   ├── leaves.html             — Leave management
│   ├── expenses.html           — Expense management
│   ├── projects.html           — Project management
│   ├── clients.html            — Client management
│   ├── invoices.html           — Invoice management
│   ├── approvals.html          — Approval hub
│   ├── calendar.html           — Team calendar
│   ├── planning.html           — Resource planning
│   ├── insights.html           — AI insights
│   ├── hr.html                 — HR (recruitment, onboarding, offboarding)
│   ├── admin.html              — Admin settings
│   ├── auth.html               — Authentication + onboarding flows
│   ├── account.html            — Account & settings (personal)
│   └── portal/index.html       — Client portal
├── specs/
│   ├── APP_BLUEPRINT.md        — Feature map (cross-refs prototype pages)
│   ├── DESIGN_SYSTEM.md        — Visual design spec (refs prototype CSS)
│   ├── DATA_ARCHITECTURE.md    — Data models + API + seed data from prototype
│   └── [Phase 1 deliverables added here]
└── src/                        — Phase 2: production code
    ├── backend/                — Rust (Axum) backend
    └── frontend/               — Next.js frontend
```

---

## Change Request Protocol (Phase 2)

```
1. File CR in specs/CHANGES.md:
   ## CR-001: [Title]
   Requested by: [Agent or User]
   Affects: [spec files + prototype pages]
   Reason: [Why needed]
   Impact: [Sprint work affected]
   Severity: CRITICAL / IMPORTANT / MINOR

2. Orchestrator evaluates:
   CRITICAL → stop sprint, fix immediately
   IMPORTANT → address in next sprint
   MINOR → add to backlog

3. Update: spec file + corresponding prototype page + DECISIONS.md
```

---

## Quick-Start: Starting from Scratch

```
1. User reads and approves MASTER_PLAN.md

2. Phase 0 — Prototype:
   a. Agent builds _tokens.css, _layout.css, _components.css, _shared.js
   b. Parallel agents build all HTML pages (split into 5-6 non-overlapping groups)
   c. 9 critic agents run in parallel → CRITIC_*.md files
   d. Consolidation agent → MASTER_CHECKLIST.md
   e. Remediation agents by severity wave (CRITICAL → HIGH → MEDIUM/LOW)
   f. Final audit agent → FINAL_CHECKLIST.md, delete CRITIC_*.md
   g. User reviews prototype in browser → approves design

3. Phase 1 — Specification:
   a. Batch 1: 5 agents in parallel → first-draft specs
   b. Batch 2: 3 agents in parallel → dependent specs
   c. Batch 3: 1 agent → UI mockups + palette options
   d. Cross-review round → all reviews filed
   e. Refinement → all HIGH issues resolved
   f. User approval checkpoint → palette + mockups + priorities
   g. Final lock → proof-of-concepts validated

4. Phase 2 — Build:
   10 sprints, each with parallel BE + FE agents
   QA + UI review after each sprint
   Launch gate after Sprint 10
```
