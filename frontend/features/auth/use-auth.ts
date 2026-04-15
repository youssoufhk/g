"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_seconds: number;
};

export type MeResponse = {
  user: {
    id: number;
    email: string;
    display_name: string;
    locale: string;
    status: string;
    created_at: string;
    last_login_at: string | null;
  };
  memberships: {
    tenant_id: number;
    tenant_schema: string;
    tenant_display_name: string;
    role: string;
  }[];
  active_tenant_schema: string | null;
};

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  return useMutation({
    mutationFn: (input: { email: string; password: string; tenantSchema?: string }) =>
      apiFetch<TokenPair>("/auth/login", {
        method: "POST",
        anonymous: true,
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          tenant_schema: input.tenantSchema ?? null,
        }),
      }),
    onSuccess: (data, variables) => {
      setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tenantSchema: variables.tenantSchema ?? null,
        expiresInSeconds: data.expires_in_seconds,
      });
    },
  });
}

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<MeResponse>("/auth/me"),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  return () => clear();
}
