# SirajiBD SEO hardening

This branch contains the verified technical SEO fixes identified during the Production audit.

## Included

- Self-referencing canonical URLs for active product pages.
- Product Open Graph/Twitter URLs aligned with the canonical Production URL.
- Product JSON-LD with Product, Brand, Offer, BDT price, availability, SKU, image and canonical URL where data exists.
- Product BreadcrumbList JSON-LD plus an accessible visible breadcrumb.
- Safe generated fallback meta/schema descriptions when a product record has no description.
- Stronger homepage meta description.
- A compact, customer-useful homepage section describing SirajiBD's four core categories and shopping flow in Bangladesh.
- SirajiBD application icon using Next.js `app/icon.svg` metadata convention.

## Intentionally unchanged

- `robots.ts` and `sitemap.ts`: both were verified working correctly on Production.
- Category-card `alt=""`: those images are decorative within already-labelled links and should not be changed just to satisfy a simplistic SEO checker.
- Text-to-code ratio: not treated as an SEO target.

## Still requires catalogue content work

The active catalogue should eventually receive product-specific human-written descriptions in Admin. The code now provides a safe unique fallback for metadata/structured data, but that fallback is not a replacement for richer customer-facing product copy.

## Release rule

Preview and validate before merge. Do not deploy or merge to Production without owner approval.
