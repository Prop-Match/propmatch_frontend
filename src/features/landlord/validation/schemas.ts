import { z } from "zod";
import { CreatePropertyRequestSchema } from "@/src/lib/api/contracts/property";

/** Reuses the wire contract; the wizard validates per-step subsets of it. */
export const addPropertyFormSchema = CreatePropertyRequestSchema;
export type AddPropertyForm = z.infer<typeof addPropertyFormSchema>;

/** Field groups per wizard step, used to validate incrementally (PRO-04). */
export const stepFields = {
  location: ["governorate", "city", "district", "manualAddress"],
  type: ["propertyType", "title"],
  details: ["rentAmount", "areaM2", "bedrooms", "bathrooms", "isFurnished", "hasElevator", "hasParking"],
  description: ["description", "propertyAroundServices", "images"],
} as const;
