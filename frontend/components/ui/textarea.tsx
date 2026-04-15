import { forwardRef, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={invalid || undefined}
        className={clsx(
          "w-full px-3 py-2 text-sm rounded-[var(--radius-md)]",
          "bg-[var(--color-surface-1)] text-[var(--color-text-1)]",
          "border border-[var(--color-border-subtle)]",
          "placeholder:text-[var(--color-text-3)]",
          "focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "resize-vertical",
          invalid && "border-[var(--color-error)]",
          className,
        )}
        {...rest}
      />
    );
  },
);
