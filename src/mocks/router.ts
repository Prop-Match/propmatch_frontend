import type { LoginRequest, RegisterRequest } from "@/src/lib/api/contracts/auth";
import type { MatchIntake, ContactStateResponse } from "@/src/lib/api/contracts/match";
import type { CreatePropertyRequest } from "@/src/lib/api/contracts/property";
import type { CreateCheckoutRequest } from "@/src/lib/api/contracts/payment";
import type { ReviewDecision } from "@/src/lib/api/contracts/admin";
import type { ChatRequest } from "@/src/lib/api/contracts/support";
import type { PropertyDetail, PropertySummary } from "@/src/lib/api/contracts/property";
import { db, findUserByToken, nextId, tokensFor, toPublicUser, type MockUser } from "./db";

/**
 * Framework-agnostic mock backend. Given a method/path/body/auth, returns a
 * status + JSON body. Shared by the standalone dev server (src/mocks/standalone)
 * and the Jest MSW passthrough handler (src/mocks/handlers), so there is a
 * single source of truth for mock behaviour and no reliance on fragile
 * fetch interception inside the Next.js server.
 */

export interface MockResponse {
  status: number;
  body: unknown;
}

const ok = (body: unknown = { ok: true }): MockResponse => ({ status: 200, body });
const err = (status: number, message: string): MockResponse => ({ status, body: { statusCode: status, message } });
const unauth = (): MockResponse => err(401, "Not authenticated");

function toSummary(p: PropertyDetail): PropertySummary {
  return {
    id: p.id,
    title: p.title,
    neighborhood: p.neighborhood,
    monthlyRent: p.monthlyRent,
    rooms: p.rooms,
    bathrooms: p.bathrooms,
    area: p.area,
    furnished: p.furnished,
    boosted: p.boosted,
    ownerVerified: p.ownerVerified,
    status: p.status,
    coverImage: p.coverImage,
  };
}

function scoreProperty(intake: MatchIntake, p: PropertyDetail): number {
  let score = 55;
  if (p.monthlyRent >= intake.budgetMin && p.monthlyRent <= intake.budgetMax) score += 15;
  else score -= 20;
  if (intake.neighborhoods.some((n) => p.neighborhood.includes(n) || n.includes(p.neighborhood))) score += 12;
  if (p.type === intake.propertyType) score += 6;
  if (intake.furnished === "any" || (intake.furnished === "yes") === p.furnished) score += 5;
  if (p.rooms >= intake.roomsNeeded) score += 4;
  if (intake.needsAc && p.amenities.includes("ac")) score += 3;
  if (intake.needsInternet && p.amenities.includes("internet")) score += 3;
  if (intake.needsParking && p.amenities.includes("garage")) score += 3;
  score += (intake.idealDescription.length % 7) - 3;
  if (p.boosted) score += 2;
  return Math.max(5, Math.min(98, Math.round(score)));
}

const PRICES: Record<string, number> = { listing: 100, boost: 75, "matchmaker-refill": 30 };
const LEGAL_KEYWORDS = ["إيجار", "عقد", "قانون", "مالك", "مستأجر", "إخلاء", "شقة", "عقار", "تأمين", "زيادة", "فسخ", "إخطار", "محكمة", "ملكية"];

let liveQueueTick = 0;

/**
 * @param path pathname without query string, no leading slash removed (e.g. "/properties/prop_1")
 * @param query URLSearchParams for the request
 */
