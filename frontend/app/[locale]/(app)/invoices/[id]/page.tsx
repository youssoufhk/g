"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  Download,
  CheckCircle,
  Ban,
} from "lucide-react";

import { EmptyState } from "@/components/patterns/empty-state";
import { DetailHeaderBar } from "@/components/patterns/detail-header-bar";
import { INVOICES } from "@/lib/mock-data";
import { AIInsightCard } from "@/components/patterns/ai-insight-card";
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
import { formatCurrency, currencySymbol, formatDate, formatNumber } from "@/lib/format";
import { useUndoableAction } from "@/lib/use-undoable-action";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: Invoice["currency"]): string {
  return formatCurrency(amount, currency, { fractionDigits: 2 });
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

// ── Status timeline ───────────────────────────────────────────────────────────

const TIMELINE_STEPS: InvoiceStatus[] = ["draft", "sent", "viewed", "paid"];

function StatusTimeline({ currentStatus }: { currentStatus: InvoiceStatus }) {
  const t = useTranslations("invoices");
  const isVoid = currentStatus === "void";
  const isOverdue = currentStatus === "overdue";

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
                }}
              >
                {isOverdue && step === "sent" ? t("detail_status_sent_overdue") : t(`status_${step}`)}
              </span>
            </div>

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

      {isVoid && (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Badge tone="default">{t("status_void")}</Badge>
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function InvoiceDetailSkeleton() {
  return (
    <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
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
  const t = useTranslations("invoices");
  const { data: invoice, isLoading, error } = useInvoice(id);
  const [localStatus, setLocalStatus] = useState<InvoiceStatus | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const siblings = useMemo(() => {
    const idx = INVOICES.findIndex((i) => i.id === id);
    if (idx === -1) return { idx: -1, total: INVOICES.length, prev: null, next: null };
    return {
      idx,
      total: INVOICES.length,
      prev: idx > 0 ? INVOICES[idx - 1]?.id ?? null : null,
      next: idx < INVOICES.length - 1 ? INVOICES[idx + 1]?.id ?? null : null,
    };
  }, [id]);

  const headerBar = (
    <DetailHeaderBar
      backHref="/invoices"
      backLabel={t("detail_back")}
      title={invoice?.number ?? ""}
      prevHref={siblings.prev ? `/invoices/${siblings.prev}` : null}
      nextHref={siblings.next ? `/invoices/${siblings.next}` : null}
      prevLabel={t("detail_prev")}
      nextLabel={t("detail_next")}
      position={siblings.idx >= 0 ? siblings.idx + 1 : null}
      total={siblings.total}
      positionLabel={(p, total) => t("detail_position", { position: p, total })}
    />
  );

  const runStatusChange = useUndoableAction<{ next: InvoiceStatus; prev: InvoiceStatus | null }>({
    apply: ({ next }) => setLocalStatus(next),
    revert: ({ prev }) => setLocalStatus(prev),
    successTitle: t("detail_toast_updated_title"),
    successDescription: t("detail_toast_updated_desc"),
  });

  if (isLoading) {
    return (
      <>
        <div className="app-aura" aria-hidden>
          <div className="app-aura-accent" />
        </div>
        <div
          aria-busy="true"
          aria-live="polite"
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}
        >
          {headerBar}
          <InvoiceDetailSkeleton />
        </div>
      </>
    );
  }

  if (error || !invoice) {
    return (
      <>
        <div className="app-aura" aria-hidden>
          <div className="app-aura-accent" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {headerBar}
          <EmptyState
            icon={FileText}
            title={t("detail_not_found_title")}
            description={t("detail_not_found_desc")}
            action={
              <Link href="/invoices">
                <Button variant="secondary" size="sm">{t("detail_back_to_invoices")}</Button>
              </Link>
            }
          />
        </div>
      </>
    );
  }

  const effectiveStatus: InvoiceStatus = localStatus ?? invoice.status;
  const symbol = currencySymbol(invoice.currency);
  const canMarkPaid = effectiveStatus === "sent" || effectiveStatus === "overdue" || effectiveStatus === "viewed";
  const canVoid = effectiveStatus !== "paid" && effectiveStatus !== "void";

  function handleDownload() {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 1200);
  }

  function handleMarkPaid() {
    runStatusChange({ next: "paid", prev: localStatus });
  }

  function handleVoid() {
    runStatusChange({ next: "void", prev: localStatus });
  }

  const vatRatePercent = Math.round(invoice.tax_rate * 100);

  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {headerBar}

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
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {invoice.number}
              </h1>
              <Badge tone={statusTone(effectiveStatus)} dot={effectiveStatus === "viewed"} size="lg">
                {t(`status_${effectiveStatus}`)}
              </Badge>
              {invoice.ai_generated && (
                <Badge tone="primary">{t("ai_drafted")}</Badge>
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
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {t("due_label", { date: formatDate(invoice.due_date) })}
              </span>
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
              {isDownloading ? t("detail_preparing") : t("action_download")}
            </Button>
            {canMarkPaid && (
              <Button
                variant="primary"
                size="sm"
                leadingIcon={<CheckCircle size={14} aria-hidden />}
                onClick={handleMarkPaid}
              >
                {t("action_mark_paid")}
              </Button>
            )}
            {canVoid && (
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={<Ban size={14} aria-hidden />}
                onClick={handleVoid}
              >
                {t("action_void")}
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
            { label: t("detail_issue_date"), value: formatDate(invoice.issue_date) },
            { label: t("detail_due_date"), value: formatDate(invoice.due_date) },
            ...(invoice.paid_date ? [{ label: t("detail_paid_date"), value: formatDate(invoice.paid_date) }] : []),
            { label: t("detail_currency"), value: `${invoice.currency} (${symbol})` },
            { label: t("detail_vat_rate"), value: `${vatRatePercent}%` },
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
                  fontVariantNumeric: "tabular-nums",
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
                <TH style={{ minWidth: 280 }}>{t("detail_col_description")}</TH>
                <TH numeric style={{ width: 80 }}>{t("detail_col_days")}</TH>
                <TH numeric style={{ minWidth: 130 }}>{t("detail_col_unit_price")}</TH>
                <TH numeric style={{ minWidth: 130 }}>{t("detail_col_amount")}</TH>
              </TR>
            </THead>
            <TBody>
              {invoice.line_items.length === 0 ? (
                <TR>
                  <TD colSpan={4} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-text-3)", fontSize: "var(--text-body-sm)" }}>
                    {t("detail_no_line_items")}
                  </TD>
                </TR>
              ) : (
                invoice.line_items.map((item) => (
                  <TR key={item.id}>
                    <TD style={{ color: "var(--color-text-1)" }}>{item.description}</TD>
                    <TD numeric>
                      <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", textAlign: "center", display: "block" }}>
                        {item.quantity}
                      </span>
                    </TD>
                    <TD numeric>
                      <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--color-text-2)" }}>
                        {formatAmount(item.unit_price, invoice.currency)}
                      </span>
                    </TD>
                    <TD numeric>
                      <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)" }}>
                        {formatAmount(item.amount, invoice.currency)}
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-8)" }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--color-text-2)" }}>{t("detail_subtotal")}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", fontSize: "var(--text-body)", color: "var(--color-text-1)" }}>
                {formatAmount(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-8)" }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--color-text-2)" }}>
                {t("detail_vat_line", { rate: vatRatePercent })}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", fontSize: "var(--text-body)", color: "var(--color-text-2)" }}>
                {formatAmount(invoice.tax_amount, invoice.currency)}
              </span>
            </div>
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
                {t("detail_total")}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontVariantNumeric: "tabular-nums",
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
            title={t("detail_ai_title")}
            summary={t("detail_ai_summary")}
            evidence={[
              t("detail_ai_evidence_days", { count: invoice.line_items[0]?.quantity ?? 0 }),
              t("detail_ai_evidence_rate", {
                rate: `${symbol}${formatNumber(invoice.line_items[0]?.unit_price ?? 0)}`,
                client: invoice.client_name,
              }),
              t("detail_ai_evidence_vat", { rate: vatRatePercent }),
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
              {t("detail_notes")}
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
    </>
  );
}
