# Feature relationships

How the modules in the master build prompt (§6) interact — shared entities,
permissions, API resources, and cross-feature workflows.

## Module → primary entity ownership

| Module | Owns | Reads from other modules |
|---|---|---|
| Auth & Accounts | User, Session/Tokens | — |
| eKYC (Identity Verification) | Verification | User |
| Listings & Moderation | Property/Listing | User (owner), Verification (badge) |
| Smart Matching | MatchQuery, MatchResult/Score | Property (approved only), Quota |
| Contracts | Contract | User ×2, Property, Match (for pre-fill) |
| Payments & Billing | Transaction/Payment, Quota | User, Property (activation target) |
| Legal Chatbot | ChatSession, ChatMessage | — (stateless per-session per SRS FR4.3) |
| Admin & RBAC | Admin, Role/Capability, AuditLog | all modules (audits their mutations) |
| Customer Service | Ticket, TicketMessage | User, (Property/Payment as ticket subject) |
| Reviews & Moderation | Review | User, Property |
| Notifications & Realtime | Notification, WebSocket event stream | Listings, eKYC, Admin (event sources) |

## Shared entities (cross-module)

- **User** — single account, `role: tenant | landlord | both`. Read by
  nearly every module. Owns Verification 1:1, owns 0..N Property (as
  landlord), 0..N MatchQuery (as tenant), 0..N Transaction, 0..N Ticket.
- **Property/Listing** — owned by one User (landlord). Has a `status`
  lifecycle (`draft → pending → approved/rejected`) that gates visibility in
  Matching and Listings. Admin review mutates `status`; only that mutation
  should be audited immutably (see `rbac.md`).
- **Quota** — really a per-User, per-feature counter (`matchQueriesUsed`,
  `formOptimizerUsesUsed`, `listingsPublishedFree`). Spans Matching,
  Listings (Form Optimizer), and Payments (top-ups increment it). Modeling
  it as one entity with a `feature` discriminant (rather than three separate
  tables) keeps the "quota exhausted → open Paymob" flow uniform across
  features — one shared `useQuota(feature)` hook/component, not three.
- **AuditLog** — write-only from every module that performs a
  capability-gated mutation (listing approve/reject, eKYC approve/reject,
  payment refund, review delete/hide, admin create/disable, PII reveal).
  Read-only from Admin & RBAC's audit view.

## Cross-feature workflows

1. **Listing publish → Admin review → Matching visibility.** Listings sets
   `status=pending`, fires a Notification (WebSocket) to Admin, which
   Admin & RBAC surfaces in the live queue. Approval flips
   `status=approved`, which is the *only* gate Smart Matching checks before
   indexing/returning a property. Rejection is terminal for that submission
   (landlord edits and resubmits, going through `pending` again).
2. **Tenant intake → Match results → Quota.** Every Smart Matching query
   decrements Quota(feature=match) server-side; the frontend's quota chip is
   a read of that same counter, not an independent client counter.
   Exhaustion returns 403 with a payment-modal trigger payload (SRS FR2.5) —
   this is the shared contract the Payments module's modal component reads
   to know which product to sell (`matchmaker-refill`).
3. **Contact request → PII reveal → Contract generator pre-fill.** Once both
   parties accept (see `requirements.md`'s open question on this flow), the
   Contract module can pre-fill both parties' verified full name and masked
   national ID → unmasked only in the generated PDF payload, never
   re-displayed unmasked in the UI outside the contract form itself.
4. **Payment → Paymob webhook → entitlement activation → UI reflect.**
   Shared across Listings (pay-per-listing, boost) and Matching (refill).
   One reusable Payment Sheet component (§5 design system), parameterized by
   `context: "listing" | "boost" | "matchmaker-refill"`, one polling
   pattern (see `requirements.md`'s webhook-race note) reused across all
   three contexts rather than three bespoke payment flows.
5. **Admin moderation (Reviews) and Customer Service tickets** both need the
   same "reveal PII for a support/dispute case" escape hatch, gated by the
   same `pii:reveal` capability and audited the same way — one shared
   `useRevealPii(subjectId, reason)` hook/mutation, not two.

## Duplicated-functionality risks → shared abstractions

- **Four "queue" UIs** (Admin property review, Admin eKYC review, Customer
  Service tickets, Reviews moderation) all share the same shape: a list with
  status filter, an item detail panel, and an approve/reject or
  reply/resolve action, audited on mutation. Build one generic
  `<ModerationQueue>` / `<AdminDataTable>` primitive (Phase 3, shared
  components) parameterized by columns + actions, rather than four bespoke
  tables.
- **Freemium quota chips** appear in Matching, Listings (Form Optimizer),
  and implicitly Contracts/Legal Chatbot (free, so just show "free," no
  counter) — one `<QuotaChip feature="match" />` component reads the same
  Quota entity per feature discriminant.
- **Status chips** (`قيد المراجعة` / `تمت الموافقة` / `مرفوض`) are reused
  identically across Listings and eKYC — one `<StatusChip>` primitive with a
  shared status enum (`ListingStatusSchema` in `common.ts` already anchors
  this for Listings; eKYC's `VerificationStatusSchema` is the analogous
  enum in `auth.ts`).
- **Paymob modal** is explicitly designed as one reusable component across
  three contexts (§4.3 of the design spec) — do not build three separate
  modals.

## Normalization impact (pending real ERD)

Current assumption keeps Quota as one table with a `feature` column rather
than a column-per-feature on User, and AuditLog as one polymorphic table
(`subjectType`, `subjectId`) rather than per-module log tables — both
choices favor the shared-abstraction reuse above. Revisit both once the
real ERD lands; if the team's ERD normalizes differently, the frontend
contracts (`src/lib/api/contracts/*`) are the only place that needs to
change, not the components built against them.
