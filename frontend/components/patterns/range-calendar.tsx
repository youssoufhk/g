"use client";

import { useMemo, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { intlLocale } from "@/lib/format";

export type RangeEventTone = "primary" | "accent" | "gold" | "warning" | "error" | "info" | "success" | "default";

export type RangeEvent = {
  id: string;
  start: string; // ISO yyyy-mm-dd
  end: string;   // ISO yyyy-mm-dd (inclusive)
  tone: RangeEventTone;
  label?: string;
  dot?: boolean; // render as a dot (e.g. public holiday) rather than a fill
};

export type RangeCalendarProps = {
  monthsVisible?: number;        // default 2
  initialMonth?: Date;           // default current month
  events?: RangeEvent[];
  selectedRange?: { start: string; end: string } | null;
  onRangeSelect?: (start: string, end: string) => void;
  minDate?: string;              // ISO
  maxDate?: string;              // ISO
  weekStartsOn?: 0 | 1;          // 0=Sun, 1=Mon (default 1)
  ariaLabel?: string;
};

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fromIso(iso: string): Date {
  const parts = iso.split("-").map(Number);
  return new Date(parts[0]!, parts[1]! - 1, parts[2]!);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function isBetween(iso: string, startIso: string, endIso: string): boolean {
  return iso >= startIso && iso <= endIso;
}

type CellMeta = {
  iso: string;
  inMonth: boolean;
  isToday: boolean;
  events: RangeEvent[];
  isHover: boolean;
  isSelected: boolean;
  rangePos: "start" | "middle" | "end" | "single" | undefined;
};

export function RangeCalendar({
  monthsVisible = 2,
  initialMonth,
  events = [],
  selectedRange,
  onRangeSelect,
  minDate,
  maxDate,
  weekStartsOn = 1,
  ariaLabel,
}: RangeCalendarProps) {
  const t = useTranslations("a11y");
  const locale = useLocale();
  const resolvedIntlLocale = intlLocale(locale);
  const resolvedAriaLabel = ariaLabel ?? t("calendar");
  const [anchorMonth, setAnchorMonth] = useState<Date>(() => startOfMonth(initialMonth ?? new Date()));
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [hoverEnd, setHoverEnd] = useState<string | null>(null);

  const todayIso = toIso(new Date());

  const months = useMemo(() => {
    return Array.from({ length: monthsVisible }, (_, i) => addMonths(anchorMonth, i));
  }, [anchorMonth, monthsVisible]);

  const dayHeaders = useMemo(() => {
    const base = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return weekStartsOn === 1 ? base : ["Sun", ...base.slice(0, 6)];
  }, [weekStartsOn]);

  const eventsByIso = useMemo(() => {
    const map = new Map<string, RangeEvent[]>();
    for (const ev of events) {
      const s = fromIso(ev.start);
      const e = fromIso(ev.end);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        const iso = toIso(d);
        const list = map.get(iso) ?? [];
        list.push(ev);
        map.set(iso, list);
      }
    }
    return map;
  }, [events]);

  const activeRange = useMemo(() => {
    if (dragStart) {
      const end = hoverEnd ?? dragStart;
      const [a, b] = dragStart <= end ? [dragStart, end] : [end, dragStart];
      return { start: a, end: b, dragging: true };
    }
    if (selectedRange) return { ...selectedRange, dragging: false };
    return null;
  }, [dragStart, hoverEnd, selectedRange]);

  const isDisabled = useCallback(
    (iso: string): boolean => {
      if (minDate && iso < minDate) return true;
      if (maxDate && iso > maxDate) return true;
      return false;
    },
    [minDate, maxDate],
  );

  const handleDown = (iso: string) => {
    if (isDisabled(iso)) return;
    setDragStart(iso);
    setHoverEnd(iso);
  };

  const handleEnter = (iso: string) => {
    if (dragStart && !isDisabled(iso)) setHoverEnd(iso);
  };

  const handleUp = (iso: string) => {
    if (!dragStart || isDisabled(iso)) {
      setDragStart(null);
      setHoverEnd(null);
      return;
    }
    const end = iso;
    const [a, b] = dragStart <= end ? [dragStart, end] : [end, dragStart];
    if (onRangeSelect) onRangeSelect(a, b);
    setDragStart(null);
    setHoverEnd(null);
  };

  const buildMonthCells = (monthDate: Date): CellMeta[] => {
    const first = startOfMonth(monthDate);
    const firstWeekday = (first.getDay() + 7 - weekStartsOn) % 7;
    const startCell = new Date(first);
    startCell.setDate(1 - firstWeekday);

    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(startCell);
      d.setDate(startCell.getDate() + i);
      const iso = toIso(d);
      const inMonth = d.getMonth() === monthDate.getMonth();
      const evs = eventsByIso.get(iso) ?? [];
      const inActive = activeRange ? isBetween(iso, activeRange.start, activeRange.end) : false;
      let pos: CellMeta["rangePos"];
      if (activeRange && inActive) {
        if (activeRange.start === activeRange.end) pos = "single";
        else if (iso === activeRange.start) pos = "start";
        else if (iso === activeRange.end) pos = "end";
        else pos = "middle";
      }
      return {
        iso,
        inMonth,
        isToday: iso === todayIso,
        events: evs,
        isHover: !!(dragStart && hoverEnd && isBetween(iso, dragStart < hoverEnd ? dragStart : hoverEnd, dragStart < hoverEnd ? hoverEnd : dragStart)),
        isSelected: inActive,
        rangePos: pos,
      };
    });
  };

  return (
    <div
      className="range-calendar"
      role="application"
      aria-label={resolvedAriaLabel}
      onMouseLeave={() => {
        if (!dragStart) setHoverEnd(null);
      }}
    >
      <div className="range-calendar-toolbar">
        <button
          type="button"
          className="range-calendar-nav"
          onClick={() => setAnchorMonth((m) => addMonths(m, -1))}
          aria-label={t("previous_month")}
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        <button
          type="button"
          className="range-calendar-nav"
          onClick={() => setAnchorMonth(startOfMonth(new Date()))}
          aria-label={t("today")}
        >
          {t("today")}
        </button>
        <button
          type="button"
          className="range-calendar-nav"
          onClick={() => setAnchorMonth((m) => addMonths(m, 1))}
          aria-label={t("next_month")}
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
      <div className="range-calendar-months">
        {months.map((m) => {
          const monthLabel = m.toLocaleDateString(resolvedIntlLocale, { month: "long", year: "numeric" });
          const cells = buildMonthCells(m);
          return (
            <div key={toIso(m)} className="range-calendar-month">
              <header className="range-calendar-month-header">{monthLabel}</header>
              <div className="range-calendar-grid" role="grid" aria-label={monthLabel}>
                {dayHeaders.map((h) => (
                  <div key={h} className="range-calendar-dayhead" role="columnheader">
                    {h}
                  </div>
                ))}
                {cells.map((c) => {
                  const fillEvent = c.events.find((e) => !e.dot);
                  const dotEvent = c.events.find((e) => e.dot);
                  const disabled = isDisabled(c.iso);
                  return (
                    <button
                      key={c.iso}
                      type="button"
                      role="gridcell"
                      className="range-calendar-cell"
                      data-in-month={c.inMonth ? "true" : "false"}
                      data-today={c.isToday ? "true" : undefined}
                      data-selected={c.isSelected ? "true" : undefined}
                      data-range-pos={c.rangePos}
                      data-event-tone={fillEvent?.tone}
                      data-disabled={disabled ? "true" : undefined}
                      aria-label={`${c.iso}${fillEvent?.label ? `: ${fillEvent.label}` : ""}`}
                      aria-pressed={c.isSelected}
                      disabled={disabled}
                      onMouseDown={() => handleDown(c.iso)}
                      onMouseEnter={() => handleEnter(c.iso)}
                      onMouseUp={() => handleUp(c.iso)}
                      onClick={() => {
                        if (!dragStart) handleUp(c.iso);
                      }}
                    >
                      <span className="range-calendar-cell-num">{fromIso(c.iso).getDate()}</span>
                      {dotEvent && <span className="range-calendar-cell-dot" data-tone={dotEvent.tone} aria-hidden />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
