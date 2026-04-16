"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

/**
 * Accordion built from the prototype's `.card` pattern. `_components.css`
 * does not ship a dedicated accordion class, so we compose the item rows
 * with the same tokens used by `.card-header` / `.card-body` so the visual
 * output sits on the same spacing and border grid as every other atom.
 */
export function Accordion({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
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
  const id = useId();
  return (
    <div className="accordion-item" style={accordionItemStyle}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-trigger`}
        onClick={() => setOpen((o) => !o)}
        className="accordion-trigger"
        style={triggerStyle}
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          aria-hidden
          className={clsx(open && "open")}
          style={{
            transition: "transform var(--motion-fast) var(--ease-out)",
            color: "var(--color-text-3)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </button>
      {open && (
        <div
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-trigger`}
          style={panelStyle}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const accordionItemStyle = {
  borderBottom: "1px solid var(--color-border-subtle)",
} as const;

const triggerStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-3)",
  padding: "var(--space-4)",
  background: "transparent",
  border: 0,
  cursor: "pointer",
  textAlign: "left" as const,
  color: "var(--color-text-1)",
  fontSize: "var(--text-body)",
  fontWeight: 600,
  minHeight: "48px",
} as const;

const panelStyle = {
  padding: "0 var(--space-4) var(--space-4)",
  fontSize: "var(--text-body-sm)",
  color: "var(--color-text-2)",
  lineHeight: 1.6,
} as const;
