"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Wraps the prototype's `.pagination-buttons` pattern. Uses chevrons for
 * prev/next and numbered buttons for jumping. Always renders 5 windows
 * (first, last, current, +/- 1) for consistency across list pages.
 */
export type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (next: number) => void;
  className?: string;
};

function windowed(page: number, pageCount: number): number[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);
}

export function Pagination({
  page,
  pageCount,
  onChange,
  className,
}: PaginationProps) {
  const t = useTranslations("a11y");
  if (pageCount <= 1) return null;
  const pages = windowed(page, pageCount);

  return (
    <nav
      className={clsx("pagination-buttons", className)}
      aria-label={t("pagination")}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label={t("previous_page")}
      >
        <ChevronLeft size={14} aria-hidden />
      </button>
      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const gap = prev !== undefined && p - prev > 1;
        return (
          <span
            key={p}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            {gap && (
              <span
                aria-hidden
                style={{
                  padding: "0 var(--space-1)",
                  color: "var(--color-text-3)",
                }}
              >
                ...
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(p)}
              className={clsx(p === page && "active")}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        aria-label={t("next_page")}
      >
        <ChevronRight size={14} aria-hidden />
      </button>
    </nav>
  );
}
