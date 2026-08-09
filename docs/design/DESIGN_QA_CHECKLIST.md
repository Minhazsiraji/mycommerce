# SirajiBD Design QA Checklist

| Field | Value |
|---|---|
| Document | Reusable Design QA Checklist |
| Public brand | SirajiBD |
| Platform identity | AgentSiraji Commerce V2 — internal/portfolio use only |
| Version | 1.0 |
| Status | Approved — planning baseline frozen |
| Date | 2026-08-09 |
| Owner | Product Owner |
| Applies to | Every customer, account, checkout, admin and future approved product surface |
| First implementation scope | Homepage V2 only |
| Does not authorize | Application changes, dependencies, fabricated content/media/data, production release or expansion beyond an approved task |

## Version History

| Version | Date | Author/owner | Summary |
|---|---|---|---|
| 1.0 | 2026-08-09 | Product Owner | Approved as the mandatory release quality gate; planning frozen and Homepage V2 authorized as the first implementation scope. |
| 0.9 | 2026-08-09 | Product Owner with Work documentation support | Initial repository-aligned release quality gate covering visual, responsive, accessibility, performance, SEO, commerce truth, security, privacy, analytics, content, media and page-specific QA. |

Stable filenames are normative. Git provides file history. Material changes update this
table and the document version; they do not create duplicate versioned files.

## Authoritative Reference Set

| Priority reference | Repository document/status used |
|---|---|
| Repository Audit | Approved audited repository baseline referenced and incorporated by SAS/MDG; no standalone audit file is present in the current branch |
| SAS | `docs/architecture/AGENTSIRAJI_COMMERCE_V2_SAS.md` v1.0 |
| MDG | `docs/architecture/MASTER_DEVELOPMENT_GUIDE.md` foundation specification |
| DDS | `docs/design/DESIGN_DESIGN_SYSTEM.md` |
| Component Library | `docs/design/COMPONENT_LIBRARY.md` v1.0.0 |
| Content Guide | `docs/design/CONTENT_GUIDE.md` v0.11; approved strategic foundation, unresolved release gates remain binding |
| Media Guide | `docs/design/MEDIA_GUIDE.md` v0.9; approved planning baseline, exact asset gates remain binding |
| Desktop Wireframe | `docs/wireframes/HOMEPAGE_DESKTOP_WIREFRAME.md` |
| Mobile Wireframe | `docs/wireframes/HOMEPAGE_MOBILE_WIREFRAME.md` |

---

# 0. How to Use This Checklist

This document is the mandatory design and experience release gate for every SirajiBD
page. It converts the approved architecture, design, component, content, media and
wireframe decisions into repeatable evidence. It does not replace domain tests,
security review, payment/inventory hardening, legal approval or the MDG release process.

## 0.1 Authority order

When sources conflict, stop and resolve the conflict using this order:

1. Applicable law, security, privacy, financial correctness and explicit Product Owner decision.
2. Active approved task scope and acceptance criteria.
3. Software Architecture Specification (SAS).
4. Master Development Guide (MDG).
5. Design Design System (DDS).
6. Component Library.
7. Content Guide and Media Guide within their owned domains.
8. Approved page wireframes.
9. This checklist.
10. Existing implementation patterns.

This checklist may reveal a conflict; it may not silently choose a lower-authority rule.

## 0.2 Result vocabulary

| Result | Meaning | Release treatment |
|---|---|---|
| **Pass** | Requirement is met and evidence is recorded | May proceed if all other gates pass |
| **Fail** | Requirement is not met | Record defect and severity; resolve according to gate rules |
| **Blocked** | Test cannot run because an approved dependency, environment, data source or decision is unavailable | Not a pass; release owner decides only after the blocker is resolved or an allowed exception is approved |
| **N/A** | Requirement genuinely does not apply to this route/change | Requires a short reason and reviewer acceptance |
| **Not tested** | No evidence was collected | Treated as Fail for mandatory items |

“Looks fine,” a passing build, or an automated score alone is not evidence of complete QA.

## 0.3 Severity levels

| Severity | Definition | Examples | Release rule |
|---|---|---|---|
| **Critical** | Causes financial/data corruption, security/privacy exposure, inaccessible critical task, false commerce state, legal deception, or a broken primary journey | Wrong total, forged payment accepted, another customer’s order exposed, keyboard cannot place order, fabricated stock/review/offer | Blocks merge and release; no informal exception |
| **Major** | Materially blocks or misleads a significant user group, violates WCAG AA on a key flow, breaks a supported viewport/browser, or exceeds a maximum performance threshold | Mobile navigation unusable, missing form labels, LCP >2.5 s, checkout recovery absent, incorrect canonical | Blocks release; time-bounded exception requires Product Owner plus accountable domain/architecture approval and compensating control |
| **Minor** | Localized quality defect that does not block task completion or misstate commerce truth | Small spacing drift, noncritical copy inconsistency, low-impact visual mismatch | May be accepted only with owner, issue, target date and no accumulation into a systemic problem |

Any issue involving price, payment, stock, order identity, authorization, PII, fabricated
claims, missing legal gate or irreversible action is at least Major and normally Critical.

## 0.4 Evidence requirements

Every QA run records:

- exact commit/branch and preview URL or local build;
- page/route, state, locale, theme and authenticated role;
- viewport, browser/OS, input method and network profile;
- test type: automated, manual, assistive technology, performance or visual;
- expected result, actual result and Pass/Fail/Blocked/N/A;
- screenshot/video/report/log reference where useful;
- defect ID, severity, owner and retest result for every failure;
- tester, reviewer and timestamp.

Do not include real customer data, credentials, payment secrets, raw provider payloads or
unnecessary personal information in evidence.

## 0.5 Gate applicability

| Change type | Required gate |
|---|---|
| Copy-only | Content, responsive stress, accessibility, SEO where metadata/indexable content changes, visual regression |
| Token/style/component | Visual, layout, responsive, themes, accessibility, motion, browser and regression |
| Media | Media, accessibility, responsive crops, performance, privacy/licensing and regression |
| Public page | All common gates plus route-specific gate |
| Commerce interaction | Common gates plus truth, inventory, security and affected domain tests |
| Payment/checkout | All common gates plus full Checkout QA and payment security/integration evidence |
| Admin | All common gates plus role/2FA, audit, destructive-action and Admin QA |
| Analytics | Consent/privacy, payload allowlist, duplication and no-PII verification |
| AI feature | Separate approved architecture plus AI content/security/privacy/evaluation gate |

## 0.6 Current automation baseline

