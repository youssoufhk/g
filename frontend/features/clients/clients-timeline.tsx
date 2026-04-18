"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { generateWeekLabels, type WeekLabel } from "@/features/employees/mock-resources";
import type { PortfolioClient } from "./mock-clients-timeline";

const CELL_WIDTH_MIN = 40;
const CELL_WIDTH_MAX = 200;
const LEFT_COL = 300;
const BAR_HEIGHT = 26;
const LANE_GAP = 4;
const ROW_VPAD = 14;
const ROW_MIN = 72;
const MAX_VISIBLE_ROWS = 10;

type Engagement = PortfolioClient["engagements"][number];

function assignLanes(engagements: Engagement[]): Array<{ e: Engagement; lane: number }> {
  const sorted = [...engagements].sort((a, b) => a.startWeek - b.startWeek);
  const laneEnds: number[] = [];
  return sorted.map((e) => {
    const end = e.startWeek + e.duration;
    let lane = laneEnds.findIndex((le) => le <= e.startWeek);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    return { e, lane };
  });
}

function rowHeightForLanes(n: number) {
  const lanes = Math.max(1, n);
  return Math.max(ROW_MIN, ROW_VPAD * 2 + lanes * BAR_HEIGHT + (lanes - 1) * LANE_GAP);
}

type Props = {
  clients: PortfolioClient[];
  weekCount: number;
  todayWeekIndex?: number;
};

export function ClientsTimeline({ clients, weekCount, todayWeekIndex = 1 }: Props) {
  const t = useTranslations("clients");
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

  const weekLabels: WeekLabel[] = generateWeekLabels(weekCount);
  const timelineWidth = cellWidth * weekCount;
  const bodyMaxHeight = ROW_MIN * MAX_VISIBLE_ROWS;

  return (
    <section className="capacity-timeline glass-strong">
      <div className="capacity-timeline-header">
        <h2 className="capacity-timeline-title">{t("engagements_title")}</h2>
        <span className="capacity-timeline-subtitle tabular-nums">
          {clients.length}{" "}
          {clients.length === 1 ? t("result_client") : t("result_clients")}
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
          >
            {clients.length === 0 && (
              <div className="capacity-timeline-empty">
                <p>{t("empty_no_clients")}</p>
              </div>
            )}
            {clients.map((client) => {
              const laned = assignLanes(client.engagements);
              const laneCount = laned.reduce((m, l) => Math.max(m, l.lane + 1), 1);
              const rowHeight = rowHeightForLanes(laneCount);
              const isAtRisk = client.status === "at_risk";
              const renewalChip =
                client.status === "renewal_due" && client.renewalInWeeks > 0
                  ? t("renewal_in", { weeks: client.renewalInWeeks })
                  : null;

              return (
                <div key={client.id} className="capacity-timeline-row" style={{ height: rowHeight }}>
                  <Link
                    href={`/clients/${client.id}`}
                    className="capacity-timeline-person portfolio-row-info"
                    style={{ width: LEFT_COL }}
                  >
                    <span
                      className="portfolio-row-chip"
                      aria-hidden
                      style={{ background: client.logoBg, color: client.logoFg }}
                    >
                      {client.code}
                    </span>
                    <div className="capacity-timeline-person-text">
                      <div className="capacity-timeline-person-name-row">
                        <span className="capacity-timeline-person-name">{client.name}</span>
                        {isAtRisk ? (
                          <span
                            className="capacity-timeline-over-chip"
                            aria-label={t("status_at_risk")}
                          >
                            <AlertTriangle size={10} />
                          </span>
                        ) : null}
                        {renewalChip ? (
                          <span className="clients-renewal-chip">{renewalChip}</span>
                        ) : null}
                      </div>
                      <div className="capacity-timeline-person-meta">
                        <span className="capacity-timeline-person-role">{client.sector}</span>
                      </div>
                      <div className="capacity-timeline-person-booked">
                        <span className="capacity-timeline-person-pct tabular-nums">
                          {client.engagements.length}
                        </span>
                        <span className="capacity-timeline-person-booked-label">
                          {client.engagements.length === 1
                            ? t("engagement_label")
                            : t("engagements_label")}
                        </span>
                        <span className="portfolio-row-sep" />
                        <span
                          className="capacity-timeline-person-pct tabular-nums"
                          data-over={client.healthScore < 60 ? "true" : undefined}
                        >
                          {client.healthScore}
                        </span>
                        <span className="capacity-timeline-person-booked-label">
                          {t("health_label")}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="capacity-timeline-person-arrow" />
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
                      style={{ left: todayWeekIndex * cellWidth, width: cellWidth }}
                    />
                    {laned.map(({ e, lane }) => {
                      if (e.startWeek >= weekCount) return null;
                      const effectiveDuration = Math.min(e.duration, weekCount - e.startWeek);
                      const left = e.startWeek * cellWidth + 4;
                      const width = effectiveDuration * cellWidth - 8;
                      const top = ROW_VPAD + lane * (BAR_HEIGHT + LANE_GAP);
                      return (
                        <div
                          key={e.id}
                          className="clients-engagement-bar"
                          style={{
                            left,
                            width,
                            top,
                            height: BAR_HEIGHT,
                            background: `linear-gradient(135deg, ${e.bg} 0%, ${e.softBg} 100%)`,
                          }}
                        >
                          <span className="clients-engagement-bar-title">{e.projectName}</span>
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
