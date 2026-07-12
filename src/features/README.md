One folder per feature module (see docs/analysis/feature-relationships.md for
the full module list — e.g. `auth`, `ekyc`, `listings`, `matching`,
`contracts`, `payments`, `legal-chatbot`, `admin-review`, `tickets`,
`reviews`, `notifications`).

Each feature folder is self-contained:

```
features/<feature>/
  components/
  hooks/
  services/     # calls into src/lib/api
  validation/   # Zod schemas (React Hook Form resolvers)
  types/
  __tests__/
```

Features import shared primitives from `src/components`, `src/hooks`,
`src/lib`; never the reverse. Cross-feature reuse goes through a shared
abstraction, not a direct import of another feature's internals.
