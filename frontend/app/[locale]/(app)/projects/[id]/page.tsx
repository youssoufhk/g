"use client";

import { use } from "react";
import Link from "next/link";
import { FolderOpen, CheckCircle, Circle } from "lucide-react";

import { EmptyState } from "@/components/patterns/empty-state";
import { StatPill } from "@/components/patterns/stat-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar, type ProgressTone } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useProject } from "@/features/projects/use-projects";
import type { ProjectPhase } from "@/features/projects/types";

// ── helpers ────────────────────────────────────────────────────────────────

function formatEur(n: number): string {
  return "€ " + n.toLocaleString("en-GB");
}

function budgetPct(amount: number, consumed: number): number {
  if (amount === 0) return 0;
  return Math.round((consumed / amount) * 100);
}

function budgetTone(pct: number): ProgressTone {
  if (pct > 90) return "error";
  if (pct > 80) return "warning";
  return "primary";
}

function daysRemaining(endDate: string): number {
  return Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / 86_400_000,
  );
}

type StatAccent = "gold" | "warning" | "error" | "primary" | "info" | "accent";

function daysAccent(days: number): StatAccent {
  if (days < 10) return "error";
  if (days <= 30) return "warning";
  return "accent";
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

// ── page ───────────────────────────────────────────────────────────────────

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <Skeleton variant="title" style={{ height: 32, width: "40%" }} />
        <Skeleton variant="card" style={{ height: 160 }} />
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)" }}
        >
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="card" style={{ height: 80 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Project not found"
        description="This project does not exist or you do not have access."
        action={
          <Link href="/projects">
            <Button variant="primary" size="sm">
              Back to projects
            </Button>
          </Link>
        }
      />
    );
  }

  const pct = budgetPct(project.budget_eur, project.budget_consumed_eur);
  const tone = budgetTone(pct);
  const days = project.end_date ? daysRemaining(project.end_date) : null;

  return (
    <>
      {/* Breadcrumb */}
      <nav
        className="breadcrumb"
        style={{ marginBottom: "var(--space-4)" }}
      >
        <Link href="/projects" style={{ color: "var(--color-text-2)" }}>
          Projects
        </Link>
        <span style={{ color: "var(--color-text-2)", margin: "0 var(--space-2)" }}>
          /
        </span>
        <span style={{ color: "var(--color-text-1)" }}>{project.name}</span>
      </nav>

      {/* Hero card */}
      <div
        className="project-detail-header"
        style={{
          borderTop: "4px solid var(--color-primary)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ flex: 1 }}>
            <div className="project-detail-title">{project.name}</div>
            <div className="project-detail-client">
              <Link href={`/clients/${project.client_id}`}>
                {project.client_name}
              </Link>
              <span
                style={{
                  margin: "0 var(--space-2)",
                  color: "var(--color-text-3)",
                }}
              >
                -
              </span>
              <span>Managed by </span>
              <Link
                href={`/employees/${project.manager_id}`}
                style={{ color: "var(--color-primary)" }}
              >
                {project.manager_name}
              </Link>
            </div>
            <div className="project-detail-badges">
              <Badge
                tone={
                  PHASE_TONE[project.phase] as Parameters<typeof Badge>[0]["tone"]
                }
              >
                {PHASE_LABEL[project.phase]}
              </Badge>
              <Badge
                tone={
                  project.status === "active"
                    ? "success"
                    : project.status === "on_hold"
                      ? "warning"
                      : project.status === "cancelled"
                        ? "error"
                        : "default"
                }
              >
                {project.status.charAt(0).toUpperCase() +
                  project.status.slice(1).replace("_", " ")}
              </Badge>
              <div className="separator" />
              <div className="detail-badge">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>
                  {new Date(project.start_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {" - "}
                  {project.end_date
                    ? new Date(project.end_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Ongoing"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
            <Button variant="ghost" size="sm">
              More
            </Button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid">
        <StatPill
          label="Total budget"
          value={formatEur(project.budget_eur)}
          accent="gold"
        />
        <StatPill
          label="Budget consumed"
          value={`${pct}%`}
          secondary={formatEur(project.budget_consumed_eur)}
          accent={tone === "error" ? "error" : tone === "warning" ? "warning" : "primary"}
        />
        <StatPill
          label="Team size"
          value={project.team_size}
          secondary={project.team_size === 1 ? "person" : "people"}
          accent="info"
        />
        <StatPill
          label="Days remaining"
          value={days === null ? "-" : days < 0 ? "Overdue" : days}
          secondary={
            days !== null && days >= 0
              ? project.end_date
                ? new Date(project.end_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })
                : undefined
              : undefined
          }
          accent={days === null ? "primary" : daysAccent(days)}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team" count={project.team_size}>
            Team
          </TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview">
          <div
            className="detail-tabs-content"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-6)",
            }}
          >
            {/* Left: milestones */}
            <div className="card" style={{ padding: 0 }}>
              <div className="card-header">
                <span className="card-title">Milestones</span>
              </div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                {project.milestones && project.milestones.length > 0 ? (
                  <div className="milestone-list">
                    {project.milestones.map((m, i) => (
                      <div key={i} className="milestone-item">
                        <div
                          className={`milestone-icon ${m.complete ? "complete" : "upcoming"}`}
                        >
                          {m.complete ? (
                            <CheckCircle size={16} />
                          ) : (
                            <Circle size={16} />
                          )}
                        </div>
                        <div className="milestone-content">
                          <div className="milestone-name">{m.name}</div>
                          <div className="milestone-dates">
                            {new Date(m.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No milestones" description="Milestones will appear here once added." />
                )}
              </div>
            </div>

            {/* Right: team */}
            <div className="card" style={{ padding: 0 }}>
              <div className="card-header">
                <span className="card-title">Team</span>
                <Badge tone="default">{project.team_size}</Badge>
              </div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                {project.team_members && project.team_members.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-3)",
                    }}
                  >
                    {project.team_members.map((member) => (
                      <div key={member.id} className="team-member-row">
                        <Avatar name={member.name} size="sm" />
                        <div style={{ flex: 1 }}>
                          <Link
                            href={`/employees/${member.id}`}
                            style={{
                              fontSize: "var(--text-body-sm)",
                              fontWeight: "var(--weight-semibold)",
                              color: "var(--color-text-1)",
                            }}
                          >
                            {member.name}
                          </Link>
                          <div
                            style={{
                              fontSize: "var(--text-caption)",
                              color: "var(--color-text-3)",
                            }}
                          >
                            {member.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No team assigned"
                    description="Team members will appear here once added."
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Team tab */}
        <TabsContent value="team">
          <div className="detail-tabs-content">
            <EmptyState
              title="Full team view"
              description="Detailed team capacity and contribution view is available in Phase 5."
            />
          </div>
        </TabsContent>

        {/* Budget tab */}
        <TabsContent value="budget">
          <div className="detail-tabs-content">
            <EmptyState
              title="Budget breakdown"
              description="Detailed budget tracking by category is available in Phase 5."
            />
          </div>
        </TabsContent>

        {/* Timeline tab */}
        <TabsContent value="timeline">
          <div className="detail-tabs-content">
            <EmptyState
              title="Project timeline"
              description="Interactive Gantt timeline view is available in Phase 6."
            />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
