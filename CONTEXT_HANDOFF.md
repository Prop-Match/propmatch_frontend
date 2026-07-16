# PropMatch AI — Context Handoff

Everything a new session/model needs to continue. **Current position: Phase 0,
1 and 2 are done and committed; Phase 3 (the reverse-marketplace UI + the rest
of the PRO backlog) is next.**

- Repo: `C:\Users\TUF\OneDrive\Desktop\PropMatch Ai\propmatch_frontend`
- Branch: `dev` · working tree clean · HEAD = `79cb18b`
- Health: **typecheck + lint + 21 tests + `next build` all green**

---

## 1. What this is

**PropMatch AI** — a broker-free, AI-powered, **dual-discovery** residential
rental marketplace for Egypt (launching in Mansoura). ITI graduation capstone,
3-week / 3-sprint MVP. Roles: **Tenant (مستأجر) · Landlord (مالك) · Admin (مشرف)**.

This repo is the **Next.js frontend only**. The NestJS + PostgreSQL backend is
the team's and does not exist yet — an in-process **mock backend** stands in for
it. Arabic-first, fully RTL, Cairo font, no emojis (Lucide only), Western
numerals, prices suffixed `ج.م`.

### The differentiator — dual discovery
1. **Standard marketplace**: tenants browse approved properties; hybrid search =
   hard SQL filters + semantic search (ChromaDB) over free-text.
2. **Reverse marketplace** (the star, *not yet built in the UI*): tenant posts a
   `TENANT_REQUEST` → admin approves (anti-spam) → verified landlords browse it
   with a match score → landlord sends an `OWNER_OFFER` (property + pitch +
   price) → tenant accepts → `MATCH_CONNECTION` CONNECTED → **phone reveal** →
   B2B partner opt-in (`PARTNER_LEAD`).

## 2. Source docs (ranked — higher wins; log conflicts)

All live in the **parent folder** `../`:
1. **`PropMatch AI - Final ERD.docx`** — authoritative for the data model.
2. **`PropMatch AI - SRS (Final - July 16).docx`** — functional/non-functional.
3. **`PropMatch AI - Sprint Plan (Final - July 16).docx`** — V1 scope, PRO-01…19.
4. **`PropMatch AI Full Features.docx`** — feature depth/Arabic UX, *except*
   where it conflicts with 1–3.
5. Figma `https://www.figma.com/design/biM1NAvpeLu37J5Mwfiky2` — tokens + the
   **tenant flow only**.
6. The build prompt the user pastes (fills gaps, sets standards).

> Extract a .docx with: `cd ".."; $env:PYTHONIOENCODING="utf-8"; python.exe extract_doc.py "<file>.docx"`

**Read these repo docs first — they hold all the reasoning:**
- `docs/analysis/conflicts.md` — every source conflict + resolution, the
  decisions taken, the code-vs-ERD divergence table, and **8 open `[CONFIRM]`
  items for the backend team**.
- `docs/analysis/requirements.md`, `feature-relationships.md`, `rbac.md`,
  `mvp.md` (PRO backlog mapping w/ status), `ASSUMPTIONS.md` (22 entries).

## 3. Locked decisions (do NOT re-litigate)

1. **Separate account per role.** `USER.role` is a single enum. Someone who is
   both owner and tenant makes two accounts, each with its own eKYC. **No
   unified account, no role switching.** (Full-Features §2.1 is overruled.)
2. **Broker is Later** — V1 roles are TENANT/LANDLORD/ADMIN. RBAC is
   capability-based so `BROKER` slots in later; never hardcode role names.
3. **Build only PRO-01…19.** Messaging, viewings, deal lifecycle, mutual
   reputation, broker teams, subscriptions, admin sub-roles, support ticketing
   = *Later* (documented, not built).
4. Decisions taken with the user this session (see `conflicts.md` B1–B3):
   - **Single Next.js app**, *not* the monorepo the prompt specifies.
   - **Deleted** the out-of-scope modules (support tickets/AI chat, admin
     team/RBAC UI, audit log, login history).
   - **eKYC rewritten to the ERD** (national ID + selfie), replacing an earlier
     document model (license/proof-of-address + 24h cooldown) built to a
     superseded prompt.

## 4. Stack & conventions

Next.js 16 App Router · TS strict (`no-any`) · Tailwind v4 `@theme` tokens ·
TanStack Query · Zustand (UI only) · RHF + Zod · Recharts · next-intl (`ar`) ·
Jest + RTL + MSW. `middleware.ts` is renamed **`proxy.ts`** (Next 16; exported
fn is `proxy`).

**Two traps that will bite you:**
- `src/utils/cn.ts` uses `extendTailwindMerge` to register the custom text-size
  tokens (`text-body`…). Without it tailwind-merge treats them as text-*colors*
  and **strips `text-white` from every Button**. Keep it.
- `ar-EG` `Intl` defaults to Eastern Arabic-Indic digits → all formatters pin
  `numberingSystem: "latn"` in `src/utils/format.ts`. Never call Intl directly.

## 5. Architecture

