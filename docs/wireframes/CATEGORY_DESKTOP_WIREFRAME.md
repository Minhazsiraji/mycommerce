# Category V2 — Desktop Wireframe

| Field | Value |
|---|---|
| Status | Phase C planning; Product Owner review required |
| Viewport | 1280–1920 CSS px; primary composition at 1440 px |
| Route | `/c/[slug]` |
| Authority | Approved Category Charter, Planning, and D01–D16 |

## 1. Experience intent

Desktop uses an F-pattern: orientation and category identity across the top, persistent
filters down the left, and scan-friendly results across the main column. Product facts
remain visually dominant. The page has no quick-add, wishlist, AI, ratings, invented
badges, or promotional interruption.

## 2. Layout specification

1. Reuse the released storefront header unchanged.
2. Main container follows the approved desktop max-width and gutters.
3. Breadcrumb appears first: Home → optional parent → current category.
4. Header row contains one H1, optional approved description, and applicable direct
   subcategory links. Missing description collapses completely.
5. Results toolbar contains truthful range/count at left and Sort at right.
6. Content uses a two-column layout: 240–280 px filter rail and flexible product region.
7. Product region uses the existing 4:5 ProductGrid geometry; target four cards at common
   desktop widths, adapting only through approved grid breakpoints.
8. Pagination follows the grid and stays inside the results column.

## 3. Structural wireframe

| Order | Region | Contents and behavior |
|---:|---|---|
| 1 | Store header | Released navigation/search/cart shell |
| 2 | Breadcrumb nav | Ancestor links; current category is text |
| 3 | Category header | H1; approved description only; subcategories when applicable |
| 4 | Results toolbar | “Showing X–Y of N products”; Sort control |
| 5A | Filter complementary region | Price; evidence-gated Availability/Brand; applicable Subcategory; Clear all |
| 5B | Results main region | Active-filter summary, product grid, state replacement |
| 6 | Pagination nav | Previous, bounded page choices, Next; state-preserving URLs |
| 7 | Store footer | Released footer |

## 4. User journey, scan path, and decisions

Expected scan: breadcrumb → H1/description → subcategory options → count/sort → filter
rail → first product row → pagination. Primary conversion hotspot is the first visible
product row; secondary hotspots are subcategory selection and high-utility filters.

Decision points:

1. Continue within this category or select a direct subcategory.
2. Narrow results using only authoritative facets.
3. Change ordering from default Newest to either price order.
4. Open a product detail page—the page's dominant CTA.
5. Continue through pagination or recover from a non-success state.

Scroll expectation: category identity and controls appear before products; at least the
top of the first product row should be visible at common 1440×900 conditions. Filters
may remain in normal flow; sticky behavior is not required and must not hide footer or
keyboard content if later approved.

## 5. CTA hierarchy

1. Product-card link (primary commerce action).
2. Apply/change filter or subcategory (secondary discovery action).
3. Sort and pagination (tertiary organization/navigation).
4. Clear individual/all filters (recovery action; visually clear, not dominant).

## 6. Commerce behavior

- Default sort is Newest and omitted from the URL; sort changes reset page to 1.
- Filters are Price, reliable In Stock only, verified Brand only, and applicable
  Subcategory only. Unsupported facets do not render.
- Filter changes update normalized, shareable URLs and reset pagination.
- Parent results include parent + direct-child products under the two-level taxonomy.
- Pagination uses 24 products, omits page 1, preserves valid state, and follows D09/D10.
- Active filters remain visible above results and support individual removal and Clear all.

## 7. State wireframes

| State | Replacement and recovery |
|---|---|
| Normal | Toolbar, filters, product grid, applicable pagination |
| Empty category | Keep breadcrumb/H1; no filters/grid; truthful empty message; link to parent or category browsing; no invented products |
| Filtered zero result | Preserve controls and selections; show zero; offer individual removal and Clear all; never auto-relax |
| Loading | Match final breadcrumb/header/toolbar, rail, four-column grid, and 4:5 card geometry; announce loading without trapping focus |
| Error | Keep shell and category identity when safe; concise error heading/message; Retry and safe browse link; no technical detail |
| Invalid page | Server normalization/redirect; never present as an empty grid |

## 8. Accessibility and input model

- Landmarks: banner, breadcrumb navigation, main, complementary labelled “Filters,”
  results region, pagination navigation, contentinfo.
- Keyboard/focus order follows visual order; filter groups use native fieldsets/legends or
  equivalent labelled groups. No focusable hidden controls.
- On navigation, focus remains predictable; a filter-driven navigation may place focus on
  the results heading only when implemented without surprising Back/Forward behavior.
- Visible focus, text contrast, 44 px practical targets, semantic H1/H2 hierarchy, native
  links/forms, and status announcements are mandatory.
- Results count changes use a polite status message; errors use an appropriate alert.

## 9. SEO ownership

- Route owns the one H1, route metadata assembly, canonical, and robots directive.
- Catalog owns authoritative category identity/description and results/count facts.
- Shared Breadcrumb renders visible semantics; route emits matching BreadcrumbList JSON-LD.
- Base and valid page >1 self-canonical; sort canonicalizes to base; filtered variants
  are `noindex, follow`. Preview/development remain `noindex, nofollow`.

## 10. Component mapping

| Region | Contract direction |
|---|---|
| Breadcrumb | New shared server component |
| Category header | Category-owned server composition |
| Subcategory nav | Category-owned native-link list |
| Filter rail | Category filter composition; smallest possible client enhancement only |
| Sort | Native URL-backed control/link contract |
| Count | Server-owned result summary |
| Products | Existing ProductGrid/ProductCard extended only as approved |
| Pagination | New shared server navigation contract |
| States | Shared primitives composed by Category route |

## 11. Responsive handoff

At tablet widths the rail becomes a disclosure/drawer control. Desktop content order and
URL state remain identical; no capability disappears. At zoom/reflow thresholds, switch
to the tablet/mobile composition before horizontal page scrolling occurs.
