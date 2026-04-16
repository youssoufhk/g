"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import clsx from "clsx";

/**
 * Wraps the prototype's `.tabs` + `.tab.active` + `.tab-count` pattern.
 * Controlled or uncontrolled via `value` / `defaultValue`.
 */
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
    <div role="tablist" className="tabs">
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  count,
  children,
}: {
  value: string;
  count?: number;
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
      className={clsx("tab", selected && "active")}
    >
      {children}
      {typeof count === "number" && <span className="tab-count">{count}</span>}
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
  const selected = active === value;
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-trigger-${value}`}
      className={clsx("tab-content", selected && "active")}
      hidden={!selected}
    >
      {children}
    </div>
  );
}
