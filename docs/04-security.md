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
| 24 | **Stolen admin password** | Admin access requires TOTP, enforced in `requireRole` because Better Auth has no notion of "mandatory for this role". A password alone reaches nothing. |
| 25 | **Long-lived session on a shared device** | Sessions last 30 days, so every device is listed at `/account/security` and can be revoked individually or all at once. Password re-auth is required before an export or a deletion, because the cookie proves the browser was once trusted, not that the person is. |
| 26 | **Deletion used to erase evidence** | Account deletion anonymises orders rather than removing them: totals, dates and line items survive for the accounts, identity does not. A customer cannot make a disputed order disappear. |
| 13 | **Secret leakage** | No secrets in the repo. Server-only env validated at boot by Zod; anything client-visible must be `NEXT_PUBLIC_` and is reviewed. |
| 14 | **Dependency compromise** | Lockfile committed, Dependabot on, `pnpm audit` in CI, builds fail on high severity. |
| 15 | **Forged transfer receipt** — customer uploads a fake screenshot to claim payment | The upload is **evidence for a human, never proof**. Confirmation is authorised against the bank statement alone. `confirmTransfer` requires the admin to enter the observed amount, and rejects a mismatch with the order total. |
| 16 | **Wrong or malicious transfer confirmation** | `confirmTransfer` is admin-only, audit logged with actor and amount, and irreversible only forward — a mistaken confirmation is corrected by a refund record, never by editing the payment row. |
| 17 | **Stock hostage via unpaid orders** | Bank transfers reserve stock for 72 hours, gateway checkouts for 30 minutes; a cron releases both. Without separate windows, either legitimate transfers get cancelled or a bot can freeze inventory by starting checkouts. **The hold windows alone are not the control** — they bound how long one order squats, not how many an attacker opens. `placeOrder` is rate limited to 10/hour per IP; without that, a loop empties the catalogue for free. |
| 18 | **HTML injection into transactional email** | The email templates are hand-built strings, so React's escaping does not apply. Every interpolated value goes through `lib/escape-html.ts`. The live case is the shipping recipient: it is typed by the customer and rendered into the confirmation. |
| 19 | **Payment history tampering by overreach** | Updates to `payments` are scoped to a single row by id, never `WHERE order_id = ...`. An order that failed by card and switched to transfer has two rows, and the earlier code stamped "verified by an admin" onto the card attempt as well — destroying the record `switchToBankTransfer` deliberately keeps for disputes. |
| 20 | **Confirming a transfer against returned stock** | `confirmTransfer` guards on status, payment status and method. The dangerous path is a late transfer on an order whose hold expired: cron cancelled it and returned the stock, which was then sold to someone else. Taking that money is an oversell; the admin is told to refund and have the customer reorder. `rejectTransfer` has the same guards, or a rejection would set a cancelled order back to `awaiting_transfer` and quietly revive it. |
| 21 | **Attacker-controlled input in a redirect** | The SSLCommerz return handler builds a URL from `tran_id`. The order number is matched against `^[A-Z0-9-]{4,32}$` and encoded, and the status is narrowed to a known set — a fixed origin prefix stops an off-site redirect, but not path traversal or a CRLF payload in a `Location` header. |
| 22 | **Attaching an arbitrary Cloudinary asset** | The browser uploads directly and reports back the key it got. The signature restricts where an upload *lands*; `attachImageSchema` restricts what we accept as having landed there, via a `mycommerce/<folder>/…` pattern. |
| 23 | **Cron endpoint secret recovery** | `CRON_SECRET` compared with `timingSafeEqual`, length-checked first so the throw is not itself a signal. No secret configured means no caller can authenticate — closed, not open. |

SQL injection is covered by Drizzle's parameterisation — the only way to reintroduce it
is `sql.raw()` with interpolated input, which is banned. CSRF is covered by Server
Actions' built-in origin checks plus `SameSite=Lax`.

## Headers

