import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

/**
 * Wraps the prototype's `.form-check` label + input pattern. Provide a
 * `label` node to render the full interactive row, or omit it to render
 * just the styled input when composing your own layout.
 */
export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: ReactNode;
  description?: ReactNode;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, label, description, id, ...rest }, ref) {
    const input = (
      <input
        ref={ref}
        id={id}
        type="checkbox"
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
  },
);
