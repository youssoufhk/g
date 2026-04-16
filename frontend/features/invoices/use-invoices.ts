"use client";
import { useQuery } from "@tanstack/react-query";
import type { Invoice, InvoiceListFilters } from "./types";
import { INVOICES } from "@/lib/mock-data";

export function useInvoices(filters: InvoiceListFilters = {}) {
  return useQuery<{ items: Invoice[]; total: number }>({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let items = INVOICES;

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
      const invoice = INVOICES.find((inv) => inv.id === id);
      if (!invoice) throw new Error("Invoice not found");
      return invoice;
    },
    staleTime: 60_000,
  });
}
