import { z } from "zod";

/**
 * Mirrors the ERD's `PARTNER_LEAD` (PRO-16 / SRS 3.2.2). After a tenant
 * accepts an offer, they're prompted to opt in to B2B partner services; the
 * lead is routed to the partner API by the backend.
 *
 * Opt-in is explicit — never pre-checked, never routed without consent.
 */

/** ERD: `service_type ENUM "MOVING, INSURANCE"`. */
export const PartnerServiceTypeSchema = z.enum(["MOVING", "INSURANCE"]);
export type PartnerServiceType = z.infer<typeof PartnerServiceTypeSchema>;

export const partnerServiceLabels: Record<PartnerServiceType, string> = {
  MOVING: "شركة نقل عفش",
  INSURANCE: "تأمين على المحتويات",
};

/** ERD: `status ENUM "PENDING, SENT, CONVERTED"`. */
export const PartnerLeadStatusSchema = z.enum(["PENDING", "SENT", "CONVERTED"]);
export type PartnerLeadStatus = z.infer<typeof PartnerLeadStatusSchema>;

export const CreatePartnerLeadRequestSchema = z.object({
  serviceTypes: z.array(PartnerServiceTypeSchema).min(1, "اختر خدمة واحدة على الأقل"),
});
export type CreatePartnerLeadRequest = z.infer<typeof CreatePartnerLeadRequestSchema>;

export const PartnerLeadSchema = z.object({
  id: z.string(),
  serviceType: PartnerServiceTypeSchema,
  partnerName: z.string().nullable(),
  status: PartnerLeadStatusSchema,
  createdAt: z.string(),
});
export type PartnerLead = z.infer<typeof PartnerLeadSchema>;
