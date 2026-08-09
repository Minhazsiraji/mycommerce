# AgentSiraji Commerce V2

## Homepage UX Specification and Mobile Wireframe

| Field | Value |
|---|---|
| Status | Planning specification — implementation not authorized |
| Primary viewports | 320, 375/390 and 430 px |
| Supporting viewports | landscape mobile, 768 px tablet and 1024 px transition |
| Visual authority | `docs/design/DESIGN_DESIGN_SYSTEM.md` |
| Engineering authority | SAS and Master Development Guide |
| Companion document | `docs/wireframes/HOMEPAGE_DESKTOP_WIREFRAME.md` |
| Protected scope | Checkout, authentication, payments, inventory, orders, account and admin behavior |

## 1. Document purpose

This document fixes the complete compact-screen homepage experience. It defines source
order, stacking, touch behavior, content pressure, loading/recovery and enhancement into
tablet/desktop modes. It is not a visual mockup and does not authorize implementation.

Mobile is the base experience. Desktop must enhance this information architecture, not
replace its meaning. A visitor using a 320 px viewport, touch, keyboard, screen reader,
200% zoom or reduced motion must be able to discover products and reach account/cart
without hidden essential content.

## 2. Mobile principles and truth rules

- Use 16 px minimum side gutters at 320 px; use 20 px at 375–430 px when content fits.
- Use the four-column conceptual grid with 16 px gaps.
- Use 48–64 px between sections and 20–24 px from section headings to content.
- Use minimum 44 x 44 px interactive targets and 16 px form text to avoid unintended zoom.
- Do not compress desktop navigation, place essential information behind hover, or use
  swipe-only interaction.
- One horizontal scroll region is allowed only when bounded, meaningful and keyboard-
  accessible. This specification does not authorize product/review carousels.
- Preserve the DDS truth rules: no invented bestseller labels, reviews, promotions,
  delivery claims, stock pressure, newsletter success or AI behavior.
- Sections gated in the desktop document remain gated here. A narrower screen is not a
  reason to replace missing data with placeholder marketing.
- Mobile analytics follows the same privacy restrictions and stable event names defined
  in the desktop companion.

## 3. Page-level mobile wireframe

```text
+--------------------------------------+
| WORDMARK               MENU CART     |
| [ Search products................ ]  |
+--------------------------------------+
| VERIFIED ANNOUNCEMENT / TRUST FACT   |
+--------------------------------------+
| HERO EYEBROW                         |
| One clear homepage H1                |
| Concise supporting copy              |
| [ PRIMARY CTA — FULL WIDTH ]         |
| [ Secondary discovery link ]         |
|                                      |
| [ APPROVED HERO MEDIA — 4:5 ]        |
+--------------------------------------+
| TRUST                                |
| [Delivery fact]                      |
| [Payment fact]                       |
| [Tracking/support fact]              |
+--------------------------------------+
| FEATURED CATEGORIES        [View all]|
| [Category]      [Category]           |
| [Category]      [Category]           |
+--------------------------------------+
| BEST SELLERS (only with valid data)  |
| [Product]       [Product]            |
| [Product]       [Product]            |
+--------------------------------------+
| NEW ARRIVALS                         |
| [Product]       [Product]            |
| [Product]       [Product]            |
+--------------------------------------+
| PROMOTION / COLLECTION MESSAGE       |
| qualification                        |
| [ CTA — FULL WIDTH ]                 |
| [ optional media ]                   |
+--------------------------------------+
| WHY BUY FROM US                      |
| [Reason]                             |
| [Reason]                             |
| [Reason]                             |
+--------------------------------------+
| CUSTOMER REVIEWS (future real data)  |
| [Review]                             |
| [Review]                             |
+--------------------------------------+
| [ BRAND STORY MEDIA ]                |
| BRAND STORY COPY                     |
| [Learn more]                         |
+--------------------------------------+
| NEWSLETTER (future approved flow)    |
| [ Email address ]                    |
| [ SUBSCRIBE — FULL WIDTH ]           |
| consent/privacy                      |
+--------------------------------------+
| FOOTER BRAND                         |
| SHOP LINKS                           |
| ORDER/SUPPORT LINKS                  |
| ACCOUNT/LEGAL LINKS                  |
+--------------------------------------+
```

## 4. Mobile content density and responsive matrix

| Range | Gutter | Product/category grid | Primary action | Navigation mode |
|---|---:|---|---|---|
| 320–374 px | 16 px | two columns only after stress test; otherwise one | full width | compact two-row |
| 375–430 px | 20 px preferred | two columns | full width in hero/forms | compact two-row |
| 431–639 px | 20 px | two columns | full/content width by context | compact two-row |
| 640–767 px | 24 px | two or three only at 220 px card minimum | content/full by context | compact enhanced |
| 768–1023 px | 24 px | 8-column tablet composition | content width | tablet disclosure |
| 1024 px+ | 32 px | desktop companion | content width | wide navigation |

