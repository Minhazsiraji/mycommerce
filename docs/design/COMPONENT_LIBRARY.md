# AgentSiraji Commerce V2

## Reusable Component Library Specification

| Field | Value |
|---|---|
| Document owner | Product Owner and Architecture authority |
| Prepared by | Work |
| Status | Draft for Product Owner approval |
| Current version | 1.0.0 |
| Last updated | 2026-08-08 |
| Scope | Reusable UI contracts and implementation planning; no component implementation |
| Repository baseline | Branch `feature/commerce-v2`, commit `643315d` plus approved uncommitted planning documents |

## Version History

| Version | Date | Author | Status | Summary |
|---|---|---|---|---|
| 1.0.0 | 2026-08-08 | Work | Draft for approval | Initial audited UI API specification for Homepage V2 and future reuse |

Stable filenames are normative. Git provides file-level history; material changes update
this table and the semantic version rather than creating duplicate versioned files.

---

# 1. Document Purpose

This document is the official UI API specification for AgentSiraji Commerce V2. It
bridges the approved Design Design System (DDS), responsive Homepage wireframes and the
repository's current React/Next.js implementation. It defines what each reusable
component means, where it belongs, what data it accepts, how it behaves and how it is
verified.

This document does **not** implement components, authorize a page redesign, add a
dependency, create backend behavior or approve business content. A component contract
may be approved while its content or data source remains gated.

## 1.1 Authority order

When requirements conflict, use this order:

1. Approved task prompt and explicit Product Owner decision.
2. Software Architecture Specification (SAS).
3. Master Development Guide (MDG).
4. Design Design System (DDS).
5. Approved Desktop and Mobile Homepage wireframes.
6. This Component Library Specification.
7. Existing implementation, where it does not conflict with the documents above.

This document narrows component behavior; it cannot weaken a protected architecture,
security, payment, inventory, order, accessibility or truth invariant.

## 1.2 Normative language

- **MUST / MUST NOT**: required or prohibited.
- **SHOULD / SHOULD NOT**: expected unless an approved exception records evidence.
- **MAY**: optional within the stated constraint.
- **Gated**: cannot render or become operational until its named evidence and owner
  approval exist.
- **Current**: verified in the audited repository.
- **Target**: approved contract to implement in a later, bounded phase.

## 1.3 Component status vocabulary

Every documented component has exactly one primary status:

| Status | Meaning |
|---|---|
| Existing — Reuse unchanged | Current implementation already meets the approved contract for the named scope |
| Existing — Extend | A real reusable component exists and should retain its identity while gaining bounded variants or behavior |
| Existing — Refactor before reuse | Equivalent behavior exists but ownership, API, accessibility or composition must be corrected before broad reuse |
| New — Required for Homepage V2 | No compliant reusable component exists; Homepage V2 requires it |
| Future — Not part of Homepage V2 | Contract is documented for consistency, but Homepage V2 must not implement it |
| Gated — Requires backend, approved content, or business data | Rendering/operation requires named evidence or capability; absence collapses the region |

An inline pattern is not described as an existing reusable component. Its verified code
is recorded as migration input only.

## 1.4 Audit method and date sensitivity

The audit inspected the repository on 2026-08-08 using source files as the authority for
current behavior. Before implementation, Work MUST re-run the inventory because the
branch may have changed. A status becomes stale when relevant source code, DDS,
wireframe, content or backend capability changes.

---

# 2. Current Repository Audit

## 2.1 Verified shared primitives

| Current file | Export | Boundary | Verified use | Audit outcome |
|---|---|---|---|---|
| `src/components/ui/button.tsx` | `Button` | Server-compatible | Accounts, catalog, orders, payments, shipping | Real primitive; only `primary` and `ghost`, fixed 40 px height, no loading contract |
| `src/components/ui/input.tsx` | `Input` | Client | Forms across modules | Real primitive; label and described error are implemented |
| `src/components/ui/select.tsx` | `Select` | Client | Catalog, checkout | Real primitive; error is not connected with `aria-describedby` |
| `src/components/ui/textarea.tsx` | `Textarea` | Client | Catalog, checkout, orders | Real primitive; error is not connected with `aria-describedby` |
| `src/components/theme-toggle.tsx` | `ThemeToggle` | Client | Shop/admin shells | Real control; 36 px target and local icons need V2 contract alignment |
| `src/components/theme-script.tsx` | `ThemeScript` | Server output | Root layout | Infrastructure helper; not a user-facing library component |

## 2.2 Verified domain components and patterns

| Current file or location | Verified pattern | Audit outcome |
|---|---|---|
| `src/modules/catalog/components/product-card.tsx` | `ProductCard`, `ProductGrid`, `ProductCardData` | Reusable server components; V2 content, token, priority and state APIs are incomplete |
| `src/modules/cart/components/add-to-cart-button.tsx` | `AddToCartButton` | Real client domain component with authoritative server result and inline error |
| `src/modules/cart/components/cart-badge.tsx` | `CartBadge`, stable fallback | Real server domain component streamed in a `Suspense` boundary |
| `src/app/(shop)/layout.tsx` | `TrustBar`, `SiteFooter`, navigation, search and icon functions | Large route-local patterns; none is a reusable exported component |
| `src/modules/catalog/components/product-gallery.tsx` | Dialog-like image zoom | Domain-specific inline modal behavior; not a generic `Modal` primitive |
| Route `loading.tsx` files and search `GridSkeleton` | Skeleton/loading geometry | Repeated route-local patterns; no shared `Skeleton` or `LoadingState` API |
| Homepage and list routes | Empty messages and dashed panels | Repeated page-local patterns; no shared `EmptyState` component |
| Forms across modules | Inline `role=alert` and status text | Repeated error/result patterns; no shared `ErrorState` or toast system |
| Category/search/admin routes | Inline paging links and controls | Existing behavior, but no reusable `Pagination` API |

## 2.3 Verified absences

No compliant reusable implementation currently exists for `IconButton`, `SearchBar`,
`Header`, `DesktopNavigation`, `MobileNavigation`, `Drawer`, `AnnouncementBar`, `Hero`,
`SectionHeader`, `CategoryCard`, `PromotionalBanner`, `TrustCard`, `ReviewCard`,
`BrandStory`, `NewsletterForm`, `Footer`, generic `Badge`, `Breadcrumb`, `Pagination`,
generic `Skeleton`, `LoadingState`, `EmptyState`, `ErrorState`, `Toast`, generic `Modal`,
`ProductImage`, `PriceDisplay` or `AIAssistantCard`.

## 2.4 Architecture findings that control the library

- The repository is a Next.js modular monolith with the enforced direction
  `app -> modules -> lib` and shared UI under `src/components`.
- Server Components are the default. Client boundaries stay at the smallest interactive
  leaf.
- Catalog and shipping public reads use tagged server caching. Cart/account/order data
  is private and dynamic.
- Tailwind CSS v4 consumes CSS custom properties. No second UI kit is present or
  approved.
- Inter is self-hosted through `next/font`.
- The current theme has system, explicit-light and explicit-dark states.
- `cacheComponents` is enabled; uncached request/user data needs a valid dynamic or
  `Suspense` boundary.
- Current unit tests run in a Node environment and do not provide browser component
  coverage. UI implementation therefore requires added browser-level verification in
  its approved phase.

## 2.5 Primary status summary

| Component | Primary status | Homepage V2 disposition |
|---|---|---|
| Button | Existing — Extend | Implement bounded V2 API |
| IconButton | New — Required for Homepage V2 | Required for menu/actions |
| Input | Existing — Extend | Preserve identity and accessibility |
| Textarea | Existing — Extend | No homepage use; align shared API only when touched |
| Select | Existing — Extend | No homepage use; fix described errors when touched |
| SearchBar | Existing — Refactor before reuse | Extract duplicated shell search |
| Header | Existing — Refactor before reuse | Extract current shell and implement wireframe contract |
| DesktopNavigation | Existing — Refactor before reuse | Extract current inline navigation |
| MobileNavigation | Existing — Refactor before reuse | Replace horizontal-only pattern with approved drawer composition |
| Drawer | New — Required for Homepage V2 | Required for compact navigation |
| AnnouncementBar | Gated — Requires backend, approved content, or business data | Render only verified active announcement |
| Hero | New — Required for Homepage V2 | Copy approval is release gate; media may fall back safely |
| SectionHeader | New — Required for Homepage V2 | Shared section orientation pattern |
| ProductCard | Existing — Extend | Preserve server data authority; add V2 presentation contract |
| ProductGrid | Existing — Extend | Correct priority ownership and responsive geometry |
| CategoryCard | New — Required for Homepage V2 | Render only authoritative category/content entries |
| PromotionalBanner | Gated — Requires backend, approved content, or business data | Omit without approved active campaign |
| TrustCard | Gated — Requires backend, approved content, or business data | May consume verified shipping/payment facts only |
| ReviewCard | Gated — Requires backend, approved content, or business data | Deferred until moderated source exists |
| BrandStory | Gated — Requires backend, approved content, or business data | Omit until copy/media approval |
| NewsletterForm | Gated — Requires backend, approved content, or business data | Deferred until consent, privacy, storage and unsubscribe exist |
| Footer | Existing — Refactor before reuse | Extract current route-local footer |
| Badge | New — Required for Homepage V2 | Status/merchandising presentation only; truth supplied externally |
| Breadcrumb | Future — Not part of Homepage V2 | Define for later routes; do not implement now |
| Pagination | Future — Not part of Homepage V2 | Consolidate later page-local behavior |
| Skeleton | Existing — Refactor before reuse | Extract stable tokenized primitives as needed |
| LoadingState | Existing — Refactor before reuse | Compose skeleton/status patterns |
| EmptyState | Existing — Refactor before reuse | Remove customer-facing admin recovery |
| ErrorState | Existing — Refactor before reuse | Add typed severity/recovery and focus behavior |
| Toast | Future — Not part of Homepage V2 | No dependency or global system now |
| Modal | Future — Not part of Homepage V2 | Gallery modal remains domain-owned until separate refactor |
| ProductImage | New — Required for Homepage V2 | Centralize image/fallback/priority rules |
| PriceDisplay | New — Required for Homepage V2 | Centralize BDT and compare-price semantics |
| AddToCartControl | Existing — Extend | Preserve authoritative non-optimistic behavior; no homepage quick-add |
| ThemeToggle | Existing — Extend | Compose IconButton and meet 44 px target |
| AIAssistantCard | Future — Not part of Homepage V2 | No implementation authority |

---

# 3. Global UI API Rules

## 3.1 Public API shape

- Props use named object types; exported types use semantic names.
- Required data is required in TypeScript. Optional data is not converted to empty
  strings or placeholder facts.
- Boolean names start with `is`, `has`, `can` or `should`; event callbacks start with
  `on`; identifiers end in `Id`; accessible labels use `ariaLabel` only when native
  children cannot supply the name.
- Use closed string unions for variants, sizes and placements. Do not expose arbitrary
  styling booleans such as `isBlue`, `roundedMore` or `glass`.
- `className` MAY be accepted by primitives for layout placement, but consumers MUST
  NOT use it to replace semantic variants or bypass DDS tokens.
- Presentational components receive display-ready, authoritative facts. They do not
  calculate discounts, rankings, trust, stock pressure or review validity.
- Prefer composition (`children`, named slots) over a mega-component with dozens of
  unrelated booleans.

## 3.2 Common types

These conceptual types are normative; exact implementation names may vary only with an
approved reason.

```ts
type ComponentSize = 'sm' | 'md' | 'lg'
type AsyncState = 'idle' | 'pending' | 'success' | 'error'
type FeedbackTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
type ResponsiveMode = 'compact' | 'tablet' | 'desktop'
type AnalyticsDescriptor = {
  event: string
  placement: string
  itemId?: string
  position?: number
}
```

Analytics descriptors contain approved non-PII fields only. Components do not import an
analytics provider unless a separately approved analytics phase establishes one.

## 3.3 Controlled and uncontrolled components

- Forms that submit with native navigation MAY be uncontrolled with `defaultValue` and
  `name`.
- Client interactions with live validation, dependent fields or reversible local state
  SHOULD be controlled with `value` and `onChange`.
- A component MUST NOT switch between controlled and uncontrolled during its lifetime.
- If both modes are supported, use mutually exclusive TypeScript unions.
- Server-owned truth is refreshed after successful mutation; local state never becomes
  authority for cart, stock, price, payment, order or inventory.

## 3.4 Shared primitive rules

- Use native elements before ARIA recreation.
- Shared primitives live in `src/components/ui/` and contain no commerce-domain logic.
- Cross-page presentational patterns live in `src/components/storefront/` or another
  approved shared pattern directory.
- Commerce-aware components remain in their owning module.
- Section components may compose primitives and domain components; primitives never
  depend on sections or modules.
- One semantic interaction contract maps to one component. Do not create page-specific
  button, input, card, modal or badge systems.

## 3.5 Truth and gating rules

- A missing optional section returns `null`; it leaves no heading, skeleton or gap.
- Gated components accept approved data; they do not fetch speculative sources or ship
  placeholders that resemble facts.
- Reviews require moderated published data and consented attribution.
- Best-seller labels/rankings require an approved sales window and authoritative query.
- Promotions require approved offer terms, dates, inventory applicability and target.
- Trust claims require configuration or owner-provided evidence.
- Newsletter requires consent copy, privacy route, persistence, deduplication,
  unsubscribe behavior and a validated server boundary.
- AI UI remains absent until the SAS/MDG AI gate passes.

---

# 4. Component Contracts

Each contract below addresses all 28 required fields. “N/A” means the behavior is not
semantically applicable, not that implementation may ignore failure states around the
component.

## 4.1 Button

**Primary status:** Existing — Extend
**Current evidence:** `src/components/ui/button.tsx`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Trigger an action; navigation uses a link styled through the same visual recipe, not a button with routing behavior. |
| 2 | Current implementation status | Real shared primitive with `primary` and `ghost`, 40 px fixed height and native button props. Missing V2 variants, sizes and loading semantics. |
| 3 | Owner/module | Shared UI; no domain ownership. |
| 4 | Recommended file location | Extend `src/components/ui/button.tsx`; optional shared style helper stays beside it. |
| 5 | Public props/API | Native button props plus `variant`, `size`, `isLoading`, `loadingLabel`; children remain the visible label. |
| 6 | Required props | Accessible content through `children`, or an explicit accessible name only for a justified icon composition. |
| 7 | Optional props | `variant`, `size`, `isLoading`, `loadingLabel`, `className`, native `type`, `disabled`, form props. |
| 8 | Variants | `primary`, `secondary`, `tertiary/ghost`, `destructive`; no marketing-color variants. |
| 9 | Sizes | `sm` 40 px, `md` 44 px, `lg` 52 px, approved hero 56 px; target remains at least 44 px for primary touch use. |
| 10 | Visual states | Default, hover, focus-visible, active, disabled, pending, success only when parent supplies durable confirmation. |
| 11 | Interaction states | Native click/submit; disabled and pending prevent repeat activation; do not use `aria-pressed` unless true toggle behavior. |
| 12 | Loading state | Stable width, visible label or explicit loading label, progress indicator optional, `aria-disabled`/native disabled as appropriate. |
| 13 | Empty/Error handling | Empty accessible name is invalid. Errors render in the owning form/region, not inside a generic button. |
| 14 | Accessibility contract | Native `<button>`; default `type="button"` outside explicit form-submit use; focus ring token; name remains discernible. |
| 15 | Keyboard behavior | Space/Enter activate natively; no custom key handler. |
| 16 | Responsive behavior | Labels may wrap only when approved; full-width is a parent layout choice; targets never shrink below contract. |
| 17 | Motion behavior | 80–180 ms color/opacity and optional `.98` press; transform/opacity only; instant under reduced motion. |
| 18 | Content limits | Prefer 1–4 concise words; no two competing primary buttons in one decision region. |
| 19 | Composition rules | May contain leading/trailing decorative icon and label; `IconButton` handles icon-only actions; Link recipe is separate semantic element. |
| 20 | Dependencies | React/native HTML and approved CSS variables only. No variant library without approval. |
| 21 | Server vs Client boundary | Server-compatible unless a wrapper owns client state; the primitive itself needs no `'use client'`. |
| 22 | Analytics responsibilities | None internally. Parent records approved semantic action after activation; no duplicate event from Button. |
| 23 | Performance requirements | Zero runtime dependency, no layout shift in pending state, no per-instance listener beyond native React event. |
| 24 | Usage examples | `<Button variant="primary" size="lg" type="submit">Continue</Button>` |
| 25 | Reuse policy | All standard action buttons use this primitive or its shared recipe. |
| 26 | Prohibited usage | Routing with `onClick`, fake disabled styling, arbitrary colors/radii, nested interactive content, optimistic financial/stock success. |
| 27 | Acceptance criteria | All variants pass light/dark, focus, disabled, pending, 200% zoom and long-label tests. |
| 28 | Required tests | Type/render tests for defaults and prop forwarding; keyboard/form test; disabled/pending repeat-click test; axe and visual states. |

## 4.2 IconButton

**Primary status:** New — Required for Homepage V2
**Migration inputs:** current theme, cart and shop-shell icon controls

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Provide a compact action whose icon is universally recognizable and whose accessible name is explicit. |
| 2 | Current implementation status | No shared component. `ThemeToggle`, `CartBadge` and inline controls repeat similar styling. |
| 3 | Owner/module | Shared UI. Domain wrappers may supply cart/theme behavior. |
| 4 | Recommended file location | `src/components/ui/icon-button.tsx`. |
| 5 | Public props/API | Native button props plus `icon`, required `aria-label`, `variant`, `size`, `isLoading`; a link equivalent uses native `<Link>`. |
| 6 | Required props | Icon node and non-empty accessible name. |
| 7 | Optional props | Tooltip/title when helpful, variant, disabled, badge slot, className for layout only. |
| 8 | Variants | `plain`, `surface`, `glass`, `destructive`; glass only where DDS approves. |
| 9 | Sizes | Visual icon 16/20/24 px; hit target 44 x 44 px minimum. |
| 10 | Visual states | Default, hover, focus-visible, pressed, disabled, pending, selected only for true toggle. |
| 11 | Interaction states | One action per control; selected toggles expose `aria-pressed`; menu trigger exposes `aria-expanded` and `aria-controls`. |
| 12 | Loading state | Preserve footprint; hide decorative icon from AT and expose concise busy label. |
| 13 | Empty/Error handling | Missing icon or accessible name fails development review; operational error belongs to owning region. |
| 14 | Accessibility contract | Native button/link, explicit name, decorative SVG `aria-hidden`; tooltip never supplies the only name. |
| 15 | Keyboard behavior | Native activation; menu/dialog behavior delegated to owned overlay controller. |
| 16 | Responsive behavior | Target does not shrink; optional low-priority actions may be omitted only when wireframe permits and equivalent route remains. |
| 17 | Motion behavior | Fast state change; no icon spin except truthful indeterminate progress; reduced-motion alternative. |
| 18 | Content limits | One icon, optional compact badge; no hidden multi-action menu inside the button. |
| 19 | Composition rules | Domain wrapper provides semantics; Badge may overlay without changing target geometry. |
| 20 | Dependencies | Inline SVG/currentColor and shared Button tokens; no icon package now. |
| 21 | Server vs Client boundary | Server-compatible visual primitive; event-owning wrapper may be client. |
| 22 | Analytics responsibilities | Parent records semantic action; primitive emits none. |
| 23 | Performance requirements | Stable square; inline icon <= 1 KB target; no remote icon request. |
| 24 | Usage examples | `<IconButton aria-label="Open menu" icon={<MenuIcon />} aria-expanded={open} />` |
| 25 | Reuse policy | Required for theme/menu/close controls; cart link may share recipe without changing link semantics. |
| 26 | Prohibited usage | Unlabeled icon, 36 px touch target, emoji/icon-font UI, using color alone for selected state. |
| 27 | Acceptance criteria | Name, target, focus, tooltip independence and forced-colors visibility pass. |
| 28 | Required tests | Accessible-name assertion, keyboard activation, toggle ARIA, disabled/pending and 44 px visual regression. |

## 4.3 Input

