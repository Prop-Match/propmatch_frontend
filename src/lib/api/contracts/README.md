Typed DTOs + Zod schemas mirroring the NestJS backend, per module.

Convention: one file per bounded context (`auth.ts`, `property.ts`, `match.ts`,
`payment.ts`, `verification.ts`, `contract.ts`, `review.ts`, `ticket.ts`,
`notification.ts`, `admin.ts`). Only `common.ts` and `auth.ts` are fleshed out
so far (Phase 0) — the rest get filled in feature-by-feature (Phase 3), each
reconciled against the real ERD/NestJS OpenAPI spec when it lands. See
docs/analysis/data-model.md for the full entity list and which module owns
each one, and ASSUMPTIONS.md for every field-level assumption made in the
meantime.

Every schema here must have a matching MSW handler in `src/mocks/handlers.ts`
so frontend work and tests never block on the live backend.
