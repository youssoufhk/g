"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { DashboardKpis } from "./types";

const DASHBOARD_KEYS = {
  kpis: ["dashboard", "kpis"] as const,
};

export function useDashboardKpis() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.kpis,
    queryFn: () => apiFetch<DashboardKpis>("/dashboard/kpis"),
    staleTime: 30_000,
  });
}
