"use client";

import type { ComponentType } from "react";
import { Users, ToggleLeft, CreditCard, ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";

import { TrendBadge, type Trend } from "@/features/dashboard/trend-badge";

type Tone = "primary" | "accent" | "gold";

type KpiKey = "users" | "flags" | "billing" | "audit";

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
};

type Props = {
  usersCount: number;
  pendingInvites: number;
  flagsEnabled: number;
  flagsTotal: number;
  billingStatus: string;
  billingHint: string;
  auditToday: number;
  activeKey?: KpiKey;
  onSelectUsers?: () => void;
  onSelectFlags?: () => void;
  onSelectBilling?: () => void;
  onSelectAudit?: () => void;
};

export function AdminKpis({
  usersCount,
  pendingInvites,
  flagsEnabled,
  flagsTotal,
  billingStatus,
  billingHint,
  auditToday,
  activeKey,
  onSelectUsers,
  onSelectFlags,
  onSelectBilling,
  onSelectAudit,
}: Props) {
  const t = useTranslations("admin");

  const handlers: Record<KpiKey, (() => void) | undefined> = {
    users: onSelectUsers,
    flags: onSelectFlags,
    billing: onSelectBilling,
    audit: onSelectAudit,
  };

  const kpis: KPI[] = [
    {
      key: "users",
      label: t("kpi_users_label"),
      value: String(usersCount),
      unit: t("kpi_users_unit", { count: pendingInvites }),
      hint: t("kpi_users_hint"),
      trend: pendingInvites > 0 ? "up" : "flat",
      trendLabel: t("kpi_trend_review"),
      icon: Users,
      tone: "primary",
      highlight: pendingInvites > 0,
    },
    {
      key: "flags",
      label: t("kpi_flags_label"),
      value: String(flagsEnabled),
      unit: t("kpi_flags_unit", { total: flagsTotal }),
      hint: t("kpi_flags_hint"),
      trend: "flat",
      trendLabel: t("kpi_trend_config"),
      icon: ToggleLeft,
      tone: "accent",
    },
    {
      key: "billing",
      label: t("kpi_billing_label"),
      value: billingStatus,
      unit: "",
      hint: billingHint,
      trend: "flat",
      trendLabel: t("kpi_trend_view"),
      icon: CreditCard,
      tone: "primary",
    },
    {
      key: "audit",
      label: t("kpi_audit_label"),
      value: String(auditToday),
      unit: t("kpi_audit_unit", { count: auditToday }),
      hint: t("kpi_audit_hint"),
      trend: auditToday > 0 ? "up" : "flat",
      trendLabel: t("kpi_trend_review"),
      icon: ClipboardList,
      tone: "gold",
      highlight: auditToday > 10,
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
