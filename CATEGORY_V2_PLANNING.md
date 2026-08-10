# Category V2 Planning

| Field | Value |
|---|---|
| Milestone | 2 — Category V2 |
| Status | Planning draft; no implementation authorized |
| Primary route | `/c/[slug]` |
| Repository baseline | `Minhazsiraji/mycommerce` `main`, Homepage V2 merge `5154799` |
| Predecessor | Homepage V2 released and frozen |
| Next document after approval | Responsive Category wireframes |
| Later logic authority | `CATEGORY_COMMERCE_SPEC.md` (not created in this phase) |

## 1. Authority and scope controls

This plan is governed by, in order:

1. Security, privacy, legal, financial, payment, and inventory correctness.
2. The active Category V2 task and approved scope.
3. `docs/architecture/AGENTSIRAJI_COMMERCE_V2_SAS.md`.
4. `docs/architecture/MASTER_DEVELOPMENT_GUIDE.md`.
5. `docs/design/DESIGN_DESIGN_SYSTEM.md`.
6. `docs/design/COMPONENT_LIBRARY.md`.
7. Approved Category wireframes and `CATEGORY_COMMERCE_SPEC.md` when created.
8. `docs/design/CONTENT_GUIDE.md`.
9. `docs/design/MEDIA_GUIDE.md`.
10. `docs/design/DESIGN_QA_CHECKLIST.md`.
11. Current repository behavior as evidence, not automatic approval of legacy behavior.

Homepage V2 is frozen. Category V2 must preserve the modular-monolith direction
`src/app → src/modules → src/lib`, use Server Components by default, keep catalog
business/data ownership inside the catalog module, and leave protected commerce modules
unchanged unless separately approved.

## 2. Existing Category architecture audit

### 2.1 Route and rendering

- Customer route: `src/app/(shop)/c/[slug]/page.tsx`.
- Route is an async Server Component; there is no page-wide client controller.
- The route parses `searchParams` with the shared Zod `productFiltersSchema`.
- Unknown category slugs call `notFound()`.
- Category identity and description come from the catalog database.
- Direct child categories render as native links.
- Parent category product results include products assigned to the parent and its direct
  children.
- Product results use the shared `ProductGrid`/`ProductCard` components.
- Route loading UI exists in `src/app/(shop)/c/[slug]/loading.tsx`.

### 2.2 Architectural strengths

- Thin route over a module-owned repository and cached read layer.
- Active products only on the public listing.
- Server-rendered native links for sort and pagination.
- Bounded result size (`PAGE_SIZE = 24`).
- Product/card reads are batched; first images are loaded in one page-level query rather
  than one query per card.
- Stable 4:5 product media geometry and transformed storage URLs.
- Catalog mutations invalidate centralized product/category cache tags.

### 2.3 Architectural gaps and decisions deferred

- Category hierarchy traversal is implemented in the route, not a category-tree/domain
  query contract.
- Aggregation assumes the enforced two-level hierarchy and includes only direct children.
- Category listing behavior shares the broad search/admin filter schema, including
  fields Category does not expose (`q`, `categoryId`, `status`, `relevance`).
- Invalid or out-of-range pages have no explicit normalization/redirect/not-found rule.
- Query and count behavior needs production-shaped `EXPLAIN ANALYZE` evidence before new
  facets are added.
- Current cached listing keys rely on framework argument-aware caching; the later
  Commerce Spec must explicitly enumerate every output-changing input.

## 3. Existing filtering architecture

### Current behavior

- The Category page has no customer-visible attribute, price, availability, brand, or
  subcategory filter controls.
- Category scope itself is applied server-side by passing `[category.id, ...childIds]`
  into `getCachedActiveProducts`.
- The shared validator recognizes `q`, `categoryId`, `status`, `sort`, and `page`, but
  only `sort` and `page` are intentionally represented by the Category UI.
- Search has a category filter by UUID; this is separate from Category page navigation.
- Variant options exist as JSON on variants, but there is no approved facet model,
  normalized attribute vocabulary, facet count query, or availability definition.

### Planning conclusion

Filtering is a new commerce-logic capability, not a styling task. Phase D must decide
the authoritative facet sources, allowed combinations, count semantics, unavailable
option behavior, URL keys, normalization, analytics, performance limits, and whether
the first release should deliberately ship a smaller filter set.

## 4. Existing sorting architecture

