import { z } from "zod";
import { VerificationStatusSchema } from "./verification";

/**
 * Mirrors the Final ERD's `USER` entity. ERD fields are snake_case; the API
 * boundary is assumed to map them to camelCase (ASSUMPTIONS.md #2).
 * `password_hash` never crosses the wire.
 */

/**
 * ERD: `USER.role ENUM "TENANT, LANDLORD, ADMIN"` — one role per account.
 * Someone who is both an owner and a tenant creates two separate accounts,
 * each with its own eKYC (docs/analysis/conflicts.md A1). `BROKER` is a Later
 * role (A2): add it here, never by hardcoding role names in UI/logic.
 */
export const AccountRoleSchema = z.enum(["tenant", "landlord", "admin"]);
export type AccountRole = z.infer<typeof AccountRoleSchema>;

/** Public signup is explicitly Tenant OR Landlord (PRO-02). Admins are seeded. */
export const SignupRoleSchema = z.enum(["tenant", "landlord"]);
export type SignupRole = z.infer<typeof SignupRoleSchema>;

export const RegisterRequestSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(8),
  password: z.string().min(8),
  role: SignupRoleSchema,
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const UserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  role: AccountRoleSchema,
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  /**
   * Derived convenience field joined from `IDENTITY_VERIFICATION` so every
   * surface can apply the progressive-verification gates (SRS 3.1/3.4)
   * without a second request. `NOT_SUBMITTED` = no verification row exists.
   */
  verificationStatus: VerificationStatusSchema,
});
export type User = z.infer<typeof UserSchema>;

/** What the BFF returns to the browser — never the raw tokens. */
export const AuthResponseSchema = z.object({ user: UserSchema });
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/** Shape returned by the backend; consumed only inside app/api/auth/*. */
export const BackendAuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});
export type BackendAuthTokens = z.infer<typeof BackendAuthTokensSchema>;
