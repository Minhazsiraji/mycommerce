# Clone readiness / white-label foundation

Status: Preview implementation

SirajiBD remains the default deployment. A client clone should override identity and credentials rather than editing source files for domain/SEO identity.

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

These now drive the canonical origin, root SEO metadata and storefront header identity. SirajiBD-compatible defaults are used when omitted.

Homepage and footer marketing copy remain editable through the existing storefront-settings Admin workflow. Contact details remain separately configurable with `STORE_CONTACT_EMAIL`, `STORE_ADMIN_EMAIL`, `STORE_CONTACT_PHONE`, and `STORE_BUSINESS_ADDRESS`.

## Client clone checklist

For every client, create separate infrastructure and credentials. Never reuse SirajiBD production secrets.

1. Clone/fork the repository into the client's ownership model.
2. Create a fresh production database and run migrations.
3. Create fresh Better Auth secret and set the client's auth/app URLs.
4. Set the store identity variables above.
5. Create or connect the client's media account/credentials.
6. Configure transactional email and sender domain.
7. Configure payment credentials and keep sandbox mode until client acceptance testing passes.
8. Configure bank-transfer details only when the client actually supports that method.
9. Configure Meta Pixel/CAPI through Admin or environment fallback with client-owned credentials.
10. Configure public support/business contact details.
11. Edit homepage/footer content and upload the client's imagery.
12. Add/import the client's catalogue, prices, stock and delivery rules.
13. Review and publish client-specific Returns, Shipping, Privacy, Terms, Contact and About content. Do not copy legal/business claims that are not true for the client.
14. Connect the client's domain and verify canonical/robots/sitemap behavior.
15. Connect Google Search Console and Merchant Center where applicable.
16. Submit the client's `/google-merchant-feed.xml` only after feed validation.
17. Run checkout, payment, stock, email, analytics, SEO, mobile, security and migration smoke tests before go-live.

## Isolation rules

- Database: separate per client unless a future multi-tenant architecture is explicitly designed and audited.
- Auth secrets: unique per client.
- Payment, Meta, email and storage credentials: unique/client-owned.
- Domains/canonicals: client-specific.
- Customer/order data: never copied from SirajiBD into a client clone.
- Production migrations: execute against the intended client's database only.

## Remaining productisation work

This foundation removes the most important domain/SEO/header hard-coding. Some SirajiBD-oriented content can still exist in editable defaults, seed/demo catalogue data, policy copy and admin labels. Before marketing the product as a one-click white-label SaaS, continue moving those remaining presentation defaults into an onboarding/admin configuration layer and add an automated clone-readiness audit.

The current commercial state is therefore: cloneable deployment template, not yet a fully automated multi-tenant SaaS.
