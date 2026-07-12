import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendFetch, BackendApiError } from "./client";
import { ACCESS_TOKEN_COOKIE } from "./cookies";
import { UserSchema, type User } from "./contracts/auth";

/**
 * Server-side session read for Server Components / layouts. Returns the user
 * from the backend (authoritative), or null when unauthenticated. The backend
 * — not the cookie's mere presence — is the source of truth.
 */
export async function getServerSession(): Promise<User | null> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;
  try {
    return UserSchema.parse(await backendFetch("/auth/me", { accessToken: token }));
  } catch (e) {
    if (e instanceof BackendApiError) return null;
    throw e;
  }
}

/** Redirects to /login if there's no session. */
export async function requireSession(redirectTo: string): Promise<User> {
  const user = await getServerSession();
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  return user;
}
