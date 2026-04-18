"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles, X } from "lucide-react";

export type AiRecommendation = {
  id: string;
  icon?: ComponentType<{ size?: number | string; className?: string }>;
  tone?: "primary" | "accent" | "gold" | "info";
  title: string;
  detail: string;
  applyLabel?: string;
  onApply?: () => void;
};

type Props = {
  items: AiRecommendation[];
  title?: string;
  overline?: string;
};

/**
 * Banner of 2-3 AI recommendations that sits above the main content.
 * Each card has Apply + Dismiss. Dismissed cards are hidden client-side
 * for the session.
 */
export function AiRecommendations({
  items,
  title,
  overline,
}: Props) {
  const t = useTranslations("a11y");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const resolvedTitle = title ?? t("ai_recommendations");
  const resolvedOverline = overline ?? t("suggested_moves");

  const visible = items.filter((it) => !dismissed.has(it.id));
  if (visible.length === 0) return null;

  return (
    <section className="ai-recs" aria-labelledby="ai-recs-title">
      <header className="ai-recs-header">
        <span className="ai-recs-icon" aria-hidden>
          <Sparkles size={16} />
        </span>
        <div className="ai-recs-title-group">
          <span className="ai-recs-overline">{resolvedOverline}</span>
          <h2 id="ai-recs-title" className="ai-recs-title">{resolvedTitle}</h2>
        </div>
      </header>

      <ul className="ai-recs-list" role="list">
        {visible.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.id} className="ai-recs-card" data-tone={it.tone ?? "primary"}>
              {Icon && (
                <span className="ai-recs-card-icon" aria-hidden>
                  <Icon size={16} />
                </span>
              )}
              <div className="ai-recs-card-body">
                <p className="ai-recs-card-title">{it.title}</p>
                <p className="ai-recs-card-detail">{it.detail}</p>
              </div>
              <div className="ai-recs-card-actions">
                {it.onApply && (
                  <button
                    type="button"
                    className="ai-recs-card-apply"
                    onClick={it.onApply}
                  >
                    {it.applyLabel ?? t("apply")}
                    <ArrowRight size={12} />
                  </button>
                )}
                <button
                  type="button"
                  className="ai-recs-card-dismiss"
                  aria-label={t("dismiss_suggestion")}
                  onClick={() => setDismissed((prev) => new Set(prev).add(it.id))}
                >
                  <X size={12} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
