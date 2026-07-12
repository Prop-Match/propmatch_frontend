import { z } from "zod";
import { MatchIntakeSchema } from "@/src/lib/api/contracts/match";

/**
 * Form schema mirrors the contract but with Arabic validation messages and a
 * cross-field budget check. Kept separate so the wire DTO stays message-free.
 */
export const matchIntakeFormSchema = MatchIntakeSchema.extend({
  budgetMin: z.number({ message: "أدخل أقل ميزانية" }).min(0),
  budgetMax: z.number({ message: "أدخل أعلى ميزانية" }).positive(),
  neighborhoods: z.array(z.string()).min(1, "اختر منطقة واحدة على الأقل"),
  idealDescription: z.string().min(10, "اكتب وصفًا لا يقل عن ١٠ أحرف"),
}).refine((v) => v.budgetMax >= v.budgetMin, {
  message: "أعلى ميزانية يجب أن تكون أكبر من أقلها",
  path: ["budgetMax"],
});

export type MatchIntakeForm = z.infer<typeof matchIntakeFormSchema>;

export const MANSOURA_NEIGHBORHOODS = ["توريل", "حي الجامعة", "المشاية", "جديلة", "قولنجيل", "وسط البلد", "الجمهورية"];
