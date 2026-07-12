import { http, HttpResponse } from "msw";
import type { LoginRequest, RegisterRequest } from "@/src/lib/api/contracts/auth";
import type { MatchIntake, ContactStateResponse } from "@/src/lib/api/contracts/match";
import type { CreatePropertyRequest } from "@/src/lib/api/contracts/property";
import type { CreateCheckoutRequest } from "@/src/lib/api/contracts/payment";
import type { ReviewDecision } from "@/src/lib/api/contracts/admin";
import type { ChatRequest } from "@/src/lib/api/contracts/support";
import type { PropertyDetail, PropertySummary } from "@/src/lib/api/contracts/property";
import { db, findUserByToken, nextId, tokensFor, toPublicUser, type MockUser } from "./db";

/**
 * Mocks the entire NestJS backend, statefully, so every flow works end-to-end
 * without a real API. Matched by path suffix (`*`) so the NESTJS_API_URL
 * origin doesn't matter. One section per backend module.
 */

const unauthorized = () =>
  HttpResponse.json({ statusCode: 401, message: "Not authenticated" }, { status: 401 });

function requireUser(request: Request): MockUser | null {
  return findUserByToken(request.headers.get("authorization"));
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

/* ------------------------------ auth ------------------------------ */

const authHandlers = [
  http.post<never, LoginRequest>("*/auth/login", async ({ request }) => {
    const body = await request.json();
    const user = db.users.find((u) => u.email === body.email);
    if (!user || body.password.length < 8) {
      return HttpResponse.json(
        { statusCode: 401, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 },
      );
    }
    return HttpResponse.json(tokensFor(user));
  }),

  http.post<never, RegisterRequest>("*/auth/register", async ({ request }) => {
    const body = await request.json();
    if (db.users.some((u) => u.email === body.email)) {
      return HttpResponse.json(
        { statusCode: 409, message: "هذا البريد الإلكتروني مسجّل بالفعل" },
        { status: 409 },
      );
    }
    const user: MockUser = {
      id: nextId("usr"),
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      role: body.role,
      verificationStatus: "unverified",
      createdAt: new Date().toISOString(),
      kyc: { completedSteps: [], attemptsUsed: 0, extractedName: null, nationalIdLast4: null, matchConfidence: null },
      quotas: { matchUsed: 0, matchLimit: 3, optimizerUsed: 0, optimizerLimit: 2, freeListingUsed: false },
    };
    db.users.push(user);
    return HttpResponse.json(tokensFor(user));
  }),

  http.post("*/auth/refresh", async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string };
    const user = findUserByToken(`Bearer ${body.refreshToken ?? ""}`);
    if (!user) return unauthorized();
    return HttpResponse.json(tokensFor(user));
  }),

  http.get("*/auth/me", ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json(toPublicUser(user));
  }),
];

/* --------------------------- properties --------------------------- */

