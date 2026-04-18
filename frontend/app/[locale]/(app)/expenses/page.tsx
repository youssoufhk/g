"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Plane,
  UtensilsCrossed,
  Hotel,
  Monitor,
  Laptop,
  GraduationCap,
  Receipt,
  Paperclip,
  AlertCircle,
  UploadCloud,
  Sparkles,
  Send,
  MoreHorizontal,
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
import { Toggle } from "@/components/ui/toggle";
import { Drawer } from "@/components/ui/drawer";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import {
  TimelineWindowSelector,
  weeksFor,
  type WindowPresetValue,
} from "@/components/patterns/timeline-window-selector";
import { useExpenses } from "@/features/expenses/use-expenses";
import { ExpensesKpis } from "@/features/expenses/expenses-kpis";
import { useUrlListState } from "@/hooks/use-url-list-state";

import type {
  Expense,
  ExpenseCategory,
  ExpenseStatus,
} from "@/features/expenses/types";
import { formatCurrency, formatCurrencyCompact, formatDate } from "@/lib/format";
import { useUndoableAction } from "@/lib/use-undoable-action";

const CURRENT_USER_ID = "e1";

const fmtBigEur = (n: number) => formatCurrencyCompact(n, "EUR");

// ── category icon map ──────────────────────────────────────────────────────

const CATEGORY_ICON: Record<ExpenseCategory, React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  travel: Plane,
  meals: UtensilsCrossed,
  accommodation: Hotel,
  equipment: Monitor,
  software: Laptop,
  training: GraduationCap,
  other: Receipt,
};

// ── status badge ───────────────────────────────────────────────────────────

type BadgeTone = "default" | "primary" | "success" | "warning" | "error" | "info" | "accent" | "gold" | "ghost" | "ghost-primary" | "neutral";

function statusTone(status: ExpenseStatus): BadgeTone {
  switch (status) {
    case "draft": return "default";
    case "submitted": return "info";
    case "approved": return "success";
    case "rejected": return "error";
    case "reimbursed": return "success";
  }
}

// ── expense item ───────────────────────────────────────────────────────────

