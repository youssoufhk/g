import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import clsx from "clsx";

/**
 * Table primitives that wrap the prototype's `.data-table-wrapper`
 * + `.data-table` classes. Use like this:
 *
 *   <DataTableWrapper>
 *     <Table>
 *       <THead>
 *         <TR>
 *           <TH>Name</TH>
 *           <TH numeric sorted sortDirection="asc">Amount</TH>
 *         </TR>
 *       </THead>
 *       <TBody>
 *         <TR><TD>Alice</TD><TD numeric>€ 1,200</TD></TR>
 *       </TBody>
 *     </Table>
 *   </DataTableWrapper>
 */

export function DataTableWrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={clsx("data-table-wrapper", className)}>{children}</div>;
}

export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx("data-table", className)} {...rest} />
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({
  className,
  ...rest
}: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={className} {...rest} />;
}

export function TH({
  className,
  sorted,
  sortDirection,
  numeric,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & {
  sorted?: boolean;
  sortDirection?: "asc" | "desc";
  numeric?: boolean;
}) {
  return (
    <th
      className={clsx(sorted && "sorted", numeric && "text-right", className)}
      aria-sort={sorted ? (sortDirection === "asc" ? "ascending" : "descending") : undefined}
      {...rest}
    />
  );
}

export function TD({
  className,
  numeric,
  muted,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & {
  /** Applies tabular-nums monospace rendering for amounts, dates, counts. */
  numeric?: boolean;
  /** Renders as secondary text color for supporting details. */
  muted?: boolean;
}) {
  return (
    <td
      className={clsx(
        numeric && "cell-mono text-right",
        muted && "cell-secondary",
        className,
      )}
      {...rest}
    />
  );
}
