# Meta Pixel and Conversions API

The store has one reusable Meta integration. It follows the real catalog, cart,
checkout and payment records; there is no hard-coded product landing page and no
client-supplied price reaches CAPI.

## Event ownership

| Store fact | Meta event | Browser | Server |
|---|---|---:|---:|
| Public storefront route viewed | `PageView` | Yes | No |
| Active product variant viewed | `ViewContent` | Yes | Re-reads variant |
| Cart mutation succeeds | `AddToCart` | Yes | Uses mutation result |
| Valid non-empty cart opens checkout | `InitiateCheckout` | Yes | Re-reads cart |
| Payment becomes `paid` | `Purchase` | On paid order page | Paid-order outbox |
| Search results shown | `Search` | Yes | No |

An unpaid gateway order or unverified bank transfer is not a Purchase. `Purchase`
uses `purchase:<order UUID>` in Pixel and CAPI. Refreshes, webhook retries and cron
retries therefore converge on the same event.

## Privacy and failure isolation

- Meta's script is not downloaded until the customer chooses **Allow analytics**.
- **Essential only** leaves cart, authentication, checkout and payments untouched.
- CAPI checks the same versioned consent cookie before top-funnel events.
- Order attribution is stored only after consent and is deleted on account deletion.
- Email and canonical Bangladesh phone are SHA-256 hashed before CAPI transmission.
- The access token stays in a server-only environment variable.
- Meta timeouts/errors never fail a cart action, order, webhook or payment.
- Failed paid-order events remain in `meta_event_deliveries`; the existing nightly cron
  retries them, capped at ten attempts.

## Environment setup

Set these in Vercel. Preview and Production must use different datasets and tokens.

```text
NEXT_PUBLIC_META_PIXEL_ID=<public pixel id>
META_CAPI_DATASET_ID=<server dataset id>
META_CAPI_ACCESS_TOKEN=<server-only token>
META_GRAPH_API_VERSION=v25.0
```

In Preview only, add `META_CAPI_TEST_EVENT_CODE` from Events Manager → Test Events.
Leave it unset in Production. The CAPI dataset id and token must either both be set or
both be absent; environment validation rejects a half-configured server integration.

## Preview validation

1. Deploy the Preview with Preview-only Meta credentials and Test Events code.
2. Choose **Essential only** and confirm no Meta request occurs.
3. Reopen **Privacy choices**, allow analytics, and view a product.
4. Add it to cart, open checkout, and verify event names, variant ids, quantities,
   BDT currency and server-calculated values.
5. Complete a sandbox payment. `Purchase` must appear only after the order is `paid`.
6. Refresh the paid order page and replay the gateway notification. Meta should retain
   one Purchase because the event id is unchanged.
7. Remove the Test Events code before any Production release.

Official references: [Conversions API parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/), [Meta Pixel standard events](https://www.facebook.com/business/help/402791146561655).
