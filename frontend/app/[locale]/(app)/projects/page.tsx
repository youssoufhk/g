"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen, LayoutList, Kanban } from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { FilterBar } from "@/components/patterns/filter-bar";
import { EmptyState } from "@/components/patterns/empty-state";
import { StatPill } from "@/components/patterns/stat-pill";
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
import { useProjects } from "@/features/projects/use-projects";
import type { Project, ProjectPhase, ProjectListFilters } from "@/features/projects/types";

// ── helpers ────────────────────────────────────────────────────────────────

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

// ── view toggle options ────────────────────────────────────────────────────

type ViewMode = "list" | "kanban";

const VIEW_OPTIONS: Array<SegOption<ViewMode>> = [
  { value: "list", label: "List", icon: <LayoutList size={14} /> },
  { value: "kanban", label: "Board", icon: <Kanban size={14} /> },
];

// ── sub-components ─────────────────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: ProjectPhase }) {
  return (
    <Badge tone={PHASE_TONE[phase] as Parameters<typeof Badge>[0]["tone"]}>
      {PHASE_LABEL[phase]}
    </Badge>
  );
}

function BudgetCell({ project }: { project: Project }) {
  const pct = budgetPct(project);
  const tone = budgetTone(pct);
  return (
    <div style={{ minWidth: 120 }}>
      <ProgressBar value={pct} tone={tone} label={`Budget ${pct}%`} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "var(--space-1)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-caption)",
          color: "var(--color-text-2)",
        }}
      >
        <span>{pct}%</span>
        <span>{formatEur(project.budget_eur)}</span>
      </div>
    </div>
  );
}

// ── table view ─────────────────────────────────────────────────────────────

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

// ── kanban view ────────────────────────────────────────────────────────────

type KanbanCol = {
  key: string;
  label: string;
  phases: ProjectPhase[];
};

const KANBAN_COLS: KanbanCol[] = [
  { key: "discovery", label: "Discovery", phases: ["discovery", "proposal"] },
  { key: "inprogress", label: "In Progress", phases: ["delivery", "review"] },
  { key: "complete", label: "Complete", phases: ["complete"] },
];

function KanbanCard({ project }: { project: Project }) {
  const pct = budgetPct(project);
  const tone = budgetTone(pct);

  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
      <div className="project-card">
        <div className="project-card-name">{project.name}</div>
        <div className="project-card-client">
          <Link
            href={`/clients/${project.client_id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {project.client_name}
          </Link>
        </div>
        <div className="card-budget">
          <div className="card-budget-header">
            <span className="card-budget-label">Budget</span>
            <span className="card-budget-pct">{pct}%</span>
          </div>
          <ProgressBar value={pct} tone={tone} label={`Budget ${pct}%`} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "var(--space-3)",
          }}
        >
          {project.team_members && project.team_members.length > 0 ? (
            <AvatarGroup
              avatars={project.team_members.map((m) => ({ name: m.name }))}
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
              No team assigned
            </span>
          )}
          <PhaseBadge phase={project.phase} />
        </div>
      </div>
    </Link>
  );
}

function KanbanView({ projects }: { projects: Project[] }) {
  return (
    <div className="kanban-board">
      {KANBAN_COLS.map((col) => {
        const colProjects = projects.filter((p) =>
          col.phases.includes(p.phase),
        );
        return (
          <div key={col.key} className="kanban-column">
            <div className="kanban-column-header">
              <span className="col-title">{col.label}</span>
              <span className="col-count">{colProjects.length}</span>
            </div>
            <div
              className="kanban-cards"
              style={{ overflowY: "auto", maxHeight: "70vh" }}
            >
              {colProjects.length === 0 ? (
                <div
                  style={{
                    padding: "var(--space-6)",
                    textAlign: "center",
                    color: "var(--color-text-3)",
                    fontSize: "var(--text-caption)",
                  }}
                >
                  No projects
                </div>
              ) : (
                colProjects.map((p) => <KanbanCard key={p.id} project={p} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<ProjectListFilters>({});

  const { data: projects, isLoading, error } = useProjects(filters);

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
            <Button variant="primary" size="md">
              New project
            </Button>
          </>
        }
      />

      <FilterBar>
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

      {isLoading ? (
        <DataTableWrapper>
          <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="text" style={{ height: 40 }} />
            ))}
          </div>
        </DataTableWrapper>
      ) : view === "list" ? (
        <TableView projects={projects ?? []} />
      ) : (
        <KanbanView projects={projects ?? []} />
      )}
    </>
  );
}
