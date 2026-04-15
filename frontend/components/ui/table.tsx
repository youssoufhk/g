import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import clsx from "clsx";

export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table
        className={clsx(
          "w-full text-sm text-left text-[var(--color-text-1)]",
          className,
        )}
        {...rest}
      />
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-[var(--color-surface-0)] border-b border-[var(--color-border)]">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({
  className,
  ...rest
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={clsx(
        "h-11 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-1)]/60",
        className,
      )}
      {...rest}
    />
  );
}

export function TH({
  className,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx(
        "px-3 py-2 font-medium text-xs uppercase tracking-wide text-[var(--color-text-3)]",
        className,
      )}
      {...rest}
    />
  );
}

export function TD({
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={clsx("px-3 py-2 align-middle", className)} {...rest} />;
}
