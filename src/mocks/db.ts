import type { AccountRole, User, VerificationStatus } from "@/src/lib/api/contracts/auth";
import type { PropertyDetail } from "@/src/lib/api/contracts/property";
import type { ContactRequestStatus } from "@/src/lib/api/contracts/match";
import type { PaymentContext, PaymentStatus } from "@/src/lib/api/contracts/payment";
import type { KycStep } from "@/src/lib/api/contracts/verification";

/**
 * In-memory mock database standing in for the NestJS backend. State lives for
 * the dev-server (or test) process lifetime, which is enough to exercise every
 * flow end-to-end: signup → eKYC → listing → admin approval → matching →
 * contact → payment.
 */

export interface MockUser extends User {
  password?: string;
  kyc: {
    completedSteps: KycStep[];
    attemptsUsed: number;
    extractedName: string | null;
    nationalIdLast4: string | null;
    matchConfidence: number | null;
  };
  quotas: {
    matchUsed: number;
    matchLimit: number;
    optimizerUsed: number;
    optimizerLimit: number;
    freeListingUsed: boolean;
  };
}

export interface MockInquiry {
  id: string;
  propertyId: string;
  tenantId: string;
  status: ContactRequestStatus;
  createdAt: string;
}

export interface MockPayment {
  id: string;
  userId: string;
  context: PaymentContext;
  propertyId?: string;
  amountEgp: number;
  status: PaymentStatus;
  entitlementActive: boolean;
  createdAt: string;
}

export interface MockKycSubmission {
  userId: string;
  submittedAt: string;
  reviewed: boolean;
}

let idCounter = 100;
export const nextId = (prefix: string) => `${prefix}_${idCounter++}`;

function makeUser(
  id: string,
  fullName: string,
  email: string,
  role: AccountRole,
  verificationStatus: VerificationStatus,
): MockUser {
  return {
    id,
    fullName,
    email,
    phone: "01012345678",
    role,
    verificationStatus,
    createdAt: "2026-06-01T10:00:00.000Z",
    kyc: {
      completedSteps: verificationStatus === "verified" ? ["id-front", "id-back", "selfie"] : [],
      attemptsUsed: 0,
      extractedName: verificationStatus === "verified" ? fullName : null,
      nationalIdLast4: verificationStatus === "verified" ? "4821" : null,
      matchConfidence: verificationStatus === "verified" ? 94 : null,
    },
    quotas: { matchUsed: 0, matchLimit: 3, optimizerUsed: 0, optimizerLimit: 2, freeListingUsed: false },
  };
}

const IMG = (slug: string) => `https://images.unsplash.com/${slug}?w=800&h=500&fit=crop&auto=format`;

function makeProperty(
  id: string,
  ownerId: string,
  overrides: Partial<PropertyDetail> & Pick<PropertyDetail, "title" | "neighborhood" | "monthlyRent">,
): PropertyDetail {
  return {
    id,
    ownerId,
    status: "approved",
    boosted: false,
    ownerVerified: true,
    rooms: 2,
    bathrooms: 1,
    area: 100,
    furnished: false,
    coverImage: null,
    location: {
      governorate: "الدقهلية",
      city: "المنصورة",
      neighborhood: overrides.neighborhood,
      street: undefined,
      detailedAddress: `${overrides.neighborhood}، المنصورة، الدقهلية`,
    },
    type: "apartment",
    deposit: overrides.monthlyRent * 2,
    leaseDurationMonths: 12,
    floor: 2,
    hasElevator: true,
    finish: "lux",
    orientation: "bahari",
    amenities: ["water", "electricity", "gas"],
    conditions: {
      familiesOnly: false,
      studentsAllowed: true,
      singlesAllowed: true,
      foreignersAllowed: true,
      childrenAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      minLeaseMonths: 6,
    },
    description:
      "شقة نظيفة ومرتبة في موقع حيوي قريب من الخدمات والمواصلات، تصلح للعائلات والطلبة، بسعر مناسب.",
    photos: [],
    inquiriesCount: 0,
    createdAt: "2026-06-20T09:00:00.000Z",
    rejectionReason: null,
    ...overrides,
  };
}

export interface MockDb {
  users: MockUser[];
  properties: PropertyDetail[];
  inquiries: MockInquiry[];
  payments: MockPayment[];
  kycSubmissions: MockKycSubmission[];
  auditLog: { actorId: string; action: string; subjectId: string; at: string }[];
}

