import type { ReactNode } from "react";

import { Providers } from "@/components/providers";

/**
 * Bare-bones shell for the auth pages (login only in Phase 3a; register
 * is deferred per APP_BLUEPRINT §1 / DEF-028 in favor of the invite
 * flow). No sidebar, no topbar, no bottom nav. Vertically centered
 * panel on surface-0 with the shared design tokens.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="auth-shell">
        <main className="auth-shell-inner">{children}</main>
      </div>
    </Providers>
  );
}
