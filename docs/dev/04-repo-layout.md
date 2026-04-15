# 4. Repo layout

Where files live. The top-level directories are grouped by what they do.

```
gammahr_v2/                  <- repo root
│
├── CLAUDE.md                <- the agent contract, hard rules, read first
├── README.md                <- project entry point
├── THE_PLAN.md              <- week-by-week plan, phase targets, bandwidth
├── EXECUTION_CHECKLIST.md   <- agent-facing: what to build next (~900 lines)
├── FOUNDER_CHECKLIST.md     <- founder-only: runway, pipeline, paperwork
├── PROMPT.md                <- starter prompt for a fresh Claude Code session
├── Makefile                 <- every "make X" target you use
├── .pre-commit-config.yaml  <- 9 hooks: secrets, em dashes, etc.
│
├── specs/                   <- what we are building (locked source of truth)
│   ├── DESIGN_SYSTEM.md     <- atoms, tokens, patterns
│   ├── APP_BLUEPRINT.md     <- every page, every flow
│   ├── DATA_ARCHITECTURE.md <- entities, tenancy, API contracts (1300+ lines)
│   ├── AI_FEATURES.md       <- AI tools, 24-analyzer library, eval rules
│   └── MOBILE_STRATEGY.md   <- PWA + responsive rules
│
├── docs/                    <- how we are building it
│   ├── dev/                 <- YOU ARE HERE (this folder)
│   ├── runbooks/            <- operational procedures (GCP, tenants, etc.)
│   ├── decisions/           <- ADR-001 through ADR-010
│   ├── founder/             <- founder-private notes (runway, pipeline)
│   ├── incidents/           <- incident post-mortems
│   ├── FLAWLESS_GATE.md     <- 15-item quality gate
│   ├── MODULARITY.md        <- M1 through M10 modularity rules
│   ├── TESTING_STRATEGY.md  <- 6 testing layers
│   ├── SCOPE.md             <- Tier 1 vs Tier 2 vs anti-scope
│   ├── GO_TO_MARKET.md      <- positioning, pricing, pilot plan
│   ├── DEFERRED_DECISIONS.md<- DEF-001 through DEF-075 with triggers
│   ├── BILLING_LIFECYCLE.md
│   ├── DATA_RETENTION.md
│   ├── MIGRATION_PATTERNS.md
│   ├── COUNTRY_PLAYBOOKS.md
│   ├── COMPLIANCE.md
│   ├── DEGRADED_MODE.md
│   └── ROLLBACK_RUNBOOK.md
│
├── prototype/               <- LOCKED visual reference, HTML pages, never edit
│
├── backend/                 <- FastAPI + SQLAlchemy + Alembic app
│   ├── pyproject.toml       <- Python dependencies
│   ├── alembic.ini
│   ├── Dockerfile.dev       <- used by docker-compose.dev.yml
│   ├── .env.example         <- template; copy to .env for local venv use
│   ├── app/
│   │   ├── main.py          <- FastAPI entrypoint, middleware, router mounts
│   │   ├── core/            <- config, database, tenancy, security, errors
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── tenancy.py   <- search_path middleware, schema-per-tenant
│   │   │   ├── security.py  <- JWT helpers
│   │   │   ├── errors.py
│   │   │   ├── audit.py
│   │   │   └── feature_registry.py
│   │   ├── features/        <- one folder per business domain
│   │   │   ├── auth/
│   │   │   ├── admin/       <- operator console routes
│   │   │   ├── employees/
│   │   │   ├── clients/
│   │   │   ├── projects/
│   │   │   ├── timesheets/
│   │   │   ├── leaves/
│   │   │   ├── expenses/
│   │   │   ├── invoices/
│   │   │   ├── approvals/
│   │   │   ├── imports/
│   │   │   └── dashboard/
│   │   ├── ai/              <- AIClient Protocol + MockAIClient + OllamaAIClient
│   │   │   ├── client.py
│   │   │   └── evals/       <- AI eval harness
│   │   ├── storage/         <- BlobStorage wrapper (M1)
│   │   ├── email/           <- EmailSender wrapper (M1)
│   │   ├── pdf/             <- PDFRenderer wrapper (M1)
│   │   ├── billing/         <- PaymentProvider wrapper (M1)
│   │   ├── tax/             <- TaxCalculator + per-country rules
│   │   ├── ocr/             <- VisionOCR wrapper (M1)
│   │   ├── monitoring/      <- TelemetryClient wrapper (M1)
│   │   ├── notifications/   <- NotificationProvider wrapper (M1)
│   │   ├── events/bus.py    <- in-process event bus (M5)
│   │   └── tasks/celery_app.py
│   ├── migrations/
│   │   ├── env.py           <- Alembic env, async + per-tenant
│   │   └── versions/        <- migration files (YYYYMMDD_HHMM_*.py)
│   ├── tests/               <- pytest suite
│   ├── scripts/             <- one-off tools (generate_demo_seed.py)
│   └── fixtures/demo/       <- committed deterministic seed CSVs
│
├── frontend/                <- Next.js 15 + React 19 + Tailwind 4 + TypeScript
│   ├── package.json         <- JS dependencies
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile.dev       <- used by docker-compose.dev.yml
│   ├── middleware.ts        <- next-intl locale routing
│   ├── app/                 <- Next.js App Router
│   │   ├── layout.tsx       <- root shell
│   │   └── [locale]/        <- en and fr routes
│   │       ├── layout.tsx
│   │       ├── (app)/       <- main tenant app (sidebar + topbar + bottom nav)
│   │       │   ├── layout.tsx
│   │       │   └── dashboard/page.tsx
│   │       └── (ops)/       <- operator console (different chrome)
│   │           ├── layout.tsx
│   │           ├── tenants/page.tsx
│   │           └── flags/page.tsx
│   ├── components/
│   │   ├── ui/              <- 20 design system atoms (Button, Card, Modal, ...)
│   │   ├── patterns/        <- composite patterns (EmptyState, StatPill, ...)
│   │   ├── shell/           <- sidebar, topbar, bottom-nav, app-shell
│   │   └── providers.tsx    <- TanStack Query, Zustand setup
│   ├── features/            <- one folder per business domain (mirrors backend)
│   ├── lib/                 <- api-client, optimistic, realtime, offline, i18n
│   ├── styles/              <- tokens.css (mirrored from prototype), globals.css
│   ├── messages/            <- en.json, fr.json (next-intl translations)
│   └── tests/
│       └── e2e/             <- Playwright scenarios
│
├── infra/
│   ├── docker/              <- dev stack: docker-compose.dev.yml + postgres/init
│   └── ops/                 <- Python library for GCP automation (post-MVP)
│
├── scripts/
│   ├── setup/bootstrap-dev.sh        <- one-time machine setup
│   └── hooks/                        <- pre-commit hook scripts
│
├── .claude/
│   └── skills/              <- agent skills (build-page, commit, scaffold-*)
│
├── .github/workflows/       <- CI pipelines (pre-commit, backend, frontend)
│
├── agents/AGENTS.md         <- agent roles and collaboration model (aspirational)
│
└── old/                     <- archive of pre-v2 content, never edit
```

