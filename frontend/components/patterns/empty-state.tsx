import type { ComponentType, ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export type EmptyStateProps = {
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description?: string;
  action?: ReactNode;
};

function EmptyShell({ icon: Icon, title, description, action }: EmptyStateProps) {
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

/**
 * Back-compat wrapper. Prefer `EmptyData` (no rows exist) or
 * `EmptyFiltered` (rows exist, current filter returns none) so the
 * message and the action are unambiguous.
 */
export function EmptyState(props: EmptyStateProps) {
  return <EmptyShell {...props} />;
}

/** No rows exist at all. Action typically creates the first one. */
export function EmptyData(props: EmptyStateProps) {
  return <EmptyShell {...props} />;
}

export type EmptyFilteredProps = Omit<EmptyStateProps, "action"> & {
  onClearFilters: () => void;
  clearLabel?: string;
};

/**
 * Rows exist but current filter returns zero matches. Always shows a
 * "Clear filters" action so the user is never stuck.
 */
export function EmptyFiltered({
  onClearFilters,
  clearLabel,
  ...rest
}: EmptyFilteredProps) {
  const t = useTranslations("patterns");
  return (
    <EmptyShell
      {...rest}
      action={
        <Button variant="secondary" size="sm" onClick={onClearFilters}>
          {clearLabel ?? t("empty_clear_filters")}
        </Button>
      }
    />
  );
}
