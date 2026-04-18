"use client";

import type { ComponentType } from "react";
import { ArrowRight, CalendarOff, CheckSquare, Clock, Receipt } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type Action = {
  href: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  sub: string;
  emphasis?: boolean;
};

export function QuickActions() {
  const t = useTranslations("dashboard");

  const actions: Action[] = [
    {
      href: "/timesheets",
      icon: Clock,
      label: t("quick_log_time"),
      sub: t("quick_log_time_sub"),
      emphasis: true,
    },
    {
      href: "/leaves",
      icon: CalendarOff,
      label: t("quick_request_leave"),
      sub: t("quick_request_leave_sub"),
    },
    {
      href: "/expenses",
      icon: Receipt,
      label: t("quick_submit_expense"),
      sub: t("quick_submit_expense_sub"),
    },
    {
      href: "/approvals",
      icon: CheckSquare,
      label: t("quick_review_approvals"),
      sub: t("quick_review_approvals_sub"),
    },
  ];

  return (
    <section aria-labelledby="quick-actions-title" className="flex flex-col gap-4">
      <h2 id="quick-actions-title" className="section-overline">
        {t("quick_actions_overline")}
      </h2>
      <div className="quick-action-grid" role="list">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href + a.label}
              href={a.href}
              role="listitem"
              className="quick-action-pill"
              data-emphasis={a.emphasis ? "true" : undefined}
            >
              <span className="quick-action-pill-icon" aria-hidden>
                <Icon size={20} />
              </span>
              <span className="quick-action-pill-text">
                <span className="quick-action-pill-label">{a.label}</span>
                <span className="quick-action-pill-sub">{a.sub}</span>
              </span>
              <span className="quick-action-pill-arrow" aria-hidden>
                <ArrowRight size={16} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
