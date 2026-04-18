"use client";

import type { ComponentType } from "react";
import { Umbrella, Clock, CheckCircle2 } from "lucide-react";
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
  remainingDays: number;
  totalDays: number;
  pendingCount: number;
  approvedDays: number;
  onSelectPending?: () => void;
  onSelectApproved?: () => void;
  activeStatus?: string;
};

export function LeavesKpis({
  remainingDays,
  totalDays,
  pendingCount,
  approvedDays,
  onSelectPending,
  onSelectApproved,
  activeStatus,
}: Props) {
  const t = useTranslations("leaves");

  const handlers: Record<string, (() => void) | undefined> = {
    pending: onSelectPending,
    approved: onSelectApproved,
  };

  const kpis: KPI[] = [
    {
      key: "balance",
      label: t("kpi_balance_label"),
      value: String(remainingDays),
      unit: t("kpi_balance_unit", { total: totalDays }),
      hint: t("kpi_balance_hint"),
      trend: "flat",
      trendLabel: t("kpi_trend_year"),
      icon: Umbrella,
      tone: "primary",
    },
    {
      key: "pending",
      label: t("kpi_pending_label"),
      value: String(pendingCount),
      unit: t("kpi_pending_unit", { count: pendingCount }),
      hint: t("kpi_pending_hint"),
      trend: "up",
      trendLabel: t("kpi_trend_action"),
      icon: Clock,
      tone: "gold",
      highlight: pendingCount > 0,
    },
    {
      key: "approved",
      label: t("kpi_approved_label"),
      value: String(approvedDays),
      unit: t("kpi_approved_unit"),
      hint: t("kpi_approved_hint"),
      trend: "up",
      trendLabel: t("kpi_trend_taken"),
      icon: CheckCircle2,
      tone: "accent",
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
            disabled={!onClick}
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
                {kpi.unit && <span className="kpi-card-unit">{kpi.unit}</span>}
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
