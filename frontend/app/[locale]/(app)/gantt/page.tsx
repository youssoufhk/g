"use client";

import { useState } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

// ---------------------------------------------------------------------------
// Types + data
// ---------------------------------------------------------------------------

type GanttProject = {
  id: string;
  name: string;
  client: string;
  startDate: string; // ISO "YYYY-MM-DD"
  endDate: string;
  color: string;
  progress: number; // 0-100
  opacity?: number;
  phase?: string;
};

const PROJECTS: GanttProject[] = [
  {
    id: "p1",
    name: "HSBC Digital Transformation",
    client: "HSBC UK",
    startDate: "2026-01-15",
    endDate: "2026-09-30",
    color: "var(--color-primary)",
    progress: 63,
    phase: "Delivery",
  },
  {
    id: "p2",
    name: "BNP Risk Model",
    client: "BNP Paribas",
    startDate: "2026-02-01",
    endDate: "2026-06-30",
    color: "var(--color-info)",
    progress: 45,
    phase: "Build",
  },
  {
    id: "p3",
    name: "TotalEnergies ESG",
    client: "TotalEnergies",
    startDate: "2026-03-15",
    endDate: "2026-07-31",
    color: "var(--color-accent)",
    progress: 12,
    phase: "Scoping",
  },
  {
    id: "p4",
    name: "Renault Lean",
    client: "Renault",
    startDate: "2026-01-01",
    endDate: "2026-04-30",
    color: "var(--color-warning)",
    progress: 88,
    phase: "Closing",
  },
  {
    id: "p5",
    name: "McKinsey Alliance",
    client: "McKinsey",
    startDate: "2026-04-01",
    endDate: "2026-12-31",
    color: "var(--color-success)",
    progress: 5,
    opacity: 0.6,
    phase: "On hold",
  },
];

// Timeline constants
const TIMELINE_START = new Date("2026-01-01");
const TIMELINE_END = new Date("2026-12-31");
const TOTAL_DAYS =
  (TIMELINE_END.getTime() - TIMELINE_START.getTime()) / (1000 * 60 * 60 * 24);

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Today marker
const TODAY = new Date("2026-04-16");
const TODAY_PCT =
  ((TODAY.getTime() - TIMELINE_START.getTime()) / (1000 * 60 * 60 * 24) /
    TOTAL_DAYS) *
  100;

function daysSinceStart(dateStr: string): number {
  const d = new Date(dateStr);
  return (d.getTime() - TIMELINE_START.getTime()) / (1000 * 60 * 60 * 24);
}

function durationDays(startStr: string, endStr: string): number {
  const s = new Date(startStr);
  const e = new Date(endStr);
  return (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const LEFT_WIDTH = 220;
const RIGHT_WIDTH = 800;

function MonthHeader() {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      {/* Left spacer */}
      <div style={{ width: LEFT_WIDTH, flexShrink: 0 }} />

      {/* Month columns */}
      <div
        style={{
          width: RIGHT_WIDTH,
          flexShrink: 0,
          display: "flex",
          position: "relative",
        }}
      >
        {MONTH_LABELS.map((m) => (
          <div
            key={m}
            style={{
              width: `${100 / 12}%`,
              padding: "var(--space-2) var(--space-2)",
              fontSize: "var(--text-caption)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-3)",
              textAlign: "center",
              borderLeft: "1px solid var(--color-border-subtle)",
            }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectRow({ project }: { project: GanttProject }) {
  const leftPct =
    (daysSinceStart(project.startDate) / TOTAL_DAYS) * 100;
  const widthPct =
    (durationDays(project.startDate, project.endDate) / TOTAL_DAYS) * 100;

  const widthPx = (widthPct / 100) * RIGHT_WIDTH;
  const isWide = widthPx > 80;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid var(--color-border-subtle)",
        minHeight: 60,
      }}
    >
      {/* Left: project info */}
      <div
        style={{
          width: LEFT_WIDTH,
          flexShrink: 0,
          padding: "var(--space-3) var(--space-4)",
          borderRight: "1px solid var(--color-border-subtle)",
        }}
      >
        <div
          style={{
            fontSize: "var(--text-body)",
            fontWeight: "var(--weight-medium)",
            color: "var(--color-text-1)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {project.name}
        </div>
        <div
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--color-text-3)",
            marginTop: 2,
          }}
        >
          {project.client}
        </div>
      </div>

      {/* Right: bar area */}
      <div
        style={{
          width: RIGHT_WIDTH,
          flexShrink: 0,
          position: "relative",
          padding: "var(--space-2) 0",
        }}
      >
        {/* Month column grid lines */}
        {MONTH_LABELS.map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${(i / 12) * 100}%`,
              width: 1,
              background: "var(--color-border-subtle)",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Bar */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            height: 24,
            borderRadius: "var(--radius-sm)",
            background: project.color,
            opacity: project.opacity ?? 1,
            display: "flex",
            alignItems: "center",
            paddingLeft: "var(--space-2)",
            overflow: "hidden",
          }}
        >
          {isWide && project.phase && (
            <span
              style={{
                fontSize: 10,
                fontWeight: "var(--weight-medium)",
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              {project.phase}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GanttPage() {
  const [range, setRange] = useState<"3 months" | "6 months">("6 months");

  return (
    <>
      <PageHeader title="Project Timeline" />

      {/* View controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-5)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-body)",
            color: "var(--color-text-3)",
          }}
        >
          April 2026 - October 2026
        </span>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {(["3 months", "6 months"] as const).map((r) => (
            <Button
              key={r}
              variant="ghost"
              size="sm"
              onClick={() => setRange(r)}
              style={
                range === r
                  ? {
                      background: "var(--color-surface-2)",
                      color: "var(--color-text-1)",
                    }
                  : undefined
              }
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      {/* Gantt card */}
      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <div style={{ minWidth: LEFT_WIDTH + RIGHT_WIDTH }}>
          <MonthHeader />

          {/* Today marker (positioned relative to the right panel) */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: LEFT_WIDTH + (TODAY_PCT / 100) * RIGHT_WIDTH,
                width: 1,
                borderLeft: "1px dashed var(--color-text-3)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />

            {PROJECTS.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>

      {/* Progress details */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          marginTop: "var(--space-5)",
        }}
      >
        {PROJECTS.map((project) => (
          <div
            key={project.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
            }}
          >
            <div
              style={{
                width: LEFT_WIDTH,
                flexShrink: 0,
                fontSize: "var(--text-caption)",
                color: "var(--color-text-2)",
                fontWeight: "var(--weight-medium)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {project.name}
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
              }}
            >
              <ProgressBar
                value={project.progress}
                tone={
                  project.progress >= 80
                    ? "primary"
                    : project.progress >= 50
                      ? "primary"
                      : project.opacity
                        ? "warning"
                        : "primary"
                }
                label={`${project.name} progress`}
              />
              <span
                style={{
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-3)",
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 36,
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {project.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
