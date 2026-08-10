# Category V2 — Mobile Wireframe

| Field | Value |
|---|---|
| Status | Phase C planning; Product Owner review required |
| Viewport | 320–767 CSS px; primary checks at 375/390/430 px |
| Route | `/c/[slug]` |

## 1. Experience intent

Mobile is a vertical discovery flow optimized for short shopping sessions and mixed
networks. The scan path is top-to-bottom; no desktop sidebar is squeezed into the page.
Product identity and price dominate, while filter/sort controls sit in the natural thumb
zone near the start of results.

## 2. Layout specification

1. Released compact header.
2. Horizontally contained breadcrumb; wrap rather than page-scroll.
3. H1, then approved description only when present.
4. Subcategory links in a wrapping list; no unlabeled horizontal-only carousel.
5. Count line followed by equal-priority Filter and Sort triggers.
6. Active-filter summary, wrapping without truncating meaning.
7. Two-column product grid at supported widths; one column only where content/zoom needs
   it. Maintain 4:5 media and avoid tiny text/actions.
8. Pagination and footer.

## 3. Thumb-zone analysis and CTA hierarchy

- Filter/Sort triggers are full or half-row 44 px controls in the central/easy thumb zone.
- The filter sheet opens from the bottom or side according to the shared Drawer contract;
  primary “Show N products” action remains above safe-area insets.
- Product cards are the primary CTA. Filter application is secondary, subcategories and
  sort tertiary, pagination next, and clear/reset is recovery.
- No floating control obscures product content, browser chrome, or assistive zoom.

## 4. User journey and decision points

Scan: breadcrumb → H1 → subcategory → count/controls → active filters → first products.
The customer decides: refine, reorder, open product, remove a constraint, or move page.
Back/Forward must restore URL-backed state and scroll naturally; the page must not require
a client-only state store to reconstruct selections.

Expected scroll: first product row should appear early after identity/controls. Category
description is concise and never generated. Filter sheet content may scroll internally,
but its header and final action remain understandable and reachable.

## 5. Filter and sort behavior

- Filter sheet contains only Price; reliable In Stock; fully verified Brand; applicable
  Subcategory. Missing evidence removes the facet and its gap.
- Each group has an explicit label; selection never relies on color alone.
- Draft changes apply only through “Show N products”; Cancel/close preserves current URL.
- Individual active filters and Clear all use normalized native-navigation targets.
- Sort exposes Newest, Price low to high, and Price high to low. Newest is the omitted
  default. Sort applies immediately and resets page.

## 6. Pagination

Use Previous/Next with a concise “Page X of Y” status; numbered pages may be omitted at
the narrowest widths. Targets remain 44 px and state-preserving. `page=1` is omitted;
invalid values normalize to base and out-of-range values redirect to the last valid page.

## 7. State wireframes

| State | Mobile treatment |
|---|---|
| Normal | Count, controls, active selections, 1–2-column grid, pagination |
| Empty category | H1 and truthful message; parent/category recovery; no filter/sort |
| Zero result | Preserve filters; show zero; individual removal + Clear all; no auto-relax |
| Loading | Stable header/control/grid skeleton; exact 4:5 geometry; concise announcement |
| Error | Results-region error, Retry, safe browse path; preserve shell and safe state |
| Offline/navigation failure | Browser-native resilience plus actionable Retry; never claim refreshed inventory |

## 8. Accessibility and focus order

- Focus: header → breadcrumb → H1 region → subcategories → count → Filter → Sort → active
  filters → product links → pagination → footer.
- Named banner/navigation/main/results/pagination/contentinfo landmarks; exactly one H1.
- Filter sheet is a correctly labelled modal with focus containment/return and inert
  background. Native controls preferred; no swipe-only dismissal.
- Support screen readers, keyboard, switch access, 200% zoom, 400% reflow, forced colors,
  reduced motion, and 320 px without horizontal page scroll.
- Result changes use polite announcements; errors use alerts only when immediate.

## 9. SEO and component mapping

Device width never changes metadata. The route owns H1, metadata, canonical, robots, and
matching BreadcrumbList; catalog owns facts. Same shared contracts as Tablet apply, with
mobile presentation variants only. No mobile-only copy, canonical, or indexing behavior.

## 10. Responsive handoff

At 768 px the same toolbar and sheet model expands to Tablet. At 1280 px the filter sheet
becomes the Desktop rail. Component identity, URL serialization, semantics, and state
rules remain constant across transitions.
