/**
 * Typed HTTP client for /api/v1/*.
 *
 * Responsibilities:
 *   - attach the tenant header + auth bearer
 *   - surface 402 (entitlement locked) as a typed ApiClientError
 *   - surface 409 (conflict) with payload for the three-layer resolver
 *   - parse JSON or throw a typed error on non-2xx
 *
 * Optimistic mutations live in ./optimistic.ts and use this client.
 */

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
};

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { tenantSchema, accessToken, headers, ...rest } = opts;

  const mergedHeaders: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(headers ?? {}),
  };
  if (tenantSchema) {
    (mergedHeaders as Record<string, string>)["X-Tenant-Schema"] = tenantSchema;
  }
  if (accessToken) {
    (mergedHeaders as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: mergedHeaders,
    credentials: "include",
  });

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    const message = body?.message ?? response.statusText;
    throw new ApiClientError(response.status, body, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
