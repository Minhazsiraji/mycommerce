# Category V2 Decision Matrix

| Field | Value |
|---|---|
| Milestone | 2 — Category V2 |
| Status | Product Owner approved — 2026-08-10; planning authority for Phase C–F |
| Route | `/c/[slug]` |
| Authorities | Approved `CATEGORY_FEATURE_CHARTER.md` and `CATEGORY_V2_PLANNING.md` |
| Purpose | Resolve commerce policy before wireframes, Commerce Spec, component contracts, or implementation |

This matrix records decisions; it does not authorize UI, schema, query, cache, analytics,
SEO, or application-code changes. Existing behavior is evidence, not automatic approval.
The Product Owner approved D01–D16 on 2026-08-10. D03 and D05 include binding revisions.

## Product Owner approval register

| ID | Decision | Options | Recommended option | Final approval status |
|---|---|---|---|---|
| D01 | Parent/child product inclusion | Parent only / Direct children / All descendants | Parent + direct children within the approved two-level taxonomy | **Approved** |
| D02 | Default sort | Newest / Price / Manual / Popular | Newest; omit it from the URL | **Approved** |
| D03 | Initial filter scope | None / Minimum viable / Broad facets | Price; authoritative availability; authoritative brand; applicable subcategory only | **Approved with revision** |
| D04 | URL normalization | Preserve variants / Redirect to one normalized URL | One normalized URL: allowlisted keys, fixed order, defaults omitted | **Approved** |
| D05 | Canonical rules | Self / Base category / Page 1 | Base/page self; sort to base; filtered URLs noindex, follow | **Approved with revision** |
| D06 | Index/noindex rules | Index all / Index base only / Selective index | Index eligible base and valid page series; noindex sort/filter variants | **Approved** |
| D07 | Empty category behavior | Show / Hide / 404 | Show truthful category with empty recovery; exclude from sitemap | **Approved** |
| D08 | Filtered zero-result behavior | Empty message / Auto-relax / Redirect | Keep state, explain zero results, offer clear/reset actions | **Approved** |
| D09 | Invalid/out-of-range page | 404 / Empty / Last page / Redirect | Invalid syntax/value → normalized base; out-of-range → last valid page | **Approved** |
| D10 | Pagination normalization | Keep page 1 / Omit page 1; allow pages / Cursor | Omit page 1; bounded offset pages; reset page after state changes | **Approved** |
| D11 | Product count wording | Total only / Range + total / Approximate | “Showing X–Y of N products”; truthful singular/zero forms | **Approved** |
| D12 | Future facet expansion | Open-ended / Governed evidence gate / Fixed forever | Governed evidence gate; no facet ships by UI-only change | **Approved** |
| D13 | Analytics events | None / Minimal / Detailed | Minimal privacy-safe discovery events after analytics approval | **Approved** |
| D14 | Cache ownership | Route / Catalog module / Client | Catalog module owns reads, keys, tags, and post-mutation invalidation | **Approved** |
| D15 | Performance limits | Aspirational / Release gates / No limits | Treat approved limits as release gates with evidence/exception process | **Approved** |
| D16 | Category description policy | Approved only / Generated fallback / Placeholder | Show approved description only; otherwise omit | **Approved** |

## Decision records

### D01 — Parent/child product inclusion

- **Background:** Parent results and counts must match the visible taxonomy.
- **Existing behavior:** A parent includes products assigned to itself and its direct
  children; hierarchy is capped at two levels.
- **Options:** Parent only; parent + direct children; all descendants.
- **Recommended option:** Parent + direct children while the two-level invariant holds.
- **Business impact:** Preserves broad parent discovery without hiding child inventory.
- **UX impact:** Parent counts and grids align with the subcategory choices shown.
- **SEO impact:** Avoids multiple hierarchy interpretations for the same category URL.
- **Performance impact:** Bounded category-ID scope; deeper recursive traversal is avoided.
- **Risks:** Duplicate assignment semantics and future deeper taxonomy can change counts.
- **Dependencies:** Taxonomy/product-assignment audit; two-level invariant; count tests.
- **Final approval status:** **Approved**.

### D02 — Default sort

- **Background:** The default controls first impression, repeatability, and canonical URLs.
- **Existing behavior:** `newest` is default and omitted; price ascending/descending exist.
- **Options:** Newest; price; manual merchandising; popularity.
- **Recommended option:** Newest, using a deterministic tie-breaker; omit `sort=newest`.
- **Business impact:** Requires no invented popularity or new merchandising data.
- **UX impact:** Predictable freshness; customers may choose either price sort.
- **SEO impact:** One base URL instead of a duplicate default-sort URL.
- **Performance impact:** Uses the present repository path; verify supporting query plan.
- **Risks:** “Newest” may not represent commercial priority; tie behavior must be explicit.
- **Dependencies:** Repository order/tie-break audit and representative query evidence.
- **Final approval status:** **Approved**.

