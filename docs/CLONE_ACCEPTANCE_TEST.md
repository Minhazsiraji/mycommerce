# Fresh-clone acceptance test

Run this in a browser against the isolated Preview, in order, once. It is the
only evidence that matters for the release decision — the unit suite proves the
pieces, this proves the store.

**Do not start until the Preview is pointed at an isolated database.** Every
step below writes data. Against the shared `DATABASE_URL` they would write it
into SirajiBD's live store.

## Prerequisites — owner configuration

Scoped to Preview branch `agent/clone-ready-v1-finalization`:

| Variable | Value |
|---|---|
| `DATABASE_URL` | isolated Neon clone database |
| `DATABASE_URL_UNPOOLED` | same project, unpooled |
| `BETTER_AUTH_SECRET` | **new** random secret — never Production's |
| `BETTER_AUTH_URL` | the PR #27 Preview origin |
| `NEXT_PUBLIC_APP_URL` | the PR #27 Preview origin |
| `STORE_NAME` | `Commerce Clone Test` |
| `STORE_BRAND_TEXT` | `Commerce Clone Test` |
| `STORE_CANONICAL_URL` | the PR #27 Preview origin |
| `NEXT_PUBLIC_STORE_COUNTRY_CODE` | a non-BD country, e.g. `US` |
| `NEXT_PUBLIC_STORE_CURRENCY` | a non-BDT currency, e.g. `USD` |
| `SSLCOMMERZ_SANDBOX` | `true` |

Leave Meta and Google unset so analytics stays off. Then run migrations against
the isolated database, and `pnpm preflight` with that environment — it should
PASS before anyone opens a browser.

> `SSLCOMMERZ_SANDBOX` is currently a single value shared by Preview and
> Production. Until it is split, setting it per-branch is what keeps a Preview
> from taking real money. Preflight fails the build if it is `false` outside
> production.

## A. Isolation

- [ ] An existing SirajiBD admin email cannot sign in
- [ ] No SirajiBD products appear
- [ ] No SirajiBD orders or customers appear
- [ ] `/google-merchant-feed.xml` contains no SirajiBD identity and no `sirajibd.com`
- [ ] Page metadata and canonical use the Preview origin

## B. Fresh admin

- [ ] Register a brand-new user
- [ ] That user cannot reach `/admin`
- [ ] `pnpm admin:promote <email>` against the isolated database
- [ ] Sign out, sign in, verify the second factor enrols
- [ ] `/admin` now opens
- [ ] A second, unpromoted user still cannot reach `/admin`

## C. Catalogue

- [ ] Create a category
- [ ] Create a product with one variant/SKU
- [ ] Set stock to 2
- [ ] Upload an image
- [ ] Publish

## D. Storefront and cart

- [ ] Category and product are visible
- [ ] Price renders in the configured currency **with the right symbol** — the
      client bundle and the server must agree; a taka sign here means the
      `NEXT_PUBLIC_` currency did not reach the browser
- [ ] Add to cart
- [ ] Quantity cannot exceed 2

## E. International checkout

- [ ] The address form shows city / region / postal code — **not** district and
      thana
- [ ] An E.164 phone number is accepted; a `+880`-only number is not required
- [ ] A delivery option appears **without entering a region** (nationwide rate)
- [ ] The tax line matches the configured mode: absent for `none`, shown and
      added for `exclusive`, shown and *not* added for `inclusive`
- [ ] Subtotal − discount + delivery + tax equals the displayed total

## F. Payment and order

- [ ] Only the configured methods are offered — no SSLCommerz option unless
      sandbox credentials are set
- [ ] Place the order
- [ ] Order total, currency, tax and shipping match what checkout displayed
- [ ] Stock decrements from 2 to 1
- [ ] No live gateway transaction occurred

## G. Fulfilment

- [ ] The order appears in Admin
- [ ] Mark fulfilled, add tracking
- [ ] The customer order page reflects the status and tracking
- [ ] The confirmation email shows the same totals and currency

## H. Analytics

- [ ] No Meta script loads, no PageView, no Purchase
- [ ] No Google tag loads, no PageView, no Purchase
- [ ] Nothing reached SirajiBD's Meta dataset or Google property

## I. SEO, feed and domain

- [ ] `/robots.txt` disallows crawling on Preview
- [ ] `/sitemap.xml` contains only clone URLs
- [ ] Canonical, OpenGraph, Twitter and JSON-LD use clone identity and currency
- [ ] `/google-merchant-feed.xml` lists only the clone product, in the clone
      currency, under the clone identity

## Result

Every box ticked is the condition for **READY FOR PRODUCTION MERGE APPROVAL**.
Anything unticked is a blocker, not a note.
