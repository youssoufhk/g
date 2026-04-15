# GammaHR v2 — Harsh Reality Check + Precise Build Plan
**Assessment Date:** 2026-04-14
**Evaluator:** Claude Code (Senior Architect)
**Context:** Solo founder, non-technical, 20h/week, using Claude Code as primary dev multiplier

---

## Part 1: Harsh Reality Check

### What You Have Done Well ✓

| Element | Status | Assessment |
|---------|--------|-----------|
| **Prototype (HTML/CSS/JS)** | Excellent | 2.4MB, 19 complete pages, fully interactive, design system locked, 213 issues audited and resolved. This is professional-grade work. |
| **Design system** | Locked | Color palette (Earth & Sage), typography, spacing all defined in `_tokens.css`. Not changing this was the right call. |
| **Feature specification** | Complete | APP_BLUEPRINT.md documents every page, flow, interaction. Thorough enough for implementation. |
| **Data architecture** | Designed | Multi-tenancy schema-per-tenant model specified. Seed data defined (8 employees, 4 clients, 7 projects). |
| **Agent planning** | Documented | AGENT_TEAM.md, AGENT_WORKFLOW.md describe roles and orchestration. The framework exists. |
| **UX philosophy** | Clear | "GammaHR Feeling" is defined: Revolut-level UX, anti-Tempolia (no busy work), calm + ease + completeness + anticipation. |

### What Will Actually Kill You

#### 1. **The Rust Learning Curve Is On Your Critical Path**

**The Problem:**
You've chosen Rust (Axum backend) as the production language. The agent can write correct Rust. The problem: when the agent produces a lifetime error, a trait bound mistake, a subtle async deadlock at scale, or a security vulnerability specific to memory safety, **can you review it?**

Your answer today is "not deeply." This matters because:
- A junior engineer (agent) writes code confidently, tells you it compiles, and it does — but it leaks memory under load, or has a race condition in the tenant isolation middleware
- You catch it in testing, but debugging it requires understanding Rust semantics deeply
- You are now blocked for hours learning Rust internals to understand the agent's output

