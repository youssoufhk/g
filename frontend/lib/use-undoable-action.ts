"use client";

import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast";

/**
 * useUndoableAction - the canonical primitive for any optimistic mutation
 * that should be reversible within a 5-second window.
 *
 * Spec: OPUS C18-C21. Wired into approvals, leaves, expenses, invoices.
 *
 * Flow:
 *   1. caller invokes run(args)
 *   2. apply(args) runs immediately (optimistic local state change)
 *   3. a toast appears with an "Undo" action and a 5s lifespan
 *   4. if Undo is clicked, revert(args) runs and the action is dropped
 *   5. if 5s passes without Undo, commit(args) runs (POST in real impl)
 *      with a generated Idempotency-Key header (UUID v4)
 *
 * The hook returns a stable run() function that callers can pass to onClick.
 *
 * For server-backed mutations once the API is wired, replace the inline
 * commit() with a call to useOptimisticMutation that supplies the same
 * idempotency key in the request headers.
 */

type RunArgs = unknown;

export type UndoableActionOptions<T extends RunArgs> = {
  /** Apply the change locally (optimistic). Runs immediately. */
  apply: (args: T) => void;
  /** Revert the local change. Runs only if user clicks Undo within 5s. */
  revert: (args: T) => void;
  /** Commit the change (POST to API). Runs after 5s if no undo. */
  commit?: (args: T, idempotencyKey: string) => Promise<void> | void;
  /** Toast title shown immediately. */
  successTitle: string;
  /** Optional toast description. */
  successDescription?: string;
  /** Toast tone. Defaults to "success". */
  tone?: "success" | "info" | "warning";
  /** Undo window in ms. Defaults to 5000. */
  undoMs?: number;
};

function uuidv4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback - sufficient for client-side idempotency key
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useUndoableAction<T extends RunArgs>(opts: UndoableActionOptions<T>) {
  const toast = useToast();
  const t = useTranslations("common");
  const optsRef = useRef(opts);
  optsRef.current = opts;

  return useCallback((args: T) => {
    const { apply, revert, commit, successTitle, successDescription, tone, undoMs } = optsRef.current;
    apply(args);

    let undone = false;
    const idempotencyKey = uuidv4();

    toast.show({
      tone: tone ?? "success",
      title: successTitle,
      description: successDescription,
      durationMs: undoMs ?? 5000,
      action: {
        label: t("undo"),
        onAction: () => {
          undone = true;
          revert(args);
        },
      },
    });

    setTimeout(() => {
      if (!undone && commit) {
        try {
          const result = commit(args, idempotencyKey);
          if (result && typeof (result as Promise<void>).then === "function") {
            (result as Promise<void>).catch((err) => {
              // Commit failed after undo window. Revert and surface error.
              revert(args);
              toast.show({
                tone: "error",
                title: t("commit_failed_title"),
                description: (err as Error)?.message ?? t("commit_failed_body"),
              });
            });
          }
        } catch (err) {
          revert(args);
          toast.show({
            tone: "error",
            title: t("commit_failed_title"),
            description: (err as Error)?.message ?? t("commit_failed_body"),
          });
        }
      }
    }, undoMs ?? 5000);
  }, [toast, t]);
}
