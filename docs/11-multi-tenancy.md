# 11. Multi-tenancy

**Status: design approved, implementation not started.** This document is the target.
Nothing described here exists in the codebase yet unless a section says otherwise.

## Design position

The product changed from one store to a platform selling stores. The code did not, and
it should not change more than the new shape requires. The existing module boundaries,
invariants and data model survive intact; what changes is that every row now belongs to
somebody, and the request has to know who.

Three approaches were rejected before this one.

| Rejected | Why |
|---|---|
| Clone the repo per customer | This is what `scripts/clone-readiness.mjs` was built for and it works fine up to about ten customers. At sixty, one bug fix is sixty deployments, and any customer who received a tweak has drifted from the template and can no longer be updated. Cost per tenant is a deployment; it should be a row. |
| Database per tenant | Cleaner isolation, genuinely. But every tenant costs money before they pay, and a schema migration becomes an N-database orchestration problem. At ৳1,500/month per tenant the margin does not fund the operational overhead. |
| Tenant from a path prefix (`/store/acme/...`) | Avoids all domain work, and destroys the product. A seller paying for a store wants `hersari.com`, not a URL that looks like a marketplace listing. Also breaks cookie scoping, canonical URLs and Meta Pixel attribution per store. |

The chosen model: **one deployment, one Postgres database, tenant resolved from the
request host, isolation enforced twice — once in the repository layer and once by
Postgres Row Level Security.**

Belt and braces is deliberate. A missing `where tenant_id = ?` is an ordinary mistake
that any tired developer makes, and its consequence here is showing one seller another
seller's orders. That is not a bug you recover from commercially, so it gets two
independent controls rather than one careful one.

---

## Module map

Two new modules. Everything else is modified in place.

```
src/modules/
  platform/       NEW — tenants, domains, provisioning, subscription billing
  tryon/          NEW — try-on jobs, credit ledger, provider abstraction
  accounts/       CHANGED — seller and shopper identity split
  catalog/        CHANGED — tenant scoping
  cart/           CHANGED — tenant scoping
  orders/         CHANGED — tenant scoping
  payments/       CHANGED — per-tenant gateway credentials
  shipping/       CHANGED — tenant scoping
  inventory/      CHANGED — tenant scoping
  fraud/          CHANGED — tenant scoping
  policies/       CHANGED — singleton becomes per-tenant row
  storefront-settings/  CHANGED — singleton becomes per-tenant row
  meta/           CHANGED — per-tenant pixel and CAPI credentials
  google/         CHANGED — per-tenant merchant credentials
  admin/          CHANGED — tenant admin, plus a new platform admin surface
  notifications/  CHANGED — sender identity per tenant
```

`platform` is the only module permitted to read across tenants, and only through
functions that name that intent (`listAllTenants`, `platformAuditQuery`). Every such
function carries a comment saying why. No other module may import them.

---

## 1. Tenant resolution

### The table

```
tenants
  id                uuid pk (uuidv7)
  slug              text not null unique     -- 'hersari', used for the platform subdomain
  status            text not null            -- provisioning | active | suspended | cancelled
  plan              text not null            -- starter | growth | ...
  created_at        timestamptz not null
  suspended_at      timestamptz

tenant_domains
  id                uuid pk
  tenant_id         uuid not null -> tenants.id
  hostname          text not null unique     -- 'hersari.com' or 'hersari.platform.com'
  kind              text not null            -- platform_subdomain | custom
  is_primary        boolean not null
  verified_at       timestamptz
```

Hostname is unique across the whole table, not per tenant. It is the lookup key for
every request, so a collision is a routing ambiguity, not a data problem.

A tenant always has exactly one `platform_subdomain` row, created at provisioning. A
custom domain is an additional row, added later, and does not replace the subdomain.
That keeps the store reachable while DNS propagates and gives support a stable URL when
a customer's domain breaks.

### Resolution path

`src/proxy.ts` normalises the host and forwards it. It does not query the database:
the proxy runs on every request including static assets, and its job today is the CSP
and an optimistic auth gate, both of which must stay cheap.