The repository currently supports these release-equivalent commands on Node 22 with the
pinned pnpm lockfile:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm audit --audit-level high
```

At this baseline, browser component tests, Playwright, axe automation, Lighthouse CI,
visual regression, production-shaped integration data and real-user monitoring are not
proven as installed/enforced. Their checklist items remain mandatory manual or planned
automation gates; this document does not authorize adding those dependencies.

---

# 1. Visual QA

**Pass:** The implemented surface matches the approved DDS, Component Library and page
wireframe in both themes and all required states, with no local design invention.

**Fail severity:** Wrong/misleading commerce emphasis or unreadable UI is Major;
systematic token/brand mismatch is Major; isolated nonfunctional polish drift is Minor.

- [ ] Section order, hierarchy and emphasis match the approved wireframe.
- [ ] Colors use semantic tokens; no unapproved raw color creates a competing palette.
- [ ] Typography, spacing, radii, borders, shadows, blur and elevation use DDS tokens.
- [ ] Clear Liquid material is selective, readable and structurally justified.
- [ ] Light and dark themes preserve hierarchy, contrast and brand character.
- [ ] Hover, active, focus-visible, selected, disabled, loading, success and error states are distinct.
- [ ] Icons follow the approved family, stroke/weight, size and accessible-name rules.
- [ ] No unapproved badge, animation, claim, promotion, review, rating or trust seal appears.
- [ ] Browser defaults, autofill and validation styling do not break the system.
- [ ] Comparison evidence includes approved reference and implementation at matched widths.

---

# 2. Layout QA

**Pass:** Content follows the approved grid, container, alignment, source order and
vertical rhythm without overlap, clipping or unstable insertion.

- [ ] Shared container and gutters match DDS tokens.
- [ ] Reading measure is narrower than product-grid measure where specified.
- [ ] Grid columns/gaps respond at approved content-pressure breakpoints.
- [ ] DOM order matches logical reading/focus order even when visual order changes.
- [ ] Section spacing follows the wireframe; conditional omission leaves no unexplained gap.
- [ ] Sticky/fixed elements do not cover content, controls, errors or the on-screen keyboard.
- [ ] Long headings, long product names, large prices and translated copy do not collide.
- [ ] Images and skeletons reserve stable geometry.
- [ ] Overlays fit the viewport and scroll internally when required.
- [ ] No page-level horizontal scrolling exists at 320 px.

**Severity:** Hidden primary content, broken reading order or overlapping action is Major;
small token-level spacing mismatch is Minor.

---

# 3. Responsive QA

**Pass:** The complete narrow experience works from 320 px and progressively enhances
through 1920 px without changing business meaning or removing required content.

- [ ] Base/mobile composition is complete rather than a compressed desktop layout.
- [ ] 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 px checks pass.
- [ ] Landscape mobile and reduced-height windows remain usable.
- [ ] Touch-capable wide devices retain safe target sizes.
- [ ] Navigation changes at the approved breakpoint and preserves all essential destinations.
- [ ] Product/card columns change without squeezed text or uncontrolled card width.
- [ ] Interactive touch targets remain at least 44 by 44 CSS pixels where practical.
- [ ] Responsive crops protect focal points and text safe areas.
- [ ] No business rule depends on `window.innerWidth` or a device name.
- [ ] No essential action requires swipe, hover or breakpoint-only content.
- [ ] On-screen keyboard does not obscure focused controls or submission/recovery actions.
- [ ] 200% zoom and 400% reflow preserve content and function.

**Severity:** Broken supported width, removed essential content or page overflow is Major.

---

# 4. Accessibility QA (WCAG AA)

**Pass:** Customer and admin surfaces meet the applicable WCAG 2.2 AA requirements by
automated checks plus manual keyboard, screen-reader, zoom, contrast and motion review.

- [ ] One logical `h1`; heading levels reflect hierarchy.
- [ ] Semantic `header`, labeled `nav`, `main`, `aside` and `footer` landmarks are used.
- [ ] A visible-on-focus skip link reaches main content.
- [ ] Lists, tables, buttons, links and forms use native semantics where possible.
- [ ] Page language is correct; language changes are marked when required.
- [ ] Every control has an accessible name and state.
- [ ] Meaning is not conveyed by color, position, shape or motion alone.
- [ ] Forms expose labels, help, required state, errors and autocomplete correctly.
- [ ] Status updates are announced without excessive live-region output.
- [ ] 200% text zoom, 400% reflow, forced colors and reduced motion pass.
- [ ] Automated axe results contain no unapproved serious/critical violations.
- [ ] Manual review confirms that automated “zero violations” did not miss behavior.

**Severity:** Any failure that blocks a critical task for assistive-technology users is
Critical; WCAG AA failure on a supported path is Major unless it is already Critical.

---

# 5. Keyboard Navigation

**Pass:** Every action and recovery path can be completed with keyboard alone in a
logical order, without traps or hover dependence.

- [ ] Tab/Shift+Tab order follows the visual and semantic journey.
- [ ] Enter and Space activate controls according to native conventions.
- [ ] Native Select and menu behavior remains conventional.
- [ ] Focus is always visible and never placed on inert/hidden content.
- [ ] Skip link, navigation, search, product links, cart and account are reachable.
- [ ] Drawers/dialogs open, operate, close with Escape and restore focus.
- [ ] Disabled controls are skipped or explained according to semantics.
- [ ] Dynamic updates do not reset, strand or unexpectedly move focus.
- [ ] No hover-only tooltip contains required information.
- [ ] Checkout and admin destructive actions are keyboard-completable and safeguarded.

**Severity:** Keyboard trap or inability to complete a primary journey is Critical;
illogical but recoverable order is Major.

---

# 6. Screen Reader QA

**Pass:** A representative screen reader communicates structure, identity, state,
price, availability and recovery correctly without duplicate or misleading output.

- [ ] Test at least one supported desktop screen-reader/browser combination for every critical route change.
- [ ] Test a mobile screen reader for mobile-navigation or touch-flow changes.
- [ ] Landmarks and heading navigation describe the page meaningfully.
- [ ] Repeated nav regions have distinct labels.
- [ ] Product name, current price, previous price/discount and availability are understandable.
- [ ] Icon-only actions have concise names; decorative icons/images are hidden appropriately.
- [ ] Validation errors are associated with fields and summary focus is appropriate.
- [ ] Pending, success and failure updates announce once and at the right priority.
- [ ] Skeletons and decorative loading effects do not create noisy reading.
- [ ] Modal/drawer title, role, focus entry and closure are announced correctly.

**Severity:** Wrong commerce state or blocked journey is Critical; missing context on a
noncritical element is Major or Minor based on impact.

---

# 7. Focus Management

**Pass:** Focus is visible, predictable and restored across route changes, overlays,
errors and asynchronous updates.

- [ ] Focus indicator has at least 3:1 contrast against adjacent colors.
- [ ] Opening an overlay moves focus to its meaningful first target or container.
- [ ] Closing restores focus to the invoker unless it no longer exists.
- [ ] Background content is inert/noninteractive while a modal overlay is active.
- [ ] Form submission failure moves focus to a useful summary/first invalid field as specified.
- [ ] Route navigation follows expected browser behavior; custom focus changes are justified.
- [ ] Removed/filtered content does not leave focus on a detached node.
- [ ] Loading states preserve focus and do not repeatedly announce.
- [ ] Focus remains visible in light, dark and Windows forced-colors modes.

**Severity:** Trap, lost focus in a financial flow or focus behind modal is Major/Critical
according to task impact.

---

# 8. Color Contrast

**Pass:** Effective contrast meets WCAG 2.2 AA in every supported theme, background,
image, state and glass combination.

| Element | Minimum |
|---|---:|
| Normal text | 4.5:1 |
| Large text | 3:1 |
| Meaningful icons, UI boundaries and focus indicators | 3:1 against adjacent color |

- [ ] Glass is tested over lightest/darkest backgrounds, approved image crops and indigo/cyan glow.
- [ ] Placeholder text is supplemental and targets 4.5:1 where practical.
- [ ] Error/success/warning/information uses icon/label/border as well as color.
- [ ] Disabled controls remain identifiable; explanatory text still meets text contrast.
- [ ] If a glass combination fails, opacity/scrim/solid surface is used; text shadow is not the fix.
- [ ] Light, dark and forced-colors evidence is recorded.

**Severity:** Unreadable key content or focus is Major; payment/stock status confusion may be Critical.

---

# 9. Typography

**Pass:** Approved font family, scale, weight, tracking, measure and hierarchy remain
readable under responsive, zoom, localization and content-stress conditions.

- [ ] Exactly one page H1 is visually and semantically dominant.
- [ ] Type tokens are used; no arbitrary display scale or local font stack is introduced.
- [ ] Body copy has comfortable line length and line height.
- [ ] Mobile form controls use at least 16 px text to avoid unintended zoom.
- [ ] Font loading does not cause unacceptable layout shift or invisible text.
- [ ] Long English copy and future complete Bengali localization can wrap safely.
- [ ] Prices, quantities, dates and status text are distinguishable and not clipped.
- [ ] Uppercase, low-contrast or overly light text is not used for essential information.

**Severity:** Clipped/unreadable essential text is Major; isolated typographic drift is Minor.

---

# 10. Motion & Reduced Motion

**Pass:** Motion uses approved DDS tokens, helps comprehension, performs smoothly and
has an equivalent reduced-motion experience.

- [ ] Motion purpose is feedback, spatial context, continuity or rare approved expression.
- [ ] `transform`/`opacity` are preferred; layout and large blur are not continuously animated.
- [ ] Duration/easing use DDS tokens (80, 120, 180, 240, 320 or rare 420 ms).
- [ ] Animations over 500 ms have explicit design approval.
- [ ] Primary feedback begins within 100 ms unless awaiting authoritative confirmation.
- [ ] No scroll-jacking, forced parallax, fake progress, urgency motion or long grid cascade.
- [ ] Price, stock, order and payment truth changes discretely and remains readable.
- [ ] `prefers-reduced-motion: reduce` removes parallax, large translations, loops and autoplay.
- [ ] Reduced motion preserves confirmation, focus and all information.
- [ ] No flashing content violates accessibility safety thresholds.

**Severity:** Motion-triggered safety or task blockage is Critical/Major; token drift is Minor.

---

# 11. Performance Budget

**Pass:** The route and its components meet the approved target budgets on a
representative mobile profile and do not regress an approved baseline.

| Metric | Target | Maximum/release rule |
|---|---:|---:|
| LCP, p75 mobile | ≤ 2.0 s | 2.5 s |
| INP, p75 | ≤ 150 ms | 200 ms |
| CLS, p75 | ≤ 0.05 | 0.10 |
| Cached public TTFB | ≤ 300 ms | 500 ms |
| Initial JS, critical storefront route | ≤ 120 KB gzip | Exception required above target |
| Image layout shift | 0 expected | 0.02 page total |
| Above-fold product image | < 90 KB target | 150 KB maximum |

- [ ] Baseline and post-change measurements use the same route, data and profile.
- [ ] Server Components remain default; client islands are the smallest practical subtree.
- [ ] No client fetch duplicates server-available data.
- [ ] No N+1 query or unbounded public list was introduced.
- [ ] Bundle impact of every new client boundary/dependency is measured.
- [ ] Media sizes, formats, priority and lazy loading follow the Media Guide.
- [ ] Suspense fallback preserves geometry and improves meaningful loading.
- [ ] Performance evidence records tool, profile, run variability and exceptions.

**Severity:** Exceeding a maximum threshold or meaningful regression on a primary route is Major.

---

# 12. Core Web Vitals

**Pass:** Lab evidence meets budgets before release, and real-user p75 evidence takes
precedence once a sufficient production sample exists.

- [ ] LCP element is identified and is the intended primary content.
- [ ] Only the actual likely LCP image receives priority/preload.
- [ ] INP is tested for navigation, menu, theme, search and relevant commerce controls.
- [ ] CLS includes font, image, cart badge, skeleton, async section and consent UI behavior.
- [ ] Cached and uncached/first-visit scenarios are distinguished.
- [ ] Mobile network/CPU profile is recorded; desktop-cache-only evidence is rejected.
- [ ] RUM sampling/consent is documented when introduced.
- [ ] Regression has an owner and cannot be hidden by averaging unrelated routes.

---

# 13. Lighthouse Targets

**Pass:** Representative mobile Lighthouse performance is at least 90 and no category
regresses below the approved baseline without a documented, time-bounded exception.

| Category | Acceptance |
|---|---|
| Performance | ≥ 90 and CWV maximums pass |
| Accessibility | No serious/critical automated issue; manual gate still required |
| Best Practices | No new actionable failure or security warning |
| SEO | No actionable failure on an approved indexable route |

- [ ] Run against a production build/representative preview, not dev mode.
- [ ] Record URL, commit, device profile and at least the median of repeat runs when variance is material.
- [ ] Review diagnostics for unused JavaScript, image sizing, render blocking and third parties.
- [ ] A score cannot override an individual Critical/Major failure.
- [ ] Lighthouse automation is labeled unavailable until it is actually installed/enforced.

---

# 14. SEO Validation

**Pass:** Approved indexable routes are discoverable with accurate metadata, while
private, transactional, search and preview routes remain excluded.

- [ ] Homepage, active categories/products and approved information pages are indexable only after launch gates pass.
- [ ] Search results, cart, checkout, auth, account, order, admin, callback and preview routes are noindex.
- [ ] Canonical URL uses the approved production domain and normalized route.
- [ ] `robots.ts`, `sitemap.ts`, metadata and actual route availability agree.
- [ ] Only canonical active URLs enter sitemap.
- [ ] Redirect/not-found/discontinued behavior is intentional and tested.
- [ ] Internal links are crawlable and use descriptive accessible text.
- [ ] Production indexing remains disabled until security, payment, content, policy and release approval.

**Severity:** Private indexing, wrong canonical at launch or fabricated rich result is Major/Critical.

---

# 15. Structured Data

**Pass:** Server-rendered JSON-LD validates, matches visible authoritative facts and uses
only an appropriate approved schema type.

- [ ] Organization identity matches approved seller/brand facts.
- [ ] WebSite/SearchAction exists only when the target search behavior is valid.
- [ ] BreadcrumbList matches visible route hierarchy.
- [ ] Product/Offer price, currency, identity and availability come from server truth.
- [ ] AggregateRating is absent until legitimate published review data exists.
- [ ] No hidden claim, offer, stock state or policy exists only in JSON-LD.
- [ ] Serialized values are escaped safely against script injection.
- [ ] Markup validates with current search-engine tooling before production launch.

---

# 16. Metadata

**Pass:** Each approved indexable page has unique, truthful and complete metadata that
matches visible content and the Content Guide.

- [ ] Title and description are approved, unique and specific.
- [ ] One canonical URL is emitted.
- [ ] Brand is SirajiBD; internal platform identity is not customer-facing metadata.
- [ ] Price/availability metadata is data-bound, not copied into static prose.
- [ ] Metadata contains no unsupported superlative, AI, COD, review or urgency claim.
- [ ] Private search/order/account data never appears in metadata.
- [ ] Locale/language metadata follows English-first launch policy.
- [ ] Preview/staging metadata cannot enable indexing.

---

# 17. OpenGraph

**Pass:** The shared preview uses approved copy and an approved 1200×630 asset (or is
explicitly blocked from public launch), with correct canonical URL and no fabricated data.

- [ ] Homepage OpenGraph asset is exactly approved, licensed and within safe areas.
- [ ] Default framework/template preview is not used for production launch.
- [ ] Title/description match approved visible positioning.
- [ ] Product/category previews use authoritative identity and approved media only.
- [ ] Image dimensions, MIME/format and absolute production URL resolve correctly.
- [ ] Preview remains legible when cropped by major sharing platforms.
- [ ] No price, rating, offer, stock or delivery claim is rendered unless current and authoritative.
- [ ] Social preview is inspected using at least one real validator or platform debugger before launch.

**Severity:** Misleading product/offer preview is Major; missing launch OG asset is a production blocker per Media Guide.

---

# 18. Product Data Validation

**Pass:** Every visible product fact comes from the owning catalog/commerce source and
remains consistent across card, product page, cart, checkout, metadata and admin.

- [ ] Product ID/slug/title identify the same active product.
- [ ] Variant belongs to that product and attributes match the selected SKU.
- [ ] Current price, compare-at price, currency and discount math are server-derived.
- [ ] Description, composition, dimensions, compatibility and origin have evidence or are omitted.
- [ ] Product card and page use the approved primary image/fallback and correct alt text.
- [ ] Unpublished/archived products do not leak into public lists or sitemap.
- [ ] Missing fields are omitted/flagged; AI or UI never infers facts.
- [ ] Product structured data matches visible server facts.
- [ ] Long titles, no media, many variants and unavailable states are tested.

**Severity:** Wrong identity, price or variant mapping is Critical.

---

# 19. Dynamic State Validation

**Pass:** Default, pending, success, empty, partial, unavailable, stale, error and retry
states are distinct, truthful and recoverable.

- [ ] State comes from the authoritative server/domain owner.
- [ ] Pending prevents unsafe duplicate submission without pretending success.
- [ ] Optimistic UI is not used for payment, stock decrement, refund or order state.
- [ ] Refresh, back and deep link produce expected state/URL behavior.
- [ ] Optional section failure can be isolated without hiding required shell/content.
- [ ] Retry is safe and idempotent for the operation shown.
- [ ] Stale cart/price/stock receives a clear correction path.
- [ ] Gated/missing content returns `null`/omits cleanly rather than showing a fake state.
- [ ] Screen-reader announcement and focus behavior are appropriate for transitions.

---

# 20. Empty State QA

**Pass:** A genuine empty result explains what is empty and offers a valid next action,
without implying future stock, reviews, campaigns or data that do not exist.

- [ ] Empty is distinguished from loading, error, gated and no-permission states.
- [ ] Heading/body/CTA follow the Content Guide’s concise recovery pattern.
- [ ] CTA route/action exists and works.
- [ ] No placeholder products, sample reviews or fabricated categories appear.
- [ ] Empty state preserves page hierarchy and does not become dominant decoration.
- [ ] Mobile, zoom, keyboard and screen-reader behavior pass.
- [ ] Analytics, if approved, records the state without PII.

---

# 21. Error State QA

**Pass:** Expected domain errors and unexpected failures are safe, specific enough to
recover, non-blaming and free of secret/internal detail.

- [ ] Field, form, section, route and root errors use the correct boundary level.
- [ ] Raw stack, SQL, provider response, token, secret and PII never reach UI.
- [ ] Error says what happened in customer language and gives a real next action.
- [ ] User input is preserved when safe.
- [ ] Retry is omitted when financial/stock outcome is unknown or retry is unsafe.
- [ ] Correlation detail is safe and logged server-side when needed.
- [ ] Optional errors do not remove header/footer/primary recovery unnecessarily.
- [ ] Focus and live announcement behavior pass.
- [ ] Offline/unavailable state is not mislabeled as validation failure.

**Severity:** Unsafe retry, data disclosure or false financial state is Critical.

---

# 22. Loading State QA

**Pass:** Loading communicates real progress, preserves structure and never simulates
completion or blocks independent primary content.

- [ ] Required static/approved copy renders without waiting for unrelated private data.
- [ ] Loading appears only for a real asynchronous region.
- [ ] Fallback geometry matches the resolved region closely enough to protect CLS.
- [ ] No indefinite spinner/shimmer lacks timeout, error or recovery behavior.
- [ ] Existing content is retained during safe background refresh when appropriate.
- [ ] Loading does not move or strand focus.
- [ ] Live regions are restrained and do not repeatedly announce.
- [ ] Payment/order loading never implies successful completion.

---

# 23. Skeleton QA

**Pass:** Skeletons mirror stable final geometry, are visually quiet and are hidden from
assistive technology unless an appropriate loading label is provided.

- [ ] Skeleton uses DDS surface/radius tokens, not fake product copy or random geometry.
- [ ] Product media maintains approved 4:5 ratio where applicable.
- [ ] Skeleton count matches the expected bounded layout and does not mimic inventory.
- [ ] Animation stops/is removed for reduced motion.
- [ ] Resolved content does not shift materially.
- [ ] Skeleton is replaced by explicit error/empty state when loading ends unsuccessfully.
- [ ] No endless shimmer appears for gated/omitted content.

---

# 24. Commerce Truth Validation

**Pass:** Presentation never becomes authority for product, price, discount, stock,
delivery, payment, order, refund, promotion, review or trust facts.

- [ ] Money uses integer poisha plus currency and server-side calculations.
- [ ] Displayed subtotal, discount, shipping and total reconcile with server response.
- [ ] Compare-at/savings/offer appears only when calculation and eligibility are valid.
- [ ] Bestseller/trending/low-stock/urgency labels have approved definitions and data.
- [ ] Delivery/payment statements match enabled configuration and applicable conditions.
- [ ] Reviews/ratings/verified purchase come only from an approved real review system.
- [ ] Promotions have campaign ID, terms, eligibility, timezone, expiry and failure behavior.
- [ ] Returns/refund promises appear only from approved published policy.
- [ ] Browser cache/client state never overrides server commerce truth.
- [ ] No “best,” “cheapest,” “100% secure,” “authentic,” COD, AI or guarantee claim lacks evidence.

**Severity:** Any materially false commerce fact is Critical.

---

# 25. Payment UI Validation

**Pass:** UI reflects the exact authoritative payment attempt/order/refund state and
does not treat browser redirects, uploaded proof or pending callbacks as success.

- [ ] Only enabled, production-tested methods are displayed.
- [ ] SSLCommerz/provider redirect is explained as continuation, not payment success.
- [ ] Browser return URL is never payment authority.
- [ ] Pending, failed, cancelled, awaiting verification, paid and refunded are distinct.
- [ ] Each provider callback affects only its matching attempt.
- [ ] Amount, currency and order reference are independently reconciled server-side.
- [ ] Duplicate callback/submission is idempotent.
- [ ] Validation timeout remains retryable without false failure/success.
- [ ] Manual transfer receipt is evidence only; admin verification is authoritative and atomic.
- [ ] Cancellation/refund-required/refund-processing/refunded are not conflated.
- [ ] Unknown outcome does not offer blind retry.
- [ ] No COD or “100% secure” message appears.

**Severity:** Any incorrect financial state or unsafe duplicate action is Critical.

---

# 26. Inventory Display Validation

**Pass:** Availability and purchase controls reflect server-authoritative variant stock
without exposing misleading counts, client authority or unapproved scarcity.

- [ ] Product-level and variant-level availability are not confused.
- [ ] Selected variant controls the displayed availability and purchasability.
- [ ] Low-stock count/label appears only with an approved threshold and authoritative count.
- [ ] Unavailable state disables/changes action and explains recovery where possible.
- [ ] Stale cart stock is revalidated at checkout.
- [ ] Concurrent last-unit behavior is covered by integration tests.
- [ ] Cancellation/release cannot restock twice.
- [ ] Admin adjustment writes the append-only movement ledger.
- [ ] Cache is never final authority for checkout stock.
- [ ] UI does not fabricate “selling fast,” “only X left” or expected restock.

**Severity:** Overselling, wrong variant stock or duplicate adjustment is Critical.

---

# 27. Security Review

**Pass:** The changed surface preserves server-side validation, authorization, safe
rendering, security headers and abuse controls, with no unapproved high/critical risk.

- [ ] Untrusted inputs are validated with Zod at the boundary.
- [ ] Authentication and ownership/role authorization occur server-side.
- [ ] User-owned queries include session owner scope in the database condition.
- [ ] Admin requires role plus 2FA and successful mutations are audited.
- [ ] Output is framework-escaped; rich HTML/SVG/upload content is sanitized and restricted.
- [ ] Public loopable endpoints/actions use persistent rate limits where required.
- [ ] CSRF/session/cookie behavior follows approved framework/auth guidance.
- [ ] CSP, HSTS, content-type, referrer and clickjacking controls remain effective.
- [ ] Shared caches contain no user/account/order/admin data.
- [ ] Secrets, tokens, cookies, signed URLs and provider internals never enter client/evidence/logs.
- [ ] Dependency audit has no unapproved high/critical finding.
- [ ] Preview/local/production credentials and provider modes remain separated.

**Severity:** Exploitable auth, payment, injection, secret or data exposure is Critical.

---

# 28. Privacy Review

**Pass:** The surface collects, displays, sends and retains only approved necessary data
with the correct disclosure, consent, access and deletion/recovery behavior.

- [ ] Purpose and minimum required fields are documented.
- [ ] PII is absent from URLs, metadata, analytics, public cache and filenames.
- [ ] Consent is explicit where required and not bundled with unrelated actions.
- [ ] Newsletter/tracking stays omitted until backend, privacy and consent gates pass.
- [ ] Customer/order data is visible only to the correct owner/authorized operator.
- [ ] Logs and screenshots redact addresses, phones, email, receipts and provider payloads.
- [ ] Identifiable media has documented consent and withdrawal/expiry path.
- [ ] Image GPS/EXIF and incidental personal details are removed.
- [ ] AI receives no customer/order data without separate approved privacy basis.
- [ ] Published privacy/legal copy matches actual behavior and has qualified review.

**Severity:** Unauthorized PII exposure or invalid consent is Critical.

---

# 29. Analytics Validation

**Pass:** Only approved stable events fire once at the intended interaction, contain an
allowlisted privacy-safe payload and never become commerce authority.

- [ ] Event name matches the Component Library/page analytics contract.
- [ ] Impression definition and visibility threshold are documented where used.
- [ ] Click/submit/success/failure events are not conflated.
- [ ] Event fires once per intended action; hydration, rerender and retry do not duplicate it.
- [ ] Payload excludes PII, free text, address, email, phone, secrets and raw provider detail.
- [ ] Product/category IDs are stable approved identifiers; price/currency is authoritative when allowed.
- [ ] Consent and disabled-tracking behavior are honored.
- [ ] Analytics failure never blocks browsing, cart, checkout or admin work.
- [ ] Test/debug traffic and preview environments are separated or marked.
- [ ] Event schema/version and owner are recorded.

**Severity:** PII leakage is Critical; materially wrong conversion reporting is Major.

---

# 30. Browser Compatibility

**Pass:** Critical journeys work in the supported browser matrix using native-first
semantics and approved progressive enhancement; unsupported decoration degrades safely.

## 30.1 Cross-browser matrix

Versions mean the latest stable and previous stable major available at the QA date,
unless the Product Owner approves a measured traffic-based support policy.

| Browser/engine | Desktop | Mobile | Required coverage |
|---|---:|---:|---|
| Chrome / Chromium | Yes | Android | All critical public and admin journeys |
| Microsoft Edge / Chromium | Yes | Spot check | Public journeys and admin workflow |
| Safari / WebKit | macOS | iOS | All critical storefront/checkout journeys |
| Firefox / Gecko | Yes | Spot check where available | Public journeys and form/layout behavior |
| Embedded/social webview | N/A baseline | Smoke check for campaign entry when relevant | Landing, navigation and recovery; do not promise full support without evidence |

- [ ] Native controls, autofill, password manager, back/forward and history behave correctly.
- [ ] CSS glass/backdrop treatment has readable fallback.
- [ ] Focus-visible, forced colors and selection behavior are tested where supported.
- [ ] Sticky/fixed/safe-area and on-screen keyboard behavior pass on iOS and Android.
- [ ] No browser-specific polyfill/dependency is added without approval and measurement.
- [ ] A browser failure includes exact version/OS and reproducible steps.

**Severity:** Critical journey failure in a supported browser is Major or Critical.

---

# 31. Device Compatibility

**Pass:** The responsive matrix works with touch, keyboard, mouse and representative
pixel density/network constraints; layout depends on CSS capacity rather than device brand.

## 31.1 Responsive device matrix

| Mode | CSS viewport | Minimum scenarios |
|---|---:|---|
| Narrow mobile | 320 px | Portrait, touch, long content, slow network |
| Common mobile | 375 and 390 px | Portrait, touch, keyboard/form |
| Large mobile | 430 px | Portrait and landscape |
| Tablet | 768 px | Portrait, touch and keyboard |
| Small laptop/tablet landscape | 1024 px | Navigation transition, mouse/touch |
| Standard desktop | 1280 and 1440 px | Full page, keyboard/mouse |
| Large desktop | 1536 px | Grid/container refinement |
| Wide desktop | 1920 px | Max-width/line-length spot check |
| Zoom/reflow | 200% and 400% | No loss of content/function |
| Reduced height | Representative mobile/desktop | Overlay, sticky and keyboard behavior |

- [ ] At least one real iOS Safari and one real Android Chrome device/service check is completed before commercial launch.
- [ ] High-density images remain sharp without excessive transfer.
- [ ] Coarse pointer has no hover dependency.
- [ ] Rotation/resize does not trap overlays or corrupt state.
- [ ] Mixed-quality network exposes honest loading/failure/retry states.

---

# 32. Content Validation

**Pass:** Every visible word follows Content Guide status, truth, tone, language and
approval rules, and every destination/action exists.

- [ ] Public brand is SirajiBD; platform identity stays internal/portfolio only.
- [ ] Positioning, personality, Vision, Mission, Promise and Hero use approved copy.
- [ ] Launch UI is consistently English; no casual mixed-language/transliterated permanent UI.
- [ ] Brand Story and homepage SEO remain omitted/draft until explicitly approved.
- [ ] Dynamic price, stock, shipping, payment and policy facts are data/config bound.
- [ ] Error/empty/loading copy is concise, non-blaming and recovery-focused.
- [ ] Labels use customer language rather than internal codes.
- [ ] Dates, currency, phone and address formats are locally appropriate.
- [ ] No placeholder, lorem ipsum, sample testimonial or draft marker can ship.
- [ ] Long copy and future complete Bengali localization stress tests pass.
- [ ] Legal, returns, privacy, terms, contact and shipping routes are real before linked/published.

---

# 33. Image Validation

**Pass:** Every media asset has approved identity, rights, crop, alt behavior, dimensions,
format and performance treatment; missing optional assets use the approved fallback.

- [ ] Asset appears in the approved Media Guide register/intake record.
- [ ] Product primary image exists before product publication.
- [ ] Exact product/variant/color is represented truthfully.
- [ ] Width/height or stable aspect ratio is reserved.
- [ ] Responsive `sizes`, focal point and mobile/desktop crops are correct.
- [ ] AVIF/WebP negotiation/approved CDN transformation is used.
- [ ] Only likely LCP media is priority; below-fold media lazy-loads.
- [ ] Product above-fold target <90 KB and maximum 150 KB are respected.
- [ ] Alt is useful for informative media and empty for decoration; filenames contain no PII.
- [ ] Broken/missing media shows the approved text/CSS fallback, never another product.
- [ ] Rights, consent, source and expiry/retirement are recorded.
- [ ] GPS/EXIF and unsafe SVG/script/external tracking are removed.
- [ ] Approved 1200×630 OpenGraph image exists before public launch.

**Severity:** Wrong product image, rights/privacy breach or deceptive edit is Critical/Major.

---

# 34. AI Content Validation

**Pass:** No AI-created output is treated as a business/product/customer fact; any
approved AI asset/content has provenance, human review, disclosure where needed and a
separate approved feature/usage basis.

- [ ] Homepage V2 contains no AI assistant or AI recommendation unless separately approved.
- [ ] AI never invents product composition, origin, compatibility, effect, stock, price or policy.
- [ ] AI never fabricates reviews, people, product photos, results, certificates or proof.
- [ ] Generated media is labeled in its source record and reviewed at full/cropped sizes.
- [ ] Prompts/inputs contain no unapproved customer, order, secret or licensed material.
- [ ] Model/output license and commercial-use terms are recorded.
- [ ] Human owner approves exact output and every factual claim.
- [ ] Unsafe, biased, misleading or artifacted output is rejected/retired.
- [ ] Future AI system has privacy, security, evaluation, cost and rate-limit approval.
- [ ] AI failure has a non-AI recovery path and cannot change financial/order state directly.

**Severity:** Fabricated commercial proof or customer-data leakage is Critical.

---

# 35. Release Checklist

## 35.1 Pre-QA

- [ ] Approved bounded task and route list are recorded.
- [ ] Exact branch/commit and clean scope diff are confirmed.
- [ ] Required authoritative documents and versions are listed.
- [ ] Test data is deterministic, privacy-safe and representative.
- [ ] Preview/local environment uses isolated data and sandbox providers.
- [ ] Gated sections/content/media have explicit render-or-omit decisions.
- [ ] Baseline screenshots, bundle and performance evidence are captured.

## 35.2 Automated gate

- [ ] Frozen-lockfile install succeeds on Node 22 when part of CI/release run.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm lint` passes.
- [ ] `pnpm test` passes with exact counts reported.
- [ ] `pnpm build` passes with the approved preview-data strategy.
- [ ] `pnpm audit --audit-level high` has no unapproved high/critical finding.
- [ ] Affected integration/e2e/axe/Lighthouse/visual checks pass where implemented.
- [ ] No test was weakened, skipped or deleted to hide a failure.

