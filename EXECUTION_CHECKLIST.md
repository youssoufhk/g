# Gamma Execution Checklist

> **Read this file every Monday morning. This is the single source of truth for "what do I work on next".**
>
> Strategy, architecture, data model, and spec details are answered in the files linked at the bottom of each section. This file does NOT repeat spec content. It linearizes execution into checkboxes and points at the reference.
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

- [ ] 🤝 Commit the final planning pass to `main` with the title `plan: v1.0 positioning lock - Gamma, €35/€26 pricing, month-end close agent, multi-country scaffolding`
- [ ] 🤝 Read CLAUDE.md together, line by line, confirm both founders understand all hard rules
- [ ] 🤝 Read this checklist together, confirm division of labor (founder 🧑 = product + design + frontend; co-founder 👥 = backend + infra + AI; 🤝 = both join)
- [ ] 🤝 Pin co-founder commitment in writing: minimum 32 hours per week each, 4-year vesting, 1-year cliff, IP assignment to Global Gamma Ltd, exit clause. Signed before first commit of code.
- [ ] 🤝 Install pre-commit hooks: `pipx install pre-commit && cd <repo> && pre-commit install`. Required before any code commit. Blocks em dashes, "utilisation", committed secrets via gitleaks. See `docs/runbooks/secrets-management.md` §9.
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

## 3. Phase 2: Foundation build (target: weeks 1-7)

The biggest phase. Lots of parallelizable work. Two full-time founders can finish in 4-7 weeks.

### 3.1 Environment and infrastructure

> **Run via `docs/runbooks/gcp-bootstrap.md`.** Every step below has an exact command in the runbook, using the `gamma-ops` Python CLI from `infra/ops/` where the function is implemented, and a gcloud fallback marked [STUB] where it is not. Run the runbook once for staging, then once for prod. Install the ops library first per `infra/ops/README.md`.

- [ ] 👥 Install `infra/ops/` library: `cd infra/ops && make install && source .venv/bin/activate`
- [ ] 👥 Verify `gamma-ops --help` lists the command groups
- [ ] 👥 Create GCP project `gamma-staging-001` via `gamma-ops gcp projects create`
- [ ] 👥 Create GCP project `gamma-prod-001` via `gamma-ops gcp projects create`
- [ ] 👥 Enable APIs via `gamma-ops gcp projects enable-apis` (sqladmin, run, storage, kms, secretmanager, aiplatform, pubsub, cloudscheduler, monitoring, logging, iamcredentials)
- [ ] 👥 Link billing account via `gamma-ops gcp projects link-billing`
- [ ] 👥 Configure Workload Identity Federation for GitHub Actions to GCP (no service account JSON files). See `docs/runbooks/secrets-management.md` §4.
- [ ] 👥 Configure GCP billing alerts at 50%, 80%, 100% (console, one-time)
- [ ] 👥 Create KMS keyring `gamma-tenant-keys` via `gamma-ops gcp kms create-keyring`
- [ ] 👥 Create platform CryptoKey `gamma-platform-key` with 365-day rotation via `gamma-ops gcp kms create-key`
- [ ] 👥 Create 4 GCS buckets (uploads, backups, legal-hold, static) with CMEK via `gamma-ops gcp storage create-bucket`
- [ ] 👥 Apply retention policy LOCK to the legal-hold bucket (run once, cannot be undone)
- [ ] 👥 Provision Cloud SQL Postgres 16 Regional HA (gcloud [STUB], tracked in `gamma_ops/gcp/cloudsql.py`)
- [ ] 👥 Create DB password + JWT signing key + Vertex API key in Secret Manager via `gamma-ops gcp secrets create`
- [ ] 👥 Configure Cloud Run services (ops, app, portal, worker) with `min_instances=1` prod, `0` staging (gcloud [STUB] until `gamma_ops/gcp/cloudrun.py` lands)
- [ ] 👥 Configure VPC connector for Cloud Run to Cloud SQL private IP
- [ ] 👥 Configure Cloudflare DNS + WAF + Access via `docs/runbooks/cloudflare-bootstrap.md`
- [ ] 👥 Set up GitHub repo with branch protection on `main`
- [ ] 👥 Set up GitHub Actions CI pipelines (stub, filled in as we add layers)
- [ ] 👥 Set up Cloud Monitoring dashboards with multi-region labels (A9)
- [ ] 👥 Set up Cloud Logging with per-service log routing

