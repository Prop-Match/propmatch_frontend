import type { NextResponse } from "next/server";

/**
 * httpOnly cookie handling for the access/refresh token pair. Tokens never
 * reach client-side JS — see docs/analysis/requirements.md, "Auth token storage".
 */

export const ACCESS_TOKEN_COOKIE = "propmatch_access_token";
export const REFRESH_TOKEN_COOKIE = "propmatch_refresh_token";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60; // 1h, per SRS NFR1.2
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7d, per SRS NFR1.2

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}
