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
| **PRO-05** Tenant request form, defaults `PENDING` | Request form (budget range, locations, type, bedrooms, furnished, flexibility_score, lifestyle_requirements) + draft save | ✅ form + `/tenant/requests` list (close, offer count, reject reason). **Draft save not built** — requests go straight to PENDING |
| **PRO-06** Live admin notifications (Socket.io toasts) | Socket.io client, live toasts for new eKYC/property/request | ✅ gateway on the mock (cookie-auth handshake, `user:<id>` + `admins` rooms); client pushes into the query cache; polls only while disconnected. **Backend must match the handshake — ASSUMPTIONS #28** |
| **PRO-07** Protected admin dashboard + pending tables | Protected routes, queues fetching PENDING entities | ✅ all 4 queues, each capability-gated |

## Sprint 2 — Moderation, vector DB, AI core

| Ticket | Frontend scope | Status |
|---|---|---|
| **PRO-08** Admin approve/reject (eKYC, properties, reviews, requests) | 4 moderation flows, reject-with-reason, rejected users prompted to re-upload, 409 handling | ✅ all 4 via shared `ModerationBar`; reject demands a reason; 409 handled |
| **PRO-09** Vector DB pipeline (embeddings on approval) | *Backend-owned.* Frontend: don't present semantic results as exhaustive | n/a (backend) |
| **PRO-10** AI Form Optimizer (before/after, quota) | «تحسين الوصف» button, before/after, `optimizer_uses_left` counter, **streamed** | 🔶 exists; add streaming + ERD quota field |
| **PRO-11** Hybrid search (SQL filters + semantic → match score) | *Backend-owned.* Frontend: filters UI + ranked results + score rings | ✅ `SearchFilters` (city/type/rent/bedrooms/furnished) + free-text `q`; ranking left server-side |
| **PRO-12** Reverse-marketplace API (offer → tenant request) | *Backend-owned.* | n/a (backend) |
| **PRO-13** Matchmaker & Offers UI (tenant results, landlord request browsing, Send Offer form) | Landlord browses approved requests w/ match score; Send Offer (property + pitch + price); tenant results | ✅ `/landlord/requests` (scored, verification-gated), Send Offer sheet (quota + OFFER_PACK paywall), `/landlord/offers`, tenant inbox `/tenant/offers` w/ accept → reveal |

## Sprint 3 — Monetization, B2B, chatbot, launch

| Ticket | Frontend scope | Status |
|---|---|---|
| **PRO-14** Paymob iframe + webhook-driven quota | Payment sheet, 4 `payment_type`s, post-success quota poll | 🔶 exists; align `payment_type` enum (add `OFFER_PACK`), real iframe |
| **PRO-15** Contract generator → PDF (merges eKYC data) | Form → HTML→PDF, auto-fill verified names/national IDs (with consent), download | 🔶 exists client-side; move to backend PDF + persist `LEASE_CONTRACT` |
| **PRO-16** B2B lead gen (Moving/Insurance opt-in after acceptance) | Opt-in UI post-acceptance → `PARTNER_LEAD` | ✅ opt-in sheet fires on accept; explicit, nothing pre-ticked |
| **PRO-17** Legal chatbot (RAG, off-topic decline) | Chat UI, **streamed**, graceful decline, `transfer_to_human_support` | 🔶 UI exists; add streaming + real endpoint |
| **PRO-18** Freemium enforcer (quota decrement + paywall modal at 0) | Quota chips, paywall modals, **feature-flagged** for free launch | 🔶 exists; align to `USER_QUOTA` fields |
| **PRO-19** Deploy (Vercel) + responsive + E2E | Deploy, mobile-responsive, E2E | ❌ |

## Also required by the ERD/SRS but not its own ticket

| Item | Where | Status |
|---|---|---|
| `FAVORITE` (tenant bookmarks) | ERD; prompt §8.7 | ✅ optimistic toggle on cards/detail + `/tenant/favorites` |
| `PROPERTY_REVIEW` submit (1–5★ + comment → PENDING) | ERD; SRS 3.7; PRO-08 moderates it | ✅ submit sheet + public list w/ average & distribution |
| `MATCH_CONNECTION` + **phone reveal** | ERD; SRS 3.4 | ✅ accept → CONNECTED → reveal, via `ContactRevealCard`; gate covered by `src/mocks/__tests__/reverseMarketplace.test.ts` |
| `NOTIFICATION` bell w/ ERD `type` enum | ERD; PRO-06 | ✅ real entity, live over socket, server-owned read state. *Was crashing:* it read `n.kind`/`n.at`, which the API never sends → undefined icon → "Element type is invalid" took down the whole nav for any user with a notification |
| Admin **Payment Records** + **Partner Lead Records** (Recharts) | prompt §8.13 | 🔶 stats page exists; repoint to real entities |

## Build order (recommended)

1. ~~**Phase 2** — delete out-of-scope code; rewrite contracts to the ERD;
   rebuild the mock backend.~~ ✅ done.
2. ~~**Vertical slice: reverse marketplace** (PRO-05 → 13 → 16)~~ ✅ done —
   exercises quota + PII gate together.
3. ~~4 moderation queues (PRO-08 remainder)~~ ✅ done — all four clear.
4. ~~Favorites · reviews submit · PRO-11 filters~~ ✅ done.
5. ~~Socket.io (PRO-06)~~ ✅ done — Sprint 1 is now fully closed.
6. **Streamed AI (PRO-10/17)** — the last buildable frontend ticket. Needs an
   SSE/stream endpoint; the mock returns whole responses today.
7. Backend PDF + persisted `LEASE_CONTRACT` (PRO-15) — *backend-owned.*
8. Deploy + E2E (PRO-19) — needs a Vercel project and credentials.

## Out-of-backlog surfaces (restored — conflicts.md B2-R)

| Surface | Status | Risk |
|---|---|---|
| Admin team/RBAC + 7 sub-roles (`/admin/team`) | ✅ built | **No ERD entity, no PRO ticket, no backend.** ASSUMPTIONS #26 |
| Audit log + login history (`/admin/activity`) | ✅ built, fed by real actions | same |
| Support ticketing (`/admin/support`) | ✅ admin side only | same; no customer half (ASSUMPTIONS #27) |

## Explicitly *Later* (documented, not built)

In-platform messaging · viewings/appointments · deal-completion lifecycle
(Shortlisted→Viewing→Completed) · mutual tenant↔owner reputation · deal-evidence
/ move-in record · **BROKER** role + broker teams · advanced analytics ·
premium subscriptions · extra partner services · admin sub-roles & audit UI ·
customer-support ticketing. See `conflicts.md` A2/A3/A4/A7/A8 + B2.
