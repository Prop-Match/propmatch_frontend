import { NextRequest, NextResponse } from "next/server";
import { backendFetch, BackendApiError } from "@/src/lib/api/client";
import { ACCESS_TOKEN_COOKIE } from "@/src/lib/api/cookies";
import { UserSchema } from "@/src/lib/api/contracts/auth";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ statusCode: 401, message: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = UserSchema.parse(await backendFetch("/auth/me", { accessToken }));
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json({ statusCode: error.statusCode, message: error.message }, { status: error.statusCode });
    }
    throw error;
  }
}
