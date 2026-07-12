import { z } from "zod";

/**
 * Auth contracts. Field names/shapes are assumptions pending the real ERD —
 * see ASSUMPTIONS.md, "Auth & account model".
 */

/** "admin" is never offered at signup — admin accounts are created internally. */
export const AccountRoleSchema = z.enum(["tenant", "landlord", "both", "admin"]);
export type AccountRole = z.infer<typeof AccountRoleSchema>;

/** The three roles a user may pick at signup (مستأجر / مالك / الاثنين). */
export const SignupRoleSchema = z.enum(["tenant", "landlord", "both"]);
export type SignupRole = z.infer<typeof SignupRoleSchema>;

export const RegisterRequestSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8),
  role: SignupRoleSchema,
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const VerificationStatusSchema = z.enum(["unverified", "pending", "verified", "locked"]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const UserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: AccountRoleSchema,
  verificationStatus: VerificationStatusSchema,
  createdAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

/** What the BFF route handler returns to the browser — never the raw tokens. */
export const AuthResponseSchema = z.object({
  user: UserSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/** Internal shape returned by the real NestJS backend; consumed only inside app/api/auth/*. */
export const BackendAuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});
export type BackendAuthTokens = z.infer<typeof BackendAuthTokensSchema>;