## 35.3 Manual gate

- [ ] Visual, responsive and theme review passes.
- [ ] Keyboard and representative screen-reader journey passes.
- [ ] 200% zoom, 400% reflow, reduced motion and forced colors pass.
- [ ] Cross-browser/device matrix is complete for affected risk.
- [ ] Content, media, analytics, SEO and dynamic-state checks pass.
- [ ] Route-specific checklist passes.
- [ ] Critical smoke journey works from entry through recovery/next route.

## 35.4 Release authorization

- [ ] No open Critical defect.
- [ ] No open Major defect without an allowed written exception.
- [ ] Every N/A and Blocked result has accepted rationale.
- [ ] Product Owner approves scope/content/omissions.
- [ ] UX/architecture reviewer approves fidelity and technical boundary compliance.
- [ ] Security/domain reviewers approve affected high-risk behavior.
- [ ] Rollback owner/method and observation window are known.
- [ ] Commercial production release separately passes MDG security, payment, inventory, policy and operations gates.

---

# 36. Definition of Done

A page/change is Done only when all are true:

- [ ] Scope exactly matches the approved task; no page or feature was added opportunistically.
- [ ] Implementation follows SAS, MDG, DDS, Component Library and approved wireframes.
- [ ] Approved Content/Media are used; unresolved/gated items are truthfully omitted.
- [ ] All common applicable and route-specific checks are Pass.
- [ ] Critical/major risks have automated tests at the lowest useful layer plus manual evidence.
- [ ] Static, unit, build and security gates pass.
- [ ] Required visual, responsive, accessibility, browser and performance evidence exists.
- [ ] No fabricated commerce, social proof, policy, media or AI claim exists.
- [ ] No unrelated file, dependency, architecture, route or behavior changed.
- [ ] Documentation describes actual behavior and any approved exception/remaining blocker.
- [ ] Product Owner and required reviewers sign off.
- [ ] Release/rollback procedures are ready when deployment is in scope.

