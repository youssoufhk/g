"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { DashboardKpis } from "./types";
import { DASHBOARD_KPIS } from "@/lib/mock-data";

const DASHBOARD_KEYS = {
  kpis: ["dashboard", "kpis"] as const,
};

async function fetchKpis(): Promise<DashboardKpis> {
  const remote = await apiFetch<Partial<DashboardKpis>>("/dashboard/kpis");
  // Merge remote values with canonical seed data fallbacks.
  return {
    employees_total: remote.employees_total ?? DASHBOARD_KPIS.employees_total,
    clients_total: remote.clients_total ?? DASHBOARD_KPIS.clients_total,
    projects_total: remote.projects_total ?? DASHBOARD_KPIS.projects_total,
    projects_active: remote.projects_active ?? DASHBOARD_KPIS.projects_active,
    timesheets_hours_this_week: remote.timesheets_hours_this_week ?? DASHBOARD_KPIS.timesheets_hours_this_week,
    timesheets_target_hours: remote.timesheets_target_hours ?? DASHBOARD_KPIS.timesheets_target_hours,
    expenses_pending_count: remote.expenses_pending_count ?? DASHBOARD_KPIS.expenses_pending_count,
    expenses_pending_eur: remote.expenses_pending_eur ?? DASHBOARD_KPIS.expenses_pending_eur,
    invoices_outstanding_count: remote.invoices_outstanding_count ?? DASHBOARD_KPIS.invoices_outstanding_count,
    invoices_outstanding_amount: remote.invoices_outstanding_amount ?? DASHBOARD_KPIS.invoices_outstanding_amount,
    invoices_overdue_count: remote.invoices_overdue_count ?? DASHBOARD_KPIS.invoices_overdue_count,
    pending_approvals: remote.pending_approvals ?? DASHBOARD_KPIS.pending_approvals,
  };
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.kpis,
    queryFn: fetchKpis,
    staleTime: 30_000,
  });
}
