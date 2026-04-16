import type { ComponentType, ReactNode } from "react";

export type EmptyStateProps = {
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description?: string;
  action?: ReactNode;
};

/**
 * Wraps the prototype's `.empty-state` pattern. The CSS lives in
 * _components.css and matches the naming `.empty-icon / .empty-title / .empty-desc`.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon">
          {/* @ts-expect-error Lucide icons accept size prop at runtime */}
          <Icon aria-hidden size={28} />
        </div>
      )}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-desc">{description}</p>}
      {action}
    </div>
  );
}
