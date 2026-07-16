# Assumptions log

Living document. Every assumption made where the ERD / SRS (Final) / Sprint Plan
(Final) / Full Features leave a rule unspecified. **Update or delete an entry
once the team confirms or overrules it.**

Source-doc conflicts and their resolutions live in
[`docs/analysis/conflicts.md`](docs/analysis/conflicts.md) — not repeated here.

> Reset on 2026-07-16 when the Final ERD/SRS/Sprint Plan superseded the earlier
> build prompt. Assumptions from the previous model (unified multi-role account,
> document-based verification, support ticketing, admin sub-roles) are void —
> see `conflicts.md` B1–B3.

| # | Assumption | Gap it fills | How to confirm |
|---|---|---|---|
| 1 | **No backend exists yet.** The frontend runs against an in-process mock (`src/mocks/`: `router.ts` = the whole API, served over real HTTP by `standalone.ts` on `NESTJS_API_URL`, and reused by Jest via one MSW passthrough). Go live by pointing `NESTJS_API_URL` at NestJS and setting `API_MOCKING=disabled`. | No NestJS repo/OpenAPI attached. | Get the OpenAPI spec; regenerate/verify `src/lib/api/contracts`. |
| 2 | **Contract casing.** The ERD is `snake_case`; contracts expose camelCase and assume the API boundary maps them. | No OpenAPI. | Confirm real DTO shape/casing with backend. |
| 3 | **Repo stays a single Next.js app**, not the monorepo the build prompt specifies (`conflicts.md` B1). | Team decision this session. | Revisit if the NestJS backend co-locates. |
| 4 | **eKYC persists 3 statuses** (`PENDING/APPROVED/REJECTED`); `NOT_SUBMITTED` = no `IDENTITY_VERIFICATION` row, `RESUBMISSION_REQUIRED` = derived from `REJECTED` + `rejection_reason`. | ERD vs Full-Features (`conflicts.md` A5). | Confirm whether backend persists 5. |
| 5 | **No eKYC resubmit cooldown / attempt cap.** The ERD has neither; the previously-built 24h cooldown was dropped. Unbounded resubmission is a spam vector. | ERD silent. | Confirm backend policy; add back if it exists. |
| 6 | **Progressive verification gates** = publish listing, publish request, accept offer, reveal contact. An **unverified landlord may not send an offer** (offers lead to reveal); an unverified tenant **may** favorite but **may not** review. | SRS 3.1/3.4 don't enumerate. | Confirm the exact gate list. |
| 7 | **Match score is server-authoritative and volatile** — never recomputed or cached client-side. Ranked results carry a transient score; only `INTERESTED`+ persists a `MATCH_CONNECTION.match_score`. Scale assumed 0–100. | ERD/SRS don't define formula, scale, symmetry, or stability. | Confirm with the AI/backend team. |
| 8 | **PII reveal is per-connection, enforced by omission.** The backend must not send `phone_number`/`manual_address` until this tenant has an `ACCEPTED` offer or `CONNECTED` match. `PROPERTY.contact_revealed` (a per-property boolean) is too coarse to express this. | ERD field vs SRS 3.4 semantics. | Confirm the reveal contract; this is safety-critical. |
| 9 | **Quotas are lifetime until a Paymob top-up**; `USER_QUOTA.last_reset_date` is reserved for a future periodic reset. | ERD implies reset, no window given. | Confirm the reset window (if any). |
| 10 | **Paywalls are feature-flagged off for the free launch**, but the quota chip stays visible and the server stays the entitlement authority in both modes. | Build prompt §5 mandates flags; no flag name specified. | Confirm flag name/behaviour + launch policy. |
| 11 | **Accepting one offer sets `TENANT_REQUEST → FULFILLED`**; sibling offers stay `SENT` but become non-acceptable. `CLOSED` = tenant manually closed. | ERD has the enums; nothing sets them. | Confirm — affects landlords' spent offer quota. |
| 12 | **`OWNER_OFFER.property_id` is always populated in V1** (select an existing APPROVED property). The ERD's nullable "quick-add" is reserved. | No doc describes quick-add. | Confirm whether quick-add ships in V1. |
| 13 | **`OWNER_OFFER.status = VIEWED`** is set server-side when the tenant opens the offer detail (not on list render). | Unspecified. | Confirm. |
| 14 | **Offers referencing a non-`APPROVED` property are hidden and non-acceptable.** | Unspecified edge case. | Confirm backend enforces. |
| 15 | **Any tenant may review any property** (no `MATCH_CONNECTION` required); admin moderation is the only spam control. | ERD doesn't constrain `PROPERTY_REVIEW`. | Confirm — credibility risk if reviews need no relationship. |
| 16 | **Properties are soft-archived (`ARCHIVED`), never hard-deleted.** | ERD has ARCHIVED, no delete. | Confirm. |
| 17 | **Paymob client "success" = captured, not credited.** UI polls the quota after success and falls back to "we'll update shortly". Webhook HMAC + idempotency are backend duties. | Webhook race. | Confirm webhook latency/idempotency. |
| 18 | **Contract auto-fill** pulls eKYC-verified name + national ID with explicit user consent; the ID appears only in the generated PDF, masked to last 4 elsewhere. | SRS 3.5 says "merges eKYC-verified data", consent unspecified. | Confirm consent requirement + who may generate. |
| 19 | **Admin is a single flat role in V1** (no sub-roles/audit UI) — the ERD has no admin-role entity and the backlog no ticket. Capability layer is ready if scoped admins are wanted later. | ERD silent. | Confirm. |
| 20 | **`lifestyle_requirements` / `preferred_locations` free text may contain PII** typed by the tenant, and approved requests are published to all verified landlords. Assumed the backend redacts or admins catch it at moderation. | SRS 3.2.2 doesn't address it. | Confirm redaction responsibility. |
| 21 | **Figma covers the tenant flow only.** The reverse marketplace (request form, offer inbox, landlord request browsing) and admin dashboard will be built by extending the existing design tokens/components. | No designs for those surfaces. | Get designs, or approve extending the system. |
| 22 | **Formatting**: `ar-EG` `Intl` defaults to Eastern Arabic-Indic digits, so all formatters pin `numberingSystem: "latn"` (`src/utils/format.ts`). Custom `text-*` size tokens must stay registered with tailwind-merge in `src/utils/cn.ts` or they strip `text-white`. | Factual API traps, logged so they aren't rediscovered as bugs. | n/a. |
