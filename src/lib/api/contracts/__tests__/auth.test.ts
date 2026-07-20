import {
  AuthResponseSchema,
  BackendAuthTokensSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
} from "../auth";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("auth contracts", () => {
  it("accepts a valid login payload", () => {
    const result = LoginRequestSchema.safeParse({ email: "a@b.com", password: "12345678" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = LoginRequestSchema.safeParse({ email: "not-an-email", password: "12345678" });
    expect(result.success).toBe(false);
  });

  const base = {
    fullName: "سارة أحمد",
    email: "sara@example.com",
    phoneNumber: "01012345678",
    password: "12345678",
  };

  // ERD: USER.role is a single enum and signup is explicitly Tenant OR
  // Landlord (PRO-02) — separate account per role, no unified/base role.
  it.each(["tenant", "landlord"])("accepts signing up explicitly as %s", (role) => {
    expect(RegisterRequestSchema.safeParse({ ...base, role }).success).toBe(true);
  });

  it("rejects self-signup as admin", () => {
    expect(RegisterRequestSchema.safeParse({ ...base, role: "admin" }).success).toBe(false);
  });

  it.each(["user", "both", "broker"])("rejects the non-V1 role %s", (role) => {
    expect(RegisterRequestSchema.safeParse({ ...base, role }).success).toBe(false);
  });

  it("normalizes the backend's safe user response without exposing tokens", () => {
    const backendResponse = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: {
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
      },
    };

    const tokens = BackendAuthTokensSchema.parse(backendResponse);
    const browserResponse = AuthResponseSchema.parse({ user: tokens.user });

    expect(browserResponse).toEqual({
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
    expect(browserResponse).not.toHaveProperty("accessToken");
    expect(browserResponse).not.toHaveProperty("refreshToken");
  });

  it("accepts the backend login token spelling and rejects responses without an access token", () => {
    const user = {
      id: "user-1",
      fullName: "Sarah Ahmed",
      email: "sara@example.com",
      phone: "01012345678",
      role: "tenant",
      verificationStatus: "unverified",
      createdAt: "2026-07-20T10:22:39.215Z",
    };

    expect(BackendAuthTokensSchema.parse({ accesstoken: "access-token", refreshToken: "refresh-token", user }))
      .toMatchObject({ accessToken: "access-token", refreshToken: "refresh-token" });
    expect(BackendAuthTokensSchema.safeParse({ refreshToken: "refresh-token", user }).success).toBe(false);
  });

  it("documents the local NestJS API prefix and port", () => {
    const example = readFileSync(join(process.cwd(), ".env.example"), "utf8");
    expect(example).toContain("NESTJS_API_URL=http://localhost:3001/api");
    expect(example).not.toMatch(/(?:PASSWORD|TOKEN|SECRET|DATABASE_URL)=/);
  });
});
