# Gamma Execution Checklist (AGENT-FACING)

> **This file is the agent's checklist, not the founder's.** Claude Code reads this file when it needs to know what to build next. The founder has a separate list at `FOUNDER_CHECKLIST.md` for non-delegable work (runway, paperwork, pipeline, customer calls, founder review, strategic decisions, health).
>
> **Why the split:** the founder checklist and the agent checklist are now two separate files. This file contains Phase 2 through Phase 7 technical tasks (Docker Compose, backend, frontend, tests, deploys). The founder checklist contains everything that cannot be delegated to code: discovery calls, co-founder paperwork, runway, pricing, founder review of every shipped feature. The two files cross-reference each other at section boundaries. Never mix them; keeping focus requires keeping the lists separate.
>
> **How agents use this file:** read it at the start of every Claude Code session, identify the next unchecked task in the current phase, build it following the ten-step quality chain in section 1.1, commit via `/commit`, stop and report to the founder. Agents never touch `FOUNDER_CHECKLIST.md`.
>
> **How the founder uses this file:** read section 1.0 (80/20 rule) every Monday morning to confirm the agent is working on the right priorities. Otherwise leave this file to the agent and focus on `FOUNDER_CHECKLIST.md`.
>
> **Rule:** you cannot start Phase N+1 until all Phase N exit criteria boxes are checked.

---

## 0. How to use this document

- **Phases run in order.** You cannot skip Phase 2 and start Phase 3.
- **Inside a phase, tasks parallelize** unless marked `[B]` (blocker for the next task). Tasks marked `[P]` are explicitly parallelizable with the preceding task.
- **Every task has an owner marker:**
  - 🧑 founder (product + design + frontend)
  - 👥 co-founder (backend + infra + AI)
  - 🤝 both
  - 🤖 agent-driven (built or verified by a Claude Code subagent, see §1 below)
- **Mark tasks done** by changing `[ ]` to `[x]` and adding `(YYYY-MM-DD)` at the end. Commit the change with a short message like `checklist: 2.1 GCP projects provisioned`.
- **Exit criteria** at the end of each phase must ALL be checked before starting the next phase.
- **Weekly ritual** in §13 tells you how to use this doc on Monday morning.

---

## 1. Agent workflow for quality checks (read this before invoking any agent)

This is how founders and Claude Code subagents collaborate to ship flawless-gate quality. Every 🤖 task follows this workflow.

> **The 80/20 rule for founder time (read this every Monday).**
>
> Within every phase, some tasks determine whether the phase succeeds and the rest are polish. Sort your week by leverage, not by the order of appearance in this checklist. The 20 percent of tasks that deliver 80 percent of the value per phase are:
>
> - **Phase 2 (DONE 2026-04-15):** local dev stack, tenancy middleware + audit log, vendor wrappers M1 with stubs, 20 atoms, shell, testing harness, operator console minimum. Eight subsections shipped; see the git log on `backend/`, `frontend/`, `infra/docker/`, `Makefile`.
> - **Phase 3a:** onboarding wizard, CSV import + AI column mapper, password login, OIDC, JWT claim wiring into the tenancy middleware. The first 5 minutes of a pilot customer experience.
> - **Phase 3b (can slide to Phase 6):** MFA, recovery codes, password reset, breach check, session invalidation, account lockout. Hardening, not demo-blocking.
> - **Phase 4:** employee + client + project lists and profiles, team allocations, dashboard pass 1. What a prospect asks to see on day 1 of a pilot.
> - **Phase 5a (MVP core, agent hard-stop):** timesheets → invoices → month-end close agent → expenses → dashboard pass 1.5. The entire product value story, fully working locally. The agent STOPS here and reports to the founder for the MVP demo decision.
> - **Phase 5b (pilot completeness):** unified approvals hub, leaves, admin console, account settings, dashboard pass 2, payroll export, ongoing imports. Founder-triggered go/no-go after Phase 5a.
> - **Phase 6:** calendar, resource planning, client portal. Tier 2 unlocks.
> - **Phase 7:** SOC 2 Type 1, first paying customer onboarding, public launch readiness.
> - **§16 Deploy Track (founder-triggered, post-MVP):** GCP provisioning + swap vendor wrappers to real + first staging deploy + DR drill. Do NOT run this before Phase 5a is demo-ready. The agent never initiates it.
>
> If you only have 20 productive hours this week, spend them all on the 20 percent list for the current phase. Defer everything else to next week. The 80/20 framing is not an excuse to cut corners on quality; it is an instruction to decide which tasks the quality bar applies to FIRST. Gate items still block the next feature, always.

### 1.1 The ten-step quality chain (non-negotiable)

Every feature merge goes through these ten steps in order. Do not skip steps, do not reorder them.

1. **Read the spec yourself first.** The founder (or co-founder, whoever owns the feature) reads `specs/APP_BLUEPRINT.md` row for the feature AND `specs/DATA_ARCHITECTURE.md` section for the data model AND the matching `prototype/<page>.html` file. Understand before you delegate.
2. **Write the tests first.** Write (or have an agent write) the Playwright E2E scenario, the unit tests for financial math, and the AI eval examples BEFORE the feature implementation. This is layer 1, 2, and 4 of `docs/TESTING_STRATEGY.md`.
3. **Spawn an implementation agent.** Use the `build-page` skill (`.claude/skills/build-page/SKILL.md`) when the task is building or scaffolding a page from `specs/APP_BLUEPRINT.md`. The skill bakes the Gamma architecture and design system so you don't have to re-explain every time. For non-page tasks, use a general-purpose agent with the prompt structure in §1.4 below.
4. **Review the diff personally.** Read every line the agent wrote. Agents are not a substitute for thinking. If something feels off, it is off.
5. **CI runs the automated layers.** On PR push, CI runs: M1-M10 modularity lint (see `docs/MODULARITY.md`), unit tests, property tests, contract tests, E2E scenario suite (smoke subset on every commit, full 45 scenarios on every PR to `main`), snapshot tests. Merge is blocked on any failure.
6. **Run the flawless-gate skill.** Invoke the `run-flawless-gate` skill (`.claude/skills/run-flawless-gate/SKILL.md`) against the page or feature. The skill produces a structured pass/fail report against the 15-item gate in `docs/FLAWLESS_GATE.md`. Fix every red item before moving on.
7. **Founder reviews item 15.** Item 15 ("feels like Gamma") is human judgment. No agent can automate it. Open the feature in a real browser at 1440px desktop and 320px mobile, in both dark mode AND light mode, and ask: does this belong on the same page as `prototype/dashboard.html`? If no, stop and reconsider.
8. **Co-founder review.** The other founder reviews the code diff and runs a 5-minute demo. They look for things the implementer could not see.
9. **Merge.** Only after all eight prior steps pass. Never merge with any gate item in red.
10. **Retro.** After every Phase 5 feature ships, spend 15 minutes writing a one-paragraph retrospective in the PR description: what worked, what was slower than expected, what to change next time. Read these every Monday.

### 1.2 Subagent concurrency rules

- **Never more than 3 subagents at once.** Rate limits are real. If you need 5 parallel tasks, run 3 then 2.
- **Partition by file, not by concern.** If two agents edit the same file, they will conflict. Give each agent a distinct non-overlapping file set.
- **Prefer foreground.** Background agents are for genuinely independent work. Most build tasks should run in the foreground so you see the result immediately and can iterate.
- **One agent = one clear deliverable.** If a task is fuzzy, the agent produces fuzzy work. Narrow the scope until the acceptance criteria are a checklist.

### 1.3 Skills to use and skills to NEVER use

**Project-scoped skills (use freely):**
- `/build-page` (`.claude/skills/build-page/SKILL.md`) - building or scaffolding a page from `specs/APP_BLUEPRINT.md`
- `/run-flawless-gate` (`.claude/skills/run-flawless-gate/SKILL.md`) - verifying a page or feature against the 15-item quality gate
- `/scaffold-atom` (`.claude/skills/scaffold-atom/SKILL.md`) - creating a new Gamma design-system atom with tokens, Storybook story, dark/light variants, WCAG checks. Used 20+ times in the Phase 2 atom layer.
- `/scaffold-feature` (`.claude/skills/scaffold-feature/SKILL.md`) - scaffolding a new backend feature module (routes + schemas + service + models + tasks + ai_tools + tests + matching frontend folder) enforcing M1-M10. Used 11+ times in Phase 5.
- `/scaffold-e2e-scenario` (`.claude/skills/scaffold-e2e-scenario/SKILL.md`) - creating a new Playwright end-to-end scenario from the `docs/TESTING_STRATEGY.md` inventory, with real database assertions. Target 45 scenarios by v1.0 launch.
- `/commit` (`.claude/skills/commit/SKILL.md`) - running the 9 pre-commit hooks on staged files, applying safe auto-fixes (whitespace, EOF), reporting and blocking on unsafe findings (secrets, em dashes, banned words, large files), and creating the commit with a Co-Authored-By footer. The only commit path agents should use. Never skips hooks, never auto-fixes secrets, never pushes.

