"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import { BottomNav } from "./bottom-nav";
import { CommandPalette } from "./command-palette";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/**
 * AppShell wraps every page in the (app) route group. Uses the prototype
 * `.app`, `.main-wrapper`, `.top-header`, `.page-content` classes.
 * The shell is pixel-identical on every page; never edit it per page.
 *
 * Hosts the command palette state so Cmd+K / Ctrl+K opens from any (app)
 * page without per-page wiring. Renders a skip-to-content link for
 * keyboard + screen reader users (WCAG 2.2 AA).
 */
export function AppShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const t = useTranslations("shell");
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMetaK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isMetaK) {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        {t("skip_to_content")}
      </a>
      <Sidebar />
      <div className="main-wrapper">
        <Topbar title={title} onOpenCommandPalette={openPalette} />
        <main id="main-content" className="page-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <BottomNav />
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  );
}