### D03 — Initial filter scope

- **Background:** Filters are useful only when data is complete, truthful, and queryable.
- **Existing behavior:** No visible facets; variant options are ungoverned JSON; category
  scope, sort, and page are the only intentional Category listing inputs.
- **Options:** No filters; minimum viable authoritative facets; broad faceted filtering.
- **Approved option:** Price; Availability only when its inventory definition is reliable;
  Brand only when every included product has a verified brand; and Subcategory when
  applicable. Color, Size, Material, Rating, Discount, Seller, and Collection are deferred.
- **Business impact:** Improves relevance without publishing misleading choices.
- **UX impact:** Smaller comprehensible filter set and fewer zero-result traps.
- **SEO impact:** Limits combinatorial URL growth.
- **Performance impact:** Bounds facet/count queries; every facet needs plan evidence.
- **Risks:** Insufficient data may reduce the first release to no new facets.
- **Dependencies:** Attribute completeness, vocabulary, availability definition, query
  plans, and Commerce Spec approval.
- **Final approval status:** **Approved with revision**. Each conditional facet remains
  implementation-gated by the named data evidence; approval does not manufacture data.

### D04 — URL normalization

- **Background:** Equivalent query strings must resolve to one stable, shareable state.
- **Existing behavior:** Generated links omit default sort/page; broader normalization is
  undefined and unsupported values are rejected by Zod.
- **Options:** Preserve every valid variant; canonical only; redirect to a normalized URL.
- **Recommended option:** Allowlist approved keys, serialize once in fixed order, remove
  defaults/empty values, collapse duplicates deterministically, and redirect equivalents.
- **Business impact:** Cleaner shared links and more reliable analytics aggregation.
- **UX impact:** Refresh, Back/Forward, and sharing reproduce the same approved state.
- **SEO impact:** Reduces duplicate crawlable URLs.
- **Performance impact:** Improves cache-key convergence; redirect overhead is limited to
  non-normalized requests.
- **Risks:** Incorrect normalization could discard legitimate state or create loops.
- **Dependencies:** Final filter keys, serializer contract, redirect tests, SEO review.
- **Final approval status:** **Approved**.

### D05 — Canonical rules

- **Background:** Canonicals must distinguish meaningful result pages from alternate views.
- **Existing behavior:** Category has no explicit route-level canonical policy.
- **Options:** Every URL self-canonical; every variant canonical to page 1; mixed policy.
- **Approved option:** Base category self-canonical; valid `page>1` self-canonical; sort
  variants canonical to the base category; filter variants emit `noindex, follow`.
- **Business impact:** Concentrates discovery authority on governed landing pages.
- **UX impact:** No visible behavior change; shared states still work.
- **SEO impact:** Preserves paginated discovery while consolidating sort/filter duplicates.
- **Performance impact:** Negligible runtime impact; reduces crawler duplication.
- **Risks:** Canonical-to-base can be wrong if a future filtered landing page is approved.
- **Dependencies:** SEO owner approval, D04, D06, pagination crawl validation.
- **Final approval status:** **Approved with revision**. Filter canonical targets must be
  finalized consistently with D04/D06 in the Commerce Spec; `noindex, follow` is binding.

### D06 — Index/noindex rules

- **Background:** Crawl policy must prevent URL explosion while keeping useful catalog
  pages discoverable.
- **Existing behavior:** Production Category pages may index; preview/development cannot.
  Query-state rules and empty-category eligibility are undefined.
- **Options:** Index all; index base only; selectively index governed states.
- **Recommended option:** Production indexes eligible base categories and valid paginated
  pages; sort/filter variants are `noindex,follow`; previews remain `noindex,nofollow`.
- **Business impact:** Protects organic discovery without exposing uncontrolled facets.
- **UX impact:** None for customers.
- **SEO impact:** Prevents index bloat; allows product discovery through page series.
- **Performance impact:** Reduces wasteful crawler traffic.
- **Risks:** Conflicting meta/headers/robots/canonical signals can suppress valid pages.
- **Dependencies:** D05, D07, environment tests, robots/sitemap agreement, SEO approval.
- **Final approval status:** **Approved**.

### D07 — Empty category behavior

- **Background:** A real category can temporarily have no active products.
- **Existing behavior:** The route can render an inline empty message; sitemap includes all
  category slugs regardless of product count.
- **Options:** Show; hide/redirect; return not found.
- **Recommended option:** Keep the valid category reachable with truthful empty-state
  recovery, but exclude it from the production sitemap and do not index it until stocked.