**Primary status:** Existing — Extend
**Current evidence:** `src/components/ui/input.tsx`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Collect one-line textual, numeric, contact or search-compatible values with a persistent label. |
| 2 | Current implementation status | Real client primitive with generated ID, label, `aria-invalid` and connected error. Needs help text, sizes and complete state/token mapping. |
| 3 | Owner/module | Shared UI. Domain forms own validation and meaning. |
| 4 | Recommended file location | Extend `src/components/ui/input.tsx`. |
| 5 | Public props/API | Native input props plus `label`, `error`, `helpText`, `size`, optional leading/trailing decorative slot where approved. |
| 6 | Required props | `label`; meaningful `name` for submitted fields; domain-appropriate type. |
| 7 | Optional props | `error`, `helpText`, `size`, `className`, native autocomplete/inputMode/maxLength. |
| 8 | Variants | `standard`, `dense`; semantic validation state comes from error, not visual variant. |
| 9 | Sizes | Standard 48 px; dense 40 px for approved admin density only; mobile form text 16 px. |
| 10 | Visual states | Empty, filled, hover, focus-visible, disabled, read-only, invalid, browser autofill. |
| 11 | Interaction states | Controlled or uncontrolled per global union; composition never intercepts typing. |
| 12 | Loading state | Fields do not simulate loading; form may disable or mark busy while preserving value. |
| 13 | Empty/Error handling | Empty required value is a domain validation outcome; error ID is stable and linked; help and error IDs may both be described. |
| 14 | Accessibility contract | Visible programmatic label, instructions before error, `aria-invalid`, `aria-describedby`, autocomplete and input mode where relevant. |
| 15 | Keyboard behavior | Native text editing, selection and paste; never block password-manager/paste behavior. |
| 16 | Responsive behavior | Full available width by default; no fixed width that clips Bengali/English content; 400% reflow. |
| 17 | Motion behavior | Fast border/surface transition only; no shake error. |
| 18 | Content limits | Enforce domain max length at boundary; UI may expose counter only when useful and accessible. |
| 19 | Composition rules | Label, optional help, field, then error. SearchBar may compose a search-specific native field without weakening this contract. |
| 20 | Dependencies | React `useId`, native input, DDS tokens. |
| 21 | Server vs Client boundary | Current component is client due to `useId`; reassess only in a dedicated refactor, not by duplication. |
| 22 | Analytics responsibilities | Never emit field value or PII. Form may emit controlled non-PII result category. |
| 23 | Performance requirements | No per-keystroke analytics/network by default; no layout shift when error appears where reserved geometry is approved. |
| 24 | Usage examples | `<Input label="Email address" name="email" type="email" autoComplete="email" />` |
| 25 | Reuse policy | Default one-line field for storefront, account and admin unless a native specialized control is more correct. |
| 26 | Prohibited usage | Placeholder-only label, raw provider error, type mismatch, font below 16 px on mobile, arbitrary token bypass. |
| 27 | Acceptance criteria | Label click/focus, help/error announcement, autofill, zoom, dark/light and long text pass. |
| 28 | Required tests | ID fallback, described-by combination, controlled/uncontrolled cases, invalid/disabled/read-only, keyboard and axe. |

## 4.4 Textarea

**Primary status:** Existing — Extend
**Current evidence:** `src/components/ui/textarea.tsx`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Collect multi-line free text where the domain truly needs it. |
| 2 | Current implementation status | Real client primitive with label and visual error, but error lacks ID/`aria-describedby`; rows default to five. |
| 3 | Owner/module | Shared UI; domain owns validation/storage. |
| 4 | Recommended file location | Extend `src/components/ui/textarea.tsx`. |
| 5 | Public props/API | Native textarea props plus `label`, `error`, `helpText`, `size`, optional `showCount`. |
| 6 | Required props | `label`; `name` when submitted. |
| 7 | Optional props | Error/help, rows, maxLength, count, resize policy, className. |
| 8 | Variants | `standard`, `dense`; no visual-only semantic variants. |
| 9 | Sizes | Minimum 120 px standard height or approved rows; 48 px minimum usable control start; dense only admin. |
| 10 | Visual states | Empty, filled, hover, focus, disabled, read-only, invalid. |
| 11 | Interaction states | Native selection, line breaks, paste and resize; controlled/uncontrolled rule applies. |
| 12 | Loading state | Parent form owns busy state; preserve entered content. |
| 13 | Empty/Error handling | Connect error/help through stable IDs; recoverable submission error never clears content. |
| 14 | Accessibility contract | Visible label, described constraints, invalid state not color-only, counter announced conservatively. |
| 15 | Keyboard behavior | Native; Tab moves focus rather than inserting custom navigation behavior. |
| 16 | Responsive behavior | Width follows container; vertical resize must not create page horizontal overflow. |
| 17 | Motion behavior | Border/surface only; no shake or height animation while typing. |
| 18 | Content limits | Domain-defined maximum; error explains limit before destructive truncation. |
| 19 | Composition rules | Label/help/field/error/count order; not used for short values that belong in Input. |
| 20 | Dependencies | React `useId`, native textarea, DDS tokens. |
| 21 | Server vs Client boundary | Current client primitive retained until separately justified refactor. |
| 22 | Analytics responsibilities | Never emit content. Form may emit length bucket only if explicitly approved and non-sensitive. |
| 23 | Performance requirements | No expensive processing per keypress; avoid autosize dependency. |
| 24 | Usage examples | `<Textarea label="Delivery note" name="note" maxLength={500} />` |
| 25 | Reuse policy | Use for genuine multi-line input across modules. |
| 26 | Prohibited usage | Rich HTML, secret entry, placeholder-only label, silent truncation, raw content analytics. |
| 27 | Acceptance criteria | Described error, content preservation, resizing, long Bengali/English input and zoom pass. |
| 28 | Required tests | ID/error association, max length, controlled/uncontrolled, disabled/read-only, keyboard and axe. |

## 4.5 Select

**Primary status:** Existing — Extend
**Current evidence:** `src/components/ui/select.tsx`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Choose one value from a bounded, known set using native behavior by default. |
| 2 | Current implementation status | Real client native select with label and visual error; error is not programmatically described. |
| 3 | Owner/module | Shared UI; options and validation belong to domain. |
| 4 | Recommended file location | Extend `src/components/ui/select.tsx`. |
| 5 | Public props/API | Native select props plus `label`, `error`, `helpText`, `size`, children options. |
| 6 | Required props | Label and option children; name for submitted use. |
| 7 | Optional props | Error/help, size, placeholder option controlled by caller, className. |
| 8 | Variants | `standard`, `dense`; native single select only in this component. |
| 9 | Sizes | Standard 48 px; dense 40 px for approved admin use. |
| 10 | Visual states | Default, hover, focus, selected, invalid, disabled. |
| 11 | Interaction states | Native open/choose behavior; controlled/uncontrolled rule applies. |
| 12 | Loading state | Disable with visible adjacent status only when option data is truly pending; do not show fake options. |
| 13 | Empty/Error handling | No options yields disabled control plus explanatory state or omission; error/help linked by IDs. |
| 14 | Accessibility contract | Native label/control; option labels clear; disabled placeholder not used as sole instruction. |
| 15 | Keyboard behavior | Browser-native arrow, typing, Home/End and selection behavior. |
| 16 | Responsive behavior | Full width where needed; labels/options must not be visually clipped without accessible full text. |
| 17 | Motion behavior | Native popup; only field border/surface transitions. |
| 18 | Content limits | Prefer concise options; very large/filterable sets require a separately approved combobox, not mutation of Select. |
| 19 | Composition rules | Label/help/select/error; no icon/button embedded inside native select. |
| 20 | Dependencies | React `useId`, native select, DDS tokens. |
| 21 | Server vs Client boundary | Current client primitive retained. |
| 22 | Analytics responsibilities | Never emit sensitive selected value; parent may emit controlled filter key where approved. |
| 23 | Performance requirements | Render bounded options; no dependency; large datasets stay server/search driven. |
| 24 | Usage examples | `<Select label="Sort by" name="sort"><option value="newest">Newest</option></Select>` |
| 25 | Reuse policy | Default for bounded single-choice forms. |
| 26 | Prohibited usage | Custom div listbox without need, unbounded product search, unlabeled placeholder, dynamic raw-value styling. |
| 27 | Acceptance criteria | Error association, native keyboard/touch, zoom, dark/light and long options pass. |
| 28 | Required tests | Label/ID, described error, change behavior, disabled/empty options, keyboard and axe. |

## 4.6 SearchBar

**Primary status:** Existing — Refactor before reuse
**Migration inputs:** duplicated inline GET search forms in `src/app/(shop)/layout.tsx`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Let customers submit a product query through a fast, familiar, crawl-safe search route. |
| 2 | Current implementation status | Desktop/mobile native search forms exist inline with duplicated markup and placeholder `Search…`; no exported component or suggestion panel. |
| 3 | Owner/module | Storefront search pattern; query interpretation remains catalog-owned. |
| 4 | Recommended file location | `src/components/storefront/search-bar.tsx`; suggestions, if later approved, stay separate. |
| 5 | Public props/API | `id`, `action="/search"`, `defaultValue`, `variant`, `placeholder`, `submitLabel`, optional `onSubmitIntent` descriptor. |
| 6 | Required props | Unique ID and accessible label; action defaults only if repository route remains stable. |
| 7 | Optional props | Default query, compact/full variant, autoFocus only on explicit search view, className. |
| 8 | Variants | `header-compact`, `header-wide`, `page`; no AI-search variant. |
| 9 | Sizes | 44 px compact target; 48 px full; width controlled by shell/grid. |
| 10 | Visual states | Empty, filled, hover, focus, disabled, submitted; clear control only when accessible and needed. |
| 11 | Interaction states | Native GET submission to `/search?q=`; empty-query policy follows catalog validator; no client-only navigation requirement. |
| 12 | Loading state | Route owns result skeleton; bar preserves query and may show busy state only with truthful transition state. |
| 13 | Empty/Error handling | Empty results belong to results region; malformed query recovers safely; component does not expose database/provider errors. |
| 14 | Accessibility contract | `<form role="search">`, distinct label where multiple search landmarks exist, native `type=search`, visible or sr-only label. |
| 15 | Keyboard behavior | Enter submits; Escape/arrow behavior exists only if a future compliant combobox is approved. |
| 16 | Responsive behavior | Header-wide visible at approved desktop mode; compact search is reachable in mobile header/drawer without duplicate focusable fields. |
| 17 | Motion behavior | Focus/state only; no animated placeholder or expanding layout that shifts navigation. |
| 18 | Content limits | Placeholder is approved content; query length constrained by validator and URL safety. |
| 19 | Composition rules | May compose Input visual recipe and optional submit IconButton; suggestion panel is not part of Homepage V2. |
| 20 | Dependencies | Next route, native GET form, catalog query contract, DDS tokens. |
| 21 | Server vs Client boundary | Server-compatible for baseline form. A future combobox isolates a client leaf. |
| 22 | Analytics responsibilities | No raw query in analytics. Parent may record `search_submit` with placement and safe query-length/result buckets after analytics approval. |
| 23 | Performance requirements | Zero search JavaScript baseline; no autocomplete request or provider dependency in Homepage V2. |
| 24 | Usage examples | `<SearchBar id="site-search" variant="header-wide" />` |
| 25 | Reuse policy | One shared component for header and search-entry contexts; results filtering remains route-specific. |
| 26 | Prohibited usage | Raw-query analytics, duplicate IDs, unapproved live suggestions, AI claims, client fetch for baseline submission. |
| 27 | Acceptance criteria | Works without client JS, retains query, has correct landmark/name and no compact overflow at 320 px. |
| 28 | Required tests | GET URL serialization, empty/long query, accessible label/landmark, keyboard submit, responsive visibility and no-JS test. |

## 4.7 Header

**Primary status:** Existing — Refactor before reuse
**Migration input:** route-local shell in `src/app/(shop)/layout.tsx`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Provide brand orientation and primary discovery/account/cart/theme entry without delaying page content. |
| 2 | Current implementation status | Real inline header with brand, categories, duplicated search, account, streamed cart and theme. Not exported; mobile uses horizontal category scrolling instead of approved drawer. |
| 3 | Owner/module | Shared storefront shell. Cart data remains cart-module-owned. |
| 4 | Recommended file location | `src/components/storefront/site-header.tsx`, composed from navigation/search/domain entries. |
| 5 | Public props/API | `brand`, `categories`, `accountHref`, `search`, `cartSlot`, `themeSlot`, `announcementOffset?`; slots remain semantic. |
| 6 | Required props | Approved brand label/link and primary navigation data (may be empty with recovery behavior). |
| 7 | Optional props | Search/cart/theme/account slots and verified announcement relationship. |
| 8 | Variants | `storefront`; compact/desktop are responsive modes, not separate component forks. |
| 9 | Sizes | Header row target from DDS; interactive targets >=44 px; exact heights follow wireframe and content stress. |
| 10 | Visual states | Default, sticky/scrolled only if approved, navigation-open, child loading/fallback, empty categories. |
| 11 | Interaction states | Logo routes home; controls retain native semantics; menu trigger controls Drawer; cart streams independently. |
| 12 | Loading state | Static shell/search/brand render immediately; cart uses footprint-matched fallback; categories use tagged cache rather than client spinner. |
| 13 | Empty/Error handling | Empty categories omit category items but preserve brand/search/account/cart recovery; no shell-wide failure for one optional fact. |
| 14 | Accessibility contract | `<header>` landmark, distinctly labeled nav/search, skip link before it at shell level, logical source order. |
| 15 | Keyboard behavior | Predictable tab order; Drawer manages overlay keys; no hover-only menu. |
| 16 | Responsive behavior | Desktop navigation/search arrangement and compact menu/search behavior follow separate wireframes without duplicate exposed controls. |
| 17 | Motion behavior | Optional surface color/blur transition only; no large animated glass; drawer motion delegated. |
| 18 | Content limits | Wordmark and nav labels must survive approved English/Bengali stress; top-level item count bounded by available layout. |
| 19 | Composition rules | Composes DesktopNavigation, MobileNavigation, SearchBar, CartBadge slot, ThemeToggle and IconButton; no data repository calls inside visual children. |
| 20 | Dependencies | Cached categories supplied by shell/route, cart domain slot, theme controls, Next Link, DDS tokens. |
| 21 | Server vs Client boundary | Header remains server composition; menu controller is a small client island; cart remains server async slot. |
| 22 | Analytics responsibilities | Child destinations record approved events at ownership boundary; Header itself may record menu open only through controller after approval. |
| 23 | Performance requirements | Header HTML/CSS before client JS; stable height/CLS; no hydration of entire shell; glass disabled if performance fails. |
| 24 | Usage examples | `<SiteHeader categories={tops} cartSlot={<CartBadge />} themeSlot={<ThemeToggle />} />` |
| 25 | Reuse policy | All storefront routes use one shell Header; account/admin may use distinct approved shells, not fork this file casually. |
| 26 | Prohibited usage | Customer-facing admin link, hard-coded unverified claims, global client component, route-derived active state that breaks caching, dead links. |
| 27 | Acceptance criteria | Wireframe fidelity at 320–1920 px, stable streamed cart, keyboard/zoom, no-JS discovery and empty-category recovery pass. |
| 28 | Required tests | Server render, composition, navigation links, empty categories, Suspense fallback geometry, keyboard Drawer integration, axe and visual regression. |

## 4.8 DesktopNavigation

**Primary status:** Existing — Refactor before reuse
**Migration input:** inline `md:flex` category nav in shop layout

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Expose approved top-level discovery routes on wide viewports. |
| 2 | Current implementation status | Inline list of top categories; no exported component, distinct accessible label or overflow policy. |
| 3 | Owner/module | Shared storefront pattern; catalog supplies sanitized route data. |
| 4 | Recommended file location | `src/components/storefront/desktop-navigation.tsx`. |
| 5 | Public props/API | `items: NavigationItem[]`, `ariaLabel`, optional current route key only when static-safe. |
| 6 | Required props | Stable destination, label and key for each item. |
| 7 | Optional props | Nested items only under separately approved menu contract; analytics descriptors. |
| 8 | Variants | `primary`; no mega-menu in Homepage V2. |
| 9 | Sizes | 44 px minimum link target with visual text at approved `text-sm/base`. |
| 10 | Visual states | Default, hover, focus, active/current when safely supplied, unavailable item omitted. |
| 11 | Interaction states | Native links; no click-to-open behavior without defined popover. |
| 12 | Loading state | Items come from tagged cache; no client skeleton inside header. |
| 13 | Empty/Error handling | Empty list returns no nav region or a search/shop recovery approved by wireframe; never renders dead placeholders. |
| 14 | Accessibility contract | `<nav aria-label="Primary">` with list semantics; `aria-current=page` only when accurate. |
| 15 | Keyboard behavior | Native links and visible focus; no hover-only submenu. |
| 16 | Responsive behavior | Hidden below approved desktop threshold; MobileNavigation provides equivalent routes. |
| 17 | Motion behavior | Color/underline only; menu animation N/A for Homepage V2. |
| 18 | Content limits | Top-level count constrained by measured width; long labels wrap only if header height contract permits. |
| 19 | Composition rules | Receives plain navigation DTOs; does not fetch categories or infer hierarchy. |
| 20 | Dependencies | Next Link, DDS nav tokens. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | Link wrapper may emit approved `navigation_select` descriptor without URL/query/PII. |
| 23 | Performance requirements | No client JS baseline; no remote menu content; stable header width. |
| 24 | Usage examples | `<DesktopNavigation items={topCategories} ariaLabel="Primary" />` |
| 25 | Reuse policy | Use for storefront primary routes on desktop only. |
| 26 | Prohibited usage | Unbounded categories, fake active state, non-link divs, hover-only menus, hard-coded unpublished routes. |
| 27 | Acceptance criteria | Every route resolves; order is authoritative; keyboard/zoom/long-label behavior passes. |
| 28 | Required tests | List/link semantics, current state, empty list, destination validity, responsive visibility and visual focus. |

## 4.9 MobileNavigation

**Primary status:** Existing — Refactor before reuse
**Migration input:** inline horizontal category-scroller in shop layout

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Provide compact access to the same primary discovery and recovery routes without horizontal page overflow. |
| 2 | Current implementation status | Current mobile categories scroll horizontally; approved wireframe requires a menu trigger and Drawer composition. |
| 3 | Owner/module | Shared storefront pattern. |
| 4 | Recommended file location | `src/components/storefront/mobile-navigation.tsx`; controller may be a colocated client file. |
| 5 | Public props/API | `items`, `accountHref`, optional contact/policy items, `triggerLabel`, `drawerTitle`. |
| 6 | Required props | Menu items and accessible trigger/title. |
| 7 | Optional props | Secondary groups only when routes exist; close-on-navigation behavior. |
| 8 | Variants | `drawer`; horizontal strip is not the V2 primary navigation. |
| 9 | Sizes | Trigger and links >=44 px; drawer width bounded by viewport/safe insets. |
| 10 | Visual states | Closed, opening, open, closing, active route, empty group. |
| 11 | Interaction states | Trigger controls Drawer with `aria-expanded`; selecting a link navigates and closes; background inert while open. |
| 12 | Loading state | Navigation data server-rendered; no spinner. Drawer controller hydrates without hiding routes from baseline server HTML strategy. |
| 13 | Empty/Error handling | Omit empty groups; retain home/search/account/order-recovery routes if configured; no dead placeholders. |
| 14 | Accessibility contract | Named navigation, labeled groups, dialog/drawer semantics, body scroll control, focus trap and restoration. |
| 15 | Keyboard behavior | Enter/Space open; Tab cycles inside; Escape closes; focus returns to trigger. |
| 16 | Responsive behavior | Active below desktop threshold and fully removed from tab order when desktop nav owns the mode. |
| 17 | Motion behavior | 240–320 ms transform/opacity; instant/near-instant reduced-motion mode. |
| 18 | Content limits | Groups remain concise; content scrolls inside viewport; labels not truncated as sole representation. |
| 19 | Composition rules | Composes IconButton trigger, Drawer, SearchBar if wireframe places it, and native link groups. |
| 20 | Dependencies | Shared Drawer/IconButton, Next Link, DDS overlay tokens; no focus library without approval. |
| 21 | Server vs Client boundary | Server data composition plus minimal client open/focus controller. |
| 22 | Analytics responsibilities | Controller may emit approved `mobile_menu_open/close`; links emit navigation selection without PII. |
| 23 | Performance requirements | Small client island; no duplicated category payload beyond server props; lock scroll without layout jump. |
| 24 | Usage examples | `<MobileNavigation items={items} triggerLabel="Open menu" />` |
| 25 | Reuse policy | One compact storefront navigation; do not create page-specific drawers. |
| 26 | Prohibited usage | Swipe-only access, missing Escape/focus restore, horizontal page overflow, hidden essential routes, full shell hydration. |
| 27 | Acceptance criteria | Works at 320 px, landscape, zoom, keyboard and touch; opening never shifts underlying layout. |
| 28 | Required tests | Open/close, focus trap/restore, Escape, route select, responsive exclusivity, inert background, reduced motion and axe. |

