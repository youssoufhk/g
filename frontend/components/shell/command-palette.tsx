"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Search,
  Users,
} from "lucide-react";

import { useGlobalSearch } from "@/features/search/use-global-search";
import type { SearchHit } from "@/features/search/types";

type GroupId = "employees" | "clients" | "projects" | "navigation";

type PaletteItem = {
  id: string;
  group: GroupId;
  label: string;
  hint: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    "aria-hidden"?: boolean;
  }>;
};

const ICON_FOR_GROUP: Record<
  "employees" | "clients" | "projects",
  PaletteItem["icon"]
> = {
  employees: Users,
  clients: Building2,
  projects: Briefcase,
};

function navTools(t: (key: string) => string): PaletteItem[] {
  return [
    {
      id: "nav.employees",
      group: "navigation",
      label: t("nav_employees_label"),
      hint: t("nav_employees_hint"),
      href: "/employees",
      icon: Users,
    },
    {
      id: "nav.clients",
      group: "navigation",
      label: t("nav_clients_label"),
      hint: t("nav_clients_hint"),
      href: "/clients",
      icon: Building2,
    },
    {
      id: "nav.projects",
      group: "navigation",
      label: t("nav_projects_label"),
      hint: t("nav_projects_hint"),
      href: "/projects",
      icon: Briefcase,
    },
    {
      id: "nav.approvals",
      group: "navigation",
      label: t("nav_approvals_label"),
      hint: t("nav_approvals_hint"),
      href: "/approvals",
      icon: ArrowUpRight,
    },
  ];
}

export type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  aiDegraded?: boolean;
};

function hitToItem(h: SearchHit): PaletteItem {
  return {
    id: `entity.${h.kind}.${h.id}`,
    group: h.kind,
    label: h.title,
    hint: h.subtitle ?? "",
    href: `/${h.kind}/${h.id}`,
    icon: ICON_FOR_GROUP[h.kind],
  };
}

/**
 * Command palette + topbar global search (Phase Z.5 scaffold + Z.6).
 *
 * Keyboard-first. Opens on Cmd+K / Ctrl+K (intended AI router, currently
 * fallback tools only) or Cmd+/ (non-AI entity search). Closes on Esc.
 * Traps focus. Single flat keyboard index across all rendered items;
 * group headers are presentational and not part of the index.
 */
