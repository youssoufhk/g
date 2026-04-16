import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  invalid?: boolean;
  /** Visual size variant. Maps to `.form-input-sm` / `.form-input-lg`. */
  size?: "sm" | "md" | "lg";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, size = "md", ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={clsx(
        "form-input",
        size === "sm" && "form-input-sm",
        size === "lg" && "form-input-lg",
        invalid && "error",
        className,
      )}
      {...rest}
    />
  );
});
