import { z } from "zod";
import { CapabilitySchema } from "./common";

/**
 * Admin review queues + RBAC session shape. Queue items are shared between
 * the polling "live" dashboard and the review detail pages.
 */

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

export const KycReviewDetailSchema = z.object({
  userId: z.string(),
  extractedName: z.string(),
  nationalIdLast4: z.string(),
  matchConfidence: z.number(),
  submittedAt: z.string(),
});
export type KycReviewDetail = z.infer<typeof KycReviewDetailSchema>;
