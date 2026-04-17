"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { AlertTriangle, CheckSquare, Clock, RotateCw, Upload, UserPlus } from "lucide-react";

import { AIInsightCard } from "@/components/ui/ai-insight-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatPill } from "@/components/patterns/stat-pill";
import { useDashboardKpis } from "@/features/dashboard/use-kpis";

/**
 * Dashboard (Phase 4 pass 1).
 *
 * Surface contract:
 *  - Greeting + CTA row
 *  - Degraded-mode banner (conditional on kill_switch.ai)
 *  - KPI strip: 4 click-through tiles reading `/api/v1/dashboard/kpis`
 *  - Needs-attention block (honest empty state until Phase 5a lands
 *    approvals/invoices/expenses counts)
 *  - AI Insights row (honest empty state until the 24-analyzer library
 *    and /api/v1/insights ship in Phase 5a)
 *  - Empty-tenant onboarding panel (shown when all counts are 0)
 *
 * The shell hosts Cmd+K + skip-to-content; this page does not re-wire
 * them. Per OPUS §12 the page ships without a single dead entity link.
 */

type AttentionItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

function useGreeting(): string {
  const t = useTranslations("dashboard");
  const hour = new Date().getHours();
  if (hour < 12) return t("greeting_morning");
  if (hour < 18) return t("greeting_afternoon");
  return t("greeting_evening");
}

