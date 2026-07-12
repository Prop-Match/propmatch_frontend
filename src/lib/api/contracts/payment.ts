import { z } from "zod";

/**
 * Paymob payment DTOs (SRS FR6). The client never talks to Paymob directly —
 * it asks the backend for a checkout session, then polls the entitlement
 * after the client-side success signal (see ASSUMPTIONS.md #8, webhook race).
 */

export const PaymentContextSchema = z.enum(["listing", "boost", "matchmaker-refill"]);
export type PaymentContext = z.infer<typeof PaymentContextSchema>;

export const paymentContextLabels: Record<PaymentContext, string> = {
  listing: "رسوم إضافة إعلان",
  boost: "تمييز الإعلان",
  "matchmaker-refill": "محاولات مطابقة إضافية",
};

export const CreateCheckoutRequestSchema = z.object({
  context: PaymentContextSchema,
  /** For listing/boost contexts: which property this payment activates. */
  propertyId: z.string().optional(),
});
export type CreateCheckoutRequest = z.infer<typeof CreateCheckoutRequestSchema>;

export const CheckoutSessionSchema = z.object({
  checkoutId: z.string(),
  amountEgp: z.number(),
  context: PaymentContextSchema,
});
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>;

export const PaymentStatusSchema = z.enum(["pending", "success", "failed"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentResultSchema = z.object({
  checkoutId: z.string(),
  status: PaymentStatusSchema,
  /** True once the webhook landed and the entitlement is actually active. */
  entitlementActive: z.boolean(),
});
export type PaymentResult = z.infer<typeof PaymentResultSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  context: PaymentContextSchema,
  amountEgp: z.number(),
  status: PaymentStatusSchema,
  createdAt: z.string(),
});
export type Transaction = z.infer<typeof TransactionSchema>;
