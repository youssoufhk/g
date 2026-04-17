import { test, expect } from "@playwright/test";

/**
 * Z.4 exit criterion: ConflictResolver renders on a 409 from a mutation
 * endpoint and both branches resolve correctly.
 *
 * The pattern + provider + useOptimisticMutation wiring land in Z.4.
 * A real 409-capable Tier-1 mutation (timesheet entry PATCH, invoice
 * line edit, employee update) lands in Phase 4 / Phase 5a. The `.fixme`
 * flips to a real test as soon as the first such page ships.
 *
 * Contract asserted once un-fixmed:
 *  - 409 response body is `{ serverState: <current row>, mineFields: [...] }`
 *  - Modal opens with title "Edits don't match. Pick what to keep."
 *  - Each conflicting field row shows field label, your value (left),
 *    their value (right), and a radio pair keyed `keep-${field}` /
 *    `take-${field}`.
 *  - "Keep mine" footer button re-submits the mutation with the user's
 *    values and closes the modal; the list row reflects the user's edit.
 *  - "Take theirs" footer button closes the modal without re-submitting;
 *    the list row reflects the server state.
 *  - Esc closes without resolving and keeps the mutation pending (queue
 *    retained; no data loss).
 */
test.describe.fixme("ConflictResolver 409 branches", () => {
  test("keep mine re-submits with the user's values", async ({ page }) => {
    // TODO (Phase 4 Employee rebuild): target the real employee PATCH endpoint.
    await page.goto("/en/employees/e-001");
    // ... trigger concurrent edit, assert modal, click "Keep mine", assert row.
    expect(true).toBe(true);
  });

  test("take theirs discards the user's values and closes", async ({ page }) => {
    // TODO (Phase 4 Employee rebuild): same page, different resolution branch.
    await page.goto("/en/employees/e-001");
    expect(true).toBe(true);
  });

  test("Esc closes without resolving and keeps the mutation queued", async ({
    page,
  }) => {
    // TODO (Phase 4): Esc should not lose the user's edit; re-open shows same.
    await page.goto("/en/employees/e-001");
    expect(true).toBe(true);
  });
});