## 4.10 Drawer

**Primary status:** New — Required for Homepage V2

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Present temporary supplementary content from a viewport edge while preserving spatial context. |
| 2 | Current implementation status | No generic component. No approved dependency. |
| 3 | Owner/module | Shared UI primitive/pattern; feature owners supply content. |
| 4 | Recommended file location | `src/components/ui/drawer.tsx` or small colocated files under `src/components/ui/drawer/` if size threshold is reached. |
| 5 | Public props/API | Controlled `open`, `onOpenChange`, `title`, `description?`, `side`, `children`, `initialFocusRef?`, `returnFocusRef?`. |
| 6 | Required props | Controlled open state, change callback, accessible title and content. |
| 7 | Optional props | Description, side (`start` default), close label, footer slot; dismissal policy remains explicit. |
| 8 | Variants | `navigation`, future `filters`; no arbitrary width variants. |
| 9 | Sizes | Compact navigation max `min(88vw, 24rem)`; target/padding and safe areas from DDS. |
| 10 | Visual states | Closed/unmounted, entering, open, exiting; busy state belongs to content. |
| 11 | Interaction states | Controlled overlay, scrim dismissal when safe, background inert/scroll locked, nested overlays prohibited by default. |
| 12 | Loading state | Shell/title/close remain; content may provide local skeleton with stable geometry. |
| 13 | Empty/Error handling | Empty content is invalid unless a clear recovery state is supplied; errors stay inside content region. |
| 14 | Accessibility contract | Dialog semantics with accessible title/description; focus trap; inert background; visible close control. |
| 15 | Keyboard behavior | Escape closes when dismissible; Tab cycles; focus enters intentional first target and restores to trigger. |
| 16 | Responsive behavior | Fills viewport height using dynamic viewport units and safe insets; no content beyond reachable scroll area. |
| 17 | Motion behavior | Transform/opacity, `--duration-slow`, approved easing; no blur animation; reduced motion removes translation. |
| 18 | Content limits | One hierarchy per drawer; long content scrolls internally; primary close/action remains reachable. |
| 19 | Composition rules | Trigger is external and owns `aria-controls`; Drawer composes scrim, panel, header, body, optional footer. |
| 20 | Dependencies | React DOM/native platform and DDS tokens. Dependency proposal required if robust focus/inert support cannot be achieved safely. |
| 21 | Server vs Client boundary | Client primitive; server content may be passed as children where serialization rules allow. |
| 22 | Analytics responsibilities | No generic analytics. Owner records semantic open/close/result events. |
| 23 | Performance requirements | No layout animation; no continuously animated backdrop filter; portal/focus code stays small; zero CLS. |
| 24 | Usage examples | `<Drawer open={open} onOpenChange={setOpen} title="Menu" side="start">…</Drawer>` |
| 25 | Reuse policy | Shared overlay for approved edge panels; mobile nav uses `navigation` variant. |
| 26 | Prohibited usage | Checkout confirmation, irreversible action without explicit confirm pattern, nested drawer, missing focus control, swipe-only close. |
| 27 | Acceptance criteria | Focus, scroll lock, safe inset, 320 px, zoom, reduced motion, dark/light and escape behavior pass. |
| 28 | Required tests | Controlled state, initial/return focus, tab containment, Escape/scrim, scroll lock cleanup, SSR hydration, axe and visual regression. |

## 4.11 AnnouncementBar

**Primary status:** Gated — Requires backend, approved content, or business data
**Gate:** verified message, active period, destination and owner approval

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Surface one current, verified store-wide fact or announcement without obstructing navigation. |
| 2 | Current implementation status | No component. Current `TrustBar` is a different inline pattern and must not be relabeled as an announcement. |
| 3 | Owner/module | Shared storefront presentation; Product Owner/content configuration owns truth. |
| 4 | Recommended file location | `src/components/storefront/announcement-bar.tsx`. |
| 5 | Public props/API | `message`, optional `href`, `linkLabel`, `tone`, `announcementId`, `expiresAt`; accepts already-approved data only. |
| 6 | Required props | Non-empty verified message and stable non-PII ID. |
| 7 | Optional props | Valid internal destination, explicit link label, approved tone and end time. |
| 8 | Variants | `neutral`, `brand`, `info`; danger/success are not marketing tones. |
| 9 | Sizes | One compact row where possible; padding grows for wrapped content; targets >=44 px. |
| 10 | Visual states | Static, linked, expired/invalid (omitted), wrapped. No rotation/carousel. |
| 11 | Interaction states | Native link only when a real destination exists; entire bar is not clickable if that obscures link semantics. |
| 12 | Loading state | None. Cached/configured data either renders or omits; never show an announcement skeleton. |
| 13 | Empty/Error handling | Missing, expired, invalid or failed data returns `null` and collapses spacing. |
| 14 | Accessibility contract | Text is readable without live-region interruption; link has descriptive name; no auto-updating marquee. |
| 15 | Keyboard behavior | Native link focus; non-linked message is not focusable. |
| 16 | Responsive behavior | Wraps to at most a practical two-line compact presentation; never horizontal-scrolls page or hides terms. |
| 17 | Motion behavior | No auto-scroll, rotation or urgency animation. Initial static appearance only. |
| 18 | Content limits | One message; concise plain language; material terms must be visible or linked to a live details page. |
| 19 | Composition rules | Sits before/adjacent to Header per wireframe; does not duplicate Trust indicators or Promotion banner. |
| 20 | Dependencies | Approved content/config data, Next Link, DDS tokens. No campaign SDK. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | Optional approved `announcement_select` with announcement ID and placement; no view beacon dependency by default. |
| 23 | Performance requirements | Static HTML/CSS, negligible bytes, zero CLS from late insertion. |
| 24 | Usage examples | `<AnnouncementBar message={copy} href={validHref} announcementId={id} />` |
| 25 | Reuse policy | One active global announcement maximum unless Product Owner approves a different rule. |
| 26 | Prohibited usage | Fake countdown, unsupported free-delivery claim, auto-rotating messages, hidden offer terms, client-time eligibility authority. |
| 27 | Acceptance criteria | Gate/expiry/destination validated server-side; omission leaves no gap; wrapping and contrast pass. |
| 28 | Required tests | Missing/expired/valid gate, destination, link semantics, long copy at 320 px, dark/light and no-CLS visual check. |

## 4.12 Hero

**Primary status:** New — Required for Homepage V2
**Release gate:** final brand copy; media is optional only under the approved fallback

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Communicate the approved store proposition and provide the strongest valid discovery action. |
| 2 | Current implementation status | No component; current homepage starts with “New arrivals.” |
| 3 | Owner/module | Homepage section under shared storefront composition; content and media remain owner-approved inputs. |
| 4 | Recommended file location | `src/components/storefront/sections/home-hero.tsx` or page-colocated section per MDG ownership review. |
| 5 | Public props/API | `eyebrow?`, `heading`, `body`, `primaryAction`, `secondaryAction?`, `media?`, `theme`, `contentKey`. |
| 6 | Required props | Approved H1, support copy, valid primary destination and stable content key. |
| 7 | Optional props | Eyebrow, secondary action, approved media with alt/crop/sizes, decorative liquid-light flag via semantic variant. |
| 8 | Variants | `split-media`, `editorial`; wireframe selects one. No slider/video variant. |
| 9 | Sizes | Container/grid and 48–96 px section spacing from wireframes; heading uses approved fluid display token. |
| 10 | Visual states | Complete, no-media fallback, media-loading/failure, long-copy stress. |
| 11 | Interaction states | Native CTA links; no auto-play or draggable hero. |
| 12 | Loading state | Approved copy renders immediately; media reserves geometry and uses image placeholder/fallback without hiding CTA. |
| 13 | Empty/Error handling | Missing approved heading/action blocks release. Failed/missing media uses approved solid/gradient fallback; invalid secondary action omits only itself. |
| 14 | Accessibility contract | One page H1, logical copy-first source order, meaningful media alt or empty alt if decorative, descriptive link labels. |
| 15 | Keyboard behavior | Native links in visual/source order; no hidden focusable media control. |
| 16 | Responsive behavior | Desktop split, tablet rebalanced and mobile stack follow wireframes; copy precedes/retains priority; safe crop per Media Guide. |
| 17 | Motion behavior | Optional restrained 420 ms reveal for decoration only; primary content immediate; no parallax; reduced-motion static. |
| 18 | Content limits | H1 target 6–12 words, body 1–3 short sentences, max two actions; final limits follow Content Guide and stress tests. |
| 19 | Composition rules | Composes Button/Link recipe, ProductImage/media pattern and optional Badge/eyebrow; no data query inside presentation. |
| 20 | Dependencies | Approved Content Guide, Media Guide, Next Image/Link, DDS tokens. |
| 21 | Server vs Client boundary | Server component. Motion should be CSS/progressive enhancement; no hero-wide client boundary. |
| 22 | Analytics responsibilities | Action owner emits `hero_primary_select` or `hero_secondary_select` with content key, destination key and viewport mode; no PII. |
| 23 | Performance requirements | Only actual likely LCP image gets priority; stable aspect ratio; transformed AVIF/WebP; no background video or heavy JS. |
| 24 | Usage examples | `<HomeHero heading={h1} body={body} primaryAction={shopAction} media={heroMedia} />` |
| 25 | Reuse policy | Hero anatomy may guide future page heroes, but Homepage content and contract are not turned into a generic prop-heavy marketing component. |
| 26 | Prohibited usage | Unapproved claim/copy, text baked into image, carousel, autoplay video, multiple priority images, fake AI language. |
| 27 | Acceptance criteria | H1/CTA valid, no-media useful, no CLS, LCP budget supported, 320–1920 px and 400% reflow pass. |
| 28 | Required tests | Required/gated props, action destinations, media alt/fallback, source order, responsive visual regression, axe and Lighthouse evidence. |

## 4.13 SectionHeader

**Primary status:** New — Required for Homepage V2

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Orient users to a content section with a clear title, optional support copy and one secondary destination. |
| 2 | Current implementation status | Repeated page headings exist, but no reusable pattern. |
| 3 | Owner/module | Shared storefront presentation. |
| 4 | Recommended file location | `src/components/storefront/section-header.tsx`. |
| 5 | Public props/API | `title`, `description?`, `headingLevel`, `action?`, `eyebrow?`, `align?`, `id?`. |
| 6 | Required props | Title and explicit heading level chosen by page hierarchy. |
| 7 | Optional props | Description, eyebrow, valid “View all” action, ID for `aria-labelledby`. |
| 8 | Variants | `default`, `centered`, `compact`; homepage wireframe normally uses default. |
| 9 | Sizes | Title token based on context; 16–24 px internal gaps; action 44 px target. |
| 10 | Visual states | Standard, long title/description, no action, wrapped action. |
| 11 | Interaction states | Only optional action is interactive; entire heading is not clickable. |
| 12 | Loading state | N/A; section header renders only with known content. |
| 13 | Empty/Error handling | Missing title means section must not render; missing/invalid action omits action. |
| 14 | Accessibility contract | Real `h2`/`h3` chosen explicitly; section references heading ID where useful; descriptive action label. |
| 15 | Keyboard behavior | Native action link. |
| 16 | Responsive behavior | Desktop may place action right; compact stacks title/copy/action without source-order change. |
| 17 | Motion behavior | None beyond optional section reveal governed by parent. |
| 18 | Content limits | Concise title; support copy max readable measure; “View all” names destination when ambiguity exists. |
| 19 | Composition rules | Precedes grid/list; no margin baked that conflicts with parent section spacing. |
| 20 | Dependencies | Heading/Link/Button recipe and DDS typography/spacing. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | Optional action event belongs to parent section with placement. |
| 23 | Performance requirements | Static HTML/CSS, no client JS. |
| 24 | Usage examples | `<SectionHeader title="New arrivals" headingLevel={2} action={viewAll} />` |
| 25 | Reuse policy | Use for comparable storefront section introductions; page H1 remains route-owned. |
| 26 | Prohibited usage | Arbitrary heading level, empty title, multiple competing actions, page-specific color props. |
| 27 | Acceptance criteria | Heading hierarchy, long-copy stacking, link target and spacing match DDS/wireframe. |
| 28 | Required tests | Element level/ID, optional content, long text, responsive layout, axe and visual regression. |

## 4.14 ProductCard

**Primary status:** Existing — Extend
**Current evidence:** `src/modules/catalog/components/product-card.tsx`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Present authoritative product identity, media, price and availability as a clear route to product detail. |
| 2 | Current implementation status | Real server component with square image/fallback, brand, title, from-price, sold-out badge and whole-card link. Missing V2 compare price/badge API and tokenized media/priority ownership. |
| 3 | Owner/module | Catalog domain. |
| 4 | Recommended file location | Extend `src/modules/catalog/components/product-card.tsx`; split subparts only if file threshold is reached. |
| 5 | Public props/API | `product: ProductCardView`, `imageLoading?`, `sizes`, `placement`, `position`; priority becomes explicit from page, not inferred by grid. |
| 6 | Required props | Slug/title/authoritative current price or unavailable state/stock state/media descriptor. |
| 7 | Optional props | Brand, compare price when validated, approved badge descriptor, image, analytics descriptor. |
| 8 | Variants | `grid`, future `compact-list`; Homepage uses grid. No campaign-specific card variants. |
| 9 | Sizes | Minimum practical width 220 px; preferred 240–320 px; media ratio per DDS/Media Guide. |
| 10 | Visual states | Default, hover/focus-within, sold out, no image, no price/unavailable, long title, valid badge. |
| 11 | Interaction states | Primary whole-card product link; nested quick-add/favorite is absent on Homepage V2 and would require separate focus/link composition. |
| 12 | Loading state | ProductCard does not fetch; grid skeleton mirrors geometry. Image may load lazily with reserved ratio. |
| 13 | Empty/Error handling | No image uses customer-safe fallback; missing title/slug is invalid; missing price displays approved unavailable text, never guessed value. |
| 14 | Accessibility contract | Link has product name; product image alt follows Media Guide; decorative duplication avoided; price/status readable in link context. |
| 15 | Keyboard behavior | One native focus target for baseline card; focus-visible treatment encloses recognizable card. |
| 16 | Responsive behavior | Content wraps without fixed title height; same source order across grid modes; no hover-only facts. |
| 17 | Motion behavior | Optional subtle media scale/elevation using transform within clipped frame; removed under reduced motion and touch not required. |
| 18 | Content limits | Title not clipped to hide meaning; brand/badge concise; only one primary merchandising badge plus stock state. |
| 19 | Composition rules | Composes ProductImage, PriceDisplay and Badge; receives view DTO; does not call repository/storage business logic once descriptor boundary is approved. |
| 20 | Dependencies | Next Link/Image or ProductImage, money formatter, storage abstraction/server, DDS tokens. |
| 21 | Server vs Client boundary | Server component. No per-card client hydration. |
| 22 | Analytics responsibilities | Approved `product_select` uses non-PII product key, placement and position; component exposes descriptor without importing provider. |
| 23 | Performance requirements | Select only first image at data layer; responsive `sizes`; lazy below fold; no N+1; no more than actual page LCP image priority. |
| 24 | Usage examples | `<ProductCard product={view} placement="new_arrivals" position={0} imageLoading="lazy" />` |
| 25 | Reuse policy | One catalog card across homepage/category/search/related products with semantic data differences. |
| 26 | Prohibited usage | Fetch per card, infer discount/best-seller/low-stock, nested admin link, fixed-height clipped title, quick-add in Homepage V2. |
| 27 | Acceptance criteria | Truth states, media fallback, price semantics, long content, all themes and 220 px minimum pass. |
| 28 | Required tests | View-model states, sold-out/no-price/no-image, link/alt, badge gate, responsive visual, server-only boundary, axe and image sizing. |

## 4.15 ProductGrid

**Primary status:** Existing — Extend
**Current evidence:** exported beside ProductCard

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Arrange a bounded product list into a responsive, source-order-preserving grid. |
| 2 | Current implementation status | Real server component with 2/3/4 columns and first four cards marked priority. That blanket priority rule conflicts with one-LCP ownership. |
| 3 | Owner/module | Catalog domain layout pattern. |
| 4 | Recommended file location | Keep with ProductCard initially or split to `product-grid.tsx` after reuse/size threshold. |
| 5 | Public props/API | `products`, `placement`, `priorityProductId?`, `empty?`, `className?`; page selects priority explicitly. |
| 6 | Required props | Authoritative product view array and controlled placement enum. |
| 7 | Optional props | One priority ID, empty-state slot when route owns it, heading relationship ID. |
| 8 | Variants | `standard`; compact/list/carousel not approved. |
| 9 | Sizes | 2 compact, 3 tablet, 4 desktop when card width >=220 px; gaps 16–32 px by mode. |
| 10 | Visual states | Populated, sparse final row, empty delegated state, loading handled by matched skeleton. |
| 11 | Interaction states | None at grid level; cards own links. |
| 12 | Loading state | `ProductGridSkeleton` or composed Skeleton mirrors exact columns/count; grid itself accepts ready data. |
| 13 | Empty/Error handling | Empty array returns caller-supplied one-time customer-safe state or `null`; repeated section empty states prohibited. |
| 14 | Accessibility contract | Semantic list (`ul/li`) preferred for product collection; region labelled by SectionHeader. |
| 15 | Keyboard behavior | DOM/source order equals visual order; no masonry reordering. |
| 16 | Responsive behavior | Auto/fixed grid follows approved breakpoints and min width; no page horizontal scroll at 320 px. |
| 17 | Motion behavior | Grid does not stagger every card; result replacement avoids layout animation. |
| 18 | Content limits | Homepage count follows wireframe; collection pagination follows repository page size. |
| 19 | Composition rules | Only ProductCard items; page/section owns header, error boundary and data query. |
| 20 | Dependencies | ProductCard, DDS grid/container tokens. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | Supplies placement/position to cards; emits no grid view event absent approved observer strategy. |
| 23 | Performance requirements | No client JS, one image priority maximum page-wide, stable geometry, bounded array. |
| 24 | Usage examples | `<ProductGrid products={rows} placement="new_arrivals" priorityProductId={lcpId} />` |
| 25 | Reuse policy | Default product collection layout; carousels require separate approval. |
| 26 | Prohibited usage | Priority first four, CSS masonry source reorder, per-card fetch, horizontal carousel, unbounded product arrays. |
| 27 | Acceptance criteria | Card min width, source order, sparse/empty/loading geometry and 320–1920 px behavior pass. |
| 28 | Required tests | Column visual regression, list semantics/order, empty handoff, priority propagation and performance/image audit. |

## 4.16 CategoryCard

