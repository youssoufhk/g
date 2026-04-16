"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { DashboardKpis } from "./types";

const DASHBOARD_KEYS = {
  kpis: ["dashboard", "kpis"] as const,
};

async function fetchKpis(): Promise<DashboardKpis> {
  const remote = await apiFetch<Partial<DashboardKpis>>("/dashboard/kpis");
  // Merge remote values with mock values for fields not yet wired in Phase 4.
  return {
    employees_total: remote.employees_total ?? 6,
    clients_total: remote.clients_total ?? 4,
    projects_total: remote.projects_total ?? 5,
    projects_active: remote.projects_active ?? 3,
    timesheets_hours_this_week: remote.timesheets_hours_this_week ?? 37.5,
    timesheets_target_hours: remote.timesheets_target_hours ?? 40,
    expenses_pending_count: remote.expenses_pending_count ?? 4,
    expenses_pending_eur: remote.expenses_pending_eur ?? 607.50,
    invoices_outstanding_count: remote.invoices_outstanding_count ?? 2,
    invoices_outstanding_amount: remote.invoices_outstanding_amount ?? 15120,
    invoices_overdue_count: remote.invoices_overdue_count ?? 1,
    pending_approvals: remote.pending_approvals ?? 4,
  };
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.kpis,
    queryFn: fetchKpis,
    staleTime: 30_000,
  });
}
