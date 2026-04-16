"use client";

import { useState } from "react";
import { Clock, Receipt, Umbrella, CheckSquare, AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { StatPill } from "@/components/patterns/stat-pill";
import { EmptyState } from "@/components/patterns/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApprovals } from "@/features/approvals/use-approvals";
import type { ApprovalRequest, ApprovalType, ApprovalStatus } from "@/features/approvals/types";

// ── helpers ────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── type config ────────────────────────────────────────────────────────────

type BadgeTone = "default" | "primary" | "success" | "warning" | "error" | "info" | "accent" | "gold" | "ghost" | "ghost-primary" | "neutral";

const TYPE_ICON: Record<ApprovalType, React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  timesheet: Clock,
  expense: Receipt,
  leave: Umbrella,
};

const TYPE_BADGE_TONE: Record<ApprovalType, BadgeTone> = {
  timesheet: "default",
  expense: "warning",
  leave: "info",
};

const TYPE_LABEL: Record<ApprovalType, string> = {
  timesheet: "Timesheet",
  expense: "Expense",
  leave: "Leave",
};

const STATUS_BADGE_TONE: Record<ApprovalStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

// ── approval card ──────────────────────────────────────────────────────────

function ApprovalCard({ item, showActions }: { item: ApprovalRequest; showActions: boolean }) {
  const TypeIcon = TYPE_ICON[item.type];

  return (
    <div
      style={{
        background: "var(--color-surface-0)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
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
      {/* Row 1: avatar + name + timestamp + urgency badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Avatar
          name={item.requester_name}
          colorIndex={item.requester_avatar_color_index}
          size="sm"
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontWeight: "var(--weight-semibold)",
              fontSize: "var(--text-body-sm)",
              color: "var(--color-text-1)",
            }}
          >
            {item.requester_name}
          </span>
          <span
            style={{
              marginLeft: "var(--space-2)",
              fontSize: "var(--text-caption)",
              color: "var(--color-text-3)",
            }}
          >
            {formatDateTime(item.submitted_at)}
          </span>
        </div>
        {item.urgency === "high" && (
          <Badge tone="error">
            <AlertCircle size={11} aria-hidden style={{ marginRight: 3 }} />
            Urgent
          </Badge>
        )}
      </div>

      {/* Row 2: type icon + subject */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{ color: "var(--color-text-2)", flexShrink: 0, display: "flex" }}>
          <TypeIcon size={16} aria-hidden />
        </span>
        <span
          style={{
            fontWeight: "var(--weight-semibold)",
            fontSize: "var(--text-body)",
            color: "var(--color-text-1)",
          }}
        >
          {item.subject}
        </span>
      </div>

      {/* Row 3: meta pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <Badge tone={TYPE_BADGE_TONE[item.type]}>{TYPE_LABEL[item.type]}</Badge>
        {item.period && (
          <span
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-2)",
            }}
          >
            {item.period}
          </span>
        )}
        {item.amount !== undefined && item.currency && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-caption)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-1)",
            }}
          >
            {formatCurrency(item.amount, item.currency)}
          </span>
        )}
        {item.project_name && (
          <>
            <span style={{ color: "var(--color-text-3)", fontSize: "var(--text-caption)" }}>·</span>
            <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-2)" }}>
              {item.project_name}
            </span>
          </>
        )}
      </div>

      {/* Row 4: actions (only in pending/all tabs) */}
      {showActions && (
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            paddingTop: "var(--space-1)",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          <Button
            variant="primary"
            size="sm"
            onClick={() => console.log("approve", item.id)}
          >
            Approve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ color: "var(--color-error)" }}
            onClick={() => console.log("reject", item.id)}
          >
            Reject
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log("view", item.id)}
          >
            View details
          </Button>
        </div>
      )}
    </div>
  );
}

// ── skeleton cards ─────────────────────────────────────────────────────────

function ApprovalListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {[...Array(3)].map((_, i) => (
        <Skeleton
          key={i}
          variant="card"
          style={{ height: 140, borderRadius: "var(--radius-xl)" }}
        />
      ))}
    </div>
  );
}

// ── pending tab ────────────────────────────────────────────────────────────

function PendingTab() {
  const { data: items, isLoading } = useApprovals({ status: "pending" });

  if (isLoading) return <ApprovalListSkeleton />;

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="All caught up"
        description="No pending requests at this time."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {items.map((item) => (
        <ApprovalCard key={item.id} item={item} showActions={true} />
      ))}
    </div>
  );
}

// ── all tab ────────────────────────────────────────────────────────────────

function AllTab() {
  const { data: items, isLoading } = useApprovals({});

  if (isLoading) return <ApprovalListSkeleton />;

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No requests"
        description="No approval requests found."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {items.map((item) => (
        <ApprovalCard key={item.id} item={item} showActions={item.status === "pending"} />
      ))}
    </div>
  );
}

// ── history tab ────────────────────────────────────────────────────────────

function HistoryTab() {
  const { data: items, isLoading } = useApprovals({});

  const history = items?.filter((a) => a.status !== "pending") ?? [];

  if (isLoading) return <ApprovalListSkeleton />;

  if (history.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No history yet"
        description="Reviewed requests will appear here."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {history.map((item) => {
        const TypeIcon = TYPE_ICON[item.type];
        return (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              padding: "var(--space-3) var(--space-4)",
              background: "var(--color-surface-0)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <Avatar
              name={item.requester_name}
              colorIndex={item.requester_avatar_color_index}
              size="sm"
            />
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
                {item.requester_name}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                  marginTop: "var(--space-0-5)",
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-2)",
                }}
              >
                <TypeIcon size={12} aria-hidden />
                <span>{item.subject}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-1)", flexShrink: 0 }}>
              <Badge tone={STATUS_BADGE_TONE[item.status]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Badge>
              {item.reviewer_note && (
                <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
                  {item.reviewer_note}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader title="Approvals" />

      <div className="kpi-grid" style={{ marginBottom: "var(--space-6)" }}>
        <StatPill label="Pending" value="4" accent="warning" />
        <StatPill label="High urgency" value="1" accent="error" />
        <StatPill label="Approved this week" value="2" accent="success" />
        <StatPill label="Avg response time" value="< 1 day" accent="info" />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending (4)</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <PendingTab />
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <AllTab />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <HistoryTab />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
