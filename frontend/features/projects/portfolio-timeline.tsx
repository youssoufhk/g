"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { generateWeekLabels, type WeekLabel } from "@/features/employees/mock-resources";
import type { PortfolioProject } from "./mock-projects-timeline";

const CELL_WIDTH_MIN = 40;
const CELL_WIDTH_MAX = 200;
const LEFT_COL = 300;
const BAR_HEIGHT = 38;
const ROW_MIN = 72;
const MAX_VISIBLE_ROWS = 10;

type Props = {
  projects: PortfolioProject[];
  weekCount: number;
  todayWeekIndex?: number;
};

export function PortfolioTimeline({ projects, weekCount, todayWeekIndex = 1 }: Props) {
  const t = useTranslations("projects");
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
        <h2 className="capacity-timeline-title">{t("portfolio_title")}</h2>
        <span className="capacity-timeline-subtitle tabular-nums">
          {projects.length}{" "}
          {projects.length === 1 ? t("result_project") : t("result_projects")}
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
            {projects.length === 0 && (
              <div className="capacity-timeline-empty">
                <p>{t("empty_no_projects")}</p>
              </div>
            )}
            {projects.map((project) => {
              const rowHeight = ROW_MIN;
              const visibleStart = Math.max(0, project.startWeek);
              const visibleEnd = Math.min(weekCount, project.startWeek + project.duration);
              const effectiveDuration = Math.max(0, visibleEnd - visibleStart);
              const left = visibleStart * cellWidth + 4;
              const width = effectiveDuration * cellWidth - 8;
              const progressWidth = Math.max(0, width * (project.progressPct / 100));
              const isAtRisk = project.status === "at_risk";
              const isUnstaffed = project.status === "unstaffed";
              return (
                <div key={project.id} className="capacity-timeline-row" style={{ height: rowHeight }}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="capacity-timeline-person portfolio-row-info"
                    style={{ width: LEFT_COL }}
                  >
                    <span
                      className="portfolio-row-chip"
                      aria-hidden
                      style={{
                        background: `linear-gradient(135deg, ${project.bg} 0%, ${project.softBg} 100%)`,
                        color: project.fg,
                      }}
                    >
                      {project.code.split("-")[0]}
                    </span>
                    <div className="capacity-timeline-person-text">
                      <div className="capacity-timeline-person-name-row">
                        <span className="capacity-timeline-person-name">{project.name}</span>
                        {isAtRisk ? (
                          <span
                            className="capacity-timeline-over-chip"
                            aria-label={t("status_at_risk")}
                          >
                            <AlertTriangle size={12} />
                          </span>
                        ) : null}
                      </div>
                      <div className="capacity-timeline-person-meta">
                        <span className="capacity-timeline-person-role">{project.client}</span>
                      </div>
                      <div className="capacity-timeline-person-booked">
                        <span className="capacity-timeline-person-pct tabular-nums">
                          {project.progressPct}%
                        </span>
                        <span className="capacity-timeline-person-booked-label">
                          {t("progress_label")}
                        </span>
                        <span className="portfolio-row-sep" />
                        <span
                          className="capacity-timeline-person-pct tabular-nums"
                          data-over={project.budgetPct > 85 ? "true" : undefined}
                        >
                          {project.budgetPct}%
                        </span>
                        <span className="capacity-timeline-person-booked-label">
                          {t("budget_label")}
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
                      style={{ left: todayWeekIndex * cellWidth, width: cellWidth }}
                    />
                    {effectiveDuration > 0 && (
                      <div
                        className="portfolio-timeline-bar"
                        data-status={project.status}
                        style={{
                          left,
                          width,
                          top: (rowHeight - BAR_HEIGHT) / 2,
                          height: BAR_HEIGHT,
                          background: `linear-gradient(135deg, ${project.bg} 0%, ${project.softBg} 100%)`,
                          color: project.fg,
                          opacity: isUnstaffed ? 0.55 : 1,
                        }}
                      >
                        <div
                          className="portfolio-timeline-bar-progress"
                          aria-hidden
                          style={{ width: progressWidth }}
                        />
                        <div className="portfolio-timeline-bar-text">
                          <span className="portfolio-timeline-bar-title">{project.name}</span>
                          <span
                            className="portfolio-timeline-bar-sub tabular-nums"
                            style={{ opacity: 0.85 }}
                          >
                            {project.teamSize} {t("bar_people")} &middot; {effectiveDuration}w
                          </span>
                        </div>
                      </div>
                    )}
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
