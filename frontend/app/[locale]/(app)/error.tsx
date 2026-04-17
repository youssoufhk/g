"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

/**
 * App-route-group error boundary.
 *
 * Next.js App Router automatically wraps every route below this file in this
 * boundary. If any render crash happens inside (app)/<page>, the user sees
 * this designed fallback instead of a blank page. The boundary reports the
 * error to `console.error` during development; in production the wrapper
 * telemetry client picks it up (see backend/app/monitoring/telemetry.py).
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("(app) route crash", error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="error-panel"
      data-testid="app-error-boundary"
    >
      <div className="error-panel-inner">
        <div className="error-panel-icon" aria-hidden>
          <AlertTriangle size={32} />
        </div>
        <h2 className="error-panel-title">{t("app_crash_title")}</h2>
        <p className="error-panel-body">{t("app_crash_body")}</p>
        {error.digest && (
          <p className="error-panel-ref">
            {t("reference")}: <code>{error.digest}</code>
          </p>
        )}
        <div className="error-panel-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => reset()}
          >
            <RotateCw size={14} aria-hidden />
            {t("retry")}
          </button>
          <Link href="/dashboard" className="btn btn-secondary">
            <Home size={14} aria-hidden />
            {t("back_home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
