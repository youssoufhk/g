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
  TimelineWindowSelector,
  type WindowPresetValue,
  weeksFor,
} from "@/components/patterns/timeline-window-selector";
import { useUrlListState } from "@/hooks/use-url-list-state";

import {
  PORTFOLIO_PROJECTS,
  uniqueClientsFromPortfolio,
  uniqueManagersFromPortfolio,
  uniqueTagsFromPortfolio,
} from "./mock-projects-timeline";
import { PortfolioKpis } from "./portfolio-kpis";
import { PortfolioTimeline } from "./portfolio-timeline";

const MULTI_KEYS = ["status", "phase", "client", "manager", "tag"] as const;
type MultiKey = (typeof MULTI_KEYS)[number];

export function PortfolioView() {
  const t = useTranslations("projects");
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
  const phaseSel = url.multi.phase;
  const clientSel = url.multi.client;
  const managerSel = url.multi.manager;
  const tagSel = url.multi.tag;
  const setStatusSel = (v: string[]) => url.setMulti("status", v);
  const setPhaseSel = (v: string[]) => url.setMulti("phase", v);
  const setClientSel = (v: string[]) => url.setMulti("client", v);
  const setManagerSel = (v: string[]) => url.setMulti("manager", v);
  const setTagSel = (v: string[]) => url.setMulti("tag", v);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PORTFOLIO_PROJECTS.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.code} ${p.client} ${p.manager} ${p.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusSel.length > 0 && !statusSel.includes(p.status)) return false;
      if (phaseSel.length > 0 && !phaseSel.includes(p.phase)) return false;
      if (clientSel.length > 0 && !clientSel.includes(p.clientId)) return false;
      if (managerSel.length > 0 && !managerSel.includes(p.managerId)) return false;
      if (tagSel.length > 0 && !tagSel.some((tag) => p.tags.includes(tag))) return false;
      return true;
    });
  }, [search, statusSel, phaseSel, clientSel, managerSel, tagSel]);

  const counts = useMemo(() => {
    return {
      at_risk: PORTFOLIO_PROJECTS.filter((p) => p.status === "at_risk").length,
      ending_soon: PORTFOLIO_PROJECTS.filter((p) => p.status === "ending_soon").length,
      unstaffed: PORTFOLIO_PROJECTS.filter((p) => p.status === "unstaffed").length,
    };
  }, []);

  const filterGroups: FilterGroup[] = [
    {
      key: "status",
      label: t("filter_status"),
      options: [
        { value: "active", label: t("status_active") },
        { value: "at_risk", label: t("status_at_risk") },
        { value: "ending_soon", label: t("status_ending_soon") },
        { value: "unstaffed", label: t("status_unstaffed") },
        { value: "on_hold", label: t("status_on_hold") },
      ],
      selected: statusSel,
      onChange: setStatusSel,
      searchPlaceholder: t("search_status"),
    },
    {
      key: "phase",
      label: t("filter_phase"),
      options: [
        { value: "discovery", label: t("phase_discovery") },
        { value: "delivery", label: t("phase_delivery") },
        { value: "review", label: t("phase_review") },
        { value: "at_risk", label: t("phase_at_risk") },
        { value: "on_hold", label: t("phase_on_hold") },
      ],
      selected: phaseSel,
      onChange: setPhaseSel,
      searchPlaceholder: t("search_phase"),
    },
    {
      key: "client",
      label: t("filter_client"),
      options: uniqueClientsFromPortfolio().map((c) => ({ value: c.id, label: c.name })),
      selected: clientSel,
      onChange: setClientSel,
      searchPlaceholder: t("search_client"),
    },
    {
      key: "manager",
      label: t("filter_manager"),
      options: uniqueManagersFromPortfolio().map((m) => ({ value: m.id, label: m.name })),
      selected: managerSel,
      onChange: setManagerSel,
      searchPlaceholder: t("search_manager"),
    },
    {
      key: "tag",
      label: t("filter_tag"),
      options: uniqueTagsFromPortfolio().map((tag) => ({ value: tag, label: tag })),
      selected: tagSel,
      onChange: setTagSel,
      searchPlaceholder: t("search_tag"),
    },
  ];

  function clearAllFilters() {
    url.clearAll();
  }

  const recommendations: AiRecommendation[] = [
    {
      id: "rec-harbor-risk",
      icon: AlertTriangle,
      tone: "gold",
      title: t("rec_risk_title"),
      detail: t("rec_risk_detail"),
      applyLabel: t("rec_review"),
      onApply: () => setStatusSel(["at_risk"]),
    },
    {
      id: "rec-staff-polaris",
      icon: UserPlus,
      tone: "primary",
      title: t("rec_unstaffed_title"),
      detail: t("rec_unstaffed_detail"),
      applyLabel: t("rec_review"),
      onApply: () => setStatusSel(["unstaffed"]),
    },
    {
      id: "rec-rollover",
      icon: ArrowRightLeft,
      tone: "accent",
      title: t("rec_rollover_title"),
      detail: t("rec_rollover_detail"),
      applyLabel: t("rec_review"),
      onApply: () => setStatusSel(["ending_soon"]),
    },
  ];

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-8)" }}>
      <AiRecommendations
        items={recommendations}
        title={t("ai_recs_title")}
        overline={t("ai_recs_overline")}
      />

      <section className="resources-page-header">
        <div className="resources-page-header-title-group">
          <span className="resources-page-header-overline">{t("portfolio_overline")}</span>
          <h1 className="resources-page-header-title">{t("portfolio_page_title")}</h1>
        </div>
        <div className="resources-page-header-controls">
          <TimelineWindowSelector
            value={windowValue}
            onChange={setWindowValue}
            label={t("window_label")}
          />
        </div>
      </section>

      <PortfolioKpis
        counts={counts}
        onSelectAtRisk={() => setStatusSel(["at_risk"])}
        onSelectEndingSoon={() => setStatusSel(["ending_soon"])}
        onSelectUnstaffed={() => setStatusSel(["unstaffed"])}
        activeStatus={statusSel[0]}
      />

      <ResourcesFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("search_placeholder")}
        groups={filterGroups}
        onClearAll={clearAllFilters}
        resultCount={filtered.length}
        resultLabel={filtered.length === 1 ? t("result_project") : t("result_projects")}
      />

      <PortfolioTimeline projects={filtered} weekCount={weekCount} />
    </div>
  );
}
