"use client";

import type { ComponentType } from "react";
import { CheckCircle2, Clock3, Palmtree, Receipt } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { TrendBadge, type Trend } from "./trend-badge";

type IconTone = "primary" | "accent" | "gold" | "info";

type KPI = {
  key: string;
  label: string;
  value: string;
  unit?: string;
  hint: string;
  trend: Trend;
  trendLabel: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  tone: IconTone;
  href: string;
  actionLabel?: string;
};

export function KpiStrip() {
  const t = useTranslations("dashboard");

  const kpis: KPI[] = [
    {
      key: "work-time",
      label: t("mock_kpi_work_time_label"),
      value: "38",
      unit: "h",
      hint: t("mock_kpi_work_time_hint"),
      trend: "up",
      trendLabel: t("mock_kpi_work_time_trend"),
      icon: Clock3,
      tone: "primary",
      href: "/timesheets",
    },
    {
      key: "holidays",
      label: t("mock_kpi_holidays_label"),
      value: "12",
      unit: t("mock_kpi_holidays_unit"),
      hint: t("mock_kpi_holidays_hint"),
      trend: "flat",
      trendLabel: t("mock_kpi_holidays_trend"),
      icon: Palmtree,
      tone: "accent",
      href: "/leaves",
    },
    {
      key: "expenses",
      label: t("mock_kpi_expenses_label"),
      value: "450",
      unit: "EUR",
      hint: t("mock_kpi_expenses_hint"),
      trend: "down",
      trendLabel: t("mock_kpi_expenses_trend"),
      icon: Receipt,
      tone: "gold",
      href: "/expenses",
    },
    {
      key: "approvals",
      label: t("mock_kpi_approvals_label"),
      value: "3",
      unit: t("mock_kpi_approvals_unit"),
      hint: t("mock_kpi_approvals_hint"),
      trend: "up",
      trendLabel: t("mock_kpi_approvals_trend"),
      icon: CheckCircle2,
      tone: "gold",
      href: "/approvals",
      actionLabel: t("mock_kpi_action_chip"),
    },
  ];

  return (
    <section className="dashboard-kpi-section" aria-labelledby="dashboard-kpi-section-title">
      <div className="dashboard-kpi-section-header">
        <h2 id="dashboard-kpi-section-title" className="section-overline">
          {t("mock_kpi_section_title")}
        </h2>
        <span className="preview-chip">{t("preview_data")}</span>
        <span className="dashboard-kpi-section-meta">{t("mock_kpi_week_label")}</span>
      </div>
      <div className="dashboard-kpi-section-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.key}
              href={kpi.href}
              className="kpi-card-large"
              data-highlight={kpi.actionLabel ? "true" : undefined}
              aria-label={`${kpi.label}: ${kpi.value}${kpi.unit ? " " + kpi.unit : ""}`}
            >
              <header className="kpi-card-header">
                <span className="kpi-card-label-group">
                  <span className="kpi-card-icon" data-tone={kpi.tone} aria-hidden>
                    <Icon size={16} />
                  </span>
                  <span className="kpi-card-label">{kpi.label}</span>
                </span>
                {kpi.actionLabel && (
                  <span className="kpi-card-action-pill" aria-hidden>
                    {kpi.actionLabel}
                  </span>
                )}
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
            </Link>
          );
        })}
      </div>
    </section>
  );
}
