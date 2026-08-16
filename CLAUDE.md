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
| Framework | Next.js 16, App Router, React Server Components |
| Language | TypeScript, `strict: true` |
| UI | Tailwind CSS + shadcn/ui |
| Database | Postgres (Neon) |
| ORM | Drizzle |
| Auth | Better Auth |
| Storage | Cloudinary (R2 blocked on payment — see below) |
| Email | Resend |
| Payments | Cash on delivery + SSLCommerz (cards, bKash, Nagad, Rocket, net banking) + manual bank transfer |
| Currency | BDT only, stored as integer poisha |
| Hosting | Vercel, Cloudflare in front for CDN/WAF |
| Tests | Vitest (unit), Playwright (e2e) |

**Version pins that are deliberate, not stale:** TypeScript is held at 6 because
`typescript-eslint` does not support TS 7, and ESLint at 9 because
`eslint-plugin-react` calls `context.getFilename()`, removed in ESLint 10. Check
both upstreams before bumping either.

Edge logic lives in `src/proxy.ts` — Next 16 renamed the `middleware` convention
to `proxy`. It must sit inside `src/`; at the repo root it is silently ignored.

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
  meta/           consent, Pixel/CAPI delivery, paid-order outbox
```

**The one rule that keeps this from rotting:** a module may only import another module
through its `index.ts`. Never reach into `../catalog/internal/...`. Enforced by
`eslint-plugin-boundaries` — if the lint fails, fix the design, not the lint config.

**Client components import `actions.ts` directly**, never the module barrel — the
barrel also re-exports server-only reads, and pulling that into a client component
drags the whole server stack into the browser bundle. `'use server'` makes
`actions.ts` an RPC boundary, so it is a legitimate entry point.

Two further carve-outs, both about tables rather than behaviour:

- A repository joining another module's tables imports them from `@/lib/db/schema`,
  the canonical description of the database — not from that module's folder.
- `schema.ts` files import each other directly, because a foreign key genuinely is a
  cross-module relationship and the barrel cannot be used without a cycle.

Shared code lives in `src/lib/` (db client, env, storage, utils) and
`src/components/ui/` (shadcn primitives). Shared code must not import from
`src/modules/`.

**Image storage is provider-swappable.** Import `storage` from `@/lib/storage` and
nothing else — never the `cloudinary` package directly. R2 is still the preferred
destination (zero egress fees); Cloudinary is in place because R2 signup could not
take payment. Any replacement must honour the `ImageTransform` options rather than
ignore them, since the performance budget depends on CDN-side format negotiation.

## Non-negotiable invariants

Violating any of these is a bug, regardless of what a task asks for.

1. **Money is integer minor units.** Never a float. `199900` is ৳1,999.00 in poisha.
   Currency code travels with every amount. Decimal conversion happens only at the
   payment provider boundary.
2. **Never trust a client-supplied price, total, or discount.** Recompute every figure
   server-side from the database at checkout. The client sends variant IDs and
   quantities; nothing else about money.
3. **Order line items are snapshots.** Copy title, SKU, and unit price onto
   `order_items` at purchase time. Order history must survive product edits and
   deletion.
4. **Stock decrements are conditional and transactional.**
   `UPDATE ... SET stock = stock - $n WHERE id = $id AND stock >= $n`, then check the
   row count. Never read-then-write.
5. **Every payment notification is independently verified and idempotent.** For
   SSLCommerz that means calling the validation API with `val_id` and matching amount
   and currency against our order — the IPN body is never trusted. Then insert into
   `webhook_events` on a unique provider event ID; duplicate delivery is a no-op.
6. **Every query touching user data is scoped by the session user ID.** Never by an ID
   from the request alone.
7. **Every Server Action validates its input with Zod** as the first statement.
8. **Admin mutations write an audit log entry.**
9. **Admin access requires a second factor.** `requireRole('admin')` enforces it;
   Better Auth cannot, because it has no notion of "mandatory for this role". Do not
   add an admin surface that bypasses `requireRole`.
10. **Rate limit anything a stranger can call in a loop**, via `lib/rate-limit.ts`.
    It counts in Postgres because an in-process counter resets on every cold start.

## Conventions

- Server Components by default. `'use client'` only for actual interactivity.
- Mutations are Server Actions in `modules/<m>/actions.ts`. Route Handlers only for
  webhooks and third-party callbacks.
- Data access lives in `modules/<m>/repository.ts`. Business logic in `service.ts`.
  Components never call Drizzle directly.
- `modules/<m>/schema.ts` holds **Drizzle tables only** — it is server-only.
  Zod validators go in `modules/<m>/validators.ts` and must import nothing
  server-side. A client component importing the Drizzle file drags the whole ORM
  into the browser bundle.
- Any config value duplicated between `auth.ts` and `proxy.ts` (the cookie prefix
  today) must be flagged with a comment in both places. They are not type-checked
  against each other, and a mismatch locks signed-in users out of their account.
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
| Cloudflare / WAF runbook | `docs/08-cloudflare.md` |
| Meta Pixel / CAPI runbook | `docs/10-meta-analytics.md` |

Read the relevant doc before implementing in that area. Update it in the same commit
when a decision changes.
