# 3. API surface

There is no public REST API. The client is the Next.js app itself, so mutations are
**Server Actions** and reads happen in **Server Components** directly against the
repository layer. This removes an entire tier of serialisation, hand-written fetch
code, and endpoint auth checks.

Route Handlers exist for exactly three things: **webhooks**, **cron**, and **file
uploads**. Anything else being a Route Handler is a design smell.

## Contract rules

Every Server Action follows the same shape:

```ts
'use server'

export async function addToCart(input: unknown): Promise<ActionResult<CartSummary>> {
  const data = addToCartSchema.parse(input)        // 1. validate first, always
  const session = await requireSession()            // 2. authenticate
  // 3. authorize — scope by session.user.id, never by an id from input
  // 4. delegate to the service layer; no business logic in this file
  // 5. revalidate affected cache tags
}
```

Return type is uniform so the client never has to guess:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; fields?: Record<string, string> } }
```

Actions **return** errors, they don't throw them. Thrown errors are reserved for
genuine faults, which become a 500 and a logged incident. A user typing an invalid
coupon code is not a fault.

`message` is safe to display. Internal detail — SQL, stack traces, provider payloads —
goes to the logger, never into the response.

## Server Actions by module

### `catalog`
| Action | Auth | Notes |
|---|---|---|
| `searchProducts` | public | Postgres full-text; paginated, max 60 per page |
| `createProduct` / `updateProduct` / `archiveProduct` | admin | Revalidates `product:<id>`, `category:<id>`, `sitemap` |
| `upsertVariant` / `reorderVariants` | admin | |
| `attachImage` / `reorderImages` / `deleteImage` | admin | R2 key handling |
| `upsertCategory` / `deleteCategory` | admin | Rejects delete when products still reference it |

### `cart`
| Action | Auth | Notes |
|---|---|---|
| `getCart` | public | Resolves by session user or guest cookie |
| `addToCart` | public | Validates variant is active and in stock |
| `updateCartItemQuantity` | public | Quantity `0` removes the line |
| `removeCartItem` | public | |
| `mergeGuestCart` | session | Called once on login |

### `checkout`
| Action | Auth | Notes |
|---|---|---|
| `getShippingQuotes` | public | Weight- and destination-based |
| `applyCoupon` | public | Validates window, limits, minimum subtotal |
| `placeOrder` | public | The transaction in [architecture](01-architecture.md#checkout). Returns `clientSecret` |

`placeOrder` accepts **`{ cartId, addressId | addressInput, shippingMethodId, couponCode?, email }`** — no amounts. Every figure is recomputed server-side. This is invariant 2 in `CLAUDE.md` and it is the most security-relevant line in the codebase.

### `orders`
| Action | Auth | Notes |
|---|---|---|
| `getMyOrders` / `getMyOrder` | session | Always filtered by `session.user.id` |
| `lookupGuestOrder` | public | Requires order number **and** matching email; rate limited |
| `cancelOrder` | session | Only while `pending` or `paid` and unfulfilled; restocks |
| `listOrders` / `updateOrderStatus` / `refundOrder` | admin | Audit logged |

### `inventory`, `promotions`, `reviews`, `accounts`
| Action | Auth | Notes |
|---|---|---|
| `adjustStock` | admin | Writes a movement with reason; never sets `stock` directly |
| `getStockLedger` | admin | |
| `createCoupon` / `updateCoupon` / `deactivateCoupon` | admin | |
| `submitReview` | session | One per user per product; `pending` until moderated |
| `moderateReview` | admin | |
| `addAddress` / `updateAddress` / `deleteAddress` / `setDefaultAddress` | session | Scoped by user |

## Route Handlers

| Route | Method | Purpose |
|---|---|---|
| `/api/webhooks/payments/[provider]` | POST | Signature verified, deduped via `webhook_events`. Returns 200 on duplicates. |
| `/api/webhooks/shipping/[carrier]` | POST | Tracking updates |
| `/api/cron/release-pending-orders` | POST | Restocks orders `pending` > 30 min |
| `/api/cron/drain-outbox` | POST | Sends queued side effects |
| `/api/cron/sync-tracking` | POST | Polls carriers lacking webhooks |
| `/api/uploads/sign` | POST | Admin only; returns a presigned R2 URL |

Cron routes are protected by a bearer secret in the `Authorization` header and are
idempotent — a double invocation must be harmless.

Webhook handlers **acknowledge fast**: verify, dedupe, persist, return 200. Slow work
goes to the outbox. A provider that times out will retry, and retries amplify whatever
is already slow.

## Payment providers

Two structurally different mechanisms, so `PaymentProvider` is a **union**, not one
interface. Forcing a manual bank transfer into a gateway-shaped API produces a fake
webhook and a fake payment reference; keeping them separate keeps both honest.

### What the store accepts

| Customer-facing method | Handled by | Integrations |
|---|---|---|
| Cards — Visa, Mastercard, Amex | SSLCommerz | 1 |
| bKash, Nagad, Rocket, Upay | SSLCommerz | (same one) |
| Internet banking | SSLCommerz | (same one) |
| Bank wire / direct deposit | Manual, admin-verified | 1 |

**SSLCommerz is an aggregator.** A single integration renders bKash, Nagad, Rocket,
cards, and bank channels on its hosted checkout page. Integrating those wallets
individually means separate merchant onboarding, credentials, webhook handlers, and
reconciliation for each — in exchange for the same customer-visible options.

Direct bKash (PGW) is worth adding **only on evidence**: its per-transaction fee is
lower than the aggregator's, so once bKash volume makes the fee delta exceed the
maintenance cost, add it as a second `HostedProvider`. Phase 4+ optimisation, not a
launch requirement.

> Confirm current MFS coverage and per-channel rates against your own SSLCommerz
> merchant agreement before launch. Rosters and pricing change; this document is not
> the authority on them.

### Hosted providers

```ts
export interface HostedProvider {
  readonly kind: 'hosted'
  readonly id: string                       // 'sslcommerz'

