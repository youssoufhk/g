import type { ReactNode } from "react";

/**
 * AIInvoiceExplanation is the month-end close explanation surface. Used
 * ONLY on `/invoices/month-end` next to each draft invoice card. The
 * severity prop drives the 3px left border color; the body is 2-3 Gemini
 * sentences; up to 3 signal chips surface the top ranked analyzer reasons.
 *
 * Spec reference: specs/DESIGN_SYSTEM.md section 5.10.
 */
export type AIInvoiceExplanationSeverity = "info" | "warning" | "action_needed";

export type AIInvoiceExplanationProps = {
  rationale: string;
  severity?: AIInvoiceExplanationSeverity;
  /** Up to 3 short signal chips. Extras are dropped. */
  signals?: string[];
  /** When the AI kill switch is on, render the degraded fallback. */
  unavailable?: boolean;
};

const SEVERITY_BORDER: Record<AIInvoiceExplanationSeverity, string> = {
  info: "var(--color-primary-muted)",
  warning: "var(--color-warning)",
  action_needed: "var(--color-error-muted)",
};

const FALLBACK_TEXT = "AI explanation temporarily unavailable.";

export function AIInvoiceExplanation({
  rationale,
  severity = "info",
  signals,
  unavailable = false,
}: AIInvoiceExplanationProps) {
  const borderColor = unavailable
    ? "var(--color-surface-2)"
    : SEVERITY_BORDER[severity];
  const body = unavailable ? FALLBACK_TEXT : rationale;
  const chips = unavailable ? [] : (signals ?? []).slice(0, 3);

  return (
    <aside
      className="ai-invoice-explanation"
      aria-live="polite"
      style={{
        width: "100%",
        padding: "var(--space-3)",
        borderLeft: `3px solid ${borderColor}`,
        background: "var(--color-surface-0)",
        borderTop: "1px solid var(--color-border-subtle)",
        borderRight: "1px solid var(--color-border-subtle)",
        borderBottom: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-body-sm)",
          color: "var(--color-text-1)",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }}
      >
        {body}
      </p>
      {chips.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-1-5)",
          }}
        >
          {chips.map((chip: string) => (
            <Chip key={chip}>{chip}</Chip>
          ))}
        </div>
      )}
    </aside>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="badge badge-ghost">{children}</span>;
}
