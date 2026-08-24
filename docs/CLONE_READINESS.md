# Clone readiness / white-label V1

Status: **V1 release candidate** on the clone-finalization branch. Do not label or release as `commerce-v1.0-clone-ready` until the automated clean-install gate, Preview acceptance test, and explicit owner release approval all pass.

> **Merge prerequisite — policy periods.** The Returns page no longer hardcodes a 7-day return window or a 5–7 business-day refund time; both come from **Admin → Content → Policy pages → Return and refund periods**. Until SirajiBD sets `7` / `5` / `7` there, its Returns page will say the period is confirmed on contact rather than stating a number. Set them before or immediately after merge.
>
> **Merge prerequisite.** SirajiBD Production currently sets no `STORE_*` variables at all — it runs entirely on what used to be hard-coded defaults. Those defaults are now generic, and production refuses to boot without identity. **Set `STORE_NAME`, `STORE_BRAND_TEXT`, `STORE_BRAND_ACCENT` and `STORE_CANONICAL_URL` on the Production environment before merging**, or the next production deploy fails. It fails loudly and the previous deployment keeps serving, which is the intended behaviour — but it is still a deploy you have to plan.

MyCommerce is a white-label single-store commerce product. SirajiBD is Store #1 running on it — not the software's identity. There is no built-in business to inherit: every deployment, SirajiBD included, configures its own name, domain and integrations, and a production deployment that configures neither `STORE_NAME` nor `STORE_CANONICAL_URL` fails to build rather than serving a placeholder. Each clone uses isolated client-owned infrastructure and credentials. This is not a shared multi-tenant SaaS.

## What this product is ready for

These are rated separately on purpose. Averaging them would let a genuine strength cover for a genuine limit.

| Capability | Status |
|---|---|
| White-label branding and identity | **Ready** — no business identity is compiled in |
| Bangladesh commerce, end to end | **Ready** — the path this software was built for |
| Data isolation between deployments | **Ready by design**, gated on per-deployment configuration |
| Analytics isolation | **Ready** — every integration defaults to off |
| Multi-currency | **Ready** — one configured currency drives price, cart, checkout, order, payment, email, analytics, JSON-LD and feed |
| International checkout | **Ready** — country presets drive the address and phone model |
| Payment-provider portability | **Partial** — SSLCommerz is optional, but still the only online gateway implemented |
| Tax policy | **Configurable** — none / inclusive / exclusive at one rate; not a jurisdiction-aware tax engine |

## Internationalization boundary

Branding is fully white-label. **Commerce is not.** A client outside Bangladesh cannot take an order on this software today, and the following is what would have to change:

- ~~**Address model.**~~ **Fixed.** `NEXT_PUBLIC_STORE_COUNTRY_CODE` selects a country preset. `BD` keeps the district → city → thana cascade validated against the district tables; anything else gets a generic address — free-text city, optional state/province/region, required postal code. The `district` and `upazila` columns carry region and sub-area for every country rather than being renamed, because orders snapshot the address as JSON at purchase time.
- ~~**Phone.**~~ **Fixed.** Validation comes from the preset: Bangladeshi mobile formats on a `BD` store, E.164 elsewhere.
- ~~**Payment is an architectural requirement.**~~ **Fixed.** Checkout offers only the methods the deployment has credentials for, and the server rejects any other. A clone with no gateway can still trade on cash on delivery.
- ~~**Currency.**~~ **Fixed.** `@/lib/money` now derives the code, symbol and decimal places from `STORE_CONFIG`, and one configured currency flows through price, cart, checkout, order, payment, email, analytics, JSON-LD and the Merchant feed. Zero-decimal currencies (JPY, KRW, VND) are handled. The order row writes its currency explicitly rather than inheriting the `BDT` column default, which would otherwise have made payment verification reject every online payment on a non-BDT store. Known gap: symbols render as a prefix, so suffix currencies read `kr1,999.50` — unambiguous but not idiomatic.
What genuinely remains:

- **Only one online gateway exists.** SSLCommerz is now optional rather than required, but it is still the only implementation, and it settles for Bangladeshi merchants. An international clone can take cash on delivery and bank transfer today; taking cards abroad needs a second provider written against `modules/payments`. That is a contained change, not an architectural one.
- **Tax is one configured rate, not a tax engine.** `NEXT_PUBLIC_STORE_TAX_MODE` supports `none`, `inclusive` and `exclusive` with a configured rate, and the amount is calculated in integer minor units, recorded on the order and shown on checkout, the order page, Admin and the confirmation email. What it does *not* do is look up a customer's jurisdiction, handle nexus, product tax categories, exemptions or reverse charge. Clients remain responsible for their own local tax compliance. A store with genuinely per-jurisdiction rates needs a tax provider integration this does not have.
- **Address validation is permissive outside Bangladesh.** The generic preset checks shape, not correctness — it cannot tell you a US ZIP does not match its state. Deliberate: rejecting a valid foreign address costs a real sale, and we cannot enumerate the world's administrative divisions.
- **Currency symbols render as a prefix**, so suffix currencies read `kr1,999.50`.

