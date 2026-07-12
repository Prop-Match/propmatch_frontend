import { z } from "zod";
import { ListingStatusSchema } from "./common";

/**
 * Property/Listing DTOs. Field set follows the UI Generation Prompt §3A(C)
 * verbatim; reconcile against the real ERD when it lands (ASSUMPTIONS.md #1).
 */

export const PropertyTypeSchema = z.enum([
  "apartment", // شقة
  "duplex", // دوبلكس
  "villa", // فيلا
  "studio", // ستوديو
  "room", // غرفة
  "shop", // محل
  "office", // مكتب
]);
export type PropertyType = z.infer<typeof PropertyTypeSchema>;

export const propertyTypeLabels: Record<PropertyType, string> = {
  apartment: "شقة",
  duplex: "دوبلكس",
  villa: "فيلا",
  studio: "ستوديو",
  room: "غرفة",
  shop: "محل",
  office: "مكتب",
};

export const AmenitySchema = z.enum([
  "ac", // تكييف
  "kitchen", // مطبخ
  "appliances", // أجهزة كهربائية
  "internet", // إنترنت
  "gas", // غاز
  "water", // مياه
  "electricity", // كهرباء
  "garage", // جراج
  "security", // أمن
  "cameras", // كاميرات
]);
export type Amenity = z.infer<typeof AmenitySchema>;

export const amenityLabels: Record<Amenity, string> = {
  ac: "تكييف",
  kitchen: "مطبخ",
  appliances: "أجهزة كهربائية",
  internet: "إنترنت",
  gas: "غاز",
  water: "مياه",
  electricity: "كهرباء",
  garage: "جراج",
  security: "أمن",
  cameras: "كاميرات",
};

export const FinishSchema = z.enum(["super-lux", "lux", "semi-finished", "unfinished"]);
export type Finish = z.infer<typeof FinishSchema>;
export const finishLabels: Record<Finish, string> = {
  "super-lux": "سوبر لوكس",
  lux: "لوكس",
  "semi-finished": "نصف تشطيب",
  unfinished: "بدون تشطيب",
};

export const OrientationSchema = z.enum(["bahari", "qibli", "sharqi", "gharbi"]);
export type Orientation = z.infer<typeof OrientationSchema>;
export const orientationLabels: Record<Orientation, string> = {
  bahari: "بحري",
  qibli: "قبلي",
  sharqi: "شرقي",
  gharbi: "غربي",
};

/** شروط المالك — landlord conditions, §3A(C). */
export const LandlordConditionsSchema = z.object({
  familiesOnly: z.boolean(), // عائلات فقط؟
  studentsAllowed: z.boolean(), // طلبة؟
  singlesAllowed: z.boolean(), // أفراد؟
  foreignersAllowed: z.boolean(), // أجانب؟
  childrenAllowed: z.boolean(), // أطفال؟
  petsAllowed: z.boolean(), // حيوانات أليفة؟
  smokingAllowed: z.boolean(), // تدخين؟
  minLeaseMonths: z.number().int().min(1), // الحد الأدنى لمدة الإيجار
});
export type LandlordConditions = z.infer<typeof LandlordConditionsSchema>;

export const PropertyLocationSchema = z.object({
  governorate: z.string().min(1), // المحافظة
  city: z.string().min(1), // المدينة
  neighborhood: z.string().min(1), // الحي
  street: z.string().optional(), // الشارع (اختياري)
  detailedAddress: z.string().min(5), // عنوان تفصيلي
});
export type PropertyLocation = z.infer<typeof PropertyLocationSchema>;

export const CreatePropertyRequestSchema = z.object({
  location: PropertyLocationSchema,
  type: PropertyTypeSchema,
  monthlyRent: z.number().positive(), // السعر الشهري
  deposit: z.number().min(0), // مبلغ التأمين
  leaseDurationMonths: z.number().int().positive(), // مدة العقد
  area: z.number().positive(), // مساحة العقار
  rooms: z.number().int().min(0), // عدد الغرف
  bathrooms: z.number().int().min(0), // عدد الحمامات
  floor: z.number().int(), // الدور
  hasElevator: z.boolean(), // هل يوجد أسانسير؟
  furnished: z.boolean(), // مفروش؟
  finish: FinishSchema, // تشطيب
  orientation: OrientationSchema, // اتجاه الشقة
  amenities: z.array(AmenitySchema), // الخدمات
  conditions: LandlordConditionsSchema, // شروط المالك
  description: z.string().min(20), // الوصف
  photos: z.array(z.string()).min(1),
});
export type CreatePropertyRequest = z.infer<typeof CreatePropertyRequestSchema>;

export const PropertySummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  neighborhood: z.string(),
  monthlyRent: z.number(),
  rooms: z.number(),
  bathrooms: z.number(),
  area: z.number(),
  furnished: z.boolean(),
  boosted: z.boolean(),
  ownerVerified: z.boolean(),
  status: ListingStatusSchema,
  coverImage: z.string().nullable(),
});
export type PropertySummary = z.infer<typeof PropertySummarySchema>;

export const PropertyDetailSchema = PropertySummarySchema.extend({
  location: PropertyLocationSchema,
  type: PropertyTypeSchema,
  deposit: z.number(),
  leaseDurationMonths: z.number(),
  floor: z.number(),
  hasElevator: z.boolean(),
  finish: FinishSchema,
  orientation: OrientationSchema,
  amenities: z.array(AmenitySchema),
  conditions: LandlordConditionsSchema,
  description: z.string(),
  photos: z.array(z.string()),
  ownerId: z.string(),
  inquiriesCount: z.number().int(),
  createdAt: z.string(),
  rejectionReason: z.string().nullable(),
});
export type PropertyDetail = z.infer<typeof PropertyDetailSchema>;

export const OptimizeDescriptionResponseSchema = z.object({
  optimized: z.string(),
  remainingUses: z.number().int(),
});
export type OptimizeDescriptionResponse = z.infer<typeof OptimizeDescriptionResponseSchema>;