export function CommandPalette({
  open,
  onClose,
  aiDegraded = false,
}: CommandPaletteProps) {
  const t = useTranslations("shell");
  const tSearch = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const { data, isActive, isFetching, isError } = useGlobalSearch(query);

  const normalized = query.trim().toLowerCase();
  const tools = useMemo(() => navTools(tSearch), [tSearch]);
  const filteredTools = useMemo(
    () =>
      normalized
        ? tools.filter(
            (tool) =>
              tool.label.toLowerCase().includes(normalized) ||
              tool.hint.toLowerCase().includes(normalized),
          )
        : tools,
    [normalized, tools],
  );

  const entityItems: PaletteItem[] = useMemo(
    () =>
      isActive
        ? [
            ...data.employees.map(hitToItem),
            ...data.clients.map(hitToItem),
            ...data.projects.map(hitToItem),
          ]
        : [],
    [data, isActive],
  );

  // Single flat index drives keyboard navigation + aria-activedescendant.
  // Group headers and status rows are presentational and do not consume
  // an index slot. Each item carries its flat index so we do not rely on
  // `indexOf` identity (fresh memo objects would break it).
  const flatItems: PaletteItem[] = useMemo(
    () => [...entityItems, ...filteredTools],
    [entityItems, filteredTools],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, data]);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      (document.activeElement as HTMLElement | null) ?? null;
    setQuery("");
    setActiveIndex(0);
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      const prev = previousFocusRef.current;
      if (prev && typeof prev.focus === "function") {
        prev.focus();
      }
    };
  }, [open]);

  const cycleFocus = useCallback((event: KeyboardEvent) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute("disabled"));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    const active = document.activeElement as HTMLElement | null;
    if (event.shiftKey) {
      if (active === first || !active || !dialog.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !active || !dialog.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  const handleSelect = useCallback(
    (item: PaletteItem) => {
      router.push(item.href);
      onClose();
    },
    [router, onClose],
  );

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab") {
        cycleFocus(event);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(flatItems.length - 1, 0)));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const chosen = flatItems[activeIndex];
        if (chosen) handleSelect(chosen);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, flatItems, activeIndex, onClose, cycleFocus, handleSelect]);

  if (!open) return null;

  const activeItem = flatItems[activeIndex];
  const hasEntities = entityItems.length > 0;
  const hasAny = flatItems.length > 0;
  const showEntityEmpty =
    isActive && !isFetching && !isError && !hasEntities;

  // Compute per-group label ids for listbox group semantics (F47).
  const groupLabelId = (g: GroupId) => `cmd-group-${g}-label`;

  let runningIndex = 0;

  return (
    <div
      ref={overlayRef}
      className="cmd-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmd-palette-title"
      data-state="open"
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
    >
      <div ref={dialogRef} className="cmd-dialog" data-state="open">
        <div className="cmd-input-row">
          <Search size={20} strokeWidth={1.5} aria-hidden />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder={t("palette_placeholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t("palette_placeholder")}
            aria-controls="cmd-results"
            aria-activedescendant={
              activeItem ? `cmd-hit-${activeItem.id}` : undefined
            }
          />
          {isFetching && (
            <span
              className="cmd-status"
              role="status"
              aria-live="polite"
            >
              {tSearch("searching")}
            </span>
          )}
          <kbd className="cmd-kbd">Esc</kbd>
        </div>

        <h2 id="cmd-palette-title" className="sr-only">
          {t("palette_title")}
        </h2>

        {aiDegraded && (
          <div className="cmd-degraded" role="status">
            {t("palette_degraded")}
          </div>
        )}

        {isError && (
          <div className="cmd-error" role="alert">
            {tSearch("error")}
          </div>
        )}

        <ul
          id="cmd-results"
          className="cmd-results"
          role="listbox"
          aria-busy={isFetching || undefined}
        >
          {hasEntities && data.employees.length > 0 && (
            <li role="group" aria-labelledby={groupLabelId("employees")}>
              <div
                id={groupLabelId("employees")}
                className="cmd-group-header"
              >
                {tSearch("group_employees")}
              </div>
              <ul className="cmd-group-list" role="none">
                {data.employees.map((hit) => {
                  const item = hitToItem(hit);
                  const idx = runningIndex++;
                  return renderRow(
                    item,
                    idx,
                    activeIndex,
                    setActiveIndex,
                    handleSelect,
                  );
                })}
              </ul>
            </li>
          )}
          {hasEntities && data.clients.length > 0 && (
            <li role="group" aria-labelledby={groupLabelId("clients")}>
              <div
                id={groupLabelId("clients")}
                className="cmd-group-header"
              >
                {tSearch("group_clients")}
              </div>
              <ul className="cmd-group-list" role="none">
                {data.clients.map((hit) => {
                  const item = hitToItem(hit);
                  const idx = runningIndex++;
                  return renderRow(
                    item,
                    idx,
                    activeIndex,
                    setActiveIndex,
                    handleSelect,
                  );
                })}
              </ul>
            </li>
          )}
          {hasEntities && data.projects.length > 0 && (
            <li role="group" aria-labelledby={groupLabelId("projects")}>
              <div
                id={groupLabelId("projects")}
                className="cmd-group-header"
              >
                {tSearch("group_projects")}
              </div>
              <ul className="cmd-group-list" role="none">
                {data.projects.map((hit) => {
                  const item = hitToItem(hit);
                  const idx = runningIndex++;
                  return renderRow(
                    item,
                    idx,
                    activeIndex,
                    setActiveIndex,
                    handleSelect,
                  );
                })}
              </ul>
            </li>
          )}

          {showEntityEmpty && (
            <li className="cmd-empty" role="status">
              {tSearch("empty_for_query", { query: query.trim() })}
            </li>
          )}

          {filteredTools.length > 0 && (
            <li role="group" aria-labelledby={groupLabelId("navigation")}>
              {hasEntities && (
                <div
                  id={groupLabelId("navigation")}
                  className="cmd-group-header"
                >
                  {tSearch("group_navigation")}
                </div>
              )}
              {!hasEntities && (
                <span
                  id={groupLabelId("navigation")}
                  className="sr-only"
                >
                  {tSearch("group_navigation")}
                </span>
              )}
              <ul className="cmd-group-list" role="none">
                {filteredTools.map((tool) => {
                  const idx = runningIndex++;
                  return renderRow(
                    tool,
                    idx,
                    activeIndex,
                    setActiveIndex,
                    handleSelect,
                  );
                })}
              </ul>
            </li>
          )}

          {!hasAny && !showEntityEmpty && (
            <li className="cmd-empty" role="status">
              {t("palette_no_match")}
            </li>
          )}
        </ul>

        <div className="cmd-footer">
          <span>
            <kbd className="cmd-kbd">{"\u2191"}</kbd>
            <kbd className="cmd-kbd">{"\u2193"}</kbd> {t("palette_nav")}
          </span>
          <span>
            <kbd className="cmd-kbd">Enter</kbd> {t("palette_open")}
          </span>
        </div>
      </div>
    </div>
  );
}

function renderRow(
  item: PaletteItem,
  index: number,
  activeIndex: number,
  setActiveIndex: (i: number) => void,
  onSelect: (item: PaletteItem) => void,
) {
  const Icon = item.icon;
  return (
    <li
      key={item.id}
      id={`cmd-hit-${item.id}`}
      role="option"
      aria-selected={index === activeIndex}
      className={`cmd-hit${index === activeIndex ? " cmd-hit-active" : ""}`}
      onMouseEnter={() => setActiveIndex(index)}
      onClick={() => onSelect(item)}
    >
      <Icon size={16} strokeWidth={1.5} aria-hidden />
      <span className="cmd-hit-label">{item.label}</span>
      {item.hint && <span className="cmd-hit-hint">{item.hint}</span>}
      <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden />
    </li>
  );
}
