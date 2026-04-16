"use client";

import { useEffect, type ReactNode } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

/**
 * Wraps the prototype's `.drawer.is-open` + `.drawer-right` + `.drawer-backdrop`
 * + `.drawer-panel` pattern. Only right-anchored for now (the prototype only
 * ships a right drawer).
 */
export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  width = 480,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={clsx("drawer", open && "is-open")}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-hidden={!open}
      style={{ ["--drawer-width" as string]: `${width}px` }}
    >
      <div
        className="drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="drawer-right">
        <aside className="drawer-panel">
          <div className="drawer-header">
            <h2 className="drawer-title">{title}</h2>
            <button
              type="button"
              className="drawer-close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          <div className="drawer-body">{children}</div>
        </aside>
      </div>
    </div>
  );
}
