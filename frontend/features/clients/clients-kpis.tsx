"use client";

import type { ComponentType } from "react";
import { AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";
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
  counts: { at_risk: number; renewal_due: number; expansion_ready: number };
  onSelectAtRisk?: () => void;
  onSelectRenewal?: () => void;
  onSelectExpansion?: () => void;
  activeStatus?: string;
};

export function ClientsKpis({
  counts,
  onSelectAtRisk,
  onSelectRenewal,
  onSelectExpansion,
  activeStatus,
}: Props) {
  const t = useTranslations("clients");

  const handlers: Record<string, (() => void) | undefined> = {
    at_risk: onSelectAtRisk,
    renewal_due: onSelectRenewal,
    expansion_ready: onSelectExpansion,
  };

  const kpis: KPI[] = [
    {
      key: "at_risk",
      label: t("kpi_at_risk_label"),
      value: String(counts.at_risk),
      unit: t("kpi_clients_unit"),
      hint: t("kpi_at_risk_hint"),
      trend: "up",
      trendLabel: t("kpi_trend_action"),
      icon: AlertTriangle,
      tone: "gold",
      highlight: true,
    },
    {
      key: "renewal_due",
      label: t("kpi_renewal_label"),
      value: String(counts.renewal_due),
      unit: t("kpi_clients_unit"),
      hint: t("kpi_renewal_hint"),
      trend: "up",
      trendLabel: "+1",
      icon: RefreshCw,
      tone: "accent",
    },
    {
      key: "expansion_ready",
      label: t("kpi_expansion_label"),
      value: String(counts.expansion_ready),
      unit: t("kpi_clients_unit"),
      hint: t("kpi_expansion_hint"),
      trend: "up",
      trendLabel: "+1",
      icon: TrendingUp,
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
