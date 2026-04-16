"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen, LayoutList, GanttChartSquare, Plus } from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { FilterBar } from "@/components/patterns/filter-bar";
import { EmptyState } from "@/components/patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { SegControl, type SegOption } from "@/components/ui/seg-control";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { ProgressBar, type ProgressTone } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DataTableWrapper,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/features/projects/use-projects";
import type { Project, ProjectPhase, ProjectListFilters } from "@/features/projects/types";
import { PROJECTS, CLIENTS } from "@/lib/mock-data";

// ── constants ──────────────────────────────────────────────────────────────────

const GANTT_LEFT = 240;
const GANTT_RIGHT = 760;

// ── helpers ────────────────────────────────────────────────────────────────────

function formatEur(n: number): string {
  return "€ " + n.toLocaleString("en-GB");
}

function budgetPct(project: Project): number {
  if (project.budget_eur === 0) return 0;
  return Math.round((project.budget_consumed_eur / project.budget_eur) * 100);
}

function budgetTone(pct: number): ProgressTone {
  if (pct > 90) return "error";
  if (pct > 75) return "warning";
  return "primary";
}

const PHASE_TONE: Record<ProjectPhase, string> = {
  discovery: "default",
  proposal: "info",
  delivery: "primary",
  review: "warning",
  complete: "success",
  at_risk: "error",
  on_hold: "ghost",
};

const PHASE_LABEL: Record<ProjectPhase, string> = {
  discovery: "Discovery",
  proposal: "Proposal",
  delivery: "Delivery",
  review: "Review",
  complete: "Complete",
  at_risk: "At Risk",
  on_hold: "On Hold",
};

function getProjectDates(
  project: Project,
  idx: number,
): { startDate: string; endDate: string; progress: number } {
  const startMonths = [1, 1, 2, 2, 3, 3, 4, 1, 2, 3, 4, 5, 1, 2, 6, 7, 1, 3, 2, 4];
  const endMonths   = [9, 6, 8, 7, 7, 9, 12, 5, 6, 8, 10, 9, 4, 5, 11, 12, 3, 6, 4, 7];
  const sm = startMonths[idx % startMonths.length] ?? 1;
  const em = endMonths[idx % endMonths.length] ?? 6;
  const progress =
    project.status === "complete"
      ? 100
      : project.status === "on_hold"
        ? Math.floor((idx % 3) * 5)
        : 20 + ((idx * 13) % 65);
  return {
    startDate: `2026-${String(sm).padStart(2, "0")}-01`,
    endDate: `2026-${String(em).padStart(2, "0")}-28`,
    progress,
  };
}

const STATUS_COLOR: Record<string, string> = {
  active: "var(--color-primary)",
  complete: "var(--color-success)",
  on_hold: "var(--color-info)",
  cancelled: "var(--color-warning)",
};

type GanttRange = "3m" | "6m" | "12m";

function getRangeDates(range: GanttRange): { start: Date; end: Date } {
  const start = new Date("2026-01-01");
  const end =
    range === "3m"
      ? new Date("2026-03-31")
      : range === "6m"
        ? new Date("2026-06-30")
        : new Date("2026-12-31");
  return { start, end };
}

function dateToMs(d: string | Date): number {
  return typeof d === "string" ? new Date(d).getTime() : d.getTime();
}

// ── view toggle options ────────────────────────────────────────────────────────

type ViewMode = "list" | "gantt";

const VIEW_OPTIONS: Array<SegOption<ViewMode>> = [
  { value: "list", label: "List", icon: <LayoutList size={14} /> },
  { value: "gantt", label: "Gantt", icon: <GanttChartSquare size={14} /> },
];

// ── sub-components ─────────────────────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: ProjectPhase }) {
  return (
    <Badge tone={PHASE_TONE[phase] as Parameters<typeof Badge>[0]["tone"]}>
      {PHASE_LABEL[phase]}
    </Badge>
  );
}

// ── table view ─────────────────────────────────────────────────────────────────

