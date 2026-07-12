import { matchIntakeFormSchema } from "../schemas";

const base = {
  budgetMin: 2000,
  budgetMax: 6000,
  neighborhoods: ["توريل"],
  propertyType: "apartment",
  roomsNeeded: 2,
  furnished: "any",
  leaseDuration: "year",
  moveInDate: "2026-08-01",
  occupants: 1,
  maritalStatus: "single",
  hasChildren: false,
  hasPets: false,
  smoker: false,
  needsParking: false,
  needsInternet: true,
  needsAc: true,
  lifestylePriorities: [],
  lifestyleProfile: "employee",
  idealDescription: "شقة هادئة قريبة من الجامعة ومناسبة لشخصين",
};

describe("matchIntakeFormSchema", () => {
  it("accepts a valid intake", () => {
    expect(matchIntakeFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects when max budget is below min", () => {
    const result = matchIntakeFormSchema.safeParse({ ...base, budgetMin: 8000, budgetMax: 3000 });
    expect(result.success).toBe(false);
  });

  it("requires at least one neighborhood", () => {
    const result = matchIntakeFormSchema.safeParse({ ...base, neighborhoods: [] });
    expect(result.success).toBe(false);
  });

  it("requires a meaningful RAG description", () => {
    const result = matchIntakeFormSchema.safeParse({ ...base, idealDescription: "قصير" });
    expect(result.success).toBe(false);
  });
});
