"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

type Theme = "dark" | "light";

const STORAGE_KEY = "gamma-theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const t = useTranslations("shell");
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? t("theme_toggle_light") : t("theme_toggle_dark");

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* localStorage may be unavailable (SSR, privacy mode); the runtime
         attribute flip still takes effect for the session. */
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="header-icon-btn"
      onClick={toggle}
      aria-label={label}
      aria-pressed={theme === "light"}
      suppressHydrationWarning
    >
      {mounted && theme === "dark" ? (
        <Sun size={18} aria-hidden />
      ) : (
        <Moon size={18} aria-hidden />
      )}
    </button>
  );
}
