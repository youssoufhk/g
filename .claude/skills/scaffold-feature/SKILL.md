---
name: scaffold-feature
description: Use this skill whenever the user wants to scaffold a new backend feature module for Gamma. Triggers include "scaffold the timesheets feature", "create the expenses feature module", "start the invoices feature". Generates the six-file backend feature structure (routes, schemas, service, models, tasks, ai_tools) plus the matching frontend `features/{name}/` folder, following the M1-M10 modularity rules enforced in CI. Never imports vendor SDKs directly; never crosses feature boundaries outside service layers; never implements real business logic (that comes next, via `build-page`).
---

# scaffold-feature: the deterministic recipe for a new Gamma feature module

This skill produces the full skeleton for one new feature under `backend/app/features/<name>/` and `frontend/features/<name>/`. It is used 11+ times during Phase 5 as Tier 1 features land one by one. Every feature follows the same layout, so the skill bakes it in and enforces the M1-M10 modularity rules from `docs/MODULARITY.md` at scaffold time.

This skill does not implement business logic. It creates the structure, registers the flag, wires the router, and drops stub tests. The real work (models, service methods, routes, AI tools, frontend components) happens afterward via `build-page` and targeted edits.

## Before you do anything

If you see `frontend-design`, `brand-guidelines`, `theme-factory`, `canvas-design`, or `algorithmic-art` appear to match this task, **ignore them**. They are wrong for Gamma.

This skill is strictly for a business-domain feature module. It is NOT for shell infrastructure:

- Command palette, notifications bell, sidebar, topbar, bottom nav: those live in `backend/app/core/` and `frontend/components/shell/`. Do not scaffold them with this skill.
- Cross-cutting utilities (money, time, dates, currency, country codes): those live in `backend/app/core/`. Not a feature module.
- Vendor wrappers (AI client, PDF renderer, blob storage, email sender): those live in `backend/app/{ai,pdf,storage,email}/`. Not a feature module.

Use this skill only when the user wants a new Tier 1 business-domain feature like `timesheets`, `expenses`, `invoices`, `leaves`, `projects`, `clients`, `employees`, `approvals`, `imports`, `dashboard`, `admin`.

## Hard rules

Quoted because they are load-bearing:

- **CLAUDE.md rule 4, never invent atoms.** This skill creates feature module code but must not create any new atoms. The frontend components folder for a new feature composes existing atoms from `frontend/components/ui/`.
- **CLAUDE.md rule 7, sidebar is centralized.** Do not touch `frontend/components/shell/Sidebar.tsx` from a feature folder. If the feature needs a new nav entry, the scaffold notes it in the report and the founder edits the shared sidebar.
- **CLAUDE.md rule 11, never invent API endpoints.** Every route path for the new feature must map to a row in `specs/APP_BLUEPRINT.md` and be consistent with `specs/DATA_ARCHITECTURE.md`.
- **MODULARITY.md M1, every vendor sits behind an abstract interface.** A feature may call `backend/app/ai/client.py` but never imports `google.cloud.aiplatform` or `vertexai` directly.
- **MODULARITY.md M2, feature modules are self-contained.** The drop-and-check test must pass: `rm -rf backend/app/features/<name>/` must leave the rest of the app startable.
- **MODULARITY.md M3, cross-feature calls go through service layers.** Never `from backend.app.features.X.models import ...` inside feature Y. Always call feature X's `service.py`.
- **MODULARITY.md M5, cross-feature signaling goes via the event bus.** If feature A needs to react to feature B, subscribe via `backend/app/events/bus.py`, do not import B.
- **MODULARITY.md M6, feature flags at the module level.** Every feature registers itself in `backend/app/core/feature_registry.py` with a default flag.
- **MODULARITY.md M10, one domain concept per file.** No `utils.py`, no `helpers.py`, no `common.py` inside the feature folder.

## Mandatory reads

Before scaffolding, read these (and only these, not the full specs):

