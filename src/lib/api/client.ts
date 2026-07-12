import { ApiErrorSchema } from "./contracts/common";

/**
 * Server-only fetch wrapper for calling the NestJS backend. Used exclusively
 * from Route Handlers (app/api/**) and Server Components/Actions — never
 * imported into client components, since it targets the backend origin
 * directly and callers here are trusted to attach auth headers themselves.
 *
 * In development, requests are intercepted by MSW (see src/mocks) unless
 * NESTJS_API_URL points at a real running backend — see .env.example.
 */

export class BackendApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

function getBackendUrl(): string {
  const url = process.env.NESTJS_API_URL;
  if (!url) {
    throw new Error(
      "NESTJS_API_URL is not set. Copy .env.example to .env.local, or enable API_MOCKING for local dev.",
    );
  }
  return url;
}

interface BackendFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  accessToken?: string;
}

export async function backendFetch<T>(path: string, options: BackendFetchOptions = {}): Promise<T> {
  const { body, accessToken, headers, ...rest } = options;

  const response = await fetch(`${getBackendUrl()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const parsed = ApiErrorSchema.safeParse(await response.json().catch(() => null));
    const message = parsed.success
      ? Array.isArray(parsed.data.message)
        ? parsed.data.message.join(", ")
        : parsed.data.message
      : response.statusText;
    throw new BackendApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
