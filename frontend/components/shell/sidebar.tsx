"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { ChevronsLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  footerNav,
  navSections,
  type NavItem,
  type NavRole,
  type NavSection,
} from "./nav-items";

const STORAGE_KEY = "gamma-sidebar-collapsed";

type SidebarProps = {
  /** Current viewer's role. Controls section / item visibility. */
  role?: NavRole;
  /** Override for badge counts keyed by nav-item key. */
  badges?: Partial<Record<string, number>>;
};

/**
 * Sidebar wraps the prototype's `.sidebar` + `.sidebar-logo` +
 * `.sidebar-nav` + `.sidebar-footer` + `.nav-section` + `.nav-item`
 * pattern. Structure mirrors specs/DESIGN_SYSTEM.md section 3.2 and
 * prototype _shared.js GHR.renderSidebar() output.
 */
export function Sidebar({ role = "admin", badges }: SidebarProps) {
  const t = useTranslations("nav");
  const appT = useTranslations("app");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      }
      return next;
    });
  }, []);

  const visibleSections = navSections.filter((section) =>
    canAccess(role, section.minRole),
  );

  return (
    <aside
      className={clsx("sidebar", collapsed && "collapsed")}
      aria-label="Primary navigation"
    >
      <div className="sidebar-logo">
        <div className="logo-icon" aria-hidden>
          G
        </div>
        <span className="logo-text">{appT("name")}</span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {visibleSections.map((section) => (
          <SidebarSection
            key={section.key}
            section={section}
            role={role}
            pathname={pathname}
            badges={badges}
            t={t}
          />
        ))}
      </nav>

      <div className="sidebar-footer">
        {footerNav
          .filter((item) => canAccess(role, item.minRole))
          .map((item) => (
            <SidebarLink
              key={item.key}
              item={item}
              pathname={pathname}
              badge={badges?.[item.key]}
              t={t}
            />
          ))}

        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
        >
          <ChevronsLeft aria-hidden />
          <span>{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </div>
    </aside>
  );
}

type TranslateFn = ReturnType<typeof useTranslations>;

function SidebarSection({
  section,
  role,
  pathname,
  badges,
  t,
}: {
  section: NavSection;
  role: NavRole;
  pathname: string | null;
  badges?: Partial<Record<string, number>>;
  t: TranslateFn;
}) {
  const items = section.items.filter((item) => canAccess(role, item.minRole));
  if (items.length === 0) return null;
  return (
    <div className="nav-section">
      <div className="nav-section-label">{t(`sections.${section.key}`)}</div>
      {items.map((item) => (
        <SidebarLink
          key={item.key}
          item={item}
          pathname={pathname}
          badge={badges?.[item.key]}
          t={t}
        />
      ))}
    </div>
  );
}

function SidebarLink({
  item,
  pathname,
  badge,
  t,
}: {
  item: NavItem;
  pathname: string | null;
  badge?: number;
  t: TranslateFn;
}) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={clsx("nav-item", active && "active")}
      aria-current={active ? "page" : undefined}
    >
      <Icon aria-hidden />
      <span className="nav-label">{t(item.messageKey)}</span>
      {typeof badge === "number" && badge > 0 && (
        <span className="nav-badge">{badge}</span>
      )}
    </Link>
  );
}

function canAccess(role: NavRole, minRole?: NavRole): boolean {
  if (!minRole) return true;
  const order: Record<NavRole, number> = { employee: 0, pm: 1, admin: 2 };
  return order[role] >= order[minRole];
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const stripped = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  return stripped === href || stripped.startsWith(href + "/");
}