- `docs/MODULARITY.md` in full. It is short and it defines the CI enforcement.
- The specific section of `specs/DATA_ARCHITECTURE.md` that lists the feature's owned entities. Use `Grep` to find the heading, do not read the whole 60 KB file.
- The rows in `specs/APP_BLUEPRINT.md` for every page owned by this feature.
- `docs/TESTING_STRATEGY.md` section 1 layer 1 and layer 4 for what test stubs this skill should produce.

## Inputs you need from the user

Confirm all six before writing any code. If anything is missing, stop and ask.

1. **Feature name in snake_case.** Examples: `timesheets`, `expenses`, `invoices`, `leaves`, `approvals`. Must match an entry in `specs/APP_BLUEPRINT.md`.
2. **Purpose in one sentence.** "Weekly time entry, approval workflow, and reporting." Not "handles time stuff."
3. **Primary entities this feature owns.** Example for `timesheets`: `timesheet_week`, `timesheet_entry`, `timesheet_lock`. Each entity will become a SQLAlchemy model in `models.py` and is PRIVATE to this feature (M3).
4. **Does this feature expose AI tools?** If yes, `ai_tools.py` is created. If no, it is omitted. Features that expose tools include `invoices` (month-end close), `expenses` (OCR), `imports` (column mapper), `dashboard` (insight cards).
5. **Does this feature subscribe to events from other features?** If yes, note which event keys. The scaffold drops a stub subscriber in `tasks.py`.
6. **Feature flag default state.** Almost always `on`. Set `off` only for features that ship dark behind a flag and get turned on per tenant.

## Files you will create

### Backend (seven or eight files)

- `backend/app/features/<name>/__init__.py` - empty, marks the folder as a package.
- `backend/app/features/<name>/routes.py` - FastAPI router. All endpoints under `/api/v1/<name>/*`. Thin: every route calls `service.py`. Each mutation uses `@gated_feature("<name>")`.
- `backend/app/features/<name>/schemas.py` - Pydantic in and out models. Request bodies, response bodies, list filters. No SQLAlchemy here.
- `backend/app/features/<name>/service.py` - business logic. The ONLY place cross-feature calls happen. Tenant scoping, RBAC checks, audit log emission, event publishing, and calls into vendor wrappers live here.
- `backend/app/features/<name>/models.py` - SQLAlchemy models. PRIVATE to this feature. Never imported from outside.
- `backend/app/features/<name>/tasks.py` - Celery tasks and event subscribers. Stub one task if the feature has a scheduled job; stub one subscriber per event the user listed in input 5.
- `backend/app/features/<name>/ai_tools.py` - optional, created only if input 4 was yes. Contains one stub tool per Pydantic schema with a `TODO: implement` body.
- `backend/app/features/<name>/tests/__init__.py` - empty.
- `backend/app/features/<name>/tests/test_service.py` - one smoke test that imports `service.py` and asserts the module loads.
- `backend/app/features/<name>/tests/test_routes.py` - one smoke test that imports `routes.py` and asserts the router has at least one route.

### Frontend (five files)

- `frontend/features/<name>/index.ts` - re-exports from the folder.
- `frontend/features/<name>/<name>-table.tsx` - stub list component, only if the feature has a list page per APP_BLUEPRINT. Otherwise skip.
- `frontend/features/<name>/use-<name>.ts` - TanStack Query hooks stub: `useList`, `useOne`, `useCreate`, `useUpdate`, `useDelete`. Each hook is a stub that calls the (not yet generated) OpenAPI client.
- `frontend/features/<name>/schemas.ts` - Zod schemas stub matching the backend Pydantic shapes.
- `frontend/features/<name>/types.ts` - TypeScript types derived from the Zod schemas.

### Test placeholder

- `frontend/tests/e2e/<name>.spec.ts` - single Playwright scenario placeholder that imports the canonical fixture loader and marks the test `test.fixme` until the feature ships.

## Workflow, step by step

### Step 1: Read the data architecture for this feature

Use `Grep` to find the heading in `specs/DATA_ARCHITECTURE.md` that covers the feature's entities. Read that section and the section right after it (relationships and constraints). Do not read the full file.

### Step 2: Read the APP_BLUEPRINT row

