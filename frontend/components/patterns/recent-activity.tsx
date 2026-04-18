"use client";

import { Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { EmptyState } from "@/components/patterns/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentActivity } from "@/features/activity/use-activity";
import { formatDate, intlLocale } from "@/lib/format";

export type RecentActivityProps = {
  entity_type: "employee" | "client" | "project" | "invoice";
  entity_id: string;
};

/**
 * Shared detail-page audit feed. Consumes `useRecentActivity`, which
 * dual-arms USE_API over `/audit/entries` once the backend read endpoint
 * lands (CRITIC_PLAN C11 + D5). Each row shows actor, action, timestamp
 * and a compact before->after diff.
 */
export function RecentActivity({ entity_type, entity_id }: RecentActivityProps) {
  const t = useTranslations("activity");
  const locale = useLocale();
  const { data: entries, isLoading } = useRecentActivity(entity_type, entity_id);

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <Skeleton style={{ height: 56 }} />
        <Skeleton style={{ height: 56 }} />
        <Skeleton style={{ height: 56 }} />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title={t("empty_title")}
        description={t("empty_desc")}
      />
    );
  }

  return (
    <ol
      className="recent-activity-list"
      aria-label={t("list_aria")}
    >
      {entries.map((entry) => (
        <li key={entry.id} className="recent-activity-item">
          <div className="recent-activity-meta">
            <span className="recent-activity-actor">{entry.actor_name}</span>
            <span className="recent-activity-action">{entry.action}</span>
            <time className="recent-activity-time" dateTime={entry.occurred_at}>
              {formatDate(new Date(entry.occurred_at), "withTime", intlLocale(locale))}
            </time>
          </div>
          {entry.diff.length > 0 ? (
            <ul className="recent-activity-diff">
              {entry.diff.map((d) => (
                <li key={d.field} className="recent-activity-diff-row">
                  <span className="recent-activity-diff-field">{d.field}</span>
                  <span className="recent-activity-diff-before">{formatValue(d.before)}</span>
                  <span className="recent-activity-diff-arrow" aria-hidden>→</span>
                  <span className="recent-activity-diff-after">{formatValue(d.after)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function formatValue(value: string | number | null): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return String(value);
  return value;
}