function seed(): MockDb {
  const users: MockUser[] = [
    makeUser("usr_tenant", "أحمد محمود", "tenant@example.com", "tenant", "unverified"),
    makeUser("usr_landlord", "محمد السيد", "landlord@example.com", "landlord", "verified"),
    makeUser("usr_both", "سارة إبراهيم", "both@example.com", "both", "unverified"),
    makeUser("usr_admin", "مشرف المنصة", "admin@example.com", "admin", "verified"),
    makeUser("usr_landlord2", "خالد عبد العزيز", "landlord2@example.com", "landlord", "pending"),
  ];

  const properties: PropertyDetail[] = [
    makeProperty("prop_1", "usr_landlord", {
      title: "شقة مفروشة قرب جامعة المنصورة",
      neighborhood: "حي الجامعة",
      monthlyRent: 4500,
      rooms: 2,
      area: 95,
      furnished: true,
      boosted: true,
      amenities: ["ac", "internet", "kitchen", "water", "electricity"],
      coverImage: IMG("photo-1522708323590-d24dbb6b0267"),
      description:
        "شقة مفروشة بالكامل على بعد دقائق من جامعة المنصورة، تشطيب سوبر لوكس، بها إنترنت فايبر وتكييف في كل غرفة. مثالية للطلبة أو الأطباء العاملين بالمستشفى الجامعي.",
    }),
    makeProperty("prop_2", "usr_landlord", {
      title: "شقة واسعة بحي توريل",
      neighborhood: "توريل",
      monthlyRent: 6000,
      rooms: 3,
      bathrooms: 2,
      area: 150,
      coverImage: IMG("photo-1484154218962-a197022b5858"),
      description:
        "شقة عائلية واسعة في أهدأ مناطق توريل، ٣ غرف وريسبشن كبير، قريبة من المدارس والخدمات، عداد كهرباء ومياه مستقل.",
    }),
    makeProperty("prop_3", "usr_landlord2", {
      title: "ستوديو حديث بالمشاية",
      neighborhood: "المشاية",
      monthlyRent: 3000,
      rooms: 1,
      area: 55,
      furnished: true,
      type: "studio",
      coverImage: IMG("photo-1502672260266-1c1ef2d93688"),
      description: "ستوديو مفروش حديث التشطيب على المشاية السفلية، إطلالة مميزة، يصلح لفرد أو اثنين.",
    }),
    makeProperty("prop_4", "usr_landlord2", {
      title: "شقة عائلية بجديلة",
      neighborhood: "جديلة",
      monthlyRent: 3800,
      rooms: 3,
      area: 120,
      coverImage: IMG("photo-1560448204-e02f11c3d0e2"),
      description: "شقة ٣ غرف بحالة ممتازة في جديلة، دور ثالث بأسانسير، قريبة من الموقف الجديد.",
    }),
    makeProperty("prop_5", "usr_landlord", {
      title: "شقة قيد المراجعة - وسط البلد",
      neighborhood: "وسط البلد",
      monthlyRent: 5200,
      rooms: 2,
      area: 110,
      status: "pending",
      coverImage: IMG("photo-1505873242700-f289a29e1724"),
    }),
  ];

  return {
    users,
    properties,
    inquiries: [
      {
        id: "inq_1",
        propertyId: "prop_1",
        tenantId: "usr_tenant",
        status: "requested",
        createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
      },
    ],
    payments: [],
    kycSubmissions: [{ userId: "usr_landlord2", submittedAt: new Date(Date.now() - 8 * 60_000).toISOString(), reviewed: false }],
    auditLog: [],
  };
}

export let db: MockDb = seed();

/** Test helper — reset all mock state between tests. */
export function resetDb() {
  db = seed();
}

/**
 * Mock tokens are JWT-shaped (unsigned) so proxy.ts's expiry decode works:
 * base64url header + payload {sub, exp} + fake signature.
 */
function fakeJwt(userId: string, ttlSeconds: number): string {
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const header = b64({ alg: "none", typ: "JWT" });
  const payload = b64({ sub: userId, exp: Math.floor(Date.now() / 1000) + ttlSeconds });
  return `${header}.${payload}.mock`;
}

export function findUserByToken(authHeader: string | null): MockUser | null {
  const token = authHeader?.replace(/^Bearer\s+/, "");
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf-8"));
    if (typeof payload.sub !== "string") return null;
    return db.users.find((u) => u.id === payload.sub) ?? null;
  } catch {
    return null;
  }
}

export function tokensFor(user: MockUser) {
  return {
    accessToken: fakeJwt(user.id, 60 * 60),
    refreshToken: fakeJwt(user.id, 60 * 60 * 24 * 7),
    user: toPublicUser(user),
  };
}

export function toPublicUser(user: MockUser): User {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    verificationStatus: user.verificationStatus,
    createdAt: user.createdAt,
  };
}
