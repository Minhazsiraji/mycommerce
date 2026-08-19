# Google Merchant hosted feed

Status: Preview implementation

Endpoint: `/google-merchant-feed.xml`

The endpoint is generated from the live catalogue. It is not a second catalogue and must not be manually edited.

## Inclusion rules

- Product status must be `active`.
- Archived variants are excluded.
- Products without at least one image or one active variant are omitted from the feed rather than emitting incomplete items.
- Each sellable variant is emitted as an individual Merchant item when a product has variants.
- Variant landing links use `?variant=<variant-id>` so the corresponding price and stock state is selected on the product page.
- The canonical product URL remains `/p/<slug>`.

## Attribute mapping

Required/core mappings:

- `g:id` <- variant SKU, falling back to variant UUID
- `title` <- product title plus variant title where relevant
- `description` <- feed description, then storefront description, then a neutral fallback
- `link` <- canonical product route plus variant query when relevant
- `g:image_link` <- first product image
- `g:additional_image_link` <- up to ten additional images
- `g:availability` <- actual variant stock
- `g:price` <- actual variant price, or compare-at price when an active sale is represented
- `g:sale_price` <- actual selling price when compare-at price is higher
- `g:condition` <- product condition
- `g:brand`, `g:gtin`, `g:mpn` <- only when the catalogue actually contains them
- `g:identifier_exists=no` <- only when the catalogue explicitly records that identifiers do not exist and no UPI is being emitted
- `g:google_product_category` <- configured Google product category when present
- `g:product_type` <- SirajiBD/client catalogue category
- `g:item_group_id` / `g:item_group_title` <- multi-variant products
- `g:color`, `g:size`, `g:variant_option` <- actual variant options when present

Do not fabricate GTIN, MPN, brand, demographic, colour, size, certification, warranty or other product attributes merely to clear Merchant Center warnings.

## Feed format

RSS 2.0 XML with the Google namespace:

`xmlns:g="http://base.google.com/ns/1.0"`

The response is public, read-only, `nosniff`, and cacheable. Merchant Center may fetch it on its configured schedule.

## Preview gate

Before Production:

1. Preview deployment is Ready.
2. Open `/google-merchant-feed.xml` on Preview and confirm valid XML is returned.
3. Confirm only active products are present.
4. Pick at least one in-stock and one out-of-stock variant and compare price/availability against the product landing page.
5. Open a variant feed link and confirm the requested variant is selected.
6. Confirm image URLs are public HTTPS URLs.
7. Confirm no credentials, internal database values, archived products or unsupported invented identifiers are exposed.
8. GitHub CI must pass.

After Production approval, submit `https://<client-domain>/google-merchant-feed.xml` to Merchant Center as a scheduled file URL.
