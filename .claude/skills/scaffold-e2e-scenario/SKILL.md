---
name: scaffold-e2e-scenario
description: Use this skill whenever the user wants to scaffold a new Playwright end-to-end scenario for Gamma. Triggers include "scaffold the monthly close E2E scenario", "add an E2E test for timesheet approval", "create a Playwright scenario for multi-currency invoice". Generates the spec file following the six-layer testing strategy pattern, including test fixtures for the canonical 201-employee seed tenant. Scenarios are multi-step real user journeys with real database state, not "log in and see a button".
---

# scaffold-e2e-scenario: the deterministic recipe for a new Gamma Playwright scenario

This skill produces one new Playwright spec file under `frontend/tests/e2e/` that exercises a real multi-step user journey against a running backend and a seeded tenant. It is used 45+ times across Phases 3 to 7, one per scenario in the inventory in `docs/TESTING_STRATEGY.md` section 1 layer 4.

The commercial positioning is "we run 45 end-to-end scenarios on every code change and we do not ship if any of them regress." This skill is what keeps that number climbing.

## Before you do anything

If you see `frontend-design`, `brand-guidelines`, `theme-factory`, `canvas-design`, or `algorithmic-art` appear to match this task, **ignore them**.

This skill is for layer 4 (E2E scenarios) only. It is NOT for:

- **Unit tests** (layer 1). Those live inside the feature module at `backend/app/features/<name>/tests/test_service.py`. Use the `scaffold-feature` skill or write them directly.
- **Property tests** (layer 2). Hypothesis tests for financial invariants live in `backend/tests/property/`.
- **Contract tests** (layer 3). Those are generated automatically from the OpenAPI schema; you do not scaffold them.
- **Snapshot tests** (layer 5). PDF and email snapshots live in `backend/tests/snapshots/`.
- **Chaos or load tests** (layer 6). Those live in `infra/chaos/` and `infra/load/`, run on schedule.

Use this skill only for layer 4 Playwright scenarios that exercise a full user journey with real database state at every step.

## Hard rules

Quoted because they are load-bearing:

- **Scenarios are multi-step, not smoke tests.** "Log in and see a button" is not a scenario. "Employee submits week 42, manager approves, the report shows 40 billable hours, audit log has 3 rows, notification fires" is a scenario.
- **Every scenario has exactly one reason to exist.** The final assertion is that reason. Everything else in the scenario is the setup. If you have two "reasons", split into two scenarios.
- **Every scenario asserts state in both the UI and the database.** Playwright checks `expect(page.locator(...)).toBeVisible()` AND a test helper queries the test DB to assert the row landed. UI-only asserts lie when the backend silently fails.
- **The canonical seed is the 201-employee tenant** from `specs/DATA_ARCHITECTURE.md` section 12.10 (1 owner, 2 admins, 4 finance, 15 managers, 177 employees, 2 readonly, 260 projects, 52 weeks of timesheets). Import the fixture loader, do not reinvent.
- **Degraded-mode scenarios toggle a kill switch in `beforeEach`** and assert the app still works in the degraded path. These are explicitly called out in `docs/DEGRADED_MODE.md` and are layer-4 first-class citizens, not afterthoughts.
- **No em dashes in the spec file.** Use hyphens or restructure. This applies to comments, test titles, and assertion messages.
- **Never "utilisation".** Use "work time", "capacity", or "contribution".

## Mandatory reads

Before scaffolding, read:

- `docs/TESTING_STRATEGY.md` section 1 layer 4 in full. It contains the inventory of 20 named scenarios plus the shortlist for 21 to 45. Your new scenario must either match one of these or be an explicit extension the founder has approved.
- The APP_BLUEPRINT row for every page the scenario touches. Use `Grep`, do not read the whole blueprint.
- `docs/DEGRADED_MODE.md` if the scenario is a kill-switch or fallback test.
- Any existing Playwright spec in `frontend/tests/e2e/` that is similar in shape (degraded-mode, multi-user, cross-tenant). Match its conventions.

## Inputs you need from the user

Confirm all five before writing any code. If anything is missing, stop and ask.