**Forbidden skills (from CLAUDE.md rule 13):** NEVER invoke these even if they appear to match the task.
- `frontend-design` - promotes creative, maximalist aesthetics that break the locked design system
- `brand-guidelines` - applies Anthropic brand, not Gamma
- `theme-factory` - themes the artifact, Gamma has one locked theme
- `canvas-design` - visual art, irrelevant to the product
- `algorithmic-art` - generative art, irrelevant to the product

**Reason:** Gamma has a frozen design system. These skills would actively damage the brand. The project-scoped skills in `.claude/skills/` are authoritative.

### 1.4 Standard agent prompt structure

Every agent prompt you write should have these nine sections in this order. See the Phase 5 month-end close build task for a worked example.

```
1. Project context (2 sentences)
2. Mandatory reading (CLAUDE.md + the 2-4 spec files that matter)
3. Hard style rules (no em dashes, no "utilisation", sidebar 224px, use Edit for surgical changes)
4. Files in scope (the exact absolute paths this agent may touch)
5. Files out of scope (explicit "do not touch" list)
6. Task list (numbered, each task with exact files and sections)
7. Final cleanup (grep for em dashes and "utilisation")
8. Report back format (under 200-300 words, no full diffs)
9. Forbid committing (do not git commit, do not git push)
```

Terse, file-specific, outcome-checklist-driven prompts produce clean work. Vague command-style prompts produce shallow generic work.

### 1.5 Test-first discipline

For every feature with AI (command palette, OCR, insight cards, month-end close agent):

- [ ] Write 5 AI eval examples BEFORE the feature implementation
- [ ] Run the eval harness on the bare tool signature (expect 0% pass)
- [ ] Implement the tool until evals pass threshold
- [ ] Ship

For every feature with financial math (invoices, tax, leave balance, FX):

- [ ] Write property test for the invariants BEFORE the feature implementation
- [ ] Implement until property test passes 1000 generated cases
- [ ] Write at least one E2E scenario with real numbers
- [ ] Ship

For every Tier 1 feature:

- [ ] Write at least one Playwright E2E scenario BEFORE the UI implementation
- [ ] Implement until the scenario passes
- [ ] Run the flawless gate skill
- [ ] Founder review
- [ ] Ship

### 1.6 When an agent gives you bad output

Do not retry the same prompt. Change the prompt: add more context, name more specific files, tighten the acceptance criteria. If the prompt still fails twice, do the task yourself. **Agents scale your work; they do not replace understanding.**

---

## 2. Phase 0: Kickoff (week 0, before any code)

One day of founder alignment. Do this before touching the keyboard.

**Fresh-machine setup for a new founder or hire:** run `bash scripts/setup/bootstrap-dev.sh` once from the repo root. It handles Python 3.12 + pre-commit + the `infra/ops` library + unit tests + `gcloud` in one idempotent pass (5-10 minutes on a clean WSL Ubuntu, ~30 seconds on re-runs). See `docs/runbooks/dev-machine-bootstrap.md` for the full runbook, troubleshooting, and the 5 interactive steps after the script finishes (gcloud auth, `.env` setup, first GCP project).

- [ ] 🤝 Commit the final planning pass to `main` with the title `plan: v1.0 positioning lock - Gamma, €35/€26 pricing, month-end close agent, multi-country scaffolding`
- [ ] 🤝 Read CLAUDE.md together, line by line, confirm both founders understand all hard rules
- [ ] 🤝 Read this checklist together, confirm division of labor (founder 🧑 = product + design + frontend; co-founder 👥 = backend + infra + AI; 🤝 = both join)
- [ ] 🤝 Pin co-founder commitment in writing: minimum 32 hours per week each, 4-year vesting, 1-year cliff, IP assignment to Global Gamma Ltd, exit clause. Signed before first commit of code.
- [ ] 🤝 Pre-commit hook activation is handled by the bootstrap script above. After running it, every code commit is automatically scanned for secrets, em dashes, and the word utilisation. See `docs/runbooks/secrets-management.md` section 9.
- [ ] 🤝 Set up weekly Monday 09:00 planning meeting (30 minutes) using this checklist as the agenda
- [ ] 🤝 Set up weekly Friday 17:00 demo + retro meeting (45 minutes)
- [ ] 🤝 Agree on emergency contact protocol: what to do if one founder is unavailable for >48 hours
- [ ] 🧑 Register the product trademark class 42 search in UK IPO for "Gamma" (not filing yet, just a clearance search)
- [ ] 🧑 Reserve domain candidates (NOT purchasing yet): `rungamma.com`, `getgamma.ai`, `gamma.ops`, `joingamma.io`. Final choice at validated-lead gate.
- [ ] 🤝 Close the planning phase. From this point, no planning-only commits. Every commit adds code or corrects a spec to match code.

**Phase 0 exit criteria:**
- [ ] Co-founder agreement signed
- [ ] Weekly meetings on calendar
- [ ] This checklist read end-to-end by both founders

---

## 3. Phase 2: Foundation build (DONE 2026-04-15)

> **Status: BUILD TRACK COMPLETE.** Subsections §3.1 through §3.8 are shipped and working locally. 45 backend tests pass, 20 atoms exist, the shell renders, the operator console has its minimum surface, and M1 CI lint catches vendor import drift. Nine commits landed this block; see `git log --oneline -- backend/ frontend/ infra/docker/ Makefile`.
>
> **What the agent does next:** skip directly to §4 Phase 3a "MVP onboarding critical path". Do NOT read §16 Deploy Track until the founder explicitly asks for deployment. Do NOT attempt GTM work at all; see `FOUNDER_CHECKLIST.md` §4.
>
> **What the founder does next (one-time dev machine unblock):**
>
> ```bash
> # re-run the bootstrap if you have not since the Docker step landed
> bash scripts/setup/bootstrap-dev.sh
>
> # enable the docker group in the current shell (or logout+login)
> newgrp docker
> docker ps          # should succeed without sudo
>
> # start the local stack and run Alembic in one shot
> make mvp-up        # alias for: dev-up + backend-install + alembic upgrade head + frontend-install
> ```
>
> After those three commands the agent can start Phase 3a against a real local database.

### 3.1 Local dev infrastructure

- [x] 🤝 `infra/docker/docker-compose.dev.yml`: Postgres 16, Redis 7, Mailhog with healthchecks + named volumes (2026-04-15)
- [x] 🤝 Makefile: `dev-up`, `dev-down`, `dev-reset`, `dev-logs`, `dev-ps`, `dev-psql`, plus `setup` and `mvp-up` (2026-04-15)
- [x] 🤝 Postgres init scripts: shared extensions (`uuid-ossp`, `pgcrypto`, `pg_trgm`) + `_dev_bootstrap` marker (2026-04-15)
- [x] 🤝 `docs/runbooks/dev-machine-bootstrap.md` §4.6 covers the local stack (2026-04-15)
- [x] 🧑 `bootstrap-dev.sh` step 7 installs Docker Engine + compose plugin + adds the user to the docker group (2026-04-15)
- [x] 🧑 `bootstrap-dev.sh` step 8 installs Node 22 LTS via NodeSource (2026-04-15)
- [ ] 🧑 One-time founder action: `newgrp docker && make mvp-up` (unblocks Alembic + tests against real Postgres)

**Reference:** `docs/runbooks/dev-machine-bootstrap.md`, `docs/decisions/ADR-001-tenancy.md`

### 3.2 Backend skeleton