**Reference:** `docs/runbooks/gcp-bootstrap.md` (the procedure), `docs/runbooks/cloudflare-bootstrap.md`, `infra/ops/README.md` (the operation catalog), `docs/decisions/ADR-001-tenancy.md`, `docs/decisions/ADR-008-deployment.md`

### 3.2 Backend skeleton

- [ ] 👥 🤖 FastAPI + Python 3.12 project skeleton in `backend/`
- [ ] 👥 SQLAlchemy 2.0 async + asyncpg
- [ ] 👥 Alembic migration runner
- [ ] 👥 Tenant orchestration: `backend/app/core/tenancy.py` with `search_path` middleware
- [ ] 👥 Provisioning service: create schema per tenant, run migrations, seed holidays
- [ ] 👥 Authentication skeleton: passkey + password + OIDC stubs (full build in Phase 3)
- [ ] 👥 RBAC middleware with audience-bound JWTs (M8 + ADR-010 + ADR-002)
- [ ] 👥 Celery + Redis setup, one queue per priority level
- [ ] 👥 WebSocket notification layer with `(user_id, tenant_id)` subscription scoping (B1, ADR-004)
- [ ] 👥 Audit log table + DB trigger forbidding UPDATE and DELETE
- [ ] 👥 Event bus: `backend/app/events/bus.py` with local in-process dispatcher (M5)
- [ ] 👥 Feature flag registry: `backend/app/core/feature_registry.py` (M6)
- [ ] 👥 Request-scoped feature flag evaluation (coalesced query per request)

**Reference:** `specs/DATA_ARCHITECTURE.md` sections 2-3, ADRs 001-004, `docs/MODULARITY.md`

### 3.3 Vendor wrappers (M1 - critical, do this before any feature)

Every vendor sits behind an interface. No file outside these wrappers imports a vendor SDK.

- [ ] 👥 `backend/app/ai/client.py` with `AIClient` interface + `VertexGeminiClient` implementation
- [ ] 👥 `backend/app/pdf/renderer.py` with `PDFRenderer` interface + `WeasyPrintRenderer` implementation
- [ ] 👥 `backend/app/storage/blob.py` with `BlobStorage` interface + `GCSBlobStorage` implementation
- [ ] 👥 `backend/app/email/sender.py` with `EmailSender` interface + `WorkspaceSMTPRelaySender` implementation
- [ ] 👥 `backend/app/billing/provider.py` with `PaymentProvider` interface (manual path for v1.0, Stripe stub registered)
- [ ] 👥 `backend/app/tax/calculator.py` with `TaxCalculator` interface + strategy registry
- [ ] 👥 `backend/app/ocr/vision.py` with `VisionOCR` interface + `GeminiVisionOCR` implementation
- [ ] 👥 `backend/app/monitoring/telemetry.py` with `TelemetryClient` interface + `CloudMonitoringClient` implementation
- [ ] 👥 `backend/app/notifications/provider.py` with `NotificationProvider` interface + local in-process implementation
- [ ] 👥 CI lint rule: forbid vendor SDK imports outside these wrappers (grep for `google.cloud`, `stripe.`, `anthropic.`, `weasyprint.`, etc.)

**Reference:** `docs/MODULARITY.md` M1 table

### 3.4 Multi-country scaffolding (C1-C7, FR + UK only in v1.0)

