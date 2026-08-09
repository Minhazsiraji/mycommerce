# AgentSiraji Commerce V2

## Homepage UX Specification and Desktop Wireframe

| Field | Value |
|---|---|
| Status | Planning specification — implementation not authorized |
| Primary viewport | 1280–1440 px |
| Supporting viewports | 768 px tablet, 1024 px small laptop, 1536–1920 px large desktop |
| Visual authority | `docs/design/DESIGN_DESIGN_SYSTEM.md` |
| Engineering authority | SAS and Master Development Guide |
| Companion document | `docs/wireframes/HOMEPAGE_MOBILE_WIREFRAME.md` |
| Protected scope | Checkout, authentication, payments, inventory, orders, account and admin behavior |

## 1. Document purpose

This document fixes the homepage information hierarchy, content contracts, desktop
composition, responsive transformations, interaction behavior and implementation
acceptance criteria. It is an implementation specification, not a visual mockup and
does not authorize source changes.

The homepage must help a first-time visitor answer, in order:

1. What store is this and what can I buy here?
2. Why should I trust it?
3. Where should I start browsing?
4. Which products are relevant now?
5. How can I recover, subscribe or continue later?

The homepage primary success action is entering a collection, search result or product
detail page. Checkout conversion is a downstream outcome, not a reason to overload the
homepage.

## 2. Authority and truth rules

- Follow the authority order: approved task prompt → wireframes → DDS → MDG → SAS.
- Use the DDS semantic tokens; do not introduce local colors, spacing, radii or motion.
- Preserve the current modular monolith and server-first rendering model.
- Reuse `ProductCard`, `ProductGrid`, `Button`, cached catalog reads, cart badge, theme
  infrastructure and current storefront routes where their contracts fit.
- No quick-add, wishlist, carousel, countdown, fake urgency or AI entry point is
  authorized by this wireframe.
- “Best seller” requires a documented measurement window and authoritative completed
  order data. If that query does not exist, do not infer ranking from recency or stock.
- “New arrival” means the current authoritative newest-published sort; a badge is not
  required.
- Customer reviews require a real approved review/testimonial source, publication
  consent and moderation. Until then, omit the section without leaving a blank region.
- Newsletter requires approved consent copy, privacy route and functioning submission
  handling. Until then, omit it.
- Promotion, trust, delivery and payment claims must be current, configured facts.
- Brand story and all marketing copy require Product Owner approval before release.
- Analytics is proposed in this document but is not permission to add a vendor or new
  dependency. Events must be privacy-safe and consent-aware.

## 3. Desktop layout foundation

### 3.1 Container and grid

| Mode | Width | Container | Columns | Gutter | Column gap |
|---|---:|---:|---:|---:|---:|
| Tablet portrait | 768–1023 px | fluid | 8 | 24 px | 20 px |
| Small laptop | 1024–1279 px | 1152 px maximum | 12 | 32 px | 24 px |
| Desktop | 1280–1535 px | 1152 px default; 1280 px approved media regions | 12 | 32–40 px | 24 px |
| Large desktop | 1536 px+ | 1280 px maximum | 12 | 40–48 px | 32 px |

The header, product grids and footer use the content container. Hero and promotional
media may use the wide container. No homepage content exceeds `--container-wide`.

### 3.2 Vertical rhythm

- Header and announcement bar belong to the storefront shell and do not consume page
  section spacing.
- Hero begins immediately below the announcement bar with 32 px top breathing room on
  desktop and 24 px on tablet.
- Standard section separation is 80 px desktop and 64 px tablet.
- Large editorial transitions may use 96 px; compact trust/newsletter adjacency may use
  64 px.
- Section heading-to-content distance is 24–32 px.
- Homepage bottom content-to-footer separation is 80 px.

### 3.3 Page-level desktop wireframe

```text
+--------------------------------------------------------------------------------+
| HEADER: WORDMARK | CATEGORIES | SEARCH                    ACCOUNT CART THEME    |
+--------------------------------------------------------------------------------+
| ANNOUNCEMENT / VERIFIED DELIVERY + PAYMENT FACTS                               |
+--------------------------------------------------------------------------------+
|                                                                                |
| HERO COPY  [7 cols]                         | HERO MEDIA [5 cols]              |
| Eyebrow · H1 · support copy                 | stable media / product stage     |
| [Primary CTA] [Secondary CTA]               |                                 |
|                                                                                |
+--------------------------------------------------------------------------------+
| TRUST INDICATORS: DELIVERY | SECURE PAYMENT | ORDER TRACKING                    |
+--------------------------------------------------------------------------------+
| FEATURED CATEGORIES: [CARD] [CARD] [CARD] [CARD]                                |
+--------------------------------------------------------------------------------+
| BEST SELLING PRODUCTS: [PRODUCT] [PRODUCT] [PRODUCT] [PRODUCT]                  |
+--------------------------------------------------------------------------------+
| NEW ARRIVALS:          [PRODUCT] [PRODUCT] [PRODUCT] [PRODUCT]                  |
+--------------------------------------------------------------------------------+
| PROMOTIONAL BANNER: message + CTA [8 cols] | approved media [4 cols]           |
+--------------------------------------------------------------------------------+
| WHY BUY FROM US:       [REASON] [REASON] [REASON]                              |
+--------------------------------------------------------------------------------+
| CUSTOMER REVIEWS:      [REVIEW] [REVIEW] [REVIEW]       (gated by real data)   |
+--------------------------------------------------------------------------------+
| BRAND STORY MEDIA [5 cols] | BRAND STORY COPY + LINK [7 cols]                  |
+--------------------------------------------------------------------------------+
| NEWSLETTER: value + consent [8 cols] | email field + submit [4 cols] (gated)   |
+--------------------------------------------------------------------------------+
| FOOTER: BRAND | SHOP | ORDERS/SUPPORT | ACCOUNT/LEGAL                           |
+--------------------------------------------------------------------------------+
```

## 4. Section 1 — Header

### Purpose

Provide constant orientation and immediate access to discovery, account and cart.

### Business Goal

Reduce abandonment caused by unclear navigation and make product discovery available
without consuming the hero.

### UX Goal

A visitor can identify the store and reach search, a primary collection, account or
cart in one interaction.

