import type { ReactNode } from "react";

import { Providers } from "@/components/providers";

/**
 * Ops console layout. Separate from (app) because the operator console
 * has its own audience (ADR-010) and its own visual treatment:
 *   - no customer-facing sidebar; a distinct top-only chrome
 *   - different primary color to reduce the chance of operating on a
 *     tenant by mistake in a normal work session
 *
 * Full chrome lands in Phase 3 when auth is real. This skeleton is
 * just enough to host the tenant list page.
 */
export default function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-1)]">
        <header className="h-14 flex items-center px-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
          <span className="font-semibold tracking-tight">
            Gamma Ops Console
          </span>
          <span className="ml-3 text-xs uppercase tracking-wide text-[var(--color-accent)]">
            staging
          </span>
        </header>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </div>
    </Providers>
  );
}
