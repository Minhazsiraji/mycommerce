# Fresh Clone Acceptance Test — Commerce V1

Use this checklist only on isolated client/test infrastructure. Never point a clone test at the SirajiBD production database.

## A. Infrastructure and boot

- [ ] Fresh database created.
- [ ] Unique Better Auth secret configured.
- [ ] Clone-specific app/auth URLs configured.
- [ ] Store identity/canonical/country/currency configured.
- [ ] Cloudinary/media credentials are clone-owned.
- [ ] Email credentials/sender are clone-owned.
- [ ] Payment credentials are clone-owned; SSLCommerz is sandbox.
- [ ] Meta/Google are disabled unless clone-owned test configuration is intentionally being verified.
- [ ] `pnpm db:migrate` completes from an empty database.
- [ ] Application deploy/build completes.

## B. Admin and catalogue

- [ ] First intended owner/admin can sign in.
- [ ] Admin pages are protected from signed-out users.
- [ ] Create a test category.
- [ ] Upload a category image if required.
- [ ] Create a product with truthful title/description.
- [ ] Add at least one active variant/SKU with price and stock.
- [ ] Upload product image.
- [ ] Activate/include product for storefront/discovery as applicable.

## C. Storefront and cart

- [ ] New product appears on the expected storefront/category page.
- [ ] Product page shows correct title, price, stock and image.
- [ ] Add-to-cart works.
- [ ] Requested quantity cannot exceed stock.
- [ ] Cart totals are correct.

## D. Checkout and order

Test at least one enabled payment path. SSLCommerz remains sandbox for this acceptance test.

- [ ] Checkout address validation works.
- [ ] Shipping/delivery rate is correct.
- [ ] Order can be placed.
- [ ] Unpaid/failed payment does not become paid.
- [ ] Failed SSLCommerz payment can be retried when SSLCommerz is enabled.
- [ ] Bank-transfer fallback works when enabled.
- [ ] COD works when enabled and is not counted as paid before collection.
- [ ] Successful sandbox payment produces a confirmed paid order.
- [ ] Stock changes correctly and does not oversell.

## E. Fulfilment and customer tracking

- [ ] Order appears in Admin.
- [ ] Admin can process fulfilment according to the configured workflow.
- [ ] Shipment/courier/tracking details can be recorded when applicable.
- [ ] Customer order page displays the correct fulfilment status.
- [ ] Customer sees courier/tracking data when recorded.
- [ ] Delivered state works correctly.

## F. Analytics and consent

- [ ] Analytics scripts do not load before required consent.
- [ ] Meta remains off when disabled/unconfigured.
- [ ] Google remains off when disabled/unconfigured.
- [ ] When Meta is enabled, only a paid order emits Purchase and Pixel/CAPI use the same event ID.
- [ ] Meta Purchase currency/value/items match the real order.
- [ ] Reload dedup prevents duplicate Meta browser Purchase.
- [ ] When Google is enabled, paid Purchase uses the real transaction/value/currency.
- [ ] Reload dedup prevents duplicate Google Purchase.
- [ ] COD/unpaid orders do not emit paid Purchase events.

## G. SEO, feed and identity

- [ ] Preview `/robots.txt` blocks indexing.
- [ ] Production `/robots.txt` allows indexing only after go-live.
- [ ] Canonicals use the clone production domain.
- [ ] `/sitemap.xml` uses the clone production domain.
- [ ] `/google-merchant-feed.xml` uses clone name/domain/currency and real products.
- [ ] No SirajiBD contact, customer, order, analytics or payment credentials/data appear in the clone.

## H. Policies and communications

- [ ] Returns policy is true for the client.
- [ ] Shipping policy matches actual delivery configuration.
- [ ] Privacy/Terms/Contact/About content is client-specific and truthful.
- [ ] Transactional email sends from the client identity/domain.

## Sign-off

Record the tested release commit, Preview/deployment URL, database/project identifier (never credentials), tester, date, and any deviations. All critical items must pass before the clone is promoted to live credentials or used as the source for the `commerce-v1.0-clone-ready` release tag.
