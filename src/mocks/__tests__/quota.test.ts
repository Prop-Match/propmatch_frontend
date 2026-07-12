import { resetDb, db } from "../db";

// The global jest.setup.ts starts/stops/reset the MSW server; we only reset
// the in-memory DB between tests here.

/**
 * Quota enforcement + PII-gating are safety-critical, so we test them against
 * the mock backend directly (the same handlers the app talks to).
 */

const BASE = "http://backend.test";

/** JWT-shaped token matching db.ts's findUserByToken (payload.sub). */
function tokenFor(userId: string): string {
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const payload = b64({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 });
  return `${b64({ alg: "none", typ: "JWT" })}.${payload}.mock`;
}

function authGet(path: string, userId = "usr_tenant") {
  return fetch(`${BASE}/${path}`, { headers: { authorization: `Bearer ${tokenFor(userId)}` } });
}
function authPost(path: string, body: unknown, userId = "usr_tenant") {
  return fetch(`${BASE}/${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${tokenFor(userId)}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const intake = {
  budgetMin: 2000,
  budgetMax: 8000,
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
  idealDescription: "شقة هادئة قريبة من الجامعة",
};

beforeEach(() => resetDb());

describe("match quota", () => {
  it("returns results while quota remains, then 403 with a payment trigger", async () => {
    // 3 free matches (seed default).
    for (let i = 0; i < 3; i++) {
      const res = await authPost("match", intake);
      expect(res.status).toBe(200);
    }
    const exhausted = await authPost("match", intake);
    expect(exhausted.status).toBe(403);
    const body = await exhausted.json();
    expect(body.trigger).toBe("payment");
    expect(body.product).toBe("matchmaker-refill");
  });

  it("decrements the remaining counter", async () => {
    const before = await (await authGet("match/quota")).json();
    await authPost("match", intake);
    const after = await (await authGet("match/quota")).json();
    expect(after.remaining).toBe(before.remaining - 1);
  });
});

describe("PII gating on contact", () => {
  it("hides owner contact until the landlord accepts", async () => {
    // Fresh request from a tenant with no prior inquiry.
    resetDb();
    const state1 = await (await authGet("properties/prop_2/contact")).json();
    expect(state1.status).toBe("none");
    expect(state1.contact).toBeNull();

    await authPost("properties/prop_2/contact", {});
    const state2 = await (await authGet("properties/prop_2/contact")).json();
    expect(state2.status).toBe("requested");
    expect(state2.contact).toBeNull(); // still gated

    // Landlord accepts.
    const inquiry = db.inquiries.find((i) => i.propertyId === "prop_2" && i.tenantId === "usr_tenant");
    await authPost(`landlord/inquiries/${inquiry!.id}/accept`, {}, "usr_landlord");

    const state3 = await (await authGet("properties/prop_2/contact")).json();
    expect(state3.status).toBe("accepted");
    expect(state3.contact).not.toBeNull();
    expect(state3.contact.phone).toBeTruthy();
  });
});

describe("listing approval visibility", () => {
  it("keeps pending listings out of the tenant browse feed", async () => {
    const res = await fetch(`${BASE}/properties`);
    const body = await res.json();
    const ids = body.items.map((p: { id: string }) => p.id);
    expect(ids).toContain("prop_1"); // approved
    expect(ids).not.toContain("prop_5"); // pending
  });

  it("makes a listing visible only after admin approval", async () => {
    await authPost("admin/properties/prop_5/review", { decision: "approve" }, "usr_admin");
    const body = await (await fetch(`${BASE}/properties`)).json();
    expect(body.items.map((p: { id: string }) => p.id)).toContain("prop_5");
  });

  it("returns 409 when approving an already-reviewed listing", async () => {
    await authPost("admin/properties/prop_5/review", { decision: "approve" }, "usr_admin");
    const second = await authPost("admin/properties/prop_5/review", { decision: "reject" }, "usr_admin");
    expect(second.status).toBe(409);
  });
});
