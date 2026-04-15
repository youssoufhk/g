import type { ReactNode } from "react";

export type FilterBarProps = {
  children: ReactNode;
  actions?: ReactNode;
};

export function FilterBar({ children, actions }: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