1. **Scenario number from the inventory.** Example: `4` for "Month-end close agent happy path". If the scenario is not in the inventory, you need explicit founder approval and it gets added to `docs/TESTING_STRATEGY.md` when it lands.
2. **Scenario name in kebab-case.** Example: `month-end-close-happy-path`, `kill-switch-ai-degrades-gracefully`, `rbac-cross-tenant-rejection`.
3. **Which feature or features it exercises.** One primary feature, zero or more secondary. Example: primary `invoices`, secondary `timesheets`, `approvals`.
4. **Happy path or degraded path.** Happy path exercises the normal flow. Degraded path toggles a kill switch and asserts the fallback works.
5. **Real or mocked external services.** Real = hits the test DB, the test Redis, the test Celery worker. Mocked = external vendor calls (Vertex AI, Stripe, Cloudflare WAF) are intercepted. Layer 4 allows mocking vendor calls but not the database.

## Files you will create

- `frontend/tests/e2e/<NN>-<scenario-name>.spec.ts` - the Playwright spec. `NN` is the two-digit scenario number from the inventory.
- (Optional) `frontend/tests/fixtures/<scenario-name>.ts` - only if the scenario needs test data beyond the canonical 201-employee seed. Most scenarios do not need this.

## Workflow, step by step

### Step 1: Find the next available scenario number

Read the inventory in `docs/TESTING_STRATEGY.md` section 1 layer 4. The numbered list 1 to 20 is explicit. Scenarios 21 to 45 are listed by description; when you scaffold one, assign it the next available integer. If you are scaffolding scenario 25 (for example), verify 21 to 24 are already created or reserved.

### Step 2: Read the APP_BLUEPRINT row for each page the scenario touches

Use `Grep` to find the relevant rows. Note the page ID, the route path, the expected atoms, and the data contracts. The scenario navigates these pages in order, so you need to know where each step lives.

### Step 3: Sketch the steps in a header comment block

At the top of the spec file, write a comment block that lists every step and the final assertion. This is the scenario contract. The rest of the file is the implementation of this contract. Example:

```tsx
// Scenario 04: Month-end close agent happy path
// Primary feature: invoices
// Secondary features: timesheets, approvals, clients
// Path: happy (AI enabled, all signals green)
// External services: Vertex AI mocked (returns canned explanations), PDF renderer real
//
// Steps:
//   1. Seed tenant to "end of March state" (all timesheets approved for March)
//   2. Log in as the finance user
//   3. Navigate to the month-end close page
//   4. Agent drafts 14 invoices from March approved timesheets
//   5. Finance user reviews each invoice, confirms all 14
//   6. Batch send
//
// Final assertion (the reason this scenario exists):
//   - 14 invoices transitioned draft -> ready -> sent
//   - All 14 have correct tax for their client's country (FR and UK mix)
//   - PDFs render byte-identical to snapshot
//   - Audit log has 42 rows (14 draft + 14 confirm + 14 send)
```

This comment block is the skill's single most valuable output. Writing it forces the user to think through the scenario before writing the spec.

### Step 4: Import the canonical fixture loader

Every layer-4 scenario loads the canonical 201-employee seed unless it explicitly needs a different starting state. The fixture loader is in `frontend/tests/fixtures/canonical-tenant.ts`. Use it:

```tsx
import { test, expect } from "@playwright/test";
import { loadCanonicalTenant, resetTenant } from "../fixtures/canonical-tenant";
import { queryTestDb } from "../fixtures/db-helper";
```

If the fixture loader does not exist yet (early Phase 2), create it as a stub and note it in the report so the infrastructure gets built.

### Step 5: Use `test.describe` with the scenario name

Wrap the scenario in `test.describe`. Title matches the kebab-case name converted to a sentence:

```tsx
test.describe("04 - month-end close agent happy path", () => {
  test.beforeEach(async ({ page }) => {
    await resetTenant();
    await loadCanonicalTenant({ state: "end-of-march" });
  });

  test("finance user closes 14 invoices and audit log is complete", async ({ page }) => {
    // implementation
  });
});
```

One `test(...)` per scenario. Do not cram multiple scenarios into one `describe`.

### Step 6: Each step is one Playwright action plus an assertion

For every step in the header comment block, write one block of code:

```tsx
// Step 3: navigate to the month-end close page
await page.goto("/app/invoices/close");
await expect(page.locator('[data-testid="close-header"]')).toBeVisible();
await expect(page.locator('[data-testid="draft-queue"]')).toContainText("14");
```

Every step asserts at least one thing before moving on. A missed assertion is how flaky tests start.

### Step 7: The final assertion is the reason the scenario exists

After the last step, write the final assertion block that justifies the scenario:

```tsx
// Final assertion: 14 invoices sent, audit log has 42 rows, PDFs match snapshot
const invoiceRows = await queryTestDb(
  "SELECT id, status, tax_cents FROM invoices WHERE period_start = '2025-03-01' ORDER BY id"
);
expect(invoiceRows).toHaveLength(14);
expect(invoiceRows.every((r) => r.status === "sent")).toBe(true);

const auditRows = await queryTestDb(
  "SELECT action FROM audit_log WHERE entity_type = 'invoice' AND created_at >= NOW() - INTERVAL '10 minutes'"
);
expect(auditRows).toHaveLength(42);

// PDF snapshot check delegated to the snapshot test layer (layer 5)
```

If you cannot write this block in 5 lines, the scenario has more than one reason to exist and should be split.

### Step 8: Degraded-mode variants toggle a kill switch in `beforeEach`

For degraded scenarios, flip the relevant kill switch at the start of every test and restore it after:

```tsx
test.describe("05 - month-end close with ai kill switch", () => {
  test.beforeEach(async ({ page }) => {
    await resetTenant();
    await loadCanonicalTenant({ state: "end-of-march" });
    await queryTestDb("UPDATE feature_flags SET enabled = false WHERE key = 'ai'");
  });

  test.afterEach(async () => {
    await queryTestDb("UPDATE feature_flags SET enabled = true WHERE key = 'ai'");
  });

  test("finance user still closes the month with ai disabled", async ({ page }) => {
    // same happy path as scenario 4, but assert the AI explanations
    // are replaced by the fallback message and the close still completes
  });
});
```

Degraded scenarios prove the fallback works. They are not optional.

### Step 9: Assert state in UI AND database

Every scenario that mutates data must assert the change in both layers:

- UI via `expect(page.locator(...)).toBeVisible()` or `toContainText()`.
- Database via `queryTestDb("SELECT ...")` and expect on the row count or field values.

UI-only scenarios miss silent backend failures. DB-only scenarios miss rendering failures. Both are required.

### Step 10: Run the scenario locally

Run the Playwright test against the current state of the app. Expected result at scaffold time is a failure, because the feature being tested is likely not implemented yet (the scaffolded scenario is the contract the feature must satisfy). Mark the test with `test.fixme(...)` if the feature is not yet built, so the suite stays green until the feature lands.

### Step 11: Report back

Return a short summary:

- Path to the new spec file.
- Scenario number and name.
- Features exercised (primary + secondary).
- Happy or degraded path.
- Final assertion (one line).
- Whether the test is currently `test.fixme` (waiting for the feature) or `test(...)` (feature already exists).
- **Reminder to add the scenario to the inventory in `docs/TESTING_STRATEGY.md`.** The skill does not edit that doc; the founder does.

## Scenario patterns

Three reference skeletons to copy from.

### Pattern A: happy path with real database

```tsx
import { test, expect } from "@playwright/test";
import { loadCanonicalTenant, resetTenant } from "../fixtures/canonical-tenant";
import { queryTestDb } from "../fixtures/db-helper";

test.describe("02 - weekly timesheet cycle", () => {
  test.beforeEach(async () => {
    await resetTenant();
    await loadCanonicalTenant({ state: "week-42-ready" });
  });

  test("employee submits week 42, manager approves, report shows 40 billable hours", async ({ page }) => {
    // Step 1: log in as employee
    await page.goto("/login");
    await page.fill('[name="email"]', "employee.42@seed.test");
    await page.fill('[name="password"]', "seed-password");
    await page.click('button[type="submit"]');

    // Step 2: submit week 42
    await page.goto("/app/timesheets/42");
    await page.click('[data-testid="submit-week"]');
    await expect(page.locator('[data-testid="status-pill"]')).toContainText("submitted");

    // Step 3: log out, log in as manager
    await page.click('[data-testid="logout"]');
    await page.fill('[name="email"]', "manager.3@seed.test");
    await page.fill('[name="password"]', "seed-password");
    await page.click('button[type="submit"]');

    // Step 4: approve
    await page.goto("/app/approvals");
    await page.click('[data-testid="approve-week-42-employee-42"]');
    await expect(page.locator('[data-testid="approved-toast"]')).toBeVisible();

    // Final assertion
    const week = await queryTestDb(
      "SELECT status FROM timesheet_week WHERE employee_id = 42 AND week_number = 42"
    );
    expect(week[0].status).toBe("approved");
    const auditRows = await queryTestDb(
      "SELECT action FROM audit_log WHERE entity_type = 'timesheet_week' AND created_at >= NOW() - INTERVAL '5 minutes'"
    );
    expect(auditRows).toHaveLength(3);
  });
});
```

