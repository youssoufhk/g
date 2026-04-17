import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Providers } from "@/components/providers";
import { RequireAuth } from "@/components/shell/require-auth";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <RequireAuth>
        <AppShell>{children}</AppShell>
      </RequireAuth>
    </Providers>
  );
}
