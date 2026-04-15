# GammaHR

B2B HR operations platform for consulting firms with 50 to 500 employees. Premium feel (target: Revolut for HR), AI assistance throughout, EU-hosted.

**Stack:** Python 3.12 + FastAPI + PostgreSQL 16 (schema-per-tenant) on the backend. Next.js 15 + React 19 + Tailwind 4 + TanStack Query + Zustand on the frontend. PWA for mobile. Vertex AI Gemini (LLM-as-router pattern) for AI. Hosted on GCP `europe-west9` + Cloudflare + GitHub.

**Status:** prototype approved, data architecture locked across 102 decisions, Phase 2 foundation build is next.

---

## Start here (the three files you read in order)

If you are a new contributor, a returning founder, or an AI agent starting a fresh session, read these three files in order before anything else:

1. **[CLAUDE.md](CLAUDE.md)** — what GammaHR is, hard rules, the feel, the repository layout. This is the one-page contract. 5 minutes.
2. **[THE_PLAN.md](THE_PLAN.md)** — what to do next, phase by phase, week by week. The founder's execution plan. 10 minutes.
3. **[specs/DATA_ARCHITECTURE.md](specs/DATA_ARCHITECTURE.md) section 0 + 1** — the data model shape (schema-per-tenant + three-audience identity). 5 minutes.

That is enough context to start working. Everything else is reference material you pull when you need it.

---

## What to give the AI when

When you work with an AI assistant (Claude, Copilot, Cursor, or another model), the assistant does NOT need the whole repo every time. Feed it only the files relevant to the task. Use the table below.

### By task type

| What you are doing | Files the AI needs | Why |
|---|---|---|
| **Starting any work session** | `CLAUDE.md` + `THE_PLAN.md` | Hard rules + current phase task |
| **Building a UI page** | `specs/APP_BLUEPRINT.md` (the row for that page) + `prototype/<page>.html` + `specs/DESIGN_SYSTEM.md` + `specs/MOBILE_STRATEGY.md` | The page spec, visual target, design atoms, responsive rules |
| **Building a backend feature** | The relevant section of `specs/DATA_ARCHITECTURE.md` + `specs/APP_BLUEPRINT.md` (the row for the feature) + any relevant ADR from `docs/decisions/` | Schema, API contract, architecture rationale |
| **Adding AI features (OCR, command palette, insights)** | `specs/AI_FEATURES.md` + `specs/DATA_ARCHITECTURE.md` section 5 (AI layer) + the feature's `ai_tools.py` | Tool registry, budget rules, PII classification |
| **Importing customer data** | `docs/DATA_INGESTION.md` + `specs/DATA_ARCHITECTURE.md` section 2.5 (files, import_checkpoints) | CSV pipeline, validation, progress streaming |
| **Answering "should we build feature Y?"** | `docs/SCOPE.md` + `docs/DEFERRED_DECISIONS.md` + `THE_PLAN.md` (current phase) | Tier 1 vs Tier 2, deferred triggers, phase scope |
| **Answering "why did we decide X?"** | Relevant `docs/decisions/ADR-*.md` + `docs/DEFERRED_DECISIONS.md` | Decision history, deferred tradeoffs |
| **Pricing / sales / commercial questions** | `docs/GO_TO_MARKET.md` + `specs/DATA_ARCHITECTURE.md` section 7 (billing) | Pricing model, lifecycle, custom contracts |
| **Legal / GDPR / compliance questions** | `specs/DATA_ARCHITECTURE.md` section 8 (GDPR, retention) + relevant ADR | Data classification, retention, DPA, residency |
| **Deploying / infra questions** | `docs/decisions/ADR-008-deployment.md` + `specs/DATA_ARCHITECTURE.md` section 11 (hosting) | GCP + Cloudflare + GitHub stack details |
| **Running the quality gate before shipping** | `docs/FLAWLESS_GATE.md` + `prototype/<page>.html` | 15-item checklist + visual target |
| **Checking if a task fits the current phase** | `THE_PLAN.md` + `docs/SCOPE.md` | Phase task list, Tier 1/2 assignment |
| **Handling a production incident** | `specs/DATA_ARCHITECTURE.md` section 10.6 (rollback) + `docs/decisions/ADR-008-deployment.md` | Rollback playbook, infra map |

