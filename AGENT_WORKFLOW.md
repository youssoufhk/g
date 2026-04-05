# GammaHR v2 — Agent Workflow & Communication Protocol

> How the 12 agents collaborate, review each other's work, resolve conflicts, and deliver.

---

## 1. The 80/20 Execution Model

```
╔══════════════════════════════════════════════════════════════╗
║                     PHASE 1: DESIGN (80%)                    ║
║                                                              ║
║  Round 1: Draft                                              ║
║  ├── Each agent produces first draft of their deliverables   ║
║  ├── Orchestrator collects and cross-checks for conflicts    ║
║  └── Duration: ~2 agent cycles                               ║
║                                                              ║
║  Round 2: Cross-Review                                       ║
║  ├── Every deliverable reviewed by 2+ other agents           ║
║  ├── Feedback collected, conflicts identified                ║
║  └── Duration: ~1 agent cycle                                ║
║                                                              ║
║  Round 3: Refinement                                         ║
║  ├── Authors incorporate feedback                            ║
║  ├── Orchestrator verifies consistency                       ║
║  └── Duration: ~1 agent cycle                                ║
║                                                              ║
║  Round 4: User Review                                        ║
║  ├── Consolidated blueprint presented to user                ║
║  ├── User feedback incorporated                              ║
║  ├── Design samples presented for selection (palettes, etc.) ║
║  └── Duration: User-dependent                                ║
║                                                              ║
║  Round 5: Final Lock                                         ║
║  ├── All specs frozen                                        ║
║  ├── Quality gates verified                                  ║
║  ├── Proof-of-concept for risky items                        ║
║  └── Proceed to Phase 2 only when ALL gates pass             ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                   PHASE 2: BUILD (20%)                       ║
║                                                              ║
║  Sprint-based execution with continuous integration          ║
║  ├── Backend + Frontend agents work in parallel              ║
║  ├── QA agent validates continuously                         ║
║  ├── Security agent audits at each milestone                 ║
║  ├── UI Designer does visual QA on every component           ║
║  └── Orchestrator manages dependencies and integration       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 2. Agent Invocation Protocol

### How to Spawn an Agent

Each agent is a Claude Code sub-agent invoked with a structured prompt. The Orchestrator (or the user) spawns agents as needed.

```markdown
## Agent Invocation Template

Agent: [Agent Name]
Role: [Role from AGENT_TEAM.md]
Task: [Specific deliverable to produce]
Context Files:
  - Read: [list of files this agent must read first]
  - Write: [list of files this agent will produce/update]
Dependencies:
  - [List of deliverables from other agents that must exist first]
Quality Criteria:
  - [Specific checklist for this deliverable]
Output Format:
  - [Markdown / Code / JSON / etc.]
