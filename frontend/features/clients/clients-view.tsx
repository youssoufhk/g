"use client";

import { useMemo } from "react";
import { AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";
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
  PORTFOLIO_CLIENTS,
  uniqueManagersFromClients,
  uniqueSectorsFromClients,
  uniqueTagsFromClients,
} from "./mock-clients-timeline";
import { ClientsKpis } from "./clients-kpis";
import { ClientsTimeline } from "./clients-timeline";

const MULTI_KEYS = ["status", "sector", "manager", "tag"] as const;
type MultiKey = (typeof MULTI_KEYS)[number];

export function ClientsView() {
  const t = useTranslations("clients");
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
  const sectorSel = url.multi.sector;
  const managerSel = url.multi.manager;
  const tagSel = url.multi.tag;
  const setStatusSel = (v: string[]) => url.setMulti("status", v);
  const setSectorSel = (v: string[]) => url.setMulti("sector", v);
  const setManagerSel = (v: string[]) => url.setMulti("manager", v);
  const setTagSel = (v: string[]) => url.setMulti("tag", v);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PORTFOLIO_CLIENTS.filter((c) => {
      if (q) {
        const hay = `${c.name} ${c.code} ${c.sector} ${c.manager} ${c.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusSel.length > 0 && !statusSel.includes(c.status)) return false;
      if (sectorSel.length > 0 && !sectorSel.includes(c.sector)) return false;
      if (managerSel.length > 0 && !managerSel.includes(c.managerId)) return false;
      if (tagSel.length > 0 && !tagSel.some((tag) => c.tags.includes(tag))) return false;
      return true;
    });
  }, [search, statusSel, sectorSel, managerSel, tagSel]);

  const counts = useMemo(() => {
    return {
      at_risk: PORTFOLIO_CLIENTS.filter((c) => c.status === "at_risk").length,
      renewal_due: PORTFOLIO_CLIENTS.filter((c) => c.status === "renewal_due").length,
      expansion_ready: PORTFOLIO_CLIENTS.filter((c) => c.status === "expansion_ready").length,
    };
  }, []);

  const filterGroups: FilterGroup[] = [
    {
      key: "status",
      label: t("filter_status"),
      options: [
        { value: "active", label: t("status_active") },
        { value: "at_risk", label: t("status_at_risk") },
        { value: "renewal_due", label: t("status_renewal_due") },
        { value: "expansion_ready", label: t("status_expansion_ready") },
        { value: "dormant", label: t("status_dormant") },
      ],
      selected: statusSel,
      onChange: setStatusSel,
      searchPlaceholder: t("search_status"),
    },
    {
      key: "sector",
      label: t("filter_sector"),
      options: uniqueSectorsFromClients().map((s) => ({ value: s, label: s })),
      selected: sectorSel,
      onChange: setSectorSel,
      searchPlaceholder: t("search_sector"),
    },
    {
      key: "manager",
      label: t("filter_manager"),
      options: uniqueManagersFromClients().map((m) => ({ value: m.id, label: m.name })),
      selected: managerSel,
      onChange: setManagerSel,
      searchPlaceholder: t("search_manager"),
    },
    {
      key: "tag",
      label: t("filter_tag"),
      options: uniqueTagsFromClients().map((tag) => ({ value: tag, label: tag })),
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
      id: "rec-renew-northwind",
      icon: RefreshCw,
      tone: "accent",
      title: t("rec_renewal_title"),
      detail: t("rec_renewal_detail"),
      applyLabel: t("rec_review"),
      onApply: () => setStatusSel(["renewal_due"]),
    },
    {
      id: "rec-risk-maren",
      icon: AlertTriangle,
      tone: "gold",
      title: t("rec_risk_title"),
      detail: t("rec_risk_detail"),
      applyLabel: t("rec_review"),
      onApply: () => setStatusSel(["at_risk"]),
    },
    {
      id: "rec-expand-helix",
      icon: TrendingUp,
      tone: "primary",
      title: t("rec_expansion_title"),
      detail: t("rec_expansion_detail"),
      applyLabel: t("rec_review"),
      onApply: () => setStatusSel(["expansion_ready"]),
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

      <ClientsKpis
        counts={counts}
        onSelectAtRisk={() => setStatusSel(["at_risk"])}
        onSelectRenewal={() => setStatusSel(["renewal_due"])}
        onSelectExpansion={() => setStatusSel(["expansion_ready"])}
        activeStatus={statusSel[0]}
      />

      <ResourcesFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("search_placeholder")}
        groups={filterGroups}
        onClearAll={clearAllFilters}
        resultCount={filtered.length}
        resultLabel={filtered.length === 1 ? t("result_client") : t("result_clients")}
      />

      <ClientsTimeline clients={filtered} weekCount={weekCount} />
    </div>
  );
}
