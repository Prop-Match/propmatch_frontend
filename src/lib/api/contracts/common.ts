import { z } from "zod";

/**
 * Shapes shared across contracts. Mirrors NestJS defaults: the built-in
 * exception filter shape for errors, class-validator's array-of-strings
 * message shape for 400s, and a conventional offset-based pagination envelope.
 *
 * These are assumptions until the real NestJS OpenAPI spec lands — see
 * ASSUMPTIONS.md.
 */

export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const PaginationQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
  });

/** Capability-based permission strings — see docs/analysis/rbac.md for the full matrix. */
export const CapabilitySchema = z.enum([
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
]);
export type Capability = z.infer<typeof CapabilitySchema>;

export const ListingStatusSchema = z.enum(["draft", "pending", "approved", "rejected"]);
export type ListingStatus = z.infer<typeof ListingStatusSchema>;
