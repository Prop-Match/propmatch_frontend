import { z } from "zod";
import { PropertySummarySchema, PropertyTypeSchema } from "./property";

/**
 * Smart-matching hybrid intake (§3A(D)) + results. The open free-text field
 * (`idealDescription`) is the RAG matchmaker input — the product's signature
 * element. Quota-exhausted responses come back as 403 with a payment trigger
 * payload (SRS FR2.5) — see QuotaExhaustedPayloadSchema.
 */

export const FurnishedPreferenceSchema = z.enum(["yes", "no", "any"]); // نعم / لا / لا يهم
export const LeaseDurationPreferenceSchema = z.enum(["under-year", "year", "over-year"]); // أقل من سنة / سنة / أكثر من سنة
export const MaritalStatusSchema = z.enum(["single", "married", "family"]); // أعزب / متزوج / أسرة

export const LifestylePrioritySchema = z.enum([
  "quiet", // الهدوء
  "near-university", // قرب الجامعة
  "near-work", // قرب العمل
  "transport", // المواصلات
  "safety", // الأمان
  "services", // الخدمات
  "restaurants", // المطاعم
  "green-spaces", // المساحات الخضراء
  "gym", // الجيم
  "nightlife", // الحياة الليلية
]);
export type LifestylePriority = z.infer<typeof LifestylePrioritySchema>;

export const lifestylePriorityLabels: Record<LifestylePriority, string> = {
  quiet: "الهدوء",
  "near-university": "قرب الجامعة",
  "near-work": "قرب العمل",
  transport: "المواصلات",
  safety: "الأمان",
  services: "الخدمات",
  restaurants: "المطاعم",
  "green-spaces": "المساحات الخضراء",
  gym: "الجيم",
  nightlife: "الحياة الليلية",
};

export const LifestyleProfileSchema = z.enum([
  "student", // طالب
  "employee", // موظف
  "family", // عائلة
  "remote-worker", // عامل عن بعد
  "doctor", // طبيب
  "engineer", // مهندس
]);
export type LifestyleProfile = z.infer<typeof LifestyleProfileSchema>;

export const lifestyleProfileLabels: Record<LifestyleProfile, string> = {
  student: "طالب",
  employee: "موظف",
  family: "عائلة",
  "remote-worker": "عامل عن بعد",
  doctor: "طبيب",
  engineer: "مهندس",
};

export const MatchIntakeSchema = z.object({
  // الميزانية
  budgetMin: z.number().min(0),
  budgetMax: z.number().positive(),
  // أين ترغب بالسكن؟ (multi-select)
  neighborhoods: z.array(z.string()).min(1),
  // نوع العقار (tenant subset: شقة/غرفة/ستوديو/فيلا)
  propertyType: PropertyTypeSchema,
  roomsNeeded: z.number().int().min(0), // عدد الغرف المطلوبة
  furnished: FurnishedPreferenceSchema, // مفروش؟
  leaseDuration: LeaseDurationPreferenceSchema, // مدة الإيجار
  moveInDate: z.string(), // تاريخ الانتقال
  occupants: z.number().int().min(1), // عدد السكان
  maritalStatus: MaritalStatusSchema, // الحالة الاجتماعية
  hasChildren: z.boolean(), // يوجد أطفال؟
  hasPets: z.boolean(), // يوجد حيوانات أليفة؟
  smoker: z.boolean(), // مدخن؟
  needsParking: z.boolean(), // هل تحتاج موقف سيارات؟
  needsInternet: z.boolean(), // هل تحتاج إنترنت؟
  needsAc: z.boolean(), // هل تحتاج تكييف؟
  lifestylePriorities: z.array(LifestylePrioritySchema), // ما الذي يهمك أكثر؟
  lifestyleProfile: LifestyleProfileSchema, // كيف تصف نمط حياتك؟
  commute: z.string().optional(), // كم تستغرق رحلتك اليومية؟
  dislikes: z.string().optional(), // ما أكثر شيء تكرهه؟
  // صف العقار المثالي بالنسبة لك — the RAG field
  idealDescription: z.string().min(10),
});
export type MatchIntake = z.infer<typeof MatchIntakeSchema>;

export const MatchResultSchema = z.object({
  property: PropertySummarySchema,
  matchScore: z.number().min(0).max(100),
});
export type MatchResult = z.infer<typeof MatchResultSchema>;

export const MatchResponseSchema = z.object({
  results: z.array(MatchResultSchema),
  remainingFreeMatches: z.number().int(),
});
export type MatchResponse = z.infer<typeof MatchResponseSchema>;

/** 403 payload when the free quota is exhausted (SRS FR2.5). */
export const QuotaExhaustedPayloadSchema = z.object({
  statusCode: z.literal(403),
  message: z.string(),
  trigger: z.literal("payment"),
  product: z.enum(["matchmaker-refill"]),
  priceEgp: z.number(),
});
export type QuotaExhaustedPayload = z.infer<typeof QuotaExhaustedPayloadSchema>;

/** Gated-contact lifecycle on a match/inquiry (ASSUMPTIONS.md #6). */
export const ContactRequestStatusSchema = z.enum(["none", "requested", "accepted"]);
export type ContactRequestStatus = z.infer<typeof ContactRequestStatusSchema>;

export const RevealedContactSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
});
export type RevealedContact = z.infer<typeof RevealedContactSchema>;

export const ContactStateResponseSchema = z.object({
  status: ContactRequestStatusSchema,
  /** Present only when status === "accepted" — the PII gate. */
  contact: RevealedContactSchema.nullable(),
});
export type ContactStateResponse = z.infer<typeof ContactStateResponseSchema>;