At 320 px, two product cards have an approximate content width of 136 px after gutters
and gap. Because the DDS prefers 220 px cards, implementation must run real title/price/
image stress tests. If readability fails, use one column at 320–359 px and switch to two
columns only when content pressure permits. The breakpoint is content-driven, not assumed.

## 5. Section 1 — Header

### Purpose

Maintain orientation and direct access to discovery, menu, account and cart.

### Business Goal

Prevent mobile visitors from abandoning because product discovery or cart state is hidden.

### UX Goal

The visitor can search immediately and reach every primary destination with one explicit
menu/action.

### Components Used (from DDS)

Mobile navigation, wordmark link, menu trigger, account destination inside the drawer,
`CartBadge`, theme control, full-width search and Drawer pattern.

### Desktop Layout

At 1024 px+, transform to the one-row 12-column header defined in the desktop companion.

### Tablet Layout

At 768–1023 px use a 64 px row: wordmark, “Shop” disclosure, search, account, cart and
theme. If search cannot remain at least 240 px, move it to a second full-width row.

### Mobile Layout

Use two deliberate rows inside the compact gutter. Row 1 is 60–64 px: wordmark left;
menu and cart right; account and theme live in the menu unless testing proves a third
visible action fits with 44 px targets. Row 2 contains a 48 px full-width search field
with 12 px bottom spacing. Do not show a horizontal category strip in addition to the
menu unless later evidence proves it necessary.

```text
+--------------------------------------+
| WORDMARK              [Menu] [Cart]  |
| [ Search products................ ]  |
+--------------------------------------+
```

### Responsive Behavior

The menu trigger disappears only when full navigation is actually visible. Search never
disappears. Drawer contains primary categories, account, order tracking and theme; it
does not include admin. Wordmark, search and cart remain outside the drawer.

### Loading State

Render wordmark/search/menu immediately. Cart badge uses a fixed-size fallback. Menu may
show a local loading status for categories while Account, Track order and other known
routes remain usable.

### Empty State

If categories are empty, omit their group in the drawer; keep Search, Account, Track order
and Cart. No admin link.

### Error State

Category failure is local to the drawer. Keep stable controls and show “Categories are
temporarily unavailable” only inside the opened menu with Search as recovery.

### Accessibility Notes

Include visible-on-focus skip link. Menu button exposes expanded state and drawer label;
focus moves inside, is contained, Escape closes and focus returns to trigger. Search has
a persistent programmatic label. Icon-only controls have accessible names.

### Motion Notes

Drawer uses `--duration-moderate` and `--ease-standard`; reduced motion uses near-instant
opacity/state change. Sticky header, if later approved, must not animate size on every
small scroll movement.

### Performance Notes

Server-render stable shell. Hydrate only drawer/theme/cart behavior. Do not add a client
navigation framework or icon library.

### SEO Notes

Drawer category links remain standard anchors. Search results follow noindex policy. The
wordmark links to `/`.

### Analytics Events

`nav_menu_open`, `nav_category_select`, `nav_search_submit`, `nav_cart_select`,
`nav_account_select`; include viewport mode=`compact` and destination key only.

### Acceptance Criteria

- All targets fit at 320 px without overlap or horizontal page scroll.
- Search and cart are visible without opening the drawer.
- Drawer completes keyboard, screen-reader, Escape and focus-return behavior.
- Cart resolution causes no layout shift.
- No essential category/account destination is hover-only.

## 6. Section 2 — Announcement Bar

### Purpose

Show the highest-value verified store fact directly below navigation.

### Business Goal

Reduce uncertainty about delivery/payment before browsing.

### UX Goal

Communicate one primary fact and optional concise supporting facts without a ticker.

### Components Used (from DDS)

Trust/announcement bar, trust item, decorative icon, muted text and optional policy link.

### Desktop Layout

At 1024 px+, show up to three inline facts as defined in the desktop companion.

### Tablet Layout

Use one row if all facts fit at readable size; otherwise use a balanced two-row wrap.

### Mobile Layout

Use one 44 px minimum row for the primary configured fact. If two/three facts are equally
important, allow a clearly bounded horizontal scroll list with 16 px gap, edge padding and
native touch/keyboard scroll. Prefer concise omission over a perpetual ticker.

```text
+--------------------------------------+
| icon  Verified delivery/payment fact|
+--------------------------------------+
```

### Responsive Behavior

Reveal supporting detail at `sm`/`md`; never change the factual value. Remove the entire
row when no valid fact exists.

### Loading State

Reserve at most one 44 px row only when facts are streamed. Prefer cached server output.

### Empty State

Omit with zero height.

### Error State

Omit failed facts. Never guess threshold, timing or payment availability.

### Accessibility Notes

Label region “Store information.” A scroll region, if used, is keyboard reachable only
when necessary and has visible content/meaning; no repeated live announcements.

### Motion Notes

No marquee, auto-scroll or pulsing. Temporary facts may fade once.

### Performance Notes

No client JavaScript for passive facts; reuse tagged cache.

### SEO Notes

Facts match checkout and visible policies; no keyword or fake urgency content.

### Analytics Events

None for passive display. `announcement_select` only for a real link.

