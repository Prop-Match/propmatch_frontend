import { z } from "zod";

/**
 * Contract generator (SRS FR5) — strictly form-to-PDF. National IDs are
 * entered/pre-filled here and appear only inside the generated document,
 * never re-displayed elsewhere (NFR3.2).
 */

export const ContractFormSchema = z.object({
  landlordName: z.string().min(2), // اسم المالك
  tenantName: z.string().min(2), // اسم المستأجر
  landlordNationalId: z.string().regex(/^\d{14}$/, "الرقم القومي 14 رقمًا"),
  tenantNationalId: z.string().regex(/^\d{14}$/, "الرقم القومي 14 رقمًا"),
  monthlyRent: z.number().positive(), // الإيجار الشهري ج.م
  startDate: z.string().min(1), // تاريخ البداية
  endDate: z.string().min(1), // تاريخ النهاية
  fullAddress: z.string().min(5), // العنوان الكامل (نص حر)
  additionalClauses: z.string().optional(), // بنود إضافية متفق عليها
});
export type ContractForm = z.infer<typeof ContractFormSchema>;
