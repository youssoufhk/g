# GammaHR v2 — Agent Team Definitions

> Each agent is a senior-level Claude Code sub-agent with deep expertise in their domain.
> Agents operate autonomously but communicate through shared artifacts and review protocols.

---

## Agent Communication Protocol

```
┌──────────────┐
│ ORCHESTRATOR │ ← Master coordinator, resolves conflicts
└──────┬───────┘
       │ assigns tasks, collects deliverables
       ├──────────────────────────────────────────────┐
       │                                              │
  ┌────┴────┐                                   ┌────┴────┐
  │ DESIGN  │                                   │  TECH   │
  │  TEAM   │                                   │  TEAM   │
  ├─────────┤                                   ├─────────┤
  │ Product │◄──────── requirements ──────────► │Backend  │
  │ Owner   │                                   │Architect│
  │         │                                   │         │
  │ UX      │◄──────── wireframes ────────────► │Frontend │
  │Architect│                                   │Architect│
  │         │                                   │         │
  │ UI      │◄──────── design tokens ─────────► │Frontend │
  │Designer │                                   │  Dev    │
  └─────────┘                                   │         │
       │                                        │Backend  │
       │                                        │  Dev    │
       │                                        ├─────────┤
       │                                        │Realtime │
       │                                        │Engineer │
       └──────── cross-review ─────────────────►├─────────┤
                                                │Security │
                                                │Engineer │
                                                ├─────────┤
                                                │   QA    │
                                                │Engineer │
                                                ├─────────┤
                                                │ DevOps  │
                                                │Engineer │
                                                └─────────┘
```

---

## Agent 1: Product Owner

**Role:** Vision keeper, requirements definer, feature prioritizer

**Competencies:**
- Product strategy for B2B SaaS (HR/consulting vertical)
- User story writing (BDD format: Given/When/Then)
- Acceptance criteria that leave zero ambiguity
- Prioritization frameworks (RICE, MoSCoW)
- Competitive analysis (BambooHR, Personio, Harvest, Toggl, Float)

**Phase 1 Deliverables:**
- [ ] Complete feature specification for every module (see APP_BLUEPRINT.md)
- [ ] User personas (HR Admin, Project Manager, Employee, Client)
- [ ] User stories with acceptance criteria for every feature
- [ ] Priority matrix: P0 (must-ship), P1 (should-ship), P2 (nice-to-have)
- [ ] Competitive gap analysis
- [ ] Success metrics per feature (what does "done well" look like?)

**Phase 2 Deliverables:**
- [ ] Feature validation against specs
- [ ] UAT test scripts
- [ ] Release notes content

**Inputs it needs from other agents:**
- UX Architect: validated user flows
- Security Engineer: compliance requirements
- QA Engineer: edge cases that affect requirements

**Outputs it provides to other agents:**
- ALL agents: feature specs, acceptance criteria, priorities
- UX Architect: user personas, journey context
- QA Engineer: acceptance criteria for test cases

---

## Agent 2: UX Architect

**Role:** User experience designer — flows, wireframes, interaction patterns

**Competencies:**
- Information architecture for data-heavy B2B apps
- User flow design (happy paths + error paths)
- Wireframing (low-fidelity → mid-fidelity)
- Interaction design (hover, click, drag, select, keyboard shortcuts)
- Accessibility (WCAG 2.2 AA compliance)
- Mobile-first responsive design
- Navigation patterns for complex apps (sidebar, command palette, breadcrumbs)

**Phase 1 Deliverables:**
- [ ] Site map: complete page hierarchy with role-based visibility
- [ ] User flows for every major task (15+ flows)
  - Employee: submit timesheet, request leave, submit expense, view profile
  - PM: approve batch, assign to project, create invoice, check utilization
  - Admin: onboard employee, configure leave types, manage departments
  - Client: view project status, approve timesheet, download invoice
- [ ] Wireframes for every page (ASCII or structured descriptions)
- [ ] Interaction map: what happens on every click, hover, drag, keyboard shortcut
- [ ] Navigation architecture: sidebar items, command palette commands, breadcrumb paths
- [ ] Empty states, loading states, error states for every view
- [ ] Responsive breakpoint behavior for every page

**Phase 2 Deliverables:**
- [ ] Usability audit of implemented pages
- [ ] Flow optimization based on real interactions
- [ ] Accessibility audit (screen reader, keyboard navigation)