```
proxy.ts        lowercases host, strips port and any leading 'www.',
                sets  x-tenant-host: <normalised>

lib/tenant.ts   getTenant() reads that header, looks up tenant_domains,
                returns the tenant. Wrapped in React cache() for
                per-request dedup and a short-TTL data cache for
                cross-request reuse.
```

`getTenant()` throws on an unknown host rather than falling back to a default. A
silent fallback is how one tenant's data ends up rendered under another tenant's
domain, and it fails invisibly. Unknown host returns 404 with a neutral page.

**Never** accept a tenant from a query parameter, request body, form field or client
header other than the one the proxy itself sets. The proxy overwrites `x-tenant-host`
unconditionally so a client cannot forge it.

---

## 2. Data model: classifying all 29 tables

Every table falls into one of three groups.

**Platform-scoped — no `tenant_id`.** These belong to the platform, not to any store.

`tenants`, `tenant_domains`, `platform_users`, `subscriptions`, `subscription_invoices`,
`rate_limits`.

`rate_limits` stays global because its key already encodes route and subject, and a
per-tenant partition would let one tenant's traffic exhaust another's budget only if
the key were shared, which it is not.

**Tenant-scoped — gains `tenant_id`.** Everything that is a store's own data.

`products`, `product_variants`, `product_images`, `categories`, `carts`, `cart_items`,
`orders`, `order_items`, `payments`, `shipments`, `shipping_rates`,
`inventory_movements`, `fraud_blocks`, `audit_logs`, `policy_pages`, `policy_settings`,
`storefront_settings`, `meta_integration_settings`, `meta_event_deliveries`,
`meta_order_attributions`, `google_integration_settings`, `webhook_events`, `addresses`.

**Identity — handled separately.** See section 4.

`users`, `sessions`, `accounts`, `two_factors`, `verifications`.

### Denormalise `tenant_id` onto child tables

`order_items` could derive its tenant through `orders`. It gets its own `tenant_id`
column anyway, and so does every other child table.

The reason is RLS: a policy can only reference columns on the row being checked. A
policy that has to join to a parent table is both slow and, worse, easy to get subtly
wrong. Every table carries its own `tenant_id` and every RLS policy is a simple
equality check.

The redundancy is guarded by a composite foreign key, so a child row cannot point at a
parent belonging to a different tenant:

```sql
ALTER TABLE orders ADD UNIQUE (id, tenant_id);
ALTER TABLE order_items
  ADD FOREIGN KEY (order_id, tenant_id) REFERENCES orders (id, tenant_id);
```

This makes cross-tenant stitching a constraint violation at write time rather than a
discovery at audit time.

### Indexing

`tenant_id` goes **first** in every composite index, because every query filters on it.
Existing single-column indexes on tenant-scoped tables get rebuilt as
`(tenant_id, <original column>)`. The existing `tsvector` product search index becomes
partial-per-tenant or gains `tenant_id` as a leading column depending on measured plan
shape — decide with `EXPLAIN` against seeded multi-tenant data, not in advance.

---

## 3. Isolation: Row Level Security

### Why it works here

RLS needs the tenant in a session variable, which needs a real database session, which
the HTTP driver cannot give. `src/lib/db/index.ts` already uses the WebSocket `Pool`
driver — chosen for interactive transactions at checkout — so this works without
changing the data layer.

### Mechanism

Every tenant-scoped query runs inside a transaction that sets the tenant first:

```ts
// lib/db/tenant-scope.ts
export async function withTenant<T>(tenantId: string, fn: (tx: Tx) => Promise<T>) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`)
    return fn(tx)
  })
}
```

`set_config(..., true)` is transaction-local, so it cannot leak into the next borrower
of a pooled connection. That third argument is load-bearing; getting it wrong means a
serverless function inherits the previous request's tenant.

Policy shape, applied to every tenant-scoped table:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON products
  USING      (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
```

`FORCE` matters: without it the table owner bypasses RLS, and the application role is
often the owner. `WITH CHECK` matters because `USING` alone filters reads but permits
writing a row into another tenant.

### Two roles

| Role | Used by | RLS |
|---|---|---|
| `app_tenant` | all normal request handling | enforced |
| `app_platform` | migrations, cron, the `platform` module's cross-tenant reads | bypasses |

