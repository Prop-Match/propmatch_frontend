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

  it("requires the uniform user role on registration", () => {
    const result = RegisterRequestSchema.safeParse({
      fullName: "سارة أحمد",
      email: "sara@example.com",
      phone: "01012345678",
      password: "12345678",
      role: "user",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown account role", () => {
    const result = RegisterRequestSchema.safeParse({
      fullName: "سارة أحمد",
      email: "sara@example.com",
      phone: "01012345678",
      password: "12345678",
      role: "broker",
    });
    expect(result.success).toBe(false);
  });
});
