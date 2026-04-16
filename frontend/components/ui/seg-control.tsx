"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Wraps the prototype's `.seg-control` + `.seg-control-btn.active` pattern.
 * Used for view-mode toggles (Grid / List / Org) and compact tab switchers.
 * Set `showLabel` to keep the text visible next to the icon (projects list),
 * or leave the default to render icon-only buttons with `aria-label` for
 * density-critical contexts.
 */
export type SegOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  title?: string;
};

export function SegControl<T extends string>({
  value,
  onChange,
  options,
  showLabel = false,
  className,
}: {
  value: T;
  onChange: (next: T) => void;
  options: Array<SegOption<T>>;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("seg-control", className)} role="group">
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.title ?? opt.label}
            aria-label={showLabel ? undefined : opt.label}
            aria-pressed={isActive}
            className={clsx("seg-control-btn", isActive && "active")}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon}
            {showLabel && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
