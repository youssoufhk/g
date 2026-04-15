import { forwardRef, type SelectHTMLAttributes } from "react";
import clsx from "clsx";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={clsx(
        "h-9 w-full px-3 pr-8 text-sm rounded-[var(--radius-md)]",
        "bg-[var(--color-surface-1)] text-[var(--color-text-1)]",
        "border border-[var(--color-border-subtle)]",
        "focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        invalid && "border-[var(--color-error)]",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
});
