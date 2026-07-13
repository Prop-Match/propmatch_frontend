import { z } from "zod";
import { CapabilitySchema, type Capability } from "./common";

/**
 * Admin review queues + RBAC session shape. Queue items are shared between
 * the polling "live" dashboard and the review detail pages.
 */

/**
 * Named roles → capability sets. Roles are just bundles of capabilities; the
 * UI and backend check capabilities, never role names (see
 * docs/analysis/rbac.md). Single source of truth for both the mock backend
 * and the admin-management UI.
 */
export const AdminRoleSchema = z.enum([
  "super-admin",
  "listings-manager",
  "kyc-reviewer",
  "finance-admin",
  "reviews-manager",
  "customer-support",
  "read-only",
]);
export type AdminRole = z.infer<typeof AdminRoleSchema>;

export const adminRoleLabels: Record<AdminRole, string> = {
  "super-admin": "مشرف عام",
  "listings-manager": "مدير العقارات",
  "kyc-reviewer": "مراجع التوثيق",
  "finance-admin": "مدير مالي",
  "reviews-manager": "مدير التقييمات",
  "customer-support": "دعم العملاء",
  "read-only": "اطّلاع فقط",
};

export const ROLE_CAPABILITIES: Record<AdminRole, Capability[]> = {
  "super-admin": [
    "listing:approve",
    "listing:reject",
    "kyc:review",
    "payment:refund",
    "report:export",
    "review:delete",
    "ticket:reply",
    "pii:reveal",
    "admin:create",
    "admin:manage",
  ],
  "listings-manager": ["listing:approve", "listing:reject"],
  "kyc-reviewer": ["kyc:review"],
  "finance-admin": ["payment:refund", "report:export"],
  "reviews-manager": ["review:delete"],
  "customer-support": ["ticket:reply", "pii:reveal"],
  "read-only": [],
};

export const AdminSessionSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  roleName: z.string(),
  capabilities: z.array(CapabilitySchema),
});
export type AdminSession = z.infer<typeof AdminSessionSchema>;

export const QueueItemTypeSchema = z.enum(["property", "kyc"]);
export type QueueItemType = z.infer<typeof QueueItemTypeSchema>;

export const QueueItemSchema = z.object({
  id: z.string(),
  type: QueueItemTypeSchema,
  /** property id or user id, per type. */
  subjectId: z.string(),
  title: z.string(),
  subtitle: z.string(),
  submittedAt: z.string(),
});
export type QueueItem = z.infer<typeof QueueItemSchema>;

export const AdminQueuesResponseSchema = z.object({
  propertyQueue: z.array(QueueItemSchema),
  kycQueue: z.array(QueueItemSchema),
});
export type AdminQueuesResponse = z.infer<typeof AdminQueuesResponseSchema>;

export const ReviewDecisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});
export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;

export const AdminStatsSchema = z.object({
  summary: z.object({
    totalRevenue: z.number(),
    totalTransactions: z.number(),
    activeListings: z.number(),
    pendingReviews: z.number(),
  }),
  monthlyRevenue: z.array(z.object({ month: z.string(), revenue: z.number(), transactions: z.number() })),
  reviewDistribution: z.array(z.object({ label: z.string(), value: z.number() })),
});
export type AdminStats = z.infer<typeof AdminStatsSchema>;

export const KycReviewDetailSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  documents: z.array(z.object({ type: z.string(), label: z.string(), uploadedAt: z.string() })),
  submittedAt: z.string(),
});
export type KycReviewDetail = z.infer<typeof KycReviewDetailSchema>;

/* ------------------------- admin & RBAC management ------------------------ */

export const AdminTeamMemberSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  role: AdminRoleSchema,
  capabilities: z.array(CapabilitySchema),
  disabled: z.boolean(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
});
export type AdminTeamMember = z.infer<typeof AdminTeamMemberSchema>;

export const CreateAdminRequestSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  role: AdminRoleSchema,
});
export type CreateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;

export const UpdateAdminRequestSchema = z.object({
  role: AdminRoleSchema.optional(),
  disabled: z.boolean().optional(),
});
export type UpdateAdminRequest = z.infer<typeof UpdateAdminRequestSchema>;

export const AuditLogEntrySchema = z.object({
  id: z.string(),
  actorName: z.string(),
  action: z.string(),
  subjectId: z.string(),
  at: z.string(),
});
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

export const LoginHistoryEntrySchema = z.object({
  id: z.string(),
  adminName: z.string(),
  ip: z.string(),
  at: z.string(),
  success: z.boolean(),
});
export type LoginHistoryEntry = z.infer<typeof LoginHistoryEntrySchema>;
