import { z } from "zod";
import { VerificationStatusSchema, type VerificationStatus } from "./verification";

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
  createdAt: z.string(),
  /**
   * Legacy/session convenience value from the auth user mapper. It does not
   * represent the canonical five-state verification lifecycle and must not be
   * used for protected-action verification gates. `GET /verification/me` is
   * the source of truth for verification UI and authorization gates.
   */
  verificationStatus: VerificationStatusSchema,
});
export type User = z.infer<typeof UserSchema>;

/** What the BFF returns to the browser — never the raw tokens. */
export const AuthResponseSchema = z.object({ user: UserSchema });
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/** Shape returned by the backend; consumed only inside app/api/auth/*. */
const BackendVerificationStatusSchema = z.enum(["unverified", "pending_review", "verified", "rejected"]);
const backendVerificationStatusMap: Record<z.infer<typeof BackendVerificationStatusSchema>, VerificationStatus> = {
  unverified: "NOT_SUBMITTED",
  pending_review: "PENDING",
  verified: "APPROVED",
  rejected: "REJECTED",
};

const BackendUserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: AccountRoleSchema,
  verificationStatus: BackendVerificationStatusSchema,
  createdAt: z.string(),
});

export const BackendUserResponseSchema = BackendUserSchema.transform((user): User => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phone,
  role: user.role,
  createdAt: user.createdAt,
  verificationStatus: backendVerificationStatusMap[user.verificationStatus],
}));

export const BackendMeResponseSchema = z.object({ user: BackendUserResponseSchema });

export const BackendAuthTokensSchema = z.object({
  accessToken: z.string().optional(),
  accesstoken: z.string().optional(),
  refreshToken: z.string(),
  user: BackendUserResponseSchema,
}).refine((tokens) => Boolean(tokens.accessToken ?? tokens.accesstoken), {
  message: "Backend auth response must include an access token.",
  path: ["accessToken"],
}).transform((tokens) => ({
  accessToken: tokens.accessToken ?? tokens.accesstoken!,
  refreshToken: tokens.refreshToken,
  user: tokens.user,
}));
export type BackendAuthTokens = z.infer<typeof BackendAuthTokensSchema>;
