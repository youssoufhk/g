"use client";

import { use, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DetailHeaderBar } from "@/components/patterns/detail-header-bar";
import { useDetailKeyboardNav } from "@/hooks/use-detail-keyboard-nav";
import { PROJECTS } from "@/lib/mock-data";
import {
  FolderOpen,
  CheckCircle,
  Circle,
  Plus,
  Check,
  Pencil,
  MoreHorizontal,
  FileText,
  UserPlus,
  CalendarDays,
} from "lucide-react";

import { EmptyState } from "@/components/patterns/empty-state";
import { StatPill } from "@/components/patterns/stat-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar, type ProgressTone } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { useProject } from "@/features/projects/use-projects";
import type { ProjectPhase, ProjectStatus } from "@/features/projects/types";
import { formatCurrency, formatDate } from "@/lib/format";

// ── helpers ────────────────────────────────────────────────────────────────

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

type BadgeTone = "default" | "primary" | "success" | "warning" | "error" | "info" | "accent" | "gold" | "ghost" | "ghost-primary" | "neutral";

const PHASE_TONE: Record<ProjectPhase, BadgeTone> = {
  discovery: "default",
  proposal: "info",
  delivery: "primary",
  review: "warning",
  complete: "success",
  at_risk: "error",
  on_hold: "ghost",
};

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  active: "success",
  complete: "default",
  on_hold: "warning",
  cancelled: "error",
};

