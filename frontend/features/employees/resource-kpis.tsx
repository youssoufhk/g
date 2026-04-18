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
  onSelectAvailable?: () => void;
  onSelectOver?: () => void;
  onSelectRolling?: () => void;
  activeStatus?: string;
};

export function ResourceKpis({
  onSelectAvailable,
  onSelectOver,
  onSelectRolling,
  activeStatus,
}: Props = {}) {
  const t = useTranslations("employees");

  const handlers: Record<string, (() => void) | undefined> = {
    available: onSelectAvailable,
    over: onSelectOver,
    rolling: onSelectRolling,
  };
  const activeKey =
    activeStatus === "bench"
      ? "available"
      : activeStatus === "overallocated"
      ? "over"
      : activeStatus === "active"
      ? "rolling"
      : undefined;

  const kpis: KPI[] = [
    {
      key: "available",
      label: t("kpi_bench_label"),
      value: "3",
      unit: t("kpi_people_unit"),
      hint: t("kpi_bench_hint"),
      trend: "up",
      trendLabel: "+1",
      icon: UserMinus,
      tone: "primary",
    },
    {
      key: "over",
      label: t("kpi_over_label"),
      value: "3",
      unit: t("kpi_people_unit"),
      hint: t("kpi_over_hint"),
      trend: "up",
      trendLabel: t("kpi_trend_action"),
      icon: AlertTriangle,
      tone: "gold",
      highlight: true,
    },
    {
      key: "rolling",
      label: t("kpi_rolling_label"),
      value: "4",
      unit: t("kpi_people_unit"),
      hint: t("kpi_rolling_hint"),
      trend: "down",
      trendLabel: "-8h",
      icon: Hourglass,
      tone: "accent",
    },
  ];

  return (
    <section className="resources-kpi-grid" aria-label={t("kpi_section_aria")}>
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const onClick = handlers[kpi.key];
        const isActive = activeKey === kpi.key;
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
