"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  MoreHorizontal,
  MapPin,
  CalendarDays,
  Briefcase,
  Clock,
  Receipt,
  Umbrella,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { StatPill } from "@/components/patterns/stat-pill";
import { EmptyState } from "@/components/patterns/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useEmployee } from "@/features/employees/use-employees";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({
  status,
}: {
  status: "active" | "inactive" | "on_leave";
}) {
  switch (status) {
    case "active":
      return (
        <Badge tone="success" dot>
          Active
        </Badge>
      );
    case "on_leave":
      return (
        <Badge tone="warning" dot>
          On leave
        </Badge>
      );
    default:
      return <Badge tone="default">Inactive</Badge>;
  }
}

function ProfileHeroSkeleton() {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Top stripe */}
      <div
        style={{
          height: 4,
          background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
        }}
      />
      <div className="card-body">
        <div className="flex items-start gap-4">
          <Skeleton variant="avatar" width={80} height={80} />
          <div className="flex flex-col gap-2" style={{ flex: 1 }}>
            <Skeleton variant="title" width={200} />
            <Skeleton variant="text" width={160} />
            <Skeleton variant="text" width={120} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: employee, isLoading, error } = useEmployee(id);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  function openEditModal() {
    setEditName(employee?.name ?? "");
    setEditTitle(employee?.title ?? "");
    setShowEditModal(true);
  }

  function handleEditSave() {
    setEditSaving(true);
    setTimeout(() => {
      setEditSaving(false);
      setShowEditModal(false);
    }, 800);
  }

  function handleExport() {
    setExportLoading(true);
    setTimeout(() => setExportLoading(false), 1200);
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 0 }}>
        <div className="card-body">
          <EmptyState
            icon={AlertTriangle}
            title="Employee not found"
            description="This employee does not exist or you may not have access."
            action={
              <Link href="/employees">
                <Button variant="secondary" size="sm">
                  Back to employees
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (isLoading || !employee) {
    return (
      <>
        <ProfileHeroSkeleton />
        <div className="kpi-grid" style={{ marginTop: "var(--space-4)" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="stat-card" key={i}>
              <Skeleton variant="text" width={80} />
              <Skeleton variant="title" width={50} style={{ marginTop: "var(--space-2)" }} />
            </div>
          ))}
        </div>
      </>
    );
  }

  const projectCount = employee.current_projects?.length ?? 0;
  const hoursThisMonth = employee.hours_this_month ?? 0;
  const capacityHours = employee.capacity_hours ?? 0;
  const pendingExpenses = employee.pending_expenses_eur ?? 0;
  const leaveBalance = employee.leave_balance_days ?? 0;

  return (
    <>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          fontSize: "var(--text-caption)",
          color: "var(--color-text-3)",
          marginBottom: "var(--space-4)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <Link href="/employees" className="text-3">
          Employees
        </Link>
        <span>/</span>
        <span className="text-2">{employee.name}</span>
      </nav>

      {/* Profile hero card */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: "var(--space-4)" }}>
        {/* Gradient top stripe */}
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
          }}
        />
        <div className="card-body">
          <div
            className="flex items-start justify-between"
            style={{ flexWrap: "wrap", gap: "var(--space-4)" }}
          >
            {/* Left: avatar + name block */}
            <div className="flex items-start gap-4">
              <Avatar
                name={employee.name}
                colorIndex={employee.avatar_color_index}
                size="xl"
                status={
                  employee.status === "active"
                    ? "online"
                    : employee.status === "on_leave"
                      ? "away"
                      : undefined
                }
              />
              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    fontSize: "var(--text-heading-1)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-text-1)",
                    lineHeight: 1.2,
                  }}
                >
                  {employee.name}
                </h1>
                <p
                  className="text-2"
                  style={{
                    fontSize: "var(--text-body)",
                    marginTop: "var(--space-0-5)",
                  }}
                >
                  {employee.title}
                </p>
                <p
                  className="text-3"
                  style={{
                    fontSize: "var(--text-body-sm)",
                    marginTop: "var(--space-0-5)",
                  }}
                >
                  {employee.department}
                </p>

                {/* Badge row */}
                <div
                  className="flex items-center flex-wrap"
                  style={{ gap: "var(--space-2)", marginTop: "var(--space-3)" }}
                >
                  <StatusBadge status={employee.status} />
                  {employee.location && (
                    <span
                      className="flex items-center gap-1 text-3"
                      style={{ fontSize: "var(--text-caption)" }}
                    >
                      <MapPin size={12} aria-hidden />
                      {employee.location}
                    </span>
                  )}
                  <span
                    className="flex items-center gap-1 text-3"
                    style={{ fontSize: "var(--text-caption)" }}
                  >
                    <CalendarDays size={12} aria-hidden />
                    Since {formatDate(employee.start_date)}
                  </span>
                  {employee.manager_name && (
                    <span
                      className="flex items-center gap-1 text-3"
                      style={{ fontSize: "var(--text-caption)" }}
                    >
                      Reports to{" "}
                      {employee.manager_id ? (
                        <Link
                          href={`/employees/${employee.manager_id}`}
                          className="text-primary"
                        >
                          {employee.manager_name}
                        </Link>
                      ) : (
                        <span>{employee.manager_name}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={<Pencil size={14} />}
                onClick={openEditModal}
              >
                Edit profile
              </Button>
              <Dropdown
                align="right"
                trigger={({ toggle, open }) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label="More actions"
                    aria-expanded={open}
                    onClick={toggle}
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                )}
              >
                <DropdownItem icon={<Receipt size={14} />} onClick={() => setActiveTab("expenses")}>
                  View expenses
                </DropdownItem>
                <DropdownItem icon={<Umbrella size={14} />} onClick={() => setActiveTab("leaves")}>
                  View leaves
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem icon={<FileText size={14} />} onClick={handleExport}>
                  {exportLoading ? "Exporting..." : "Export profile"}
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid" style={{ marginBottom: "var(--space-6)" }}>
        <StatPill
          label="Current projects"
          value={projectCount}
          secondary={projectCount === 1 ? "project" : "projects"}
          accent="primary"
        />
        <StatPill
          label="Hours this month"
          value={hoursThisMonth}
          secondary={capacityHours > 0 ? `/ ${capacityHours} cap.` : undefined}
          accent="info"
        />
        <StatPill
          label="Pending expenses"
          value={
            pendingExpenses > 0
              ? `€ ${pendingExpenses.toLocaleString("en-GB")}`
              : "None"
          }
          accent="warning"
        />
        <StatPill
          label="Leave balance"
          value={leaveBalance}
          secondary="days"
          accent="gold"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="expenses" count={pendingExpenses > 0 ? 1 : undefined}>
            Expenses
          </TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview">
          <div className="grid-60-40" style={{ marginTop: "var(--space-4)" }}>
            {/* Left: current projects */}
            <div className="card" style={{ padding: 0 }}>
              <div className="card-header">
                <span className="card-title">Current projects</span>
                <Badge tone="default">{projectCount}</Badge>
              </div>
              <div className="card-body">
                {projectCount === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="No active projects"
                    description="This employee is not assigned to any projects at the moment."
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    {employee.current_projects?.map((proj) => (
                      <div
                        key={proj.id}
                        className="flex items-center justify-between"
                        style={{
                          padding: "var(--space-2) var(--space-3)",
                          background: "var(--color-surface-1)",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--color-border-subtle)",
                        }}
                      >
                        <Link
                          href={`/projects/${proj.id}`}
                          className="text-primary"
                          style={{
                            fontSize: "var(--text-body-sm)",
                            fontWeight: "var(--weight-medium)",
                          }}
                        >
                          {proj.name}
                        </Link>
                        <Badge tone="primary">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: skills + activity placeholder */}
            <div className="flex flex-col gap-4">
              {/* Skills */}
              {employee.skills && employee.skills.length > 0 && (
                <div className="card" style={{ padding: 0 }}>
                  <div className="card-header">
                    <span className="card-title">Skills</span>
                  </div>
                  <div className="card-body">
                    <div
                      className="flex flex-wrap"
                      style={{ gap: "var(--space-2)" }}
                    >
                      {employee.skills.map((skill) => (
                        <Badge key={skill} tone="ghost">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent activity placeholder */}
              <div className="card" style={{ padding: 0 }}>
                <div className="card-header">
                  <span className="card-title">Recent activity</span>
                </div>
                <div className="card-body">
                  <EmptyState
                    icon={Clock}
                    title="No recent activity"
                    description="Timesheet and approval history will appear here once timesheets are logged."
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Timesheets tab */}
        <TabsContent value="timesheets">
          <div style={{ marginTop: "var(--space-4)" }}>
            <div className="card" style={{ padding: 0 }}>
              <div className="card-body">
                <EmptyState
                  icon={Clock}
                  title="No timesheet history"
                  description="Timesheet entries and approval status will appear here once the employee starts logging time."
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Expenses tab */}
        <TabsContent value="expenses">
          <div style={{ marginTop: "var(--space-4)" }}>
            <div className="card" style={{ padding: 0 }}>
              <div className="card-body">
                <EmptyState
                  icon={Receipt}
                  title="No expenses"
                  description="Submitted and approved expenses will appear here once the employee submits a claim."
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Leaves tab */}
        <TabsContent value="leaves">
          <div style={{ marginTop: "var(--space-4)" }}>
            <div className="card" style={{ padding: 0 }}>
              <div className="card-body">
                <EmptyState
                  icon={Umbrella}
                  title="No leave requests"
                  description="Annual leave, sick days, and leave balances will appear here."
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Documents tab */}
        <TabsContent value="documents">
          <div style={{ marginTop: "var(--space-4)" }}>
            <div className="card" style={{ padding: 0 }}>
              <div className="card-body">
                <EmptyState
                  icon={FileText}
                  title="No documents"
                  description="Contracts and signed documents will appear here once uploaded."
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit profile"
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label" htmlFor="edit-name">Full name</label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="edit-title">Job title</label>
            <Input
              id="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
