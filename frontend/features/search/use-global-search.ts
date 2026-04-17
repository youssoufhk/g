"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiFetch, ApiClientError } from "@/lib/api-client";

import type { SearchGroupedResponse } from "./types";

const EMPTY: SearchGroupedResponse = {
  employees: [],
  clients: [],
  projects: [],
  total: 0,
};

/**
 * Topbar global search (Phase Z.6). Debounces by 180ms; skips until the
 * query is 2+ chars; keeps the previous results rendered during a
 * refetch so the dropdown does not flash empty between keystrokes.
 */
export function useGlobalSearch(rawQuery: string) {
  const [debounced, setDebounced] = useState(rawQuery);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(rawQuery), 180);
    return () => window.clearTimeout(handle);
  }, [rawQuery]);

  const trimmed = debounced.trim();
  const enabled = trimmed.length >= 2;

  const query = useQuery<SearchGroupedResponse, ApiClientError>({
    queryKey: ["search", "global", trimmed],
    queryFn: () =>
      apiFetch<SearchGroupedResponse>(
        `/search?q=${encodeURIComponent(trimmed)}`,
      ),
    enabled,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return {
    data: query.data ?? EMPTY,
    isActive: enabled,
    isFetching: query.isFetching && enabled,
    isError: query.isError,
    error: query.error,
  };
}
