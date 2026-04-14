import type { ReactNode } from "react";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  // TODO (Phase 2): replace with <AppShell><Sidebar/><Topbar/><BottomNav/>{children}</AppShell>
  return <div className="min-h-screen">{children}</div>;
}
