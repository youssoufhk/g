"use client";

import { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  CheckCircle,
  Send,
} from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/patterns/empty-state";
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
import type { TimesheetEntry } from "@/features/timesheets/types";

// ── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentMonday(): string {
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getISOWeekNumber(dateStr: string): number {
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function formatWeekLabel(weekStart: string): string {
  const dates = getWeekDates(weekStart);
  const mon = new Date(dates[0] as string);
  const sun = new Date(dates[6] as string);
  const week = getISOWeekNumber(weekStart);
  const monStr = `${MONTH_SHORT[mon.getMonth()]} ${mon.getDate()}`;
  const sunStr = `${sun.getDate()}, ${sun.getFullYear()}`;
  return `Week ${week} · ${monStr} - ${sunStr}`;
}

function formatDayHeader(iso: string): string {
  const d = new Date(iso);
  const dayIdx = (d.getDay() + 6) % 7; // 0=Mon
  return `${DAY_SHORT[dayIdx]} ${d.getDate()}`;
}

function formatHours(h: number): string {
  if (h === 0) return "-";
  return String(h);
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "draft" | "submitted" | "approved" }) {
  switch (status) {
    case "approved":
      return <Badge tone="success" dot>Approved</Badge>;
    case "submitted":
      return <Badge tone="info" dot>Submitted</Badge>;
    default:
      return <Badge tone="default" dot>Draft</Badge>;
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
      aria-label={`${current} hours`}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-body)",
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
    <div
      className="card"
      style={{ padding: 0 }}
    >
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
  const available = AVAILABLE_PROJECTS.filter((p) => !existingIds.includes(p.id));
  const [selected, setSelected] = useState(available[0]?.id ?? "");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add project row"
      description="Select a project to track hours for this week."
      size="sm"
      footer={
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              const proj = AVAILABLE_PROJECTS.find((p) => p.id === selected);
              if (proj) { onAdd(proj); onClose(); }
            }}
          >
            Add row
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <label style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>
          Project
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
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(getCurrentMonday);
  const [edits, setEdits] = useState<CellEdits>({});
  const [weekStatus, setWeekStatus] = useState<"draft" | "submitted" | "approved">("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addRowOpen, setAddRowOpen] = useState(false);
  const [extraEntries, setExtraEntries] = useState<TimesheetEntry[]>([]);

  const { data: week, isLoading } = useTimesheetWeek(currentWeekStart);

  const dates = getWeekDates(currentWeekStart);
  const weekendDates = new Set([dates[5], dates[6]]);

  const baseEntries = week?.entries ?? [];
  const entries = [...baseEntries, ...extraEntries];
  const existingProjectIds = baseEntries.map((e) => e.project_id);
  const isEmpty = !isLoading && entries.length === 0;

  function handleEdit(key: string, val: number) {
    setEdits((prev) => ({ ...prev, [key]: val }));
  }

  // Compute effective totals (applying local edits)
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

  function getEffectiveWeekTotal(): number {
    return entries.reduce((sum, e) => sum + getEffectiveEntryTotal(e), 0);
  }

  const effectiveWeekTotal = getEffectiveWeekTotal();
  const targetHours = week?.target_hours ?? 40;
  const progressPct = targetHours > 0 ? Math.min(100, (effectiveWeekTotal / targetHours) * 100) : 0;
  const progressTone = weekStatus === "submitted" || weekStatus === "approved"
    ? "primary"
    : effectiveWeekTotal > targetHours
      ? "warning"
      : "primary";

  const isSubmitted = weekStatus === "submitted" || weekStatus === "approved";
  const canSubmit = !isSubmitted && effectiveWeekTotal > 0 && !isSubmitting;

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

  return (
    <>
      <PageHeader
        title="Timesheets"
        actions={week ? <StatusBadge status={weekStatus} /> : undefined}
      />

      {/* Status bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          background: "var(--color-surface-0)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-3) var(--space-4)",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: "var(--text-body)",
            color: "var(--color-text-2)",
            whiteSpace: "nowrap",
          }}
        >
          {isLoading ? (
            <Skeleton variant="text" width={200} />
          ) : (
            <>
              Week of{" "}
              <span style={{ color: "var(--color-text-1)", fontWeight: "var(--weight-medium)" }}>
                {formatWeekLabel(currentWeekStart)}
              </span>
            </>
          )}
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
                  color: effectiveWeekTotal > targetHours
                    ? "var(--color-warning)"
                    : "var(--color-text-1)",
                  whiteSpace: "nowrap",
                }}
              >
                {effectiveWeekTotal}h / {targetHours}h
              </span>
              <ProgressBar
                value={progressPct}
                tone={progressTone}
                label={`${effectiveWeekTotal} of ${targetHours} hours`}
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
          leadingIcon={isSubmitted ? <CheckCircle size={14} /> : <Send size={14} />}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : isSubmitted ? "Submitted" : "Submit week"}
        </Button>
      </div>

      {/* Week navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Previous week"
          onClick={handlePrevWeek}
        >
          <ChevronLeft size={16} />
        </Button>

        <span
          style={{
            fontSize: "var(--text-heading-3)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-1)",
            minWidth: 200,
            textAlign: "center",
          }}
        >
          {isLoading ? <Skeleton variant="title" width={200} /> : formatWeekLabel(currentWeekStart)}
        </span>

        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Next week"
          onClick={handleNextWeek}
        >
          <ChevronRight size={16} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToday}
          style={{ marginLeft: "var(--space-2)" }}
        >
          Today
        </Button>
      </div>

      {/* Desktop timesheet grid */}
      <div className="hidden md:block">
        <div
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            overflowX: "auto",
            marginBottom: "var(--space-3)",
          }}
        >
          <table
            className="data-table"
            style={{ tableLayout: "auto", width: "100%" }}
          >
            <THead>
              <TR>
                <TH style={{ width: 220, minWidth: 180 }}>Project / Client</TH>
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
                  Total
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
                      title="No entries yet"
                      description="Click any cell to add hours to a project."
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
                        color: "var(--color-text-1)",
                        background: "var(--color-surface-0)",
                      }}
                    >
                      {entryTotal > 0 ? `${entryTotal}h` : "-"}
                    </TD>
                  </TR>
                );
              })}

              {/* Daily totals footer row */}
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
                    Daily total
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
                      color: "var(--color-text-1)",
                      background: "var(--color-surface-1)",
                    }}
                  >
                    {effectiveWeekTotal > 0 ? `${effectiveWeekTotal}h` : "-"}
                  </TD>
                </TR>
              )}
            </TBody>
          </table>
        </div>

        {/* Add row button */}
        {!isLoading && (
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<Plus size={14} />}
            onClick={() => setAddRowOpen(true)}
          >
            Add project row
          </Button>
        )}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden">
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
            title="No entries yet"
            description="Switch to desktop to add hours."
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

      <AddRowModal
        open={addRowOpen}
        existingIds={existingProjectIds}
        onAdd={handleAddRow}
        onClose={() => setAddRowOpen(false)}
      />
    </>
  );
}
