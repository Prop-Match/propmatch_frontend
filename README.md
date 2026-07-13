# PropMatch AI — Frontend

Broker-free long-term rental marketplace for Mansoura, Egypt. Next.js (App
Router) + TypeScript frontend, Arabic-first and fully RTL, consuming a
NestJS backend (mocked locally via MSW until the real backend exists).

See [`AGENTS.md`](./AGENTS.md) for architecture, conventions, and sources of
truth, and [`ASSUMPTIONS.md`](./ASSUMPTIONS.md) for every assumption made
pending the real ERD/backend contracts.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With the default
`.env.local` (`API_MOCKING=enabled`), a standalone in-process mock backend
(`src/mocks/`) starts on the `NESTJS_API_URL` port and serves every endpoint
— no real backend required. Seeded demo logins (any password ≥ 8 chars):

- `tenant@example.com` — tenant
- `landlord@example.com` — verified landlord
- `both@example.com` — dual-role
- `admin@example.com` — admin dashboard

### What's implemented

Auth (3-way role signup) · eKYC wizard (lock-after-3) · tenant browse +
PII-gated contact · smart matching (hybrid intake + RAG field, score rings,
quota paywall) · landlord dashboard + multi-step add-property wizard (AI
optimize, first-free/Paymob) + boost + inquiries · reusable Paymob payment
sheet · contract generator (form → PDF) · legal chatbot (on-topic guardrail)
· admin live queues + property/eKYC review + financial reports · AI-first
customer support with human escalation (tickets) · admin & RBAC management
(team, roles, capability gating, audit log + login history) · profile +
dual-role switch.

## Scripts

- `npm run dev` — start the dev server.
- `npm run build` / `npm run start` — production build/start.
- `npm run lint` — ESLint.
- `npm run format` — Prettier, write mode.
- `npm test` / `npm run test:watch` — Jest + React Testing Library.

## Project structure

```
app/                 # Next.js App Router routes + BFF Route Handlers (app/api/**)
src/lib/api/          # contracts (Zod DTOs), typed backend fetch client, auth cookies
src/lib/store/         # Zustand client-UI state
src/mocks/            # MSW handlers mirroring the backend contracts
src/features/          # feature modules (components/hooks/services/validation/types/tests)
src/components/        # shared design-system primitives
docs/analysis/        # requirements, feature relationships, MVP plan, RBAC, data model
reference/figma-tenant-prototype/  # earlier Figma Make export, kept for reference only
```

## Deploy

Standard Next.js deployment (Vercel or any Node host). Set `NESTJS_API_URL`
to the real backend and `API_MOCKING=disabled` (or unset) before deploying —
see `.env.example`.
