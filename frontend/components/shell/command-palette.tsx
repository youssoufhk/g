"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Search, ArrowUpRight, Users, Briefcase, Building2 } from "lucide-react";

type ToolHit = {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
};

const FALLBACK_TOOLS: ToolHit[] = [
  {
    id: "nav.employees",
    label: "Open Employees",
    hint: "Team directory",
    href: "/employees",
    icon: Users,
  },
  {
    id: "nav.clients",
    label: "Open Clients",
    hint: "Client list",
    href: "/clients",
    icon: Building2,
  },
  {
    id: "nav.projects",
    label: "Open Projects",
    hint: "Active engagements",
    href: "/projects",
    icon: Briefcase,
  },
  {
    id: "nav.approvals",
    label: "Open Approvals",
    hint: "Pending approvals",
    href: "/approvals",
    icon: ArrowUpRight,
  },
];

export type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  /**
   * True when kill_switch.ai is on for this tenant. In degraded mode the
   * palette explains that natural-language search is paused and points
   * the user to the topbar search as the non-AI fallback.
   */
  aiDegraded?: boolean;
};

/**
 * Minimum-viable command palette. Opens on Cmd+K / Ctrl+K. Keyboard-first.
 *
 * The full LLM-as-router dispatch against the 16 tools (APP_BLUEPRINT §13.1)
 * lands in Phase Z.5 when the /api/v1/cmd endpoint ships. For now the
 * palette resolves queries against a static fallback list that still covers
 * the primary navigation targets, so the Cmd+K affordance is honest instead
 * of dead. Closes on Esc. Traps focus inside the modal while open.
 */
export function CommandPalette({ open, onClose, aiDegraded = false }: CommandPaletteProps) {
  const t = useTranslations("shell");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const normalized = query.trim().toLowerCase();
  const hits = normalized
    ? FALLBACK_TOOLS.filter(
        (tool) =>
          tool.label.toLowerCase().includes(normalized) ||
          tool.hint.toLowerCase().includes(normalized),
      )
    : FALLBACK_TOOLS;

  // Focus management: save the element that had focus when we opened,
  // restore it on close (F41 + accessibility best practice).
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      (document.activeElement as HTMLElement | null) ?? null;
    setQuery("");
    setActiveIndex(0);
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      // On unmount or close-toggle, return focus to the trigger.
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
      if (active === first || !dialog.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

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
        setActiveIndex((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const chosen = hits[activeIndex];
        if (chosen) {
          router.push(chosen.href);
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, hits, activeIndex, onClose, router, cycleFocus]);

  if (!open) return null;

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
          <Search size={18} aria-hidden />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder={t("palette_placeholder")}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            aria-label={t("palette_placeholder")}
            aria-controls="cmd-results"
            aria-activedescendant={hits[activeIndex] ? `cmd-hit-${hits[activeIndex].id}` : undefined}
          />
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

        <ul id="cmd-results" className="cmd-results" role="listbox">
          {hits.length === 0 ? (
            <li className="cmd-empty" role="status">
              {t("palette_no_match")}
            </li>
          ) : (
            hits.map((hit, index) => {
              const Icon = hit.icon;
              return (
                <li
                  key={hit.id}
                  id={`cmd-hit-${hit.id}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`cmd-hit${index === activeIndex ? " cmd-hit-active" : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    router.push(hit.href);
                    onClose();
                  }}
                >
                  <Icon size={16} aria-hidden />
                  <span className="cmd-hit-label">{hit.label}</span>
                  <span className="cmd-hit-hint">{hit.hint}</span>
                  <ArrowUpRight size={14} aria-hidden />
                </li>
              );
            })
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
