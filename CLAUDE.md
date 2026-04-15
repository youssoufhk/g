# CLAUDE.md

> **Read this first. Every session. Before any tool call.**
> This file is the contract between the founder and every Claude agent working on GammaHR.
> If something here conflicts with any other doc, this file wins. If this file is silent, consult the map in section 9.

---

## 1. What GammaHR is (30 seconds)

GammaHR is a premium B2B HR operations platform for consulting firms with 50 to 500 employees. It unifies time, projects, clients, expenses, invoices, leaves, and resource planning with AI assistance. The target feel is Revolut for HR: the app does the work, the user confirms.

Founder: non-technical product owner, 20 hours a week, native C++ background, very demanding quality bar.
Tech stack (locked): Python 3.12 + FastAPI + PostgreSQL 16 (schema-per-tenant) + Celery on the backend. Next.js 15 + React 19 + Tailwind 4 + TanStack Query + Zustand on the frontend. PWA for mobile. Vertex AI Gemini (EU-resident, LLM-as-router pattern with deterministic per-feature tools) for AI. Hosted on GCP `europe-west9` (Paris) with Cloudflare in front for DNS, WAF, CDN, and Access, and GitHub for repo and CI.
First customer target: ~201 employees, ~120 clients, EU-based consulting firm. See `specs/DATA_ARCHITECTURE.md` section 12.10 for the canonical seed data breakdown (1 owner, 2 admins, 4 finance, 15 managers, 177 employees, 2 readonly; 260 projects, 52 weeks of timesheets, 700 leaves, ~8,400 expenses, 900 invoices/year; HSBC UK as a GBP-billing client).

---

## 2. Hard rules (non-negotiable)

Break any of these and your work gets reverted.

1. **Never touch `gammahr/`.** All work happens in `gammahr_v2/`. The `gammahr/` folder is off limits.
2. **Never edit `prototype/` except visual bugs the founder flags.** The prototype is the approved visual spec. It is frozen.
3. **Never modify design tokens.** `prototype/_tokens.css` is locked. Mirror it, never rewrite it. Sidebar is 224px, not 240. Primary is `hsl(155, 26%, 46%)`. Surfaces are `--color-surface-0..3`, not `--color-bg-0..3`.
4. **Never invent atoms.** If it is not in `specs/DESIGN_SYSTEM.md`, stop and ask. New atoms go through the founder.
5. **Never use em dashes.** Use hyphens or restructure the sentence. The founder hates them. Anywhere: code, docs, UI strings, commit messages.
6. **Never use the word "utilisation".** Use "work time", "capacity", or "contribution".
7. **Never hand-edit the sidebar in individual pages.** It lives in one shared component. If you need a change, change the shared component.
8. **Never add animations, sparklines, 3D, or decorative flourishes.** Only fix what is broken, wrong, or missing. The founder will run dedicated polish passes separately.
9. **Never commit without the founder asking.** No `git commit`, no `git push` unless explicitly told.
10. **Never skip CI, skip hooks, or pass `--no-verify`.** Fix the underlying issue.
11. **Never invent API endpoints or data contracts.** If the spec is silent, ask.
12. **Never batch more than 3 subagents at once.** Rate limits matter.

---

## 3. The feel and the core principles

Agents tend to ship "correct but dead" work. Do not.

### 3.1 The five feel qualities

- **Calm.** No clutter, no noise, no unnecessary chrome. White space is a feature.
- **Ease.** Every screen says "here is what you need, here is what to do next." Zero dead ends. Every employee, client, project is a clickable link from anywhere.
- **Completeness.** No placeholders, no "coming soon", no half-states. Empty, loading, and error states are designed, not afterthoughts.
- **Anticipation.** The app pre-fills, pre-filters, pre-ranks. The user confirms, rarely types.
- **Consistency.** One card size. One filter bar. One row height. One button height. Shell pixel-identical on every page.

If in doubt, open `prototype/dashboard.html` and ask: does my work feel like it belongs on the same page as that?

### 3.2 The ten core principles (time-less design rules)

1. **Design first, code never**, until the blueprint is perfect.
2. **The app does the work. The user confirms.**
3. **Zero dead ends.** Every entity reference is a link from anywhere.
4. **One canonical way per pattern.** No variants per page.
5. **Flawless before next.** No feature moves forward until the current one passes the gate.
6. **Mobile is first-class.** PWA-ready, bottom nav, quick actions.
7. **AI is a shell element, not a destination page.**
8. **Speed is a feature** (perceived and actual).
9. **Dark mode is home. Light mode is the variant.**
10. **Security is invisible but robust.**

These are non-negotiable. If a design or implementation violates one of these, stop and reconsider.

---

## 4. Repository layout