Positioning: **fully ready to sell for Bangladesh.** Sellable internationally for a store that can operate on cash on delivery or bank transfer, in a jurisdiction where tax-inclusive pricing is acceptable. Do not claim international card payments or tax compliance.

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

Never copy SirajiBD production secrets, customer records, orders, analytics credentials, payment credentials, or database contents into a client clone. The full prohibition list is at the end of this document.

## Vercel environment scoping

Variable **names** only — values live in Vercel and must never be pasted into a repository, an issue, or a chat.

Vercel scopes a variable to Production, Preview, Development, or a specific Preview branch. Getting the scope wrong is how an isolated Preview quietly ends up writing to the live store, so scope is part of the contract, not a detail:

| Scope | Variables | Why |
|---|---|---|
| **Branch-specific Preview** (must point at isolated infrastructure) | `DATABASE_URL`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` | A shared-Preview `DATABASE_URL` puts test orders and test payments into the live store's database. The two URL values must match the Preview deployment's own origin or auth callbacks break. |
| **Shared Preview** (safe to share, must stay non-live) | `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_SANDBOX` (`true`), `META_CAPI_TEST_EVENT_CODE` | Sandbox payment credentials move no real money. `SSLCOMMERZ_SANDBOX` must never be `false` outside Production. |
| **Production only** | Live `SSLCOMMERZ_*` with `SSLCOMMERZ_SANDBOX=false`, `CRON_SECRET` | Live settlement and the cron authorization token have no business existing in a Preview build. |
| **All environments** (same value is correct) | `STORE_*` identity keys, `CLOUDINARY_*`, `EMAIL_FROM`, `RESEND_API_KEY`, `META_GRAPH_API_VERSION` | Identity and media are properties of the store, not the deployment. |
| **Per-deployment secret** (unique per environment, never shared) | `BETTER_AUTH_SECRET`, `INTEGRATIONS_ENCRYPTION_KEY` | Sharing either lets one environment mint sessions or decrypt integration credentials for another. |
| **Optional — omit to disable** | `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_DATASET_ID`, `META_CAPI_ACCESS_TOKEN`, `NEXT_PUBLIC_GOOGLE_TAG_ID`, `STORE_CONTACT_PHONE`, `STORE_BUSINESS_ADDRESS` | Analytics stays off until a clone supplies its own destination. Admin-managed settings override these when present. |

Two operational notes:

- `vercel env pull` returns the literal string `[SENSITIVE]` for variables marked sensitive. It cannot be used to read or verify a secret's value — only to confirm which names exist.
- `.env.example` ships the `SSLCOMMERZ_*` keys commented out. The clone audit checks that each required name *appears* in the file, which a commented line satisfies; it does not prove the clone has configured payment. Verify payment configuration in the acceptance loop, not from the audit.

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

It also fails on a hard-coded store **name**, bare host, business email address, Meta pixel/dataset ID, Resend key, Meta access token, database URL or Cloudinary credential in any shipped string. The identity check was added after the audit reported PASS while 36 `SirajiBD` literals sat in the Terms, Privacy, Returns, Shipping, About and Contact pages — a clone's own legal pages named another business. Comments are exempt, since they document history and never reach a customer; so is `src/lib/store-config.ts`, the one file that names the fallbacks.

**The gate is itself tested.** `src/lib/clone-audit-rules.test.ts` feeds each rule a deliberately-broken fixture and asserts it fails, including a case proving the `store-config.ts` exemption has not simply disabled the rule. A gate observed only in the passing state is not evidence of anything.

Browser storage keys are now store-neutral (`commerce_analytics_consent`, `commerce_meta_*`, `commerce:*` events). The pre-rename names are still read: a stored consent choice is a privacy decision, and losing one would re-prompt a visitor or, worse, read a previous refusal as "unset" and resume tracking. `migrateLegacyConsent` copies the old cookie across on first visit and clears it; the legacy purchase key is still checked before firing so a tab left open across the deploy cannot report a second Purchase. Covered by `src/modules/meta/consent-migration.test.ts`. The legacy reads can be deleted once the one-year cookie has expired for everyone, some time after 2027-08.

## Deployment preflight

```bash
pnpm preflight
```

`clone:audit` reads the source and asks whether this codebase could be sold.
Preflight reads the environment and asks whether *this deployment* is coherent —
a different question. A store can pass the audit and still be configured to
display one currency while charging another, to take live card payments from a
Preview build, or to offer a customer no way to pay at all.

It fails on: missing production identity; a `STORE_*` value set without its
`NEXT_PUBLIC_` twin, or the two disagreeing; a currency or country that is not a
valid ISO code; no available payment method; live SSLCommerz without
credentials; **live SSLCommerz outside production**; a non-production deployment
pointed at the original store's domain; and invalid tax configuration. It warns
on production left in sandbox, a tax mode and rate that cancel out, and a Google
tag configured on Preview.

Like the clone audit, the rules are tested against fixtures
(`src/lib/preflight-rules.test.ts`) so the gate is known to be capable of
failing.

GitHub CI also runs the complete Drizzle migration chain against a brand-new PostgreSQL 18 database and verifies key commerce/integration tables exist. This is the clean-install migration gate; it prevents an application release whose migrations only work against the historical SirajiBD database.

## Client clone checklist

1. Fork/clone the approved release tag into the client's ownership model.
2. Create a fresh production database and run the full migration chain.
3. Generate a fresh Better Auth secret and configure client auth/app URLs.
4. Set all client store identity/canonical/country/currency values. `STORE_NAME` and `STORE_CANONICAL_URL` now drive every customer-facing mention of the business, including the legal pages, so getting these two right replaces what used to be manual source editing.
5. Create the first admin. `role` is not settable through any request (invariant 12 in `04-security.md`), so it is made out of band: the owner registers through the site, verifies the address, then someone with database access runs `pnpm admin:promote owner@client.example`. Sign-in is refused until the address is verified, and the first sign-in will require enrolling a second factor.
6. Create/connect client media credentials.
7. Configure transactional email and sender domain.
8. Configure payment credentials and keep SSLCommerz sandbox enabled for acceptance testing. The `SSLCOMMERZ_*` keys ship commented out in `.env.example`; a clone that leaves them commented has a working store with cash on delivery only.
9. Configure bank details only if applicable.
10. Configure client-owned Meta and Google integrations, or leave them disabled.
11. Set `STORE_CONTACT_EMAIL` and `STORE_ADMIN_EMAIL` explicitly. Left unset they fall back to `business@` and `admin@` on the configured domain, which is a plausible-looking address the client may not actually own.
12. Edit homepage/footer content and upload client imagery.
13. Add/import client categories, products, variants, prices, stock and delivery rules.
14. Replace the policy pages in **Admin → Content → Policy pages**, then set `STORE_POLICIES_REVIEWED=true` (production preflight fails without it). Editing them no longer requires touching source. Also configure the logo and site icon there — a client never replaces a file in `src/`.
15. Review and publish client-specific Returns, Shipping, Privacy, Terms, Contact and About content. **These pages are templates, not legal advice.** The business name now follows `STORE_NAME` automatically, but the substantive claims — return windows, delivery coverage, warranty position, data-handling description, governing law — were written for a Bangladeshi retailer and are not verified against any other jurisdiction. The client is responsible for reviewing local consumer-protection, tax, privacy and returns requirements, and for having the published text checked by someone qualified to do so. Shipping this template unchanged is a client decision, and it must be an informed one.
15. Connect the client production domain and verify canonical/robots/sitemap behavior.
16. Connect Search Console / Merchant Center where applicable.
17. Validate `/google-merchant-feed.xml` before submission.
18. Complete the end-to-end acceptance loop below before go-live.

## Never copy from the source store

A clone is only isolated if nothing crosses over. None of the following may be copied from SirajiBD — or from any earlier client — into a new deployment:

- **Database contents.** Never restore a dump, never point a clone at an existing `DATABASE_URL`. Customers, orders, addresses and payment records belong to one store. Start from an empty database and the migration chain.
- **`BETTER_AUTH_SECRET`.** A shared secret means sessions minted for one store are valid at the other.
- **`INTEGRATIONS_ENCRYPTION_KEY`.** This decrypts admin-managed integration credentials; sharing it exposes every store's tokens to every other store.
- **Payment credentials.** `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASSWORD` settle money into a specific merchant account. A clone using them takes the client's customers' money into someone else's account.
- **Analytics destinations.** `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_DATASET_ID`, `META_CAPI_ACCESS_TOKEN`, `NEXT_PUBLIC_GOOGLE_TAG_ID`. A shared tag reports the client's revenue into another business's ad account and pollutes both.
- **Media, email and cron credentials.** `CLOUDINARY_*`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`.
- **Product imagery, copy and catalogue data**, unless the client has the rights to it.

The safe default for every integration on a fresh clone is *disabled*. Turn each one on only after the client's own credentials are in place.

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
