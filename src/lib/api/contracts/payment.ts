import { z } from "zod";

/**
 * Mirrors the ERD's `PAYMENT_TRANSACTION` + `USER_QUOTA` (PRO-14/18).
 *
 * The client never talks to Paymob directly: it asks the backend for a
 * checkout, renders the Paymob iframe, and the **webhook** (HMAC-validated,
 * idempotent — backend duty) credits the quota. A client-side "success" means
 * *captured*, not *credited* — poll the quota afterwards (ASSUMPTIONS.md #17).
 */

/** ERD: `payment_type ENUM "NEW_LISTING, BOOST_LISTING, REFILL_MATCHES, OFFER_PACK"`. */
export const PaymentTypeSchema = z.enum([
  "NEW_LISTING",
  "BOOST_LISTING",
  "REFILL_MATCHES",
  "OFFER_PACK",
]);
export type PaymentType = z.infer<typeof PaymentTypeSchema>;

export const paymentTypeLabels: Record<PaymentType, string> = {
  NEW_LISTING: "رسوم إضافة إعلان",
  BOOST_LISTING: "تمييز الإعلان",
  REFILL_MATCHES: "محاولات مطابقة إضافية",
  OFFER_PACK: "باقة عروض إضافية",
};

/** ERD: `status ENUM "PENDING, SUCCESS, FAILED"`. */
export const PaymentStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const CreateCheckoutRequestSchema = z.object({
  paymentType: PaymentTypeSchema,
  /** For NEW_LISTING / BOOST_LISTING: the property the payment activates. */
  propertyId: z.string().optional(),
});
export type CreateCheckoutRequest = z.infer<typeof CreateCheckoutRequestSchema>;

export const CheckoutSessionSchema = z.object({
  paymobOrderId: z.string(),
  amount: z.number(),
  currency: z.literal("EGP"),
  paymentType: PaymentTypeSchema,
  /** Paymob iframe URL the client renders. */
  iframeUrl: z.string().nullable(),
});
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>;

export const PaymentTransactionSchema = z.object({
  id: z.string(),
  paymobOrderId: z.string(),
  paymobTransactionId: z.string().nullable(),
  amount: z.number(),
  currency: z.literal("EGP"),
  paymentType: PaymentTypeSchema,
  status: PaymentStatusSchema,
  paidAt: z.string().nullable(),
  createdAt: z.string(),
});
export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;

/**
 * ERD: `USER_QUOTA` — **landlords only** (1:1). Tenants have no row, so the UI
 * must tolerate its absence (requirements.md §6).
 */
export const UserQuotaSchema = z.object({
  freeListingsLeft: z.number().int(),
  optimizerUsesLeft: z.number().int(),
  freeOffersLeft: z.number().int(),
  lastResetDate: z.string().nullable(),
});
export type UserQuota = z.infer<typeof UserQuotaSchema>;

/** Which quota a paywall is about — maps 1:1 to the payment that refills it. */
export const QuotaFieldSchema = z.enum(["freeListingsLeft", "optimizerUsesLeft", "freeOffersLeft"]);
export type QuotaField = z.infer<typeof QuotaFieldSchema>;

export const quotaRefillPaymentType: Record<QuotaField, PaymentType> = {
  freeListingsLeft: "NEW_LISTING",
  optimizerUsesLeft: "REFILL_MATCHES",
  freeOffersLeft: "OFFER_PACK",
};
