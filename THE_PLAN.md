# THE PLAN

> **Read this file before every work session. No exceptions.**
> This is the founders' stick-to-it plan. The planning is done. No more "let me think about it." Execute in order.
> If reality disagrees with this plan, update this file explicitly, do not silently drift.
> Last updated: 2026-04-15 (after the 15-round data architecture planning session locked 102 decisions + the spec rewrite, then the harsh-review pass added the realistic schedule, the bandwidth math, the customer-validation gate, and the post-launch playbook; then the Gamma repositioning + co-founder pass recalibrated the team, the realistic column, SOC 2 timing, DR drill cadence, and the month-end close agent scaffolding).

---

## Why this file exists

You spent a planning session locking every architectural decision you need to ship v1.0. The outcome lives in six permanent spec files:

- `specs/DATA_ARCHITECTURE.md` - the data model
- `specs/APP_BLUEPRINT.md` - every page
- `specs/AI_FEATURES.md` - how AI is wired (Vertex AI Gemini, LLM-as-router pattern)
- `docs/DATA_INGESTION.md` - how customer data gets INTO the app (CSV imports, OCR, payroll export)
- `docs/DEFERRED_DECISIONS.md` - the 64 items you consciously deferred, with triggers to revisit
- `docs/decisions/ADR-001` through `ADR-010` - architecture rationale

You are **done planning**. This file tells you what to do each week to ship v1.0. It ends when you have one paying customer live in production and no P0 bugs for 30 consecutive days.

---

## The five commandments (read before every work session)

See `CLAUDE.md` section 2 for the full 11 hard rules. The commandments below are planning-specific additions, not duplicates. Break any of these and you are re-planning, which is the thing you promised yourself not to do.

1. **Do not re-open locked decisions.** The 102 decisions in the spec files are closed. If you think one is wrong, open a PR that updates the spec file with explicit reasoning, then refer back to it. No silent drift.
2. **Work one Tier 1 feature at a time.** Finish it to the flawless gate before starting the next. Parallel work on Tier 1 features is how quality slips.
3. **Defer means defer.** Every item in `docs/DEFERRED_DECISIONS.md` has a trigger. Do not revisit it before the trigger fires. Write the DEF-NNN in code comments so future-you can find the context.
4. **Match the prototype.** `prototype/*.html` is the visual spec. No inventing new atoms. If a new atom is needed, stop and ask before building it.

---

## Where you are right now

**Phase 1 (Foundation docs) is DONE** as of 2026-04-15. All specs, ADRs, and the deferred decisions registry are final. The data-architecture planning progress file has been deleted; its content migrated into the permanent files above.

**Phase 2 (Foundation build track) is DONE** as of 2026-04-15. Local dev stack, backend skeleton, tenancy middleware, 9 vendor wrappers M1 with stubs, multi-country scaffolding (FR+UK), frontend shell (sidebar 224, topbar, bottom nav), 20 atoms + 3 patterns, testing infrastructure (45 backend tests pass, property + contract, AI eval harness skeleton, Playwright config, CI workflow), operator console minimum. Nine commits landed on `main`; see `git log --oneline -- backend/ frontend/ infra/docker/ Makefile`.

**Phase 2 deploy track is deferred to post-MVP.** GCP provisioning, vendor-wrapper swap to real implementations, first staging deploy, and DR drill all moved to `EXECUTION_CHECKLIST.md` §16 Deploy Track, founder-triggered after Phase 5a MVP is demo-ready.

**Phase 3a (MVP onboarding critical path) is NEXT for the agent.** JWT claim wiring into the tenancy middleware, onboarding wizard, CSV import module, AI column mapper, password + Google OIDC login, operator console live wiring. See `EXECUTION_CHECKLIST.md` §4.1.

---

## Target weeks per phase

**Week 0 = production build kickoff** (not prototype start). All week numbers are **targets**, not guarantees.