- **Business impact:** Supports merchandising setup without presenting a search landing dead end.
- **UX impact:** Explains the state and links to parent/subcategories or all shopping.
- **SEO impact:** Avoids thin empty pages in the sitemap/index.
- **Performance impact:** Eligibility requires an authoritative active-product check.
- **Risks:** Counts can change after caching; recovery links must be real and relevant.
- **Dependencies:** Publishability definition, cache invalidation, content contract, D06.
- **Final approval status:** **Approved**.

### D08 — Filtered zero-result behavior

- **Background:** Valid filters can produce no matching active products.
- **Existing behavior:** No filters exist, so filtered recovery is absent.
- **Options:** Show a dead-end message; auto-remove filters; redirect; preserve state with
  explicit recovery.
- **Recommended option:** Preserve selected state, show zero truthfully, offer “Clear all”
  and individual filter removal; never silently relax or redirect.
- **Business impact:** Retains customer intent and offers a recoverable path.
- **UX impact:** Transparent, controllable recovery with no surprise result changes.
- **SEO impact:** Zero-result filter URLs follow the approved noindex policy.
- **Performance impact:** Clear/reset links reuse normalized URLs; no extra recommendation query.
- **Risks:** Too many selected chips/actions can overwhelm small screens.
- **Dependencies:** Approved filters, mobile wireframe, content contract, D04/D06.
- **Final approval status:** **Approved**.

### D09 — Invalid and out-of-range page behavior

- **Background:** Malformed pages and catalog shrinkage must not produce empty dead ends.
- **Existing behavior:** Values below 1/unsupported input fail validation; `page>lastPage`
  can render an empty grid without a defined recovery.
- **Options:** 404; empty result; redirect to page 1; redirect to last valid page.
- **Recommended option:** Invalid syntax/non-positive values redirect to the normalized
  base; valid numeric pages beyond the end redirect to the last valid page (base when empty).
- **Business impact:** Keeps customers in the catalog and reduces broken shared links.
- **UX impact:** Predictable recovery; no false “no products” message.
- **SEO impact:** Removes soft-404/duplicate invalid URLs through permanent normalization.
- **Performance impact:** Uses the existing total count; avoid a second listing query.
- **Risks:** Rapid catalog changes can make the last page move; redirect status must be approved.
- **Dependencies:** Count reliability, D04/D05, redirect/status policy, integration tests.
- **Final approval status:** **Approved**.

### D10 — Pagination normalization

- **Background:** Pagination must preserve state without multiplying equivalent URLs.
- **Existing behavior:** Offset pages of 24; page 1 omitted; sort changes reset to page 1;
  Previous/Next links only.
- **Options:** Keep explicit page 1; normalized offset pages; cursor pagination.
- **Recommended option:** Keep bounded offset pagination now; omit `page=1`; reset page on
  any sort/filter change; serialize approved state into every page link.
- **Business impact:** Familiar navigation without premature data-layer change.
- **UX impact:** Stable page context, refresh, sharing, Back, and Forward.
- **SEO impact:** Prevents duplicate page-1 URLs and supports D05/D06.
- **Performance impact:** Fixed page size 24; offset depth must remain within measured limits.
- **Risks:** Deep offsets may degrade; inventory changes can shift products between pages.
- **Dependencies:** Production-shaped depth/query evidence, D04/D09, wireframes.
- **Final approval status:** **Approved**.

### D11 — Product count wording

- **Background:** Count copy must describe exactly what the active query returns.
- **Existing behavior:** A server total is available, but range/facet wording is undefined.
- **Options:** Total only; visible range plus total; approximate count.
- **Recommended option:** “Showing X–Y of N products,” with truthful zero and singular forms;
  never imply an approximate or inventory quantity.
- **Business impact:** Sets clear assortment expectations.
- **UX impact:** Gives useful position and scope, especially on paginated results.
- **SEO impact:** Neutral; count text must not become fabricated metadata.
- **Performance impact:** Reuses the existing authoritative count query.
- **Risks:** Stale caches can briefly disagree with changing inventory/catalog state.
- **Dependencies:** Content Guide approval, D01/D03/D10, count/cache tests.
- **Final approval status:** **Approved**.

### D12 — Future facet expansion

- **Background:** Wishlist, Search, AI, or merchandising must not add facets informally.
- **Existing behavior:** No normalized facet model or expansion contract exists.
- **Options:** Open-ended additions; permanently fixed facets; governed evidence gate.
- **Recommended option:** Governed gate requiring authoritative source, completeness,
  vocabulary, URL/count semantics, accessibility, analytics, and query-plan evidence.
