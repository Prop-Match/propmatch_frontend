# RBAC — capability-based (V1: TENANT · LANDLORD · ADMIN)

**Roles say who you are; capabilities say what you may do; eKYC + moderation
state say whether you may do it *yet*.** Never hardcode a role name in UI or
logic — check a capability. This is what lets `BROKER` be added later without
rework (build-prompt §1.2/§10).

The NestJS backend's `@Roles()` guards are the **final authority**. Everything
here is defence-in-depth + UX.

## Roles

| Role | Source | Notes |
|---|---|---|
| `TENANT` | `USER.role` (ERD) | Free. Browses, posts requests, favorites, reviews, accepts offers. |
| `LANDLORD` | `USER.role` (ERD) | Revenue source. Listings, offers, boosts, packs. Has `USER_QUOTA`. |
| `ADMIN` | `USER.role` (ERD) | Moderates eKYC / properties / requests / reviews; views payment + partner-lead records. |
| `BROKER` | **Later** | Reserved. Would receive a capability subset (likely `listing:create`, `offer:send` on behalf of owners). Do not add to the enum in V1. |

## Capabilities

```
listing:create      listing:archive     listing:boost
request:create      request:close
offer:send          offer:accept        offer:reject
review:create
favorite:manage
contract:generate
pii:reveal          # see the gate below — not an admin power in V1
property:approve    property:reject
kyc:review
request:approve     request:reject
review:moderate
payment:view
partner_lead:view
```

## Matrix

| Capability | TENANT | LANDLORD | ADMIN |
|---|---|---|---|
| `listing:create` / `listing:archive` / `listing:boost` | — | ✅ (eKYC `APPROVED`) | — |
| `request:create` / `request:close` | ✅ (eKYC `APPROVED` to publish) | — | — |
| `offer:send` | — | ✅ (eKYC `APPROVED` + `free_offers_left` > 0 or paid) | — |
| `offer:accept` / `offer:reject` | ✅ (eKYC `APPROVED` to accept) | — | — |
| `review:create` | ✅ (eKYC `APPROVED`) | — | — |
| `favorite:manage` | ✅ | — | — |
| `contract:generate` | ✅ | ✅ | — |
| `pii:reveal` | ⛔ *not a role capability* — see below | ⛔ | ⛔ |
| `property:approve` / `property:reject` | — | — | ✅ |
| `kyc:review` | — | — | ✅ |
| `request:approve` / `request:reject` | — | — | ✅ |
| `review:moderate` | — | — | ✅ |
| `payment:view` / `partner_lead:view` | — | — | ✅ |

**V1 keeps a single flat ADMIN.** The previous build's 7 sub-roles
(super-admin / listings-manager / kyc-reviewer / …) were removed — the ERD has
no admin-role table and the backlog has no admin-management ticket. If the team
later wants scoped admins, add an `ADMIN_ROLE` entity and assign capability
bundles; the capability layer here already supports it.

## The PII-reveal gate (safety-critical — not a role check)

Phone + `manual_address` are **never** unlocked by a role. They unlock on a
**relationship state**:

> `OWNER_OFFER.status = ACCEPTED` (or `MATCH_CONNECTION.status = CONNECTED`)
> between *this* tenant and *this* property.

Rules:
- The gate is **per connection**, not per property or per role. (`PROPERTY.
  contact_revealed` is a per-property boolean and cannot express this — see
  `requirements.md` §1.2.)
- Enforced by **omission**: the backend must not send the fields at all until
  the gate passes. The client never "hides" PII it already holds.
- Admins do **not** get `pii:reveal` in V1 (no support/dispute tooling is in
  scope). If added later it must require a reason + audit entry.

## Enforcement layers

1. **`proxy.ts`** — coarse route-prefix gate (`/tenant`, `/landlord`, `/admin`)
   on token presence/expiry. Edge runtime can't verify the signature → **UX
   only, not security**.
2. **Server (Route Handlers / RSC)** — session from `/api/auth/me`; role +
   capability + eKYC state checked before rendering role-scoped surfaces; the
   backend's 401/403 is authoritative and must degrade safely.
3. **UI** — hide/disable what the user can't do (and explain *why*: «وثّق
   هويتك أولًا» vs «انتهت عروضك المجانية»), so no one is shown an affordance
   that will 403.

## Gate composition (the practical rule)

A landlord may publish a listing only if **all** hold:
`role === LANDLORD` **and** `capability listing:create` **and**
`eKYC === APPROVED` **and** (`free_listings_left > 0` **or** a successful
`NEW_LISTING` payment). Model these as three distinct checks with three
distinct messages — never collapse them into one "not allowed".
