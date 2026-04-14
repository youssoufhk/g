# MASTER PLAN

> Time-less reference. Vision, stack, scope principles. Dates live only in `ROADMAP.md`.

---

## 1. Vision

GammaHR is a premium B2B HR operations platform for consulting firms with 50 to 500 employees. Time, projects, clients, expenses, invoices, leaves, and resource planning unified under one design language and one AI shell. Target feel: Revolut for HR. The app does the work, the user confirms.

Target user: HR admin or ops lead at a 50 to 500 employee consulting firm spending 10+ hours per week on approvals and rebalancing.

First paying customer: consulting firm with 200 employees and 100 clients, EU-based.

---

## 2. Core principles

1. Design first, code never, until the blueprint is perfect.
2. The app does the work. The user confirms.
3. Zero dead ends. Every entity reference is a link from anywhere.
4. One canonical way per pattern. No variants per page.
5. Flawless before next. No feature moves forward until the current one passes the gate.
6. Mobile is first-class. PWA-ready, bottom nav, quick actions.
7. AI is a shell element, not a destination page.
8. Speed is a feature (perceived and actual).
9. Dark mode is home. Light mode is the variant.
10. Security is invisible but robust.

---

## 3. Tech stack (locked)

### Backend

| Layer | Choice |
|-------|--------|
| Language | Python 3.12 |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 async |
| Validation | Pydantic v2 |
| Migrations | Alembic |
| Testing | pytest + pytest-asyncio + httpx |
| Queue | Celery + Redis |
| PDF | WeasyPrint |
| AI | Anthropic Python SDK (Claude API) |

### Infra

| Layer | Choice |
|-------|--------|
| Database | PostgreSQL 16, schema-per-tenant |
| Cache + pub/sub | Redis 7 |
| Search | Meilisearch |
| Storage | S3-compatible (MinIO dev, Cloudflare R2 or AWS S3 prod) |
| Email | Resend |
| Observability | OpenTelemetry + Grafana Cloud |
| Deployment | Vercel (frontend) + Fly.io (backend + worker); see ADR-008 |

### Frontend

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| React | 19 |
| Styling | Tailwind CSS 4 + CSS variables from prototype tokens |
| Server state | TanStack Query |
| Client state | Zustand |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| Charts | Visx |
| Component docs | Storybook |
| Testing | Vitest + Playwright |
| PWA | next-pwa |
| i18n | next-intl (EN, FR) |

### Auth

- JWT access tokens (15 min) + opaque refresh tokens (7 days), rotated on every use
- WebAuthn passkeys (preferred)
- TOTP MFA fallback with hashed recovery codes
- Rate limits on all auth endpoints

---

## 4. Scope principle

Two tiers plus deferred. See `docs/SCOPE.md` for the full lists.

- **Tier 1 (flagship, gate-enforced):** Auth, Onboarding, Employees, Clients, Projects, Timesheets, Leaves, Expenses, Approvals, Invoices, Admin, Account, Dashboard, Command Palette.
- **Tier 2 (functional, polished in v1.1):** Calendar, Gantt, Resource Planning, HR module, AI Insights page, Client Portal, Real-time.
- **Deferred:** native mobile app, languages beyond EN/FR, third-party integrations, marketplace, advanced reporting.

Tier 1 must pass `docs/FLAWLESS_GATE.md`. Tier 2 must work and look consistent. Deferred items do not exist yet.

---

## 5. Success criteria

### Measurable
- Lighthouse performance >= 90 on every page
- API p95 < 100 ms on reference seed dataset (target, not baseline)
- Bulk CSV import: 200 employees in < 60 s (target)
- Timesheet submission: < 2 min for a full week (goal)
- Expense submission: < 30 s with OCR (goal)
- Zero flaky tests in CI
- Lighthouse PWA score >= 95

### Subjective (founder gate)
- Every page feels like the same app
- Zero dead ends
- Dark mode default looks polished; light mode is complete
- Visual parity with `prototype/` verified side-by-side

---

## 6. Document map

| Topic | File |
|-------|------|
| Agent contract and rules | `CLAUDE.md` |
| Phases and dates | `ROADMAP.md` |
| Design tokens, atoms, patterns | `specs/DESIGN_SYSTEM.md` |
| Every page | `specs/APP_BLUEPRINT.md` |
| Entities, tenancy, APIs | `specs/DATA_ARCHITECTURE.md` |
| AI features | `specs/AI_FEATURES.md` |
| Responsive and PWA | `specs/MOBILE_STRATEGY.md` |
| Tier 1 vs Tier 2 | `docs/SCOPE.md` |
| Quality gate | `docs/FLAWLESS_GATE.md` |
| Commercial plan | `docs/GO_TO_MARKET.md` |
| Architecture decisions | `docs/decisions/ADR-*.md` |
| Agent workflow | `agents/AGENTS.md` |
| Visual reference | `prototype/*.html` |
