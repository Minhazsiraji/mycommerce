# Category V2 Commerce Specification

| Field | Value |
|---|---|
| Status | Planning complete; Product Owner approval required before implementation |
| Route | `/c/[slug]` |
| Authority | Approved D01–D16 and responsive Category wireframes |
| Scope | Category listing commerce semantics; no implementation authority |

## 1. Invariants

- Public results contain active products only and authoritative price, stock, brand,
  media, and assignment data only.
- Parent categories include products assigned to the parent and direct children while
  the approved taxonomy remains two levels. Products are counted once.
- Page size is 24. Default sort is Newest. No popularity/manual/relevance behavior.
- URL state is server-validated, normalized, shareable, and sufficient to reconstruct
  the listing. Client state is never the commerce authority.
- No facet ships unless its source, completeness, vocabulary, query plan, URL semantics,
  counts, accessibility, and invalidation have passed this specification's gates.

## 2. Query contract

| Dimension | Proposed key/value | Rule |
|---|---|---|
| Sort | `sort=price-asc\|price-desc` | Newest omitted; one value only |
| Page | `page=N` | Positive bounded integer; page 1 omitted |
| Price minimum | `minPrice=<minor-units>` | Non-negative integer; omitted when unset |
| Price maximum | `maxPrice=<minor-units>` | Non-negative integer; omitted when unset; must be ≥ minimum |
| Availability | `inStock=1` | Render only after reliable definition approval |
| Brand | `brand=<stable-id-or-slug>` repeated | Render only with complete verified brands; sorted/deduplicated |
| Subcategory | `subcategory=<slug>` | Direct child of current parent only; omitted on child route |

Exact public keys are proposed here and require final implementation review. Prices use
integer minor units internally; display formatting never controls query semantics.

Allowed serialization order: `subcategory`, `brand`, `minPrice`, `maxPrice`, `inStock`,
`sort`, `page`. Unknown keys are removed by redirect. Duplicate scalar keys resolve only
through the approved deterministic parser; conflicting duplicates normalize rather than
silently selecting arbitrary input. Empty/default values are removed.

## 3. Facet truth gates

| Facet | Source and eligibility | Count/selection semantics |
|---|---|---|
| Price | Minimum price of non-archived, eligible variants; existing money utilities | Inclusive range; selected range remains visible even at zero |
| Availability | Approved inventory definition, consistent with ProductCard | “In Stock” only; no urgency/low-stock inference |
| Brand | Verified normalized brand for every product in eligible scope | Stable identifier; missing/unknown brand blocks launch of facet |
| Subcategory | Authoritative direct children of current parent | Single direct-child scope; absent on leaf category |

Color, Size, Material, Rating, Discount, Seller, and Collection are prohibited for V2.
Adding any future facet requires a versioned specification change and D12 evidence gate.

Facet counts describe products matching the current category and all other active filters,
with the facet's own selection treatment explicitly tested. Counts are exact, deduplicated
product counts—not variant counts or inventory quantities. Disabled/unavailable options
remain visible only when that aids removal/understanding; implementation must not offer a
new zero-count selection.

## 4. Sorting

- `newest`: deterministic product publication/creation order plus stable ID tie-breaker;
  omitted from URL.
- `price-asc` / `price-desc`: authoritative minimum eligible variant price plus stable ID
  tie-breaker. Products without a purchasable price must follow an approved repository
  invariant; they may not be placed arbitrarily.
- Any sort change resets page to 1 and preserves approved filters.

## 5. Pagination and normalization

- Offset pagination remains approved at 24 items while representative query evidence
  stays within D15 limits.
- Every page link preserves normalized filters and non-default sort.
- Valid `page>1` is retained. `page=1`, non-positive, non-integer, overflow, or malformed
  values redirect to the normalized base state.
- A numeric page beyond `lastPage` redirects to the last valid page; an empty result set
  resolves to base without displaying a false invalid-page empty state.
- Filter/sort/subcategory change resets page to 1. Back/Forward restores the URL state.

## 6. Counts and states

- Normal copy: “Showing X–Y of N products.” Use “1 product” and truthful zero forms.
- Empty category: valid identity, zero active products before filters, no filter/sort/grid;
  recovery to real parent/subcategory/category routes. Exclude from sitemap and index.
- Filtered zero: preserve selections; show zero and individual/Clear all recovery. Never
  auto-relax, recommend speculative products, or redirect.
- Unknown slug: route not found. Data/load failure: typed safe error, Retry where safe.
- Loading geometry must match the responsive final grid and 4:5 ProductCard media.

## 7. URL, canonical, robots, and sitemap

| URL class | Canonical | Robots | Sitemap |
|---|---|---|---|
| Eligible base category | Self | Production `index, follow` | Include |
| Valid unfiltered `page>1` | Self | Production `index, follow` | Exclude from generated sitemap |
| Sort variant | Base category | `noindex, follow` | Exclude |
| Any filter variant | Base category unless later SEO approval states otherwise | `noindex, follow` | Exclude |
| Empty category | Self | `noindex, follow` | Exclude |
| Preview/development | Environment URL policy | `noindex, nofollow` | No public indexable sitemap behavior |

Filter `noindex, follow` is binding even when a canonical exists. Combined filter/sort/page
states remain noindex. Normalization must not create redirect loops or conflicting header,
metadata, robots.txt, canonical, or sitemap signals.

## 8. Content and structured data

- One authoritative category name supplies H1 and truthful metadata identity.
- Display a category description only when explicitly approved. Otherwise render nothing;
  never use AI, placeholder, lorem ipsum, or inferred marketing copy.
- Visible breadcrumb and BreadcrumbList JSON-LD must match: Home → optional parent → current.
- Do not add ItemList, ratings, offers, aggregate ratings, availability claims, or other
  structured data unless exact data semantics receive separate approval.

## 9. Architecture, cache, and data flow

- Route parses/normalizes URL and composes metadata/UI. Catalog module owns category tree,
  listing/facet/count reads, complete cache keys/tags, and post-commit invalidation.
- Cache keys include slug/category IDs, scope, every filter, sort, page, page size, and any
  publishability input. A missing output-changing input is a release blocker.
- Listing, total, and facet work is bounded/batched; no per-card or per-option query.
- Result/count/facet snapshots must be acceptably consistent under one documented read
  strategy. Inventory mutations invalidate availability-dependent reads after commit.

## 10. Analytics contract

After separate privacy/analytics/consent approval only: category view, subcategory select,
filter open/apply/remove/clear, sort change, page navigation, product click, and zero result.
Use stable category/product/facet identifiers, option keys, page, sort, and card position;
exclude raw text, names, contact data, session replay, and sensitive/personal information.
Failure must never block navigation. Events are deduplicated and payload/bundle bounded.

## 11. Performance gates

- D15: LCP p75 mobile ≤2.0 s target/2.5 s max; INP ≤150/200 ms; CLS ≤0.05/0.10;
  cached TTFB ≤300/500 ms; initial JS ≤120 KB gzip target; no N+1.
- Record production-shaped `EXPLAIN ANALYZE` for base, parent aggregation, worst approved
  filter combination, counts, facets, price sorts, and deepest supported offset.
- If a facet or full facet-count strategy exceeds limits, omit/defer it; do not weaken the
  gate or hide latency behind uncontrolled client fetches.

## 12. Acceptance and change control

Implementation may start only after Product Owner approval of this spec, component spec,
and validation checklist. Any new facet, hierarchy depth, URL key, indexable state, page
size, sort, analytics field, cache owner, or structured-data type requires an explicit
spec revision. No UI-only change may widen commerce behavior.
