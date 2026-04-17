"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/auth-store";

/**
 * Client-side auth gate for the (app) route group. Redirects to /login
 * when there is no valid (non-expired) access token.
 *
 * - Renders a surface-colored container with an sr-only aria-live region
 *   during the single-tick check so screen readers hear "Checking session"
 *   instead of silence, and authed users see no blank white flash (G30).
 * - Passes ?next=<pathname> to /login so the login page can restore the
 *   intended deep link after a successful sign-in (C24).
 * - Zustand persist hydrates synchronously from localStorage in the
 *   browser (the default storage engine), so the effect fires with the
 *   correct token value on the first render cycle.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isExpired = useAuthStore((s) => s.isExpired);
  const [checked, setChecked] = useState(false);
  const announced = useRef(false);

  useEffect(() => {
    const authed = Boolean(accessToken) && !isExpired();
    if (!authed) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
      return;
    }
    setChecked(true);
  }, [accessToken, isExpired, pathname, router]);

  if (!checked) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--color-surface-0)" }}>
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          ref={(el) => {
            if (el) announced.current = true;
          }}
        >
          Checking session
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
