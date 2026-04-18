"use client";

import type { ComponentType } from "react";
import { AlertTriangle, Hourglass, UserMinus } from "lucide-react";
import { useTranslations } from "next-intl";

import { TrendBadge, type Trend } from "@/features/dashboard/trend-badge";

type Tone = "primary" | "accent" | "gold";

type KPI = {
  key: string;
  label: string;
  value: string;
  unit: string;
  hint: string;
  trend: Trend;
  trendLabel: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  tone: Tone;
  highlight?: boolean;
};

type Props = {
  onSelectAtRisk?: () => void;
  onSelectEndingSoon?: () => void;
  onSelectUnstaffed?: () => void;
  activeStatus?: string;
  counts: { at_risk: number; ending_soon: number; unstaffed: number };
};

export function PortfolioKpis({
  onSelectAtRisk,
  onSelectEndingSoon,
  onSelectUnstaffed,
  activeStatus,
  counts,
}: Props) {
  const t = useTranslations("projects");

  const handlers: Record<string, (() => void) | undefined> = {
    at_risk: onSelectAtRisk,
    ending_soon: onSelectEndingSoon,
    unstaffed: onSelectUnstaffed,
  };

  const kpis: KPI[] = [
    {
      key: "at_risk",
      label: t("kpi_at_risk_label"),
      value: String(counts.at_risk),
      unit: t("kpi_projects_unit"),
      hint: t("kpi_at_risk_hint"),
      trend: "up",
      trendLabel: t("kpi_trend_action"),
      icon: AlertTriangle,
      tone: "gold",
      highlight: true,
    },
    {
      key: "ending_soon",
      label: t("kpi_ending_label"),
      value: String(counts.ending_soon),
      unit: t("kpi_projects_unit"),
      hint: t("kpi_ending_hint"),
      trend: "down",
      trendLabel: "-1",
      icon: Hourglass,
      tone: "accent",
    },
    {
      key: "unstaffed",
      label: t("kpi_unstaffed_label"),
      value: String(counts.unstaffed),
      unit: t("kpi_projects_unit"),
      hint: t("kpi_unstaffed_hint"),
      trend: "up",
      trendLabel: "+1",
      icon: UserMinus,
      tone: "primary",
    },
  ];

  return (
    <section className="resources-kpi-grid" aria-label={t("kpi_section_aria")}>
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const onClick = handlers[kpi.key];
        const isActive = activeStatus === kpi.key;
        return (
          <button
            type="button"
            key={kpi.key}
            className="kpi-card-large kpi-card-large-button"
            data-highlight={kpi.highlight ? "true" : undefined}
            data-active={isActive ? "true" : undefined}
            onClick={onClick}
            aria-pressed={isActive}
          >
            <header className="kpi-card-header">
              <span className="kpi-card-label-group">
                <span className="kpi-card-icon" data-tone={kpi.tone} aria-hidden>
                  <Icon size={16} />
                </span>
                <span className="kpi-card-label">{kpi.label}</span>
              </span>
            </header>
            <div className="kpi-card-body">
              <span className="kpi-card-value">
                {kpi.value}
                <span className="kpi-card-unit">{kpi.unit}</span>
              </span>
            </div>
            <footer className="kpi-card-footer">
              <p className="kpi-card-hint">{kpi.hint}</p>
              <TrendBadge trend={kpi.trend} label={kpi.trendLabel} />
            </footer>
          </button>
        );
      })}
    </section>
  );
}