- Supported repository values: `newest`, `price-asc`, `price-desc`, and `relevance`.
- Category exposes only newest and the two price sorts.
- Default sort is `newest`; the default is omitted from the generated URL.
- Changing sort resets `page` to `1`.
- Price sort uses the minimum non-archived variant price (`fromPrice`).
- Relevance falls back to newest without a query and is not appropriate for Category V2
  unless a future within-category search is explicitly approved.
- No merchandising/manual position, popularity, discount, rating, or availability sort
  exists; none may be invented during implementation.

## 5. Existing pagination architecture

- Offset pagination with 24 products per page.
- Total uses `countDistinct(products.id)`; last page is calculated server-side.
- Current UI provides Previous/Next links and “Page X of Y.”
- Sort and non-default page state are serialized into query parameters.
- Single-page pagination is omitted.
- No numbered-page component, first/last links, rel policy, invalid-page recovery,
  focus-on-results behavior, or shared URL serialization contract exists.
- The approved architecture says cursor pagination should replace offsets only when
  measured scale or query evidence justifies it.

## 6. Existing URL strategy

### Stable paths

- Category: `/c/[slug]`.
- Product: `/p/[slug]`.
- Existing route identities should remain stable unless evidence requires migration.

### Current Category query state

- `sort=newest` is canonicalized by omission in links.
- `page=1` is canonicalized by omission in links.
- Non-default examples: `/c/footwear?sort=price-asc&page=2`.
- Zod rejects unsupported sort values and pages below 1.

### Missing policy

The later Commerce Spec must define parameter order, unknown-parameter handling,
duplicate parameters, invalid values, out-of-range pages, filter reset rules, canonical
targets, index/noindex policy for sort/filter/page combinations, redirects after slug
changes, and Back/Forward restoration.

## 7. Existing breadcrumb implementation

- Category page currently renders no breadcrumb.
- Product page has an inline text breadcrumb for Home and the product's assigned
  category, but there is no reusable component.
- The Component Library defines a future server-rendered Breadcrumb contract using a
  labelled `<nav>`, ordered list, native ancestor links, and a non-linked current item.
- Category depth is capped at two levels, so expected visible paths are:
  Home → Parent Category, or Home → Parent Category → Child Category.
- Breadcrumb JSON-LD does not exist. Visible hierarchy and structured data must match.

## 8. Existing SEO implementation

### Present

- Category metadata uses the authoritative category name and optional description.
- Root metadata supplies the SirajiBD title template and production metadata base.
- Production indexing is fail-closed and enabled only when `VERCEL_ENV=production`.
- Preview/development remain `noindex, nofollow` and preview protection adds crawler
  blocking.
- `robots.ts` and `sitemap.ts` are environment-aware.
- Production sitemap includes all category slugs and active product slugs.

### Gaps requiring specification

- Category canonical URL is not explicitly route-specific.
- No Open Graph/Twitter override for Category identity or approved Category media.
- No BreadcrumbList structured data.
- No explicit canonical/indexing policy for pagination, sort, and future filters.
- Sitemap category inclusion does not currently distinguish empty categories or another
  publishability rule beyond existence.
- Category description may be absent; a metadata fallback policy is not defined.
- Slug rename redirect/retirement policy is not implemented.

No SEO copy, schema claim, share image, or index rule may be invented during coding.

## 9. Existing component inventory

| Component/pattern | Current state | Category V2 planning implication |
|---|---|---|
| Storefront shell | Released in Homepage V2 | Reuse unchanged unless a Category-specific defect is approved. |
| `ProductCard` | Reusable Server Component | Preserve authoritative title, image, price, stock state, and product link contract. |
| `ProductGrid` | Reusable semantic `ul/li` Server Component | Reuse; review listing-specific priority count and grid behavior. |
| `CategoryCard` | Released Homepage component | May support visual discovery, but not automatically the subcategory-navigation pattern. |
| Sort controls | Inline Category links | Needs an approved Category contract; do not create a generic mega-control prematurely. |
| Pagination | Inline Previous/Next links | Future shared contract exists in Component Library; wireframe and URL policy required first. |
| Breadcrumb | No reusable implementation | Future shared server component contract exists; Category supplies truthful hierarchy. |
| Loading shell | Route-local skeleton | Geometry currently uses square media and does not match the released 4:5 ProductCard. |
| Empty state | Inline dashed paragraph | Needs distinct empty-category and filtered-no-result recovery contracts. |
| Filter controls | None on Category | Requires Commerce Spec and responsive wireframes before component contracts. |
| Product count | Inline server total | Authoritative for the current query; future facet/count wording needs a contract. |

