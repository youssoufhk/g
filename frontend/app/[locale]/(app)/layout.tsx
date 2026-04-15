import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Providers } from "@/components/providers";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