## Where to look first for a given task

| You want to... | Look here |
|---|---|
| Change the dashboard page | `frontend/app/[locale]/(app)/dashboard/page.tsx` |
| Change a button style | `frontend/components/ui/button.tsx` |
| Add a new API endpoint | `backend/app/features/<feature>/routes.py` |
| Change the database schema | `backend/migrations/versions/` (create a new migration) |
| Change how tenants are resolved | `backend/app/core/tenancy.py` |
| Add a new design token | `prototype/_tokens.css` (LOCKED - ask founder first) |
| Add a new design atom | `frontend/components/ui/` (ask founder first per CLAUDE.md rule 4) |
| Change the AI client | `backend/app/ai/client.py` |
| Add a new feature flag | `backend/app/features/<feature>/__init__.py` (registry.register) |
| Change the 5-service dev stack | `infra/docker/docker-compose.dev.yml` |
| Change a Python dependency | `backend/pyproject.toml` then `make dev-reset` |
| Change a JS dependency | `frontend/package.json` then `make dev-reset` |

## Where NOT to write new files

- `prototype/` - locked visual reference. Never touch unless the founder flags a visual bug.
- `old/` - archived originals from before v2. Historical record.
- `specs/` - locked source-of-truth. Changes go through a founder review.
- `FOUNDER_CHECKLIST.md` - the founder's private task list, agents never touch it.
- `docs/founder/**/*.local.md` - gitignored private founder notes.
- The root-level `.claude/settings.local.json` - gitignored personal settings.

## Naming conventions

- **Files**: lower case with hyphens for TSX (`filter-bar.tsx`), snake_case for Python (`feature_registry.py`).
- **Feature modules**: `backend/app/features/<noun>/` and `frontend/features/<noun>/` with the same `<noun>` (M9 rule).
- **Migration files**: `YYYYMMDD_HHMM_<slug>.py` (Alembic auto-generates from the revision id, we use a timestamp slug instead of the default hash for readability).
- **Atoms**: always a single concept (`card.tsx` not `ui-card.tsx`). Exported from `frontend/components/ui/index.ts`.
- **Tests**: `test_<module>.py` (Python), `<module>.test.ts` or `<module>.test.tsx` (TypeScript).