```

### Agent Naming Convention

When spawning sub-agents via Claude Code's Agent tool:

| Agent | Name Pattern | Example |
|-------|-------------|---------|
| Product Owner | `po-{task}` | `po-feature-specs` |
| UX Architect | `ux-{task}` | `ux-wireframes-dashboard` |
| UI Designer | `ui-{task}` | `ui-color-palettes` |
| Frontend Architect | `fe-arch-{task}` | `fe-arch-component-tree` |
| Frontend Developer | `fe-dev-{task}` | `fe-dev-design-system` |
| Backend Architect | `be-arch-{task}` | `be-arch-api-spec` |
| Backend Developer | `be-dev-{task}` | `be-dev-auth-service` |
| Security Engineer | `sec-{task}` | `sec-threat-model` |
| Real-time Engineer | `rt-{task}` | `rt-websocket-protocol` |
| QA Engineer | `qa-{task}` | `qa-test-strategy` |
| DevOps Engineer | `devops-{task}` | `devops-docker-setup` |
| Orchestrator | `orch-{task}` | `orch-dependency-check` |

---

## 3. Phase 1 Detailed Workflow

### Round 1: Draft (Parallel Agent Execution)

```
┌─────────────────────────────────────────────────────────────┐
│ BATCH 1 (No dependencies — can run in parallel):            │
│                                                             │
│ ┌─────────────────┐  ┌─────────────────┐                   │
│ │ Product Owner   │  │ Security Eng.   │                   │
│ │                 │  │                 │                   │
│ │ Read:           │  │ Read:           │                   │
│ │ - MASTER_PLAN   │  │ - MASTER_PLAN   │                   │
│ │ - APP_BLUEPRINT │  │ - DATA_ARCH     │                   │
│ │ - v1 codebase   │  │ - v1 auth code  │                   │
│ │                 │  │                 │                   │
│ │ Write:          │  │ Write:          │                   │
│ │ - specs/        │  │ - specs/        │                   │
│ │   FEATURES.md   │  │   SECURITY.md   │                   │
│ │ - specs/        │  │ - specs/        │                   │
│ │   USER_STORIES  │  │   THREAT_MODEL  │                   │
│ │   .md           │  │   .md           │                   │
│ └─────────────────┘  └─────────────────┘                   │
│                                                             │
│ ┌─────────────────┐  ┌─────────────────┐                   │
│ │ Backend Arch.   │  │ DevOps Eng.     │                   │
│ │                 │  │                 │                   │
│ │ Read:           │  │ Read:           │                   │
│ │ - DATA_ARCH     │  │ - MASTER_PLAN   │                   │
│ │ - APP_BLUEPRINT │  │ - DATA_ARCH     │                   │
│ │ - v1 models     │  │ - v1 docker     │                   │
│ │                 │  │                 │                   │
│ │ Write:          │  │ Write:          │                   │
│ │ - specs/        │  │ - specs/        │                   │
│ │   API_SPEC.md   │  │   INFRA.md      │                   │
│ │ - specs/        │  │ - specs/        │                   │
│ │   DOMAIN_EVENTS │  │   CI_CD.md      │                   │
│ │   .md           │  │                 │                   │
│ └─────────────────┘  └─────────────────┘                   │
│                                                             │
│ ┌─────────────────┐                                        │
│ │ QA Engineer     │                                        │
│ │                 │                                        │
│ │ Read:           │                                        │
│ │ - APP_BLUEPRINT │                                        │
│ │ - DATA_ARCH     │                                        │
│ │                 │                                        │
│ │ Write:          │                                        │
│ │ - specs/        │                                        │
│ │   TEST_STRATEGY │                                        │
│ │   .md           │                                        │
│ └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BATCH 2 (Depends on Batch 1 outputs):                       │
│                                                             │
│ ┌─────────────────┐  ┌─────────────────┐                   │
│ │ UX Architect    │  │ Frontend Arch.  │                   │
│ │                 │  │                 │                   │
│ │ Read:           │  │ Read:           │                   │
│ │ - APP_BLUEPRINT │  │ - APP_BLUEPRINT │                   │
│ │ - FEATURES.md   │  │ - API_SPEC.md   │                   │
│ │ - USER_STORIES  │  │ - DESIGN_SYSTEM │                   │
│ │                 │  │                 │                   │
│ │ Write:          │  │ Write:          │                   │
│ │ - specs/        │  │ - specs/        │                   │
│ │   WIREFRAMES.md │  │   FE_ARCH.md    │                   │
│ │ - specs/        │  │ - specs/        │                   │
│ │   USER_FLOWS.md │  │   COMPONENT_    │                   │
│ │ - specs/        │  │   TREE.md       │                   │
│ │   INTERACTIONS  │  │ - specs/        │                   │
│ │   .md           │  │   STATE_MGMT.md │                   │
│ └─────────────────┘  └─────────────────┘                   │
│                                                             │
│ ┌─────────────────┐                                        │
│ │ Real-time Eng.  │                                        │
│ │                 │                                        │
│ │ Read:           │                                        │
│ │ - DATA_ARCH     │                                        │
│ │ - API_SPEC.md   │                                        │
│ │ - SECURITY.md   │                                        │
│ │                 │                                        │
│ │ Write:          │                                        │
│ │ - specs/        │                                        │
│ │   REALTIME.md   │                                        │
│ │ - specs/        │                                        │
│ │   WS_PROTOCOL   │                                        │
│ │   .md           │                                        │
│ └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BATCH 3 (Depends on Batch 2 outputs):                       │
│                                                             │
│ ┌─────────────────┐                                        │
│ │ UI Designer     │                                        │
│ │                 │                                        │
│ │ Read:           │                                        │
│ │ - DESIGN_SYSTEM │                                        │
│ │ - WIREFRAMES.md │                                        │
│ │ - APP_BLUEPRINT │                                        │
│ │ - COMPONENT_    │                                        │
│ │   TREE.md       │                                        │
│ │                 │                                        │
│ │ Write:          │                                        │
│ │ - designs/      │                                        │
│ │   PALETTE_A.md  │                                        │
│ │ - designs/      │                                        │
│ │   PALETTE_B.md  │                                        │
│ │ - designs/      │                                        │
│ │   PALETTE_C.md  │                                        │
│ │ - designs/      │                                        │
│ │   COMPONENT_    │                                        │
│ │   SPECS.md      │                                        │
│ │ - designs/      │                                        │
│ │   MOCKUPS.md    │                                        │
│ └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Round 2: Cross-Review Matrix

