"use client";

import { useMemo } from "react";
import { AlertTriangle, ArrowRightLeft, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { AiRecommendations, type AiRecommendation } from "@/components/patterns/ai-recommendations";
import {
  ResourcesFilterBar,
  type FilterGroup,
} from "@/components/patterns/resources-filter-bar";
import {
  type WindowPresetValue,
  weeksFor,
} from "@/components/patterns/timeline-window-selector";
import { useUrlListState } from "@/hooks/use-url-list-state";

import { CapacityTimeline } from "./capacity-timeline";
import {
  INITIAL_ALLOCATIONS,
  PEOPLE,
  PROJECTS,
  type PersonStatus,
  personWorkLoad,
  uniqueClients,
  uniqueDepartments,
  uniqueProjects,
  uniqueSkills,
} from "./mock-resources";
import { ResourceKpis } from "./resource-kpis";
import { ResourcesPageHeader } from "./resources-page-header";

const MULTI_KEYS = ["status", "department", "skills", "client", "project"] as const;
type MultiKey = (typeof MULTI_KEYS)[number];

export function ResourcesView() {
  const t = useTranslations("employees");
  const url = useUrlListState<MultiKey, WindowPresetValue>({
    multiKeys: MULTI_KEYS,
    windowDefault: "3m",
  });
  const windowValue: WindowPresetValue = url.windowValue || "3m";
  const setWindowValue = url.setWindow;
  const weekCount = weeksFor(windowValue);

  const search = url.search;
  const setSearch = url.setSearch;
  const statusSel = url.multi.status;
  const deptSel = url.multi.department;
  const skillsSel = url.multi.skills;
  const clientSel = url.multi.client;
  const projectSel = url.multi.project;
  const setStatusSel = (v: string[]) => url.setMulti("status", v);
  const setDeptSel = (v: string[]) => url.setMulti("department", v);
  const setSkillsSel = (v: string[]) => url.setMulti("skills", v);
  const setClientSel = (v: string[]) => url.setMulti("client", v);
  const setProjectSel = (v: string[]) => url.setMulti("project", v);

  const peopleByProjectClient = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const a of INITIAL_ALLOCATIONS) {
      if (!map.has(a.personId)) map.set(a.personId, new Set());
      const project = PROJECTS[a.projectId];
      map.get(a.personId)!.add(project.client);
      map.get(a.personId)!.add(`project:${a.projectId}`);
    }
    return map;
  }, []);

  const filteredPeople = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PEOPLE.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.role} ${p.location} ${p.department} ${p.skills.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusSel.length > 0) {
        const util = personWorkLoad(p.id, INITIAL_ALLOCATIONS, weekCount);
        const isOverallocated = util.overWeeks > 0;
        let status: PersonStatus | "overallocated" = p.status;
        if (isOverallocated) status = "overallocated";
        if (!statusSel.includes(status)) return false;
      }
      if (deptSel.length > 0 && !deptSel.includes(p.department)) return false;
      if (skillsSel.length > 0 && !skillsSel.some((s) => p.skills.includes(s))) return false;

      const tags = peopleByProjectClient.get(p.id) ?? new Set<string>();
      if (clientSel.length > 0 && !clientSel.some((c) => tags.has(c))) return false;
      if (
        projectSel.length > 0 &&
        !projectSel.some((pr) => tags.has(`project:${pr}`))
      ) return false;

      return true;
    });
  }, [search, statusSel, deptSel, skillsSel, clientSel, projectSel, weekCount, peopleByProjectClient]);

  const filterGroups: FilterGroup[] = [
    {
      key: "status",
      label: t("filter_status"),
      options: [
        { value: "active", label: t("status_assigned") },
        { value: "bench", label: t("status_bench") },
        { value: "on_leave", label: t("status_on_leave") },
        { value: "overallocated", label: t("status_overallocated") },
      ],
      selected: statusSel,
      onChange: setStatusSel,
      searchPlaceholder: t("search_status"),
    },
    {
      key: "department",
      label: t("filter_department"),
      options: uniqueDepartments().map((d) => ({ value: d, label: d })),
      selected: deptSel,
      onChange: setDeptSel,
      searchPlaceholder: t("search_department"),
    },
    {
      key: "skills",
      label: t("filter_skills"),
      options: uniqueSkills().map((s) => ({ value: s, label: s })),
      selected: skillsSel,
      onChange: setSkillsSel,
      searchPlaceholder: t("search_skills"),
    },
    {
      key: "client",
      label: t("filter_client"),
      options: uniqueClients().map((c) => ({ value: c, label: c })),
      selected: clientSel,
      onChange: setClientSel,
      searchPlaceholder: t("search_client"),
    },
    {
      key: "project",
      label: t("filter_project"),
      options: uniqueProjects().map((p) => ({ value: p.id, label: p.name })),
      selected: projectSel,
      onChange: setProjectSel,
      searchPlaceholder: t("search_project"),
    },
  ];

  function clearAllFilters() {
    url.clearAll();
  }

  const recommendations: AiRecommendation[] = [
    {
      id: "rec-reassign-jonas",
      icon: ArrowRightLeft,
      tone: "gold",
      title: t("rec_reassign_title"),
      detail: t("rec_reassign_detail"),
      applyLabel: t("rec_apply"),
      onApply: () => {},
    },
    {
      id: "rec-fill-bench",
      icon: UserPlus,
      tone: "primary",
      title: t("rec_bench_title"),
      detail: t("rec_bench_detail"),
      applyLabel: t("rec_review"),
      onApply: () => {
        setStatusSel(["bench"]);
      },
    },
    {
      id: "rec-overalloc",
      icon: AlertTriangle,
      tone: "accent",
      title: t("rec_over_title"),
      detail: t("rec_over_detail"),
      applyLabel: t("rec_review"),
      onApply: () => {
        setStatusSel(["overallocated"]);
      },
    },
  ];

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-8)" }}>
      <AiRecommendations
        items={recommendations}
        title={t("ai_recs_title")}
        overline={t("ai_recs_overline")}
      />

      <ResourcesPageHeader
        windowValue={windowValue}
        onWindowChange={setWindowValue}
      />

      <ResourceKpis
        onSelectAvailable={() => setStatusSel(["bench"])}
        onSelectOver={() => setStatusSel(["overallocated"])}
        onSelectRolling={() => setStatusSel(["active"])}
        activeStatus={statusSel[0]}
      />

      <ResourcesFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("search_placeholder")}
        groups={filterGroups}
        onClearAll={clearAllFilters}
        resultCount={filteredPeople.length}
        resultLabel={filteredPeople.length === 1 ? t("result_person") : t("result_people")}
      />

      <CapacityTimeline people={filteredPeople} weekCount={weekCount} />
    </div>
  );
}
