"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, MoreHorizontal, Download, CheckCircle, Ban, Send } from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { FilterBar } from "@/components/patterns/filter-bar";
import { StatPill } from "@/components/patterns/stat-pill";
import { EmptyState } from "@/components/patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import {
  DataTableWrapper,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/table";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { useInvoices } from "@/features/invoices/use-invoices";
import type { Invoice, InvoiceStatus } from "@/features/invoices/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOL: Record<Invoice["currency"], string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};

function formatAmount(amount: number, currency: Invoice["currency"]): string {
  if (amount === 0) return "-";
  const symbol = CURRENCY_SYMBOL[currency];
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${symbol}${formatted}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusTone(status: InvoiceStatus): "default" | "info" | "success" | "error" | "warning" {
  switch (status) {
    case "draft": return "default";
    case "sent": return "info";
    case "viewed": return "info";
    case "paid": return "success";
    case "overdue": return "error";
    case "void": return "default";
  }
}

function statusLabel(status: InvoiceStatus): string {
  switch (status) {
    case "draft": return "Draft";
    case "sent": return "Sent";
    case "viewed": return "Viewed";
    case "paid": return "Paid";
    case "overdue": return "Overdue";
    case "void": return "Void";
  }
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TR key={i}>
          <TD style={{ width: 40 }}><Skeleton variant="text" width={16} /></TD>
          <TD><Skeleton variant="title" width={130} /></TD>
          <TD><Skeleton variant="text" width={90} /></TD>
          <TD><Skeleton variant="text" width={110} /></TD>
          <TD><Skeleton variant="text" width={80} /></TD>
          <TD><Skeleton variant="text" width={80} /></TD>
          <TD><Skeleton variant="text" width={80} /></TD>
          <TD><Skeleton variant="text" width={60} /></TD>
          <TD style={{ width: 44 }}><Skeleton variant="text" width={24} /></TD>
        </TR>
      ))}
    </>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function InvoiceMobileCard({ invoice }: { invoice: Invoice }) {
  const isOverdue = invoice.status === "overdue";
  return (
    <Link
      href={`/invoices/${invoice.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-4)",
        background: "var(--color-surface-0)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-3)",
        textDecoration: "none",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: "var(--weight-semibold)", color: "var(--color-primary)", marginBottom: "var(--space-1)", fontSize: "var(--text-body)" }}>
          {invoice.number}
        </div>
        <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-2)", marginBottom: "var(--space-1)" }}>
          {invoice.client_name}
        </div>
        <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
          Due {formatDate(invoice.due_date)}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-1)" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: "var(--weight-semibold)",
            fontSize: "var(--text-body)",
            color: isOverdue ? "var(--color-error)" : "var(--color-gold)",
          }}
        >
          {formatAmount(invoice.total, invoice.currency)}
        </div>
        <Badge tone={statusTone(invoice.status)} dot={invoice.status === "viewed"}>
          {statusLabel(invoice.status)}
        </Badge>
      </div>
    </Link>
  );
}

// ── New invoice modal ─────────────────────────────────────────────────────────

type NewInvoiceFormState = {
  client_id: string;
  project_id: string;
  currency: Invoice["currency"];
  issue_date: string;
  due_date: string;
  amount: string;
};

function NewInvoiceModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (inv: Invoice) => void;
}) {
  const [form, setForm] = useState<NewInvoiceFormState>({
    client_id: "c1",
    project_id: "p1",
    currency: "GBP",
    issue_date: "",
    due_date: "",
    amount: "",
  });

  const CLIENT_OPTIONS = [
    { value: "c1", label: "HSBC UK" },
    { value: "c2", label: "BNP Paribas" },
    { value: "c3", label: "TotalEnergies" },
    { value: "c4", label: "Renault" },
  ];
  const PROJECT_OPTIONS = [
    { value: "p1", label: "HSBC Digital Transformation" },
    { value: "p2", label: "BNP Risk Model" },
    { value: "p3", label: "TotalEnergies ESG Strategy" },
    { value: "p4", label: "Renault Lean Analytics" },
  ];
  const CLIENT_NAMES: Record<string, string> = { c1: "HSBC UK", c2: "BNP Paribas", c3: "TotalEnergies", c4: "Renault" };
  const PROJECT_NAMES: Record<string, string> = { p1: "HSBC Digital Transformation", p2: "BNP Risk Model", p3: "TotalEnergies ESG Strategy", p4: "Renault Lean Analytics" };

  function handleSave() {
    const amount = parseFloat(form.amount) || 0;
    const taxAmount = amount * 0.2;
    const inv: Invoice = {
      id: `inv-new-${Date.now()}`,
      number: `INV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      client_id: form.client_id,
      client_name: CLIENT_NAMES[form.client_id] ?? form.client_id,
      project_id: form.project_id || undefined,
      project_name: form.project_id ? (PROJECT_NAMES[form.project_id] ?? undefined) : undefined,
      status: "draft",
      currency: form.currency,
      issue_date: form.issue_date || new Date().toISOString().slice(0, 10),
      due_date: form.due_date || new Date().toISOString().slice(0, 10),
      subtotal: amount,
      tax_rate: 0.2,
      tax_amount: taxAmount,
      total: amount + taxAmount,
      line_items: [],
    };
    onSave(inv);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New invoice"
      description="Create a draft invoice to review before sending."
      size="md"
      footer={
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave}>Create invoice</Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>Client</label>
          <Select value={form.client_id} onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}>
            {CLIENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>Project (optional)</label>
          <Select value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}>
            <option value="">No project</option>
            {PROJECT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
            <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>Amount (excl. VAT)</label>
            <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", width: 100 }}>
            <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>Currency</label>
            <Select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as Invoice["currency"] }))}>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </Select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
            <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>Issue date</label>
            <Input type="date" value={form.issue_date} onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
            <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>Due date</label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Actions dropdown ──────────────────────────────────────────────────────────