**Primary status:** New — Required for Homepage V2
**Data rule:** section renders only authoritative active categories/content

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Provide a visually clear link to an active product category/collection. |
| 2 | Current implementation status | No reusable component; category links exist in navigation and category pages. |
| 3 | Owner/module | Catalog domain presentation or shared storefront pattern fed by catalog DTO. |
| 4 | Recommended file location | `src/modules/catalog/components/category-card.tsx`. |
| 5 | Public props/API | `category: CategoryCardView`, `imageLoading`, `sizes`, `placement`, `position`. |
| 6 | Required props | Valid slug, name and stable ID. |
| 7 | Optional props | Approved image/alt, short description, product-count only if authoritative and required. |
| 8 | Variants | `image`, `text-fallback`; no arbitrary campaign styles. |
| 9 | Sizes | Four/two/one-column geometry from wireframes; stable approved aspect ratio. |
| 10 | Visual states | Default, hover/focus, no image, long name, unavailable category omitted before render. |
| 11 | Interaction states | One native whole-card link. |
| 12 | Loading state | Section skeleton matches media/text geometry only when category read is actually streamed. |
| 13 | Empty/Error handling | No active categories omits entire section; missing image uses approved neutral fallback; invalid route omits card. |
| 14 | Accessibility contract | Link name contains category; visible label remains text; image alt empty if label fully names destination and image adds no content. |
| 15 | Keyboard behavior | Native link and clear focus-visible card outline. |
| 16 | Responsive behavior | Grid/stack follows wireframes; label wraps; crop switches only via Media Guide. |
| 17 | Motion behavior | Optional subtle image scale/elevation; no required hover reveal; reduced-motion static. |
| 18 | Content limits | Short category name; description max two lines only if approved without hiding meaning. |
| 19 | Composition rules | ProductImage/media recipe plus label; does not calculate category metrics. |
| 20 | Dependencies | Catalog route data, Next Link, ProductImage, DDS card tokens. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | `category_select` with category ID, placement, position and viewport mode; no query/PII. |
| 23 | Performance requirements | Lazy below hero, correct `sizes`, transformed media, no category fetch per card. |
| 24 | Usage examples | `<CategoryCard category={view} placement="featured_categories" position={0} />` |
| 25 | Reuse policy | Reuse for visual category discovery; navigation keeps its simpler link contract. |
| 26 | Prohibited usage | Inactive/dead category, invented product count, text in image, remote unoptimized background, per-card query. |
| 27 | Acceptance criteria | Destination valid, fallback useful, alt correct, long label and responsive crop pass. |
| 28 | Required tests | Link/alt/fallback, inactive filtering at owner, long content, responsive image sizes, axe and visual regression. |

## 4.17 PromotionalBanner

**Primary status:** Gated — Requires backend, approved content, or business data
**Gate:** active approved campaign with complete verifiable terms and live target

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Highlight one time-relevant commercial priority without interrupting shopping. |
| 2 | Current implementation status | No component or campaign source. |
| 3 | Owner/module | Shared storefront presentation; promotion truth owned by approved content/business configuration. |
| 4 | Recommended file location | `src/components/storefront/promotional-banner.tsx`. |
| 5 | Public props/API | `campaignId`, `heading`, `body`, `action`, `media?`, `startsAt?`, `endsAt?`, `tone`. |
| 6 | Required props | Approved campaign ID, copy, valid action and server-validated active eligibility. |
| 7 | Optional props | Media/alt, terms link, active date metadata for validation only, visual tone. |
| 8 | Variants | `split`, `compact`; exact variant selected by wireframe/content. |
| 9 | Sizes | Full container; 24–48 px internal padding; mobile stack with 44 px CTA. |
| 10 | Visual states | Active, no-media, expired/ineligible omitted, long-terms wrap. |
| 11 | Interaction states | Native CTA/terms links; no dismiss or countdown in Homepage V2. |
| 12 | Loading state | None; eligibility resolved on server/cached configuration. |
| 13 | Empty/Error handling | Any missing required evidence, invalid date or dead destination returns `null`; failure never blocks homepage. |
| 14 | Accessibility contract | Heading hierarchy within section, descriptive CTA, terms available, image alt meaningful/decorative as appropriate. |
| 15 | Keyboard behavior | Native links in logical order. |
| 16 | Responsive behavior | Text remains readable before/without media; no terms clipping; source order follows meaning. |
| 17 | Motion behavior | Static or restrained reveal; no timer/pulse/urgency motion. |
| 18 | Content limits | One campaign; visible material terms or concise link; no unsupported superlatives. |
| 19 | Composition rules | Composes SectionHeader-like heading, Button/Link, ProductImage/media; separate from AnnouncementBar. |
| 20 | Dependencies | Approved Content/Media Guide and server-side eligibility source; no ad SDK. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | `promotion_select` with campaign ID, placement and destination key after analytics approval; no customer eligibility/PII. |
| 23 | Performance requirements | Below-fold image lazy; static HTML; no third-party scripts; omission has zero CLS. |
| 24 | Usage examples | `<PromotionalBanner {...approvedCampaign} />` only after gate function returns active data. |
| 25 | Reuse policy | Reuse for verified campaigns; normal brand messages use BrandStory/AnnouncementBar. |
| 26 | Prohibited usage | Fake discount, timer, hidden terms, client-clock authority, expired offer, stock-pressure copy without rule. |
| 27 | Acceptance criteria | Campaign evidence/date/destination validated, terms readable, omission safe, all breakpoints pass. |
| 28 | Required tests | Eligibility boundaries, missing fields, expired state, links/terms, long copy, responsive visual and truth review. |

## 4.18 TrustCard

**Primary status:** Gated — Requires backend, approved content, or business data
**Migration input:** verified shipping/payment facts in route-local `TrustBar`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Present one verified reason/fact that reduces purchase uncertainty. |
| 2 | Current implementation status | No standalone card. `TrustBar` derives delivery estimate/free threshold and configured payment labels inline. |
| 3 | Owner/module | Shared storefront presentation; source facts remain shipping/payment/config owner responsibility. |
| 4 | Recommended file location | `src/components/storefront/trust-card.tsx`; fact adapter stays in owning server composition. |
| 5 | Public props/API | `factId`, `icon`, `title`, `detail?`, `sourceKind`, optional valid href. |
| 6 | Required props | Verified non-PII fact ID, clear title and recognized source kind. |
| 7 | Optional props | Supporting detail, decorative icon, live policy/contact destination. |
| 8 | Variants | `compact`, `card`; wireframe selects. |
| 9 | Sizes | Icon 20–24 px, target 44 px if linked, consistent grid card height without clipping. |
| 10 | Visual states | Static, linked, omitted, long factual text. No “verified” visual badge unless meaning is approved. |
| 11 | Interaction states | Native link only for details/recovery; non-linked fact not focusable. |
| 12 | Loading state | Cached facts render or omit; skeleton not justified for static trust section. |
| 13 | Empty/Error handling | Invalid/unavailable fact omitted; section requires at least wireframe-approved minimum verified facts or collapses. |
| 14 | Accessibility contract | Icon decorative; text carries meaning; status not color-only; link name describes destination. |
| 15 | Keyboard behavior | Native link only. |
| 16 | Responsive behavior | Grid to stack; copy wraps fully; no fact shortened into misleading phrase on mobile. |
| 17 | Motion behavior | Minimal elevation/reveal optional; no pulsing trust icon. |
| 18 | Content limits | One fact per card; concise title and one short supporting sentence. |
| 19 | Composition rules | Section composes 2–4 cards from verified DTO; component never reads env/database. |
| 20 | Dependencies | Approved inline icons, shipping/payment/config adapters, DDS cards. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | Usually none; linked recovery may emit `trust_detail_select` with fact ID only. |
| 23 | Performance requirements | Static, no client JS, no third-party trust badge image/script. |
| 24 | Usage examples | `<TrustCard factId="delivery-estimate" title={verifiedLabel} icon={<TruckIcon />} />` |
| 25 | Reuse policy | Only verified operational facts; marketing value propositions use a different pattern. |
| 26 | Prohibited usage | Invented returns/free delivery/security claims, logo badges from unapproved providers, misleading omission of terms. |
| 27 | Acceptance criteria | Evidence traced, wording accurate, minimum section gate, contrast/long-copy pass. |
| 28 | Required tests | Fact omission/minimum gate, icon semantics, optional link, long copy, data adapter and truth review. |

## 4.19 ReviewCard

**Primary status:** Gated — Requires backend, approved content, or business data
**Gate:** real moderated published reviews, consented attribution and approved source

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Present a legitimate customer review with enough source/context to assess it. |
| 2 | Current implementation status | No review schema, moderation source or component. |
| 3 | Owner/module | Future reviews domain; shared presentation only after backend exists. |
| 4 | Recommended file location | Future `src/modules/reviews/components/review-card.tsx`; do not create during Homepage V2 without gate. |
| 5 | Public props/API | Future `review: PublishedReviewView`, optional placement/position; fields include safe review ID, excerpt/full text policy, attribution, product link and published context. |
| 6 | Required props | Moderated review ID/text, approved attribution, publication status and provenance. |
| 7 | Optional props | Product link, rating only if source/scale valid, expansion control for long text. |
| 8 | Variants | `standard`; no anonymous decorative testimonial variant. |
| 9 | Sizes | Three/two/one-column layouts; text grows naturally; no forced equal height that hides text. |
| 10 | Visual states | Default, long text, expanded, no product link; unapproved/removed omitted. |
| 11 | Interaction states | Optional native product link or accessible disclosure; no auto-carousel. |
| 12 | Loading state | Up to approved count of matched skeletons only if future read streams. |
| 13 | Empty/Error handling | Entire section omitted until enough approved data; fetch failure omits/recovery-logs safely rather than showing fabricated fallback. |
| 14 | Accessibility contract | Quote semantics where appropriate, readable attribution, star/rating accessible text if ever approved, disclosure state announced. |
| 15 | Keyboard behavior | Native links/disclosure; no swipe-only content. |
| 16 | Responsive behavior | Stack in source order; text not truncated without explicit accessible expansion. |
| 17 | Motion behavior | No auto-rotation; minimal expansion/elevation; reduced-motion static. |
| 18 | Content limits | Excerpts cannot change meaning; no editing that turns mixed/negative context into false endorsement. |
| 19 | Composition rules | Future Review section supplies moderated DTO; card does not fetch or infer “verified purchase.” |
| 20 | Dependencies | Approved reviews domain/data/privacy policy; no third-party widget/script without separate review. |
| 21 | Server vs Client boundary | Server card; optional disclosure is small client leaf/native `<details>` when suitable. |
| 22 | Analytics responsibilities | `review_product_select`/`review_expand` with review ID, product key, position; never review text or reviewer PII. |
| 23 | Performance requirements | No third-party script; bounded query/fields; no review image priority. |
| 24 | Usage examples | Not authorized for Homepage V2 until the gate passes. |
| 25 | Reuse policy | Published review presentation only; brand-authored testimonials are not relabeled reviews. |
| 26 | Prohibited usage | Hard-coded testimonial, fake rating, invented “verified,” hidden unfavorable context, third-party embed without privacy/CSP/budget approval. |
| 27 | Acceptance criteria | Provenance/moderation/consent/backend all approved; structured data only when valid; full accessibility and truth review. |
| 28 | Required tests | Publication/moderation filters, attribution/privacy, rating semantics, long text/expand, omission/failure and structured-data consistency. |

## 4.20 BrandStory

**Primary status:** Gated — Requires backend, approved content, or business data
**Gate:** approved brand identity, story copy, claim evidence and optional media

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Explain the approved brand reason-to-exist and values without displacing product discovery. |
| 2 | Current implementation status | No component; current footer contains generic “Everyday essentials” copy not approved as V2 brand strategy. |
| 3 | Owner/module | Shared storefront section; Product Owner owns content. |
| 4 | Recommended file location | `src/components/storefront/brand-story.tsx` or homepage section location after ownership review. |
| 5 | Public props/API | `heading`, `body`, optional `action`, `media`, `storyId`, `variant`. |
| 6 | Required props | Approved heading/body and stable story ID. |
| 7 | Optional props | Approved media/alt, live About action. |
| 8 | Variants | `split`, `text-only`; wireframe/content choose. |
| 9 | Sizes | Reading measure 65–72 characters; container/grid and 24–48 px internal spacing. |
| 10 | Visual states | Complete, text-only, media failure, long copy. |
| 11 | Interaction states | Optional native About/story link only. |
| 12 | Loading state | Approved copy renders server-side; media reserves geometry; no story skeleton. |
| 13 | Empty/Error handling | Missing approval returns `null`; failed media falls back to text-only if approved; invalid action omitted. |
| 14 | Accessibility contract | Logical heading, readable paragraphs, meaningful/decorative media alt, descriptive action. |
| 15 | Keyboard behavior | Native action link. |
| 16 | Responsive behavior | Split to stack without changing source order; no fixed text height; Bengali expansion supported. |
| 17 | Motion behavior | Static or restrained decorative reveal; no parallax/continuous liquid animation. |
| 18 | Content limits | Concise homepage excerpt; full history belongs on live About page; no unsupported sustainability/local/quality claim. |
| 19 | Composition rules | SectionHeader/heading, prose, Button/Link, ProductImage/media; separate from promotional content. |
| 20 | Dependencies | Approved Content/Media Guide, Next Link/Image, DDS editorial tokens. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | Optional `brand_story_select` with story ID/destination; no scroll/view tracking by default. |
| 23 | Performance requirements | Below-fold image lazy; static HTML; no remote storytelling widget/video. |
| 24 | Usage examples | `<BrandStory heading={copy.heading} body={copy.body} storyId="brand-v1" />` after approval. |
| 25 | Reuse policy | Homepage brand excerpt only; other editorial pages may reuse anatomy with their own approved spec. |
| 26 | Prohibited usage | AI-invented mission, generic placeholder story, unsupported claims, text embedded in image, auto-play media. |
| 27 | Acceptance criteria | Owner approval recorded, claims evidenced, text-only fallback and responsive/reading tests pass. |
| 28 | Required tests | Gate/omission, optional media/action, heading hierarchy, long copy, alt, responsive visual and content approval evidence. |

## 4.21 NewsletterForm

**Primary status:** Gated — Requires backend, approved content, or business data
**Gate:** consent copy, privacy route, validated persistence, deduplication, unsubscribe,
abuse protection and operational owner

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Collect an explicitly consented email subscription for a defined value and frequency. |
| 2 | Current implementation status | No form, backend, database, privacy page or unsubscribe capability. |
| 3 | Owner/module | Future marketing/subscriptions domain; not accounts or notifications by assumption. |
| 4 | Recommended file location | Future owning module component after architecture approval; do not create as a disconnected shared form. |
| 5 | Public props/API | Future `action`, `heading`, `description`, `frequency`, `privacyHref`, `placement`, `formId`; input state and typed result. |
| 6 | Required props | Approved value/frequency/consent text, live privacy link and real validated server action. |
| 7 | Optional props | Initial email only from safe user context and never URL; secondary disclosure. |
| 8 | Variants | `inline`, `panel`; Homepage wireframe determines one. |
| 9 | Sizes | Input/submit 48 px standard; inline desktop, stacked compact; touch targets >=44 px. |
| 10 | Visual states | Idle, focus, pending, success, duplicate-safe success, validation error, recoverable server error. |
| 11 | Interaction states | Submit once per pending operation; preserve email on recoverable error; authoritative result from server. |
| 12 | Loading state | Button/region pending with stable geometry; no fake progress; input may remain readable. |
| 13 | Empty/Error handling | Inline field error connected to input; form-level safe error; backend unavailable omits entire section before interaction or gives explicit retry. |
| 14 | Accessibility contract | Real email label, `type=email`, `autocomplete=email`, described privacy/consent, focused error summary when appropriate, status announcement. |
| 15 | Keyboard behavior | Logical input-submit-link order; Enter submits once; focus remains/pivots to actionable error/success appropriately. |
| 16 | Responsive behavior | Inline layout stacks at content need; email is never clipped; 400% reflow and on-screen keyboard pass. |
| 17 | Motion behavior | Pending/success state transition only; no confetti; reduced motion preserves feedback. |
| 18 | Content limits | One email field; no prechecked marketing consent; frequency and value explicit. |
| 19 | Composition rules | Composes Input, Button, inline Error/Status and privacy link; action/domain lives outside presentation. |
| 20 | Dependencies | Approved server action/schema/rate limit/storage/privacy/unsubscribe; no email vendor SDK in client. |
| 21 | Server vs Client boundary | Server section plus minimal client form/action state. Validation repeats server-side. |
| 22 | Analytics responsibilities | Attempt/success/error category and placement only; never email, raw error, identity or consent content. |
| 23 | Performance requirements | No third-party client script; bounded action; rate limiting persistent; no homepage bundle vendor cost. |
| 24 | Usage examples | Not authorized until all gates pass. |
| 25 | Reuse policy | Only the approved subscription domain uses it; account email collection is a different purpose. |
| 26 | Prohibited usage | Fake success, localStorage-only subscription, email in URL/analytics/log, missing unsubscribe/privacy, prechecked consent, client-only validation. |
| 27 | Acceptance criteria | Legal/product/backend/abuse gates approved; duplicate and unsubscribe behavior verified; privacy/security review passes. |
| 28 | Required tests | Validation, pending repeat submit, success/duplicate/error, PII exclusion, rate limit, keyboard/screen reader, reflow and integration with persistence/unsubscribe. |

## 4.22 Footer

**Primary status:** Existing — Refactor before reuse
**Migration input:** route-local `SiteFooter` in `src/app/(shop)/layout.tsx`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Provide durable shopping, order recovery, account, contact, policy and brand navigation at the page end. |
| 2 | Current implementation status | Inline footer has brand copy, category links, search, order tracking, account/security, configured contact and payment line. It is not exported and final branding/policies are incomplete. |
| 3 | Owner/module | Shared storefront shell; route/config/domain owners supply live links/facts. |
| 4 | Recommended file location | `src/components/storefront/site-footer.tsx` plus small link-group helper if justified. |
| 5 | Public props/API | `brand`, `groups`, `contact`, `operationalFacts`, optional official social links; all destinations prevalidated. |
| 6 | Required props | Approved brand identity and at least recovery/shop destinations. |
| 7 | Optional props | Category groups, configured contacts, payment/delivery facts, policies only when routes exist, official social links. |
| 8 | Variants | `storefront`; no page-specific footer forks. |
| 9 | Sizes | 2-column compact to 4-column desktop; 44 px links; 48–80 px vertical region spacing per wireframe. |
| 10 | Visual states | Full, partial groups, no categories/contact, long labels, link focus. |
| 11 | Interaction states | Native internal/external/mail/tel links; external behavior and indicator consistent. |
| 12 | Loading state | Cached categories/config resolve on server; no footer spinner. Essential recovery links render independently of optional groups. |
| 13 | Empty/Error handling | Empty groups omitted; failure of categories/contact does not remove brand/order recovery; no dead route placeholders. |
| 14 | Accessibility contract | `<footer>` landmark; each navigation group distinctly labelled by heading; list semantics; contact text meaningful. |
| 15 | Keyboard behavior | Native links, logical group order, visible focus and no keyboard trap. |
| 16 | Responsive behavior | Groups reflow/stack without horizontal scroll; long Bengali/email labels wrap; no fixed height. |
| 17 | Motion behavior | Link state only; no entrance/accordion by default. |
| 18 | Content limits | Only live useful links; concise approved brand copy; no wall of future routes. |
| 19 | Composition rules | Brand block + `FooterLinkGroup[]` + optional operational/contact row; data loading remains parent/server adapter. |
| 20 | Dependencies | Next Link, env/config adapters, cached categories, DDS tokens. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | Approved `footer_link_select` with group/destination/viewport; no contact value or user context. |
| 23 | Performance requirements | Static HTML/CSS, no third-party social/payment badges or scripts; stable render. |
| 24 | Usage examples | `<SiteFooter brand={brand} groups={liveGroups} contact={configuredContact} />` |
| 25 | Reuse policy | All storefront routes share it; account pages should join storefront shell when separately approved. |
| 26 | Prohibited usage | 404/future links, hard-coded false contact/payment claims, admin links, unapproved social profiles, remote badges, dynamic current year requiring client JS. |
| 27 | Acceptance criteria | Every link resolves; minimum recovery survives partial data; keyboard/zoom/long content and theme tests pass. |
| 28 | Required tests | Link-group omission, configured contact, destination crawl/smoke, landmark/headings, 320–1920 visual, keyboard and axe. |

## 4.23 Badge

