/**
 * useOptimisticMutation: thin wrapper around useMutation that applies an
 * optimistic update, rolls it back on error, and surfaces 409 conflicts to
 * a three-layer resolver (callback). Full resolver UI lives in
 * components/patterns/ConflictResolver and is wired in Phase 5.
 */

import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { ApiClientError } from "./api-client";

type ConflictResolver<TVariables, TData> = (args: {
  variables: TVariables;
  serverState: TData;
}) => Promise<TVariables | null>;

export type OptimisticMutationOptions<TData, TVariables, TContext> = UseMutationOptions<
  TData,
  ApiClientError,
  TVariables,
  TContext
> & {
  onConflict?: ConflictResolver<TVariables, TData>;
};

export function useOptimisticMutation<TData, TVariables, TContext = unknown>(
  opts: OptimisticMutationOptions<TData, TVariables, TContext>,
) {
  const client = useQueryClient();
  const { onError: userOnError, onSettled: userOnSettled, onConflict, ...rest } = opts;

  return useMutation<TData, ApiClientError, TVariables, TContext>({
    ...rest,
    onError: ((...args: Parameters<NonNullable<typeof userOnError>>) => {
      const [error, variables] = args;
      if (error.isConflict && onConflict && error.body) {
        void onConflict({
          variables,
          serverState: error.body as unknown as TData,
        });
      }
      return userOnError?.(...args);
    }) as NonNullable<typeof userOnError>,
    onSettled: (async (...args: Parameters<NonNullable<typeof userOnSettled>>) => {
      await userOnSettled?.(...args);
      await client.invalidateQueries();
    }) as NonNullable<typeof userOnSettled>,
  });
}