### Acceptance Criteria

- No auto-scrolling or clipped qualification.
- Exactly the same claim is true on mobile and desktop.
- Empty/error removal leaves no gap.

## 7. Section 3 — Hero Section

### Purpose

Explain the store proposition and open one dominant discovery path.

### Business Goal

Convert first-screen attention into catalog intent.

### UX Goal

Make value, action and media understandable in a single vertical sequence.

### Components Used (from DDS)

Split/brand hero adapted to stack, eyebrow, fluid heading, support copy, hero-size button,
secondary link/button, stable media and restrained liquid-light material.

### Desktop Layout

At 1024 px+, use the approved 7/5 split and 520–620 px composition.

### Tablet Layout

Use split only if both regions remain readable; otherwise use the mobile source order with
larger spacing and a 16:10/4:3 editorial media crop where approved.

### Mobile Layout

Content order is eyebrow → one `h1` → support copy → full-width primary CTA → secondary
text/secondary button → optional trust cue → media. Use 24 px top padding after the shell,
12–16 px heading gaps, 24 px copy-to-action gap, 12 px action gap and 32 px action-to-media.
Media spans all four columns, uses stable 4:5/approved crop and `--radius-xl`. Do not force
a fixed viewport-height hero.

```text
+--------------------------------------+
| EYEBROW                              |
| Clear homepage H1                    |
| 2–4 lines of approved support copy   |
| [ PRIMARY CTA — 56 px ]              |
| [ Secondary discovery action ]       |
| optional verified cue                |
|                                      |
| [ APPROVED HERO MEDIA / FALLBACK ]   |
+--------------------------------------+
```

### Responsive Behavior

Copy always precedes media in DOM. At 320 px heading uses the fluid scale without orphaned
single words where copy can be edited. At `sm` a pair of CTAs may share a row only when both
retain clear hierarchy and 44 px targets.

### Loading State

Render approved copy and CTA immediately. Reserve exact media ratio and use a quiet static
skeleton. Hero image is the only mobile LCP priority candidate.

### Empty State

Missing approved media uses the DDS brand-led liquid-light fallback. Missing approved copy
blocks release; Work must not write it.

### Error State

Image failure keeps copy and CTA on a contrast-safe solid surface. Invalid destination
removes the affected CTA before release.

### Accessibility Notes

One `h1`; logical order; useful alt for meaningful media; empty alt for decorative brand
material. Full-width CTA has descriptive label. Text overlay is avoided on compact media.

### Motion Notes

Content appears immediately. Optional media fade uses `--duration-reveal`; no scroll
parallax or translation from off-screen. Reduced motion is fully static.

### Performance Notes

Use correct compact `sizes`, subject-safe mobile source/crop and optimized dimensions.
Avoid loading desktop crop alongside mobile crop when art direction can select one.

### SEO Notes

H1 and visible copy align with approved homepage metadata. Standard anchor destinations.

### Analytics Events

`hero_primary_select`, `hero_secondary_select` with content/destination keys and compact
viewport mode.

### Acceptance Criteria

- Proposition and primary CTA appear before media and without animation delay.
- Hero never causes horizontal scroll or CLS at 320–430 px.
- Button labels and media crop survive long/Bangla content stress when approved.
- Media failure does not remove discovery.

## 8. Section 4 — Trust Indicators

### Purpose

Provide transaction confidence using evidence-backed service facts.

### Business Goal

Lower mobile hesitation before the longer product journey.

### UX Goal

Make delivery, payment and recovery facts readable without a dense badge strip.

### Components Used (from DDS)

Trust item/content card, icon, title, concise explanation and optional link.

### Desktop Layout

Three equal columns.

### Tablet Layout

Three columns where each reaches 220 px, otherwise 2+1.

### Mobile Layout

Use one vertical list in a shared soft/solid surface. Each item uses icon in column 1 and
title/copy in columns 2–4, 16–20 px internal padding and 16 px separators/gaps. Do not use
a three-slide carousel.

```text
| TRUST                                |
| [icon] Delivery fact                 |
| [icon] Payment fact                  |
| [icon] Track/support fact            |
```

### Responsive Behavior

At `md`, separate into cards; order remains delivery → payment → tracking.

### Loading State

Render resolved facts only. If streamed, one quiet list skeleton preserves height.

### Empty State

Omit when fewer than two verified facts exist.

### Error State

Remove failed item; remove section if fewer than two remain.

### Accessibility Notes

Semantic list and section heading. Icons decorative. Links use specific text and 44 px
touch spacing.

### Motion Notes

No passive motion. Linked rows may show pressed/focus feedback.

### Performance Notes

Inline icons and server facts; no dependency or hydration.

### SEO Notes

Claims match policies/checkout and are not schema certifications.

### Analytics Events

`trust_item_select` for real links only.

### Acceptance Criteria

- Facts remain complete and readable at 320 px.
- There is no swipe/hover requirement.
- Unverified facts never render.

## 9. Section 5 — Featured Categories

### Purpose

Offer visual, thumb-friendly entrances to major product groupings.

