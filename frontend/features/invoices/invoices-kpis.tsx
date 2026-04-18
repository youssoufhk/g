"use client";

import type { ComponentType } from "react";
import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";
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
  overdueAmount: string;
  overdueCount: number;
  paidYtd: string;
  draftsCount: number;
  onSelectOverdue?: () => void;
  onSelectPaid?: () => void;
  onSelectDrafts?: () => void;
  activeStatus?: string;
};

export function InvoicesKpis({
  overdueAmount,
  overdueCount,
  paidYtd,
  draftsCount,
  onSelectOverdue,
  onSelectPaid,
  onSelectDrafts,
  activeStatus,
}: Props) {
  const t = useTranslations("invoices");

  const handlers: Record<string, (() => void) | undefined> = {
    overdue: onSelectOverdue,
    paid: onSelectPaid,
    draft: onSelectDrafts,
  };

  const kpis: KPI[] = [
    {
      key: "overdue",
      label: t("kpi_overdue_label"),
      value: overdueAmount,
      unit: t("kpi_overdue_unit", { count: overdueCount }),
      hint: t("kpi_overdue_hint"),
      trend: "up",
      trendLabel: t("kpi_trend_action"),
      icon: AlertTriangle,
      tone: "gold",
      highlight: overdueCount > 0,
    },
    {
      key: "paid",
      label: t("kpi_paid_label"),
      value: paidYtd,
      unit: "",
      hint: t("kpi_paid_hint"),
      trend: "up",
      trendLabel: t("kpi_trend_ytd"),
      icon: CheckCircle2,
      tone: "primary",
    },
    {
      key: "draft",
      label: t("kpi_drafts_label"),
      value: String(draftsCount),
      unit: t("kpi_drafts_unit"),
      hint: t("kpi_drafts_hint"),
      trend: "flat",
      trendLabel: t("kpi_trend_review"),
      icon: FileText,
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
