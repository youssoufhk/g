"use client";

import type { ComponentType } from "react";
import { Clock3, MoreHorizontal, Palmtree, Receipt } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type Status = "pending" | "review" | "approved";
type AvatarTone = "primary" | "accent" | "gold";

type Row = {
  id: string;
  kind: "timesheet" | "expense" | "leave";
  personName: string;
  personRole: string;
  initials: string;
  avatarTone: AvatarTone;
  detail: string;
  amount: string;
  status: Status;
  when: string;
  href: string;
};

const ICONS: Record<Row["kind"], ComponentType<{ size?: number }>> = {
  timesheet: Clock3,
  expense: Receipt,
  leave: Palmtree,
};

function StatusBadge({ status, label }: { status: Status; label: string }) {
  return (
    <span className="status-badge" data-status={status}>
      {label}
    </span>
  );
}

export function ActivityTable() {
  const t = useTranslations("dashboard");

  const rows: Row[] = [
    {
      id: "TS-2041",
      kind: "timesheet",
      personName: "Marco Bianchi",
      personRole: t("mock_dept_engineering"),
      initials: "MB",
      avatarTone: "primary",
      detail: t("mock_row_ts_detail"),
      amount: "42.5 h",
      status: "pending",
      when: t("mock_when_2d"),
      href: "/approvals",
    },
    {
      id: "EX-8817",
      kind: "expense",
      personName: "Priya Raman",
      personRole: t("mock_dept_design"),
      initials: "PR",
      avatarTone: "gold",
      detail: t("mock_row_ex_detail"),
      amount: "184.20 EUR",
      status: "review",
      when: t("mock_when_4h"),
      href: "/expenses",
    },
    {
      id: "LV-0312",
      kind: "leave",
      personName: "Jonas Keller",
      personRole: t("mock_dept_operations"),
      initials: "JK",
      avatarTone: "accent",
      detail: t("mock_row_lv_detail"),
      amount: t("mock_row_lv_amount"),
      status: "approved",
      when: t("mock_when_yesterday"),
      href: "/leaves",
    },
  ];

  const statusLabel: Record<Status, string> = {
    pending: t("status_pending"),
    review: t("status_review"),
    approved: t("status_approved"),
  };
  const kindLabel: Record<Row["kind"], string> = {
    timesheet: t("kind_timesheet"),
    expense: t("kind_expense"),
    leave: t("kind_leave"),
  };

  return (
    <section className="activity-section" aria-labelledby="activity-title">
      <div className="activity-section-header">
        <div>
          <h2 id="activity-title" className="activity-section-title">
            {t("activity_section_title")}
          </h2>
          <p className="activity-section-sub">{t("activity_section_sub")}</p>
        </div>
        <Link href="/approvals" className="activity-view-all">
          {t("activity_view_all")}
          <span className="activity-view-all-count">7</span>
        </Link>
      </div>

      <div className="activity-table glass-strong">
        <div className="activity-thead" role="presentation">
          <div>{t("activity_col_type")}</div>
          <div>{t("activity_col_submitted_by")}</div>
          <div>{t("activity_col_amount")}</div>
          <div>{t("activity_col_status")}</div>
          <div className="sr-only">{t("activity_col_actions")}</div>
        </div>
        <div className="activity-divider" aria-hidden />
        <ul className="activity-rows">
          {rows.map((row) => {
            const Icon = ICONS[row.kind];
            return (
              <li key={row.id} className="activity-row">
                <Link href={row.href} className="activity-type">
                  <span className="activity-type-icon" aria-hidden>
                    <Icon size={16} />
                  </span>
                  <span className="activity-type-text">
                    <span className="activity-type-kind">{kindLabel[row.kind]}</span>
                    <span className="activity-type-meta">
                      {row.id} · {row.detail}
                    </span>
                  </span>
                </Link>
                <div className="activity-submitter">
                  <span className="activity-avatar" data-tone={row.avatarTone} aria-hidden>
                    {row.initials}
                  </span>
                  <span className="activity-submitter-text">
                    <span className="activity-submitter-name">{row.personName}</span>
                    <span className="activity-submitter-meta">
                      {row.personRole} · {row.when}
                    </span>
                  </span>
                </div>
                <div className="activity-amount">{row.amount}</div>
                <div>
                  <StatusBadge status={row.status} label={statusLabel[row.status]} />
                </div>
                <button
                  type="button"
                  className="activity-row-action"
                  aria-label={t("activity_row_actions")}
                >
                  <MoreHorizontal size={16} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
