import type { LoginRequest, RegisterRequest } from "@/src/lib/api/contracts/auth";
import type { MatchIntake, ContactStateResponse } from "@/src/lib/api/contracts/match";
import type { CreatePropertyRequest } from "@/src/lib/api/contracts/property";
import type { CreateCheckoutRequest } from "@/src/lib/api/contracts/payment";
import type { ReviewDecision } from "@/src/lib/api/contracts/admin";
import type { ChatRequest } from "@/src/lib/api/contracts/support";
import type { PropertyDetail, PropertySummary } from "@/src/lib/api/contracts/property";
import type {
  AdminReplyRequest,
  SupportSendRequest,
  TicketStatusUpdate,
} from "@/src/lib/api/contracts/support";
import {
  ROLE_CAPABILITIES,
  adminRoleLabels,
  type CreateAdminRequest,
  type UpdateAdminRequest,
} from "@/src/lib/api/contracts/admin";
import type { Capability } from "@/src/lib/api/contracts/common";
import { verificationDocumentLabels, type VerificationDocumentType } from "@/src/lib/api/contracts/verification";
import {
  db,
  findUserByToken,
  nextId,
  pushAudit,
  tokensFor,
  toPublicUser,
  type MockTicket,
  type MockUser,
} from "./db";

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
const codedErr = (status: number, code: string, message: string, extra: Record<string, unknown> = {}): MockResponse => ({
  status,
  body: { statusCode: status, code, message, ...extra },
});
const unauth = (): MockResponse => err(401, "Not authenticated");
const VERIFICATION_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/* ------------------------------ support helpers ------------------------------ */

const SUPPORT_KB: { keys: string[]; answer: string }[] = [
  { keys: ["توثيق", "هوية", "بطاقة", "تحقق"], answer: "لتوثيق هويتك، افتح «توثيق الهوية» وارفع صورتي البطاقة وصورة شخصية. تتم المراجعة خلال وقت قصير." },
  { keys: ["دفع", "فلوس", "رسوم", "بايموب", "paymob", "فيزا"], answer: "المدفوعات تتم مباشرة بالجنيه المصري عبر Paymob. أول إعلان مجاني، وبعده تُدفع رسوم بسيطة لكل إعلان." },
  { keys: ["إعلان", "عقار", "نشر", "صور"], answer: "لإضافة عقار، ادخل «إضافة عقار» واملأ الخطوات. تأكد أن كل صورة أقل من 5 ميجابايت. يظهر الإعلان للمستأجرين بعد موافقة الإدارة." },
  { keys: ["مطابقة", "بحث", "سكن"], answer: "استخدم «المطابقة الذكية» ووصّف سكنك المثالي بكلماتك، وسنعرض لك أقرب العقارات المطابقة مع نسبة التطابق." },
  { keys: ["تواصل", "رقم", "هاتف", "مالك"], answer: "رقم المالك يظهر بعد تأكيد التطابق من الطرفين حمايةً للخصوصية." },
];

function aiSupportReply(message: string): string {
  const hit = SUPPORT_KB.find((k) => k.keys.some((key) => message.includes(key)));
  if (hit) return `${hit.answer}\n\nإذا احتجت مساعدة إضافية، يمكنك طلب التحدث مع موظف بشري.`;
  return "شكرًا لتواصلك. لم أفهم استفسارك تمامًا — هل يمكنك التوضيح أكثر؟ أو يمكنك طلب التحدث مع موظف بشري.";
}

function pushMsg(ticket: MockTicket, author: MockTicket["messages"][number]["author"], authorName: string, content: string, internal = false) {
  const at = new Date().toISOString();
  ticket.messages.push({ id: nextId("sm"), author, authorName, content, internal, at });
  ticket.lastMessageAt = at;
}

