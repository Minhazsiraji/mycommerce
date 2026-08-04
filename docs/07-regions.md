# 7. Where things run

## The rule

**Compute sits next to the database.** Everything else is secondary.

Vercel functions run in `sin1` (Singapore), pinned in `vercel.json`. Neon is in
`ap-southeast-1` (Singapore). Cloudflare's CDN serves static assets from wherever the
visitor is, which is unaffected by this.

## Why it is pinned

Vercel defaults to `iad1` (Washington DC). With the database in Singapore, every query
crossed the Pacific and back — roughly **220 ms per round trip before the query even
ran**.

That is invisible on a cached page, which is why the storefront felt fine. It is very
visible anywhere the page must actually talk to the database. Changing a cart quantity
does several queries, then re-renders and queries again; at 220 ms each that is close
to a second of waiting for one button press. Same region, it is single-digit
milliseconds.

The trade is a slightly slower first byte for a visitor physically near Washington. For
a store selling in Bangladesh that is not a real customer, and cached pages are served
from the CDN edge regardless.

## Consequences to remember

- **Never move the database without moving the functions**, or the reverse. They are one
  decision, and splitting them silently degrades every uncached page.
- A second database (read replica, analytics) belongs in the same region unless there is
  measured evidence otherwise.
- If the store later sells into a distant market, the answer is caching and CDN reach,
  not a second compute region — two regions against one database just moves the latency
  around.

## Checking it

The region is visible per deployment in the Vercel dashboard under **Functions**. After
changing `vercel.json`, a redeploy is required: the setting is read at build time, not
per request.
