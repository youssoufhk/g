"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { formatDate, intlLocale } from "@/lib/format";

function useGreeting() {
  const t = useTranslations("dashboard");
  const hour = new Date().getHours();
  if (hour < 12) return t("greeting_morning");
  if (hour < 18) return t("greeting_afternoon");
  return t("greeting_evening");
}

type InsightSignal = {
  key: string;
  label: string;
  source: string;
};

export function InsightBanner({ firstName }: { firstName?: string }) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const greeting = useGreeting();
  const [showWhy, setShowWhy] = useState(false);

  const signals: InsightSignal[] = [
    {
      key: "count",
      label: t("insight_signal_count", { count: 2 }),
      source: "timesheets.pending_count",
    },
    {
      key: "window",
      label: t("insight_signal_window"),
      source: "timesheets.iso_week(last)",
    },
    {
      key: "deadline",
      label: t("insight_signal_deadline"),
      source: "policy.timesheet_submit_deadline",
    },
  ];

  return (
    <section aria-labelledby="insight-greeting" className="flex flex-col gap-5">
      <div className="insight-greeting">
        <div>
          <p className="insight-greeting-date">{formatDate(new Date(), "weekdayLong", intlLocale(locale))}</p>
          <h1 id="insight-greeting" className="insight-greeting-title">
            {greeting}
            {firstName ? <>, <em>{firstName}</em></> : null}.
          </h1>
        </div>
        <div className="insight-live" aria-hidden>
          <span className="insight-live-dot" />
          {t("insight_live")}
        </div>
      </div>

      <div className="insight-card" role="status">
        <div className="insight-card-icon" aria-hidden>
          <Sparkles size={16} />
        </div>
        <div className="insight-card-body">
          <span className="insight-card-chip">{t("insight_chip")}</span>
          <p className="insight-card-text">
            {t.rich("insight_body_pending", {
              b: (chunks) => <strong>{chunks}</strong>,
              count: 2,
            })}
          </p>
        </div>
        <button
          type="button"
          className="insight-card-why"
          aria-expanded={showWhy}
          aria-controls="insight-signals"
          onClick={() => setShowWhy((v) => !v)}
        >
          {t("insight_why")}
          <ChevronDown
            size={12}
            aria-hidden
            style={{
              transform: showWhy ? "rotate(180deg)" : undefined,
              transition: "transform var(--motion-fast) var(--ease-out)",
            }}
          />
        </button>
        <Link href="/timesheets" className="insight-card-action">
          {t("insight_cta_review")}
          <ArrowUpRight size={16} aria-hidden />
        </Link>
      </div>
      {showWhy ? (
        <ul
          id="insight-signals"
          className="insight-signals"
          aria-label={t("insight_signals_label")}
        >
          {signals.map((signal) => (
            <li key={signal.key} className="insight-signal-chip">
              <span className="insight-signal-label">{signal.label}</span>
              <code className="insight-signal-source">{signal.source}</code>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
