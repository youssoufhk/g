# Forbidden patterns (the never-ship list)

These patterns will be reverted by the founder or caught by CI. Read this file when you are unsure whether a specific choice is acceptable. The list exists because each pattern below has already caused a specific failure mode in a prior project or is directly forbidden by the CLAUDE.md hard rules.

## Typography and copy

- **Em dashes** (—) anywhere: code, docs, UI strings, commit messages, PR descriptions, notification payloads. Use hyphens or restructure the sentence. The founder hates them. Enforced by a pytest metatest that greps all source files.
- **The word "utilisation"**. Use "work time", "capacity", or "contribution". This is not a preference, it is a hard rule from the founder.
- **Hardcoded strings** in components. Every user-visible string goes through next-intl with both EN and FR translations in `frontend/messages/en.json` and `fr.json`. Even a loading placeholder or a tooltip.

## Visual design

- **New atoms** not in `specs/DESIGN_SYSTEM.md`. If you think you need a new atom, stop and ask the founder. Do not invent buttons, inputs, cards, or any other primitive.
- **Animations, sparklines, 3D, decorative flourishes**. GammaHR is calm and refined. The founder runs dedicated "fun things" polish batches separately; you do not add polish unsolicited. Any motion beyond a simple loading spinner or a subtle hover state requires founder approval.
- **Hand-editing the sidebar in an individual page**. The sidebar lives in `components/shell/Sidebar.tsx`. If you need a sidebar change, change the shell component, do not duplicate or override in a page.
- **Inventing fonts, colors, or spacing**. The design tokens in `prototype/_tokens.css` are frozen. Tailwind 4 reads them via `@theme inline` in `frontend/styles/globals.css`. Never add a new CSS variable or a new Tailwind token.
- **Light mode as afterthought**. Dark mode is default, light mode is a variant, but both must work. If a page only looks good in dark mode, it is not done.
- **Desktop tables rendered below 768px width**. The `<Table>` atom automatically renders as `<CardList>` at mobile widths. Never force a desktop table on mobile.

## Data and state

- **Server data mirrored into Zustand**. If the data came from the API, it lives in TanStack Query. Components subscribe to the TanStack query directly, never to a Zustand mirror. Duplication creates two sources of truth which go stale differently and causes invisible bugs.
- **Hardcoded auth'd user**. The current user comes from TanStack Query `/me` endpoint, never from a Zustand singleton or React context.
- **UPDATE without version check** on a whitelist table. Every UPDATE on `projects, invoices, invoice_lines, clients, employees, timesheet_weeks, timesheet_entries, expenses, leave_requests` must use `WHERE id = ? AND version = ?` and handle the 0-rows-affected case via HTTP 409.
- **Float for money**. Use `BIGINT` cents for amounts and `NUMERIC(14,4)` for rates. Never Float or Double.
- **Hours as the primary time unit**. Storage is `INTEGER` minutes in `timesheet_entries.duration_minutes`. The "day" unit is a UI concept derived via `tenants.hours_per_day`. If you find yourself storing hours as a number, stop.
- **Sub-hour timesheet entries on projects without `allow_hourly_entry = true`**. Consulting firms bill days/half-days. Minimum floor is 1 hour. Never sub-hour.

## Backend architecture

- **Cross-feature imports** inside `backend/app/features/`. Feature A cannot import from feature B's `models.py` or `schemas.py`. Cross-feature access goes through feature B's `service.py` only.
- **Direct `audit_log` inserts from `routes.py`**. Audit writes happen in the service layer, after the mutation succeeds, as part of the same transaction.
- **Skipping the `@gated_feature(key)` decorator** on a mutation route. Every new feature action goes through the three gates (entitlements + flags + kill switches).
- **Raw SQL in business logic**. Use SQLAlchemy 2.0 async. Raw SQL is acceptable only in migrations and in the rare read-heavy analytical view where SQLAlchemy is genuinely in the way; flag the founder before adding any.
- **Synchronous DB calls inside async handlers**. The whole backend is async. If you need sync for a specific library, use `run_in_executor` explicitly.
- **Schema changes without a migration**. Every column change, index change, constraint change, and enum value change goes through an Alembic migration with a tested downgrade script.

