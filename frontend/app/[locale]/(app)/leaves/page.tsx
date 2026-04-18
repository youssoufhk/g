"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Umbrella, Sparkles, Send, X } from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { ResourcesFilterBar, type FilterGroup } from "@/components/patterns/resources-filter-bar";
import { EmptyState } from "@/components/patterns/empty-state";
import { AiRecommendations, type AiRecommendation } from "@/components/patterns/ai-recommendations";
import {
  TimelineWindowSelector,
  weeksFor,
  type WindowPresetValue,
} from "@/components/patterns/timeline-window-selector";
import { RangeCalendar, type RangeEvent } from "@/components/patterns/range-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaveRequests, useLeaveBalance } from "@/features/leaves/use-leaves";
import { LeavesKpis } from "@/features/leaves/leaves-kpis";
import { useUrlListState } from "@/hooks/use-url-list-state";
import type { LeaveRequest, LeaveType, LeaveStatus } from "@/features/leaves/types";
import { formatDate, formatPeriod, daysBetween as diffDays } from "@/lib/format";
import { useUndoableAction } from "@/lib/use-undoable-action";

const CURRENT_USER_ID = "e1";
const CURRENT_USER_NAME = "Youssouf Kerzika";

const TYPE_KEYS: LeaveType[] = ["annual", "sick", "parental", "unpaid", "public_holiday", "compassionate"];
const STATUS_KEYS: LeaveStatus[] = ["pending", "approved", "rejected", "cancelled"];

type BadgeTone = "default" | "primary" | "success" | "warning" | "error" | "info" | "accent" | "gold" | "ghost" | "ghost-primary" | "neutral";

const TYPE_BADGE_TONE: Record<LeaveType, BadgeTone> = {
  annual: "info",
  sick: "warning",
  parental: "primary",
  unpaid: "default",
  public_holiday: "success",
  compassionate: "error",
};

const STATUS_BADGE_TONE: Record<LeaveStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "default",
};

const STATUS_TO_EVENT_TONE: Record<LeaveStatus, "primary" | "gold" | "default" | "error"> = {
  approved: "primary",
  pending: "gold",
  cancelled: "default",
  rejected: "error",
};

// ── Inline range composer ─────────────────────────────────────────────────

