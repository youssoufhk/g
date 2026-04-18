"use client";

import { useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  CheckCircle,
  Send,
  Copy,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/patterns/empty-state";
import { AiRecommendations, type AiRecommendation } from "@/components/patterns/ai-recommendations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/table";
import {
  useTimesheetWeek,
  getWeekDates,
} from "@/features/timesheets/use-timesheets";
import { TimesheetsKpis } from "@/features/timesheets/timesheets-kpis";
import type { TimesheetEntry } from "@/features/timesheets/types";
import { formatDate } from "@/lib/format";

// ── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getISOWeekNumber(dateStr: string): number {
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function formatHours(h: number): string {
  if (h === 0) return "-";
  return String(h);
}

// Mock "non-billable" detection: internal/Gamma client treated as non-billable.
function isNonBillableEntry(entry: TimesheetEntry): boolean {
  const c = entry.client_name.toLowerCase();
  return c === "gamma" || c.includes("internal");
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "draft" | "submitted" | "approved" }) {
  const t = useTranslations("timesheets");
  switch (status) {
    case "approved":
      return <Badge tone="success" dot>{t("status_approved")}</Badge>;
    case "submitted":
      return <Badge tone="info" dot>{t("status_submitted")}</Badge>;
    default:
      return <Badge tone="default" dot>{t("status_draft")}</Badge>;
  }
}

type CellEdits = Record<string, number>;

function EditableCell({
  value,
  entryId,
  date,
  edits,
  onEdit,
  isWeekend,
}: {
  value: number;
  entryId: string;
  date: string;
  edits: CellEdits;
  onEdit: (key: string, val: number) => void;
  isWeekend: boolean;
}) {
  const t = useTranslations("timesheets");
  const key = `${entryId}:${date}`;
  const current: number = key in edits ? (edits[key] as number) : value;
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit(raw: string) {
    const parsed = parseFloat(raw);
    const val = isNaN(parsed) ? 0 : Math.max(0, parsed);
    onEdit(key, val);
    setEditing(false);
  }

  const isLow = !isWeekend && current > 0 && current < 7;

  const cellStyle: React.CSSProperties = {
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: isWeekend
      ? "var(--color-surface-1)"
      : isLow
        ? "var(--color-warning-muted)"
        : undefined,
    padding: "var(--space-2) var(--space-3)",
    minWidth: 56,
    fontVariantNumeric: "tabular-nums",
  };

  if (editing) {
    return (
      <td style={cellStyle}>
        <input
          ref={inputRef}
          type="number"
          min={0}
          max={24}
          step={0.5}
          defaultValue={current === 0 ? "" : current}
          onBlur={(e) => commitEdit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit((e.target as HTMLInputElement).value);
            if (e.key === "Escape") setEditing(false);
          }}
          style={{
            width: 52,
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-primary)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-1)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-body)",
            fontVariantNumeric: "tabular-nums",
            textAlign: "center",
            padding: "2px 4px",
            outline: "none",
          }}
          autoFocus
        />
      </td>
    );
  }

  return (
    <td
      style={cellStyle}
      onClick={startEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") startEdit(); }}
      aria-label={t("cell_hours_aria", { count: current })}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-body)",
          fontVariantNumeric: "tabular-nums",
          color: current === 0
            ? "var(--color-text-3)"
            : "var(--color-text-1)",
        }}
      >
        {formatHours(current)}
      </span>
    </td>
  );
}

function SkeletonRow({ dateCount }: { dateCount: number }) {
  return (
    <TR>
      <TD style={{ width: 220 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <Skeleton variant="title" width={160} />
          <Skeleton variant="text" width={100} />
        </div>
      </TD>
      {Array.from({ length: dateCount }).map((_, i) => (
        <TD key={i} style={{ textAlign: "center" }}>
          <Skeleton variant="text" width={32} />
        </TD>
      ))}
      <TD style={{ textAlign: "center" }}>
        <Skeleton variant="text" width={32} />
      </TD>
    </TR>
  );
}

function MobileEntryCard({ entry, edits }: { entry: TimesheetEntry; edits: CellEdits }) {
  const total = Object.entries(entry.hours).reduce((sum, [date, h]) => {
    const key = `${entry.id}:${date}`;
    return sum + (key in edits ? (edits[key] as number) : h);
  }, 0);

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="card-body">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: "var(--weight-medium)", color: "var(--color-text-1)", fontSize: "var(--text-body)" }}>
              {entry.project_name}
            </div>
            <div className="cell-secondary" style={{ fontSize: "var(--text-caption)", marginTop: 2 }}>
              {entry.client_name}
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-1)",
              fontSize: "var(--text-body)",
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
              marginLeft: "var(--space-3)",
            }}
          >
            {total}h
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add project row modal ────────────────────────────────────────────────────

