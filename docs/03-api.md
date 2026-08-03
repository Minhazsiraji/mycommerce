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

## Payment provider interface

The abstraction that keeps the gateway swappable. Stripe is the reference
implementation; SSLCommerz, bKash, or Razorpay implement the same interface without
touching checkout.

```ts
export interface PaymentProvider {
  readonly id: string

  createIntent(input: {
    orderId: string
    amount: number          // minor units, server-computed
    currency: string
    customerEmail: string
    metadata: Record<string, string>
  }): Promise<{ clientSecret: string; providerRef: string }>

  verifyWebhook(req: Request): Promise<PaymentEvent>   // throws on bad signature

  refund(input: {
    providerRef: string
    amount: number
    reason?: string
  }): Promise<{ refundRef: string; status: RefundStatus }>
}

export type PaymentEvent =
  | { type: 'payment.succeeded'; eventId: string; providerRef: string; orderId: string; amount: number }
  | { type: 'payment.failed';    eventId: string; providerRef: string; orderId: string; reason: string }
  | { type: 'refund.succeeded';  eventId: string; providerRef: string; orderId: string; amount: number }
```

Redirect-based gateways (common outside Stripe) return a hosted checkout URL in place
of a `clientSecret`; the field is named generically for that reason. Order state
transitions happen **only** in the webhook handler — never on the browser redirect back
to the site, which is trivially forged and unreliable on flaky mobile connections.

## Caching and revalidation

Read paths are cached by tag; writes invalidate them.

| Tag | Invalidated by |
|---|---|
| `product:<id>` | product, variant, image, or review-approval writes |
| `category:<id>` | category writes, product category changes |
| `products:list` | any product create/archive |
| `sitemap` | any slug change |

Cart, checkout, account, and admin routes are never cached.
