"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  type Allocation,
  INITIAL_ALLOCATIONS,
  type Person,
  PROJECTS,
  type WeekLabel,
  clamp,
  generateWeekLabels,
  personWorkLoad,
} from "./mock-resources";

const CELL_WIDTH_MIN = 40;
const CELL_WIDTH_MAX = 200;
const LEFT_COL = 260;
const BAR_HEIGHT = 30;
const LANE_GAP = 4;
const ROW_VPAD = 14;
const ROW_MIN = 64;
const MAX_VISIBLE_ROWS = 10;

function assignLanes(allocs: Allocation[]): Array<{ alloc: Allocation; lane: number }> {
  const sorted = [...allocs].sort((a, b) => a.startWeek - b.startWeek);
  const laneEnds: number[] = [];
  return sorted.map((alloc) => {
    const end = alloc.startWeek + alloc.duration;
    let lane = laneEnds.findIndex((e) => e <= alloc.startWeek);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    return { alloc, lane };
  });
}

function rowHeightForLanes(lanes: number) {
  const n = Math.max(1, lanes);
  return Math.max(ROW_MIN, ROW_VPAD * 2 + n * BAR_HEIGHT + (n - 1) * LANE_GAP);
}

type DragMode = "move" | "resize-l" | "resize-r";

type DragState = {
  id: string;
  mode: DragMode;
  startX: number;
  originStart: number;
  originDuration: number;
};

type Props = {
  people: Person[];
  weekCount: number;
  todayWeekIndex?: number;
};