### Business Goal

Increase useful category visits from mobile traffic.

### UX Goal

Let a visitor identify and select a category without opening navigation.

### Components Used (from DDS)

Section heading, optional view-all link and compact/image-led `CollectionCard`.

### Desktop Layout

Four equal cards in one row.

### Tablet Layout

Two columns at 768 px; possibly three only when card minimum width passes.

### Mobile Layout

Use a two-column grid with 16 px gap and consistent media ratio. Heading sits above; “View
all” aligns on the same baseline only if both fit without shrinking. Card name sits below
media and may wrap to two lines. At 320 px, use compact card variant or one column if real
content becomes illegible.

```text
| Featured categories       [View all]|
| [Category]       [Category]          |
| [Category]       [Category]          |
```

### Responsive Behavior

Grid changes at content pressure, not device labels. Preserve order and full titles. No
CSS-hidden extra cards or auto-carousel.

### Loading State

Four matched card skeletons with stable media ratio; at 320 px use the final one/two-column
geometry to prevent reflow.

### Empty State

Omit if active categories lack approved content/media. Search and New Arrivals recover.

### Error State

Omit locally. If all discovery fails, page-level error provides Search/retry.

### Accessibility Notes

Full-card semantic links with visible focus. Images may be decorative when label fully names
the category. No text embedded in imagery.

### Motion Notes

Tap uses pressed feedback no larger than scale `.98`; focus state is equivalent. No hover-
revealed label.

### Performance Notes

Lazy-load optimized media with two-/one-column `sizes`; query only displayed categories.

### SEO Notes

Use real canonical category routes and taxonomy labels.

### Analytics Events

`category_card_select`, `featured_categories_view_all_select` with position/category key.

### Acceptance Criteria

- Cards remain readable with long names at 320 px.
- Every card target is at least 44 px and destination exists.
- No horizontal product/category carousel is introduced.

## 10. Section 6 — Best Selling Products

### Purpose

Present evidence-backed popular products for quick comparison.

### Business Goal

Increase confident product-detail visits.

### UX Goal

Show image, full title, price and availability in a compact but readable grid.

### Components Used (from DDS)

Section heading, optional view-all, `ProductGrid` and `ProductCard`; no quick-add.

### Desktop Layout

Four cards in a 12-column row.

### Tablet Layout

Two cards at 768 px; three at 1024 px only if each reaches 220 px.

### Mobile Layout

Show four ranked products in two columns at 375–430 px. At 320 px, pass stress tests for
image, long two/three-line title and large BDT price; otherwise render one column. Use 16 px
column gap and 32 px row gap. Media uses consistent 4:5 ratio.

```text
| Best sellers                         |
| [Product 1]      [Product 2]         |
| [Product 3]      [Product 4]         |
```

### Responsive Behavior

Rank order remains server-defined. Never hide title, price or sold-out state to keep two
columns. Do not convert to a swipe rail.

### Loading State

Render skeletons only for the first expected rows; geometry matches final column count.

### Empty State

Omit if ranking rule/query is absent or insufficient. Never relabel newest items.

### Error State

Omit and continue to New Arrivals.

### Accessibility Notes

Grid/list semantics, visible full-card focus, textual availability and complete prices.
DOM order matches rank order.

### Motion Notes

Tap/focus feedback only; no auto-scroll or urgency motion.

### Performance Notes

Lazy-load all images; none should replace the hero as priority. Query only rendered count
and card fields. Cache public rank output under an approved invalidation/freshness rule.

### SEO Notes

Canonical product links only. No rating/rank structured data without approved facts.

### Analytics Events

`product_card_select` with placement=`best_sellers`, position, product and ranking version.

### Acceptance Criteria

- Section does not exist without an approved ranking contract.
- One-/two-column rule is chosen from real 320 px content tests.
- Title, price and stock meaning are never clipped or hover-only.

## 11. Section 7 — New Arrivals

### Purpose

Provide dependable discovery of the newest published products.

### Business Goal

Support repeat visits and expose current inventory.

### UX Goal

Make the latest products comparable without extra gestures.

### Components Used (from DDS)

Section heading, optional view-all, newest cached catalog read, `ProductGrid` and
`ProductCard`.

### Desktop Layout

Four cards in one row using the desktop product grid.

### Tablet Layout

Two columns at 768 px and up to three at 1024 px when card minimum passes.

### Mobile Layout

Match the Best Sellers one-/two-column breakpoint and spacing. Show four newest products
or approved count. Keep product presentation identical across product sections.

```text
| New arrivals                        |
| [Product 1]      [Product 2]        |
| [Product 3]      [Product 4]        |
```

### Responsive Behavior

Newest order remains server-authoritative. No CSS-hidden downloaded products. Full title
and price remain visible.

### Loading State

Geometry-matched product skeletons; heading remains available.

### Empty State

When the whole active catalog is empty, show one customer-safe full-width state in this
location with approved discovery/contact recovery. Never link to admin.

### Error State

Local message and safe retry when useful; if other discovery sections work, omission is
preferred to repeated error noise.

