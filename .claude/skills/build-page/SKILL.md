---
name: build-page
description: Use this skill whenever the user asks to build, implement, scaffold, complete, create, or ship any page from specs/APP_BLUEPRINT.md in the GammaHR repo. Trigger phrases include "build the X page", "implement 3.2", "scaffold the employees list", "create the dashboard", "finish the invoices page", "add the approvals hub", or any task that produces a route plus a feature module for a page in the (ops), (app), or (portal) route groups. Even if the user does not name this skill explicitly, prefer it over any general frontend skill like frontend-design because GammaHR has a locked design system and creative/maximalist aesthetics are forbidden. This skill contains the baked GammaHR architecture so there is no need to reload the full 60 KB specs/DATA_ARCHITECTURE.md or 17 KB specs/APP_BLUEPRINT.md per invocation; read only the specific APP_BLUEPRINT row for the target page plus the referenced prototype HTML file.
---

# build-page: the deterministic recipe for shipping a GammaHR page

This skill lets Claude build a production page in the GammaHR repo without reloading the big spec files. Every page follows the same recipe; the skill bakes the recipe in so each invocation is cheap (~5 KB of skill + 1-3 KB of prototype HTML + maybe 1 KB of the blueprint row, versus ~25 KB reloading the full specs).

## Before you do anything

If you also see a skill called `frontend-design` appear to match this task, **ignore it**. That skill promotes bold creative aesthetics (maximalism, distinctive typography, unexpected layouts) which are the exact opposite of what GammaHR needs. GammaHR has a locked design system where inventing new atoms, fonts, colors, or animations is forbidden. Match the prototype pixel-for-pixel, use only existing atoms, and defer to the founder on any visual novelty.

The same warning applies to `brand-guidelines`, `theme-factory`, `canvas-design`, and `algorithmic-art`. None of those are for GammaHR.

## What the user must give you before you start

Confirm these three inputs before writing any code. If any is missing, stop and ask the user.

1. **The page ID or name** from `specs/APP_BLUEPRINT.md` (e.g., `3.1 Employees list`, `4.2 Weekly entry grid`, `11.4 Tenant detail`). The page ID determines the route group, the route path, the prototype HTML file, and the expected atoms.
2. **The current phase** from `THE_PLAN.md`. Phase 2 pages are scaffolds; Phase 4 pages are production; Phase 6 pages are Tier 2 with a lower gate. The expected output changes by phase.
3. **Any existing work** for that page. If files already exist under `frontend/features/<domain>/` or `backend/app/features/<domain>/`, read them first so you do not overwrite partial progress.

## The procedure (six steps)

### Step 1: Read only what you need, not the whole specs

Read these files and only these:

- The **specific row** in `specs/APP_BLUEPRINT.md` for the target page. Use `Grep` with the page ID or name to find the row; do not read the whole file.
- The **prototype HTML file** for that page (e.g., `prototype/employees.html`). This is the visual source of truth; match it pixel-for-pixel at 1440px.
- Any **existing feature module** files under `frontend/features/<domain>/` and `backend/app/features/<domain>/`.
- Any **related ADR** only if the page directly touches its domain (real-time, storage, auth, etc.). Most pages don't.

**Do not read** the full `specs/DATA_ARCHITECTURE.md` or the full `specs/APP_BLUEPRINT.md`. Everything you need about the architecture is in `references/gammahr-arch.md` within this skill. Read that reference file only if the page involves something the body of this SKILL.md does not cover.

### Step 2: Check entitlements, flags, and deferred registry

Before building, verify three things:

- The page's feature is **entitled** on the pricing tier it should ship in. Check `specs/DATA_ARCHITECTURE.md` section 7 pricing tiers via the `references/gammahr-arch.md` summary first. If the feature is Pro-only, the page must render a locked state for Starter tenants.
- The page's feature is **not on the deferred registry**. Grep `docs/DEFERRED_DECISIONS.md` for the feature name. If it is deferred (DEF-NNN), stop and ask the founder before building anything.
- The page's feature is **within the current phase's scope**. Phase 4 is people/clients/projects; do not build invoices there even if the user asks.

### Step 3: Plan the file changes in a short bullet list

Before writing code, list:

- Which backend files you will create or modify (`routes.py`, `service.py`, `schemas.py`, `models.py`, `ai_tools.py`, `tests/`)
- Which frontend files you will create or modify (`use-<feature>.ts`, `schemas.ts`, `types.ts`, `components/*.tsx`, `app/[locale]/(<group>)/<route>/page.tsx`)
- Any new rows in `public.feature_flags` (if a kill switch applies), `public.tenant_entitlements` (if a new feature_key), or `public.notifications.kind` enum (if a new notification kind)
- Any Alembic migration required (and whether it touches the version-column whitelist or needs a companion Celery backfill)
- The exact set of atoms from `components/ui/` you will use. No new atoms.

Present this plan to the user and wait for confirmation. Do not write code before they say "go ahead" or equivalent.

### Step 4: Implement the backend side

Create files in dependency order:

1. `backend/app/features/<domain>/models.py` - SQLAlchemy models. Include `version INTEGER NOT NULL DEFAULT 0` if the table is on the version-column whitelist. Include `deleted_at TIMESTAMPTZ NULL` if on the soft-delete whitelist. See `references/gammahr-arch.md` for both whitelists.
2. `backend/app/features/<domain>/schemas.py` - Pydantic models for request and response. Match the frontend Zod schemas conceptually so validation is consistent on both sides.
3. `backend/app/features/<domain>/service.py` - business logic. This is where tenant scoping happens (via the `search_path` middleware, assumed to be set), audit log calls for every mutation, RBAC checks, and calls to the feature's `ai_tools.py` if any. **Never** reach into another feature's `models.py`. Cross-feature access goes through that feature's `service.py`.
4. `backend/app/features/<domain>/routes.py` - FastAPI endpoints. Thin. Call `service.py` for everything. Use the `@gated_feature("key")` decorator on every mutation route.
5. `backend/app/features/<domain>/ai_tools.py` - if the feature exposes AI tools, register them here with Pydantic schemas. The `backend/app/ai/client.py` wrapper auto-discovers tools at startup.
6. `backend/app/features/<domain>/tests/` - pytest with query count assertions to prevent N+1. Include a cross-tenant test that asserts tenant A cannot read tenant B's rows.

