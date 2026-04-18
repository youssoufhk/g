"use client";

import type { ComponentType } from "react";
import { Clock, Briefcase, AlertTriangle } from "lucide-react";
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
  totalHours: number;
  targetHours: number;
  billableHours: number;
  overtimeHours: number;
};

export function TimesheetsKpis({
  totalHours,
  targetHours,
  billableHours,
  overtimeHours,
}: Props) {
  const t = useTranslations("timesheets");

  const kpis: KPI[] = [
    {
      key: "total",
      label: t("kpi_total_label"),
      value: String(totalHours),
      unit: t("kpi_total_unit", { target: targetHours }),
      hint: t("kpi_total_hint"),
      trend: "flat",
      trendLabel: t("kpi_trend_week"),
      icon: Clock,
      tone: "primary",
    },
    {
      key: "billable",
      label: t("kpi_billable_label"),
      value: String(billableHours),
      unit: t("kpi_billable_unit"),
      hint: t("kpi_billable_hint"),
      trend: "up",
      trendLabel: t("kpi_trend_track"),
      icon: Briefcase,
      tone: "accent",
    },
    {
      key: "overtime",
      label: t("kpi_overtime_label"),
      value: String(overtimeHours),
      unit: t("kpi_overtime_unit"),
      hint: t("kpi_overtime_hint"),
      trend: overtimeHours > 0 ? "up" : "flat",
      trendLabel: t("kpi_trend_action"),
      icon: AlertTriangle,
      tone: "gold",
      highlight: overtimeHours > 0,
    },
  ];

  return (
    <section className="resources-kpi-grid" aria-label={t("kpi_section_aria")}>
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.key}
            className="kpi-card-large"
            data-highlight={kpi.highlight ? "true" : undefined}
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
              <span
                className="kpi-card-value"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {kpi.value}
                {kpi.unit && <span className="kpi-card-unit">{kpi.unit}</span>}
              </span>
            </div>
            <footer className="kpi-card-footer">
              <p className="kpi-card-hint">{kpi.hint}</p>
              <TrendBadge trend={kpi.trend} label={kpi.trendLabel} />
            </footer>
          </div>
        );
      })}
    </section>
  );
}
