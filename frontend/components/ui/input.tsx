import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={clsx(
        "h-9 w-full px-3 text-sm rounded-[var(--radius-md)]",
        "bg-[var(--color-surface-1)] text-[var(--color-text-1)]",
        "border border-[var(--color-border-subtle)]",
        "placeholder:text-[var(--color-text-3)]",
        "focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        invalid && "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]",
        className,
      )}
      {...rest}
    />
  );
});
