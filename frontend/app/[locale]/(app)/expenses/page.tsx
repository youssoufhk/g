"use client";

import { useState } from "react";
import Link from "next/link";
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
  MoreHorizontal,
} from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { FilterBar } from "@/components/patterns/filter-bar";
import { EmptyState } from "@/components/patterns/empty-state";
import { StatPill } from "@/components/patterns/stat-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { useExpenses } from "@/features/expenses/use-expenses";
import type {
  Expense,
  ExpenseCategory,
  ExpenseStatus,
  ExpenseListFilters,
} from "@/features/expenses/types";

// ── helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = { EUR: "EUR", GBP: "GBP", USD: "USD" };
  const sym = symbols[currency] ?? currency;
  return `${sym} ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  travel: "Travel",
  meals: "Meals",
  accommodation: "Accommodation",
  equipment: "Equipment",
  software: "Software",
  training: "Training",
  other: "Other",
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

function statusLabel(status: ExpenseStatus): string {
  switch (status) {
    case "draft": return "Draft";
    case "submitted": return "Submitted";
    case "approved": return "Approved";
    case "rejected": return "Rejected";
    case "reimbursed": return "Reimbursed";
  }
}

// ── expense item ───────────────────────────────────────────────────────────

function ExpenseItem({ expense }: { expense: Expense }) {
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
            {expense.billable ? "Billable" : "Internal"}
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
              Receipt
            </span>
          )}

          {/* Status badge */}
          <Badge
            tone={statusTone(expense.status)}
            dot={expense.status === "submitted"}
          >
            {statusLabel(expense.status)}
          </Badge>

          {/* Actions dropdown */}
          <Dropdown
            align="right"
            trigger={({ toggle }) => (
              <Button variant="ghost" size="sm" onClick={toggle} aria-label="Actions">
                <MoreHorizontal size={16} aria-hidden />
              </Button>
            )}
          >
            <DropdownItem>View details</DropdownItem>
            {(expense.status === "draft" || expense.status === "submitted") && (
              <DropdownItem>Edit</DropdownItem>
            )}
            {expense.status === "rejected" && (
              <DropdownItem>Re-submit</DropdownItem>
            )}
            {expense.status === "draft" && (
              <>
                <DropdownDivider />
                <DropdownItem destructive>Delete</DropdownItem>
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

// ── my expenses tab ─────────────────────────────────────────────────────────

function MyExpensesTab() {
  const [filters, setFilters] = useState<ExpenseListFilters>({});
  const { data: expenses, isLoading, error } = useExpenses(filters);

  const STATUS_OPTIONS = [
    { value: "", label: "All statuses" },
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "reimbursed", label: "Reimbursed" },
  ];

  const CATEGORY_OPTIONS = [
    { value: "", label: "All categories" },
    { value: "travel", label: "Travel" },
    { value: "meals", label: "Meals" },
    { value: "accommodation", label: "Accommodation" },
    { value: "equipment", label: "Equipment" },
    { value: "software", label: "Software" },
    { value: "training", label: "Training" },
    { value: "other", label: "Other" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* KPI strip */}
      <div className="kpi-grid">
        <StatPill label="Pending" value="EUR 607.50" accent="warning" />
        <StatPill label="Approved" value="EUR 219.80" accent="success" />
        <StatPill label="Reimbursed (this month)" value="EUR 96.00" accent="info" />
        <StatPill label="Rejected" value="1" accent="error" />
      </div>

      {/* Filter bar */}
      <FilterBar>
        <SearchInput
          placeholder="Search expenses..."
          value={filters.search ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value || undefined }))
          }
        />
        <Select
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value as ExpenseStatus) || undefined,
            }))
          }
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.category ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              category: (e.target.value as ExpenseCategory) || undefined,
            }))
          }
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </FilterBar>

      {/* Error state */}
      {error && (
        <div className="card" style={{ borderColor: "var(--color-error-muted)" }}>
          <div className="card-body">
            <p style={{ color: "var(--color-error)", fontSize: "var(--text-body-sm)" }}>
              Could not load expenses. {(error as Error).message}
            </p>
          </div>
        </div>
      )}

      {/* Expense list */}
      {isLoading ? (
        <ExpenseListSkeleton />
      ) : !expenses || expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses found"
          description="Try adjusting your filters or submit a new expense."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {expenses.map((e) => (
            <ExpenseItem key={e.id} expense={e} />
          ))}
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

function SubmitNewTab() {
  const [form, setForm] = useState<SubmitFormState>({
    description: "",
    amount: "",
    currency: "EUR",
    expense_date: "",
    category: "",
    project_id: "",
    billable: false,
  });

  const PROJECT_OPTIONS = [
    { value: "", label: "No project (internal)" },
    { value: "p1", label: "HSBC Digital Transformation" },
    { value: "p2", label: "BNP Risk Model" },
    { value: "p3", label: "TotalEnergies ESG Strategy" },
    { value: "p4", label: "Renault Lean Analytics" },
  ];

  const CATEGORY_OPTIONS = [
    { value: "", label: "Select category" },
    { value: "travel", label: "Travel" },
    { value: "meals", label: "Meals" },
    { value: "accommodation", label: "Accommodation" },
    { value: "equipment", label: "Equipment" },
    { value: "software", label: "Software" },
    { value: "training", label: "Training" },
    { value: "other", label: "Other" },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Submit expense:", form);
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
            border: "2px dashed var(--color-border)",
            background: "var(--color-surface-1)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-8)",
            textAlign: "center",
            minHeight: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-3)",
          }}
        >
          <UploadCloud
            size={40}
            aria-hidden
            style={{ color: "var(--color-text-3)" }}
          />
          <p
            style={{
              fontWeight: "var(--weight-semibold)",
              fontSize: "var(--text-body)",
              color: "var(--color-text-1)",
              margin: 0,
            }}
          >
            Drop receipt here
          </p>
          <p
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-3)",
              margin: 0,
            }}
          >
            or
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="secondary" size="sm">Browse files</Button>
            <Button variant="ghost" size="sm">Take photo</Button>
          </div>
        </div>

        <p
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--color-text-3)",
            margin: 0,
          }}
        >
          Supports: JPG, PNG, PDF · Max 5 MB
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
          <span>After upload, AI will pre-fill the form below</span>
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
            Description
          </label>
          <Input
            placeholder="e.g. Client meeting lunch"
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
              Amount
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
              Currency
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
            Date
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
            Category
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
            Project (optional)
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
              Billable to client
            </div>
            <div
              style={{
                fontSize: "var(--text-caption)",
                color: "var(--color-text-3)",
                marginTop: "var(--space-0-5)",
              }}
            >
              This expense will appear on the client invoice
            </div>
          </div>
          <Toggle
            checked={form.billable}
            onCheckedChange={(next) => setForm((f) => ({ ...f, billable: next }))}
            label="Billable to client"
          />
        </div>

        {/* Submit */}
        <Button variant="primary" size="md" style={{ width: "100%" }}>
          Submit expense
        </Button>
      </form>
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  return (
    <>
      <PageHeader
        title="Expenses"
        actions={
          <Button variant="primary" size="md">
            New expense
          </Button>
        }
      />

      <Tabs defaultValue="my-expenses">
        <TabsList>
          <TabsTrigger value="my-expenses">My expenses</TabsTrigger>
          <TabsTrigger value="submit-new">Submit new</TabsTrigger>
        </TabsList>

        <TabsContent value="my-expenses">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <MyExpensesTab />
          </div>
        </TabsContent>

        <TabsContent value="submit-new">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <SubmitNewTab />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