### Components Used (from DDS)

Navigation shell, wordmark link, primary navigation links, search field, icon/action
controls, `CartBadge`, theme toggle and focus-ring tokens. Reuse current server-rendered
category data and isolate only interactive behavior that needs a Client Component.

### Desktop Layout

One 72 px row inside the content container. Wordmark occupies columns 1–2; up to five
approved category links occupy columns 3–7; search occupies columns 8–10; account,
cart and theme actions occupy columns 11–12. Internal gap is 24 px. All targets are at
least 44 px high. Header is sticky only at 1024 px+ after measured scroll/performance
validation; when sticky it uses the DDS navigation glass recipe and 64 px compact
height.

```text
+--------------------------------------------------------------------------------+
| WORDMARK | Category  Category  Category | [ Search products... ] | A  Cart  T   |
+--------------------------------------------------------------------------------+
```

### Tablet Layout

At 768–1023 px, retain wordmark, search, account and cart. Collapse category links into
one labeled “Shop” disclosure/drawer trigger. Theme may remain an icon action. Use an
8-column grid and 64 px row.

### Mobile Layout

Use the companion mobile specification: wordmark plus menu/account/cart actions in the
first row and a full-width search control in the second row. Do not horizontally shrink
desktop navigation.

### Responsive Behavior

The full category navigation becomes a controlled menu when links no longer fit at
44 px targets. Search never disappears; its presentation changes. Source order is
wordmark, primary navigation, search, account, cart, theme. No required destination is
hover-only.

### Loading State

Render the stable shell immediately. Stream cart count with a fixed-size fallback.
When categories are pending, preserve the navigation slot without fake category names;
search, account and cart remain usable.

### Empty State

If there are no active top-level categories, omit the category group and retain search.
Never expose an admin link.

### Error State

If category retrieval fails, show the stable shell with search/account/cart and log a
safe component error. Do not replace the entire homepage with a navigation error.

### Accessibility Notes

Use a unique “Primary” navigation label, a visible-on-focus skip link before the
header, semantic search landmark, accessible names for icon controls, `aria-current`
where server-safe, and visible focus rings. Menu disclosure follows button semantics,
Escape close and focus restoration.

### Motion Notes

Header compacting, if approved after testing, uses `--duration-moderate` and transform/
opacity only. Drawer behavior follows DDS. Reduced motion removes spatial compacting.

### Performance Notes

Keep shell server-rendered and cached only with shared public data. Do not introduce a
client route listener merely for active-link decoration. Preload no header imagery.

### SEO Notes

Links use stable crawlable routes. Wordmark links to `/`. Search submission uses `/search`
but internal search result URLs follow the noindex policy.

### Analytics Events

`nav_category_select`, `nav_search_submit`, `nav_account_select`, `nav_cart_select`,
`nav_menu_open`. Properties: destination key, placement=`header`, viewport mode. Never
send the raw search query until privacy policy and analytics design explicitly approve it.

### Acceptance Criteria

- All priority destinations are reachable with keyboard and touch.
- Search, account and cart remain visible or one explicit action away at every width.
- No layout shift occurs when cart count or categories resolve.
- 200% zoom and 320 px reflow do not create page-level horizontal scrolling.
- Header failure does not block homepage content.

## 5. Section 2 — Announcement Bar

### Purpose

Surface concise, verifiable store-wide delivery, payment or service information.

### Business Goal

Answer high-friction trust questions before a visitor begins shopping.

### UX Goal

Communicate no more than three facts in one scan without distracting from navigation.

### Components Used (from DDS)

Trust/announcement bar, trust item, restrained inline icon, separator and semantic
muted text. This evolves the current cached `TrustBar` rather than creating a competing
system.

### Desktop Layout

A 40–44 px solid/soft surface below the header. Center an inline list of up to three
facts in the content container: configured delivery estimate, configured free-delivery
threshold and approved payment methods. Items are separated by subtle borders and
24–32 px gaps.

```text
+--------------------------------------------------------------------------------+
| Delivery in [configured] | Free over [configured] | Approved payment methods   |
+--------------------------------------------------------------------------------+
```

### Tablet Layout

Keep one row if facts fit; otherwise use two balanced rows with 8 px row gap. Do not
reduce below 12 px text or 44 px interactive targets if an item is linked.

### Mobile Layout

Show the highest-priority fact and concise supporting facts as a bounded horizontal
scroll region or two-line wrap as specified in the mobile document. No autoplay ticker.

### Responsive Behavior

Hide lower-priority detail text before hiding the factual label. If no configured facts
exist, remove the region and its height. Dismissal is not used for permanent facts.

### Loading State

Because delivery data is cached, prefer server-rendered facts. If streamed, reserve a
single 44 px row; do not show shimmering sentence fragments.

### Empty State

Omit the bar entirely when there are no verifiable facts.

### Error State

Omit unavailable facts individually. Never guess an amount, delivery time or payment
method. The rest of the homepage continues.

### Accessibility Notes

Use an accessible list and label the region “Store information.” Decorative icons are
hidden from assistive technology. Do not rely on icon or color alone.

### Motion Notes

No marquee, autoplay or continuous motion. A temporary approved announcement may fade
in once using `--duration-base`; reduced motion renders instantly.

### Performance Notes

Use the existing tagged shipping cache. No client JavaScript for static facts.

### SEO Notes

Facts must match checkout behavior. This is supporting visible content, not keyword
copy or structured-data evidence by itself.

### Analytics Events

None for passive facts. If an approved fact links to a policy, emit
`announcement_select` with fact key and destination; no amount or customer data.

### Acceptance Criteria

- Every displayed fact has an authoritative source.
- The region disappears cleanly when empty or unavailable.
- It never auto-scrolls or creates false urgency.
- Checkout and announcement facts do not conflict.

## 6. Section 3 — Hero Section

### Purpose

State the approved store proposition and give one dominant path into shopping.

### Business Goal

Turn first-time attention into meaningful catalog discovery.

### UX Goal

Within five seconds, the visitor understands what the store offers and can act.

### Components Used (from DDS)

Split hero, eyebrow, display heading, supporting copy, primary/secondary buttons,
stable-ratio editorial/product media, liquid-light background and optional verified
trust cue.

