"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Plus, X, CalendarX } from "lucide-react";
import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/patterns/empty-state";
import { MultiSelectPill } from "@/components/patterns/multi-select-pill";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { intlLocale as toIntlLocale } from "@/lib/format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EventTypeKey = "leave" | "leave-pending" | "milestone" | "holiday";
type FilterTypeKey = "leave" | "milestone" | "holiday";

type CalendarEvent = {
  id: string;
  label: string;
  type: EventTypeKey;
};

type CalendarDay = {
  date: number;
  month: "prev" | "current" | "next";
  events: CalendarEvent[];
};

// ---------------------------------------------------------------------------
// Static event data for April 2026
// ---------------------------------------------------------------------------

const LEAVE_EVENTS: Array<{ start: number; end: number; label: string; type: EventTypeKey }> = [
  { start: 10, end: 11, label: "Lucas Ferreira", type: "leave" },
  { start: 14, end: 14, label: "Omar Hassan", type: "leave" },
  { start: 21, end: 25, label: "Amara Diallo", type: "leave-pending" },
];

const MILESTONE_EVENTS: Array<{ day: number; label: string }> = [
  { day: 1, label: "HSBC kick-off" },
  { day: 15, label: "BNP review" },
  { day: 28, label: "Invoice drafts" },
  { day: 30, label: "TotalEnergies deadline" },
];

const HOLIDAY_EVENTS: Array<{ month: number; day: number; label: string }> = [
  { month: 3, day: 6, label: "Easter Monday" },
  { month: 4, day: 1, label: "Labour Day" },
];

function buildEventsMap(year: number, month: number): Record<number, CalendarEvent[]> {
  const map: Record<number, CalendarEvent[]> = {};

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

function buildMonthGrid(
  year: number,
  month: number,
  activeTypes: Set<FilterTypeKey>,
): CalendarDay[][] {
  const eventsMap = buildEventsMap(year, month);
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarDay[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ date: daysInPrevMonth - i, month: "prev", events: [] });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const raw = eventsMap[d] ?? [];
    const filtered = raw.filter((ev) => {
      if (ev.type === "leave" || ev.type === "leave-pending") return activeTypes.has("leave");
      if (ev.type === "milestone") return activeTypes.has("milestone");
      if (ev.type === "holiday") return activeTypes.has("holiday");
      return true;
    });
    cells.push({ date: d, month: "current", events: filtered });
  }

  let tail = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: tail++, month: "next", events: [] });
  }

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
// YM helpers
// ---------------------------------------------------------------------------

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

