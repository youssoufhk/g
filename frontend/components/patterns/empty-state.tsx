import type { ComponentType, ReactNode } from "react";
import { Card } from "@/components/ui/card";

export type EmptyStateProps = {
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card padded className="flex flex-col items-center text-center py-12">
      {Icon && (
        <div className="h-10 w-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center mb-3">
          <Icon className="h-5 w-5 text-[var(--color-text-3)]" aria-hidden />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[var(--color-text-1)]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-2)] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