- [ ] 👥 Add `tenants.residency_region`, `tenants.legal_jurisdiction`, `tenants.base_currency`, `tenants.primary_locale`, `tenants.supported_locales` columns (if not already in the initial migration)
- [ ] 👥 Create `public.country_holidays` table
- [ ] 👥 Seed FR and UK public and bank holidays for 2026 and 2027
- [ ] 👥 Scaffold `backend/app/features/tax/rules/` with empty `fr.py` and `uk.py` (full implementation in Phase 5 invoicing)
- [ ] 👥 Scaffold `backend/app/features/leaves/rules/` with empty `fr.py` and `uk.py`
- [ ] 👥 Scaffold `backend/app/features/timesheets/rules/` with empty `fr.py` and `uk.py`
- [ ] 🧑 Set up `next-intl` with `en-GB` and `fr-FR` locale files (per-feature folders, not monolithic)

**Reference:** `specs/DATA_ARCHITECTURE.md` §14-§15, `docs/COUNTRY_PLAYBOOKS.md`

### 3.5 Frontend skeleton

- [ ] 🧑 🤖 Next.js 15 + React 19 + Tailwind 4 project in `frontend/`
- [ ] 🧑 CSS-first theme: `styles/globals.css` with `@theme inline` bridge
- [ ] 🧑 `styles/tokens.css` byte-exact mirror of `prototype/_tokens.css` (set up `npm run sync-tokens`)
- [ ] 🧑 `components/shell/sidebar.tsx` at 224px width (NEVER 240)
- [ ] 🧑 `components/shell/topbar.tsx` with SearchInput slot (280px desktop, icon-button mobile modal)
- [ ] 🧑 `components/shell/bottom-nav.tsx` (mobile only)
- [ ] 🧑 Command palette infrastructure (Cmd+K wiring, modal UI, read-only tool dispatch layer)
- [ ] 🧑 Notifications drawer (S2) with WebSocket connection + polling fallback
- [ ] 🧑 ConflictResolver pattern (S3) in `components/patterns/`
- [ ] 🧑 EntitlementLock UI (S4) in `components/ui/`
- [ ] 🧑 TanStack Query + Zustand setup per ADR-003
- [ ] 🧑 `lib/api-client.ts` with 402/409 handling
- [ ] 🧑 `lib/optimistic.ts` with `useOptimisticMutation` (three-layer 409 resolution)
- [ ] 🧑 `lib/offline.ts` with IndexedDB queue stub for timesheet entries
- [ ] 🧑 `lib/realtime.ts` WebSocket singleton
- [ ] 🧑 PWA manifest + service worker (read cache + offline queue stubs)

**Reference:** `specs/DESIGN_SYSTEM.md`, `specs/APP_BLUEPRINT.md` §13, `docs/decisions/ADR-003-state.md`, ADR-004, ADR-009

### 3.6 Atom layer (3 to 4 weeks of one founder's time, parallelizable in three groups)

**Group A (weeks 1-2):**
- [ ] 🧑 🤖 Button (primary, secondary, tertiary, disabled, loading)
- [ ] 🧑 🤖 Input (text, number, email)
- [ ] 🧑 🤖 Select
- [ ] 🧑 🤖 Checkbox (new atom for bulk-select columns and forms)
- [ ] 🧑 🤖 Radio
- [ ] 🧑 🤖 Toggle
- [ ] 🧑 🤖 Textarea

**Group B (weeks 2-3):**
- [ ] 🧑 🤖 Card
- [ ] 🧑 🤖 Badge
- [ ] 🧑 🤖 Pill
- [ ] 🧑 🤖 Breadcrumb
- [ ] 🧑 🤖 Tabs
- [ ] 🧑 🤖 Accordion

**Group C (weeks 3-4):**
- [ ] 🧑 🤖 Modal
- [ ] 🧑 🤖 Drawer
- [ ] 🧑 🤖 Toast
- [ ] 🧑 🤖 Tooltip
- [ ] 🧑 🤖 SearchInput (new atom for topbar global non-AI search)
- [ ] 🧑 🤖 AIInsightCard (new atom, dashboard only)
- [ ] 🧑 🤖 AIInvoiceExplanation (new atom, month-end close only)
- [ ] 🧑 🤖 ConflictResolver composite pattern