**Primary status:** New — Required for Homepage V2
**Migration inputs:** inline sold-out and cart-count badges

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Display a compact status or approved merchandising label without becoming the source of that truth. |
| 2 | Current implementation status | No generic component. Product sold-out and cart count are inline, semantically different patterns. |
| 3 | Owner/module | Shared visual primitive; domain supplies tone/label and validity. |
| 4 | Recommended file location | `src/components/ui/badge.tsx`; CartBadge count remains cart-domain composition. |
| 5 | Public props/API | `children`, `tone`, `size`, optional icon; semantic content only. |
| 6 | Required props | Visible non-empty label. |
| 7 | Optional props | `tone`, `size`, decorative icon, className for placement. |
| 8 | Variants | `neutral`, `brand`, `info`, `success`, `warning`, `danger`; tone chosen from validated state map. |
| 9 | Sizes | 20–28 px visual height; interactive badges are prohibited—use a control/chip. |
| 10 | Visual states | Static; state changes supplied by parent; no hover/focus unless contained in a link. |
| 11 | Interaction states | None. Cart count is part of link accessible name, not separately focusable. |
| 12 | Loading state | None; unknown state omits badge rather than showing placeholder fact. |
| 13 | Empty/Error handling | Empty label returns nothing/fails development; invalid tone falls back only via type safety. |
| 14 | Accessibility contract | Text conveys meaning; icon decorative; color not sole distinction; parent link name includes meaningful dynamic count/status where needed. |
| 15 | Keyboard behavior | N/A; inherited focus context only. |
| 16 | Responsive behavior | May wrap label but not clip meaning; compact badges do not cause page overflow. |
| 17 | Motion behavior | No pulse/bounce; brief opacity change only for truthful updates if announced by owner. |
| 18 | Content limits | 1–3 words, usually <=20 characters; full terms elsewhere. |
| 19 | Composition rules | May overlay media with safe contrast or sit inline; at most one primary merchandising badge plus separate stock status. |
| 20 | Dependencies | DDS feedback/commerce tokens; optional inline icon. |
| 21 | Server vs Client boundary | Server-compatible. |
| 22 | Analytics responsibilities | None. |
| 23 | Performance requirements | Pure HTML/CSS; zero JS and stable geometry. |
| 24 | Usage examples | `<Badge tone="neutral">Sold out</Badge>` |
| 25 | Reuse policy | Use for validated labels/status across UI; domain mapping is centralized outside component. |
| 26 | Prohibited usage | Invented “Best seller,” “Verified,” “Low stock,” discount or urgency; raw database status as tone/class; interactive badge. |
| 27 | Acceptance criteria | Text/color semantics, contrast, overlay readability, long label and forced-colors pass. |
| 28 | Required tests | Tone rendering, label/icon semantics, empty content, contrast snapshots, product-card composition and no-interaction assertion. |

## 4.24 Breadcrumb

**Primary status:** Future — Not part of Homepage V2
**Migration input:** category hierarchy supports at most two levels, but no reusable UI exists

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Show hierarchical location and provide routes back to meaningful ancestors. |
| 2 | Current implementation status | No reusable component detected. |
| 3 | Owner/module | Shared storefront navigation pattern; route supplies hierarchy. |
| 4 | Recommended file location | Future `src/components/storefront/breadcrumb.tsx`. |
| 5 | Public props/API | `items: BreadcrumbItem[]`, `ariaLabel="Breadcrumb"`; final item is current page. |
| 6 | Required props | At least two accurate items when rendered. |
| 7 | Optional props | Truncation label only with full accessible name; JSON-LD remains route metadata responsibility. |
| 8 | Variants | `standard`, future `compact`; no Homepage variant. |
| 9 | Sizes | 44 px practical links on touch; visual type `sm`; separators 14–16 px. |
| 10 | Visual states | Default, current, long path, overflow handling. |
| 11 | Interaction states | Ancestors are native links; current item not a link. |
| 12 | Loading state | None; hierarchy known server-side. |
| 13 | Empty/Error handling | Invalid/incomplete hierarchy omits component; never guesses ancestors. |
| 14 | Accessibility contract | `<nav aria-label="Breadcrumb"><ol>`; separators decorative; current item `aria-current="page"`. |
| 15 | Keyboard behavior | Native links in hierarchy order. |
| 16 | Responsive behavior | Wraps or uses approved visual truncation without losing accessible names; no page overflow. |
| 17 | Motion behavior | None. |
| 18 | Content limits | Reflect real maximum hierarchy; do not add marketing crumbs. |
| 19 | Composition rules | Route data maps to Link items; metadata helper separately emits matching structured data. |
| 20 | Dependencies | Next Link, route hierarchy, DDS nav tokens. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | Normally none; normal page navigation analytics may observe destination externally. |
| 23 | Performance requirements | Static HTML/CSS, no client JS. |
| 24 | Usage examples | Future: `<Breadcrumb items={[home, category, product]} />`. |
| 25 | Reuse policy | Category/product/detail routes after their wireframes are approved. |
| 26 | Prohibited usage | Homepage rendering, inaccurate hierarchy, linked current item, CSS-only separators announced by AT. |
| 27 | Acceptance criteria | UI and JSON-LD hierarchy match; links resolve; wrap/zoom and screen reader pass. |
| 28 | Required tests | List/nav/current semantics, destinations, long labels, structured-data parity, responsive and axe. |

## 4.25 Pagination

**Primary status:** Future — Not part of Homepage V2
**Migration inputs:** inline pagination patterns in category/search/admin routes

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Navigate bounded result pages with crawlable, shareable URL state. |
| 2 | Current implementation status | Paging behavior exists inline across routes; no shared API and not part of Homepage V2. |
| 3 | Owner/module | Shared navigation pattern; route/domain owns page count and query serialization. |
| 4 | Recommended file location | Future `src/components/ui/pagination.tsx` plus route-safe URL helper in appropriate layer. |
| 5 | Public props/API | `page`, `pageCount`, `getHref`, `ariaLabel`, optional sibling count; URL builder preserves approved filters. |
| 6 | Required props | Valid current page/count and deterministic href builder. |
| 7 | Optional props | First/last controls, compact label; never arbitrary rendered URL strings from untrusted input. |
| 8 | Variants | `numbered`, `compact`; chosen by future wireframe. |
| 9 | Sizes | Controls >=44 px on touch; spacing 8 px; bounded group. |
| 10 | Visual states | First/last disabled omission, current page, ellipsis, single page omitted, invalid page recovered by route. |
| 11 | Interaction states | Native links; current page non-link or `aria-current`; no client-only authority. |
| 12 | Loading state | Route Suspense/result skeleton owns transition; controls remain understandable. |
| 13 | Empty/Error handling | Zero/single page omits; invalid values normalized by validator; error never creates broken links. |
| 14 | Accessibility contract | Named `<nav>`, accessible previous/next labels, current page, ellipsis hidden or described appropriately. |
| 15 | Keyboard behavior | Native links; focus remains predictable after navigation, results heading focus policy route-owned. |
| 16 | Responsive behavior | Compact range on narrow screens without removing previous/next; no horizontal page scroll. |
| 17 | Motion behavior | None; result replacement may use stable skeleton. |
| 18 | Content limits | Bounded visible pages around current; do not render thousands of links. |
| 19 | Composition rules | Pure navigation receives URL builder; never fetches results. |
| 20 | Dependencies | Next Link, validated search params, DDS Button/IconButton recipe. |
| 21 | Server vs Client boundary | Server component. |
| 22 | Analytics responsibilities | Optional `pagination_select` with page/placement; raw search query excluded. |
| 23 | Performance requirements | Static links, bounded DOM, cache-friendly URLs. |
| 24 | Usage examples | Future: `<Pagination page={2} pageCount={8} getHref={buildHref} />`. |
| 25 | Reuse policy | Category/search/admin only after route-specific wireframes and URL rules. |
| 26 | Prohibited usage | Homepage, load-more pretending to be crawlable pagination, invalid filter loss, disabled link with clickable href. |
| 27 | Acceptance criteria | Canonical URL state, boundary pages, keyboard/screen reader, responsive range and crawler behavior pass. |
| 28 | Required tests | Page ranges, first/last/single, href serialization, current semantics, query preservation, keyboard and responsive visual. |

## 4.26 Skeleton

**Primary status:** Existing — Refactor before reuse
**Migration inputs:** multiple route `loading.tsx` files and search `GridSkeleton`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Preserve expected geometry while content is genuinely pending without resembling false content. |
| 2 | Current implementation status | Several local skeleton blocks exist; no shared primitive/token contract. |
| 3 | Owner/module | Shared visual primitive; layouts compose it locally. |
| 4 | Recommended file location | `src/components/ui/skeleton.tsx`; domain/page skeletons remain colocated and compose it. |
| 5 | Public props/API | `shape`, optional width/height/aspectRatio via approved semantic classes, `className` for documented geometry, `ariaHidden` default true. |
| 6 | Required props | Stable geometry via shape/class/aspect context. |
| 7 | Optional props | `shape: text\|circle\|block\|media`; animation disabled by reduced motion. |
| 8 | Variants | `text`, `media`, `control`, `avatar`; not content-specific facts. |
| 9 | Sizes | Mirrors final component exactly; arbitrary height allowed only when derived from documented target geometry. |
| 10 | Visual states | Static reduced-motion; subtle pulse/shimmer normal only if performance safe. |
| 11 | Interaction states | None; never focusable/clickable. |
| 12 | Loading state | This is the loading visual; parent supplies one concise status where needed. |
| 13 | Empty/Error handling | Skeleton disappears when resolved; timeout/error transitions to ErrorState, never remains forever. |
| 14 | Accessibility contract | Decorative skeleton hidden from AT; parent region may use `aria-busy`; avoid announcing every block. |
| 15 | Keyboard behavior | N/A and absent from tab order. |
| 16 | Responsive behavior | Geometry changes with same grid/layout rules as final content. |
| 17 | Motion behavior | Subtle opacity/gradient only; no large shimmer; animation removed under reduced motion. |
| 18 | Content limits | Render only likely visible item count; no excessive full-page placeholder DOM. |
| 19 | Composition rules | Domain `ProductGridSkeleton`, header fallback and page loading states compose primitive shapes. |
| 20 | Dependencies | CSS only, DDS surface/motion/radius tokens. |
| 21 | Server vs Client boundary | Server-compatible. |
| 22 | Analytics responsibilities | None; loading timing belongs performance telemetry, not Skeleton. |
| 23 | Performance requirements | Zero JS, stable geometry/CLS, bounded DOM, no expensive filter/large gradient animation. |
| 24 | Usage examples | `<Skeleton shape="media" className="aspect-square rounded-lg" />` |
| 25 | Reuse policy | Reuse primitive geometry; keep domain skeleton compositions near their final components. |
| 26 | Prohibited usage | Fake text, interactive placeholder, indefinite shimmer after error, mismatch final layout, priority image placeholder duplication. |
| 27 | Acceptance criteria | Final swap causes no meaningful CLS; reduced-motion/static and AT behavior pass. |
| 28 | Required tests | Hidden semantics, no focus, reduced motion, matched component visual diff and loading-to-content CLS check. |

## 4.27 LoadingState

**Primary status:** Existing — Refactor before reuse
**Migration inputs:** route loading files, Suspense fallbacks and pending form labels

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Communicate truthful pending work while preserving layout and available actions. |
| 2 | Current implementation status | Many route-local states exist; no shared composition or announcement rule. |
| 3 | Owner/module | Shared pattern with domain/page-specific geometry. |
| 4 | Recommended file location | `src/components/ui/loading-state.tsx` for status wrapper; specific skeleton compositions stay with domain/page. |
| 5 | Public props/API | `label`, `children`, `mode: inline\|region\|page`, `isBusy`, optional live policy. |
| 6 | Required props | Concise truthful label when AT announcement is needed; matched visual child. |
| 7 | Optional props | Skeleton child, retry threshold owned by parent, mode. |
| 8 | Variants | `inline`, `region`, `page`; not decorative spinners by color. |
| 9 | Sizes | Mirrors owned region; inline indicator fits control without resizing it. |
| 10 | Visual states | Pending then resolved/error; delayed visual may prevent flash only if accessibility remains truthful. |
| 11 | Interaction states | Non-blocking areas remain usable; pending action prevents repeat where required. |
| 12 | Loading state | Uses `aria-busy` on owned region and restrained status; never claims percent without actual progress. |
| 13 | Empty/Error handling | Resolution selects content/EmptyState/ErrorState; loading is not empty or failure. |
| 14 | Accessibility contract | Avoid repeated live announcements; `role=status` only where useful; focus stays stable. |
| 15 | Keyboard behavior | Does not steal focus; disabled/pending controls remain understandable. |
| 16 | Responsive behavior | Same layout geometry and breakpoints as final content. |
| 17 | Motion behavior | Spinner/pulse stops under reduced motion or becomes static; no fake progress bar. |
| 18 | Content limits | Short label; no marketing message disguised as loading. |
| 19 | Composition rules | Wraps Skeleton/domain fallback; route/page owns boundary and timing. |
| 20 | Dependencies | Skeleton and DDS feedback/motion tokens. |
| 21 | Server vs Client boundary | Server-compatible for Suspense fallback; action pending may be client leaf. |
| 22 | Analytics responsibilities | None. Performance instrumentation measures boundary duration externally. |
| 23 | Performance requirements | Zero/near-zero JS, stable layout, render only necessary skeleton DOM. |
| 24 | Usage examples | `<LoadingState mode="region" label="Loading products"><ProductGridSkeleton /></LoadingState>` |
| 25 | Reuse policy | Use for true async boundaries; simple instant server output needs no loading state. |
| 26 | Prohibited usage | Simulated delay, fake percentage, focus theft, indefinite state after failure, full-page blocker for independent section. |
| 27 | Acceptance criteria | Boundary swap stable, correct announcement, available controls remain accessible, reduced-motion pass. |
| 28 | Required tests | Busy/status semantics, focus stability, resolution/error transition, matched geometry and reduced-motion behavior. |

## 4.28 EmptyState

**Primary status:** Existing — Refactor before reuse
**Migration input:** route-local empty panels including current Homepage admin link

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Explain a genuine absence and offer the safest useful recovery without implying failure. |
| 2 | Current implementation status | Inline empty states exist. Current Homepage exposes “Go to admin,” which is prohibited for customer V2. |
| 3 | Owner/module | Shared presentational pattern; page/domain owns meaning and recovery. |
| 4 | Recommended file location | `src/components/ui/empty-state.tsx`. |
| 5 | Public props/API | `title`, `description?`, `icon?`, `primaryAction?`, `secondaryAction?`, `size`. |
| 6 | Required props | Clear non-blaming title. |
| 7 | Optional props | Description, decorative icon/illustration, one primary and one secondary valid recovery. |
| 8 | Variants | `compact`, `standard`; tone remains neutral. |
| 9 | Sizes | Compact inline or standard panel; actions >=44 px; readable measure. |
| 10 | Visual states | With/without action, long text, no illustration. |
| 11 | Interaction states | Native recovery links/buttons with real behavior. |
| 12 | Loading state | N/A; empty renders only after authoritative absence is known. |
| 13 | Empty/Error handling | This is empty handling; error content uses ErrorState. Optional homepage sections usually omit instead of showing empty state. |
| 14 | Accessibility contract | Appropriate heading in context, decorative icon hidden, actions descriptively named. |
| 15 | Keyboard behavior | Native actions and logical order. |
| 16 | Responsive behavior | Centered/left layout follows parent; text/actions wrap/stack at 320 px; no fixed height. |
| 17 | Motion behavior | None or static illustration; no sad/attention loop. |
| 18 | Content limits | Concise explanation and next action; no internal/admin terminology. |
| 19 | Composition rules | May compose SectionHeader-level text, Button/Link and approved illustration; page decides one empty state for entire catalog. |
| 20 | Dependencies | Shared Button/Link, DDS feedback/spacing; optional approved local asset. |
| 21 | Server vs Client boundary | Server-compatible. |
| 22 | Analytics responsibilities | Recovery action event belongs to page; no automatic empty-state view event. |
| 23 | Performance requirements | Static; illustration optional and optimized; zero JS. |
| 24 | Usage examples | `<EmptyState title="No products available yet" description="Please check back soon." />` |
| 25 | Reuse policy | Use after verified empty result where guidance helps; optional Homepage sections generally return `null`. |
| 26 | Prohibited usage | Admin link/customer debug detail, fake empty while loading, blaming user, dead CTA, decorative error tone. |
| 27 | Acceptance criteria | Correct absence vs error, customer-safe copy, recovery works, compact/zoom/theme pass. |
| 28 | Required tests | With/without actions, heading semantics, optional omission policy, long content, keyboard, axe and no-admin-link assertion. |

## 4.29 ErrorState

**Primary status:** Existing — Refactor before reuse
**Migration input:** inline `role=alert` messages across forms/modules

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Explain a safe error category and provide a valid retry, correction or alternative path. |
| 2 | Current implementation status | Many inline alerts exist; no shared severity/recovery/focus contract or route error boundary UI. |
| 3 | Owner/module | Shared presentation; domain maps internal failures to display-safe errors. |
| 4 | Recommended file location | `src/components/ui/error-state.tsx`; route `error.tsx` remains route-owned and composes it. |
| 5 | Public props/API | `title`, `description`, `tone`, `retry?`, `recoveryAction?`, `errorId?`, `mode`. |
| 6 | Required props | Safe title/description; at least one path when recovery is possible. |
| 7 | Optional props | Retry callback/button, alternate link, correlation ID only if support policy approves. |
| 8 | Variants | `inline`, `region`, `page`; tone usually danger or warning based on meaning. |
| 9 | Sizes | Inline fits field/form; region/page uses readable measure and 44 px recovery controls. |
| 10 | Visual states | Initial error, retry pending, repeat failure, recovered/unmounted. |
| 11 | Interaction states | Retry is idempotent/safe and disabled while pending; destructive recovery never implied. |
| 12 | Loading state | Retry action shows pending locally while preserving error context. |
| 13 | Empty/Error handling | This component renders mapped errors, never raw thrown objects; unknown failures use generic safe message. |
| 14 | Accessibility contract | `role=alert` for newly occurring actionable errors; static page errors may use heading/region without aggressive announcement; focus policy context-specific. |
| 15 | Keyboard behavior | Focus moves to form summary/page error only when it helps; retry/action native. |
| 16 | Responsive behavior | Copy/actions wrap/stack; raw long provider messages never reach layout. |
| 17 | Motion behavior | No shake; state change via color/opacity only; reduced motion honored. |
| 18 | Content limits | Plain safe language; no stack, SQL, provider payload, secret, PII or existence-sensitive auth detail. |
| 19 | Composition rules | Form field errors stay Input-level; form/region/page errors use this pattern; logging is external. |
| 20 | Dependencies | Button/Link, feedback tokens; route/client boundary as required for retry. |
| 21 | Server vs Client boundary | Static server-compatible; retry callback requires small client wrapper or route error boundary. |
| 22 | Analytics responsibilities | Approved error category/placement only; no raw message, stack, query or PII. |
| 23 | Performance requirements | Static/lightweight; no remote support widget. |
| 24 | Usage examples | `<ErrorState mode="region" title="Products could not load" recoveryAction={retry} />` |
| 25 | Reuse policy | Central display pattern after errors are safely mapped by owner. |
| 26 | Prohibited usage | Raw exception, retry for non-idempotent mutation, alert spam, auto-reload loop, color-only meaning. |
| 27 | Acceptance criteria | Safe mapping, correct focus/announcement, retry behavior, recovery route and theme/zoom pass. |
| 28 | Required tests | Safe fallback, alert/heading semantics, retry pending/repeat, focus policy, no sensitive text, keyboard and axe. |

## 4.30 Toast

