"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import clsx from "clsx";

type TabsContextValue = {
  value: string;
  setValue: (next: string) => void;
  idPrefix: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* must be used inside <Tabs>");
  return ctx;
}

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  children,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (next: string) => void;
  children: ReactNode;
}) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const value = controlled ?? internal;
  const idPrefix = useId();

  const setValue = (next: string) => {
    setInternal(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, setValue, idPrefix }}>
      {children}
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: ReactNode }) {
  return (
    <div
      role="tablist"
      className="flex items-center gap-0.5 border-b border-[var(--color-border)]"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const { value: active, setValue, idPrefix } = useTabs();
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={`${idPrefix}-panel-${value}`}
      id={`${idPrefix}-trigger-${value}`}
      onClick={() => setValue(value)}
      className={clsx(
        "h-9 px-3 text-sm border-b-2 -mb-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        selected
          ? "border-[var(--color-primary)] text-[var(--color-text-1)]"
          : "border-transparent text-[var(--color-text-2)] hover:text-[var(--color-text-1)]",
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const { value: active, idPrefix } = useTabs();
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-trigger-${value}`}
      className="pt-4"
    >
      {children}
    </div>
  );
}
