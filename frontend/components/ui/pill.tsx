import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export type PillProps = HTMLAttributes<HTMLSpanElement> & {
  leading?: ReactNode;
  children: ReactNode;
};

export function Pill({ leading, className, children, ...rest }: PillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-full",
        "bg-[var(--color-surface-2)] text-[var(--color-text-2)] border border-[var(--color-border-subtle)]",
        className,
      )}
      {...rest}
    >
      {leading}
      <span>{children}</span>
    </span>
  );
}