Each deliverable gets reviewed by 2 designated agents:

| Deliverable | Author | Reviewer 1 | Reviewer 2 |
|------------|--------|------------|------------|
| `FEATURES.md` | Product Owner | UX Architect | QA Engineer |
| `USER_STORIES.md` | Product Owner | Backend Architect | Frontend Architect |
| `SECURITY.md` | Security Engineer | Backend Architect | DevOps Engineer |
| `THREAT_MODEL.md` | Security Engineer | Backend Architect | QA Engineer |
| `API_SPEC.md` | Backend Architect | Frontend Architect | Security Engineer |
| `DOMAIN_EVENTS.md` | Backend Architect | Real-time Engineer | QA Engineer |
| `INFRA.md` | DevOps Engineer | Security Engineer | Backend Architect |
| `TEST_STRATEGY.md` | QA Engineer | Product Owner | Frontend Architect |
| `WIREFRAMES.md` | UX Architect | UI Designer | Product Owner |
| `USER_FLOWS.md` | UX Architect | Frontend Architect | QA Engineer |
| `INTERACTIONS.md` | UX Architect | Frontend Developer | UI Designer |
| `FE_ARCH.md` | Frontend Architect | Backend Architect | UI Designer |
| `COMPONENT_TREE.md` | Frontend Architect | Frontend Developer | UX Architect |
| `STATE_MGMT.md` | Frontend Architect | Real-time Engineer | Backend Architect |
| `REALTIME.md` | Real-time Engineer | Frontend Architect | Security Engineer |
| `WS_PROTOCOL.md` | Real-time Engineer | Backend Architect | Frontend Architect |
| `PALETTE_*.md` | UI Designer | UX Architect | Product Owner |
| `COMPONENT_SPECS.md` | UI Designer | Frontend Developer | UX Architect |
| `MOCKUPS.md` | UI Designer | UX Architect | Product Owner |

### Review Protocol

Each reviewer provides structured feedback:

```markdown
## Review: [Deliverable Name]
Reviewer: [Agent Name]
Status: APPROVED / NEEDS_CHANGES / BLOCKED

### Strengths
- [What works well]

### Issues (must fix before Phase 2)
- [ ] Issue 1: [description] — Severity: HIGH/MEDIUM/LOW
- [ ] Issue 2: [description]

### Suggestions (nice to have)
- [ ] Suggestion 1: [description]

### Conflicts with my domain
- [Any contradiction with the reviewer's own deliverables]
```

### Round 3: Refinement

Authors address all HIGH and MEDIUM issues. The Orchestrator:
1. Collects all reviews
2. Identifies conflicting feedback (Reviewer A says X, Reviewer B says not-X)
3. Makes a ruling on conflicts (or escalates to user)
4. Verifies all HIGH issues are resolved
5. Signs off on each deliverable

### Round 4: User Review Checkpoint

The user is presented with:

```markdown
## Phase 1 Review Package

### Design Decisions for Your Approval:

1. **Color Palette** — 3 options with sample mockups
   → User picks one (or requests modifications)

2. **Key Screen Mockups** — Dashboard, Employee Profile, Gantt Chart
   → User provides feedback on layout, density, feel

3. **Feature Prioritization** — P0/P1/P2 classification
   → User confirms or reorders

4. **Technical Decisions** — Rust + Axum, schema-per-tenant, Meilisearch
   → User confirms comfort level

5. **Navigation Structure** — Sidebar hierarchy, URL patterns
   → User confirms or adjusts

6. **Real-time Scope** — What gets live updates, what doesn't
   → User confirms expectations

### Questions for User:
- [Any unresolved decisions that need user input]
```

### Round 5: Final Lock

Quality gates that must ALL pass before Phase 2:

```
□ All deliverables reviewed by 2+ agents
□ All HIGH issues resolved
□ No unresolved conflicts between agents
□ User has approved: palette, mockups, feature priorities, navigation
□ API spec is complete (every endpoint documented)
□ Data model is complete (every entity, every field)
□ Wireframes exist for every page
□ Test cases exist for every feature
□ Security threat model covers every endpoint
□ Real-time protocol handles every live update scenario
□ Proof-of-concept validated for:
    □ Multi-tenant schema switching in Rust
    □ WebSocket broadcast with 100+ connections
    □ 3D card component rendering at 60fps
    □ Gantt chart with 500+ virtualized rows
    □ AI receipt OCR pipeline
```

---

## 4. Phase 2 Sprint Workflow

### Sprint Structure

```
Sprint Duration: ~1 agent execution cycle per sprint
Sprint Goal: Deliver a vertical slice (BE + FE + tests for a feature)

Sprint Planning:
  Orchestrator assigns tasks based on:
  1. Dependency order (auth before anything, shell before pages)
  2. Risk reduction (hardest parts first)
  3. Vertical slices (BE + FE for same feature in same sprint)

Sprint Execution:
  ┌────────────────────────────────────┐
  │ Backend Developer                   │
  │ ├── Implements API endpoints        │
  │ ├── Writes unit tests               │
  │ └── Pushes to integration branch    │
  ├────────────────────────────────────┤
  │ Frontend Developer (parallel)       │
  │ ├── Implements UI components        │
  │ ├── Integrates with API             │
  │ └── Pushes to integration branch    │
  ├────────────────────────────────────┤
  │ QA Engineer (as features land)      │
  │ ├── Runs test suite                 │
  │ ├── Writes E2E tests               │
  │ └── Reports bugs                   │
  ├────────────────────────────────────┤
  │ UI Designer (as pages land)         │
  │ ├── Visual QA against specs         │
  │ ├── Reports visual discrepancies    │
  │ └── Approves or requests changes    │
  ├────────────────────────────────────┤
  │ Security Engineer (at milestones)   │
  │ ├── Reviews auth implementation     │
  │ ├── Checks for OWASP issues        │
  │ └── Verifies tenant isolation       │
  └────────────────────────────────────┘

Sprint Review:
  Orchestrator verifies:
  □ All planned features implemented
  □ Tests passing
  □ Visual QA approved
  □ No security issues
  □ API matches spec
```

### Sprint Plan (10 Sprints)