- [x] 👥 FastAPI + Python 3.12 project in `backend/` (2026-04-15)
- [x] 👥 SQLAlchemy 2.0 async + asyncpg + lazy engine + per-request session factory (2026-04-15)
- [x] 👥 Alembic runner with per-tenant `search_path` via `-x tenant=...` (2026-04-15)
- [x] 👥 First Alembic migration: `public.tenants`, `public.country_holidays`, `public.audit_log` with append-only trigger (M4) (2026-04-15)
- [x] 👥 Auth skeleton: password + OIDC stubs, JWT audience binding (ops/app/portal) (2026-04-15)
- [x] 👥 `TenancyMiddleware` with `ContextVar` + `SET LOCAL search_path` (2026-04-15)
- [x] 👥 Audit writer + DB trigger that rejects UPDATE/DELETE (2026-04-15)
- [x] 👥 Celery app with three queues (critical, default, bulk) (2026-04-15)
- [x] 👥 `backend/app/events/bus.py` in-process event bus (M5) (2026-04-15)
- [x] 👥 `backend/app/core/feature_registry.py` feature flag registry (M6) (2026-04-15)
- [ ] 👥 **Phase 3a blocker:** wire JWT claim extraction into `TenancyMiddleware._extract_from_jwt` (currently a stub returning None; tenant-scoped endpoints cannot work until this lands)

**Reference:** `specs/DATA_ARCHITECTURE.md` §§2-3, ADRs 001-004, `docs/MODULARITY.md`

### 3.3 Vendor wrappers M1 with stub implementations

- [x] 👥 `app/ai/client.py`: `AIClient` Protocol + `MockAIClient` with canned-prefix responses (2026-04-15)
- [x] 👥 `app/storage/blob.py`: `BlobStorage` + `LocalFilesystemBlobStorage` (2026-04-15)
- [x] 👥 `app/email/sender.py`: `EmailSender` + `MailhogEmailSender` + `InMemoryEmailSender` (2026-04-15)
- [x] 👥 `app/pdf/renderer.py`: `PDFRenderer` + `StubPDFRenderer` (WeasyPrint swap lands in Phase 5a invoices) (2026-04-15)
- [x] 👥 `app/billing/provider.py`: `PaymentProvider` + `NullPaymentProvider` (2026-04-15)
- [x] 👥 `app/tax/calculator.py`: strategy registry with FR + UK rules (intra-EU reverse charge) (2026-04-15)
- [x] 👥 `app/ocr/vision.py`: `VisionOCR` + `MockVisionOCR` returning a canned receipt (2026-04-15)
- [x] 👥 `app/monitoring/telemetry.py`: `TelemetryClient` + `StdoutTelemetryClient` (2026-04-15)
- [x] 👥 `app/notifications/provider.py`: `NotificationProvider` + `LocalNotificationProvider` over the event bus (2026-04-15)
- [x] 🤝 CI lint `scripts/hooks/check_vendor_imports.py` enforces M1 at pre-commit (2026-04-15)

Real wrappers (VertexGeminiClient, GCSBlobStorage, WeasyPrintRenderer, WorkspaceSMTPRelaySender, GeminiVisionOCR, CloudMonitoringClient) swap in at §16 Deploy Track, never before. WeasyPrint is the one exception: its real implementation lands in Phase 5a invoices because PDF rendering is demo-critical and runs entirely locally.

**Reference:** `docs/MODULARITY.md` M1 table

### 3.4 Multi-country scaffolding FR + UK

- [x] 👥 `tenants.residency_region`, `legal_jurisdiction`, `base_currency`, `primary_locale`, `supported_locales` columns (in first migration) (2026-04-15)
- [x] 👥 `public.country_holidays` table (2026-04-15)
- [x] 👥 FR + UK public and bank holidays 2026 and 2027 seeded via migration `20260415_1905` (2026-04-15)
- [x] 👥 `app/tax/rules/fr.py` + `uk.py` (20% VAT with intra-EU reverse charge) (2026-04-15)
- [x] 👥 `app/features/leaves/rules/fr.py` + `uk.py` (25/28 day stubs) (2026-04-15)
- [x] 👥 `app/features/timesheets/rules/fr.py` + `uk.py` (35h legal / 48h cap stubs) (2026-04-15)
- [x] 🧑 next-intl `en` + `fr` messages rebranded to Gamma with full nav + shell + errors keys (2026-04-15)

**Reference:** `specs/DATA_ARCHITECTURE.md` §§14-15, `docs/COUNTRY_PLAYBOOKS.md`

### 3.5 Frontend skeleton (shell)

- [x] 🧑 Next.js 15 + React 19 + Tailwind 4 scaffold (pre-existing from earlier scaffold commit)
- [x] 🧑 `styles/tokens.css` byte-exact mirror of `prototype/_tokens.css` (allowlisted in em-dash hook)
- [x] 🧑 `components/shell/sidebar.tsx` at 224px with primary + secondary nav (2026-04-15)
- [x] 🧑 `components/shell/topbar.tsx` with SearchInput + New button + Notifications (2026-04-15)
- [x] 🧑 `components/shell/bottom-nav.tsx` mobile-only (5 items: dashboard, timesheets, expenses, approvals, account) (2026-04-15)
- [x] 🧑 `components/shell/app-shell.tsx` wraps every (app) page (2026-04-15)
- [x] 🧑 `components/providers.tsx` with TanStack Query + 402/409-aware retry policy (2026-04-15)
- [x] 🧑 `lib/api-client.ts` with typed `ApiClientError` (402 entitlement, 409 conflict, 401 auth) (2026-04-15)
- [x] 🧑 `lib/optimistic.ts` `useOptimisticMutation` wrapper (2026-04-15)
- [x] 🧑 `lib/realtime.ts` WebSocket singleton stub with reconnect (2026-04-15)
- [x] 🧑 `lib/offline.ts` IndexedDB queue stub (2026-04-15)
- [ ] 🧑 Cmd+K command palette - deferred to Phase 5a month-end close
- [ ] 🧑 Notifications drawer (S2) - deferred to Phase 5b notifications inbox
- [ ] 🧑 ConflictResolver UI (S3) - deferred to Phase 5a timesheets (uses three-layer 409 resolver)
- [ ] 🧑 EntitlementLock UI (S4) - deferred to Phase 7 billing surface
- [ ] 🧑 PWA manifest + service worker - deferred to Phase 6

**Reference:** `specs/DESIGN_SYSTEM.md`, `specs/APP_BLUEPRINT.md` §13, ADR-003, ADR-004, ADR-009

### 3.6 Atom layer (20 atoms + 3 patterns)

- [x] 🧑 Group A form atoms: Button, Input, Card, Modal, Table, Select, Checkbox, Radio, Toggle, Textarea (2026-04-15)
- [x] 🧑 Group B info atoms: Badge, Pill, Breadcrumb, Tabs, Accordion (2026-04-15)
- [x] 🧑 Group C composite: Drawer, Toast, Tooltip, SearchInput, AIInsightCard, AIInvoiceExplanation (2026-04-15)
- [x] 🧑 Patterns: EmptyState, FilterBar, StatPill (2026-04-15)
- [ ] 🧑 Storybook stories per atom - add per feature as variants are needed, not a blanket blocker
- [ ] 🧑 WCAG 2.1 AA manual audit - gate item on first founder review in Phase 5a

Every atom reads tokens via CSS variables, supports dark + light via `[data-theme="light"]` overrides in `tokens.css`, is keyboard reachable with a visible focus ring, and uses existing tokens only (no new tokens invented).

**Reference:** `specs/DESIGN_SYSTEM.md`, `prototype/_tokens.css`, skill `/scaffold-atom`

### 3.7 Testing infrastructure

- [x] 🤝 pytest + hypothesis + pytest-asyncio + pytest-cov + pytest-mock installed (2026-04-15)
- [x] 🤝 45 backend tests pass: unit, property, contract, wrapper round-trip, admin routes, tenancy, security, event bus, feature registry (2026-04-15)
- [x] 🤝 Hypothesis property tests for FR domestic VAT, intra-EU reverse charge, UK domestic VAT, tenant schema shape (caught a real regex-anchor bug in `tenancy.py`, fixed) (2026-04-15)
- [x] 🤝 Contract test asserts OpenAPI shape + versioning under `/api/v1/` (2026-04-15)
- [x] 👥 AI eval harness skeleton at `backend/app/ai/evals/harness.py` (2026-04-15)
- [x] 🤝 Ruff lint clean on `backend/app` + `backend/tests` + `backend/migrations` (2026-04-15)
- [x] 🤝 Playwright config: desktop-chromium (1440x900) + mobile-chromium (Pixel 5) (2026-04-15)
- [x] 🤝 First E2E scenario `smoke-shell.spec.ts` asserts sidebar 224px + mobile bottom nav + dark theme (2026-04-15)
- [x] 🤝 Vitest config + `lib/api-client.test.ts` (2026-04-15)
- [x] 🤝 `.github/workflows/ci.yml`: pre-commit + backend (ruff + pytest 60% coverage floor) + frontend (lockfile-gated typecheck + vitest) (2026-04-15)
- [x] 🤝 Pre-commit: 9 hooks green on every file in the repo (gitleaks, whitespace, EOF, large files, yaml, json, merge conflict, no-em-dashes, no-utilisation, M1 vendor imports) (2026-04-15)
- [ ] 🤝 CI check M7 `alembic upgrade && downgrade -1 && upgrade` - deferred to Phase 3a (needs a live dev DB service in CI)
- [ ] 🤝 CI check M4 orphan-row test after tenant delete - deferred to Phase 3a (needs a live dev DB service in CI)
- [ ] 🤝 CI lint M3 cross-feature `.models` imports - simple grep, ship with Phase 3a