### Desktop Layout

Use the wide container, 12 columns and 32 px gap. Copy occupies columns 1–7; media
occupies 8–12. Minimum height 520 px, maximum 620 px. Copy block max width 600 px and
vertically centers. Sequence: eyebrow → one `h1` → support copy → CTA row → optional
single trust cue. Gaps: 16, 20, 32 and 20 px. Media uses a 4:5 or approved editorial
ratio, subject-safe crop, `--radius-xl` and at most Elevation 2. The primary CTA links
to an approved category or `/search`; the secondary links to a different meaningful
discovery path.

```text
+--------------------------------------------------------------------------------+
| EYEBROW                                |                                       |
| One clear homepage H1                  |         APPROVED HERO MEDIA           |
| Concise proposition over 2–3 lines     |          stable aspect ratio          |
| [Shop collection] [Explore new]        |                                       |
| optional verified trust cue            |                                       |
+--------------------------------------------------------------------------------+
```

### Tablet Layout

At 768–1023 px use a balanced 4/4 split only when copy and media remain legible; else
stack copy before media. Hero height becomes content-driven, 440 px minimum for split.
Buttons may wrap but remain content width.

### Mobile Layout

Stack copy first and media second. Primary action becomes full width; secondary stays
full width or a clear text link. The first meaningful CTA must appear without requiring
hero animation.

### Responsive Behavior

Use intentional source order: copy then media. At narrow widths, reduce display size
with the DDS fluid scale and use a mobile-specific crop/source when needed. Do not
remove core proposition or primary CTA. No carousel and no background video.

### Loading State

Server-render copy and CTA immediately. Reserve exact media geometry and show a quiet
media skeleton only if the image is not ready. The likely hero image is the only
homepage LCP candidate marked priority.

### Empty State

If approved media is missing, render the brand-led hero using restrained DDS liquid
light material; do not show “No image.” If approved proposition/copy is missing, block
release rather than invent it.

### Error State

If media fails, retain readable copy and CTA on a solid/soft fallback. If destination
data is unavailable, use an existing stable discovery route or omit the affected CTA.

### Accessibility Notes

Exactly one page `h1`. Keep lines readable, overlays contrast-safe and product media
alt text meaningful; decorative abstract media uses empty alt. CTA labels describe
destinations. DOM order matches reading order.

### Motion Notes

Optional one-time copy/media reveal uses `--duration-reveal` with no more than 60 ms
between groups. CTA is never delayed. Hover media motion is 1–2 px maximum. Reduced
motion removes translation and renders content immediately.

### Performance Notes

Use `next/image`, stable dimensions, correct `sizes`, storage abstraction and only one
priority image. Avoid full-resolution uploads, animated blur and client-side hero logic.

### SEO Notes

The `h1` and support copy describe the actual store, not campaign keywords. Hero media
alt is truthful. CTA links are standard anchors. Homepage metadata must align with the
visible proposition.

### Analytics Events

`hero_primary_select`, `hero_secondary_select`. Properties: campaign/content key,
destination key, placement and viewport mode. Do not fire impression merely because
the server rendered; if impression measurement is approved, require meaningful view.

### Acceptance Criteria

- One approved proposition and one dominant action are visible without animation.
- No carousel, autoplay or unsupported claim is present.
- Hero geometry is stable and produces no measurable CLS.
- The media crop works at all required viewports.
- The hero remains useful if media fails.

## 7. Section 4 — Trust Indicators

### Purpose

Explain why transacting with the store is safe and recoverable.

### Business Goal

Reduce hesitation before product evaluation.

### UX Goal

Present three evidence-backed reasons to continue, without decorative certification.

### Components Used (from DDS)

Content/status cards, restrained icons, short headings, supporting text and optional
policy links.

### Desktop Layout

Three equal 4-column items in one row. Use a shared solid surface or three low-elevation
cards, not both. Internal padding 24 px; icon-to-title 12 px; title-to-copy 8 px. Default
facts: configured delivery coverage, supported secure payment methods and order tracking.

```text
+--------------------------+--------------------------+--------------------------+
| ICON Delivery            | ICON Payment             | ICON Track & support     |
| verified concise detail  | verified concise detail  | existing recovery route |
+--------------------------+--------------------------+--------------------------+
```

### Tablet Layout

Three items remain in one row if each is at least 220 px; otherwise use a 2+1 grid with
the final item spanning the width.

### Mobile Layout

Stack three items or use a non-snapping vertical list. Do not create an inaccessible
carousel for only three facts.

### Responsive Behavior

Copy may shorten but meaning cannot change. Links remain visible. Item order is
delivery → payment → tracking/recovery.

### Loading State

Render only facts available on the server. Preserve section geometry with up to three
matched skeletons only when data is genuinely streamed.

### Empty State

If fewer than two strong facts are approved, omit this larger section; the announcement
bar may carry the available fact.

### Error State

Remove only the failed fact. If fewer than two remain, omit the section.

### Accessibility Notes

Use a list with an accessible section heading. Icons are decorative unless they convey
unique meaning. Link text is descriptive. Never use color alone for security/trust.

### Motion Notes

Optional hover elevation one level on linked items; no motion on passive cards. Reveal
is one restrained group, not three sequential delays.

### Performance Notes

Inline existing icons where practical; no icon dependency. Reuse cached facts.

### SEO Notes

Visible claims must match policies and checkout. Do not mark these as certifications
or ratings in structured data.

### Analytics Events

`trust_item_select` only for linked recovery/policy actions, with fact and destination
keys. Passive cards create no event.

### Acceptance Criteria

- Two or three verified facts render; otherwise the section is omitted.
- No fabricated badge, certification or guarantee appears.
- Every interactive item has a clear destination and focus state.

## 8. Section 5 — Featured Categories

### Purpose

Offer the fastest visual entry into the store’s most important product groupings.

### Business Goal

Increase qualified collection visits and distribute discovery beyond search.

### UX Goal

Allow visitors to choose a relevant category by image and label in one scan.

### Components Used (from DDS)

Section heading, optional “View all” link and image-led `CollectionCard` with category
name, representative media and destination.

### Desktop Layout

