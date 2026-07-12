import { NextRequest, NextResponse } from "next/server";
import { backendFetch, BackendApiError } from "@/src/lib/api/client";
import { ACCESS_TOKEN_COOKIE } from "@/src/lib/api/cookies";

/**
 * Generic BFF proxy. The browser calls `/api/backend/<path>`; this handler
 * attaches the httpOnly access token and forwards to the NestJS backend
 * (or the MSW mock). Keeps tokens out of client JS while avoiding a bespoke
 * Route Handler per endpoint. Auth endpoints stay separate (app/api/auth/*)
 * because they mint/clear cookies.
 */

async function forward(request: NextRequest, path: string[], hasBody: boolean) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const search = request.nextUrl.search;
  const target = `/${path.join("/")}${search}`;

  let body: unknown;
  if (hasBody) {
    body = await request.json().catch(() => undefined);
  }

  try {
    const data = await backendFetch<unknown>(target, {
      method: request.method,
      accessToken,
      body,
    });
    return NextResponse.json(data ?? { ok: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      // Forward the full domain error body (e.g. quota-exhausted 403 with its
      // payment trigger payload), falling back to a minimal shape.
      const payload =
        error.body && typeof error.body === "object"
          ? error.body
          : { statusCode: error.statusCode, message: error.message };
      return NextResponse.json(payload, { status: error.statusCode });
    }
    throw error;
  }
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path, false);
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path, true);
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path, true);
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path, false);
}