/** A ticket the user can still talk into (not closed). */
function openTicketFor(userId: string): MockTicket | undefined {
  return [...db.tickets].reverse().find((t) => t.userId === userId && t.status !== "closed");
}
function latestTicketFor(userId: string): MockTicket | undefined {
  return [...db.tickets].reverse().find((t) => t.userId === userId);
}

function threadView(ticket: MockTicket | undefined) {
  if (!ticket) return { ticketId: null, status: null, escalated: false, messages: [] };
  return {
    ticketId: ticket.id,
    status: ticket.status,
    escalated: ticket.escalated,
    // Never expose internal admin notes to the customer.
    messages: ticket.messages.filter((m) => !m.internal),
  };
}

function ticketSummary(t: MockTicket) {
  const u = db.users.find((x) => x.id === t.userId);
  const assignee = t.assignedAdminId ? db.users.find((x) => x.id === t.assignedAdminId) : null;
  return {
    id: t.id,
    subject: t.subject,
    userName: u?.fullName ?? "عميل",
    status: t.status,
    assignedAdminName: assignee?.fullName ?? null,
    lastMessageAt: t.lastMessageAt,
    createdAt: t.createdAt,
  };
}
function ticketDetail(t: MockTicket) {
  return { ...ticketSummary(t), userId: t.userId, assignedAdminId: t.assignedAdminId, messages: t.messages };
}

