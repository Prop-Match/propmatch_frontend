Shared design-system primitives (Button, Field, PropertyCard, StatusChip,
MatchScoreRing, VerifiedBadge, QuotaChip, PaymentSheet, eKYC upload tile,
ChatBubble, AdminQueueItem, Toast, Nav — see the Figma Prototype Generation
Prompt, Section 2). None built yet as of Phase 0 — these get built
feature-by-feature per docs/analysis/mvp.md's priority order, each with
default/loading/error/empty(where relevant) states per component per the
design spec.

Use the tokens in `app/globals.css` (`--color-*`, `--radius-*`, `--shadow-*`,
`--text-*`) — no ad-hoc values in component styles.
