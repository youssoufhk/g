"use client";
import { useQuery } from "@tanstack/react-query";
import type { Invoice, InvoiceListFilters } from "./types";

const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-42",
    number: "INV-2026-0042",
    client_id: "c1",
    client_name: "HSBC UK",
    project_id: "p1",
    project_name: "HSBC Digital Transformation",
    status: "sent",
    currency: "GBP",
    issue_date: "2026-04-01",
    due_date: "2026-04-30",
    subtotal: 12600,
    tax_rate: 0.20,
    tax_amount: 2520,
    total: 15120,
    ai_generated: true,
    line_items: [
      {
        id: "li-42-1",
        description: "Strategy consulting - April 2026 (7 days x £1,800/day)",
        quantity: 7,
        unit_price: 1800,
        amount: 12600,
      },
    ],
  },
  {
    id: "inv-41",
    number: "INV-2026-0041",
    client_id: "c2",
    client_name: "BNP Paribas",
    project_id: "p2",
    project_name: "BNP Risk Model",
    status: "paid",
    currency: "EUR",
    issue_date: "2026-03-01",
    due_date: "2026-03-31",
    paid_date: "2026-03-28",
    subtotal: 10500,
    tax_rate: 0.20,
    tax_amount: 2100,
    total: 12600,
    line_items: [
      {
        id: "li-41-1",
        description: "Risk model consulting - March 2026 (5 days x €2,100/day)",
        quantity: 5,
        unit_price: 2100,
        amount: 10500,
      },
    ],
  },
  {
    id: "inv-40",
    number: "INV-2026-0040",
    client_id: "c3",
    client_name: "TotalEnergies",
    project_id: "p3",
    project_name: "ESG Reporting",
    status: "draft",
    currency: "EUR",
    issue_date: "2026-04-10",
    due_date: "2026-05-10",
    subtotal: 5700,
    tax_rate: 0.20,
    tax_amount: 1140,
    total: 6840,
    ai_generated: true,
    line_items: [
      {
        id: "li-40-1",
        description: "ESG reporting advisory - April 2026 (3 days x €1,900/day)",
        quantity: 3,
        unit_price: 1900,
        amount: 5700,
      },
    ],
  },
  {
    id: "inv-39",
    number: "INV-2026-0039",
    client_id: "c4",
    client_name: "Renault",
    project_id: "p4",
    project_name: "Lean Transformation",
    status: "overdue",
    currency: "EUR",
    issue_date: "2026-02-15",
    due_date: "2026-03-15",
    subtotal: 7000,
    tax_rate: 0.20,
    tax_amount: 1400,
    total: 8400,
    line_items: [
      {
        id: "li-39-1",
        description: "Lean transformation consulting - February 2026 (4 days x €1,750/day)",
        quantity: 4,
        unit_price: 1750,
        amount: 7000,
      },
    ],
  },
  {
    id: "inv-38",
    number: "INV-2026-0038",
    client_id: "c2",
    client_name: "BNP Paribas",
    status: "paid",
    currency: "EUR",
    issue_date: "2026-02-01",
    due_date: "2026-02-28",
    paid_date: "2026-02-25",
    subtotal: 12600,
    tax_rate: 0.20,
    tax_amount: 2520,
    total: 15120,
    line_items: [
      {
        id: "li-38-1",
        description: "Strategy consulting - February 2026 (6 days x €2,100/day)",
        quantity: 6,
        unit_price: 2100,
        amount: 12600,
      },
    ],
  },
  {
    id: "inv-37",
    number: "INV-2026-0037",
    client_id: "c1",
    client_name: "HSBC UK",
    status: "void",
    currency: "GBP",
    issue_date: "2026-01-15",
    due_date: "2026-02-15",
    subtotal: 0,
    tax_rate: 0.20,
    tax_amount: 0,
    total: 0,
    line_items: [],
    notes: "Voided - replaced by INV-2026-0042.",
  },
];

export function useInvoices(filters: InvoiceListFilters = {}) {
  return useQuery<{ items: Invoice[]; total: number }>({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let items = MOCK_INVOICES;

      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (inv) =>
            inv.number.toLowerCase().includes(q) ||
            inv.client_name.toLowerCase().includes(q) ||
            (inv.project_name ?? "").toLowerCase().includes(q),
        );
      }

      if (filters.status && filters.status !== ("all" as InvoiceListFilters["status"])) {
        items = items.filter((inv) => inv.status === filters.status);
      }

      if (filters.client_id && filters.client_id !== "all") {
        items = items.filter((inv) => inv.client_id === filters.client_id);
      }

      return { items, total: items.length };
    },
    staleTime: 30_000,
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ["invoice", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const invoice = MOCK_INVOICES.find((inv) => inv.id === id);
      if (!invoice) throw new Error("Invoice not found");
      return invoice;
    },
    staleTime: 60_000,
  });
}
