"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import clsx from "clsx";

/**
 * Wraps the prototype's `.dropdown`, `.dropdown-menu`, `.dropdown-item`
 * pattern. Controlled internally; opens on trigger click, closes on
 * outside click or Escape. Items are rendered via `<DropdownItem>`.
 */
export function Dropdown({
  trigger,
  children,
  align = "left",
  className,
}: {
  trigger: (props: { toggle: () => void; open: boolean }) => ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: Event) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={clsx("dropdown", className)}>
      {trigger({ toggle: () => setOpen((o) => !o), open })}
      <div
        className={clsx("dropdown-menu", align === "right" && "right", open && "active")}
        role="menu"
      >
        {children}
      </div>
    </div>
  );
}

export function DropdownItem({
  icon,
  destructive = false,
  onClick,
  children,
}: {
  icon?: ReactNode;
  destructive?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={clsx("dropdown-item", destructive && "destructive")}
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="dropdown-divider" role="separator" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return <div className="dropdown-label">{children}</div>;
}