// ── page ───────────────────────────────────────────────────────────────────

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("projects");
  const { data: project, isLoading, error } = useProject(id);
  const siblings = useMemo(() => {
    const idx = PROJECTS.findIndex((p) => p.id === id);
    if (idx === -1) return { idx: -1, total: PROJECTS.length, prev: null, next: null };
    return {
      idx,
      total: PROJECTS.length,
      prev: idx > 0 ? PROJECTS[idx - 1]?.id ?? null : null,
      next: idx < PROJECTS.length - 1 ? PROJECTS[idx + 1]?.id ?? null : null,
    };
  }, [id]);
  useDetailKeyboardNav(
    siblings.prev ? `/projects/${siblings.prev}` : null,
    siblings.next ? `/projects/${siblings.next}` : null,
  );

  const [completedOverrides, setCompletedOverrides] = useState<Record<number, boolean>>({});
  const [localMilestones, setLocalMilestones] = useState<Array<{ name: string; date: string; complete: boolean }>>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  function openEditModal() {
    setEditProjectName(project?.name ?? "");
    setShowEditModal(true);
  }

  function handleEditSave() {
    setEditSaving(true);
    setTimeout(() => { setEditSaving(false); setShowEditModal(false); }, 800);
  }

  function handleExport() {
    setExportLoading(true);
    setTimeout(() => setExportLoading(false), 1200);
  }

  if (isLoading) {
    return (
      <>
        <div className="app-aura" aria-hidden="true">
          <div className="app-aura-accent" />
        </div>
        <div
          aria-busy="true"
          aria-live="polite"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
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
        </div>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <div className="app-aura" aria-hidden="true">
          <div className="app-aura-accent" />
        </div>
        <EmptyState
          icon={FolderOpen}
          title={t("detail_not_found_title")}
          description={t("detail_not_found_desc")}
          action={
            <Link href="/projects">
              <Button variant="primary" size="sm">
                {t("detail_back")}
              </Button>
            </Link>
          }
        />
      </>
    );
  }

  const pct = budgetPct(project.budget_eur, project.budget_consumed_eur);
  const tone = budgetTone(pct);
  const days = project.end_date ? daysRemaining(project.end_date) : null;
  const numStyle = { fontVariantNumeric: "tabular-nums" as const };

  return (
    <>
      <div className="app-aura" aria-hidden="true">
        <div className="app-aura-accent" />
      </div>
      <DetailHeaderBar
        backHref="/projects"
        backLabel={t("detail_back")}
        title={project.name}
        prevHref={siblings.prev ? `/projects/${siblings.prev}` : null}
        nextHref={siblings.next ? `/projects/${siblings.next}` : null}
        prevLabel={t("detail_prev")}
        nextLabel={t("detail_next")}
        position={siblings.idx >= 0 ? siblings.idx + 1 : null}
        total={siblings.total}
        positionLabel={(p, total) => t("detail_position", { position: p, total })}
      />

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
              <span>{t("detail_managed_by")} </span>
              <Link
                href={`/employees/${project.manager_id}`}
                style={{ color: "var(--color-primary)" }}
              >
                {project.manager_name}
              </Link>
            </div>
            <div className="project-detail-badges">
              <Badge tone={PHASE_TONE[project.phase]}>
                {t(`phase_full_${project.phase}`)}
              </Badge>
              <Badge tone={STATUS_TONE[project.status]}>
                {t(`status_full_${project.status}`)}
              </Badge>
              <div className="separator" />
              <div className="detail-badge">
                <CalendarDays size={16} aria-hidden="true" />
                <span style={numStyle}>
                  {formatDate(project.start_date)}
                  {" - "}
                  {project.end_date ? formatDate(project.end_date) : t("detail_ongoing")}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Button variant="secondary" size="sm" leadingIcon={<Pencil size={16} />} onClick={openEditModal}>
              {t("detail_edit")}
            </Button>
            <Dropdown
              align="right"
              trigger={({ toggle, open }) => (
                <Button variant="ghost" size="sm" iconOnly aria-label={t("detail_more_actions")} aria-expanded={open} onClick={toggle}>
                  <MoreHorizontal size={16} />
                </Button>
              )}
            >
              <DropdownItem icon={<UserPlus size={16} />}>{t("detail_add_team_member")}</DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={<FileText size={16} />} onClick={handleExport}>
                {exportLoading ? t("detail_exporting") : t("detail_export")}
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid">
        <StatPill
          label={t("detail_kpi_total_budget")}
          value={formatCurrency(project.budget_eur, "EUR", { fractionDigits: 0 })}
          accent="gold"
        />
        <StatPill
          label={t("detail_kpi_budget_consumed")}
          value={`${pct}%`}
          secondary={formatCurrency(project.budget_consumed_eur, "EUR", { fractionDigits: 0 })}
          accent={tone === "error" ? "error" : tone === "warning" ? "warning" : "primary"}
        />
        <StatPill
          label={t("detail_kpi_team_size")}
          value={project.team_size}
          secondary={project.team_size === 1 ? t("detail_people_one") : t("detail_people_other")}
          accent="info"
        />
        <StatPill
          label={t("detail_kpi_days_remaining")}
          value={
            days === null
              ? "-"
              : days < 0
                ? t("detail_overdue")
                : days
          }
          secondary={
            days !== null && days >= 0 && project.end_date
              ? formatDate(project.end_date, "short")
              : undefined
          }
          accent={days === null ? "primary" : daysAccent(days)}
        />
      </div>

      {/* Budget progress */}
      <div className="card" style={{ padding: "var(--space-4)", marginTop: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-2)" }}>
          <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-2)" }}>
            {t("detail_budget_progress")}
          </span>
          <span style={{ ...numStyle, fontSize: "var(--text-body-sm)", color: "var(--color-text-2)" }}>
            {pct}%
          </span>
        </div>
        <ProgressBar value={pct} tone={tone} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("detail_tab_overview")}</TabsTrigger>
          <TabsTrigger value="team" count={project.team_size}>
            {t("detail_tab_team")}
          </TabsTrigger>
          <TabsTrigger value="budget">{t("detail_tab_budget")}</TabsTrigger>
          <TabsTrigger value="timeline">{t("detail_tab_timeline")}</TabsTrigger>
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
                <span className="card-title">{t("detail_milestones")}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(true);
                    setTimeout(() => addInputRef.current?.focus(), 0);
                  }}
                >
                  <Plus size={16} />
                  {t("detail_add")}
                </Button>
              </div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                {(project.milestones && project.milestones.length > 0) || localMilestones.length > 0 ? (
                  <div className="milestone-list">
                    {[...(project.milestones ?? []), ...localMilestones].map((m, i) => {
                      const isComplete = completedOverrides[i] ?? m.complete;
                      return (
                        <div key={i} className="milestone-item">
                          <div
                            className={`milestone-icon ${isComplete ? "complete" : "upcoming"}`}
                            style={{ cursor: "pointer" }}
                            title={t("detail_milestone_toggle")}
                            onClick={() =>
                              setCompletedOverrides((prev) => ({
                                ...prev,
                                [i]: !(prev[i] ?? m.complete),
                              }))
                            }
                          >
                            {isComplete ? (
                              <CheckCircle size={16} />
                            ) : (
                              <Circle size={16} />
                            )}
                          </div>
                          <div className="milestone-content">
                            <div className="milestone-name">{m.name}</div>
                            <div className="milestone-dates" style={numStyle}>
                              {formatDate(m.date)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {showAddForm && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                          paddingTop: "var(--space-3)",
                        }}
                      >
                        <input
                          ref={addInputRef}
                          type="text"
                          className="form-input"
                          placeholder={t("detail_milestone_placeholder")}
                          value={newMilestoneName}
                          onChange={(e) => setNewMilestoneName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newMilestoneName.trim()) {
                              setLocalMilestones((prev) => [
                                ...prev,
                                {
                                  name: newMilestoneName.trim(),
                                  date: new Date().toISOString(),
                                  complete: false,
                                },
                              ]);
                              setNewMilestoneName("");
                              setShowAddForm(false);
                            } else if (e.key === "Escape") {
                              setNewMilestoneName("");
                              setShowAddForm(false);
                            }
                          }}
                          style={{ flex: 1, height: 32 }}
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          aria-label={t("detail_add")}
                          onClick={() => {
                            if (newMilestoneName.trim()) {
                              setLocalMilestones((prev) => [
                                ...prev,
                                {
                                  name: newMilestoneName.trim(),
                                  date: new Date().toISOString(),
                                  complete: false,
                                },
                              ]);
                              setNewMilestoneName("");
                              setShowAddForm(false);
                            }
                          }}
                        >
                          <Check size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : showAddForm ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <input
                      ref={addInputRef}
                      type="text"
                      className="form-input"
                      placeholder={t("detail_milestone_placeholder")}
                      value={newMilestoneName}
                      onChange={(e) => setNewMilestoneName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newMilestoneName.trim()) {
                          setLocalMilestones((prev) => [
                            ...prev,
                            {
                              name: newMilestoneName.trim(),
                              date: new Date().toISOString(),
                              complete: false,
                            },
                          ]);
                          setNewMilestoneName("");
                          setShowAddForm(false);
                        } else if (e.key === "Escape") {
                          setNewMilestoneName("");
                          setShowAddForm(false);
                        }
                      }}
                      style={{ flex: 1, height: 32 }}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      aria-label={t("detail_add")}
                      onClick={() => {
                        if (newMilestoneName.trim()) {
                          setLocalMilestones((prev) => [
                            ...prev,
                            {
                              name: newMilestoneName.trim(),
                              date: new Date().toISOString(),
                              complete: false,
                            },
                          ]);
                          setNewMilestoneName("");
                          setShowAddForm(false);
                        }
                      }}
                    >
                      <Check size={16} />
                    </Button>
                  </div>
                ) : (
                  <EmptyState title={t("detail_milestones_empty_title")} description={t("detail_milestones_empty_desc")} />
                )}
              </div>
            </div>

            {/* Right: team */}
            <div className="card" style={{ padding: 0 }}>
              <div className="card-header">
                <span className="card-title">{t("detail_tab_team")}</span>
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
                    title={t("detail_team_empty_title")}
                    description={t("detail_team_empty_desc")}
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
              title={t("detail_team_full_title")}
              description={t("detail_team_full_desc")}
            />
          </div>
        </TabsContent>

        {/* Budget tab */}
        <TabsContent value="budget">
          <div className="detail-tabs-content">
            <EmptyState
              title={t("detail_budget_title")}
              description={t("detail_budget_desc")}
            />
          </div>
        </TabsContent>

        {/* Timeline tab */}
        <TabsContent value="timeline">
          <div className="detail-tabs-content">
            <EmptyState
              title={t("detail_timeline_title")}
              description={t("detail_timeline_desc")}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t("detail_edit_project")}
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>{t("detail_cancel")}</Button>
            <Button variant="primary" size="sm" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? t("detail_saving") : t("detail_save_changes")}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label" htmlFor="edit-project-name">{t("detail_project_name")}</label>
            <Input
              id="edit-project-name"
              value={editProjectName}
              onChange={(e) => setEditProjectName(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
