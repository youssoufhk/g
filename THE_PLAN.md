# THE PLAN

> **Read this file before every work session. No exceptions.**
> This is the founder's stick-to-it plan. The planning is done. No more "let me think about it." Execute in order.
> If reality disagrees with this plan, update this file explicitly, do not silently drift.
> Last updated: 2026-04-15 (after the 15-round data architecture planning session locked 102 decisions + the spec rewrite).

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

Break any of these and you are re-planning, which is the thing you promised yourself not to do.

1. **Do not re-open locked decisions.** The 102 decisions in the spec files are closed. If you think one is wrong, open a PR that updates the spec file with explicit reasoning, then refer back to it. No silent drift.
2. **Work one Tier 1 feature at a time.** Finish it to the flawless gate before starting the next. Parallel work on Tier 1 features is how quality slips.
3. **Defer means defer.** Every item in `docs/DEFERRED_DECISIONS.md` has a trigger. Do not revisit it before the trigger fires. Write the DEF-NNN in code comments so future-you can find the context.
4. **Match the prototype.** `prototype/*.html` is the visual spec. No inventing new atoms. If a new atom is needed, stop and ask before building it.
5. **No em dashes, no "utilisation", no animations, no decorative flourishes.** The CLAUDE.md hard rules apply to this file too.

---

## Where you are right now

**Phase 1 (Foundation docs) is DONE** as of 2026-04-15. All specs, ADRs, and the deferred decisions registry are final. The data-architecture planning progress file has been deleted; its content migrated into the permanent files above.

**Phase 2 (Foundation build) is NEXT.** Nothing is built yet. No GCP projects, no code, no database. You start from zero infrastructure.

---

## Target weeks per phase

**Week 0 = production build kickoff** (not prototype start). All week numbers are **targets**, not guarantees. Solo founder at ~20 h/week historically misses by 1.5 to 2x.

| Phase | Target weeks | Theme | Exit criteria |
|-------|-------------|-------|---------------|
| 0 | done | Prototype | All 19 HTML pages approved |
| 1 | done (2026-04-15) | Foundation docs | All specs + ADRs final, deferred registry extracted (DEF-001 to DEF-064) |
| 2 | 4 to 7 | Foundation build | GCP projects provisioned, FastAPI scaffold + Next.js scaffold + migration runner + ai/client.py + useOptimisticMutation + ConflictResolver + minimum operator console (tenant create/list/detail) |
| 3 | 8 to 11 | Auth + onboarding + full operator console | OIDC + passkey + password auth paths, onboarding wizard with AI column mapper, full operator console |
| 4 | 12 to 15 | Core data + Dashboard pass 1 | Employees, clients, projects, dashboard scaffold |
| 5 | 16 to 24 | Core modules | Timesheets (week-as-entity), leaves, expenses (OCR), invoices (PDF), approvals, admin, account, dashboard pass 2 |
| 6 | 25 to 34 | Tier 2 + portal | Calendar, Gantt, resource planning, HR module, insights page, client portal |
| 7 | 35 to 42 | Hardening + launch | Security audit, perf pass, beta onboarding, docs, public launch |

### Go-to-market milestones (target weeks, slide with phase slippage)

| Target week | Milestone |
|------------:|-----------|
| 11 | Auth + onboarding + operator console flawless |
| 15 | Dashboard pass 1 live with core data |
| 24 | All Tier 1 features flawless |
| 27 | First non-paying pilot kickoff (demo-to-contract motion, no self-serve signup) |
| 34 | Tier 2 features + client portal functional |
| 37 | Automated billing live (Stripe or Revolut, final choice at DEF-029 trigger time) |
| 40 | First paying customer signs (may be earlier via the manual Phase 2 billing path) |
| 42 | Public launch |

**Note:** billing automation is NOT on the critical path for first revenue. Phase 2 manual PDF invoicing via Workspace SMTP Relay can handle the first 1-5 customers without any Stripe/Revolut integration. The "automated billing live" milestone is for customer #6+.

