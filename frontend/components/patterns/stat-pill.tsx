import type { ReactNode } from "react";
import Link from "next/link";

type Accent =
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "gold";

export type StatPillProps = {
  label: string;
  value: ReactNode;
  /** Optional secondary signal shown right-aligned beside the main value. */
  secondary?: ReactNode;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  accent?: Accent;
  /**
   * Optional click-through target. When set, the entire pill becomes a
   * keyboard-focusable link. The visible styling is unchanged; hover and
   * focus states are added by the shared `.stat-card[data-interactive]`
   * rule. Required for OPUS item B16 (dashboard KPI click-through).
   */
  href?: string;
  /** Accessible label when href is set and label alone is ambiguous. */
  ariaLabel?: string;
};

/**
 * StatPill wraps the prototype's `.stat-card` class, including the gradient
 * top-stripe. Pass `accent` to swap the stripe color; default is the
 * primary to accent gradient. Pass `secondary` for a right-aligned second
 * signal beside the main value (e.g. "/ 201 total"). Pass `href` to make
 * the entire card a link.
 */
export function StatPill({
  label,
  value,
  secondary,
  delta,
  deltaDirection = "flat",
  accent,
  href,
  ariaLabel,
}: StatPillProps) {
  const inner = (
    <>
      <div className="stat-label">{label}</div>
      <div className="stat-row">
        <div className="stat-value">{value}</div>
        {secondary && <div className="stat-secondary">{secondary}</div>}
      </div>
      {delta && (
        <div
          className={`stat-trend ${
            deltaDirection === "up"
              ? "up"
              : deltaDirection === "down"
                ? "down"
                : ""
          }`}
        >
          {delta}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="stat-card"
        data-accent={accent}
        data-interactive="true"
        aria-label={ariaLabel}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="stat-card" data-accent={accent}>
      {inner}
    </div>
  );
}