Section header uses columns 1–9 for title/support and 10–12 for a right-aligned optional
“View all.” Content is a four-column grid with 24 px gaps. Show four priority top-level
categories by approved merchandising order. Cards use one consistent 4:5 or 3:4 ratio,
`--radius-xl`, full-card semantic links and text beneath media by default.

```text
| Featured categories                                             [View all] |
| [Category 1]       [Category 2]       [Category 3]       [Category 4]     |
```

### Tablet Layout

Use a two-column grid at 768–1023 px with 20 px gaps. Show four or six items only if all
are approved and balanced.

### Mobile Layout

Use two columns with 16 px gaps; for long names switch to one-column compact cards.
No automatic horizontal carousel.

### Responsive Behavior

Preserve category order and link destinations. Image crop may change per breakpoint.
Titles wrap to two lines without clipping. Item count is shown only if authoritative.

### Loading State

Show geometry-matched card skeletons with fixed media ratios. Heading remains visible.

### Empty State

If no active categories have approved media/content, omit the section. Do not link to
admin. Search and new arrivals remain available.

### Error State

Display a local discovery message with a search action only if both categories and
other discovery sections fail; otherwise omit this section and log safely.

### Accessibility Notes

Use a labeled section and list. Full-card links contain category names. Media alt may be
empty when the visible label names the destination and the image adds no content.

### Motion Notes

Hover-capable devices may lift media 1–2 px or adjust Elevation 1. Focus provides the
same clear destination cue. No mobile hover-dependent label.

### Performance Notes

Lazy-load all category images below the hero. Supply exact `sizes` for four/two-column
slots. Query only required category fields.

### SEO Notes

Use real category links and semantic headings. Do not create decorative categories
that fragment taxonomy.

### Analytics Events

`category_card_select`, `featured_categories_view_all_select`; properties: category ID/
slug, position, placement, viewport mode. No category impression event unless an
approved visibility standard exists.

### Acceptance Criteria

- Every card maps to an active, crawlable category route.
- Grid uses consistent media ratio and approved order.
- Missing imagery has a designed fallback and no layout shift.
- Titles remain complete under content stress.

## 9. Section 6 — Best Selling Products

### Purpose

Help visitors evaluate products using evidence-backed popularity.

### Business Goal

Move high-confidence products into evaluation without manipulating urgency.

### UX Goal

Present a concise comparable product set with clear price and availability.

### Components Used (from DDS)

Section heading, optional view-all link, existing/refactored `ProductGrid` and
`ProductCard` contract. No quick-add.

### Desktop Layout

Four cards in a 12-column grid, each spanning three columns with 24 px gaps. Show four
products from an approved best-seller query. Media uses DDS 4:5 ratio; content order is
image → product title → price → optional supporting metadata. The section heading may
explain the measurement window in concise customer language if needed.

```text
| Best sellers                                                   [View all] |
| [Product 1]        [Product 2]        [Product 3]        [Product 4]      |
```

### Tablet Layout

Three columns at 1024 px when card width stays at least 220 px; two columns at 768 px.
Do not use a carousel merely to keep four items on one row.

### Mobile Layout

Two columns when cards remain legible at 320 px; otherwise one column. Product title
and price never depend on hover.

### Responsive Behavior

The same ranked order is preserved. Limit initial render to the approved count rather
than hiding downloaded cards. Titles wrap; price and sold-out state remain visible.

### Loading State

Render four geometry-matched product skeletons on desktop, two on tablet first row and
only the expected mobile first viewport in the companion document.

### Empty State

If the ranking contract/query is not approved or has insufficient qualifying sales,
omit the entire section. Do not substitute newest products while retaining the “Best
sellers” label.

### Error State

Omit the local section and continue to New Arrivals. Do not turn a ranking failure into
a page error.

### Accessibility Notes

Use a section heading and list/grid semantics. Product card focus encloses its primary
link. Sold-out information is textually exposed. Prices are readable in BDT.

### Motion Notes

Use the DDS product-card hover/focus behavior only. No auto-scroll or ranked-card
stagger that suggests urgency.

### Performance Notes

The query must be measured and cached as public catalog data. Select only required card
fields. No more than the likely single LCP image on the entire page gets priority; these
below-fold images lazy-load.

### SEO Notes

Links point to canonical product routes. “Best seller” is visible only when factual;
do not encode rank or aggregate rating structured data without an approved source.

### Analytics Events

`product_card_select` with product ID/slug, position, placement=`best_sellers`, ranking
version/window key and viewport mode. Never send price as free-form text.

### Acceptance Criteria

- The title is never shown without an approved popularity rule and data source.
- Four or the approved count of valid products render in deterministic order.
- Existing product card truth rules are preserved.
- Failure or insufficiency removes the section cleanly.

## 10. Section 7 — New Arrivals

### Purpose

Expose recently published catalog items and preserve the current homepage’s strongest
working behavior.

### Business Goal

Create a dependable path to fresh inventory and repeat visits.

### UX Goal

Let visitors compare the latest available products without interpreting “new” as a
discount or endorsement.

### Components Used (from DDS)

Section heading, optional “View all,” cached `getCachedActiveProducts` newest sort,
`ProductGrid` and `ProductCard`.

### Desktop Layout

Four product cards in one row using the same grid, media ratio and content hierarchy as
Best Sellers. Show the newest four or approved count. Use 80 px separation from the
previous product section and 24 px header-to-grid gap.

```text
| New arrivals                                                   [View all] |
| [Product 1]        [Product 2]        [Product 3]        [Product 4]      |
```

### Tablet Layout

Three columns at 1024 px when widths permit; two columns at 768 px. If showing six,
render complete balanced rows; do not hide orphan items with CSS.

### Mobile Layout

Two columns with the companion mobile spacing and title stress behavior.

### Responsive Behavior

Keep server sort authoritative. Image `sizes` matches actual slots. No hover image is
required. “New” badge is optional only if its published-date rule is separately approved.

### Loading State

Use matched product skeletons while preserving section heading and final geometry.

### Empty State

If the entire active catalog is empty, show one customer-safe store empty state in this
position: “New products are being prepared” with a search/contact action only if useful.
Never link to admin. If other product sections render, omit this empty region.

### Error State

Show a local error with a safe retry only when retry can succeed; otherwise preserve
category discovery and avoid a full-page failure.

