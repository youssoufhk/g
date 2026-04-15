import type { ReactNode } from "react";

import { Providers } from "@/components/providers";

/**
 * Bare-bones shell for the auth pages (login, register).
 * No sidebar, no topbar. Just a centered card on the dark surface.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-1)] px-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </Providers>
  );
}
