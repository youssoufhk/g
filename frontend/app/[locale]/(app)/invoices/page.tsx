"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  FileText,
  MoreHorizontal,
  Download,
  CheckCircle,
  Ban,
  Send,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { ResourcesFilterBar, type FilterGroup } from "@/components/patterns/resources-filter-bar";
import { EmptyState } from "@/components/patterns/empty-state";
import { AiRecommendations, type AiRecommendation } from "@/components/patterns/ai-recommendations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { useInvoices } from "@/features/invoices/use-invoices";
import { InvoicesKpis } from "@/features/invoices/invoices-kpis";
import { useUrlListState } from "@/hooks/use-url-list-state";
import type { Invoice, InvoiceStatus } from "@/features/invoices/types";
import { formatCurrency, formatCurrencyCompact, formatDate } from "@/lib/format";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: Invoice["currency"]): string {
  if (amount === 0) return "-";
  return formatCurrency(amount, currency, { fractionDigits: 0 });
}

function formatBigAmount(amount: number, currency: Invoice["currency"]): string {
  return formatCurrencyCompact(amount, currency);
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

const STATUS_KEYS = ["draft", "sent", "viewed", "paid", "overdue", "void"] as const;
const CLIENT_OPTIONS_STATIC = [
  { value: "c1", label: "HSBC UK" },
  { value: "c2", label: "BNP Paribas" },
  { value: "c3", label: "TotalEnergies" },
  { value: "c4", label: "Renault" },
];
const CLIENT_NAMES: Record<string, string> = {
  c1: "HSBC UK",
  c2: "BNP Paribas",
  c3: "TotalEnergies",
  c4: "Renault",
};

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
  const t = useTranslations("invoices");
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
          {t("due_label", { date: formatDate(invoice.due_date) })}
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
          {t(`status_${invoice.status}`)}
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
  const t = useTranslations("invoices");
  const [form, setForm] = useState<NewInvoiceFormState>({
    client_id: "c1",
    project_id: "p1",
    currency: "GBP",
    issue_date: "",
    due_date: "",
    amount: "",
  });

  const PROJECT_OPTIONS = [
    { value: "p1", label: "HSBC Digital Transformation" },
    { value: "p2", label: "BNP Risk Model" },
    { value: "p3", label: "TotalEnergies ESG Strategy" },
    { value: "p4", label: "Renault Lean Analytics" },
  ];
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
      title={t("modal_title")}
      description={t("modal_description")}
      size="md"
      footer={
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="md" onClick={onClose}>{t("modal_cancel")}</Button>
          <Button variant="primary" size="md" onClick={handleSave}>{t("modal_create")}</Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>{t("modal_client")}</label>
          <Select value={form.client_id} onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}>
            {CLIENT_OPTIONS_STATIC.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>{t("modal_project")}</label>
          <Select value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}>
            <option value="">{t("modal_no_project")}</option>
            {PROJECT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
            <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>{t("modal_amount")}</label>
            <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", width: 100 }}>
            <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>{t("modal_currency")}</label>
            <Select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as Invoice["currency"] }))}>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </Select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
            <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>{t("modal_issue_date")}</label>
            <Input type="date" value={form.issue_date} onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
            <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>{t("modal_due_date")}</label>
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
  const t = useTranslations("invoices");
  const router = useRouter();
  const canMarkPaid = invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "viewed";
  const canSend = invoice.status === "draft";
  const canVoid = invoice.status !== "paid" && invoice.status !== "void";

  return (
    <Dropdown
      align="right"
      trigger={({ toggle }) => (
        <Button variant="ghost" size="xs" iconOnly aria-label={t("actions_for", { number: invoice.number })} onClick={toggle}>
          <MoreHorizontal size={16} aria-hidden />
        </Button>
      )}
    >
      <DropdownItem
        icon={<FileText size={14} aria-hidden />}
        onClick={() => router.push(`/invoices/${invoice.id}`)}
      >
        {t("action_view")}
      </DropdownItem>
      <DropdownItem
        icon={<Download size={14} aria-hidden />}
        onClick={() => onDownload(invoice.id)}
      >
        {t("action_download")}
      </DropdownItem>
      {canSend && (
        <>
          <DropdownDivider />
          <DropdownItem
            icon={<Send size={14} aria-hidden />}
            onClick={() => onStatusChange(invoice.id, "sent")}
          >
            {t("action_send")}
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
            {t("action_mark_paid")}
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
            {t("action_void")}
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type MultiKey = "status" | "client";

export default function InvoicesPage() {
  const t = useTranslations("invoices");
  const url = useUrlListState<MultiKey>({ multiKeys: ["status", "client"] });
  const search = url.search;
  const statusSel = url.multi.status;
  const clientSel = url.multi.client;

  const [showNewModal, setShowNewModal] = useState(false);
  const [localOverrides, setLocalOverrides] = useState<Record<string, InvoiceStatus>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [localNew, setLocalNew] = useState<Invoice[]>([]);

  const { data, isLoading, error } = useInvoices({
    search: search || undefined,
    status: statusSel.length === 1 ? (statusSel[0] as InvoiceStatus) : undefined,
    client_id: clientSel.length === 1 ? clientSel[0] : undefined,
  });

  const rawInvoices = data?.items ?? [];
  const applyOverride = (inv: Invoice): Invoice =>
    inv.id in localOverrides ? { ...inv, status: localOverrides[inv.id] as InvoiceStatus } : inv;

  const matchesMulti = (inv: Invoice): boolean => {
    if (statusSel.length > 0 && !statusSel.includes(inv.status)) return false;
    if (clientSel.length > 0 && !clientSel.includes(inv.client_id)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!inv.number.toLowerCase().includes(q) && !inv.client_name.toLowerCase().includes(q)) return false;
    }
    return true;
  };

  const filteredLocalNew = localNew.map(applyOverride).filter(matchesMulti);
  const remoteFiltered = rawInvoices.map(applyOverride).filter(matchesMulti);
  const invoices = [...filteredLocalNew, ...remoteFiltered];
  const total = invoices.length;

  const { data: allData } = useInvoices({});
  const allInvoicesRaw = allData?.items ?? [];
  const allInvoices = [...localNew, ...allInvoicesRaw].map(applyOverride);

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

  const overdueList = allInvoices.filter((inv) => inv.status === "overdue");
  const overdueAmount = overdueList.reduce((acc, inv) => acc + inv.total, 0);
  const overdueCount = overdueList.length;
  const paidYTD = allInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, inv) => acc + inv.total, 0);
  const draftsCount = allInvoices.filter((inv) => inv.status === "draft").length;
  const fmtCurrency = (n: number) => formatBigAmount(n, "GBP");

  const activeKpi: string | undefined =
    statusSel.length === 1
      ? statusSel[0] === "draft"
        ? "draft"
        : statusSel[0] === "paid"
        ? "paid"
        : statusSel[0] === "overdue"
        ? "overdue"
        : undefined
      : undefined;

  function selectKpi(target: string) {
    url.setMulti("status", activeKpi === target ? [] : [target]);
  }

  const recommendations: AiRecommendation[] = [
    ...(overdueCount > 0
      ? [
          {
            id: "rec-overdue",
            icon: AlertTriangle,
            tone: "gold" as const,
            title: t("rec_overdue_title"),
            detail: t("rec_overdue_detail"),
            applyLabel: t("rec_review"),
            onApply: () => url.setMulti("status", ["overdue"]),
          },
        ]
      : []),
    ...(draftsCount > 0
      ? [
          {
            id: "rec-drafts",
            icon: Send,
            tone: "primary" as const,
            title: t("rec_drafts_title"),
            detail: t("rec_drafts_detail"),
            applyLabel: t("rec_review"),
            onApply: () => url.setMulti("status", ["draft"]),
          },
        ]
      : []),
    {
      id: "rec-collect",
      icon: Sparkles,
      tone: "accent",
      title: t("rec_collect_title"),
      detail: t("rec_collect_detail"),
    },
  ];

  const filterGroups: FilterGroup[] = [
    {
      key: "status",
      label: t("filter_status"),
      options: STATUS_KEYS.map((key) => ({ value: key, label: t(`status_${key}`) })),
      selected: statusSel,
      onChange: (v) => url.setMulti("status", v),
      searchPlaceholder: t("search_status"),
    },
    {
      key: "client",
      label: t("filter_client"),
      options: CLIENT_OPTIONS_STATIC,
      selected: clientSel,
      onChange: (v) => url.setMulti("client", v),
      searchPlaceholder: t("search_client"),
    },
  ];

  const hasFilters = !!search || statusSel.length > 0 || clientSel.length > 0;

  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>

      <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
        <PageHeader
          title={t("page_title")}
          count={total}
          actions={
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={16} aria-hidden />}
              onClick={() => setShowNewModal(true)}
            >
              {t("new_invoice")}
            </Button>
          }
        />

        <AiRecommendations
          items={recommendations}
          title={t("ai_recs_title")}
          overline={t("ai_recs_overline")}
        />

        <InvoicesKpis
          overdueAmount={fmtCurrency(overdueAmount)}
          overdueCount={overdueCount}
          paidYtd={fmtCurrency(paidYTD)}
          draftsCount={draftsCount}
          activeStatus={activeKpi}
          onSelectOverdue={() => selectKpi("overdue")}
          onSelectPaid={() => selectKpi("paid")}
          onSelectDrafts={() => selectKpi("draft")}
        />

        <ResourcesFilterBar
          search={search}
          onSearchChange={url.setSearch}
          searchPlaceholder={t("search_placeholder")}
          groups={filterGroups}
          onClearAll={url.clearAll}
          resultCount={total}
          resultLabel={total === 1 ? t("result_invoice") : t("result_invoices")}
        />

        {downloadingId && (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: "var(--space-2) var(--space-4)",
              background: "var(--color-info-muted)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-info)",
              fontSize: "var(--text-body-sm)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Download size={14} aria-hidden />
            {t("preparing_pdf")}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              padding: "var(--space-4)",
              background: "var(--color-error-muted)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-error)",
              fontSize: "var(--text-body-sm)",
            }}
          >
            {t("load_error")} {(error as Error).message}
          </div>
        )}

        {!error && (
          <div
            aria-busy={isLoading}
            aria-live="polite"
            className="data-table-wrapper"
            style={{ maxHeight: "calc(12 * 48px + 56px)", overflow: "auto" }}
          >
            <table className="data-table">
                <THead>
                  <TR>
                    <TH style={{ width: 40 }} />
                    <TH style={{ minWidth: 150 }}>{t("col_invoice")}</TH>
                    <TH style={{ minWidth: 120 }}>{t("col_client")}</TH>
                    <TH style={{ minWidth: 160 }}>{t("col_project")}</TH>
                    <TH style={{ minWidth: 110 }}>{t("col_issue_date")}</TH>
                    <TH style={{ minWidth: 110 }}>{t("col_due_date")}</TH>
                    <TH numeric sorted sortDirection="desc" style={{ minWidth: 130 }}>{t("col_amount")}</TH>
                    <TH style={{ minWidth: 90 }}>{t("col_status")}</TH>
                    <TH style={{ width: 44 }} aria-label={t("col_actions_aria")} />
                  </TR>
                </THead>
                <TBody>
                  {isLoading && <SkeletonRows />}

                  {!isLoading && invoices.length === 0 && (
                    <TR>
                      <TD colSpan={9} style={{ textAlign: "center", padding: "var(--space-16) var(--space-6)" }}>
                        <EmptyState
                          icon={FileText}
                          title={hasFilters ? t("empty_filtered_title") : t("empty_title")}
                          description={hasFilters ? t("empty_filtered_desc") : t("empty_desc")}
                          action={
                            hasFilters ? (
                              <Button variant="secondary" size="sm" onClick={() => url.clearAll()}>
                                {t("empty_clear")}
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                leadingIcon={<Plus size={14} aria-hidden />}
                                onClick={() => setShowNewModal(true)}
                              >
                                {t("new_invoice")}
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
                              title={t("ai_drafted")}
                              aria-label={t("ai_drafted")}
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
                              <Sparkles size={12} aria-hidden />
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
                          {invoice.project_name && invoice.project_id ? (
                            <Link
                              href={`/projects/${invoice.project_id}`}
                              style={{ color: "var(--color-text-2)", textDecoration: "none" }}
                              className="hover-primary"
                            >
                              {invoice.project_name}
                            </Link>
                          ) : (
                            <span style={{ color: "var(--color-text-3)" }}>{t("no_project")}</span>
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
                            {t(`status_${invoice.status}`)}
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
            </table>
          </div>
        )}

        {!error && !isLoading && invoices.length > 0 && (
          <div className="md:hidden">
            {invoices.map((invoice) => (
              <InvoiceMobileCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}

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
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>{t("summary_invoices", { total })}</span>
            <span>{t("summary_paid", { count: invoices.filter((i) => i.status === "paid").length })}</span>
            {invoices.filter((i) => i.status === "overdue").length > 0 && (
              <span style={{ color: "var(--color-error)" }}>
                {t("summary_overdue", { count: invoices.filter((i) => i.status === "overdue").length })}
              </span>
            )}
          </div>
        )}
      </div>

      <NewInvoiceModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={handleNewInvoiceSave}
      />
    </>
  );
}