### Accessibility Notes

Section/list semantics, logical heading level, complete titles, useful image alt and
textual availability. Retry updates use a concise live region.

### Motion Notes

Product-card motion only. Skeleton shimmer is restrained/static under reduced motion.

### Performance Notes

Reuse tagged catalog caching. Query only the approved count, avoid loading all product
images and ensure only required transformations are requested.

### SEO Notes

Use canonical product links. Homepage visible count text is optional and should not
produce awkward keyword copy.

### Analytics Events

`product_card_select` with placement=`new_arrivals`, position and product key;
`new_arrivals_view_all_select` if a real destination exists.

### Acceptance Criteria

- Products follow authoritative newest-published order.
- Empty state is customer-safe and contains no admin path.
- Product presentation matches Best Sellers and the DDS contract.
- Catalog failure remains local.

## 11. Section 8 — Promotional Banner

### Purpose

Highlight one approved collection, seasonal story or truthful offer.

### Business Goal

Direct attention to a time-relevant commercial priority without interrupting shopping.

### UX Goal

Make the offer/topic, qualification and destination understandable before selection.

### Components Used (from DDS)

Promotional card, large heading, concise copy, primary or secondary button, optional
approved media and restrained brand-soft/gradient material.

### Desktop Layout

One wide 12-column banner, 360–420 px tall. Copy occupies columns 1–8 with 48 px
padding; media occupies columns 9–12. Use `--radius-xl`, one clear CTA and no nested
card. Qualification text sits adjacent to the offer, not in unreadable fine print.

```text
+--------------------------------------------------------------------------------+
| Approved promotion / collection message [8 cols] | Approved media [4 cols]    |
| Qualification and timing if factual              |                            |
| [Explore offer/collection]                        |                            |
+--------------------------------------------------------------------------------+
```

### Tablet Layout

Use a 5/3 split or stack when media competes with copy. Padding becomes 32 px.

### Mobile Layout

Stack copy before media or omit nonessential decorative media. CTA is full width.

### Responsive Behavior

Copy, qualification and CTA remain together. Do not hide exclusions on mobile. When
there is no promotion module, destination may be an existing category/product route;
the banner must not calculate discounts.

### Loading State

Approved copy can render immediately; reserve media geometry. Dynamic campaign data
must not flash from one offer to another after hydration.

### Empty State

Omit the section when no approved campaign exists. Do not ship generic “Sale” copy.

### Error State

If offer verification or destination fails, omit the banner. Never leave a CTA that
leads to an invalid or contradictory offer.

### Accessibility Notes

Text/media contrast passes across all crops and themes. Qualification is normal readable
text. No countdown that continuously announces. CTA label names the destination.

### Motion Notes

One restrained background/media reveal is allowed. No countdown, parallax, pulsing CTA
or continuous liquid animation. Reduced motion renders static.

### Performance Notes

Below-fold media lazy-loads with stable geometry. Avoid oversized decorative assets and
animated backgrounds.

### SEO Notes

Only visible factual offer content may influence metadata/structured data, and homepage
campaign copy must not create duplicate canonical targets.

### Analytics Events

`promotion_select`; properties: approved campaign key, destination key, placement,
viewport mode. Impression tracking requires meaningful visibility and campaign approval.

### Acceptance Criteria

- Offer, qualification, timing and destination are owner-approved and consistent.
- Section is absent when no valid campaign exists.
- Mobile retains all material terms.
- No promotion module or pricing authority is invented in the UI.

## 12. Section 9 — Why Buy From Us

### Purpose

Explain store-specific service advantages that are not already obvious from products.

### Business Goal

Build confidence through operational evidence and clear recovery options.

### UX Goal

Answer “why this store?” using three concise, differentiated reasons.

### Components Used (from DDS)

Section heading and three content cards with restrained icon, title, explanation and
optional supporting link.

### Desktop Layout

Three equal four-column cards, 24 px gaps, 24–32 px internal padding. Recommended
topics must be evidence-backed and nonduplicative: nationwide delivery coverage,
transparent order tracking/support and secure/varied payment. If these duplicate Trust
Indicators, use deeper service explanations here or omit this section.

```text
| Why buy from us                                                            |
| [Reason + evidence]       [Reason + evidence]       [Reason + evidence]     |
```

### Tablet Layout

Use a three-column row if cards meet 220 px; otherwise 2+1 with the last spanning.

### Mobile Layout

Stack full-width cards with 16 px gaps.

### Responsive Behavior

Copy can wrap naturally. Source order reflects priority. Do not shorten factual
qualifications out of existence.

### Loading State

This is approved content and should server-render. If any fact is dynamic, render only
after authoritative data resolves rather than skeletonizing marketing claims.

### Empty State

Omit if fewer than two differentiated, verified reasons exist.

### Error State

Omit any reason whose fact cannot be confirmed. Do not replace it with generic copy.

### Accessibility Notes

Use a list; headings follow page hierarchy. Icons are decorative. Links are descriptive,
and cards do not become links unless each has exactly one destination.

### Motion Notes

Passive cards do not lift. Linked cards may use one-level hover/focus elevation. No
independent stagger on each icon.

### Performance Notes

Server-render static approved copy and inline icons; no JavaScript.

### SEO Notes

Avoid duplicated claim blocks and keyword stuffing. Policy/service links must exist
before being shown.

### Analytics Events

`service_reason_select` only for actual links, with reason and destination keys.

### Acceptance Criteria

- Every reason is specific, approved and supportable.
- The section does not repeat the announcement/trust area without added value.
- Two or more valid reasons are required to render.

## 13. Section 10 — Customer Reviews

### Purpose

Provide authentic social proof from real customer experiences.

### Business Goal

Reduce perceived purchase risk using credible, moderated evidence.

### UX Goal

Let visitors assess review source, content and context without fabricated certainty.

### Components Used (from DDS)

Review/testimonial card pattern derived from standard content cards: quote excerpt,
display name policy, optional verified-purchase/status label, product/context link and
rating only when the source supports it.

### Desktop Layout

Three equal four-column cards with 24 px gaps. Each card contains context/status, concise
review text, reviewer attribution and optional product link. No carousel. Excerpts use
equal visual padding but are not clipped to force equal height.

