import { z } from "zod";
import { CapabilitySchema } from "./common";

/**
 * Admin moderation surface (PRO-07/08). V1 has a single flat ADMIN role — the
 * ERD has no admin-role entity and the backlog no admin-management ticket, so
 * the previous build's 7 sub-roles were removed (docs/analysis/conflicts.md
 * B2). Capabilities are still modelled so scoped admins (or the Later BROKER)
 * can be introduced without reworking call sites.
 */

/** Every capability a V1 ADMIN holds. */
export const ADMIN_CAPABILITIES = [
  "property:approve",
  "property:reject",
  "kyc:review",
  "request:approve",
  "request:reject",
  "review:moderate",
  "payment:view",
  "partner_lead:view",
] as const;

export const AdminSessionSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  capabilities: z.array(CapabilitySchema),
});
export type AdminSession = z.infer<typeof AdminSessionSchema>;

/**
 * The four moderation queues (PRO-08): eKYC, properties, tenant requests and
 * property reviews. All share PENDING → APPROVED/REJECTED.
 */
export const QueueItemTypeSchema = z.enum(["kyc", "property", "request", "review"]);
export type QueueItemType = z.infer<typeof QueueItemTypeSchema>;

export const QueueItemSchema = z.object({
  id: z.string(),
  type: QueueItemTypeSchema,
  /** The moderated entity's id (user / property / tenant_request / review). */
  subjectId: z.string(),
  title: z.string(),
  subtitle: z.string(),
  submittedAt: z.string(),
});
export type QueueItem = z.infer<typeof QueueItemSchema>;

export const AdminQueuesResponseSchema = z.object({
  kycQueue: z.array(QueueItemSchema),
  propertyQueue: z.array(QueueItemSchema),
  requestQueue: z.array(QueueItemSchema),
  reviewQueue: z.array(QueueItemSchema),
});
export type AdminQueuesResponse = z.infer<typeof AdminQueuesResponseSchema>;

/** Rejection requires a reason (stored on the entity for the user to correct). */
export const ReviewDecisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});
export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;

/**
 * eKYC review detail. Per ERD, the reviewer sees the extracted national_id and
 * the three document URLs. `nationalId` is masked to the last 4 everywhere
 * except this screen (requirements.md §3).
 */
export const KycReviewDetailSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  nationalId: z.string(),
  nationalIdFrontUrl: z.string(),
  nationalIdBackUrl: z.string(),
  selfieUrl: z.string(),
  submittedAt: z.string(),
});
export type KycReviewDetail = z.infer<typeof KycReviewDetailSchema>;

/**
 * Admin records views (build prompt §8.13): Payment Records + Partner Lead
 * Records with Recharts stats. Sourced from PAYMENT_TRANSACTION /
 * PARTNER_LEAD — not a separate ERD entity.
 */
export const AdminStatsSchema = z.object({
  summary: z.object({
    totalRevenue: z.number(),
    totalTransactions: z.number(),
    activeListings: z.number(),
    pendingModeration: z.number(),
  }),
  monthlyRevenue: z.array(z.object({ month: z.string(), revenue: z.number(), transactions: z.number() })),
  moderationDistribution: z.array(z.object({ label: z.string(), value: z.number() })),
});
export type AdminStats = z.infer<typeof AdminStatsSchema>;