### Accessibility Notes

Logical section heading/list; useful image alt; retry announced once; sold-out state text.

### Motion Notes

DDS card/tap behavior only; reduced-motion skeleton static.

### Performance Notes

Reuse tagged cache, request compact image dimensions and exact rendered count.

### SEO Notes

Canonical product links; no artificial “new” badge/structured claim.

### Analytics Events

`product_card_select` with placement=`new_arrivals`; `new_arrivals_view_all_select` only
with real destination.

### Acceptance Criteria

- Authoritative newest order is preserved.
- Empty store state is shown once and contains no operator path.
- Grid breakpoint follows the same tested product-card contract as Best Sellers.

## 12. Section 8 — Promotional Banner

### Purpose

Feature one current approved collection, seasonal story or offer.

### Business Goal

Direct mobile attention to a commercial priority without a disruptive overlay.

### UX Goal

Explain the promotion and material terms before selection.

### Components Used (from DDS)

Promotional card/banner, heading, support/qualification text, full-width CTA, optional
media and brand-soft/approved gradient surface.

### Desktop Layout

Eight-column copy and four-column media split.

### Tablet Layout

Five/three split or stack at content pressure.

### Mobile Layout

Use one full-width card with 24 px padding. Order: eyebrow → heading → qualification → CTA
→ optional media. CTA spans full width. Media is below copy and may be omitted when purely
decorative. No floating text over a busy image.

```text
| PROMOTION / COLLECTION                |
| Clear factual message                 |
| timing/qualification                  |
| [ EXPLORE — FULL WIDTH ]              |
| [ optional approved media ]           |
```

### Responsive Behavior

All material terms remain visible at every width. No mobile-only shorthand that changes
offer meaning. No countdown.

### Loading State

Render stable approved copy; reserve media. Do not swap campaign after hydration.

### Empty State

Omit when no approved campaign exists.

### Error State

Omit if destination or offer verification fails.

### Accessibility Notes

Readable qualification, contrast-safe surface, descriptive CTA and decorative media alt
handling. No urgency announced repeatedly.

### Motion Notes

Static by default; optional one-time media fade. No pulsing/continuous liquid motion.

### Performance Notes

Lazy-load optional media, no animation library or campaign SDK.

### SEO Notes

Visible facts only; destination is a stable existing route.

### Analytics Events

`promotion_select` with approved campaign/destination key.

### Acceptance Criteria

- CTA and material terms fit at 320 px.
- No modal/interstitial blocks mobile discovery.
- Invalid/missing campaign collapses cleanly.

## 13. Section 9 — Why Buy From Us

### Purpose

Explain evidence-backed advantages of choosing the store.

### Business Goal

Strengthen trust after product discovery.

### UX Goal

Present two or three specific reasons in a readable vertical sequence.

### Components Used (from DDS)

Section heading and content cards/list rows with icon, title, explanation and optional link.

### Desktop Layout

Three equal cards.

### Tablet Layout

Three columns or 2+1 at content pressure.

### Mobile Layout

Stack full-width cards with 16 px gaps and 20–24 px padding. If the content is short, use
one shared surface with separators to reduce scroll. Do not shrink copy below DDS body size.

```text
| Why buy from us                    |
| [icon] Reason + evidence           |
| [icon] Reason + evidence           |
| [icon] Reason + evidence           |
```

### Responsive Behavior

Same approved reason order and qualifications. At tablet, separate into cards.

### Loading State

Server-render approved facts; dynamic uncertain claims do not get marketing skeletons.

### Empty State

Omit if fewer than two differentiated reasons exist.

### Error State

Omit unverified items/section rather than substituting generic copy.

### Accessibility Notes

Semantic list, decorative icons, complete copy and descriptive optional links.

### Motion Notes

Passive rows static; linked rows use pressed/focus feedback only.

### Performance Notes

No client JavaScript; inline icons.

### SEO Notes

No duplicated keyword claims or links to nonexistent policy routes.

### Analytics Events

`service_reason_select` for real links only.

### Acceptance Criteria

- Text remains readable without excessive card chrome.
- Section adds information beyond trust bar/indicators.
- Every fact is approved and supportable.

## 14. Section 10 — Customer Reviews

### Purpose

Provide authentic moderated customer evidence when a valid source exists.

### Business Goal

Reduce risk perception without manufacturing social proof.

### UX Goal

Make review context, words and attribution understandable without a carousel.

### Components Used (from DDS)

Review content card, optional verified status, quote, attribution and product/context link.

### Desktop Layout

Three equal review cards.

### Tablet Layout

Two columns plus full-width third or two approved items.

### Mobile Layout

Stack up to three cards with 16 px gaps. Show complete reasonable excerpts. Longer content
uses an explicit accessible disclosure, not visual clipping. No swipe rail or auto-rotation.

```text
| What customers say                |
| [Real review + attribution]       |
| [Real review + attribution]       |
| [Real review + attribution]       |
```

### Responsive Behavior

At wider widths cards form columns; source/reading order stays unchanged. Rating always has
a textual equivalent.

### Loading State