const AVAILABLE_PROJECTS = [
  { id: "p1", name: "HSBC Digital Transformation", client: "HSBC UK" },
  { id: "p2", name: "BNP Risk Model", client: "BNP Paribas" },
  { id: "p3", name: "TotalEnergies ESG Strategy", client: "TotalEnergies" },
  { id: "p4", name: "Renault Lean Analytics", client: "Renault" },
  { id: "p5", name: "Internal", client: "Gamma" },
];

function AddRowModal({
  open,
  existingIds,
  onAdd,
  onClose,
}: {
  open: boolean;
  existingIds: string[];
  onAdd: (project: { id: string; name: string; client: string }) => void;
  onClose: () => void;
}) {
  const t = useTranslations("timesheets");
  const available = AVAILABLE_PROJECTS.filter((p) => !existingIds.includes(p.id));
  const [selected, setSelected] = useState(available[0]?.id ?? "");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("add_modal_title")}
      description={t("add_modal_desc")}
      footer={
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="md" onClick={onClose}>{t("add_modal_cancel")}</Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              const proj = AVAILABLE_PROJECTS.find((p) => p.id === selected);
              if (proj) { onAdd(proj); onClose(); }
            }}
          >
            {t("add_modal_confirm")}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>
          {t("add_modal_project")}
        </label>
        <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {available.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
          ))}
        </Select>
      </div>
    </Modal>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TimesheetsPage() {
  const t = useTranslations("timesheets");
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(getCurrentMonday);
  const [edits, setEdits] = useState<CellEdits>({});
  const [weekStatus, setWeekStatus] = useState<"draft" | "submitted" | "approved">("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addRowOpen, setAddRowOpen] = useState(false);
  const [extraEntries, setExtraEntries] = useState<TimesheetEntry[]>([]);

  const { data: week, isLoading, error } = useTimesheetWeek(currentWeekStart);
  const { data: prevWeek } = useTimesheetWeek(addDays(currentWeekStart, -7));

  const dates = getWeekDates(currentWeekStart);
  const weekendDates = new Set([dates[5], dates[6]]);

  const baseEntries = week?.entries ?? [];
  const entries = [...baseEntries, ...extraEntries];
  const existingProjectIds = baseEntries.map((e) => e.project_id);
  const isEmpty = !isLoading && entries.length === 0;

  function handleEdit(key: string, val: number) {
    setEdits((prev) => ({ ...prev, [key]: val }));
  }

  function getEffectiveHours(entryId: string, date: string, baseHours: number): number {
    const key = `${entryId}:${date}`;
    return key in edits ? (edits[key] as number) : baseHours;
  }

  function getEffectiveDailyTotal(date: string): number {
    return entries.reduce((sum, e) => {
      return sum + getEffectiveHours(e.id, date, e.hours[date] ?? 0);
    }, 0);
  }

  function getEffectiveEntryTotal(entry: TimesheetEntry): number {
    return dates.reduce((sum, date) => {
      return sum + getEffectiveHours(entry.id, date, entry.hours[date] ?? 0);
    }, 0);
  }

  const effectiveWeekTotal = entries.reduce((sum, e) => sum + getEffectiveEntryTotal(e), 0);
  const targetHours = week?.target_hours ?? 40;

  // Billable / non-billable / overtime
  const billableHours = entries
    .filter((e) => !isNonBillableEntry(e))
    .reduce((sum, e) => sum + getEffectiveEntryTotal(e), 0);
  const nonBillableHours = entries
    .filter(isNonBillableEntry)
    .reduce((sum, e) => sum + getEffectiveEntryTotal(e), 0);
  const overtimeHours = Math.max(0, effectiveWeekTotal - targetHours);

  const progressPct = targetHours > 0 ? Math.min(100, (effectiveWeekTotal / targetHours) * 100) : 0;
  const progressTone = weekStatus === "submitted" || weekStatus === "approved"
    ? "primary"
    : effectiveWeekTotal > targetHours
      ? "warning"
      : "primary";

  const isSubmitted = weekStatus === "submitted" || weekStatus === "approved";
  const canSubmit = !isSubmitted && effectiveWeekTotal > 0 && !isSubmitting;

  // Week label via lib/format helpers (no inline Intl.DateTimeFormat).
  const weekLabel = useMemo(() => {
    const weekNum = getISOWeekNumber(currentWeekStart);
    const startStr = formatDate(dates[0] as string, "short");
    const endStr = formatDate(dates[6] as string, "medium");
    return t("week_label", { week: weekNum, start: startStr, end: endStr });
  }, [currentWeekStart, dates, t]);

  function formatDayHeader(iso: string): string {
    return formatDate(iso, "short");
  }

  function handlePrevWeek() {
    setCurrentWeekStart((prev) => addDays(prev, -7));
    setEdits({});
    setWeekStatus("draft");
    setExtraEntries([]);
  }

  function handleNextWeek() {
    setCurrentWeekStart((prev) => addDays(prev, 7));
    setEdits({});
    setWeekStatus("draft");
    setExtraEntries([]);
  }

  function handleToday() {
    setCurrentWeekStart(getCurrentMonday());
    setEdits({});
    setWeekStatus("draft");
    setExtraEntries([]);
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setWeekStatus("submitted");
      setIsSubmitting(false);
    }, 800);
  }

  function handleAddRow(project: { id: string; name: string; client: string }) {
    const newEntry: TimesheetEntry = {
      id: `extra-${project.id}`,
      project_id: project.id,
      project_name: project.name,
      client_name: project.client,
      hours: {},
      total_hours: 0,
    };
    setExtraEntries((prev) => [...prev, newEntry]);
  }

  function handleCopyLastWeek() {
    if (!prevWeek || prevWeek.entries.length === 0) return;
    const newEdits: CellEdits = { ...edits };
    const existing = new Set(entries.map((e) => e.project_id));
    const addedEntries: TimesheetEntry[] = [];
    prevWeek.entries.forEach((prevEntry, idx) => {
      const prevDates = getWeekDates(prevWeek.week_start);
      let targetId = entries.find((e) => e.project_id === prevEntry.project_id)?.id;
      if (!targetId) {
        targetId = `copy-${prevEntry.project_id}-${idx}`;
        addedEntries.push({
          id: targetId,
          project_id: prevEntry.project_id,
          project_name: prevEntry.project_name,
          client_name: prevEntry.client_name,
          hours: {},
          total_hours: 0,
        });
        existing.add(prevEntry.project_id);
      }
      prevDates.forEach((prevDate, i) => {
        const hours = prevEntry.hours[prevDate] ?? 0;
        if (hours > 0) {
          const targetDate = dates[i] as string;
          newEdits[`${targetId}:${targetDate}`] = hours;
        }
      });
    });
    setEdits(newEdits);
    if (addedEntries.length > 0) {
      setExtraEntries((prev) => [...prev, ...addedEntries]);
    }
  }

  // Missing weekdays before today (within current week), under 7h.
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const missingDays = dates.slice(0, 5).filter((d) => {
    if (d > todayIso) return false;
    return getEffectiveDailyTotal(d) < 7;
  }).length;

  // Build real AI recommendations; omit if no real suggestion.
  const recommendations: AiRecommendation[] = [];
  if (!isSubmitted && prevWeek && prevWeek.entries.length > 0 && effectiveWeekTotal === 0) {
    recommendations.push({
      id: "rec-copy",
      icon: Copy,
      tone: "primary",
      title: t("rec_copy_title"),
      detail: t("rec_copy_detail"),
      applyLabel: t("rec_apply"),
      onApply: handleCopyLastWeek,
    });
  }
  if (!isSubmitted && missingDays > 0 && effectiveWeekTotal > 0) {
    recommendations.push({
      id: "rec-missing",
      icon: AlertTriangle,
      tone: "gold",
      title: t("rec_missing_title", { count: missingDays }),
      detail: t("rec_missing_detail"),
    });
  }
  if (!isSubmitted && nonBillableHours >= 3) {
    recommendations.push({
      id: "rec-unbilled",
      icon: Briefcase,
      tone: "accent",
      title: t("rec_unbilled_title", { hours: nonBillableHours }),
      detail: t("rec_unbilled_detail"),
    });
  }

  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>

      <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
        <PageHeader
          title={t("page_title")}
          actions={week ? <StatusBadge status={weekStatus} /> : undefined}
        />

        <AiRecommendations
          items={recommendations}
          title={t("ai_recs_title")}
          overline={t("ai_recs_overline")}
        />

        <TimesheetsKpis
          totalHours={effectiveWeekTotal}
          targetHours={targetHours}
          billableHours={billableHours}
          overtimeHours={overtimeHours}
        />

        {/* Sticky week header: prev / label / next / today / submit + progress */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-3) var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={t("prev_week")}
              onClick={handlePrevWeek}
            >
              <ChevronLeft size={16} aria-hidden />
            </Button>
            <span
              style={{
                fontSize: "var(--text-heading-3)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-1)",
                minWidth: 220,
                textAlign: "center",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {isLoading ? <Skeleton variant="title" width={200} /> : weekLabel}
            </span>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={t("next_week")}
              onClick={handleNextWeek}
            >
              <ChevronRight size={16} aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              style={{ marginLeft: "var(--space-1)" }}
            >
              {t("today")}
            </Button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              flex: 1,
              minWidth: 160,
            }}
          >
            {isLoading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              <>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--weight-semibold)",
                    fontVariantNumeric: "tabular-nums",
                    color: effectiveWeekTotal > targetHours
                      ? "var(--color-warning)"
                      : "var(--color-text-1)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("hours_of_target", { total: effectiveWeekTotal, target: targetHours })}
                </span>
                <ProgressBar
                  value={progressPct}
                  tone={progressTone}
                  label={t("progress_label", { total: effectiveWeekTotal, target: targetHours })}
                  className={undefined}
                />
              </>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={!canSubmit}
            loading={isSubmitting}
            leadingIcon={isSubmitted ? <CheckCircle size={14} aria-hidden /> : <Send size={14} aria-hidden />}
            onClick={handleSubmit}
          >
            {isSubmitting ? t("submitting") : isSubmitted ? t("submitted_label") : t("submit_week")}
          </Button>
        </div>

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

        {/* Desktop timesheet grid */}
        <div className="hidden md:block">
          <div
            aria-busy={isLoading}
            aria-live="polite"
            style={{
              background: "var(--color-surface-0)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              overflowX: "auto",
              marginBottom: "var(--space-3)",
            }}
          >
            <Table style={{ tableLayout: "auto", width: "100%" }}>
              <THead>
                <TR>
                  <TH style={{ width: 220, minWidth: 180 }}>{t("col_project_client")}</TH>
                  {dates.map((date) => {
                    const isWeekend = weekendDates.has(date);
                    return (
                      <TH
                        key={date}
                        style={{
                          textAlign: "center",
                          minWidth: 56,
                          backgroundColor: isWeekend ? "var(--color-surface-1)" : undefined,
                          color: isWeekend ? "var(--color-text-3)" : undefined,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatDayHeader(date)}
                      </TH>
                    );
                  })}
                  <TH
                    style={{
                      textAlign: "center",
                      minWidth: 60,
                      fontWeight: "var(--weight-semibold)",
                    }}
                  >
                    {t("col_total")}
                  </TH>
                </TR>
              </THead>
              <TBody>
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRow key={i} dateCount={7} />
                ))}

                {isEmpty && (
                  <TR>
                    <TD colSpan={9}>
                      <EmptyState
                        icon={Clock}
                        title={t("empty_title")}
                        description={t("empty_desc")}
                      />
                    </TD>
                  </TR>
                )}

                {!isLoading && entries.map((entry) => {
                  const entryTotal = getEffectiveEntryTotal(entry);
                  return (
                    <TR key={entry.id}>
                      <TD style={{ width: 220, minWidth: 180 }}>
                        <div
                          style={{
                            fontWeight: "var(--weight-medium)",
                            color: "var(--color-text-1)",
                            fontSize: "var(--text-body)",
                          }}
                        >
                          {entry.project_name}
                        </div>
                        <div
                          className="cell-secondary"
                          style={{ fontSize: "var(--text-caption)", marginTop: 2 }}
                        >
                          {entry.client_name}
                        </div>
                      </TD>

                      {dates.map((date) => {
                        const baseHours = entry.hours[date] ?? 0;
                        const isWeekend = weekendDates.has(date);
                        return (
                          <EditableCell
                            key={date}
                            value={baseHours}
                            entryId={entry.id}
                            date={date}
                            edits={edits}
                            onEdit={handleEdit}
                            isWeekend={isWeekend}
                          />
                        );
                      })}

                      <TD
                        style={{
                          textAlign: "center",
                          fontFamily: "var(--font-mono)",
                          fontWeight: "var(--weight-semibold)",
                          fontVariantNumeric: "tabular-nums",
                          color: "var(--color-text-1)",
                          background: "var(--color-surface-0)",
                        }}
                      >
                        {entryTotal > 0 ? `${entryTotal}h` : "-"}
                      </TD>
                    </TR>
                  );
                })}

                {!isLoading && entries.length > 0 && (
                  <TR>
                    <TD
                      style={{
                        fontWeight: "var(--weight-semibold)",
                        color: "var(--color-text-2)",
                        fontSize: "var(--text-caption)",
                        background: "var(--color-surface-1)",
                      }}
                    >
                      {t("daily_total")}
                    </TD>
                    {dates.map((date) => {
                      const dailyTotal = getEffectiveDailyTotal(date);
                      const isWeekend = weekendDates.has(date);
                      const isLow = !isWeekend && dailyTotal > 0 && dailyTotal < 7;
                      return (
                        <TD
                          key={date}
                          style={{
                            textAlign: "center",
                            fontFamily: "var(--font-mono)",
                            fontWeight: "var(--weight-semibold)",
                            fontVariantNumeric: "tabular-nums",
                            background: isWeekend
                              ? "var(--color-surface-1)"
                              : isLow
                                ? "var(--color-warning-muted)"
                                : "var(--color-surface-1)",
                            color: dailyTotal === 0
                              ? "var(--color-text-3)"
                              : "var(--color-text-1)",
                          }}
                        >
                          {dailyTotal > 0 ? `${dailyTotal}h` : "-"}
                        </TD>
                      );
                    })}
                    <TD
                      style={{
                        textAlign: "center",
                        fontFamily: "var(--font-mono)",
                        fontWeight: "var(--weight-semibold)",
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--color-text-1)",
                        background: "var(--color-surface-1)",
                      }}
                    >
                      {effectiveWeekTotal > 0 ? `${effectiveWeekTotal}h` : "-"}
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>

          {!isLoading && (
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<Plus size={14} aria-hidden />}
              onClick={() => setAddRowOpen(true)}
            >
              {t("add_row")}
            </Button>
          )}
        </div>

        {/* Mobile card list */}
        <div className="md:hidden" aria-busy={isLoading} aria-live="polite">
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div className="card" key={i}>
                  <div className="card-body">
                    <Skeleton variant="card" height={64} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isEmpty && (
            <EmptyState
              icon={Clock}
              title={t("empty_title")}
              description={t("empty_mobile_desc")}
            />
          )}

          {!isLoading && entries.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {entries.map((entry) => (
                <MobileEntryCard key={entry.id} entry={entry} edits={edits} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddRowModal
        open={addRowOpen}
        existingIds={existingProjectIds}
        onAdd={handleAddRow}
        onClose={() => setAddRowOpen(false)}
      />
    </>
  );
}