### Slippage policy

- **Dates can move. Quality cannot.**
- If we are 2+ weeks behind on a phase, drop Tier 2 scope first, never Tier 1 quality.
- If a Tier 1 feature fails its flawless gate twice, escalate: founder decides scope cut or extra time.
- Update target weeks in this file when slippage happens. Do not keep stale targets visible.

### Honest caveats

- Total budget: ~720 to 880 hours at 20 h/week for 36 to 44 weeks. Realistic range is probably **14 to 18 months (1000+ hours)** for a solo founder building 14 Tier 1 features to a flawless bar.
- "One Tier 1 feature per week in Phase 5" is an aspiration. Some features (invoices, approvals, timesheets grid) will take 2 to 3 weeks each.
- Pilot and commercial milestones assume customer discovery is already in progress. If no warm leads exist by target week 20, the launch date slips.

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

**Goal:** infrastructure provisioned, core backend + frontend scaffolds running, the plumbing that every feature depends on in place.

**Target:** 4 weeks of founder work at 20 h/week (~80 hours). Probably slips to 5-6.

**Concrete tasks, in order:**

1. **GCP account setup**
   - [ ] Create two GCP projects: `gammahr-staging` and `gammahr-prod`
   - [ ] Apply Organization Policy `constraints/gcp.resourceLocations` restricting to `europe-west9` with `europe-west1` as allowed backup
   - [ ] Enable: Cloud Run, Cloud SQL, Cloud Storage, Secret Manager, Cloud Logging, Cloud Monitoring, Vertex AI, Cloud KMS, Compute Engine, Cloud Build
   - [ ] Set up billing alerts at €50, €150, €300/month (for prod); €20, €50, €100 (for staging)
   - [ ] Create service accounts: `cloud-run-sa`, `celery-worker-sa`, `migration-runner-sa`, `vertex-ai-sa` each with the minimum IAM needed

2. **Cloudflare setup**
   - [ ] Add `gammahr.com` zone
   - [ ] Create DNS records for `ops.gammahr.com`, `app.gammahr.com`, `portal.gammahr.com`, `mail.gammahr.com` pointing at the prod Cloud Run URL (proxied)
   - [ ] Enable Cloudflare Access on staging subdomains (founder IP only)
   - [ ] Set up Email Routing for `bounces@mail.gammahr.com` and `privacy@gammahr.com`, `support@gammahr.com`, `security@gammahr.com`, `invoices@gammahr.com` forwarding to founder inbox

3. **Google Workspace setup**
   - [ ] Subscribe to Google Workspace Business Starter for `gammahr.com` ($6/user/month)
   - [ ] Create `mailer@gammahr.com` service user for SMTP Relay
   - [ ] Configure SMTP Relay in Workspace Admin Console (IP allowlist from Cloud Run egress)
   - [ ] Set up SPF, DKIM (2048-bit), DMARC records on `mail.gammahr.com` with `p=none` for monitoring

4. **GitHub setup**
   - [ ] Create `gammahr/gammahr` repo (private, owner: you)
   - [ ] Add GitHub Environments: `staging`, `prod`
   - [ ] Add secrets: deploy service account key, staging DB URL, prod DB URL, Workspace SMTP creds
   - [ ] Set up branch protection on `main`: require PR review (from self, to force reflection), require CI green