function formatGreetingDate(locale: string): string {
  const intlLocale = locale === "fr" ? "fr-FR" : "en-GB";
  return new Date().toLocaleDateString(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function KpiSkeletonRow() {
  // Match the exact pixel layout of StatPill (label + stat-row with value + secondary)
  // so the page does not shift when data arrives. OPUS G30.
  return (
    <div className="kpi-grid" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="stat-card" data-accent="primary">
          <div className="stat-label">
            <Skeleton variant="text" width="50%" height="0.75rem" />
          </div>
          <div className="stat-row">
            <div className="stat-value">
              <Skeleton variant="title" width="3ch" />
            </div>
            <div className="stat-secondary">
              <Skeleton variant="text" width="6ch" height="0.75rem" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useTranslations("dashboard");
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="dashboard-error"
      data-testid="dashboard-error"
    >
      <div className="dashboard-error-icon" aria-hidden>
        <AlertTriangle size={24} />
      </div>
      <div className="dashboard-error-content">
        <h2 className="dashboard-error-title">{t("error_title")}</h2>
        <p className="dashboard-error-body">{t("error_body")}</p>
        {message && <p className="dashboard-error-detail">{message}</p>}
      </div>
      <Button
        variant="primary"
        size="sm"
        leadingIcon={<RotateCw size={14} />}
        onClick={onRetry}
      >
        {t("error_retry")}
      </Button>
    </div>
  );
}

function OnboardingEmpty() {
  const t = useTranslations("dashboard");
  return (
    <div className="onboarding-panel" role="region" aria-labelledby="onboarding-title">
      <h2 id="onboarding-title" className="onboarding-title">
        {t("empty_title")}
      </h2>
      <p className="onboarding-body">{t("empty_body")}</p>
      <div className="onboarding-actions">
        <Link href="/onboarding">
          <Button variant="primary" leadingIcon={<Upload size={14} />}>
            {t("empty_cta_import")}
          </Button>
        </Link>
        <Link href="/employees">
          <Button variant="secondary" leadingIcon={<UserPlus size={14} />}>
            {t("empty_cta_invite")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function AttentionBlock({ items }: { items: AttentionItem[] }) {
  const t = useTranslations("dashboard");
  if (items.length === 0) {
    return (
      <section className="card attention-card" aria-labelledby="attention-title">
        <div className="card-header">
          <span id="attention-title" className="card-title">
            {t("attention_title")}
          </span>
        </div>
        <div className="card-body attention-empty">
          <p className="attention-empty-title">{t("attention_empty_title")}</p>
          <p className="attention-empty-body">{t("attention_empty_body")}</p>
        </div>
      </section>
    );
  }
  return (
    <section className="card attention-card" aria-labelledby="attention-title">
      <div className="card-header">
        <span id="attention-title" className="card-title">
          {t("attention_title")}
        </span>
      </div>
      <div className="card-body">
        <ul className="attention-list">
          {items.map((item) => (
            <li key={item.id} className="attention-row">
              <div className="attention-row-text">
                <p className="attention-row-title">{item.title}</p>
                <p className="attention-row-body">{item.body}</p>
              </div>
              <Link href={item.href}>
                <Button variant="secondary" size="sm">
                  {item.cta}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AIInsightsRow({ aiDegraded }: { aiDegraded: boolean }) {
  const t = useTranslations("dashboard");

  if (aiDegraded) {
    // When kill_switch.ai is on, spec says insights row is hidden entirely
    // and the banner above the KPI strip carries the explanation. Return
    // null to respect that contract.
    return null;
  }

  // Until the /api/v1/insights endpoint ships (Phase 5a), surface an
  // honest empty state explaining when real insights will arrive. Never
  // fabricate insights with hardcoded entity names. The card still carries
  // an action so the user has somewhere to go (OPUS B17).
  return (
    <section className="ai-insights-row" aria-labelledby="ai-insights-title">
      <h2 id="ai-insights-title" className="section-title">
        {t("ai_insights_title")}
      </h2>
      <AIInsightCard
        title={t("ai_insights_empty_title")}
        summary={<p>{t("ai_insights_empty_body")}</p>}
        actions={
          <Link href="/insights">
            <Button variant="ghost" size="sm">
              {t("ai_insights_explore_cta")}
            </Button>
          </Link>
        }
      />
    </section>
  );
}

export default function DashboardPage() {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const greeting = useGreeting();
  const { data, isLoading, isError, error, refetch } = useDashboardKpis();

  // Kill-switch read is not yet wired to a feature-flag endpoint; default
  // to off so the user sees full-value state. When the Phase 5a admin
  // service exposes tenant feature flags, flip this to a real read.
  const aiDegraded = false;

  const counts = {
    employees: data?.employees_total ?? 0,
    clients: data?.clients_total ?? 0,
    projectsActive: data?.projects_active ?? 0,
    projectsTotal: data?.projects_total ?? 0,
  };

  const isEmptyTenant =
    !isLoading &&
    !isError &&
    counts.employees === 0 &&
    counts.clients === 0 &&
    counts.projectsTotal === 0;

  // Phase 4 pass 1 has no live attention items until Phase 5a wires
  // approvals + invoices + expenses counts. Show an honest empty block
  // until that data lands; never fabricate a hardcoded list.
  const attentionItems: AttentionItem[] = [];

  return (
    <>
      {/* Greeting row */}
      <header className="dashboard-greeting">
        <div className="dashboard-greeting-text">
          <h1 className="dashboard-greeting-title">{greeting}</h1>
          <p className="dashboard-greeting-date">{formatGreetingDate(locale)}</p>
        </div>
        <div className="dashboard-greeting-actions">
          <Link href="/timesheets">
            <Button variant="secondary" size="sm" leadingIcon={<Clock size={14} />}>
              {t("quick_log_time")}
            </Button>
          </Link>
          <Link href="/approvals">
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<CheckSquare size={14} />}
            >
              {t("quick_review_approvals")}
            </Button>
          </Link>
        </div>
      </header>

      {aiDegraded && (
        <div
          className="degraded-banner"
          role="status"
          aria-live="polite"
          data-testid="ai-degraded-banner"
        >
          {t("ai_degraded_banner")}
        </div>
      )}

      {isError && (
        <DashboardError
          message={error instanceof Error ? error.message : ""}
          onRetry={() => refetch()}
        />
      )}

      {/* KPI strip */}
      {isLoading ? (
        <div aria-busy="true" aria-label={t("loading_label")}>
          <KpiSkeletonRow />
        </div>
      ) : (
        <div className="kpi-grid">
          <StatPill
            label={t("kpi_team_label")}
            value={counts.employees}
            secondary={t("kpi_team_hint")}
            accent="primary"
            href="/employees"
            ariaLabel={t("kpi_team_nav")}
          />
          <StatPill
            label={t("kpi_clients_label")}
            value={counts.clients}
            secondary={t("kpi_clients_hint")}
            accent="info"
            href="/clients"
            ariaLabel={t("kpi_clients_nav")}
          />
          <StatPill
            label={t("kpi_projects_label")}
            value={counts.projectsActive}
            secondary={t("kpi_projects_hint_total", {
              total: counts.projectsTotal,
            })}
            accent="accent"
            href="/projects?status=active"
            ariaLabel={t("kpi_projects_nav")}
          />
          <StatPill
            label={t("kpi_projects_total_label")}
            value={counts.projectsTotal}
            secondary={t("kpi_projects_total_hint")}
            accent="gold"
            href="/projects"
            ariaLabel={t("kpi_projects_nav")}
          />
        </div>
      )}

      {/* Onboarding empty state for a fresh tenant */}
      {isEmptyTenant && <OnboardingEmpty />}

      {/* Attention block */}
      {!isEmptyTenant && !isLoading && !isError && (
        <AttentionBlock items={attentionItems} />
      )}

      {/* AI insights */}
      {!isEmptyTenant && <AIInsightsRow aiDegraded={aiDegraded} />}
    </>
  );
}
