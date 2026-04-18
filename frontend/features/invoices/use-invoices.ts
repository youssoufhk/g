"use client";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { USE_API } from "@/lib/api-mode";
import { INVOICES } from "@/lib/mock-data";

import type { Invoice, InvoiceListFilters, InvoiceStatus } from "./types";

type InvoiceOutDto = {
  id: number;
  client_id: number;
  number: string;
  issue_date: string;
  due_date: string;
  status: string;
  currency: string;
  subtotal_cents: number;
  tax_total_cents: number;
  total_cents: number;
  sent_at: string | null;
  paid_at: string | null;
  pdf_status: string;
  created_at: string;
};

type InvoicesListResponseDto = {
  items: InvoiceOutDto[];
  total: number;
};

const VALID_STATUSES: InvoiceStatus[] = ["draft", "sent", "viewed", "paid", "overdue", "void"];

function adaptInvoice(dto: InvoiceOutDto): Invoice {
  const status: InvoiceStatus = (VALID_STATUSES as string[]).includes(dto.status)
    ? (dto.status as InvoiceStatus)
    : "draft";
  const currency: Invoice["currency"] =
    dto.currency === "EUR" || dto.currency === "GBP" || dto.currency === "USD" ? dto.currency : "EUR";
  const subtotal = dto.subtotal_cents / 100;
  const taxAmount = dto.tax_total_cents / 100;
  const total = dto.total_cents / 100;
  const taxRate = subtotal > 0 ? taxAmount / subtotal : 0;
  return {
    id: String(dto.id),
    number: dto.number,
    client_id: String(dto.client_id),
    client_name: `Client #${dto.client_id}`,
    status,
    currency,
    issue_date: dto.issue_date,
    due_date: dto.due_date,
    paid_date: dto.paid_at ? dto.paid_at.slice(0, 10) : undefined,
    subtotal,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total,
    line_items: [],
  };
}

function filterInvoices(items: Invoice[], filters: InvoiceListFilters): Invoice[] {
  let next = items;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    next = next.filter(
      (inv) =>
        inv.number.toLowerCase().includes(q) ||
        inv.client_name.toLowerCase().includes(q) ||
        (inv.project_name ?? "").toLowerCase().includes(q),
    );
  }
  if (filters.status && (filters.status as string) !== "all") {
    next = next.filter((inv) => inv.status === filters.status);
  }
  if (filters.client_id && filters.client_id !== "all") {
    next = next.filter((inv) => inv.client_id === filters.client_id);
  }
  return next;
}

export function useInvoices(filters: InvoiceListFilters = {}) {
  return useQuery<{ items: Invoice[]; total: number }>({
    queryKey: ["invoices", USE_API ? "api" : "mock", filters],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<InvoicesListResponseDto>(`/invoices?limit=500&offset=0`);
        const items = filterInvoices(data.items.map(adaptInvoice), filters);
        return { items, total: items.length };
      }
      await new Promise((r) => setTimeout(r, 200));
      const items = filterInvoices(INVOICES, filters);
      return { items, total: items.length };
    },
    staleTime: 30_000,
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ["invoice", USE_API ? "api" : "mock", id],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<InvoicesListResponseDto>(`/invoices?limit=500&offset=0`);
        const dto = data.items.find((inv) => String(inv.id) === id);
        if (!dto) throw new Error("Invoice not found");
        return adaptInvoice(dto);
      }
      await new Promise((r) => setTimeout(r, 200));
      const invoice = INVOICES.find((inv) => inv.id === id);
      if (!invoice) throw new Error("Invoice not found");
      return invoice;
    },
    staleTime: 60_000,
  });
}
