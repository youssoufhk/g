"use client";

import { useTranslations } from "next-intl";

import { ActivityTable } from "@/features/dashboard/activity-table";
import { InsightBanner } from "@/features/dashboard/insight-banner";
import { KpiStrip } from "@/features/dashboard/kpi-strip";
import { QuickActions } from "@/features/dashboard/quick-actions";

/**
 * Dashboard - v0 preview port.
 *
 * This is Phase 1a.2: the dashboard renders the v0 layout
 * (greeting + AI insight banner, 4 large KPI cards,
 * approvals activity table) using hardcoded preview data. Real
 * backend wiring comes in a follow-up pass: each section needs its
 * own endpoint (see specs/APP_BLUEPRINT.md section on dashboard).
 *
 * Every entity-like link still routes to a real page in the app so
 * there are no dead ends while the mock pass is in place.
 */
export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>

      <div className="flex flex-col" style={{ gap: "var(--space-8)" }}>
        <InsightBanner />
        <QuickActions />
        <KpiStrip />
        <ActivityTable />
        <footer className="dashboard-footer">
          <span>{t("footer_crafted")}</span>
          <span className="dashboard-footer-version">{t("footer_version")}</span>
        </footer>
      </div>
    </>
  );
}
