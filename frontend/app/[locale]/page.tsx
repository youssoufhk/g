"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/auth-store";

function CheckingShell({ children }: { children?: ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-surface-0)" }}>
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {children}
      </span>
    </div>
  );
}

export default function LocaleRootPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isExpired = useAuthStore((s) => s.isExpired);

  useEffect(() => {
    const authed = Boolean(accessToken) && !isExpired();
    router.replace(authed ? "/dashboard" : "/login");
  }, [accessToken, isExpired, router]);

  return <CheckingShell>Checking session</CheckingShell>;
}