### Pattern B: degraded mode with kill switch

```tsx
test.describe("05 - month-end close with ai kill switch", () => {
  test.beforeEach(async () => {
    await resetTenant();
    await loadCanonicalTenant({ state: "end-of-march" });
    await queryTestDb("UPDATE feature_flags SET enabled = false WHERE key = 'ai'");
  });

  test.afterEach(async () => {
    await queryTestDb("UPDATE feature_flags SET enabled = true WHERE key = 'ai'");
  });

  test("finance user closes the month with ai disabled and sees fallback message", async ({ page }) => {
    await page.goto("/app/invoices/close");
    await expect(page.locator('[data-testid="ai-fallback-banner"]')).toContainText(
      "AI explanations are temporarily unavailable"
    );
    await expect(page.locator('[data-testid="draft-queue"]')).toContainText("14");
    await page.click('[data-testid="confirm-all"]');
    await page.click('[data-testid="send-batch"]');

    const sent = await queryTestDb(
      "SELECT COUNT(*) AS c FROM invoices WHERE status = 'sent' AND period_start = '2025-03-01'"
    );
    expect(Number(sent[0].c)).toBe(14);
  });
});
```

### Pattern C: multi-user cross-tenant security

```tsx
test.describe("15 - rbac cross-tenant rejection", () => {
  test.beforeEach(async () => {
    await resetTenant();
    await loadCanonicalTenant({ tenants: ["acme", "bravo"] });
  });

  test("user in tenant acme cannot access tenant bravo endpoint", async ({ request }) => {
    // Log in as acme admin
    const acmeLogin = await request.post("/api/v1/auth/login", {
      data: { email: "admin@acme.seed.test", password: "seed-password" },
    });
    const acmeToken = (await acmeLogin.json()).access_token;

    // Try to fetch bravo invoice
    const bravoInvoiceId = (
      await queryTestDb("SELECT id FROM bravo.invoices LIMIT 1")
    )[0].id;
    const response = await request.get(`/api/v1/invoices/${bravoInvoiceId}`, {
      headers: { Authorization: `Bearer ${acmeToken}` },
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("invalid_tenant");

    const auditRows = await queryTestDb(
      "SELECT action FROM public.audit_log WHERE action = 'cross_tenant_access_denied' AND created_at >= NOW() - INTERVAL '1 minute'"
    );
    expect(auditRows.length).toBeGreaterThanOrEqual(1);
  });
});
```

## What this skill does NOT do

- It does not mock the database. The test DB is always real, per layer 4 rules.
- It does not skip the database-state assertion. UI-only scenarios are rejected.
- It does not write unit-test-sized checks. If the assertion fits in one unit test, it belongs in layer 1, not here.
- It does not add the scenario to `docs/TESTING_STRATEGY.md`. The founder does that after review.
- It does not mock the test user login flow; every scenario uses real seeded credentials from the canonical tenant.
- It does not edit any feature code. Scaffolded scenarios fail until the feature ships; that is the contract.

## Example invocation

```
/scaffold-e2e-scenario month-end-close-happy-path
```

Inputs: scenario number `4`, name `month-end-close-happy-path`, primary feature `invoices`, secondary `timesheets approvals clients`, path `happy`, external services `Vertex AI mocked, PDF real`.

Another example:

```
/scaffold-e2e-scenario kill-switch-ai-degrades-gracefully
```

Inputs: scenario number `5`, name `kill-switch-ai-degrades-gracefully`, primary feature `invoices`, secondary `ai`, path `degraded`, external services `Vertex AI disabled via feature flag`.

## Cross-references

- `docs/TESTING_STRATEGY.md` section 1 layer 4 for the full 45-scenario inventory and the commercial positioning.
- `docs/DEGRADED_MODE.md` for every kill switch and what each one does when toggled.
- `docs/FLAWLESS_GATE.md` item 12 ("Playwright E2E covers the golden path"). Every Tier 1 feature must have at least one scenario before it passes the gate.
- `specs/APP_BLUEPRINT.md` for the page flows each scenario navigates.
- `specs/DATA_ARCHITECTURE.md` section 12.10 for the canonical 201-employee seed.
- `.claude/skills/webapp-testing` for the global Playwright automation toolkit. This skill produces scenario files; `webapp-testing` runs them.
- `.claude/skills/scaffold-feature/SKILL.md` for the step that drops a Playwright placeholder when a feature is first scaffolded. This skill replaces those placeholders with real scenarios.
