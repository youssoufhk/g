"use client";

import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder for the dashboard KPI strip. The grid shape,
 * card count, header layout and footer footprint mirror KpiStrip so
 * the page does not reflow on first paint. CRITIC_PLAN B10.
 *
 * Not yet mounted: KpiStrip renders hardcoded mock data until the
 * /dashboard/kpis endpoint is wired. The moment the hook switches
 * to real queries, swap `<KpiStrip />` for
 * `{isPending ? <KpiStripSkeleton /> : <KpiStrip data={data} />}`.
 */
export function KpiStripSkeleton() {
  const t = useTranslations("dashboard");
  return (
    <section
      className="dashboard-kpi-section"
      aria-labelledby="dashboard-kpi-section-skeleton-title"
      aria-busy="true"
    >
      <div className="dashboard-kpi-section-header">
        <h2
          id="dashboard-kpi-section-skeleton-title"
          className="section-overline"
        >
          {t("mock_kpi_section_title")}
        </h2>
      </div>
      <div className="dashboard-kpi-section-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="kpi-card-large" aria-hidden>
            <header className="kpi-card-header">
              <span className="kpi-card-label-group">
                <Skeleton variant="avatar" width={24} height={24} />
                <Skeleton variant="title" width={96} />
              </span>
            </header>
            <div className="kpi-card-body">
              <Skeleton variant="title" width={72} height={32} />
            </div>
            <footer className="kpi-card-footer">
              <Skeleton variant="text" width={120} />
              <Skeleton variant="text" width={48} />
            </footer>
          </div>
        ))}
      </div>
    </section>
  );
}
