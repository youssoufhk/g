import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={clsx(
          "h-4 w-4 rounded-[var(--radius-sm)]",
          "border border-[var(--color-border-strong)] bg-[var(--color-surface-1)]",
          "accent-[var(--color-primary)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...rest}
      />
    );
  },
);