**Primary status:** Future — Not part of Homepage V2

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Provide non-blocking transient confirmation for a completed action when inline feedback would be less clear. |
| 2 | Current implementation status | No toast provider/component/dependency. Current mutations use inline result messages. |
| 3 | Owner/module | Future shared feedback system. |
| 4 | Recommended file location | Future `src/components/ui/toast/` only after a real cross-route need and architecture approval. |
| 5 | Public props/API | Future typed `toast({ title, description?, tone, action?, duration? })`; IDs for deduplication. |
| 6 | Required props | Concise title and semantic tone. |
| 7 | Optional props | Description, safe undo/action, bounded duration, persistent critical flag only when justified. |
| 8 | Variants | `info`, `success`, `warning`, `danger`; no marketing/promotional toast. |
| 9 | Sizes | Bounded width and stack; controls >=44 px; safe inset. |
| 10 | Visual states | Entered, visible, action, dismissed, timed out, stacked/deduplicated. |
| 11 | Interaction states | Pause timeout on hover/focus where appropriate; dismiss action; keyboard reachable without stealing focus. |
| 12 | Loading state | Toast never represents indefinite pending; use inline LoadingState. |
| 13 | Empty/Error handling | Empty content invalid; repeated identical messages deduplicated; critical errors also persist inline. |
| 14 | Accessibility contract | Appropriate polite/assertive live region, no focus theft, enough reading time, persistent alternative for critical information. |
| 15 | Keyboard behavior | Action/dismiss reachable; Escape policy must not conflict with modal/drawer; focus not moved automatically. |
| 16 | Responsive behavior | Bottom/top safe placement avoids mobile browser/navigation; stack bounded and readable at 320 px. |
| 17 | Motion behavior | Transform/opacity 180–240 ms; reduced-motion instant; no bouncing. |
| 18 | Content limits | Short title/one sentence; no multi-step content or legal terms. |
| 19 | Composition rules | Global viewport/provider plus item; domain decides message; inline errors remain authoritative. |
| 20 | Dependencies | No library approved. Native/CSS implementation or dependency requires separate evaluation. |
| 21 | Server vs Client boundary | Client system invoked only from interactive results; server actions return typed outcome. |
| 22 | Analytics responsibilities | None by default; action outcome already measured at source. |
| 23 | Performance requirements | Provider not added to Homepage V2; future bundle budget <=5 KB gzip target absent approved exception. |
| 24 | Usage examples | Not authorized for Homepage V2. |
| 25 | Reuse policy | Future transient feedback only after inline-first review. |
| 26 | Prohibited usage | Form validation, checkout/payment authority, promotions, infinite duration without reason, toast-only critical error. |
| 27 | Acceptance criteria | Future entry gate, accessibility timing/live behavior, stacking and bundle evidence pass. |
| 28 | Required tests | Future queue/dedupe/timing, hover/focus pause, live region, action/dismiss, reduced motion, responsive and integration. |

## 4.31 Modal

**Primary status:** Future — Not part of Homepage V2
**Migration input:** domain-specific zoom dialog in `ProductGallery`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Hold a focused blocking decision or detail that cannot remain safely inline. |
| 2 | Current implementation status | No generic primitive. Product gallery implements local dialog-like zoom; refactoring it is outside Homepage scope. |
| 3 | Owner/module | Future shared UI primitive; domain wrappers own purpose and actions. |
| 4 | Recommended file location | Future `src/components/ui/modal.tsx` or folder after approved use cases. |
| 5 | Public props/API | Controlled `open`, `onOpenChange`, `title`, `description?`, `children`, optional footer/size/initial focus/dismiss policy. |
| 6 | Required props | Controlled state, accessible title and meaningful content. |
| 7 | Optional props | Description, size, footer, close label, initial/return focus. |
| 8 | Variants | `sm`, `md`, `lg`, `media`; semantics stay consistent. |
| 9 | Sizes | Width bounded by viewport and reading task; height uses safe inset/internal scrolling; controls >=44 px. |
| 10 | Visual states | Closed, entering, open, exiting, internal pending/error. |
| 11 | Interaction states | Background inert/scroll locked; safe scrim dismissal; nested modal prohibited. |
| 12 | Loading state | Modal shell/title remain; content owns matched LoadingState. |
| 13 | Empty/Error handling | Empty modal invalid; errors remain visible with recovery; failure must not trap user. |
| 14 | Accessibility contract | `role=dialog`, `aria-modal`, title/description relationships, focus trap/restore, close control. |
| 15 | Keyboard behavior | Escape closes when allowed; Tab containment; focus enters intentional control/content and returns. |
| 16 | Responsive behavior | Becomes near-full-width/safe-height at compact sizes without unreachable content. |
| 17 | Motion behavior | Transform/opacity <=320 ms; reduced-motion instant; no animated blur. |
| 18 | Content limits | One task/decision; multi-step workflows need separate specification, not oversized generic props. |
| 19 | Composition rules | Scrim + surface + header/body/footer; trigger external; domain content separate. |
| 20 | Dependencies | No dialog library approved. Dependency requires focus/portal/SSR/bundle/security review. |
| 21 | Server vs Client boundary | Client primitive; may receive server-renderable children. |
| 22 | Analytics responsibilities | Owner records semantic open/complete/cancel where approved; generic Modal emits none. |
| 23 | Performance requirements | Not in Homepage bundle; future base <=6 KB gzip target absent exception; stable portal and cleanup. |
| 24 | Usage examples | Future only; ProductGallery retains domain implementation until approved refactor. |
| 25 | Reuse policy | Approved blocking overlays; simple disclosures stay inline/native details. |
| 26 | Prohibited usage | Homepage marketing popup, newsletter capture popup, nested dialogs, missing close/focus, destructive default action. |
| 27 | Acceptance criteria | Use case gate, focus/inert/scroll/viewport/reduced-motion and error recovery pass. |
| 28 | Required tests | Controlled state, focus trap/restore, Escape/scrim policy, scroll cleanup, nested prevention, SSR, axe and visual. |

## 4.32 ProductImage

**Primary status:** New — Required for Homepage V2
**Migration inputs:** inline Next Image/storage usage in ProductCard and ProductGallery

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Render optimized product/category/commerce media with stable geometry, truthful alt and customer-safe fallback. |
| 2 | Current implementation status | ProductCard and ProductGallery implement image behavior independently; no shared media contract. |
| 3 | Owner/module | Catalog domain for product media; shared media recipe may serve category/section assets without storage leakage. |
| 4 | Recommended file location | `src/modules/catalog/components/product-image.tsx` for product media; do not force unrelated hero/editorial data into catalog ownership. |
| 5 | Public props/API | `image: ImageDescriptor \| null`, `alt`, `aspectRatio`, `sizes`, `loading`, `fit`, `fallbackLabel?`, `qualityRole`. |
| 6 | Required props | Explicit alt decision, aspect ratio, sizes and loading intent. |
| 7 | Optional props | Image descriptor, fallback label, crop/focal point from Media Guide, className for container placement. |
| 8 | Variants | `product`, `category`, `editorial` only if one shared recipe remains semantically valid; otherwise separate wrappers. |
| 9 | Sizes | Stable aspect ratio; widths/crops defined by component placement and Media Guide. |
| 10 | Visual states | Loading, loaded, missing, failed, dark/light surrounding surface; image itself is not theme-inverted. |
| 11 | Interaction states | None in baseline; gallery zoom owns its own button and state. |
| 12 | Loading state | Reserved geometry and optional low-cost placeholder; only actual likely LCP uses eager/priority. |
| 13 | Empty/Error handling | Missing/failed media shows neutral fallback without broken icon or false image; product remains identifiable by adjacent text. |
| 14 | Accessibility contract | Meaningful concise alt or empty alt when genuinely decorative/redundant; never filename/SEO stuffing. |
| 15 | Keyboard behavior | Non-interactive image not focusable; interactive wrapper owns accessible control. |
| 16 | Responsive behavior | Correct `sizes`, crop/focal point and stable ratio at every wireframe mode; no unintended subject loss. |
| 17 | Motion behavior | Optional short opacity load and parent hover scale; reduced-motion static; no layout change. |
| 18 | Content limits | One source descriptor and alt decision; no text overlay embedded in image. |
| 19 | Composition rules | Parent card/gallery/hero owns link/control; storage URL construction stays server-side or in approved abstraction. |
| 20 | Dependencies | Next Image, storage abstraction, Cloudinary transformed URL, Media Guide. |
| 21 | Server vs Client boundary | Prefer server-compatible; interactive Gallery wrapper may be client. Provider secrets/knowledge never reach client. |
| 22 | Analytics responsibilities | None; parent interaction owns event. Image failure may enter safe operational telemetry without URL/PII leakage. |
| 23 | Performance requirements | AVIF/WebP negotiation, transformed dimensions, lazy below fold, one page LCP priority, zero CLS, no original camera file. |
| 24 | Usage examples | `<ProductImage image={image} alt={title} aspectRatio="1/1" sizes="(max-width:640px) 50vw,25vw" loading="lazy" />` |
| 25 | Reuse policy | Central contract for catalog images/fallback; editorial media may reuse low-level recipe, not catalog business API. |
| 26 | Prohibited usage | `priority` by grid index, empty `sizes`, raw original upload, client storage provider call, text-in-image, automatic dark inversion. |
| 27 | Acceptance criteria | Correct crop/alt/fallback/sizes/priority, no CLS and failure-safe appearance at all modes. |
| 28 | Required tests | Descriptor/null/failure, alt decisions, generated URL dimensions, sizes/priority rules, CLS/LCP evidence and visual crops. |

## 4.33 PriceDisplay

**Primary status:** New — Required for Homepage V2
**Migration input:** direct `formatBdt` output in ProductCard and other routes

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Present authoritative BDT price information consistently and accessibly. |
| 2 | Current implementation status | Money formatter exists and components render price directly; no reusable semantic presentation. |
| 3 | Owner/module | Shared commerce presentation or catalog domain pattern; money arithmetic/format stays `lib/money`. |
| 4 | Recommended file location | `src/components/commerce/price-display.tsx` or catalog component after boundary review; no money logic inside UI. |
| 5 | Public props/API | `amount`, `currency='BDT'`, `label?`, `compareAt?`, `size`, `availability`, `from?`; amounts remain integer poisha per system money rule. |
| 6 | Required props | Currency and authoritative amount, or explicit unavailable state. |
| 7 | Optional props | Valid compare-at amount, “from” semantic, screen-reader label, size. |
| 8 | Variants | `card`, `detail`, `summary`; no sale-color variant without valid compare data. |
| 9 | Sizes | Card `sm/base`, detail `xl+`, summary aligned/tabular where required. |
| 10 | Visual states | Current price, valid compare price, from-price, unavailable; discount label only supplied by approved calculation owner. |
| 11 | Interaction states | None. |
| 12 | Loading state | Parent skeleton matches text width; component never renders fake zero/placeholder price. |
| 13 | Empty/Error handling | Null/invalid amount maps to approved unavailable label; compare-at <= current is omitted and logged/tested by data owner. |
| 14 | Accessibility contract | Currency/value spoken clearly, visual line-through not sole meaning, “from” and unavailable text explicit. |
| 15 | Keyboard behavior | N/A. |
| 16 | Responsive behavior | BDT values wrap as a unit where possible; no overflow for large values; tabular numerals in aligned summaries. |
| 17 | Motion behavior | Price truth changes discretely; no rolling/count-up animation. |
| 18 | Content limits | One current and one valid comparison; no hidden fees/discount implication. |
| 19 | Composition rules | Consumes output/formatter from money utility; parent owns offer/availability semantics and legal terms. |
| 20 | Dependencies | `formatBdt`, semantic commerce tokens, no internationalization dependency until approved. |
| 21 | Server vs Client boundary | Server-compatible. |
| 22 | Analytics responsibilities | None; never expose price through an unapproved client event schema. |
| 23 | Performance requirements | Pure formatting/render; no client JS, no floating-point arithmetic, no layout animation. |
| 24 | Usage examples | `<PriceDisplay amount={pricePoisha} currency="BDT" from size="card" />` |
| 25 | Reuse policy | Use for customer-visible catalog/commerce price presentation; financial tables may use specialized dense format with same money utility. |
| 26 | Prohibited usage | Floating taka source, client-calculated discount, compare price without validity, `0` for missing, accent color as sole emphasis. |
| 27 | Acceptance criteria | Money invariant, large values, from/compare/unavailable semantics, screen-reader and theme pass. |
| 28 | Required tests | Format/value units, null/unavailable, compare validity, large/zero legitimate values, accessible text and snapshots. |

## 4.34 AddToCartControl

**Primary status:** Existing — Extend
**Current evidence:** `src/modules/cart/components/add-to-cart-button.tsx`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Request an authoritative cart addition for a validated variant and report the server result. |
| 2 | Current implementation status | Real client component; quantity fixed at one, no optimistic success, pending/added/error states, router refresh updates streamed CartBadge. |
| 3 | Owner/module | Cart domain. |
| 4 | Recommended file location | Extend current file or rename only in approved refactor with import migration; identity remains cart-owned. |
| 5 | Public props/API | `variantId`, `quantity?` only after approved quantity contract, `disabled`, `label?`, `placement`, result callback descriptor if needed. |
| 6 | Required props | Valid variant ID from server-authorized view. |
| 7 | Optional props | Disabled reason, visible label, className layout, approved placement; quantity stays one until explicitly expanded. |
| 8 | Variants | `primary`; future compact only with page wireframe. Homepage quick-add is not approved. |
| 9 | Sizes | Current 44 px meets minimum; V2 standard/large tokens based on PDP/cart context. |
| 10 | Visual states | Idle, pending, added confirmation, disabled/sold out, safe error. |
| 11 | Interaction states | Prevent repeat while pending; server validates stock/cart identity/quantity; refresh after success. |
| 12 | Loading state | Stable button geometry and truthful “Adding…”; no optimistic cart-count change. |
| 13 | Empty/Error handling | Missing variant blocks render/use; error remains inline `role=alert` and safe; state resets only intentionally. |
| 14 | Accessibility contract | Button name/state clear; error announced; disabled reason adjacent when necessary; success announced without relying on check mark. |
| 15 | Keyboard behavior | Native button; Space/Enter once while pending. |
| 16 | Responsive behavior | Full/fit width from parent; label does not clip; target >=44 px. |
| 17 | Motion behavior | Immediate pending state, brief confirmation; no bounce/cart-flight; reduced motion static. |
| 18 | Content limits | One deterministic action; variant/availability selected before activation. |
| 19 | Composition rules | May compose Button and inline ErrorState; VariantPicker owns variant selection; CartBadge remains separate server component. |
| 20 | Dependencies | Cart server action, Next router refresh, Button tokens, cart identity/service. |
| 21 | Server vs Client boundary | Small client leaf invoking server action; validation/mutation remains server. |
| 22 | Analytics responsibilities | Future approved attempt/success/error category with product/variant safe key and placement; never cart cookie/customer/stock detail. |
| 23 | Performance requirements | No optimistic rollback complexity; no extra cart fetch on client; one refresh after success; no dependency. |
| 24 | Usage examples | `<AddToCartControl variantId={selected.id} disabled={selected.stock === 0} placement="product_detail" />` |
| 25 | Reuse policy | Product detail/variant flows only under current contract; no homepage quick-add. |
| 26 | Prohibited usage | Client stock authority, optimistic success, payment/order action, raw server error, multiple concurrent calls, homepage use without approval. |
| 27 | Acceptance criteria | Stock failure/repeat click/success refresh/error/keyboard pass without false cart state. |
| 28 | Required tests | Action result branches, pending dedupe, inline alert/status, disabled variant, router refresh, keyboard and integration with authoritative cart. |

## 4.35 ThemeToggle

**Primary status:** Existing — Extend
**Current evidence:** `src/components/theme-toggle.tsx` and `theme-script.tsx`

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Let visitors switch between explicit light/dark while preserving system default before a choice. |
| 2 | Current implementation status | Real client control using `useSyncExternalStore`, pre-paint script, localStorage with privacy-mode fallback and OS following. Visual target is 36 px. |
| 3 | Owner/module | Shared UI/theme infrastructure. |
| 4 | Recommended file location | Keep `src/components/theme-toggle.tsx`; compose shared IconButton recipe without breaking pre-paint model. |
| 5 | Public props/API | Usually no props; optional className/placement descriptor only if needed. Theme semantics remain internal. |
| 6 | Required props | None. |
| 7 | Optional props | Layout class only; do not expose arbitrary theme values. |
| 8 | Variants | `icon`; future segmented system choice requires separate UX. |
| 9 | Sizes | 44 x 44 px target, 20 px icon; fixed footprint before hydration. |
| 10 | Visual states | Server unresolved/no icon with fixed space, light, dark, hover/focus/pressed. |
| 11 | Interaction states | Toggles explicit theme; label announces destination (“Switch to dark mode”), storage failure still applies current view. |
| 12 | Loading state | Server snapshot null preserves footprint; no spinner. |
| 13 | Empty/Error handling | localStorage/matchMedia failure degrades safely to current/default theme; never blocks page. |
| 14 | Accessibility contract | Native labeled button, correct title/name, decorative icon hidden, contrast/focus in both themes. |
| 15 | Keyboard behavior | Native Space/Enter; no extra shortcut by default. |
| 16 | Responsive behavior | Same target all modes; never omitted if both themes are supported unless another reachable control exists. |
| 17 | Motion behavior | 180–200 ms theme color transition when allowed; no icon spin/whole-page blur; reduced motion instant. |
| 18 | Content limits | Icon only with accessible label; no ambiguous sun/moon without name. |
| 19 | Composition rules | Uses IconButton visual contract; ThemeScript stays root infrastructure, not inside toggle. |
| 20 | Dependencies | React, matchMedia, localStorage, document data attribute, CSS theme variables. |
| 21 | Server vs Client boundary | Client leaf; pre-paint ThemeScript emitted server-side in root head. |
| 22 | Analytics responsibilities | None by default; theme preference is not marketing analytics. |
| 23 | Performance requirements | Fixed footprint/no CLS, no provider/dependency, one media listener with cleanup. |
| 24 | Usage examples | `<ThemeToggle />` inside shell action group. |
| 25 | Reuse policy | Single theme control implementation across storefront/admin. |
| 26 | Prohibited usage | Separate page theme state, cookie/server personalization without architecture review, 36 px target, animated page-wide transition, third-party theme package. |
| 27 | Acceptance criteria | No flash, system/explicit behavior, storage denial, hydration, 44 px, both themes and reduced motion pass. |
| 28 | Required tests | Snapshot/subscription logic where practical, toggle attribute/storage, storage exception, accessible label, fixed geometry and browser visual verification. |

## 4.36 AIAssistantCard

**Primary status:** Future — Not part of Homepage V2
**Gate:** every SAS/MDG AI entry criterion, evaluation, privacy, cost and kill switch

| # | Contract field | Specification |
|---:|---|---|
| 1 | Purpose | Future: present bounded AI assistance with clear authority, provenance, uncertainty and non-AI fallback. |
| 2 | Current implementation status | No AI backend, UI, analytics evidence or approved use case. |
| 3 | Owner/module | Future dedicated AI capability/module; never catalog/cart/payment ownership by implication. |
| 4 | Recommended file location | Undecided until ADR and use case define ownership; do not create placeholder file. |
| 5 | Public props/API | Future use-case-specific contract; likely status, answer, sources, limitations, feedback/cancel/escalate controls and request ID. No generic “AI magic” props. |
| 6 | Required props | Approved use case, provenance/limitations, safe output state and non-AI recovery. |
| 7 | Optional props | Feedback, source links, cancel/retry, escalation when operationally supported. |
| 8 | Variants | None approved. Search/support variants require separate specifications. |
| 9 | Sizes | Future content-driven panel; readable measure and 44 px controls. |
| 10 | Visual states | Idle/consent if needed, loading/cancellable, answer, partial, refusal, error, rate/cost limit, human fallback. |
| 11 | Interaction states | AI cannot directly mutate cart, payment, order, inventory or account authority by default. User confirms any separately approved deterministic tool action. |
| 12 | Loading state | Truthful cancellable progress; no fake typing delay; timeouts and rate limits explicit. |
| 13 | Empty/Error handling | Non-AI search/support route remains; failure never blocks deterministic commerce. |
| 14 | Accessibility contract | Status announcements paced, sources/limitations readable, streaming does not strand focus, keyboard/screen reader complete. |
| 15 | Keyboard behavior | Standard controls; no shortcut conflict; cancel/retry/fallback reachable. |
| 16 | Responsive behavior | Content reflows, citations remain reachable, no horizontal transcript overflow. |
| 17 | Motion behavior | No sparkle/pulse identity or simulated typing; reduced motion and streaming readability protected. |
| 18 | Content limits | Bounded response length and source count by use case; no unsupported medical/legal/financial/product certainty. |
| 19 | Composition rules | Uses standard cards/buttons/loading/error; distinct AI label only for real model output; deterministic results remain visually distinct. |
| 20 | Dependencies | Approved model/provider, retrieval authorization, privacy/security, budget, evaluation, telemetry and kill switch. None approved now. |
| 21 | Server vs Client boundary | Server-mediated model/tool access; client handles bounded interaction/stream only; secrets never client-side. |
| 22 | Analytics responsibilities | Safe metadata only; no sensitive prompt/output by default; cost/quality telemetry governed separately. |
| 23 | Performance requirements | Lazy-load outside critical storefront path, hard cost/rate/token limits, cancellation, no Homepage bundle impact before approval. |
| 24 | Usage examples | None authorized. |
| 25 | Reuse policy | Future use-case-specific AI presentation after evidence; not a decorative generic card. |
| 26 | Prohibited usage | Homepage implementation now, fake AI badge, autonomous financial/state action, hidden model limitations, customer data leakage, uncapped spend. |
| 27 | Acceptance criteria | ADR, evidence, privacy/threat model, evaluation thresholds, cost cap, fallback, human escalation and kill switch approved. |
| 28 | Required tests | Future authorization/prompt-injection/tool boundary, output validation, sources, refusal/error/cancel/rate limit, privacy, accessibility, cost and fallback evaluations. |

