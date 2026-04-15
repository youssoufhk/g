"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { FeatureFlagOut, TenantOut } from "./types";

const OPS_KEYS = {
  features: ["ops", "features"] as const,
  tenants: ["ops", "tenants"] as const,
};

export function useOpsFeatures() {
  return useQuery({
    queryKey: OPS_KEYS.features,
    queryFn: () => apiFetch<FeatureFlagOut[]>("/ops/features"),
    staleTime: 30_000,
  });
}

export function useOpsTenants() {
  return useQuery({
    queryKey: OPS_KEYS.tenants,
    queryFn: () => apiFetch<TenantOut[]>("/ops/tenants"),
    staleTime: 30_000,
  });
}

export function useToggleKillSwitch() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, killed }: { key: string; killed: boolean }) =>
      apiFetch<FeatureFlagOut>(`/ops/features/${encodeURIComponent(key)}/kill-switch`, {
        method: "POST",
        body: JSON.stringify({ killed }),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: OPS_KEYS.features });
    },
  });
}
