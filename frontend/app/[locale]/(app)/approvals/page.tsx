"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Clock,
  Receipt,
  Umbrella,
  CheckSquare,
  AlertCircle,
  Search,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/patterns/empty-state";
import { AiRecommendations, type AiRecommendation } from "@/components/patterns/ai-recommendations";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApprovalsKpis } from "@/features/approvals/approvals-kpis";
import { useApprovals } from "@/features/approvals/use-approvals";
import type { ApprovalRequest, ApprovalType, ApprovalStatus } from "@/features/approvals/types";
import { useUrlListState } from "@/hooks/use-url-list-state";
import { formatCurrency, formatDate } from "@/lib/format";
import { useUndoableAction } from "@/lib/use-undoable-action";

// ── helpers ────────────────────────────────────────────────────────────────

const formatDateTime = (iso: string) => formatDate(iso, "withTime");

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

// ── type config ────────────────────────────────────────────────────────────

type BadgeTone = "default" | "primary" | "success" | "warning" | "error" | "info" | "accent" | "gold" | "ghost" | "ghost-primary" | "neutral";
type KpiKey = "timesheet" | "expense" | "leave" | "invoice";

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

const STATUS_BADGE_TONE: Record<ApprovalStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

// ── approval card ──────────────────────────────────────────────────────────

type ApprovalCardProps = {
  item: ApprovalRequest;
  showActions: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

function ApprovalCard({ item, showActions, selected, onToggleSelect, onApprove, onReject }: ApprovalCardProps) {
  const t = useTranslations("approvals");
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
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        {showActions && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(item.id)}
            aria-label={t("select_item_aria", { name: item.requester_name })}
            style={{ width: 16, height: 16, accentColor: "var(--color-primary)" }}
          />
        )}
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
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatDateTime(item.submitted_at)}
          </span>
        </div>
        {item.urgency === "high" && (
          <Badge tone="error">
            <AlertCircle size={11} aria-hidden style={{ marginRight: 3 }} />
            {t("urgent")}
          </Badge>
        )}
      </div>

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

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <Badge tone={TYPE_BADGE_TONE[item.type]}>{t(`type_${item.type}`)}</Badge>
        <Badge tone={STATUS_BADGE_TONE[item.status]}>{t(`status_${item.status}`)}</Badge>
        {item.period && (
          <span
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-2)",
              fontVariantNumeric: "tabular-nums",
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
              fontVariantNumeric: "tabular-nums",
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

      {showActions && (
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            paddingTop: "var(--space-1)",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          <Button variant="primary" size="sm" onClick={() => onApprove(item.id)}>
            {t("action_approve")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ color: "var(--color-error)" }}
            onClick={() => onReject(item.id)}
          >
            {t("action_reject")}
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

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
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
      }}
    >
      <Search size={14} style={{ color: "var(--color-text-3)", flexShrink: 0 }} aria-hidden />
      <input
        type="search"
        placeholder={placeholder}
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

// ── page ────────────────────────────────────────────────────────────────────

type MultiKey = "type" | "status";