function ExpenseItem({
  expense,
  onStatusChange,
  onDelete,
  t,
}: {
  expense: Expense;
  onStatusChange?: (id: string, status: ExpenseStatus) => void;
  onDelete?: (id: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const Icon = CATEGORY_ICON[expense.category];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          padding: "var(--space-4)",
          background: "var(--color-surface-0)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          cursor: "default",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border-strong)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {/* Category icon */}
        <div
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-2)",
          }}
        >
          <Icon size={20} aria-hidden />
        </div>

        {/* Description + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: "var(--weight-semibold)",
              fontSize: "var(--text-body-sm)",
              color: "var(--color-text-1)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {expense.description}
          </div>
          <div
            style={{
              marginTop: "var(--space-0-5)",
              fontSize: "var(--text-caption)",
              color: "var(--color-text-2)",
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-1)",
              alignItems: "center",
            }}
          >
            <span>{formatDate(expense.expense_date)}</span>
            {expense.project_id && expense.project_name && (
              <>
                <span style={{ color: "var(--color-text-3)" }}>·</span>
                <Link
                  href={`/projects/${expense.project_id}`}
                  style={{ color: "var(--color-primary)", textDecoration: "none" }}
                >
                  {expense.project_name}
                </Link>
              </>
            )}
            {expense.client_name && (
              <>
                <span style={{ color: "var(--color-text-3)" }}>·</span>
                <span>{expense.client_name}</span>
              </>
            )}
            <span style={{ color: "var(--color-text-3)" }}>·</span>
            <Link
              href={`/employees/${expense.employee_id}`}
              style={{ color: "var(--color-text-2)", textDecoration: "none" }}
            >
              {expense.employee_name}
            </Link>
          </div>
        </div>

        {/* Amount */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: "var(--weight-bold)",
            fontSize: "var(--text-body)",
            color: "var(--color-text-1)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {formatCurrency(expense.amount, expense.currency)}
        </div>

        {/* Right side: billable + receipt + status + actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            flexShrink: 0,
          }}
        >
          {/* Billable tag */}
          <span
            style={{
              fontSize: "var(--text-caption)",
              fontWeight: "var(--weight-medium)",
              padding: "2px var(--space-2)",
              borderRadius: "var(--radius-full)",
              background: expense.billable ? "var(--color-primary-muted)" : "var(--color-surface-2)",
              color: expense.billable ? "var(--color-primary)" : "var(--color-text-3)",
              whiteSpace: "nowrap",
            }}
          >
            {expense.billable ? t("billable") : t("internal")}
          </span>

          {/* Receipt indicator */}
          {expense.receipt_url && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
                fontSize: "var(--text-caption)",
                color: "var(--color-text-2)",
                whiteSpace: "nowrap",
              }}
            >
              <Paperclip size={12} aria-hidden />
              {t("receipt")}
            </span>
          )}

          {/* Status badge */}
          <Badge
            tone={statusTone(expense.status)}
            dot={expense.status === "submitted"}
          >
            {t(`status_${expense.status}`)}
          </Badge>

          {/* Actions dropdown */}
          <Dropdown
            align="right"
            trigger={({ toggle }) => (
              <Button variant="ghost" size="sm" onClick={toggle} aria-label={t("actions_aria")}>
                <MoreHorizontal size={16} aria-hidden />
              </Button>
            )}
          >
            <DropdownItem onClick={() => onStatusChange?.(expense.id, expense.status)}>
              {t("action_view_details")}
            </DropdownItem>
            {(expense.status === "draft" || expense.status === "submitted") && (
              <DropdownItem onClick={() => onStatusChange?.(expense.id, "submitted")}>
                {expense.status === "draft" ? t("action_submit") : t("action_edit")}
              </DropdownItem>
            )}
            {expense.status === "rejected" && (
              <DropdownItem onClick={() => onStatusChange?.(expense.id, "submitted")}>
                {t("action_resubmit")}
              </DropdownItem>
            )}
            {expense.status === "submitted" && (
              <>
                <DropdownDivider />
                <DropdownItem onClick={() => onStatusChange?.(expense.id, "approved")}>
                  {t("action_approve")}
                </DropdownItem>
                <DropdownItem
                  destructive
                  onClick={() => onStatusChange?.(expense.id, "rejected")}
                >
                  {t("action_reject")}
                </DropdownItem>
              </>
            )}
            {expense.status === "draft" && (
              <>
                <DropdownDivider />
                <DropdownItem destructive onClick={() => onDelete?.(expense.id)}>
                  {t("action_delete")}
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Rejection reason alert */}
      {expense.status === "rejected" && expense.rejection_reason && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-3)",
            background: "var(--color-error-muted)",
            color: "var(--color-error)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-caption)",
            marginLeft: "calc(44px + var(--space-4) + var(--space-4))",
          }}
        >
          <AlertCircle size={14} aria-hidden />
          <span>{expense.rejection_reason}</span>
        </div>
      )}
    </div>
  );
}

// ── loading skeleton ────────────────────────────────────────────────────────

function ExpenseListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {[...Array(3)].map((_, i) => (
        <Skeleton
          key={i}
          variant="card"
          style={{ height: 72, borderRadius: "var(--radius-lg)" }}
        />
      ))}
    </div>
  );
}

// ── category bar chart ──────────────────────────────────────────────────────

