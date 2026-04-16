"use client";

import Link from "next/link";
import { CheckSquare, Clock, Users, Building2 } from "lucide-react";

import { StatPill } from "@/components/patterns/stat-pill";
import { EmptyState } from "@/components/patterns/empty-state";
import { AIInsightCard } from "@/components/ui/ai-insight-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardKpis();

  const employees = isLoading ? "-" : (data?.employees_total ?? 0);
  const clients = isLoading ? "-" : (data?.clients_total ?? 0);
  const projectsActive = isLoading ? "-" : (data?.projects_active ?? 0);
  const projectsTotal = isLoading ? "-" : (data?.projects_total ?? 0);

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
          value="-"
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
            <EmptyState
              icon={Clock}
              title="No timesheet entries yet"
              description="Phase 5a wires live timesheet data here. Log your first entries to see your week summary."
              action={
                <Link href="/timesheets">
                  <Button variant="primary" size="sm">
                    Open timesheets
                  </Button>
                </Link>
              }
            />
          </div>
        </div>

        {/* Right: pending actions */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <span className="card-title">Needs your attention</span>
            <Badge tone="default">0 pending</Badge>
          </div>
          <div className="card-body">
            <EmptyState
              icon={CheckSquare}
              title="All caught up"
              description="No pending approvals or outstanding items right now."
            />
          </div>
        </div>
      </div>

      {/* Team snapshot */}
      <div className="grid-3">
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <span className="card-title">Team</span>
            <Link href="/employees" className="text-primary text-sm">
              View all
            </Link>
          </div>
          <div className="card-body">
            <EmptyState
              icon={Users}
              title="Team directory"
              description="Employee data loads after Phase 4 is complete."
            />
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <span className="card-title">Active projects</span>
            <Link href="/projects" className="text-primary text-sm">
              View all
            </Link>
          </div>
          <div className="card-body">
            <EmptyState
              icon={Building2}
              title="Projects"
              description="Project data loads after Phase 4 is complete."
            />
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <span className="card-title">Revenue snapshot</span>
          </div>
          <div className="card-body">
            <EmptyState
              title="Revenue chart"
              description="Invoice data loads after Phase 5a is complete."
            />
          </div>
        </div>
      </div>

      {/* AI insight */}
      <AIInsightCard
        title="Month-end close is 12 days away"
        summary={
          <>
            The month-end close agent will prepare{" "}
            <strong>invoice drafts on day 28</strong>, explain each line, and
            wait for your confirmation. No action needed today.
          </>
        }
        evidence={[
          "Draft preparation: day 28",
          "Founder review window: 48 hours",
          "Batch send: after review",
        ]}
      />
    </>
  );
}