**Reference:** `docs/TESTING_STRATEGY.md`, `docs/MODULARITY.md`

### 3.8 Operator console minimum

- [x] 👥 Tenant ORM model `app/features/admin/models.py` (2026-04-15)
- [x] 👥 Admin service: list/create tenant, kill switch, feature override (2026-04-15)
- [x] 👥 Routes at `/api/v1/ops/features`, `/api/v1/ops/features/{key}/kill-switch`, `/api/v1/ops/features/{key}/overrides` (2026-04-15)
- [x] 🧑 `(ops)` route group: layout + static Tenants page + static Flags page (2026-04-15)
- [x] 🧑 12 feature modules self-register with the feature registry on import (M6) (2026-04-15)
- [ ] 🧑 Wire frontend to live backend data - ships with Phase 3a
- [ ] 🧑 Passkey-only operator login - deferred to Phase 3b or Phase 6 hardening

**Reference:** `specs/APP_BLUEPRINT.md` §9 (admin), ADR-010

### 3.9 Go-to-market seeds

> **Moved to the founder track.** Blog posts, landing page, founder video, LinkedIn, email list, warm-intro outreach, and discovery call counts all live in `FOUNDER_CHECKLIST.md` §4 Pipeline now. The agent does NOT do GTM work. Ever.

### Phase 2 exit criteria (build track only)

- [x] Local stack compose file + Makefile + runbook
- [x] Backend skeleton: tenancy middleware + auth stub + audit log trigger + event bus + feature registry
- [x] Vendor wrappers M1 with stub implementations + CI lint enforcement
- [x] Multi-country scaffolding FR + UK (holidays migration + rule stubs + i18n messages)
- [x] Frontend shell (sidebar 224, topbar, bottom nav, providers, typed api client)
- [x] 20 atoms + 3 patterns
- [x] Testing harness: 45 backend tests pass, property + contract live, AI eval harness skeleton, Playwright scenarios drafted, CI workflow
- [x] Operator console minimum (feature flag routes + static ops pages)
- [x] Repo is em-dash-free and "utilisation"-free (verified by pre-commit on every file)
- [ ] 🧑 `newgrp docker && make mvp-up` on the dev machine (then confirm `docker ps` and `psql ... -c "SELECT 1"` work)

**Deploy track exit criteria:** moved to §16 Deploy Track. Deploy runs after Phase 5a MVP is demo-ready and the founder calls for it, never before.

**GTM track exit criteria:** moved to `FOUNDER_CHECKLIST.md` §4. Never gated on agent work.

## 4. Phase 3: Auth + onboarding (target: weeks 8-13)

Split into **3a (MVP onboarding critical path)** and **3b (auth hardening)**. The agent works 3a first, stops at the exit, and reports. 3b can run in parallel with Phase 4 or Phase 5a, or slide entirely to Phase 6. Nothing in 3b is demo-blocking.

### 4.1 Phase 3a: MVP onboarding critical path (demo blocker)

**Goal:** a founder signs in, uploads a 201-employee CSV through a guided wizard, and lands on the dashboard in under 5 minutes. Locally. No MFA. No breach check. No second factor. Password login or Google OIDC only.

**The 20% of Phase 3a that matters most (strict order):**
1. **JWT claim wiring into TenancyMiddleware** (Phase 2 carryover; nothing tenant-scoped works without this)
2. **Onboarding wizard UX** (the first 5 minutes that decide sign vs churn)
3. **CSV import pipeline with AI column mapper** (the pilot cannot start without this)
4. **Password login + register** (simplest path to identified sessions)
5. **Google Workspace OIDC** (covers ~80% of EU consulting firm buyers)

- [ ] 👥 🤖 Wire JWT claim extraction into `TenancyMiddleware._extract_from_jwt` + tests that tenant-scoped endpoints return 401 without a valid audience-bound token (Phase 2 blocker)
- [ ] 👥 🤖 `app_users` SQLAlchemy model + first Alembic migration for password login + OIDC link columns
- [ ] 👥 🤖 Password login + register endpoints wired to `app_users` with bcrypt hashing (passlib pinned to `bcrypt<4`)
- [ ] 👥 🤖 Google Workspace OIDC provider per ADR-002 (real or stubbed callback is acceptable in dev)
- [ ] 👥 🤖 Seed a dev admin user via migration or Makefile target `make seed-dev-admin` (no manual SQL)
- [ ] 🧑 🤖 Tenant onboarding wizard pages: welcome, company info, CSV upload, column mapping, preview, import progress, done (per `specs/APP_BLUEPRINT.md` §1 and `docs/DATA_INGESTION.md`)
- [ ] 👥 🤖 CSV import module at `backend/app/features/imports/` with validation, idempotency keys, SSE progress stream, error CSV download
- [ ] 👥 🤖 AI column mapper tool at `features/imports/ai_tools.py` + 5 eval examples under `backend/app/ai/evals/column_mapper/`
- [ ] 👥 🤖 Wire operator console frontend pages (Tenants, Flags) to the live `/api/v1/ops/*` routes (replace the static EmptyState)
- [ ] 🤝 CI lint: M3 cross-feature `.models` import detection (grep-level, no DB needed)
- [ ] 🤝 CI check: M7 `alembic upgrade && downgrade -1 && upgrade` against a Postgres service container
- [ ] 🤝 CI check: M4 orphan-row test after tenant delete against the service container
- [ ] 🧑 Flawless gate run on Onboarding wizard
- [ ] 🧑 Flawless gate run on Auth login + register
- [ ] 🧑 Flawless gate run on Operator console (live data)

**Phase 3a exit criteria:**
- [ ] E2E scenario "fresh tenant onboarding via CSV" green locally (seeds a tenant, imports 201 employees, lands on dashboard in under 5 minutes)
- [ ] A founder can sign in as the seeded dev admin via password OR Google OIDC
- [ ] `/api/v1/ops/tenants` lists the created tenant; operator console UI reflects it live
- [ ] Onboarding + login + operator console pass the 15-item flawless gate
- [ ] M3, M4, M7 CI checks green on every PR

**Reference:** `specs/APP_BLUEPRINT.md` §1, ADR-002, ADR-010, `docs/DATA_INGESTION.md`

### 4.2 Phase 3b: Auth hardening (can slide)

**When to run:** in parallel with Phase 4 or Phase 5a if bandwidth allows; otherwise slide to Phase 6 hardening. None of 3b is a demo blocker.

- [ ] 👥 🤖 Password reset flow (email verify + re-confirm)
- [ ] 👥 🤖 MFA enrollment (TOTP + 10 recovery codes)
- [ ] 👥 🤖 Recovery code regeneration flow
- [ ] 👥 🤖 Account lockout after 5 failed attempts (15-minute cooldown + email alert)
- [ ] 👥 🤖 Session invalidation on password change
- [ ] 👥 🤖 Session invalidation on role downgrade
- [ ] 👥 🤖 Password breach check against the bundled top-10k list at set-time

**Phase 3b exit criteria:**
- [ ] All auth paths covered with CI test coverage
- [ ] Auth flow passes the full 15-item flawless gate in both dark and light mode

---

## 5. Phase 4: Core data + dashboard pass 1 (target: weeks 13-18)

**The 20% of Phase 4 that matters most (do these first):**
1. **Employees + clients + projects lists** (lists come before profiles; a prospect scrolls the list first, then drills into one record)
2. **Profiles + team allocations** (what Phase 5a timesheets and invoices read from)
3. **Dashboard pass 1 KPI strip** (the single most-scrutinized page in every demo)