function RangeComposer({
  range,
  onCancel,
  onSubmit,
}: {
  range: { start: string; end: string };
  onCancel: () => void;
  onSubmit: (type: LeaveType, reason: string) => void;
}) {
  const t = useTranslations("leaves");
  const [type, setType] = useState<LeaveType | "">("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const days = diffDays(range.start, range.end);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit(type as LeaveType, reason);
      setSubmitting(false);
    }, 350);
  }

  return (
    <form className="range-composer" onSubmit={handleSubmit} aria-label={t("composer_aria")}>
      <div className="range-composer-summary">
        {t("composer_summary", { period: formatPeriod(range.start, range.end), days })}
      </div>
      <div className="range-composer-row">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: "1 1 200px" }}>
          <label style={{ fontSize: "var(--text-caption)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>
            {t("form_type")}
          </label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as LeaveType | "")}
            required
          >
            <option value="">{t("form_type_placeholder")}</option>
            {TYPE_KEYS.filter((k) => k !== "public_holiday").map((k) => (
              <option key={k} value={k}>{t(`type_${k}`)}</option>
            ))}
          </Select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: "2 1 320px" }}>
          <label style={{ fontSize: "var(--text-caption)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>
            {t("form_reason")}
          </label>
          <Textarea
            placeholder={t("form_reason_placeholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={1}
          />
        </div>
      </div>
      <div className="range-composer-row" style={{ justifyContent: "flex-end" }}>
        <Button variant="ghost" size="sm" type="button" leadingIcon={<X size={16} aria-hidden />} onClick={onCancel}>
          {t("composer_cancel")}
        </Button>
        <Button variant="primary" size="sm" type="submit" loading={submitting} disabled={!type}>
          {submitting ? t("form_submitting") : t("form_submit")}
        </Button>
      </div>
    </form>
  );
}

// ── My leaves view ────────────────────────────────────────────────────────

type LeaveMultiKey = "status" | "type";

function MyLeavesView({
  localNew,
  onSubmitLeave,
}: {
  localNew: LeaveRequest[];
  onSubmitLeave: (l: LeaveRequest) => void;
}) {
  const t = useTranslations("leaves");
  const url = useUrlListState<LeaveMultiKey, WindowPresetValue>({
    multiKeys: ["status", "type"],
    windowKey: "window",
    windowDefault: "12m",
  });
  const search = url.search;
  const statusSel = url.multi.status;
  const typeSel = url.multi.type;
  const windowValue: WindowPresetValue = url.windowValue || "12m";
  const windowWeeks = weeksFor(windowValue);

  const { data: rawLeaves, isLoading, error } = useLeaveRequests({});
  const { data: balance } = useLeaveBalance();
  const [localStatuses, setLocalStatuses] = useState<Record<string, LeaveStatus>>({});
  const [pendingRange, setPendingRange] = useState<{ start: string; end: string } | null>(null);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowWeeks * 7);

  const myLeaves: LeaveRequest[] = useMemo(
    () =>
      [...localNew, ...(rawLeaves ?? [])]
        .filter((l) => l.employee_id === CURRENT_USER_ID || l.id.startsWith("leave-new-"))
        .map((l) => (l.id in localStatuses ? { ...l, status: localStatuses[l.id] as LeaveStatus } : l)),
    [localNew, rawLeaves, localStatuses],
  );

  const allLeaves: LeaveRequest[] = myLeaves.filter((l) => new Date(l.start_date) >= cutoff);

  const matchesFilters = (l: LeaveRequest): boolean => {
    if (statusSel.length > 0 && !statusSel.includes(l.status)) return false;
    if (typeSel.length > 0 && !typeSel.includes(l.type)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !(l.reason ?? "").toLowerCase().includes(q) &&
        !t(`type_${l.type}`).toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  };

  const leaves = allLeaves.filter(matchesFilters);
  const total = leaves.length;

  const handleCancel = useUndoableAction<{ id: string; prev: LeaveStatus }>({
    apply: ({ id }) => setLocalStatuses((prev) => ({ ...prev, [id]: "cancelled" })),
    revert: ({ id, prev: prevStatus }) =>
      setLocalStatuses((prev) => {
        const next = { ...prev };
        if (prevStatus) next[id] = prevStatus;
        else delete next[id];
        return next;
      }),
    successTitle: t("cancel_toast_title"),
    successDescription: t("cancel_toast_body"),
    tone: "warning",
  });

  const pendingCount = allLeaves.filter((l) => l.status === "pending").length;
  const approvedDays = allLeaves
    .filter((l) => l.status === "approved")
    .reduce((s, l) => s + l.days, 0);

  const activeKpi: string | undefined =
    statusSel.length === 1
      ? statusSel[0] === "pending"
        ? "pending"
        : statusSel[0] === "approved"
        ? "approved"
        : undefined
      : undefined;

  function selectKpi(target: string) {
    url.setMulti("status", activeKpi === target ? [] : [target]);
  }

  // Calendar events: show ALL my leaves (not window-filtered)
  const calendarEvents: RangeEvent[] = useMemo(
    () =>
      myLeaves
        .filter((l) => l.status !== "cancelled" && l.status !== "rejected")
        .map((l) => ({
          id: l.id,
          start: l.start_date,
          end: l.end_date,
          tone: STATUS_TO_EVENT_TONE[l.status],
          label: `${t(`type_${l.type}`)} (${t(`status_${l.status}`)})`,
        })),
    [myLeaves, t],
  );

  function handleRangeSelect(start: string, end: string) {
    setPendingRange({ start, end });
  }

  function handleComposerSubmit(type: LeaveType, reason: string) {
    if (!pendingRange) return;
    const newLeave: LeaveRequest = {
      id: `leave-new-${Date.now()}`,
      employee_id: CURRENT_USER_ID,
      employee_name: CURRENT_USER_NAME,
      type,
      start_date: pendingRange.start,
      end_date: pendingRange.end,
      days: diffDays(pendingRange.start, pendingRange.end),
      status: "pending",
      reason: reason || undefined,
      submitted_at: new Date().toISOString(),
    };
    onSubmitLeave(newLeave);
    setPendingRange(null);
  }

  const recommendations: AiRecommendation[] = [
    ...(pendingCount > 0
      ? [
          {
            id: "rec-pending",
            icon: Send,
            tone: "gold" as const,
            title: t("rec_pending_title"),
            detail: t("rec_pending_detail", { count: pendingCount }),
            applyLabel: t("rec_review"),
            onApply: () => url.setMulti("status", ["pending"]),
          },
        ]
      : []),
    ...((balance?.annual_remaining ?? 0) > 10
      ? [
          {
            id: "rec-balance",
            icon: Sparkles,
            tone: "accent" as const,
            title: t("rec_balance_title"),
            detail: t("rec_balance_detail", { days: balance?.annual_remaining ?? 0 }),
          },
        ]
      : []),
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
      key: "type",
      label: t("filter_type"),
      options: TYPE_KEYS.map((k) => ({ value: k, label: t(`type_${k}`) })),
      selected: typeSel,
      onChange: (v) => url.setMulti("type", v),
      searchPlaceholder: t("search_type"),
    },
  ];

  const hasFilters = !!search || statusSel.length > 0 || typeSel.length > 0;

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

      <LeavesKpis
        remainingDays={balance?.annual_remaining ?? 0}
        totalDays={balance?.annual_total ?? 0}
        pendingCount={pendingCount}
        approvedDays={approvedDays}
        activeStatus={activeKpi}
        onSelectPending={() => selectKpi("pending")}
        onSelectApproved={() => selectKpi("approved")}
      />

      <section aria-labelledby="leaves-calendar-heading">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-2)", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <h2 id="leaves-calendar-heading" style={{ fontSize: "var(--text-body)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)", margin: 0 }}>
            {t("calendar_title")}
          </h2>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
            {t("calendar_hint")}
          </span>
        </header>
        <RangeCalendar
          monthsVisible={2}
          events={calendarEvents}
          selectedRange={pendingRange}
          onRangeSelect={handleRangeSelect}
          minDate={new Date().toISOString().slice(0, 10)}
          ariaLabel={t("calendar_aria")}
        />
        {pendingRange && (
          <RangeComposer
            range={pendingRange}
            onCancel={() => setPendingRange(null)}
            onSubmit={handleComposerSubmit}
          />
        )}
      </section>

      <ResourcesFilterBar
        search={search}
        onSearchChange={url.setSearch}
        searchPlaceholder={t("search_placeholder")}
        groups={filterGroups}
        onClearAll={url.clearAll}
        resultCount={total}
        resultLabel={total === 1 ? t("result_leave") : t("result_leaves")}
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
          className="data-table-wrapper"
          style={{ maxHeight: "calc(12 * 48px + 56px)", overflow: "auto" }}
        >
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-3)" }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="card" style={{ height: 48, borderRadius: "var(--radius-md)" }} />
              ))}
            </div>
          ) : leaves.length === 0 ? (
            <div style={{ padding: "var(--space-12) var(--space-6)" }}>
              <EmptyState
                icon={Umbrella}
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
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 110 }}>{t("col_type")}</th>
                  <th style={{ minWidth: 160 }}>{t("col_period")}</th>
                  <th style={{ minWidth: 70 }}>{t("col_days")}</th>
                  <th style={{ minWidth: 100 }}>{t("col_status")}</th>
                  <th style={{ minWidth: 110 }}>{t("col_submitted")}</th>
                  <th style={{ width: 80 }} aria-label={t("col_actions_aria")} />
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <Badge tone={TYPE_BADGE_TONE[leave.type]}>{t(`type_${leave.type}`)}</Badge>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatPeriod(leave.start_date, leave.end_date)}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--color-text-2)" }}>
                      {leave.days}d
                    </td>
                    <td>
                      <Badge tone={STATUS_BADGE_TONE[leave.status]} dot={leave.status === "pending"}>
                        {t(`status_${leave.status}`)}
                      </Badge>
                    </td>
                    <td style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", whiteSpace: "nowrap" }}>
                      {formatDate(leave.submitted_at)}
                    </td>
                    <td>
                      {leave.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: "var(--color-error)" }}
                          onClick={() => handleCancel({ id: leave.id, prev: leave.status })}
                        >
                          {t("action_cancel")}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LeavesPage() {
  const t = useTranslations("leaves");
  const [localNew, setLocalNew] = useState<LeaveRequest[]>([]);

  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>
      <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
        <PageHeader title={t("page_title")} />
        <MyLeavesView localNew={localNew} onSubmitLeave={(l) => setLocalNew((prev) => [l, ...prev])} />
      </div>
    </>
  );
}