```text
| What customers say                                                         |
| [Real review 1]          [Real review 2]          [Real review 3]           |
```

### Tablet Layout

Two columns plus a full-width third card, or show two approved reviews. Never hide a
downloaded third review only for layout symmetry.

### Mobile Layout

Stack reviews in source order. No swipe-only carousel.

### Responsive Behavior

Review text wraps fully or uses an accessible explicit “Read full review” disclosure.
Attribution never becomes image-only. Star rating is accompanied by text.

### Loading State

If a future review read streams, render up to three matched card skeletons. Do not show
fake quote lines that can be mistaken for published content to assistive technology.

### Empty State

Omit the entire section until a real approved source contains enough published reviews.
Do not show “Be the first” on the homepage unless review submission is separately built.

### Error State

Omit the section and keep the homepage functional. Never fall back to hard-coded sample
testimonials in production.

### Accessibility Notes

Use `blockquote` only for actual customer words and `cite`/text attribution appropriately.
Rating has a textual equivalent. Respect customer privacy and publication consent.

### Motion Notes

No auto-rotation. Linked cards may use minimal elevation. Expanded review disclosures
use standard state transition and focus management.

### Performance Notes

Query only moderated published reviews and required attribution fields. Avoid third-party
review widgets/scripts unless separately approved for privacy, CSP and performance.

### SEO Notes

Do not emit `AggregateRating` or review structured data until valid product-linked data
and eligibility rules exist. Homepage testimonials alone do not authorize rating markup.

### Analytics Events

`review_product_select`, `review_expand`. Properties: non-PII review ID, product key,
position and placement. Never send review text or reviewer contact data.

### Acceptance Criteria

- The section is gated off until real, moderated and consented data exists.
- No hard-coded review, rating or “verified” label ships.
- Full meaning is accessible without carousel or hover.
- Structured data remains disabled until separately approved.

## 14. Section 11 — Brand Story

### Purpose

Explain the human/company intent behind the store and connect the brand to its promise.

### Business Goal

Build recognition and trust beyond individual product transactions.

### UX Goal

Provide a concise, believable story with an optional route to learn more.

### Components Used (from DDS)

Editorial split section, approved photography/illustration, eyebrow, heading, short body
copy and secondary/link action.

### Desktop Layout

Media occupies columns 1–5 and copy columns 7–12, leaving column 6 as breathing room.
Media uses 4:5 or 3:2 approved ratio; copy max width 560 px and vertically centers.
Gaps: eyebrow-to-heading 12 px, heading-to-body 20 px, body-to-link 24 px.

```text
+--------------------------------+-----------------------------------------------+
| APPROVED BRAND MEDIA [5 cols]  | Eyebrow                                       |
|                                | Brand story heading                           |
|                                | concise approved story                        |
|                                | [Learn our story]                             |
+--------------------------------+-----------------------------------------------+
```

### Tablet Layout

Use an even 4/4 split if copy remains readable; otherwise stack media then copy with
32 px gap.

### Mobile Layout

Stack media before copy unless the approved story requires proposition-first reading.
The companion mobile document fixes the final order as media → copy.

### Responsive Behavior

DOM order follows mobile meaning. Copy does not become an image overlay on small screens.
Hide the link if `/about` does not yet exist; the story can remain as noninteractive copy.

### Loading State

Server-render approved copy. Reserve media geometry; use a quiet image placeholder.

### Empty State

Omit until brand copy and media are approved. Do not generate a generic founder story.

### Error State

If media fails, render copy on a solid surface. If the about route is unavailable, omit
the link without creating a dead destination.

### Accessibility Notes

Meaningful brand media receives concise alt; decorative media uses empty alt. Heading
fits the page hierarchy. Keep body line length 50–70 characters.

### Motion Notes

Optional media/copy reveal as one group. No parallax. Reduced motion uses static layout.

### Performance Notes

Below-fold image lazy-loads, uses responsive `sizes` and one optimized asset. Copy requires
no client JavaScript.

### SEO Notes

Use approved organization facts. Link to `/about` only after route/canonical content
exists. Brand claims must be consistent with Organization metadata.

### Analytics Events

`brand_story_select` when the learn-more link exists; properties: destination and
placement only.

### Acceptance Criteria

- Copy and imagery are explicitly approved.
- No dead `/about` link or fabricated history is present.
- Section remains readable and useful when media fails.

## 15. Section 12 — Newsletter

### Purpose

Offer a transparent, optional way to receive approved store updates.

### Business Goal

Build a consented owned audience without dark patterns.

### UX Goal

Explain the value and frequency before a visitor submits an email address.

### Components Used (from DDS)

Promotional/content surface, section heading, supporting/consent text, email input,
primary submit button, inline success/error and privacy link.

### Desktop Layout

One 12-column solid/brand-soft region with 40–48 px padding. Copy occupies columns 1–7;
form occupies 8–12. Email field and 44–52 px submit button share one row where the field
remains at least 280 px. Consent/frequency text sits below the form, not in placeholder
text.

```text
+--------------------------------------------------------------------------------+
| Newsletter value + expected frequency [7] | [Email address] [Subscribe] [5]    |
|                                           | consent/privacy text               |
+--------------------------------------------------------------------------------+
```

### Tablet Layout

Stack copy above form within one surface. Form may remain inline at 768 px.

### Mobile Layout

Stack heading, copy, email input, full-width submit and consent text.

### Responsive Behavior

The label remains programmatic/visible as appropriate. Do not hide consent or frequency.
The form never forces horizontal scrolling.

### Loading State

Pending submission preserves button label/context, prevents duplicate submission and
announces concise status. The rest of the page remains usable.

### Empty State

Not applicable once implemented. Before a real subscription service, consent language,
privacy route and storage policy exist, omit the entire section.

### Error State

Preserve the entered email for recoverable errors; show safe inline guidance connected
to the field. Do not claim subscription until the authoritative response succeeds.

### Accessibility Notes

Use a real email label, `type=email`, autocomplete, linked help/error text, visible focus,
44 px targets and `role=status` for success. Consent is not preselected or implied.

### Motion Notes

Pending indicator uses `--duration-base`; success may fade in without shifting layout.
Reduced motion renders immediate state changes.

