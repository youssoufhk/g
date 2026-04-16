"use client";

import { PageHeader } from "@/components/patterns/page-header";
import { StatPill } from "@/components/patterns/stat-pill";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Employee = {
  id: string;
  name: string;
  department: string;
  weeks: Array<number | "leave">;
};

// ---------------------------------------------------------------------------
// Mock data
// weeks index: 0=W15 Apr7, 1=W16 Apr14, 2=W17 Apr21, 3=W18 Apr28, 4=W19 May5, 5=W20 May12
// ---------------------------------------------------------------------------

const WEEKS: Array<{ label: string; sublabel: string }> = [
  { label: "W15", sublabel: "Apr 7" },
  { label: "W16", sublabel: "Apr 14" },
  { label: "W17", sublabel: "Apr 21" },
  { label: "W18", sublabel: "Apr 28" },
  { label: "W19", sublabel: "May 5" },
  { label: "W20", sublabel: "May 12" },
];

const EMPLOYEES: Employee[] = [
  {
    id: "e1",
    name: "Amara Diallo",
    department: "Strategy",
    weeks: [87, 87, "leave", "leave", 87, 87],
  },
  {
    id: "e2",
    name: "Lucas Ferreira",
    department: "Operations",
    weeks: [95, 100, 95, 95, 90, 95],
  },
  {
    id: "e3",
    name: "Sophie Martin",
    department: "Finance",
    weeks: [72, 72, 72, 60, 72, 72],
  },
  {
    id: "e4",
    name: "Omar Hassan",
    department: "Strategy",
    weeks: [0, 0, 0, 0, 0, 0],
  },
  {
    id: "e5",
    name: "Chiara Rossi",
    department: "Technology",
    weeks: [60, 60, 60, 60, 60, 60],
  },
  {
    id: "e6",
    name: "James Morel",
    department: "Operations",
    weeks: [100, 95, 100, 100, 95, 100],
  },
];

// ---------------------------------------------------------------------------
// Cell color logic
// ---------------------------------------------------------------------------

type CellInfo = {
  bg: string;
  color: string;
  text: string;
  isLeave: boolean;
};

function cellInfo(value: number | "leave", employeeId: string, weekIndex: number): CellInfo {
  if (value === "leave") {
    return {
      bg: "var(--color-info-muted)",
      color: "var(--color-info)",
      text: "Leave",
      isLeave: true,
    };
  }

  // Omar Hassan: all zeros are on-leave context
  if (employeeId === "e4") {
    return {
      bg: "var(--color-info-muted)",
      color: "var(--color-info)",
      text: "Leave",
      isLeave: true,
    };
  }

  if (value === 0) {
    return {
      bg: "var(--color-surface-2)",
      color: "var(--color-text-3)",
      text: "0%",
      isLeave: false,
    };
  }
  if (value >= 90) {
    return {
      bg: "var(--color-error-muted)",
      color: "var(--color-error)",
      text: `${value}%`,
      isLeave: false,
    };
  }
  if (value >= 75) {
    return {
      bg: "var(--color-warning-muted)",
      color: "var(--color-warning)",
      text: `${value}%`,
      isLeave: false,
    };
  }
  if (value >= 50) {
    return {
      bg: "var(--color-primary-muted)",
      color: "var(--color-primary)",
      text: `${value}%`,
      isLeave: false,
    };
  }
  return {
    bg: "var(--color-surface-2)",
    color: "var(--color-text-3)",
    text: `${value}%`,
    isLeave: false,
  };
}

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

const LEGEND_ITEMS = [
  { label: "Overloaded (>= 90%)", bg: "var(--color-error-muted)", color: "var(--color-error)" },
  { label: "High (>= 75%)", bg: "var(--color-warning-muted)", color: "var(--color-warning)" },
  { label: "Healthy (>= 50%)", bg: "var(--color-primary-muted)", color: "var(--color-primary)" },
  { label: "Under-assigned (< 50%)", bg: "var(--color-surface-2)", color: "var(--color-text-3)" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PlanningPage() {
  return (
    <>
      <PageHeader
        title="Resource Planning"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => console.log("Add allocation")}
          >
            Add allocation
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="kpi-grid" style={{ marginBottom: "var(--space-6)" }}>
        <StatPill
          label="Total capacity"
          value="880h"
          secondary="/ 1,056h available"
        />
        <StatPill
          label="Work time"
          value="83%"
          secondary="team average"
        />
        <StatPill
          label="Overloaded"
          value="1 person"
          secondary="Lucas at 100%"
          accent="error"
        />
        <StatPill
          label="Under-assigned"
          value="2 people"
          secondary="Omar 0%, Chiara 60%"
          accent="warning"
        />
      </div>

      {/* Heatmap table */}
      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `280px repeat(${WEEKS.length}, 1fr)`,
            minWidth: 280 + WEEKS.length * 100,
          }}
        >
          {/* Header row */}
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              fontSize: "var(--text-caption)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-3)",
              background: "var(--color-surface-1)",
              borderBottom: "1px solid var(--color-border-subtle)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Name + Department
          </div>

          {WEEKS.map((wk) => (
            <div
              key={wk.label}
              style={{
                padding: "var(--space-3) var(--space-2)",
                fontSize: "var(--text-caption)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-3)",
                background: "var(--color-surface-1)",
                borderBottom: "1px solid var(--color-border-subtle)",
                borderLeft: "1px solid var(--color-border-subtle)",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <div>{wk.label}</div>
              <div
                style={{
                  fontWeight: "var(--weight-regular)",
                  textTransform: "none",
                  letterSpacing: 0,
                  marginTop: 1,
                }}
              >
                {wk.sublabel}
              </div>
            </div>
          ))}

          {/* Employee rows */}
          {EMPLOYEES.map((emp, ei) => {
            const isLast = ei === EMPLOYEES.length - 1;
            return (
              <>
                {/* Name cell */}
                <div
                  key={`name-${emp.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-3) var(--space-4)",
                    borderBottom: isLast
                      ? undefined
                      : "1px solid var(--color-border-subtle)",
                  }}
                >
                  <Avatar name={emp.name} size="sm" />
                  <div style={{ minWidth: 0 }}>
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
                      {emp.name}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-caption)",
                        color: "var(--color-text-3)",
                        marginTop: 1,
                      }}
                    >
                      {emp.department}
                    </div>
                  </div>
                </div>

                {/* Week cells */}
                {emp.weeks.map((val, wi) => {
                  const info = cellInfo(val, emp.id, wi);
                  return (
                    <div
                      key={`cell-${emp.id}-${wi}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderLeft: "1px solid var(--color-border-subtle)",
                        borderBottom: isLast
                          ? undefined
                          : "1px solid var(--color-border-subtle)",
                        background: info.bg,
                        padding: "var(--space-3) var(--space-2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--text-caption)",
                          fontFamily: info.isLeave
                            ? "var(--font-sans)"
                            : "var(--font-mono)",
                          fontWeight: "var(--weight-medium)",
                          color: info.color,
                          textAlign: "center",
                        }}
                      >
                        {info.text}
                      </span>
                    </div>
                  );
                })}
              </>
            );
          })}
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
        {LEGEND_ITEMS.map(({ label, bg, color }) => (
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
                width: 12,
                height: 12,
                borderRadius: "var(--radius-sm)",
                background: bg,
                border: `1px solid ${color}`,
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