### The anti-pattern to avoid

Do not dump the whole `specs/` folder into every AI session. The specs total over 100 KB and you will burn context on irrelevant content. Pick the 2-4 files that match the task.

**Special case:** when you are doing an architectural review or a cross-cutting refactor, you may need more context. In that case, give the AI `CLAUDE.md` + `specs/DATA_ARCHITECTURE.md` (the biggest file, it anchors the whole data model) + whatever specific files relate to the change.

---

## File inventory (the full map, one line each)

**Repo root — strategic + execution (3 files):**

- [`README.md`](README.md) — you are here, the navigation hub
- [`CLAUDE.md`](CLAUDE.md) — agent contract, hard rules, core principles, tech stack, feel, repository layout (read first, every session)
- [`THE_PLAN.md`](THE_PLAN.md) — the founder's execution plan: phases 2 through 7, target weeks per phase, success criteria, slippage policy, weekly rhythm, emergency manual

**specs/ — what you are building (5 files):**

- [`specs/DATA_ARCHITECTURE.md`](specs/DATA_ARCHITECTURE.md) — the data model: tables, schemas, API conventions, feature gating, GDPR, migrations. The biggest spec, 1000+ lines.
- [`specs/APP_BLUEPRINT.md`](specs/APP_BLUEPRINT.md) — every page in the app, organized by route group (operator console, main app, portal)
- [`specs/AI_FEATURES.md`](specs/AI_FEATURES.md) — how AI is wired (Vertex AI Gemini, LLM-as-router pattern, 15-tool registry, budget and eval rules)
- [`specs/DESIGN_SYSTEM.md`](specs/DESIGN_SYSTEM.md) — design tokens, atoms, patterns (locked; never invent new atoms)
- [`specs/MOBILE_STRATEGY.md`](specs/MOBILE_STRATEGY.md) — PWA rules, breakpoints, shell transformations, offline scope (timesheet entry only)

**docs/ — how you are building it, scope, quality, legal (5 files + ADRs):**

- [`docs/DATA_INGESTION.md`](docs/DATA_INGESTION.md) — how customer data gets INTO the app: CSV imports, OCR pipeline, payroll export
- [`docs/DEFERRED_DECISIONS.md`](docs/DEFERRED_DECISIONS.md) — registry of 64 items you consciously deferred, with triggers and costs. Check before adding any new feature.
- [`docs/SCOPE.md`](docs/SCOPE.md) — Tier 1 vs Tier 2 feature lists, first-customer must-haves
- [`docs/FLAWLESS_GATE.md`](docs/FLAWLESS_GATE.md) — the 15-item quality checklist every Tier 1 feature must pass
- [`docs/GO_TO_MARKET.md`](docs/GO_TO_MARKET.md) — commercial plan: pricing, pilot program, billing infrastructure, launch checklist

**docs/decisions/ — architecture decision records (10 ADRs, each 1-10 KB):**

- [`docs/decisions/ADR-001-tenancy.md`](docs/decisions/ADR-001-tenancy.md) — schema-per-tenant PostgreSQL (why, how, consequences)
- [`docs/decisions/ADR-002-auth.md`](docs/decisions/ADR-002-auth.md) — JWT + passkey + MFA base auth (three-audience expansion in ADR-010)
- [`docs/decisions/ADR-003-state.md`](docs/decisions/ADR-003-state.md) — TanStack Query + Zustand boundary
- [`docs/decisions/ADR-004-realtime.md`](docs/decisions/ADR-004-realtime.md) — WebSocket + SSE + polling per-feature
- [`docs/decisions/ADR-005-storage.md`](docs/decisions/ADR-005-storage.md) — Google Cloud Storage + CMEK encryption
- [`docs/decisions/ADR-006-pdf.md`](docs/decisions/ADR-006-pdf.md) — WeasyPrint for invoice PDFs
- [`docs/decisions/ADR-007-backend-language.md`](docs/decisions/ADR-007-backend-language.md) — Python 3.12 + FastAPI rationale
- [`docs/decisions/ADR-008-deployment.md`](docs/decisions/ADR-008-deployment.md) — GCP + Cloudflare + GitHub hosting anchor
- [`docs/decisions/ADR-009-mobile.md`](docs/decisions/ADR-009-mobile.md) — PWA (not React Native)
- [`docs/decisions/ADR-010-three-app-model.md`](docs/decisions/ADR-010-three-app-model.md) — three subdomains, three identity tables, three auth stacks

