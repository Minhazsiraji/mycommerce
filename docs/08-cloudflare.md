# Cloudflare setup

Apply once the domain is live. Nothing here can be configured from the codebase — it
is dashboard work on an account only the owner can reach — so this is written to be
followed line by line rather than interpreted.

Order matters. Do **1 and 2 first and verify the site still works** before adding any
security rule, because a proxy misconfiguration in front of Vercel produces a redirect
loop that looks exactly like an outage.

---

## 1. DNS and proxying

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `@` | `cname.vercel-dns.com` | Proxied (orange) |
| CNAME | `www` | `cname.vercel-dns.com` | Proxied (orange) |

Add the domain in **Vercel → Project → Domains** first and let it issue a certificate,
*then* switch the Cloudflare proxy on. The other order leaves Vercel unable to complete
its ACME challenge.

## 2. SSL/TLS — the step that breaks sites

**SSL/TLS → Overview → Full (strict).**

Not "Flexible". Flexible makes Cloudflare speak HTTP to Vercel while telling the
browser the connection is secure; Vercel then 308-redirects HTTP to HTTPS, Cloudflare
follows it back to itself, and the browser reports `ERR_TOO_MANY_REDIRECTS`. It also
means the `Strict-Transport-Security` header we send is a promise the origin leg does
not keep.

Also set:

- **SSL/TLS → Edge Certificates → Always Use HTTPS: On**
- **Minimum TLS Version: 1.2**
- **Opportunistic Encryption: On**

Leave **Automatic HTTPS Rewrites off** — our CSP already sends
`upgrade-insecure-requests`, and two layers rewriting the same thing makes debugging
mixed content harder than it needs to be.

## 3. Never challenge the payment webhook

Do this **before** turning on bot protection. A challenge page returned to SSLCommerz
is a payment that never gets confirmed, and the customer has already been charged.

**Security → WAF → Custom rules → Create**, first in the list:

- Name: `Skip everything for payment IPN`
- Expression:
  ```
  (http.request.uri.path eq "/api/webhooks/sslcommerz")
  or (http.request.uri.path eq "/api/webhooks/sslcommerz/return")
  or (starts_with(http.request.uri.path, "/api/cron/"))
  ```
- Action: **Skip** → tick *All remaining custom rules*, *Rate limiting rules*,
  *Managed rules*, *Bot Fight Mode*, *Super Bot Fight Mode*

The cron path is included for the same reason: GitHub Actions is an automated caller
and will be classified as a bot. It carries `CRON_SECRET`, which is the real control.

## 4. Bot protection

**Security → Bots.**

- Free plan: **Bot Fight Mode: On**.
- Pro and above: **Super Bot Fight Mode** — *Definitely automated: Block*,
  *Likely automated: Managed Challenge*, *Verified bots: Allow*.

Verified bots must stay allowed or the store leaves Google's index.

## 5. Rate limiting rules

**Security → WAF → Rate limiting rules.** These duplicate `lib/rate-limit.ts` on
purpose: the application limiter is the correctness control and runs after a request
has already cost us a serverless invocation and a database round trip. Cloudflare's job
is to make the flood never arrive.

Server Actions POST to the URL of the page they were called from, so the paths below
are the real handles for them.

**a. Guest order lookup**
- Expression: `http.request.method eq "POST" and http.request.uri.path eq "/orders/lookup"`
- Characteristics: IP
- Rate: **10 requests per 1 hour**, action **Block**, duration 1 hour

**b. Checkout**
- Expression: `http.request.method eq "POST" and http.request.uri.path eq "/checkout"`
- Rate: **10 per 1 hour**, action **Managed Challenge**

This is the one that matters most. Placing an order reserves real stock for up to 72
hours with nothing paid, so an unthrottled loop empties the catalogue for free.

**c. Sign-in and registration**
- Expression:
  ```
  http.request.method eq "POST"
  and starts_with(http.request.uri.path, "/api/auth/sign-")
  ```
- Rate: **10 per 15 minutes**, action **Managed Challenge**

**d. Two-factor verification**
- Expression: `http.request.method eq "POST" and starts_with(http.request.uri.path, "/api/auth/two-factor/")`
- Rate: **20 per 10 minutes**, action **Block**, duration 15 minutes

Deliberately looser than Better Auth's own 3-per-10-seconds so a customer fumbling a
code hits the friendly in-app message, not a Cloudflare block page.

## 6. Managed challenge on the admin area

- Name: `Challenge admin`
- Expression: `starts_with(http.request.uri.path, "/admin")`
- Action: **Managed Challenge**

Cheap defence in depth. Admin is already behind a password, a role check and a
mandatory second factor; this stops automated scanners before any of that runs. If a
challenge loop ever appears here, delete this rule first — it is the most likely cause
and the least valuable rule on the list.

Optionally, if the store is only ever administered from Bangladesh, add
`and ip.geoip.country ne "BD"` and change the action to **Block**. Do not do this if
the owner travels — locking yourself out of your own admin from an airport is a real
way to lose a day.

## 7. Cache rules

Vercel already sets correct cache headers, and the `◐` routes in the build output are
prerendered with per-request holes. The one thing Cloudflare must not do is cache a
signed-in response.

**Caching → Cache Rules → Create:**

- Name: `Never cache private pages`
- Expression:
  ```
  starts_with(http.request.uri.path, "/admin")
  or starts_with(http.request.uri.path, "/account")
  or starts_with(http.request.uri.path, "/orders")
  or starts_with(http.request.uri.path, "/cart")
  or starts_with(http.request.uri.path, "/checkout")
  or starts_with(http.request.uri.path, "/api/")
  ```
- Action: **Bypass cache**

Leave everything else on Cloudflare's defaults. Do not enable "Cache Everything" on the
storefront — it will serve one customer's cart to another.

## 8. After applying

Check each of these by hand. The failure modes are quiet.

- [ ] `https://<domain>` loads, and `http://` redirects to it
- [ ] Sign in, then hard-refresh `/account` — still signed in, not a cached signed-out page
- [ ] Place a sandbox order end to end and confirm the IPN arrives (the order reaches
      `paid` without anyone touching the database)
- [ ] `curl -I https://<domain>` still shows our security headers — Cloudflare must not
      have stripped or replaced them
- [ ] Two customers' carts do not bleed into each other in an incognito window
- [ ] `/admin` still reachable by the owner after the challenge

## What is deliberately not here

**Cloudflare Access on `/admin`.** It is the stronger control — an identity layer in
front of the app — but it costs a per-seat licence beyond the free tier and would sit
awkwardly next to Better Auth's own session. Revisit if the store ever has staff.

**mTLS on the payment webhook.** SSLCommerz does not offer a client certificate, and
the `val_id` server-side validation call is what actually authenticates a notification
(see threat 4 in `04-security.md`).
