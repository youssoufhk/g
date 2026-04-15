import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type="radio"
      className={clsx(
        "h-4 w-4 rounded-full",
        "border border-[var(--color-border-strong)] bg-[var(--color-surface-1)]",
        "accent-[var(--color-primary)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...rest}
    />
  );
});
