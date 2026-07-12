# Requirements analysis

Phase 1 deliverable. Cross-references: SRS (`../../../PropMatch AI - SRS.docx`),
UI Generation Prompt (`../../../PropMatch AI - UI Generation Prompt.md`),
the earlier draft spec in `reference/figma-tenant-prototype/src/imports/`.

## Conflicts between sources (higher-ranked wins per AGENTS.md)

1. **Account model.** The earlier draft (`prop-match-ai-design.md`,
   "unified account") has every user sign up once and *switch* between
   Tenant/Landlord views — a single implicit dual role. The UI Generation
   Prompt (authoritative) instead has an explicit **three-way role choice at
   signup** (مستأجر / مالك / الاثنين) — "both" is opt-in, not default.
   **Resolution:** build the three-way choice. `AccountRoleSchema` in
   `src/lib/api/contracts/auth.ts` already reflects this.
2. **Brand tagline & some glossary wording differ** between the two drafts
   (e.g. "أجر بيتك أو اسكن مباشرة..." vs "استأجر مباشرة من المالك...").
   **Resolution:** Section 12 of the UI Generation Prompt is verbatim truth;
   `messages/ar.json` uses it. Do not pull copy from the older draft.
3. **In-app messaging.** The earlier draft explicitly lists "no direct
   in-app messaging between users" as out of scope; the UI Generation Prompt
   doesn't repeat this exclusion but also never specifies an in-app chat
   screen for tenant↔landlord contact (only the gated "تواصل مع المالك"
   reveal, implying off-platform contact via phone). **Assumption:** no
   in-app messaging in V1 — "contact owner" reveals a phone number, contact
   happens outside the platform. Logged in ASSUMPTIONS.md.

## Missing business requirements

- **No ERD or backend OpenAPI spec exists yet.** Every DTO in
  `src/lib/api/contracts` is inferred from the SRS's functional requirements
  and the UI form-field list, not a real schema. High risk of rework once
  the real ERD lands — kept intentionally minimal (auth only) for this
  reason; see `data-model.md`.
- **Quota reset window is unspecified.** SRS FR2.5 says "free quota (e.g., 3
  queries)" and FR3.4 "usage limit (e.g., 2 free uses)" but never states
  whether quotas are lifetime (never reset) or reset on a cadence
  (monthly?). **Assumption:** lifetime, per-account counters that only
  increase via Paymob top-up — matches "first listing free" being a
  one-time event, not a recurring one. Flag for confirmation.
- **Match score computation is unauthenticated as a concept.** FR2.4 says
  "return a calculated Match Score percentage" but not the formula (vector
  similarity distance transform? weighted blend of hard-constraint match +
  RAG similarity?). This is entirely a backend/RAG concern, but the frontend
  needs to know: is the score stable/reproducible for a given
  tenant-property pair, or does it change between requests? This affects
  whether match results can be cached client-side. **Assumption:** treat
  score as volatile, always refetch, never cache beyond the query session.
- **No password-reset flow is specified** anywhere (SRS, UI prompt). The
  landing/login screen list mentions "forgot password" as a UI element only.
  **Assumption:** stub the route, block on the real backend endpoint before
  building the flow (Phase 3).