function InvoiceActions({
  invoice,
  onStatusChange,
  onDownload,
}: {
  invoice: Invoice;
  onStatusChange: (id: string, status: InvoiceStatus) => void;
  onDownload: (id: string) => void;
}) {
  const router = useRouter();
  const canMarkPaid = invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "viewed";
  const canSend = invoice.status === "draft";
  const canVoid = invoice.status !== "paid" && invoice.status !== "void";

  return (
    <Dropdown
      align="right"
      trigger={({ toggle }) => (
        <Button variant="ghost" size="xs" iconOnly aria-label={`Actions for ${invoice.number}`} onClick={toggle}>
          <MoreHorizontal size={16} aria-hidden />
        </Button>
      )}
    >
      <DropdownItem
        icon={<FileText size={14} aria-hidden />}
        onClick={() => router.push(`/invoices/${invoice.id}`)}
      >
        View
      </DropdownItem>
      <DropdownItem
        icon={<Download size={14} aria-hidden />}
        onClick={() => onDownload(invoice.id)}
      >
        Download PDF
      </DropdownItem>
      {canSend && (
        <>
          <DropdownDivider />
          <DropdownItem
            icon={<Send size={14} aria-hidden />}
            onClick={() => onStatusChange(invoice.id, "sent")}
          >
            Send to client
          </DropdownItem>
        </>
      )}
      {canMarkPaid && (
        <>
          <DropdownDivider />
          <DropdownItem
            icon={<CheckCircle size={14} aria-hidden />}
            onClick={() => onStatusChange(invoice.id, "paid")}
          >
            Mark as paid
          </DropdownItem>
        </>
      )}
      {canVoid && (
        <>
          <DropdownDivider />
          <DropdownItem
            icon={<Ban size={14} aria-hidden />}
            destructive
            onClick={() => onStatusChange(invoice.id, "void")}
          >
            Void
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [localOverrides, setLocalOverrides] = useState<Record<string, InvoiceStatus>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [localNew, setLocalNew] = useState<Invoice[]>([]);

  const { data, isLoading, error } = useInvoices({
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as InvoiceStatus) : undefined,
    client_id: clientFilter !== "all" ? clientFilter : undefined,
  });

  // Apply local status overrides and prepend locally created invoices
  const rawInvoices = data?.items ?? [];
  const invoicesWithOverrides = rawInvoices.map((inv) =>
    inv.id in localOverrides ? { ...inv, status: localOverrides[inv.id] as InvoiceStatus } : inv,
  );

  // Filter locally-created invoices through filters too
  const filteredLocalNew = localNew.filter((inv) => {
    if (search) {
      const q = search.toLowerCase();
      if (!inv.number.toLowerCase().includes(q) && !inv.client_name.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (clientFilter !== "all" && inv.client_id !== clientFilter) return false;
    return true;
  }).map((inv) =>
    inv.id in localOverrides ? { ...inv, status: localOverrides[inv.id] as InvoiceStatus } : inv,
  );

  const invoices = [...filteredLocalNew, ...invoicesWithOverrides];
  const total = invoices.length;

  // KPI calculations from full unfiltered list
  const { data: allData } = useInvoices({});
  const allInvoicesRaw = allData?.items ?? [];
  const allInvoices = [...localNew, ...allInvoicesRaw].map((inv) =>
    inv.id in localOverrides ? { ...inv, status: localOverrides[inv.id] as InvoiceStatus } : inv,
  );

  function handleStatusChange(id: string, status: InvoiceStatus) {
    setLocalOverrides((prev) => ({ ...prev, [id]: status }));
  }

  function handleDownload(id: string) {
    setDownloadingId(id);
    setTimeout(() => setDownloadingId(null), 1200);
  }

  function handleNewInvoiceSave(inv: Invoice) {
    setLocalNew((prev) => [inv, ...prev]);
  }

  const outstanding = allInvoices
    .filter((inv) => ["sent", "viewed", "overdue"].includes(inv.status))
    .reduce((acc, inv) => acc + inv.total, 0);

  const overdueTotal = allInvoices
    .filter((inv) => inv.status === "overdue")
    .reduce((acc, inv) => acc + inv.total, 0);

  const paidYTD = allInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, inv) => acc + inv.total, 0);

  const draftsCount = allInvoices.filter((inv) => inv.status === "draft").length;

  const hasFilters = search || statusFilter !== "all" || clientFilter !== "all";

  return (
    <>
      <PageHeader
        title="Invoices"
        count={total}
        actions={
          <Button
            variant="primary"
            size="md"
            leadingIcon={<Plus size={16} aria-hidden />}
            onClick={() => setShowNewModal(true)}
          >
            New invoice
          </Button>
        }
      />

      {/* KPI strip */}
      <div
        className="kpi-strip"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--space-4)",
          marginBottom: "var(--space-2)",
        }}
      >
        <StatPill
          label="Total outstanding"
          value={outstanding > 0 ? `£${new Intl.NumberFormat("en-GB").format(outstanding)}` : "-"}
          accent="warning"
        />
        <StatPill
          label="Overdue"
          value={overdueTotal > 0 ? `€${new Intl.NumberFormat("en-GB").format(overdueTotal)}` : "-"}
          accent="error"
        />
        <StatPill
          label="Paid YTD"
          value={paidYTD > 0 ? `€${new Intl.NumberFormat("en-GB").format(paidYTD)}` : "-"}
          accent="success"
        />
        <StatPill
          label="Drafts"
          value={draftsCount}
        />
      </div>

      <FilterBar
        actions={undefined}
      >
        <SearchInput
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ minWidth: 150 }}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="void">Void</option>
        </Select>
        <Select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          style={{ minWidth: 160 }}
        >
          <option value="all">All clients</option>
          <option value="c1">HSBC UK</option>
          <option value="c2">BNP Paribas</option>
          <option value="c3">TotalEnergies</option>
          <option value="c4">Renault</option>
        </Select>
      </FilterBar>

      {/* Downloading feedback */}
      {downloadingId && (
        <div
          style={{
            padding: "var(--space-2) var(--space-4)",
            background: "var(--color-info-muted)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-info)",
            fontSize: "var(--text-body-sm)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            marginTop: "var(--space-2)",
          }}
        >
          <Download size={14} aria-hidden />
          Preparing PDF...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: "var(--space-4)",
            background: "var(--color-error-muted)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-error)",
            fontSize: "var(--text-body-sm)",
            marginTop: "var(--space-4)",
          }}
        >
          Failed to load invoices. {(error as Error).message}
        </div>
      )}

      {/* Desktop table */}
      {!error && (
        <DataTableWrapper>
          <Table>
            <THead>
              <TR>
                <TH style={{ width: 40 }} />
                <TH style={{ minWidth: 150 }}>Invoice #</TH>
                <TH style={{ minWidth: 120 }}>Client</TH>
                <TH style={{ minWidth: 160 }}>Project</TH>
                <TH style={{ minWidth: 110 }}>Issue date</TH>
                <TH style={{ minWidth: 110 }}>Due date</TH>
                <TH numeric sorted sortDirection="desc" style={{ minWidth: 130 }}>Amount</TH>
                <TH style={{ minWidth: 90 }}>Status</TH>
                <TH style={{ width: 44 }} />
              </TR>
            </THead>
            <TBody>
              {isLoading && <SkeletonRows />}

              {!isLoading && invoices.length === 0 && (
                <TR>
                  <TD colSpan={9} style={{ textAlign: "center", padding: "var(--space-16) var(--space-6)" }}>
                    <EmptyState
                      icon={FileText}
                      title={hasFilters ? "No invoices match your filters" : "No invoices yet"}
                      description={
                        hasFilters
                          ? "Try adjusting your search or filters."
                          : "Create your first invoice to start tracking payments."
                      }
                      action={
                        hasFilters ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSearch("");
                              setStatusFilter("all");
                              setClientFilter("all");
                            }}
                          >
                            Clear filters
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            leadingIcon={<Plus size={14} aria-hidden />}
                            onClick={() => setShowNewModal(true)}
                          >
                            New invoice
                          </Button>
                        )
                      }
                    />
                  </TD>
                </TR>
              )}

              {!isLoading && invoices.map((invoice) => {
                const isOverdue = invoice.status === "overdue";
                return (
                  <TR key={invoice.id}>
                    <TD>
                      {invoice.ai_generated && (
                        <span
                          title="AI drafted"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 20,
                            height: 20,
                            borderRadius: "var(--radius-sm)",
                            background: "var(--color-ai-muted, color-mix(in srgb, var(--color-primary) 15%, transparent))",
                            color: "var(--color-primary)",
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                            <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" />
                          </svg>
                        </span>
                      )}
                    </TD>
                    <TD>
                      <Link
                        href={`/invoices/${invoice.id}`}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: "var(--weight-semibold)",
                          color: "var(--color-primary)",
                          textDecoration: "none",
                          fontSize: "var(--text-body-sm)",
                        }}
                        className="hover-primary"
                      >
                        {invoice.number}
                      </Link>
                    </TD>
                    <TD>
                      <Link
                        href={`/clients/${invoice.client_id}`}
                        style={{ color: "var(--color-text-1)", textDecoration: "none", fontWeight: "var(--weight-medium)" }}
                        className="hover-primary"
                      >
                        {invoice.client_name}
                      </Link>
                    </TD>
                    <TD muted>
                      {invoice.project_name ? (
                        <Link
                          href={`/projects/${invoice.project_id}`}
                          style={{ color: "var(--color-text-2)", textDecoration: "none" }}
                          className="hover-primary"
                        >
                          {invoice.project_name}
                        </Link>
                      ) : (
                        <span style={{ color: "var(--color-text-3)" }}>-</span>
                      )}
                    </TD>
                    <TD muted>{formatDate(invoice.issue_date)}</TD>
                    <TD
                      style={{
                        color: isOverdue ? "var(--color-error)" : undefined,
                        fontWeight: isOverdue ? "var(--weight-medium)" : undefined,
                      }}
                    >
                      {formatDate(invoice.due_date)}
                    </TD>
                    <TD numeric>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: "var(--weight-semibold)",
                          color: isOverdue ? "var(--color-error)" : "var(--color-gold)",
                        }}
                      >
                        {formatAmount(invoice.total, invoice.currency)}
                      </span>
                    </TD>
                    <TD>
                      <Badge tone={statusTone(invoice.status)} dot={invoice.status === "viewed"}>
                        {statusLabel(invoice.status)}
                      </Badge>
                    </TD>
                    <TD>
                      <InvoiceActions
                        invoice={invoice}
                        onStatusChange={handleStatusChange}
                        onDownload={handleDownload}
                      />
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </DataTableWrapper>
      )}

      {/* Mobile cards */}
      {!error && !isLoading && invoices.length > 0 && (
        <div className="md:hidden" style={{ marginTop: "var(--space-4)" }}>
          {invoices.map((invoice) => (
            <InvoiceMobileCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}

      {/* Summary row */}
      {!isLoading && invoices.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            padding: "var(--space-3) 0",
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-3)",
            borderTop: "1px solid var(--color-border-subtle)",
            marginTop: "var(--space-2)",
          }}
        >
          <span>{total} invoices</span>
          <span>{invoices.filter((i) => i.status === "paid").length} paid</span>
          {invoices.filter((i) => i.status === "overdue").length > 0 && (
            <span style={{ color: "var(--color-error)" }}>
              {invoices.filter((i) => i.status === "overdue").length} overdue
            </span>
          )}
        </div>
      )}

      <NewInvoiceModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={handleNewInvoiceSave}
      />

      <style>{`
        @media (max-width: 767px) {
          .kpi-strip {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 479px) {
          .kpi-strip {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