### Step 5: Implement the frontend side

Create files in this order:

1. `frontend/features/<domain>/types.ts` - TypeScript types, derived from the Zod schemas where possible.
2. `frontend/features/<domain>/schemas.ts` - Zod forms.
3. `frontend/features/<domain>/use-<domain>.ts` - TanStack Query hooks (`useList`, `useOne`, `useCreate`, `useUpdate`, `useDelete`). Mutations use `useOptimisticMutation` from `frontend/lib/optimistic.ts` when the action is low-stakes, plain `useMutation` when authoritative. See `references/gammahr-arch.md` for the optimistic vs pessimistic guide.
4. `frontend/features/<domain>/components/*.tsx` - feature-specific components. Compose from `components/ui/` atoms and `components/patterns/` compositions. Never invent a new atom.
5. `frontend/app/[locale]/(<group>)/<route>/page.tsx` - thin page shell. Imports from `frontend/features/<domain>/`. Should be under 50 lines.
6. Translation strings in `frontend/messages/en.json` and `frontend/messages/fr.json`. No hardcoded text.

### Step 6: Run the flawless gate self-check before reporting back

Read `references/flawless-gate.md` and verify each of the 15 items against your work. Any red item means you stop and fix, then re-verify all 15. Partial gates lie.

Your report to the user must be under 300 words and structured:

- **What shipped**: list of files created or modified
- **Gate status**: which items passed, which are pending founder verification (items 1 and 15 usually need a visual check)
- **Deferred items triggered**: if any DEF-NNN was relevant, mention it
- **Next**: what the user should do to verify (run the app, check a specific interaction, etc.)

Do not include a recap of what the page does. The user knows; they asked for it.

## Key invariants (the ones you cannot forget)

These apply to every page. The deeper architectural facts are in `references/gammahr-arch.md`. Read that file if the page touches anything beyond these invariants.

- **Three route groups**: `(ops)` on ops.gammahr.com, `(app)` on app.gammahr.com, `(portal)` on portal.gammahr.com. Each has its own shell variant and its own auth stack. `(ops)` has no Cmd+K. `(portal)` is read-only in v1.0.
- **Every mutation** goes through a feature's `service.py` (not directly from `routes.py`), emits an `audit_log` row, and is gated by `@gated_feature(key)` which checks entitlements + feature flags + kill switches.
- **Every mutable row** on the whitelist has a `version` column. UPDATE uses `WHERE id = ? AND version = ?`. 0 rows affected returns HTTP 409 and the frontend triggers the `<ConflictResolver>` from `components/patterns/`.
- **Server data lives in TanStack Query**. Never duplicate into Zustand. Zustand is for UI state only (command palette open, form drafts, theme).
- **Money is BIGINT cents. Time is INTEGER minutes. Rates are NUMERIC(14,4)**. The "day" unit is a UI concept; convert via `tenants.hours_per_day` (default 8.0).
- **Optimistic for low-stakes, pessimistic for authoritative.** Adding a timesheet entry = optimistic. Submitting a week for approval = pessimistic with explicit loading state.
- **Dark mode default, light mode variant.** Both must work.
- **EN + FR complete via next-intl.** No hardcoded strings.
- **Never invent an atom.** If you need something not in `components/ui/`, stop and ask the founder.
- **Never use em dashes. Never use the word "utilisation".**
- **Never hand-edit the sidebar in a page.** It lives in `components/shell/Sidebar.tsx`.

## The reference files in this skill

Read these only when you need the deeper context they contain. Each is optional, not every build needs them.

- `references/gammahr-arch.md` - the deeper schema facts: timesheet state machine, Confidential-tier column list, notification kinds enum, full version-column whitelist, full soft-delete whitelist, real-time transport per feature, AI layer rules, feature module structure details. Read when the page touches any of these topics.
- `references/forbidden-patterns.md` - the full "never ship" list. Read when in doubt about whether a pattern is acceptable.
- `references/flawless-gate.md` - the 15-item quality checklist. Read at Step 6 of the procedure.

## When to delegate to another skill

- **Playwright testing** (visual regression, E2E golden path, screenshot capture): delegate to the global `webapp-testing` skill. Do not duplicate Playwright patterns in this skill.
- **Writing an Alembic migration** (new table, column change, backfill): the `write-migration` skill should handle this once it exists. Until then, follow the migration guidance inline from `references/gammahr-arch.md`.
- **Running the 15-item gate** standalone: use the `run-flawless-gate` skill. This `build-page` skill does the self-check at Step 6 as a quick verify before reporting, but a deeper audit should use the dedicated gate skill.

## Self-improvement loop

When the user corrects something this skill produced, that correction should be reflected in the skill file. Workflow:

1. User says "the output was wrong because X"
2. Claude identifies which section of this SKILL.md or which reference file allowed or caused the error
3. Claude proposes a specific edit (a new rule, a clarification, a new forbidden pattern)
4. User approves or adjusts
5. Claude applies the edit, and the next invocation has the learning baked in

Over 10-15 iterations this skill becomes genuinely specialized to the GammaHR codebase. That is the investment thesis for using a skill at all.