There are **two columns** below: an *optimistic* one (the original plan's wishful estimate) and a *realistic* one derived from the team bandwidth math in the next section. The realistic column is the one to plan against. The optimistic column stays in the table only because it is what every prior version of this file used; do not delete it, but do not believe it either.

**Realistic weeks assume two founders, ~12 h/week each productive after all-in overhead and coordination. Solo-founder ceilings (the original realistic column from the 2026-04-15 harsh review) are retained below the table so we remember the cost of losing a founder. Two founders do NOT halve the schedule; coordination and review overhead eat ~35-40% of the theoretical speedup.**

| Phase | Optimistic weeks | **Realistic weeks (2 founders)** | Theme | Exit criteria |
|-------|-----------------:|---------------------------------:|-------|---------------|
| 0 | done | done | Prototype | All 19 HTML pages approved |
| 1 | done (2026-04-15) | done (2026-04-15) | Foundation docs | All specs + ADRs final, deferred registry extracted (DEF-001 to DEF-064) |
| 2 | 4 to 7 | **6 to 9** | Foundation build | **(build track DONE 2026-04-15)** Local dev infrastructure + FastAPI scaffold + Next.js scaffold + migration runner + 9 vendor wrappers M1 + tenancy middleware + audit log trigger + event bus + feature registry + atom layer (20 atoms) + shell + 45 backend tests + containerized dev stack. GCP setup and first staging deploy moved to §16 Deploy Track in EXECUTION_CHECKLIST.md (founder-triggered after MVP is demo-ready). Cmd+K palette, notifications drawer, ConflictResolver, EntitlementLock deferred to the Phase 5a feature that needs them.
| 3 | 8 to 11 | **8 to 13** | Auth + onboarding + full operator console | OIDC + passkey + password auth paths, onboarding wizard with AI column mapper, full operator console |
| 4 | 12 to 15 | **13 to 18** | Core data + Dashboard pass 1 | Employees, clients, projects, dashboard scaffold. **Customer-validation gate clears here (see "Validated lead gate" below).** |
| 5 | 16 to 24 | **20 to 32** | Core modules | Timesheets (week-as-entity), leaves, expenses (OCR), invoices (PDF) + month-end close agent full implementation, approvals, admin, account, dashboard pass 2, payroll export, ongoing imports, first-contact UX hardenings |
| 6 | 25 to 34 | **32 to 42** | Tier 2 + portal | Calendar, Gantt, resource planning, HR module, insights page, client portal. **SOC 2 Type 1 audit kickoff (parallel to Tier 2 build).** |
| 7 | 35 to 42 | **42 to 54** | Hardening + launch | Security audit, perf pass, beta onboarding, docs, public launch, **SOC 2 Type 1 certification by customer 3-4** |

**Read this twice:** the realistic total with two founders is **42 to 54 weeks** (10 to 13 calendar months from week 0 to public launch). The optimistic total of 35 to 42 weeks (8 to 10 months) is still too aggressive; the bottom-up math below shows why.

**If solo-founder reality returns** (co-founder drops out, leaves, or cannot commit): fall back to the original realistic column from the 2026-04-15 harsh review: Phase 2 **6 to 10**, Phase 3 **12 to 18**, Phase 4 **20 to 26**, Phase 5 **30 to 46**, Phase 6 **48 to 60**, Phase 7 **62 to 72** (15 to 18 calendar months). The cost of losing one founder is roughly 20 extra calendar weeks and a forced Tier 2 scope cut. Keep this fallback visible so the team knows what is at stake.

### Why the realistic column

The realistic numbers come from these adjustments to the optimistic baseline:

1. **Combined productive build time per week is 24 to 34 hours, not 40-60.** Two founders at "20-30 hours/week nominal" each still have to handle customer discovery (shared 50/50 from Phase 4), pilot management (shared in Phase 6+), weekly logs and cross-doc maintenance, founder review sessions for the flawless gate, learning curve, and ~10% lost to vacations, sickness, and life. Add ~15% coordination overhead (syncs, code review, decision alignment) between founders. Net combined productive build time = **24 to 34 hours/week**.
2. **Phase 5 has 10 distinct features**, each at the flawless gate. Optimistic was "1 feature/week", which is still impossible at two-founder cadence because quality gates do not parallelize: one person builds, the other reviews. Bottom-up with two-founder parallelism: average 2 weeks/feature × 10 features = 20 weeks, with hard items (invoices + month-end close agent, approvals, week-as-entity timesheets) eating 3-4 weeks each. Realistic Phase 5 floor = 20 weeks, ceiling = 32.
3. **Phase 2 includes the entire shell infrastructure** (atom layer + Cmd+K palette + notifications drawer + conflict resolver pattern + entitlement lock UI) plus the month-end close agent scaffolding plus GCP setup and the first staging deploy. Two-founder split: founder runs the atom layer + shell in parallel to co-founder running the backend scaffold + `ai/client.py`. Realistic Phase 2 floor = **6 weeks**, ceiling = **9 weeks**. The previous floor/ceiling of 4-7 underestimated the frontend learning curve. Ship the widened buffer, do not consume it.
4. **Phase 4 has the customer-validation gate** before the heavy build of Phase 5 starts; this is a deliberate hold point. With two founders, discovery and demo outreach run on the co-founder's time without stealing Tier 1 build hours.
5. **Phase 7 hardening + launch** is sized at 6-8 weeks of productive work plus the SOC 2 Type 1 audit window (see milestone below).

### Team bandwidth math (the load-bearing assumption)

Two founders in place from day 0. Division of labor:
- **Founder** (non-technical product owner, ~20 h/week): product + design + frontend + founder review sessions + customer-facing demo calls.
- **Co-founder** (~20 to 30 h/week, treat as a range): backend + infra + AI + technical discovery + code review + pilot technical enablement.
- Both on customer calls when the firm is evaluating Gamma seriously.

| Activity | Founder h/week | Co-founder h/week |
|---|---|---|
| Tier 1 build | 12 to 14 (Phase 2-5), 8 to 10 (Phase 6-7) | 14 to 20 (Phase 2-5), 10 to 14 (Phase 6-7) |
| Customer discovery + demo calls | 0 (Phase 2-3), 1 to 2 (Phase 4+) | 0 (Phase 2-3), 1 to 2 (Phase 4+, technical deep-dives) |
| Pilot management (per active pilot) | 0 (Phase 2-4), 1.5 to 2.5 h/pilot/week (Phase 5+) | 0 (Phase 2-4), 1.5 to 2.5 h/pilot/week (Phase 5+) |
| Weekly logs, cross-doc maintenance, deferred-decision triage | 1 to 2 | 0 to 1 |
| Founder review sessions (flawless gate item 15) | 1 to 2 | 0 to 1 (attending) |
| Coordination overhead (syncs, PR review, decision alignment) | 1 to 2 | 1 to 2 |
| Learning curve (front-loaded) | 2 to 4 (Phase 2), 1 to 2 (Phase 3-5), ~0 (Phase 6+) | 1 to 2 (Phase 2), ~1 (Phase 3-5), ~0 (Phase 6+) |
| **Total nominal claim** | 17 to 30 h/week | 18 to 33 h/week |
| **Combined productive build time** | **~24 to 34 h/week** (post-overhead) | |

**Phase 6-7 with 3+ active pilots running concurrently is still tight even with two founders.** Pilot management alone consumes 9-15 h/week across the two of us at 3 pilots. Choose between dropping pilots, dropping Tier 2 scope, or extending the calendar. Do not try to run 5 pilots concurrently.

### Validated lead gate (required to clear before Phase 4 starts, externalized to the co-founder)

The original plan committed to **40 weeks of build before the first paying customer signs**. That is build-blind: betting a year of work on an avatar customer described in `CLAUDE.md` whose existence has not been verified. **Before Phase 4 (Core data + Dashboard pass 1) begins, this gate must be cleared:**

- [ ] **At least one validated lead** in writing. Validation = a named decision-maker at a real consulting firm (50-500 employees, EU) who has done a 30-min discovery call AND has either (a) signed a non-binding pilot LOI, or (b) committed in writing to a paid pilot at first-customer pricing once Tier 1 is live, or (c) prepaid a deposit.
- [ ] Two more leads at the "Interested" stage in the pipeline (per `docs/GO_TO_MARKET.md` section 4), even if not yet committed.
- [ ] Target 3+ validated leads by week 20 (mid-Phase 4, two weeks before Phase 4 exit).

### Gate enforcement (the anti-rationalization protection)

The failure mode of this gate is not "the gate trips and we ignore it". The failure mode is "the gate feels close enough and the founder rationalizes past it because the code is moving". To prevent this:

1. **The co-founder has written authority to halt Phase 5.** If the validated-lead gate has not cleared by end of week 20, the co-founder unilaterally halts Phase 5 build. The founder does not get a veto. This authority is written into the co-founder agreement, not a verbal understanding. It is the single most important anti-sunk-cost protection in the whole plan.
2. **Three calendar reminders are set now:** week 18 (warning: gate review in 2 weeks), week 19 (warning: gate review in 1 week), week 20 (gate review meeting, 60 minutes, both founders present, decision binding). Put these in the shared founder calendar the same day as committing this plan change.
3. **Consequence on gate failure is pre-specified:** if the gate fails at week 20, the founder goes full-time on customer discovery for **4 weeks**. No Phase 5 build during those 4 weeks. No exceptions. No "just this one feature". At the end of the 4 weeks, re-run the gate. If it still fails, the founder and co-founder hold a "fold vs pivot" conversation and either change the category, change the price, or pause the project. Writing the consequence down now is the only way to make it real at week 20 when sunk-cost thinking is strongest.
4. **What "4 weeks of focused outreach" actually looks like:** founder books 20+ new discovery calls per week via LinkedIn, warm intros, and conference outreach. 2-3 hours of outreach per day. No code, no design, no meetings. The co-founder continues maintenance-only work on the existing Phase 4 codebase but does not start any new feature.
5. **No retroactive scope creep.** Do not expand the gate criteria to include "qualified interest" or "active discussion" or "warm fuzzies". The only valid evidence is (a) signed LOI, (b) written pilot commitment, or (c) prepaid deposit. Anything else fails the gate.

With a co-founder in place, the outreach playbook splits: founder handles demo calls and design reviews, co-founder handles technical deep-dives during discovery. This doubles the weekly discovery bandwidth without stealing Tier 1 build hours from either of us.

The customer-validation gate exists because the harshest bug in the original plan was not technical: it was the assumption that the avatar is a buyer. It is not. You need a buyer to validate that. Every week without a validated lead is a week the plan is wrong about its own assumptions.

### Go-to-market milestones

Two columns again: optimistic and realistic (two-founder). Use the realistic column for any commitment to a customer or external party.

| Optimistic week | **Realistic week (2 founders)** | Milestone |
|----------------:|--------------------------------:|-----------|
| 11 | **13** | Auth + onboarding + operator console flawless |
| 15 | **18** | Dashboard pass 1 live with core data; **validated lead gate cleared** |
| 24 | **32** | All Tier 1 features flawless |
| 27 | **36** | First non-paying pilot kickoff (demo-to-contract motion, no self-serve signup) |
| 34 | **42** | Tier 2 features + client portal functional; **SOC 2 Type 1 audit engaged** |
| 40 | **48** | First paying customer signs (manual billing path) |
| 42 | **54** | Public launch |
| - | **56 to 60** | **SOC 2 Type 1 certification lands** (target: by customer 3-4) |
| 50+ | **66+** | Automated billing live (Stripe / Revolut / Paddle, final choice at DEF-029 trigger time, **only after customer #5-10**) |

**Note:** billing automation is NOT on the critical path for first revenue. Phase 2 manual PDF invoicing via Workspace SMTP Relay handles the first 1-5 customers without any Stripe/Revolut/Paddle integration. The "automated billing live" milestone is **post-launch**, on the Customer #6 trigger; it has been moved out of Phase 7 into the post-launch playbook (see end of this file).

### Slippage policy

- **Dates can move. Quality cannot.**
- If we are 2+ weeks behind on a phase, drop Tier 2 scope first, never Tier 1 quality.
- If a Tier 1 feature fails its flawless gate twice, escalate: founder decides scope cut or extra time.
- Update target weeks in this file when slippage happens. Do not keep stale targets visible.

### Honest caveats

- Total budget at the realistic two-founder columns above: **42 to 54 productive weeks**, which at 24-34 combined productive hours/week is roughly **10 to 13 calendar months** from week 0 to public launch.
- "One Tier 1 feature per week in Phase 5" was an aspiration in earlier versions of this file. The realistic two-founder column reflects the bottom-up estimate (10 features × 2 weeks average with parallelism = 20 weeks).
- "13 Tier 1 features at flawless quality" (per the corrected `docs/SCOPE.md`, command palette is shell infrastructure not a Tier 1 feature) plus the month-end close agent and the first-contact UX hardenings (bulk row actions, global non-AI search, in-app feedback button, notifications inbox page) per `docs/SCOPE.md`.
- Pilot and commercial milestones assume customer discovery is already in progress. **If no warm leads exist by Phase 4 entry**, the validated-lead gate halts the build instead of slipping the launch date.
- **If the co-founder drops out**, fall back to the solo-founder realistic column (62 to 72 weeks; see the "If solo-founder reality returns" note under the table). Plan for this contingency, do not pretend it cannot happen.

### Success criteria for v1.0

**Measurable (targets, not measured baselines):**
- Lighthouse performance >= 90 on every page
- API p95 < 500 ms on reads (internal SLO)
- Bulk CSV import: canonical seed dataset (201 employees + 120 clients + 260 projects + 52 weeks of timesheets) in < 60 s
- Timesheet submission: < 2 min for a full week
- Expense submission: < 30 s with OCR
- OCR p95 < 15 s end-to-end
- Invoice generation p95 < 3 s
- Zero flaky tests in CI
- Lighthouse PWA score >= 95

**Subjective (founder gate):**
- Every page feels like the same app
- Zero dead ends
- Dark mode default looks polished; light mode is complete
- Visual parity with `prototype/` verified side-by-side
- Founder can take a week off without everything breaking

**v1.0 definition of success:**
- 1 paying customer at annual price
- At least 10 firms at "interested" stage in the sales pipeline
- No P0 bugs in production for 30 consecutive days
- Customer advocate willing to give a testimonial

---

## The seven phases, what to ship, how to know you are done

Each phase has: a list of concrete tasks, a definition of done, and the time target. Time targets are optimistic. If you slip 2+ weeks on any phase, drop Tier 2 scope first, never Tier 1 quality.

### Phase 2: Foundation build

**Goal:** local dev stack up, backend + frontend scaffolds running entirely on the dev machine, the plumbing that every feature depends on in place. **No GCP, no deployment.** Deploy track is §16 in EXECUTION_CHECKLIST.md and runs after Phase 5a MVP is demo-ready.

**Target:** 6 to 9 weeks of two-founder work at ~24-34 combined h/week productive. **BUILD TRACK DONE 2026-04-15** (shipped in 10 commits across backend, frontend, infra/docker, Makefile, CI workflow).

**Concrete tasks:**

1. **GCP account setup** - **DEFERRED to §16 Deploy Track.** Not needed for MVP demo; runs after Phase 5a when a pilot customer asks for a production URL. Keeps the build track focused on local dev reality.

2. **Cloudflare setup** - **DEFERRED to §16 Deploy Track.** Same reason. DNS, WAF, Access, Email Routing all happen when the app needs a public hostname.

3. **Google Workspace setup** - **DEFERRED to §16 Deploy Track.** Mailhog handles dev email entirely. Workspace SMTP Relay swaps in when the app needs to send real mail.

4. **GitHub setup** - **PARTIAL:** repo exists, `.github/workflows/ci.yml` live with pre-commit + backend (ruff + pytest 60% floor) + frontend (typecheck + vitest, lockfile-gated). Environments, deploy secrets, branch protection all move to §16 Deploy Track.

5. **Backend scaffold** - **DONE 2026-04-15.**
   - [x] `backend/app/main.py` with FastAPI + middleware chain: `TenancyMiddleware`, CORS, typed error handler
   - [x] `backend/app/core/tenancy.py` with `ContextVar` + `SET LOCAL search_path` per ADR-001
   - [x] `backend/app/core/security.py` with JWT audience binding (ops/app/portal) per ADR-010
   - [x] `backend/app/core/database.py` with SQLAlchemy async engine + per-request session factory
   - [x] `backend/app/core/config.py` with Pydantic settings
   - [x] `backend/app/core/feature_registry.py` (M6, 12 features auto-register)
   - [x] `backend/app/core/errors.py` typed exceptions (401/402/403/404/409/422/429)
   - [x] `backend/app/core/audit.py` writer + PG trigger rejecting UPDATE/DELETE
   - [x] `backend/migrations/env.py` with per-tenant `-x tenant=...` orchestration via SQLAlchemy async
   - [x] First migration creates public.tenants, public.country_holidays, public.audit_log + append-only trigger
   - [x] `backend/app/ai/client.py` AIClient Protocol + MockAIClient (vendor swap in §16)
   - [x] `backend/app/events/bus.py` in-process event bus (M5)
   - [x] `backend/app/tasks/celery_app.py` with 3 queues (critical, default, bulk)
   - [ ] 👥 **Phase 3a carryover blocker:** wire JWT claim extraction into `TenancyMiddleware._extract_from_jwt` (currently a stub returning None)

6. **Frontend scaffold** - **DONE 2026-04-15.**
   - [x] Next.js 15.1 + React 19 + Tailwind 4 + TypeScript strict mode, compiles clean + passes typecheck + passes vitest + passes `next build`
   - [x] `frontend/styles/tokens.css` byte-exact mirror of `prototype/_tokens.css` (allowlisted in em-dash hook, CLAUDE.md rule 3)
   - [x] `frontend/styles/globals.css` with `@import tailwindcss` + `@theme inline` bridge
   - [x] `frontend/app/[locale]/(ops)/layout.tsx` (operator shell variant)
   - [x] `frontend/app/[locale]/(app)/layout.tsx` (main app shell with Providers + AppShell)
   - [x] `frontend/components/shell/sidebar.tsx` at 224px, topbar, bottom-nav, app-shell wrapper
   - [x] 20 atoms + 3 patterns (Button, Input, Card, Modal, Table, Select, Checkbox, Radio, Toggle, Textarea, Badge, Pill, Breadcrumb, Tabs, Accordion, Drawer, Toast, Tooltip, SearchInput, AIInsightCard, AIInvoiceExplanation + EmptyState + FilterBar + StatPill)
   - [x] `frontend/lib/api-client.ts` with typed `ApiClientError` (402 entitlement, 409 conflict)
   - [x] `frontend/lib/optimistic.ts` with `useOptimisticMutation` wrapper
   - [x] `frontend/lib/offline.ts` IndexedDB queue stub
   - [x] `frontend/lib/realtime.ts` WebSocket singleton stub
   - [ ] 🧑 `frontend/app/[locale]/(portal)/layout.tsx` portal shell - deferred to Phase 6
   - [ ] 🧑 Cmd+K palette, notifications drawer, ConflictResolver UI, EntitlementLock UI - each ships with the first Phase 5a feature that actually needs it

7. **Database bootstrap** - **PARTIAL.**
   - [x] First Alembic migration covers `public.tenants`, `public.country_holidays`, `public.audit_log` + append-only trigger
   - [x] Second Alembic migration seeds FR + UK holidays for 2026 and 2027
   - [x] Migration runner uses SQLAlchemy async (no psycopg2 dependency)
   - [ ] 👥 Run `alembic upgrade head` against the local dev DB once docker group is fixed (`make mvp-up` handles this)
   - [ ] 👥 Phase 3a: add `public.app_users`, `ops_users`, `portal_contacts`, session tables (ADR-010 three-audience identity)
   - [ ] 👥 Phase 3a: tenant provisioning service that creates `t_<slug>` schemas and runs per-tenant migrations
   - [ ] 👥 Phase 3a: seed the `feature_flags` table with the initial kill switches (currently only the in-process feature registry holds this)

8. **Minimum operator console** - **PARTIAL.**
   - [x] `backend/app/features/admin/models.py` Tenant ORM
   - [x] Admin service + routes at `/api/v1/ops/features`, `/kill-switch`, `/overrides`
   - [x] 12 feature modules self-register with the feature registry (M6)
   - [x] `(ops)` route group: layout + static Tenants + static Flags pages
   - [ ] 👥 Phase 3a: wire the static ops pages to live `/api/v1/ops/*` data
   - [ ] 👥 Phase 3a: operator authentication (passkey-only per ADR-010) or Phase 3b hardening
   - [ ] 👥 Phase 3a: `(ops)/tenants/new` create wizard

9. **Atom layer** - **DONE 2026-04-15.** 20 atoms + 3 patterns, byte-for-byte prototype tokens, dark + light via `[data-theme="light"]`. Storybook deferred (DEF-049).

10. **`docs/ROLLBACK_RUNBOOK.md`** - **PARTIAL (doc exists).** Per-tenant rollback drill deferred to §16 Deploy Track (needs a real staging environment to run against).

11. **First DR drill** - **DEFERRED to §16 Deploy Track.** Requires real staging.

12. **Month-end close agent scaffolding** - **PARTIAL.** MockAIClient + AI eval harness skeleton at `backend/app/ai/evals/harness.py` are live. Full 5-example eval set per feature + the 24-analyzer library + invoice draft generation land in Phase 5a (`EXECUTION_CHECKLIST.md` §6.2).

13. **Testing infrastructure scaffolding** - **DONE 2026-04-15.** pytest + hypothesis + pytest-asyncio + pytest-mock + vitest + Playwright installed. 45 backend tests pass. GitHub Actions CI: pre-commit + backend (ruff + pytest 60% floor) + frontend (typecheck + vitest, lockfile-gated).

14. **Property-based test invariants (first 5)** - **DONE 2026-04-15.** FR domestic VAT, intra-EU reverse charge, UK domestic VAT, tenant schema shape, tenant schema SQL-injection rejection. The tenant schema property test caught a real regex-anchor bug in `tenancy.py` during Phase 2 (`^` vs `\A` / `\Z`).

15. **AI eval harness with 5 examples per feature** - **SKELETON only.** `backend/app/ai/evals/harness.py` exists; 5 hand-curated examples per feature ships with each feature in Phase 3a-5a (column mapper in 3a, month-end close in 5a, OCR in 5a).

16. **Contract test harness** - **DONE 2026-04-15.** Contract test asserts `/api/v1/*` versioning + OpenAPI shape for auth + ops routes. `openapi-typescript` frontend diff ships with Phase 3a when the first real endpoints land.

17. **Snapshot test framework** - **NOT STARTED.** Phase 5a invoice PDF prereq. Ships with the first WeasyPrint render in `backend/app/features/invoices/`.

**Definition of done (Phase 2, build track):**
- [x] `make mvp-up` brings up Postgres + Redis + Mailhog + backend + frontend containers (solves the WSL2 localhost binding issue)
- [x] Backend runs as a compose service, reaches Postgres via Docker DNS `postgres:5432`
- [x] Frontend runs as a compose service, browser hits it at `http://localhost:3000/en`
- [x] 45 backend tests pass locally (`make backend-test-local` or `make dev-test-backend`)
- [x] Frontend typecheck + vitest + `next build` all green (`make dev-test-frontend`)
- [x] 9 vendor wrappers M1 with stub implementations, CI lint blocks vendor SDK imports outside wrappers
- [x] 20 atoms + 3 patterns, dark and light mode both look right
- [x] Repo is em-dash-free and banned-vocabulary-free across every file (verified by pre-commit on the full repo, per CLAUDE.md rules 5 and 6)
- [ ] 🧑 One-time founder unblock: `newgrp docker` in the current shell, then `make mvp-up`
- [ ] 👥 Phase 3a carryover: JWT claim wiring into `TenancyMiddleware._extract_from_jwt`

**Definition of done (Phase 2, deploy track):** moved to §16 Deploy Track in `EXECUTION_CHECKLIST.md`. Agent never initiates this; founder calls for it post-MVP.

**What NOT to build in Phase 2 (still accurate):**
- Login flows beyond the stub (Phase 3a password + OIDC, Phase 3b MFA + hardening)
- Employee/client/project pages (Phase 4)
- Any Tier 2 page (Phase 6)
- Any feature gated by `@gated_feature` other than the gate itself (wait until Phase 4)
- Anything in §16 Deploy Track (wait for founder trigger post-MVP)

---

### Phase 3: Auth + onboarding + full operator console

**Goal:** a new customer can sign up (via demo-to-contract flow) and get their data into the app through the onboarding wizard. Operator console has every page needed to run a manual sales motion.

**Target:** 4 weeks.

**Concrete tasks, in order:**

1. **OIDC setup for tenant users**
   - [ ] `backend/app/features/auth/oidc.py` using `authlib`
   - [ ] Google Workspace OIDC client registration
   - [ ] Microsoft Entra OIDC client registration
   - [ ] `public.oidc_providers` table per tenant (schema already in section 2.2)
   - [ ] `/api/v1/auth/oidc/callback/{provider}` route
   - [ ] `users.oidc_subject` linking

2. **Passkey and password fallback auth**
   - [ ] WebAuthn enrollment at `/account/security`
   - [ ] WebAuthn challenge at `/login/passkey`
   - [ ] bcrypt password path at `/login/password` with rate limiting

3. **Magic-link invite flow**
   - [ ] `/invite/[token]` page that lands new employees in signup
   - [ ] Invite creation in `public.invitations` from the onboarding wizard
   - [ ] Email template `auth_invite.mjml` sent via Workspace SMTP Relay

4. **MFA + recovery**
   - [ ] TOTP setup at `/mfa/setup` for non-SSO users
   - [ ] 10 single-use recovery codes (hashed)
   - [ ] Password reset at `/password/reset`

5. **Onboarding wizard (the big one)**
   - [ ] `/onboarding` wizard per APP_BLUEPRINT 1.8
   - [ ] CSV upload via GCS presigned URL, 20 MB limit
   - [ ] ClamAV Celery virus scan integration
   - [ ] AI column mapper tool in `backend/app/features/imports/ai_tools.py` calling Gemini
   - [ ] Manual column mapper UI as fallback
   - [ ] Validation pipeline per DATA_INGESTION section 2.4
   - [ ] Preview screen with error report
   - [ ] Celery import runner with `public.import_checkpoints` for resumability
   - [ ] WebSocket progress on `/ws/notifications`
   - [ ] End-to-end test: import the canonical seed dataset (201 employees + 120 clients + 260 projects + 52 weeks of timesheets) in under 60 seconds

6. **Operator console full v1.0 set**
   - [ ] 11.4 tenant detail tabs (Users, Subscription, Entitlements, Custom Contract, Lifecycle)
   - [ ] 11.6 subscription invoices list + 11.7 detail
   - [ ] 11.8 custom contracts list + 11.9 detail
   - [ ] 11.10 feature flags page
   - [ ] 11.11 kill switches page (with required reason text)
   - [ ] 11.12 migrations status page (reads from `alembic_runs`)
   - [ ] 11.13 sub-processors list editor

**Definition of done (Phase 3):**
- A prospective customer can be onboarded end-to-end in under 60 minutes (you create tenant → send invite → they log in via OIDC → upload CSVs via onboarding wizard → data is imported)
- Every auth path works on real devices (passkey on a YubiKey, OIDC via Google and Microsoft)
- The flawless gate passes for all auth pages and the onboarding wizard
- The operator console covers every manual-billing action

---

### Phase 4: Core data + Dashboard pass 1

**Goal:** employees, clients, projects, and a first dashboard. The founder's team and sales team can start demoing the app with real data.

**Target:** 4 weeks.

**One Tier 1 feature at a time, in this order:**

1. **Employees** (3.1, 3.2) + `features/employees/` full stack + seed data generator + CRUD + profile tabs + manager hierarchy + `employee_visibility` materialized view
2. **Clients** (7.1, 7.2) + full CRUD + contacts + reverse-charge VAT support
3. **Projects** (7.3, 7.4) + full CRUD + T&M vs fixed-price + project_allocations + project_rates + project_milestones
4. **Dashboard pass 1** (2.1) with widgets wired to employees, clients, projects data
5. **Operator console pages 11.14-11.18** (DPA versions, residency audit viewer, maintenance mode toggle, cross-tenant audit log browser, health dashboard)

**Definition of done:** flawless gate passes for all four Tier 1 features, the dashboard shows real data from the imported test tenant, the operator console is feature-complete for v1.0.

---

### Phase 5: Core modules

**Goal:** all Tier 1 features flawless. This is the longest phase.

**Target:** 9 weeks. Probably slips to 11-13.

**One Tier 1 feature at a time, in this order (each takes 1-3 weeks):**

1. **Timesheets** (4.1, 4.2) with week-as-entity state machine, submit/approve/reject/recall, version locking, offline support via IndexedDB queue
2. **Leaves** (5.1, 5.2) with request flow, balance calculation from `leave_types.accrual_rate`, approval routing to direct manager
3. **Expenses** (6.1, 6.2) with OCR via Gemini vision, manual fallback, approval routing (direct manager + finance co-approval above threshold)
4. **Approvals hub** (4.3) as a unified board across timesheets, leaves, expenses
5. **Invoices** (8.1, 8.2) with volume-band calculation, WeasyPrint PDF template (budget 1 full week on the template alone for French legal precision), sequence generation under concurrency
6. **Admin console** (9.1) with Users, Roles, Teams, Billing, Audit Log, Security sections
7. **Account settings** (9.2) with Profile, Security (passkey + password + MFA + sessions), Notifications, Language, PWA push opt-in
8. **Dashboard pass 2** (2.1) with full data from all modules including AI insight cards
9. **Payroll CSV export** per DATA_INGESTION section 6: Silae + Payfit + generic adapters
10. **Ongoing CSV imports page** per DATA_INGESTION section 3 in the admin console

**Definition of done (Phase 5):** every Tier 1 feature passes the flawless gate, the canonical seed tenant works end-to-end for a full monthly cycle (time entry → submit → approve → invoice → payroll export), real customers can be onboarded.

**Check-in gate before Phase 6:** run all 14 Tier 1 features through the flawless gate one more time in a batch. If anything fails, fix it before starting Phase 6.

---

### Phase 6: Tier 2 features + client portal

**Goal:** the features that differentiate Gamma from boring PSA tools, and the client portal.

**Target:** 9 weeks. Tier 2 has a lower quality bar than Tier 1 (functional + polished, not flawless).

**Tier 2 features can run in parallel with each other:**

1. **Calendar** (10.1) month view read-only
2. **Gantt** (10.2) read-only pan/zoom
3. **Resource planning** (10.3) read-only heatmap
4. **HR module** (10.4) recruitment pipeline read-only
5. **Insights page** (10.5) ranked AI insights list
6. **Client portal** (12.1-12.4) read-only status + invoices, ships late in this phase

**Definition of done:** Tier 2 features work reliably and look consistent with the rest of the app. Client portal can be opened by a customer's client with a passkey.

---

### Phase 7: Hardening + launch

**Goal:** production-ready, first paying customer, public launch.

**Target:** 8 weeks optimistic, **12 weeks realistic** at two-founder cadence (realistic weeks 42 to 54 in the table above).

1. **SOC 2 Type 1 audit window**: target certification by customer 3-4 (up from customer 5 in the solo plan). Work starts in Phase 6 parallel to Tier 2 features. Engage auditor by week 32 of the realistic column (post-Phase 4 customer-validation gate). Certification lands in the realistic week 56-60 window (see Go-to-market milestones).
2. **Security audit**: cross-tenant leak tests, auth flow attack surface, rate limit stress tests, SQL injection, XSS, CSRF, three-gate feature gating boundary tests
3. **Performance pass**: p95 latency targets met, Lighthouse scores, bundle sizes, database query counts, N+1 elimination, three-gate cold-start coalescing (see "Performance risks to verify" in `specs/DATA_ARCHITECTURE.md`)
4. **Beta onboarding**: onboard 3 pilot customers manually (demo-to-contract motion)
5. **Docs site**: public documentation using Mintlify or similar
6. **Video tutorials**: onboarding, timesheet, expense, invoice (short recordings, not Hollywood)
7. **Legal review**: DPA, TOS, privacy policy reviewed by French SaaS lawyer (€500-2000)
8. **Public status page**: `status.gammahr.com` on Cloudflare Workers + R2 (DEF-016 trigger fires here: "before first paying customer signs")
9. **Incident response runbook review**: `docs/ROLLBACK_RUNBOOK.md`, `docs/COMPLIANCE.md`, `docs/DEGRADED_MODE.md`, `docs/BILLING_LIFECYCLE.md`, `docs/DATA_RETENTION.md`, and `docs/MIGRATION_PATTERNS.md` are all delivered before Phase 5 start. Phase 7 reviews all six for drift against the real implementation and updates them for any new failure modes discovered during Phase 5. The three that were missing in earlier drafts (billing lifecycle, data retention, migration patterns) were written in April 2026 after the brutal-review pass.
10. **Audit log archival pipeline live**: weekly Celery export of >90-day-old `audit_log` partitions to `gammahr-prod-audit-archive` GCS bucket (Cold Line storage class, lifecycle policy, retention policy lock). The 7-year retention requirement cannot be met by Cloud SQL PITR alone.
11. **Public launch**: announce, Product Hunt, LinkedIn

**Definition of done:** 1 paying customer, no P0 bugs for 30 consecutive days, founder can take a week off without everything breaking.

---

## Pre-customer-2 commitment (measurement before the next signature)

**Before customer 2 signs, these three things must be true:**

1. **Run the full month-end close flow on customer 1's real data and time it end-to-end.** Start the timer when the founder clicks "Start month-end close", stop it when the last invoice is marked ready-to-send. Record the elapsed time in minutes. Record the number of drafts, the number of drafts the founder edited, and the number of drafts the founder accepted as-is. This is the demonstrable-value measurement.
2. **Video-record the customer 1 CFO (or the equivalent finance approver) using the flow**, with their face on camera, with their permission. 3 minutes maximum. Capture the genuine reaction when the queue loads, when the explanations render, and when the batch-send completes. This video is the single most important sales asset for customers 2 through 10.
3. **Publish a one-pager case study** with the before/after numbers and a pull-quote from the customer. Format: "Customer 1 (named or anonymized at their request) closed their month in X hours instead of Y days. That is an Nx improvement. The video is at <link>." One page, one hero number, one quote. This is what customer 2 reads before the first call.

**Hard decision rule:** if the measured savings in step 1 are less than **90 minutes per month** (on a 201-employee canonical tenant), STOP before signing customer 2. Re-anchor the ACV story before any new pricing commitment. Do not grandfather customer 2 at €70k ACV if the demo cannot justify it. The €35/seat pricing depends on this feature being demonstrably differentiated, not approximately differentiated.

**Why this is a hard gate, not a soft one:** customer 1 is locked at €70k ACV for 3 years (the grandfathered pilot pricing in `docs/GO_TO_MARKET.md` section 2). Customer 2 is where the real pricing test happens. If the founder signs customer 2 at €35/seat on the same pitch before validating savings, customers 2 through 10 all anchor on a possibly-unjustifiable number. The only lever to re-anchor is before customer 2, not after.

This commitment is a **Phase 7 post-launch action**, not a Phase 7 launch task. It fires when customer 1 completes their second month-end close cycle on real data (typically 60-90 days after go-live).

---

## Post-launch playbook (NOT in Phase 7)

These triggers fire after launch, not during it. Putting them in Phase 7 was a category error in earlier versions of this file: Phase 7 ships v1.0 with one paying customer, and these items only become real on customer #2-#10.

| Trigger | Action | DEF reference |
|---|---|---|
| Customer #2 signs | Confirm the demo-to-contract motion is repeatable, write the "first 30 days" playbook for new pilots into `docs/WEEKLY_LOG.md` | - |
| Customer #5 signs OR manual billing exceeds 2 hours/week | Start payment processor integration (Stripe / Revolut / Paddle, evaluated at trigger time) | DEF-029 |
| Sustained inbound requests for self-serve OR customer #6 signs | Build self-serve signup flow at `gammahr.com/register` | DEF-028 |
| Customer #6 signs (after billing automation) | Self-serve volume band calculator in admin billing page | DEF-059 |
| Customer #10 OR audit/compliance inquiry | DPA version management UI in operator console | DEF-037 |
| Sustained >2 DSR emails/month | Self-service DSR form at `gammahr.com/privacy/dsr` | DEF-034 |
| Tenant count exceeds 30 OR second drift incident | Cross-tenant schema drift auto-reconciliation UI | DEF-054 |
| Year 2-3 OR Cloud SQL connection saturation | Self-hosted PgBouncer on Compute Engine | DEF-013 |

---

## The weekly rhythm (what you do each Monday)

1. **Open `THE_PLAN.md`** (this file) and check which phase you are in.
2. **Pick the next unchecked task** in the current phase. One task at a time.
3. **Read the spec sections referenced** by that task before writing any code.
4. **Read the prototype HTML** if the task is frontend-visible.
5. **Build the task** to the flawless gate if it is Tier 1, or to functional + polished if it is Tier 2.
6. **Run the gate checklist** from `docs/FLAWLESS_GATE.md`.
7. **Ship to staging** (auto-deploys from `main`).
8. **Manual promotion to prod** after smoke tests.
9. **Check off the task** in this file.
10. **Write a weekly note in `docs/WEEKLY_LOG.md`** (create it if it does not exist): what shipped, what slipped, what you learned.

**If you cannot finish a task in one week:**
- Do not abandon it.
- Do not start a parallel Tier 1 task.
- Break the task into smaller sub-tasks and finish the current slice.
- Re-estimate the rest.

**If you slip 2+ weeks on a phase:**
- Drop Tier 2 scope first, never Tier 1 quality.
- Re-baseline the ROADMAP dates.
- Update this file to reflect the new reality.

---

## The emergency manual (when you feel lost)

### "I don't know what to build next."
Open THIS FILE, find the current phase, find the first unchecked task. Build it.

### "I think we should add feature X."
Check `docs/DEFERRED_DECISIONS.md`. If X is there with a DEF-NNN, it is deferred; do not add it until the trigger fires. If X is not there, it is scope creep; either add it as a new DEF entry or decide explicitly to break scope (which you should not do).

### "I think we made the wrong decision about Y."
Open the relevant spec file (`DATA_ARCHITECTURE.md`, an ADR, etc). If the decision is still right, close the tab. If it needs to change, open a PR with explicit reasoning and update the spec. Do not silently drift.

### "An AI agent suggested something that conflicts with the plan."
Trust the plan. The agent is lossy; the plan was carefully built. Point the agent at the relevant spec file. If the agent still disagrees, assume the agent is wrong unless you personally verify the conflict.

### "A customer is asking for a feature that is in the deferred registry."
Check if the feature's DEF-NNN trigger has fired. If yes, start the work with the deferral's cost estimate as the target. If no, tell the customer it is on the roadmap but not in v1.0, and note the request in `docs/WEEKLY_LOG.md` so patterns become visible.

### "The app is broken in prod at 2am."
Rollback procedure per `docs/ROLLBACK_RUNBOOK.md`:
1. Cloud Run: traffic shift to previous revision
2. If schema issue: Alembic downgrade + Celery fan-out
3. If data corruption: Cloud SQL PITR
4. Post-incident: write up what happened, add a test that would have caught it

### "I am overwhelmed and cannot decide."
Stop. Close the laptop. Come back tomorrow. The plan will still be here.

---

## What is NOT in THE_PLAN

These are intentionally not here because they are covered elsewhere and should not be duplicated:

- **Absolute calendar dates (like "ship on March 1"):** this file uses target weeks (W4, W8, W12 etc) instead. When slippage happens, update the target weeks in the "Target weeks per phase" section above rather than inventing calendar deadlines.
- **Schema details:** see `specs/DATA_ARCHITECTURE.md`. This file tells you what to build; the spec tells you the table shapes.
- **Page layouts:** see `specs/APP_BLUEPRINT.md` and `prototype/*.html`. This file tells you the order; those files tell you what each page looks like.
- **Pricing numbers:** see `docs/GO_TO_MARKET.md`. Not in this plan to avoid dual-source-of-truth.
- **Commit messages, PR templates, CI config:** outside this plan's scope.

---

## The one-page reminder (pin this above your desk)

```
PHASE YOU ARE IN:    [fill in each week]
NEXT TASK:           [fill in each week]
WEEK STARTED:        [date]
PROTOTYPE FILE:      prototype/<page>.html
SPEC SECTIONS:       DATA_ARCHITECTURE §X, APP_BLUEPRINT §Y

DO THIS WEEK:
  [ ] Build the next task in the current phase
  [ ] Run the flawless gate if Tier 1
  [ ] Deploy to staging, smoke test, promote to prod
  [ ] Update THE_PLAN.md with the check-mark
  [ ] Write a weekly note in docs/WEEKLY_LOG.md

DO NOT THIS WEEK:
  [ ] Reopen any locked decision
  [ ] Start a parallel Tier 1 feature
  [ ] Add a feature from the deferred registry unless its trigger has fired
  [ ] Invent new atoms outside the design system
  [ ] Commit or push unless you explicitly meant to
```

---

## The file map (where everything lives now)

| You need to know... | Read this file |
|---|---|
| What to do this week + target weeks + success criteria + slippage policy | **THE_PLAN.md** (this file) |
| Navigation guide + "what to give the AI when" | `README.md` |
| Agent contract + hard rules + feel + core principles + stack | `CLAUDE.md` |
| The data model | `specs/DATA_ARCHITECTURE.md` |
| Every page in the app | `specs/APP_BLUEPRINT.md` |
| How AI is wired | `specs/AI_FEATURES.md` |
| Design system atoms | `specs/DESIGN_SYSTEM.md` |
| PWA and responsive rules | `specs/MOBILE_STRATEGY.md` |
| How customer data gets IN | `docs/DATA_INGESTION.md` |
| What you decided NOT to do | `docs/DEFERRED_DECISIONS.md` |
| Tier 1 vs Tier 2 | `docs/SCOPE.md` |
| Quality checklist (15 items) | `docs/FLAWLESS_GATE.md` |
| Commercial plan and pricing | `docs/GO_TO_MARKET.md` |
| Architecture rationale (one file per decision) | `docs/decisions/ADR-*.md` |
| Visual spec (frozen) | `prototype/*.html` |
| Agent roles and pipeline | `agents/AGENTS.md` |

---

## Final word

We spent serious effort locking this plan. The hardest part of small-team SaaS is not building; it is the constant reopening of decided questions. This file exists to stop that.

When you want to reopen something, open the relevant spec file instead. If the spec is wrong, fix the spec explicitly. If the spec is right, close the tab and build the next task.

**Ship v1.0. One feature at a time. To the flawless gate. On the plan.**