function teamMember(u: MockUser) {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.adminRole ?? "read-only",
    capabilities: u.capabilities ?? [],
    disabled: u.disabled ?? false,
    lastLoginAt: u.lastLoginAt ?? null,
    createdAt: u.createdAt,
  };
}

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
      role: "user",
      verificationStatus: "unverified",
      verificationRejectedAt: null,
      verificationResubmitAfter: null,
      verificationRejectionReason: null,
      createdAt: new Date().toISOString(),
      kyc: { completedSteps: [], verifiedAt: null },
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
  if (method === "POST" && path === "/auth/forgot-password") {
    // Always returns ok regardless of whether the email exists, so the
    // response can't be used to enumerate accounts (see ASSUMPTIONS.md).
    return ok({ sent: true });
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
    const b = body as CreatePropertyRequest;
    const isVerified = user.verificationStatus === "verified";
    const needsPayment = isVerified && user.quotas.freeListingUsed;
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
      ownerVerified: isVerified,
      status: isVerified && !needsPayment ? "pending" : "draft",
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
    if (!isVerified) {
      pushAudit(user, "listing:draft_created_verification_required", property.id);
      return ok({ property, requiresPayment: false, requiresVerification: true });
    }
    if (!needsPayment) user.quotas.freeListingUsed = true;
    return ok({ property, requiresPayment: needsPayment, requiresVerification: false });
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
    pushAudit(user, "inquiry:accept", inquiry.id);
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

  // ---- notifications ----
  if (path === "/notifications" && method === "GET") {
    if (!user) return unauth();
    const now = Date.now();
    // Role-appropriate sample notifications.
    const hasListings = db.properties.some((p) => p.ownerId === user.id);
    const base =
      user.role === "admin"
        ? [
            { id: "n1", kind: "review", title: "طلب توثيق جديد بحاجة لمراجعة", at: new Date(now - 3 * 60_000).toISOString() },
            { id: "n2", kind: "review", title: "عقار جديد قيد المراجعة", at: new Date(now - 22 * 60_000).toISOString() },
          ]
        : hasListings
          ? [
              { id: "n1", kind: "inquiry", title: "مستأجر مهتم بعقارك في حي الجامعة", at: new Date(now - 6 * 60_000).toISOString() },
              { id: "n2", kind: "listing", title: "تمت الموافقة على إعلانك", at: new Date(now - 60 * 60_000).toISOString() },
            ]
          : [
              { id: "n1", kind: "match", title: "لديك نتائج مطابقة جديدة", at: new Date(now - 10 * 60_000).toISOString() },
            ];
    return ok({ items: base, unread: base.length });
  }

  // ---- verification ----
  if (path === "/kyc/state" && method === "GET") {
    if (!user) return unauth();
    const hasListingIntent = db.properties.some((p) => p.ownerId === user.id);
    const cooldownActive = Boolean(
      user.verificationResubmitAfter && new Date(user.verificationResubmitAfter).getTime() > Date.now(),
    );
    return ok({
      status: user.verificationStatus,
      completedSteps: user.kyc.completedSteps,
      hasListingIntent,
      canSubmit:
        hasListingIntent &&
        user.verificationStatus !== "verified" &&
        user.verificationStatus !== "pending_review" &&
        !cooldownActive,
      rejectionReason: user.verificationRejectionReason ?? null,
      rejectedAt: user.verificationRejectedAt ?? null,
      resubmitAfter: user.verificationResubmitAfter ?? null,
      verifiedAt: user.kyc.verifiedAt,
    });
  }
  if (path === "/kyc/upload" && method === "POST") {
    if (!user) return unauth();
    if (user.verificationStatus === "verified") return codedErr(409, "ALREADY_VERIFIED", "تم توثيق هذا الحساب بالفعل");
    if (user.verificationStatus === "pending_review") return codedErr(409, "VERIFICATION_ALREADY_PENDING", "طلب التوثيق قيد المراجعة بالفعل");
    if (user.verificationResubmitAfter && new Date(user.verificationResubmitAfter).getTime() > Date.now()) {
      return codedErr(429, "VERIFICATION_COOLDOWN_ACTIVE", "يجب الانتظار قبل إعادة إرسال التوثيق", {
        resubmitAfter: user.verificationResubmitAfter,
      });
    }
    const b = body as { step: VerificationDocumentType; simulateBadQuality?: boolean };
    if (b.simulateBadQuality) {
      return ok({ step: b.step, accepted: false, reason: "المستند غير واضح، ارفع نسخة أوضح" });
    }
    if (!user.kyc.completedSteps.includes(b.step)) user.kyc.completedSteps.push(b.step);
    return ok({ step: b.step, accepted: true, reason: null });
  }
  if (path === "/kyc/submit" && method === "POST") {
    if (!user) return unauth();
    const hasListingIntent = db.properties.some((p) => p.ownerId === user.id);
    if (!hasListingIntent) return codedErr(403, "LISTING_INTENT_REQUIRED", "ابدأ بإضافة مسودة إعلان قبل التوثيق");
    if (user.verificationStatus === "verified") return codedErr(409, "ALREADY_VERIFIED", "تم توثيق هذا الحساب بالفعل");
    if (user.verificationStatus === "pending_review") return codedErr(409, "VERIFICATION_ALREADY_PENDING", "طلب التوثيق قيد المراجعة بالفعل");
    if (user.verificationResubmitAfter && new Date(user.verificationResubmitAfter).getTime() > Date.now()) {
      return codedErr(429, "VERIFICATION_COOLDOWN_ACTIVE", "يجب الانتظار قبل إعادة إرسال التوثيق", {
        resubmitAfter: user.verificationResubmitAfter,
      });
    }
    if (user.kyc.completedSteps.length < 3) return err(400, "أكمل جميع المستندات أولًا");
    user.verificationStatus = "pending_review";
    user.verificationRejectedAt = null;
    user.verificationResubmitAfter = null;
    db.kycSubmissions.push({ userId: user.id, submittedAt: new Date().toISOString(), reviewed: false });
    pushAudit(user, "verification:submitted", user.id);
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
  // A disabled admin loses access entirely.
  const admin = user?.role === "admin" && !user.disabled ? user : null;
  const adminCaps: Capability[] = admin?.capabilities ?? [];
  const can = (cap: Capability) => adminCaps.includes(cap);

  if (path === "/admin/session" && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    return ok({
      id: admin.id,
      fullName: admin.fullName,
      roleName: admin.adminRole ? adminRoleLabels[admin.adminRole] : "مشرف",
      capabilities: adminCaps,
    });
  }
  if (path === "/admin/stats" && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("report:export")) return err(403, "لا تملك صلاحية عرض التقارير");
    // Blend seeded demo figures with any real payments made this session.
    const successful = db.payments.filter((p) => p.status === "success");
    const liveRevenue = successful.reduce((s, p) => s + p.amountEgp, 0);
    const monthly = [
      { month: "يناير", revenue: 3200, transactions: 24 },
      { month: "فبراير", revenue: 4100, transactions: 31 },
      { month: "مارس", revenue: 3800, transactions: 28 },
      { month: "أبريل", revenue: 5200, transactions: 39 },
      { month: "مايو", revenue: 6100, transactions: 44 },
      { month: "يونيو", revenue: 5400 + liveRevenue, transactions: 41 + successful.length },
    ];
    const approved = db.properties.filter((p) => p.status === "approved").length;
    const pending = db.properties.filter((p) => p.status === "pending").length;
    const rejected = db.properties.filter((p) => p.status === "rejected").length;
    return ok({
      summary: {
        totalRevenue: monthly.reduce((s, m) => s + m.revenue, 0),
        totalTransactions: monthly.reduce((s, m) => s + m.transactions, 0),
        activeListings: approved,
        pendingReviews: pending,
      },
      monthlyRevenue: monthly,
      reviewDistribution: [
        { label: "تمت الموافقة", value: approved },
        { label: "قيد المراجعة", value: pending },
        { label: "مرفوض", value: rejected },
      ],
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
    const b = body as ReviewDecision;
    if (!can(b.decision === "approve" ? "listing:approve" : "listing:reject"))
      return err(403, "لا تملك صلاحية مراجعة العقارات");
    const property = db.properties.find((p) => p.id === seg[2]);
    if (!property) return err(404, "غير موجود");
    if (property.status !== "pending") return err(409, "تمت مراجعة هذا الطلب بالفعل");
    property.status = b.decision === "approve" ? "approved" : "rejected";
    property.rejectionReason = b.decision === "reject" ? (b.reason ?? null) : null;
    pushAudit(admin, `listing:${b.decision}`, property.id);
    return ok({ ok: true, status: property.status });
  }
  if (seg[0] === "admin" && seg[1] === "kyc" && seg.length === 3 && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    const u = db.users.find((x) => x.id === seg[2]);
    if (!u) return err(404, "غير موجود");
    const submission = db.kycSubmissions.find((s) => s.userId === u.id && !s.reviewed);
    return ok({
      userId: u.id,
      userName: u.fullName,
      documents: u.kyc.completedSteps.map((type) => ({
        type,
        label: verificationDocumentLabels[type],
        uploadedAt: submission?.submittedAt ?? u.createdAt,
      })),
      submittedAt: submission?.submittedAt ?? u.createdAt,
    });
  }
  if (seg[0] === "admin" && seg[1] === "kyc" && seg[3] === "review" && method === "POST") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("kyc:review")) return err(403, "لا تملك صلاحية مراجعة التوثيق");
    const u = db.users.find((x) => x.id === seg[2]);
    const submission = db.kycSubmissions.find((s) => s.userId === seg[2] && !s.reviewed);
    if (!u || !submission) return err(409, "تمت مراجعة هذا الطلب بالفعل");
    const b = body as ReviewDecision;
    const rejectionReason = b.reason?.trim();
    if (b.decision === "reject" && !rejectionReason) return err(400, "سبب الرفض مطلوب");
    if (b.decision === "approve") {
      u.verificationStatus = "verified";
      u.kyc.verifiedAt = new Date().toISOString();
      u.verificationRejectedAt = null;
      u.verificationResubmitAfter = null;
      u.verificationRejectionReason = null;
      db.properties
        .filter((p) => p.ownerId === u.id && p.status === "draft")
        .forEach((p) => {
          p.ownerVerified = true;
          if (!u.quotas.freeListingUsed) {
            p.status = "pending";
            u.quotas.freeListingUsed = true;
          }
        });
    } else {
      const rejectedAt = new Date();
      u.verificationStatus = "rejected";
      u.verificationRejectedAt = rejectedAt.toISOString();
      u.verificationResubmitAfter = new Date(rejectedAt.getTime() + VERIFICATION_COOLDOWN_MS).toISOString();
      u.verificationRejectionReason = rejectionReason;
      u.kyc.completedSteps = [];
    }
    submission.reviewed = true;
    pushAudit(admin, `verification:${b.decision}`, u.id);
    return ok();
  }

  // ---- customer support: user side (AI-first, escalate to human) ----
  if (path === "/support/thread" && method === "GET") {
    if (!user) return unauth();
    const ticket = latestTicketFor(user.id);
    return ok(threadView(ticket));
  }
  if (path === "/support/message" && method === "POST") {
    if (!user) return unauth();
    const { message } = body as SupportSendRequest;
    let ticket = openTicketFor(user.id);
    if (!ticket) {
      ticket = {
        id: nextId("tkt"),
        userId: user.id,
        subject: message.slice(0, 40),
        status: "new",
        assignedAdminId: null,
        escalated: false,
        messages: [],
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      };
      db.tickets.push(ticket);
    }
    pushMsg(ticket, "user", user.fullName, message);
    // If a human is already handling it, don't auto-reply with the AI.
    if (!ticket.escalated) {
      pushMsg(ticket, "ai", "المساعد الآلي", aiSupportReply(message));
    }
    return ok(threadView(ticket));
  }
  if (path === "/support/escalate" && method === "POST") {
    if (!user) return unauth();
    const ticket = openTicketFor(user.id);
    if (!ticket) return err(404, "لا توجد محادثة مفتوحة");
    ticket.escalated = true;
    if (ticket.status === "closed") ticket.status = "new";
    pushMsg(ticket, "ai", "المساعد الآلي", "تم تحويلك إلى أحد موظفي الدعم، وسيتم الرد عليك في أقرب وقت.");
    return ok(threadView(ticket));
  }

  // ---- customer support: admin side ----
  if (path === "/admin/tickets" && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("ticket:reply")) return err(403, "لا تملك صلاحية إدارة الدعم");
    const items = [...db.tickets]
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
      .map(ticketSummary);
    return ok({ items });
  }
  if (seg[0] === "admin" && seg[1] === "tickets" && seg.length === 3 && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("ticket:reply")) return err(403, "لا تملك صلاحية إدارة الدعم");
    const ticket = db.tickets.find((t) => t.id === seg[2]);
    if (!ticket) return err(404, "غير موجود");
    return ok(ticketDetail(ticket));
  }
  if (seg[0] === "admin" && seg[1] === "tickets" && seg[3] === "reply" && method === "POST") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("ticket:reply")) return err(403, "لا تملك صلاحية إدارة الدعم");
    const ticket = db.tickets.find((t) => t.id === seg[2]);
    if (!ticket) return err(404, "غير موجود");
    const b = body as AdminReplyRequest;
    pushMsg(ticket, "admin", admin.fullName, b.content, b.internal);
    if (!b.internal) {
      ticket.escalated = true;
      if (!ticket.assignedAdminId) ticket.assignedAdminId = admin.id;
      if (ticket.status === "new" || ticket.status === "assigned") ticket.status = "in_progress";
    }
    pushAudit(admin, b.internal ? "ticket:note" : "ticket:reply", ticket.id);
    return ok(ticketDetail(ticket));
  }
  if (seg[0] === "admin" && seg[1] === "tickets" && seg[3] === "assign" && method === "POST") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("ticket:reply")) return err(403, "لا تملك صلاحية إدارة الدعم");
    const ticket = db.tickets.find((t) => t.id === seg[2]);
    if (!ticket) return err(404, "غير موجود");
    ticket.assignedAdminId = admin.id;
    if (ticket.status === "new") ticket.status = "assigned";
    pushAudit(admin, "ticket:assign", ticket.id);
    return ok(ticketDetail(ticket));
  }
  if (seg[0] === "admin" && seg[1] === "tickets" && seg[3] === "status" && method === "POST") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("ticket:reply")) return err(403, "لا تملك صلاحية إدارة الدعم");
    const ticket = db.tickets.find((t) => t.id === seg[2]);
    if (!ticket) return err(404, "غير موجود");
    const b = body as TicketStatusUpdate;
    ticket.status = b.status;
    pushAudit(admin, `ticket:status:${b.status}`, ticket.id);
    return ok(ticketDetail(ticket));
  }

  // ---- admin & RBAC management ----
  if (path === "/admin/team" && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("admin:manage")) return err(403, "لا تملك صلاحية إدارة المشرفين");
    const items = db.users.filter((u) => u.role === "admin").map(teamMember);
    return ok({ items });
  }
  if (path === "/admin/team" && method === "POST") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("admin:create")) return err(403, "لا تملك صلاحية إنشاء مشرفين");
    const b = body as CreateAdminRequest;
    if (db.users.some((u) => u.email === b.email)) return err(409, "هذا البريد مسجّل بالفعل");
    const created: MockUser = {
      id: nextId("usr"),
      fullName: b.fullName,
      email: b.email,
      phone: "01000000000",
      role: "admin",
      verificationStatus: "verified",
      verificationRejectedAt: null,
      verificationResubmitAfter: null,
      verificationRejectionReason: null,
      createdAt: new Date().toISOString(),
      kyc: { completedSteps: [], verifiedAt: new Date().toISOString() },
      quotas: { matchUsed: 0, matchLimit: 3, optimizerUsed: 0, optimizerLimit: 2, freeListingUsed: false },
      adminRole: b.role,
      capabilities: ROLE_CAPABILITIES[b.role],
      disabled: false,
      lastLoginAt: null,
    };
    db.users.push(created);
    pushAudit(admin, "admin:create", created.id);
    return ok(teamMember(created));
  }
  if (seg[0] === "admin" && seg[1] === "team" && seg.length === 3 && method === "PATCH") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("admin:manage")) return err(403, "لا تملك صلاحية إدارة المشرفين");
    const target = db.users.find((u) => u.id === seg[2] && u.role === "admin");
    if (!target) return err(404, "غير موجود");
    const b = body as UpdateAdminRequest;
    if (b.role) {
      target.adminRole = b.role;
      target.capabilities = ROLE_CAPABILITIES[b.role];
    }
    if (typeof b.disabled === "boolean") target.disabled = b.disabled;
    pushAudit(admin, "admin:update", target.id);
    return ok(teamMember(target));
  }
  if (seg[0] === "admin" && seg[1] === "team" && seg[3] === "reset-password" && method === "POST") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("admin:manage")) return err(403, "لا تملك صلاحية إدارة المشرفين");
    const target = db.users.find((u) => u.id === seg[2] && u.role === "admin");
    if (!target) return err(404, "غير موجود");
    pushAudit(admin, "admin:reset-password", target.id);
    return ok({ sent: true });
  }
  if (path === "/admin/audit-log" && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("admin:manage")) return err(403, "لا تملك صلاحية الاطلاع على السجل");
    return ok({ items: db.auditLog.slice(0, 50) });
  }
  if (path === "/admin/login-history" && method === "GET") {
    if (!admin) return err(403, "غير مسموح");
    if (!can("admin:manage")) return err(403, "لا تملك صلاحية الاطلاع على السجل");
    return ok({ items: db.loginHistory });
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