Wishlist controls, quick add, ratings, “best seller,” “low stock,” recommendation labels,
and AI affordances are not approved Category components.

## 10. Existing repository data flow

1. `app/(shop)/c/[slug]/page.tsx` receives slug and URL search parameters.
2. `productFiltersSchema` validates/defaults the query state.
3. `getCachedCategoryBySlug` resolves Category identity through the tagged catalog cache.
4. `getCachedCategories` returns the ordered category list and the route derives direct
   children.
5. `getCachedActiveProducts` receives validated filters plus scoped Category IDs.
6. `repository.listActiveProducts` applies active status, category scope, sort, limit,
   and offset; variants are aggregated for minimum price and total stock.
7. The repository executes the result and total-count queries together, then performs
   one batched first-image query.
8. The route maps database results to the `ProductCardData` presentation contract.
9. `ProductGrid`/`ProductCard` render server HTML; image URLs come through the storage
   abstraction.
10. Successful catalog mutations update centralized cache tags after commit.

## 11. Existing performance strategy

- Server Components by default; Category currently adds no client JavaScript.
- Tagged public catalog caches use `cacheLife('max')` with mutation invalidation.
- Database reads use retry protection for prerender/deployment resilience.
- Public lists are capped and paginated.
- Product images use stable 4:5 geometry, responsive `sizes`, CDN transformation, and
  lazy loading below the priority set.
- Product rows and counts run in parallel; first images are batched.
- Database indexes support product status/category, category parent/position, product
  variant lookup, and product image order.

Risks to validate later:

- Four Category product images are currently marked priority by default even when text,
  controls, or another image is the actual LCP candidate.
- Category loading skeleton uses square images and different grid breakpoints, creating
  possible layout shift against 4:5 cards.
- Every listing uses a count query; facet counts could multiply query cost.
- Offset pagination cost must be measured at projected catalog depth.
- Parent/child discovery loads the full category list, acceptable for current scale but
  still subject to production-shaped measurement.
- No Category-specific RUM, slow-query evidence, or enforced bundle/Lighthouse CI exists.

## 12. Business goals

- Convert Homepage category interest into confident product exploration.
- Help customers reach relevant product detail pages with fewer dead ends.
- Make SirajiBD feel clear, trustworthy, fast, and familiar to Bangladesh shoppers.
- Establish reusable, governed collection patterns for later Product Listing and Search
  milestones.
- Preserve truthful catalog, price, inventory, media, and category data.
- Create measurement points for discovery improvement without dark patterns or PII.

## 13. UX goals

- Confirm location and category hierarchy immediately.
- Make subcategory choice, product count, filters, sort, and result state understandable.
- Preserve selected state in the URL and across refresh, sharing, Back, and Forward.
- Keep core discovery usable without hover, animation, client-only rendering, or AI.
- Adapt deliberately across mobile, tablet, desktop, zoom, reduced height, touch, and
  keyboard input.
- Provide one clear recovery from empty category, filtered zero result, invalid page,
  missing media, and unavailable category states.
- Keep product identity, media, title, price, and availability more prominent than visual
  decoration.

## 14. Functional requirements

The approved implementation must eventually:

1. Resolve only valid public Category slugs and render an intentional not-found state.
2. Render truthful category name, optional approved description, and real hierarchy.
3. Support the approved two-level hierarchy and define parent/child result inclusion.
4. Render active products only, using authoritative price, stock, brand, and media data.
5. Show an authoritative result count for the active query state.
6. Provide approved URL-backed sort choices and reset pagination when required.
7. Provide only filters approved in `CATEGORY_COMMERCE_SPEC.md`.
8. Preserve approved state across pagination and generate deterministic native links.
9. Define behavior for first, middle, last, invalid, and out-of-range pages.
10. Render distinct unfiltered-empty and filtered-no-result states with real recovery.
11. Provide visible, semantic breadcrumbs matching structured breadcrumb data.
12. Emit unique truthful metadata, canonical URL, crawler policy, and sitemap behavior.
13. Render matched loading geometry and a safe route error recovery.
14. Work without Wishlist or AI; future integration seams must not distort the initial UI.
15. Keep customer-facing recovery routes away from admin.

