import { resetDb, db } from "../db";

// Exercises the two new modules against the shared mock router (same code the
// app talks to): AI-first support with human escalation, and RBAC gating for
// admin management.

const BASE = "http://backend.test";

function tokenFor(userId: string): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const payload = b64({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 });
  return `${b64({ alg: "none", typ: "JWT" })}.${payload}.mock`;
}
function req(method: string, path: string, userId: string, body?: unknown) {
  return fetch(`${BASE}/${path}`, {
    method,
    headers: { authorization: `Bearer ${tokenFor(userId)}`, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => resetDb());

describe("AI-first support + escalation", () => {
  it("answers with the AI first, then escalates and lets an admin join", async () => {
    // Fresh tenant sends a message → AI replies.
    const t1 = await (await req("POST", "support/message", "usr_tenant", { message: "كيف أوثّق هويتي؟" })).json();
    expect(t1.escalated).toBe(false);
    expect(t1.messages.some((m: { author: string }) => m.author === "ai")).toBe(true);

    // Request a human.
    const t2 = await (await req("POST", "support/escalate", "usr_tenant", {})).json();
    expect(t2.escalated).toBe(true);

    // The ticket now appears in the admin support queue.
    const queue = await (await req("GET", "admin/tickets", "usr_admin")).json();
    const ticket = queue.items.find((x: { userName: string }) => x.userName === "أحمد محمود");
    expect(ticket).toBeTruthy();

    // Admin replies → user sees it; internal note stays hidden.
    await req("POST", `admin/tickets/${ticket.id}/reply`, "usr_admin", { content: "أهلًا، سأساعدك.", internal: false });
    await req("POST", `admin/tickets/${ticket.id}/reply`, "usr_admin", { content: "ملاحظة داخلية", internal: true });

    const thread = await (await req("GET", "support/thread", "usr_tenant")).json();
    expect(thread.messages.some((m: { content: string }) => m.content === "أهلًا، سأساعدك.")).toBe(true);
    expect(thread.messages.some((m: { content: string }) => m.content === "ملاحظة داخلية")).toBe(false);
  });
});

describe("RBAC gating for admin management", () => {
  it("lets a super-admin list and create admins", async () => {
    const list = await req("GET", "admin/team", "usr_admin");
    expect(list.status).toBe(200);
    const created = await req("POST", "admin/team", "usr_admin", {
      fullName: "عضو جديد",
      email: "new-admin@example.com",
      role: "kyc-reviewer",
    });
    expect(created.status).toBe(200);
    const body = await created.json();
    expect(body.capabilities).toContain("kyc:review");
  });

  it("blocks a read-only admin from managing the team", async () => {
    // usr_admin4 is seeded with the read-only role (no capabilities).
    const list = await req("GET", "admin/team", "usr_admin4");
    expect(list.status).toBe(403);
    const create = await req("POST", "admin/team", "usr_admin4", {
      fullName: "x",
      email: "x@example.com",
      role: "read-only",
    });
    expect(create.status).toBe(403);
  });

  it("blocks a customer-support admin from reviewing listings but allows tickets", async () => {
    // usr_admin2 = customer-support (ticket:reply, pii:reveal only).
    const review = await req("POST", "admin/properties/prop_5/review", "usr_admin2", { decision: "approve" });
    expect(review.status).toBe(403);
    const tickets = await req("GET", "admin/tickets", "usr_admin2");
    expect(tickets.status).toBe(200);
  });

  it("disabling an admin revokes their access", async () => {
    const admin2 = db.users.find((u) => u.id === "usr_admin2")!;
    await req("PATCH", `admin/team/${admin2.id}`, "usr_admin", { disabled: true });
    const tickets = await req("GET", "admin/tickets", "usr_admin2");
    expect(tickets.status).toBe(403);
  });
});
