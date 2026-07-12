import { z } from "zod";
import { CreatePropertyRequestSchema } from "@/src/lib/api/contracts/property";

/** Reuses the wire contract; the wizard validates per-step subsets of it. */
export const addPropertyFormSchema = CreatePropertyRequestSchema;
export type AddPropertyForm = z.infer<typeof addPropertyFormSchema>;

/** Field groups per wizard step, used to validate incrementally. */
export const stepFields = {
  location: ["location"],
  type: ["type"],
  details: [
    "monthlyRent",
    "deposit",
    "leaseDurationMonths",
    "area",
    "rooms",
    "bathrooms",
    "floor",
    "hasElevator",
    "furnished",
    "finish",
    "orientation",
  ],
  amenities: ["amenities"],
  conditions: ["conditions"],
  description: ["description", "photos"],
} as const;
