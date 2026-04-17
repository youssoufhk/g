"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/auth-store";

/**
 * Client-side auth gate for the (app) route group.
 *
 * Waits for the Zustand persist middleware to finish reading from
 * localStorage (_hasHydrated) before evaluating the token. Without this
 * gate, the store starts empty on every SSR/hydration cycle and redirects
 * authed users to /login on every page load.
 *
 * Once hydrated:
 * - Valid (non-expired) token: renders children.
 * - No token / expired: redirects to /login?next=<pathname> so the login
 *   page can restore the intended deep link after sign-in (C24).
 *
 * Passes ?next= through a same-origin path check in login/page.tsx to
 * prevent open-redirect via crafted URLs.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isExpired = useAuthStore((s) => s.isExpired);
  const announced = useRef(false);

  useEffect(() => {
    if (!hasHydrated) return;
    const authed = Boolean(accessToken) && !isExpired();
    if (!authed) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [hasHydrated, accessToken, isExpired, pathname, router]);

  const authed = hasHydrated && Boolean(accessToken) && !isExpired();

  if (!authed) {
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
