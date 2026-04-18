"use client";

import { useEffect, useState } from "react";

/**
 * Client-side source of truth for the AI kill-switch banner.
 *
 * Backend wire-up is tracked in CRITIC_PLAN D1/D5 and specs/AI_FEATURES.md
 * section 8 (kill-switch + budget gate). Until the tenant-scoped flags
 * endpoint ships, this hook surfaces two preview channels so Ops can
 * demo the degraded banner end-to-end:
 *
 *   1. URL query string: ?ai=off   (sticky per page load)
 *   2. localStorage key: "gamma:ai:off" = "1"
 *
 * Both are read once on mount and cleared when Ops ships the real
 * /api/v1/flags/ai endpoint (backend AI_FEATURES.md section 8).
 */
export function useAiKillSwitch(): boolean {
  const [off, setOff] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const queryOff = params.get("ai") === "off";
    const storageOff = window.localStorage.getItem("gamma:ai:off") === "1";
    setOff(queryOff || storageOff);
  }, []);

  return off;
}
