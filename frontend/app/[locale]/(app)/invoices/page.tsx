"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText, MoreHorizontal, Download, CheckCircle, Ban } from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { FilterBar } from "@/components/patterns/filter-bar";
import { StatPill } from "@/components/patterns/stat-pill";
import { EmptyState } from "@/components/patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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

// ── Actions dropdown ──────────────────────────────────────────────────────────

function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const canMarkPaid = invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "viewed";
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
      <DropdownItem icon={<FileText size={14} aria-hidden />}>
        View
      </DropdownItem>
      <DropdownItem icon={<Download size={14} aria-hidden />}>
        Download PDF
      </DropdownItem>
      {canMarkPaid && (
        <>
          <DropdownDivider />
          <DropdownItem icon={<CheckCircle size={14} aria-hidden />}>
            Mark as paid
          </DropdownItem>
        </>
      )}
      {canVoid && (
        <>
          <DropdownDivider />
          <DropdownItem icon={<Ban size={14} aria-hidden />} destructive>
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

  const { data, isLoading, error } = useInvoices({
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as InvoiceStatus) : undefined,
    client_id: clientFilter !== "all" ? clientFilter : undefined,
  });

  const invoices = data?.items ?? [];
  const total = data?.total ?? 0;

  // KPI calculations from full unfiltered list (use raw hook with no filters for KPIs)
  const { data: allData } = useInvoices({});
  const allInvoices = allData?.items ?? [];

  const outstanding = allInvoices
    .filter((inv) => inv.status === "sent" || inv.status === "viewed" || inv.status === "overdue")
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
          <Button variant="primary" size="md" leadingIcon={<Plus size={16} aria-hidden />}>
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
                          <Button variant="primary" size="sm" leadingIcon={<Plus size={14} aria-hidden />}>
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
                      <InvoiceActions invoice={invoice} />
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