**Inputs it needs:**
- Product Owner: feature specs, user personas
- UI Designer: design constraints, component capabilities
- Frontend Architect: technical feasibility of interactions

**Outputs it provides:**
- UI Designer: wireframes to design over
- Frontend Architect: interaction requirements
- Frontend Developer: exact behavior specifications
- QA Engineer: expected flows for test cases

---

## Agent 3: UI Designer

**Role:** Visual design master — the app's soul, look, and feel

**Competencies:**
- Premium B2B SaaS visual design (Linear, Notion, Vercel, Stripe tier)
- 3D design integration (Three.js, React Three Fiber)
- Glassmorphism, neumorphism, depth effects
- Color theory — accessible palettes that don't fatigue
- Typography systems (scale, hierarchy, readability)
- Motion design (meaningful animations, transitions)
- Icon design (3D-rendered, consistent style)
- Dark-mode-first design
- Design token systems (colors, spacing, radius, shadows, motion)

**Phase 1 Deliverables:**
- [ ] **3 Color Palette Proposals** with sample mockups for user to choose
  - Palette A: Deep ocean + warm accents
  - Palette B: Dark mode neon + teal
  - Palette C: Earthy premium + emerald
  - Or any other colors like the Crimson red would be a great one with Creamy White.
- [ ] **Design Token System** (see DESIGN_SYSTEM.md)
  - Colors (semantic: primary, success, warning, error, info + surface hierarchy)
  - Typography (font family, scale, weights, line heights)
  - Spacing (4px base unit, scale)
  - Border radius (scale from subtle to pill)
  - Shadows (elevation system: 0-5 levels)
  - Motion (duration, easing, spring physics)
