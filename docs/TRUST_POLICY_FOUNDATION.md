# SirajiBD Trust & Policy Foundation

Status: Preview implementation
Policy effective/last-updated date: August 18, 2026

This document records the operational decisions behind SirajiBD's public trust pages so the website, checkout, support process and external merchant platforms do not drift apart.

## Public policy routes

- `/returns` — Returns & Refunds
- `/shipping` — Shipping & Delivery
- `/privacy` — Privacy Policy
- `/terms` — Terms & Conditions
- `/contact` — Contact Us
- `/about` — About SirajiBD

Return/refund information stays on its own URL rather than being hidden inside privacy or general terms.

## Return and refund decisions

- Standard return-request window: 7 calendar days from delivery.
- Standard eligible condition: unused, unworn, unwashed, substantially original condition, with original packaging/tags/accessories where applicable.
- Damaged, defective, wrong or incomplete item: approved return/replacement/refund is supported and SirajiBD covers the reasonable return delivery cost when the issue is caused by SirajiBD or fulfilment error.
- Change of mind: eligible within the same 7-day window; customer pays return delivery cost and original delivery fee is not refunded unless the return was caused by SirajiBD or fulfilment error.
- Exchange: offered where suitable replacement stock exists; otherwise approved refund.
- Refund initiation target after returned-item receipt and inspection: 5–7 business days. Payment providers may take additional time to display funds.
- Refund route: original payment method where practical; verified bank/mobile-financial-service route may be used where the original route cannot accept a refund, including appropriate COD cases.
- Cancellation: customer may request cancellation before shipment; after shipment, the return process normally applies.
- Hygiene/health/safety exclusions are allowed only when clearly disclosed before purchase and only where applicable.
- These commercial terms do not override non-waivable customer rights under applicable law.

## Shipping source of truth

Shipping promises must not be hard-coded into policy copy when they can be read from the active store configuration.

The public Shipping & Delivery page reads the current store-level delivery estimate and free-delivery threshold. The checkout's selected rate remains authoritative for an individual order.

External systems such as Google Merchant Center must be kept aligned with the current live SirajiBD checkout and Shipping & Delivery page. If the Merchant Center delivery estimate differs from the live store configuration, update Merchant Center rather than changing the website to a stale external value.

## Privacy and communications

- Essential session/security/cart/checkout storage remains available for service operation.
- Optional browser analytics are consent-gated.
- Meta server-side conversion measurement is disclosed when configured.
- Customer contact information is not sold.
- Transactional order/account/security communications are distinguished from optional marketing communications.
- A purchase email/phone number is not blanket permission for unrelated promotional messaging.

## Product warranty

SirajiBD does not publish a blanket manufacturer or extended warranty for all products. A product-specific warranty is valid only when its material terms are actually disclosed for that product. Defective-product return rights and non-waivable legal rights remain separate.

## Contact and business identity

`STORE_CONTACT_EMAIL` and `STORE_CONTACT_PHONE` remain the current public contact settings. `STORE_BUSINESS_ADDRESS` is optional and must contain only a genuine business address that the operator has intentionally approved for public display.

Do not invent an address, registration, certification, authorised-dealer relationship, business age, warranty or other trust claim merely to satisfy an external platform.

Business/contact information used in Merchant Center or other merchant profiles should remain consistent with the website.

## Checkout disclosure

The checkout provides direct pre-order links to:

- Terms & Conditions
- Returns & Refunds
- Shipping & Delivery
- Privacy Policy

No separate forced checkbox is required for the current ordinary retail flow; the links are placed beside the final order action for clear pre-purchase access.

## SEO and indexing

Every trust page has a unique title, description and canonical path. Production includes these pages in the sitemap; Preview remains non-indexable under the existing environment policy.

## Change control

When a material policy changes:

1. Update the public page.
2. Update `POLICY_LAST_UPDATED` when the published policy version changes.
3. Update this decision record when the operational rule changes.
4. Check checkout/support wording for consistency.
5. Check Merchant Center and other external merchant settings for matching shipping/returns/business details.
6. Validate in Preview before Production release.
