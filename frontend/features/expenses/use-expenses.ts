"use client";
import { useQuery } from "@tanstack/react-query";
import type { Expense, ExpenseListFilters } from "./types";
import { EXPENSES } from "@/lib/mock-data";

export function useExpenses(filters: ExpenseListFilters = {}) {
  return useQuery<Expense[]>({
    queryKey: ["expenses", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let items = EXPENSES;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (e) =>
            e.description.toLowerCase().includes(q) ||
            e.employee_name.toLowerCase().includes(q) ||
            (e.project_name ?? "").toLowerCase().includes(q) ||
            (e.client_name ?? "").toLowerCase().includes(q),
        );
      }
      if (filters.status) {
        items = items.filter((e) => e.status === filters.status);
      }
      if (filters.category) {
        items = items.filter((e) => e.category === filters.category);
      }
      if (filters.project_id) {
        items = items.filter((e) => e.project_id === filters.project_id);
      }
      return items;
    },
    staleTime: 30_000,
  });
}
