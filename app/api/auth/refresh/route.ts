import { NextRequest, NextResponse } from "next/server";
import { backendFetch, BackendApiError } from "@/src/lib/api/client";
import { setAuthCookies, clearAuthCookies, REFRESH_TOKEN_COOKIE } from "@/src/lib/api/cookies";
import { BackendAuthTokensSchema, type AuthResponse } from "@/src/lib/api/contracts/auth";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ statusCode: 401, message: "No refresh token" }, { status: 401 });
  }

  try {
    const backendResponse = await backendFetch<unknown>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
    const tokens = BackendAuthTokensSchema.parse(backendResponse);

    const body: AuthResponse = { user: tokens.user };
    const response = NextResponse.json(body);
    setAuthCookies(response, tokens);
    return response;
  } catch (error) {
    if (error instanceof BackendApiError) {
      const response = NextResponse.json({ statusCode: error.statusCode, message: error.message }, { status: error.statusCode });
      if (error.statusCode === 401) clearAuthCookies(response);
      return response;
    }
    throw error;
  }
}