const propertyHandlers = [
  // Tenant browse: approved listings only, boosted first. Optional ?q= search.
  http.get("*/properties", ({ request }) => {
    const q = new URL(request.url).searchParams.get("q")?.trim();
    let items = db.properties.filter((p) => p.status === "approved");
    if (q) {
      items = items.filter(
        (p) => p.title.includes(q) || p.neighborhood.includes(q) || p.description.includes(q),
      );
    }
    items = [...items].sort((a, b) => Number(b.boosted) - Number(a.boosted));
    return HttpResponse.json({ items: items.map(toSummary), total: items.length, page: 1, pageSize: 50 });
  }),

  http.get("*/properties/:id", ({ params, request }) => {
    const property = db.properties.find((p) => p.id === params.id);
    if (!property) return HttpResponse.json({ statusCode: 404, message: "غير موجود" }, { status: 404 });
    const user = requireUser(request);
    // Non-approved listings are visible only to their owner and admins.
    if (property.status !== "approved" && user?.id !== property.ownerId && user?.role !== "admin") {
      return HttpResponse.json({ statusCode: 404, message: "غير موجود" }, { status: 404 });
    }
    return HttpResponse.json(property);
  }),

  http.get("*/landlord/properties", ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const items = db.properties.filter((p) => p.ownerId === user.id);
    return HttpResponse.json({ items: items.map(toSummary), total: items.length, page: 1, pageSize: 50 });
  }),

  http.post<never, CreatePropertyRequest>("*/landlord/properties", async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    if (user.verificationStatus !== "verified") {
      return HttpResponse.json(
        { statusCode: 403, message: "يجب توثيق هويتك أولًا قبل إضافة عقار" },
        { status: 403 },
      );
    }
    const body = await request.json();
    const needsPayment = user.quotas.freeListingUsed;
    const property: PropertyDetail = {
      id: nextId("prop"),
      ownerId: user.id,
      title: `${body.type === "studio" ? "ستوديو" : "عقار"} في ${body.location.neighborhood}`.slice(0, 60),
      neighborhood: body.location.neighborhood,
      monthlyRent: body.monthlyRent,
      rooms: body.rooms,
      bathrooms: body.bathrooms,
      area: body.area,
      furnished: body.furnished,
      boosted: false,
      ownerVerified: true,
      // Draft until the listing fee is settled (first one is free).
      status: needsPayment ? "draft" : "pending",
      coverImage: body.photos[0] ?? null,
      location: body.location,
      type: body.type,
      deposit: body.deposit,
      leaseDurationMonths: body.leaseDurationMonths,
      floor: body.floor,
      hasElevator: body.hasElevator,
      finish: body.finish,
      orientation: body.orientation,
      amenities: body.amenities,
      conditions: body.conditions,
      description: body.description,
      photos: body.photos,
      inquiriesCount: 0,
      createdAt: new Date().toISOString(),
      rejectionReason: null,
    };
    db.properties.push(property);
    if (!needsPayment) user.quotas.freeListingUsed = true;
    return HttpResponse.json({ property, requiresPayment: needsPayment });
  }),

  http.post("*/landlord/properties/:id/optimize-description", async ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    void params;
    if (user.quotas.optimizerUsed >= user.quotas.optimizerLimit) {
      return HttpResponse.json(
        {
          statusCode: 403,
          message: "انتهت محاولاتك المجانية",
          trigger: "payment",
          product: "matchmaker-refill",
          priceEgp: 50,
        },
        { status: 403 },
      );
    }
    const body = (await request.json()) as { description: string };
    if (body.description.length > 2000) {
      return HttpResponse.json({ statusCode: 400, message: "الوصف أطول من المسموح" }, { status: 400 });
    }
    user.quotas.optimizerUsed++;
    return HttpResponse.json({
      optimized: `«${body.description.slice(0, 80).trim()}…» — عقار مميز في موقع استراتيجي بالمنصورة! يتمتع بتشطيبات عالية الجودة ومساحات ذكية الاستغلال، على بعد خطوات من الخدمات والمواصلات. فرصة حقيقية للباحثين عن سكن مريح بعقد واضح ومن مالك موثّق الهوية مباشرة — بدون وسطاء وبدون عمولة.`,
      remainingUses: user.quotas.optimizerLimit - user.quotas.optimizerUsed,
    });
  }),

  http.post("*/landlord/properties/:id/boost", ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const property = db.properties.find((p) => p.id === params.id && p.ownerId === user.id);
    if (!property) return HttpResponse.json({ statusCode: 404, message: "غير موجود" }, { status: 404 });
    // Boost requires payment — actual flag flips when the payment confirms.
    return HttpResponse.json({ requiresPayment: true });
  }),
];

/* ---------------------------- matching ---------------------------- */

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
  // Tiny deterministic wobble from the RAG text so the field visibly matters.
  score += (intake.idealDescription.length % 7) - 3;
  if (p.boosted) score += 2;
  return Math.max(5, Math.min(98, Math.round(score)));
}