Exact filter fields, query keys, canonical rules, indexing policy, counts, and pagination
behavior are intentionally deferred to `CATEGORY_COMMERCE_SPEC.md`.

## 15. Non-functional requirements

### Architecture and correctness

- Preserve `app → modules → lib` dependency direction and module ownership.
- Server Components remain default; client islands require genuine browser interaction.
- No changes to cart, checkout, payment, inventory, orders, auth/account, admin workflows,
  schemas, migrations, money utilities, or storage abstraction without separate approval.
- Cache keys include every output-changing input; invalidation occurs after successful
  catalog mutation.
- No N+1 data access, per-card fetch, or unbounded public query.

### Accessibility and responsive quality

- WCAG 2.2 AA target with semantic headings, landmarks, native controls, labelled navs,
  visible focus, logical order, and no color-only state.
- Test at 320, 375/390, 430, 768, 1024, 1280/1440, and 1920 CSS pixels.
- Pass 200% zoom, 400% reflow, reduced motion, forced colors, touch, keyboard, and
  representative screen-reader review.
- No page-level horizontal scroll at 320 px; required actions meet practical 44 px touch
  targets.

### Performance

- LCP p75 mobile target ≤2.0 s; launch maximum 2.5 s.
- INP p75 target ≤150 ms; maximum 200 ms.
- CLS p75 target ≤0.05; maximum 0.10; image shift expected zero.
- Cached public TTFB target ≤300 ms; maximum 500 ms.
- Initial JS target ≤120 KB gzip; any excess needs a documented exception.
- Production-shaped query plans and representative catalog data are required before
  accepting expanded filters/facets.

### SEO, content, and media

- Production Category pages may be indexable; preview/development remain blocked.
- Canonical and index rules must prevent uncontrolled filter/sort/page duplication.
- Metadata and visible copy use authoritative category terms and approved SirajiBD voice.
- Category media is optional; missing media uses the approved fallback.
- Product media remains exact, rights-cleared, optimized, and never substituted with
  another product.
- No fabricated ratings, urgency, popularity, delivery, discounts, stock claims, or
  structured data.

## 16. Success metrics and measurement readiness

### Release quality metrics

- Zero open Critical defects.
- Zero open Major defects unless explicitly time-bounded and approved where policy allows.
- Required lint, typecheck, tests, production build, security/dependency, responsive,
  accessibility, SEO, and Lighthouse gates pass.
- No regression below the approved Homepage/storefront baseline without an exception.

### Product metrics after analytics approval

- Category view → product-detail click-through rate.
- Subcategory selection rate.
- Filter adoption and clear-filter recovery rate.
- Sort usage by option.
- Filtered zero-result rate.
- Pagination depth and abandonment.
- Category not-found and out-of-range-page frequency.
- Performance and error rate by route/device class.

Metrics must exclude raw search text and personal data unless a later privacy-approved
analytics specification explicitly allows them. No target number is fabricated before a
baseline is collected and the Product Owner approves the target.

## 17. Implementation scope

### In scope after all preceding planning gates are approved

- `/c/[slug]` Category experience only.
- Category hierarchy/orientation, approved filters, sorting, count, pagination, states,
  metadata, breadcrumb structured data, and required Category-owned/shared components.
- Focused catalog read/validator/cache changes strictly required by the approved Commerce
  Spec.
- Tests and validation evidence for the changed risks.

### Out of scope

- Homepage V2 enhancement, Product Listing milestone beyond the Category route, Product
  Detail V2, Search V2, Cart, Checkout, Customer Dashboard, Admin Dashboard, and AI
  Commerce.
- Wishlist, recommendations, personalization, ratings/reviews, quick add, promotional
  badges, campaigns, or new policy pages.
- Architecture rewrites, microservices, headless CMS, or new UI kits.
- Deeper taxonomy, new product attribute data model, or database migration unless the
  Commerce Spec proves it necessary and the change receives separate approval.

## 18. Risks and mitigations

