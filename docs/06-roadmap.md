# 6. Roadmap

Ordered so that something demonstrable exists early and the riskiest work — money —
happens while the codebase is still small.

Each phase ends in a deployable state. Nothing is left half-wired between phases.

## P0 — Foundation

Repo, tooling, and the skeleton everything else hangs from.

- Next.js 16 + TypeScript strict, Tailwind 4, shadcn/ui
- ESLint with `eslint-plugin-boundaries` enforcing the module rule
- Drizzle + Neon, migration pipeline, seed script
- Better Auth: register, login, verify email, reset password
- `requireSession` / `requireRole` guards
- Env validation at boot, security headers, base layout
- CI: typecheck, lint, unit tests
- Migrations applied on deploy via `vercel-build` (production only)
- Deploy to Vercel with a preview environment

**Done when:** a user can register, verify, log in, and reach an empty account page in
production. ✅ **Complete** — verified end to end against production.

## P1 — Catalog

The read side, and the first thing that looks like a store.

- ✅ `categories`, `products`, `product_variants`, `product_images` schema, with a
  Postgres-generated weighted `tsvector` and GIN index for search
- R2 upload with presigned URLs
- Admin: product CRUD, variant editor, image ordering, category management
- Storefront: home, category listing, product detail, variant selection
- Postgres full-text search with filters and sorting
- Static rendering with tag revalidation

**Done when:** the catalog is browsable, fast, and a real product can be published from
admin.

## P2 — Cart and checkout

The riskiest phase. Every invariant in `CLAUDE.md` gets exercised here.

- Cart for guests (signed cookie) and users, merge on login
- Cart drawer, quantity updates, live stock validation
- Address book and address form
- Weight/destination shipping rate calculation
- Payment provider union: `HostedProvider` + `ManualProvider`
- SSLCommerz integration — hosted redirect, IPN handler, **server-side `val_id`
  validation**, sandbox tested across card, bKash, Nagad and Rocket channels
- Bank transfer flow: instructions page, reference + receipt submission, admin
  verification queue, confirm/reject with audit logging
- `placeOrder` transaction: conditional stock decrement, order creation, snapshots
- Order confirmation page and email
- Cron: release expired orders — 30 min gateway, 72 h bank transfer

**Done when:** a real payment through SSLCommerz completes an order, a bank transfer is
confirmed by hand, and stock is correct after both.

**Test before moving on:** concurrent purchase of the last unit; tampered price
rejected; duplicate IPN is a no-op; **forged IPN with a valid-looking body but bad
`val_id` is rejected**; transfer confirmation with a mismatched amount is refused.

## P3 — Orders and fulfilment

Making it operable by the person who runs the store.

- [x] Order lifecycle: payment, fulfilment, and refund states
- [x] Admin order list with filters, detail view, status transitions
- [x] Shipment creation, tracking numbers — parcels are editable and removable, and
      removing the last one rolls fulfilment back to processing
- [x] Customer order history and guest order lookup
- [x] Cancellation and refund with restock
- [x] Transactional emails: confirmed, shipped, delivered, cancelled/refunded
- [x] Audit logging on all admin mutations, viewable at `/admin/activity`
- [x] Editable order notes (the field previously only ever grew, by machine)
- [ ] Carrier webhook — **deliberately not built.** Pathao and Steadfast both want a
      public callback URL and a per-merchant contract; with one operator, opening the
      parcel and reading the courier's own page costs less than maintaining an
      endpoint that has to be idempotent and forgery-resistant. Revisit at ~20
      parcels a day.
- [ ] Outbox drain cron — **deferred, not forgotten.** Emails currently send inline
      and best-effort: a failure is logged and the order still stands. An outbox buys
      retry, and it is worth building the day a lost "shipped" email costs a sale.
      Until the sending domain is verified, nothing reaches customers anyway, so the
      queue would only be retrying into a wall.

**Done when:** an order can be taken from placed to delivered without touching the
database directly. **Met.**

## P4 — Trust and conversion

- Reviews with moderation and verified-purchase flag
- Coupons: percent, fixed, free shipping, with limits
- Related products, recently viewed
- Wishlist
- Abandoned cart email (single follow-up, unsubscribable)
- SEO: metadata, JSON-LD `Product`/`Offer`/`BreadcrumbList`, sitemap, OG images

**Done when:** the store has the social proof and discount tooling a real shop needs.

## P5 — Hardening

Do not skip this to launch sooner. This is the phase that decides whether the store is
still trustworthy in six months.

- Playwright e2e: register → browse → cart → checkout → order visible
- Unit tests on money arithmetic, totals, shipping rates, coupon rules
- Lighthouse CI with budgets enforced
- Sentry, uptime monitoring, synthetic checkout probe
- Load test the catalog and checkout paths
- Backup restore rehearsal
- Full security checklist from [security](04-security.md#pre-launch-checklist)
- Admin runbook: refunds, stock corrections, failed payments, restore procedure

**Done when:** the pre-launch checklist is fully ticked.

## P6 — AI (optional)

Deliberately last, and genuinely optional. At a few thousand SKUs, Postgres full-text
search already returns the right product. Add these only if search analytics show real
queries failing.

- `pgvector` semantic search on the reserved `products.embedding` column
- Hybrid ranking: full-text + vector
- "Customers also bought" from real order co-occurrence — no model needed, and it
  outperforms an LLM at this task
- Support chatbot grounded in order status and policy documents
- AI-drafted product descriptions in admin, human-approved before publish

Each is independent. Pick the one with evidence behind it; ignore the rest.

## Deliberately excluded

Not "later" — out of scope, and each is a significant redesign if it ever becomes real:
multi-vendor, marketplace, subscriptions, POS, multi-warehouse inventory,
multi-currency checkout, native mobile apps, headless CMS.

## Sequencing notes

- **P2 before P3.** Money first, while the codebase is small enough to reason about.
- **P5 is not optional.** Launching without it means finding these problems with real
  customer orders.
- **P6 last, and only with evidence.** Adding a vector database to a 500-product
  catalog is cost and complexity in exchange for a worse search experience than a GIN
  index.