const matchHandlers = [
  http.get("*/match/quota", ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json({ remaining: Math.max(0, user.quotas.matchLimit - user.quotas.matchUsed) });
  }),

  http.post<never, MatchIntake>("*/match", async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    if (user.quotas.matchUsed >= user.quotas.matchLimit) {
      return HttpResponse.json(
        {
          statusCode: 403,
          message: "انتهت محاولاتك المجانية",
          trigger: "payment",
          product: "matchmaker-refill",
          priceEgp: 30,
        },
        { status: 403 },
      );
    }
    const intake = await request.json();
    user.quotas.matchUsed++;
    const results = db.properties
      .filter((p) => p.status === "approved")
      .map((p) => ({ property: toSummary(p), matchScore: scoreProperty(intake, p) }))
      .sort((a, b) => b.matchScore - a.matchScore);
    return HttpResponse.json({
      results,
      remainingFreeMatches: Math.max(0, user.quotas.matchLimit - user.quotas.matchUsed),
    });
  }),
];

/* ------------------------- gated contact -------------------------- */

const contactHandlers = [
  http.get("*/properties/:id/contact", ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const inquiry = db.inquiries.find((i) => i.propertyId === params.id && i.tenantId === user.id);
    const property = db.properties.find((p) => p.id === params.id);
    let response: ContactStateResponse;
    if (!inquiry || !property) {
      response = { status: "none", contact: null };
    } else if (inquiry.status === "accepted") {
      // PII reveal gate: only after the landlord accepted (ASSUMPTIONS.md #6).
      const owner = db.users.find((u) => u.id === property.ownerId);
      response = {
        status: "accepted",
        contact: owner ? { fullName: owner.fullName, phone: owner.phone, email: owner.email } : null,
      };
    } else {
      response = { status: inquiry.status, contact: null };
    }
    return HttpResponse.json(response);
  }),

  http.post("*/properties/:id/contact", ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const property = db.properties.find((p) => p.id === params.id && p.status === "approved");
    if (!property) return HttpResponse.json({ statusCode: 404, message: "غير موجود" }, { status: 404 });
    let inquiry = db.inquiries.find((i) => i.propertyId === property.id && i.tenantId === user.id);
    if (!inquiry) {
      inquiry = {
        id: nextId("inq"),
        propertyId: property.id,
        tenantId: user.id,
        status: "requested",
        createdAt: new Date().toISOString(),
      };
      db.inquiries.push(inquiry);
      property.inquiriesCount++;
    }
    return HttpResponse.json({ status: inquiry.status, contact: null } satisfies ContactStateResponse);
  }),

  http.get("*/landlord/inquiries", ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const myPropertyIds = new Set(db.properties.filter((p) => p.ownerId === user.id).map((p) => p.id));
    const items = db.inquiries
      .filter((i) => myPropertyIds.has(i.propertyId))
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
          // PII gate: tenant identity masked until the landlord accepts.
          tenantName: i.status === "accepted" ? (tenant?.fullName ?? "") : "مستأجر مهتم",
          tenantPhone: i.status === "accepted" ? (tenant?.phone ?? null) : null,
        };
      });
    return HttpResponse.json({ items });
  }),

  http.post("*/landlord/inquiries/:id/accept", ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const inquiry = db.inquiries.find((i) => i.id === params.id);
    if (!inquiry) return HttpResponse.json({ statusCode: 404, message: "غير موجود" }, { status: 404 });
    const property = db.properties.find((p) => p.id === inquiry.propertyId);
    if (property?.ownerId !== user.id) {
      return HttpResponse.json({ statusCode: 403, message: "غير مسموح" }, { status: 403 });
    }
    inquiry.status = "accepted";
    db.auditLog.push({ actorId: user.id, action: "inquiry:accept", subjectId: inquiry.id, at: new Date().toISOString() });
    return HttpResponse.json({ ok: true });
  }),
];

/* ------------------------------ eKYC ------------------------------ */

