"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { DashboardKpis } from "./types";

const DASHBOARD_KEYS = {
  kpis: ["dashboard", "kpis"] as const,
};

async function fetchKpis(): Promise<DashboardKpis> {
  return apiFetch<DashboardKpis>("/dashboard/kpis");
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.kpis,
    queryFn: fetchKpis,
    staleTime: 30_000,
    retry: 2,
  });
}