  createSession(input: {
    orderId: string
    orderNumber: string
    amount: number                          // minor units, server-computed
    currency: string
    customer: { name: string; email: string; phone: string }
    shippingAddress: AddressSnapshot        // SSLCommerz requires this
  }): Promise<{ redirectUrl: string; providerRef: string }>

  verifyCallback(req: Request): Promise<PaymentEvent>   // throws if unverifiable

  refund(input: {
    providerRef: string
    amount: number
    reason?: string
  }): Promise<{ refundRef: string; status: RefundStatus }>
}
```

SSLCommerz is **redirect-based**: post the session, receive a gateway page URL, send
the customer there. There is no client secret and no embedded card form — which is
exactly what keeps the store in PCI SAQ A.

**The critical detail:** SSLCommerz's IPN payload is not self-authenticating the way a
signed Stripe webhook is. `verifyCallback` must take the `val_id` from the notification
and call the provider's **server-side validation API** to obtain the authoritative
result, then confirm the returned amount and currency match the order. Trusting the
posted body is the single most likely way to ship a forged-payment vulnerability here.

Order state changes happen **only** in `verifyCallback`. Never on the browser redirect
back to the site — that return trip is forgeable and routinely lost on mobile networks.

### Manual providers

```ts
export interface ManualProvider {
  readonly kind: 'manual'
  readonly id: string                       // 'bank_transfer'

  getInstructions(order: Order): PaymentInstructions   // account details + reference
  readonly holdWindowHours: number                     // 72 for bank transfer
}

export type PaymentEvent =
  | { type: 'payment.succeeded'; eventId: string; providerRef: string; orderId: string; amount: number }
  | { type: 'payment.failed';    eventId: string; providerRef: string; orderId: string; reason: string }
  | { type: 'refund.succeeded';  eventId: string; providerRef: string; orderId: string; amount: number }
```

No `createSession`, no `verifyCallback`, no programmatic `refund` — a bank wire refund
is an outbound transfer the owner makes, recorded afterwards.

**Flow:**

1. `placeOrder` reserves stock and creates the order as `awaiting_transfer`.
2. Customer sees bank details plus their order number as the transfer reference.
3. Customer submits the transaction reference and optionally uploads a receipt.
4. Admin checks the **bank statement** and confirms.
5. Order moves to `paid`; inventory movement and confirmation email follow.
6. Unconfirmed after 72 hours → cron releases stock and cancels.

The uploaded receipt is **evidence for the admin, never proof of payment**. A screenshot
is trivially forged; confirmation is authorised against the bank statement alone. See
[security](04-security.md#threat-model).

Note the two different hold windows: 30 minutes for an abandoned gateway checkout, 72
hours for a bank transfer. A single expiry constant would either cancel legitimate
transfers or hold stock hostage for days after a dropped card payment.

### Related Server Actions

| Action | Auth | Notes |
|---|---|---|
| `getPaymentMethods` | public | Available methods with fees and expected timing |
| `submitTransferProof` | public | Reference + optional receipt; rate limited, order-scoped |
| `listPendingTransfers` | admin | Verification queue |
| `confirmTransfer` | admin | Amount must match order total; audit logged |
| `rejectTransfer` | admin | Reason required; notifies customer |

## Caching and revalidation

Read paths are cached by tag; writes invalidate them.

| Tag | Invalidated by |
|---|---|
| `product:<id>` | product, variant, image, or review-approval writes |
| `category:<id>` | category writes, product category changes |
| `products:list` | any product create/archive |
| `sitemap` | any slug change |

Cart, checkout, account, and admin routes are never cached.