**agents/ — how agents collaborate (1 file):**

- [`agents/AGENTS.md`](agents/AGENTS.md) — agent roles, pipeline, concurrency rules

**prototype/ — the frozen visual spec:**

- `prototype/*.html` — 19 HTML pages approved as the visual reference. Never edit except for visual bugs the founder flags.

---

## Directory layout

```
gammahr_v2/
├── README.md                    ← you are here, the navigation hub
├── CLAUDE.md                    ← agent contract, hard rules, core principles, feel
├── THE_PLAN.md                  ← what to do this week + phase tables + target weeks + success criteria
├── specs/                       ← what you are building (5 files)
│   ├── DATA_ARCHITECTURE.md     ← the data model (biggest file)
│   ├── APP_BLUEPRINT.md         ← every page
│   ├── AI_FEATURES.md           ← AI wiring
│   ├── DESIGN_SYSTEM.md         ← atoms + tokens (frozen)
│   └── MOBILE_STRATEGY.md       ← PWA rules
├── docs/                        ← how you are building it (5 files + ADRs)
│   ├── DATA_INGESTION.md        ← how customer data gets in
│   ├── DEFERRED_DECISIONS.md    ← 64 items deferred, with triggers
│   ├── SCOPE.md                 ← Tier 1 vs Tier 2
│   ├── FLAWLESS_GATE.md         ← 15-point quality checklist
│   ├── GO_TO_MARKET.md          ← commercial plan
│   └── decisions/               ← 10 ADRs, one per architecture decision
├── agents/                      ← agent roles + pipeline (1 file)
├── prototype/                   ← frozen visual reference (19 HTML pages)
├── frontend/                    ← Next.js 15 app
├── backend/                     ← FastAPI app
├── infra/                       ← deployment config
└── old/                         ← archived originals (never touch)
```

---

## The tenth reading: when you actually want to understand everything

If you ever want to fully load the project into your head, read in this order. Budget ~90 minutes.

1. `CLAUDE.md` (full) — 10 min
2. `THE_PLAN.md` (full, including the emergency manual) — 15 min
3. `specs/DATA_ARCHITECTURE.md` (full) — 30 min
4. `specs/APP_BLUEPRINT.md` (full) — 10 min
5. `specs/AI_FEATURES.md` (full) — 10 min
6. `docs/DEFERRED_DECISIONS.md` (skim for patterns, reference for specifics) — 10 min
7. `docs/decisions/ADR-001-tenancy.md` and `ADR-010-three-app-model.md` — 5 min each (the two load-bearing ADRs)

Skip on first pass: `docs/GO_TO_MARKET.md` (commercial, not technical), `specs/MOBILE_STRATEGY.md` (focused on responsive rules), ADR-002 through ADR-009 (shorter focused decisions, read when relevant), `docs/FLAWLESS_GATE.md` (reference when shipping), `docs/SCOPE.md` (reference when scoping), `specs/DESIGN_SYSTEM.md` (reference when building UI), `agents/AGENTS.md` (reference when running parallel agents).

---

## For agents

**Read [`CLAUDE.md`](CLAUDE.md) first and every session.** It is the contract between the founder and every AI agent working on GammaHR. All hard rules, the feel guide, and the repository layout live there. Every other doc in this repo is referenced from CLAUDE.md section 9.

The task tracker for the founder is [`THE_PLAN.md`](THE_PLAN.md). The task tracker for YOU (the agent session) should be the `TaskCreate` tool, not a markdown file.
