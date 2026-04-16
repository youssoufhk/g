import type { ReactNode } from "react";

/**
 * Wraps the prototype's `.page-header` + `.page-header-left` + `.page-title`
 * + `.page-header-actions` layout block. Use once at the top of every List
 * and Dashboard page for a pixel-identical header row.
 */
export function PageHeader({
  title,
  subtitle,
  count,
  actions,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1 className="page-title">
          {title}
          {typeof count === "number" && (
            <span
              style={{
                fontSize: "var(--text-body)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-3)",
                marginLeft: "var(--space-2)",
              }}
            >
              {count}
            </span>
          )}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
