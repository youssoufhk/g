"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { bottomNav } from "./nav-items";

/**
 * Mobile bottom navigation. Shown below md breakpoint. 5 items max:
 * dashboard, timesheets, expenses, approvals, account.
 */
export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 inset-x-0 h-14 grid grid-cols-5 border-t border-[var(--color-border)] bg-[var(--color-surface-0)]"
    >
      {bottomNav.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex flex-col items-center justify-center gap-0.5 text-[11px]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
              active
                ? "text-[var(--color-text-1)]"
                : "text-[var(--color-text-3)]",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span>{t(item.messageKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const stripped = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  return stripped === href || stripped.startsWith(href + "/");
}