**Every atom must:**
- Match the prototype at 1440px AND 320px, byte-for-byte
- Support dark mode AND light mode (dark is default per principle 9)
- Have a Storybook story with every variant and state
- Pass WCAG 2.1 AA (contrast, focus ring, keyboard reachable)
- Use existing design tokens only (no new tokens)

**Reference:** `specs/DESIGN_SYSTEM.md`, `prototype/_tokens.css`

### 3.7 Testing infrastructure (do this before Phase 3 or the house of cards collapses)

- [ ] 🤝 Install pytest + pytest-cov + pytest-asyncio + pytest-mock + hypothesis + playwright + pytest-playwright + locust
- [ ] 🤝 Configure CI pipelines on GitHub Actions: unit, property, contract, E2E smoke, snapshot
- [ ] 🤝 Set the coverage floor: 85% overall, 100% on financial math markers
- [ ] 👥 Eval harness skeleton in `backend/app/ai/evals/` with folders for `month_end_close/`, `command_palette/`, `receipt_ocr/`, `insight_cards/`
- [ ] 👥 Seed 5 hand-curated eval examples per feature (total 20 examples)
- [ ] 🤝 First 5 property tests (invoice subtotal, invoice total, leave balance invariant, FX transitivity, tenant isolation)
- [ ] 🤝 Contract test harness: FastAPI OpenAPI emission + `openapi-typescript` diff in CI
- [ ] 🤝 Snapshot test framework + placeholder invoice PDF snapshot (real snapshots arrive with invoicing in Phase 5)
- [ ] 🤝 First 5 E2E scenarios drafted (onboarding, timesheet submission, leave request, expense with OCR, month-end close draft path) - stubs are fine, they run against the real feature in Phase 5
- [ ] 🤝 CI lint: em dash detection (U+2014, U+2013) across all `.md`, `.ts`, `.tsx`, `.py` files; blocks merge on match
- [ ] 🤝 CI lint: "utilisation" detection (case-insensitive) across all code and docs; exception: the banned-word references in CLAUDE.md, SCOPE.md, FLAWLESS_GATE.md
- [ ] 🤝 CI lint: M1 vendor SDK imports outside wrappers
- [ ] 🤝 CI lint: M3 cross-feature model imports
- [ ] 🤝 CI check: M7 alembic `upgrade && downgrade -1 && upgrade` on every PR
- [ ] 🤝 CI check: M4 orphan-row test after test-tenant delete

**Reference:** `docs/TESTING_STRATEGY.md`, `docs/MODULARITY.md`

### 3.8 Operator console minimum

- [ ] 👥 Operator authentication (passkey-only, printed recovery codes, founder day-0 procedure)
- [ ] 👥 Tenant list + detail pages
- [ ] 👥 Create tenant action (triggers provisioning)
- [ ] 👥 Kill switch toggles (inventory from `docs/DEGRADED_MODE.md` §1)
- [ ] 👥 Feature flag overrides per tenant
- [ ] 👥 Migration status per tenant

**Full operator console in Phase 3. This is the minimum to create a test tenant for Phase 3 work.**

**Reference:** `specs/APP_BLUEPRINT.md` §9 (admin), ADR-010

### 3.9 Runbooks and drills

- [ ] 🤝 First DR drill: run `docs/ROLLBACK_RUNBOOK.md` per-tenant rollback procedure on a staging tenant
- [ ] 🤝 Document the result in `docs/incidents/drills/2026-MM-DD-first-drill.md`
- [ ] 🤝 Schedule quarterly DR drills on the calendar
- [ ] 🤝 Write `docs/LEGAL_HOLD_RUNBOOK.md` with break-glass procedure (per ADR-005 M26)

