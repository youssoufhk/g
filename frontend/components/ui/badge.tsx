import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Tone = "neutral" | "primary" | "success" | "warning" | "error" | "info";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  children: ReactNode;
};

const tones: Record<Tone, string> = {
  neutral:
    "bg-[var(--color-surface-2)] text-[var(--color-text-2)] border-[var(--color-border-subtle)]",
  primary:
    "bg-[var(--color-primary-muted)] text-[var(--color-primary)] border-[var(--color-primary-muted)]",
  success:
    "bg-[var(--color-success-muted)] text-[var(--color-success)] border-[var(--color-success-muted)]",
  warning:
    "bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-[var(--color-warning-muted)]",
  error:
    "bg-[var(--color-error-muted)] text-[var(--color-error)] border-[var(--color-error-muted)]",
  info:
    "bg-[var(--color-info-muted)] text-[var(--color-info)] border-[var(--color-info-muted)]",
};

export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 h-5 px-2 text-[11px] font-medium rounded-[var(--radius-sm)] border",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