### Performance Notes

No third-party embed script. Submit through an approved server action/API with rate
limiting, validation and abuse protection. Load no marketing SDK merely to render form.

### SEO Notes

Newsletter copy is supporting content. Privacy link must exist and be crawlable before
launch. Email values never appear in URLs or metadata.

### Analytics Events

`newsletter_submit_attempt`, `newsletter_submit_success`, `newsletter_submit_error`
with placement, error category and viewport mode. Never send email address or raw error.

### Acceptance Criteria

- Section remains gated until consent, privacy, persistence and unsubscribe behavior are
  approved and functional.
- Submission prevents duplicates and reports authoritative success/error.
- No email address enters analytics or URL state.
- Keyboard, autofill and screen-reader flow pass.

## 16. Section 13 — Footer

### Purpose

Provide navigation, trust, service recovery, contact and legal/company identity.

### Business Goal

Keep customers within reliable support and shopping paths after reaching page end.

### UX Goal

Make order tracking, core shop routes and account/contact help easy to find without a
dead-link wall.

### Components Used (from DDS)

Footer shell, brand block, labeled link groups, contact links, payment/delivery facts and
optional official social links. Evolve the current `SiteFooter`.

### Desktop Layout

Solid or inverse surface. Four columns: brand (columns 1–3), Shop (4–6), Orders/Support
(7–9), Account/Legal (10–12). Padding 64 px top/bottom, 32 px column gaps. A lower 48–56
px bar contains copyright/brand identity and concise approved payment facts.

```text
+--------------------------------------------------------------------------------+
| BRAND/PROMISE | SHOP LINKS | ORDERS + SUPPORT | ACCOUNT + LEGAL                |
| contact when configured                                                     |
+--------------------------------------------------------------------------------+
| © approved brand                         secure checkout / approved payments  |
+--------------------------------------------------------------------------------+
```

### Tablet Layout

Two columns over two rows. Brand spans first row if needed. Keep order tracking near the
top of the second group rather than buried.

### Mobile Layout

Stack brand then accessible link groups. Default is expanded groups; accordion is allowed
only if implemented with semantic buttons and no information becomes inaccessible.

### Responsive Behavior

Link groups follow the same semantic order. Legal links appear only when routes exist.
Long email/phone values wrap. Official social links render only when configured.

### Loading State

Footer uses server-rendered cached public categories and configured contact facts. If
categories are pending, stable brand/order/account groups still render.

### Empty State

Omit empty groups. Always retain brand identity and at least order tracking/account routes
that actually exist.

### Error State

Category failure removes shop links locally; recovery routes remain. Never show dead
placeholders.

### Accessibility Notes

Use `<footer>`, uniquely labeled navigation groups and real headings. Links maintain 44 px
practical touch spacing. Contact links use correct schemes and meaningful labels.

### Motion Notes

No passive animation. Mobile accordion, if approved, uses standard DDS disclosure motion
and reduced-motion fallback.

### Performance Notes

Server-render, reuse cached category data and avoid social/payment badge SDKs. Inline or
optimized small marks only when approved.

### SEO Notes

Internal links are crawlable and truthful. Add shipping, returns, privacy, terms, about
and contact only after those routes exist. No keyword lists.

### Analytics Events

`footer_link_select` with group, destination key and viewport mode. Do not attach analytics
to mailto/tel values in a way that records contact content.

### Acceptance Criteria

- No footer link returns 404 at release.
- Track order remains prominent.
- Empty/failed category data does not remove recovery routes.
- Footer passes keyboard, zoom and long-content tests.

## 17. Homepage section order and conditional rendering

| Order | Section | Default status for Homepage V2 |
|---:|---|---|
| 1 | Header | Required |
| 2 | Announcement Bar | Conditional on verified facts |
| 3 | Hero | Required; copy approval is a release gate |
| 4 | Trust Indicators | Conditional; at least two verified facts |
| 5 | Featured Categories | Conditional on active categories/content |
| 6 | Best Selling Products | Gated by approved authoritative ranking |
| 7 | New Arrivals | Required discovery fallback; customer-safe empty state |
| 8 | Promotional Banner | Conditional on approved current campaign |
| 9 | Why Buy From Us | Conditional on differentiated verified reasons |
| 10 | Customer Reviews | Deferred until real moderated data exists |
| 11 | Brand Story | Conditional on approved story/media |
| 12 | Newsletter | Deferred until consent/backend/privacy requirements pass |
| 13 | Footer | Required; only live routes shown |

Conditional omission collapses the region and uses the normal adjacent section spacing.
It does not leave an empty heading, skeleton or decorative gap. Homepage V2 may launch
without gated sections; Work must not invent data merely to reproduce every wireframe box.

## 18. Homepage User Journey

```text
ARRIVE
  -> identify brand and proposition
  -> scan verified trust facts
  -> choose Search / Category / Hero CTA
  -> compare Best Sellers (when valid) or New Arrivals
  -> open Product Detail
  -> continue to variant selection and Cart outside homepage scope

Secondary recovery:
  ARRIVE -> Footer -> Track order / Account / Contact / Policy

Secondary retention (only when approved):
  DISCOVER -> Brand Story -> About
  DISCOVER -> Newsletter -> Consented subscription confirmation
```

The user must never be forced through promotion, review, newsletter or AI content to
reach products.

## 19. Conversion Funnel

| Funnel step | Homepage evidence | Primary measure | Failure/recovery |
|---|---|---|---|
| Qualified arrival | Hero proposition understood | meaningful homepage view | search and categories remain visible |
| Discovery intent | Search/category/hero action | discovery destination select | New Arrivals and footer routes |
| Product evaluation | Product card selected | product-detail visit | alternate grid/category |
| Purchase intent | Downstream add to cart | outside homepage analytics | product detail recovery |
| Retention/support | Newsletter, account or tracking | successful consent/recovery action | inline error/contact route |

Conversion reporting must separate events from completed business facts. A homepage
click is not a sale. An order is not revenue until payment/order definitions reconcile.

## 20. Interaction Map

