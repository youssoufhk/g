import clsx from "clsx";

/**
 * Wraps the prototype's `.progress-bar` + `.progress-fill.{warning|error|gold}`
 * classes. The caller provides a value from 0-100; the component clamps.
 */
export type ProgressTone = "primary" | "warning" | "error" | "gold";

export function ProgressBar({
  value,
  tone = "primary",
  label,
  className,
}: {
  value: number;
  tone?: ProgressTone;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={clsx("progress-bar", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
    >
      <div
        className={clsx("progress-fill", tone !== "primary" && tone)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
