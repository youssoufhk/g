"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

/**
 * Wraps the prototype's `.toast-container` + `.toast.toast-{success|error|warning|info}`
 * pattern. Use <ToastProvider> near the root and call useToast().show(...)
 * from any client component.
 */
type ToastTone = "info" | "success" | "warning" | "error";

type ToastAction = {
  label: string;
  onAction: () => void;
};

type Toast = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  durationMs?: number;
  action?: ToastAction;
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

const TONE_ICON: Record<ToastTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("a11y");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.durationMs ?? 5000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className={clsx("toast", `toast-${toast.tone}`)}
            >
              <div className="toast-icon">
                <Icon size={20} aria-hidden />
              </div>
              <div className="toast-content">
                <div className="toast-title">{toast.title}</div>
                {toast.description && (
                  <div className="toast-message">{toast.description}</div>
                )}
              </div>
              {toast.action && (
                <button
                  type="button"
                  className="toast-action"
                  onClick={() => {
                    toast.action?.onAction();
                    dismiss(toast.id);
                  }}
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                className="toast-close"
                onClick={() => dismiss(toast.id)}
                aria-label={t("dismiss")}
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
