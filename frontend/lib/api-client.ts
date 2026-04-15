/**
 * Typed HTTP client for /api/v1/*.
 *
 * Responsibilities:
 *   - attach the tenant header + auth bearer from the auth store
 *   - surface 402 (entitlement locked) as a typed ApiClientError
 *   - surface 409 (conflict) with payload for the three-layer resolver
 *   - parse JSON or throw a typed error on non-2xx
 *
 * Optimistic mutations live in ./optimistic.ts and use this client.
 */

import { currentAccessToken, currentTenantSchema } from "./auth-store";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1";

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, message: string) {
    super(message);
    this.status = status;
    this.body = body;
    this.name = "ApiClientError";
  }

  get isEntitlementLocked(): boolean {
    return this.status === 402;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

type RequestOptions = RequestInit & {
  tenantSchema?: string | null;
  accessToken?: string | null;
  /** Skip adding the auth header even if a token exists in the store. */
  anonymous?: boolean;
};

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { tenantSchema, accessToken, anonymous, headers, body, ...rest } = opts;

  const mergedHeaders: HeadersInit = {
    Accept: "application/json",
    ...(headers ?? {}),
  };

  // Only set Content-Type for JSON bodies; let fetch pick the multipart
  // boundary for FormData uploads.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && body !== undefined && body !== null) {
    (mergedHeaders as Record<string, string>)["Content-Type"] = "application/json";
  }

  const effectiveTenant = tenantSchema ?? currentTenantSchema();
  if (effectiveTenant) {
    (mergedHeaders as Record<string, string>)["X-Tenant-Schema"] = effectiveTenant;
  }

  const effectiveToken = anonymous ? null : (accessToken ?? currentAccessToken());
  if (effectiveToken) {
    (mergedHeaders as Record<string, string>).Authorization = `Bearer ${effectiveToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: mergedHeaders,
    body,
    credentials: "include",
  });

  if (!response.ok) {
    let errorBody: ApiErrorBody | null = null;
    try {
      errorBody = (await response.json()) as ApiErrorBody;
    } catch {
      errorBody = null;
    }
    const message = errorBody?.message ?? response.statusText;
    throw new ApiClientError(response.status, errorBody, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
