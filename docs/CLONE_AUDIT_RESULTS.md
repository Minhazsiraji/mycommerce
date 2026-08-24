# Clone Readiness Audit Results — V1 Candidate

This document records the release-gate evidence for the clone-ready V1 candidate. It contains no credentials.

## Repository hygiene

- Open pull requests at audit start: PR #26 plus stale PR #6.
- PR #26 was separately validated, explicitly approved, merged to `main`, and deployed successfully before this audit.
- PR #6 was reviewed as 124 commits behind current `main` and closed unmerged as superseded.
- Current open pull-request count after cleanup: zero before opening the dedicated clone-finalization PR.
- Historical remote feature branches may remain for Git history; no stale branch is part of the V1 release source. The release source is the final verified `main` commit/tag only.

## Configuration audit

Verified architecture/configuration points:

- Store name, split brand text, canonical URL, country, currency, locale and default description are environment-configurable.
- Public contact email/admin email/phone/business address are environment-configurable.
- Meta Pixel/CAPI support Admin-managed configuration plus environment fallback and may remain disabled.
- Google tag support Admin-managed configuration plus environment fallback and may remain disabled.
- SSLCommerz credentials are deployment configuration and the example configuration is sandbox-first.
- Cloudinary and Resend credentials are deployment-specific.
- Integration encryption key is server-only.
- Merchant feed uses configured store name, canonical origin and currency.
- Only Vercel Production is indexable; Preview/non-production robots blocks indexing.
- Vercel build runs the migration runner before application build.

## Automated audit

`pnpm clone:audit` was added to scan the clone contract on every CI pull request. The final PR must show this check passing.

## Fresh database evidence

A brand-new isolated Neon project/database was created specifically for clone-readiness testing. No SirajiBD production database or customer/order data was reused.

The first Drizzle migration was independently executed against that empty database and succeeded. The final CI adds a stronger repeatable gate: all repository migrations run against a brand-new PostgreSQL 18 service, followed by verification of key auth/catalog/order/Meta/Google tables.

The final V1 release requires this CI fresh-database job to pass.

## Manual acceptance gate

A full manual fresh-clone operational loop remains a release gate and is documented in `docs/CLONE_ACCEPTANCE_TEST.md`:

`isolated deployment/database → admin → product/stock → storefront/cart → checkout/payment → order → fulfilment → customer tracking`

No release tag is created until this gate and the final owner approval are complete.
