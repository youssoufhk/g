"use client";

import { useState } from "react";
import { Clock, Receipt, Umbrella, CheckSquare, AlertCircle, Search } from "lucide-react";

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

type ApprovalCardProps = {
  item: ApprovalRequest;
  showActions: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

function ApprovalCard({ item, showActions, onApprove, onReject }: ApprovalCardProps) {
  const TypeIcon = TYPE_ICON[item.type];
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  function handleApprove() {
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      onApprove(item.id);
    }, 800);
  }

  function handleReject() {
    setRejecting(true);
    setTimeout(() => {
      setRejecting(false);
      onReject(item.id);
    }, 800);
  }

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
        <Badge tone={STATUS_BADGE_TONE[item.status]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
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

      {/* Row 4: actions (only when pending) */}
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
            onClick={handleApprove}
            disabled={approving || rejecting}
          >
            {approving ? "Approving..." : "Approve"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ color: "var(--color-error)" }}
            onClick={handleReject}
            disabled={approving || rejecting}
          >
            {rejecting ? "Rejecting..." : "Reject"}
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

// ── search bar ─────────────────────────────────────────────────────────────

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        background: "var(--color-surface-1)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-2) var(--space-3)",
        marginBottom: "var(--space-4)",
      }}
    >
      <Search size={14} style={{ color: "var(--color-text-3)", flexShrink: 0 }} aria-hidden />
      <input
        type="search"
        placeholder="Search by name, subject, or project..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: "var(--text-body-sm)",
          color: "var(--color-text-1)",
        }}
      />
    </div>
  );
}

// ── pending tab ────────────────────────────────────────────────────────────

function PendingTab() {
  const { data: rawItems, isLoading } = useApprovals({ status: "pending" });
  const [localStatuses, setLocalStatuses] = useState<Record<string, ApprovalStatus>>({});
  const [search, setSearch] = useState("");

  function handleApprove(id: string) {
    setLocalStatuses((prev) => ({ ...prev, [id]: "approved" }));
  }

  function handleReject(id: string) {
    setLocalStatuses((prev) => ({ ...prev, [id]: "rejected" }));
  }

  if (isLoading) return <ApprovalListSkeleton />;

  const allItems = rawItems ?? [];

  // Apply local status overrides
  const items = allItems
    .map((item) =>
      localStatuses[item.id] ? { ...item, status: localStatuses[item.id] as ApprovalStatus } : item
    )
    .filter((item) => item.status === "pending");

  // Apply search
  const filtered = search.trim()
    ? items.filter(
        (item) =>
          item.requester_name.toLowerCase().includes(search.toLowerCase()) ||
          item.subject.toLowerCase().includes(search.toLowerCase()) ||
          (item.project_name ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const pendingCount = items.length;

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />

      {pendingCount > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-4)",
          }}
        >
          <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-3)" }}>
            {pendingCount} pending request{pendingCount !== 1 ? "s" : ""}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              items.forEach((item) => handleApprove(item.id));
            }}
          >
            Approve all
          </Button>
        </div>
      )}

      {filtered.length === 0 && !search && (
        <EmptyState
          icon={CheckSquare}
          title="All caught up"
          description="No pending requests at this time."
        />
      )}

      {filtered.length === 0 && search && (
        <EmptyState
          icon={Search}
          title="No results"
          description={`No pending requests match "${search}".`}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {filtered.map((item) => (
          <ApprovalCard
            key={item.id}
            item={item}
            showActions={item.status === "pending"}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>
    </>
  );
}

// ── all tab ────────────────────────────────────────────────────────────────

function AllTab() {
  const { data: rawItems, isLoading } = useApprovals({});
  const [localStatuses, setLocalStatuses] = useState<Record<string, ApprovalStatus>>({});
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ApprovalType | "all">("all");

  function handleApprove(id: string) {
    setLocalStatuses((prev) => ({ ...prev, [id]: "approved" }));
  }

  function handleReject(id: string) {
    setLocalStatuses((prev) => ({ ...prev, [id]: "rejected" }));
  }

  if (isLoading) return <ApprovalListSkeleton />;

  const items = (rawItems ?? []).map((item) =>
    localStatuses[item.id] ? { ...item, status: localStatuses[item.id] as ApprovalStatus } : item
  );

  const filtered = items.filter((item) => {
    const matchSearch =
      !search.trim() ||
      item.requester_name.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      (item.project_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || item.type === typeFilter;
    return matchSearch && matchType;
  });

  if (items.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No requests"
        description="No approval requests found."
      />
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div
          style={{
            display: "flex",
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          {(["all", "timesheet", "expense", "leave"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              style={{
                padding: "var(--space-1-5) var(--space-3)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                color: typeFilter === t ? "var(--color-text-1)" : "var(--color-text-3)",
                background: typeFilter === t ? "var(--color-surface-0)" : "transparent",
                border: "none",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t === "all" ? "All" : TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results"
          description="No requests match your filters."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {filtered.map((item) => (
            <ApprovalCard
              key={item.id}
              item={item}
              showActions={item.status === "pending"}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ── history tab ────────────────────────────────────────────────────────────

function HistoryTab() {
  const { data: items, isLoading } = useApprovals({});
  const [search, setSearch] = useState("");

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

  const filtered = search.trim()
    ? history.filter(
        (item) =>
          item.requester_name.toLowerCase().includes(search.toLowerCase()) ||
          item.subject.toLowerCase().includes(search.toLowerCase())
      )
    : history;

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {filtered.map((item) => {
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
    </>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  const { data: allItems } = useApprovals({});

  const pendingCount = allItems?.filter((a) => a.status === "pending").length ?? 0;
  const highUrgencyCount = allItems?.filter((a) => a.status === "pending" && a.urgency === "high").length ?? 0;
  const approvedThisWeek = allItems?.filter((a) => a.status === "approved").length ?? 0;

  return (
    <>
      <PageHeader title="Approvals" />

      <div className="kpi-grid" style={{ marginBottom: "var(--space-6)" }}>
        <StatPill label="Pending" value={pendingCount} accent="warning" />
        <StatPill label="High urgency" value={highUrgencyCount} accent="error" />
        <StatPill label="Approved this week" value={approvedThisWeek} accent="success" />
        <StatPill label="Avg response time" value="< 1 day" accent="info" />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" count={pendingCount > 0 ? pendingCount : undefined}>Pending</TabsTrigger>
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