Application requests never connect as `app_platform`. Platform code paths that need it
go through a separate client in `lib/db/platform.ts`, which is importable only from
`modules/platform/`, enforced by `eslint-plugin-boundaries`.

### What RLS does not replace

Repositories still write `where tenant_id = ?` explicitly. RLS is the net, not the
floor. A query that relies on RLS alone is unreadable, untestable outside a real
database, and silently returns empty rather than failing loudly when the tenant context
is missing.

---

## 4. Identity: the seller / shopper split

This is the highest-risk piece of the whole migration and it is worth reading twice.

### The problem

`users` today has `uniqueIndex('users_email_idx').on(t.email)` — one account per email
across the entire installation. In a platform that is wrong twice over.

First, the same person may shop at three different tenants. Those must be three
unrelated accounts; merging them means store A's owner and store B's owner are looking
at a shared customer record.

Second, and more seriously, a global unique email is an **enumeration leak**. A shopper
signing up at store B with an email already used at store A gets told the address is
taken, which discloses that a specific person shops at a specific competitor's store.

### The decision: two user tables, two Better Auth instances

| | `platform_users` | `users` |
|---|---|---|
| Who | Sellers and platform staff | Shoppers |
| Scope | Global | Per tenant |
| Unique on | `email` | `(tenant_id, email)` |
| Surface | `/admin` | `/account`, checkout |
| Cookie prefix | `mc_platform` | `mc_shop` |
| Second factor | Mandatory (existing `requireRole`) | Optional |

Two Better Auth instances, each configured with its own table names, cookie prefix and
session table. They never share a session. A seller browsing their own storefront as a
customer holds two independent cookies, which is correct — those are two different
capacities.

The existing invariant 11 (mandatory second factor for admin) applies to
`platform_users` only and is unchanged.

### The known unknown

Better Auth's schema mapping supports custom table names and additional fields. What is
**not** confirmed is whether it tolerates a composite unique on `(tenant_id, email)` in
place of its expected unique email, and whether two instances coexist cleanly in one
Next.js app.

**This is the first thing prototyped in step 3, before any other work.** If it does not
hold, the fallback is a thin custom auth layer for shoppers only — shoppers need email,
password, and sessions, not OAuth or passkeys — while sellers keep Better Auth. That
fallback is perhaps a week of work, but discovering the need for it in month two would
cost far more, so it gets resolved first.

Note also `COOKIE_PREFIX` is duplicated between `modules/accounts/auth.ts` and
`src/proxy.ts`, already flagged in CLAUDE.md as un-typechecked. With two instances there
are now two prefixes to keep in sync. Both files gain the same comment.

---

## 5. Configuration: env vars become tenant columns

Today a store's identity lives in `process.env`: the whole `STORE_*` set, plus
`NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_*`, `NEXT_PUBLIC_GOOGLE_TAG_ID`,
`SSLCOMMERZ_*`. Env vars are per-deployment and cannot express per-tenant values.

`storefront_settings` already anticipated this. Its own schema comment says the
singleton id "can become a tenant/store id later without changing the fields or admin
experience." That is exactly what happens: `id` is replaced by `tenant_id`, the
singleton constant is deleted, and the table becomes one row per tenant.

The identity-bearing columns currently have no database default, deliberately, so that
a clone would not inherit "Siraji" as its hero text. With per-tenant rows that hazard
disappears — but keep the no-default rule, because a default frozen into a migration is
still the wrong thing for tenant 200.

Three destinations for the current env surface:

| Category | Examples | Destination |
|---|---|---|
| Store identity and copy | `STORE_NAME`, `STORE_BRAND_*`, hero and footer text, logo | `storefront_settings` row, per tenant |
| Commercial and locale | `STORE_CURRENCY`, `STORE_COUNTRY_*`, `STORE_LOCALE`, contact details | `tenants` row |
| Third-party credentials | SSLCommerz, Meta CAPI token, Google tag | `tenant_integrations`, encrypted |

`tenant_integrations` reuses the existing `INTEGRATIONS_ENCRYPTION_KEY` pattern rather
than introducing a second encryption scheme. The key itself stays an env var — it is
platform infrastructure, not tenant data.

