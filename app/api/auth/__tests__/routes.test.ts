import type { NextRequest } from "next/server";
import { BackendApiError, backendFetch } from "@/src/lib/api/client";
import { ACCESS_TOKEN_COOKIE } from "@/src/lib/api/cookies";
import { POST as register } from "../register/route";
import { GET as me } from "../me/route";

jest.mock("@/src/lib/api/client", () => {
  const actual = jest.requireActual("@/src/lib/api/client");
  return { ...actual, backendFetch: jest.fn() };
});

const mockedBackendFetch = jest.mocked(backendFetch);

const backendUser = {
  id: "user-1",
  fullName: "Sarah Ahmed",
  email: "sara@example.com",
  phone: "01012345678",
  role: "tenant",
  verificationStatus: "unverified",
  verificationRejectedAt: null,
  verificationResubmitAfter: null,
  verificationRejectionReason: null,
  createdAt: "2026-07-20T10:22:39.215Z",
};

function registerRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }) as unknown as NextRequest;
}

describe("auth BFF routes", () => {
  beforeEach(() => {
    mockedBackendFetch.mockReset();
  });

  it("maps a registration to the backend, stores httpOnly tokens, and returns only the public user", async () => {
    mockedBackendFetch.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: backendUser,
    });

    const response = await register(registerRequest({
      fullName: "Sarah Ahmed",
      email: "sara@example.com",
      phoneNumber: "01012345678",
      password: "12345678",
      role: "tenant",
    }));

    expect(mockedBackendFetch).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: {
        fullName: "Sarah Ahmed",
        email: "sara@example.com",
        phoneNumber: "01012345678",
        password: "12345678",
        role: "TENANT",
      },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      user: {
        id: "user-1",
        fullName: "Sarah Ahmed",
        email: "sara@example.com",
        phoneNumber: "01012345678",
        role: "tenant",
        verificationStatus: "NOT_SUBMITTED",
        createdAt: "2026-07-20T10:22:39.215Z",
      },
    });
    const cookies = response.headers.get("set-cookie") ?? "";
    expect(cookies).toContain("propmatch_access_token=access-token");
    expect(cookies).toContain("propmatch_refresh_token=refresh-token");
    expect(cookies).toContain("HttpOnly");
    expect(cookies).not.toContain('"accessToken"');
    expect(cookies).not.toContain('"refreshToken"');
  });

  it("preserves registration validation and conflict responses", async () => {
    const invalid = await register(registerRequest({ role: "admin" }));
    expect(invalid.status).toBe(400);
    expect(mockedBackendFetch).not.toHaveBeenCalled();

    mockedBackendFetch.mockRejectedValue(new BackendApiError(409, "Email already exists."));
    const conflict = await register(registerRequest({
      fullName: "Sarah Ahmed",
      email: "sara@example.com",
      phoneNumber: "01012345678",
      password: "12345678",
      role: "landlord",
    }));
    expect(conflict.status).toBe(409);
    await expect(conflict.json()).resolves.toEqual({ statusCode: 409, message: "Email already exists." });
  });

  it("forwards the httpOnly access cookie to auth/me and returns no tokens", async () => {
    mockedBackendFetch.mockResolvedValue({ user: backendUser });
    const request = {
      cookies: { get: jest.fn().mockReturnValue({ value: "access-token" }) },
    } as unknown as NextRequest;

    const response = await me(request);

    expect(request.cookies.get).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE);
    expect(mockedBackendFetch).toHaveBeenCalledWith("/auth/me", { accessToken: "access-token" });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ user: { id: "user-1", phoneNumber: "01012345678" } });
    expect(body).not.toHaveProperty("accessToken");
    expect(body).not.toHaveProperty("refreshToken");
  });

  it("preserves unauthenticated auth/me responses", async () => {
    const missingCookieRequest = { cookies: { get: jest.fn().mockReturnValue(undefined) } } as unknown as NextRequest;
    const missingCookie = await me(missingCookieRequest);
    expect(missingCookie.status).toBe(401);
    expect(mockedBackendFetch).not.toHaveBeenCalled();

    mockedBackendFetch.mockRejectedValue(new BackendApiError(401, "Unauthorized"));
    const expiredTokenRequest = {
      cookies: { get: jest.fn().mockReturnValue({ value: "expired-token" }) },
    } as unknown as NextRequest;
    const expiredToken = await me(expiredTokenRequest);
    expect(expiredToken.status).toBe(401);
    await expect(expiredToken.json()).resolves.toEqual({ statusCode: 401, message: "Unauthorized" });
  });
});