The CSP is per-request in `src/proxy.ts`; the rest are static in `next.config.ts`.
A P5 e2e test asserts them so a regression fails CI.

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://res.cloudinary.com;
  font-src 'self'; connect-src 'self' https://api.cloudinary.com;
  form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none';
  upgrade-insecure-requests
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin
X-DNS-Prefetch-Control: off
```

**There is no nonce, and that is not an oversight.** `'strict-dynamic'` with a
per-request nonce is the stronger policy and it broke the entire site — Next cannot
stamp a nonce onto a statically prerendered page, so every chunk was blocked while the
pages still returned 200 with correct markup. The full account is in the header
comment of `src/proxy.ts`; read it before trying again. What survives is
`script-src 'self'`, which still blocks loading code from another origin — the actual
exfiltration route. What is given up is protection against injected *inline* script,
which first requires an XSS hole (threats 10 and 18).

`Referrer-Policy` is load-bearing for privacy here, not boilerplate: order numbers
appear in URL paths, and the default would send them to any third-party origin a page
links out to.

Payment provider iframes would require their domains in `frame-src` and `script-src` —
add them explicitly rather than loosening the policy. SSLCommerz is a full redirect
today, so none are needed.

## Rate limits

Two independent layers. Better Auth's own limiter covers `/api/auth/*`; everything
else is `lib/rate-limit.ts`, a fixed-window counter **in Postgres**.

It has to be Postgres. On Vercel each invocation may be a cold instance, so an
in-process `Map` counts to one and resets — a control that reads like a control and
stops nothing. The same reasoning as the queue rule in CLAUDE.md: if we think we need
Redis, we need a Postgres table and a cron route.

| Endpoint | Limit | Enforced by |
|---|---|---|
| Login / register | 5 per 15 min | Better Auth |
| Password reset request | 3 per hour | Better Auth |
| `/two-factor/*` | 3 per 10 sec, then lockout at 5 failures | two-factor plugin |
| Password re-auth (export, delete) | 5 per 15 min **per user** | `reauth` bucket |
| Guest order lookup | 10 per hour | `order-lookup` bucket |
| `placeOrder` | 10 per hour | `place-order` bucket |
| Gateway session | 15 per hour | `gateway-session` bucket |
| Transfer reference | 20 per hour | `transfer-reference` bucket |
| Review submission | 5 per day | not built (P4) |
| Search | 60 per minute | Cloudflare |

`placeOrder` is the one that matters most, and it is not about spam. Placing an order
decrements real stock and holds it for up to 72 hours with nothing paid, so an
unthrottled loop takes the whole catalogue to zero for free — a competitor could make
the store show "out of stock" on everything for three days. Ten an hour is far above
a real customer and far below what that attack needs.

Design notes worth keeping:

- The count is one atomic upsert. Read-then-write would let two concurrent requests
  both see `hits = limit - 1` and both proceed, which is the exact case a limiter
  exists to stop. A test asserts twenty concurrent calls produce twenty distinct
  counts.
- It **fails open**. If the database is unreachable the limiter cannot answer — but
  neither can checkout, so refusing here protects nothing and turns a database blip
  into a self-inflicted outage.
- A fixed window admits up to 2x the limit across a boundary. Accepted: this is a
  "stop a script" control, not a billing meter.
- Identity is the leftmost `x-forwarded-for` entry. Vercel overwrites that header at
  the edge, so it is trustworthy **there and only there** — re-check this assumption
  before running behind any other proxy. A missing header falls back to one shared
  bucket, not to unlimited.
- Windows older than 24 hours are pruned by the nightly cron.

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

Every admin mutation writes actor ID, actor email, action, entity type and ID, a JSONB
detail object, and a timestamp to `audit_logs`. Append-only; no update or delete path
exists in the application. Retained one year. Readable at `/admin/activity`.

Two implementation notes that matter:

- `auditedAdmin()` performs the role check **and** the log write in one call, so an
  action that forgets to audit is also an action that forgot to check the role — a
  much louder bug. Where the entity ID only exists after the mutation (creating a
  product), `recordAudit(session, …)` is used after the fact instead.
- The write is best-effort and swallows its own errors. Losing a log line is bad;
  failing a refund because the log insert timed out is worse.

Actor email is stored alongside the FK because the FK is `ON DELETE SET NULL` —
deleting a user must not erase what they did.

Retention is enforced by `pruneAuditLogs()` on the nightly cron, not by intention. The
log holds order notes and customer-facing detail, so keeping it forever is not more
secure — it is more liability. Data you no longer need is data that can only ever leak.

Not covered: reads. Viewing a customer's address writes nothing. With one operator
that is the right trade; revisit if the store ever has staff accounts.

## Two-factor authentication

TOTP, via Better Auth's plugin. **Optional for customers, mandatory for admin.**

The mandatory half is ours, not the plugin's — Better Auth can verify a code but has no
concept of "required for this role", so `requireRole('admin')` checks
`user.twoFactorEnabled` and redirects to `/account/security` when it is false. Without
that check the plugin is a setting nobody turns on, which is the usual fate of optional
2FA. An admin who has not enrolled is redirected rather than refused; refusing would
lock the store's owner out of their own store.

Decisions worth keeping:

- `skipVerificationOnEnable: false`. Enrolment only completes once the user has proved
  their authenticator produces a working code. Enabling on trust is how people lock
  themselves out with a mis-scanned QR.
- Ten single-use backup codes, shown once. They are the recovery path, and there is no
  second admin to perform a reset. They can be replaced from `/account/security` behind
  a password — needed for the two situations that end the same way, codes never written
  down and codes used up, both of which leave a working authenticator and no way back
  in when the phone breaks. Generating a new set invalidates the old one immediately.
- `accountLockout` after 5 failed codes, 15 minutes. The plugin separately rate limits
  `/two-factor/*` to 3 requests per 10 seconds.
- The TOTP secret and backup codes are encrypted at rest by Better Auth using
  `BETTER_AUTH_SECRET`, and never returned by an API response. **Rotating that secret
  invalidates every enrolment** — correct behaviour, but it means the secret cannot be
  rotated casually.
- Admin accounts cannot delete themselves. One misplaced click should not end all
  access to the order book, and there is no second admin to undo it.

## Data rights

- **Export** — `/account/security` produces a JSON file with profile, addresses and
  full order history. Built from the same reads the account screens already use, so it
  cannot surface more than the UI does. Assembled into a blob in the browser rather
  than served from a URL: a link that returns someone's whole order history is a link
  that leaks through referrers, proxy logs and shared screens.
- **Deletion** — erases profile, addresses, cart, sessions and the TOTP secret. Orders
  are **anonymised, not deleted**: the rows are the store's accounting record, and
  removing them would put a hole in the books every time a customer leaves. Email,
  phone, recipient name and street address are replaced with `[deleted]`; totals, line
  items, dates and the destination district survive, because that is what tax and sales
  reporting need and a district alone identifies nobody.
- Both re-prove the password first. A 30-day session means the browser in front of us
  may have been left open a month ago.

## Sessions

Customers can see every signed-in device at `/account/security` — browser, OS, IP,
sign-in date — and revoke any one, or all others at once.

**Sessions are read directly from the table, not through `auth.api.listSessions`.**
That endpoint returns each session's *token*, which is a bearer credential: anything
holding one is signed in as that user. Passing those to a client component would put
live credentials in the HTML, in the RSC payload, and in any screenshot of the page.
The token never leaves the server; the UI keys revocation on the row id, and every
delete is scoped by user id in the `WHERE` clause. A test asserts no token appears in
the rendered HTML.

Better Auth also gates `listSessions` behind a freshness check for exactly this reason,
which is how the mistake surfaced — the page 500'd with `SESSION_NOT_FRESH` for anyone
whose session was over a day old. The freshness error was the symptom; the token
exposure was the bug.

Revocation deliberately does **not** require password re-auth, unlike export and
deletion. Signing a device out is what someone does *because* they think they have been
compromised, and a password prompt slows down the one moment it matters. The worst case
is a user ending their own sessions, which they fix by signing back in.

Sessions last 30 days and refresh daily. That is long, and the mitigation is that the
list makes a stranger's session visible and one click ends it.

## Known gaps

Written down rather than left implied.

- **Cloudflare is not configured** until the domain is live. `docs/08-cloudflare.md` is
  the runbook; the WAF rate limits there duplicate `lib/rate-limit.ts` deliberately, so
  the application is not defenceless in the meantime.
- **`placeOrder` accepts any email address.** A signed-in customer can put someone
  else's address on an order. No mail is sent until payment succeeds, so this is not an
  email-amplification vector, but the confirmation would go to the wrong person.
- **No Sentry**, so server errors live only in Vercel's log retention window.
- **No admin account recovery of last resort.** Backup codes can be replaced while
  signed in, but if the only admin loses their phone *and* their codes with no live
  session, recovery is a manual `UPDATE users SET two_factor_enabled = false` against
  the database. Acceptable with one operator who controls the database; not acceptable
  the day there are staff accounts.
- **Reads are not audited.** Viewing a customer's address writes nothing.

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
