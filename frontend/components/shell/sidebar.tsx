"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { primaryNav, secondaryNav } from "./nav-items";

/**
 * Sidebar is 224px wide on desktop. Never 240. (CLAUDE.md rule 3.)
 * Hidden below md breakpoint - the bottom nav takes over on mobile.
 *
 * Shared across every (app) page; individual pages must NOT copy this
 * markup (CLAUDE.md rule 7).
 */
export function Sidebar() {
  const t = useTranslations("nav");
  const appT = useTranslations("app");
  const pathname = usePathname();

  return (
    <aside
      aria-label="Primary navigation"
      className="hidden md:flex md:flex-col md:w-[224px] md:shrink-0 md:h-screen md:sticky md:top-0 border-r border-[var(--color-border)] bg-[var(--color-surface-0)]"
    >
      <div className="h-14 flex items-center px-4 border-b border-[var(--color-border)]">
        <span className="font-semibold tracking-tight text-[var(--color-text-1)]">
          {appT("name")}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {primaryNav.map((item) => (
            <SidebarLink
              key={item.key}
              href={item.href}
              label={t(item.messageKey)}
              Icon={item.icon}
              active={isActive(pathname, item.href)}
            />
          ))}
        </ul>

        <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
          <ul className="space-y-0.5 px-2">
            {secondaryNav.map((item) => (
              <SidebarLink
                key={item.key}
                href={item.href}
                label={t(item.messageKey)}
                Icon={item.icon}
                active={isActive(pathname, item.href)}
              />
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={clsx(
          "flex items-center gap-3 px-3 h-9 rounded-[var(--radius-md)] text-sm",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
          active
            ? "bg-[var(--color-primary-muted)] text-[var(--color-text-1)]"
            : "text-[var(--color-text-2)] hover:text-[var(--color-text-1)] hover:bg-[var(--color-surface-1)]",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
        <span>{label}</span>
      </Link>
    </li>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const stripped = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  return stripped === href || stripped.startsWith(href + "/");
}
