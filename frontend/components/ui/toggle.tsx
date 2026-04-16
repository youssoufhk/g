"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
};

/**
 * Toggle switch. Wraps the prototype's `.toggle` + `.toggle.active` pattern
 * in _components.css (40x22 pill, 16x16 knob, 18px slide). The knob slides
 * via the `::after` pseudo-element defined in the prototype CSS.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { checked, onCheckedChange, label, disabled, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={clsx("toggle", checked && "active", className)}
      {...rest}
    />
  );
});
