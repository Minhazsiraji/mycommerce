# Going live

From a sandbox store on `mycommerce-sepia.vercel.app` to real customers paying real
money on your own domain.

Do these in order. Steps 1–4 get the domain working, 5–7 make customer-facing things
real, 8 is the legal gate, 9 is the check.

---

## 1. Buy the domain — Cloudflare Registrar

<https://dash.cloudflare.com/?to=/:account/domains/register>

Cloudflare sells at wholesale cost with no markup and no first-year-cheap /
renewal-expensive trick, and WHOIS privacy is included free rather than sold back to
you. A `.com` runs about $10–11/year, every year. You already have an account, and
since `docs/08-cloudflare.md` puts Cloudflare in front of the store anyway, registering
there means DNS is already where it needs to be.

**Do not** buy from a registrar that advertises $0.99 the first year — the renewal is
typically $20+, and transferring away later is a chore.

**On `.com.bd`:** registration goes through BTCL, needs trade-licence paperwork, and
cannot be managed from Cloudflare. It signals "local business" well, but it is a
different and slower process. A `.com` is the pragmatic choice; add `.com.bd` later if
the brand warrants it.

## 2. Point the domain at Vercel

Order matters — Vercel must issue its certificate *before* Cloudflare proxies traffic.

1. **Vercel → Project → Settings → Domains → Add** — enter both `yourdomain.com` and
   `www.yourdomain.com`. Vercel will show the DNS records it wants.
2. **Cloudflare → DNS** — add them. For an apex + www setup that is normally two CNAMEs
   to `cname.vercel-dns.com`.
3. Set the proxy status to **DNS only (grey cloud)** at first. Wait for Vercel to show
   the domain as Valid with a certificate issued.
4. Only then switch both records to **Proxied (orange cloud)**.

## 3. SSL — the step that breaks sites

**Cloudflare → SSL/TLS → Overview → Full (strict).**

Not "Flexible". Flexible makes Cloudflare speak plain HTTP to Vercel while telling the
browser the connection is secure. Vercel then redirects HTTP to HTTPS, Cloudflare
follows it back to itself, and the customer sees `ERR_TOO_MANY_REDIRECTS`. It also
makes the `Strict-Transport-Security` header the app sends a promise the origin leg
does not keep.

Then: **Always Use HTTPS: On**, **Minimum TLS Version: 1.2**.

Full detail, plus the WAF and cache rules, is in `docs/08-cloudflare.md`. Apply the
payment-webhook skip rule there **before** turning on bot protection — a challenge page
returned to SSLCommerz is a payment the customer was charged for and the store never
confirms.

## 4. Update the app's own URLs

**Vercel → Settings → Environment Variables**, Production scope:

| Variable | New value |
|---|---|
| `BETTER_AUTH_URL` | `https://yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` |

These are not cosmetic. `BETTER_AUTH_URL` signs session cookies and builds the links in
verification and password-reset emails; leave it on the vercel.app host and those emails
send customers to the wrong site. It also builds the SSLCommerz return URLs.

**Redeploy after changing them** — env vars are read at build time.

## 5. Verify the sending domain in Resend

This is what unblocks email to anyone other than you. Until it is done, Resend only
delivers to the account owner's address, so **no customer has ever received an order
confirmation from this store.**

1. <https://resend.com/domains> → **Add Domain** → `yourdomain.com`
2. Resend gives you DKIM, SPF and (optionally) DMARC records. Add them in Cloudflare DNS
   as **DNS only (grey cloud)** — proxying a TXT record is meaningless and an MX record
   proxied through Cloudflare will not work.
3. Wait for Verified.
4. Set `EMAIL_FROM="MyCommerce <orders@yourdomain.com>"` in Vercel and redeploy.

Send yourself a test order afterwards and confirm the confirmation arrives **and does
not land in spam**. If it does, add the DMARC record.

## 6. Switch SSLCommerz to live

1. Apply for a live merchant account at <https://sslcommerz.com>. They will ask for
   trade licence, bank account details, and **your policy pages** — see step 8.
2. Once approved, in Vercel set:
   - `SSLCOMMERZ_STORE_ID` — the live store id
   - `SSLCOMMERZ_STORE_PASSWORD` — the live store password, which is
     `<store_id>@ssl`-style, **not** your dashboard login password
   - `SSLCOMMERZ_SANDBOX="false"`
3. In the SSLCommerz merchant panel, set the IPN URL to
   `https://yourdomain.com/api/webhooks/sslcommerz`.
4. Redeploy, then place one real order for the smallest amount you sell and refund it.
   A live gateway is the one thing that cannot be tested in sandbox.

## 7. Fill in the real details

| What | Where |
|---|---|
| Bank transfer account | `BANK_ACCOUNT_NAME`, `BANK_ACCOUNT_NUMBER`, `BANK_NAME`, `BANK_BRANCH` in Vercel — currently placeholders |
| Contact email and phone | `STORE_CONTACT_EMAIL`, `STORE_CONTACT_PHONE` — the footer hides them until set |
| Delivery rates | `/admin/shipping` — the example rates drive the trust bar, so wrong ones are visible on every page |
| Cron secrets | GitHub → repo → Settings → Secrets → Actions: `CRON_SECRET` (match Vercel) and `SITE_URL` (the new domain) |
| Product photos | `/admin/products` — the flat colour blocks are placeholders |
| Search keywords | Each product's **Search keywords** field. This is why "shoes" finds boots. |
| Meta analytics | Follow `docs/10-meta-analytics.md`; Production and Preview must use separate datasets and tokens |

## 8. Write the policy pages

**This is a gate, not a nicety.** SSLCommerz and most Bangladeshi gateways ask to see
these before approving a live merchant account, and a store without them loses
customers who were otherwise ready to pay.

You need, at minimum:

- **Return and refund policy** — how many days, who pays return postage, how a refund is
  issued and how long it takes
- **Privacy policy** — what you collect, why, who else sees it (Cloudinary, Resend,
  SSLCommerz, Neon), and how someone deletes their account
- **Terms of service**
- **Contact** — a real address, phone and email

The application does not have these pages. Decide the actual terms — they are business
decisions, not design ones — and they can be built and linked into the footer quickly.

## 9. Check before announcing

- [ ] `https://yourdomain.com` loads; `http://` and `www` both redirect to it
- [ ] `curl -I https://yourdomain.com` still returns the security headers (Cloudflare
      must not have stripped them)
- [ ] Sign in, hard-refresh `/account` — still signed in, not a cached signed-out page
- [ ] Register a fresh test account and confirm the verification email arrives at a
      non-owner address, in the inbox rather than spam
- [ ] Place a real card order end to end; confirm it reaches `paid` without touching the
      database
- [ ] Place a bank-transfer order; confirm the instructions show your real account
- [ ] `/orders/lookup` finds that order by number + email
- [ ] Admin sign-in asks for the 2FA code
- [ ] Two carts in two incognito windows do not bleed into each other
- [ ] `POST /api/cron/release-expired-holds` without the secret returns 401

---

## What stays on `mycommerce-sepia.vercel.app`

Nothing needs to move. Vercel keeps serving the old host, and Next will redirect
canonical traffic once the domain is primary. Set the custom domain as **Production**
in Vercel → Domains so generated links use it.
