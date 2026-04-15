import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch, ApiClientError } from "./api-client";

describe("apiFetch", () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn() as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  it("returns parsed JSON on 200", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const result = await apiFetch<{ ok: boolean }>("/health");
    expect(result).toEqual({ ok: true });
  });

  it("throws ApiClientError with status on non-2xx", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ code: "forbidden", message: "nope" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );
    try {
      await apiFetch("/secret");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect((err as ApiClientError).status).toBe(403);
      expect((err as ApiClientError).body?.code).toBe("forbidden");
      return;
    }
    throw new Error("expected ApiClientError");
  });

  it("marks 402 as entitlement locked", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ code: "payment_required", message: "upgrade" }), {
        status: 402,
      }),
    );
    try {
      await apiFetch("/protected");
    } catch (err) {
      expect((err as ApiClientError).isEntitlementLocked).toBe(true);
      return;
    }
    throw new Error("expected ApiClientError");
  });
});
