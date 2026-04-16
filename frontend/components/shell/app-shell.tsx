import type { ReactNode } from "react";

import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/**
 * AppShell wraps every page in the (app) route group. Uses the prototype
 * `.app`, `.main-wrapper`, `.top-header`, `.page-content` classes.
 * The shell is pixel-identical on every page; never edit it per page.
 */
export function AppShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar title={title} />
        <main className="page-content">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