5. **Backend scaffold**
   - [ ] `backend/app/main.py` with FastAPI, middleware chain: `tenancy`, `auth`, `rate_limit`, `audit`
   - [ ] `backend/app/core/tenancy.py` with `search_path` middleware per `specs/DATA_ARCHITECTURE.md` section 1.1
   - [ ] `backend/app/core/auth.py` with JWT factory supporting three `actor_type` values
   - [ ] `backend/app/core/database.py` with SQLAlchemy async engine + session factory
   - [ ] `backend/app/core/config.py` with Pydantic settings loading from Secret Manager
   - [ ] `backend/migrations/env.py` + `backend/migrations/runner.py` with Celery fan-out across N tenant schemas + `public.alembic_runs` tracking table + fake-tenant test harness (spin up 10 fake schemas, run migration, verify all at the new version)
   - [ ] `backend/app/ai/client.py` as the single Vertex AI abstraction with budget enforcement and kill-switch gate
   - [ ] `backend/app/core/gated_feature.py` decorator that calls entitlements + flags + kill switches in one place
   - [ ] `backend/app/events/publisher.py` with pluggable in-process vs Redis pub/sub fan-out
   - [ ] `backend/app/core/websocket.py` for the notifications channel at `/ws/notifications`

6. **Frontend scaffold**

   Scaffolding:
   - [ ] Next.js 15 App Router + React 19 + Tailwind 4 + TypeScript strict mode
   - [ ] `frontend/styles/tokens.css` byte-exact mirror of `prototype/_tokens.css` (CSS variables only, NO `tailwind.config.ts`, Tailwind 4 is CSS-first)
   - [ ] `frontend/styles/globals.css` with `@import tailwindcss` + `@theme inline` bridge to the tokens
   - [ ] `frontend/app/[locale]/(ops)/layout.tsx` + middleware (operator shell variant)
   - [ ] `frontend/app/[locale]/(app)/layout.tsx` + middleware (main app shell)
   - [ ] `frontend/app/[locale]/(portal)/layout.tsx` + middleware (portal shell, Phase 6)

   **Atom build order** (strictly sequential; each step passes side-by-side prototype parity before moving to the next):

   1. Shell atoms: Sidebar (224 px), Topbar (56 px), BottomNav (64 px), CommandPalette scaffold
   2. Typography + layout atoms: Heading, Text, Stack, Grid
   3. Button variants: primary, secondary, ghost, destructive, icon
   4. Input atoms: Input, Textarea, Select, DatePicker, FileDrop, Checkbox, Radio, Toggle
   5. Data display: Table, Row, Card, Badge, Avatar, ProgressBar, StatCard
   6. Feedback: Toast, InlineAlert, Skeleton, EmptyState
   7. Navigation: TabBar, Breadcrumb, Pagination
   8. Overlay: Modal, Drawer, Popover, Tooltip, BottomSheet
   9. Chart atoms: BarChart, LineChart, DonutChart (via Visx)
   10. AI atoms: CommandPalette, InsightCard, AIExplainButton, SuggestionChip
   11. Pattern compositions: `ConflictResolver`, `EmptyState`, `FilterBar`, `StatPill`, `ListPage`, `JobProgress` (SSE consumer)

   **Exit condition for the atom layer:** any page in `specs/APP_BLUEPRINT.md` can be built using only existing atoms. If a page needs something not in the atom layer, stop and ask the founder before inventing.

   Rules:
   - Never invent an atom. If not in `specs/DESIGN_SYSTEM.md`, stop and ask.
   - Never modify tokens. `prototype/_tokens.css` is the frozen source of truth.
   - Every atom has fixed dimensions per the design system. No "flexible" variants.
   - Accessible by default: ARIA, keyboard navigation, focus management.
   - Dark mode default. Light mode verified in parallel.
   - Storybook is deferred (DEF-049). Component documentation lives in code comments + visual parity against the prototype HTML files.

   Library plumbing:
   - [ ] `frontend/lib/optimistic.ts` with `useOptimisticMutation` wrapper centralizing the three-layer 409 reconciliation (optimistic rollback, field-level conflict diff modal, retry)
   - [ ] `frontend/lib/api-client.ts` with TanStack Query setup, tenant-aware base URL, error handling for 402 (upgrade required) and 409 (version conflict)
   - [ ] `frontend/lib/offline.ts` with tenant-scoped IndexedDB queue for timesheet entries
   - [ ] `frontend/lib/realtime.ts` with WebSocket singleton, reconnect logic, TanStack Query cache invalidation helpers
   - [ ] ESLint `eslint-plugin-boundaries` config enforcing `features/*` cannot import other `features/*`