| Risk | Impact | Planning response |
|---|---|---|
| Facets lack normalized authoritative data | Wrong/empty filters and expensive queries | Define sources and minimum viable filters in Commerce Spec; omit unsupported facets. |
| URL combinations create duplicate indexable pages | SEO index bloat | Approve canonical/noindex/parameter rules before implementation. |
| Count/facet queries regress performance | Slow browsing and database load | Require production-shaped query plans, bounded filters, indexes from evidence. |
| Parent/child semantics are unclear | Wrong product counts and navigation | Fix two-level inclusion rules in Commerce Spec and acceptance tests. |
| Offset page becomes empty after catalog changes | Dead-end UX | Define out-of-range recovery and canonical behavior. |
| Filter UI becomes a large client app | Bundle/INP regression | Native GET/navigation first; smallest possible client boundary for an approved drawer. |
| Mobile filter drawer harms focus/scroll | Major accessibility defect | Wireframe focus lifecycle and validate keyboard, touch, zoom, and restoration. |
| Product truth drifts across card/detail/cart | Critical commerce inconsistency | Reuse catalog DTOs and authoritative server data; do not infer facts in UI. |
| Missing/unapproved category media blocks design | Schedule or deceptive placeholder risk | Design a complete text/CSS fallback; media remains optional. |
| Category scope expands into Search/Wishlist/AI | Milestone delay and unstable contracts | Enforce Feature Charter and separate later milestones. |
| Homepage shared-component edits regress release | Production regression | Homepage remains frozen; require explicit regression evidence and approval. |

## 19. Dependencies

### Required before UX wireframes

- Product Owner approval of this Feature Charter and planning document.
- Confirmation of Category V2 business priority and initial measurement goals.
- Current taxonomy/content audit: parent categories, child categories, descriptions,
  product assignment, empty categories, and slug stability.
- Current product attribute audit: brands, prices, variant options, stock states, and
  whether each candidate facet is complete enough to expose.

### Required before component contracts

- Approved desktop, tablet, and mobile wireframes.
- Approved `CATEGORY_COMMERCE_SPEC.md` covering filtering, sorting, pagination,
  breadcrumbs, URL/SEO rules, states, counts, hierarchy, and future facets.

### Required before implementation

- Category-only component contracts.
- Route-specific validation checklist and severity definitions.
- Approved content and media render-or-fallback decisions.
- Deterministic, privacy-safe representative test data.
- Exact branch/base commit and rollback boundary.

## 20. Acceptance criteria for this planning phase

This Research/Planning phase passes when:

- Existing Category route, filter, sort, pagination, URL, breadcrumb, SEO, component,
  data-flow, and performance behavior are documented from repository evidence.
- Business goals, UX goals, functional and non-functional requirements, success metrics,
  scope, risks, dependencies, and implementation acceptance gates are explicit.
- Existing behavior is clearly separated from proposed/undecided behavior.
- No unsupported facet, metric target, category copy, media, schema, component, or route
  has been invented.
- Homepage V2 and protected commerce modules remain outside scope.
- `CATEGORY_COMMERCE_SPEC.md`, wireframes, component contracts, validation checklist,
  implementation, commits, and releases have not begun.
- Product Owner approves or revises this plan before Phase C UX starts.

## 21. Future implementation acceptance gate

Implementation will not be accepted until it proves all later approved requirements,
including:

- Correct hierarchy and active-product inclusion with deterministic counts.
- URL state preservation and normalization for every approved filter/sort/page case.
- Explicit empty, filtered-no-result, invalid-page, loading, error, and not-found behavior.
- Visible breadcrumb and JSON-LD parity.
- Canonical/index/sitemap rules without preview exposure or index bloat.
- Responsive, keyboard, screen-reader, zoom/reflow, contrast, theme, and reduced-motion
  evidence.
- Production-shaped query, cache, bundle, image, Core Web Vitals, and Lighthouse evidence.
- Passing lint, typecheck, full tests, production build, affected integration/e2e/axe,
  security/dependency review, and Design QA Checklist.
- No Critical defect, no unapproved Major defect, exact approved scope, and explicit
  Product Owner release authorization.

## 22. Planning decision log

| Decision | Status |
|---|---|
| Homepage V2 remains frozen | Approved |
| Category V2 is Milestone 2 | Approved |
| Category planning precedes wireframes and code | Approved |
| One-page Feature Charter required for every milestone | Approved |
| Two-level category hierarchy remains the current architecture boundary | Existing approved invariant |
| Native/server-first URL navigation remains baseline | Existing approved direction |
| Exact facets, URL/SEO rules, counts, and invalid-page behavior | Deferred to Commerce Spec |
| Desktop/tablet/mobile composition | Deferred to UX wireframes |
| Category component APIs | Deferred to Component Contracts |
| Category implementation | Not authorized |
