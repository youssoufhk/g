import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  as?: "div" | "section" | "article";
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padded = true, as = "div", ...rest },
  ref,
) {
  const Tag = as as "div";
  return (
    <Tag
      ref={ref}
      className={clsx(
        "bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)]",
        "rounded-[var(--radius-lg)] shadow-[var(--shadow-1)]",
        padded && "p-4 md:p-6",
        className,
      )}
      {...rest}
    />
  );
});

export function CardHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">{children}</div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-[var(--color-text-1)]">
      {children}
    </h3>
  );
}

export function CardDescription({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-[var(--color-text-2)] mt-1">{children}</p>
  );
}