function TableView({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <DataTableWrapper>
        <EmptyState
          icon={FolderOpen}
          title="No projects found"
          description="Try adjusting your filters or create a new project."
        />
      </DataTableWrapper>
    );
  }

  return (
    <DataTableWrapper>
      <Table>
        <THead>
          <TR>
            <TH>Project</TH>
            <TH>Manager</TH>
            <TH>Team</TH>
            <TH>Budget</TH>
            <TH>Consumed</TH>
            <TH>Phase</TH>
            <TH />
          </TR>
        </THead>
        <TBody>
          {projects.map((p) => {
            const pct = budgetPct(p);
            const tone = budgetTone(pct);
            return (
              <TR key={p.id}>
                <TD>
                  <div>
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-primary"
                      style={{ fontWeight: "var(--weight-semibold)" }}
                    >
                      {p.name}
                    </Link>
                    <div style={{ marginTop: "var(--space-0-5)" }}>
                      <Link
                        href={`/clients/${p.client_id}`}
                        style={{
                          fontSize: "var(--text-caption)",
                          color: "var(--color-text-2)",
                        }}
                      >
                        {p.client_name}
                      </Link>
                    </div>
                  </div>
                </TD>
                <TD>
                  <Link
                    href={`/employees/${p.manager_id}`}
                    style={{ fontSize: "var(--text-body-sm)" }}
                  >
                    {p.manager_name}
                  </Link>
                </TD>
                <TD>
                  {p.team_members && p.team_members.length > 0 ? (
                    <AvatarGroup
                      avatars={p.team_members.map((m) => ({ name: m.name }))}
                      size="xs"
                      max={4}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "var(--text-caption)",
                        color: "var(--color-text-3)",
                      }}
                    >
                      -
                    </span>
                  )}
                </TD>
                <TD numeric>{formatEur(p.budget_eur)}</TD>
                <TD>
                  <div style={{ minWidth: 100 }}>
                    <ProgressBar
                      value={pct}
                      tone={tone}
                      label={`${pct}% consumed`}
                    />
                    <div
                      style={{
                        marginTop: "var(--space-0-5)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--text-caption)",
                        color: "var(--color-text-2)",
                        textAlign: "right",
                      }}
                    >
                      {pct}%
                    </div>
                  </div>
                </TD>
                <TD>
                  <PhaseBadge phase={p.phase} />
                </TD>
                <TD>
                  <Link href={`/projects/${p.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </DataTableWrapper>
  );
}

// ── gantt view ─────────────────────────────────────────────────────────────────

function GanttView({
  projects,
  range,
}: {
  projects: Project[];
  range: GanttRange;
}) {
  const { start: rangeStart, end: rangeEnd } = getRangeDates(range);
  const rangeMs = dateToMs(rangeEnd) - dateToMs(rangeStart);
  const today = new Date("2026-04-16");
  const todayPct = Math.min(
    100,
    Math.max(
      0,
      ((dateToMs(today) - dateToMs(rangeStart)) / rangeMs) * 100,
    ),
  );

  const ganttProjects = projects.slice(0, 20);

  // Month labels
  const monthLabels: { label: string; leftPct: number }[] = [];
  const cursor = new Date(rangeStart);
  cursor.setDate(1);
  while (cursor <= rangeEnd) {
    const pct =
      ((dateToMs(cursor) - dateToMs(rangeStart)) / rangeMs) * 100;
    if (pct >= 0 && pct <= 100) {
      monthLabels.push({
        label: cursor.toLocaleString("en-GB", { month: "short" }),
        leftPct: pct,
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (ganttProjects.length === 0) {
    return (
      <div
        style={{
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-12)",
          textAlign: "center",
          color: "var(--color-text-3)",
          fontSize: "var(--text-body-sm)",
        }}
      >
        No projects to display.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--color-surface-1)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {/* Header row with month labels */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
        }}
      >
        <div
          style={{
            width: GANTT_LEFT,
            flexShrink: 0,
            padding: "var(--space-2) var(--space-4)",
            fontSize: "var(--text-caption)",
            color: "var(--color-text-3)",
            fontWeight: "var(--weight-medium)",
            borderRight: "1px solid var(--color-border)",
          }}
        >
          Project
        </div>
        <div
          style={{
            flex: 1,
            position: "relative",
            height: 32,
            minWidth: 0,
          }}
        >
          {monthLabels.map((m) => (
            <span
              key={m.label + m.leftPct}
              style={{
                position: "absolute",
                left: `${m.leftPct}%`,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "var(--text-caption)",
                color: "var(--color-text-3)",
                fontWeight: "var(--weight-medium)",
                paddingLeft: "var(--space-1)",
                whiteSpace: "nowrap",
              }}
            >
              {m.label}
            </span>
          ))}
          {/* Today marker in header */}
          {todayPct >= 0 && todayPct <= 100 && (
            <div
              style={{
                position: "absolute",
                left: `${todayPct}%`,
                top: 0,
                bottom: 0,
                width: 1,
                borderLeft: "2px dashed var(--color-primary)",
                opacity: 0.6,
              }}
            />
          )}
        </div>
      </div>

      {/* Rows */}
      {ganttProjects.map((project, idx) => {
        const { startDate, endDate, progress } = getProjectDates(project, idx);
        const barStart = dateToMs(startDate);
        const barEnd = dateToMs(endDate);
        const color = STATUS_COLOR[project.status] ?? "var(--color-primary)";

        const leftPct = Math.max(
          0,
          ((barStart - dateToMs(rangeStart)) / rangeMs) * 100,
        );
        const rightPct = Math.min(
          100,
          ((barEnd - dateToMs(rangeStart)) / rangeMs) * 100,
        );
        const widthPct = Math.max(0, rightPct - leftPct);
        const isWide = widthPct > 8;

        return (
          <div
            key={project.id}
            style={{
              display: "flex",
              borderBottom: "1px solid var(--color-border-subtle)",
              minHeight: 52,
            }}
          >
            {/* Left: project info */}
            <div
              style={{
                width: GANTT_LEFT,
                flexShrink: 0,
                padding: "var(--space-2) var(--space-4)",
                borderRight: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "var(--space-0-5)",
                minWidth: 0,
              }}
            >
              <Link
                href={`/projects/${project.id}`}
                style={{
                  fontWeight: "var(--weight-semibold)",
                  fontSize: "var(--text-body-sm)",
                  color: "var(--color-text-1)",
                  textDecoration: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                className="hover-primary"
              >
                {project.name}
              </Link>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  minWidth: 0,
                }}
              >
                <Link
                  href={`/clients/${project.client_id}`}
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--color-text-3)",
                    textDecoration: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  className="hover-primary"
                >
                  {project.client_name}
                </Link>
                <PhaseBadge phase={project.phase} />
              </div>
            </div>

            {/* Right: timeline bar */}
            <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
              {/* Today marker */}
              {todayPct >= 0 && todayPct <= 100 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${todayPct}%`,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    borderLeft: "2px dashed var(--color-primary)",
                    opacity: 0.4,
                    zIndex: 1,
                  }}
                />
              )}

              {widthPct > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    height: 22,
                    borderRadius: "var(--radius-sm)",
                    background: `${color}30`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      background: color,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "var(--space-2)",
                    }}
                  >
                    {isWide && progress > 10 && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "#fff",
                          fontWeight: "var(--weight-medium)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {progress}%
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [ganttRange, setGanttRange] = useState<GanttRange>("6m");
  const [filters, setFilters] = useState<ProjectListFilters>({});
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newSaving, setNewSaving] = useState(false);

  function handleNewSave() {
    if (!newName.trim()) return;
    setNewSaving(true);
    setTimeout(() => {
      setNewSaving(false);
      setShowNewModal(false);
      setNewName("");
      setNewClient("");
    }, 800);
  }

  const { data: projects, isLoading, error } = useProjects(filters);

  // For Gantt view: apply filters client-side on mock data
  const ganttProjects = PROJECTS.filter((p) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.client_name.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filters.status && p.status !== filters.status) return false;
    if (filters.client_id && p.client_id !== filters.client_id) return false;
    if (filters.phase && p.phase !== filters.phase) return false;
    return true;
  });

  const CLIENT_OPTIONS = [
    { value: "", label: "All Clients" },
    { value: "c1", label: "HSBC UK" },
    { value: "c2", label: "BNP Paribas" },
    { value: "c3", label: "TotalEnergies" },
    { value: "c4", label: "Renault" },
    { value: "c5", label: "McKinsey" },
  ];

  const PHASE_OPTIONS = [
    { value: "", label: "All Phases" },
    { value: "discovery", label: "Discovery" },
    { value: "proposal", label: "Proposal" },
    { value: "delivery", label: "Delivery" },
    { value: "review", label: "Review" },
    { value: "complete", label: "Complete" },
    { value: "at_risk", label: "At Risk" },
    { value: "on_hold", label: "On Hold" },
  ];

  const STATUS_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "complete", label: "Complete" },
    { value: "on_hold", label: "On Hold" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const count = projects?.length ?? 0;

  const RANGE_OPTIONS: Array<{ value: GanttRange; label: string }> = [
    { value: "3m", label: "3m" },
    { value: "6m", label: "6m" },
    { value: "12m", label: "12m" },
  ];

  return (
    <>
      <PageHeader
        title="Projects"
        count={count}
        actions={
          <>
            <SegControl
              value={view}
              onChange={setView}
              options={VIEW_OPTIONS}
              showLabel
            />
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={16} />}
              onClick={() => setShowNewModal(true)}
            >
              New project
            </Button>
          </>
        }
      />

      <FilterBar
        actions={
          view === "gantt" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-0-5)",
              }}
            >
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGanttRange(opt.value)}
                  style={{
                    padding: "var(--space-1) var(--space-2)",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "var(--text-body-sm)",
                    fontWeight:
                      ganttRange === opt.value
                        ? "var(--weight-semibold)"
                        : "var(--weight-regular)",
                    background:
                      ganttRange === opt.value
                        ? "var(--color-surface-0)"
                        : "transparent",
                    color:
                      ganttRange === opt.value
                        ? "var(--color-text-1)"
                        : "var(--color-text-3)",
                    boxShadow:
                      ganttRange === opt.value
                        ? "var(--shadow-sm)"
                        : "none",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : undefined
        }
      >
        <SearchInput
          placeholder="Search projects..."
          value={filters.search ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value || undefined }))
          }
        />
        <Select
          value={filters.client_id ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              client_id: e.target.value || undefined,
            }))
          }
        >
          {CLIENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Select
          value={filters.phase ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, phase: e.target.value || undefined }))
          }
        >
          {PHASE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <Select
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value || undefined }))
          }
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </FilterBar>

      {error && (
        <div
          className="card"
          style={{ borderColor: "var(--color-error-muted)" }}
        >
          <div className="card-body">
            <p className="text-error text-sm">
              Could not load projects. {(error as Error).message}
            </p>
          </div>
        </div>
      )}

      {isLoading && view === "list" ? (
        <DataTableWrapper>
          <div
            style={{
              padding: "var(--space-4)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="text" style={{ height: 40 }} />
            ))}
          </div>
        </DataTableWrapper>
      ) : view === "list" ? (
        <TableView projects={projects ?? []} />
      ) : (
        <GanttView projects={ganttProjects} range={ganttRange} />
      )}

      <Modal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="New project"
        description="Fill in the details to create a new project."
        footer={
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowNewModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleNewSave}
              disabled={newSaving || !newName.trim()}
            >
              {newSaving ? "Creating..." : "Create project"}
            </Button>
          </div>
        }
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
        >
          <div>
            <label className="form-label" htmlFor="new-project-name">
              Project name
            </label>
            <Input
              id="new-project-name"
              placeholder="e.g. Digital Transformation Phase 2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="new-project-client">
              Client
            </label>
            <select
              id="new-project-client"
              className="form-input"
              value={newClient}
              onChange={(e) => setNewClient(e.target.value)}
            >
              <option value="">Select a client...</option>
              <option value="c1">HSBC UK</option>
              <option value="c2">BNP Paribas</option>
              <option value="c3">TotalEnergies</option>
              <option value="c4">Renault</option>
              <option value="c5">McKinsey</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}
