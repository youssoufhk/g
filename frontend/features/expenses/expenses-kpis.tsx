"use client";

import type { ComponentType } from "react";
import { Clock, CheckCircle2, Wallet } from "lucide-react";
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
  pendingAmount: string;
  pendingCount: number;
  approvedAmount: string;
  reimbursedAmount: string;
  onSelectPending?: () => void;
  onSelectApproved?: () => void;
  onSelectReimbursed?: () => void;
  activeStatus?: string;
};

export function ExpensesKpis({
  pendingAmount,
  pendingCount,
  approvedAmount,
  reimbursedAmount,
  onSelectPending,
  onSelectApproved,
  onSelectReimbursed,
  activeStatus,
}: Props) {
  const t = useTranslations("expenses");

  const handlers: Record<string, (() => void) | undefined> = {
    pending: onSelectPending,
    approved: onSelectApproved,
    reimbursed: onSelectReimbursed,
  };

  const kpis: KPI[] = [
    {
      key: "pending",
      label: t("kpi_pending_label"),
      value: pendingAmount,
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
      value: approvedAmount,
      unit: "",
      hint: t("kpi_approved_hint"),
      trend: "up",
      trendLabel: t("kpi_trend_ready"),
      icon: CheckCircle2,
      tone: "primary",
    },
    {
      key: "reimbursed",
      label: t("kpi_reimbursed_label"),
      value: reimbursedAmount,
      unit: "",
      hint: t("kpi_reimbursed_hint"),
      trend: "flat",
      trendLabel: t("kpi_trend_month"),
      icon: Wallet,
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
