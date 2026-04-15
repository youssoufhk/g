import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "tertiary" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text-inv)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]",
  secondary:
    "bg-[var(--color-surface-1)] text-[var(--color-text-1)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]",
  tertiary:
    "bg-transparent text-[var(--color-text-2)] hover:text-[var(--color-text-1)] hover:bg-[var(--color-surface-1)]",
  danger:
    "bg-[var(--color-error)] text-[var(--color-text-inv)] hover:bg-[var(--color-error-hover)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-2.5 text-xs rounded-[var(--radius-sm)]",
  md: "h-9 px-3 text-sm rounded-[var(--radius-md)]",
  lg: "h-10 px-4 text-sm rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    leadingIcon,
    trailingIcon,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
});