const kycHandlers = [
  http.get("*/kyc/state", ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json({
      status: user.verificationStatus,
      completedSteps: user.kyc.completedSteps,
      attemptsUsed: user.kyc.attemptsUsed,
      maxAttempts: 3,
      extractedName: user.kyc.extractedName,
      nationalIdLast4: user.kyc.nationalIdLast4,
      matchConfidence: user.kyc.matchConfidence,
    });
  }),

  http.post("*/kyc/upload", async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    if (user.verificationStatus === "locked") {
      return HttpResponse.json({ statusCode: 403, message: "تم إيقاف التحقق، تواصل مع الدعم" }, { status: 403 });
    }
    const body = (await request.json()) as { step: "id-front" | "id-back" | "selfie"; simulateBadQuality?: boolean };
    if (body.simulateBadQuality) {
      user.kyc.attemptsUsed++;
      if (user.kyc.attemptsUsed >= 3) {
        user.verificationStatus = "locked";
      }
      return HttpResponse.json({
        step: body.step,
        accepted: false,
        reason: "جودة الصورة منخفضة، حاول في إضاءة أفضل",
      });
    }
    if (!user.kyc.completedSteps.includes(body.step)) {
      user.kyc.completedSteps.push(body.step);
    }
    return HttpResponse.json({ step: body.step, accepted: true, reason: null });
  }),

  http.post("*/kyc/submit", ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    if (user.kyc.completedSteps.length < 3) {
      return HttpResponse.json({ statusCode: 400, message: "أكمل جميع الخطوات أولًا" }, { status: 400 });
    }
    user.verificationStatus = "pending";
    user.kyc.extractedName = user.fullName;
    user.kyc.nationalIdLast4 = "4821";
    user.kyc.matchConfidence = 91;
    db.kycSubmissions.push({ userId: user.id, submittedAt: new Date().toISOString(), reviewed: false });
    return HttpResponse.json({ ok: true });
  }),
];

/* ---------------------------- payments ---------------------------- */

const PRICES: Record<string, number> = { listing: 100, boost: 75, "matchmaker-refill": 30 };

const paymentHandlers = [
  http.post<never, CreateCheckoutRequest>("*/payments/checkout", async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const body = await request.json();
    const payment = {
      id: nextId("pay"),
      userId: user.id,
      context: body.context,
      propertyId: body.propertyId,
      amountEgp: PRICES[body.context],
      status: "pending" as const,
      entitlementActive: false,
      createdAt: new Date().toISOString(),
    };
    db.payments.push(payment);
    return HttpResponse.json({ checkoutId: payment.id, amountEgp: payment.amountEgp, context: payment.context });
  }),

  // Simulates the Paymob iframe outcome; card number ending in 0000 fails.
  http.post("*/payments/:id/confirm", async ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const payment = db.payments.find((p) => p.id === params.id && p.userId === user.id);
    if (!payment) return HttpResponse.json({ statusCode: 404, message: "غير موجود" }, { status: 404 });
    const body = (await request.json()) as { cardNumber: string };
    if (body.cardNumber.endsWith("0000")) {
      payment.status = "failed";
      return HttpResponse.json({ checkoutId: payment.id, status: "failed", entitlementActive: false });
    }
    payment.status = "success";
    // Simulate webhook latency (ASSUMPTIONS.md #8): entitlement activates on a
    // later poll, not in this response.
    setTimeout(() => {
      payment.entitlementActive = true;
      if (payment.context === "matchmaker-refill") {
        user.quotas.matchLimit += 3;
      } else if (payment.context === "boost" && payment.propertyId) {
        const prop = db.properties.find((p) => p.id === payment.propertyId);
        if (prop) prop.boosted = true;
      } else if (payment.context === "listing" && payment.propertyId) {
        const prop = db.properties.find((p) => p.id === payment.propertyId);
        if (prop && prop.status === "draft") prop.status = "pending";
      }
    }, 1200);
    return HttpResponse.json({ checkoutId: payment.id, status: "success", entitlementActive: false });
  }),

  http.get("*/payments/:id", ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const payment = db.payments.find((p) => p.id === params.id && p.userId === user.id);
    if (!payment) return HttpResponse.json({ statusCode: 404, message: "غير موجود" }, { status: 404 });
    return HttpResponse.json({
      checkoutId: payment.id,
      status: payment.status,
      entitlementActive: payment.entitlementActive,
    });
  }),
];

