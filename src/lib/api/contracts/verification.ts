import { z } from "zod";
import { VerificationStatusSchema } from "./auth";

/**
 * Manual verification DTOs. Users keep one base role; this workflow unlocks
 * listing creation after an admin approves submitted legal/business documents.
 */

export const VerificationDocumentTypeSchema = z.enum(["license", "government_id", "proof_of_address"]);
export type VerificationDocumentType = z.infer<typeof VerificationDocumentTypeSchema>;

export const verificationDocumentLabels: Record<VerificationDocumentType, string> = {
  license: "الرخصة أو السجل التجاري",
  government_id: "بطاقة الهوية",
  proof_of_address: "إثبات العنوان",
};

export const KycStepSchema = VerificationDocumentTypeSchema;
export type KycStep = VerificationDocumentType;

export const KycUploadResponseSchema = z.object({
  step: VerificationDocumentTypeSchema,
  accepted: z.boolean(),
  /** Set when accepted=false: bad quality etc. */
  reason: z.string().nullable(),
});
export type KycUploadResponse = z.infer<typeof KycUploadResponseSchema>;

export const KycStateSchema = z.object({
  status: VerificationStatusSchema,
  completedSteps: z.array(VerificationDocumentTypeSchema),
  hasListingIntent: z.boolean(),
  canSubmit: z.boolean(),
  rejectionReason: z.string().nullable(),
  rejectedAt: z.string().datetime().nullable(),
  resubmitAfter: z.string().datetime().nullable(),
  verifiedAt: z.string().datetime().nullable(),
});
export type KycState = z.infer<typeof KycStateSchema>;
