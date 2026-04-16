import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

/**
 * Pill is an alias for `.badge.badge-ghost` that accepts a leading slot. Use
 * <Badge> directly if you only need a solid tone.
 */
export type PillProps = HTMLAttributes<HTMLSpanElement> & {
  leading?: ReactNode;
  children: ReactNode;
};

export function Pill({ leading, className, children, ...rest }: PillProps) {
  return (
    <span className={clsx("badge", "badge-ghost", className)} {...rest}>
      {leading}
      <span>{children}</span>
    </span>
  );
}
