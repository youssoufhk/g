"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export function Accordion({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-[var(--color-border-subtle)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
      {children}
    </div>
  );
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 h-11 text-sm text-left text-[var(--color-text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-[var(--color-text-3)] transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-[var(--color-text-2)]">{children}</div>}
    </div>
  );
}
