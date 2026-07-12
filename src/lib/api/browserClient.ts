"use client";

/**
 * Browser-side fetch wrapper. Talks only to our own Next.js Route Handlers
 * (same origin), which attach the httpOnly token and proxy to the backend.
 * Never targets the NestJS origin directly, so no tokens are ever exposed to
 * client JS.
 */

export interface ApiClientError extends Error {
  statusCode: number;
  body: unknown;
}

function makeError(statusCode: number, message: string, body: unknown): ApiClientError {
  const err = new Error(message) as ApiClientError;
  err.name = "ApiClientError";
  err.statusCode = statusCode;
  err.body = body;
  return err;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? Array.isArray((data as { message: unknown }).message)
          ? ((data as { message: string[] }).message.join(", "))
          : String((data as { message: unknown }).message)
        : "حدث خطأ غير متوقع";
    throw makeError(res.status, message, data);
  }

  return data as T;
}

/** Endpoints proxied through /api/backend/* to the NestJS backend. */
export const api = {
  get: <T>(path: string) => request<T>("GET", `/api/backend/${path}`),
  post: <T>(path: string, body?: unknown) => request<T>("POST", `/api/backend/${path}`, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", `/api/backend/${path}`, body),
  delete: <T>(path: string) => request<T>("DELETE", `/api/backend/${path}`),
};

/** Auth endpoints live at /api/auth/* (they mint/clear cookies). */
export const authApi = {
  login: <T>(body: unknown) => request<T>("POST", "/api/auth/login", body),
  register: <T>(body: unknown) => request<T>("POST", "/api/auth/register", body),
  logout: () => request<{ success: boolean }>("POST", "/api/auth/logout", {}),
  me: <T>() => request<T>("GET", "/api/auth/me"),
};

export function isApiClientError(e: unknown): e is ApiClientError {
  return e instanceof Error && e.name === "ApiClientError";
}
