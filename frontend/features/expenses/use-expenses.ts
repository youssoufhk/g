"use client";
import { useQuery } from "@tanstack/react-query";
import type { Expense, ExpenseListFilters } from "./types";

const MOCK_EXPENSES: Expense[] = [
  {
    id: "e1",
    employee_id: "emp1",
    employee_name: "Amara Diallo",
    project_id: "p1",
    project_name: "HSBC Digital Transformation",
    client_name: "HSBC UK",
    category: "travel",
    description: "Paris - London Eurostar (business)",
    amount: 287.5,
    currency: "EUR",
    expense_date: "2026-04-14",
    status: "submitted",
    billable: true,
    receipt_url: "#",
    submitted_at: "2026-04-14T18:00:00Z",
  },
  {
    id: "e2",
    employee_id: "emp2",
    employee_name: "Lucas Ferreira",
    project_id: "p2",
    project_name: "BNP Risk Model",
    client_name: "BNP Paribas",
    category: "meals",
    description: "Team lunch - client meeting",
    amount: 67.8,
    currency: "EUR",
    expense_date: "2026-04-12",
    status: "approved",
    billable: true,
    receipt_url: "#",
    submitted_at: "2026-04-12T14:00:00Z",
    approved_at: "2026-04-13T09:00:00Z",
  },
  {
    id: "e3",
    employee_id: "emp3",
    employee_name: "Sophie Martin",
    category: "accommodation",
    description: "Hotel Ibis - overnight client visit",
    amount: 152.0,
    currency: "EUR",
    expense_date: "2026-04-10",
    status: "approved",
    billable: false,
    receipt_url: "#",
    submitted_at: "2026-04-10T22:00:00Z",
    approved_at: "2026-04-11T10:00:00Z",
  },
  {
    id: "e4",
    employee_id: "emp1",
    employee_name: "Amara Diallo",
    category: "training",
    description: "Agile certification exam fee",
    amount: 320.0,
    currency: "EUR",
    expense_date: "2026-04-08",
    status: "submitted",
    billable: false,
    submitted_at: "2026-04-08T11:00:00Z",
  },
  {
    id: "e5",
    employee_id: "emp4",
    employee_name: "James Morel",
    category: "travel",
    description: "Client site visit - taxi",
    amount: 34.2,
    currency: "EUR",
    expense_date: "2026-04-07",
    status: "rejected",
    billable: true,
    rejection_reason: "No receipt attached",
    submitted_at: "2026-04-07T16:00:00Z",
  },
  {
    id: "e6",
    employee_id: "emp5",
    employee_name: "Chiara Rossi",
    category: "software",
    description: "Notion license renewal",
    amount: 96.0,
    currency: "EUR",
    expense_date: "2026-04-01",
    status: "reimbursed",
    billable: false,
    receipt_url: "#",
    submitted_at: "2026-04-01T09:00:00Z",
    approved_at: "2026-04-02T08:00:00Z",
  },
];

export function useExpenses(filters: ExpenseListFilters = {}) {
  return useQuery<Expense[]>({
    queryKey: ["expenses", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let items = MOCK_EXPENSES;
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
