# 5. Performance

"Fast" for a storefront means one thing commercially: the product page appears
immediately. Conversion falls measurably with every extra second, so the budgets below
are treated as requirements, not aspirations.

## Budgets

Enforced in CI via Lighthouse on preview deploys. A regression fails the build.

| Metric | Target | Hard fail |
|---|---|---|
| LCP (product page, mobile 4G) | < 1.2 s | 2.0 s |
| TTFB (cached) | < 200 ms | 500 ms |
| CLS | < 0.05 | 0.1 |
| INP | < 200 ms | 500 ms |
| JS shipped, catalog routes | < 120 KB gzip | 180 KB |
| Product image, above fold | < 90 KB | 150 KB |

Measured on a throttled mid-range Android profile, not a desktop on office wifi. The
desktop number is always flattering and always wrong.

## Where the speed comes from

**1. Static catalog, CDN-served.** Product and category pages are prerendered. A
request for a product page hits Cloudflare and never reaches the application or the
database. This is the whole game — everything else is refinement.

Freshness comes from tag revalidation on write (see [API](03-api.md#caching-and-revalidation)),
not from short TTLs. There is no window during which the page is stale, and no
per-request rendering cost.

**2. Server Components by default.** Catalog pages ship almost no JavaScript. The
interactive islands are add-to-cart, variant selection, search input, and the cart
drawer. Everything else renders on the server and hydrates nothing.

**3. Images.** Next `<Image>` against R2, AVIF with WebP fallback. Explicit
`width`/`height` on every image — this alone handles most of the CLS budget. Above-fold
product image gets `priority`; the rest lazy-load. Responsive `sizes` so phones never
download desktop assets.

**4. Fonts.** `next/font` with self-hosting and `display: swap`. No render-blocking
external font request, no layout shift on load.

**5. Query discipline.** Product listing selects only the columns the card renders —
never `SELECT *` on a table with a description column. Variants and images are fetched
in a single grouped query per page. The N+1 in a product grid is the classic mistake
here: it looks fine with 12 seeded products and collapses at 500.

**6. Payload shape.** Paginate at 24 products per page, cursor-based. No infinite
client-side dataset.

## What is dynamic

These paths are never cached and are allowed to be slower, because they are
low-frequency and correctness matters far more than latency:

| Path | Reason |
|---|---|
| Cart | Per-user state |
| Checkout | Must reflect live stock and prices |
| Account and order history | Per-user, private |
| Admin | Live operational data |

Target under 500 ms server response. Cart is the one to watch — it appears in the
header on every page, so it renders as a streaming Suspense boundary rather than
blocking the shell.

## Database

- Indexes as specified in [data model](02-data-model.md#indexing).
- Connection pooling through Neon's pooler; serverless functions must not each open a
  direct connection.
- `EXPLAIN ANALYZE` any query on a page in the critical path before it ships.
- Slow query log at 100 ms, reviewed before each release.

Read replicas are **not** needed at this scale and add replication-lag bugs — a
customer seeing their own just-placed order missing from their order list. Revisit only
with evidence from real load.

## Product search

Three layers, tried in order, all in Postgres. No Elasticsearch, no Algolia — the
catalogue is small and the stack already has the tools.

1. **Full-text** over a generated `tsvector`: title (A), keywords and brand (B),
   description (C), with a GIN index.
2. **Category names**, matched by join — including the *parent* category, because the
   tree is two deep and a t-shirt lives in "T-shirts" under "Apparel".
3. **Trigram similarity** (`pg_trgm`), as a fallback only when the first two return
   nothing, so an exact hit is never diluted or reordered by fuzzy noise.

The threshold is `word_similarity >= 0.5`, chosen by measuring the real catalogue:
genuine typos score 0.55–0.75 against the intended product, unrelated products top out
near 0.36, and nonsense scores 0.00. Gibberish therefore still returns nothing.

**The lesson that produced the `keywords` column:** the store sold four pairs of shoes
and searching "shoes" returned zero, because the titles say "Suede Desert Boot" and
"Canvas Low Top". No ranking algorithm fixes a word that is not in the index. Vocabulary
beats relevance tuning on a small catalogue.

**Whenever the search vector definition changes**, remember that the only way to alter a
generated column is to drop and re-add it — which silently drops its GIN index, while
drizzle-kit's snapshot still believes the index exists and will never regenerate it. Add
a custom migration recreating `products_search_idx`, as `0010` does.

## Caching layers

| Layer | Holds | Invalidated by |
|---|---|---|
| Cloudflare CDN | Static assets, prerendered pages | Deploy, tag revalidation |
| Next.js Data Cache | Query results in RSC | `revalidateTag` |
| Browser | Immutable hashed assets, 1 year | Content hash change |

No Redis in the initial build. It is a real dependency with real failure modes, and the
two layers above already cover the read-heavy catalog. Add it only when rate limiting
or session load produces evidence that it is needed.

## Frontend detail

- Route-based code splitting is automatic; `next/dynamic` for the heavy admin editor
  and the image gallery lightbox.
- Prefetch product links on viewport entry — navigation feels instant and costs almost
  nothing on a static page.
- Optimistic UI on add-to-cart via `useOptimistic`, reconciled with the server result.
- Skeletons for streamed boundaries, sized to match final content so nothing shifts.
- No client-side state library. Server state lives on the server; URL state lives in
  the URL.

## Monitoring

| Signal | Tool |
|---|---|
| Real-user Core Web Vitals | Vercel Analytics |
| Errors and traces | Sentry |
| Uptime, checkout synthetic | Better Stack |
| Query performance | Neon insights |
| Budget regression | Lighthouse CI on every PR |

Alert on: checkout error rate > 1%, p95 TTFB > 800 ms, payment webhook failures, any
5xx spike. Alerts go to one channel, and every alert is actionable — a channel that
cries wolf gets muted, and then a real outage goes unnoticed.
