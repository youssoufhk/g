import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "destructive-ghost"
  | "accent"
  | "link";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Render as an icon-only square button. */
  iconOnly?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    leadingIcon,
    trailingIcon,
    iconOnly = false,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      suppressHydrationWarning
      className={clsx(
        "btn",
        `btn-${variant}`,
        `btn-${size}`,
        iconOnly && "btn-icon",
        loading && "btn-loading",
        className,
      )}
      {...rest}
    >
      {leadingIcon}
      {!iconOnly && children}
      {trailingIcon}
    </button>
  );
});