Matched skeleton cards hidden from assistive technology; one loading status for region.

### Empty State

Omit until real moderated, consented published data exists. No “sample” content.

### Error State

Omit locally. Never fall back to static invented quotes.

### Accessibility Notes

Actual quotes use appropriate semantics; attribution respects privacy; expanded content
manages focus/state; no rating meaning from stars/color alone.

### Motion Notes

No carousel/auto-rotation. Disclosure uses standard DDS transition and reduced-motion state.

### Performance Notes

No third-party widget. Query only published review fields when the future module exists.

### SEO Notes

No review/AggregateRating schema until separately approved valid data rules exist.

### Analytics Events

`review_expand`, `review_product_select` with non-PII identifiers.

### Acceptance Criteria

- This section remains absent in initial implementation unless its domain gate is approved.
- No touch/swipe gesture is required to read reviews.
- Customer identity/privacy and consent rules pass.

## 15. Section 11 — Brand Story

### Purpose

Connect the store promise to a concise approved organization story.

### Business Goal

Build brand recognition and credibility.

### UX Goal

Offer a calm editorial pause and optional path to deeper company information.

### Components Used (from DDS)

Editorial media, eyebrow, heading, short body copy and secondary/link action.

### Desktop Layout

Five-column media, one-column gap and six-column copy.

### Tablet Layout

Even split or stacked when line length/media width becomes poor.

### Mobile Layout

Order is media → eyebrow → heading → body → optional “Learn our story” link. Media uses
full content width and stable ratio; copy begins 24–32 px below it. Body line length uses
the available width and normal spacing; no text overlay.

```text
| [ APPROVED BRAND MEDIA ]          |
| Eyebrow                           |
| Brand story heading               |
| Concise approved story            |
| [Learn our story]                 |
```

### Responsive Behavior

At tablet/desktop regions become side-by-side without changing DOM meaning. Link is omitted
until `/about` exists.

### Loading State

Copy server-renders; media geometry reserved.

### Empty State

Omit until approved copy/media exist.

### Error State

Media failure leaves copy on a solid surface. Dead learn-more link is never shown.

### Accessibility Notes

Meaningful media alt, logical heading, readable line length and 44 px link target area.

### Motion Notes

Static by default or one fade; no mobile parallax.

### Performance Notes

Lazy-load compact image source and avoid desktop-sized asset download.

### SEO Notes

Organization facts and `/about` route must be approved/consistent.

### Analytics Events

`brand_story_select` only when link exists.

### Acceptance Criteria

- Mobile source order reads naturally without visual repositioning.
- No text is embedded in media or overlaid on unsafe crop.
- Section is omitted rather than invented.

## 16. Section 12 — Newsletter

### Purpose

Offer an optional, consented subscription path after the visitor has received homepage value.

### Business Goal

Build an owned audience with transparent expectations.

### UX Goal

Make value, frequency, email input, consent and result clear in one vertical form.

### Components Used (from DDS)

Content/promotional surface, heading, copy, email `Input`, primary `Button`, inline help/
error/status and privacy link.

### Desktop Layout

Seven-column copy and five-column inline form.

### Tablet Layout

Stack copy over an inline form.

### Mobile Layout

Use one full-width surface with 24 px padding. Order: heading → value/frequency → visible
email label → 48 px email input → 52 px full-width Subscribe button → consent/privacy.
Gaps are 12–16 px, with 8 px from field to help/error.

```text
| Newsletter value/frequency          |
| Email address                       |
| [ name@example.com                ] |
| [ SUBSCRIBE — FULL WIDTH          ] |
| consent + privacy link              |
```

### Responsive Behavior

At 640 px field/button may share a row only when field remains at least 280 px. Consent is
never hidden or collapsed.

### Loading State

Disable duplicate submit, preserve label width and announce “Subscribing…” once. Do not
block the page or hide entered email.

### Empty State

Omit until backend, consent, privacy, frequency and unsubscribe rules are approved.

### Error State

Show connected inline error; preserve email for safe retry; never expose provider details or
claim success before authoritative response.

### Accessibility Notes

Visible/programmatic label, `type=email`, autocomplete, 16 px input text, linked errors,
focus on error when appropriate and concise status live region.

### Motion Notes

Immediate state change or subtle fade; no celebratory animation that covers controls.

### Performance Notes

No embedded marketing script; approved server submission only with validation/rate limiting.

### SEO Notes

Privacy route exists before rendering; email never enters URL/metadata.

### Analytics Events

`newsletter_submit_attempt`, `newsletter_submit_success`, `newsletter_submit_error` with
controlled result only; never email value.

### Acceptance Criteria

- On-screen keyboard does not hide input, button or error recovery.
- Form works with autofill, paste, keyboard and screen reader.
- Section remains absent until the full consent/backend gate passes.

## 17. Section 13 — Footer

### Purpose

Provide mobile service recovery, navigation, contact and legal identity at page end.

### Business Goal

Retain customers who need tracking/help and reinforce legitimacy.

### UX Goal

Make the most important recovery routes easy to scan and tap without dense columns.

