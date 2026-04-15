"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
};

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { checked, onCheckedChange, label, disabled, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-10 items-center rounded-full border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]",
        checked
          ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
          : "bg-[var(--color-surface-2)] border-[var(--color-border-strong)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden
        className={clsx(
          "inline-block h-5 w-5 rounded-full bg-[var(--color-text-inv)] transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
});
