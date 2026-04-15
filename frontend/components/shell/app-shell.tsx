import type { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";

/**
 * AppShell wraps every page inside the (app) route group. Shell is
 * pixel-identical on every page (CLAUDE.md principle: "shell identical
 * on every page"). Never hand-edit this layout in individual pages.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[var(--color-bg)] text-[var(--color-text-1)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-x-hidden pb-14 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
