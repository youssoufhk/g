"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

/**
 * Wraps the prototype's `.modal-backdrop.active` + `.modal` + `.modal-sm/lg/xl`
 * pattern. Sizes map to the three widths in _components.css.
 *
 * Accessibility:
 *  - Esc closes.
 *  - First focusable control inside the modal receives focus on open
 *    (falls back to the dialog container when no focusable exists).
 *  - Tab and Shift-Tab are trapped inside the modal.
 *  - Focus returns to the element that was focused before open on close.
 */
export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Extra class on the dialog element for pattern-scoped sizing (e.g.
   * `ConflictResolver` sets `conflict-resolver` to hit its 640px spec).
   * Does not replace size-class; composes with it.
   */
  className?: string;
  /**
   * Forwarded to the dialog `aria-labelledby`. The Modal already renders
   * its own `#modal-title`; patterns that hide the default header should
   * pass their own id.
   */
  labelledBy?: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => !el.hasAttribute("inert") && el.offsetParent !== null);
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
  labelledBy,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Remember the element that had focus before the modal opened so we
    // can restore focus to it when the modal closes (WCAG 2.4.3).
    const previouslyFocused =
      (document.activeElement as HTMLElement | null) ?? null;
    triggerRef.current = previouslyFocused;

    // Focus the first interactive control inside the dialog. Fall back to
    // the dialog container (tabIndex=-1) when the dialog has no focusable
    // children yet (e.g. transient empty state).
    const dialog = dialogRef.current;
    if (dialog) {
      const first = focusableWithin(dialog)[0];
      (first ?? dialog).focus();
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      // Trap focus inside the modal. Tab cycles forward, Shift-Tab
      // cycles backward. No way out except Esc or an explicit close
      // action the content itself provides.
      const focusables = focusableWithin(dialog);
      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (active === first || !active || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !active || !dialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Restore focus to whatever had it before the modal opened. If that
      // element was unmounted (rare), fall back silently.
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (trigger && document.contains(trigger)) {
        try {
          trigger.focus();
        } catch {
          // Focus restore is best-effort; swallow DOM detach races.
        }
      }
    };
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
        aria-labelledby={labelledBy ?? "modal-title"}
        aria-describedby={description ? "modal-description" : undefined}
        className={clsx(
          "modal",
          size === "sm" && "modal-sm",
          size === "lg" && "modal-lg",
          size === "xl" && "modal-xl",
          className,
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
