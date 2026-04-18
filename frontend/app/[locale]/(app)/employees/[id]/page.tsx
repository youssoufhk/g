"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
import { DetailHeaderBar } from "@/components/patterns/detail-header-bar";
import { EMPLOYEES } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useEmployee } from "@/features/employees/use-employees";
import { formatDate, formatCurrency, formatNumber } from "@/lib/format";

function StatusBadge({
  status,
  label,
}: {
  status: "active" | "inactive" | "on_leave";
  label: string;
}) {
  switch (status) {
    case "active":
      return (
        <Badge tone="success" dot>
          {label}
        </Badge>
      );
    case "on_leave":
      return (
        <Badge tone="warning" dot>
          {label}
        </Badge>
      );
    default:
      return <Badge tone="default">{label}</Badge>;
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
  const t = useTranslations("employees");
  const { data: employee, isLoading, error } = useEmployee(id);
  const siblings = useMemo(() => {
    const idx = EMPLOYEES.findIndex((e) => e.id === id);
    if (idx === -1) return { idx: -1, total: EMPLOYEES.length, prev: null, next: null };
    return {
      idx,
      total: EMPLOYEES.length,
      prev: idx > 0 ? EMPLOYEES[idx - 1]?.id ?? null : null,
      next: idx < EMPLOYEES.length - 1 ? EMPLOYEES[idx + 1]?.id ?? null : null,
    };
  }, [id]);
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
      <>
        <div className="app-aura" aria-hidden>
          <div className="app-aura-accent" />
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="card-body">
            <EmptyState
              icon={AlertTriangle}
              title={t("detail_error_title")}
              description={t("detail_error_desc")}
              action={
                <Link href="/employees">
                  <Button variant="secondary" size="sm">
                    {t("detail_back")}
                  </Button>
                </Link>
              }
            />
          </div>
        </div>
      </>
    );
  }

  if (isLoading || !employee) {
    return (
      <>
        <div className="app-aura" aria-hidden>
          <div className="app-aura-accent" />
        </div>
        <div aria-busy="true" aria-live="polite">
          <ProfileHeroSkeleton />
          <div className="kpi-grid" style={{ marginTop: "var(--space-4)" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="stat-card" key={i}>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="title" width={50} style={{ marginTop: "var(--space-2)" }} />
              </div>
            ))}
          </div>
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
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>
      <DetailHeaderBar
        backHref="/employees"
        backLabel={t("detail_back")}
        title={employee.name}
        prevHref={siblings.prev ? `/employees/${siblings.prev}` : null}
        nextHref={siblings.next ? `/employees/${siblings.next}` : null}
        prevLabel={t("detail_prev")}
        nextLabel={t("detail_next")}
        position={siblings.idx >= 0 ? siblings.idx + 1 : null}
        total={siblings.total}
        positionLabel={(p, total) => t("detail_position", { position: p, total })}
      />

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
                  <StatusBadge status={employee.status} label={t(`detail_status_${employee.status}`)} />
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
                    {t("detail_since", { date: formatDate(employee.start_date) })}
                  </span>
                  {employee.manager_name && (
                    <span
                      className="flex items-center gap-1 text-3"
                      style={{ fontSize: "var(--text-caption)" }}
                    >
                      {t("detail_reports_to")}{" "}
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
                {t("detail_edit_profile")}
              </Button>
              <Dropdown
                align="right"
                trigger={({ toggle, open }) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={t("detail_more_actions")}
                    aria-expanded={open}
                    onClick={toggle}
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                )}
              >
                <DropdownItem icon={<Receipt size={14} />} onClick={() => setActiveTab("expenses")}>
                  {t("detail_view_expenses")}
                </DropdownItem>
                <DropdownItem icon={<Umbrella size={14} />} onClick={() => setActiveTab("leaves")}>
                  {t("detail_view_leaves")}
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem icon={<FileText size={14} />} onClick={handleExport}>
                  {exportLoading ? t("detail_exporting") : t("detail_export_profile")}
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid" style={{ marginBottom: "var(--space-6)" }}>
        <StatPill
          label={t("detail_kpi_projects")}
          value={formatNumber(projectCount)}
          secondary={projectCount === 1 ? t("detail_kpi_project_unit_one") : t("detail_kpi_project_unit_other")}
          accent="primary"
        />
        <StatPill
          label={t("detail_kpi_hours")}
          value={formatNumber(hoursThisMonth)}
          secondary={capacityHours > 0 ? t("detail_kpi_capacity", { capacity: formatNumber(capacityHours) }) : undefined}
          accent="info"
        />
        <StatPill
          label={t("detail_kpi_expenses")}
          value={
            pendingExpenses > 0
              ? formatCurrency(pendingExpenses, "EUR")
              : t("detail_kpi_none")
          }
          accent="warning"
        />
        <StatPill
          label={t("detail_kpi_leave")}
          value={formatNumber(leaveBalance)}
          secondary={t("detail_kpi_days")}
          accent="gold"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t("detail_tab_overview")}</TabsTrigger>
          <TabsTrigger value="timesheets">{t("detail_tab_timesheets")}</TabsTrigger>
          <TabsTrigger value="expenses" count={pendingExpenses > 0 ? 1 : undefined}>
            {t("detail_tab_expenses")}
          </TabsTrigger>
          <TabsTrigger value="leaves">{t("detail_tab_leaves")}</TabsTrigger>
          <TabsTrigger value="documents">{t("detail_tab_documents")}</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview">
          <div className="grid-60-40" style={{ marginTop: "var(--space-4)" }}>
            {/* Left: current projects */}
            <div className="card" style={{ padding: 0 }}>
              <div className="card-header">
                <span className="card-title">{t("detail_current_projects")}</span>
                <Badge tone="default">{formatNumber(projectCount)}</Badge>
              </div>
              <div className="card-body">
                {projectCount === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title={t("detail_no_projects_title")}
                    description={t("detail_no_projects_desc")}
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
                        <Badge tone="primary">{t("detail_status_active")}</Badge>
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
                    <span className="card-title">{t("detail_skills")}</span>
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
                  <span className="card-title">{t("detail_recent_activity")}</span>
                </div>
                <div className="card-body">
                  <EmptyState
                    icon={Clock}
                    title={t("detail_no_activity_title")}
                    description={t("detail_no_activity_desc")}
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
                  title={t("detail_no_timesheets_title")}
                  description={t("detail_no_timesheets_desc")}
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
                  title={t("detail_no_expenses_title")}
                  description={t("detail_no_expenses_desc")}
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
                  title={t("detail_no_leaves_title")}
                  description={t("detail_no_leaves_desc")}
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
                  title={t("detail_no_documents_title")}
                  description={t("detail_no_documents_desc")}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t("detail_edit_profile")}
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>
              {t("detail_cancel")}
            </Button>
            <Button variant="primary" size="sm" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? t("detail_saving") : t("detail_save_changes")}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label" htmlFor="edit-name">{t("detail_full_name")}</label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="edit-title">{t("detail_job_title")}</label>
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
