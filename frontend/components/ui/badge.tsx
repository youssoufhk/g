import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Tone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "accent"
  | "gold"
  | "ghost"
  | "ghost-primary"
  | "neutral";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  size?: "default" | "lg";
  dot?: boolean;
  children: ReactNode;
};

export function Badge({
  tone = "default",
  size = "default",
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  const resolvedTone = tone === "neutral" ? "default" : tone;
  return (
    <span
      className={clsx(
        "badge",
        `badge-${resolvedTone}`,
        size === "lg" && "badge-lg",
        dot && "badge-dot",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