```
Sprint 1: Foundation
├── BE: Project scaffolding, Axum setup, DB migrations, health endpoint
├── BE: Multi-tenant middleware (schema-per-tenant)
├── FE: Next.js setup, Tailwind config, design tokens, app shell
├── FE: Layout (sidebar, header, bottom nav), routing structure
├── DevOps: Docker Compose, Postgres, Redis, Meilisearch setup
└── Gate: App boots, shows empty shell, tenant isolation works

Sprint 2: Authentication
├── BE: User model, login, JWT, refresh tokens, password reset
├── BE: WebAuthn registration + authentication
├── BE: MFA (TOTP) setup + verification
├── FE: Login page (3D logo, email/password, passkey, SSO placeholder)
├── FE: Forgot password, reset password, change password
├── FE: Auth guards, token refresh, session management
├── SEC: Auth review — JWT claims, cookie settings, rate limiting
└── Gate: Full auth flow works, tokens rotate, MFA works

Sprint 3: Users & Departments
├── BE: User CRUD, department CRUD, department managers
├── BE: User invitation + onboarding flow
├── BE: Skills system (CRUD, user-skill associations)
├── FE: Employee directory (grid/list/org-chart views)
├── FE: Employee profile page (ALL tabs: timeline, projects, leaves, etc.)
├── FE: Mini profile hover card
├── FE: <EmployeeLink> universal component
├── FE: Admin user management (list, create, edit, deactivate)
├── FE: Department management
└── Gate: Employee profiles tell a complete story, names clickable everywhere

Sprint 4: Leave Management
├── BE: Leave types, balances, requests, approval workflow
├── BE: Conflict detection (team availability check)
├── BE: Leave balance accrual + carryover logic
├── FE: Leave dashboard (balance cards, request list, mini calendar)
├── FE: Leave request modal (type, dates, working days calc, conflict warning)
├── FE: Leave approval flow (approve/reject with reason)
├── FE: Team leaves view (PM/Admin)
└── Gate: Full leave lifecycle works, conflicts detected, balances accurate

Sprint 5: Expenses & AI
├── BE: Expense types, expenses, approval workflow
├── BE: S3 presigned upload for receipts
├── BE: AI receipt OCR pipeline (Claude Haiku)
├── BE: AI categorization + anomaly detection
├── BE: Duplicate detection
├── FE: Expense dashboard (summary cards, list, analytics tab)
├── FE: Expense form (receipt upload/camera, AI auto-fill, policy checks)
├── FE: Expense approval flow
└── Gate: Receipt OCR works, AI suggestions accurate, policy enforcement works

Sprint 6: Timesheets & Projects
├── BE: Timesheet batches, entries, approval workflow
├── BE: Copy-from-previous logic
├── BE: Project CRUD, assignments, milestones
├── BE: Project budget tracking
├── FE: Timesheet week view (interactive grid, keyboard nav, auto-save)
├── FE: Timesheet month view (heatmap)
├── FE: Project list (board/list/timeline views)
├── FE: Project detail (overview, team, milestones, budget burndown)
├── FE: Project assignment management
└── Gate: Timesheets filled in < 2min, project budget burns down correctly

Sprint 7: Clients, Invoices & Portal
├── BE: Client CRUD, contacts, portal users
├── BE: Invoice generation (timesheets × rates + expenses)
├── BE: PDF generation (Typst)
├── BE: Client portal API (separate auth, read-only + approve)
├── FE: Client list + detail pages
├── FE: Invoice generation wizard
├── FE: Invoice detail + PDF preview
├── FE: Client portal (separate Next.js route group)
└── Gate: Invoices generate correctly, PDF looks premium, portal works

Sprint 8: Gantt, Calendar & Planning
├── BE: Gantt data endpoint (optimized for large datasets)
├── BE: Capacity planning + forecasting endpoints
├── BE: Calendar unified endpoint
├── FE: Resource Gantt chart (virtualized, all filters, saved views)
├── FE: Gantt interactions (drag, click, right-click, zoom)
├── FE: Team calendar (day/week/month/year views)
├── FE: Resource planning dashboard (capacity, bench, forecast)
├── FE: What-if scenario tool
└── Gate: Gantt handles 500+ rows at 60fps, all 10+ filter dimensions work

Sprint 9: Real-time, Notifications & AI Insights
├── BE: WebSocket server (tokio-tungstenite)
├── BE: Presence system (heartbeat, status tracking)
├── BE: Live entity update broadcasting
├── BE: Notification system (in-app + email)
├── BE: AI insights batch jobs (budget forecast, bench alerts, anomalies)
├── FE: WebSocket client (hooks, reconnection, fallback)
├── FE: Presence indicators (online dots, "viewing this page")
├── FE: Notification center (dropdown, preferences)
├── FE: AI insights dashboard + NL query interface
├── FE: Live counter badges on sidebar
├── RT: Channel architecture + subscription management
└── Gate: Presence works, notifications real-time, AI insights actionable

Sprint 10: Polish, 3D & Launch
├── FE: 3D logo animation
├── FE: 3D empty state illustrations
├── FE: 3D dashboard hero scene
├── FE: 3D data visualizations
├── FE: Animation polish (all transitions, micro-interactions)
├── FE: Dark mode + light mode final audit
├── FE: Responsive audit (mobile, tablet, desktop, wide)
├── FE: Command palette (Meilisearch-powered search)
├── FE: Keyboard shortcuts (full implementation)
├── FE: i18n audit (EN + FR complete)
├── QA: Full E2E test suite (Playwright)
├── QA: Visual regression baseline
├── QA: Performance benchmarks (Core Web Vitals, API latency)
├── QA: Accessibility audit (axe-core + manual)
├── SEC: Penetration test
├── SEC: Multi-tenant isolation verification
├── SEC: Dependency vulnerability scan
├── DevOps: Production Docker images (multi-stage, optimized)
├── DevOps: CI/CD pipeline (build → lint → test → security → deploy)
├── DevOps: Monitoring dashboards
└── Gate: Everything works, looks premium, performs well, is secure
```

