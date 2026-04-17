import { describe, it, expect } from "vitest";
import type { ConflictResolution } from "./conflict-resolver";

/**
 * Unit coverage for the resolution contract. The pattern itself is a
 * React modal; the full keyboard + click flow is covered by the
 * Playwright scenario (tests/e2e/409-conflict.spec.ts, un-fixmed when
 * Phase 4 ships a real 409-capable mutation page).
 *
 * Here we lock the shape of the ConflictResolution discriminated union so
 * that callers of useOptimisticMutation can safely `switch` on `type`.
 */
describe("ConflictResolution shape", () => {
  it("keep-mine is discriminated by type only", () => {
    const r: ConflictResolution = { type: "keep-mine" };
    expect(r.type).toBe("keep-mine");
  });

  it("take-theirs is discriminated by type only", () => {
    const r: ConflictResolution = { type: "take-theirs" };
    expect(r.type).toBe("take-theirs");
  });

  it("merge carries field-level selections", () => {
    const r: ConflictResolution = {
      type: "merge",
      selections: { name: "mine", status: "theirs" },
    };
    expect(r.type).toBe("merge");
    if (r.type === "merge") {
      expect(r.selections.name).toBe("mine");
      expect(r.selections.status).toBe("theirs");
    }
  });

  it("cancel is discriminated by type only", () => {
    const r: ConflictResolution = { type: "cancel" };
    expect(r.type).toBe("cancel");
  });
});