export function CapacityTimeline({ people, weekCount, todayWeekIndex = 1 }: Props) {
  const t = useTranslations("employees");
  const [allocations, setAllocations] = useState<Allocation[]>([...INITIAL_ALLOCATIONS]);
  const dragRef = useRef<DragState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cellWidth = Math.max(
    CELL_WIDTH_MIN,
    Math.min(CELL_WIDTH_MAX, Math.floor((containerWidth - LEFT_COL) / weekCount)),
  );

  const weekLabels: WeekLabel[] = useMemo(
    () => generateWeekLabels(weekCount),
    [weekCount],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, alloc: Allocation, mode: DragMode) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        id: alloc.id,
        mode,
        startX: e.clientX,
        originStart: alloc.startWeek,
        originDuration: alloc.duration,
      };
      setActiveId(alloc.id);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const deltaWeeks = Math.round((e.clientX - drag.startX) / cellWidth);
      if (deltaWeeks === 0) return;

      setAllocations((prev) =>
        prev.map((a) => {
          if (a.id !== drag.id) return a;
          if (drag.mode === "move") {
            const newStart = clamp(
              drag.originStart + deltaWeeks,
              0,
              weekCount - drag.originDuration,
            );
            return { ...a, startWeek: newStart };
          }
          if (drag.mode === "resize-l") {
            const maxShift = drag.originDuration - 1;
            const shift = clamp(deltaWeeks, -drag.originStart, maxShift);
            return {
              ...a,
              startWeek: drag.originStart + shift,
              duration: drag.originDuration - shift,
            };
          }
          const maxDur = weekCount - drag.originStart;
          const newDuration = clamp(drag.originDuration + deltaWeeks, 1, maxDur);
          return { ...a, duration: newDuration };
        }),
      );
    },
    [weekCount, cellWidth],
  );

  const handlePointerUp = useCallback(() => {
    if (dragRef.current) {
      dragRef.current = null;
      setActiveId(null);
    }
  }, []);

  const byPerson = useMemo(() => {
    const map = new Map<string, Allocation[]>();
    for (const a of allocations) {
      if (!map.has(a.personId)) map.set(a.personId, []);
      map.get(a.personId)!.push(a);
    }
    return map;
  }, [allocations]);

  const timelineWidth = cellWidth * weekCount;

  const bodyMaxHeight = ROW_MIN * MAX_VISIBLE_ROWS;

  return (
    <section className="capacity-timeline glass-strong">
      <div className="capacity-timeline-header">
        <h2 className="capacity-timeline-title">{t("capacity_title")}</h2>
        <span className="capacity-timeline-subtitle tabular-nums">
          {people.length} {people.length === 1 ? t("result_person") : t("result_people")}
        </span>
      </div>

      <div className="capacity-timeline-scroll" ref={scrollRef}>
        <div style={{ minWidth: LEFT_COL + timelineWidth }}>
          <div className="capacity-timeline-week-header">
            <div className="capacity-timeline-left-spacer" style={{ width: LEFT_COL }} />
            <div className="capacity-timeline-weeks" style={{ width: timelineWidth }}>
              {weekLabels.map((w, i) => (
                <div
                  key={w.iso + i}
                  className="capacity-timeline-week-cell"
                  data-today={i === todayWeekIndex ? "true" : undefined}
                  style={{ width: cellWidth }}
                >
                  <span className="capacity-timeline-week-label tabular-nums">
                    {w.date}
                    {i === todayWeekIndex ? (
                      <span className="capacity-timeline-now-chip">{t("now_chip")}</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="capacity-timeline-body"
            style={{ maxHeight: bodyMaxHeight, overflowY: "auto" }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {people.length === 0 && (
              <div className="capacity-timeline-empty">
                <p>{t("empty_no_people")}</p>
              </div>
            )}
            {people.map((person) => {
              const util = personWorkLoad(person.id, allocations, weekCount);
              const isOver = util.overWeeks > 0;
              const allocs = byPerson.get(person.id) ?? [];
              const laned = assignLanes(allocs);
              const laneCount = laned.reduce((m, l) => Math.max(m, l.lane + 1), 1);
              const rowHeight = rowHeightForLanes(laneCount);

              return (
                <div key={person.id} className="capacity-timeline-row" style={{ height: rowHeight }}>
                  <Link
                    href={`/employees/${person.id}`}
                    className="capacity-timeline-person"
                    style={{ width: LEFT_COL }}
                  >
                    <span
                      className="capacity-timeline-person-avatar"
                      data-tone={person.avatarTone}
                      aria-hidden
                    >
                      {person.initials}
                    </span>
                    <div className="capacity-timeline-person-text">
                      <div className="capacity-timeline-person-name-row">
                        <span className="capacity-timeline-person-name">{person.name}</span>
                        {isOver ? (
                          <span className="capacity-timeline-over-chip" aria-label={t("over_capacity")}>
                            <AlertTriangle size={12} />
                          </span>
                        ) : null}
                      </div>
                      <div className="capacity-timeline-person-meta">
                        <span className="capacity-timeline-person-role">{person.role}</span>
                      </div>
                      <div className="capacity-timeline-person-booked">
                        <span
                          className="capacity-timeline-person-pct tabular-nums"
                          data-over={isOver ? "true" : undefined}
                        >
                          {util.avgPct}%
                        </span>
                        <span className="capacity-timeline-person-booked-label">
                          {t("booked_avg")}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="capacity-timeline-person-arrow" />
                  </Link>

                  <div
                    className="capacity-timeline-track"
                    style={{
                      width: timelineWidth,
                      height: rowHeight,
                      backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent ${
                        cellWidth - 1
                      }px, var(--color-border-subtle) ${cellWidth - 1}px, var(--color-border-subtle) ${cellWidth}px)`,
                    }}
                  >
                    <div
                      aria-hidden
                      className="capacity-timeline-today-wash"
                      style={{
                        left: todayWeekIndex * cellWidth,
                        width: cellWidth,
                      }}
                    />
                    {laned.map(({ alloc: a, lane }) => {
                      if (a.startWeek >= weekCount) return null;
                      const project = PROJECTS[a.projectId];
                      const effectiveDuration = Math.min(a.duration, weekCount - a.startWeek);
                      const left = a.startWeek * cellWidth + 4;
                      const width = effectiveDuration * cellWidth - 8;
                      const top = ROW_VPAD + lane * (BAR_HEIGHT + LANE_GAP);
                      const isActive = activeId === a.id;
                      return (
                        <div
                          key={a.id}
                          onPointerDown={(e) => handlePointerDown(e, a, "move")}
                          className="capacity-timeline-bar"
                          data-active={isActive ? "true" : undefined}
                          style={{
                            left,
                            width,
                            top,
                            height: BAR_HEIGHT,
                            background: `linear-gradient(135deg, ${project.bg} 0%, ${project.softBg} 100%)`,
                            color: project.fg,
                          }}
                        >
                          <div
                            onPointerDown={(e) => handlePointerDown(e, a, "resize-l")}
                            className="capacity-timeline-bar-handle capacity-timeline-bar-handle-l"
                            aria-label={t("resize_start")}
                          />
                          <div className="capacity-timeline-bar-text">
                            <span className="capacity-timeline-bar-title">{project.name}</span>
                            <span
                              className="capacity-timeline-bar-sub tabular-nums"
                              style={{ color: project.fg, opacity: 0.8 }}
                            >
                              {a.hoursPerWeek}h &middot; {effectiveDuration}w
                            </span>
                          </div>
                          <div
                            onPointerDown={(e) => handlePointerDown(e, a, "resize-r")}
                            className="capacity-timeline-bar-handle capacity-timeline-bar-handle-r"
                            aria-label={t("resize_end")}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
