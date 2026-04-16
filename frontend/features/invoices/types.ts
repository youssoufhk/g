export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "void";

export type InvoiceLineItem = {
  id: string;
  description: string; // e.g. "Strategy consulting - Week 14 (7 days x £1,800/day)"
  quantity: number; // days
  unit_price: number; // GBP/EUR/USD per day
  amount: number; // quantity * unit_price
};

export type Invoice = {
  id: string;
  number: string; // e.g. "INV-2026-0042"
  client_id: string;
  client_name: string;
  project_id?: string;
  project_name?: string;
  status: InvoiceStatus;
  currency: "GBP" | "EUR" | "USD";
  issue_date: string; // ISO
  due_date: string;   // ISO
  paid_date?: string; // ISO
  subtotal: number;   // before tax
  tax_rate: number;   // e.g. 0.20 for 20%
  tax_amount: number;
  total: number;      // subtotal + tax
  line_items: InvoiceLineItem[];
  notes?: string;
  ai_generated?: boolean; // true if AI drafted it
};

export type InvoiceListFilters = {
  status?: InvoiceStatus;
  client_id?: string;
  search?: string;
};