**Reality:**
You cannot build a production Rust backend with a non-Rust founder reviewing every PR. You have three options:
1. **Learn Rust deeply NOW** (costs 4-6 weeks of your 20h/week = 80-120 hours before you can review production code)
2. **Switch to FastAPI/Python** (agent code is easier to review, ships 6-8 weeks faster, but you lose the "blazing fast" benefit and take on Python's runtime overhead)
3. **Hire a Rust engineer** (costs money, violates solo + agents thesis)

**My assessment:** Option 1 is feasible *only if you start now* and commit 8-10 hours/week for the next 6 weeks to learning Rust through active review of agent-generated code. If you don't do this, you WILL ship bugs. Option 2 is pragmatic and maintains agent viability.

**Action required:** Decide now, before Phase 2 begins. If Rust, commit to learning it. If FastAPI, rewrite MASTER_PLAN.md tech stack section.

---

#### 2. **You Don't Have an ADR System**

**The Problem:**
Your AGENTIC_COMPANY_REALITY_CHECK.md correctly identifies "Context Collapse" as critical risk #1. The mitigation is ADRs (Architecture Decision Records). You don't have them.

What will happen:
- Agent 1 (Backend Architect) decides JWT tokens are stored in Redis
- 6 weeks later, Agent 7 (Frontend Developer) decides they're stored in localStorage
- They conflict, you find out in integration testing, now you have to rework both
- Or worse: they don't conflict, but the design is inconsistent and fragile

**Reality:**
Without ADRs, your agents are amnesiac. Each one makes decisions in a vacuum. The codebase will accumulate contradictory patterns.

**Action required:** Before Phase 2 begins, create `docs/decisions/` folder and write ADRs for:
- ADR-001: Multi-tenancy model (schema-per-tenant, why not row-level)
- ADR-002: Auth mechanism (JWT + refresh tokens + WebAuthn, why not sessions)
- ADR-003: Frontend state management (Zustand + TanStack Query, why not Redux)
- ADR-004: Real-time architecture (WebSockets via tokio-tungstenite, why not gRPC)
- ADR-005: File storage (S3-compatible MinIO, why not database blob)
- ADR-006: PDF generation (Typst via Rust, why not wkhtmltopdf)

Each ADR should be 1 page: Decision + Why + Trade-offs. Agents must read relevant ADRs before touching that domain.

---

#### 3. **The Spec Depth Is Insufficient for Agents**

**The Problem:**
Your APP_BLUEPRINT.md is 1,973 lines. It's good. But it's not enough for agents to implement without constant clarification. Sections like "Gantt Chart with advanced filtering" need 10x more detail:

- What are the 10+ filter dimensions mentioned in MASTER_PLAN?
- What does "drag-to-assign" actually do? (drag from bench → timeline? multi-week assignments?)
- What happens when you drag overlapping projects to the same person?
- How does the "saved views" system work exactly? (localStorage? server-side? per-user or shared?)
- What is the conflict detection algorithm for resource conflicts?

Right now, the agent implementing Gantt will guess. Some guesses will be wrong. You'll catch them in review, and the agent will have to rewrite it.

**Reality:**
You need to expand APP_BLUEPRINT.md sections to 2-3x current length, OR be prepared for agents to ask clarification questions during implementation (which costs context window and time).

**Action required:** Before assigning the Gantt chart agent, expand that section with:
- Visual mockup references ("see prototype/gantt.html lines X-Y")
- Exact filter list (Department, Client, Project Status, Resource Availability, Billing Status, etc.)
- Interaction model (click → multi-select, or single-select toggle?)
- Drag semantics (can you drag partial weeks? entire person?)
- Persistence model (filters saved per user, or per workspace?)

This applies to every complex module.

---

#### 4. **20h/Week Is Extremely Tight for Solo + Agents**

**The Problem:**
Your timeline estimate says 8-10 months to production. Let's be honest about what that means:

**Week budget breakdown:**
- 4h: Sprint planning, agent coordination, reviewing PRs
- 8h: Product decisions, design review, security review, testing
- 4h: Unblocking agents, answering clarification questions, debugging
- 4h: Learning (Rust, if you choose it; agent output review patterns; ops)

That's 20h exactly, with zero slack.

Reality:
- When an agent produces code with a security vulnerability, you need 1-2 hours to understand and ask for a fix
- When two agents build contradictory features, you need 1+ hour to resolve
- When a deploy breaks, you need 2-4 hours to diagnose and fix
- When a customer reports a bug post-launch, you need 3-5 hours for triage + fix

You have zero hours of slack. One bad week and you're 2 weeks behind.

**Assessment:**
With perfect discipline and perfect agent output, 8-10 months is realistic. With one moderately bad incident or one major spec misunderstanding, you slip to 12+ months.

**Action required:**
1. Build in 2-month buffer (aim for 6 months, accept 8 as success)
2. Identify what you'll cut if you hit timeline pressure (3D visualizations? Advanced Gantt filters? Client portal in phase 1?)
3. Plan for 1-2 weeks of "unplanned incident response" built into the timeline

---

#### 5. **The Mobile Spec Exists But Implementation Will Be Hard**

**The Problem:**
Your memory says "Mobile-first is CRITICAL" and "use `md:hidden` cards + `hidden md:block` tables pattern." The prototype DOES this. But the implementation is not trivial:

- Every table page (employees, timesheets, expenses, projects) needs dual implementations
- The mobile card layout is 320px-tight — you need to test at actual phone sizes
- Touch interactions (hover cards, context menus, drag on Gantt) don't work on mobile — you need touch equivalents
- The prototype uses JavaScript hover simulation — real mobile needs actual tap handlers

Your agents will likely build the desktop version first and retrofit mobile. This is backward. You need mobile-first implementation, which means building the card views first, then adding table views for larger screens.

**Assessment:**
Mobile will take 15-20% of frontend effort. Budget accordingly.

**Action required:**
Explicit instruction to Frontend Developer: "Mobile-first means card views are primary implementation. Implement cards, test at 390px, then add table views for md+ screens. Use Tailwind's `md:` breakpoint consistently."

---

#### 6. **AI Features Are Specced But Not Architected**

**The Problem:**
MASTER_PLAN mentions:
- Expense categorization via Claude API
- Smart insights (anomaly detection, etc.)
- Natural language queries

These are specced at a 2-sentence level. Implementing them requires:

**For expense categorization:**
- OCR pipeline (prototype shows the UX, but how does the backend extract text from images?)
- Claude API calls (cost per user? how do you batch/rate-limit? how do you handle failures?)
- Confidence scoring (if Claude is 45% confident on category, do you ask the user to confirm?)
- Feedback loop (user corrects a wrong category — how does that retrain the model?)

**For "smart insights":**
- Anomaly detection algorithm (z-score? isolation forest? rule-based?)
- What counts as an anomaly? (spending 2x usual? missing hours? overtime spike?)
- False positive rate — if you flag 5 anomalies and 3 are irrelevant, users will ignore them

**Assessment:**
AI features require their own phase of spec-writing before implementation. You can't hand an agent a 3-sentence requirement and get a good feature.

**Action required:**
Create `specs/AI_FEATURES.md` detailing:
- Expense categorization flow (OCR → Claude → confidence → UI)
- Insights algorithm (what metrics? what triggers an alert? how often?)
- NL query scope (what can users ask? "show me all expenses over €500"? "when is everyone available next week"?)
- Cost model (how much will Claude API calls cost per tenant per month?)
- Error handling (Claude timeout? Invalid response? What does the user see?)

Without this, you'll ship something that feels half-baked.

---

#### 7. **Security Auditing Is Your Job, Not the Agent's**

**The Problem:**
Multi-tenant SaaS with employee and financial data has a high security bar. The agent can implement RBAC. The agent can write auth endpoints. But the agent cannot:

- Spot IDOR vulnerabilities (employee A requesting `/api/employees/{B_id}` and seeing B's data)
- Detect SQL injection in dynamic queries
- Identify broken access control in Gantt assignments (can PM assign other people's time?)
- Spot timing attacks in auth flows
- Audit the WebSocket message flow for data leakage
- Review the JWT claims for privilege escalation vectors

Your AGENTIC_COMPANY_REALITY_CHECK.md says: "agents will confidently produce wrong answers without flagging uncertainty." This is true for security.

**Assessment:**
You need to schedule a mandatory security review phase before any production data touches the system. Budget 1-2 weeks of your time in the timeline for:
- Manual code review of auth, RBAC, and data access layers
- Threat modeling exercise (what if a malicious PM tries to assign all billing to themselves?)
- Penetration testing (basic — IDOR, SQL injection, privilege escalation)
- SSL/TLS, secret management, API rate limiting review

**Action required:**
Add "Security Hardening Sprint" (week 20-22 in your timeline) with explicit checklist:
- [ ] Tenant isolation confirmed (cross-tenant data leak impossible)
- [ ] IDOR impossible (all resource access checks tenant + user permissions)
- [ ] Auth tokens are short-lived, refresh tokens are properly scoped
- [ ] API rate limiting configured
- [ ] Secrets never committed (env vars only)
- [ ] WebSocket messages don't leak tenant data
- [ ] File uploads are validated (not executable, size limits)
- [ ] CSV/PDF export respects access control

---

#### 8. **The Prototype Sets a Very High Visual Bar**

**The Problem:**
Your prototype is GORGEOUS. The design is polished, the interactions are smooth, the color palette is carefully chosen. The CSS is intricate (glassmorphism, perspective depth, subtle shadows, careful spacing).

When you ship the Next.js frontend with Tailwind CSS, **it MUST look exactly like the prototype**, or your non-technical founder brain will say "this doesn't feel right."

Reality: There is a 20% chance your agents build it exactly right on the first pass. There's a 80% chance they:
- Get the spacing slightly wrong (use `px-6` instead of the token-derived spacing)
- Miss some micro-interaction (hover color, focus ring, transition timing)
- Build the responsive behavior differently than the prototype
- Forget to implement a CSS detail (like the specific shadow on hover cards)

**Assessment:**
Design QA will be a significant time sink. You'll spot things that "feel off" and need to be fixed. Budget 15-20% of frontend time for visual polish.

**Action required:**
Create a "Visual QA Checklist" that Frontend Developer runs through before marking a page complete:
- [ ] Spacing matches prototype (use browser dev tools to measure)
- [ ] Colors match `_tokens.css` values exactly
- [ ] Hover/focus states present and match prototype interaction
- [ ] Typography (font size, weight, line height) matches spec
- [ ] Shadows/depth effects present
- [ ] Responsive breakpoints work at 320px, 390px, 768px, 1024px, 1280px
- [ ] Touch interactions work on actual mobile device
- [ ] Accessibility: keyboard navigation, screen reader testing, contrast ratios

---

### Summary: What Actually Needs to Change

You are **ambitious but not delusional**. The vision is sound. But you need to fix 8 structural gaps:

| Gap | Cost | Fix |
|-----|------|-----|
| 1. Rust learning curve on critical path | 80-120 hours of your time OR 6-8 weeks of timeline | Learn Rust now, or switch to FastAPI |
| 2. No ADR system | 20 hours to set up + 2h/week to maintain | Create `docs/decisions/` now |
| 3. Spec depth insufficient | 40 hours to expand key sections | Expand APP_BLUEPRINT.md before Phase 2 |
| 4. Timeline has zero slack | Schedule delay inevitable | Build in 2-month buffer, define scope cuts |
| 5. Mobile implementation underestimated | 20% of frontend time not budgeted | Explicit mobile-first instructions to agent |
| 6. AI features not architected | Will ship half-baked OR takes 3x time to spec | Create `specs/AI_FEATURES.md` now |
| 7. Security not budgeted as separate phase | Will ship insecure OR discovered late | Add "Security Hardening Sprint" to timeline |
| 8. Visual QA not systematic | Will iterate endlessly on polish | Create "Visual QA Checklist" for agents |

---

## Part 2: Precise Step-by-Step Build Process

### Organizational Principle: Agentic Roles + Sequential Gates

Your agents are not autonomous. They are specialized sub-agents that work in a **gated pipeline**:

```
Agent (assigned task) → Produce code/spec → Your review gate → Approval → Next agent starts

NO agent touches code until the spec it depends on is FROZEN.
NO code is merged without passing: compile + lint + tests + your review.
NO feature ships without security audit + visual QA.
```

---

### Pre-Phase 2: Foundation Work (Week 0-2)
**Your effort:** 8-10 hours/week
**Agent effort:** 4-6 hours/week

#### Week 0: Decisions & ADRs

**You do:**
1. **Decide on Rust vs. FastAPI** (1 hour)
   - If Rust: commit to 6 weeks of learning (8-10h/week)
   - If FastAPI: update MASTER_PLAN.md tech stack + timeline (-6 weeks)

2. **Write core ADRs** (3 hours with agent help)
   - ADR-001: Multi-tenancy (schema-per-tenant, why not row-level)
   - ADR-002: Auth (JWT + WebAuthn, why not sessions)
   - ADR-003: Frontend state (Zustand + TanStack Query)
   - ADR-004: Real-time (WebSockets)
   - ADR-005: File storage (S3)
   - ADR-006: PDF (Typst)

3. **Define scope cuts** (1 hour)
   - If you miss timeline, what ships in v1.0 vs. v1.1?
   - Examples: Gantt advanced filters → v1.1? Client portal → v1.1? 3D viz → v1.1?
   - Document in MASTER_PLAN.md

**Agent does (Backend Architect):**
1. Expand APP_BLUEPRINT.md sections to 2-3x current length (focus on: Gantt, Invoicing, Approvals)
   - 4 hours work
2. Create detailed API specification (OpenAPI schema stub with all endpoints)
   - 2 hours work

**Gate:** You review all ADRs, expanded blueprint, and API spec. Approve before moving to Phase 2.

---

#### Week 1-2: Specs Locked

**You do:**
1. **Expand AI_FEATURES.md** (2 hours with Backend Architect's help)
   - Expense categorization flow (what is the Claude API call shape? confidence threshold? fallback?)
   - Insights algorithm (what metrics? what thresholds? monthly anomaly detection?)
   - NL query scope (what's in scope? out of scope?)
   - Cost model (estimate API calls per user per month)

2. **Create implementation checklist** (1 hour)
   - Phase 2 Checklist: what must be done before each phase releases?
   - Phase 2a (Auth + Core CRUD): list of required features + tests
   - Phase 2b (Modules): what makes each module "complete"?
   - Phase 2c (Polish): what are visual QA requirements?

3. **Expand AGENT_WORKFLOW.md** with concrete examples (1 hour)
   - Show what a "good PR" looks like (code + tests + comments)
   - Show what a "bad PR" looks like and how to ask for fixes
   - Define your review SLA (how fast do you turn around reviews? important because agents block on this)

**Agent does:**
1. Backend Architect: Finish detailed API spec (OpenAPI YAML with request/response examples) — 3 hours
2. Backend Architect: Create SQL migration files for all core entities (comments, no implementation) — 2 hours
3. QA Engineer: Create E2E test cases for critical flows (test structure, no implementation) — 3 hours

**Gate:** You review all specs, migrations, and test structure. API schema is FROZEN (no agent may change without approval).

---

### Phase 2a: Backend Foundation (Week 3-6, ~4 weeks)
**Your effort:** 8-10 hours/week (learn Rust + review PRs)
**Agent effort:** 30-40 hours/week (backend + DB)

#### Week 3: Scaffolding + Auth

**Backend Developer agent:**

1. **Week 3, Sprint 1: Project setup + Auth foundation**
   - [ ] Create Rust Axum project scaffold (Cargo.toml with dependencies)
   - [ ] PostgreSQL connection pool setup
   - [ ] Tenant middleware (extract tenant from JWT → set search_path)
   - [ ] Error handling and response wrapping
   - [ ] JWT token generation and validation
   - [ ] Login endpoint
   - [ ] Refresh token endpoint
   - [ ] Password hashing (bcrypt)
   - [ ] Rate limiting middleware (login attempts)
   - **Deliverable:** Auth endpoints pass integration tests, rate limiting works, tenant isolation confirmed

**You do:**
1. Rust crash course (4-6h this week + ongoing)
   - Learn: ownership, borrowing, lifetimes, async/await basics
   - Focus: understand what agent's code does, spot obvious bugs
2. Review PRs with fresh Rust knowledge (2h)
3. Verify tenant isolation is working (1h manual testing)

**Gate:** Auth passes all tests, tokens are short-lived, tenant isolation verified.

---

#### Week 4: Core CRUD + Multi-tenancy

**Backend Developer agent:**

1. **Week 4, Sprint 2: Data models + core CRUD**
   - [ ] Implement all database migrations (users, departments, leave_types, etc.)
   - [ ] User CRUD handlers
   - [ ] Department CRUD handlers
   - [ ] Permission model (who can CRUD what?)
   - [ ] Tests for all endpoints (each handler tested with valid + invalid inputs)
   - [ ] Tenant isolation tests (user A cannot see user B's data if different tenant)
   - **Deliverable:** Core CRUD fully functional, 80%+ test coverage, no cross-tenant data leaks

**You do:**
1. Security review (1h)
   - Check permission model for IDOR
   - Verify tenant isolation in queries
   - Check for SQL injection in any dynamic queries
2. Review CRUD implementation (1h)
   - Spot N+1 query issues, missing indexes
   - Check error messages don't leak data
3. Manual testing (1h)
   - Verify API returns correct data for each role

**Gate:** All CRUD endpoints tested, permission model secure, zero IDOR vulnerabilities.

---

#### Week 5: Leave Management

**Backend Developer agent:**

1. **Week 5, Sprint 3: Leaves module**
   - [ ] Leave request submission (create, update, cancel)
   - [ ] Leave balance calculation (based on leave_types and company_holidays)
   - [ ] Leave approval workflow (reject with reason, approve)
   - [ ] Conflict detection (overlapping leaves for same team)
   - [ ] Balance carry-over logic (per spec)
   - [ ] Tests for all flows (happy path + edge cases: overlap, insufficient balance, etc.)
   - **Deliverable:** Full leave lifecycle tested, conflict detection working, balance tracking accurate

**You do:**
1. Verify edge cases (1h)
   - What happens if leave balance goes negative? (should be prevented)
   - What if two concurrent approvals happen? (last write wins? conflict?)
   - What if leave type has different rules per country? (out of scope for v1?)
2. Review calculations (1h)
   - Carry-over math correct?
   - Company holidays correctly excluded from balance calculations?

**Gate:** Leave flow complete, edge cases handled, conflict detection accurate.

---

#### Week 6: Timesheets + Expenses Foundations

**Backend Developer agent:**

1. **Week 6, Sprint 4: Timesheets + Expenses core**
   - [ ] Timesheet batch creation (weekly batches auto-created)
   - [ ] Timesheet entry submission (hours per day, project assignment)
   - [ ] Timesheet approval workflow (PM approves batch)
   - [ ] Expense submission (with category)
   - [ ] Expense approval workflow
   - [ ] Billable vs. internal hour tracking
   - [ ] Tests for all flows
   - **Deliverable:** Timesheet and expense CRUD working, approval workflows testable, billable/internal split working

**Note:** OCR + Claude API integration deferred to Phase 2b. Expenses accept category field via API for now.

**You do:**
1. Verify approval workflows (1h)
   - Can PM approve their own timesheets? (should be prevented)
   - Approval notifications working? (not required yet, but structure should support it)
2. Check billable/internal logic (1h)
   - Is the split calculation correct?
   - Can a timesheet be both billable and internal? (should be exclusive per project)

**Gate:** Timesheet and expense core logic complete, edge cases handled, workflows tested.

---

### Phase 2b: Core Frontend + API Integration (Week 7-12, ~6 weeks)
**Your effort:** 8-10 hours/week (review + design QA)
**Agent effort:** 40 hours/week (frontend + API integration)

#### Week 7: Frontend Scaffolding + Design System

**Frontend Architect agent:**

1. **Week 7: Project setup + design system implementation**
   - [ ] Create Next.js 15 (App Router) project scaffold
   - [ ] Import all design tokens from `prototype/_tokens.css` into Tailwind config + CSS custom properties
   - [ ] Build component library from `prototype/_components.css` (buttons, badges, cards, tables, modals, hover cards)
   - [ ] Implement layout system (sidebar, top bar, mobile nav) from `prototype/_layout.css`
   - [ ] Build utility hooks from `prototype/_shared.js` (hover cards, keyboard shortcuts, role switcher, command palette)
   - [ ] Storybook setup (all components have stories)
   - [ ] Tests for component rendering
   - **Deliverable:** Storybook is live, all components render correctly, design tokens are in Tailwind, no divergence from prototype

**You do:**
1. Visual QA on all components (3h)
   - Compare Storybook to prototype side-by-side
   - Colors, spacing, shadows, responsive behavior match?
2. Test component edge cases (1h)
   - Buttons with long text, overflow behavior?
   - Tables with 1000 rows, performance?
   - Modals on mobile, accessible?

**Gate:** All design tokens imported, component library complete and tested, Storybook accurate.

---

#### Week 8: Auth pages + Dashboard scaffold

**Frontend Developer agent:**

1. **Week 8: Auth + Dashboard scaffolding**
   - [ ] Login page (connects to `/api/auth/login` endpoint)
   - [ ] Registration wizard (4 steps: company, admin, team, customize)
   - [ ] MFA setup (QR code display, 6-digit input)
   - [ ] Employee onboarding flow (3 steps)
   - [ ] Dashboard page scaffold (layout + KPI cards, no data yet)
   - [ ] Tests for all flows (Playwright smoke tests)
   - **Deliverable:** Auth flows complete, dashboard renders, all pages pass Playwright smoke tests

**You do:**
1. Test auth flows end-to-end (1h)
   - Can you log in? Are tokens stored correctly?
   - Can you register a company? Are the 4 steps correct?
   - Does MFA work?
2. Visual QA (2h)
   - Do the auth pages match `prototype/auth.html` exactly?
   - Responsive? (test at 320px, 390px, 1024px)
   - Any Tailwind spacing off?

**Gate:** Auth flows complete, dashboard scaffold ready, smoke tests passing.

---

#### Week 9: Timesheets + Leaves pages

**Frontend Developer agent:**

1. **Week 9: Timesheets and Leaves pages**
   - [ ] Timesheet week grid (7 days + total row, matches `prototype/timesheets.html`)
   - [ ] Timesheet month heatmap view
   - [ ] Copy-forward button (copies previous week's hours)
   - [ ] Submit timesheet (POSTs to `/api/timesheets/{id}/submit`)
   - [ ] Leaves page (request form, balance cards, my leaves list)
   - [ ] Leave request form
   - [ ] Leave approval in leaves page (from approval queue)
   - [ ] Tests for all views
   - **Deliverable:** Timesheet and leave pages render correctly, API calls work, data flows correctly

**You do:**
1. Test data flows (1h)
   - Submit a timesheet, verify it appears on approval page
   - Request leave, verify conflict detection
   - Approve leave, verify balance updates
2. Visual QA (2h)
   - Do the week grids match prototype?
   - Responsive at mobile sizes?
   - Heatmap colors correct?

**Gate:** Timesheet and leave pages complete, API integration working, data flows verified.

---

#### Week 10: Employees + Projects pages

**Frontend Developer agent:**

1. **Week 10: Employees and Projects pages**
   - [ ] Employee directory (list + search)
   - [ ] Employee profile page (work time, current projects, leave calendar, skills)
   - [ ] Employee cards with hover-card mini-profiles
   - [ ] Make all employee names clickable everywhere
   - [ ] Projects list (cards + Kanban view toggle)
   - [ ] Project detail view (tabs: overview, timesheets, expenses, milestones)
   - [ ] Project creation modal
   - [ ] Tests for all views
   - **Deliverable:** Employees and projects pages complete, hovercards work, all data flows correct

**You do:**
1. Test hovercards (1h)
   - Hover over any employee name, does mini-profile appear?
   - Profile shows correct data?
   - Links in profile work?
2. Visual QA (2h)
   - Employee cards match prototype?
   - Project Kanban layout correct?
   - Detail modals/drawers match `prototype/projects.html`?

**Gate:** Employee and project pages complete, hovercards everywhere, data integration working.

---

#### Week 11: Expenses + Invoices pages

**Frontend Developer agent:**

1. **Week 11: Expenses and Invoices pages**
   - [ ] Expense list with filters (category, status, date range)
   - [ ] Expense submission form
   - [ ] Expense upload (file input, accept image/PDF)
   - [ ] Invoice list (filters, search)
   - [ ] Invoice detail view (editable line items, payment recording)
   - [ ] Invoice generation modal
   - [ ] Tests for all views
   - **Deliverable:** Expense and invoice pages complete, file uploads working (basic, no processing yet), data flows correct

**Note:** OCR processing deferred to Phase 2c. File uploads accepted but not processed.

**You do:**
1. Test expense submission (1h)
   - Can you upload a file?
   - Does the expense appear in the list?
   - Can you edit and resubmit?
2. Visual QA (2h)
   - Invoice edit mode matches prototype?
   - Responsive tables/cards?
   - Payment recording flow correct?

**Gate:** Expense and invoice pages complete, file uploads accepted, approval workflows integrated.

---

#### Week 12: Calendar, Gantt scaffold, Approvals

**Frontend Developer agent:**

1. **Week 12: Calendar + Gantt scaffold + Approvals**
   - [ ] Calendar page (day/week/month/quarter/year views)
   - [ ] Calendar events (from timesheets, leaves, etc.)
   - [ ] Gantt chart scaffold (rows, bars, dates rendered, no drag yet)
   - [ ] Gantt filtering (department, project, client)
   - [ ] Approvals hub (list of pending items by type)
   - [ ] Approval detail drawer (shows full timesheet or expense for approval)
   - [ ] Bulk approve button (with confirmation)
   - [ ] Tests for all views
   - **Deliverable:** Calendar and approvals complete, Gantt rendering, all data flows correct

**Note:** Gantt drag-to-assign deferred to Phase 2c (advanced Gantt).

**You do:**
1. Test calendar data (1h)
   - Do timesheets appear on calendar correctly?
   - Do leaves show? Do holidays show?
   - Can you switch between views?
2. Visual QA (2h)
   - Calendar layout matches prototype?
   - Gantt bars positioned correctly?
   - Approvals list shows correct pending count?

**Gate:** Calendar, Gantt scaffold, and approvals complete, all data integration working.

---

### Phase 2c: Advanced Features + Polish (Week 13-18, ~6 weeks)
**Your effort:** 8-10 hours/week (review + security audit)
**Agent effort:** 40 hours/week

#### Week 13: Gantt advanced + Planning page

**Frontend Developer agent:**

1. **Week 13: Gantt advanced features**
   - [ ] Gantt drag-to-assign (drag employee to timeline to assign to project)
   - [ ] Gantt context menu (right-click for reassign, remove, etc.)
   - [ ] Gantt saved views (save filter + sort combinations)
   - [ ] Gantt keyboard shortcuts (arrow keys to navigate, Enter to select)
   - [ ] Planning page (resource planning view, bench list, what-if scenarios)
   - [ ] Tests for all interactions
   - **Deliverable:** Gantt fully featured, drag working smoothly, saved views persist, planning page complete

**You do:**
1. Test Gantt drag (1h)
   - Can you drag an employee to a project?
   - Does the timesheet update in backend?
   - Can you undo?
2. Test planning scenarios (1h)
   - Can you move someone to a different project?
   - Does availability update?
   - Bench count correct?

**Gate:** Gantt fully functional, planning page complete, all interactions smooth.

---

#### Week 14: Client Portal

**Frontend Developer agent:**

1. **Week 14: Client Portal**
   - [ ] Client login (different auth context)
   - [ ] Project overview (high-level view of assigned projects)
   - [ ] Timesheet approval (client can see and approve employee timesheets)
   - [ ] Invoice viewing and download (PDF, JSON)
   - [ ] Documents/attachments tab
   - [ ] Messages tab (basic messaging infrastructure)
   - [ ] Tests for all flows
   - **Deliverable:** Client portal fully functional, separate login context, all client workflows working

**You do:**
1. Test client workflows (1h)
   - Log in as client, verify you only see your projects
   - Can you approve a timesheet?
   - Can you download an invoice?
2. Security review (1h)
   - Can client A see client B's data? (should be impossible)
   - Can client modify timesheets they shouldn't? (should be prevented)

**Gate:** Client portal complete, data isolation verified, approval workflows working.

---

#### Week 15: Admin + HR module

**Frontend Developer agent:**

1. **Week 15: Admin and HR pages**
   - [ ] Admin dashboard (audit logs, system health, tenant config)
   - [ ] User management (add, edit, deactivate, role assignment)
   - [ ] Department management (create, edit, assign managers)
   - [ ] Leave type configuration
   - [ ] Company holidays management
   - [ ] HR module (Recruitment kanban, Onboarding checklists, Offboarding checklists, Employee records)
   - [ ] Tests for all admin workflows
   - [ ] **Deliverable:** Admin and HR pages complete, all configuration workflows working, audit logs visible

**You do:**
1. Test admin workflows (1h)
   - Can you add a user? Are they visible in directory?
   - Can you create a department? Do employees update?
   - Leave type configuration reflected in leaves page?
2. Verify audit logs (1h)
   - Are all mutations logged? (create, update, delete)
   - Can you query audit logs by user, action, date?

**Gate:** Admin and HR pages complete, audit trail working, all configurations reflected in app.

---

#### Week 16: AI Features (OCR + Insights)

**Backend Developer + Frontend Developer agents (coordinated):**

1. **Week 16: Expense OCR + Insights**

   **Backend:**
   - [ ] OCR pipeline (image → text extraction)
   - [ ] Claude API integration for expense categorization
   - [ ] Confidence scoring (category + confidence percentage)
   - [ ] Fallback to manual categorization
   - [ ] Insights endpoint (anomalies, trends, forecasts)
   - [ ] Tests for OCR flow, API error handling
   - **Deliverable:** OCR works end-to-end, confidence scoring visible, insights available via API

   **Frontend:**
   - [ ] Upload to OCR trigger (user uploads image → backend processes → confidence displayed)
   - [ ] Accept/reject Claude suggestion
   - [ ] Insights dashboard (anomalies displayed, trends charted)
   - [ ] Tests for all flows
   - **Deliverable:** OCR UI working, user can accept/reject, insights visible

**You do:**
1. Test OCR end-to-end (1h)
   - Upload an expense image
   - Does Claude correctly categorize it?
   - Can you correct the category?
2. Verify Claude costs (0.5h)
   - Estimate API calls per user per month
   - Set up cost alerts with Anthropic
3. Security review (1h)
   - File uploads validated? (not executable)
   - Claude API calls don't leak tenant data?

**Gate:** OCR fully functional, confidence scoring visible, insights accurate, API costs understood.

---

#### Week 17: Real-time Features + WebSocket

**Real-time Engineer agent:**

1. **Week 17: Real-time infrastructure**
   - [ ] WebSocket server (tokio-tungstenite in Rust)
   - [ ] Presence system (who's online, idle, away)
   - [ ] Live notifications (approval submitted, timesheet rejected, etc.)
   - [ ] Real-time collaboration (if multiple users editing, see each other's cursors/presence)
   - [ ] Message broadcasting (for approvals, alerts, etc.)
   - [ ] Tests for WebSocket connections, message delivery, edge cases (disconnect/reconnect)
   - **Deliverable:** WebSocket working, presence visible, notifications real-time, no data leaks

**Frontend Integration:**
   - [ ] Connect to WebSocket on app load
   - [ ] Display presence indicators (green dot for online, gray for idle)
   - [ ] Show live notifications as toasts
   - [ ] Disconnect/reconnect handling
   - [ ] Tests for client-side WebSocket logic

**You do:**
1. Test presence (1h)
   - Log in on two browsers, verify presence shows
   - Close one browser, verify presence updates
   - Verify only your tenant's users visible
2. Test notifications (1h)
   - Submit a timesheet, verify notification appears in real-time
   - Verify notification doesn't leak tenant data

**Gate:** WebSocket infrastructure complete, presence working, notifications real-time, tenant isolation verified.

---

#### Week 18: Polish, Performance, Security Audit

**Backend Developer + Frontend Developer + Security Engineer agents:**

**Backend:**
1. **Performance optimization**
   - [ ] Database query optimization (add missing indexes, remove N+1 queries)
   - [ ] API response time < 50ms p99 (measure and optimize hotpaths)
   - [ ] Redis caching for expensive queries
   - [ ] Load testing (1000 concurrent users, verify no crashes)

2. **Security hardening**
   - [ ] HTTPS + TLS 1.3
   - [ ] CORS configuration (only allow frontend domain)
   - [ ] CSRF tokens (for form submissions)
   - [ ] Rate limiting on all endpoints
   - [ ] Input validation and sanitization everywhere
   - [ ] SQL injection tests (verify impossible)
   - [ ] Audit log for all mutations
   - [ ] Secret management (no secrets in code, env vars only)
   - [ ] API key rotation strategy

**Frontend:**
1. **Visual polish**
   - [ ] Animations (page transitions, loading states, hover effects)
   - [ ] Mobile responsiveness at 320px, 390px, 768px, 1024px
   - [ ] Accessibility (WCAG 2.2 AA: keyboard nav, screen readers, contrast)
   - [ ] Dark mode verification (default), light mode variant
   - [ ] Reduced-motion support (no animations if user prefers)
   - [ ] Performance (Lighthouse > 90 on all pages)

2. **QA**
   - [ ] E2E tests for all critical user flows (Playwright)
   - [ ] Cross-browser testing (Chrome, Firefox, Safari)
   - [ ] Mobile testing on actual devices (iPhone, Android)
   - [ ] 100% test coverage on critical paths

**You do:**
1. Security code review (3h this week, but ongoing)
   - Review auth, RBAC, data access layers
   - Spot IDOR, privilege escalation, SQL injection
   - Check for timing attacks, token leakage
   - Verify tenant isolation one more time

2. Visual QA (2h)
   - Walk through every page
   - Compare to prototype side-by-side
   - Spot any spacing, color, or animation discrepancies
   - Test on actual phone (iOS + Android if possible)

3. Performance review (1h)
   - Run Lighthouse
   - Check API response times
   - Verify no N+1 queries

**Gate:** Security audit complete (zero critical vulns), visual QA passes, performance meets targets, E2E tests > 90% coverage.

---

### Phase 3: Launch Prep (Week 19-22, ~4 weeks)
**Your effort:** 10-12 hours/week (customer comms, testing, bug fixes)
**Agent effort:** 20-30 hours/week (final polish, docs)

#### Week 19: Beta Testing + Documentation

**You + agents:**

1. **Internal testing**
   - [ ] Full E2E workflow (register company → invite team → timesheets → approvals → invoicing)
   - [ ] Edge cases (timezone handling, daylight saving, leap year, etc.)
   - [ ] Multi-tenant isolation (verified one more time with actual user data)
   - [ ] Mobile testing with real devices
   - [ ] Load testing (can system handle 1000 concurrent users?)

2. **Documentation**
   - [ ] User guide (PDF: how to log in, submit timesheet, request leave, etc.)
   - [ ] Admin guide (how to add users, configure leave types, manage departments)
   - [ ] API documentation (OpenAPI + examples)
   - [ ] Deployment runbook (how to deploy, rollback, scale)
   - [ ] Monitoring + alerting setup (Prometheus, Grafana, PagerDuty alerts)

3. **Customer launch prep**
   - [ ] Create beta signup page
   - [ ] Onboarding email sequence (welcome, quick start, getting help)
   - [ ] Support channel setup (email, chat, docs)
   - [ ] SLA definition (what's your support response time?)

**Gate:** All E2E tests pass, docs complete, monitoring configured, customer comms ready.

---

#### Week 20: Beta Launch (if timeline allows)

- [ ] Invite 3-5 beta customers (small consulting firms or agencies)
- [ ] Onboard them (walkthrough, initial config)
- [ ] Monitor for bugs (daily check-ins)
- [ ] Collect feedback (what feels wrong? what's missing?)
- [ ] Fix critical bugs same day

---

#### Week 21-22: Production Hardening + Launch

**Based on beta feedback:**

1. **Bug fixes** (from beta feedback)
   - [ ] Fix all P0 bugs (security, data loss)
   - [ ] Fix all P1 bugs (broken workflows)
   - [ ] Defer P2 bugs (Polish) to v1.1

2. **Final security audit** (if you have budget, hire external auditor)
   - [ ] Penetration testing (OWASP top 10)
   - [ ] Dependency scanning (cargo-audit, npm audit)
   - [ ] SSL/TLS configuration review

3. **Launch**
   - [ ] Deploy to production
   - [ ] Enable monitoring
   - [ ] Open customer signups
   - [ ] Announce (blog, Twitter, LinkedIn, ProductHunt)

---

## Part 3: Agent Role Specializations (Precise Assignments)

Here is exactly which agent does what, and when:

### Backend Architect (Weeks 0-2, 3-4, 13-18)
**Runs once at start, then reviews as others implement**

| Phase | Task | Hours | Deliverable |
|-------|------|-------|-------------|
| Week 0-2 | Expand APP_BLUEPRINT.md | 4 | Detailed specs for every module |
| Week 0-2 | Create OpenAPI spec | 2 | Frozen API contract |
| Week 0-2 | Create SQL migrations | 2 | All table definitions |
| Week 3-6 | Code review (Backend Developer) | 4 | Feedback on Rust patterns |
| Week 13-18 | Performance optimization | 4 | Index recommendations, caching strategy |
| Week 18 | Security review | 2 | Threat model validation |

**Total:** ~20 hours

---

### Backend Developer (Weeks 3-6, 13-18)
**Implements all Rust endpoints**

| Phase | Task | Weeks | Deliverable |
|-------|------|-------|-------------|
| Auth + Core CRUD | Login, auth, tenant middleware, user CRUD | 3-4 | Tested endpoints, no IDOR |
| Leaves | Leave requests, balance, approvals, conflicts | 5 | Full workflow tested |
| Timesheets + Expenses | Submission, approval, billable/internal split | 6 | Core logic complete |
| AI Features | OCR pipeline, Claude API, insights | 16 | E2E expense categorization |
| Real-time | WebSocket server, presence, notifications | 17 | Live presence + notifications |
| Polish | Performance, security, load testing | 18 | Optimized + audited code |

**Total:** ~80 hours over 16 weeks

---

### Frontend Architect (Week 7)
**Scaffolds and designs component architecture**

| Phase | Task | Hours | Deliverable |
|-------|------|-------|-------------|
| Week 7 | Design system + component library | 8 | Storybook with all components |
| Week 8-12 | Code review (Frontend Developer) | 6 | Feedback on component patterns |
| Week 16 | Real-time integration architecture | 2 | WebSocket client design |

**Total:** ~16 hours

---

### Frontend Developer (Weeks 8-18)
**Implements all React pages**

| Phase | Task | Weeks | Pages | Hours |
|-------|------|-------|-------|-------|
| Auth + Dashboard | Login, registration, dashboard scaffold | 8 | auth, dashboard | 12 |
| Timesheets + Leaves | Week grid, approval, leave requests | 9 | timesheets, leaves | 12 |
| Employees + Projects | Directory, profiles, project list | 10 | employees, projects | 12 |
| Expenses + Invoices | Submission, approval, invoice mgmt | 11 | expenses, invoices | 12 |
| Calendar + Gantt + Approvals | Calendar, Gantt scaffold, approval hub | 12 | calendar, gantt, approvals | 12 |
| Gantt advanced + Planning | Drag-to-assign, saved views, planning | 13 | gantt (advanced), planning | 10 |
| Client Portal | Separate login, project view, approvals | 14 | portal | 10 |
| Admin + HR | User mgmt, departments, HR module | 15 | admin, hr | 12 |
| AI Features | OCR UI, insights dashboard | 16 | expense upload, insights | 8 |
| Real-time | Presence, notifications, WebSocket | 17 | presence indicators, toasts | 8 |
| Polish | Animations, accessibility, mobile | 18 | all pages | 12 |

**Total:** ~120 hours over 11 weeks

---

### QA Engineer (Weeks 0-2, 18-22)
**Test strategy + execution**

| Phase | Task | Hours | Deliverable |
|-------|------|-------|-------------|
| Week 1 | Test case writing (critical flows) | 3 | Test cases for every module |
| Week 18 | E2E test implementation | 8 | Playwright tests > 90% coverage |
| Week 19-22 | Beta testing + bug triage | 12 | Bug reports, prioritization |

**Total:** ~23 hours

---

### Security Engineer (Weeks 0-2, 18-22)
**Threat modeling + audit**

| Phase | Task | Hours | Deliverable |
|-------|------|-------|-------------|
| Week 1 | ADR for security decisions | 1 | Auth + RBAC ADRs |
| Week 18 | Code security audit | 4 | Security review report |
| Week 20 | External penetration testing | TBD | Pen test report (if budget) |

**Total:** ~5 hours (if internal only) or 10-20 if including external auditor

---

### Real-time Engineer (Weeks 17-18)
**WebSocket infrastructure**

| Phase | Task | Hours | Deliverable |
|-------|------|-------|-------------|
| Week 0 | Architecture + ADR | 1 | WebSocket protocol defined |
| Week 17 | Implementation | 12 | Working WebSocket server + client |
| Week 18 | Testing + optimization | 4 | Load tested, no data leaks |

**Total:** ~17 hours

---

### You (Solo Founder) — Critical Path
**20 hours/week minimum**

| Week | Task | Hours |
|------|------|-------|
| 0-2 | Rust decision, ADRs, scope cuts, AI spec | 10 |
| 3 | Learn Rust + review auth PR | 6 |
| 4 | Learn Rust + review CRUD PR | 6 |
| 5 | Review leaves PR + security check | 4 |
| 6 | Review timesheet/expense PR + testing | 4 |
| 7 | Review design system + Storybook QA | 5 |
| 8 | Visual QA auth + dashboard | 5 |
| 9 | Visual QA timesheets + leaves | 5 |
| 10 | Visual QA employees + projects | 5 |
| 11 | Visual QA expenses + invoices | 5 |
| 12 | Visual QA calendar + gantt + approvals | 5 |
| 13 | Test Gantt drag + planning scenarios | 4 |
| 14 | Security review client portal | 4 |
| 15 | Test admin + HR workflows | 4 |
| 16 | Test OCR + insights E2E | 4 |
| 17 | Test presence + real-time | 4 |
| 18 | Security audit + performance review | 6 |
| 19 | E2E testing + docs | 8 |
| 20 | Beta testing + customer prep | 8 |
| 21-22 | Production launch + bug fixes | 10 |

**Total:** 20 hours/week × 22 weeks = 440 hours

---

## Part 4: Risk Mitigation Checklist

Before starting Phase 2, lock down these mitigations:

- [ ] **Rust decision made** (Rust or FastAPI?) + commitment if Rust
- [ ] **ADRs written** (at least 6 core decisions documented)
- [ ] **Scope cuts defined** (what's v1.0 vs. v1.1 if timeline slips?)
- [ ] **APP_BLUEPRINT.md expanded** (2-3x current length, especially Gantt + Invoicing sections)
- [ ] **AI_FEATURES.md written** (expense OCR, insights algorithm, NL scope, cost model)
- [ ] **Implementation checklist created** (what is "done" for each module?)
- [ ] **Agent review SLA defined** (how fast will you turn around PR reviews? agents wait on you)
- [ ] **Rust learning path planned** (if Rust, commit to 6 weeks of 8-10h/week self-study)
- [ ] **Security budget in timeline** (2 weeks for security hardening + audit)
- [ ] **Visual QA checklist created** (every page has a standardized QA process)
- [ ] **Customer acquisition plan sketched** (who are your first beta customers? how will you find them?)
- [ ] **Support structure planned** (email? Slack? Discord? who responds?)

---

## Summary: Build It This Way

**Phase 0 (Done):** Prototype + specs complete
**Phase 1 (2 weeks):** Decisions + ADRs + expanded specs locked
**Phase 2a (4 weeks):** Rust backend (auth, CRUD, leaves, timesheets/expenses)
**Phase 2b (6 weeks):** React frontend (auth, dashboard, all pages, API integration)
**Phase 2c (6 weeks):** Advanced features (Gantt drag, planning, portal, admin, AI, real-time)
**Phase 3 (4 weeks):** Launch prep (beta testing, documentation, production hardening)

**Total:** 22 weeks = ~5.5 months if perfect
**Realistic:** 26-28 weeks = 6-7 months with incident buffer

**Your effort:** 20h/week consistently (learn, review, decide, unblock)
**Agent effort:** 30-40h/week (code, test, integrate)
**Cost:** $0 (agents are Claude) + infrastructure + Anthropic API

**Success criteria:**
- ✓ Ship production-ready SaaS in 6-7 months as solo founder
- ✓ Code is reviewed and audited (you own quality)
- ✓ Security is not an afterthought
- ✓ Visual design matches prototype quality
- ✓ Multi-tenant data isolation verified
- ✓ Real-time features working (WebSockets, presence, notifications)

**This is feasible.** It is not easy. It requires discipline, clear specs, and aggressive scope definition. But it is absolutely doable with agents as 3-5x execution multipliers.

---

## Next Steps (This Week)

1. **Decide on Rust.** 1 hour. Make the call.
2. **Write 6 core ADRs.** 3 hours with agent help.
3. **Expand key APP_BLUEPRINT sections.** Agent: 4 hours.
4. **Create AI_FEATURES.md.** You + agent: 2 hours.
5. **Create scope cuts document.** 1 hour. (What's v1.1 if you slip 2 months?)
6. **Define review SLA.** 30 min. (You'll review PRs within 24 hours? 48? This is critical.)
7. **If Rust: buy "The Rust Programming Language" book + commit to 6 weeks of self-study.**

Do these 7 things, and you are ready to start Phase 2a. Do not skip them.

---

**Final word:** You are not delusional. You have a real shot at this. The prototype proves your design thinking is solid. The specs prove you can think architecturally. The vision is sound. What you need now is execution discipline, not ambition.

Your agents are ready. They're waiting for you to make decisions and lock specs. The build is in your hands — not because agents are bad, but because this is a **product decision company**, and only you can be the product owner.

Ship it.
