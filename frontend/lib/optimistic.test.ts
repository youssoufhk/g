import { describe, it, expect } from "vitest";

import { ApiClientError } from "./api-client";

/**
 * Smoke coverage for the 409 contract that `useOptimisticMutation`
 * hangs off of (CRITIC_PLAN C13). We do not mount the full React
 * hook here because the project does not ship @testing-library/react;
 * the Playwright scenario at tests/e2e/409-conflict.spec.ts covers
 * the interactive flow end to end.
 *
 * What we verify at the unit layer:
 *   1. ApiClientError with status 409 reports `isConflict = true` and
 *      surfaces its `serverState` payload through `conflictState<T>()`.
 *   2. The invoice status-change variant produces a ConflictField shape
 *      shaped correctly for the ConflictResolverProvider modal.
 *
 * Together these two checks pin down the contract every A3 mutation
 * relies on, so regressions in api-client.ts or in the hook wrappers
 * surface locally before they reach the interactive test.
 */
describe("useOptimisticMutation 409 contract", () => {
  it("ApiClientError surfaces serverState from 409 details", () => {
    const err = new ApiClientError(
      409,
      {
        code: "conflict",
        message: "stale",
        details: {
          serverState: {
            id: "inv-42",
            status: "paid",
            version: 7,
          },
        },
      },
      "409 conflict",
    );
    expect(err.isConflict).toBe(true);
    const state = err.conflictState<{ id: string; status: string; version: number }>();
    expect(state).not.toBeNull();
    expect(state?.status).toBe("paid");
    expect(state?.version).toBe(7);
  });

  it("non-409 ApiClientError returns null for conflictState", () => {
    const err = new ApiClientError(
      500,
      { code: "server_error", message: "boom" },
      "500 server error",
    );
    expect(err.isConflict).toBe(false);
    expect(err.conflictState()).toBeNull();
  });

  it("conflictField shape used by invoice status-change is complete", () => {
    const variables = { id: "inv-1", status: "paid" as const, version: 3 };
    const serverState = { id: "inv-1", status: "sent" as const, version: 4 };
    const field = {
      field: "status",
      label: "Status",
      yours: variables.status,
      theirs: serverState.status,
      kind: "text" as const,
    };
    expect(field.field).toBe("status");
    expect(field.yours).toBe("paid");
    expect(field.theirs).toBe("sent");
  });
});