A merged change is not automatically released, and a deployed build is not automatically
accepted until smoke/observation checks pass.

---

# 37. Homepage-specific QA

**Baseline:** Homepage V2 is the first implementation governed by this checklist.

## 37.1 Section order and shell

- [ ] Announcement Bar (conditional), Header, Hero, Trust (conditional), Featured Categories, Best Sellers (gated), New Arrivals, Promotion (gated), Why Buy (conditional), Reviews (gated), Brand Story (gated), Newsletter (gated), Footer follow approved order/omission behavior.
- [ ] Header/footer reuse existing architecture and extract/extend components only as authorized.
- [ ] CartBadge remains an isolated private async slot with stable fallback; shell is not fully hydrated.
- [ ] Search is native GET navigation for Homepage V2; no unapproved autocomplete.
- [ ] Mobile drawer has focus trap/restore, Escape/close and scroll locking.

## 37.2 Hero and discovery

- [ ] H1 is “Smarter everyday shopping for modern life in Bangladesh.”
- [ ] Approved support copy and two CTAs are exact; “Browse categories” is primary.
- [ ] Primary/secondary destinations exist and work.
- [ ] Clear Liquid CSS fallback is used unless exact hero media is approved.
- [ ] Approved hero copy does not wait for unrelated data/media.
- [ ] Featured Categories contains only published authoritative categories; otherwise omit/recover as specified.

