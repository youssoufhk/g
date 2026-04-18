"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, X, HelpCircle } from "lucide-react";

export type AIInsightCardProps = {
  title: string;
  summary: ReactNode;
  evidence?: string[];
  actions?: ReactNode;
  /**
   * Optional severity signal from the analyzer library (AI_FEATURES §6.1a).
   * When set, the card colors the left border and header icon accordingly.
   */
  severity?: "info" | "warning" | "action_needed";
  /**
   * Optional dismiss handler. When provided, an X button appears top-right.
   * The caller is responsible for persisting dismissals (spec: per-user in
   * `user_preferences.dismissed_insights`).
   */
  onDismiss?: () => void;
  /**
   * Optional plain-text rationale. When provided, a "Why this insight?"
   * toggle expands the panel. Name the underlying analyzer signal (e.g.
   * "rate_change_mid_period") so the user can trust the source.
   */
  whyExplanation?: ReactNode;
};

/**
 * Wraps the prototype's `.ai-insight-card` pattern. The CSS lives in
 * components.css under .ai-insight-card / .ai-header / .ai-body / .ai-actions.
 *
 * Optional props (severity, onDismiss, whyExplanation) are additive;
 * existing callers continue to work without changes.
 */
export function AIInsightCard({
  title,
  summary,
  evidence,
  actions,
  severity,
  onDismiss,
  whyExplanation,
}: AIInsightCardProps) {
  const t = useTranslations("a11y");
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <div className="ai-insight-card" data-severity={severity}>
      <div className="ai-header">
        <Sparkles size={16} aria-hidden />
        <span className="ai-header-title">{title}</span>
        {onDismiss && (
          <button
            type="button"
            className="ai-dismiss"
            onClick={onDismiss}
            aria-label={t("dismiss_insight")}
          >
            <X size={14} aria-hidden />
          </button>
        )}
      </div>
      <div className="ai-body">
        {summary}
        {evidence && evidence.length > 0 && (
          <ul className="ai-evidence">
            {evidence.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        {whyExplanation && (
          <>
            <button
              type="button"
              className="ai-why-toggle"
              aria-expanded={whyOpen}
              aria-controls="ai-why-panel"
              onClick={() => setWhyOpen((open) => !open)}
            >
              <HelpCircle size={12} aria-hidden />
              {whyOpen ? t("hide_explanation") : t("why_this_insight")}
            </button>
            {whyOpen && (
              <div id="ai-why-panel" className="ai-why-panel" role="region">
                {whyExplanation}
              </div>
            )}
          </>
        )}
      </div>
      {actions && <div className="ai-actions">{actions}</div>}
    </div>
  );
}