- **Business impact:** Allows controlled growth without misleading shoppers.
- **UX impact:** Prevents inconsistent or unusable filter additions.
- **SEO impact:** Every new URL dimension receives explicit canonical/index policy.
- **Performance impact:** Every facet must meet bounded query and cache limits.
- **Risks:** Governance adds lead time; bypassing it creates debt and index bloat.
- **Dependencies:** Commerce Spec change control, data ownership, performance/SEO review.
- **Final approval status:** **Approved**.

### D13 — Analytics events

- **Background:** Success metrics require measurement without collecting unnecessary data.
- **Existing behavior:** No Category-specific event contract is documented.
- **Options:** No events; minimal discovery events; detailed behavior tracking.
- **Recommended option:** After analytics/privacy approval, record category view,
  subcategory select, filter apply/remove/clear, sort change, pagination, product click,
  and zero-result using stable non-PII identifiers.
- **Business impact:** Establishes baselines for discovery decisions.
- **UX impact:** No blocking scripts or visible behavior; event failure must not break use.
- **SEO impact:** None directly.
- **Performance impact:** Lazy/batched transport with a strict payload and JS budget.
- **Risks:** PII leakage, duplicated navigation events, consent/regulatory issues.
- **Dependencies:** Analytics vendor/owner, privacy and consent policy, event schema, QA.
- **Final approval status:** **Approved in principle**; event emission remains gated by
  analytics/privacy/consent implementation approval.

### D14 — Cache ownership

- **Background:** Filter/sort/page expansion makes cache correctness a commerce concern.
- **Existing behavior:** Catalog cached reads own tagged data; framework arguments vary keys;
  catalog mutations invalidate centralized tags after commit.
- **Options:** Route-owned; catalog-module-owned; client cache; mixed ownership.
- **Recommended option:** Catalog module owns read functions, complete key inputs, tags, and
  post-commit invalidation; the route only parses/serializes approved state.
- **Business impact:** Reduces stale product/count risk across future discovery features.
- **UX impact:** Faster repeat navigation with consistent results.
- **SEO impact:** Crawlers receive the same authoritative server state as customers.
- **Performance impact:** Enables bounded shared caching; avoids page/card fetches and N+1.
- **Risks:** Missing an output-changing input can serve incorrect results across URLs.
- **Dependencies:** Final query contract, mutation inventory, cache-key/invalidation tests.
- **Final approval status:** **Approved**.

### D15 — Performance limits

- **Background:** Facets, counts, images, and responsive controls can regress the released
  storefront baseline.
- **Existing behavior:** Server-first rendering, 24-item cap, batched reads, tagged caches,
  and 4:5 media exist; Category-specific RUM/query evidence does not.
- **Options:** Aspirational targets; enforceable release gates; no explicit limits.
- **Recommended option:** Release gates: LCP p75 mobile ≤2.0 s target/2.5 s max; INP ≤150
  ms target/200 ms max; CLS ≤0.05 target/0.10 max; cached TTFB ≤300 ms target/500 ms max;
  initial JS ≤120 KB gzip target; no N+1; exceptions require documented approval.
- **Business impact:** Protects conversion and infrastructure cost.
- **UX impact:** Keeps discovery responsive on representative Bangladesh mobile networks.
- **SEO impact:** Supports crawlability and Core Web Vitals quality.
- **Performance impact:** Defines the budget itself; requires production-shaped evidence.
- **Risks:** Lab-only results or unrealistic fixtures can hide regressions.
- **Dependencies:** Representative catalog/device/network data, RUM approval, query plans,
  bundle/Lighthouse evidence, exception owner.
- **Final approval status:** **Approved**.

### D16 — Category description policy

- **Background:** Category copy must be truthful and governed; absence of approved copy
  is preferable to invented marketing language.
- **Existing behavior:** The database description is optional and may be absent.
- **Options:** Show approved description only; generate a fallback; use placeholder copy.
- **Approved option:** Display an approved category description when present; otherwise
  render no description region.
- **Business impact:** Protects brand trust and prevents unsupported claims.
- **UX impact:** Preserves a clean heading region without empty or repetitive filler.
- **SEO impact:** Metadata and visible copy must not be AI-generated or inferred to fill
  the gap; page identity remains the authoritative category name.
- **Performance impact:** No generation or fallback request; absent content collapses.
- **Risks:** Some categories may have less explanatory content until editorial approval.
- **Dependencies:** Content governance and an explicit approved-description source/status.
- **Final approval status:** **Approved**. Never use AI descriptions, lorem ipsum,
  placeholders, or inferred marketing copy.

## Gate and handoff

The Product Owner approved Phase C after resolving D01–D16. The responsive wireframes,
Commerce Spec, component contracts, and validation checklist must implement these
decisions without widening scope. Application implementation remains separately gated.
