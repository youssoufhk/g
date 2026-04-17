"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiClientError } from "@/lib/api-client";
import { useLogin } from "@/features/auth/use-auth";

/**
 * Phase 3a login. Minimum-viable but honest:
 *  - Email + password only. Google OIDC lands when the backend endpoint
 *    ships (no dead buttons).
 *  - Public self-serve registration is deferred per APP_BLUEPRINT §1 /
 *    DEF-028; the invite flow is the canonical path. No register link.
 *  - Password reset lands in Phase 3a.2 with its own route. No dead
 *    forgot-password affordance on this surface.
 *  - Client-side validation so bad input never hits the API.
 *  - Backend errors mapped to human copy (invalid creds, network,
 *    generic). Error banner clears the moment the user edits either
 *    field so the red does not linger after the user already fixed it.
 *  - Dev-env credentials hint only in development builds.
 *  - Accessibility: first field auto-focused (HTML-native + post-hydrate
 *    ref), every input has a real <label>, errors announced via
 *    role=alert, pending status announced via aria-live, CTA sized for
 *    mobile touch (44px), inputs at 16px font-size to prevent iOS zoom.
 */
export default function LoginPage() {
  const t = useTranslations("auth");
  const login = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Clear the backend-error banner the moment the user edits either
  // field. TanStack `useMutation` keeps `error` until the next
  // `mutate()` call, which would otherwise leave a red banner next to
  // a now-corrected input. This matches the feel-quality bar: the
  // system reacts immediately to the user's recovery.
  useEffect(() => {
    if (login.error) login.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const emailError = useMemo(() => {
    if (!submitAttempted) return undefined;
    if (!email.trim()) return t("email_required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return t("email_invalid");
    return undefined;
  }, [email, submitAttempted, t]);

  const passwordError = useMemo(() => {
    if (!submitAttempted) return undefined;
    if (!password) return t("password_required");
    return undefined;
  }, [password, submitAttempted, t]);

  const backendError = useMemo(() => {
    if (!login.error) return undefined;
    if (login.error instanceof ApiClientError) {
      if (login.error.status === 401 || login.error.status === 403)
        return t("error_invalid_credentials");
    }
    if (login.error instanceof Error && login.error.message.includes("fetch"))
      return t("error_network");
    return t("error_generic");
  }, [login.error, t]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!email.trim() || !password) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;

    try {
      await login.mutateAsync({
        email: email.trim(),
        password,
        tenantSchema: "t_dev",
      });
      const raw = searchParams.get("next");
      const decoded = raw ? decodeURIComponent(raw) : "";
      const isSafePath =
        decoded.startsWith("/") &&
        !decoded.startsWith("//") &&
        !decoded.startsWith("/\\");
      router.push(isSafePath ? decoded : "/dashboard");
    } catch {
      // Rendered via backendError above.
    }
  }

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="auth-panel">
      <div className="auth-panel-brand" aria-hidden>
        <span className="auth-panel-wordmark">Gamma</span>
      </div>

      <h1 className="auth-panel-title">{t("login_title")}</h1>
      <p className="auth-panel-subtitle">{t("login_subtitle")}</p>

      <form onSubmit={onSubmit} className="auth-form" noValidate>
        <label className="auth-field" htmlFor="auth-email">
          <span className="auth-field-label">{t("email_label")}</span>
          <Input
            ref={emailRef}
            id="auth-email"
            type="email"
            size="lg"
            autoFocus
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="email"
            placeholder={t("email_placeholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            invalid={!!emailError}
            aria-describedby={emailError ? "auth-email-error" : undefined}
          />
          {emailError && (
            <span
              id="auth-email-error"
              className="auth-field-error"
              role="alert"
            >
              {emailError}
            </span>
          )}
        </label>

        <label className="auth-field" htmlFor="auth-password">
          <span className="auth-field-label">{t("password_label")}</span>
          <Input
            id="auth-password"
            type="password"
            size="lg"
            autoComplete="current-password"
            placeholder={t("password_placeholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            invalid={!!passwordError}
            aria-describedby={
              passwordError ? "auth-password-error" : undefined
            }
          />
          {passwordError && (
            <span
              id="auth-password-error"
              className="auth-field-error"
              role="alert"
            >
              {passwordError}
            </span>
          )}
        </label>

        {backendError && (
          <div className="auth-error" role="alert">
            <AlertCircle size={16} strokeWidth={1.5} aria-hidden />
            <span>{backendError}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={login.isPending}
          className="auth-submit"
        >
          {t("submit")}
        </Button>
        <span
          className="sr-only"
          role="status"
          aria-live="polite"
        >
          {login.isPending ? t("submitting") : ""}
        </span>
      </form>

      {isDev && (
        <aside className="auth-dev-hint" aria-label={t("dev_hint_title")}>
          <Info size={16} strokeWidth={1.5} aria-hidden />
          <div>
            <p className="auth-dev-hint-title">{t("dev_hint_title")}</p>
            <p className="auth-dev-hint-body">{t("dev_hint_body")}</p>
          </div>
        </aside>
      )}
    </div>
  );
}
