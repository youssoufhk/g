"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";

import { MultiSelectPill, type MultiSelectOption } from "./multi-select-pill";

export type FilterGroup = {
  key: string;
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchPlaceholder?: string;
};

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  groups: FilterGroup[];
  onClearAll?: () => void;
  resultCount?: number;
  resultLabel?: string;
};

export function ResourcesFilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  groups,
  onClearAll,
  resultCount,
  resultLabel,
}: Props) {
  const t = useTranslations("a11y");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("search");
  const anyActive =
    search.trim().length > 0 ||
    groups.some((g) => g.selected.length > 0);

  return (
    <div className="resources-filter-bar" role="search">
      <div className="resources-filter-search">
        <Search size={14} className="resources-filter-search-icon" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={resolvedSearchPlaceholder}
          className="resources-filter-search-input"
          aria-label={resolvedSearchPlaceholder}
        />
        {search && (
          <button
            type="button"
            className="resources-filter-search-clear"
            aria-label={t("clear_search")}
            onClick={() => onSearchChange("")}
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="resources-filter-pills" role="group" aria-label={t("filters")}>
        {groups.map((g) => (
          <MultiSelectPill
            key={g.key}
            label={g.label}
            options={g.options}
            selected={g.selected}
            onChange={g.onChange}
            searchPlaceholder={g.searchPlaceholder}
          />
        ))}
      </div>

      {(resultCount !== undefined || anyActive) && (
        <div className="resources-filter-meta">
          {resultCount !== undefined && (
            <span className="resources-filter-count" aria-live="polite">
              {resultCount} {resultLabel ?? (resultCount === 1 ? t("result") : t("results"))}
            </span>
          )}
          {anyActive && onClearAll && (
            <button
              type="button"
              className="resources-filter-clear-all"
              onClick={onClearAll}
            >
              {t("clear_all")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
