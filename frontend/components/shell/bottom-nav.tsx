"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { bottomNav } from "./nav-items";

/**
 * Wraps the prototype `.bottom-nav` + `.bottom-nav-item` classes. The
 * CSS hides the element above the mobile breakpoint and shows it below.
 */
export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {bottomNav.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={clsx("bottom-nav-item", active && "active")}
            aria-current={active ? "page" : undefined}
          >
            <Icon aria-hidden />
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
