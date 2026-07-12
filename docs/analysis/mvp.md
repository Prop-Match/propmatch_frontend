# MVP prioritization

Bias toward the trust + matching core, per the master build prompt's
instruction. "V1" = must-ship before any pilot launch in Mansoura.

## V1 — Must-have

The minimum for the core promise ("rent directly from a verified owner, no
broker, AI-matched, ready lease") to actually work end-to-end:

1. **Auth & Accounts** — sign up (3-way role choice), log in, unified
   session, dual-role mode switch.
2. **eKYC** — full wizard (ID front/back, selfie, processing, success/fail,
   lock-after-3), ownership disclaimer shown persistently. Required to
   unlock listing creation; encouraged-not-required for tenants per the
   spec.
3. **Listings & Moderation (core loop)** — landlord create/edit listing
   (multi-step form, no Form Optimizer yet), submit → pending → admin
   approve/reject → visible to tenants once approved.
4. **Tenant Browse + Smart Matching** — hybrid intake form (structured +
   open RAG field), match results with score ring, quota countdown,
   quota-exhausted → Paymob.
5. **Gated contact** — "تواصل مع المالك," phone hidden until match
   confirmed (even with the accept-flow question in `requirements.md`
   unresolved, ship the *simplest* correct version: tenant requests contact,
   landlord sees + approves the request, then reveal).
6. **Paymob payment surface** — one reusable component, all three contexts,
   default/loading/success/error states. Needed by both Listings (pay after
   first free) and Matching (refill).
7. **Admin review queues** — property review and eKYC review, with
   approve/reject actions and audit logging. Live-queue polish (WebSocket
   auto slide-in) can ship as polling first and upgrade later — the
   *decisions* (approve/reject) are must-have; the *realtime feel* is
   should-have.
8. **RBAC enforcement** — even a minimal 2-role admin set (Super Admin +
   one operational role) must be capability-checked and audited from day
   one; retrofitting RBAC after building admin screens without it is far
   more expensive than building it in from the start.
9. **Contract generator (form → PDF)** — this is explicitly what closes the
   loop ("ready-to-download lease" is core positioning copy).

## Should-have (V1.1 — soon after pilot, not blocking it)

- **Form Optimizer** ("تحسين الوصف") — valuable but the listing flow works
  without it; ship listings first, add the AI polish once the core loop is
  proven.
- **Legal chatbot** — free, low-risk, high trust-value, but not on the
  critical path of a rental transaction.
- **Boost listing** — a monetization feature, not a functional requirement
  for the marketplace to work.
- **Live WebSocket admin queue** (upgrade from polling) + notification bell
  badge — polish on top of the must-have approve/reject capability.
- **Customer Service tickets** — needed once there are real users generating
  support load, not needed for the first cohort of a small Mansoura pilot
  where support can plausibly be handled manually at first.

## Nice-to-have (V2+)

- **Reviews & Moderation** — no reviews exist until after tenants have
  actually completed rentals through the platform; genuinely can't be
  populated meaningfully at pilot launch.
- **Financial reports/dashboards, charts, exports** (Recharts-driven admin
  financial views) — needed once transaction volume justifies dedicated
  reporting; a simple transaction list is enough at V1 (already implied by
  "must-have" Paymob surface's transaction history, not a full reporting
  suite).
- **Rich admin activity logs / login history UI** — the underlying
  AuditLog must exist from V1 (must-have, item 8), but a dedicated
  browsing UI for it can wait.

## Why this ordering

The product's differentiation is trust (verified identity + honest
ownership disclaimer) and AI matching (the hybrid intake + RAG). Everything
in V1 exists to make one tenant and one landlord complete one real rental
transaction, end to end, safely. Monetization polish (boosts, Form
Optimizer) and community-trust features (reviews) only matter once that
loop is proven — building them first would be optimizing a transaction flow
that doesn't work yet.