| Trigger | Result | Focus/keyboard behavior | Failure behavior |
|---|---|---|---|
| Skip link | Move to homepage main content | focus main heading/region | always available |
| Category link/card | Navigate to `/c/[slug]` | standard link | destination must exist |
| Search submit | Navigate to `/search?q=...` | standard form/navigation | validation preserves input |
| Product card | Navigate to `/p/[slug]` | full-card focus visible | unavailable item remains truthful |
| Hero/promo CTA | Navigate to approved existing route | standard link/button | CTA omitted if invalid |
| Menu trigger | Open navigation drawer on compact modes | trap/restore focus, Escape closes | header actions remain |
| Theme toggle | Change explicit theme preference | button state announced | system theme remains fallback |
| Newsletter submit | Send approved subscription request | pending and result announced | input preserved for retry |
| Footer link | Navigate/recover/contact | standard link | no dead links allowed |

## 21. Component Dependency Map

```text
Homepage route (Server Component)
|
+-- Storefront shell
|   +-- Header
|   |   +-- Navigation links / Search / CartBadge / ThemeToggle
|   +-- AnnouncementBar -> cached shipping/payment facts
|   +-- Footer -> cached categories + configured contact/policy routes
|
+-- Homepage composition
    +-- HeroSection -> Button + approved media
    +-- TrustIndicators -> TrustItem/Card
    +-- FeaturedCategories -> CollectionCard[]
    +-- ProductSection
    |   +-- ProductGrid -> ProductCard[]
    +-- PromotionalBanner -> Button + approved media
    +-- ServiceReasons -> ContentCard[]
    +-- CustomerReviews -> ReviewCard[] (future approved data only)
    +-- BrandStory -> editorial media + Button/Link
    +-- NewsletterForm (future approved server action only)
```

Dependency rules:

- Page/section components may depend on patterns and primitives; the reverse is forbidden.
- Presentational components receive authoritative data and never calculate rank, discount,
  trust, stock or review validity.
- Client boundaries are limited to menu/drawer, theme, cart streaming and future form state.
- Section failure boundaries remain local where technically practical.

## 22. Analytics event contract

All proposed events use stable lower-snake-case names and these common properties only
when approved:

| Property | Rule |
|---|---|
| `placement` | controlled enum such as `hero`, `best_sellers`, `new_arrivals` |
| `position` | one-based visible position where meaningful |
| `destination_key` | internal route/category identifier; not a full sensitive URL |
| `content_key` | approved campaign/content version, not visible copy |
| `viewport_mode` | compact, tablet or desktop; no fingerprinting dimensions |
| `result` | controlled success/error category |

Never collect email, name, phone, address, order number, raw query, review text, session
token or payment data through homepage analytics. Do not add an analytics dependency in
Homepage V2 without explicit approval, privacy review, consent rules and performance budget.

## 23. Page-level loading, empty and error behavior

- Header, approved hero copy and footer recovery routes form the minimum resilient shell.
- Stream independent product/optional sections when it improves time to useful content.
- Skeletons match final geometry and do not exceed first-viewport need.
- If all discovery data fails, show a page-level catalog-unavailable message with safe
  retry and existing contact/account/order routes; do not expose internals.
- If the catalog is genuinely empty, show one customer-safe empty state rather than an
  empty message in every section.
- Optional/gated sections disappear when unavailable; their absence is not an error.

## 24. Page-level performance budget

- Server Components by default; no homepage-wide Client Component.
- One likely LCP hero image receives priority; all below-fold media lazy-loads.
- Stable image ratios and skeletons target CLS <= 0.05.
- Homepage target at release-equivalent conditions: LCP <= 2.5 s, INP <= 200 ms,
  CLS <= 0.1, matching SAS/MDG budgets.
- No new UI, animation, icon, carousel, review or newsletter dependency without approval.
- Cached public catalog/shipping data must invalidate through existing domain tags.
- No database query loads more fields/items than the rendered section contract requires.
- Test Node 22 and production-shaped preview data before release.

## 25. Page-level accessibility acceptance

- One `h1`; subsequent section headings follow a logical hierarchy.
- Skip link, unique navigation labels and semantic landmarks exist.
- Complete keyboard flow works without hover or pointer gestures.
- Focus remains visible across solid, glass, light and dark surfaces.
- Text/content passes 200% zoom and 400% reflow.
- Required viewports include 320, 375/390, 430, 768, 1024, 1280/1440 and 1920 px.
- All practical touch targets are at least 44 x 44 CSS px.
- Reduced motion, forced colors and screen-reader spot checks pass.
- No section relies on color, animation or position alone for meaning.

## 26. Page-level SEO acceptance

- Approved production homepage has unique brand title/description and one canonical URL.
- Preview/staging remains noindex.
- Organization metadata uses only approved visible facts.
- No rating, offer or review structured data is fabricated.
- All crawlable links resolve; conditional routes are not shown early.
- Homepage copy stays useful and specific, not keyword-stuffed.
- Product/category canonical identities remain unchanged.

## 27. Desktop implementation acceptance criteria

Homepage V2 is acceptable only when:

- section order and conditional gates match this document;
- the companion mobile specification also passes;
- every rendered claim has a source and owner-approved copy;
- existing routes, commerce invariants and protected modules are unchanged;
- current reusable components are extended rather than duplicated where contracts fit;
- no gated best-seller, review, promotion or newsletter content is faked;
- all section loading/empty/error states are verified;
- light/dark, keyboard, screen reader, zoom, reduced motion and viewport checks pass;
- performance evidence and bundle/query impact are recorded;
- lint, strict typecheck, tests and release-equivalent build pass under the MDG;
- no implementation continues to another page without a separate approved task.

## 28. Explicit exclusions

This wireframe does not authorize:

- application/source changes during this planning task;
- collection, product-detail, search-result, cart, checkout, account or admin redesign;
- database schema or migration changes;
- best-seller analytics/ranking invented in a component;
- reviews, wishlist, coupons, newsletter storage or AI features without their own approved
  domain/implementation scope;
- quick-add, product carousels, hero sliders or background video;
- new dependencies, fonts, icons or tracking vendors;
- changes to payment, inventory, order, auth or checkout logic.

---

## Approval gate

Approval of this document fixes the desktop homepage composition and behavior only. It
does not authorize implementation until the mobile wireframe and any Product Owner copy,
campaign, imagery and gated-feature decisions required for the intended first release
are also approved.
