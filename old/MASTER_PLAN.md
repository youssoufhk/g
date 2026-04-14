# GammaHR v2 — Master Plan

> **Codename:** GammaHR Quantum
> **Philosophy:** 80% design & specification, 20% implementation. We ship the blueprint before a single line of code.
> **Builder:** Claude Code (Rust backend, Next.js frontend, AI-powered agents)
> **Prototype:** `/prototype/` — static HTML/CSS/JS design reference. See §3 below.

---

## 1. Why v2 Exists

### v1 Post-Mortem: What Went Wrong

| Problem | Impact | v2 Fix |
|---------|--------|--------|
| **Colors hurt eyes** — violet-blue `hsl(252,85%,60%)` is too saturated | Eye fatigue, unprofessional feel | Design Agent proposes 3 curated palettes; user picks before any code |
| **Employee names not clickable everywhere** | Users can't navigate naturally; dead ends everywhere | Every employee mention is a `<Link>` — universal clickable identity |
| **Employee page is empty** — no work history, no project timeline, no holidays | Page is useless; can't understand what someone is working on | Rich employee profile: timeline, project history, skills, availability, leave calendar |
| **Gantt chart not filterable** — can't find unbilled employees, filter by client | Resource planning is impossible | Advanced Gantt with multi-dimensional filtering, saved views, drag-to-assign |
| **Timesheets poorly organized** | Hard to enter, hard to review, hard to approve | Week-grid with smart defaults, copy-forward, bulk approval, conflict detection |
| **Expenses poorly organized** | No categorization view, no analytics, no receipt management | Smart expense dashboard with OCR, auto-categorization, policy enforcement |
| **Projects lack depth** — no milestones, no burndown, no budget tracking | Can't manage projects meaningfully | Full project lifecycle: milestones, budget tracking, burndown, health indicators |
| **Nothing feels premium** — standard component library look | Looks like every other SaaS | 3D design elements, depth effects, custom animations, brand-grade visual identity |
| **Started coding too early** | Built features without thinking through UX flows | 80/20 rule: design everything first, code second |

### v2 Vision

GammaHR Quantum is a **premium HR operations platform** for consulting firms, agencies, and mid-to-enterprise companies. It should feel like using **Linear meets Figma meets Bloomberg Terminal** — fast, beautiful, information-dense, and delightful.

**Target users:**
- **Mid-market companies** (50-500 employees) with dedicated HR teams
- **Consulting firms & agencies** obsessed with billable hours and resource utilization
- **Enterprise** (500+) needing compliance, audit trails, and complex approval workflows

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend API** | **Rust (Axum)** | Memory-safe, blazing fast, compile-time bug prevention. Claude Code as sole developer eliminates the "hard to hire" concern. |
| **Database** | **PostgreSQL 16** | Proven, schema-per-tenant isolation, JSONB for flexible data, excellent full-text search |
| **Real-time** | **WebSockets (tokio-tungstenite)** | Full real-time collaboration like Figma — live presence, instant updates |
| **Cache** | **Redis 7** | Session cache, real-time pub/sub, rate limiting |
| **Search** | **Meilisearch** | Typo-tolerant instant search across all entities |
| **Frontend** | **Next.js 15 (App Router)** | React 19, server components, streaming, excellent DX |
| **3D / Visuals** | **Three.js + React Three Fiber** | 3D icons, data visualizations, depth effects |
| **Styling** | **Tailwind CSS 4 + custom design tokens** | Utility-first with premium design system |
| **State** | **Zustand + TanStack Query** | Client + server state, optimistic updates |
| **Forms** | **React Hook Form + Zod** | Type-safe validation end-to-end |
| **Charts** | **D3.js + custom components** | Beyond Recharts — custom premium visualizations |
| **Auth** | **JWT + refresh tokens + WebAuthn** | Passwordless option, hardware key support |
| **File Storage** | **S3-compatible (MinIO/AWS)** | Receipts, documents, profile photos |
| **PDF** | **Typst (via Rust)** | Native Rust PDF generation — no Python dependency |
| **Email** | **Resend or SMTP** | Transactional emails |
| **Task Queue** | **Tokio tasks + Redis streams** | Async job processing natively in Rust |
| **AI** | **Claude API** | Expense categorization, smart insights, natural language queries |
| **Multi-tenancy** | **Schema-per-tenant** | PostgreSQL schemas for full data isolation |
| **i18n** | **next-intl + Rust fluent** | English, French, and extensible |

