/**
 * useOptimisticMutation: thin wrapper around useMutation that applies an
 * optimistic update, rolls it back on error, and surfaces 409 conflicts to
 * the shell-hosted ConflictResolver by default.
 *
 * 409 resolution flow:
 *   1. A mutation returns 409 with a ConflictErrorBody (see api-client.ts).
 *   2. The shell-hosted resolver opens with `conflictFields({variables,
 *      serverState})`.
 *   3. The user picks a branch. The resolver promise settles with a
 *      ConflictResolution.
 *   4. `applyResolution` converts the resolution into retry variables (or
 *      null for no retry). Default: keep-mine retries with `variables`,
 *      everything else returns null.
 *   5. Non-null retry payload triggers `mutation.mutate(retry)`. Null
 *      payload invalidates queries so the UI reflects server state.
 *
 * If the caller provides neither `onConflict` nor `conflictFields`, a 409
 * still cannot be silently dropped: we emit a toast and invalidate queries
 * (OPUS UX G31/G33).
 */

import { useRef } from "react";
import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useConflictResolver } from "@/components/patterns/conflict-resolver-provider";
import type {
  ConflictField,
  ConflictResolution,
} from "@/components/patterns/conflict-resolver";
import { useToast } from "@/components/ui/toast";

import { ApiClientError } from "./api-client";

type ConflictOverrideCallback<TVariables, TData> = (args: {
  variables: TVariables;
  serverState: TData;
}) => Promise<TVariables | null>;

type ApplyResolutionCallback<TVariables, TData> = (args: {
  resolution: ConflictResolution;
  variables: TVariables;
  serverState: TData;
}) => TVariables | null;

export type OptimisticMutationOptions<TData, TVariables, TContext> = UseMutationOptions<
  TData,
  ApiClientError,
  TVariables,
  TContext
> & {
  /**
   * Pre-resolver override. When set, bypasses the shell-hosted modal and
   * lets the caller resolve programmatically. Returning a non-null value
   * re-submits the mutation; null aborts without retry.
   */
  onConflict?: ConflictOverrideCallback<TVariables, TData>;
  /**
   * Builds the list of conflicting fields from the server's body + the
   * caller's variables. Required when the shell-hosted resolver is used.
   */
  conflictFields?: (args: {
    variables: TVariables;
    serverState: TData;
  }) => ConflictField[];
  /**
   * Converts a user's ConflictResolution into retry variables or null.
   * Defaults: keep-mine -> variables, take-theirs/merge/cancel -> null.
   * Callers that need field-level merge supply this.
   */
  applyResolution?: ApplyResolutionCallback<TVariables, TData>;
};

function defaultApplyResolution<TVariables, TData>({
  resolution,
  variables,
}: {
  resolution: ConflictResolution;
  variables: TVariables;
  serverState: TData;
}): TVariables | null {
  if (resolution.type === "keep-mine") return variables;
  return null;
}

export function useOptimisticMutation<TData, TVariables, TContext = unknown>(
  opts: OptimisticMutationOptions<TData, TVariables, TContext>,
): UseMutationResult<TData, ApiClientError, TVariables, TContext> {
  const client = useQueryClient();
  const resolver = useConflictResolver();
  const toast = useToast();
  const tErrors = useTranslations("errors");
  const {
    onError: userOnError,
    onSettled: userOnSettled,
    onConflict,
    conflictFields,
    applyResolution,
    ...rest
  } = opts;

  const mutationRef = useRef<UseMutationResult<
    TData,
    ApiClientError,
    TVariables,
    TContext
  > | null>(null);

  const mutation = useMutation<TData, ApiClientError, TVariables, TContext>({
    ...rest,
    onError: ((...args: Parameters<NonNullable<typeof userOnError>>) => {
      const [error, variables] = args;
      if (error.isConflict) {
        const serverState = error.conflictState<TData>();
        if (serverState === null) {
          // 409 without a serverState payload. The pattern cannot open.
          // Surface a toast so the user is not silently blocked and the
          // server state at least becomes visible on re-fetch.
          toast.show({
            tone: "warning",
            title: tErrors("conflict_fallback_title"),
            description: tErrors("conflict_fallback_body"),
          });
          void client.invalidateQueries();
          return userOnError?.(...args);
        }

        if (onConflict) {
          void onConflict({ variables, serverState }).then((retry) => {
            if (retry !== null && mutationRef.current) {
              mutationRef.current.mutate(retry);
            } else {
              void client.invalidateQueries();
            }
          });
          return userOnError?.(...args);
        }

        if (resolver && conflictFields) {
          const fields = conflictFields({ variables, serverState });
          void resolver(fields).then((resolution) => {
            const apply =
              applyResolution ??
              (defaultApplyResolution as ApplyResolutionCallback<
                TVariables,
                TData
              >);
            const retry = apply({ resolution, variables, serverState });
            if (retry !== null && mutationRef.current) {
              mutationRef.current.mutate(retry);
            } else {
              void client.invalidateQueries();
            }
          });
          return userOnError?.(...args);
        }

        // Neither override nor shell resolver available. Emit a toast so
        // the 409 never silently disappears (OPUS UX G31/G33).
        toast.show({
          tone: "warning",
          title: tErrors("conflict_fallback_title"),
          description: tErrors("conflict_fallback_body"),
        });
        void client.invalidateQueries();
      }
      return userOnError?.(...args);
    }) as NonNullable<typeof userOnError>,
    onSettled: (async (...args: Parameters<NonNullable<typeof userOnSettled>>) => {
      await userOnSettled?.(...args);
      // Skip blanket invalidation on 409. The conflict branches
      // (serverState-null toast, onConflict override, shell resolver)
      // each decide whether to invalidate after their resolution path.
      // Invalidating here races `keep-mine` retries: the original settle
      // would replace the user's optimistic row with server state before
      // they even see the modal. See UX C18 in the Z.4 critic report.
      const error = args[1] as ApiClientError | null | undefined;
      if (error?.isConflict) return;
      await client.invalidateQueries();
    }) as NonNullable<typeof userOnSettled>,
  });

  mutationRef.current = mutation;
  return mutation;
}
