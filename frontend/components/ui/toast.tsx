"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

type ToastTone = "info" | "success" | "warning" | "error";

type Toast = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ToastContextValue = {
  show: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const tones: Record<ToastTone, string> = {
  info: "border-[var(--color-info-muted)]",
  success: "border-[var(--color-success-muted)]",
  warning: "border-[var(--color-warning-muted)]",
  error: "border-[var(--color-error-muted)]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={clsx(
              "pointer-events-auto w-80 rounded-[var(--radius-lg)] border bg-[var(--color-surface-1)] p-3 shadow-[var(--shadow-3)]",
              tones[toast.tone],
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-1)]">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="text-xs text-[var(--color-text-2)] mt-1">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="h-6 w-6 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-3)] hover:text-[var(--color-text-1)]"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
