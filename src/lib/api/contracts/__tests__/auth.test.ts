import { LoginRequestSchema, RegisterRequestSchema } from "../auth";

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
    phone: "01012345678",
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
});