Use `Grep` to find the rows for every page that belongs to this feature. Note which pages are list pages, which are detail pages, which are wizards. This tells you whether to create `<name>-table.tsx` (list page exists) or just the hooks (detail page only).

### Step 3: Create the backend folder with the seven or eight core files

Write each file in the order above. Each file is a minimal stub:

- `routes.py` has an empty `router = APIRouter(prefix="/api/v1/<name>", tags=["<name>"])` and one GET stub route returning 501 Not Implemented.
- `service.py` has one stub function `def list_<name>(tenant_id: UUID, actor_id: UUID) -> list: raise NotImplementedError`.
- `models.py` has one SQLAlchemy model per entity from input 3, with `id`, `tenant_id`, `created_at`, `updated_at`, and `version INTEGER NOT NULL DEFAULT 0` if the entity is on the version-column whitelist. Each model is empty otherwise, with a `TODO: fields` comment.
- `schemas.py` has one Pydantic stub `class <Entity>Out(BaseModel): pass` per entity.
- `tasks.py` has one commented subscriber stub per event the user listed.
- `ai_tools.py` (if applicable) has one stub tool per responsibility listed in `specs/AI_FEATURES.md` for this feature.

### Step 4: Register the feature with the feature flag registry

Open `backend/app/core/feature_registry.py` and add one line:

```python
register_feature("<name>", default=<True|False>)
```

If the file does not exist yet (Phase 2 bootstrap), stop and ask the founder whether to create it. This is infrastructure, not a feature.

### Step 5: Wire the router in main.py

Open `backend/app/main.py` and add:

```python
from backend.app.features.<name>.routes import router as <name>_router
app.include_router(<name>_router)
```

Put the import in alphabetical order with the other feature routers. If no feature routers exist yet, create the import section and add a comment above it: `# Feature routers, alphabetical order`.

### Step 6: Add a CI lint hint

Check if `backend/tests/test_modularity.py` exists. If it does, add the new feature name to the list of feature folders the cross-feature model import check runs against. If it does not exist, skip this step and note in the final report that the M3 CI check needs to be set up.

### Step 7: Create the frontend feature folder

Write `types.ts`, `schemas.ts`, `use-<name>.ts`, `index.ts`, and optionally `<name>-table.tsx`. Each file is a minimal stub with a `TODO` pointing to the next step (`build-page` for the real implementation).

Example `use-<name>.ts`:

```ts
// TODO: wire real endpoints once routes.py is implemented.
// Generated OpenAPI client will replace these fetch stubs in Phase 4.
import { useQuery } from "@tanstack/react-query";

export function useList<Name>List() {
  return useQuery({
    queryKey: ["<name>"],
    queryFn: async () => {
      throw new Error("not implemented");
    },
  });
}
```

### Step 8: Drop a Playwright placeholder

Create `frontend/tests/e2e/<name>.spec.ts` with a single `test.fixme("golden path", async ({ page }) => { /* TODO */ });` so the test suite sees the file but does not fail. The real scenarios come later via the `scaffold-e2e-scenario` skill.

### Step 9: Run the drop-and-check smoke test

This is the M2 enforcement. Mentally (or via the existing integration test runner) verify: if you removed the folder you just created, would the app still boot? For a scaffold that contains only stubs and one router include, yes. Note in the final report that the feature module was wired via a single include line in `main.py` so removing it requires removing that include too.

### Step 10: Report back

Return a short summary:

- Every file path created, grouped by backend and frontend.
- Feature flag entry added to the registry.
- Router include added to `main.py`.
- Which events (if any) the feature subscribes to.
- Which AI tools (if any) the feature exposes.
- An explicit reminder that NO business logic was implemented and NO real tests were written.
- The list of next tasks: run `build-page` for each APP_BLUEPRINT row, write real unit tests per `docs/TESTING_STRATEGY.md` layer 1, write property tests for any financial invariants (layer 2), write real E2E scenarios via `scaffold-e2e-scenario` (layer 4).

## Modularity enforcement

This skill enforces modularity rules at scaffold time. Here is what each rule maps to:

