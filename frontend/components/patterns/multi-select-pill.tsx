"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type MultiSelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type Props = {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchPlaceholder?: string;
  emptyLabel?: string;
  /** Called when the user clears all selected values from the pill. */
  onClear?: () => void;
};

/**
 * Searchable multi-select rendered as a rounded pill with chevron.
 * Built from existing atoms (Input semantics + Checkbox semantics) -
 * no new atoms introduced. Opens a floating panel on click that shows
 * a search box and a scrollable list of options with checkmarks.
 */
export function MultiSelectPill({
  label,
  options,
  selected,
  onChange,
  searchPlaceholder,
  emptyLabel,
  onClear,
}: Props) {
  const t = useTranslations("a11y");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("search");
  const resolvedEmptyLabel = emptyLabel ?? t("no_results");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q))
    : options;

  function toggle(value: string) {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  }

  function clearAll(e: React.MouseEvent) {
    e.stopPropagation();
    onChange([]);
    if (onClear) onClear();
  }

  const active = selected.length > 0;

  return (
    <div className="ms-pill-wrap" ref={ref}>
      <button
        type="button"
        className="ms-pill"
        data-active={active ? "true" : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ms-pill-label">{label}</span>
        {active && (
          <span className="ms-pill-count" aria-label={t("n_selected", { count: selected.length })}>
            {selected.length}
          </span>
        )}
        {active ? (
          <span
            role="button"
            tabIndex={0}
            aria-label={t("clear_label", { label })}
            className="ms-pill-clear"
            onClick={clearAll}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange([]);
                if (onClear) onClear();
              }
            }}
          >
            <X size={12} />
          </span>
        ) : (
          <ChevronDown size={16} className="ms-pill-chevron" />
        )}
      </button>

      {open && (
        <div className="ms-pill-panel" role="listbox" aria-label={label}>
          <div className="ms-pill-panel-search">
            <Search size={16} className="ms-pill-panel-search-icon" aria-hidden />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={resolvedSearchPlaceholder}
              className="ms-pill-panel-input"
              autoFocus
            />
          </div>
          <div className="ms-pill-panel-options" role="group">
            {filtered.length === 0 ? (
              <div className="ms-pill-panel-empty">{resolvedEmptyLabel}</div>
            ) : (
              filtered.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className="ms-pill-panel-option"
                    data-selected={isSelected ? "true" : undefined}
                    onClick={() => toggle(opt.value)}
                  >
                    <span className="ms-pill-panel-option-check" aria-hidden>
                      {isSelected && <Check size={12} />}
                    </span>
                    <span className="ms-pill-panel-option-label">{opt.label}</span>
                    {opt.hint && <span className="ms-pill-panel-option-hint">{opt.hint}</span>}
                  </button>
                );
              })
            )}
          </div>
          {active && (
            <div className="ms-pill-panel-footer">
              <button
                type="button"
                className="ms-pill-panel-clear"
                onClick={() => onChange([])}
              >
                {t("clear_selection")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
