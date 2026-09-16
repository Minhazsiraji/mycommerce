# ADR-001 — Virtual Try-On identity boundary

**Status:** Accepted 2026-09-16
**Decision owner:** AgentSiraji / SirajiBD platform architecture
**Phase:** P0 multi-tenant identity spike

## Context

The original multi-tenancy design assumed two Better Auth instances:
one global seller/platform identity store and one tenant-scoped shopper identity store.
The shopper design required the same email to register independently under two tenants.

A Phase-0 spike was run on branch `spike/auth-multitenant` from
`d5c1824ac507f16d1b5a263f78e32c7c9929641f` against the isolated Neon
`Development` branch `br-snowy-thunder-azn6gfhx`. Production was not modified.

## Evidence

The spike used separate Better Auth tables and a database unique constraint on
`(tenant_id, email)`. The auth route was mounted at `/api/auth-shop-spike`.
After correcting the route `basePath` and Drizzle plural schema mapping:

- Tenant A signup with `spike-test@example.com` returned HTTP 200.
- Tenant A received its own user ID and session.
- Tenant B signup with the same email returned HTTP 422.
- Better Auth returned `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`.
- PostgreSQL itself permitted the composite uniqueness shape; rejection happened in auth logic.
## Decision

Better Auth authenticates platform users only: tenant owners, tenant staff and
platform staff. A global platform user may have memberships in multiple tenants.

End shoppers do not receive a global AgentSiraji identity merely to use Virtual Try-On.
The customer plane uses tenant-scoped try-on sessions with random identifiers.
A tenant may optionally supply a pseudonymous `external_customer_ref` derived from its
own customer identity; raw customer IDs or cross-tenant email identity are not required.

Every customer-plane record carries `tenant_id`, and tenant integrity is enforced in
the database as well as the application layer.

## Consequences

- No cross-store account-enumeration leak from globally unique shopper email.
- No forced signup before trying a product.
- SirajiBD can remain an independent commerce application and become VTO tenant #1.
- Shopify, WooCommerce and custom stores can integrate without adopting AgentSiraji auth.
- Merchant/platform authentication remains on the existing proven Better Auth stack.
- The rejected two-Better-Auth shopper design must not be reintroduced without a new ADR.

## Cleanup

The spike application code is disposable after this ADR is committed.
Four `shopper_*` tables remain on the Neon Development branch until explicit approval
is given for destructive database cleanup; they are not referenced by production code.
