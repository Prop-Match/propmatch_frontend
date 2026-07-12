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
`.env.local` (`API_MOCKING=enabled`), the BFF Route Handlers under
`app/api/**` are served by the MSW mocks in `src/mocks/` — no backend
required.

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