## 37.3 Product sections

- [ ] New Arrivals uses authoritative newest-published behavior.
- [ ] Best Sellers is omitted until approved measurement window/query exists.
- [ ] Product cards show truthful image, title, price and availability from bounded server query.
- [ ] No per-card fetch, client hydration, quick-add, wishlist, carousel or fake badge is introduced.
- [ ] Geometry-matched loading/empty/error behavior follows wireframes.

## 37.4 Gated sections

- [ ] Announcement/promotion has approved campaign/config, dates, terms and destination or is omitted.
- [ ] Trust/Why Buy facts have verified shipping/payment/policy evidence or are omitted.
- [ ] Reviews are omitted until real moderated consented backend/data exists.
- [ ] Brand Story is omitted until exact copy is approved.
- [ ] Newsletter is omitted until backend, consent, privacy, frequency and error/success behavior exist.
- [ ] No AI Assistant entry point is present.

## 37.5 Homepage acceptance

- [ ] Desktop specifications pass at 1280/1440 and 1920 spot check.
- [ ] Mobile specifications pass at 320/375/390/430 and transition widths.
- [ ] Homepage primary journey reaches category, search or product detail.
- [ ] Analytics events match wireframe contract and contain no PII.
- [ ] One logical H1, metadata/canonical/noindex state and OG launch gate are correct.
- [ ] Homepage meets all page performance maximums and Lighthouse ≥90 target.

