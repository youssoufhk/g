"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, CalendarX } from "lucide-react";
import { PageHeader } from "@/components/patterns/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CalendarEvent = {
  id: string;
  label: string;
  type: "leave" | "leave-pending" | "milestone" | "holiday";
};

type CalendarDay = {
  date: number;
  month: "prev" | "current" | "next";
  events: CalendarEvent[];
};

// ---------------------------------------------------------------------------
// Static event data for April 2026
// ---------------------------------------------------------------------------

const LEAVE_EVENTS: Array<{ start: number; end: number; label: string; type: CalendarEvent["type"] }> = [
  { start: 10, end: 11, label: "Lucas Ferreira - On leave", type: "leave" },
  { start: 14, end: 14, label: "Omar Hassan - On leave", type: "leave" },
  { start: 21, end: 25, label: "Amara Diallo - Pending leave", type: "leave-pending" },
];

const MILESTONE_EVENTS: Array<{ day: number; label: string }> = [
  { day: 1, label: "HSBC kick-off" },
  { day: 15, label: "BNP review" },
  { day: 28, label: "Invoice drafts" },
  { day: 30, label: "TotalEnergies deadline" },
];

const HOLIDAY_EVENTS: Array<{ month: number; day: number; label: string }> = [
  { month: 3, day: 6, label: "Easter Monday" },  // April = month index 3
  { month: 4, day: 1, label: "Labour Day" },     // May = month index 4
];

function buildEventsMap(year: number, month: number): Record<number, CalendarEvent[]> {
  const map: Record<number, CalendarEvent[]> = {};

  // Holidays for this month
  for (const h of HOLIDAY_EVENTS) {
    if (h.month === month) {
      if (!map[h.day]) map[h.day] = [];
      (map[h.day] as CalendarEvent[]).push({
        id: `holiday-${h.day}`,
        label: h.label,
        type: "holiday",
      });
    }
  }

  // Leave and milestone events only for April 2026
  if (month === 3 && year === 2026) {
    for (const ev of LEAVE_EVENTS) {
      for (let d = ev.start; d <= ev.end; d++) {
        if (!map[d]) map[d] = [];
        (map[d] as CalendarEvent[]).push({ id: `${ev.type}-${d}`, label: ev.label, type: ev.type });
      }
    }

    MILESTONE_EVENTS.forEach((m, i) => {
      if (!map[m.day]) map[m.day] = [];
      (map[m.day] as CalendarEvent[]).push({ id: `milestone-${i}`, label: m.label, type: "milestone" });
    });
  }

  return map;
}

// ---------------------------------------------------------------------------
// Month grid builder
// ---------------------------------------------------------------------------

function buildMonthGrid(year: number, month: number): CalendarDay[][] {
  const eventsMap = buildEventsMap(year, month);
  const firstDow = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarDay[] = [];

  // Trailing days from previous month
  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ date: daysInPrevMonth - i, month: "prev", events: [] });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: d,
      month: "current",
      events: eventsMap[d] ?? [],
    });
  }

  // Leading days from next month to fill last row
  let tail = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: tail++, month: "next", events: [] });
  }

  // Split into rows of 7
  const rows: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Event chip styling
// ---------------------------------------------------------------------------

function milestoneStyle(label: string): React.CSSProperties {
  if (label === "BNP review") {
    return { background: "var(--color-info-muted)", color: "var(--color-info)" };
  }
  if (label === "Invoice drafts") {
    return { background: "var(--color-accent-muted)", color: "var(--color-accent)" };
  }
  if (label === "TotalEnergies deadline") {
    return { background: "var(--color-warning-muted)", color: "var(--color-warning)" };
  }
  return { background: "var(--color-primary-muted)", color: "var(--color-primary)" };
}