## Frontend architecture

- **Cross-feature imports** inside `frontend/features/`. Feature A cannot import from feature B. Use TanStack Query hooks instead (which fetch via API).
- **Page components doing business logic**. Pages in `frontend/app/[locale]/(<group>)/<route>/page.tsx` are thin shells. Business logic lives in `frontend/features/<domain>/`.
- **Optimistic mutations without `useOptimisticMutation`**. The wrapper handles the three-layer 409 reconciliation centrally. Do not reinvent this per feature.
- **Toast-only error handling for HTTP 409**. 409 is a conflict that needs the `<ConflictResolver>` pattern component, not a toast.
- **TypeScript `any`**. TypeScript strict mode is on. Use proper types derived from Zod schemas where possible.

## AI layer

- **Confidential-tier columns in any prompt** (see section 12 of `gammahr-arch.md`). Never `employee_compensation.*`, never `employee_banking.*`, never `leave_requests.reason_encrypted`, never `employees.protected_status_encrypted`. A pytest metatest enforces this.
- **Hardcoded model IDs**. Use `MODELS.DEFAULT` or `MODELS.VISION` from `backend/app/ai/models.py`. The model ID is centralized so a vendor swap is one file.
- **Logging prompt content**. `public.ai_events` stores meter data only (tokens, cost, tool, latency). Prompts are transient. Never log prompt content to Cloud Logging, never include prompts in error reports.
- **Bypassing the AI budget check**. Every call goes through `ai/client.py` which checks the tenant's `ai_budgets` row and enforces the cutoff at 100%.
- **Adding AI features not listed in `specs/AI_FEATURES.md`**. The v1.0 AI surface is three features (OCR, command palette, insight cards) plus ~15 deterministic tools. Adding a new AI feature requires founder approval because each new feature increases the PII attack surface.

## Security and compliance

- **PII in error logs**. Sentry-style error tracking and Cloud Logging both scrub PII via a `before_send` hook. If you add a new field to a log line, check it against the deny-list.
- **Returning Confidential-tier data in an API response** to a non-privileged role. Use the RBAC check in `service.py` and return HTTP 403 if the caller is not `finance` or `admin`.
- **Non-EU data movement**. Everything is in `europe-west9` (Paris). No cross-region reads, no US-bucket uploads, no Anthropic API calls (we use Vertex AI Gemini in EU now).
- **Weakening tenant isolation for "convenience"**. A missed `search_path` would leak data. Always use the tenant middleware; never manually select across schemas.

## Git and CI

- **`git commit`** without the founder explicitly asking. Same for `git push`. Never auto-commit.
- **`--no-verify`** to skip pre-commit hooks. Fix the underlying issue.
- **Removing or downgrading dependencies** without founder approval. Adding a new dependency is also founder approval territory.
- **Committing `.env` files or secrets** of any kind. Secrets live in Google Secret Manager at runtime and in GitHub Actions Environment secrets at CI time.

## Scope and process

- **Starting work on multiple Tier 1 features in parallel**. Finish one to the flawless gate before starting the next. Parallel work on Tier 1 is how quality slips.
- **Skipping the flawless gate**. All 15 items, not a subset. Partial gates lie.
- **Re-opening locked decisions**. The 102 decisions in the specs are closed. If you think one is wrong, open a PR that updates the spec file with explicit reasoning; do not silently drift.
- **Building a feature that is in `docs/DEFERRED_DECISIONS.md`** before its trigger has fired. Check the registry, find the DEF-NNN, confirm the trigger has actually happened, then come back to the founder with a proposal.
- **Using a global skill that conflicts with GammaHR** (`frontend-design`, `brand-guidelines`, `theme-factory`, `canvas-design`, `algorithmic-art`). These promote creative/novel aesthetics. GammaHR's design is frozen. If one of these skills appears to trigger, ignore it.

## How to use this list

Read this file when you are unsure whether a specific pattern is acceptable. If the pattern is on this list, do not ship it. If the pattern is not on this list but feels close to one, err on the side of asking the founder.

When the founder corrects something you shipped, the correction often belongs on this list. Add the new rule with one paragraph of context so future-you understands WHY it is forbidden, not just that it is.
