# CLAUDE.md

Auto-loaded into every session. Keep it short and current — this file exists to stop
the architecture being re-derived (and re-billed) every conversation.

## What this is

A single-vendor storefront selling **physical products**. One store, one owner, many
products. Priorities in order: **security, reliability, speed, maintainability, cost.**

Not multi-vendor. Do not add vendor/seller/commission/payout concepts.

## Stack — settled, do not re-litigate

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, React Server Components |
| Language | TypeScript, `strict: true` |
| UI | Tailwind CSS + shadcn/ui |
| Database | Postgres (Neon) |
| ORM | Drizzle |
| Auth | Better Auth |
| Storage | Cloudflare R2 (S3 API) |
| Email | Resend |
| Payments | Adapter interface; Stripe is the reference impl |
| Hosting | Vercel, Cloudflare in front for CDN/WAF |
| Tests | Vitest (unit), Playwright (e2e) |

**Architecture: modular monolith.** No microservices, no message broker, no separate
services. If you think we need a queue, we need a Postgres table and a cron route.

## Module boundaries

```
src/modules/
  accounts/       users, addresses, auth glue
  catalog/        products, categories, variants, images
  cart/
  checkout/
  orders/
  payments/       provider interface + implementations
  shipping/       rate calculation, tracking
  inventory/      stock ledger
  promotions/     coupons
  reviews/
  notifications/  transactional email
  admin/
```

**The one rule that keeps this from rotting:** a module may only import another module
through its `index.ts`. Never reach into `../catalog/internal/...`. Enforced by
`eslint-plugin-boundaries` — if the lint fails, fix the design, not the lint config.

Shared code lives in `src/lib/` (db client, auth, utils) and `src/components/ui/`
(shadcn primitives). Shared code must not import from `src/modules/`.

## Non-negotiable invariants

Violating any of these is a bug, regardless of what a task asks for.

1. **Money is integer minor units.** Never a float. `1999` is $19.99. Currency code
   travels with every amount.
2. **Never trust a client-supplied price, total, or discount.** Recompute every figure
   server-side from the database at checkout. The client sends variant IDs and
   quantities; nothing else about money.
3. **Order line items are snapshots.** Copy title, SKU, and unit price onto
   `order_items` at purchase time. Order history must survive product edits and
   deletion.
4. **Stock decrements are conditional and transactional.**
   `UPDATE ... SET stock = stock - $n WHERE id = $id AND stock >= $n`, then check the
   row count. Never read-then-write.
5. **Every webhook is verified and idempotent.** Check the signature, then insert into
   `webhook_events` on a unique provider event ID. Duplicate delivery must be a no-op.
6. **Every query touching user data is scoped by the session user ID.** Never by an ID
   from the request alone.
7. **Every Server Action validates its input with Zod** as the first statement.
8. **Admin mutations write an audit log entry.**

## Conventions

- Server Components by default. `'use client'` only for actual interactivity.
- Mutations are Server Actions in `modules/<m>/actions.ts`. Route Handlers only for
  webhooks and third-party callbacks.
- Data access lives in `modules/<m>/repository.ts`. Business logic in `service.ts`.
  Components never call Drizzle directly.
- Zod schemas in `modules/<m>/schema.ts`, shared between client and server.
- Files `kebab-case.ts`, components `PascalCase.tsx`, DB tables and columns
  `snake_case`.
- Migrations via `drizzle-kit generate` — never hand-edit a generated migration, and
  never `push` against production.

## Working style

- Smallest correct change. Modify the lines that need modifying; don't regenerate files.
- Reuse what exists before adding anything. Check `src/components/ui/` and
  `src/lib/` first.
- If a change spans more than ~3 modules, stop and describe the approach before coding.
- Don't add a dependency to solve something the stack already does.
- Comment *why*, never *what*.

## Where things are documented

| Topic | File |
|---|---|
| System design, module map | `docs/01-architecture.md` |
| Schema, ERD, data decisions | `docs/02-data-model.md` |
| API and Server Action surface | `docs/03-api.md` |
| Auth, RBAC, threat model | `docs/04-security.md` |
| Caching and perf budgets | `docs/05-performance.md` |
| Build order | `docs/06-roadmap.md` |

Read the relevant doc before implementing in that area. Update it in the same commit
when a decision changes.