**Architectural decision (2026-04-16): Deterministic view model.**
Every list page (Employees, Clients, Projects) supports exactly two view modes: List (default) and Gantt. The view toggle lives in the page header. This replaces the standalone Gantt page and the standalone Planning page - both are absorbed as view modes on their respective entity pages. The Gantt and Planning sidebar nav items are removed. See `specs/APP_BLUEPRINT.md` §§3, 7, 10 for the full spec.

**Feature order (list first, profile second, dashboard last):**

- [x] 👥 🤖 Employees directory (list + filter + search + pagination) (2026-04-16, frontend done)
- [ ] 🧑 🤖 Employees Gantt view (resource schedule: employee per row, project assignment bars on timeline, filters for unassigned/by project/by client/by team, configurable window 1/3/6 months) - **replaces standalone Planning page**
- [x] 👥 🤖 Clients directory (list + filter + search + pagination) (2026-04-16, frontend done)
- [ ] 🧑 🤖 Clients Gantt view (engagement timeline: client per row, projects as bars, gap detection for clients with no active projects)
- [x] 👥 🤖 Projects list (list + filter by client + filter by status) (2026-04-16, frontend done)
- [ ] 🧑 🤖 Projects Gantt view (project timeline: project per row, start/end/progress bars, configurable window, **replaces standalone Gantt page**) - Board/Kanban view removed (DEF-076: Kanban for consulting PSA - low payoff, defer to v1.1 if customers request it)
- [x] 👥 🤖 Employee profile page (overview + team + allocations + contribution) (2026-04-16, frontend done)
- [x] 👥 🤖 Client profile page (overview + projects + invoices + revenue) (2026-04-16, frontend done)
- [x] 👥 🤖 Project detail page (client + status + budget + allocations + pipeline) (2026-04-16, frontend done)
- [ ] 👥 🤖 Team allocation CRUD with overlap prevention + `allocation_pct` constraint
- [x] 🧑 🤖 Dashboard pass 1 KPI strip: 4 cards (Revenue YTD, Billable days this week, Approvals pending, Team capacity) with empty-state handling (2026-04-16, frontend done)
- [ ] 🧑 Flawless gate run on Employees (List + Gantt), Clients (List + Gantt), Projects (List + Gantt), Dashboard pass 1

> **Note on the validated lead gate:** the lead gate is a **founder** gate, not an agent gate. The agent proceeds from Phase 4 to Phase 5a regardless of pipeline state. The founder enforces the lead gate from `FOUNDER_CHECKLIST.md` and can halt Phase 5 work if they choose. The agent is never the enforcer.

**Reference:** `specs/APP_BLUEPRINT.md` §§2, 3, 7

### Phase 4 exit criteria

- [ ] 4 features pass the 15-item flawless gate (Employees, Clients, Projects, Dashboard 1)
- [ ] No new atoms introduced beyond `specs/DESIGN_SYSTEM.md`
- [ ] CI green on unit + property + contract + E2E

---

## 6. Phase 5: Core modules (target: weeks 18-34)

Split into **5a (MVP core, the demo product)** and **5b (pilot completeness)**. The agent builds 5a, stops at the MVP acceptance test, and reports to the founder. 5b is a separate go/no-go call after the founder has something to demo.

### 6.1 Feature template (apply to EVERY Phase 5 feature)

For each feature, the standard checklist is:

- [ ] Write the Playwright E2E scenario (test-first)
- [ ] Write property tests for any financial math (test-first)
- [ ] Write AI eval examples if the feature uses AI (test-first)
- [ ] Implement backend: models, schemas, service, routes, tasks, ai_tools (if applicable)
- [ ] Implement frontend: feature module, pages, atoms from DESIGN_SYSTEM.md
- [ ] Run unit tests to >=85% coverage (100% on financial math)
- [ ] Run the E2E scenario green
- [ ] Run the flawless-gate skill, fix red items
- [ ] 🧑 Founder review at 1440px desktop AND 320px mobile AND dark AND light mode
- [ ] 🧑 Founder confirms item 15 "feels like Gamma" OR the feature is cut from v1.0
- [ ] 👥 Co-founder code review
- [ ] Merge to `main` with the PR description containing the retrospective paragraph
- [ ] Update this checklist by marking the feature done

### 6.2 Phase 5a: MVP core (the demo product, agent hard-stop after this)

**Goal:** a working Gamma app running entirely locally with no GCP, where a founder can import a tenant's data, log billable time, approve it, let the month-end close agent draft invoices with AI explanations, confirm them, render PDFs, submit an expense with OCR auto-fill, approve it, and see a populated dashboard. This is the demo loop. Screen-share it on Zoom with a prospect and get a signed LOI. No deployment required for this to work.

**The MVP acceptance test (the single measure that matters).** Sitting at a clean dev machine with `newgrp docker && make mvp-up && make backend-run && make frontend-dev` running, a founder must be able to:

1. Open `http://localhost:3000/en` and sign in as the seeded admin
2. Upload the canonical 201-employee CSV through the onboarding wizard in under 5 minutes
3. Navigate to Employees, Clients, Projects and see seeded rows
4. Open a consultant profile and log timesheet entries for one week (4 billable days + 1 admin day)
5. Switch to a manager account and approve those timesheet entries
6. Trigger the month-end close agent from the dashboard
7. See a list of draft invoices with line-item AI explanations (from `MockAIClient` with canned prefixes, or a locally-running real LLM, founder choice per DEF-074)
8. Confirm one invoice and receive a WeasyPrint PDF
9. See the dashboard KPI strip reflect the new numbers (Revenue YTD, Billable days, Approvals pending, Team capacity)
10. Submit an expense with a mock receipt; OCR auto-fills merchant + total + currency
11. Approve the expense
12. Verify the whole flow at 1440px desktop AND 320px mobile, in dark mode
13. Verify zero horizontal scroll at 320px

**Feature order (strict; follows dependency order):**

- [x] 🤝 🤖 **Timesheets** (week-as-entity, grid UX, inline submit/approve/reject, `useOptimisticMutation` + three-layer 409 conflict resolver, offline queue stub). (2026-04-16, frontend done)
- [x] 🤝 🤖 **Invoices** (list + draft-from-approved-timesheets + real `WeasyPrintRenderer` swap behind the PDFRenderer interface, sequential per-tenant numbering with `UNIQUE (tenant_id, number)`, EU reverse charge for intra-EU B2B) (2026-04-16, frontend done)
- [ ] 🤝 🤖 **Month-end close agent** (THE v1.0 agentic feature: deterministic analyzers from the 24-analyzer library + AI explanation through `AIClient` + review queue + batch confirm; uses `MockAIClient` for CI, real local LLM for demo per DEF-074)
- [x] 🤝 🤖 **Expenses** (submission + `MockVisionOCR` auto-fill + inline approval + reimbursable state machine) (2026-04-16, frontend done)
- [x] 🤝 🤖 **Dashboard pass 1.5** (4 KPI cards with real data from the seeded tenant + 3 AI insight cards drawn from the analyzer library) (2026-04-16, frontend done)

Each feature follows the 10-step quality chain in §1.1. Test-first is non-negotiable (property tests caught a real regex-anchor bug in Phase 2 tenancy; keep the discipline).

**Phase 5a exit criteria (the hard stop for the agent):**
- [ ] MVP acceptance test **13 of 13 green**
- [ ] 5 features pass the 15-item flawless gate
- [ ] Property tests cover invoice subtotal/total, expense reimbursable flow, timesheet week invariants, 100% coverage on financial math markers
- [ ] At least 8 Playwright E2E scenarios green (onboarding, timesheet week submit, timesheet week approve, expense submit + OCR, expense approve, invoice draft from timesheets, invoice PDF render, month-end close batch confirm)
- [ ] AI eval suites for month-end close and receipt OCR above pass threshold
- [ ] CI: M1 + M3 + M4 + M7 + unit + property + contract + E2E all green on every PR

**After Phase 5a exit, the agent STOPS and reports to the founder.** The founder decides: demo to prospects? proceed to Phase 5b? trigger §16 Deploy Track for a pilot going to production?

### 6.3 Phase 5b: Pilot completeness (founder-triggered)

