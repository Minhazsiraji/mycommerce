# 4. Security

Handling other people's money and addresses. The threats below are ordinary and
well-understood — the risk is skipping one, not encountering something exotic.

## Authentication

**Better Auth**, self-hosted, sessions in Postgres.

- Session cookies: `httpOnly`, `Secure`, `SameSite=Lax`, 30-day rolling expiry.
- Passwords: Argon2id. Minimum 10 characters, checked against a breached-password list.
- Email verification required before an order can be placed on an account.
- Password reset tokens: single-use, 30-minute expiry, invalidate all sessions on use.
- OAuth (Google) supported; email collision links to the existing account only after
  the provider asserts a verified email.
- Rate limits: 5 login attempts per 15 min per IP+email, then exponential backoff.

Sessions are **server-side records**, not self-contained JWTs. Revocation has to be
immediate — a stolen stateless token that stays valid until expiry is not acceptable
when the account can place orders.

## Authorization

Two roles: `customer`, `admin`.

Every admin action begins with one shared guard:

```ts
const session = await requireRole('admin')
```

One function, used everywhere, so there is a single place to audit and a single place
to change. Scattered inline role checks are how a route eventually ships without one.

**Ownership is enforced in the query, not after it:**

```ts
// correct — the filter is part of the lookup
db.query.orders.findFirst({
  where: and(eq(orders.id, orderId), eq(orders.userId, session.user.id))
})

// wrong — IDOR; the row is already loaded when the check runs
const order = await getOrder(orderId)
if (order.userId !== session.user.id) throw new Error('nope')
```

Admin routes are additionally gated in `middleware.ts` so an unauthenticated request
never reaches the handler.

## Threat model

Commerce-specific risks, each with the control that addresses it.

| # | Threat | Control |
|---|---|---|
| 1 | **Price tampering** — client submits its own total | Client sends only variant IDs and quantities. Every amount recomputed server-side from the DB in the same request that creates the payment intent. |
| 2 | **Inventory oversell** — concurrent buyers of the last unit | Conditional decrement `WHERE stock >= n` inside the order transaction; check affected row count. |
| 3 | **Coupon abuse** — one code redeemed past its limit | Atomic `usage_count` increment inside the same transaction; `coupon_redemptions` enforces per-user limits. |
| 4 | **Payment notification forgery** | SSLCommerz IPN is **not** self-authenticating. Take `val_id` from the notification, call the provider's server-side validation API, and confirm the returned amount, currency, and order reference match our record. Never trust the posted body. Signature-based providers verify the signature on the raw body before parsing. |
| 5 | **Notification replay** | Unique index on `(provider, event_id)`. The insert is the dedupe. |
| 6 | **IDOR on orders/addresses** | Ownership in the `WHERE` clause, always. |
| 7 | **Guest order enumeration** | Lookup requires order number **and** matching email; rate limited; order numbers are not sequentially guessable. |
| 8 | **Fake reviews** | Login required, one per user per product, `pending` until moderated, verified-purchase flag from `order_id`. |
| 9 | **Card testing** — bots probing stolen cards via checkout | Cloudflare bot protection, per-IP checkout rate limit, provider-side velocity rules. |
| 10 | **Stored XSS via product/review content** | React escapes by default; no `dangerouslySetInnerHTML` on user or admin input. Rich text sanitised server-side with an allowlist. |
| 11 | **Malicious file upload** | Presigned R2 uploads, extension + MIME + magic-byte check, 5 MB cap, served from a separate origin with `Content-Disposition: attachment`. Two surfaces with different limits: admin product images, and **customer transfer receipts** — the latter is unauthenticated-adjacent, so it is order-scoped, rate limited to 3 per order, and images only. |
| 12 | **Privilege escalation** | `role` is never accepted from a request body. Changing it is a separate, audited admin action. |
| 13 | **Secret leakage** | No secrets in the repo. Server-only env validated at boot by Zod; anything client-visible must be `NEXT_PUBLIC_` and is reviewed. |
| 14 | **Dependency compromise** | Lockfile committed, Dependabot on, `pnpm audit` in CI, builds fail on high severity. |
| 15 | **Forged transfer receipt** — customer uploads a fake screenshot to claim payment | The upload is **evidence for a human, never proof**. Confirmation is authorised against the bank statement alone. `confirmTransfer` requires the admin to enter the observed amount, and rejects a mismatch with the order total. |
| 16 | **Wrong or malicious transfer confirmation** | `confirmTransfer` is admin-only, audit logged with actor and amount, and irreversible only forward — a mistaken confirmation is corrected by a refund record, never by editing the payment row. |
| 17 | **Stock hostage via unpaid orders** | Bank transfers reserve stock for 72 hours, gateway checkouts for 30 minutes; a cron releases both. Without separate windows, either legitimate transfers get cancelled or a bot can freeze inventory by starting checkouts. |

SQL injection is covered by Drizzle's parameterisation — the only way to reintroduce it
is `sql.raw()` with interpolated input, which is banned. CSRF is covered by Server
Actions' built-in origin checks plus `SameSite=Lax`.

## Headers

Set in `next.config.ts`, verified in an e2e test so a regression fails CI:

```
Content-Security-Policy: default-src 'self'; img-src 'self' https://<r2-domain> data:;
  script-src 'self' 'nonce-<generated>'; style-src 'self' 'unsafe-inline';
  frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Payment provider iframes require their domains in `frame-src` and `script-src` — add
them explicitly rather than loosening the policy.

## Rate limits

Enforced at Cloudflare and again in the application, keyed by IP and, where available,
user ID.

| Endpoint | Limit |
|---|---|
| Login / register | 5 per 15 min |
| Password reset request | 3 per hour |
| Guest order lookup | 10 per hour |
| `placeOrder` | 10 per hour |
| Review submission | 5 per day |
| Search | 60 per minute |

## PCI scope

Card data never touches the server. The provider's hosted fields or hosted checkout
collect it directly, and only a provider reference is stored. This keeps the store in
**SAQ A** — the lightest compliance tier — and it is the single reason not to build a
custom card form, no matter how much nicer it would look.

## Data protection

- TLS everywhere; HSTS preloaded.
- Encryption at rest via Neon and R2 defaults.
- PII is limited to name, email, phone, and address. No date of birth, no government
  ID, no card data.
- Account deletion anonymises `orders` (retained for tax and accounting) and hard-
  deletes addresses, cart, reviews, and sessions.
- Backups: Neon PITR, 7-day window minimum. **Restore is tested quarterly** — an
  untested backup is a belief, not a backup.

## Audit logging

Every admin mutation writes actor, action, entity type and ID, JSONB diff, IP, and
timestamp. Append-only; no update or delete path exists in the application. Retained
one year.

## Pre-launch checklist

- [ ] All env vars validated at boot; no secret in git history
- [ ] Payment webhook signature verification tested with a forged payload
- [ ] Oversell test: concurrent checkout of the last unit
- [ ] Price tampering test: modified amount in the request is rejected
- [ ] IDOR test: order and address access across two accounts
- [ ] Rate limits verified live
- [ ] Security headers verified in e2e
- [ ] Admin routes unreachable while unauthenticated
- [ ] Backup restore rehearsed end to end
- [ ] Dependency audit clean
- [ ] Sentry capturing server errors without leaking PII