### 3.10 GTM seeds (parallel to build, ~4 hours per week total)

Two full-time founders means GTM starts now, not Phase 4.

- [ ] 🧑 Write blog post #1: "The 10-hour month-end close problem in consulting firms"
- [ ] 🧑 Write blog post #2: "Why Kantata is still winning (and how we'll change that)"
- [ ] 🧑 Write blog post #3: "Agentic AI for consulting ops: drafts, not decisions"
- [ ] 🧑 Set up landing page placeholder (Framer or Next.js) with email capture + 3-minute founder video
- [ ] 🧑 Record the 3-minute founder intro video (raw, authentic, no agency)
- [ ] 🧑 Start founder LinkedIn presence, 2 posts per week on consulting ops pain
- [ ] 🧑 Set up `support@[domain]` and `hello@[domain]` inboxes
- [ ] 🧑 Start the email list (MailerLite or Buttondown, free tier)
- [ ] 🤝 Identify 50 warm-intro targets (LinkedIn): COOs, HR directors, finance leads at EU consulting firms 50-500 employees, FR + UK
- [ ] 🤝 Send 10 warm-intro requests per week
- [ ] 🤝 Target: 10 discovery calls completed by Phase 3 exit

**Reference:** `docs/GO_TO_MARKET.md`

### Phase 2 exit criteria

All of these must be true before starting Phase 3. Any red item blocks the transition.

- [ ] GCP prod and staging provisioned, CI green on an empty PR
- [ ] All M1 vendor wrappers in place, CI enforces no direct SDK imports
- [ ] Atom layer complete (Groups A + B + C), all atoms pass contrast and focus-ring checks in both themes
- [ ] Shell (sidebar + topbar + bottom-nav + command palette + notifications drawer + conflict resolver + entitlement lock) usable on an empty page
- [ ] Testing infrastructure live: first 5 property tests passing, first 5 E2E scenarios stub running, contract test harness green
- [ ] Operator console minimum shipped (create a test tenant end-to-end)
- [ ] First DR drill completed and documented
- [ ] GTM: 10 discovery calls done, email list has >50 subscribers
- [ ] 0 em dashes, 0 "utilisation" (except banned-word references) across repo

---

## 4. Phase 3: Auth + onboarding + full operator console (target: weeks 8-13)

- [ ] 👥 🤖 Login page (passkey + password + OIDC)
- [ ] 👥 🤖 Register page
- [ ] 👥 🤖 Password reset flow (email-verify + re-confirm)
- [ ] 👥 🤖 MFA enrollment (TOTP + 10 recovery codes)
- [ ] 👥 🤖 Recovery code regeneration flow
- [ ] 👥 🤖 Account lockout after 5 failed attempts (15-min cooldown + email alert)
- [ ] 👥 🤖 Session invalidation on password change
- [ ] 👥 🤖 Session invalidation on role downgrade
- [ ] 👥 🤖 Password breach check against bundled top-10k list at set-time
- [ ] 🧑 🤖 Tenant onboarding wizard (pages: welcome, company info, CSV upload, column mapping, preview, import progress, done)
- [ ] 👥 🤖 CSV import module (`backend/app/features/imports/`) with validation, idempotency, progress SSE, error CSV download
- [ ] 👥 🤖 AI column mapper tool (`features/imports/ai_tools.py`) with 5 eval examples
- [ ] 👥 🤖 Operator console full: tenant list + detail + kill switches + flags + billing + legal + migrations
- [ ] 🧑 Flawless gate run on Auth flow (login, register, password reset, MFA)
- [ ] 🧑 Flawless gate run on Onboarding wizard
- [ ] 🧑 Flawless gate run on Operator console
- [ ] 🤝 **GTM milestone:** first pilot candidate identified at Interested stage

**Reference:** `specs/APP_BLUEPRINT.md` §1, ADR-002, ADR-010, `docs/DATA_INGESTION.md`

### Phase 3 exit criteria