/* ------------------------------ admin ----------------------------- */

function requireAdmin(request: Request): MockUser | null {
  const user = requireUser(request);
  return user?.role === "admin" ? user : null;
}

let liveQueueTick = 0;

const adminHandlers = [
  http.get("*/admin/session", ({ request }) => {
    const admin = requireAdmin(request);
    if (!admin) return HttpResponse.json({ statusCode: 403, message: "غير مسموح" }, { status: 403 });
    return HttpResponse.json({
      id: admin.id,
      fullName: admin.fullName,
      roleName: "Super Admin",
      capabilities: ["listing:approve", "listing:reject", "kyc:review", "payment:refund", "report:export", "review:delete", "ticket:reply", "pii:reveal", "admin:create", "admin:manage"],
    });
  }),

  http.get("*/admin/queues", ({ request }) => {
    const admin = requireAdmin(request);
    if (!admin) return HttpResponse.json({ statusCode: 403, message: "غير مسموح" }, { status: 403 });

    // Simulate the "live" queue: every few polls a new pending property
    // appears, so the dashboard visibly updates without a manual refresh.
    liveQueueTick++;
    if (liveQueueTick % 4 === 0) {
      const landlord = db.users.find((u) => u.id === "usr_landlord2");
      if (landlord) {
        const neighborhoods = ["توريل", "حي الجامعة", "المشاية", "جديلة", "قولنجيل"];
        const rent = 2500 + Math.floor(Math.random() * 8) * 500;
        db.properties.push({
          ...db.properties[0],
          id: nextId("prop"),
          ownerId: landlord.id,
          title: `شقة جديدة في ${neighborhoods[liveQueueTick % neighborhoods.length]}`,
          neighborhood: neighborhoods[liveQueueTick % neighborhoods.length],
          monthlyRent: rent,
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
      .map((p) => ({
        id: `q_${p.id}`,
        type: "property" as const,
        subjectId: p.id,
        title: p.title,
        subtitle: `${p.neighborhood} · ${p.monthlyRent} ج.م/شهريًا`,
        submittedAt: p.createdAt,
      }))
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

    const kycQueue = db.kycSubmissions
      .filter((s) => !s.reviewed)
      .map((s) => {
        const u = db.users.find((x) => x.id === s.userId);
        return {
          id: `q_kyc_${s.userId}`,
          type: "kyc" as const,
          subjectId: s.userId,
          title: u?.fullName ?? "مستخدم",
          subtitle: "مستخدم جديد بحاجة لمراجعة",
          submittedAt: s.submittedAt,
        };
      })
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

    return HttpResponse.json({ propertyQueue, kycQueue });
  }),

  http.post<{ id: string }, ReviewDecision>("*/admin/properties/:id/review", async ({ request, params }) => {
    const admin = requireAdmin(request);
    if (!admin) return HttpResponse.json({ statusCode: 403, message: "غير مسموح" }, { status: 403 });
    const property = db.properties.find((p) => p.id === params.id);
    if (!property) return HttpResponse.json({ statusCode: 404, message: "غير موجود" }, { status: 404 });
    // Concurrency guard: compare-and-swap on pending (ASSUMPTIONS.md #11).
    if (property.status !== "pending") {
      return HttpResponse.json({ statusCode: 409, message: "تمت مراجعة هذا الطلب بالفعل" }, { status: 409 });
    }
    const body = await request.json();
    property.status = body.decision === "approve" ? "approved" : "rejected";
    property.rejectionReason = body.decision === "reject" ? (body.reason ?? null) : null;
    db.auditLog.push({
      actorId: admin.id,
      action: `listing:${body.decision}`,
      subjectId: property.id,
      at: new Date().toISOString(),
    });
    return HttpResponse.json({ ok: true, status: property.status });
  }),

  http.get("*/admin/kyc/:userId", ({ request, params }) => {
    const admin = requireAdmin(request);
    if (!admin) return HttpResponse.json({ statusCode: 403, message: "غير مسموح" }, { status: 403 });
    const user = db.users.find((u) => u.id === params.userId);
    if (!user) return HttpResponse.json({ statusCode: 404, message: "غير موجود" }, { status: 404 });
    return HttpResponse.json({
      userId: user.id,
      extractedName: user.kyc.extractedName ?? user.fullName,
      nationalIdLast4: user.kyc.nationalIdLast4 ?? "0000",
      matchConfidence: user.kyc.matchConfidence ?? 0,
      submittedAt: db.kycSubmissions.find((s) => s.userId === user.id)?.submittedAt ?? user.createdAt,
    });
  }),

  http.post<{ userId: string }, ReviewDecision>("*/admin/kyc/:userId/review", async ({ request, params }) => {
    const admin = requireAdmin(request);
    if (!admin) return HttpResponse.json({ statusCode: 403, message: "غير مسموح" }, { status: 403 });
    const user = db.users.find((u) => u.id === params.userId);
    const submission = db.kycSubmissions.find((s) => s.userId === params.userId && !s.reviewed);
    if (!user || !submission) {
      return HttpResponse.json({ statusCode: 409, message: "تمت مراجعة هذا الطلب بالفعل" }, { status: 409 });
    }
    const body = await request.json();
    user.verificationStatus = body.decision === "approve" ? "verified" : "unverified";
    submission.reviewed = true;
    db.auditLog.push({
      actorId: admin.id,
      action: `kyc:${body.decision}`,
      subjectId: user.id,
      at: new Date().toISOString(),
    });
    return HttpResponse.json({ ok: true });
  }),
];

/* --------------------------- legal chat --------------------------- */

const LEGAL_KEYWORDS = ["إيجار", "عقد", "قانون", "مالك", "مستأجر", "إخلاء", "شقة", "عقار", "تأمين", "زيادة", "فسخ", "إخطار", "محكمة", "ملكية"];

const chatHandlers = [
  http.post<never, ChatRequest>("*/legal-chat", async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const { message } = await request.json();
    const onTopic = LEGAL_KEYWORDS.some((k) => message.includes(k));
    if (!onTopic) {
      return HttpResponse.json({
        id: nextId("msg"),
        role: "assistant",
        content: "أقدر أساعدك فقط في أسئلة الإيجار والقانون العقاري في مصر.",
        declined: true,
      });
    }
    return HttpResponse.json({
      id: nextId("msg"),
      role: "assistant",
      content:
        "وفقًا للقانون المدني المصري وقانون الإيجار الجديد (القانون رقم 4 لسنة 1996)، العلاقة الإيجارية للعقود الجديدة تحكمها بنود العقد المتفق عليها بين الطرفين. " +
        "بشكل عام: مدة الإخطار قبل إنهاء العقد تكون حسب المتفق عليه في العقد، وإذا لم يُنص عليها فتُطبق أحكام القانون المدني (شهرين للعقارات المؤجرة لأقل من سنة). " +
        "ملاحظة: هذه معلومات إرشادية وليست استشارة قانونية ملزمة — يُنصح بمراجعة محامٍ للحالات الخاصة.",
      declined: false,
    });
  }),
];

export const handlers = [
  ...authHandlers,
  ...propertyHandlers,
  ...matchHandlers,
  ...contactHandlers,
  ...kycHandlers,
  ...paymentHandlers,
  ...adminHandlers,
  ...chatHandlers,
];