---

# 38. Product Page QA

This section governs future Product Detail implementation; it does not authorize it.

- [ ] Product identity, slug, publication and selected variant are authoritative.
- [ ] One H1 names the product; breadcrumb/category relationships are correct.
- [ ] Gallery media belongs to the product/variant, has stable ratios, alt text and fallback.
- [ ] Price, discount, currency, availability and variant selection reconcile server-side.
- [ ] Required option selection is clear before Add to cart.
- [ ] Add-to-cart pending/success/error prevents unsafe duplicates and preserves server authority.
- [ ] Quantity limits and unavailable state are truthful and keyboard/touch safe.
- [ ] Description/specifications show only evidenced facts and readable hierarchy.
- [ ] Delivery/payment/return information is conditional on verified configuration/policy.
- [ ] No review/rating/recommendation exists until its feature gate passes.
- [ ] Product/Offer/Breadcrumb JSON-LD matches visible data; no AggregateRating without reviews.
- [ ] Archived/not-found/unavailable behavior and canonical route are intentional.
- [ ] Mobile primary action does not hide content or bypass variant validity.
- [ ] Product route meets performance/media budget and no N+1 query exists.

---

# 39. Checkout QA

This is a high-risk gate. Any wrong price, stock, identity, payment or order state is Critical.

