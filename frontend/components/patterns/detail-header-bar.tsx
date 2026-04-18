"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export type DetailHeaderBarProps = {
  backHref: string;
  backLabel: string;
  title: ReactNode;
  prevHref: string | null;
  nextHref: string | null;
  prevLabel: string;
  nextLabel: string;
  position?: number | null;
  total?: number | null;
  positionLabel?: (position: number, total: number) => string;
};

export function DetailHeaderBar({
  backHref,
  backLabel,
  title,
  prevHref,
  nextHref,
  prevLabel,
  nextLabel,
  position,
  total,
  positionLabel,
}: DetailHeaderBarProps) {
  const hasPosition =
    typeof position === "number" && typeof total === "number" && total > 0;

  return (
    <div className="detail-header-bar" role="navigation" aria-label={backLabel}>
      <div className="detail-header-bar-left">
        <Link href={backHref} className="detail-header-bar-back">
          <ChevronLeft size={16} aria-hidden />
          <span>{backLabel}</span>
        </Link>
        <span className="detail-header-bar-divider" aria-hidden>
          /
        </span>
        <span className="detail-header-bar-title" title={typeof title === "string" ? title : undefined}>
          {title}
        </span>
      </div>
      <div className="detail-header-bar-right">
        {hasPosition && positionLabel && (
          <span className="detail-header-bar-position" aria-live="polite">
            {positionLabel(position!, total!)}
          </span>
        )}
        <div className="detail-header-bar-nav" role="group" aria-label={`${prevLabel} / ${nextLabel}`}>
          {prevHref ? (
            <Link
              href={prevHref}
              className="detail-header-bar-nav-btn"
              aria-label={prevLabel}
              rel="prev"
            >
              <ChevronLeft size={16} aria-hidden />
            </Link>
          ) : (
            <button
              type="button"
              className="detail-header-bar-nav-btn"
              aria-label={prevLabel}
              aria-disabled
              disabled
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
          )}
          {nextHref ? (
            <Link
              href={nextHref}
              className="detail-header-bar-nav-btn"
              aria-label={nextLabel}
              rel="next"
            >
              <ChevronRight size={16} aria-hidden />
            </Link>
          ) : (
            <button
              type="button"
              className="detail-header-bar-nav-btn"
              aria-label={nextLabel}
              aria-disabled
              disabled
            >
              <ChevronRight size={16} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
