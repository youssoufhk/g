"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ConflictResolver,
  type ConflictField,
  type ConflictResolution,
} from "./conflict-resolver";

/**
 * Host the ConflictResolver at a shared level (AppShell) so every mutation
 * that hits a 409 surfaces the resolver without per-feature wiring.
 *
 * `useConflictResolver()` returns `open(fields): Promise<ConflictResolution>`.
 * Callers do not manage modal state; the provider does. A single resolve
 * path: the modal's footer buttons and Esc/backdrop all call `onResolve`,
 * which settles the promise and nulls `pending` in one place.
 */

type ResolveFn = (fields: ConflictField[]) => Promise<ConflictResolution>;

const ConflictResolverContext = createContext<ResolveFn | null>(null);

type PendingResolver = {
  resolve: (value: ConflictResolution) => void;
  fields: ConflictField[];
};

export function ConflictResolverProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [pending, setPending] = useState<PendingResolver | null>(null);

  const open = useCallback<ResolveFn>((fields) => {
    return new Promise<ConflictResolution>((resolve) => {
      setPending({ fields, resolve });
    });
  }, []);

  const handleResolve = useCallback(
    (resolution: ConflictResolution) => {
      setPending((current) => {
        current?.resolve(resolution);
        return null;
      });
    },
    [],
  );

  const value = useMemo(() => open, [open]);

  return (
    <ConflictResolverContext.Provider value={value}>
      {children}
      <ConflictResolver
        open={pending !== null}
        fields={pending?.fields ?? []}
        onResolve={handleResolve}
      />
    </ConflictResolverContext.Provider>
  );
}

export function useConflictResolver(): ResolveFn | null {
  return useContext(ConflictResolverContext);
}