- [ ] Guest and signed-in checkout identities never cross.
- [ ] Address/contact fields have labels, autocomplete, validation and privacy-safe errors.
- [ ] Cart items/variants are revalidated before commitment.
- [ ] Server recomputes price, discount, shipping, tax (if applicable) and total in integer money.
- [ ] Visible total remains near the commitment action and matches server response.
- [ ] Stock hold/decrement is conditional, transactional and concurrency-tested.
- [ ] Duplicate submit is prevented/idempotent without losing recovery.
- [ ] Only enabled delivery/payment options render, with exact terms and next step.
- [ ] Payment redirect/return never confirms payment without provider verification.
- [ ] Failed, pending, unknown, retryable and successful outcomes have safe distinct recovery.
- [ ] Manual transfer proof does not equal paid; verification is atomic and audited.
- [ ] Cancellation/refund states remain distinct and truthful.
- [ ] Back, refresh, timeout and expired-session behavior are tested.
- [ ] Keyboard, screen reader, mobile keyboard, 200% zoom and 400% reflow complete the journey.
- [ ] No sensitive value enters URL, analytics, client logs or shared cache.
- [ ] Confirmation page/order history/lookup uses immutable snapshots and correct ownership.
- [ ] Forged/duplicate callback, mismatch, DB failure and provider-timeout integration tests pass.

---

# 40. Admin Dashboard QA

This section governs future Admin implementation; it does not authorize it.

- [ ] Route requires authenticated admin role plus 2FA; unauthorized response reveals no protected detail.
- [ ] Navigation, heading and page scope make the operator’s context clear.
- [ ] Counts/totals define source, time window, timezone and freshness.
- [ ] Dashboard cards never infer revenue, stock, payment or order status from presentation logic.
- [ ] Tables have semantic headers, sorting/filtering state and approved compact treatment.
- [ ] Empty/loading/error/partial-data states distinguish no data from system failure.
- [ ] Destructive/financial actions require explicit confirmation and server reauthorization.
- [ ] Product variant edits cannot affect another product.
- [ ] Stock adjustment requires reason and writes an append-only movement.
- [ ] Payment/manual transfer action changes the exact attempt/order atomically and is audited.
- [ ] Bulk actions disclose exact selection and are idempotent/recoverable where possible.
- [ ] Success/failure messages identify action outcome without exposing PII/provider internals.
- [ ] Keyboard, screen reader, zoom, responsive table and focus behavior pass.
- [ ] Heavy admin-only code does not enter storefront bundles.
- [ ] Every successful mutation records actor, action, target and safe context.
- [ ] Export/download respects least privilege, privacy and secure filename/content handling.