---

# 5. Component Dependency Map

```text
Tokens / CSS variables
├── Shared primitives
│   ├── Button
│   ├── IconButton
│   ├── Input / Textarea / Select
│   ├── Badge
│   ├── Skeleton / LoadingState / EmptyState / ErrorState
│   └── Drawer (client overlay primitive)
├── Shared storefront patterns
│   ├── SearchBar
│   ├── SectionHeader
│   ├── DesktopNavigation
│   ├── MobileNavigation -> IconButton + Drawer + SearchBar
│   ├── Header -> navigation + SearchBar + cart slot + ThemeToggle
│   ├── Footer
│   ├── AnnouncementBar / PromotionalBanner / TrustCard / BrandStory
│   └── Hero -> actions + media recipe
├── Catalog domain
│   ├── ProductImage
│   ├── PriceDisplay/money utility
│   ├── ProductCard -> ProductImage + PriceDisplay + Badge
│   ├── ProductGrid -> ProductCard[]
│   └── CategoryCard -> media recipe + Link
└── Cart domain
    ├── AddToCartControl -> cart server action + Button + ErrorState
    └── CartBadge -> private cart read + stable Suspense fallback
```

Dependency direction is downward only. Shared primitives MUST NOT import storefront
patterns or domain modules. Storefront patterns MAY accept domain-rendered slots but do
not reach into private module repositories/services.

---

# 6. Component Ownership Map

| Layer | Approved ownership | Components |
|---|---|---|
| Shared primitives | `src/components/ui/` | Button, IconButton, Input, Textarea, Select, Badge, Skeleton, LoadingState, EmptyState, ErrorState, Drawer; future Toast/Modal |
| Shared storefront | `src/components/storefront/` | SearchBar, Header, DesktopNavigation, MobileNavigation, SectionHeader, Footer, AnnouncementBar, PromotionalBanner, TrustCard, BrandStory |
| Homepage section | Page/approved section directory | Hero and section orchestration; exact placement chosen during implementation ownership review |
| Catalog domain | `src/modules/catalog/components/` | ProductCard, ProductGrid, CategoryCard, ProductImage and catalog-specific view types |
| Cart domain | `src/modules/cart/components/` | AddToCartControl/current AddToCartButton, CartBadge |
| Theme infrastructure | `src/components/` | ThemeToggle and ThemeScript |
| Future reviews | Future module after approval | ReviewCard |
| Future subscription | Future module after approval | NewsletterForm |
| Future AI | Future ADR-defined module | AIAssistantCard |

`PriceDisplay` requires an implementation-time placement decision: a shared commerce
presentation directory is preferred if cart/order/catalog all reuse the exact contract;
otherwise it stays in catalog initially. In every case, `src/lib/money` remains the
format/amount authority and UI never owns money arithmetic.

---

# 7. Homepage Section-to-Component Matrix

| Homepage section | Required composition | Data/content gate | Failure/absence behavior |
|---|---|---|---|
| Header | Header, DesktopNavigation, MobileNavigation, Drawer, SearchBar, IconButton, CartBadge slot, ThemeToggle | Live routes/categories/config | Preserve brand/search/recovery; omit invalid optional links |
| Announcement Bar | AnnouncementBar | Verified active message/terms/destination | Return `null` and collapse |
| Hero | Hero, action recipe, media recipe | Approved Content Guide; Media Guide for image | Copy/action are release gates; media may use approved fallback |
| Trust Indicators | TrustCard[] | At least approved minimum verified facts | Omit section |
| Featured Categories | SectionHeader, CategoryCard[] | Active categories and approved content/media/fallback | Omit if no valid entries |
| Best Selling Products | SectionHeader, ProductGrid/ProductCard | Approved authoritative ranking/window | Omit section; never relabel New Arrivals |
| New Arrivals | SectionHeader, ProductGrid/ProductCard, optional single EmptyState | Tagged active products newest query | One customer-safe catalog empty state |
| Promotional Banner | PromotionalBanner | Approved active campaign, terms, destination | Return `null` |
| Why Buy From Us | SectionHeader/Trust-like value cards only if evidence differs | Approved differentiated verified reasons | Omit section |
| Customer Reviews | SectionHeader, ReviewCard[] | Future moderated published source and consent | Omit section |
| Brand Story | BrandStory | Approved copy/claims and optional media | Omit section or approved text-only fallback |
| Newsletter | NewsletterForm | Full consent/privacy/backend/unsubscribe gate | Omit section |
| Footer | Footer and live link groups | Approved identity and live routes; optional configured data | Preserve minimum recovery groups |

---

# 8. Existing-to-V2 Migration Matrix

| Existing location/pattern | V2 target | Migration action | Homepage V2 scope rule |
|---|---|---|---|
| `ui/button.tsx` | Button V2 API | Add semantic variants/sizes/pending without parallel component | Allowed |
| `ui/input.tsx` | Input V2 | Add help/state/size only when required; preserve ID/error behavior | Newsletter remains gated |
| `ui/select.tsx` | Select V2 | Connect errors and token alignment when touched | No unrelated global refactor |
| `ui/textarea.tsx` | Textarea V2 | Connect errors and token alignment when touched | Not needed by Homepage |
| Inline shop search | SearchBar | Extract one server-compatible form | Required |
| Inline shop header | SiteHeader | Extract and compose; preserve cached categories and streamed cart | Required |
| Inline desktop nav | DesktopNavigation | Extract plain DTO/list contract | Required |
| Mobile category scroller | MobileNavigation + Drawer | Implement approved compact drawer while preserving routes | Required |
| Inline `TrustBar` | Verified fact adapter + TrustCard/approved bar | Preserve server-cached truth; do not invent additional claims | Conditional |
| Inline `SiteFooter` | Footer | Extract; replace generic brand copy only from approved Content Guide | Required |
| Inline icons | Shared icon rules/IconButton where interactive | Reuse inline SVG, consolidate only touched icons | Allowed; no icon dependency |
| Current ProductCard | ProductCard + ProductImage + PriceDisplay + Badge | Extend view contract and token styles; no domain fetch per card | Required |
| Current ProductGrid priority first four | Page-owned one LCP candidate | Remove blanket priority behavior when V2 card/grid implemented | Required |
| Route-local skeletons | Skeleton plus local matched compositions | Extract only repeated primitive geometry | Allowed |
| Homepage empty admin link | customer-safe EmptyState | Remove admin route from storefront UI | Required |
| ProductGallery dialog | Future Modal evaluation | Preserve domain behavior; no generic refactor in Homepage phase | Protected/out of scope |
| Inline pagination | Future Pagination | Defer until category/search wireframes | Out of scope |
| Inline form alerts | ErrorState candidates | Homepage uses only when needed; broad form migration deferred | Out of scope except touched code |

Migration is incremental. Compatibility aliases and existing behavior remain until all
audited consumers in the active scope are migrated and verified.

---

# 9. Composition Hierarchy

```text
RootLayout
└── StorefrontShell
    ├── SkipLink (required by SAS/DDS; contract may be added with shell work)
    ├── AnnouncementBar? (gated)
    ├── Header
    │   ├── Brand Link
    │   ├── DesktopNavigation
    │   ├── MobileNavigation
    │   │   ├── IconButton trigger
    │   │   └── Drawer -> SearchBar + navigation groups
    │   ├── SearchBar
    │   ├── Account Link
    │   ├── Suspense -> CartBadge / matched fallback
    │   └── ThemeToggle -> IconButton recipe
    ├── Main
    │   ├── Hero
    │   ├── Optional gated/conditional sections
    │   └── New Arrivals -> SectionHeader + ProductGrid -> ProductCard
    └── Footer
```

The Homepage route/shell owns data loading, validation, gating and section order.
Components own presentation and interaction contracts only.

---

# 10. Prop Naming and Type Conventions

| Concern | Required convention | Example | Prohibited |
|---|---|---|---|
| Boolean state | `is/has/can/should` prefix | `isLoading`, `hasError`, `canDismiss` | `loadingFlag`, `activeThing` |
| Event callback | `on` + semantic outcome/intent | `onOpenChange`, `onRetry`, `onSelect` | `handleClick` as public prop |
| Internal handler | `handle` + event | `handleSubmit` | Exporting internal name as API |
| Identifier | Entity + `Id` | `productId`, `campaignId` | Ambiguous `id` across composed entities |
| Display DTO | Entity + `View` or `Data` | `ProductCardView` | Passing database row directly |
| Visual option | Closed semantic union | `variant: 'primary' \| 'secondary'` | `isPurple`, arbitrary `color` |
| Size | Closed scale | `size: 'sm' \| 'md' \| 'lg'` | Pixel number in normal API |
| Placement | Controlled analytics enum | `placement: 'new_arrivals'` | Free-form page title |
| Action | Typed descriptor | `{ label, href, destinationKey }` | Raw node with unknown semantics when typed action is needed |
| Accessible label | Native children first | visible link/button label | Duplicate/contradictory ARIA string |
| Class override | `className` for layout only | grid placement/margin by parent | Replacing colors/radii/states |

Component props MUST NOT accept database tables, environment objects, request/session
objects, provider clients, raw errors or unvalidated URLs. Map those values into the
smallest safe display/action DTO at the server/domain boundary.

# 11. Event Naming Conventions

## 11.1 UI callback names

- `onOpenChange(open: boolean)` for controlled overlays.
- `onValueChange(value)` for controlled custom values; native controls retain native
  `onChange`.
- `onRetry()` for safe retry intent.
- `onDismiss()` only when dismissal is a distinct semantic action.
- `onSubmit` follows native form semantics; server actions remain authoritative.
- `onSuccess` MUST NOT turn a generic component into domain authority. Prefer a typed
  server result handled in the owning feature.

## 11.2 Analytics event names

Analytics is future/gated until an approved provider, consent model, privacy contract
and performance budget exist. Components define descriptors but do not import a vendor.

Use lower-case snake case and a semantic noun + outcome/intent:

| Approved pattern | Examples |
|---|---|
| `[surface]_[action]` | `hero_primary_select`, `navigation_select`, `footer_link_select` |
| `[feature]_[state]` | `mobile_menu_open`, `newsletter_submit_success` |
| `[entity]_[action]` | `product_select`, `category_select`, `promotion_select` |

Approved common properties are controlled enums/identifiers: `placement`, `position`,
`viewport_mode`, safe entity/content key, destination key and controlled result/error
category. Never include email, name, phone, address, order number, session/cart token,
payment data, raw query, review text, prompt/output, URL with query string or raw error.

# 12. Focus Management and Touch Targets

## 12.1 Focus rules

- Every interactive component has a visible external `--focus-ring` treatment.
- DOM order equals intended reading/interaction order.
- Loading never removes the focused control without moving focus to a meaningful
  replacement.
- Form submission focuses an error summary only when multiple/hidden errors make that
  helpful; field errors stay programmatically connected.
- Drawer/Modal trap focus, set intentional initial focus, make background inert and
  restore focus to the invoker.
- Route navigation follows Next/browser behavior; do not force focus changes without a
  documented route-level policy.
- Focus outlines must not be clipped by overflow/radius/media containers.

## 12.2 Target rules

- Customer-facing and touch-capable controls target at least 44 x 44 CSS px.
- A smaller visual glyph may sit inside a 44 px hit area.
- Adjacent targets retain enough separation to avoid accidental activation.
- Dense admin controls may visually appear compact but must preserve practical target
  area.
- Responsive hiding MUST remove inactive duplicate controls from the accessibility tree
  and tab order.

# 13. Dark and Light Theme Rules

- Components consume semantic tokens; they do not branch on theme in React.
- The three-state theme model (system, explicit light, explicit dark) remains.
- All approved states—including browser autofill, focus, disabled, selected, error,
  overlay and glass—are verified in both themes.
- Dark elevation uses lighter surfaces/borders plus restrained dark shadow; light-theme
  shadows are not copied unchanged.
- Product photography is not inverted or globally dimmed.
- Text-bearing glass is verified over worst supported backgrounds; solid fallback is
  mandatory.
- Theme change may transition color/background for `--duration-base`; images, layout,
  blur and every descendant do not animate independently.

# 14. Maximum File Size and Refactoring Thresholds

The MDG's file guidance governs. These are review thresholds, not permission for blind
splitting:

| File type | Review threshold | Required response |
|---|---:|---|
| Shared primitive | ~150 lines | Review whether behavior, styles and types can be separated without obscuring contract |
| Reusable pattern/domain component | ~250 lines | Review subcomponent extraction by responsibility |
| Complex client feature component | ~300 lines | Strong split expectation; document why retained if cohesive |
| Test file | ~400 lines | Split by behavior/scenario when navigation becomes difficult |

Refactor when at least one is true:

- the same semantic state recipe is duplicated in three or more real consumers;
- a component owns data loading, business decisions and visual interaction together;
- a client boundary wraps server-renderable siblings;
- a prop API accumulates unrelated booleans or page-specific variants;
- file size exceeds the threshold and contains separable responsibilities;
- accessibility/focus logic is duplicated and diverging;
- one change repeatedly requires edits in several copies of the same pattern.

Do not refactor solely to reduce line count, create speculative abstraction, rename
everything during Homepage V2 or touch protected commerce modules. A refactor must have
tests before/after, preserve behavior unless a separately approved change says
otherwise, and remain in the active scope.

# 15. Dependency Approval Rules

No UI, icon, animation, focus, form, carousel, toast, modal or analytics dependency is
approved by this document. Before proposing one, Work MUST document:

1. The approved use case and why native platform/current code cannot meet it safely.
2. Evaluated alternatives, including no dependency.
3. Package ownership, maintenance, license and supply-chain posture.
4. Client/server compatibility with Next.js 16, React 19, SSR and `cacheComponents`.
5. ESM/tree-shaking behavior and exact gzip/brotli cost on affected route.
6. Accessibility behavior and known limitations.
7. CSP/security/privacy implications.
8. Upgrade/removal strategy and lockfile impact.
9. Explicit Product Owner/architecture approval before installation.

Homepage V2 MUST NOT add a new component framework or parallel UI kit.

# 16. Gated Component Entry Procedure

A gated component moves toward implementation only when all rows are complete:

| Gate | Evidence owner | Required evidence |
|---|---|---|
| Product purpose | Product Owner | Approved user/business goal and release placement |
| Truth source | Domain owner | Authoritative schema/query/config/content source |
| Content | Product Owner/content owner | Final approved copy, claims and destinations |
| Media | Product Owner/media owner | Existing/approved asset, crop, alt, priority |
| Privacy/legal | Product Owner/legal authority | Consent, policy, retention and user rights where applicable |
| Security/abuse | Architecture/domain owner | Validation, authorization, rate limit and error model |
| Operations | Business owner | Moderation, unsubscribe, campaign expiry, support or kill-switch process |
| Analytics | Product/privacy owner | Event purpose, consent and non-PII schema |
| Performance | Engineering | Query, bundle, media and CWV budget |
| Acceptance | Product/QA | Testable criteria and failure/omission behavior |

Until then, the owning section returns `null`; a skeleton or sample card does not ship.

---

# Part II — Official UI API Mappings (Requirements 37–50)

# 37. Design Tokens Mapping

Components MUST consume the DDS tiers in this order:

```text
Foundation value -> Semantic token -> Component token -> Component state
```

| Component concern | Foundation/semantic source | Component-level mapping |
|---|---|---|
| Canvas/surface | `--background-*`, `--surface-*` | Card/Header/Overlay recipes |
| Text | `--text-primary/secondary/muted/inverse` | Heading/body/metadata labels |
| Border | `--border-subtle/strong`, feedback borders | Input/Card/Overlay boundaries |
| Action | `--action-primary/*`, destructive | Button/IconButton states |
| Feedback | success/warning/danger/info triplets | Badge/Error/Status recipes |
| Spacing | `--space-0` through `--space-32` | Padding, gap and section rhythm |
| Type | `--text-xs` through `--text-6xl`, tracking | Component type roles |
| Shape | `--radius-xs` through `--radius-pill` | Control/card/overlay geometry |
| Elevation | `--shadow-0` through `--shadow-3` | Card/dropdown/drawer/modal |
| Motion | durations/easing tokens | State and overlay transitions |
| Layout | container/gutter/grid tokens | Shell and section composition |
| Controls | button/input height tokens | Size variants |
| Layer | z-index tokens | Sticky/overlay/toast order |

Page-specific token names such as `--homepage-blue-card` are prohibited. Add a
component token only when multiple variants/states share a stable semantic recipe.

# 38. CSS Variable Mapping

## 38.1 Legacy compatibility

| Current variable | Target semantic alias | Migration rule |
|---|---|---|
| `--color-bg` | `--background-canvas` | Add alias first; migrate touched components; remove only after `rg` finds no consumers |
| `--color-surface` | `--surface-secondary` | Preserve behavior during shell/card migration |
| `--color-fg` | `--text-primary` | Map semantics before visual tuning |
| `--color-muted` | `--text-muted` | Recheck contrast in both themes |
| `--color-border` | `--border-subtle` | Add strong/interactive states rather than local hex |
| `--color-accent` | `--action-primary` | Preserve initial current color, then DDS target through approved token change |
| `--color-accent-fg` | `--action-primary-text` | Theme semantic alias |
| `--color-accent-soft` | `--surface-selected` | Verify selected—not decorative—use |
| `--color-danger` | `--feedback-danger-text` | Add matching surface/border triplet |
| `--color-success` | `--feedback-success-text` | Add matching surface/border triplet |

## 38.2 Required component variables

Initial mappings may include:

```css
--button-height-sm: 2.5rem;
--button-height-md: 2.75rem;
--button-height-lg: 3.25rem;
--button-height-hero: 3.5rem;
--input-height-standard: 3rem;
--input-height-dense: 2.5rem;
--card-radius: var(--radius-lg);
--card-border: var(--border-subtle);
--overlay-scrim: rgba(7, 9, 14, var(--opacity-scrim));
--drawer-width: min(88vw, 24rem);
```

The exact CSS change belongs to Homepage implementation. This specification does not
authorize editing `globals.css` now.

# 39. Tailwind Utility Mapping

Tailwind v4 utilities SHOULD resolve CSS variables, not repeat raw values.

| Semantic intent | Preferred form | Migration/prohibited note |
|---|---|---|
| Text primary | `text-(--text-primary)` | Current `text-(--color-fg)` may remain until touched |
| Text muted | `text-(--text-muted)` | Never parent opacity for readable text |
| Canvas | `bg-(--background-canvas)` | No raw `bg-white`/hex in shared component |
| Surface | `bg-(--surface-primary/secondary/elevated)` | Choose semantic role |
| Border | `border-(--border-subtle/strong)` | Feedback state uses feedback border |
| Primary action | `bg-(--action-primary) text-(--action-primary-text)` | Hover uses approved hover token |
| Focus | `focus-visible:outline-(--focus-ring)` plus offset | Must remain external/visible |
| Radius | Approved token-backed utilities/style | No arbitrary radius per page |
| Spacing | Standard scale matching `--space-*` | Arbitrary values only for documented layout math |
| Motion | token-backed duration/ease | No local cubic-bezier |
| Z-index | variable-backed layer | No `z-[9999]` |

Dynamic class-string construction that Tailwind cannot discover is prohibited. If a
long utility recipe repeats across real consumers, extract a primitive/semantic helper;
do not create a global pile of opaque class constants.

# 40. Animation Token Mapping