7. **Database bootstrap**
   - [ ] Alembic migration: `public` schema with `tenants`, `operators`, `operator_sessions`, `audit_log` (partitioned), and the rest of the global tables from `specs/DATA_ARCHITECTURE.md` section 2.2 through 2.5
   - [ ] Alembic migration: a template `tenant_<slug>` schema creator function that can be called by the tenant creation flow
   - [ ] Seed the `feature_flags` table with the initial kill switches: `kill_switch.ai`, `kill_switch.signups`, `kill_switch.invoicing`, `kill_switch.email`, `kill_switch.ocr_uploads`, `kill_switch.webhooks`, `kill_switch.payment_processing`
   - [ ] Seed `sub_processors` with the initial list: Google Cloud (includes Vertex AI Gemini), Google Workspace, Cloudflare, GitHub/Microsoft
   - [ ] Deploy the migration runner + fake-tenant test harness: `pytest` spins up 10 fake schemas, runs the initial migration against each, verifies all at the new `alembic_version`

8. **Minimum operator console (so you can create tenants)**
   - [ ] `(ops)/login` passkey challenge
   - [ ] `(ops)/` dashboard with tenant count
   - [ ] `(ops)/tenants` list
   - [ ] `(ops)/tenants/new` wizard creating schema + seeding default entitlements + sending magic-link invite
   - [ ] `(ops)/tenants/[id]` detail with lifecycle actions
   - [ ] Operator self-provisioning: you manually add your own operator row to `public.operators` via SQL, then register a passkey via the UI

**Definition of done (Phase 2):**
- You can log into `ops.gammahr.com` with your passkey
- You can create a test tenant via the operator console
- The test tenant has its own schema and the initial entitlements
- You can send yourself a magic-link invite, land on `app.gammahr.com`, and see an empty-state dashboard
- Migration runner passes the fake-tenant test harness in CI
- All services deploy to staging automatically from `main` branch

**What NOT to build in Phase 2:**
- Login flows beyond the passkey challenge (Phase 3)
- Employee/client/project pages (Phase 4)
- Any Tier 2 pages (Phase 6)
- Any feature gated by `@gated_feature` other than the gate itself (wait until Phase 4)

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

**Goal:** the features that differentiate GammaHR from boring HR tools, and the client portal.

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

**Target:** 8 weeks.

1. **Security audit**: cross-tenant leak tests, auth flow attack surface, rate limit stress tests, SQL injection, XSS, CSRF
2. **Performance pass**: p95 latency targets met, Lighthouse scores, bundle sizes, database query counts, N+1 elimination
3. **Beta onboarding**: onboard 3 pilot customers manually (demo-to-contract motion)
4. **Docs site**: public documentation using Mintlify or similar
5. **Video tutorials**: onboarding, timesheet, expense, invoice (short recordings, not Hollywood)
6. **Legal review**: DPA, TOS, privacy policy reviewed by French SaaS lawyer (€500-2000)
7. **Public status page**: `status.gammahr.com` on Cloudflare Workers + R2
8. **Incident response runbook**: documented in `docs/ROLLBACK_RUNBOOK.md` and `docs/BILLING_LIFECYCLE.md`
9. **Customer #6 trigger check**: if customer #6 is coming, start DEF-028 (self-serve signup) + DEF-029 (payment processor)
10. **Public launch**: announce, Product Hunt, LinkedIn

**Definition of done:** 1 paying customer, no P0 bugs for 30 consecutive days, founder can take a week off without everything breaking.

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

You spent serious effort locking this plan. The hardest part of solo-founder SaaS is not building; it is the constant reopening of decided questions. This file exists to stop that.

When you want to reopen something, open the relevant spec file instead. If the spec is wrong, fix the spec explicitly. If the spec is right, close the tab and build the next task.

**Ship v1.0. One feature at a time. To the flawless gate. On the plan.**
