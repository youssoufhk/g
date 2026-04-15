import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

import { Card } from "./card";

type Severity = "info" | "warning" | "error" | "success";

export type AIInsightCardProps = {
  title: string;
  severity?: Severity;
  summary: string;
  evidence?: string[];
  actions?: ReactNode;
  className?: string;
};

const severityToBorder: Record<Severity, string> = {
  info: "border-[var(--color-info-muted)]",
  warning: "border-[var(--color-warning-muted)]",
  error: "border-[var(--color-error-muted)]",
  success: "border-[var(--color-success-muted)]",
};

export function AIInsightCard({
  title,
  severity = "info",
  summary,
  evidence,
  actions,
  className,
}: AIInsightCardProps) {
  return (
    <Card
      padded
      className={clsx("border", severityToBorder[severity], className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Sparkles
            className="h-4 w-4 text-[var(--color-primary)] mt-0.5"
            aria-hidden
          />
          <h4 className="text-sm font-semibold text-[var(--color-text-1)]">
            {title}
          </h4>
        </div>
      </div>
      <p className="mt-2 text-sm text-[var(--color-text-2)]">{summary}</p>
      {evidence && evidence.length > 0 && (
        <ul className="mt-3 space-y-1 list-disc pl-5 text-xs text-[var(--color-text-3)]">
          {evidence.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {actions && <div className="mt-4 flex items-center gap-2">{actions}</div>}
    </Card>
  );
}