---

## 3. The Prototype

Before any Rust or Next.js code is written, a fully interactive **HTML/CSS/JS prototype** of the entire frontend lives in `/prototype/`. It is **not** the production codebase — it is a design validation and stakeholder communication tool.

### What it is
- Pure HTML files, one per page (`index.html`, `employees.html`, `gantt.html`, etc.)
- Shared design tokens in `_tokens.css`, component library in `_components.css`, layout in `_layout.css`
- Shared JavaScript utilities in `_shared.js` (hover cards, presence simulation, role switcher, keyboard shortcuts)
- No build step, no framework — opens directly in a browser

### What it proves
- Every UX flow is validated before implementation begins
- Every visual decision (colors, 3D effects, glassmorphism, typography) is approved on real screens
- Stakeholders and the product owner can click through the entire product
- The design system token set is locked — Next.js simply imports the same token values

### Relationship to the real product
| Prototype file | Next.js equivalent |
|---|---|
| `_tokens.css` | `tailwind.config.ts` + `globals.css` custom properties |
| `_components.css` | `/components/ui/` component library |
| `_shared.js` | `/hooks/` + `/lib/` utilities |
| `index.html` | `app/[locale]/(app)/dashboard/page.tsx` |
| `employees.html` | `app/[locale]/(app)/employees/page.tsx` + `[id]/page.tsx` |
| `gantt.html` | `app/[locale]/(app)/gantt/page.tsx` |
| `portal/index.html` | `app/[locale]/(portal)/page.tsx` |
| `auth.html` | `app/[locale]/(auth)/login/page.tsx` + wizard routes |
| `account.html` | `app/[locale]/(app)/account/page.tsx` |

### Canonical prototype data
The prototype uses a fixed dataset of 8 employees, 7 projects, 4 clients, and related entities. This exact dataset becomes the **database seed data** for the Rust backend. See `specs/DATA_ARCHITECTURE.md §Seed Data`.

### Prototype quality bar
The prototype has been audited by 9 specialized critic agents (DATA, UX-IA, UX-FLOWS, UX-INTERACTION, UI-COMPONENTS, UI-VISUAL, UI-POLISH, PM, MOBILE). All 213 identified issues were resolved. The `FINAL_CHECKLIST.md` documents every resolved item. Any future agent working on the prototype must be MORE critical than that checklist — aim to find issues the previous critics missed.

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Web App  │  │ Mobile   │  │ Client   │  │ Slack/Teams  │ │
│  │ (Next.js)│  │ (PWA)    │  │ Portal   │  │ Integration  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
│       └──────────────┴──────────────┴───────────────┘        │
│                          │                                    │
│                    ┌─────┴──────┐                             │
│                    │  API GW /  │                             │
│                    │  Load Bal  │                             │
│                    └─────┬──────┘                             │
│                          │                                    │
│  ┌───────────────────────┴────────────────────────────┐      │
│  │              RUST BACKEND (Axum)                    │      │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │      │
│  │  │ REST API │ │ WebSocket │ │ Background Jobs  │  │      │
│  │  │ Handlers │ │  Server   │ │ (Tokio + Redis)  │  │      │
│  │  └────┬─────┘ └─────┬─────┘ └────────┬─────────┘  │      │
│  │       └──────────────┴────────────────┘            │      │
│  │                      │                              │      │
│  │  ┌──────────────────┬┴──────────────────┐          │      │
│  │  │  Domain Services │ Auth │ RBAC │ Audit│         │      │
│  │  └──────────────────┴──────────────────┘          │      │
│  └───────────────────────┬────────────────────────────┘      │
│                          │                                    │
│  ┌───────┐  ┌───────┐  ┌┴──────┐  ┌──────────┐  ┌───────┐  │
│  │Postgres│  │ Redis │  │ Meili │  │ S3/MinIO │  │Claude │  │
│  │  (DB)  │  │(Cache)│  │Search │  │ (Files)  │  │ (AI)  │  │
│  └───────┘  └───────┘  └───────┘  └──────────┘  └───────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Tenancy: Schema-Per-Tenant

