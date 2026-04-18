"use client";

import type { ComponentType } from "react";
import { Clock, Receipt, Umbrella } from "lucide-react";
import { useTranslations } from "next-intl";

import { TrendBadge, type Trend } from "@/features/dashboard/trend-badge";

type Tone = "primary" | "accent" | "gold";

type KpiKey = "timesheet" | "expense" | "leave";

type KPI = {
  key: KpiKey;
  label: string;
  value: string;
  unit: string;
  hint: string;
  trend: Trend;
  trendLabel: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  tone: Tone;
  highlight?: boolean;
  disabled?: boolean;
};

type Props = {
  timesheetCount: number;
  expenseCount: number;
  leaveCount: number;
  activeType?: KpiKey;
  onSelectTimesheet?: () => void;
  onSelectExpense?: () => void;
  onSelectLeave?: () => void;
};

export function ApprovalsKpis({
  timesheetCount,
  expenseCount,
  leaveCount,
  activeType,
  onSelectTimesheet,
  onSelectExpense,
  onSelectLeave,
}: Props) {
  const t = useTranslations("approvals");

  const handlers: Record<KpiKey, (() => void) | undefined> = {
    timesheet: onSelectTimesheet,
    expense: onSelectExpense,
    leave: onSelectLeave,
  };

  const kpis: KPI[] = [
    {
      key: "timesheet",
      label: t("kpi_timesheet_label"),
      value: String(timesheetCount),
      unit: t("kpi_pending_unit", { count: timesheetCount }),
      hint: t("kpi_timesheet_hint"),
      trend: timesheetCount > 0 ? "up" : "flat",
      trendLabel: t("kpi_trend_action"),
      icon: Clock,
      tone: "primary",
      highlight: timesheetCount > 0,
    },
    {
      key: "expense",
      label: t("kpi_expense_label"),
      value: String(expenseCount),
      unit: t("kpi_pending_unit", { count: expenseCount }),
      hint: t("kpi_expense_hint"),
      trend: expenseCount > 0 ? "up" : "flat",
      trendLabel: t("kpi_trend_action"),
      icon: Receipt,
      tone: "gold",
      highlight: expenseCount > 0,
    },
    {
      key: "leave",
      label: t("kpi_leave_label"),
      value: String(leaveCount),
      unit: t("kpi_pending_unit", { count: leaveCount }),
      hint: t("kpi_leave_hint"),
      trend: leaveCount > 0 ? "up" : "flat",
      trendLabel: t("kpi_trend_action"),
      icon: Umbrella,
      tone: "accent",
      highlight: leaveCount > 0,
    },
  ];

  return (
    <section className="resources-kpi-grid" aria-label={t("kpi_section_aria")}>
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const onClick = handlers[kpi.key];
        const isActive = activeType === kpi.key;
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
              <span className="kpi-card-value" style={{ fontVariantNumeric: "tabular-nums" }}>
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