function formatDateValue(year: number, month: number, date: number): string {
  const mo = String(month + 1).padStart(2, "0");
  const d = String(date).padStart(2, "0");
  return `${year}-${mo}-${d}`;
}

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
  const t = useTranslations("calendar");
  const locale = useLocale();
  const intlLocale = toIntlLocale(locale);

  const [currentYM, setCurrentYM] = useState("2026-04");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [view, setView] = useState<"month" | "week">("month");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<AddEventForm>({ title: "", type: "meeting", date: "" });
  const [activeTypeFilters, setActiveTypeFilters] = useState<FilterTypeKey[]>([
    "leave",
    "milestone",
    "holiday",
  ]);

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const { year, month } = parseYearMonth(currentYM);

  // Localized month + day labels from Intl (no hardcoded English arrays).
  const monthLongLabel = useMemo(
    () => new Date(year, month, 1).toLocaleDateString(intlLocale, { month: "long", year: "numeric" }),
    [year, month, intlLocale],
  );

  const dayNamesShort = useMemo(() => {
    // Build Sun..Sat short names using any known Sunday as a reference.
    const base = new Date(2024, 0, 7); // 2024-01-07 is a Sunday
    const out: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      out.push(d.toLocaleDateString(intlLocale, { weekday: "short" }));
    }
    return out;
  }, [intlLocale]);

  const activeTypeSet = useMemo(() => new Set(activeTypeFilters), [activeTypeFilters]);
  const rows = useMemo(
    () => buildMonthGrid(year, month, activeTypeSet),
    [year, month, activeTypeSet],
  );
  const isCurrentMonth = year === todayYear && month === todayMonth;

  // Totals for empty-month detection (after filters)
  const visibleEventCount = useMemo(
    () => rows.reduce((acc, row) => acc + row.reduce((a, c) => a + c.events.length, 0), 0),
    [rows],
  );

  const selectedDayEvents: CalendarEvent[] = (() => {
    if (selectedDate === null) return [];
    const eventsMap = buildEventsMap(year, month);
    const raw = eventsMap[selectedDate] ?? [];
    return raw.filter((ev) => {
      if (ev.type === "leave" || ev.type === "leave-pending") return activeTypeSet.has("leave");
      if (ev.type === "milestone") return activeTypeSet.has("milestone");
      if (ev.type === "holiday") return activeTypeSet.has("holiday");
      return true;
    });
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
    showToastMessage(t("toast_created"));
  }

  function showToastMessage(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function typeLabel(type: EventTypeKey): string {
    switch (type) {
      case "leave":
        return t("type_leave");
      case "leave-pending":
        return t("type_leave_pending");
      case "milestone":
        return t("type_milestone");
      case "holiday":
        return t("type_holiday");
    }
  }

  const typeFilterOptions = [
    { value: "leave", label: t("type_leave") },
    { value: "milestone", label: t("type_milestone") },
    { value: "holiday", label: t("type_holiday") },
  ];

  const legendItems = [
    { label: t("type_leave"), dotBg: "var(--color-warning)" },
    { label: t("type_leave_pending"), dotBg: "var(--color-info)" },
    { label: t("type_milestone"), dotBg: "var(--color-primary)" },
    { label: t("type_holiday"), dotBg: "var(--color-gold)" },
  ];

  function formatDayHeading(y: number, m: number, d: number): string {
    return new Date(y, m, d).toLocaleDateString(intlLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>

      <PageHeader title={t("page_title")} />

      {/* Sticky month header: nav + today + filter chips + view toggle + Add */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--color-surface-0)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-2) 0",
          marginBottom: "var(--space-5)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t("prev_month")}
            onClick={() => {
              setCurrentYM(addMonths(currentYM, -1));
              setSelectedDate(null);
            }}
          >
            <ChevronLeft size={16} />
          </Button>

          <h2
            aria-live="polite"
            style={{
              fontSize: "var(--text-heading-2)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-1)",
              minWidth: 180,
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {monthLongLabel}
          </h2>

          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t("next_month")}
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
              {t("today")}
            </Button>
          )}
        </div>

        {/* Filter chip */}
        <MultiSelectPill
          label={t("filter_event_type")}
          options={typeFilterOptions}
          selected={activeTypeFilters}
          onChange={(next) => setActiveTypeFilters(next as FilterTypeKey[])}
          searchPlaceholder={t("filter_search_placeholder")}
          emptyLabel={t("filter_empty")}
        />

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
              {v === "month" ? t("view_month") : t("view_week")}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            const date = selectedDate ?? todayDate;
            openAddModal(date);
          }}
        >
          <Plus size={16} />
          {t("add_event")}
        </Button>
      </div>

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
          <span>{t("week_view_unavailable")}</span>
        </div>
      )}

      {view === "month" && (
        <>
          <div style={{ overflowX: "auto" }} aria-busy={false}>
            <div
              style={{
                background: "var(--color-surface-0)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                minWidth: 420,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  background: "var(--color-surface-1)",
                  borderBottom: "0.5px solid var(--color-border-subtle)",
                }}
              >
                {dayNamesShort.map((name) => (
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
                        }}
                      >
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
                                color: "var(--color-text-on-primary)",
                                fontSize: "var(--text-caption)",
                                fontWeight: "var(--weight-medium)",
                                fontVariantNumeric: "tabular-nums",
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
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {cell.date}
                            </span>
                          )}
                        </div>

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

          {/* Empty-month state (applies when filters hide everything or month has no data) */}
          {visibleEventCount === 0 && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <EmptyState
                icon={CalendarX}
                title={t("empty_month_title")}
                description={t("empty_month_desc")}
              />
            </div>
          )}

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
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatDayHeading(year, month, selectedDate)}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  aria-label={t("close_day_detail")}
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
                >
                  <X size={16} />
                </button>
              </div>

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
                  <span style={{ fontSize: "var(--text-sm)" }}>{t("no_events")}</span>
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
                        <span
                          style={{
                            ...style,
                            fontSize: "var(--text-caption)",
                            borderRadius: "var(--radius-sm)",
                            padding: "1px 6px",
                          }}
                        >
                          {typeLabel(ev.type)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: "var(--space-2)" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openAddModal(selectedDate)}
                >
                  <Plus size={16} />
                  {t("add_event")}
                </Button>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              marginTop: "var(--space-4)",
              flexWrap: "wrap",
            }}
          >
            {legendItems.map(({ label, dotBg }) => (
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

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t("add_event")}
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateEvent}
              disabled={!addForm.title.trim()}
            >
              {t("create")}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
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
              {t("form_title")}
            </label>
            <input
              id="event-title"
              type="text"
              value={addForm.title}
              onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={t("form_title_placeholder")}
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
              {t("form_type")}
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
              <option value="leave">{t("type_leave")}</option>
              <option value="holiday">{t("type_holiday")}</option>
              <option value="milestone">{t("type_milestone")}</option>
              <option value="meeting">{t("type_meeting")}</option>
            </select>
          </div>

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
              {t("form_date")}
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
                fontVariantNumeric: "tabular-nums",
              }}
            />
          </div>
        </div>
      </Modal>

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
            boxShadow: "var(--shadow-3)",
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