```
PostgreSQL Instance
├── public schema          → shared (tenant registry, billing)
├── tenant_acme schema     → Acme Corp's complete data
├── tenant_globex schema   → Globex Corp's complete data
└── tenant_initech schema  → Initech's complete data
```

Each tenant gets a fully isolated PostgreSQL schema. Middleware extracts tenant from JWT → sets `search_path` → all queries automatically scoped.

---

## 5. The Agent Team

See **[AGENT_TEAM.md](./AGENT_TEAM.md)** for full definitions.

**Summary of 12 agents:**

| # | Agent | Domain | Phase 1 Deliverable | Phase 2 Deliverable |
|---|-------|--------|--------------------|--------------------|
| 1 | **Product Owner** | Vision & Requirements | Feature specs, user stories, acceptance criteria | Feature validation, UAT |
| 2 | **UX Architect** | User Experience | User flows, wireframes, interaction maps | Usability audit, flow optimization |
| 3 | **UI Designer** | Visual Design | Design system, 3D assets, color palettes, component library | Visual QA, polish |
| 4 | **Frontend Architect** | Frontend Architecture | Component tree, state management plan, routing | Code architecture, patterns |
| 5 | **Frontend Developer** | Frontend Code | — | React components, pages, integrations |
| 6 | **Backend Architect** | Backend Architecture | API design, data models, schema design | Code architecture, patterns |
| 7 | **Backend Developer** | Backend Code | — | Rust handlers, services, database |
| 8 | **Security Engineer** | Security & Compliance | Threat model, auth design, RBAC matrix | Security audit, penetration testing |
| 9 | **Real-time Engineer** | WebSocket & Live Features | Real-time architecture, presence system | WebSocket implementation |
| 10 | **QA Engineer** | Quality Assurance | Test strategy, test cases, edge cases | Test suites, E2E tests |
| 11 | **DevOps Engineer** | Infrastructure | Deployment architecture, CI/CD design | Docker, pipelines, monitoring |
| 12 | **Orchestrator** | Coordination | Master schedule, dependency graph | Cross-agent integration, conflict resolution |

---

## 6. The 80/20 Process

### Phase 1: Design & Specification (80% of effort)

```
Week 1-2: Discovery & Definition
├── Product Owner: Feature specs for ALL modules
├── UX Architect: User research, persona definition, journey maps
├── Security Engineer: Threat model, compliance requirements
└── Backend Architect: Data model design, API contract draft

Week 3-4: Design & Architecture
├── UI Designer: 3 color palette proposals → user picks
├── UI Designer: Design system v1 (tokens, typography, spacing, components)
├── UX Architect: Complete wireframes for every page
├── Frontend Architect: Component architecture, state plan
├── Backend Architect: Full API specification (OpenAPI)
└── Real-time Engineer: WebSocket protocol design

Week 5-6: Refinement & Review
├── ALL AGENTS: Cross-review all specs
├── QA Engineer: Test cases for every feature
├── UI Designer: High-fidelity mockups (key screens)
├── UX Architect: Interaction prototypes
└── Orchestrator: Dependency resolution, final plan

Week 7-8: Final Approval
├── Consolidated blueprint review
├── Sample implementations (proof-of-concept for risky areas)
├── User sign-off on every module
└── Implementation plan locked
```

### Phase 2: Implementation (20% of effort — but faster because design is done)

