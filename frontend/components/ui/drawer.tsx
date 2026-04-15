"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "right" | "left";
  size?: "sm" | "md" | "lg";
};

const widths: Record<NonNullable<DrawerProps["size"]>, string> = {
  sm: "w-full sm:w-[320px]",
  md: "w-full sm:w-[480px]",
  lg: "w-full sm:w-[640px]",
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  size = "md",
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50"
    >
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 bottom-0 ${side === "right" ? "right-0" : "left-0"} ${widths[size]} bg-[var(--color-surface-1)] border-l border-[var(--color-border)] shadow-[var(--shadow-4)] flex flex-col`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-base font-semibold text-[var(--color-text-1)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-2)] hover:text-[var(--color-text-1)] hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
}
