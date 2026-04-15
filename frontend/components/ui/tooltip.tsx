"use client";

import { useState, type ReactNode } from "react";

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-40 whitespace-nowrap px-2 py-1 text-[11px] rounded-[var(--radius-sm)] bg-[var(--color-surface-3)] text-[var(--color-text-1)] border border-[var(--color-border)] shadow-[var(--shadow-2)]"
        >
          {label}
        </span>
      )}
    </span>
  );
}