```
gammahr_v2/
  README.md                  <- entry point for humans, navigation hub
  CLAUDE.md                  <- this file, the agent contract
  THE_PLAN.md                <- week-by-week execution plan, phases 2-7, target weeks, success criteria
  specs/                     <- what we are building
    DESIGN_SYSTEM.md         <- tokens, atoms, patterns (LOCKED)
    APP_BLUEPRINT.md         <- every page, every flow
    DATA_ARCHITECTURE.md     <- entities, tenancy, API contracts
    AI_FEATURES.md           <- Vertex AI Gemini integration, tool registry
    MOBILE_STRATEGY.md       <- PWA + responsive rules
  docs/                      <- how we are building it
    DATA_INGESTION.md        <- CSV imports, OCR pipeline, payroll export
    DEFERRED_DECISIONS.md    <- DEF-NNN registry, check before adding any feature
    SCOPE.md                 <- Tier 1 vs Tier 2
    FLAWLESS_GATE.md         <- the quality gate
    GO_TO_MARKET.md          <- commercial plan
    decisions/               <- ADRs 001-010
  agents/                    <- how agents collaborate
    AGENTS.md                <- roles + pipeline
  prototype/                 <- locked visual reference, 19 HTML pages
  frontend/                  <- Next.js 15 app (see section 5)
  backend/                   <- FastAPI app (see section 6)
  infra/                     <- docker-compose, deploy config
  old/                       <- archived originals
```

---

## 5. Frontend structure (Next.js 15, feature-first)

Every feature owns its own folder. The `app/` tree contains only page shells.

```
frontend/
  app/
    [locale]/
      (ops)/                          <- operator console, ops.gammahr.com
        layout.tsx, login, dashboard, tenants, billing, flags, kill-switches, migrations, legal
      (app)/                          <- main tenant app, app.gammahr.com
        layout.tsx                    <- shell (sidebar + topbar + bottom nav)
        dashboard/
        employees/, employees/[id]/
        clients/, clients/[id]/
        projects/, projects/[id]/
        timesheets/, timesheets/[week_id]/
        leaves/
        expenses/
        approvals/
        invoices/, invoices/[id]/
        admin/
        account/
        calendar, gantt, planning, hr, insights  <- Tier 2 pages within (app)
      (portal)/                       <- client portal, portal.gammahr.com (Phase 6)
        layout.tsx, login, invoices
      layout.tsx                      <- providers, theme, i18n
  components/
    ui/                               <- design system atoms (one file per atom)
    patterns/                         <- EmptyState, FilterBar, StatPill, ListPage, ConflictResolver, JobProgress
    shell/                            <- sidebar, topbar, bottom-nav, command-palette
    charts/                           <- Visx wrappers
  features/                           <- one folder per business domain
    employees/
      employees-table.tsx
      employee-profile.tsx
      use-employees.ts                <- TanStack Query hooks
      schemas.ts                      <- Zod forms
      types.ts
      ai_tools.py                     <- per-feature AI tool definitions for the LLM-as-router pattern (backend side)
    timesheets/...
    expenses/...
    leaves/...
    invoices/...
    clients/...
    projects/...
    approvals/...
    imports/...                       <- CSV onboarding + ongoing imports + AI column mapper
  lib/
    api-client.ts                     <- TanStack Query setup, 402/409 error handling
    optimistic.ts                     <- useOptimisticMutation wrapper, three-layer 409 resolution
    offline.ts                        <- tenant-scoped IndexedDB queue for timesheet entries
    realtime.ts                       <- WebSocket singleton + reconnect logic
  hooks/
  stores/                             <- Zustand
  styles/
    tokens.css                        <- byte-exact mirror of prototype/_tokens.css (sync via `npm run sync-tokens`)
    globals.css                       <- @import tailwindcss + @theme inline bridge
  messages/en.json, fr.json           <- next-intl
  middleware.ts                       <- next-intl locale routing
  tests/e2e, tests/visual
```

Tailwind 4 is CSS-first: no `tailwind.config.ts`. Theme tokens are declared via `@theme inline` in `styles/globals.css`, referencing the CSS variables in `tokens.css`. The prototype file stays the single source of truth; `[data-theme="light"]` overrides flow through automatically.

**Golden rule:** pages in `app/` are thin. Real code lives in `features/`. Shared chrome lives in `components/`.

---

## 6. Backend structure (FastAPI, feature modules)

