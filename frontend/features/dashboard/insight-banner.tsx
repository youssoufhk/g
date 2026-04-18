"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
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

export function InsightBanner({ firstName }: { firstName?: string }) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const greeting = useGreeting();

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
        <Link href="/timesheets" className="insight-card-action">
          {t("insight_cta_review")}
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