- [ ] Auth covers all paths (passkey, password, OIDC, MFA, recovery) with CI test coverage
- [ ] Onboarding wizard can import a 201-employee CSV in under 5 minutes end-to-end
- [ ] Operator can create a tenant, set kill switches, review audit log
- [ ] All three features pass the 15-item flawless gate
- [ ] 5 discovery calls converted to follow-up meetings (soft signal, not a gate blocker)

---

## 5. Phase 4: Core data + dashboard pass 1 (target: weeks 13-18)

- [ ] 👥 🤖 Employees directory (list + filter + search + pagination)
- [ ] 👥 🤖 Employee profile page (overview + team + allocations + contribution)
- [ ] 👥 🤖 Clients directory
- [ ] 👥 🤖 Client profile page (overview + projects + invoices + revenue)
- [ ] 👥 🤖 Projects list
- [ ] 👥 🤖 Project detail page (client + status + budget + allocations + pipeline)
- [ ] 👥 🤖 Team allocation CRUD (with overlap prevention + allocation_pct constraint)
- [ ] 🧑 🤖 Dashboard pass 1: KPI strip (4 cards: Revenue YTD, Billable days this week, Approvals pending, Team capacity)
- [ ] 🧑 Flawless gate run on Employees
- [ ] 🧑 Flawless gate run on Clients
- [ ] 🧑 Flawless gate run on Projects
- [ ] 🧑 Flawless gate run on Dashboard pass 1
- [ ] 🤝 **VALIDATED LEAD GATE**: at least one lead in writing with EITHER signed LOI OR committed pilot OR prepaid deposit. If this gate fails in 4 weeks of focused outreach, STOP and reconsider Phase 5.

**Reference:** `specs/APP_BLUEPRINT.md` §2, §3, §7, `THE_PLAN.md` Validated lead gate section

### Phase 4 exit criteria

- [ ] 4 features pass the flawless gate (Employees, Clients, Projects, Dashboard pass 1)
- [ ] Validated lead gate cleared (at least 1 committed lead)
- [ ] 10 firms at Interested stage per `docs/GO_TO_MARKET.md` §4
- [ ] All atoms used in these pages are from the existing DESIGN_SYSTEM.md, no new atoms introduced

---

## 6. Phase 5: Core modules (target: weeks 18-32, the heaviest phase)

Eleven features, each through the full 10-step quality chain. Each feature gets its own sub-checklist. The template is below; copy and expand as each feature starts.

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

### 6.2 Feature order (locked; do not reorder)