```
backend/
  app/
    main.py                           <- router mounting, middleware
    core/
      config.py, security.py, database.py
      tenancy.py                      <- search_path middleware
      rate_limit.py, audit.py, errors.py, logging.py
    features/                         <- one folder per business domain
      auth/
        routes.py
        schemas.py                    <- Pydantic in/out
        service.py                    <- business logic
        models.py                     <- SQLAlchemy
        tests/
      employees/...
      clients/...
      projects/...
      timesheets/...
      leaves/...
      expenses/
        routes.py, schemas.py, service.py, models.py
        ocr.py                        <- uses ai.client
        tests/
      invoices/
        routes.py, service.py, models.py
        pdf.py                        <- WeasyPrint templates
        tests/
      approvals/...
      imports/                        <- CSV bulk onboarding
        routes.py, service.py, tasks.py, validators.py
      dashboard/..., admin/...
    ai/
      client.py                       <- Vertex AI Gemini wrapper, budget enforcement, kill-switch gate
      prompts/*.jinja                 <- Jinja2 templates with versioned filenames
      evals/                          <- golden-example eval suite, blocks merge on regression
      models.py                       <- model ID constants (MODELS.DEFAULT, MODELS.VISION)
    tasks/
      celery_app.py, schedules.py
    events/
      websocket.py, publisher.py
  migrations/
    env.py, runner.py, versions/
  tests/
    conftest.py, factories.py
```

**Golden rule:** cross-feature calls go through another feature's `service.py`, never reach into its models. Schema changes only via migrations.

---

## 7. Quality gate (the 15 that actually matter)

The full list is in `docs/FLAWLESS_GATE.md`. If you only have time for 15, run these:

1. Matches `prototype/<page>.html` visually at 1440px
2. No horizontal scroll at 320px width
3. Dark mode and light mode both look polished
4. Empty state, loading state, and error state are all designed
5. Every interactive element is keyboard reachable with a visible focus ring
6. Cmd+K command palette opens from this page
7. Every employee, client, and project reference is a link
8. No hardcoded strings (all via next-intl, EN and FR)
9. Every mutation is audited
10. Every API call goes through RBAC and tenant scoping
11. Every query has an index; no N+1
12. Playwright E2E covers the golden path
13. No new atoms introduced (use `components/ui/` as-is)
14. No em dashes, no "utilisation", no decorative flourishes
15. The founder can look at it and say "this feels like GammaHR"

If any of 1-14 fails, you stop and fix. If 15 fails, you go back and think about why.

---

## 8. How to work on a task

1. **Read CLAUDE.md (this file).**
2. **Read the feature spec** in `specs/APP_BLUEPRINT.md`.
3. **Read the prototype reference** HTML file for that page.
4. **Check memory** at `/home/kerzika/.claude/projects/-home-kerzika-ai-workspace-claude-projects-gammahr-v2/memory/MEMORY.md`.
5. **Pick the smallest next change** that moves the feature forward.
6. **Build it** using only existing atoms and existing services.
7. **Run the quality gate** (section 7 above).
8. **Report back** in under 300 words: what you changed, what you verified, what is left.

When unsure: **stop and ask the founder.** Do not guess. Do not invent. Do not ship silent changes.

---

## 9. Document map (where to look)

| If you need... | Read... |
|----------------|---------|
| What to do this week, phases, target weeks, success criteria, emergency manual | `THE_PLAN.md` |
| The project entry point and navigation hub | `README.md` |
| Colors, spacing, atoms, shell | `specs/DESIGN_SYSTEM.md` (+ `prototype/_tokens.css`) |
| What a page does | `specs/APP_BLUEPRINT.md` |
| Entities, tenancy, APIs, migrations, GDPR, feature gating | `specs/DATA_ARCHITECTURE.md` |
| Where AI lives, tool registry, budget, evals | `specs/AI_FEATURES.md` |
| Responsive rules, PWA, offline scope | `specs/MOBILE_STRATEGY.md` |
| How customer data gets INTO the app (CSV imports, OCR, payroll export) | `docs/DATA_INGESTION.md` |
| What we consciously chose NOT to do in v1.0, with triggers to revisit | `docs/DEFERRED_DECISIONS.md` |
| What is in v1.0 vs v1.1, first-customer must-haves | `docs/SCOPE.md` |
| Quality checklist (15 items per Tier 1 feature) | `docs/FLAWLESS_GATE.md` |
| Commercial plan, pricing, pilot program | `docs/GO_TO_MARKET.md` |
| Why a decision was made | `docs/decisions/ADR-*.md` |
| Agent roles and workflow | `agents/AGENTS.md` |
| The visual spec (frozen) | `prototype/*.html` |

---

## 10. Honest caveats

- Target weeks in `THE_PLAN.md` are optimistic. Solo founders miss by 2x. Do not pretend otherwise.
- Performance targets ("p95 <100ms", "OCR <15s") are goals, not measured baselines.
- Cost targets in `specs/AI_FEATURES.md` are estimates until we measure real usage.
- `docs/FLAWLESS_GATE.md` is pruned to 15 items. Section 7 of this file mirrors it. If the two ever drift, the gate doc wins.
- The agent roster in `agents/AGENTS.md` is aspirational. In practice one general-purpose agent does most tasks; the roster is a mental model, not a real org chart.

Everything else in the specs is the intent. Build toward it. When reality disagrees, update the specs, not your memory of them.