| Rule | What the skill does | What CI catches if you regress |
|---|---|---|
| M1 vendor wrappers | Scaffolds a feature that imports `backend.app.ai.client`, never `google.cloud.*` | Lint rule on vendor SDK imports, blocks merge |
| M2 self-contained modules | Creates the folder with no outbound imports except through service layers | Monthly drop-and-check integration test |
| M3 service-layer contracts | Models are marked PRIVATE in a top-of-file comment | Lint rule on `from features.X.models import` from outside X |
| M4 explicit FK behavior | Note in the model stub: "every FK must specify ON DELETE explicitly" | Orphan-row pytest after tenant delete |
| M5 event bus signaling | Subscriber stubs go in `tasks.py`, never in `service.py` | Covered by M3 lint |
| M6 module-level flag | Registry line added in Step 4 | Module feature flag registration test |
| M7 reversible migrations | Not applicable at scaffold time; noted in the report for the migration step | Upgrade-downgrade-upgrade test in CI |
| M8 API versioning | Router prefix is `/api/v1/<name>` | OpenAPI spec diff |
| M9 frontend mirror | Frontend folder created with same name as backend | Warning-level PR check |
| M10 one concept per file | Scaffold creates one file per concept; never a `utils.py` | Lint rule on forbidden filenames |

## Testing enforcement

This skill creates test stubs, not real tests. The founder or a follow-up skill must add:

- **Layer 1 unit tests** per `docs/TESTING_STRATEGY.md` layer 1. 85% line coverage target, 100% on financial math, authentication, and tenant scoping.
- **Layer 2 property tests** using Hypothesis for any financial invariant the feature introduces (see the invariant table in `docs/TESTING_STRATEGY.md` section 1 layer 2).
- **Layer 3 contract tests** are automatic once real routes land. The OpenAPI diff check picks them up.
- **Layer 4 E2E scenarios** via the `scaffold-e2e-scenario` skill. Every feature must have at least one scenario from the inventory in `docs/TESTING_STRATEGY.md` section 1 layer 4 before it ships.

## What this skill does NOT do

- It does not implement business logic. Every function is a stub with `TODO` and `raise NotImplementedError`.
- It does not create Alembic migrations. That is the `write-migration` skill once it exists. Until then, migrations are hand-written.
- It does not add routes to the frontend `app/` directory. Page scaffolds come from `build-page`.
- It does not write real unit tests, property tests, or E2E scenarios.
- It does not mark the feature as done in any checklist.
- It does not modify `specs/`. Specs are the contract; they do not change because a scaffold ran.
- It does not edit the sidebar. If a nav entry is needed, the report flags it and the founder edits `frontend/components/shell/Sidebar.tsx`.

## Example invocation

```
/scaffold-feature timesheets
```

The skill will ask for:

1. Purpose in one sentence (example: "Weekly time entry, approval workflow, and reporting").
2. Primary entities (example: `timesheet_week`, `timesheet_entry`, `timesheet_lock`).
3. Exposes AI tools? (example: no for timesheets; yes for invoices).
4. Subscribes to events? (example: `leave.approved` to block time entry on leave days).
5. Feature flag default (example: `on`).

Another example:

```
/scaffold-feature expenses
```

Inputs: purpose ("expense submission with OCR receipt capture and approval workflow"), entities (`expense`, `expense_line`, `receipt`), AI tools yes (OCR), events none, flag `on`.

## Cross-references

- `docs/MODULARITY.md` for the full M1-M10 rules and CI enforcement.
- `docs/TESTING_STRATEGY.md` for what tests the feature needs before it ships.
- `specs/DATA_ARCHITECTURE.md` for entity definitions and the version-column whitelist.
- `specs/APP_BLUEPRINT.md` for which pages belong to the feature.
- `specs/AI_FEATURES.md` for the AI tool registry (which features expose tools).
- `CLAUDE.md` rules 4, 7, 11 for the hard constraints this skill enforces.
- `.claude/skills/build-page/SKILL.md` for the next step after scaffolding (the real page implementation).
- `.claude/skills/scaffold-e2e-scenario/SKILL.md` for writing the E2E scenarios that verify the feature.
