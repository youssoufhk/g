"use client";

import Link from "next/link";
import { use, useState } from "react";
import {
  ChevronLeft,
  FileText,
  Download,
  CheckCircle,
  Ban,
} from "lucide-react";

import { EmptyState } from "@/components/patterns/empty-state";
import { AIInsightCard } from "@/components/ui/ai-insight-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useInvoice } from "@/features/invoices/use-invoices";
import type { Invoice, InvoiceStatus } from "@/features/invoices/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOL: Record<Invoice["currency"], string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};

function formatAmount(amount: number, currency: Invoice["currency"]): string {
  const symbol = CURRENCY_SYMBOL[currency];
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

function statusTone(status: InvoiceStatus): "default" | "info" | "success" | "error" {
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

// ── Status timeline ───────────────────────────────────────────────────────────

const TIMELINE_STEPS: InvoiceStatus[] = ["draft", "sent", "viewed", "paid"];

function StatusTimeline({ currentStatus }: { currentStatus: InvoiceStatus }) {
  const isVoid = currentStatus === "void";
  const isOverdue = currentStatus === "overdue";

  // For overdue, active step is "sent"; for void, mark all as muted
  const activeStep: InvoiceStatus = isOverdue ? "sent" : currentStatus;
  const currentIdx = TIMELINE_STEPS.indexOf(activeStep);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "var(--space-4) var(--space-6)",
        background: "var(--color-surface-1)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
      }}
    >
      {TIMELINE_STEPS.map((step, idx) => {
        const isCompleted = !isVoid && idx < currentIdx;
        const isActive = !isVoid && idx === currentIdx;
        const isFuture = isVoid || idx > currentIdx;

        return (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              flex: idx < TIMELINE_STEPS.length - 1 ? 1 : undefined,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-1)" }}>
              {/* Dot */}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: isCompleted
                    ? "var(--color-success)"
                    : isActive
                      ? "var(--color-info)"
                      : "var(--color-surface-3)",
                  boxShadow: isActive
                    ? "0 0 0 3px color-mix(in srgb, var(--color-info) 25%, transparent)"
                    : undefined,
                }}
              />
              {/* Label */}
              <span
                style={{
                  fontSize: "var(--text-caption)",
                  fontWeight: isActive ? "var(--weight-semibold)" : "var(--weight-regular)",
                  color: isCompleted
                    ? "var(--color-success)"
                    : isActive
                      ? "var(--color-info)"
                      : "var(--color-text-3)",
                  whiteSpace: "nowrap",
                  textTransform: "capitalize",
                }}
              >
                {isOverdue && step === "sent" ? "Sent (overdue)" : step}
              </span>
            </div>

            {/* Connector line */}
            {idx < TIMELINE_STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: "0 var(--space-2)",
                  marginBottom: "var(--space-4)",
                  background: isCompleted || (isActive && idx < currentIdx)
                    ? "var(--color-success)"
                    : "var(--color-border)",
                  borderRadius: 1,
                }}
              />
            )}
          </div>
        );
      })}

      {/* Void indicator */}
      {isVoid && (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Badge tone="default">Void</Badge>
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function InvoiceDetailSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <Skeleton variant="text" width={200} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Skeleton variant="title" width={260} />
          <Skeleton variant="text" width={320} />
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Skeleton variant="text" width={110} height={36} />
          <Skeleton variant="text" width={120} height={36} />
        </div>
      </div>
      <Skeleton variant="card" height={72} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" height={80} />
        ))}
      </div>
      <Skeleton variant="card" height={200} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const { data: invoice, isLoading, error } = useInvoice(id);
  const [localStatus, setLocalStatus] = useState<InvoiceStatus | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <Link
          href="/invoices"
          style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-2)", textDecoration: "none", fontSize: "var(--text-body)", fontWeight: "var(--weight-medium)" }}
        >
          <ChevronLeft size={18} aria-hidden /> Invoices
        </Link>
        <InvoiceDetailSkeleton />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <Link
          href="/invoices"
          style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-2)", textDecoration: "none", fontSize: "var(--text-body)", fontWeight: "var(--weight-medium)" }}
        >
          <ChevronLeft size={18} aria-hidden /> Invoices
        </Link>
        <EmptyState
          icon={FileText}
          title="Invoice not found"
          description="This invoice does not exist or you do not have access."
          action={
            <Link href="/invoices">
              <Button variant="secondary" size="sm">Back to invoices</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const effectiveStatus: InvoiceStatus = localStatus ?? invoice.status;
  const symbol = CURRENCY_SYMBOL[invoice.currency];
  const canMarkPaid = effectiveStatus === "sent" || effectiveStatus === "overdue" || effectiveStatus === "viewed";
  const canVoid = effectiveStatus !== "paid" && effectiveStatus !== "void";

  function handleDownload() {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 1200);
  }

  function handleMarkPaid() {
    setLocalStatus("paid");
  }

  function handleVoid() {
    setLocalStatus("void");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Back link */}
      <Link
        href="/invoices"
        style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-2)", textDecoration: "none", fontSize: "var(--text-body)", fontWeight: "var(--weight-medium)" }}
      >
        <ChevronLeft size={18} aria-hidden /> Invoices
      </Link>

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
            <h1
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-display-lg)",
                fontWeight: "var(--weight-bold)",
                color: "var(--color-text-1)",
                lineHeight: 1.2,
              }}
            >
              {invoice.number}
            </h1>
            <Badge tone={statusTone(effectiveStatus)} dot={effectiveStatus === "viewed"} size="lg">
              {statusLabel(effectiveStatus)}
            </Badge>
            {invoice.ai_generated && (
              <Badge tone="primary">AI drafted</Badge>
            )}
          </div>
          <div
            style={{
              fontSize: "var(--text-body)",
              color: "var(--color-text-2)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/clients/${invoice.client_id}`}
              style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "var(--weight-medium)" }}
              className="hover-primary"
            >
              {invoice.client_name}
            </Link>
            {invoice.project_name && invoice.project_id && (
              <>
                <span style={{ color: "var(--color-text-3)" }}>·</span>
                <Link
                  href={`/projects/${invoice.project_id}`}
                  style={{ color: "var(--color-text-2)", textDecoration: "none" }}
                  className="hover-primary"
                >
                  {invoice.project_name}
                </Link>
              </>
            )}
            <span style={{ color: "var(--color-text-3)" }}>·</span>
            <span>Due {formatDate(invoice.due_date)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0, flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Download size={14} aria-hidden />}
            loading={isDownloading}
            onClick={handleDownload}
          >
            {isDownloading ? "Preparing..." : "Download PDF"}
          </Button>
          {canMarkPaid && (
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<CheckCircle size={14} aria-hidden />}
              onClick={handleMarkPaid}
            >
              Mark as paid
            </Button>
          )}
          {canVoid && (
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<Ban size={14} aria-hidden />}
              onClick={handleVoid}
            >
              Void
            </Button>
          )}
        </div>
      </div>

      {/* Status timeline */}
      <StatusTimeline currentStatus={effectiveStatus} />

      {/* Info grid */}
      <div
        className="invoice-info-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {[
          { label: "Issue date", value: formatDate(invoice.issue_date) },
          { label: "Due date", value: formatDate(invoice.due_date) },
          ...(invoice.paid_date ? [{ label: "Paid date", value: formatDate(invoice.paid_date) }] : []),
          { label: "Currency", value: `${invoice.currency} (${symbol})` },
          { label: "VAT rate", value: `${(invoice.tax_rate * 100).toFixed(0)}%` },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "var(--color-surface-0)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
            }}
          >
            <div
              style={{
                fontSize: "var(--text-caption)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "var(--space-1)",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: "var(--text-body)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-1)",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Line items table */}
      <DataTableWrapper>
        <Table>
          <THead>
            <TR>
              <TH style={{ minWidth: 280 }}>Description</TH>
              <TH numeric style={{ width: 80 }}>Days</TH>
              <TH numeric style={{ minWidth: 130 }}>Unit price</TH>
              <TH numeric style={{ minWidth: 130 }}>Amount</TH>
            </TR>
          </THead>
          <TBody>
            {invoice.line_items.length === 0 ? (
              <TR>
                <TD colSpan={4} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-text-3)", fontSize: "var(--text-body-sm)" }}>
                  No line items
                </TD>
              </TR>
            ) : (
              invoice.line_items.map((item) => (
                <TR key={item.id}>
                  <TD style={{ color: "var(--color-text-1)" }}>{item.description}</TD>
                  <TD numeric>
                    <span style={{ fontFamily: "var(--font-mono)", textAlign: "center", display: "block" }}>
                      {item.quantity}
                    </span>
                  </TD>
                  <TD numeric>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-2)" }}>
                      {symbol}{new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2 }).format(item.unit_price)}
                    </span>
                  </TD>
                  <TD numeric>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)" }}>
                      {symbol}{new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2 }).format(item.amount)}
                    </span>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </DataTableWrapper>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 280 }}>
          {/* Subtotal */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-8)" }}>
            <span style={{ fontSize: "var(--text-body)", color: "var(--color-text-2)" }}>Subtotal</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-body)", color: "var(--color-text-1)" }}>
              {formatAmount(invoice.subtotal, invoice.currency)}
            </span>
          </div>
          {/* Tax */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-8)" }}>
            <span style={{ fontSize: "var(--text-body)", color: "var(--color-text-2)" }}>
              VAT ({(invoice.tax_rate * 100).toFixed(0)}%)
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-body)", color: "var(--color-text-2)" }}>
              {formatAmount(invoice.tax_amount, invoice.currency)}
            </span>
          </div>
          {/* Total */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-8)",
              paddingTop: "var(--space-3)",
              borderTop: "2px solid var(--color-border)",
              marginTop: "var(--space-1)",
            }}
          >
            <span style={{ fontSize: "var(--text-heading-2)", fontWeight: "var(--weight-bold)", color: "var(--color-text-1)" }}>
              Total
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-heading-2)",
                fontWeight: "var(--weight-bold)",
                color: "var(--color-gold)",
              }}
            >
              {formatAmount(invoice.total, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* AI explanation */}
      {invoice.ai_generated && (
        <AIInsightCard
          title="AI drafted this invoice"
          summary="This invoice was prepared by the month-end close agent based on timesheet data for April 2026."
          evidence={[
            `${invoice.line_items[0]?.quantity ?? 0} billable days confirmed`,
            `Rate: ${symbol}${new Intl.NumberFormat("en-GB").format(invoice.line_items[0]?.unit_price ?? 0)}/day (${invoice.client_name} contract)`,
            `VAT applied at ${(invoice.tax_rate * 100).toFixed(0)}%`,
          ]}
        />
      )}

      {/* Notes */}
      {invoice.notes && (
        <div
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-5)",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-caption)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "var(--space-2)",
            }}
          >
            Notes
          </div>
          <p style={{ fontSize: "var(--text-body)", color: "var(--color-text-2)", lineHeight: 1.6 }}>
            {invoice.notes}
          </p>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .invoice-info-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 479px) {
          .invoice-info-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
