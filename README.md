# MyCommerce — clone-ready single-vendor commerce

A production-tested single-vendor e-commerce application built with Next.js 16, TypeScript, Postgres/Neon, Drizzle ORM, Better Auth, Cloudinary, Resend and Vercel.

The repository is designed to be deployed as an isolated store per client. Each client must use separate database, auth, payment, analytics, email, media and domain credentials. It is a cloneable deployment template, not a shared multi-tenant SaaS.

## Included

- Responsive storefront, category/product/search/cart flows
- Guest and account checkout
- Cash on Delivery, bank transfer and SSLCommerz integration
- Order management, fulfilment tracking and stock controls
- Admin catalog, homepage/footer, delivery and analytics management
- Meta Pixel + Conversions API with consent and Purchase deduplication
- Google tag integration with consent and Purchase deduplication
- Google Merchant XML feed at `/google-merchant-feed.xml`
- SEO canonicals, sitemap, structured data and Preview noindex protection
- Returns, shipping, privacy, terms, contact and about pages
- Automated database migrations during Vercel builds
- Clone-readiness CI checks

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Postgres/Neon · Drizzle ORM · Better Auth · Cloudinary · Resend · Vercel

Node.js 22.x and pnpm are required.

## Fresh client deployment

### 1. Create isolated infrastructure

Create a new database and new client-owned accounts/credentials. Never copy SirajiBD production secrets or customer/order data into a clone.

### 2. Configure environment

```bash
pnpm install
cp .env.example .env.local
```

Fill `.env.local` with the new client's values. At minimum for a working local application:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `STORE_NAME`
- `STORE_BRAND_TEXT`
- `STORE_BRAND_ACCENT`
- `STORE_CANONICAL_URL`
- `STORE_COUNTRY_CODE`
- `STORE_COUNTRY_NAME`
- `STORE_CURRENCY`
- `STORE_LOCALE`

Configure Cloudinary before image uploads, Resend before transactional email, and client-owned payment/Meta/Google credentials only when those integrations are enabled.

### 3. Start from a clean database

```bash
pnpm db:migrate
```

The same migration command is executed automatically by `pnpm vercel-build` before every Vercel build. A migration failure prevents deployment of incompatible application code.

### 4. Run locally

```bash
pnpm dev
```

Create the first account, promote the intended owner/admin according to the deployment's controlled onboarding process, then configure the store through Admin.

### 5. Configure the client store

Before go-live:

1. Set store identity/domain/contact values.
2. Configure homepage/footer content and client imagery.
3. Add categories, products, variants, prices and stock.
4. Configure delivery zones/rates.
5. Configure payment methods. Keep SSLCommerz sandbox enabled through acceptance testing.
6. Configure Meta and Google only with client-owned IDs/credentials.
7. Review and replace all policy/business copy so it is true for the client.
8. Verify transactional email sender/domain.
9. Connect the client's production domain.
10. Verify `/robots.txt`, `/sitemap.xml` and `/google-merchant-feed.xml`.

### 6. Release acceptance test

Run this complete loop on the client's own deployment/database before launch:

`admin login → category/product creation → stock → storefront product → cart → checkout → payment/COD → order confirmation → admin fulfilment → customer tracking`

Also verify analytics consent, Meta/Google Purchase deduplication (when enabled), email delivery, mobile layout and Preview noindex behavior.

## Clone-readiness checks

```bash
pnpm clone:audit
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

GitHub CI additionally runs the full Drizzle migration chain against a brand-new PostgreSQL database so a migration history that only works on the existing production database cannot silently pass.

See [`docs/CLONE_READINESS.md`](docs/CLONE_READINESS.md) for isolation rules, audit scope and the release checklist.

## Important deployment rules

- One database per client unless a separately designed/audited multi-tenant architecture is introduced.
- Never reuse auth secrets, payment credentials, Meta tokens, Google IDs, Cloudinary credentials or email credentials between clients.
- Preview deployments must remain non-indexable; only the Vercel Production environment is indexable.
- `STORE_CANONICAL_URL` must always be the client's real production origin.
- Merchant Center/Search Console integrations belong to the client store/domain.
- Do not switch SSLCommerz from sandbox to live until client acceptance testing is complete.

## Architecture documentation

- [Architecture](docs/01-architecture.md)
- [Data model](docs/02-data-model.md)
- [API](docs/03-api.md)
- [Security](docs/04-security.md)
- [Performance](docs/05-performance.md)
- [Clone readiness](docs/CLONE_READINESS.md)
- [Google Merchant feed](docs/GOOGLE_MERCHANT_FEED.md)

`CLAUDE.md` contains repository development rules and invariants.