```
app/
  (auth)/      login, signup, forgot-password
  (tenant)/    /tenant (browse), /tenant/legal, /tenant/properties/[id]
  (landlord)/  /landlord, properties/new, properties/[id], verify
  (admin)/     /admin (queues), /admin/reports, properties/[id], users/[id]
  (shared)/    /profile, /contracts/new
  api/auth/*             BFF: mints/clears httpOnly cookies
  api/backend/[...path]  generic BFF proxy → attaches token → backend
src/lib/api/
  client.ts / browserClient.ts / cookies.ts / serverSession.ts
  contracts/*    Zod DTOs — ONE FILE PER ERD ENTITY (see contracts/README.md)
src/mocks/
  db.ts          in-memory, table-per-ERD-entity + seed
  router.ts      THE WHOLE MOCK API (dispatch fn) — single source of truth
  standalone.ts  real HTTP server on NESTJS_API_URL port (via instrumentation.ts)
  handlers.ts    one MSW passthrough → router.ts (Jest only)
src/features/    admin, auth, contracts, ekyc, landlord, legal, listings,
                 payments, profile
src/components/  ui/ primitives + nav/ + PropertyCard
```

**Why a standalone mock HTTP server, not MSW interception:** MSW inside Next 16
was unreliable for nested RSC → route-handler → backend calls (intermittent
ECONNREFUSED). The mock is a real server; the same `router.ts` also backs Jest.

## 6. Non-negotiables baked in

- **PII reveal is enforced by OMISSION.** The backend must not serialise
  `ownerPhoneNumber` / `manualAddress` until *this* viewer has an **ACCEPTED
  offer** or **CONNECTED match**. Never client-side hiding. It is a
  **per-connection** gate, not a role capability — `PROPERTY.contact_revealed`
  (a per-property boolean) is too coarse. (`rbac.md`, `requirements.md` §1.2.)
- **eKYC verifies identity, NOT ownership** — always pair a verified badge with
  `<OwnershipDisclaimer />`.
- **Never** send ID images to any AI/LLM or store them in the vector DB. Mask
  `national_id` to last 4 everywhere except the admin review screen + the PDF.
- **Progressive verification**: unverified users browse/draft; verification is
  required to publish a listing/request, accept an offer, reveal contact.
- Server is the entitlement authority; `proxy.ts` is UX only; NestJS `@Roles()`
  is final.

## 7. State vs. the PRO backlog (see `docs/analysis/mvp.md` for detail)

**Working:** PRO-02 auth (explicit Tenant/Landlord signup) · PRO-03 eKYC
(national ID+selfie, ERD statuses) · PRO-04 property listing (ERD fields, 3
types, PENDING default) · PRO-07/08 *partial* admin dashboard + property/eKYC
review · PRO-10 optimizer · PRO-14 Paymob sheet · PRO-15 contract → print-PDF ·
PRO-17 legal chat UI · PRO-18 quotas/paywalls.

**Mock API exists but NO UI yet (Phase 3):**
- **PRO-05** tenant request form → `POST /tenant/requests`
- **PRO-13** landlord browses approved requests (`GET /landlord/requests`, with
  match score) + **Send Offer** (`POST /landlord/offers`) + tenant offer inbox
  (`GET /tenant/offers`, `.../view|accept|reject`) → accept returns owner name/
  phone/address + creates the connection
- **PRO-16** B2B opt-in → `POST /partner-leads`
- Favorites (`/tenant/favorites`), review submit (`POST /reviews`),
  notifications (`GET /notifications`), request+review moderation
  (`POST /admin/requests|reviews/:id/review`) — all mocked, no UI.

**Not built at all:** PRO-06 **Socket.io** realtime (currently polling) ·
streamed AI (PRO-10/17) · PRO-19 deploy/E2E · backend PDF (`LEASE_CONTRACT`
persisted).

## 8. Run it

```bash
cd propmatch_frontend
npm install
cp .env.example .env.local     # API_MOCKING=enabled → mock backend auto-starts
npm run dev                    # http://localhost:3000
```
Seeded logins (any password ≥ 8 chars, e.g. `password123`):

| Email | Role | State |
|---|---|---|
| `tenant@example.com` | tenant | **no** eKYC row → NOT_SUBMITTED |
| `tenant2@example.com` | tenant | eKYC APPROVED, owns approved request `req_1` |
| `landlord@example.com` | landlord | eKYC APPROVED, owns `prop_1/2/5` |
| `landlord2@example.com` | landlord | eKYC **PENDING** (sits in admin queue) |
| `admin@example.com` | admin | flat ADMIN, all capabilities |

Seeded moderation queue: `prop_5` (PENDING), `landlord2` eKYC (PENDING),
`req_2` (PENDING), `rev_2` (PENDING).

Verify with: `npx tsc --noEmit && npx eslint . && npx jest && npx next build`.

**The user asked NOT to use the Claude Browser pane for testing right now** —
verify via tsc/eslint/jest/build and Node/API-level checks instead.

## 9. Recommended next step — Phase 3

Build the **reverse-marketplace vertical slice** first (PRO-05 → 13 → 16): it's
the differentiator, the highest-risk integration, and it exercises quota + the
PII gate + notifications together. Then: 4 moderation queues (PRO-08 remainder)
→ Socket.io (PRO-06) → favorites/reviews → streamed AI → deploy (PRO-19).

The mock API for all of it already exists — read `src/mocks/router.ts` for the
exact request/response shapes, and `src/lib/api/contracts/*` for the types.

## 10. Working agreement

- **Never invent business logic.** If a rule is unspecified, ask, or implement a
  clearly-flagged minimal default and log it in `ASSUMPTIONS.md`.
- Definition of done per feature: typed & `no-any`, lints clean, RTL-correct +
  Figma-faithful, all four UI states (happy/loading/empty/error),
  permission-checked, tested, documented.
- Small commits. Keep `ASSUMPTIONS.md` + `conflicts.md` current.
- Recent commits also come from the team's own Codex sessions (merged PRs) —
  always `git log`/`git status` before assuming tree state.
