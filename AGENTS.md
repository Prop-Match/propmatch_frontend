# PropMatch AI — frontend

Broker-free long-term rental marketplace launching in Mansoura, Egypt.
Next.js (App Router) + TypeScript, consuming a NestJS backend that does not
exist in this workspace yet (see `.env.example` / `src/mocks` — MSW mocks
stand in for it).

## Sources of truth, ranked

1. ERD + form field specs — not yet provided as a dedicated file; form fields
   ARE fully specified (verbatim Arabic labels) in
   `../PropMatch AI - UI Generation Prompt.md` Section 3A. No ERD yet —
   entities are inferred from the SRS and logged in `ASSUMPTIONS.md`.
2. NestJS backend API contracts — none exist yet. `src/lib/api/contracts` is
   this project's best guess, reconciled against the real backend as it's
   built.
3. `../PropMatch AI - UI Generation Prompt.md` — authoritative for screens,
   flows, states, and all on-screen Arabic copy (Section 12 glossary is
   verbatim truth). Note: `reference/figma-tenant-prototype/src/imports/`
   contains an *earlier* draft of this same spec with slightly different
   wording — the UI Generation Prompt supersedes it; see
   `docs/analysis/requirements.md` for the diff.
4. Figma file (`https://www.figma.com/design/biM1NAvpeLu37J5Mwfiky2`) — design
   tokens + full Tenant flow already built in RTL Egyptian Arabic.
5. `../PropMatch AI - SRS.docx` — functional/non-functional requirements,
   intended backend architecture (NestJS + Prisma/PostgreSQL + ChromaDB RAG +
   Paymob + WebSockets).

## Non-negotiables

- 100% Arabic UI, fully RTL (`<html lang="ar" dir="rtl">` in `app/layout.tsx`).
  Western Arabic numerals, `ج.م` price suffix, Cairo font, no emojis
  (Lucide icons only).
- eKYC verifies identity only, never ownership — always pair a verified badge
  with the ownership disclaimer.
- Owner phone / full PII stays hidden until both parties accept a match.
- Freemium quotas are enforced server-side; client state only mirrors them.
- Paymob direct EGP only — no wallets/points/escrow/BNPL.
- No maps/GPS, no in-app scheduling, no conversational contract drafting
  (form-to-PDF only). See the UI Generation Prompt Section 9 for the full
  out-of-scope list.

## Repo layout

- `app/` — Next.js App Router routes + BFF Route Handlers (`app/api/**`).
- `src/lib/api/` — `client.ts` (server-only NestJS fetch wrapper),
  `cookies.ts` (httpOnly auth cookies), `contracts/` (Zod DTOs mirroring the
  backend).
- `src/mocks/` — MSW handlers mirroring every contract; wired into the server
  runtime via `instrumentation.ts` when `API_MOCKING=enabled`, and into Jest
  via `jest.setup.ts`.
- `src/features/`, `src/components/`, `src/hooks/`, `src/types/`,
  `src/utils/` — feature-based architecture, see `src/features/README.md`.
- `src/lib/store/` — Zustand stores for client-only UI state (never
  entitlements — those are server-authoritative).
- `proxy.ts` (Next.js 16's renamed `middleware.ts`) — coarse auth-gate redirect only; real authorization is
  enforced server-side (401/403 from the backend).
- `reference/figma-tenant-prototype/` — a Figma Make export of an earlier
  Vite/React prototype (Tenant flow). Kept as visual/structural reference for
  porting screens into `app/`, not part of the build.
- `docs/analysis/` — Phase 1 analysis docs (requirements, feature
  relationships, MVP prioritization, RBAC matrix, data model).
- `ASSUMPTIONS.md` — every assumption made in the absence of the ERD/OpenAPI
  spec, with rationale and how to confirm it.

## Working agreement

Build feature-by-feature (components/hooks/services/validation/types/tests
per feature). Never invent business rules silently — if a rule is
unspecified, either ask or implement a minimal default and log it in
`ASSUMPTIONS.md`. Definition of done per feature: typed (`no-any`), lints
clean, RTL-correct against the design tokens, all four UI states present
(happy/loading/empty/error), permission-checked, audited where critical,
tested, documented.
