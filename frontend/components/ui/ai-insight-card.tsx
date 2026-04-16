import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export type AIInsightCardProps = {
  title: string;
  summary: ReactNode;
  evidence?: string[];
  actions?: ReactNode;
};

/**
 * Wraps the prototype's `.ai-insight-card` pattern. The CSS lives in
 * components.css under .ai-insight-card / .ai-header / .ai-body / .ai-actions.
 * The left border color is chart-5 (brand violet) via the CSS itself.
 */
export function AIInsightCard({
  title,
  summary,
  evidence,
  actions,
}: AIInsightCardProps) {
  return (
    <div className="ai-insight-card">
      <div className="ai-header">
        <Sparkles size={16} aria-hidden />
        <span>{title}</span>
      </div>
      <div className="ai-body">
        {summary}
        {evidence && evidence.length > 0 && (
          <ul
            style={{
              marginTop: "var(--space-2)",
              paddingLeft: "var(--space-5)",
              listStyle: "disc",
            }}
          >
            {evidence.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>
      {actions && <div className="ai-actions">{actions}</div>}
    </div>
  );
}
