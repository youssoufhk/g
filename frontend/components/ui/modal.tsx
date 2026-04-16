"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

/**
 * Wraps the prototype's `.modal-backdrop.active` + `.modal` + `.modal-sm/lg/xl`
 * pattern. Sizes map to the three widths in _components.css.
 */
export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
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
      className="modal-backdrop active"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className={clsx(
          "modal",
          size === "sm" && "modal-sm",
          size === "lg" && "modal-lg",
          size === "xl" && "modal-xl",
        )}
      >
        <div className="modal-header">
          <div>
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
            {description && (
              <p
                id="modal-description"
                className="text-2 text-sm"
                style={{ marginTop: "var(--space-1)" }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