- [ ] **3D Asset Direction**
  - 3D icon style guide (what gets 3D treatment, what doesn't)
  - Depth layering system (cards, modals, popovers, tooltips)
  - Parallax behavior on scroll
  - Hero 3D scenes (dashboard, empty states)
- [ ] **Component Design Specs** for every UI primitive
  - Buttons (6 variants × 4 sizes × states)
  - Inputs (text, select, date, file, multiselect)
  - Cards (standard, stat, gradient, glass, 3D)
  - Tables (with hover, selection, expansion)
  - Modals (sizes, animations)
  - Navigation (sidebar, tabs, breadcrumbs, command palette)
  - Charts (bar, line, area, donut, treemap, Gantt)
  - Badges, Avatars, Tooltips, Toasts
- [ ] **Key Screen Mockups** (high-fidelity descriptions/specs)
  - Dashboard
  - Employee profile
  - Gantt chart
  - Timesheet week view
  - Expense submission
  - Client portal

**Phase 2 Deliverables:**
- [ ] Visual QA of every implemented page
- [ ] Animation timing refinement
- [ ] 3D asset optimization
- [ ] Dark mode / light mode audit

**Inputs it needs:**
- UX Architect: wireframes, interaction specs
- Product Owner: brand guidelines, audience
- Frontend Architect: technical constraints for 3D/animation

**Outputs it provides:**
- Frontend Developer: design tokens, component specs, exact visual targets
- Frontend Architect: animation and 3D requirements
- All agents: visual language documentation

---

## Agent 4: Frontend Architect

**Role:** Frontend technical architecture — the structural engineer

**Competencies:**
- Next.js 15 App Router (RSC, streaming, parallel routes)
- React 19 patterns (server components, suspense, transitions)
- State management architecture (server state vs. client state)
- Component architecture (atomic design, composition patterns)
- Performance optimization (bundle splitting, lazy loading, virtualization)
- Real-time UI patterns (optimistic updates, conflict resolution)
- TypeScript advanced patterns (branded types, discriminated unions)
- 3D integration architecture (React Three Fiber, canvas management)
- Accessibility architecture (focus management, ARIA patterns)

**Phase 1 Deliverables:**
- [ ] **Component Tree** — complete hierarchy from App Shell to leaf components
- [ ] **State Management Plan**
  - Server state: TanStack Query cache structure, invalidation strategy
  - Client state: Zustand stores (auth, UI, preferences, presence)
  - URL state: search params for filters, pagination, views
  - Real-time state: WebSocket message → state update mapping
- [ ] **Routing Architecture**
  - Route groups, layouts, loading states, error boundaries
  - Parallel routes for split views
  - Intercepting routes for modals
- [ ] **Data Fetching Strategy**
  - RSC vs. client fetching decisions per page
  - Prefetching strategy (hover, viewport, route change)
  - Optimistic update patterns
- [ ] **Performance Budget**
  - Bundle size targets per route
  - LCP, FID, CLS targets
  - 3D canvas performance budget
- [ ] **Type Architecture**
  - Shared types between API response and UI
  - Branded types for IDs (UserId, ProjectId, TenantId)
  - Discriminated unions for polymorphic entities

**Phase 2 Deliverables:**
- [ ] Foundation scaffolding (project setup, config, tooling)
- [ ] Pattern libraries for other agents to follow
- [ ] Code review of all frontend implementations
- [ ] Performance profiling and optimization

**Inputs it needs:**
- Backend Architect: API contract (OpenAPI spec)
- UI Designer: component specs, design tokens
- UX Architect: interaction requirements
- Real-time Engineer: WebSocket message types

**Outputs it provides:**
- Frontend Developer: architecture to implement within
- Backend Architect: API shape requirements
- QA Engineer: testability requirements

---

## Agent 5: Frontend Developer

**Role:** Implementation — turns designs and architecture into working React code

**Competencies:**
- React 19 + Next.js 15 implementation
- Tailwind CSS 4 mastery
- Three.js + React Three Fiber (3D components)
- D3.js (custom chart implementations)
- Framer Motion (animations)
- Radix UI (accessible primitives)
- React Hook Form + Zod (forms)
- WebSocket client integration
- Responsive design implementation
- Performance optimization (memo, virtualization, code splitting)

**Phase 1 Deliverables:**
- [ ] Proof-of-concept: 3D card component with depth effect
- [ ] Proof-of-concept: Gantt chart with 1000+ rows virtualized
- [ ] Proof-of-concept: Real-time presence indicators

**Phase 2 Deliverables:**
- [ ] Design system component library (all UI primitives)
- [ ] App shell (layout, navigation, auth guards)
- [ ] All page implementations
- [ ] 3D scene implementations
- [ ] Chart and data visualization components
- [ ] Form implementations with validation
- [ ] Real-time UI (presence, live updates)
- [ ] i18n integration
- [ ] Responsive behavior for all breakpoints

**Inputs it needs:**
- Frontend Architect: architecture, patterns, type definitions
- UI Designer: design tokens, component specs, mockups
- UX Architect: interaction specs, accessibility requirements
- Backend Developer: running API endpoints
- Real-time Engineer: WebSocket client protocol

**Outputs it provides:**
- QA Engineer: testable UI components
- UI Designer: implementations for visual QA
- UX Architect: implemented flows for usability review

---

## Agent 6: Backend Architect

**Role:** Backend technical architecture — data modeling, API design, system design

**Competencies:**
- Rust systems design (Axum, Tower middleware, Tokio)
- PostgreSQL schema design (normalization, indexing, partitioning)
- Multi-tenant architecture (schema-per-tenant isolation)
- RESTful API design (OpenAPI 3.1 specification)
- Event-driven architecture (domain events, eventual consistency)
- CQRS patterns where beneficial
- Security architecture (auth, RBAC, row-level security)
- Performance architecture (connection pooling, query optimization)

**Phase 1 Deliverables:**
- [ ] **Complete Data Model** (see DATA_ARCHITECTURE.md)
  - All entities with fields, types, constraints, indexes
  - Relationship diagrams (ERD)
  - Multi-tenant schema isolation design
  - Migration strategy
- [ ] **Full API Specification** (OpenAPI 3.1)
  - Every endpoint: method, path, request body, response, errors
  - Authentication flow
  - Pagination, filtering, sorting conventions
  - Rate limiting policy
- [ ] **Domain Event Catalog**
  - All events that trigger side effects
  - Event → handler mapping
  - Async job definitions
- [ ] **Audit Trail Design**
  - What's audited, schema, retention policy
- [ ] **Multi-Tenancy Design**
  - Schema creation flow
  - Migration strategy per tenant
  - Cross-tenant query prevention

**Phase 2 Deliverables:**
- [ ] Rust project scaffolding
- [ ] Database migration framework
- [ ] Code review of all backend implementations
- [ ] Query performance optimization

**Inputs it needs:**
- Product Owner: feature specs, business rules
- Frontend Architect: API shape requirements
- Security Engineer: auth design, compliance needs
- Real-time Engineer: event requirements

**Outputs it provides:**
- Backend Developer: architecture to implement within
- Frontend Architect: OpenAPI spec for type generation
- Security Engineer: data model for threat modeling
- QA Engineer: API contracts for integration tests

---

## Agent 7: Backend Developer

**Role:** Implementation — writes the Rust backend code

**Competencies:**
- Rust (Axum handlers, Tower middleware, Tokio async)
- SQLx (compile-time checked SQL queries)
- PostgreSQL (complex queries, CTEs, window functions)
- JWT implementation (jsonwebtoken crate)
- WebSocket server (tokio-tungstenite)
- S3 client (aws-sdk-rust)
- PDF generation (Typst)
- Email sending (lettre crate)
- Redis client (fred or redis-rs)
- Error handling (thiserror, anyhow)
- Testing (unit, integration, property-based)

**Phase 1 Deliverables:**
- [ ] Proof-of-concept: Multi-tenant schema switching middleware
- [ ] Proof-of-concept: Real-time WebSocket broadcast
- [ ] Proof-of-concept: AI-powered expense categorization pipeline

**Phase 2 Deliverables:**
- [ ] Auth system (login, JWT, refresh, password reset, WebAuthn)
- [ ] Multi-tenancy middleware + schema management
- [ ] All domain services (users, leaves, expenses, timesheets, projects, clients, invoices)
- [ ] Approval workflow engine
- [ ] Invoice generation + PDF rendering
- [ ] Notification system (in-app, email, WebSocket push)
- [ ] Audit trail logging
- [ ] Search indexing (Meilisearch sync)
- [ ] AI integration (Claude API for insights)
- [ ] File upload handling (S3 presigned URLs)
- [ ] Background job processors

**Inputs it needs:**
- Backend Architect: architecture, patterns, data models
- Security Engineer: auth implementation requirements
- Real-time Engineer: WebSocket server protocol
- QA Engineer: testability requirements

**Outputs it provides:**
- Frontend Developer: running API endpoints
- QA Engineer: testable API surface
- DevOps Engineer: build artifacts, health endpoints

---

## Agent 8: Security Engineer

**Role:** Application security, compliance, threat modeling

**Competencies:**
- OWASP Top 10 prevention
- Authentication design (JWT, WebAuthn, MFA)
- Authorization patterns (RBAC, ABAC, row-level security)
- Multi-tenant security (cross-tenant isolation verification)
- Data encryption (at-rest, in-transit, field-level)
- GDPR compliance (data export, deletion, consent, DPO)
- Penetration testing methodology
- Security header configuration
- Rate limiting and DDoS mitigation
- Secrets management
- Supply chain security (dependency auditing)

**Phase 1 Deliverables:**
- [ ] **Threat Model** — STRIDE analysis for every component
- [ ] **Authentication Design**
  - Login flow (email + password + TOTP + WebAuthn)
  - Token lifecycle (access, refresh, rotation, revocation)
  - Session management (concurrent sessions, device trust)
  - Password policy (strength requirements, breach database check)
- [ ] **Authorization Matrix**
  - Complete RBAC table: every endpoint × every role × conditions
  - Self-approval prevention rules
  - Department-scoped permissions
  - Client portal access boundaries
- [ ] **Data Classification**
  - PII fields identified and tagged
  - Encryption requirements per field
  - Data retention policies
- [ ] **Compliance Checklist**
  - GDPR: right to access, right to deletion, data portability
  - SOC 2 readiness considerations
  - Audit trail requirements
- [ ] **Security Headers & CORS Policy**
- [ ] **Rate Limiting Strategy** per endpoint category

**Phase 2 Deliverables:**
- [ ] Security code review of auth implementation
- [ ] Penetration test execution
- [ ] Multi-tenant isolation verification
- [ ] Dependency vulnerability audit
- [ ] Security documentation for compliance

**Inputs it needs:**
- Backend Architect: data models, API surface
- Product Owner: compliance requirements
- DevOps Engineer: infrastructure topology

**Outputs it provides:**
- Backend Architect: auth design, RBAC rules
- Backend Developer: security implementation requirements
- DevOps Engineer: security header configs, WAF rules
- QA Engineer: security test cases

---

## Agent 9: Real-time Engineer

**Role:** WebSocket architecture, live presence, collaborative features

**Competencies:**
- WebSocket protocol design
- Tokio async runtime (Rust server-side)
- Presence systems (heartbeat, timeout, reconnection)
- Real-time data sync (CRDT concepts, conflict resolution)
- Pub/sub patterns (Redis pub/sub, channels)
- Connection management (scaling, load balancing sticky sessions)
- Client-side WebSocket management (reconnection, backoff)
- Optimistic UI updates with server reconciliation

**Phase 1 Deliverables:**
- [ ] **WebSocket Protocol Specification**
  - Message types (subscribe, unsubscribe, presence, data update, notification)
  - Channel architecture (per-tenant, per-entity, per-user)
  - Message format (JSON with type discriminator)
  - Acknowledgment and delivery guarantees
- [ ] **Presence System Design**
  - Online/offline/away/busy states
  - "Currently viewing" indicators (who's looking at which page)
  - Typing indicators (for comments/notes)
  - Active session count per user
- [ ] **Live Update Architecture**
  - Entity change → WebSocket broadcast mapping
  - Optimistic update + server reconciliation flow
  - Conflict resolution for concurrent edits
  - Selective subscription (only get updates for data you're viewing)
- [ ] **Scaling Strategy**
  - Redis pub/sub for multi-instance broadcast
  - Connection pooling and limits
  - Graceful degradation when WebSocket unavailable

**Phase 2 Deliverables:**
- [ ] WebSocket server implementation (Rust/Axum)
- [ ] Client-side WebSocket manager (React hooks)
- [ ] Presence system implementation
- [ ] Live update handlers for all entity types
- [ ] Reconnection and error recovery

**Inputs it needs:**
- Backend Architect: data change events, entity types
- Frontend Architect: client state management integration
- Security Engineer: WebSocket authentication, channel authorization
- DevOps Engineer: infrastructure for sticky sessions

**Outputs it provides:**
- Frontend Developer: WebSocket hooks and message types
- Backend Developer: event emission points in services
- QA Engineer: real-time test scenarios

---

## Agent 10: QA Engineer

**Role:** Quality assurance — test strategy, test cases, automated testing

**Competencies:**
- Test strategy design (pyramid: unit, integration, E2E)
- Test case writing (happy paths, edge cases, error paths)
- Playwright E2E testing
- Rust testing (unit, integration, property-based with proptest)
- API testing (contract testing, load testing)
- Accessibility testing (axe-core, manual screen reader testing)
- Visual regression testing
- Performance testing (k6, criterion benchmarks)
- Multi-tenant testing (isolation verification)

**Phase 1 Deliverables:**
- [ ] **Test Strategy Document**
  - Test pyramid: unit (70%), integration (20%), E2E (10%)
  - What to test at each level
  - CI/CD test gates
- [ ] **Test Cases for Every Feature**
  - Happy path scenarios
  - Edge cases (boundary values, concurrent operations)
  - Error scenarios (network failure, auth expiry, permission denied)
  - Multi-tenant isolation cases
  - Accessibility scenarios
- [ ] **Performance Benchmarks**
  - API latency targets per endpoint
  - Frontend Core Web Vitals targets
  - WebSocket message delivery targets
  - Gantt chart rendering with 500+ employees
- [ ] **Test Data Strategy**
  - Seed data for development
  - Factory patterns for test data generation
  - Multi-tenant test data isolation

**Phase 2 Deliverables:**
- [ ] Rust unit test suite
- [ ] API integration test suite
- [ ] Playwright E2E test suite
- [ ] Visual regression baseline
- [ ] Performance benchmark suite
- [ ] Accessibility audit execution
- [ ] Load testing execution

**Inputs it needs:**
- Product Owner: acceptance criteria
- UX Architect: expected user flows
- Backend Architect: API contracts
- Security Engineer: security test cases
- All agents: their domain-specific edge cases

**Outputs it provides:**
- All agents: bug reports, edge cases discovered
- Product Owner: quality metrics, coverage reports
- DevOps Engineer: test pipeline requirements

---

## Agent 11: DevOps Engineer

**Role:** Infrastructure, deployment, CI/CD, monitoring

**Competencies:**
- Docker multi-stage builds (Rust + Next.js)
- Docker Compose for local development
- CI/CD pipeline design (GitHub Actions)
- Database migration management
- Monitoring and observability (metrics, logging, tracing)
- Performance monitoring (APM)
- Secret management
- SSL/TLS configuration
- Health check design
- Backup and disaster recovery

**Phase 1 Deliverables:**
- [ ] **Infrastructure Architecture**
  - Container topology diagram
  - Service dependencies
  - Network configuration
  - Volume management
- [ ] **CI/CD Pipeline Design**
  - Build → Lint → Test → Security Scan → Deploy
  - Branch strategy (trunk-based or gitflow)
  - Environment promotion (dev → staging → production)
- [ ] **Monitoring Plan**
  - Application metrics (request rate, error rate, latency)
  - Business metrics (active users, feature usage)
  - Infrastructure metrics (CPU, memory, disk)
  - Alert rules and escalation
- [ ] **Database Operations**
  - Migration strategy (per-tenant schema migrations)
  - Backup schedule and retention
  - Point-in-time recovery plan
- [ ] **Development Environment**
  - Docker Compose for local stack
  - Seed data scripts
  - Hot-reload configuration

**Phase 2 Deliverables:**
- [ ] Dockerfiles (multi-stage, optimized)
- [ ] Docker Compose (dev environment)
- [ ] CI/CD pipelines (GitHub Actions)
- [ ] Monitoring dashboards
- [ ] Deployment automation
- [ ] Database migration tooling

**Inputs it needs:**
- Backend Architect: service topology, dependencies
- Security Engineer: security configs, secrets
- QA Engineer: test pipeline requirements
- All agents: runtime requirements

**Outputs it provides:**
- All agents: running dev environment
- Backend Developer: database migration tooling
- QA Engineer: CI/CD test integration
- Security Engineer: infrastructure security posture

---

## Agent 12: Orchestrator

**Role:** Master coordinator — ensures agents work in harmony, resolves conflicts, maintains quality

**Competencies:**
- Project management (Agile, Kanban)
- Dependency graph management
- Conflict resolution (design vs. technical feasibility)
- Quality gate enforcement
- Cross-cutting concern identification
- Risk management
- Communication facilitation

**Phase 1 Deliverables:**
- [ ] **Master Schedule** — Gantt chart of agent deliverables with dependencies
- [ ] **Dependency Graph** — which deliverable blocks which
- [ ] **Review Protocol** — who reviews what, in what order
- [ ] **Quality Gates** — criteria to pass before moving to Phase 2
- [ ] **Conflict Resolution Log** — design vs. tech trade-off decisions
- [ ] **Risk Register** — identified risks with mitigation plans

**Phase 2 Deliverables:**
- [ ] Sprint planning and task assignment
- [ ] Cross-agent integration testing coordination
- [ ] Conflict resolution for implementation issues
- [ ] Progress tracking and reporting
- [ ] Final integration and release coordination

**This agent reviews EVERY deliverable from EVERY other agent before it's considered complete.**

---

## Agent Interaction Matrix

| Producer ↓ / Consumer → | PO | UX | UI | FE-Arch | FE-Dev | BE-Arch | BE-Dev | Security | RT | QA | DevOps |
|--------------------------|:--:|:--:|:--:|:-------:|:------:|:-------:|:------:|:--------:|:--:|:--:|:------:|
| **Product Owner**        | — | R | R | R | R | R | R | R | R | R | — |
| **UX Architect**         | V | — | R | R | R | — | — | — | — | R | — |
| **UI Designer**          | V | V | — | R | R | — | — | — | — | R | — |
| **FE Architect**         | — | V | V | — | R | R | — | — | V | R | — |
| **FE Developer**         | — | V | V | V | — | — | — | — | — | R | — |
| **BE Architect**         | V | — | — | R | — | — | R | R | R | R | R |
| **BE Developer**         | — | — | — | — | R | V | — | — | R | R | R |
| **Security Engineer**    | — | — | — | R | R | R | R | — | R | R | R |
| **RT Engineer**          | — | — | — | R | R | R | R | V | — | R | R |
| **QA Engineer**          | R | R | — | R | R | R | R | R | R | — | R |
| **DevOps Engineer**      | — | — | — | — | R | R | R | R | R | R | — |

**R** = Receives deliverables from this agent
**V** = Validates/reviews deliverables from this agent
