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
| Contact-intent link clicked | `Contact` | Yes | Rate-limited action |
| Qualified lead form submitted | `Lead` | Yes | Rate-limited action |
| Payment becomes `paid` | `Purchase` | On paid order page | Paid-order outbox |
| Search results shown | `Search` | Yes | No |

An unpaid gateway order or unverified bank transfer is not a Purchase. `Purchase`
uses `purchase:<order UUID>` in Pixel and CAPI. Refreshes, webhook retries and cron
retries therefore converge on the same event.

### Deduplication

Every dual-sent event carries one `event_id` generated once and handed to both
paths. `Purchase` derives it deterministically from the order UUID
(`purchase:<uuid>`), so refreshes, webhook retries and cron retries cannot mint a
second one. `ViewContent`, `AddToCart`, `InitiateCheckout`, `Contact` and `Lead`
generate a per-interaction `<event>:<uuidv4>` in the browser and pass it to the
Server Action, which forwards the same value to CAPI. Meta collapses the pair.

### Contact

A single delegated click listener (`ContactLinkTracker`, mounted once in the shop
layout) recognises contact-intent links anywhere in the storefront by shape, not
by a hard-coded list: `mailto:`, `tel:`/`sms:`, `whatsapp:` / `wa.me` /
`api.whatsapp.com`, and `fb-messenger:` / `m.me` / `messenger.com`. Each channel
fires at most once per page load. `content_name` records the channel; no value or
currency is sent.

### Lead

`Lead` is implemented as reusable infrastructure — the browser `LeadTracker`
component, the `trackLead` Server Action (rate-limited, consent- and
config-gated), and a CAPI path that shares the deduplication `event_id`. No
surface in this storefront emits it. The intended trigger is the AgentSiraji.com
free Store-Audit lead form, which lives in a separate application; wiring that
form to `trackLead` is the next integration step. `value` is accepted only as a
bounded soft qualifier and travels solely when paired with an explicit ISO-4217
currency — a browser POST can never assert an authoritative sale.

## Ad attribution

`MetaAttributionCapture` (shop layout, consent-gated) records inbound ad context
as a first-party cookie, `commerce_meta_attribution`:

- `fbclid` from the landing URL, and a mirrored `_fbc` cookie in fbevents.js
  format (`fb.1.<ms>.<fbclid>`) when Meta's own script has not written one yet.
- `utm_source|medium|campaign|content|term` actually present on the URL.
- Generic `campaign_id|campaign_name|adset_id|adset_name|ad_id|ad_name|creative_id|creative_name|placement|site_source_name`
  when a URL carries them. The list is extendable without touching event code.

`fbclid` is last-touch; `utm`/`adParams` merge per key; the landing **path**
(never the query string) and first-touch timestamp are kept for reference.
Nothing is invented — absent parameters are simply absent.

At order creation `captureOrderAttribution` copies `fbp`, `fbc`, `fbclid`, `utm`
and `adParams` onto `meta_order_attributions` (server persistence, not
localStorage), so a late or retried `Purchase` still carries the click that
earned it. UTMs and ad identifiers are not Meta CAPI user/custom parameters; they
are retained as order metadata for the store's own reporting.

## Privacy and failure isolation

- Meta's script is not downloaded until the customer chooses **Allow analytics**.
- **Essential only** leaves cart, authentication, checkout and payments untouched.
- CAPI checks the same versioned consent cookie before top-funnel events.
- Order attribution is stored only after consent and is deleted on account deletion.
- Email, canonical Bangladesh phone, first/last name, city, region, postcode and
  country from the authoritative order are SHA-256 hashed before CAPI transmission.
  Nothing that the order does not contain is fabricated.
- Contact and Lead are consent-gated on both paths and rate-limited server-side.
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
7. Click the contact-page email link and confirm one `Contact` event with a
   `content_name` of `email`. In Test Events its Browser and Server rows should
   share an event id.
8. Land on any storefront URL with
   `?fbclid=TEST123&utm_source=preview&utm_medium=paid&ad_id=42`, allow analytics,
   then place a sandbox order. Confirm `commerce_meta_attribution` and `_fbc`
   cookies are set, and that the `meta_order_attributions` row for the order
   carries `fbclid`, `utm` and `ad_params`.
9. Remove the Test Events code before any Production release.

## Manual Meta-side verification (Events Manager)

Code and Preview checks do not prove Meta accepted the events. In
**Events Manager → Data sources → [your dataset] → Test events**, enter the
Preview Test Events code, open the Preview URL, and for each event confirm the
event appears, whether it is attributed to **Browser**, **Server** or both, and —
for dual-sent events — that the **"Processed" / "Deduplicated"** indicator shows
Meta matched the pair on `event_id`. Then in **Diagnostics** confirm no
"missing/invalid parameter" warnings for `currency`, `value` or the hashed
`user_data` fields.

Official references: [Conversions API parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/), [Meta Pixel standard events](https://www.facebook.com/business/help/402791146561655).