Env vars that remain: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `INTEGRATIONS_ENCRYPTION_KEY`,
`VERCEL_TOKEN`, storage and try-on provider keys. All platform-level.

### Retire the clone tooling

`scripts/clone-readiness.mjs`, `scripts/clone-audit-rules.mjs`,
`docs/CLONE_READINESS.md`, `docs/CLONE_ACCEPTANCE_TEST.md` and
`docs/CLONE_AUDIT_RESULTS.md` encode the old distribution model. They are deleted in
the same commit that removes the last `STORE_*` read, not before — until then they are
still describing something true.

---

## 6. Payments: bring your own gateway

Money moves between shopper and tenant. It never routes through the platform.

This is not a preference. Holding and forwarding other people's funds makes the
platform a payment aggregator, which requires a Payment System Operator licence from
Bangladesh Bank. We do not have one.

`modules/payments` already has a provider interface with SSLCommerz, COD and manual
bank transfer behind it. SSLCommerz already covers bKash, Nagad, Rocket and cards, so
no new provider is needed. The change is credential resolution: instead of reading
`SSLCOMMERZ_STORE_ID` from env, the provider is constructed per request from the
tenant's decrypted `tenant_integrations` row.

Tiering follows the seller's paperwork, not our roadmap:

- **Every tenant** gets COD and manual bKash, which need no credentials and no trade
  licence. This is how the target seller already operates.
- **Tenants with a trade licence** can paste their own SSLCommerz credentials and get
  automated gateway checkout. Sold as an upgrade.

Invariant 6 (independent verification, idempotent webhooks) is unchanged in substance,
but `webhook_events` gains `tenant_id` and its uniqueness becomes
`(tenant_id, provider, provider_event_id)`. Two tenants using separate gateway accounts
can legitimately receive the same provider event ID.

**Webhook routing problem.** A gateway callback arrives at a URL, not at a tenant. The
callback URL therefore embeds the tenant: `/api/webhooks/sslcommerz/<tenant_id>`. The
handler resolves the tenant from the path, loads that tenant's credentials, and
validates the callback against them. The tenant ID in the path is an addressing hint
only — nothing is trusted until the gateway's own validation API confirms the
transaction against that tenant's store credentials.

---

## 7. Subscription billing: sellers paying the platform

Entirely separate from section 6. Different tables, different module, no shared code.

```
subscriptions
  tenant_id, plan, status, current_period_start, current_period_end,
  tryon_credits_included, setup_fee_minor, monthly_minor, currency

subscription_invoices
  tenant_id, period, amount_minor, status, paid_at,
  method, reference          -- 'bkash_manual', the TrxID
```

v1 collection is manual: the seller sends money to a personal bKash number and the
platform admin records the TrxID against the invoice. No gateway, no merchant account,
no automation. At ten customers this is fifteen minutes a month and it is not worth
building anything.

Automated collection is deferred until the trade licence and merchant account exist,
and until manual collection is genuinely annoying. The schema above supports it without
changes.

Money here follows invariant 2 — integer minor units, currency alongside. Platform
revenue may be a different currency from a tenant's store currency, so neither can
assume the other.

### Dunning

`status` on `tenants` drives behaviour, and the storefront must not go dark on day one
of non-payment.

| Days overdue | Effect |
|---|---|
| 1–7 | Seller sees a banner in `/admin`. Storefront unaffected. |
| 8–14 | Try-on disabled. Storefront and checkout unaffected. |
| 15+ | `status = suspended`. Storefront shows a neutral holding page. Data retained. |
| 90+ | Export offered, then deletion. |

Taking a working shop offline over a late ৳1,500 payment loses the customer and their
word of mouth. Degrade the thing we pay for first.

---

## 8. The try-on module

### Placement

Per CLAUDE.md, no separate service and no message broker: a Postgres table and a cron
route. The GPU inference itself is an external vendor call, the same category as
Cloudinary or SSLCommerz — not a service we operate.

### Tables

```
tryon_jobs
  id, tenant_id, variant_id,
  shopper_user_id  nullable      -- guests can try on
  cart_session_id  nullable
  status                          -- queued | moderating | running | done | failed | expired
  provider, provider_job_id
  result_asset_id  nullable       -- storage reference, not the image
  failure_reason   nullable
  cost_minor                      -- what it cost us, for margin analysis
  created_at, completed_at, expires_at

tryon_credit_ledger
  id, tenant_id, delta, reason, job_id nullable, created_at
```

