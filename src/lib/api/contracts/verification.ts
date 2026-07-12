import { z } from "zod";
import { VerificationStatusSchema } from "./auth";

/**
 * eKYC wizard DTOs (SRS FR1). Raw images never persist past processing
 * (FR1.5); the client only ever sees extracted name + masked ID.
 */

export const KycStepSchema = z.enum(["id-front", "id-back", "selfie"]);
export type KycStep = z.infer<typeof KycStepSchema>;

export const KycUploadResponseSchema = z.object({
  step: KycStepSchema,
  accepted: z.boolean(),
  /** Set when accepted=false: bad quality etc. */
  reason: z.string().nullable(),
});
export type KycUploadResponse = z.infer<typeof KycUploadResponseSchema>;

export const KycStateSchema = z.object({
  status: VerificationStatusSchema,
  completedSteps: z.array(KycStepSchema),
  attemptsUsed: z.number().int().min(0),
  maxAttempts: z.number().int(),
  /** Present once verified. */
  extractedName: z.string().nullable(),
  nationalIdLast4: z.string().nullable(),
  /** Selfie/ID match confidence 0-100, present once processed. */
  matchConfidence: z.number().nullable(),
});
export type KycState = z.infer<typeof KycStateSchema>;
