import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Providers } from "@/components/providers";
import { RequireAuth } from "@/components/shell/require-auth";
import { ErrorBoundary } from "@/components/patterns/error-boundary";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <RequireAuth>
        <AppShell>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AppShell>
      </RequireAuth>
    </Providers>
  );
}
