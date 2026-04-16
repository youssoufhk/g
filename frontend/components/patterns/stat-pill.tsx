import type { ReactNode } from "react";

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
};

/**
 * StatPill wraps the prototype's `.stat-card` class, including the gradient
 * top-stripe. Pass `accent` to swap the stripe color; default is the
 * primary to accent gradient. Pass `secondary` for a right-aligned second
 * signal beside the main value (e.g. "/ 201 total").
 */
export function StatPill({
  label,
  value,
  secondary,
  delta,
  deltaDirection = "flat",
  accent,
}: StatPillProps) {
  return (
    <div className="stat-card" data-accent={accent}>
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
    </div>
  );
}
