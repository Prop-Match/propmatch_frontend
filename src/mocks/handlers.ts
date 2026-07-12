import { http, HttpResponse } from "msw";
import type { BackendAuthTokens, LoginRequest, RegisterRequest, User } from "@/src/lib/api/contracts/auth";

/**
 * Mocks the NestJS backend so frontend work and tests never block on the
 * live API. Matched by path suffix (`*`) so it works regardless of
 * NESTJS_API_URL's origin. One handler per contract in src/lib/api/contracts —
 * add a handler here whenever a contract is fleshed out.
 */

const mockUser: User = {
  id: "usr_mock_1",
  fullName: "أحمد محمود",
  email: "tenant@example.com",
  phone: "01000000000",
  role: "tenant",
  verificationStatus: "unverified",
  createdAt: new Date().toISOString(),
};

const mockTokens: BackendAuthTokens = {
  accessToken: "mock.access.token",
  refreshToken: "mock.refresh.token",
  user: mockUser,
};

export const handlers = [
  http.post<never, LoginRequest>("*/auth/login", async ({ request }) => {
    const body = await request.json();
    if (body.password.length < 8) {
      return HttpResponse.json({ statusCode: 401, message: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }
    return HttpResponse.json(mockTokens);
  }),

  http.post<never, RegisterRequest>("*/auth/register", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockTokens,
      user: { ...mockUser, fullName: body.fullName, email: body.email, phone: body.phone, role: body.role },
    });
  }),

  http.post("*/auth/refresh", () => HttpResponse.json(mockTokens)),

  http.get("*/auth/me", ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth) return HttpResponse.json({ statusCode: 401, message: "Not authenticated" }, { status: 401 });
    return HttpResponse.json(mockUser);
  }),
];
