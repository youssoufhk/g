"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizes: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${sizes[size]} bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-4)] focus:outline-none`}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--color-border-subtle)]">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-[var(--color-text-1)]">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-[var(--color-text-2)] mt-1">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-2)] hover:text-[var(--color-text-1)] hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-0)] rounded-b-[var(--radius-xl)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
