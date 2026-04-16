"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/patterns/page-header";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CalendarEvent = {
  id: string;
  label: string;
  type: "leave" | "leave-pending" | "milestone";
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

function buildEventsMap(): Record<number, CalendarEvent[]> {
  const map: Record<number, CalendarEvent[]> = {};

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

  return map;
}

// ---------------------------------------------------------------------------
// Month grid builder
// ---------------------------------------------------------------------------

function buildMonthGrid(year: number, month: number): CalendarDay[][] {
  const eventsMap = buildEventsMap();
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
      events: month === 3 && year === 2026 ? (eventsMap[d] ?? []) : [], // April 2026 = month index 3
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

function eventStyle(type: CalendarEvent["type"]): React.CSSProperties {
  switch (type) {
    case "leave":
      return {
        background: "var(--color-warning-muted)",
        color: "var(--color-warning)",
      };
    case "leave-pending":
      return {
        background: "var(--color-info-muted)",
        color: "var(--color-info)",
      };
    case "milestone":
      return {
        background: "var(--color-primary-muted)",
        color: "var(--color-primary)",
      };
  }
}

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
  // HSBC kick-off
  return { background: "var(--color-primary-muted)", color: "var(--color-primary)" };
}

function resolvedEventStyle(ev: CalendarEvent): React.CSSProperties {
  if (ev.type === "milestone") return milestoneStyle(ev.label);
  return eventStyle(ev.type);
}

// ---------------------------------------------------------------------------
// Month label helper
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const [currentYM, setCurrentYM] = useState("2026-04");
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const { year, month } = parseYearMonth(currentYM);
  const rows = buildMonthGrid(year, month);
  const monthLabel = `${MONTH_NAMES[month]} ${year}`;

  const isCurrentMonth = year === todayYear && month === todayMonth;

  return (
    <>
      <PageHeader title="Calendar" />

      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-5)",
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Previous month"
          onClick={() => setCurrentYM(addMonths(currentYM, -1))}
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
          onClick={() => setCurrentYM(addMonths(currentYM, 1))}
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
            }}
          >
            Today
          </Button>
        )}
      </div>

      {/* Calendar grid - overflow-x-auto for narrow screens */}
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
          {DAY_NAMES.map((name) => (
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

              return (
                <div
                  key={ci}
                  style={{
                    minHeight: 80,
                    padding: "var(--space-2)",
                    borderLeft:
                      ci > 0
                        ? "0.5px solid var(--color-border-subtle)"
                        : undefined,
                    verticalAlign: "top",
                    background:
                      cell.month !== "current"
                        ? "var(--color-surface-1)"
                        : "transparent",
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

                  {/* Events */}
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
        {[
          {
            label: "Leave",
            dotBg: "var(--color-warning)",
          },
          {
            label: "Pending leave",
            dotBg: "var(--color-info)",
          },
          {
            label: "Milestone",
            dotBg: "var(--color-primary)",
          },
        ].map(({ label, dotBg }) => (
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
  );
}
