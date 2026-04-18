"use client";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { USE_API } from "@/lib/api-mode";
import { EXPENSES } from "@/lib/mock-data";

import type { Expense, ExpenseCategory, ExpenseListFilters, ExpenseStatus } from "./types";

type ExpenseOutDto = {
  id: number;
  employee_id: number;
  employee_name: string | null;
  category_id: number;
  project_id: number | null;
  project_name: string | null;
  client_id: number | null;
  client_name: string | null;
  expense_date: string;
  merchant: string | null;
  amount_cents: number;
  currency: string;
  tax_amount_cents: number;
  status: string;
  reimbursement_status: string;
  approved_at: string | null;
  reimbursed_at: string | null;
  created_at: string;
};

type ExpensesListResponseDto = {
  items: ExpenseOutDto[];
  total: number;
};

const VALID_STATUSES: ExpenseStatus[] = ["draft", "submitted", "approved", "rejected", "reimbursed"];

function adaptExpense(dto: ExpenseOutDto): Expense {
  const rawStatus =
    dto.reimbursement_status === "paid" ? "reimbursed" : dto.status;
  const status: ExpenseStatus = (VALID_STATUSES as string[]).includes(rawStatus)
    ? (rawStatus as ExpenseStatus)
    : "draft";
  const currency: Expense["currency"] =
    dto.currency === "EUR" || dto.currency === "GBP" || dto.currency === "USD" ? dto.currency : "EUR";
  return {
    id: String(dto.id),
    employee_id: String(dto.employee_id),
    employee_name: dto.employee_name ?? "Unknown",
    project_id: dto.project_id ? String(dto.project_id) : undefined,
    project_name: dto.project_name ?? undefined,
    client_name: dto.client_name ?? undefined,
    category: "other" as ExpenseCategory,
    description: dto.merchant ?? "",
    amount: dto.amount_cents / 100,
    currency,
    expense_date: dto.expense_date,
    status,
    billable: dto.client_id != null,
    approved_at: dto.approved_at ?? undefined,
  };
}

function filterExpenses(items: Expense[], filters: ExpenseListFilters): Expense[] {
  let next = items;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    next = next.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.employee_name.toLowerCase().includes(q) ||
        (e.project_name ?? "").toLowerCase().includes(q) ||
        (e.client_name ?? "").toLowerCase().includes(q),
    );
  }
  if (filters.status) {
    next = next.filter((e) => e.status === filters.status);
  }
  if (filters.category) {
    next = next.filter((e) => e.category === filters.category);
  }
  if (filters.project_id) {
    next = next.filter((e) => e.project_id === filters.project_id);
  }
  return next;
}

export function useExpenses(filters: ExpenseListFilters = {}) {
  return useQuery<Expense[]>({
    queryKey: ["expenses", USE_API ? "api" : "mock", filters],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<ExpensesListResponseDto>(`/expenses?limit=500&offset=0`);
        return filterExpenses(data.items.map(adaptExpense), filters);
      }
      await new Promise((r) => setTimeout(r, 200));
      return filterExpenses(EXPENSES, filters);
    },
    staleTime: 30_000,
  });
}