---

## 5. Conflict Resolution Protocol

### Types of Conflicts

| Conflict Type | Example | Resolution |
|--------------|---------|------------|
| **Design vs. Technical** | UI wants animation that causes jank | Frontend Architect proposes alternative achieving same feel |
| **UX vs. Security** | UX wants auto-login; Security wants MFA always | Orchestrator weighs risk; compromise: remember device for 30 days |
| **Feature vs. Timeline** | Product wants feature X; QA says it needs 2 more sprints | Orchestrator proposes P1 → P2 demotion or scope reduction |
| **Spec Contradiction** | API spec says field is required; wireframe shows it optional | Backend Architect and UX Architect align; update both docs |
| **Performance vs. Richness** | 3D scene causes 200ms LCP regression | UI Designer provides fallback; Frontend Architect lazy-loads |

### Resolution Steps

```
1. Identifying Agent reports conflict to Orchestrator
   Format: "CONFLICT: [Agent A deliverable] contradicts [Agent B deliverable]"
   Details: What the contradiction is, impact if unresolved

2. Orchestrator evaluates:
   a. Can it be resolved by clarifying ambiguity? → Clarify, update both docs
   b. Is there a clear winner based on project principles? → Apply principle
   c. Is this a trade-off requiring user input? → Escalate to user

3. Resolution logged in specs/DECISIONS.md:
   ## Decision: [Title]
   Date: [Date]
   Conflict: [What conflicted]
   Resolution: [What was decided]
   Reason: [Why]
   Affected deliverables: [List of files updated]

4. Both affected deliverables updated to reflect resolution
```

### Project Principles (Priority Order for Conflict Resolution)

1. **Security** — Never compromise on security for any other concern
2. **Usability** — User experience trumps technical elegance
3. **Performance** — Speed is a feature; don't ship jank
4. **Maintainability** — Code that Claude can modify easily in the future
5. **Aesthetics** — Premium look matters, but not at the expense of 1-4
6. **Feature completeness** — Better to ship fewer features done well

---

## 6. Communication Artifacts

### Shared File System

All agents communicate through files in the `gammahr_v2/` directory:

```
gammahr_v2/
├── MASTER_PLAN.md              — Project vision (read by all)
├── AGENT_TEAM.md               — Agent definitions (read by all)
├── AGENT_WORKFLOW.md           — This file (read by all)
├── specs/
│   ├── APP_BLUEPRINT.md        — Complete app blueprint (read by all)
│   ├── DESIGN_SYSTEM.md        — Design system (read by UI, FE agents)
│   ├── DATA_ARCHITECTURE.md    — Data + API design (read by BE, FE agents)
│   ├── FEATURES.md             — Detailed feature specs (PO → all)
│   ├── USER_STORIES.md         — User stories + acceptance criteria (PO → QA)
│   ├── SECURITY.md             — Security requirements (SEC → BE, FE, DevOps)
│   ├── THREAT_MODEL.md         — STRIDE threat model (SEC → all)
│   ├── API_SPEC.md             — Full API specification (BE-Arch → FE, QA)
│   ├── DOMAIN_EVENTS.md        — Event catalog (BE-Arch → RT, BE-Dev)
│   ├── WIREFRAMES.md           — Page wireframes (UX → UI, FE)
│   ├── USER_FLOWS.md           — User journey flows (UX → FE, QA)
│   ├── INTERACTIONS.md         — Interaction specs (UX → FE-Dev)
│   ├── FE_ARCH.md              — Frontend architecture (FE-Arch → FE-Dev)
│   ├── COMPONENT_TREE.md       — Component hierarchy (FE-Arch → FE-Dev, UI)
│   ├── STATE_MGMT.md           — State management plan (FE-Arch → FE-Dev, RT)
│   ├── REALTIME.md             — Real-time architecture (RT → BE, FE)
│   ├── WS_PROTOCOL.md          — WebSocket protocol spec (RT → BE-Dev, FE-Dev)
│   ├── INFRA.md                — Infrastructure design (DevOps → all)
│   ├── CI_CD.md                — CI/CD pipeline design (DevOps → all)
│   ├── TEST_STRATEGY.md        — Test strategy (QA → all)
│   └── DECISIONS.md            — Conflict resolutions log (Orchestrator)
├── designs/
│   ├── PALETTE_A.md            — Deep Ocean palette (UI → user choice)
│   ├── PALETTE_B.md            — Neon Mint palette (UI → user choice)
│   ├── PALETTE_C.md            — Earth & Emerald palette (UI → user choice)
│   ├── COMPONENT_SPECS.md      — Detailed component designs (UI → FE-Dev)
│   └── MOCKUPS.md              — Key screen mockups (UI → user approval)
├── samples/
│   ├── [proof-of-concept files for risky items]
│   └── [design sample outputs]
├── reviews/
│   ├── [review feedback files organized by deliverable]
│   └── REVIEW_STATUS.md        — Tracking which reviews are complete
└── src/                        — Phase 2: actual code lives here
    ├── backend/                — Rust backend code
    └── frontend/               — Next.js frontend code
```

### Review Tracking

`reviews/REVIEW_STATUS.md`:

```markdown
| Deliverable | Author | Reviewer 1 | R1 Status | Reviewer 2 | R2 Status | Final |
|------------|--------|------------|-----------|------------|-----------|-------|
| FEATURES.md | PO | UX | ✅ APPROVED | QA | ⚠️ NEEDS_CHANGES | ⏳ |
| API_SPEC.md | BE-Arch | FE-Arch | ✅ APPROVED | SEC | ✅ APPROVED | ✅ |
| WIREFRAMES.md | UX | UI | ⏳ IN_REVIEW | PO | ⏳ IN_REVIEW | ⏳ |
```

---

## 7. Quality Gates

### Gate 1: Pre-Design (Before Phase 1 starts)

```
□ MASTER_PLAN.md reviewed by user and approved
□ AGENT_TEAM.md defined with all 12 agents
□ APP_BLUEPRINT.md covers all v1 features + new features
□ DESIGN_SYSTEM.md has 3 palette options ready
□ DATA_ARCHITECTURE.md has complete entity model
□ AGENT_WORKFLOW.md (this file) is complete
```

### Gate 2: Post-Draft (After Round 1)

```
□ Every spec file listed in Communication Artifacts exists
□ No spec file is empty or placeholder
□ Cross-references between specs are consistent
□ API endpoint count matches feature requirements
□ Entity count covers all data needs
□ Wireframes exist for every page in APP_BLUEPRINT
□ User stories exist for every feature in FEATURES
□ Test cases reference every user story
```

### Gate 3: Post-Review (After Rounds 2-3)

```
□ All HIGH issues from reviews are resolved
□ All conflicts logged in DECISIONS.md with resolution
□ REVIEW_STATUS.md shows all deliverables at ✅
□ No unresolved cross-references
□ Security review complete for auth + RBAC + multi-tenancy
```