### Components Used (from DDS)

Footer shell, brand block, navigation groups, contact links, optional disclosure/accordion
pattern and lower legal/payment line.

### Desktop Layout

Four columns plus lower bar.

### Tablet Layout

Two columns over two rows.

### Mobile Layout

Stack brand first, then Shop, Orders/Support, Account and Legal groups. Default to expanded
groups for simplicity. If accordion is necessary after content grows, each heading is a
44 px button with expanded state and panels remain accessible. Use 40–48 px top/bottom
padding, 24 px between groups and 12 px between links. Track order is the first recovery link.

```text
| BRAND + approved promise             |
|                                      |
| SHOP                                 |
| Category / Search links              |
|                                      |
| ORDERS & SUPPORT                     |
| Track order / Order history          |
|                                      |
| ACCOUNT / LEGAL (live routes only)   |
|                                      |
| © brand · approved payment facts     |
```

### Responsive Behavior

Groups become two/four columns without reordering meaning. Long contact values wrap. Legal
and social links appear only when live and maintained.

### Loading State

Brand, account and tracking routes render immediately. Category group may resolve separately
without shifting other groups.

### Empty State

Remove empty groups; retain brand and real recovery paths.

### Error State

Remove failed category links locally. Never render placeholders/dead links.

### Accessibility Notes

Semantic footer and uniquely labeled nav groups. 44 px practical targets; disclosure focus/
state complete if used; telephone/email links use correct schemes.

### Motion Notes

No passive animation. Accordion uses DDS timing and reduced-motion alternative only if built.

### Performance Notes

Server-render cached routes/data; no social/payment widget scripts.

### SEO Notes

All visible links resolve. No legal link until its route/content is approved.

### Analytics Events

`footer_link_select` with group/destination key, never contact content.

### Acceptance Criteria

- Footer is fully usable at 320 px and 200% zoom.
- Track order is easy to find.
- No dead, admin or placeholder link appears.
- Accordion, if used, is optional enhancement—not the only semantic structure.

## 18. Mobile section spacing and stacking contract

| Transition | 320–430 px spacing | Tablet spacing | Notes |
|---|---:|---:|---|
| Shell → Hero | 24 px | 32 px | announcement omitted collapses cleanly |
| Hero → Trust | 48–64 px | 64 px | media end determines start |
| Standard sections | 64 px | 64–80 px | use 48 px only for related compact regions |
| Heading → grid/cards | 20–24 px | 24–32 px | never arbitrary |
| Product rows | 32 px | 32–40 px | preserve title wrapping |
| Last section → Footer | 64 px | 80 px | newsletter omission collapses |

No negative margins or overlapping media are authorized. Safe-area inset is respected for
drawers/toasts, but the homepage has no fixed bottom action bar.

## 19. Mobile Homepage User Journey

```text
ARRIVE
  -> scan wordmark + search + cart
  -> read proposition and primary CTA
  -> choose category/search
  -> compare product cards in one/two-column grid
  -> open product detail

MENU RECOVERY
  -> open menu
  -> category / account / track order
  -> close with selection, Escape or close control

PAGE-END RECOVERY
  -> footer
  -> track order / account / contact / live policy

OPTIONAL RETENTION
  -> newsletter value + consent
  -> submit
  -> authoritative inline result
```

The mobile journey never requires sideways product swiping, hover, precise gestures, account
creation or newsletter submission to reach the catalog.

## 20. Mobile Conversion Funnel

| Stage | Mobile interaction | Measure | Recovery |
|---|---|---|---|
| Understand | hero/verified trust visible | meaningful view | Search remains above hero |
| Discover | search, menu category, category card or CTA | destination select | New Arrivals |
| Evaluate | tap product card | product-detail visit | back returns to same position where possible |
| Purchase intent | downstream add-to-cart | outside homepage | product detail handles failure |
| Retain/recover | newsletter/account/tracking | authoritative success/navigation | inline error/footer alternative |

Do not treat scroll depth, hover-equivalent exposure or accidental drawer opening as conversion.

## 21. Mobile Interaction Map

| Interaction | Touch behavior | Keyboard/screen-reader behavior | Result |
|---|---|---|---|
| Menu | 44 px tap target opens drawer | button state, focus moves/traps/restores | navigation choices |
| Search | tap field; keyboard-safe submit | labeled search form | `/search` navigation |
| Cart | visible 44 px action | named link and stable count | `/cart` |
| Category card | entire card is one target | one semantic link | category route |
| Product card | entire primary region is one link | visible focus, full title/price read | product route |
| CTA | full-width primary target | standard link/button | approved route |
| Review expand | explicit control, no swipe | expanded state and focus stable | full review text |
| Newsletter | input then full-width submit | labeled field, status/error announced | subscription result |
| Footer group | expanded by default | semantic headings/links | recovery route |

Back navigation should return to the prior homepage position when browser behavior permits. No
homepage UI captures edge-swipe/back gestures.

## 22. Mobile Component Dependency Map

