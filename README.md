# Storefront

A single-vendor e-commerce store for physical products. Built for speed, reliability,
and security over feature count.

> Rename this project before Phase 1 — the folder name `storefront` is a placeholder.

## Status

**Phase 0 — specification.** No application code yet. The documents in `docs/` are the
contract; code follows.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind + shadcn/ui · Postgres (Neon) ·
Drizzle ORM · Better Auth · Cloudflare R2 · Resend · Vercel

Architecture is a **modular monolith** — clear module boundaries, one deployable.

## Documentation

| Document | Contents |
|---|---|
| [Architecture](docs/01-architecture.md) | System design, module map, request flows |
| [Data model](docs/02-data-model.md) | ERD, tables, schema decisions |
| [API](docs/03-api.md) | Server Actions, route handlers, contracts |
| [Security](docs/04-security.md) | Auth, RBAC, threat model, checklist |
| [Performance](docs/05-performance.md) | Caching strategy, budgets |
| [Roadmap](docs/06-roadmap.md) | Phased build order |

[`CLAUDE.md`](CLAUDE.md) holds the working rules and invariants.

## Getting started

Not yet applicable — Phase 1 adds the application scaffold. Once it exists:

```bash
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm dev
```

## Scope

**In:** product catalog with categories and variants, cart, guest and account checkout,
payments, shipping and tracking, order management, an admin dashboard, coupons,
reviews, transactional email.

**Out:** multi-vendor, marketplace, subscriptions, POS, multi-warehouse, multi-currency
checkout. AI search and recommendations are deferred to Phase 6 and are optional.
