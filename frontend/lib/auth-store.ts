import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Auth state: JWT tokens + the tenant schema resolved at login.
 * Persisted to localStorage so refreshes keep the user signed in.
 *
 * In Phase 3b this gets replaced with a real session/refresh rotation
 * flow (app_user_sessions table + /api/v1/auth/refresh endpoint). For
 * Phase 3a demo we trust the access token until it expires and then
 * force a re-login.
 *
 * _hasHydrated is NOT persisted. It starts false on every page load and
 * flips to true once the persist middleware has read from localStorage.
 * RequireAuth gates all auth checks on this flag to avoid false redirects
 * on the first render tick before hydration completes.
 */

export type AuthSnapshot = {
  accessToken: string | null;
  refreshToken: string | null;
  tenantSchema: string | null;
  expiresAt: number | null; // epoch ms
};

type AuthState = AuthSnapshot & {
  _hasHydrated: boolean;
};

type AuthActions = {
  setTokens: (tokens: {
    accessToken: string;
    refreshToken: string;
    tenantSchema: string | null;
    expiresInSeconds: number;
  }) => void;
  clear: () => void;
  isExpired: () => boolean;
  setHasHydrated: (v: boolean) => void;
};

const EMPTY: AuthSnapshot = {
  accessToken: null,
  refreshToken: null,
  tenantSchema: null,
  expiresAt: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      _hasHydrated: false,
      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),
      setTokens: ({ accessToken, refreshToken, tenantSchema, expiresInSeconds }) =>
        set({
          accessToken,
          refreshToken,
          tenantSchema,
          expiresAt: Date.now() + expiresInSeconds * 1000,
        }),
      clear: () => set(EMPTY),
      isExpired: () => {
        const expiresAt = get().expiresAt;
        if (expiresAt === null) return true;
        return Date.now() >= expiresAt;
      },
    }),
    {
      name: "gamma-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tenantSchema: state.tenantSchema,
        expiresAt: state.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function currentAccessToken(): string | null {
  const state = useAuthStore.getState();
  if (state.isExpired()) return null;
  return state.accessToken;
}

export function currentTenantSchema(): string | null {
  return useAuthStore.getState().tenantSchema;
}
