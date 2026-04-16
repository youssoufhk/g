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
      suppressHydrationWarning
      className={clsx("form-select", invalid && "error", className)}
      {...rest}
    >
      {children}
    </select>
  );
});
