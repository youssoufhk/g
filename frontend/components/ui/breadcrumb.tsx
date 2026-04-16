import Link from "next/link";

/**
 * Wraps the prototype's `.breadcrumb` class. The `>` separator is added
 * automatically by the CSS via `::after` on every non-last child.
 */
export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (item.href && !isLast) {
          return (
            <Link key={`${item.label}-${index}`} href={item.href}>
              {item.label}
            </Link>
          );
        }
        return (
          <span
            key={`${item.label}-${index}`}
            aria-current={isLast ? "page" : undefined}
          >
            {item.label}
          </span>
        );
      })}
    </nav>
  );
}
