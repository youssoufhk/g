"use client";

import { useTranslations } from "next-intl";
import { Bell, Menu, Search } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shell/theme-toggle";

/**
 * Topbar wraps the prototype's `.top-header` row. Structure mirrors
 * prototype/index.html:
 *
 *   .top-header
 *     .header-left  (mobile menu button + page title)
 *     .header-search (desktop only, opens cmd palette)
 *     .header-right  (mobile search button + notifications + user)
 */
export type TopbarProps = {
  title?: string;
  user?: {
    name: string;
    role: string;
    initials?: string;
    colorIndex?: number;
    avatarSrc?: string;
  };
  onOpenCommandPalette?: () => void;
  onOpenNotifications?: () => void;
  onOpenMobileMenu?: () => void;
};

const DEFAULT_USER = {
  name: "Dev Admin",
  role: "Owner",
  initials: "DA",
  colorIndex: 0,
};

export function Topbar({
  title,
  user = DEFAULT_USER,
  onOpenCommandPalette,
  onOpenNotifications,
  onOpenMobileMenu,
}: TopbarProps) {
  const t = useTranslations("shell");

  return (
    <header className="top-header">
      <div className="header-left">
        {onOpenMobileMenu && (
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={onOpenMobileMenu}
            aria-label={t("open_menu")}
          >
            <Menu size={20} aria-hidden />
          </button>
        )}
        {title && <h1 className="page-title">{title}</h1>}
      </div>

      <button
        type="button"
        className="header-search"
        onClick={onOpenCommandPalette}
        aria-label={t("search")}
      >
        <Search size={16} aria-hidden />
        <span>{t("search_placeholder")}</span>
        <kbd>Cmd K</kbd>
      </button>

      <div className="header-right">
        <button
          type="button"
          className="mobile-search-btn"
          onClick={onOpenCommandPalette}
          aria-label={t("search")}
        >
          <Search size={20} aria-hidden />
        </button>

        <ThemeToggle />

        <button
          type="button"
          className="header-icon-btn"
          onClick={onOpenNotifications}
          aria-label={t("notifications")}
        >
          <Bell size={20} aria-hidden />
          <span className="notif-dot" aria-hidden />
        </button>

        <button type="button" className="header-user" aria-label={user.name}>
          <Avatar
            name={user.name}
            initials={user.initials}
            src={user.avatarSrc}
            colorIndex={user.colorIndex}
            size="sm"
          />
          <div className="hidden xl:flex flex-col">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
        </button>
      </div>
    </header>
  );
}