function CategoryBars({
  data,
  max,
  t,
}: {
  data: { category: ExpenseCategory; amount: number }[];
  max: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const total = data.reduce((s, d) => s + d.amount, 0);
  if (total === 0) return null;
  return (
    <div
      style={{
        background: "var(--color-surface-0)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4) var(--space-5)",
      }}
      aria-label={t("chart_aria")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-3)" }}>
        <span style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)" }}>
          {t("chart_title")}
        </span>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", fontVariantNumeric: "tabular-nums" }}>
          {fmtBigEur(total)}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {data.map((d) => {
          const pct = max > 0 ? (d.amount / max) * 100 : 0;
          return (
            <div key={d.category} style={{ display: "grid", gridTemplateColumns: "112px 1fr 64px", alignItems: "center", gap: "var(--space-3)" }}>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-2)" }}>
                {t(`category_${d.category}`)}
              </span>
              <div style={{ height: 10, background: "var(--color-surface-2)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: "var(--color-primary)",
                    borderRadius: "var(--radius-full)",
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-2)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {fmtBigEur(d.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── my expenses tab ─────────────────────────────────────────────────────────

type ExpenseMultiKey = "status" | "category";

const STATUS_KEYS: ExpenseStatus[] = ["draft", "submitted", "approved", "rejected", "reimbursed"];
const CATEGORY_KEYS: ExpenseCategory[] = [
  "travel",
  "meals",
  "accommodation",
  "equipment",
  "software",
  "training",
  "other",
];

function MyExpensesTab({ localNew }: { localNew: Expense[] }) {
  const t = useTranslations("expenses");
  const url = useUrlListState<ExpenseMultiKey, WindowPresetValue>({
    multiKeys: ["status", "category"],
    windowKey: "window",
    windowDefault: "3m",
  });
  const search = url.search;
  const statusSel = url.multi.status;
  const categorySel = url.multi.category;
  const windowValue: WindowPresetValue = url.windowValue || "3m";
  const windowWeeks = weeksFor(windowValue);

  const [localStatuses, setLocalStatuses] = useState<Record<string, ExpenseStatus>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const { data: rawAll, isLoading, error } = useExpenses({});

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowWeeks * 7);

  const applyLocal = (items: Expense[] | undefined): Expense[] => {
    if (!items) return [];
    return items
      .filter((e) => !deletedIds.has(e.id))
      .filter((e) => e.employee_id === CURRENT_USER_ID)
      .filter((e) => new Date(e.expense_date) >= cutoff)
      .map((e) => (e.id in localStatuses ? { ...e, status: localStatuses[e.id] as ExpenseStatus } : e));
  };

  const allExpenses = applyLocal([...localNew, ...(rawAll ?? [])]);

  const matchesFilters = (e: Expense): boolean => {
    if (statusSel.length > 0 && !statusSel.includes(e.status)) return false;
    if (categorySel.length > 0 && !categorySel.includes(e.category)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !e.description.toLowerCase().includes(q) &&
        !(e.client_name ?? "").toLowerCase().includes(q) &&
        !(e.project_name ?? "").toLowerCase().includes(q) &&
        !e.employee_name.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  };

  const expenses = allExpenses.filter(matchesFilters);
  const total = expenses.length;

  const runStatusChange = useUndoableAction<{ id: string; next: ExpenseStatus; prev: ExpenseStatus }>({
    apply: ({ id, next }) => setLocalStatuses((prev) => ({ ...prev, [id]: next })),
    revert: ({ id, prev: prevStatus }) =>
      setLocalStatuses((prev) => {
        const out = { ...prev };
        if (prevStatus) out[id] = prevStatus;
        else delete out[id];
        return out;
      }),
    successTitle: t("toast_updated_title"),
    successDescription: t("toast_undo_body"),
  });
  const runDelete = useUndoableAction<string>({
    apply: (id) => setDeletedIds((prev) => new Set([...prev, id])),
    revert: (id) => setDeletedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    }),
    successTitle: t("toast_deleted_title"),
    successDescription: t("toast_undo_body"),
    tone: "warning",
  });
  function handleStatusChange(id: string, status: ExpenseStatus) {
    const current = allExpenses.find((e) => e.id === id);
    runStatusChange({ id, next: status, prev: current?.status ?? "draft" });
  }
  function handleDelete(id: string) {
    runDelete(id);
  }

  const pendingList = allExpenses.filter((e) => e.status === "submitted" || e.status === "draft");
  const approvedList = allExpenses.filter((e) => e.status === "approved");
  const reimbursedList = allExpenses.filter((e) => e.status === "reimbursed");
  const pendingAmount = pendingList.reduce((s, e) => s + e.amount, 0);
  const approvedAmount = approvedList.reduce((s, e) => s + e.amount, 0);
  const reimbursedAmount = reimbursedList.reduce((s, e) => s + e.amount, 0);
  const fmt = fmtBigEur;

  const matchesFiltersForChart = (e: Expense): boolean => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !e.description.toLowerCase().includes(q) &&
        !(e.client_name ?? "").toLowerCase().includes(q) &&
        !(e.project_name ?? "").toLowerCase().includes(q)
      ) return false;
    }
    return true;
  };

  const chartByCategory = CATEGORY_KEYS.map((cat) => {
    const sum = allExpenses
      .filter(matchesFiltersForChart)
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0);
    return { category: cat, amount: sum };
  });
  const chartMax = Math.max(1, ...chartByCategory.map((c) => c.amount));

  const activeKpi: string | undefined = (() => {
    if (statusSel.length === 1) {
      const s = statusSel[0];
      if (s === "approved") return "approved";
      if (s === "reimbursed") return "reimbursed";
    }
    if (
      statusSel.length === 2 &&
      statusSel.includes("draft") &&
      statusSel.includes("submitted")
    ) return "pending";
    return undefined;
  })();

  function selectKpi(target: string) {
    if (activeKpi === target) {
      url.setMulti("status", []);
      return;
    }
    if (target === "pending") url.setMulti("status", ["draft", "submitted"]);
    else if (target === "approved") url.setMulti("status", ["approved"]);
    else if (target === "reimbursed") url.setMulti("status", ["reimbursed"]);
  }

  const recommendations: AiRecommendation[] = [
    ...(pendingList.length > 0
      ? [
          {
            id: "rec-pending",
            icon: Send,
            tone: "gold" as const,
            title: t("rec_pending_title"),
            detail: t("rec_pending_detail", { count: pendingList.length }),
            applyLabel: t("rec_review"),
            onApply: () => url.setMulti("status", ["draft", "submitted"]),
          },
        ]
      : []),
    {
      id: "rec-receipts",
      icon: Sparkles,
      tone: "accent" as const,
      title: t("rec_receipts_title"),
      detail: t("rec_receipts_detail"),
    },
  ];

  const filterGroups: FilterGroup[] = [
    {
      key: "status",
      label: t("filter_status"),
      options: STATUS_KEYS.map((k) => ({ value: k, label: t(`status_${k}`) })),
      selected: statusSel,
      onChange: (v) => url.setMulti("status", v),
      searchPlaceholder: t("search_status"),
    },
    {
      key: "category",
      label: t("filter_category"),
      options: CATEGORY_KEYS.map((k) => ({ value: k, label: t(`category_${k}`) })),
      selected: categorySel,
      onChange: (v) => url.setMulti("category", v),
      searchPlaceholder: t("search_category"),
    },
  ];

  const hasFilters = !!search || statusSel.length > 0 || categorySel.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <AiRecommendations
        items={recommendations}
        title={t("ai_recs_title")}
        overline={t("ai_recs_overline")}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-2)" }}>
          {t("scope_me")}
        </span>
        <TimelineWindowSelector
          value={windowValue}
          onChange={url.setWindow}
          label={t("window_label")}
        />
      </div>

      <CategoryBars data={chartByCategory} max={chartMax} t={t} />

      <ExpensesKpis
        pendingAmount={fmt(pendingAmount)}
        pendingCount={pendingList.length}
        approvedAmount={fmt(approvedAmount)}
        reimbursedAmount={fmt(reimbursedAmount)}
        activeStatus={activeKpi}
        onSelectPending={() => selectKpi("pending")}
        onSelectApproved={() => selectKpi("approved")}
        onSelectReimbursed={() => selectKpi("reimbursed")}
      />

      <ResourcesFilterBar
        search={search}
        onSearchChange={url.setSearch}
        searchPlaceholder={t("search_placeholder")}
        groups={filterGroups}
        onClearAll={url.clearAll}
        resultCount={total}
        resultLabel={total === 1 ? t("result_expense") : t("result_expenses")}
      />

      {error && (
        <div role="alert" style={{ padding: "var(--space-4)", background: "var(--color-error-muted)", borderRadius: "var(--radius-md)", color: "var(--color-error)", fontSize: "var(--text-body-sm)" }}>
          {t("load_error")} {(error as Error).message}
        </div>
      )}

      {!error && (
        <div
          aria-busy={isLoading}
          aria-live="polite"
          style={{
            maxHeight: "calc(10 * 88px)",
            overflowY: "auto",
            padding: "var(--space-1)",
          }}
        >
          {isLoading ? (
            <ExpenseListSkeleton />
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={hasFilters ? t("empty_filtered_title") : t("empty_title")}
              description={hasFilters ? t("empty_filtered_desc") : t("empty_desc")}
              action={
                hasFilters ? (
                  <Button variant="secondary" size="sm" onClick={() => url.clearAll()}>
                    {t("empty_clear")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {expenses.map((e) => (
                <ExpenseItem
                  key={e.id}
                  expense={e}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── submit new tab ──────────────────────────────────────────────────────────

type SubmitFormState = {
  description: string;
  amount: string;
  currency: "EUR" | "GBP" | "USD";
  expense_date: string;
  category: ExpenseCategory | "";
  project_id: string;
  billable: boolean;
};

function SubmitExpenseForm({ onSubmitted }: { onSubmitted?: (e: Expense) => void }) {
  const t = useTranslations("expenses");
  const [form, setForm] = useState<SubmitFormState>({
    description: "",
    amount: "",
    currency: "EUR",
    expense_date: "",
    category: "",
    project_id: "",
    billable: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);

  const PROJECT_OPTIONS = [
    { value: "", label: t("project_none") },
    { value: "p1", label: "HSBC Digital Transformation" },
    { value: "p2", label: "BNP Risk Model" },
    { value: "p3", label: "TotalEnergies ESG Strategy" },
    { value: "p4", label: "Renault Lean Analytics" },
  ];

  const CATEGORY_OPTIONS: { value: "" | ExpenseCategory; label: string }[] = [
    { value: "", label: t("category_placeholder") },
    { value: "travel", label: t("category_travel") },
    { value: "meals", label: t("category_meals") },
    { value: "accommodation", label: t("category_accommodation") },
    { value: "equipment", label: t("category_equipment") },
    { value: "software", label: t("category_software") },
    { value: "training", label: t("category_training") },
    { value: "other", label: t("category_other") },
  ];

  function handleOcrUpload() {
    setIsOcrProcessing(true);
    setTimeout(() => {
      setForm((f) => ({
        ...f,
        description: t("ocr_sample_description"),
        amount: "142.50",
        currency: "EUR",
        expense_date: "2026-04-15",
        category: "meals",
        billable: true,
      }));
      setIsOcrProcessing(false);
    }, 1800);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || submitted) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      const PROJECT_NAMES: Record<string, string> = {
        p1: "HSBC Digital Transformation",
        p2: "BNP Risk Model",
        p3: "TotalEnergies ESG Strategy",
        p4: "Renault Lean Analytics",
      };
      const newExpense: Expense = {
        id: `exp-new-${Date.now()}`,
        employee_id: CURRENT_USER_ID,
        employee_name: "Youssouf Kerzika",
        project_id: form.project_id || undefined,
        project_name: form.project_id ? PROJECT_NAMES[form.project_id] : undefined,
        category: (form.category || "other") as ExpenseCategory,
        description: form.description || t("no_description"),
        amount: parseFloat(form.amount) || 0,
        currency: form.currency,
        expense_date: form.expense_date || new Date().toISOString().slice(0, 10),
        status: "submitted",
        billable: form.billable,
      };
      setForm({
        description: "",
        amount: "",
        currency: "EUR",
        expense_date: "",
        category: "",
        project_id: "",
        billable: false,
      });
      if (onSubmitted) setTimeout(() => onSubmitted(newExpense), 600);
    }, 800);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "var(--space-6)",
        alignItems: "start",
      }}
    >
      {/* LEFT: upload zone */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div
          style={{
            border: `2px dashed ${isOcrProcessing ? "var(--color-info)" : "var(--color-border)"}`,
            background: isOcrProcessing ? "var(--color-info-muted)" : "var(--color-surface-1)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-8)",
            textAlign: "center",
            minHeight: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-3)",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleOcrUpload(); }}
          onClick={handleOcrUpload}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOcrUpload(); }}
          aria-label={t("upload_receipt_aria")}
        >
          <UploadCloud
            size={40}
            aria-hidden
            style={{ color: isOcrProcessing ? "var(--color-info)" : "var(--color-text-3)" }}
          />
          <p
            style={{
              fontWeight: "var(--weight-semibold)",
              fontSize: "var(--text-body)",
              color: isOcrProcessing ? "var(--color-info)" : "var(--color-text-1)",
              margin: 0,
            }}
          >
            {isOcrProcessing ? t("ocr_scanning") : t("ocr_drop_here")}
          </p>
          {!isOcrProcessing && (
            <>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", margin: 0 }}>{t("ocr_or")}</p>
              <div
                style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", justifyContent: "center" }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button variant="secondary" size="sm" onClick={handleOcrUpload}>{t("ocr_browse")}</Button>
                <Button variant="ghost" size="sm" onClick={handleOcrUpload}>{t("ocr_take_photo")}</Button>
              </div>
            </>
          )}
        </div>

        <p
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--color-text-3)",
            margin: 0,
          }}
        >
          {t("ocr_supports")}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--text-caption)",
            color: "var(--color-info)",
            padding: "var(--space-2) var(--space-3)",
            background: "var(--color-info-muted)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <Sparkles size={14} aria-hidden />
          <span>{t("ocr_prefill_hint")}</span>
        </div>
      </div>

      {/* RIGHT: form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        {/* Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-2)",
            }}
          >
            {t("form_description")}
          </label>
          <Input
            placeholder={t("form_description_placeholder")}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        {/* Amount + currency */}
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
            <label
              style={{
                fontSize: "var(--text-body-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-2)",
              }}
            >
              {t("form_amount")}
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", width: 100 }}>
            <label
              style={{
                fontSize: "var(--text-body-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-2)",
              }}
            >
              {t("form_currency")}
            </label>
            <Select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as "EUR" | "GBP" | "USD" }))}
            >
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
            </Select>
          </div>
        </div>

        {/* Date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-2)",
            }}
          >
            {t("form_date")}
          </label>
          <Input
            type="date"
            value={form.expense_date}
            onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
          />
        </div>

        {/* Category */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-2)",
            }}
          >
            {t("form_category")}
          </label>
          <Select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory | "" }))}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Project */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-2)",
            }}
          >
            {t("form_project")}
          </label>
          <Select
            value={form.project_id}
            onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
          >
            {PROJECT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Billable toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-surface-1)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "var(--text-body-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-1)",
              }}
            >
              {t("billable_to_client")}
            </div>
            <div
              style={{
                fontSize: "var(--text-caption)",
                color: "var(--color-text-3)",
                marginTop: "var(--space-0-5)",
              }}
            >
              {t("billable_hint")}
            </div>
          </div>
          <Toggle
            checked={form.billable}
            onCheckedChange={(next) => setForm((f) => ({ ...f, billable: next }))}
            label={t("billable_to_client")}
          />
        </div>

        {/* Submit */}
        {submitted && (
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              background: "var(--color-success-muted)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-success)",
              fontSize: "var(--text-body-sm)",
              fontWeight: "var(--weight-medium)",
              textAlign: "center",
            }}
          >
            {t("submit_success")}
          </div>
        )}
        <Button
          variant="primary"
          size="md"
          style={{ width: "100%" }}
          loading={isSubmitting}
          onClick={(e: React.MouseEvent) => handleSubmit(e as unknown as React.FormEvent)}
        >
          {isSubmitting ? t("submitting") : t("submit_expense")}
        </Button>
      </form>
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const t = useTranslations("expenses");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localNew, setLocalNew] = useState<Expense[]>([]);

  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>
      <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
        <PageHeader
          title={t("page_title")}
          actions={
            <Button
              variant="primary"
              size="md"
              leadingIcon={<UploadCloud size={16} aria-hidden />}
              onClick={() => setDrawerOpen(true)}
            >
              {t("new_expense")}
            </Button>
          }
        />
        <MyExpensesTab localNew={localNew} />
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t("drawer_title")}
        width={520}
      >
        <SubmitExpenseForm
          onSubmitted={(e) => {
            setLocalNew((prev) => [e, ...prev]);
            setDrawerOpen(false);
          }}
        />
      </Drawer>
    </>
  );
}