export function dispatch(
  method: string,
  path: string,
  query: URLSearchParams,
  authorization: string | null,
  body: unknown,
): MockResponse {
  const user = findUserByToken(authorization);
  const seg = path.replace(/^\//, "").split("/");

  // ---- auth ----
  if (method === "POST" && path === "/auth/login") {
    const b = body as LoginRequest;
    const u = db.users.find((x) => x.email === b.email);
    if (!u || b.password.length < 8) return err(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    return ok(tokensFor(u));
  }
  if (method === "POST" && path === "/auth/register") {
    const b = body as RegisterRequest;
    if (db.users.some((x) => x.email === b.email)) return err(409, "هذا البريد الإلكتروني مسجّل بالفعل");
    const u: MockUser = {
      id: nextId("usr"),
      fullName: b.fullName,
      email: b.email,
      phone: b.phone,
      role: b.role,
      verificationStatus: "unverified",
      createdAt: new Date().toISOString(),
      kyc: { completedSteps: [], attemptsUsed: 0, extractedName: null, nationalIdLast4: null, matchConfidence: null },
      quotas: { matchUsed: 0, matchLimit: 3, optimizerUsed: 0, optimizerLimit: 2, freeListingUsed: false },
    };
    db.users.push(u);
    return ok(tokensFor(u));
  }
  if (method === "POST" && path === "/auth/refresh") {
    const b = body as { refreshToken?: string };
    const u = findUserByToken(`Bearer ${b.refreshToken ?? ""}`);
    return u ? ok(tokensFor(u)) : unauth();
  }
  if (method === "GET" && path === "/auth/me") {
    return user ? ok(toPublicUser(user)) : unauth();
  }

  // ---- properties (public browse) ----
  if (method === "GET" && path === "/properties") {
    const q = query.get("q")?.trim();
    let items = db.properties.filter((p) => p.status === "approved");
    if (q) items = items.filter((p) => p.title.includes(q) || p.neighborhood.includes(q) || p.description.includes(q));
    items = [...items].sort((a, b) => Number(b.boosted) - Number(a.boosted));
    return ok({ items: items.map(toSummary), total: items.length, page: 1, pageSize: 50 });
  }
  if (method === "GET" && seg[0] === "properties" && seg.length === 2) {
    const property = db.properties.find((p) => p.id === seg[1]);
    if (!property) return err(404, "غير موجود");
    if (property.status !== "approved" && user?.id !== property.ownerId && user?.role !== "admin") return err(404, "غير موجود");
    return ok(property);
  }

  // ---- gated contact ----
  if (seg[0] === "properties" && seg[2] === "contact") {
    if (!user) return unauth();
    const propertyId = seg[1];
    if (method === "GET") {
      const inquiry = db.inquiries.find((i) => i.propertyId === propertyId && i.tenantId === user.id);
      const property = db.properties.find((p) => p.id === propertyId);
      let response: ContactStateResponse;
      if (!inquiry || !property) response = { status: "none", contact: null };
      else if (inquiry.status === "accepted") {
        const owner = db.users.find((u) => u.id === property.ownerId);
        response = {
          status: "accepted",
          contact: owner ? { fullName: owner.fullName, phone: owner.phone, email: owner.email } : null,
        };
      } else response = { status: inquiry.status, contact: null };
      return ok(response);
    }
    if (method === "POST") {
      const property = db.properties.find((p) => p.id === propertyId && p.status === "approved");
      if (!property) return err(404, "غير موجود");
      let inquiry = db.inquiries.find((i) => i.propertyId === property.id && i.tenantId === user.id);
      if (!inquiry) {
        inquiry = { id: nextId("inq"), propertyId: property.id, tenantId: user.id, status: "requested", createdAt: new Date().toISOString() };
        db.inquiries.push(inquiry);
        property.inquiriesCount++;
      }
      return ok({ status: inquiry.status, contact: null });
    }
  }

  // ---- landlord ----
  if (path === "/landlord/properties" && method === "GET") {
    if (!user) return unauth();
    const items = db.properties.filter((p) => p.ownerId === user.id);
    return ok({ items: items.map(toSummary), total: items.length, page: 1, pageSize: 50 });
  }
  if (path === "/landlord/properties" && method === "POST") {
    if (!user) return unauth();
    if (user.verificationStatus !== "verified") return err(403, "يجب توثيق هويتك أولًا قبل إضافة عقار");
    const b = body as CreatePropertyRequest;
    const needsPayment = user.quotas.freeListingUsed;
    const property: PropertyDetail = {
      id: nextId("prop"),
      ownerId: user.id,
      title: `${b.type === "studio" ? "ستوديو" : "عقار"} في ${b.location.neighborhood}`.slice(0, 60),
      neighborhood: b.location.neighborhood,
      monthlyRent: b.monthlyRent,
      rooms: b.rooms,
      bathrooms: b.bathrooms,
      area: b.area,
      furnished: b.furnished,
      boosted: false,
      ownerVerified: true,
      status: needsPayment ? "draft" : "pending",
      coverImage: b.photos[0] ?? null,
      location: b.location,
      type: b.type,
      deposit: b.deposit,
      leaseDurationMonths: b.leaseDurationMonths,
      floor: b.floor,
      hasElevator: b.hasElevator,
      finish: b.finish,
      orientation: b.orientation,
      amenities: b.amenities,
      conditions: b.conditions,
      description: b.description,
      photos: b.photos,
      inquiriesCount: 0,
      createdAt: new Date().toISOString(),
      rejectionReason: null,
    };
    db.properties.push(property);
    if (!needsPayment) user.quotas.freeListingUsed = true;
    return ok({ property, requiresPayment: needsPayment });
  }
  if (seg[0] === "landlord" && seg[1] === "properties" && seg[3] === "optimize-description" && method === "POST") {
    if (!user) return unauth();
    if (user.quotas.optimizerUsed >= user.quotas.optimizerLimit)
      return { status: 403, body: { statusCode: 403, message: "انتهت محاولاتك المجانية", trigger: "payment", product: "matchmaker-refill", priceEgp: 50 } };
    const b = body as { description: string };
    if (b.description.length > 2000) return err(400, "الوصف أطول من المسموح");
    user.quotas.optimizerUsed++;
    return ok({
      optimized: `«${b.description.slice(0, 80).trim()}…» — عقار مميز في موقع استراتيجي بالمنصورة! يتمتع بتشطيبات عالية الجودة ومساحات ذكية الاستغلال، على بعد خطوات من الخدمات والمواصلات. فرصة حقيقية للباحثين عن سكن مريح بعقد واضح ومن مالك موثّق الهوية مباشرة — بدون وسطاء وبدون عمولة.`,
      remainingUses: user.quotas.optimizerLimit - user.quotas.optimizerUsed,
    });
  }
  if (seg[0] === "landlord" && seg[1] === "properties" && seg[3] === "boost" && method === "POST") {
    if (!user) return unauth();
    const property = db.properties.find((p) => p.id === seg[2] && p.ownerId === user.id);
    if (!property) return err(404, "غير موجود");
    return ok({ requiresPayment: true });
  }
  if (path === "/landlord/inquiries" && method === "GET") {
    if (!user) return unauth();
    const myIds = new Set(db.properties.filter((p) => p.ownerId === user.id).map((p) => p.id));
    const items = db.inquiries
      .filter((i) => myIds.has(i.propertyId))
      .map((i) => {
        const tenant = db.users.find((u) => u.id === i.tenantId);
        const property = db.properties.find((p) => p.id === i.propertyId);
        return {
          id: i.id,
          status: i.status,
          createdAt: i.createdAt,
          propertyTitle: property?.title ?? "",
          propertyId: i.propertyId,
          tenantVerified: tenant?.verificationStatus === "verified",
          tenantName: i.status === "accepted" ? (tenant?.fullName ?? "") : "مستأجر مهتم",
          tenantPhone: i.status === "accepted" ? (tenant?.phone ?? null) : null,
        };
      });
    return ok({ items });
  }
  if (seg[0] === "landlord" && seg[1] === "inquiries" && seg[3] === "accept" && method === "POST") {
    if (!user) return unauth();
    const inquiry = db.inquiries.find((i) => i.id === seg[2]);
    if (!inquiry) return err(404, "غير موجود");
    const property = db.properties.find((p) => p.id === inquiry.propertyId);
    if (property?.ownerId !== user.id) return err(403, "غير مسموح");
    inquiry.status = "accepted";
    db.auditLog.push({ actorId: user.id, action: "inquiry:accept", subjectId: inquiry.id, at: new Date().toISOString() });
    return ok();
  }

  // ---- matching ----
  if (path === "/match/quota" && method === "GET") {
    if (!user) return unauth();
    return ok({ remaining: Math.max(0, user.quotas.matchLimit - user.quotas.matchUsed) });
  }
  if (path === "/match" && method === "POST") {
    if (!user) return unauth();
    if (user.quotas.matchUsed >= user.quotas.matchLimit)
      return { status: 403, body: { statusCode: 403, message: "انتهت محاولاتك المجانية", trigger: "payment", product: "matchmaker-refill", priceEgp: 30 } };
    const intake = body as MatchIntake;
    user.quotas.matchUsed++;
    const results = db.properties
      .filter((p) => p.status === "approved")
      .map((p) => ({ property: toSummary(p), matchScore: scoreProperty(intake, p) }))
      .sort((a, b) => b.matchScore - a.matchScore);
    return ok({ results, remainingFreeMatches: Math.max(0, user.quotas.matchLimit - user.quotas.matchUsed) });
  }

  // ---- eKYC ----
  if (path === "/kyc/state" && method === "GET") {
    if (!user) return unauth();
    return ok({
      status: user.verificationStatus,
      completedSteps: user.kyc.completedSteps,
      attemptsUsed: user.kyc.attemptsUsed,
      maxAttempts: 3,
      extractedName: user.kyc.extractedName,
      nationalIdLast4: user.kyc.nationalIdLast4,
      matchConfidence: user.kyc.matchConfidence,
    });
  }
  if (path === "/kyc/upload" && method === "POST") {
    if (!user) return unauth();
    if (user.verificationStatus === "locked") return err(403, "تم إيقاف التحقق، تواصل مع الدعم");
    const b = body as { step: "id-front" | "id-back" | "selfie"; simulateBadQuality?: boolean };
    if (b.simulateBadQuality) {
      user.kyc.attemptsUsed++;
      if (user.kyc.attemptsUsed >= 3) user.verificationStatus = "locked";
      return ok({ step: b.step, accepted: false, reason: "جودة الصورة منخفضة، حاول في إضاءة أفضل" });
    }
    if (!user.kyc.completedSteps.includes(b.step)) user.kyc.completedSteps.push(b.step);
    return ok({ step: b.step, accepted: true, reason: null });
  }
  if (path === "/kyc/submit" && method === "POST") {
    if (!user) return unauth();
    if (user.kyc.completedSteps.length < 3) return err(400, "أكمل جميع الخطوات أولًا");
    user.verificationStatus = "pending";
    user.kyc.extractedName = user.fullName;
    user.kyc.nationalIdLast4 = "4821";
    user.kyc.matchConfidence = 91;
    db.kycSubmissions.push({ userId: user.id, submittedAt: new Date().toISOString(), reviewed: false });
    return ok();
  }

  // ---- payments ----
  if (path === "/payments/checkout" && method === "POST") {
    if (!user) return unauth();
    const b = body as CreateCheckoutRequest;
    const payment = {
      id: nextId("pay"),
      userId: user.id,
      context: b.context,
      propertyId: b.propertyId,
      amountEgp: PRICES[b.context],
      status: "pending" as const,
      entitlementActive: false,
      createdAt: new Date().toISOString(),
    };
    db.payments.push(payment);
    return ok({ checkoutId: payment.id, amountEgp: payment.amountEgp, context: payment.context });
  }
  if (seg[0] === "payments" && seg[2] === "confirm" && method === "POST") {
    if (!user) return unauth();
    const payment = db.payments.find((p) => p.id === seg[1] && p.userId === user.id);
    if (!payment) return err(404, "غير موجود");
    const b = body as { cardNumber: string };
    if (b.cardNumber.endsWith("0000")) {
      payment.status = "failed";
      return ok({ checkoutId: payment.id, status: "failed", entitlementActive: false });
    }
    payment.status = "success";
    setTimeout(() => {
      payment.entitlementActive = true;
      if (payment.context === "matchmaker-refill") user.quotas.matchLimit += 3;
      else if (payment.context === "boost" && payment.propertyId) {
        const prop = db.properties.find((p) => p.id === payment.propertyId);
        if (prop) prop.boosted = true;
      } else if (payment.context === "listing" && payment.propertyId) {
        const prop = db.properties.find((p) => p.id === payment.propertyId);
        if (prop && prop.status === "draft") prop.status = "pending";
      }
    }, 1200);
    return ok({ checkoutId: payment.id, status: "success", entitlementActive: false });
  }
  if (seg[0] === "payments" && seg.length === 2 && method === "GET") {
    if (!user) return unauth();
    const payment = db.payments.find((p) => p.id === seg[1] && p.userId === user.id);
    if (!payment) return err(404, "غير موجود");
    return ok({ checkoutId: payment.id, status: payment.status, entitlementActive: payment.entitlementActive });
  }

  // ---- admin ----
  const admin = user?.role === "admin" ? user : null;
  if (path === "/admin/session" && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    return ok({
      id: admin.id,
      fullName: admin.fullName,
      roleName: "Super Admin",
      capabilities: ["listing:approve", "listing:reject", "kyc:review", "payment:refund", "report:export", "review:delete", "ticket:reply", "pii:reveal", "admin:create", "admin:manage"],
    });
  }
  if (path === "/admin/queues" && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    liveQueueTick++;
    if (liveQueueTick % 4 === 0) {
      const landlord = db.users.find((u) => u.id === "usr_landlord2");
      if (landlord) {
        const hoods = ["توريل", "حي الجامعة", "المشاية", "جديلة", "قولنجيل"];
        db.properties.push({
          ...db.properties[0],
          id: nextId("prop"),
          ownerId: landlord.id,
          title: `شقة جديدة في ${hoods[liveQueueTick % hoods.length]}`,
          neighborhood: hoods[liveQueueTick % hoods.length],
          monthlyRent: 2500 + Math.floor(Math.random() * 8) * 500,
          status: "pending",
          boosted: false,
          coverImage: null,
          inquiriesCount: 0,
          createdAt: new Date().toISOString(),
        });
      }
    }
    const propertyQueue = db.properties
      .filter((p) => p.status === "pending")
      .map((p) => ({ id: `q_${p.id}`, type: "property" as const, subjectId: p.id, title: p.title, subtitle: `${p.neighborhood} · ${p.monthlyRent} ج.م/شهريًا`, submittedAt: p.createdAt }))
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    const kycQueue = db.kycSubmissions
      .filter((s) => !s.reviewed)
      .map((s) => {
        const u = db.users.find((x) => x.id === s.userId);
        return { id: `q_kyc_${s.userId}`, type: "kyc" as const, subjectId: s.userId, title: u?.fullName ?? "مستخدم", subtitle: "مستخدم جديد بحاجة لمراجعة", submittedAt: s.submittedAt };
      })
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    return ok({ propertyQueue, kycQueue });
  }
  if (seg[0] === "admin" && seg[1] === "properties" && seg[3] === "review" && method === "POST") {
    if (!admin) return err(403, "غير مسموح");
    const property = db.properties.find((p) => p.id === seg[2]);
    if (!property) return err(404, "غير موجود");
    if (property.status !== "pending") return err(409, "تمت مراجعة هذا الطلب بالفعل");
    const b = body as ReviewDecision;
    property.status = b.decision === "approve" ? "approved" : "rejected";
    property.rejectionReason = b.decision === "reject" ? (b.reason ?? null) : null;
    db.auditLog.push({ actorId: admin.id, action: `listing:${b.decision}`, subjectId: property.id, at: new Date().toISOString() });
    return ok({ ok: true, status: property.status });
  }
  if (seg[0] === "admin" && seg[1] === "kyc" && seg.length === 3 && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    const u = db.users.find((x) => x.id === seg[2]);
    if (!u) return err(404, "غير موجود");
    return ok({
      userId: u.id,
      extractedName: u.kyc.extractedName ?? u.fullName,
      nationalIdLast4: u.kyc.nationalIdLast4 ?? "0000",
      matchConfidence: u.kyc.matchConfidence ?? 0,
      submittedAt: db.kycSubmissions.find((s) => s.userId === u.id)?.submittedAt ?? u.createdAt,
    });
  }
  if (seg[0] === "admin" && seg[1] === "kyc" && seg[3] === "review" && method === "POST") {
    if (!admin) return err(403, "غير مسموح");
    const u = db.users.find((x) => x.id === seg[2]);
    const submission = db.kycSubmissions.find((s) => s.userId === seg[2] && !s.reviewed);
    if (!u || !submission) return err(409, "تمت مراجعة هذا الطلب بالفعل");
    const b = body as ReviewDecision;
    u.verificationStatus = b.decision === "approve" ? "verified" : "unverified";
    submission.reviewed = true;
    db.auditLog.push({ actorId: admin.id, action: `kyc:${b.decision}`, subjectId: u.id, at: new Date().toISOString() });
    return ok();
  }

  // ---- legal chat ----
  if (path === "/legal-chat" && method === "POST") {
    if (!user) return unauth();
    const { message } = body as ChatRequest;
    const onTopic = LEGAL_KEYWORDS.some((k) => message.includes(k));
    if (!onTopic) return ok({ id: nextId("msg"), role: "assistant", content: "أقدر أساعدك فقط في أسئلة الإيجار والقانون العقاري في مصر.", declined: true });
    return ok({
      id: nextId("msg"),
      role: "assistant",
      content:
        "وفقًا للقانون المدني المصري وقانون الإيجار الجديد (القانون رقم 4 لسنة 1996)، العلاقة الإيجارية للعقود الجديدة تحكمها بنود العقد المتفق عليها بين الطرفين. " +
        "بشكل عام: مدة الإخطار قبل إنهاء العقد تكون حسب المتفق عليه في العقد، وإذا لم يُنص عليها فتُطبق أحكام القانون المدني. " +
        "ملاحظة: هذه معلومات إرشادية وليست استشارة قانونية ملزمة — يُنصح بمراجعة محامٍ للحالات الخاصة.",
      declined: false,
    });
  }

  return err(404, "المسار غير موجود");
}
