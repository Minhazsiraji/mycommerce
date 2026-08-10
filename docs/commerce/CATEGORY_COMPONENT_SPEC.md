# Category V2 Component Contracts

| Field | Value |
|---|---|
| Status | Planning complete; approval required before implementation |
| Principle | Server Components by default; smallest interactive client islands |
| Scope | Category-owned and required shared components only |

## 1. Contract rules

- Components receive authoritative display-ready data and never infer brand, inventory,
  price, ranking, claims, SEO copy, or analytics consent.
- Native links/forms remain the baseline. Client enhancement may manage a reversible filter
  draft or modal focus; the URL/server remains truth.
- Optional absent data returns `null` without a placeholder, heading, or layout gap.
- Shared primitives contain no catalog logic; catalog-aware components remain in the
  catalog module. No second UI kit or new global state store.

## 2. Component map

| Component | Ownership/boundary | Required contract |
|---|---|---|
| `CategoryBreadcrumb` | Shared, Server | Ordered `{label, href?}`; labelled nav; current item non-link; JSON-LD stays route-owned |
| `CategoryHeader` | Catalog, Server | Name, optional approved description, child links; exactly one page H1 |
| `SubcategoryNav` | Catalog, Server | Real direct children, active/current semantics, native links |
| `CategoryToolbar` | Catalog composition, Server | Result summary, filter trigger slot, sort slot; no commerce calculation |
| `CategoryFilterRail` | Catalog, Server-first | Approved facet models and normalized action targets; desktop presentation |
| `CategoryFilterTrigger` | Catalog/shared primitive | Accessible name includes selected count when nonzero; opens sheet only |
| `CategoryFilterSheet` | Catalog, Client island | Reversible draft, labelled modal, focus trap/return, Cancel/Clear/Show N; no data fetching authority |
| `FilterGroup` | Catalog, Server/client leaf | ID, label, options/range, selected/disabled state; native controls |
| `ActiveFilterSummary` | Catalog, Server | Human-readable selections and normalized remove/Clear all links |
| `CategorySortControl` | Catalog, Server/native | Closed values newest/price-asc/price-desc; URL target; page reset |
| `CategoryResultSummary` | Catalog, Server | `start`, `end`, `total`; correct zero/singular/plural wording |
| `ProductGrid` | Existing catalog, Server | Reuse semantic list, responsive grid, explicit image-priority ownership |
| `ProductCard` | Existing catalog, Server | Authoritative media/title/price/availability/link; no Category-only fake features |
| `Pagination` | Shared, Server | Current/total pages, normalized Previous/Next/page targets, labelled nav, disabled semantics |
| `CategoryLoadingState` | Route/shared primitives | Responsive rail/toolbar/grid geometry, 4:5 cards, status announcement |
| `CategoryEmptyState` | Catalog, Server | Approved heading/message and real recovery links; no filters/products |
| `CategoryZeroState` | Catalog, Server | Preserved selections, removal/Clear all actions; no silent relaxation |
| `CategoryErrorState` | Route/shared | Safe message, Retry where meaningful, safe browse link, focus target |

## 3. Conceptual data contracts

```ts
type CategoryIdentity = {
  id: string
  slug: string
  name: string
  approvedDescription?: string
  parent?: { slug: string; name: string }
}

type FacetOption = {
  key: string
  label: string
  count: number
  isSelected: boolean
  isDisabled: boolean
  href: string
}

type CategoryFilterModel =
  | { type: 'price'; min?: number; max?: number; bounds: { min: number; max: number } }
  | { type: 'availability'; inStock: boolean; count: number }
  | { type: 'brand' | 'subcategory'; options: FacetOption[] }

type CategoryPageModel = {
  category: CategoryIdentity
  children: Array<{ slug: string; name: string }>
  filters: CategoryFilterModel[]
  selectedFilterCount: number
  sort: 'newest' | 'price-asc' | 'price-desc'
  range: { start: number; end: number; total: number }
  page: number
  totalPages: number
  products: ProductCardData[]
}
```

Types are conceptual and must be reconciled with the repository before coding. Money
continues to use the established integer/type utilities, not untyped floating values.

## 4. Interaction contracts

- Desktop filter links/forms navigate immediately unless the approved implementation uses
  a bounded Apply model consistently; Tablet/Mobile sheet stages changes and applies once.
- Sort applies immediately, preserves filters, resets page, and uses normalized navigation.
- Sheet close/cancel does not mutate the current state. Apply/clear navigation succeeds
  without optimistic claims; pending indication does not replace the accessible name.
- Pagination preserves valid filter/sort state. Disabled Previous/Next are not links.
- Navigation and state recovery work without hover and remain understandable without
  animation. Reduced motion removes nonessential transitions.

## 5. Accessibility contracts

- DOM order equals reading/focus order. Exactly one H1; filter groups have names; results
  and pagination are labelled; selected state is programmatic and not color-only.
- Drawer/sheet: `dialog` semantics where appropriate, accessible title, initial meaningful
  focus, containment, Escape/close, background inertness, and trigger focus return.
- All targets meet practical 44 px sizing; focus is visible in normal/forced colors.
- Result-count changes are polite; immediate errors are alerts. Do not reannounce the full
  grid or move focus unexpectedly after browser Back/Forward.

## 6. Responsive and visual contracts

- Desktop ≥1280: filter rail + flexible results. Tablet 768–1279: sheet + 2–3 columns.
  Mobile <768: sheet + 1–2 columns. Reflow/available space overrides nominal device labels.
- Product media is always 4:5; skeletons match cards and breakpoints. No page horizontal
  scrolling at 320 px or 400% reflow.
- Components consume DDS tokens. Glass is restrained and must not reduce product/control
  clarity. No local visual system or arbitrary styling API.

## 7. SEO, analytics, and errors

- Components do not set canonical, robots, metadata, JSON-LD, sitemap, or environment
  policy; route/server metadata owns them.
- Components expose stable non-PII descriptors only after analytics approval. They do not
  import a vendor or transmit raw labels/search text.
- Errors are typed at the boundary. Commerce facts remain last authoritative server facts;
  no component invents availability or products during failure.

## 8. Required tests

Contract/unit tests cover serialization inputs, wording/plurals, supported variants,
disabled states, optional-description collapse, and state selection. Browser tests cover
keyboard order, dialog focus, touch targets, navigation/Back/Forward, zero/empty/error,
responsive reflow, and assistive names. Route integration verifies component models use
the same query, count, canonical, and robots semantics as the Commerce Spec.
