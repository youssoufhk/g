"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type UrlListStateConfig<MK extends string, WV extends string> = {
  multiKeys: readonly MK[];
  windowKey?: string;
  windowDefault?: WV;
};

export type UrlListState<MK extends string, WV extends string> = {
  search: string;
  multi: Record<MK, string[]>;
  windowValue: WV;
  setSearch: (value: string) => void;
  setMulti: (key: MK, values: string[]) => void;
  setWindow: (value: WV) => void;
  clearAll: () => void;
};

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function useUrlListState<MK extends string, WV extends string = string>(
  config: UrlListStateConfig<MK, WV>,
): UrlListState<MK, WV> {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const { multiKeys, windowKey = "window", windowDefault } = config;

  const search = params.get("q") ?? "";
  const multi = useMemo(() => {
    const out = {} as Record<MK, string[]>;
    for (const k of multiKeys) {
      out[k] = parseList(params.get(k));
    }
    return out;
  }, [params, multiKeys]);
  const windowValue = (params.get(windowKey) ?? windowDefault ?? "") as WV;

  const writeParams = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const setSearch = useCallback(
    (value: string) => {
      writeParams((next) => {
        const trimmed = value.trim();
        if (trimmed) next.set("q", trimmed);
        else next.delete("q");
      });
    },
    [writeParams],
  );

  const setMulti = useCallback(
    (key: MK, values: string[]) => {
      writeParams((next) => {
        if (values.length === 0) next.delete(key);
        else next.set(key, values.join(","));
      });
    },
    [writeParams],
  );

  const setWindow = useCallback(
    (value: WV) => {
      writeParams((next) => {
        if (value && value !== windowDefault) next.set(windowKey, value);
        else next.delete(windowKey);
      });
    },
    [writeParams, windowDefault, windowKey],
  );

  const clearAll = useCallback(() => {
    writeParams((next) => {
      next.delete("q");
      for (const k of multiKeys) next.delete(k);
    });
  }, [writeParams, multiKeys]);

  return { search, multi, windowValue, setSearch, setMulti, setWindow, clearAll };
}
