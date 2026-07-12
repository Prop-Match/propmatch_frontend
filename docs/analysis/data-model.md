# Shared data model (pre-ERD)

No ERD has been provided yet. This is the frontend's working model, inferred
from the SRS and the UI Generation Prompt's form-field lists, kept
deliberately minimal where fields aren't yet specified. **Every entity below
must be reconciled against the real ERD/NestJS schema when it lands** — see
`ASSUMPTIONS.md`. Only `User` (partial) is implemented as a real Zod
contract so far (`src/lib/api/contracts/auth.ts`); everything else is a
documented placeholder (`src/lib/api/contracts/*.ts` TODO stubs).

## Entities

### User
Single account, three-way role (`tenant | landlord | both`). Fields per
UI prompt Section 3A(A)/(B): fullName, email, phone, password (hashed
backend-side, bcrypt per NFR1.1), role, plus landlord-only profile fields
(ownership self-declaration answers, preferred contact method/times — not
collected at signup, collected post-signup per the spec). 1:1 with
Verification. Owns Property (landlord), MatchQuery (tenant), Transaction,
Ticket.

### Verification (eKYC)
1:1 with User. Fields: status (`unverified | pending | verified | locked`),
extracted full name, masked National ID (last 4 only — the frontend must
never receive the full number per NFR3.2), confidence score, attempts used
(max 3). Owned by the eKYC module; read by Listings (verified-owner badge)
and Admin (review queue).

### Property / Listing
Owned by one User (landlord). Fields per UI prompt Section 3A(C): location
(محافظة/مدينة/حي/شارع-optional/عنوان تفصيلي, all free text — no
geocoding), type enum (شقة/دوبلكس/فيلا/ستوديو/غرفة/محل/مكتب), pricing
(monthly rent, deposit), lease duration, area, rooms, bathrooms, floor,
elevator/furnished/finish/orientation booleans-or-enums, amenities
(multi-select), landlord conditions (multi-select), description + AI-
optimized variant, photos, `status` (`draft | pending | approved |
rejected`), `boosted` flag. Read by Matching (approved only), Contracts
(pre-fill address).

### MatchQuery / MatchResult
MatchQuery: one per tenant search — structured fields (Section 3A(D)) +
the open RAG text field. MatchResult: N properties per query, each with a
`matchScore` (0–100) — treated as volatile/non-cacheable (see
`requirements.md`). Consumes Quota(feature="match").

### Quota
Per-User, per-feature counter (`feature: "match" | "form-optimizer" |
"listing"`), `used` / `limit` (or `limit: null` for unlimited-after-payment).
Incremented by usage, reset only via a Paymob-driven top-up (no automatic
reset window is specified — see `requirements.md`'s open question).

### Transaction / Payment
One row per Paymob checkout attempt: `context ("listing" | "boost" |
"matchmaker-refill")`, amount (EGP), status (`pending | success | failed`),
Paymob transaction reference, linked User and (where applicable) Property.
Webhook-driven status transitions (SRS FR6.2).

### Contract
Generated per matched tenant-landlord-property triple: both parties' names
+ national IDs (unmasked only inside the generated PDF, per NFR3.2), rent,
dates, address, additional clauses (rich text). Form-to-PDF only, no stored
draft/negotiation state beyond the form itself.

### ChatSession / ChatMessage (Legal Chatbot)
Session-scoped, purged after session end per SRS FR4.3 — the frontend
should not assume any chat history persists across a reload/relogin.

### Ticket / TicketMessage (Customer Service)
Status lifecycle: `new → assigned → in_progress → waiting → closed`.
Subject may reference a User, Property, or Transaction. Internal notes vs.
customer-visible replies are distinct message types (only the latter should
ever be rendered to the non-admin party).

### Review
Subject: Property or User(landlord). Rating + text, moderation flags
(`hidden`, `flagged`). Nice-to-have for V1 — see `mvp.md` (no reviews exist
until real rentals complete).

### Notification
Delivered via WebSocket (Admin queue, notification bell) with a polling
fallback. Event sources: new eKYC submission, new listing submission,
(future) ticket updates.

### AuditLog
Append-only. `actorId`, `action` (capability exercised), `subjectType`,
`subjectId`, `reason` (required for `pii:reveal`), `timestamp`.
Immutability is a backend guarantee (no PUT/DELETE ever exposed) — see
`requirements.md`.

## Relationships (summary)

```
User 1──1 Verification
User 1──N Property            (as landlord)
User 1──N MatchQuery           (as tenant)
User 1──N Transaction
User 1──N Ticket
User 1──N Quota                (one row per feature)
Property N──1 User             (landlord)
Property 1──N MatchResult      (as the matched property)
MatchQuery 1──N MatchResult
Contract N──1 User ×2 (landlord, tenant), N──1 Property
Transaction N──1 User, N──0..1 Property (context-dependent)
Review N──1 Property or N──1 User(landlord)
AuditLog N──1 User (actor), polymorphic subject
```

## Module ownership

See `feature-relationships.md`'s ownership table — not duplicated here to
avoid the two docs drifting out of sync.
