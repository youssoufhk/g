import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

/**
 * Wraps the prototype's `.form-check` label + radio input pattern. Pass
 * `label` for the standard row layout, or omit it to get just the styled
 * input.
 */
export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
  description?: ReactNode;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, label, description, id, ...rest },
  ref,
) {
  const input = (
    <input
      ref={ref}
      id={id}
      type="radio"
      className={clsx(className)}
      {...rest}
    />
  );
  if (!label && !description) return input;
  return (
    <label className="form-check" htmlFor={id}>
      {input}
      {(label || description) && (
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {label && <span>{label}</span>}
          {description && (
            <span className="text-3 text-caption">{description}</span>
          )}
        </span>
      )}
    </label>
  );
});