```text
Mobile homepage route (Server Component)
|
+-- Mobile storefront shell
|   +-- Header
|   |   +-- Wordmark
|   |   +-- MenuButton -> NavigationDrawer (minimal client boundary)
|   |   +-- CartBadge (streamed visitor state)
|   |   +-- SearchForm
|   +-- AnnouncementBar (cached public facts)
|   +-- MobileFooter (server-rendered public links)
|
+-- Main composition
    +-- MobileHero -> Button + responsive media
    +-- TrustList -> TrustItem[]
    +-- CollectionGrid -> CollectionCard[]
    +-- ProductSection -> ProductGrid -> ProductCard[]
    +-- PromotionalBanner (conditional)
    +-- ServiceReasonList (conditional)
    +-- ReviewList (future gated data)
    +-- BrandStory (conditional approved content)
    +-- NewsletterForm (future gated server action)
```

Mobile layout variants share semantic components with desktop. They do not justify separate
`MobileProductCard`, `MobileButton` or duplicated business/data modules.

## 23. Mobile loading, empty and error strategy

- Keep header, search, approved hero copy and footer recovery usable while optional regions load.
- Match skeleton column count to the final breakpoint; do not swap from one to two columns after
  content resolution.
- Never show more skeleton content than the first expected mobile viewport/rows need.
- If the full catalog is empty, show one safe empty-store state in New Arrivals.
- If all discovery reads fail, show one page-level message with safe retry while retaining Account,
  Cart, Track order and contact paths.
- Optional section omission is not announced as an error.
- On-screen keyboard must not cover form error, submit action, drawer close or focus target.

## 24. Mobile performance and media contract

- The hero image is the only homepage priority candidate.
- Every image has stable ratio/dimensions and compact `sizes`; below-fold media lazy-loads.
- Do not download both desktop and mobile image assets when responsive selection can choose one.
- Avoid horizontally scrollable product regions, JS carousels and scroll listeners.
- Keep drawer interaction as the primary new client boundary; homepage sections remain server-first.
- Measure LCP, INP and CLS on a throttled representative mobile profile, not desktop only.
- Target LCP <= 2.5 s, INP <= 200 ms and CLS <= 0.1; aim CLS <= 0.05 for homepage geometry.
- No continuously animated blur, liquid background or large shadow.

## 25. Mobile accessibility test contract

Required manual cases:

- 320 px portrait, 375/390 px portrait, 430 px portrait and landscape mobile;
- 200% text zoom, 400% reflow and long/Bangla content stress when approved;
- keyboard-only menu, search, cards, newsletter and footer;
- screen-reader landmarks, `h1`, menu state, cart count, product price/stock and form results;
- reduced motion, forced colors and light/dark themes;
- touch targets and spacing with no accidental adjacent activation;
- on-screen keyboard with search/newsletter input;
- slow/failed images and slow/failed catalog regions.

Automated checks supplement, but do not replace, these cases.

## 26. Mobile SEO and analytics contract

- Mobile and desktop render the same semantic facts, link destinations and canonical page.
- DOM does not contain duplicate hidden desktop/mobile copy merely to change placement.
- Important content is server-rendered and not dependent on drawer hydration.
- Raw search text, email, reviewer identity/contact and fine-grained viewport dimensions do not enter
  analytics.
- Event names/properties are identical across responsive modes; `viewport_mode=compact` distinguishes
  analysis without fingerprinting.

## 27. Mobile implementation acceptance criteria

Homepage V2 mobile is acceptable only when:

- 320 px has no page-level horizontal scroll;
- source order matches this document and remains logical without CSS;
- search/cart are accessible without opening the menu;
- all touch targets meet the practical 44 px minimum;
- menu focus, Escape, restoration, background inertness and scroll locking pass;
- product/category one-/two-column breakpoint is justified by real content stress tests;
- no required content or action depends on hover, swipe, animation or fine motor control;
- loading/empty/error states preserve layout and recovery;
- conditional/gated sections follow the desktop truth/data gates exactly;
- mobile image downloads, JS bundle impact and Core Web Vitals meet budgets;
- light/dark, reduced motion, keyboard, screen-reader, zoom and on-screen keyboard tests pass;
- lint, strict typecheck, tests and release-equivalent build pass under the MDG;
- protected commerce/auth/admin modules remain unchanged.

## 28. Explicit mobile exclusions

This wireframe does not authorize:

- bottom tab navigation or fixed add-to-cart bar on the homepage;
- horizontally swipeable product/review carousels;
- mobile-only offers, abbreviated qualifications or hidden trust terms;
- app-install banners, push-notification prompts or location permission prompts;
- quick-add, wishlist, AI assistant or chat bubble;
- auto-opening menu, newsletter modal or promotional interstitial;
- separate mobile domain/data components when responsive presentation is sufficient;
- application/source changes during this planning task.

---

## Approval gate

Approval of this document fixes the mobile homepage hierarchy, responsive transformations and
interaction behavior. It does not authorize code until the Product Owner also approves the desktop
companion and the concrete brand copy, CTA destinations, merchandising order, imagery and intended
first-release status of every gated section.
