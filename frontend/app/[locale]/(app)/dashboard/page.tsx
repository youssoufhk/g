"use client";

import Link from "next/link";
import { CheckSquare, Clock, Users, Building2 } from "lucide-react";

import { StatPill } from "@/components/patterns/stat-pill";
import { AIInsightCard } from "@/components/ui/ai-insight-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useDashboardKpis } from "@/features/dashboard/use-kpis";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const TEAM_MEMBERS = [
  { name: "Amara Diallo", title: "Senior Consultant", status: "active" as const },
  { name: "Lucas Ferreira", title: "Project Manager", status: "active" as const },
  { name: "Sophie Martin", title: "Junior Analyst", status: "active" as const },
];

const ACTIVE_PROJECTS = [
  { id: "p1", name: "HSBC Digital Transformation", phase: "Delivery", budget: 63 },
  { id: "p2", name: "BNP Risk Model", phase: "Delivery", budget: 45 },
  { id: "p3", name: "TotalEnergies ESG", phase: "Discovery", budget: 12 },
];

const TIMESHEET_BREAKDOWN = [
  { project: "HSBC Digital Transformation", hours: 23 },
  { project: "BNP Risk Model", hours: 6 },
  { project: "Internal", hours: 1.5 },
];

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardKpis();

  const employees = isLoading ? "-" : (data?.employees_total ?? 0);
  const clients = isLoading ? "-" : (data?.clients_total ?? 0);
  const projectsActive = isLoading ? "-" : (data?.projects_active ?? 0);
  const projectsTotal = isLoading ? "-" : (data?.projects_total ?? 0);
  const pendingApprovals = data?.pending_approvals ?? 0;

  const hoursLogged = data?.timesheets_hours_this_week ?? 37.5;
  const hoursTarget = data?.timesheets_target_hours ?? 40;
  const hoursPercent = Math.round((hoursLogged / hoursTarget) * 100);

  return (
    <>
      {/* Greeting row */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{
              fontSize: "var(--text-heading-2)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-1)",
            }}
          >
            {getGreeting()}
          </h1>
          <p className="text-3 text-sm" style={{ marginTop: "var(--space-0-5)" }}>
            {formatDate()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/timesheets">
            <Button variant="secondary" size="sm" leadingIcon={<Clock size={14} />}>
              Log time
            </Button>
          </Link>
          <Link href="/approvals">
            <Button variant="ghost" size="sm" leadingIcon={<CheckSquare size={14} />}>
              Approvals
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "var(--color-error-muted)" }}>
          <div className="card-body">
            <p className="text-error text-sm">
              Could not load KPIs. {(error as Error).message}
            </p>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="kpi-grid">
        <StatPill
          label="Employees"
          value={employees}
          secondary={isLoading ? undefined : `on roster`}
          accent="primary"
        />
        <StatPill
          label="Clients"
          value={clients}
          secondary={isLoading ? undefined : `signed`}
          accent="info"
        />
        <StatPill
          label="Active projects"
          value={projectsActive}
          secondary={isLoading ? undefined : `/ ${projectsTotal} total`}
          accent="accent"
        />
        <StatPill
          label="Pending approvals"
          value={isLoading ? "-" : pendingApprovals}
          secondary="this week"
          accent="warning"
        />
      </div>

      {/* Main content grid */}
      <div className="grid-60-40">
        {/* Left: week at a glance */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <span className="card-title">Your week at a glance</span>
            <Link href="/timesheets">
              <Button variant="secondary" size="sm">
                Log time
              </Button>
            </Link>
          </div>
          <div className="card-body">
            {/* Hours summary */}
            <div style={{ marginBottom: "var(--space-3)" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "var(--space-1-5)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-2)",
                  }}
                >
                  Hours logged
                </span>
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-text-1)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {hoursLogged}h / {hoursTarget}h
                </span>
              </div>
              <ProgressBar
                value={hoursPercent}
                tone={hoursPercent >= 100 ? "primary" : hoursPercent >= 75 ? "primary" : "warning"}
                label={`${hoursLogged} of ${hoursTarget} hours logged`}
              />
            </div>

            {/* Project breakdown */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
                marginBottom: "var(--space-3)",
              }}
            >
              {TIMESHEET_BREAKDOWN.map((row) => (
                <div
                  key={row.project}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-1)",
                    }}
                  >
                    {row.project}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-2)",
                      fontVariantNumeric: "tabular-nums",
                      minWidth: "3rem",
                      textAlign: "right",
                    }}
                  >
                    {row.hours}h
                  </span>
                </div>
              ))}
            </div>

            {/* Log more link */}
            <div style={{ textAlign: "right" }}>
              <Link
                href="/timesheets"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-primary)",
                  textDecoration: "none",
                }}
              >
                Log more time
              </Link>
            </div>
          </div>
        </div>

        {/* Right: pending actions */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <span className="card-title">Needs your attention</span>
            <Badge tone="default">
              {isLoading ? "..." : `${pendingApprovals} pending`}
            </Badge>
          </div>
          <div className="card-body">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--space-2) 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-1)",
                      fontWeight: "var(--weight-medium)",
                    }}
                  >
                    Expense approvals
                  </p>
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-3)",
                    }}
                  >
                    {isLoading ? "-" : (data?.expenses_pending_count ?? 4)} items
                    totalling €{isLoading ? "-" : (data?.expenses_pending_eur ?? 607.5).toFixed(2)}
                  </p>
                </div>
                <Link href="/approvals">
                  <Button variant="secondary" size="sm">Review</Button>
                </Link>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--space-2) 0",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-1)",
                      fontWeight: "var(--weight-medium)",
                    }}
                  >
                    Outstanding invoices
                  </p>
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-3)",
                    }}
                  >
                    {isLoading ? "-" : (data?.invoices_outstanding_count ?? 2)} invoices
                    -{" "}
                    {isLoading ? "-" : (data?.invoices_overdue_count ?? 1)} overdue
                  </p>
                </div>
                <Link href="/invoices">
                  <Button variant="secondary" size="sm">View</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team snapshot */}
      <div className="grid-3">
        {/* Team card */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <span className="card-title">Team</span>
            <Link href="/employees" className="text-primary text-sm">
              View all
            </Link>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2-5)",
                  }}
                >
                  <Avatar name={member.name} size="sm" status="online" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: "var(--weight-medium)",
                        color: "var(--color-text-1)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {member.name}
                    </p>
                    <p
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-3)",
                      }}
                    >
                      {member.title}
                    </p>
                  </div>
                  <Badge tone="success">Active</Badge>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "var(--space-3)", textAlign: "right" }}>
              <Link
                href="/employees"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-primary)",
                  textDecoration: "none",
                }}
              >
                View all {isLoading ? "" : (data?.employees_total ?? 6)} employees
              </Link>
            </div>
          </div>
        </div>

        {/* Active projects card */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <span className="card-title">Active projects</span>
            <Link href="/projects" className="text-primary text-sm">
              View all
            </Link>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {ACTIVE_PROJECTS.map((project) => (
                <div key={project.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    <Link
                      href={`/projects/${project.id}`}
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-1)",
                        textDecoration: "none",
                        fontWeight: "var(--weight-medium)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                        minWidth: 0,
                        marginRight: "var(--space-2)",
                      }}
                    >
                      {project.name}
                    </Link>
                    <Badge tone={project.phase === "Discovery" ? "info" : "default"}>
                      {project.phase}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={project.budget}
                    tone={project.budget > 80 ? "warning" : "primary"}
                    label={`${project.name} budget ${project.budget}%`}
                  />
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-3)",
                      marginTop: "var(--space-0-5)",
                    }}
                  >
                    {project.budget}% of budget
                  </p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "var(--space-3)", textAlign: "right" }}>
              <Link
                href="/projects"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-primary)",
                  textDecoration: "none",
                }}
              >
                View all {isLoading ? "" : (data?.projects_total ?? 5)} projects
              </Link>
            </div>
          </div>
        </div>

        {/* Revenue snapshot card */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <span className="card-title">Revenue snapshot</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--space-2) 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>
                  Outstanding
                </span>
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-text-1)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  £{isLoading ? "-" : (data?.invoices_outstanding_amount ?? 15120).toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--space-2) 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>
                  Overdue
                </span>
                <Badge tone="error">
                  {isLoading ? "-" : (data?.invoices_overdue_count ?? 1)} invoice
                </Badge>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--space-2) 0",
                }}
              >
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>
                  Pending expenses
                </span>
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-1)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  €{isLoading ? "-" : (data?.expenses_pending_eur ?? 607.5).toFixed(2)}
                </span>
              </div>
            </div>
            <div style={{ marginTop: "var(--space-3)", textAlign: "right" }}>
              <Link
                href="/invoices"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-primary)",
                  textDecoration: "none",
                }}
              >
                View all invoices
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI insights */}
      <AIInsightCard
        title="AI prepared 2 invoice drafts"
        summary={
          <>
            The month-end close agent prepared drafts for{" "}
            <strong>HSBC UK (INV-2026-0042)</strong> and{" "}
            <strong>TotalEnergies (INV-2026-0040)</strong>. Review and send before April 30.
          </>
        }
        evidence={[
          "HSBC UK: £15,120 pending",
          "TotalEnergies: €6,840 pending",
          "Both ready to send - awaiting your review",
        ]}
        actions={
          <Link href="/invoices">
            <Button variant="primary" size="sm">
              Review drafts
            </Button>
          </Link>
        }
      />

      <AIInsightCard
        title="4 expenses need approval"
        summary={
          <>
            Amara Diallo, Lucas Ferreira, Sophie Martin and James Morel have submitted expenses
            totalling <strong>€607.50</strong>.
          </>
        }
        evidence={[
          "Oldest item: 7 days pending",
          "1 item flagged high urgency",
          "Recommended: review before end of week",
        ]}
        actions={
          <Link href="/approvals">
            <Button variant="secondary" size="sm">
              Review expenses
            </Button>
          </Link>
        }
      />
    </>
  );
}