| Interaction | Duration | Easing | Properties | Reduced motion |
|---|---:|---|---|---|
| Button/IconButton press | `--duration-instant` 80 ms | `--ease-standard` | transform/color | Instant color/state; remove scale |
| Hover/focus-adjacent state | `--duration-fast` 120 ms | `--ease-standard` | color/background/opacity | Instant |
| Standard component state | `--duration-base` 180 ms | `--ease-standard` | color/opacity/transform | Near-instant |
| Popover/disclosure | `--duration-moderate` 240 ms | enter/exit | opacity/transform | Opacity or instant |
| Drawer/Modal | `--duration-slow` 320 ms | enter/exit | translate/opacity | No translation; instant/short opacity |
| Rare section decoration | `--duration-reveal` 420 ms | `--ease-enter` | opacity/small transform | Static |

Rules:

- Animation never changes price, stock, order or payment truth gradually.
- Width, height, top, left, box-shadow and large backdrop-filter animation are avoided.
- No transition exceeds 500 ms without explicit design approval.
- Product grids do not stagger every card on routine navigation.
- Continuous ambient animation is absent from Homepage V2.

# 41. Accessibility Token Mapping

| Need | Token/requirement | Consumer contract |
|---|---|---|
| Focus color | `--focus-ring` | Every interactive primitive |
| Focus offset | `--focus-ring-offset`, width tokens to be defined if missing | Visible outside clipping/surface |
| Normal text | >=4.5:1 | All body/control labels |
| Large text | >=3:1 | Only WCAG-qualified large text |
| UI boundary/icon | >=3:1 | Inputs, focus, meaningful icons |
| Touch target | 44 x 44 px minimum | Buttons, links, icon controls |
| Error | feedback danger text/surface/border triplet | Not color-only; linked description |
| Success/warning/info | corresponding triplet | Text/icon/label accompanies color |
| Reduced motion | `prefers-reduced-motion` | Every component with motion |
| Forced colors | system-visible boundaries/focus | Interactive primitives and overlays |
| Zoom/reflow | 200% text, 400% reflow | All components; no loss/function clipping |

Placeholder contrast is supplemental and never replaces a label. Glass contrast is
verified against worst supported background, not only its nominal CSS color.

# 42. Icon Usage Rules

- Rounded geometric outline, `0 0 24 24`, 1.75–2 px stroke, round caps/joins where
  suitable and `currentColor`.
- Sizes: 14 px metadata, 16 px inline, 20 px standard control, 24 px navigation, 32 px
  rare empty-state support.
- Interactive icon targets are at least 44 x 44 px and explicitly named.
- Decorative icons use `aria-hidden="true"`; meaningful status icons accompany text.
- One interface icon family/style only. Existing inline SVGs may continue and should be
  consolidated only when touched/repeated.
- No icon dependency is approved. A future proposal follows section 15.
- Brand/product logos are assets, not UI icons.
- Emojis, icon fonts, fake AI sparkles and filled/outline mixtures without selected-state
  meaning are prohibited.

# 43. Z-index Layer Rules

| Token | Value | Allowed layer |
|---|---:|---|
| `--z-base` | 0 | Page canvas/content |
| `--z-raised` | 10 | Card/sticky utility within local context |
| `--z-dropdown` | 30 | Search suggestions/popover (future) |
| `--z-sticky` | 40 | Sticky navigation |
| `--z-drawer` | 50 | Drawer + ordered scrim/panel local sublayers |
| `--z-modal` | 60 | Modal |
| `--z-toast` | 70 | Future transient feedback |

Rules:

- Components create local stacking contexts deliberately; children do not escape the
  system scale.
- Drawer/Modal scrim and panel use one global layer token with local ordering.
- Sticky content cannot cover focused controls/anchors.
- `z-[9999]`, escalating integers and page-specific layer variables are prohibited.
- A new global layer requires DDS amendment and collision review.

# 44. Responsive Visibility Rules

The DDS modes are content-driven but align with Tailwind's current mobile-first model:

| Mode | Approximate range | Grid | Typical visibility |
|---|---:|---:|---|
| Compact | `<640 px` | 4 conceptual columns | MobileNavigation active; DesktopNavigation absent |
| Small/medium | `640–1023 px` | 8 columns | Tablet composition; exact nav mode follows content fit/wireframe |
| Desktop | `>=1024 px` | 12 columns | DesktopNavigation active; compact trigger absent |
| Large editorial | `>=1440 px` | 12 columns in wider gutters | Content width stays bounded |

Rules:

- Base CSS is the complete compact experience; larger modes enhance it.
- Hiding uses CSS/render strategy that removes inactive duplicates from tab/accessibility
  order.
- Required meaning/action appears in every mode through an equivalent control.
- No business rule depends on `window.innerWidth`.
- Visual reordering cannot change logical DOM order.
- Test 320, 390, 768, 1024, 1440 and 1920 px plus landscape mobile, short height, zoom
  and content stress.

# 45. Data Loading Strategy

| Component category | Loading owner | Rule |
|---|---|---|
| Shared primitive | None | Receives ready props; never fetches |
| Header/Footer | Storefront shell Server Component | Load cached public navigation/config; isolate private cart slot |
| ProductGrid/Card | Route/section Server Component | One bounded query; map to display DTOs; no per-card fetch |
| Gated section | Server gate/adapter | Validate approval/eligibility before rendering; missing returns `null` |
| Form/client control | Owning feature | Server Action result is authoritative; local state reflects pending only |
| Overlay | Owner/trigger | Content is ready or has a local matched Suspense state; overlay primitive does not fetch |
| Future AI/reviews/newsletter | Future owning module | No loading implementation until backend/architecture gates pass |

Additional rules:

- Route/section components own parallel data reads where independent.
- Fetch/select only fields used by the display DTO.
- Avoid N+1 queries and client fetch for server-available data.
- Optional section failure must not become a page-wide failure when safe isolation is
  approved.
- Loading, empty, error and omitted/gated are distinct states.

# 46. Suspense Boundary Rules

- Use `Suspense` for an independent async region when streaming improves meaningful
  content and the fallback preserves geometry.
- Under `cacheComponents`, request/user-specific reads must live in a valid dynamic or
  Suspense path; never force them into shared cached output.
- Current CartBadge pattern is approved in principle: private async server component +
  identical-footprint fallback inside static Header.
- Header brand/search/navigation and approved hero copy must not wait for unrelated
  private/slow data.
- A boundary should map to a user-recognizable region, not wrap each tiny component.
- Fallback DOM/order/size matches resolved content enough to prevent CLS.
- A boundary does not hide build-time database dependence; public cached reads need
  correct cache/preview data strategy.
- Do not use `fallback={null}` where the disappearance/late insertion causes confusing
  layout or missing required content.

Recommended Homepage boundaries:

| Region | Boundary decision |
|---|---|
| CartBadge | Yes; private per-visitor async slot with stable fallback |
| Cached public Header categories | Usually no local spinner; server cached read |
| Hero copy/media | No boundary for approved copy; image loads through image behavior |
| Product sections | Section boundary only if data actually streams and matched skeleton adds value |
| Gated static content | No; resolve gate on server and render/omit |
| Newsletter/reviews | Not implemented until gates pass |

# 47. Error Boundary Rules

## 47.1 Boundary levels

| Level | Ownership | Behavior |
|---|---|---|
| Field | Input/Select/Textarea + form | Connected validation message; preserve value |
| Form/action | Feature client/server result | Safe summary/retry/correction; no raw exception |
| Section | Page/section | Isolate only when optional section can fail independently and recovery is meaningful |
| Route | Next route `error.tsx` | Customer-safe ErrorState, retry/back route, operational correlation logging |
| Root | Root error handling | Minimal branded recovery; no dependency on failing app services |

Rules:

- React/Next error boundaries catch unexpected render/runtime failures; expected domain
  outcomes use typed results.
- Server logs receive safe correlation context; UI never receives stack/provider/SQL
  detail.
- Retry must be safe/idempotent. Never offer a blind repeat of a financial or
  stock-changing mutation.
- Required Header/Footer recovery should remain when an optional Homepage section fails
  where architecture permits.
- Error boundary implementation is not authorized by this document beyond the active
  Homepage scope.

# 48. Server Cache Strategy

| Data | Cache strategy | Component impact |
|---|---|---|
| Active products/categories | Tagged server cache (`catalog` tags, `cacheLife('max')`) | Homepage receives cached DTO; mutations invalidate after successful commit |
| Shipping summary | Tagged server cache | Trust facts derive only from current cached server source |
| Product images | Versioned/transformed CDN URL | Component receives descriptor; browser/CDN caches media |
| Search results | Conservative/uncached until evidence | SearchBar remains GET navigation; route decides caching |
| Cart | Never shared/public cached | Stream private CartBadge; cart action authoritative |
| Account/order/admin | Private dynamic/no-store | Never pass through shared Homepage cache |
| Promotion/announcement/content | Approved configuration cache with invalidation/expiry | Eligibility validated server-side; no client-clock authority |
| Reviews/newsletter/AI | Undefined until approved | Must not be invented |

Cache rules:

- Cache is never authority for money, stock, payment or order state.
- Tags/keys are centralized and include every input affecting output.
- Invalidate after successful mutation commit.
- Never place user/session/admin data in a shared component cache.
- React component memoization is not a substitute for server data caching.

# 49. React Memoization Rules

- Do not add `memo`, `useMemo` or `useCallback` by reflex.
- Server Components and static HTML receive no benefit from client memoization.
- Prefer eliminating unnecessary client boundaries/prop churn before memoizing.
- Use `useMemo` only for a measured expensive pure calculation whose dependencies are
  correct and stable.
- Use `useCallback` only when referential identity materially affects a memoized child
  or subscription cleanup; normal event handlers do not require it.
- Use `memo` only after profiling a real repeated render cost with stable props.
- Never memoize server-authoritative money/stock/payment values to avoid refresh.
- Memoization must not hide stale closure bugs, missing dependencies or mutable props.
- Record profiling evidence and before/after effect in the implementation report.

Current Homepage expectation: no new React memoization for server-rendered sections;
minimal client controllers (Drawer/Theme/AddToCart) remain simple unless profiling says
otherwise.

# 50. Performance Budget Per Component

Budgets are targets for implementation review. Existing components establish a
baseline; a regression or budget exception requires measured evidence and approval.

| Component/category | Client JS target | Rendering/media budget | Key prohibition |
|---|---:|---|---|
| Server-only primitive/pattern/section | 0 KB | Static HTML/CSS; bounded DOM | Adding `'use client'` for styling/motion |
| Button/Input/Select/Textarea visual code | No new dependency; shared existing React cost | Interaction response begins <100 ms | Per-instance global listener |
| IconButton/Badge/Skeleton/EmptyState | 0 KB when server/static | Inline icon <=1 KB target; stable geometry | Remote icon/decorative SDK |
| SearchBar baseline | 0 KB | Native GET submit; no suggestion request | Client autocomplete in Homepage V2 |
| Header | Only small menu/theme islands | Stable height; no CLS; static shell streams cart | Hydrating entire shell |
| Drawer controller | <=4 KB gzip target, no dependency | Open feedback <100 ms; 60 fps transform target | Layout/large blur animation |
| ProductCard/ProductGrid | 0 KB | No N+1; correct `sizes`; lazy below fold | Per-card fetch/client hydration |
| ProductImage | 0 JS beyond framework | One actual LCP priority; zero image CLS; transformed format/size | Original upload or blanket priority |
| Hero | 0 KB section JS | Support page LCP <=2.0 s target/2.5 s max | Video/carousel/multiple preloads |
| Footer/Trust/Brand/Promotion static | 0 KB | Lazy media; no third-party script | Embedded badges/widgets |
| AddToCartControl | Existing small client leaf; no new library | One server action + one refresh on success | Optimistic commerce state |
| ThemeToggle | Existing no-dependency client leaf | Fixed footprint, no flash/CLS | Theme package/page-wide animation |
| Future Toast | <=5 KB gzip absent exception | Bounded stack | Adding to Homepage before need |
| Future Modal | <=6 KB gzip absent exception | Stable portal/focus; no CLS | Marketing popup/nested modal |
| Future AI | Lazy separate chunk, explicit approved budget | Cost/token/latency caps and cancellation | Critical-path Homepage bundle impact |

Page-level targets inherited from SAS/MDG:

- LCP p75 mobile <=2.0 s target, 2.5 s maximum launch threshold.
- INP p75 <=150 ms target, 200 ms maximum.
- CLS p75 <=0.05 target, 0.10 maximum; image layout shift expected zero.
- Cached public TTFB <=300 ms target, 500 ms maximum.
- Initial critical storefront JavaScript <=120 KB gzip target.
- Representative mobile Lighthouse performance >=90 and no regression below approved
  baseline.

Implementation MUST record before/after route bundle and Lighthouse/CWV evidence. A
component that keeps its local budget but causes page-level regression still fails.

---

# 51. Component Definition of Done

A component is complete only when every applicable item is true.

## 51.1 Contract and ownership

- [ ] Primary status and implementation scope are still current.
- [ ] Purpose, non-purpose, owner and file location match this document.
- [ ] Public props are typed, semantic, minimal and documented.
- [ ] Required/optional props, variants, sizes and content limits match contract.
- [ ] Existing components were reused/extended before creating a new one.
- [ ] Business truth remains in the owning domain/server boundary.
- [ ] Gated content/capability evidence is recorded; unavailable gates omit safely.

## 51.2 States and interaction

- [ ] Default, hover, focus-visible, active/selected, disabled, loading, error, empty and
      success states are implemented where applicable.
- [ ] Controlled/uncontrolled behavior is explicit and stable.
- [ ] Pending operations prevent unsafe duplication.
- [ ] Keyboard and touch behavior match native/overlay contracts.
- [ ] Focus entry, containment, error movement and restoration are verified.
- [ ] Reduced-motion behavior preserves all information and feedback.

## 51.3 Visual and responsive

- [ ] Only approved tokens/CSS variables/utilities are used.
- [ ] Light, dark, forced-colors and worst-case glass contrast pass.
- [ ] 320, 390, 768, 1024, 1440 and 1920 px checks pass.
- [ ] Landscape mobile, short height, 200% zoom, 400% reflow and long content pass.
- [ ] Touch targets are at least 44 x 44 px where required.
- [ ] Media dimensions/crops/sizes/loading/alt match Media Guide.
- [ ] Loading-to-content swap has no unacceptable CLS.

## 51.4 Architecture, security and performance

- [ ] Server Component is default; client boundary is the smallest real interaction.
- [ ] No protected module/business/commerce invariant changed.
- [ ] No private/user/admin data enters shared cache or client props.
- [ ] Inputs/actions validate/authenticate/authorize at the owner boundary.
- [ ] No raw error, secret or PII reaches UI/log/analytics.
- [ ] No new dependency without recorded approval.
- [ ] Component and page performance budgets pass with evidence.
- [ ] Cache, Suspense and error boundary behavior match sections 45–48.

## 51.5 Verification and documentation

- [ ] Required unit/component/integration/e2e tests pass.
- [ ] Keyboard-only and screen-reader spot check pass where interactive.
- [ ] Automated accessibility scan plus manual review pass.
- [ ] Visual regression evidence covers states, themes and responsive modes.
- [ ] Lint, typecheck, tests and production-shaped build pass for the active phase.
- [ ] This document/DDS/wireframe is updated if an approved contract changed.
- [ ] Implementation report names files, tests, limitations and protected areas.

# 52. Component Review Checklist

## 52.1 API review

- [ ] Can the component be explained in one purpose sentence?
- [ ] Are prop names semantic rather than visual/page-specific?
- [ ] Could composition replace new booleans or slots?
- [ ] Does a DTO expose only what rendering needs?
- [ ] Are action URLs/labels validated and live?
- [ ] Is `className` used only for parent layout, not contract bypass?

## 52.2 Truth and product review

- [ ] Are prices, availability, ranks, promotions, trust facts and reviews authoritative?
- [ ] Is absence handled by omission/fallback rather than fabricated content?
- [ ] Are claims/copy/media approved and traceable?
- [ ] Does the component avoid invented backend/AI behavior?
- [ ] Does it maintain one dominant action and clear recovery?

## 52.3 Accessibility review

- [ ] Native semantics used first?
- [ ] Accessible names/descriptions/errors correct?
- [ ] Keyboard path complete without hover/touch dependency?
- [ ] Focus visible, not clipped, and managed across async/overlay behavior?
- [ ] Contrast, forced colors, zoom, reflow and reduced motion verified?
- [ ] Status/loading announcements useful and not noisy?

## 52.4 Engineering review

- [ ] Correct owner/module and dependency direction?
- [ ] Minimal client boundary and bundle cost?
- [ ] Data loaded once at correct server/domain layer?
- [ ] Cache key/tag/privacy behavior correct?
- [ ] Suspense fallback and error isolation proportionate?
- [ ] No N+1, blanket image priority, raw provider URL or duplicate component system?
- [ ] File size/refactoring threshold considered with evidence?

## 52.5 QA review

- [ ] All applicable states rendered and tested?
- [ ] Realistic long/missing/error/slow content used?
- [ ] Required viewport/theme/browser evidence captured?
- [ ] Unit, component, integration and e2e tests match risk?
- [ ] Performance baseline/regression evidence recorded?
- [ ] No unrelated source/module/document changes in diff?

---

# 53. Required Test Strategy by Component Layer

| Layer | Minimum automated evidence | Minimum manual evidence |
|---|---|---|
| Pure primitive | Render/props/states, semantics, accessibility assertion | Focus, contrast, theme, zoom |
| Interactive primitive | Keyboard, controlled state, cleanup, disabled/pending, axe | Screen reader, touch, reduced motion, forced colors |
| Server pattern | Server render, data mapping, omission/error branch, link validity | No-JS path, responsive/visual |
| Domain component | View-model truth states, integration with action/query, security boundary | Realistic content, keyboard/screen reader, slow network |
| Overlay | Focus trap/restore, Escape, inert/scroll cleanup, SSR/hydration, axe | Mobile viewport/keyboard, screen reader, reduced motion |
| Homepage section | Gate, section order/composition, fallback and analytics descriptor | Wireframe fidelity, content/media review, CWV/Lighthouse |

Vitest's current Node-only environment cannot by itself prove browser focus, layout,
keyboard, image loading or accessibility. Homepage implementation must add/choose the
approved browser testing path under MDG rules; this document does not authorize a new
dependency outside that phase.

# 54. Homepage V2 Implementation Handoff

Before coding starts, all of the following must be approved or explicitly classified as
omitted/gated:

1. This Component Library Specification.
2. Content Guide: final brand identity, H1, hero/CTA, trust/value copy, footer/SEO copy.
3. Media Guide: inventory, required/missing assets, crops, alt, dimensions and priority.
4. Design QA Checklist.
5. Homepage release section matrix identifying each section as approved, conditional,
   gated/deferred or not applicable.

The Homepage implementation phase may then:

- extend/extract only the components marked required/allowed;
- add DDS tokens through compatibility aliases and scoped adoption;
- preserve public routes, cached catalog/shipping behavior and private cart streaming;
- remove the customer-facing admin recovery link;
- render no fake best sellers, promotions, trust claims, reviews or newsletter;
- run section-by-section tests and final lint/typecheck/test/build/QA gates;
- stop after Homepage V2.

It may not refactor payment, inventory, order, checkout, authentication, admin,
ProductGallery modal or other protected modules as part of visual Homepage work.

---

# 55. Validation Checklist for This Specification

- [x] Audited current reusable UI and route-local patterns.
- [x] Classified every requested component with exactly one primary status.
- [x] Documented all 36 component contracts with all 28 required fields.
- [x] Added design-token, CSS-variable, Tailwind, animation and accessibility mappings.
- [x] Added icon, z-index, responsive visibility, loading, Suspense, error-boundary,
      server-cache, memoization and per-component performance rules.
- [x] Added dependency, refactoring, file-size, gating and versioning rules.
- [x] Added dependency/ownership/section/migration/composition maps.
- [x] Added Component Definition of Done and Review Checklist.
- [x] Kept reviews, promotions, trust, newsletter and AI behind explicit gates.
- [x] Made no source-code, dependency, schema, migration, commit or push change.

---

## Permanent Rule

Future Work sessions MUST cite this stable file and the currently approved version.
They may implement only the named component/page scope, must re-audit current code before
editing, and must request Product Owner/architecture approval before changing a public
component contract, gate, token system, dependency, protected module or commerce
invariant.

End of Component Library Specification.
