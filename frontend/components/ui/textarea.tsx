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
        className={clsx("form-textarea", invalid && "error", className)}
        {...rest}
      />
    );
  },
);
