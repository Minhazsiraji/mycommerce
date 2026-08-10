# Category V2 Validation Checklist

| Field | Value |
|---|---|
| Status | Planning complete; mandatory implementation/release gate |
| Results | Pass / Fail / Blocked / N/A with reason; “not tested” is Fail |
| Severity | Critical / Major / Minor per approved Design QA policy |

Every result must record environment, viewport/device, URL/state, evidence link/output,
tester, date, defect ID, and retest result. Zero open Critical; zero open Major unless an
explicit policy-permitted, time-bounded Product Owner exception exists.

## 1. Scope and architecture

- [ ] Only Category V2-approved files/behavior changed; Homepage remains frozen.
- [ ] `app → modules → lib` direction and catalog ownership are preserved.
- [ ] Server Components are default; every client boundary has documented browser need.
- [ ] No schema/dependency/global-state/cart/checkout/payment/auth/admin scope expansion.
- [ ] D01–D16 and all three wireframes trace to tests/implementation.
- [ ] Lint, strict typecheck, unit/integration/browser tests, and production build pass.

## 2. Category truth and hierarchy

- [ ] Unknown/private category returns intentional not found.
- [ ] Parent results/count include parent + direct children and deduplicate products.
- [ ] Leaf category scope is correct; no unapproved descendant behavior.
- [ ] Only active products render with authoritative media/title/price/availability.
- [ ] Approved description renders exactly; absent/unapproved description collapses.
- [ ] No AI/placeholder/inferred copy, fake badge, rating, scarcity, offer, or recommendation.

## 3. Filters and sorting

- [ ] Price semantics use authoritative eligible variant price and inclusive boundaries.
- [ ] Availability renders only after definition/reliability evidence; card/filter agree.
- [ ] Brand renders only after complete verified coverage evidence.
- [ ] Subcategory renders only for applicable direct-child scope.
- [ ] Color, Size, Material, Rating, Discount, Seller, Collection are absent.
- [ ] Facet counts are exact deduplicated product counts; zero/disabled behavior is clear.
- [ ] Default Newest is deterministic and omitted; only two approved price sorts exist.
- [ ] Filter/sort changes reset page; Clear/remove preserve every other valid state.

## 4. URL and browser navigation

- [ ] Only allowlisted keys survive; fixed order, deduplication, empty/default removal pass.
- [ ] Invalid scalar/range/slug values normalize safely without redirect loops.
- [ ] Refresh/share reproduces state; Back/Forward restores controls/results naturally.
- [ ] `page=1` omitted; valid pages preserved; beyond-last redirects to last valid page.
- [ ] First/middle/last/single/empty page cases pass with 24-item page size.
- [ ] Every generated link preserves normalized applicable filter/sort state.

## 5. States and recovery

- [ ] Empty category keeps truthful identity, removes irrelevant controls, and offers real recovery.
- [ ] Filtered zero preserves selections and supports individual removal/Clear all.
- [ ] No zero state silently relaxes, redirects, or fabricates alternative products.
- [ ] Loading skeleton matches final responsive grid and exact 4:5 geometry; CLS is bounded.
- [ ] Error state is safe, actionable, nontechnical, focusable, and preserves safe context.
- [ ] Offline/navigation/data failures never claim refreshed stock or price.

## 6. Responsive and visual QA

- [ ] Test 320, 375/390, 430, 768, 1024, 1280/1440, and 1920 CSS px.
- [ ] Portrait/landscape, reduced height, touch and pointer layouts pass.
- [ ] Desktop rail, Tablet sheet, and Mobile sheet transition without lost capability/state.
- [ ] Product grid/card, toolbar, active filters, pagination, and all states match wireframes.
- [ ] 200% zoom and 400% reflow produce no page-level horizontal scroll or overlap.
- [ ] Light/dark, forced colors, reduced motion, long labels, large counts, and missing media pass.
- [ ] DDS tokens only; product facts/actions remain clearer than decoration.

## 7. Accessibility

- [ ] Exactly one H1; heading outline and landmarks are logical and named.
- [ ] Breadcrumb, filters, results, and pagination have correct semantic labels.
- [ ] Complete keyboard order matches visual order; all functions work without pointer/hover.
- [ ] Filter sheet has accessible title, initial focus, trap, Escape/close, inert background,
      and focus return; close never silently applies.
- [ ] Visible focus, 44 px targets, spacing, contrast, and color-independent state pass.
- [ ] Screen-reader names/roles/values/selections/count announcements and errors pass.
- [ ] NVDA/Chrome or Firefox plus VoiceOver/Safari representative flows are recorded.
- [ ] Automated accessibility scan has no serious/critical violations; manual testing passes.

## 8. SEO, content, and structured data

- [ ] One truthful H1; title/description/canonical/robots render server-side.
- [ ] Eligible base self-canonical/indexable; valid unfiltered page >1 self-canonical/indexable.
- [ ] Sort canonicalizes to base and is noindex; every filter variant is `noindex, follow`.
- [ ] Preview/development remain `noindex, nofollow`; headers/meta/robots do not conflict.
- [ ] Empty categories are noindex and excluded from production sitemap.
- [ ] Sitemap contains eligible base categories only; query variants/pagination excluded.
- [ ] Visible breadcrumb exactly matches valid BreadcrumbList JSON-LD.
- [ ] No unapproved schema, metadata claim, OG image, or generated description.

## 9. Cache, data, and performance

- [ ] Cache key test proves every output-changing input is included.
- [ ] Catalog mutations invalidate listing/count/facet/availability reads after commit.
- [ ] No per-card/per-option/N+1 queries; list/count/facet work is bounded and batched.
- [ ] Production-shaped query plans recorded for base, parent, worst filters, facets, price
      sorts, and deepest supported page; indexes and row estimates reviewed.
- [ ] Cached TTFB p75 ≤300 ms target/500 ms maximum on representative environment.
- [ ] Mobile LCP p75 ≤2.0 s target/2.5 s max; INP ≤150/200 ms; CLS ≤0.05/0.10.
- [ ] Initial JavaScript ≤120 KB gzip target or approved measured exception.
- [ ] Product image sizes/priority/CDN transforms are correct; no image layout shift.
- [ ] Lighthouse mobile/desktop and representative throttled tests show no material
      regression from the released storefront baseline.

## 10. Analytics, privacy, and security

- [ ] No Category analytics emits until vendor/privacy/consent approval exists.
- [ ] If enabled, events are stable, deduplicated, non-PII, bounded, non-blocking, and tested.
- [ ] No raw labels/search text/contact data/session replay/sensitive data is transmitted.
- [ ] Query inputs are schema-validated; output is escaped; no unsafe HTML or URL injection.
- [ ] Security headers/CSP, authorization boundaries, dependency audit, and error redaction pass.

## 11. Evidence pack and release decision

- [ ] Requirements-to-evidence matrix completed for D01–D16 and acceptance criteria.
- [ ] Automated outputs, screenshots at required widths/states, screen-reader notes, query
      plans, bundle report, metadata/crawler evidence, and production build are attached.
- [ ] Defects are triaged with severity, owner, fix/retest evidence, and residual risk.
- [ ] Preview is protected and noindex; production release requires explicit approval.
- [ ] Post-deploy health, real canonical/robots/sitemap, 404/error logs, and rollback path pass.
- [ ] Product Owner records final Approve / Approve with exception / Reject decision.
