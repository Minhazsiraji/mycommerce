# Category V2 — Tablet Wireframe

| Field | Value |
|---|---|
| Status | Phase C planning; Product Owner review required |
| Viewport | 768–1279 CSS px; portrait and landscape |
| Route | `/c/[slug]` |

## 1. Experience intent

Tablet preserves the desktop information model but removes the permanent filter rail.
The dominant scan path is top-to-bottom with short Z-patterns across the toolbar and
product rows. Both touch and keyboard/pointer use are first-class.

## 2. Layout and journey

1. Released responsive header.
2. Breadcrumb → H1 → optional approved description → horizontally wrapping subcategories.
3. Toolbar: result count, Filter button with selected-count text, Sort control.
4. Two or three product columns as width permits, always 4:5 media.
5. Pagination below results; released footer.

The user decides whether to select a subcategory, open Filters, change sort, enter a
product, or move pages. Product-card links remain primary. Controls stay visible before
the grid without consuming most of the first viewport.

## 3. Filter behavior

- Filter opens a modal drawer/sheet with a visible title, close control, approved facet
  groups, Clear all, and one dominant “Show N products” action.
- Price, evidence-gated In Stock, evidence-gated Brand, and applicable Subcategory only.
- The draft selection is reversible inside the sheet. Applying serializes the normalized
  URL and resets page; close/cancel does not silently apply changes.
- Focus moves into the sheet, remains contained while modal, returns to the trigger, and
  the background is inert. Escape closes when safe.
- Active filters appear as removable summary controls above results.

## 4. Thumb zones and CTA hierarchy

The Filter and Sort controls sit in the central/easy reach band in portrait. The sheet's
close and apply actions remain reachable without hand stretching; the apply bar may stay
at the sheet bottom if it does not obscure content or safe-area insets.

CTA order: product link → Filter/Show results → subcategory → Sort → pagination → clear.
Touch targets are at least 44×44 CSS px with adequate separation.

## 5. States and commerce behavior

| State | Tablet treatment |
|---|---|
| Normal | Toolbar plus 2–3-column grid and bounded pagination |
| Empty | H1 remains; no filter trigger; recovery to parent/category browsing |
| Zero result | Selected filters visible; clear individual/all; Filter remains usable |
| Loading | Same toolbar and 2–3-column 4:5 grid geometry; no jumping drawer |
| Error | Inline results replacement with Retry and safe browse action |
| Invalid page | Normalized server redirect, never a visual empty state |

Sort/default, pagination, parent/child inclusion, canonical/indexing, and truthful count
rules are identical to Desktop.

## 6. Reading, scan, and scroll assumptions

- Primary scan: breadcrumb → identity → Filter/Sort → first row → successive rows.
- First products should begin within the early scroll; long descriptions are prohibited.
- Subcategory wrapping must not create a visually dominant navigation wall.
- Expected engagement occurs in the first two product rows; pagination is a deliberate
  end-of-result action, not a floating distraction.

## 7. Accessibility

- Landmarks and heading order match Desktop; the modal sheet has an accessible name and
  description where needed.
- DOM/focus order matches visual order in portrait and landscape.
- Do not use hover-only information; support touch, keyboard, stylus, and pointer.
- At 200% zoom and 400% reflow, controls stack without clipping or horizontal page scroll.
- Result updates are politely announced; the sheet never steals focus after navigation.

## 8. SEO and component ownership

SEO output is server-owned and identical for the same URL across device classes. H1 and
visible breadcrumb remain present; route metadata and BreadcrumbList mirror Desktop.
Components reuse Desktop contracts: CategoryHeader, SubcategoryNav, FilterTrigger,
FilterSheet, ActiveFilterSummary, SortControl, ProductGrid, Pagination, and typed states.

## 9. Responsive transitions

At ≥1280 px use the desktop filter rail. Below 768 px use the mobile single-column control
bar and two-column/one-column grid rules. Breakpoints respond to available layout space,
not device labels, and preserve all query state.