- **Tenant "inquiry" vs "match" lifecycle is unclear.** The landlord
  "Inquiries" screen (#22) lists "ID-verified interested tenants," but
  there's no defined event for a tenant to express interest beyond viewing
  match results — is inquiry = tenant explicitly clicking "تواصل مع
  المالك," or the mere existence of a favorable match score? **Assumption:**
  an inquiry is created only when the tenant explicitly requests contact,
  which is also the PII-reveal trigger event requiring both-party
  acceptance (see below).

## Ambiguous / conflicting behaviors requiring a decision

- **PII reveal gate — "both parties accept" is undefined as a UI flow.**
  Section 3A(E) says PII reveals only after both accept, but no screen shows
  a landlord-side "accept this tenant" action. The Landlord Inquiries screen
  (#22 UI prompt) just lists interested tenants; if the landlord can already
  see the tenant's name/inquiry, is that the landlord's "acceptance," and
  does the tenant have a symmetric accept step? **Assumption for V1:**
  tenant requests contact (implicit "accept" #1) → landlord's Inquiries list
  shows the request → landlord clicking through to view tenant details
  in an "accept" action (implicit "accept" #2) → PII unlocks both ways only
  at that point. Needs product confirmation; document any UI for this
  explicitly as "pending confirmation" until answered.
- **Who can see PII pre-match, for support/dispute purposes.** NFR3.2 says
  "unless specifically requested by the matched contracting parties" — this
  implies admins with a `pii:reveal` capability can also see PII for support
  cases, which needs an audit trail. See `rbac.md`.
- **Concurrency on listing approval.** Two admins reviewing the same pending
  listing simultaneously could both call approve/reject. **Assumption:**
  the backend must treat this as a compare-and-swap on `status = pending`
  (409 on second writer); frontend must handle a 409 by refetching the
  queue item and showing a toast ("تمت مراجعة هذا الطلب بالفعل"), not by
  silently retrying.
- **Paymob webhook reconciliation vs. client-side "success" state.** FR6.2/
  6.3 describe the webhook as the source of truth for activating a
  quota/listing, but the Payment Modal (§4.3) shows a client-side "success"
  state immediately after the Paymob iframe reports success. There's a race:
  the webhook may not have landed yet when the client shows "paid."
  **Assumption:** the payment modal's "success" state means "payment
  captured by Paymob," not "entitlement activated." The UI must poll (or
  the BFF must poll) the entitlement endpoint for a few seconds after
  showing "success," with a spinner-to-checkmark transition, and only route
  the user onward (e.g., dashboard showing the new listing as pending) once
  the entitlement actually reflects. Falling back to "we'll notify you
  shortly" copy if it doesn't land within ~10s.
- **Audit log immutability** is never mentioned in the SRS. Given RBAC
  actions (admin create/disable, refunds, PII reveal, moderation) are
  security-sensitive, **assumption:** audit log entries are backend-owned,
  append-only, and the frontend never provides an edit/delete UI for them —
  only filter/search/export (read-only Admin surface).
- **eKYC data retention.** FR1.5 says images are deleted from S3 once
  verification is logged, but doesn't say how long the *verification
  result* (extracted name, ID number, confidence score) is retained, or
  whether a user can request deletion (GDPR-style — likely N/A for Egypt,
  but worth flagging). **Assumption:** retain indefinitely while the
  account is active; deletion on account closure is a backend/legal concern
  out of this frontend's scope, noted for the team.

## Security concerns

- National ID must never appear unmasked in any client-side state, prop, or
  URL before a legitimate reveal event — includes React DevTools/Redux
  DevTools exposure risk from Zustand/TanStack Query caches. Any query that
  fetches a matched counterparty's PII should be scoped narrowly (a
  dedicated `/matches/:id/reveal` endpoint) rather than embedded in a
  generic user/property payload, so caches can't leak it into unrelated
  views.
- Access/refresh tokens live only in httpOnly cookies (`src/lib/api/cookies.ts`)
  — never in `localStorage`/Zustand, per NFR1.2. Quota counters shown to the
  user MAY be mirrored client-side for UX (persisted via localStorage per
  the design spec's §4.4), but must never be trusted as the entitlement
  check — every quota-gated action re-verifies server-side and handles a
  403 gracefully (already the pattern in FR2.5).
- Paymob webhook validation (HMAC) is backend-only (NFR1.3) — no frontend
  implication beyond not trusting a client-reported "payment succeeded"
  state as authoritative (see reconciliation note above).

## Scalability / performance

- RAG search must return in <1.5s (NFR2.1) — the frontend should show the
  match-results loading skeleton immediately and treat >1.5s as a slow-path
  (no special UI needed yet, but avoid client-side timeouts shorter than
  ~5s to give headroom).
- Admin review queue is WebSocket-driven and must "feel live" — needs
  reconnect/backoff handling and a polling fallback if the socket drops,
  since the spec explicitly says "degrade gracefully to polling."
- Large admin lists (properties, users, transactions) need server-side
  pagination from day one — do not fetch-all-then-paginate client-side.

## RTL / formatting concerns

- All prices/areas/dates render with Western Arabic numerals (0–9), not
  Eastern Arabic-Indic digits — this is a non-default `Intl.NumberFormat`
  behavior for `ar` locales (which default to Eastern digits), so every
  numeric display must explicitly pass `numberingSystem: "latn"` (e.g.
  `new Intl.NumberFormat("ar-EG", { numberingSystem: "latn" })`) rather than
  relying on the bare `ar-EG` locale default. Centralize this in a shared
  `formatArabicNumber` / `formatEGP` util (Phase 3) so it's never
  reimplemented per-component.
- Directional icons (chevrons, back arrows) must be mirrored for RTL — track
  this per-component when building the design-system primitives (Phase 3).
