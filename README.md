# GammaHR

B2B HR operations platform for consulting firms with 50 to 500 employees.

Stack: Python 3.12 + FastAPI + PostgreSQL 16 on the backend. Next.js 15 + React 19 + Tailwind 4 on the frontend. PWA for mobile. Claude API for AI features.

Status: prototype complete. Production build in progress.

## For humans

- Vision, principles, stack: [`MASTER_PLAN.md`](MASTER_PLAN.md)
- Phase plan and dates: [`ROADMAP.md`](ROADMAP.md)
- Design spec and tokens: [`specs/DESIGN_SYSTEM.md`](specs/DESIGN_SYSTEM.md)
- Every page: [`specs/APP_BLUEPRINT.md`](specs/APP_BLUEPRINT.md)

## For agents

**Read [`CLAUDE.md`](CLAUDE.md) first and every session.** It is the contract between the founder and every Claude agent. All other docs are referenced from there.

## Directory layout

| Path | Contents |
|------|----------|
| `CLAUDE.md` | Agent contract, rules, feel, quality gate |
| `MASTER_PLAN.md` | Vision, stack, scope (time-less) |
| `ROADMAP.md` | Phases and target weeks (the only place dates live) |
| `specs/` | Product specs (design, app, data, AI, mobile) |
| `docs/` | Process specs (scope, gate, go-to-market, ADRs) |
| `agents/` | Agent roles and workflow |
| `prototype/` | Locked HTML visual reference |
| `frontend/` | Next.js 15 app (feature-first structure) |
| `backend/` | FastAPI app (feature-first structure) |
| `infra/` | Deployment and local dev |
| `old/` | Archived originals |