### Gate 4: User Approval (After Round 4)

```
□ User selected color palette
□ User approved key screen mockups
□ User approved feature priorities (P0/P1/P2)
□ User approved navigation structure
□ User approved real-time scope
□ Any user-requested changes incorporated
```

### Gate 5: Pre-Build (After Round 5)

```
□ All Gate 1-4 requirements met
□ Proof-of-concept validated:
    □ Rust + Axum + multi-tenant middleware works
    □ WebSocket broadcast scales to 100+ connections
    □ React Three Fiber 3D card renders at 60fps
    □ Virtual Gantt handles 500+ rows without jank
    □ Claude API receipt OCR returns structured data
□ All specs frozen (no more changes without formal change request)
□ Development environment boots (Docker Compose stack)
```

### Gate 6: Sprint Gates (During Phase 2)

Each sprint must pass before the next starts:

```
□ All planned features implemented
□ Unit tests passing (>90% coverage on new code)
□ Integration tests passing
□ Visual QA approved by UI Designer
□ Security review passed (for auth/RBAC sprints)
□ API matches spec (no undocumented changes)
□ No P0 bugs open
```

### Gate 7: Launch Gate (After Sprint 10)

```
□ All features from P0 list implemented and tested
□ E2E test suite passing (Playwright)
□ Performance benchmarks met:
    □ LCP < 1.2s
    □ FID < 100ms
    □ CLS < 0.1
    □ API p99 < 200ms
    □ WebSocket delivery < 100ms
□ Accessibility audit passed (WCAG 2.2 AA)
□ Security penetration test passed
□ Multi-tenant isolation verified (zero data leakage)
□ i18n complete (EN + FR)
□ Dark mode + light mode audited
□ Mobile responsive audited (320px to 2560px)
□ Documentation complete (API docs, admin guide)
□ Monitoring and alerting configured
□ Backup and recovery tested
```

---

## 8. How to Start

### Step 1: User Approves This Plan

The user reviews:
- `MASTER_PLAN.md` — Vision, tech stack, timeline
- `AGENT_TEAM.md` — Agent definitions
- `AGENT_WORKFLOW.md` — This workflow
- `APP_BLUEPRINT.md` — Feature map
- `DESIGN_SYSTEM.md` — Visual direction
- `DATA_ARCHITECTURE.md` — Technical foundation

### Step 2: Gate 1 Checkpoint

User confirms: "Yes, proceed with Phase 1 Round 1"

### Step 3: Launch Batch 1 Agents

Spawn 5 agents in parallel:
1. Product Owner → `specs/FEATURES.md` + `specs/USER_STORIES.md`
2. Security Engineer → `specs/SECURITY.md` + `specs/THREAT_MODEL.md`
3. Backend Architect → `specs/API_SPEC.md` + `specs/DOMAIN_EVENTS.md`
4. DevOps Engineer → `specs/INFRA.md` + `specs/CI_CD.md`
5. QA Engineer → `specs/TEST_STRATEGY.md`

### Step 4: Review & Iterate

Continue through Rounds 2-5 until all quality gates pass.

### Step 5: Build

Launch Phase 2 sprints, building on the locked specifications.

---

## 9. Change Request Protocol (During Phase 2)

If a spec needs to change after the Phase 1 lock:

```
1. Requester files change request in specs/CHANGES.md:
   ## CR-001: [Title]
   Requested by: [Agent or User]
   Affects: [List of spec files]
   Reason: [Why the change is needed]
   Impact: [What sprint work is affected]
   Severity: CRITICAL / IMPORTANT / MINOR

2. Orchestrator evaluates:
   - CRITICAL: Stop sprint, address immediately
   - IMPORTANT: Address in next sprint
   - MINOR: Add to backlog

3. Affected agents review and update their deliverables

4. QA Engineer updates test cases

5. Change logged in DECISIONS.md
```

This ensures we don't drift from the blueprint without deliberate, tracked decisions.
