import { resetDb, db } from "../db";

/**
 * End-to-end verification lifecycle against the shared mock router, mirroring
 * the RBAC spec: uniform base role, listing-intent gate, one-time verification,
 * rejection cooldown, and the coded error contract.
 */

const BASE = "http://backend.test";

function tokenFor(userId: string): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const payload = b64({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 });
  return `${b64({ alg: "none", typ: "JWT" })}.${payload}.mock`;
}
async function call(method: string, path: string, userId: string, body?: unknown) {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { authorization: `Bearer ${tokenFor(userId)}`, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

const draftBody = {
  location: { governorate: "الدقهلية", city: "المنصورة", neighborhood: "توريل", detailedAddress: "توريل، المنصورة" },
  type: "apartment",
  monthlyRent: 4000,
  deposit: 8000,
  leaseDurationMonths: 12,
  area: 100,
  rooms: 2,
  bathrooms: 1,
  floor: 2,
  hasElevator: true,
  furnished: false,
  finish: "lux",
  orientation: "bahari",
  amenities: [],
  conditions: {},
  description: "شقة للإيجار في موقع جيد قريب من الخدمات.",
  photos: ["https://example.com/p.jpg"],
};

async function uploadAllDocs(userId: string) {
  for (const step of ["license", "government_id", "proof_of_address"]) {
    await call("POST", "kyc/upload", userId, { step });
  }
}

/** Register a fresh unverified base "user" and return its id. */
async function freshUser(email: string): Promise<string> {
  const res = await call("POST", "auth/register", "", {
    fullName: "مستخدم جديد",
    email,
    phone: "01099999999",
    password: "password123",
    role: "user",
  });
  return res.body.user.id as string;
}

beforeEach(() => resetDb());

describe("verification lifecycle", () => {
  it("blocks submission without a listing draft (LISTING_INTENT_REQUIRED)", async () => {
    const uid = await freshUser("v1@example.com");
    await uploadAllDocs(uid);
    const submit = await call("POST", "kyc/submit", uid, {});
    expect(submit.status).toBe(403);
    expect(submit.body.code).toBe("LISTING_INTENT_REQUIRED");
  });

  it("creates a draft (not published) for an unverified user and flags verification", async () => {
    const uid = await freshUser("v2@example.com");
    const created = await call("POST", "landlord/properties", uid, draftBody);
    expect(created.status).toBe(200);
    expect(created.body.requiresVerification).toBe(true);
    expect(created.body.property.status).toBe("draft");
    // Draft must not appear in the public (approved-only) browse feed.
    const browse = await call("GET", "properties", uid);
    expect(browse.body.items.some((p: { id: string }) => p.id === created.body.property.id)).toBe(false);
  });

  it("runs submit → pending → reject(cooldown) → resubmit-blocked → approve → unlimited listings", async () => {
    const uid = await freshUser("v3@example.com");
    await call("POST", "landlord/properties", uid, draftBody);
    await uploadAllDocs(uid);

    // Submit → pending_review.
    const submit = await call("POST", "kyc/submit", uid, {});
    expect(submit.status).toBe(200);
    expect(db.users.find((u) => u.id === uid)!.verificationStatus).toBe("pending_review");

    // Duplicate submit while pending → 409.
    const dup = await call("POST", "kyc/submit", uid, {});
    expect(dup.status).toBe(409);
    expect(dup.body.code).toBe("VERIFICATION_ALREADY_PENDING");

    // Admin reject without reason → 400; with reason → rejected + cooldown.
    const noReason = await call("POST", `admin/kyc/${uid}/review`, "usr_admin", { decision: "reject" });
    expect(noReason.status).toBe(400);
    const rejected = await call("POST", `admin/kyc/${uid}/review`, "usr_admin", { decision: "reject", reason: "المستند غير واضح" });
    expect(rejected.status).toBe(200);
    const afterReject = db.users.find((u) => u.id === uid)!;
    expect(afterReject.verificationStatus).toBe("rejected");
    expect(afterReject.verificationResubmitAfter).toBeTruthy();

    // Resubmit during cooldown → 429.
    await uploadAllDocs(uid);
    const cooldown = await call("POST", "kyc/submit", uid, {});
    expect(cooldown.status).toBe(429);
    expect(cooldown.body.code).toBe("VERIFICATION_COOLDOWN_ACTIVE");

    // Simulate cooldown expiry, resubmit → pending → approve → verified.
    afterReject.verificationResubmitAfter = new Date(Date.now() - 1000).toISOString();
    await uploadAllDocs(uid);
    const resubmit = await call("POST", "kyc/submit", uid, {});
    expect(resubmit.status).toBe(200);
    const approve = await call("POST", `admin/kyc/${uid}/review`, "usr_admin", { decision: "approve" });
    expect(approve.status).toBe(200);
    expect(db.users.find((u) => u.id === uid)!.verificationStatus).toBe("verified");

    // Verified → new listings go straight to review (no re-verification).
    const second = await call("POST", "landlord/properties", uid, draftBody);
    expect(second.body.requiresVerification).toBe(false);
    expect(["pending", "draft"]).toContain(second.body.property.status);

    // Already verified → submit rejected with ALREADY_VERIFIED.
    const already = await call("POST", "kyc/submit", uid, {});
    expect(already.status).toBe(409);
    expect(already.body.code).toBe("ALREADY_VERIFIED");
  });

  it("keeps the one-time rule: verifying never reverts on further listing activity", async () => {
    const uid = await freshUser("v4@example.com");
    await call("POST", "landlord/properties", uid, draftBody);
    await uploadAllDocs(uid);
    await call("POST", "kyc/submit", uid, {});
    await call("POST", `admin/kyc/${uid}/review`, "usr_admin", { decision: "approve" });
    await call("POST", "landlord/properties", uid, draftBody);
    await call("POST", "landlord/properties", uid, draftBody);
    expect(db.users.find((u) => u.id === uid)!.verificationStatus).toBe("verified");
  });
});