export default function ApprovalsPage() {
  const t = useTranslations("approvals");
  const { data: rawItems, isLoading, error } = useApprovals({});

  const url = useUrlListState<MultiKey>({ multiKeys: ["type", "status"] });
  const search = url.search;
  const typeSel = url.multi.type;
  const statusSel = url.multi.status;

  const [localStatuses, setLocalStatuses] = useState<Record<string, ApprovalStatus>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState<string>("");
  const [tab, setTab] = useState<string>("pending");

  const applyOverride = (item: ApprovalRequest): ApprovalRequest =>
    item.id in localStatuses ? { ...item, status: localStatuses[item.id] as ApprovalStatus } : item;

  const allItems = useMemo(() => (rawItems ?? []).map(applyOverride), [rawItems, localStatuses]);

  // Pre-sort oldest-first
  const sortedByOldest = useMemo(
    () => [...allItems].sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()),
    [allItems],
  );

  // Counts per type (pending only)
  const pendingItems = useMemo(() => sortedByOldest.filter((i) => i.status === "pending"), [sortedByOldest]);
  const timesheetCount = pendingItems.filter((i) => i.type === "timesheet").length;
  const expenseCount = pendingItems.filter((i) => i.type === "expense").length;
  const leaveCount = pendingItems.filter((i) => i.type === "leave").length;
  const invoiceCount = 0; // No invoice approvals in current data contract; tile shown for parity.

  const activeKpi: KpiKey | undefined =
    typeSel.length === 1 && (["timesheet", "expense", "leave"] as const).includes(typeSel[0] as ApprovalType)
      ? (typeSel[0] as KpiKey)
      : undefined;

  function selectKpi(target: ApprovalType) {
    const current = typeSel[0];
    url.setMulti("type", current === target ? [] : [target]);
  }

  // Filtering
  function matchesFilters(item: ApprovalRequest): boolean {
    if (typeSel.length > 0 && !typeSel.includes(item.type)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !item.requester_name.toLowerCase().includes(q) &&
        !item.subject.toLowerCase().includes(q) &&
        !(item.project_name ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  }

  const pendingFiltered = pendingItems.filter(matchesFilters);
  const allFiltered = sortedByOldest.filter(matchesFilters);
  const historyFiltered = sortedByOldest.filter((i) => i.status !== "pending").filter(matchesFilters);

  // Recommendations based on real data
  const oldestPending = pendingItems[0];
  const oldestPendingDays = oldestPending ? daysSince(oldestPending.submitted_at) : 0;
  const staleTimesheets = pendingItems.filter(
    (i) => i.type === "timesheet" && daysSince(i.submitted_at) >= 7,
  ).length;
  const readyToBulk = pendingItems.filter((i) => i.urgency !== "high").length;

  const recommendations: AiRecommendation[] = [
    ...(staleTimesheets > 0
      ? [
          {
            id: "rec-stale",
            icon: AlertTriangle,
            tone: "gold" as const,
            title: t("rec_stale_title"),
            detail: t("rec_stale_detail", { count: staleTimesheets }),
            applyLabel: t("rec_review"),
            onApply: () => {
              url.setMulti("type", ["timesheet"]);
              setTab("pending");
            },
          },
        ]
      : []),
    ...(oldestPendingDays > 0 && pendingItems.length > 0
      ? [
          {
            id: "rec-oldest",
            icon: Clock,
            tone: "primary" as const,
            title: t("rec_oldest_title"),
            detail: t("rec_oldest_detail", { days: oldestPendingDays }),
            applyLabel: t("rec_review"),
            onApply: () => setTab("pending"),
          },
        ]
      : []),
    ...(readyToBulk >= 3
      ? [
          {
            id: "rec-bulk",
            icon: Sparkles,
            tone: "accent" as const,
            title: t("rec_bulk_title"),
            detail: t("rec_bulk_detail", { count: readyToBulk }),
          },
        ]
      : []),
  ];

  // Mutations
  const handleApprove = useUndoableAction<string>({
    apply: (id) => setLocalStatuses((prev) => ({ ...prev, [id]: "approved" })),
    revert: (id) =>
      setLocalStatuses((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    successTitle: t("toast_approved_title"),
    successDescription: t("toast_undo"),
  });

  const handleReject = useUndoableAction<string>({
    apply: (id) => setLocalStatuses((prev) => ({ ...prev, [id]: "rejected" })),
    revert: (id) =>
      setLocalStatuses((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    successTitle: t("toast_rejected_title"),
    successDescription: t("toast_undo"),
    tone: "warning",
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function bulkApprove() {
    const ids = Array.from(selected);
    ids.forEach((id) => handleApprove(id));
    setAnnouncement(t("announce_bulk_approved", { count: ids.length }));
    clearSelection();
  }

  function bulkReject() {
    const ids = Array.from(selected);
    ids.forEach((id) => handleReject(id));
    setAnnouncement(t("announce_bulk_rejected", { count: ids.length }));
    clearSelection();
  }

  const pendingVisibleIds = new Set(pendingFiltered.map((i) => i.id));
  const selectedVisibleCount = Array.from(selected).filter((id) => pendingVisibleIds.has(id)).length;
  const allSelected = pendingFiltered.length > 0 && selectedVisibleCount === pendingFiltered.length;

  function toggleSelectAll() {
    if (allSelected) {
      clearSelection();
    } else {
      setSelected(new Set(pendingFiltered.map((i) => i.id)));
    }
  }

  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>

      <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
        <PageHeader title={t("page_title")} count={pendingItems.length} />

        {recommendations.length > 0 && (
          <AiRecommendations
            items={recommendations}
            title={t("ai_recs_title")}
            overline={t("ai_recs_overline")}
          />
        )}

        <ApprovalsKpis
          timesheetCount={timesheetCount}
          expenseCount={expenseCount}
          leaveCount={leaveCount}
          invoiceCount={invoiceCount}
          activeType={activeKpi}
          onSelectTimesheet={() => selectKpi("timesheet")}
          onSelectExpense={() => selectKpi("expense")}
          onSelectLeave={() => selectKpi("leave")}
        />

        {/* aria-live region for bulk announcements */}
        <div aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          {announcement}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending" count={pendingItems.length > 0 ? pendingItems.length : undefined}>
              {t("tab_pending")}
            </TabsTrigger>
            <TabsTrigger value="all">{t("tab_all")}</TabsTrigger>
            <TabsTrigger value="history">{t("tab_history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div style={{ paddingTop: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <SearchBar value={search} onChange={url.setSearch} placeholder={t("search_placeholder")} />

              {selected.size > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-3)",
                    padding: "var(--space-2) var(--space-3)",
                    background: "var(--color-surface-1)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-1)", fontVariantNumeric: "tabular-nums" }}>
                    {t("bulk_selected", { count: selected.size })}
                  </span>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <Button variant="secondary" size="sm" onClick={clearSelection}>
                      {t("bulk_clear")}
                    </Button>
                    <Button variant="ghost" size="sm" style={{ color: "var(--color-error)" }} onClick={bulkReject}>
                      {t("bulk_reject")}
                    </Button>
                    <Button variant="primary" size="sm" leadingIcon={<CheckCircle2 size={14} aria-hidden />} onClick={bulkApprove}>
                      {t("bulk_approve")}
                    </Button>
                  </div>
                </div>
              )}

              {pendingFiltered.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-body-sm)", color: "var(--color-text-2)" }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      style={{ width: 16, height: 16, accentColor: "var(--color-primary)" }}
                    />
                    {t("select_all")}
                  </label>
                  <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-3)", fontVariantNumeric: "tabular-nums" }}>
                    {t("pending_count", { count: pendingFiltered.length })}
                  </span>
                </div>
              )}

              <div aria-busy={isLoading} aria-live="polite">
                {isLoading ? (
                  <ApprovalListSkeleton />
                ) : error ? (
                  <div role="alert" style={{ padding: "var(--space-4)", background: "var(--color-error-muted)", borderRadius: "var(--radius-md)", color: "var(--color-error)", fontSize: "var(--text-body-sm)" }}>
                    {t("load_error")} {(error as Error).message}
                  </div>
                ) : pendingFiltered.length === 0 ? (
                  <EmptyState
                    icon={CheckSquare}
                    title={search || typeSel.length > 0 ? t("empty_filtered_title") : t("empty_caught_up_title")}
                    description={search || typeSel.length > 0 ? t("empty_filtered_desc") : t("empty_caught_up_desc")}
                    action={
                      search || typeSel.length > 0 ? (
                        <Button variant="secondary" size="sm" onClick={() => url.clearAll()}>
                          {t("empty_clear")}
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {pendingFiltered.map((item) => (
                      <ApprovalCard
                        key={item.id}
                        item={item}
                        showActions
                        selected={selected.has(item.id)}
                        onToggleSelect={toggleSelect}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div style={{ paddingTop: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <SearchBar value={search} onChange={url.setSearch} placeholder={t("search_placeholder")} />
              <div aria-busy={isLoading} aria-live="polite">
                {isLoading ? (
                  <ApprovalListSkeleton />
                ) : allFiltered.length === 0 ? (
                  <EmptyState
                    icon={CheckSquare}
                    title={t("empty_none_title")}
                    description={t("empty_none_desc")}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {allFiltered.map((item) => (
                      <ApprovalCard
                        key={item.id}
                        item={item}
                        showActions={item.status === "pending"}
                        selected={selected.has(item.id)}
                        onToggleSelect={toggleSelect}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div style={{ paddingTop: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <SearchBar value={search} onChange={url.setSearch} placeholder={t("search_placeholder")} />
              <div aria-busy={isLoading} aria-live="polite">
                {isLoading ? (
                  <ApprovalListSkeleton />
                ) : historyFiltered.length === 0 ? (
                  <EmptyState
                    icon={CheckSquare}
                    title={t("empty_history_title")}
                    description={t("empty_history_desc")}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {historyFiltered.map((item) => {
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
                              {t(`status_${item.status}`)}
                            </Badge>
                            <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", fontVariantNumeric: "tabular-nums" }}>
                              {formatDate(item.submitted_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