- [x] 🤝 🤖 **Unified approvals hub** (cross-feature queue, bulk actions, delegation, undo window, idempotency) (2026-04-16, frontend done)
- [x] 🤝 🤖 **Leaves** (accrual job, calendar view, request flow, manager approval, balance invariant enforced at DB) (2026-04-16, frontend done)
- [x] 🤝 🤖 **Admin console** (users, roles, custom fields, feature flags, audit exports) (2026-04-16, frontend done)
- [x] 🤝 🤖 **Account settings** (profile, password change, recovery codes, active sessions, notification preferences) (2026-04-16, frontend done)
- [x] 🤝 🤖 **Dashboard pass 2** (full KPI strip + expanded AI insight cards + ranked signals + degraded-mode banner) (2026-04-16, frontend done)
- [ ] 🤝 🤖 **Payroll export** (first adapter for the first pilot's provider, CSV format + snapshot test)
- [ ] 🤝 🤖 **Ongoing imports** (scheduled CSV, change tracking, admin import page sharing the onboarding pipeline)
- [ ] 🧑 🤖 Bulk row actions across approvals, expenses, leaves, invoices, timesheets lists
- [ ] 🧑 🤖 Global non-AI search in topbar with `/api/v1/search` endpoint
- [ ] 🧑 🤖 In-app feedback button with modal + `/api/v1/feedback` + rate limit
- [ ] 🧑 🤖 Notifications inbox page at `/notifications`

### Phase 5 exit criteria (the complete v1.0 Tier 1 surface)

- [ ] All 11 core modules (5a + 5b combined) pass the flawless gate
- [ ] 45 Playwright E2E scenarios live and green on every PR
- [ ] Property tests cover all invariants from `docs/TESTING_STRATEGY.md` layer 2
- [ ] AI eval suites all above their pass thresholds
- [ ] First monthly load test run locally (customer 1 seed data, 50 synthetic users, 30 minutes), p95 under 500ms across local endpoints

---

## 7. Phase 6: Tier 2 + portal (target: weeks 32-42)

**The 20% of Phase 6 that matters most (do these first):**
1. **Calendar (month view, read-only)**. The one Tier 2 feature prospects ask about in every demo.
2. **Client portal login + invoices view**. Unlocks the "customers can see their own invoices" pitch.
3. **Insights page**. Expands the dashboard AI strip into a full ranked intelligence feed.

> **Note (2026-04-16):** Standalone Gantt page and standalone Planning page are removed from Phase 6. Both are absorbed into Phase 4 as view modes on Employees (Gantt = resource schedule), Projects (Gantt = timeline), and Clients (Gantt = engagement timeline). The standalone pages at `/gantt` and `/planning` are deleted. Sidebar items removed. See `specs/APP_BLUEPRINT.md` §§3, 7, 10.

- [x] 🤝 🤖 Calendar (month view read-only, projects + leaves as colored blocks, no drag-edit) (2026-04-16, frontend done)
- ~~[x] 🤝 🤖 Gantt (read-only, project timelines)~~ **ABSORBED into Projects List Gantt view (Phase 4)**
- ~~[x] 🤝 🤖 Resource planning page (capacity heatmap, read-only in v1.0)~~ **ABSORBED into Employees List Gantt view (Phase 4)**
- [ ] 🤝 🤖 HR module (people directory, enhanced profile, historical data)
- [ ] 🤝 🤖 Insights page (expanded AI insight cards beyond the dashboard strip)
- [ ] 🤝 🤖 Client portal: login page
- [x] 🤝 🤖 Client portal: invoices view (read-only for client contacts) (2026-04-16, frontend done)
- [ ] 🧑 Flawless gate runs on each Tier 2 feature
- [ ] 🤝 Customer 2 onboarding (second paying customer, requires §16 Deploy Track green)

### Phase 6 exit criteria

- [ ] 5 Tier 2 features shipped and passing the gate (Calendar, HR, Insights, Portal login, Portal invoices)
- [ ] Customer 2 live in production (requires §16 Deploy Track green)
- [ ] Quarterly chaos drill run (requires §16 Deploy Track green for realistic drill)

---

## 8. Phase 7: Hardening + launch (target: weeks 42-54)

**The 20% of Phase 7 that matters most (do these first):**
1. **First paying customer onboarding + retention** (customer 1 is the reference case for every future deal)
2. **SOC 2 Type 1 audit cleared** (enterprise buyers refuse to sign without this)
3. **Public status page + incident response runbook drilled** (table stakes for enterprise trust)

Security audit, load testing, docs site, Product Hunt launch are all important but depend on the three above. Phase 7 assumes §16 Deploy Track is green; if not, the agent or co-founder runs it first.

- [ ] 🤝 SOC 2 Type 1 audit engaged (auditor selected, scope agreed) -> audit in progress -> report delivered -> certificate issued
- [ ] 🤝 Third-party security audit + pen test
- [ ] 🤝 Performance load test (customer 1 seed data, 50 concurrent synthetic users, 30 minutes)
- [ ] 🤝 Chaos drill: migration failure recovery at 50-tenant scale
- [ ] 🤝 Chaos drill: Cloud SQL failover under load
- [ ] 🤝 Publish public status page at `status.[domain]` (DEF-016 trigger fires here)
- [ ] 🤝 Publish ToS, Privacy Policy, DPA template, Security whitepaper
- [ ] 🧑 Docs site live (Mintlify or similar), covering onboarding, features, API reference
- [ ] 🤝 Manual invoicing path fully tested and drilled (Phase 2 manual path for customers 1-5)
- [ ] 🤝 Audit log archival pipeline live (weekly Celery export of >90-day partitions to GCS Cold Line)
- [ ] 🤝 Monitoring + alerting on every critical metric (p95 latency, error rate, AI cost, failed logins, queue depth)
- [ ] 🤝 Customer 3 onboarding
- [ ] 🤝 Customer 4 signed
- [ ] 🤝 Public launch on Product Hunt (after customer 3 live and stable)

### Phase 7 exit criteria

- [ ] Launch checklist in `docs/GO_TO_MARKET.md` §10 fully green
- [ ] 4 paying customers live in production
- [ ] SOC 2 Type 1 certificate issued
- [ ] 90 consecutive days with zero P0 bugs in production
- [ ] Founder comfortable taking a week off without everything breaking (the smell test from `docs/GO_TO_MARKET.md` §12)

---

## 9. Year 2: Scale and v1.1 (months 12-24)

After Phase 7 launch, the discipline shifts from "ship Tier 1" to "scale and improve". This section is a rough plan; refine in a quarterly review meeting at month 12.

### 9.1 Customer acquisition and revenue

- [ ] 🤝 Customer 5 signed (triggers DEF-029 payment processor decision)
- [ ] 🤝 **Seed round**: raise €1.5-2M on €8-12M pre-money with the deck and data room prepared in Phase 5
- [ ] 🤝 Customers 6-10 onboarded
- [ ] 🤝 First AE hired (€70-90k + commission, EU-based)
- [ ] 🤝 First marketing / content hire (€55-70k, EU-based)
- [ ] 🤝 First customer success hire (€50-65k, EU-based)
- [ ] 🤝 LinkedIn Sales Navigator + Apollo for outbound
- [ ] 🤝 Paid search on "consulting software", "PSA software", "Kantata alternative"
- [ ] 🤝 Partnership program with 2 EU consulting federations

### 9.2 v1.1 product milestones

- [ ] 🤝 Ship **recruitment module** (DEF was Tier 1.1, trigger fires: 3 customers + 2 written requests + 90 days stable) per `docs/SCOPE.md`
- [ ] 🤝 Ship **predictive staffing agent** (DEF-069) as the Enterprise tier unlock
- [ ] 🤝 Ship **auto-timesheet drafting** (DEF-070) for pilots who provide calendar + Jira + git access
- [ ] 🤝 **Benchmarking data moat** first public benchmark (opt-in tenant data aggregated nightly; launch at customer 10; DEF-072 equivalent)
- [ ] 🤝 Automated payment processor integration (DEF-029, Stripe or Revolut or Paddle)
- [ ] 🤝 Category leadership: first annual "State of Consulting Operations" report

### 9.3 Year 2 country expansion (one country maximum)

Pick ONE from the year-2 candidates based on customer pull, not founder preference.

- [ ] 🤝 Country expansion trigger evaluation at month 15: Canada (DEF-071), Morocco (DEF-072), or Niger (DEF-073)
- [ ] 🤝 If a country is chosen: build the per-country plugin (tax, labor, payment, i18n, holidays) per `docs/COUNTRY_PLAYBOOKS.md`
- [ ] 🤝 If no country is chosen in year 2: focus on deeper FR + UK customer density (avoid scatter)

---

## 10. Year 3+: The €10M ARR path

High level, updated quarterly. Numbers are targets, not guarantees.

### 10.1 Year 3 targets (months 24-36)

- [ ] Customer count: 25-40
- [ ] ARR: €1.75-2.8M
- [ ] Team: 2 founders + 3 AEs + 1 SDR + 1 marketing + 1 customer success = 8 people
- [ ] Enterprise tier sold (€40-50/seat)
- [ ] SOC 2 Type 2 certification

### 10.2 Year 4 targets (months 36-48)

- [ ] Customer count: 55-90
- [ ] ARR: €3.85-6.3M
- [ ] Second country market live
- [ ] Partnership revenue starting (integration marketplace + consulting federations)
- [ ] Series A evaluation (optional, if bootstrapping hits the numbers)

### 10.3 Year 5 targets (months 48-60)

- [ ] Customer count: 100-150
- [ ] ARR: €7-10.5M
- [ ] Third country market live (most likely Africa expansion)
- [ ] Integration marketplace (Slack, Teams, Google Workspace, Outlook, Jira, Asana)
- [ ] Enterprise sales team established

---

## 11. Ongoing operations (permanent, from Phase 5 onward)

- [ ] Weekly DR drill log review (every Monday)
- [ ] Monthly load test run (first of month)
- [ ] Quarterly chaos drill (first week of Q)
- [ ] Quarterly SOC 2 evidence collection
- [ ] Monthly feature flag audit (are there flags that should be removed?)
- [ ] Monthly DEF registry review (any triggers fired?)
- [ ] Monthly pricing review (customer willingness-to-pay intact?)
- [ ] Quarterly architecture review (did anything drift from CLAUDE.md hard rules?)
- [ ] Annual trademark renewal (Global Gamma Ltd)
- [ ] Annual DPA refresh with all customers
- [ ] Annual insurance review (cyber, E&O, D&O)

---

## 12. The "something went wrong" protocols

### 12.1 A gate item fails on a feature

- Stop the feature from merging.
- Fix the specific red item.
- Re-run the flawless-gate skill.
- If the fix takes more than 2 days, CUT the feature from v1.0 and move it to v1.1. Do NOT ship a feature with any red gate item.

### 12.2 A founder loses availability for >2 weeks

- Trigger the solo-founder fallback timeline in `THE_PLAN.md`.
- Drop from 2-founder realistic column to 1-founder column.
- Cut scope: defer to v1.1 anything marked Tier 2 in `docs/SCOPE.md` that has not started.
- Communicate with pilots within 48 hours; honesty protects trust.

### 12.3 A pilot customer churns

- Founder does a 60-minute exit interview, records it, transcribes it.
- Document in `docs/incidents/churn/YYYY-MM-DD-<customer>.md`.
- Review the exit interview with co-founder within 1 week.
- Identify the ONE thing that would have prevented the churn. Put it on this checklist as a fix.

### 12.4 A production incident (P0)

- Follow `docs/ROLLBACK_RUNBOOK.md`.
- Open `docs/incidents/YYYY-MM-DD-<slug>.md` during the incident, update live.
- Post-mortem within 48 hours, published to affected customers within 72 hours.

### 12.5 A competitor ships something that changes the game

- Do NOT reopen the plan. Add the observation to `docs/DEFERRED_DECISIONS.md` as a new DEF entry with a trigger.
- Evaluate the trigger at the next monthly DEF review.
- If truly urgent, the founder can pull a DEF forward, but this is explicit and logged.

---

## 13. Weekly ritual (every Monday morning, 30 minutes)

1. Open this file.
2. Scroll to the current phase.
3. Review what was checked off last week. Did reality match the plan?
4. Identify the next 3 unchecked items for this week. Assign owner markers.
5. Check the weekly demo/retro notes from last Friday for any follow-ups.
6. Look at the DEF registry for any triggers that fired during the week.
7. Close the meeting with the single priority for the week, spoken out loud: "This week, we ship X".
8. Commit any new retrospective notes or owner changes to this file.

---

## 14. Monthly ritual (first Monday of the month, 60 minutes)

1. Review overall progress against phase targets.
2. Update the rolling burn rate (GCP + Vertex AI + SaaS tools + salaries if applicable).
3. Review the DEF registry: any items ready to promote to a phase?
4. Review the pipeline: how many firms at each stage per `docs/GO_TO_MARKET.md`?
5. Run a retrospective: what slowed us down? What went faster than expected?
6. Update the realistic column in `THE_PLAN.md` if reality has drifted by >20%.
7. Commit the monthly retro as `docs/retros/YYYY-MM.md`.

---

## 15. Cross-references

This checklist deliberately does NOT repeat content from the specs. When you need detail, open the source of truth:

| Need | Read |
|---|---|
| Hard rules, feel qualities, core principles | `CLAUDE.md` |
| Strategic plan with phase targets and bandwidth math | `THE_PLAN.md` |
| Every page, every flow | `specs/APP_BLUEPRINT.md` |
| Data model, tables, API contracts, migrations, GDPR | `specs/DATA_ARCHITECTURE.md` |
| AI tools, budget, degraded mode, eval rules | `specs/AI_FEATURES.md` |
| Tokens, atoms, patterns (locked) | `specs/DESIGN_SYSTEM.md` |
| Responsive rules, PWA, offline scope | `specs/MOBILE_STRATEGY.md` |
| Tier 1 vs Tier 2 vs anti-scope | `docs/SCOPE.md` |
| The 15-item quality gate | `docs/FLAWLESS_GATE.md` |
| Six-layer testing strategy | `docs/TESTING_STRATEGY.md` |
| M1-M10 modularity rules enforced in CI | `docs/MODULARITY.md` |
| Per-country expansion cheat sheets | `docs/COUNTRY_PLAYBOOKS.md` |
| CSV imports, OCR pipeline, payroll export | `docs/DATA_INGESTION.md` |
| Deferred features with triggers | `docs/DEFERRED_DECISIONS.md` |
| Commercial plan, pricing, pilots | `docs/GO_TO_MARKET.md` |
| Retention, GDPR, per-country compliance | `docs/COMPLIANCE.md` |
| Degraded mode behavior per feature | `docs/DEGRADED_MODE.md` |
| Rollback procedures, schema drift, PITR | `docs/ROLLBACK_RUNBOOK.md` |
| ADR for any architectural "why" | `docs/decisions/ADR-*.md` |
| Agent roles and collaboration | `agents/AGENTS.md` |
| Visual target for every page | `prototype/*.html` |

---

## 16. Deploy track (founder-triggered, post-MVP)

**Do not start this section until Phase 5a MVP is demo-ready AND the founder explicitly asks for deployment.** The deploy track is orthogonal to the build track. Nothing in Phase 2 through Phase 5a requires GCP. The only reason to deploy is that a pilot customer has signed and needs a production URL they can log into.

The agent never initiates this track. The agent never continues from Phase 5a into §16 unprompted. Deployment is a founder decision with explicit approval, not a subsection the agent walks through on its own.

### 16.1 GCP environment provisioning

Run `docs/runbooks/gcp-bootstrap.md` using `gamma-ops` CLI commands from `infra/ops/` where implemented, gcloud fallbacks where not.

- [ ] 👥 `gcloud auth login` + `gcloud auth application-default login`
- [ ] 👥 Find billing account ID: `gcloud billing accounts list`
- [ ] 👥 Create projects `gamma-staging-001` and `gamma-prod-001` via `gamma-ops gcp projects create`
- [ ] 👥 Enable APIs on both (sqladmin, run, storage, kms, secretmanager, aiplatform, pubsub, cloudscheduler, monitoring, logging, iamcredentials)
- [ ] 👥 Link billing account
- [ ] 👥 Configure Workload Identity Federation for GitHub Actions (no service account JSON files)
- [ ] 👥 Configure GCP billing alerts at 50%, 80%, 100%
- [ ] 👥 Create KMS keyring `gamma-tenant-keys` + platform CryptoKey `gamma-platform-key` with 365-day rotation
- [ ] 👥 Create 4 GCS buckets (uploads, backups, legal-hold, static) with CMEK via `gamma-ops gcp storage create-bucket`
- [ ] 👥 Apply retention policy LOCK to the legal-hold bucket (once, cannot be undone)
- [ ] 👥 Provision Cloud SQL Postgres 16 Regional HA (gcloud [STUB] until `gamma_ops/gcp/cloudsql.py` is implemented)
- [ ] 👥 Create DB password + JWT signing key + Vertex API key in Secret Manager via `gamma-ops gcp secrets create`
- [ ] 👥 Configure Cloud Run services (ops, app, portal, worker) with `min_instances=1` in prod, `0` in staging
- [ ] 👥 Configure VPC connector for Cloud Run to Cloud SQL private IP
- [ ] 👥 Configure Cloudflare DNS + WAF + Access via `docs/runbooks/cloudflare-bootstrap.md`
- [ ] 👥 Set up GitHub repo branch protection on `main`
- [ ] 👥 Set up Cloud Monitoring dashboards + Cloud Logging routing

**Reference:** `docs/runbooks/gcp-bootstrap.md`, `docs/runbooks/cloudflare-bootstrap.md`, `infra/ops/README.md`, ADR-001, ADR-008

### 16.2 Swap vendor wrappers from stub to real implementations

Each swap is a single-file change because the Protocol interface is stable.

- [ ] 👥 `AIClient`: `MockAIClient` -> `VertexGeminiClient` (reads from Secret Manager)
- [ ] 👥 `BlobStorage`: `LocalFilesystemBlobStorage` -> `GCSBlobStorage` (uses §16.1 buckets with CMEK)
- [ ] 👥 `EmailSender`: `MailhogEmailSender` -> `WorkspaceSMTPRelaySender` (Google Workspace SMTP relay, IP-allowlisted)
- [ ] 👥 `PaymentProvider`: stays as `NullPaymentProvider` until DEF-029 triggers at customer 5-10
- [ ] 👥 `VisionOCR`: `MockVisionOCR` -> `GeminiVisionOCR`
- [ ] 👥 `TelemetryClient`: `StdoutTelemetryClient` -> `CloudMonitoringClient`
- [ ] 👥 Re-run every test suite (unit + property + contract + E2E) against real implementations
- [ ] 👥 Re-run AI eval harness against real Gemini; thresholds must still pass

### 16.3 First staging deploy

- [ ] 👥 Backend Docker image built and pushed to Artifact Registry
- [ ] 👥 Frontend Docker image built and pushed to Artifact Registry
- [ ] 👥 Backend + frontend deployed to Cloud Run in `gamma-staging-001` via `gamma-ops gcp cloudrun deploy`
- [ ] 👥 Cloudflare DNS CNAMEs pointing at Cloud Run URLs for `ops.<domain>`, `app.<domain>`, `portal.<domain>`
- [ ] 👥 Health checks green on all four services
- [ ] 👥 Test tenant created via the real operator console running on real Cloud SQL
- [ ] 👥 Onboarding wizard smoke test green against real Cloud SQL
- [ ] 🤝 Celebrate. First time the app runs on the internet.

### 16.4 DR drill and operational readiness

- [ ] 🤝 First DR drill: per-tenant rollback procedure on the staging test tenant per `docs/ROLLBACK_RUNBOOK.md`
- [ ] 🤝 Document the result in `docs/incidents/drills/YYYY-MM-DD-first-drill.md`
- [ ] 🤝 Schedule quarterly DR drills on the founder calendar
- [ ] 🤝 Write `docs/LEGAL_HOLD_RUNBOOK.md` break-glass procedure (ADR-005 M26)
- [ ] 🤝 Verify monitoring dashboards show real traffic from the smoke test

### Deploy track exit criteria

- [ ] GCP prod and staging provisioned, Workload Identity Federation configured
- [ ] Vendor wrappers swapped from stub to real, all tests still green
- [ ] First staging deploy successful, onboarding smoke test passes against Cloud SQL
- [ ] First DR drill completed and documented

The deploy track is a prerequisite for customer 1 going live in production. Phase 7 ("first paying customer onboarding + retention") depends on this track being green. Phase 5a does NOT depend on it. Phase 5b does NOT depend on it.

---

## 17. Operations automation (`infra/ops/`)

Every manual vendor operation (GCP, Cloudflare, tenants, database, testing) lives as a deterministic idempotent Python function in `infra/ops/gamma_ops/`. Skills, agents, and humans all call these functions instead of re-typing SDK calls or gcloud commands. The founder never learns gcloud; the founder runs `gamma-ops <group> <command>` and the library handles idempotency, logging, and error mapping.

### 17.1 Install once per machine

```
cd infra/ops
make install
source .venv/bin/activate
gamma-ops --help
```

Auth via Google Application Default Credentials: `gcloud auth application-default login`. Config via `.env` at `infra/ops/.env` (template: `.env.example`).

### 17.2 The operation catalog

The full catalog of ~80 operations (implemented, stub, planned) lives in `infra/ops/README.md`. Read it end to end once. Status markers:
- **Implemented:** working code, unit-tested, ready to run. Week 1 has: `gcp projects`, `gcp storage`, `gcp kms`, `gcp secrets`.
- **Stub:** function signature, docstring, raises `NotImplementedError`. Agents and humans can read the docstring to know what the function will do; implementation lands in Phase 2 weeks 2-6.
- **Planned:** listed in the README catalog but not yet scaffolded. Create as need arises.

### 17.3 How agents and skills use the ops library

When a Claude Code subagent needs to provision a GCP resource (create bucket, rotate key, provision tenant, run drift check), it does NOT write raw SDK code. It imports from `gamma_ops` and calls the function:

```python
from gamma_ops.gcp.storage import create_bucket
from gamma_ops.errors import ResourceAlreadyExists

bucket = create_bucket(
    name="gamma-prod-uploads-001",
    location="europe-west9",
    cmek_key="projects/gamma-prod-001/locations/europe-west9/keyRings/gamma-tenant-keys/cryptoKeys/gamma-platform-key",
    public_access_prevention="enforced",
)
```

This is enforced by the M1 rule in `docs/MODULARITY.md`: no vendor SDK imports outside the dedicated wrapper modules. The ops library IS the wrapper.

### 17.4 How to add a new operation

1. Pick the right module (`gamma_ops/gcp/...`, `cloudflare/...`, `tenants/...`, etc.)
2. Write the function with a full docstring (Purpose, Parameters, Returns, Raises, Idempotency, Example)
3. Map any SDK errors to `OpsError` subclasses in `gamma_ops/errors.py`
4. Write a unit test that mocks the vendor client
5. Add the function to the operation catalog in `infra/ops/README.md` with status "Implemented"
6. Wire a Click subcommand in `gamma_ops/cli.py` if humans should call it from the terminal
7. Reference it from any relevant runbook in `docs/runbooks/`
8. Ship

### 17.5 How to add a new runbook

Runbooks in `docs/runbooks/` are for one-off or rare operations with authorization implications. Runbooks reference ops library functions where available and fall back to raw gcloud or vendor CLI where not. See `docs/runbooks/README.md` for the index and the template.

### 17.6 Implementation roadmap

The ops library backfill runs **on the §16 Deploy Track timeline, not Phase 2**. The MVP does not need GCP. Backfill order when §16 starts:

- [x] `gcp/projects`, `gcp/storage`, `gcp/kms`, `gcp/secrets` (implemented in the initial `infra/ops/` commit)
- [ ] `gcp/cloudsql`, `gcp/iam`, `db/backup` (§16.1 Cloud SQL provisioning)
- [ ] `cloudflare/dns`, `cloudflare/waf`, `cloudflare/access` (§16.1 Cloudflare bootstrap)
- [ ] `gcp/cloudrun` (§16.3 first staging deploy)
- [ ] `gcp/monitoring`, `gcp/scheduler`, `gcp/pubsub` (§16.4 operational readiness)
- [ ] `tenants/provision`, `tenants/delete`, `tenants/migrate`, `tenants/drift`, `db/fingerprint` (§16.3 test tenant flow)
- [ ] `testing/seed`, `testing/flawless_gate` (incremental during Phase 5)
- [ ] Ongoing: new operations as they appear in a runbook or a checklist task

---

## 18. Final word

You made a plan. The plan is closed.

From this point forward, you execute. This file is your execution contract with yourself. If it is not on this checklist, you are not doing it. If it is on this checklist, you are doing it or you are explaining in your weekly retro why it slipped.

**The single priority for the agent right now is: Phase 5a MVP acceptance test 13 of 13 green locally.** Nothing else. No GCP. No GTM. No deployment. Build the demo, screen-share it to prospects, sign an LOI, then the founder calls for §16 Deploy Track.

**The single priority for the founder right now is:** one-time dev machine unblock (`newgrp docker && make mvp-up`), then Phase 3a through Phase 5a founder-review gates (one hour blocked per Tier 1 feature at 1440px desktop AND 320px mobile AND dark mode AND light mode, item 15 "feels like Gamma"), plus the parallel admin track in `FOUNDER_CHECKLIST.md` §§2-9 (pipeline, discovery, paperwork, runway).

Go build Gamma.