```
Sprint 1-2: Foundation
├── Backend: Project scaffolding, auth, multi-tenancy, core models
├── Frontend: Design system implementation, app shell, routing
└── DevOps: Docker, CI/CD, database migrations

Sprint 3-4: Core Modules
├── Employee management, departments, profiles
├── Leave management (request, approve, balance)
├── Expense management (submit, categorize, approve)
└── Real-time: WebSocket server, presence

Sprint 5-6: Advanced Modules
├── Project management, assignments, milestones
├── Timesheets (week grid, approval workflow)
├── Client management, client portal
└── Invoicing (generation, PDF, tracking)

Sprint 7-8: Premium Features
├── Gantt chart with advanced filtering
├── Resource planning & forecasting
├── AI-powered insights (Claude API)
├── 3D data visualizations

Sprint 9-10: Polish & Launch
├── QA: Full E2E test suite
├── Security: Penetration testing, audit
├── Performance: Load testing, optimization
├── UI: Animation polish, 3D refinement
```

---

## 7. Document Map

| Document | Purpose |
|----------|---------|
| **[MASTER_PLAN.md](./MASTER_PLAN.md)** | This file — project vision, strategy, prototype overview, timeline |
| **[AGENT_TEAM.md](./AGENT_TEAM.md)** | All 12 agents: roles, competencies, deliverables for Phase 0, 1, and 2 |
| **[AGENT_WORKFLOW.md](./AGENT_WORKFLOW.md)** | Orchestration meta-prompt: how to run agents, parallel execution patterns, critic system, quality gates |
| **[FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)** | All 213 prototype issues resolved — grouped ✅ checklist by domain |
| **[specs/APP_BLUEPRINT.md](./specs/APP_BLUEPRINT.md)** | Complete feature map — every page, click, connection, interaction (cross-refs prototype) |
| **[specs/DESIGN_SYSTEM.md](./specs/DESIGN_SYSTEM.md)** | Visual identity, 3D approach, typography, motion, component specs (refs prototype CSS) |
| **[specs/DATA_ARCHITECTURE.md](./specs/DATA_ARCHITECTURE.md)** | All entities, relationships, API design, real-time protocol, seed data from prototype |
| **[prototype/](./prototype/)** | Static HTML/CSS/JS design prototype — the approved visual spec for the Next.js frontend |

---

## 8. Success Criteria

### Visual Quality
- [ ] No page looks "standard" or "template-like"
- [ ] 3D elements add depth without being gimmicky
- [ ] Color palette is easy on the eyes across 8+ hour workdays
- [ ] Dark mode is the PRIMARY mode (not an afterthought)
- [ ] Animations are smooth, purposeful, and respect reduced-motion

### UX Quality
- [ ] Every employee name is clickable from anywhere → rich profile page
- [ ] Employee profile tells a STORY: current projects, work history, availability, skills
- [ ] Gantt chart supports 10+ filter dimensions with saved views
- [ ] Timesheets can be filled in under 2 minutes for a full week
- [ ] Expense submission takes under 30 seconds with receipt photo
- [ ] Zero dead ends — every piece of data links to its context
- [ ] Search finds anything in < 200ms

### Technical Quality
- [ ] API response times < 50ms (p99)
- [ ] WebSocket message delivery < 100ms
- [ ] Full real-time: presence, live updates, collaborative views
- [ ] Schema-per-tenant with zero cross-tenant data leakage
- [ ] 100% type safety: Rust compile-time + TypeScript strict
- [ ] Comprehensive audit trail on all mutations

### Business Quality
- [ ] Client portal: clients can view progress, approve time, see invoices
- [ ] Resource forecasting: predict staffing needs 3 months ahead
- [ ] AI insights: anomaly detection, smart categorization, NL queries
- [ ] Full i18n: English + French, extensible to more languages
- [ ] GDPR-compliant: data export, deletion, consent tracking

---

## 9. Principles

1. **Design first, code never** — until the blueprint is perfect
2. **Every pixel is intentional** — no default styling anywhere
3. **Information density** — show more, scroll less (like Bloomberg Terminal)
4. **Zero dead ends** — everything links to everything
5. **Speed is a feature** — perceived and actual performance
6. **Dark mode is home** — light mode is the variant
7. **Delight in the details** — micro-interactions, transitions, haptic feedback
8. **The Gantt is king** — resource visualization is the centerpiece
9. **AI augments, never replaces** — smart suggestions, human decisions
10. **Security is invisible** — robust but never in the way
