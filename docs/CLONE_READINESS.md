# Clone readiness / white-label V1

Status: **V1 release candidate** on the clone-finalization branch. Do not label or release as `commerce-v1.0-clone-ready` until the automated clean-install gate, Preview acceptance test, and explicit owner release approval all pass.

MyCommerce is a cloneable single-store deployment template. SirajiBD remains the built-in default deployment, but a client clone must override identity and use isolated client-owned infrastructure and credentials. This is not a shared multi-tenant SaaS.

## Store identity environment

- `STORE_NAME`
- `STORE_BRAND_TEXT`
- `STORE_BRAND_ACCENT`
- `STORE_CANONICAL_URL`
- `STORE_COUNTRY_CODE`
- `STORE_COUNTRY_NAME`
- `STORE_CURRENCY`
- `STORE_LOCALE`
- `STORE_DEFAULT_DESCRIPTION`

These drive the canonical origin, root SEO metadata, storefront identity, structured product currency, and Merchant feed identity/origin. SirajiBD-compatible defaults remain only as defaults for the existing SirajiBD deployment.

Homepage/footer marketing copy is editable through Admin. Public identity/contact values are separately configurable with `STORE_CONTACT_EMAIL`, `STORE_ADMIN_EMAIL`, `STORE_CONTACT_PHONE`, and `STORE_BUSINESS_ADDRESS`.

## Integration isolation

Every client clone must use its own credentials and accounts.

- Database: new database per client.
- Better Auth: unique secret and client URLs.
- Cloudinary: client-owned media credentials.
- Resend: client-owned API key and verified sender/domain.
- SSLCommerz: client credentials; `SSLCOMMERZ_SANDBOX=true` through acceptance testing, and switch to live only after explicit go-live approval.
- Bank transfer: client-specific bank details only if that payment method is offered.
- Meta: configurable through Admin or environment fallback. Pixel/CAPI can remain disabled when not configured/enabled. CAPI secrets remain server-side/encrypted when Admin-managed.
- Google: configurable through Admin or environment fallback. Tracking can remain disabled when not enabled. Every clone uses its own Google tag.
- Merchant Center/Search Console: client-owned properties for the client's real domain.

Never copy SirajiBD production secrets, customer records, orders, analytics credentials, payment credentials, or database contents into a client clone.

## SEO / discovery isolation

- `STORE_CANONICAL_URL` is the source of the clone's canonical origin.
- Only `VERCEL_ENV=production` is indexable.
- Preview/non-production robots policy disallows crawling.
- Sitemap uses the configured site origin.
- `/google-merchant-feed.xml` uses the configured store name, canonical URL, currency and live clone catalogue.
- The feed must not be submitted to Merchant Center until product/feed validation and client policy/contact checks pass.

## Automated clone audit

Run:

```bash
pnpm clone:audit
```

The audit fails when required clone configuration is missing from `.env.example`, SSLCommerz stops being sandbox-first, example secrets become populated, canonical/store/integration configuration becomes non-configurable, Preview indexing protection disappears, Merchant feed stops using store configuration, or unexpected SirajiBD production origin / Google tag literals are introduced into runtime source.

GitHub CI also runs the complete Drizzle migration chain against a brand-new PostgreSQL 18 database and verifies key commerce/integration tables exist. This is the clean-install migration gate; it prevents an application release whose migrations only work against the historical SirajiBD database.

## Client clone checklist

1. Fork/clone the approved release tag into the client's ownership model.
2. Create a fresh production database and run the full migration chain.
3. Generate a fresh Better Auth secret and configure client auth/app URLs.
4. Set all client store identity/canonical/country/currency values.
5. Create/connect client media credentials.
6. Configure transactional email and sender domain.
7. Configure payment credentials and keep SSLCommerz sandbox enabled for acceptance testing.
8. Configure bank details only if applicable.
9. Configure client-owned Meta and Google integrations, or leave them disabled.
10. Configure public support/business contact details.
11. Edit homepage/footer content and upload client imagery.
12. Add/import client categories, products, variants, prices, stock and delivery rules.
13. Review and publish client-specific Returns, Shipping, Privacy, Terms, Contact and About content. Never preserve a SirajiBD claim that is not true for that client.
14. Connect the client production domain and verify canonical/robots/sitemap behavior.
15. Connect Search Console / Merchant Center where applicable.
16. Validate `/google-merchant-feed.xml` before submission.
17. Complete the end-to-end acceptance loop below before go-live.

## Fresh-clone acceptance loop

The release is not considered commercially clone-ready until this works against isolated clone infrastructure:

`new deployment/database → migrations → owner/admin access → category/product + image/variant/stock → storefront → cart → checkout → payment/COD → confirmed order → admin fulfilment/shipment → customer order tracking`

Also verify:

- Preview stays non-indexable.
- Production canonical/sitemap/robots use the clone's domain.
- SSLCommerz remains sandbox during acceptance testing.
- Meta/Google do not load when disabled or before analytics consent.
- When enabled, paid Purchase events contain the actual clone currency/value and deduplicate correctly.
- COD/unpaid orders do not produce paid Purchase events.
- Transactional email uses the client sender identity.
- Product images come from client media storage.
- No SirajiBD customer/order data exists in the clone.

## Release freeze

After all gates pass and the owner explicitly approves release:

1. Merge the clone-finalization PR to `main`.
2. Verify Production CI/deployment is green and SirajiBD smoke tests remain healthy.
3. Create immutable release tag `commerce-v1.0-clone-ready` at the verified `main` commit.
4. Future client clones start from that release tag, not an arbitrary development branch.

## Commercial positioning

V1 is a **cloneable isolated e-commerce deployment template** suitable for configuring and deploying separately for clients. It must not be marketed as a one-click multi-tenant SaaS: automated tenant provisioning, consolidated subscription billing, central tenant administration and shared multi-tenant data architecture are outside this V1 boundary.
