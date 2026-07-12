# RBAC design

Capability-based, not role-name-based — UI and route guards check
capabilities (`src/lib/api/contracts/common.ts`'s `CapabilitySchema`), never
`if (role === "SuperAdmin")`. Roles are just named bundles of capabilities,
assigned server-side; the frontend never hardcodes which capabilities a role
has beyond what the backend returns on the session/user payload.

## Starting role set (confirm against ERD when it lands)

- **Super Admin** — every capability, including `admin:create`/`admin:manage`.
- **Property/Listings Manager** — `listing:approve`, `listing:reject`.
- **Verification (eKYC) Reviewer** — `kyc:review`.
- **Finance Admin** — `payment:refund`, `report:export`.
- **Reviews Manager** — `review:delete`.
- **Customer Support** — `ticket:reply`, and `pii:reveal` scoped to an
  active ticket (see enforcement note below).
- **Read-only Viewer** — no mutating capabilities; dashboards/reports only.

## Capability matrix

| Capability | Super Admin | Listings Mgr | eKYC Reviewer | Finance Admin | Reviews Mgr | Support | Viewer |
|---|---|---|---|---|---|---|---|
| `listing:approve` / `listing:reject` | ✅ | ✅ | — | — | — | — | — |
| `kyc:review` | ✅ | — | ✅ | — | — | — | — |
| `payment:refund` | ✅ | — | — | ✅ | — | — | — |
| `report:export` | ✅ | — | — | ✅ | — | — | — |
| `review:delete` | ✅ | — | — | — | ✅ | — | — |
| `ticket:reply` | ✅ | — | — | — | — | ✅ | — |
| `pii:reveal` | ✅ | — | — | — | — | ✅ (scoped, audited) | — |
| `admin:create` / `admin:manage` | ✅ | — | — | — | — | — | — |

`pii:reveal` for Support is intentionally the one capability granted outside
Super Admin without a dedicated "owns this domain" rationale — flagged in
`requirements.md` as a security-sensitive default that should be confirmed,
not assumed permanent. Every use must write an AuditLog entry with a reason
string (dispute/support case reference), not just the actor and timestamp.

## Enforcement layers (all three required, per the master prompt)

1. **`middleware.ts`** — coarse route-prefix gate (`/admin/*`, `/landlord/*`,
   `/profile/*`) checking token *presence + expiry* only (Edge runtime can't
   verify the backend's JWT signature). Redirects to `/login` on failure.
   This is a UX optimization, not a security boundary.
2. **Server-side (Route Handlers / Server Components / Server Actions)** —
   every mutation calls the backend with the user's access token; the
   backend's 401/403 is authoritative. The frontend must never assume a
   capability locally without the backend confirming it on the actual
   mutating call.
3. **UI** — hide/disable controls the current user's capability set doesn't
   include, so users aren't shown affordances that will 403. This is
   convenience, not enforcement — capabilities arriving on the session
   payload must be treated as a hint, re-verified server-side per (2).

## PII reveal — special case

`pii:reveal` gates two distinct things that must not be conflated:

- **Match-based reveal** (tenant ⇄ landlord, post-mutual-acceptance) is not
  an admin capability at all — it's a state transition on the Match entity
  itself, checked per-match, not via the admin capability matrix above.
- **Support-based reveal** (an admin looking up a user's PII to resolve a
  ticket/dispute) *is* the `pii:reveal` capability above, and is the only
  path where an admin capability directly exposes tenant/landlord PII
  outside the parties' own consent. Requires a reason string, is always
  audited, and should be rate-limited/flagged for review (backend concern,
  noted here so the frontend's reveal UI always collects and submits the
  reason).

## Open questions for the team

- Does the real backend model roles as a fixed enum or a dynamic
  role→capability table (admin-configurable)? Assumption above is a fixed
  starting set; if dynamic, `admin:manage` should include role/capability
  editing UI (not currently scoped in V1, see `mvp.md`).
- Should `Read-only Viewer` be a distinct role, or just "any role with all
  mutating capabilities stripped"? Assumption: distinct role, since it's the
  simplest mental model for admins/investors who need visibility without
  edit rights.
