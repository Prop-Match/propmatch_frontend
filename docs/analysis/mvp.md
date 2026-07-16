# V1 scope — mapped to the PRO-01…19 backlog

V1 **is** the Sprint Plan. Anything not traceable to a PRO ticket is *Later*.
Status reflects the frontend only (the backend is the team's).

Legend: ✅ done · 🔶 exists but must be reworked to the ERD · ❌ not built

## Sprint 1 — Foundation, data collection, realtime

| Ticket | Frontend scope | Status |
|---|---|---|
| **PRO-01** Infra (NestJS/Next/Postgres/Docker) | Next.js app scaffolded, Tailwind RTL+Cairo, i18n `ar-EG`, TanStack Query, BFF auth shell, mock backend, Jest+MSW | ✅ (single app, not monorepo — `conflicts.md` B1) |
| **PRO-02** Role-based auth (Tenant **or** Landlord), JWT, `@Roles()`, login UI | Role-scoped signup/login, httpOnly cookies via BFF, route guards, role landing | 🔶 signup/login exist; separate-account model now correct; needs contract alignment |
| **PRO-03** Manual eKYC (National ID + Selfie → S3, status `PENDING`) | Upload wizard (ID front/back → selfie), submit → PENDING, statuses, resubmit on reject | 🔶 **rewrite to ERD** (currently license/proof-of-address + cooldown — `conflicts.md` B3) |
| **PRO-04** Property listing form + CRUD, defaults `PENDING` | Multi-step form + multi-image upload, status chips | 🔶 **rewrite fields to ERD** (governorate/city/district/manual_address/property_around_services/has_parking; 3 types; `PROPERTY_IMAGE`) |
| **PRO-05** Tenant request form, defaults `PENDING` | Request form (budget range, locations, type, bedrooms, furnished, flexibility_score, lifestyle_requirements) + draft save | ❌ **not built** |
| **PRO-06** Live admin notifications (Socket.io toasts) | Socket.io client, live toasts for new eKYC/property/request | ❌ (currently polling — must move to Socket.io) |
| **PRO-07** Protected admin dashboard + pending tables | Protected routes, queues fetching PENDING entities | 🔶 exists; extend to 4 queues (eKYC, property, **request**, **review**) |

## Sprint 2 — Moderation, vector DB, AI core

| Ticket | Frontend scope | Status |
|---|---|---|
| **PRO-08** Admin approve/reject (eKYC, properties, reviews, requests) | 4 moderation flows, reject-with-reason, rejected users prompted to re-upload, 409 handling | 🔶 property + eKYC exist; add **requests** + **reviews**; align to ERD |
| **PRO-09** Vector DB pipeline (embeddings on approval) | *Backend-owned.* Frontend: don't present semantic results as exhaustive | n/a (backend) |
| **PRO-10** AI Form Optimizer (before/after, quota) | «تحسين الوصف» button, before/after, `optimizer_uses_left` counter, **streamed** | 🔶 exists; add streaming + ERD quota field |
| **PRO-11** Hybrid search (SQL filters + semantic → match score) | *Backend-owned.* Frontend: filters UI + ranked results + score rings | 🔶 score ring exists; intake must become `TENANT_REQUEST` |
| **PRO-12** Reverse-marketplace API (offer → tenant request) | *Backend-owned.* | n/a (backend) |
| **PRO-13** Matchmaker & Offers UI (tenant results, landlord request browsing, Send Offer form) | Landlord browses approved requests w/ match score; Send Offer (property + pitch + price); tenant results | ❌ **not built — the core differentiator** |

## Sprint 3 — Monetization, B2B, chatbot, launch

| Ticket | Frontend scope | Status |
|---|---|---|
| **PRO-14** Paymob iframe + webhook-driven quota | Payment sheet, 4 `payment_type`s, post-success quota poll | 🔶 exists; align `payment_type` enum (add `OFFER_PACK`), real iframe |
| **PRO-15** Contract generator → PDF (merges eKYC data) | Form → HTML→PDF, auto-fill verified names/national IDs (with consent), download | 🔶 exists client-side; move to backend PDF + persist `LEASE_CONTRACT` |
| **PRO-16** B2B lead gen (Moving/Insurance opt-in after acceptance) | Opt-in UI post-acceptance → `PARTNER_LEAD` | ❌ **not built** |
| **PRO-17** Legal chatbot (RAG, off-topic decline) | Chat UI, **streamed**, graceful decline, `transfer_to_human_support` | 🔶 UI exists; add streaming + real endpoint |
| **PRO-18** Freemium enforcer (quota decrement + paywall modal at 0) | Quota chips, paywall modals, **feature-flagged** for free launch | 🔶 exists; align to `USER_QUOTA` fields |
| **PRO-19** Deploy (Vercel) + responsive + E2E | Deploy, mobile-responsive, E2E | ❌ |

## Also required by the ERD/SRS but not its own ticket

| Item | Where | Status |
|---|---|---|
| `FAVORITE` (tenant bookmarks) | ERD; prompt §8.7 | ❌ |
| `PROPERTY_REVIEW` submit (1–5★ + comment → PENDING) | ERD; SRS 3.7; PRO-08 moderates it | ❌ (submit side) |
| `MATCH_CONNECTION` + **phone reveal** | ERD; SRS 3.4 | ❌ (current reveal uses a non-ERD "inquiry") |
| `NOTIFICATION` bell w/ ERD `type` enum | ERD; PRO-06 | 🔶 sample data → real entity |
| Admin **Payment Records** + **Partner Lead Records** (Recharts) | prompt §8.13 | 🔶 stats page exists; repoint to real entities |

## Build order (recommended)

1. **Phase 2** — delete out-of-scope code; rewrite contracts to the ERD;
   rebuild the mock backend. *Nothing else can be correct until this lands.*
2. **Vertical slice: reverse marketplace** (PRO-05 → 13 → 16) — highest risk,
   the differentiator, and it exercises quota + PII gate + notifications.
3. eKYC to ERD (PRO-03) + property fields (PRO-04) + 4 moderation queues (PRO-08).
4. Socket.io (PRO-06) replacing polling.
5. Payments/quotas (PRO-14/18) · contract (PRO-15) · streamed AI (PRO-10/17).
6. Favorites · reviews · deploy (PRO-19).

## Explicitly *Later* (documented, not built)

In-platform messaging · viewings/appointments · deal-completion lifecycle
(Shortlisted→Viewing→Completed) · mutual tenant↔owner reputation · deal-evidence
/ move-in record · **BROKER** role + broker teams · advanced analytics ·
premium subscriptions · extra partner services · admin sub-roles & audit UI ·
customer-support ticketing. See `conflicts.md` A2/A3/A4/A7/A8 + B2.