---

# Appendix A — Manual QA Checklist

Run this compact sequence for every changed page, then apply the relevant detailed sections.

- [ ] Open the exact production build/preview and confirm commit/environment.
- [ ] Test happy path, empty, loading, error, partial, unavailable and gated states.
- [ ] Compare with approved wireframe at matching viewport.
- [ ] Inspect light, dark, hover-capable, touch and reduced-motion modes.
- [ ] Complete keyboard-only journey and overlay/focus recovery.
- [ ] Complete representative screen-reader journey.
- [ ] Check 200% zoom, 400% reflow and forced colors/high contrast.
- [ ] Run every required responsive width and content-stress case.
- [ ] Run supported browsers/real mobile smoke checks based on risk.
- [ ] Verify every link, form action, retry, back/refresh and deep link.
- [ ] Verify copy/media status, alt text, metadata and conditional omissions.
- [ ] Verify authoritative price/stock/payment/offer data and safe failure behavior.
- [ ] Inspect analytics payload/duplication and console/network for errors or leaked data.
- [ ] Record screenshots/reports, defects, severity and retest evidence.

---

# Appendix B — Automated QA Checklist

## Available baseline

- [ ] TypeScript strict typecheck passes.
- [ ] ESLint passes.
- [ ] Vitest tests pass with exact file/test counts.
- [ ] Production build passes.
- [ ] High-severity dependency audit passes or has approved exception.
- [ ] Changed behavior has the lowest useful deterministic regression test.

## Required as the approved test infrastructure becomes available

- [ ] Component interaction/semantic tests.
- [ ] Database/service integration tests for affected commerce domains.
- [ ] Playwright critical journey tests at compact and desktop widths.
- [ ] axe automated accessibility checks on representative routes/states.
- [ ] Lighthouse/CWV and bundle-budget checks.
- [ ] Visual-regression snapshots at approved viewports/themes/states.
- [ ] Metadata/canonical/noindex/JSON-LD tests.
- [ ] Broken-link/route and sitemap/robots validation.
- [ ] Secret/dependency/security scanning.
- [ ] Preview health, migration and production-shaped data validation.

Automation may reduce repetition; it never replaces manual visual, assistive-technology,
content-truth or high-risk domain review.

---

# Appendix C — Visual Regression Checklist

## C.1 Capture set

- [ ] Stable seeded data, timezone, theme, viewport and reduced-motion settings are fixed.
- [ ] 320, 390, 768, 1024, 1440 and 1920 px are captured when affected.
- [ ] Light and dark theme are captured.
- [ ] Default, loading, empty, error and relevant overlay states are captured.
- [ ] Long-content, missing-media and large-price cases are included.
- [ ] Dynamic timestamps, IDs and animation are masked only with documented reason.

## C.2 Review rules

- [ ] Diff is compared to the approved reference, not blindly accepted as a new baseline.
- [ ] Expected changes map exactly to task scope.
- [ ] Text wrapping, crop, focus ring, scrollbar and platform font differences are examined.
- [ ] Threshold does not hide 1 px focus/border or small-text regressions.
- [ ] Browser-specific baseline is used only when rendering genuinely differs.
- [ ] Baseline update records reviewer, reason, commit and affected snapshots.
- [ ] No baseline is updated while a Critical/Major unexplained diff remains.

---

# Appendix D — Performance Acceptance Record

| Field | Result |
|---|---|
| Commit / preview | |
| Route and state | |
| Tool/profile/network/CPU | |
| Baseline date/result | |
| Post-change LCP | |
| Post-change INP | |
| Post-change CLS | |
| Cached TTFB | |
| Initial JS gzip | |
| LCP asset and transfer | |
| Lighthouse categories | |
| Query/bundle notes | |
| Result | Pass / Fail / Blocked |
| Exception owner/expiry, if allowed | |

---

# Appendix E — Defect Record Template

| Field | Value |
|---|---|
| Defect ID | |
| Route/component/state | |
| Severity | Critical / Major / Minor |
| Environment/commit | |
| Browser/device/viewport | |
| Preconditions/data | |
| Steps | |
| Expected | |
| Actual | |
| Evidence | |
| Owner | |
| Target/release blocker | |
| Retest result/date | |

---

# Appendix F — Release Sign-off Template

## Release identity

| Field | Value |
|---|---|
| Change/page | |
| Scope/task ID | |
| Branch/commit | |
| Preview/production URL | |
| Document versions | SAS / MDG / DDS / Component / Content / Media / QA / Wireframes |
| QA window | |

## Gate summary

| Gate | Result | Evidence/defects |
|---|---|---|
| Static/build/test/audit | | |
| Visual/layout/responsive | | |
| Accessibility/keyboard/screen reader | | |
| Performance/CWV/Lighthouse | | |
| SEO/metadata/structured data/OG | | |
| Content/media/AI governance | | |
| Commerce/payment/inventory | | |
| Security/privacy/analytics | | |
| Browser/device | | |
| Route-specific QA | | |

## Defect decision

| Severity | Open count | Release decision |
|---|---:|---|
| Critical | | Must be 0 |
| Major | | Must be 0 unless formal allowed exception |
| Minor | | Owner and target required |

## Approval

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| QA owner | | Approve / Reject | | |
| UX/Design reviewer | | Approve / Reject | | |
| Engineering/Architecture | | Approve / Reject | | |
| Security/Domain reviewer (when required) | | Approve / Reject | | |
| Product Owner | | Approve / Reject | | |
| Release operator | | Ready / Not ready | | |

No blank approval, “Not tested,” unresolved Critical defect or unaccepted Major defect
may be interpreted as release authorization.

---

# Appendix G — Document Validation Checklist

- [ ] All 40 required QA sections are present once.
- [ ] Pass/Fail semantics and Critical/Major/Minor severity are defined.
- [ ] Manual and automated QA checklists are included.
- [ ] Visual regression checklist is included.
- [ ] Cross-browser matrix is included.
- [ ] Responsive 320–1920 px matrix is included.
- [ ] Performance thresholds exactly match SAS/MDG/Media Guide.
- [ ] WCAG 2.2 AA, contrast, touch, zoom/reflow and motion requirements are preserved.
- [ ] Release sign-off template is included.
- [ ] Homepage, Product Page, Checkout and Admin page-specific gates are included.
- [ ] Current automation is distinguished from future/uninstalled tooling.
- [ ] Gated content/media/AI/features are not presented as implemented or approved.
- [ ] No application, dependency, architecture or production release is authorized.

## Permanent Rule

After Product Owner approval, this document completes the planning foundation. Planning is frozen.
New documentation or material changes require a genuine discovered gap or an
approved change request with owner, reason, impact, version update and affected
implementation/tests. The normal next activity is bounded implementation and validation,
starting with Homepage V2 only.