A ledger rather than a counter column. A counter answers "how many are left" and
nothing else; a ledger answers "where did they go", which is the question that gets
asked when a seller disputes their bill. Balance is the sum, cached on the tenant row
and reconciled by the same cron that drains the queue.

### Flow

```
Server Action (Zod first, per invariant 8)
  → rate limit by IP and by tenant
  → credit balance check, fail fast and cheap
  → consent check: explicit, recorded, not a pre-ticked box
  → upload source image to storage, marked ephemeral
  → moderation gate  ── fails → job rejected, no generation, no credit spent
  → insert tryon_jobs row (status: queued), return job id
  → client polls or subscribes

Cron route /api/cron/tryon
  → claims queued jobs with SELECT ... FOR UPDATE SKIP LOCKED
  → calls provider
  → writes result to storage, debits ledger, marks done
  → deletes the source image
```

`FOR UPDATE SKIP LOCKED` is the whole reason a broker is unnecessary. Two concurrent
cron invocations cannot claim the same job, and no job is lost if one dies.

### Provider abstraction

`lib/tryon` mirrors `lib/storage` exactly: one interface, swappable implementation,
nothing else in the codebase imports a vendor package directly.

This is not hypothetical portability. The economics require it. Hosted try-on APIs run
roughly $0.075–0.10 per generation, which at a ৳1,500/month subscription is underwater
somewhere around 150 try-ons. A self-hosted open-weight model on serverless GPU lands
around $0.003–0.008. v1 ships on a hosted API to validate demand without operating
GPUs; the migration to self-hosted happens once volume justifies it, and must be a
change of one implementation file.

Track `cost_minor` per job from day one so the crossover point is a measured number
rather than an argument.

### Moderation is a gate, not a feature

Shoppers upload photographs of people. Some will upload photographs of other people,
and some will upload photographs of minors. Generation does not begin until moderation
passes. No exception for trusted tenants, no admin override, no "temporarily disabled to
debug". A failed moderation call fails the job closed.

### Retention

Source images are never persisted beyond the job. They go to storage marked ephemeral,
are deleted the moment generation completes or fails, and are swept by cron if a job is
abandoned. Results carry `expires_at` and are deleted after it.

The platform is Bangladesh-first, so Illinois BIPA and its per-scan statutory damages
are not the immediate exposure they would be in a US market. That is a reason to be
unhurried about the legal paperwork, not a reason to store body photographs. Design for
the market we expand into, because retrofitting deletion into a system that assumed
permanence is expensive.

---

## 9. Rendering and caching

Catalog pages are statically prerendered today, and docs/05-performance.md commits to
that because it is where the speed comes from. The CSP design in `src/proxy.ts` is
downstream of it — per-request nonces and static prerendering are mutually exclusive,
which that file explains at length.

Tenants do not exist at build time, so build-time static generation cannot survive.
The replacement is **ISR keyed on host**: the first request for a given tenant's page
renders and caches; subsequent requests serve from cache; revalidation is on-demand and
triggered by that tenant's own admin writes.

Consequences to accept:

- Cold-start latency on a tenant's first page view after a deploy or revalidation. The
  CDN absorbs the rest.
- Cache keys must include the host. A cache entry that omits it serves one tenant's
  homepage under another tenant's domain, which is the same catastrophic failure as a
  missing `where` clause, arriving by a different route.
- Cache tags become tenant-scoped: `tenant:<id>:product:<id>`, not `product:<id>`. One
  seller editing a product must not invalidate every other seller's cache.
- The CSP conclusion is unchanged, because the rendering mode is still not per-request
  dynamic. Re-read that comment before touching it anyway.

---

## 10. Admin surfaces

Two distinct admins, and they must not share a codepath.

**Tenant admin** — `/admin` on the tenant's own domain. Authenticated as a
`platform_user` who owns that tenant. Sees only that tenant's data, through the normal
RLS-enforced path. This is the existing admin, tenant-scoped. Mobile-first and Bangla
by default, because the user is running a shop from a phone.

