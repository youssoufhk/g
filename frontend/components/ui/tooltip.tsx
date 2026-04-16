import type { ReactNode } from "react";

/**
 * Wraps the prototype's `.tooltip` class. The CSS uses `::after` bound to
 * the `data-tooltip` attribute on the wrapper, so the caller does not need
 * to manage visibility state. For interactive keyboard focus, make sure the
 * child is focusable.
 */
export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="tooltip" data-tooltip={label}>
      {children}
    </span>
  );
}
