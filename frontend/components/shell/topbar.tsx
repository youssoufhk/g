"use client";

import { useTranslations } from "next-intl";
import { Bell, Search, Plus } from "lucide-react";

/**
 * Topbar is 56px tall (h-14). Contains the global search on desktop,
 * a New button, and notifications. Cmd+K command palette is wired via
 * the shell provider (not on this component) so it works anywhere.
 */
export function Topbar() {
  const t = useTranslations("shell");

  return (
    <header className="h-14 flex items-center gap-3 px-4 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
      <div className="flex-1 flex items-center gap-3">
        <label className="hidden md:flex items-center gap-2 w-[280px] h-9 px-3 rounded-[var(--radius-md)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-primary)]">
          <Search className="h-4 w-4 text-[var(--color-text-3)]" aria-hidden />
          <input
            type="search"
            placeholder={t("search_placeholder")}
            aria-label={t("search_placeholder")}
            className="bg-transparent border-0 outline-none text-sm flex-1 text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)]"
          />
        </label>
        <button
          type="button"
          aria-label={t("search_placeholder")}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)]"
        >
          <Search className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <button
        type="button"
        className="h-9 px-3 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-text-inv)] text-sm font-medium hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <Plus className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{t("new_button")}</span>
      </button>

      <button
        type="button"
        aria-label={t("notifications")}
        className="h-9 w-9 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] text-[var(--color-text-2)] hover:text-[var(--color-text-1)] hover:bg-[var(--color-surface-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <Bell className="h-4 w-4" aria-hidden />
      </button>
    </header>
  );
}