function resolvedEventStyle(ev: CalendarEvent): React.CSSProperties {
  switch (ev.type) {
    case "leave":
      return { background: "var(--color-warning-muted)", color: "var(--color-warning)" };
    case "leave-pending":
      return { background: "var(--color-info-muted)", color: "var(--color-info)" };
    case "milestone":
      return milestoneStyle(ev.label);
    case "holiday":
      return { background: "var(--color-gold-muted)", color: "var(--color-gold)" };
  }
}

// ---------------------------------------------------------------------------
// Month / day label helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parseYearMonth(ym: string): { year: number; month: number } {
  const [y, m] = ym.split("-").map(Number);
  return { year: y ?? 2026, month: (m ?? 4) - 1 };
}

function addMonths(ym: string, delta: number): string {
  const { year, month } = parseYearMonth(ym);
  const d = new Date(year, month + delta, 1);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${mo}`;
}

function formatDayHeading(year: number, month: number, date: number): string {
  const dow = new Date(year, month, date).getDay();
  return `${DAY_NAMES_FULL[dow]}, ${date} ${MONTH_NAMES[month]} ${year}`;
}

function formatDateValue(year: number, month: number, date: number): string {
  const mo = String(month + 1).padStart(2, "0");
  const d = String(date).padStart(2, "0");
  return `${year}-${mo}-${d}`;
}

// ---------------------------------------------------------------------------
// Legend items
// ---------------------------------------------------------------------------

const LEGEND_ITEMS = [
  { label: "Leave", dotBg: "var(--color-warning)" },
  { label: "Pending leave", dotBg: "var(--color-info)" },
  { label: "Milestone", dotBg: "var(--color-primary)" },
  { label: "Holiday", dotBg: "var(--color-gold)" },
];

// ---------------------------------------------------------------------------
// Add Event Modal form state
// ---------------------------------------------------------------------------

type AddEventForm = {
  title: string;
  type: "leave" | "holiday" | "milestone" | "meeting";
  date: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const [currentYM, setCurrentYM] = useState("2026-04");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [view, setView] = useState<"month" | "week">("month");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<AddEventForm>({ title: "", type: "meeting", date: "" });

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const { year, month } = parseYearMonth(currentYM);
  const rows = buildMonthGrid(year, month);
  const monthLabel = `${MONTH_NAMES[month]} ${year}`;
  const isCurrentMonth = year === todayYear && month === todayMonth;

  // Events for selected day
  const selectedDayEvents: CalendarEvent[] = (() => {
    if (selectedDate === null) return [];
    const eventsMap = buildEventsMap(year, month);
    return eventsMap[selectedDate] ?? [];
  })();

  function handleDayClick(cell: CalendarDay) {
    if (cell.month !== "current") return;
    if (selectedDate === cell.date) {
      setSelectedDate(null);
    } else {
      setSelectedDate(cell.date);
    }
  }

  function openAddModal(date: number) {
    setAddForm({
      title: "",
      type: "meeting",
      date: formatDateValue(year, month, date),
    });
    setShowAddModal(true);
  }

  function handleCreateEvent() {
    setShowAddModal(false);
    showToastMessage("Event created");
  }

  function showToastMessage(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <>
      <PageHeader title="Calendar" />

      {/* Top bar: month nav + view toggle + Add Event */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-5)",
          flexWrap: "wrap",
        }}
      >
        {/* Month navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Previous month"
            onClick={() => {
              setCurrentYM(addMonths(currentYM, -1));
              setSelectedDate(null);
            }}
          >
            <ChevronLeft size={16} />
          </Button>

          <h2
            style={{
              fontSize: "var(--text-heading-2)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-1)",
              minWidth: 160,
              textAlign: "center",
            }}
          >
            {monthLabel}
          </h2>

          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Next month"
            onClick={() => {
              setCurrentYM(addMonths(currentYM, 1));
              setSelectedDate(null);
            }}
          >
            <ChevronRight size={16} />
          </Button>

          {!isCurrentMonth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const y = String(todayYear);
                const m = String(todayMonth + 1).padStart(2, "0");
                setCurrentYM(`${y}-${m}`);
                setSelectedDate(null);
              }}
            >
              Today
            </Button>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          {(["month", "week"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                padding: "var(--space-1) var(--space-3)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                color: view === v ? "var(--color-text-1)" : "var(--color-text-3)",
                background: view === v ? "var(--color-surface-0)" : "transparent",
                border: "none",
                cursor: "pointer",
                lineHeight: "1.5",
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Event */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            const date = selectedDate ?? todayDate;
            openAddModal(date);
          }}
        >
          <Plus size={14} />
          Add Event
        </Button>
      </div>

      {/* Week view placeholder */}
      {view === "week" && (
        <div
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-12)",
            textAlign: "center",
            color: "var(--color-text-3)",
            fontSize: "var(--text-sm)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <CalendarX size={24} strokeWidth={1.5} />
          <span>Week view is not available yet. Switch back to Month to see all events.</span>
        </div>
      )}

      {/* Month view */}
      {view === "month" && (
        <>
          {/* Calendar grid */}
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                background: "var(--color-surface-0)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                minWidth: 420,
              }}
            >
              {/* Day name header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  background: "var(--color-surface-1)",
                  borderBottom: "0.5px solid var(--color-border-subtle)",
                }}
              >
                {DAY_NAMES_SHORT.map((name) => (
                  <div
                    key={name}
                    style={{
                      padding: "var(--space-2) var(--space-4)",
                      fontSize: "var(--text-caption)",
                      fontWeight: "var(--weight-medium)",
                      color: "var(--color-text-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      textAlign: "center",
                    }}
                  >
                    {name}
                  </div>
                ))}
              </div>

              {/* Week rows */}
              {rows.map((row, ri) => (
                <div
                  key={ri}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    borderBottom:
                      ri < rows.length - 1
                        ? "0.5px solid var(--color-border-subtle)"
                        : undefined,
                  }}
                >
                  {row.map((cell, ci) => {
                    const isToday =
                      isCurrentMonth &&
                      cell.month === "current" &&
                      cell.date === todayDate;
                    const isSelected =
                      cell.month === "current" && cell.date === selectedDate;
                    const isHovered =
                      cell.month === "current" && cell.date === hoveredDate;
                    const isClickable = cell.month === "current";

                    let cellBg = "transparent";
                    if (cell.month !== "current") {
                      cellBg = "var(--color-surface-1)";
                    } else if (isSelected) {
                      cellBg = "var(--color-primary-muted)";
                    } else if (isHovered) {
                      cellBg = "var(--color-surface-1)";
                    }

                    return (
                      <div
                        key={ci}
                        onClick={() => handleDayClick(cell)}
                        onMouseEnter={() => isClickable && setHoveredDate(cell.date)}
                        onMouseLeave={() => setHoveredDate(null)}
                        style={{
                          minHeight: 80,
                          padding: "var(--space-2)",
                          borderLeft:
                            ci > 0
                              ? "0.5px solid var(--color-border-subtle)"
                              : undefined,
                          verticalAlign: "top",
                          background: cellBg,
                          cursor: isClickable ? "pointer" : "default",
                          outline: isSelected
                            ? "1.5px solid var(--color-primary)"
                            : undefined,
                          outlineOffset: "-1.5px",
                          transition: "background 0.1s",
                        }}
                      >
                        {/* Day number */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          {isToday ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: "var(--color-primary)",
                                color: "#fff",
                                fontSize: "var(--text-caption)",
                                fontWeight: "var(--weight-medium)",
                              }}
                            >
                              {cell.date}
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: "var(--text-caption)",
                                fontWeight: "var(--weight-medium)",
                                color:
                                  cell.month !== "current"
                                    ? "var(--color-text-3)"
                                    : "var(--color-text-1)",
                                lineHeight: "24px",
                              }}
                            >
                              {cell.date}
                            </span>
                          )}
                        </div>

                        {/* Event chips */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          {cell.events.map((ev) => (
                            <div
                              key={ev.id}
                              title={ev.label}
                              style={{
                                ...resolvedEventStyle(ev),
                                fontSize: "var(--text-caption)",
                                borderRadius: "var(--radius-sm)",
                                padding: "1px 4px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                lineHeight: "1.4",
                              }}
                            >
                              {ev.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Day Detail Panel */}
          {selectedDate !== null && (
            <div
              style={{
                marginTop: "var(--space-4)",
                background: "var(--color-surface-0)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-5)",
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-4)",
                }}
              >
                <h3
                  style={{
                    fontSize: "var(--text-heading-3)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-text-1)",
                  }}
                >
                  {formatDayHeading(year, month, selectedDate)}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  aria-label="Close day detail"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: "var(--radius-md)",
                    background: "transparent",
                    border: "none",
                    color: "var(--color-text-3)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--color-surface-1)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--color-text-1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--color-text-3)";
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Event list or empty state */}
              {selectedDayEvents.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-6) 0",
                    color: "var(--color-text-3)",
                  }}
                >
                  <CalendarX size={20} strokeWidth={1.5} />
                  <span style={{ fontSize: "var(--text-sm)" }}>No events</span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  {selectedDayEvents.map((ev) => {
                    const style = resolvedEventStyle(ev);
                    return (
                      <div
                        key={ev.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-3)",
                          padding: "var(--space-2) var(--space-3)",
                          borderRadius: "var(--radius-md)",
                          background: "var(--color-surface-1)",
                        }}
                      >
                        {/* Color dot */}
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: style.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--color-text-1)",
                            flex: 1,
                          }}
                        >
                          {ev.label}
                        </span>
                        {/* Type badge */}
                        <span
                          style={{
                            ...style,
                            fontSize: "var(--text-caption)",
                            borderRadius: "var(--radius-sm)",
                            padding: "1px 6px",
                            textTransform: "capitalize",
                          }}
                        >
                          {ev.type.replace("-", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Event button */}
              <div style={{ marginTop: "var(--space-2)" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openAddModal(selectedDate)}
                >
                  <Plus size={14} />
                  Add Event
                </Button>
              </div>
            </div>
          )}

          {/* Legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              marginTop: "var(--space-4)",
              flexWrap: "wrap",
            }}
          >
            {LEGEND_ITEMS.map(({ label, dotBg }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-3)",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: dotBg,
                    flexShrink: 0,
                  }}
                />
                {label}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Event Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Event"
        size="sm"
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateEvent}
              disabled={!addForm.title.trim()}
            >
              Create
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Title */}
          <div>
            <label
              htmlFor="event-title"
              style={{
                display: "block",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-2)",
                marginBottom: "var(--space-1)",
              }}
            >
              Title
            </label>
            <input
              id="event-title"
              type="text"
              value={addForm.title}
              onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Event title"
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-1)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="event-type"
              style={{
                display: "block",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-2)",
                marginBottom: "var(--space-1)",
              }}
            >
              Type
            </label>
            <select
              id="event-type"
              value={addForm.type}
              onChange={(e) =>
                setAddForm((f) => ({
                  ...f,
                  type: e.target.value as AddEventForm["type"],
                }))
              }
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-1)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="leave">Leave</option>
              <option value="holiday">Holiday</option>
              <option value="milestone">Milestone</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="event-date"
              style={{
                display: "block",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-2)",
                marginBottom: "var(--space-1)",
              }}
            >
              Date
            </label>
            <input
              id="event-date"
              type="date"
              value={addForm.date}
              onChange={(e) => setAddForm((f) => ({ ...f, date: e.target.value }))}
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-1)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "var(--space-6)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-surface-3)",
            color: "var(--color-text-1)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-2) var(--space-5)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-medium)",
            zIndex: 2000,
            pointerEvents: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
