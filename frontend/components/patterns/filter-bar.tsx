import type { ReactNode } from "react";
import type React from "react";
import clsx from "clsx";

export type FilterBarProps = {
  /**
   * Filter inputs. Each child should be a form control (Select, Input,
   * SearchInput). They lay out in a row, truncating each to half-width on
   * mobile.
   */
  children: ReactNode;
  /** Right-aligned actions (view toggle, filter button, export). */
  actions?: ReactNode;
  /**
   * Embedded variant: use the data-table-internal `.table-toolbar` class
   * when the FilterBar sits inside a `<DataTableWrapper>`. Default is the
   * standalone `.filter-bar-standard` used above a list.
   */
  embedded?: boolean;
};

/**
 * FilterBar wraps the prototype's `.filter-bar-standard` (standalone, for
 * list pages above a DataTable) OR `.table-toolbar` (when nested inside a
 * DataTableWrapper). Toggle via the `embedded` prop.
 */
export function FilterBar({ children, actions, embedded = false }: FilterBarProps) {
  return (
    <div className={clsx(embedded ? "table-toolbar" : "filter-bar-standard")}>
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          flex: 1,
          flexWrap: "nowrap",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
          alignItems: "center",
          minWidth: 0,
        }}
      >
        {children}
      </div>
      {actions && (
        <div
          className="table-actions"
          style={{ marginLeft: "auto" }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