**Platform admin** — a separate route group on the platform's own domain, not reachable
from any tenant domain. Tenant list, provisioning, subscription and invoice recording,
suspension, support impersonation. The only surface that connects as `app_platform`.

Impersonation is the sharpest edge here. If platform staff can view a tenant's admin to
debug, that capability must be explicitly time-boxed, written to `audit_logs` on both
entry and exit, and visible to the seller in their own activity log. A support tool
that can silently read customer data is the thing a competitor uses to discredit you.

---

## 11. Provisioning a tenant

```
1. Platform admin creates the tenant (name, slug, plan, owner email).
2. Insert tenants row, status = provisioning.
3. Seed: storefront_settings row, policy_pages defaults, default shipping rates,
   categories if the plan includes a starter catalog.
4. Insert tenant_domains row for <slug>.platform.com.
5. Invite the owner: a platform_users account with a set-password link.
6. status = active. The store is live on its subdomain.
```

Custom domains are a separate, later, optional flow. The seller adds the domain in
their admin, the platform calls the Vercel SDK to attach it and returns DNS
instructions, and a cron job polls for verification and flips `verified_at`.

Two constraints from Vercel that shape this: the domain API is rate limited to roughly
100 additions per hour per team, so provisioning is a queued job and never a synchronous
button; and wildcard subdomains require the platform domain's nameservers to point at
Vercel. Plan the nameserver move before the first tenant, not after.

Step 5 of provisioning never sets a password on the seller's behalf. The platform
issues an invite link and the seller sets their own.

---

## 12. Migration sequence

Ordered so that the application is deployable and correct after every phase. No phase
leaves the tree broken, and no phase is merged without its tests.

| Phase | Work | Done when |
|---|---|---|
| 0 | Spike the Better Auth composite-unique question (section 4) | Answer known, fallback decided if needed |
| 1 | `tenants` + `tenant_domains` tables; `getTenant()`; proxy header. Everything resolves to a single seeded tenant. | Site behaves identically; host resolution provably in use |
| 2 | Add `tenant_id` to all 23 tenant-scoped tables, backfill to tenant 1, composite FKs, rebuild indexes | Migrations run clean; no behaviour change |
| 3 | Thread tenant through every repository; explicit `where tenant_id` everywhere | Test suite passes with two seeded tenants and no cross-reads |
| 4 | `app_tenant` / `app_platform` roles; RLS policies; `withTenant()` | Deliberately unscoped query returns zero rows rather than another tenant's |
| 5 | `storefront_settings` and `policy_*` singletons become per-tenant; `STORE_*` env moves to columns | Two tenants render visibly different storefronts from one deployment |
| 6 | `tenant_integrations`; per-tenant payments, Meta, Google; webhook path routing | Two tenants take payments through separate gateway accounts |
| 7 | Identity split; two Better Auth instances; shopper unique becomes `(tenant_id, email)` | Same email registers independently at two tenants |
| 8 | Platform admin; provisioning; Vercel domain attachment | A tenant is created end to end without touching the database |
| 9 | Subscriptions, invoices, dunning | A tenant can be suspended and restored |
| 10 | Try-on: tables, moderation gate, provider abstraction, cron worker, credit ledger | A shopper completes a try-on and the ledger debits |

Phase 0 gates everything. Phases 1–4 are the load-bearing refactor and should be
reviewed hardest. Try-on is last deliberately: it is the feature that sells the product,
but it is worthless sitting on a foundation that leaks data between tenants.

---

## 13. Testing the thing that matters

Tenant isolation gets its own test layer, not a few assertions scattered through
existing suites.

- A fixture that seeds two tenants with deliberately colliding data — same product
  slugs, same customer emails, same order numbers.
- For every repository read, a test asserting tenant B's context returns zero of tenant
  A's rows.
- For every repository write, a test asserting a forged `tenant_id` in the payload is
  rejected rather than honoured.
- A lint or CI check that fails on a tenant-scoped table queried outside `withTenant()`.
- An RLS-level test that runs raw SQL with no application filtering and confirms the
  policy alone still isolates.

That last one is the only test that proves the second control actually works. Without
it, RLS is a comforting assumption rather than a control.