- [ ] 🤝 🤖 **Timesheets** (week-as-entity, grid UX, optimistic sync, offline queue, approval hand-off, conflict resolver)
- [ ] 🤝 🤖 **Leaves** (accrual job, calendar, request flow, manager approval, balance invariant enforced at DB)
- [ ] 🤝 🤖 **Expenses** (submission, OCR pipeline, receipt upload, approval flow, reimbursement state machine)
- [ ] 🤝 🤖 **Invoices** (manual path first: list, detail, PDF render via WeasyPrint, sequential numbering, EU reverse-charge emission, state machine)
- [ ] 🤝 🤖 **Month-end close agent** (THE v1.0 agentic feature: deterministic analyzers + Gemini explanation + review queue + confirmation + batch send)
- [ ] 🤝 🤖 **Approvals hub** (centralized queue, bulk actions, delegation, undo window, idempotency)
- [ ] 🤝 🤖 **Admin console** (users, roles, custom fields, feature flags, audit exports)
- [ ] 🤝 🤖 **Account settings** (profile, password, MFA, recovery codes, sessions, notification preferences)
- [ ] 🤝 🤖 **Dashboard pass 2** (KPI strip + AI insight cards + ranked signals + degraded-mode banner)
- [ ] 🤝 🤖 **Payroll export** (first adapter for the first pilot's provider, CSV format + snapshot test)
- [ ] 🤝 🤖 **Ongoing imports** (scheduled CSV, change tracking, admin import page sharing the onboarding pipeline)

### 6.3 Phase 5 parallel activities

- [ ] 🧑 🤖 Bulk row actions across approvals, expenses, leaves, invoices, timesheets lists (cross-cutting per `docs/SCOPE.md`)
- [ ] 🧑 🤖 Global non-AI search in topbar with `/api/v1/search` endpoint
- [ ] 🧑 🤖 In-app feedback button with modal + `/api/v1/feedback` + rate limit
- [ ] 🧑 🤖 Notifications inbox page at `/notifications`
- [ ] 🤝 **First pilot onboarding**: import the pilot's real data, weekly check-ins, day 45 commit conversation, day 60 sign or offboard cleanly
- [ ] 🤝 Seed round prep: deck, data room, target list of 40 EU seed VCs (not raising yet, preparing)

### Phase 5 exit criteria

- [ ] All 11 core modules pass the flawless gate
- [ ] 45 Playwright E2E scenarios live and green on every PR
- [ ] Property tests cover all invariants from `docs/TESTING_STRATEGY.md` layer 2
- [ ] First pilot live in production, weekly check-ins running
- [ ] At least 2 leads at Committed stage (signed annual or prepaid deposit)
- [ ] AI eval suites all above their pass thresholds
- [ ] SOC 2 Type 1 audit engaged (auditor selected, scope agreed)
- [ ] First monthly load test run, p95 < 500ms across all endpoints

---

## 7. Phase 6: Tier 2 + portal (target: weeks 32-42)

- [ ] 🤝 🤖 Calendar (month view read-only, projects + leaves as colored blocks, no drag-edit)
- [ ] 🤝 🤖 Gantt (read-only, project timelines)
- [ ] 🤝 🤖 Resource planning page (capacity heatmap, read-only in v1.0)
- [ ] 🤝 🤖 HR module (people directory, enhanced profile, historical data)
- [ ] 🤝 🤖 Insights page (expanded AI insight cards beyond the dashboard strip)
- [ ] 🤝 🤖 Client portal: login page
- [ ] 🤝 🤖 Client portal: invoices view (read-only for client contacts)
- [ ] 🤝 SOC 2 Type 1 audit in progress
- [ ] 🧑 Flawless gate runs on each Tier 2 feature
- [ ] 🤝 Customer 2 onboarding (second paying customer)

### Phase 6 exit criteria

- [ ] 7 Tier 2 features shipped and passing the gate
- [ ] Customer 2 live in production
- [ ] SOC 2 Type 1 audit report delivered
- [ ] Quarterly chaos drill run

---

## 8. Phase 7: Hardening + launch (target: weeks 42-54)

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

The co-founder backfills stubs as Phase 2 progresses:

- [ ] Week 1: `gcp/projects`, `gcp/storage`, `gcp/kms`, `gcp/secrets` (already IMPLEMENTED)
- [ ] Week 2: `gcp/cloudsql`, `gcp/iam`, `db/backup`
- [ ] Week 2-3: `cloudflare/dns`, `cloudflare/waf`, `cloudflare/access`
- [ ] Week 3: `gcp/cloudrun`
- [ ] Week 4: `gcp/monitoring`, `gcp/scheduler`, `gcp/pubsub`
- [ ] Week 5: `tenants/provision`, `tenants/delete`, `tenants/migrate`, `tenants/drift`, `db/fingerprint`
- [ ] Week 6: `testing/seed`, `testing/flawless_gate`
- [ ] Ongoing: new operations as they appear in a runbook or a checklist task

---

## 18. Final word

You made a plan. The plan is closed.

From this point forward, you execute. This file is your execution contract with yourself. If it is not on this checklist, you are not doing it. If it is on this checklist, you are doing it or you are explaining in your weekly retro why it slipped.

**The single priority for week 1 is: GCP projects provisioned, M1 vendor wrappers in place, first atom shipped, first blog post published, first 5 discovery calls booked.**

Go build Gamma.
