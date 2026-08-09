# AgentSiraji Commerce V2

## Software Architecture Specification

| Field | Value |
|---|---|
| Document | Software Architecture Specification (SAS) |
| Project | AgentSiraji Commerce V2 |
| Repository | Minhazsiraji/mycommerce |
| Status | Approved architecture baseline for planning |
| Version | 1.0 |
| Date | 2026-08-08 |
| Audience | Product Owner, Chief Software Architect, UX Director, implementation engineers, reviewers and operators |
| Authority | This document governs Commerce V2 architecture. CLAUDE.md remains the short implementation guardrail. |

## Document purpose

This specification translates the approved Repository Audit into a stable technical and
experience architecture for AgentSiraji Commerce V2. It defines what the system is,
what it should become, which boundaries must remain stable and how approved changes
must be introduced without an uncontrolled rewrite.

This is a design document. It does not authorize implementation by itself. Each
implementation phase still requires a bounded task, acceptance criteria, review and
explicit approval.

### Decision vocabulary

Where the desired architecture differs from the repository, this document uses three
labels:

- **Current State** — behavior verified in the repository at the time of this
  specification.
- **Recommended State** — the approved target architecture or standard.
- **Migration Strategy** — the lowest-risk sequence for reaching the recommended state.

### Decision priority

When instructions conflict, use this order:

1. Security and commerce invariants in CLAUDE.md.
2. This Software Architecture Specification.
3. The approved Master Development Guide.
4. The approved Design System and page wireframe.
5. The active, phase-specific implementation task.
6. Existing legacy documentation.

An implementation task must not silently override a higher-level decision. A genuine
conflict is escalated to the Product Owner and Chief Software Architect before code is
changed.

---

# 1. Vision and Mission

## 1.1 Vision

AgentSiraji Commerce V2 will be a premium, fast and trustworthy single-vendor commerce
platform that can serve three related purposes:

1. Operate the production store for sirajibd.com.
2. Demonstrate AgentSiraji's product and engineering quality.
3. Provide a maintainable base that can be configured for future single-vendor client
   stores without turning into a marketplace framework.

The platform should feel modern and intelligent without making customers learn a new
way to shop. “AI-first” means the architecture is ready to add evidence-driven
assistance where it improves discovery, merchandising or support. It does not mean
placing a chatbot on every screen or replacing dependable commerce rules with model
output.

## 1.2 Mission

Transform the existing MyCommerce application into a world-class commerce experience
while:

- preserving the modular-monolith architecture;
- protecting money, payment, inventory and customer-data correctness;
- reusing proven components and services;
- achieving premium storefront quality on mobile and desktop;
- keeping infrastructure and development costs proportionate to a growing Bangladesh
  single-vendor business;
- making changes incrementally, testably and reversibly; and
- adding AI only when measurement identifies a valuable use case.

## 1.3 Product promise

Customers should be able to discover, evaluate and buy the right product with minimal
friction and high confidence. Operators should be able to publish products, verify
payments and fulfil orders without editing the database. Developers should be able to
change one domain without unintentionally breaking another.

---

# 2. Project Goals

## 2.1 Primary goals

| Goal | Architectural response | Evidence of success |
|---|---|---|
| Premium storefront | Approved design system, section hierarchy, reusable shop shell | Consistent visual QA across key routes |
| Fast browsing | Server Components, cached catalog reads, optimized images and small client bundles | Core Web Vitals targets in section 20 |
| Safe commerce | Server-computed totals, transactional stock operations, verified payments and strict state transitions | Passing integration and end-to-end tests |
| Mobile-first usability | Responsive content hierarchy and touch-safe interactions | Key journeys pass mobile usability review |
| Maintainability | Modular monolith, public module APIs and thin routes | Boundary lint and focused diffs |
| Low operating cost | Managed services, no premature distributed infrastructure | Capacity remains inside approved cost plan |
| Reusable commercial base | Brand/config seams without multi-tenant abstractions | New single-store branding does not require commerce rewrites |
| Future-ready intelligence | Isolated AI adapters, provenance and human approval | AI can be enabled per use case without entering checkout correctness paths |

## 2.2 Quality goals

- Security, reliability and correctness take priority over visual novelty.
- Storefront pages should be understandable before animation or AI is loaded.
- A customer must never be charged a client-supplied amount.
- Stock must remain explainable through an append-only movement history.
- Account and order data must always be scoped by authenticated ownership.
- Public interfaces must meet WCAG 2.2 AA.
- Every production release must pass the release gates defined by the Master
  Development Guide.

## 2.3 Non-goals

The following do not belong in Commerce V2 unless a later architecture decision
explicitly changes scope:

- multi-vendor marketplace functionality;
- seller commissions, settlements or vendor dashboards;
- multi-warehouse allocation;
- point-of-sale synchronization;
- subscription billing;
- multi-currency checkout;
- native mobile applications;
- a headless CMS;
- microservices or a general-purpose message broker;
- autonomous AI price changes, refunds, order-state changes or customer promises.

These exclusions protect focus. Each would introduce new tenancy, accounting,
operational or distributed-systems requirements and cannot be treated as a small
feature.

## 2.4 Success measures

Business metrics are selected by the Product Owner. The platform must make the
following measurable without making them architecture dependencies:

- product discovery-to-detail click-through;
- add-to-cart rate;
- checkout start and completion rate;
- payment failure and recovery rate;
- search zero-result rate;
- return/refund reasons;
- customer-support contacts per order;
- page performance by route and device class;
- accessibility defects and error rates.

No metric permits deceptive design, hidden fees, fabricated scarcity or inaccessible
interactions.

---

# 3. Design Philosophy

## 3.1 Stable core, progressive surface

The store has a stable commerce core and an evolving customer-facing surface.
Homepage, listing and product-detail presentation may improve iteratively. Payment,
stock and order invariants change only through explicitly approved hardening work.

## 3.2 Familiar commerce, distinctive brand

The experience should be visually distinctive but behaviorally familiar:

- the logo leads home;
- search is easy to find;
- cart state is visible;
- filters use recognizable controls;
- prices, availability and delivery information are explicit;
- checkout avoids surprises;
- back, refresh and deep links work naturally.

Distinctiveness comes from composition, typography, imagery, materials and restrained
motion—not from hiding standard commerce controls.

## 3.3 Liquid glass as a material, not decoration

The proposed glass/liquid language is allowed only where it supports hierarchy:

- navigation or floating contextual controls;
- hero framing;
- selected promotional surfaces;
- cards where text contrast remains reliable.

It must not be applied to every container. Dense blur, excessive transparency and
moving gradients harm legibility, battery use and rendering performance. Product
imagery and buying information remain visually dominant.

## 3.4 Progressive enhancement

The essential journey—browse, inspect, add, edit cart and buy—must work without relying
on complex animation or model responses. Client JavaScript is used for interaction,
not as the default rendering strategy.

## 3.5 Evidence before complexity

New systems are justified by observed constraints:

- full-text search remains primary until real queries fail;
- cursor pagination replaces offsets only when scale or measurements justify it;
- a Postgres outbox is preferred to a broker;
- AI recommendations require real behavioral or order evidence;
- a new dependency requires a capability the existing stack cannot safely provide.

## 3.6 Accessible by construction

Accessibility is part of architecture, not a final QA step. Semantic structure,
keyboard behavior, focus management, contrast and reduced-motion behavior are designed
with the component.

---

# 4. UI/UX Principles

## 4.1 Customer principles

1. **Clarity before persuasion.** Product, price, variant, stock, delivery and policy
   facts must be more prominent than promotional language.
2. **One primary action per decision.** A section may have supporting links, but its
   intended next step should be obvious.
3. **Confidence near commitment.** Shipping, payment, return and trust details appear
   close to add-to-cart and checkout decisions.
4. **Mobile is not reduced desktop.** Mobile uses an intentional sequence and
   touch-first controls rather than compressed desktop grids.
5. **State is visible.** Loading, success, empty, unavailable, error and offline states
   are designed explicitly.
6. **No dead ends.** Empty search, empty category and unavailable product screens offer
   relevant recovery paths.
7. **No dark patterns.** No false countdowns, hidden charges, preselected paid extras or
   obstructive cancellation.
8. **Respect user control.** Motion is stoppable where applicable, preferences are
   honored and forms preserve recoverable input.

## 4.2 Merchandising principles

- Lead with useful collections, customer needs and product outcomes.
- Use actual catalog data rather than duplicated hard-coded product cards.
- “Best seller,” “low stock,” “new” and promotional badges require defined data rules.
- Reviews must distinguish verified purchase status and must never be fabricated.
- Product imagery has approved aspect ratios, crops, alt text and fallback behavior.
- Offers must disclose conditions and final price clearly.

## 4.3 Interaction principles

- Native elements are preferred where they meet the interaction need.
- Every control has hover, focus-visible, active, disabled, loading and error states as
  relevant.
- Optimistic UI is used only when rollback is clear and server authority remains
  obvious.
- Destructive operations require clear labeling and confirmation proportional to risk.
- Asynchronous changes that matter are announced through accessible live regions.

## 4.4 Content principles

- Use plain, direct language.
- Use BDT formatting consistently.
- Separate verified product facts from marketing claims.
- Error messages explain recovery without exposing internal detail.
- AI-generated customer-visible content requires human approval and provenance.
- Bengali/English localization is a future product decision; components must avoid
  assumptions that make localization impossible.

---

# 5. Information Architecture

## 5.1 Primary customer architecture

~~~mermaid
flowchart TD
    H["Home"] --> D["Discover"]
    D --> C["Collections"]
    D --> S["Search"]
    C --> P["Product detail"]
    S --> P
    P --> CART["Cart"]
    CART --> CO["Checkout"]
    CO --> O["Order confirmation"]
    O --> T["Order tracking"]
    H --> A["Account"]
    A --> AO["Order history"]
    AO --> T
~~~

## 5.2 Primary navigation

Recommended top-level destinations:

- Home
- Shop or Collections
- Search
- Customer-support or policy entry point
- Account
- Cart

Exact marketing labels are defined in the approved wireframe. Admin access is not
customer navigation.

## 5.3 Route architecture

### Current State

| Area | Routes |
|---|---|
| Storefront | /, /c/[slug], /p/[slug], /search |
| Purchase | /cart, /checkout |
| Orders | /orders/[orderNumber], /orders/lookup |
| Authentication | /login, /register, /forgot-password, /reset-password, /two-factor |
| Account | /account, /account/orders, /account/security |
| Admin | /admin plus products, categories, orders, transfers, shipping and activity |
| System | Better Auth, SSLCommerz callbacks and expired-hold cron routes |

### Recommended State

Preserve all route identities unless SEO or task evidence requires a migration. Add
only approved informational routes:

- /about
- /contact
- /shipping
- /returns
- /privacy
- /terms

Future trust/conversion modules may add review or wishlist entry points without
changing core product URLs.

### Migration Strategy

1. Extract a shared storefront shell without moving routes.
2. Introduce approved policy pages and footer links.
3. Add metadata and structured data to existing routes.
4. If a route must change, add a permanent redirect and retain canonical continuity.
5. Keep cart, checkout, account, order and admin routes out of visual-page refactors
   until their dedicated phase.

## 5.4 Navigation rules

- Desktop navigation must expose search, account and cart without a hidden interaction.
- Mobile navigation may use a drawer, but cart and search remain quickly accessible.
- Breadcrumbs are required for collection and product context where useful.
- Search/filter state is represented in the URL.
- Account, checkout and admin pages must not be indexed.
- Customer-facing empty states must never route users to admin.

---

# 6. Complete Folder Architecture

## 6.1 Current State

~~~text
src/
├── app/
│   ├── (shop)/
│   ├── (auth)/
│   ├── (account)/
│   ├── admin/
│   └── api/
├── components/
│   ├── ui/
│   ├── theme-script.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── db/
│   └── storage/
├── modules/
│   ├── accounts/
│   ├── admin/
│   ├── cart/
│   ├── catalog/
│   ├── inventory/
│   ├── notifications/
│   ├── orders/
│   ├── payments/
│   └── shipping/
└── test/

drizzle/
docs/
scripts/
.github/workflows/
~~~

The route layer is mostly thin. Domain behavior belongs in modules. Shared primitives
and infrastructure belong in components/ui and lib respectively.

## 6.2 Recommended State

The target remains a modular monolith. Add folders only when an approved capability
exists.

~~~text
src/
├── app/
│   ├── (shop)/                 thin storefront routes and route metadata
│   ├── (auth)/                 authentication routes
│   ├── (account)/              signed-in customer routes
│   ├── admin/                  protected operator routes
│   └── api/                    auth callbacks, provider callbacks, webhooks, cron
├── components/
│   ├── ui/                     reusable accessible primitives
│   └── layout/                 approved cross-domain shell components
├── lib/
│   ├── db/                     client, schema barrel and transaction utilities
│   ├── storage/                provider-independent media adapter
│   ├── observability/          logging, error reporting and web-vitals adapters
│   └── ai/                     future provider-neutral AI infrastructure only
├── modules/
│   ├── accounts/
│   ├── admin/
│   ├── cart/
│   ├── catalog/
│   ├── checkout/               future orchestration seam; owns no tables
│   ├── inventory/
│   ├── notifications/
│   ├── orders/
│   ├── payments/
│   ├── promotions/             only when approved
│   ├── reviews/                only when approved
│   ├── search/                 only if catalog search becomes independently complex
│   └── shipping/
└── test/
    ├── fixtures/
    └── helpers/

e2e/                            Playwright journeys when introduced
drizzle/                        reviewed generated migrations
docs/
├── architecture/
├── design/
├── runbooks/
└── decisions/                  ADRs for material architecture changes
scripts/
.github/workflows/
~~~

## 6.3 Standard module shape

Not every module needs every file. Create only the files required by its behavior.

~~~text
modules/example/
├── index.ts                    public server-side module API
├── schema.ts                   Drizzle table definitions only
├── validators.ts               Zod schemas safe for client import
├── repository.ts               data access only
├── service.ts                  business rules and orchestration
├── actions.ts                  Server Action boundary
├── cached.ts                   tagged cached reads, if justified
├── tags.ts                     cache-tag helpers, if justified
├── components/                 module-owned UI
└── *.test.ts                   colocated unit tests
~~~

## 6.4 Dependency direction

~~~mermaid
flowchart LR
    APP["app routes"] --> MOD["domain modules"]
    MOD --> LIB["shared lib"]
    APP --> UI["shared UI"]
    MOD --> UI
    UI --> LIB
~~~

Rules:

- lib must not import modules.
- shared UI must not import domain modules.
- modules import another module only through its public index.
- client components may import a module's Server Actions directly because the action
  file is an RPC boundary.
- repositories may import table definitions from the canonical database schema barrel
  for joins.
- schema files may reference another schema directly to define foreign keys.
- circular dependencies are rejected.

## 6.5 Migration Strategy

1. Do not reorganize the repository as a standalone cleanup.
2. Extract shared layout pieces only while implementing an approved page.
3. Split large repositories by cohesive read/write responsibility without changing
   their public exports.
4. Create checkout orchestration only during commerce hardening or checkout work.
5. Introduce observability and test folders with their respective phases.
6. Update imports through mechanical, reviewable changes and keep boundary lint green.

---

# 7. Module Architecture

## 7.1 Module ownership

| Module | Owns | Does not own |
|---|---|---|
| accounts | identity glue, addresses, account data and guards | product/order business rules |
| admin | audit records and admin-only coordination | domain tables owned elsewhere |
| cart | cart identity, items and display totals | authoritative checkout totals |
| catalog | categories, products, variants, images and catalog search | stock movement history |
| checkout | future transaction orchestration | tables or provider implementations |
| inventory | stock movements, reservation/release rules | product merchandising |
| notifications | transactional message templates and delivery adapter | business state changes |
| orders | order snapshots, lifecycle and customer/admin order reads | provider verification |
| payments | payment attempts, provider adapters, callbacks and transfer verification | fulfilment |
| promotions | future coupon and discount rules | base price |
| reviews | future submission, moderation and verified-purchase rules | product catalog |
| shipping | rates, parcels and tracking facts | order pricing outside shipping |

## 7.2 Current State

- Checkout orchestration is primarily inside orders.
- Inventory has a schema but some stock mutation behavior remains in catalog/orders.
- Notifications send inline and best-effort.
- Promotions and reviews are documented future modules but not implemented.
- Search is a catalog responsibility.
- Admin combines domain actions with audit logging.

This current arrangement is functional but places growing transaction and lifecycle
responsibility in large order and catalog files.

## 7.3 Recommended State

- Preserve module ownership and public APIs.
- Keep checkout as a tableless orchestration module when extracting it becomes
  necessary.
- Centralize inventory adjustment, reservation and release rules in inventory services.
- Centralize valid order transitions in an explicit transition service.
- Keep provider-specific payment logic behind payment adapters.
- Treat notification delivery as a side effect of committed domain events.
- Add promotions/reviews only after their data model, abuse controls and experience are
  approved.

## 7.4 Module API rules

- Public exports are deliberate and minimal.
- Server-only exports must be marked and must never enter client bundles.
- A service receives validated domain data, not a raw Request or FormData.
- A repository expresses persistence operations, not UI messages.
- Actions translate transport input and domain errors into safe ActionResult values.
- Components call public reads or Server Actions; they do not call Drizzle.

## 7.5 Migration Strategy

Refactor behind the existing public behavior:

1. Add tests around current service behavior.
2. Extract one cohesive rule at a time.
3. Preserve the external action/repository contract where possible.
4. Run unit and integration tests after each extraction.
5. Change cross-module APIs only in a focused architecture-approved task.

---

# 8. Database Architecture

## 8.1 Current State

The platform uses Neon PostgreSQL through Drizzle ORM. The audited database contains
21 application tables covering accounts, catalog, cart, orders, payments, inventory,
shipping, audit, webhook deduplication and rate limits.

Key established decisions:

- UUID v7 identifiers for commerce records.
- snake_case database naming.
- money in integer poisha with a currency code.
- BDT as the only checkout currency.
- every product represented by one or more variants;
- immutable order-item and address snapshots;
- guest checkout as a first-class flow;
- product search through PostgreSQL full-text and trigram facilities;
- mutable stock projection plus an append-only inventory movement ledger;
- separate payment rows for separate attempts.

## 8.2 Core invariants

1. Money is never stored or calculated as floating point.
2. Price, discount, shipping and total are recomputed on the server.
3. Historical orders do not join live product values for customer-visible facts.
4. Stock decrement is conditional and inside the order transaction.
5. Inventory movements are append-only.
6. Payment attempts remain individually attributable.
7. Provider event identifiers are unique within a provider.
8. User-owned records are queried with owner scope in the same database condition.
9. Database status values are validated at application boundaries and should gain
   database constraints during hardening.
10. Applied migrations are immutable.

## 8.3 Logical data domains

~~~mermaid
erDiagram
    USER ||--o{ ADDRESS : owns
    USER ||--o{ CART : owns
    USER ||--o{ ORDER : places
    CATEGORY ||--o{ PRODUCT : groups
    PRODUCT ||--o{ VARIANT : has
    PRODUCT ||--o{ IMAGE : shows
    CART ||--o{ CART_ITEM : contains
    VARIANT ||--o{ CART_ITEM : selected
    ORDER ||--|{ ORDER_ITEM : snapshots
    ORDER ||--o{ PAYMENT : attempts
    ORDER ||--o{ SHIPMENT : fulfils
    VARIANT ||--o{ INVENTORY_MOVEMENT : explains
~~~

## 8.4 Recommended State

The relational model remains. Approved hardening should add or enforce:

- database checks for valid status values where deployment-safe;
- a database constraint ensuring a cart has exactly one owner form;
- transactionally correct payment/order updates;
- a durable event/outbox table for side effects that must not be lost;
- explicit refund records or states that distinguish requested, processing and
  externally completed refunds;
- reliable stock-adjustment references and idempotency keys;
- indexes justified by production query plans;
- preview databases isolated from production;
- retention rules for provider payloads, rate-limit rows and audit data.

Future growth tables—reviews, coupons, redemptions, wishlists or AI records—are not
created until their feature is approved.

## 8.5 Migration Strategy

- Use drizzle-kit generate and review generated SQL.
- Never use schema push against production.
- Prefer expand/backfill/contract migrations:
  1. add nullable column or new table;
  2. deploy code that dual-reads or backfills;
  3. verify data;
  4. enforce constraint;
  5. remove obsolete data in a later release.
- Test migrations against a production-shaped backup or Neon branch.
- Back up before destructive work and rehearse restoration.
- Run data-integrity queries before and after commerce hardening.
- Keep schema work out of page-visual phases.

## 8.6 Data retention and privacy

- Keep order and payment records for the lawful operational/accounting period approved
  by the business.
- Minimize raw provider payload retention; restrict access and redact unnecessary
  personal data.
- Account deletion anonymizes customer identity where transactional retention is
  legally required.
- Audit logs are append-only and access-limited.
- AI training or external model use must never receive customer or order data without a
  separately approved privacy basis.

---

# 9. API Architecture

## 9.1 Current State

There is no general public REST API. Reads occur in Server Components through module
repositories/services. First-party mutations use Server Actions. Route Handlers serve
Better Auth, SSLCommerz callbacks/webhooks and cron operations.

This shape avoids an unnecessary serialization layer and fits the single Next.js
application.

## 9.2 Recommended State

Keep three interface types:

| Interface | Use |
|---|---|
| Server Component read | First-party server-rendered queries |
| Server Action | First-party browser mutations |
| Route Handler | Authentication/provider callbacks, webhooks, cron and integrations that require HTTP |

A public API is added only for a real external consumer and requires versioning,
authentication, rate limits, documentation and ownership.

## 9.3 Server Action contract

Every action follows this order:

1. Validate unknown input with Zod.
2. Authenticate when required.
3. Authorize against server-derived identity and ownership.
4. Apply rate limits where an untrusted caller can loop.
5. Delegate to a service/transaction.
6. Write required audit/event records.
7. Invalidate affected cache tags.
8. Return a typed, display-safe result.

Recommended result shape:

~~~ts
type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: {
        code: string
        message: string
        fields?: Record<string, string>
      }
    }
~~~

Expected user errors are returned. Unexpected faults are logged with a correlation ID
and presented as a generic recovery message.

## 9.4 Route Handler standards

- Verify origin-specific authentication or provider validation.
- Read the raw body when the provider verification method requires it.
- Enforce content type and payload-size limits.
- Persist idempotency state and processing state separately.
- Return provider-compatible status codes quickly.
- Move retryable side effects to the outbox.
- Protect cron routes with a secret and idempotent job claims.
- Never trust browser return URLs to confirm payment.

## 9.5 Versioning and compatibility

Internal Server Actions are versioned through source control and coordinated deploys.
External webhook contracts are treated as versioned provider adapters. Database changes
must remain compatible with the deployed application during rolling/preview builds.

## 9.6 Migration Strategy

1. Standardize ActionResult and safe errors as modules are touched.
2. Replace unsafe parse behavior for public query strings with recovery-safe validation.
3. Add correlation IDs and structured logs.
4. Refactor callback processing into verify, persist/claim, process and finalize steps.
5. Do not create new HTTP endpoints merely to imitate an API-centric architecture.

---

# 10. Authentication Architecture

## 10.1 Current State

Better Auth provides email/password registration, email verification, password reset
and session handling. Customers may use TOTP. Administrators must pass TOTP through
the application guard. Account pages support session management and sensitive-action
re-verification.

Implemented strengths:

- role is not accepted from registration input;
- protected reads are scoped by session identity;
- unauthorized admin routes return a non-revealing response;
- session cookies are HTTP-only;
- administrators require role and second-factor checks;
- account export/deletion requires password confirmation.

## 10.2 Recommended State

Preserve Better Auth and the existing guard model.

Trust boundaries:

~~~mermaid
flowchart TD
    R["Public request"] --> S{"Valid session?"}
    S -- No --> PUB["Public scope"]
    S -- Yes --> OWN["User-owned scope"]
    OWN --> ROLE{"Admin role?"}
    ROLE -- No --> ACC["Customer capability"]
    ROLE -- Yes --> MFA{"2FA satisfied?"}
    MFA -- No --> CH["2FA challenge"]
    MFA -- Yes --> ADM["Admin capability"]
~~~

Standards:

- authorization is enforced server-side for every operation;
- role checks do not depend on hidden navigation;
- session IDs and tokens never enter logs;
- authentication errors do not confirm whether an account exists;
- password and TOTP secrets use provider-recommended protection;
- sensitive account mutations revoke or rotate sessions as appropriate;
- CSRF protection follows Better Auth and framework guidance;
- security-critical configuration duplicated across proxy/auth files is documented and
  tested.

## 10.3 Migration Strategy

- Freeze authentication during storefront work.
- Add integration tests for IDOR, admin 2FA and session revocation before changing auth.
- Make account anonymization/deletion atomic during hardening.
- Review cookie, proxy and trusted-origin settings against the production domain before
  launch.
- Re-evaluate dependency versions and authentication advisories during every release.

---

# 11. Payment Architecture

## 11.1 Current State

The store supports:

- SSLCommerz hosted payment for supported card, mobile financial service and banking
  channels;
- manual bank transfer with administrator verification.

The server recomputes totals, creates payment attempts, validates SSLCommerz through
the provider API, matches amount/currency and uses webhook event records for
deduplication. Browser redirects are not authoritative.

The audit identified critical correctness gaps:

1. A callback record can be treated as completed before retryable validation succeeds.
2. Marking an order paid can overwrite multiple payment attempts together.
3. Manual transfer confirmation is not one atomic payment/order transition.
4. Paid cancellation may be labeled refunded before money is actually refunded.

## 11.2 Recommended State

Payment architecture separates attempts, provider events, order payment state and
refund state.

~~~mermaid
sequenceDiagram
    participant C as Customer
    participant APP as Commerce app
    participant DB as PostgreSQL
    participant PG as SSLCommerz

    C->>APP: Place order
    APP->>DB: Transaction: totals, stock, order, attempt
    APP->>PG: Create hosted session
    PG-->>C: Hosted payment page
    PG->>APP: IPN with val_id
    APP->>PG: Server-side validation
    PG-->>APP: Authoritative result
    APP->>DB: Transaction: claim event, update one attempt and order
    APP-->>PG: Acknowledge
    APP->>DB: Queue post-payment side effects
~~~

### Payment attempt rules

- One row represents one attempt.
- An attempt has a provider reference unique enough for reconciliation.
- Only the matching attempt changes state from a callback.
- Earlier failed attempts remain failed.
- Order payment state is derived/transitioned from authoritative successful attempts.
- Duplicate callbacks are no-ops after successful processing.
- A retryable validation failure remains retryable.

### Refund rules

- Cancellation and refund are separate concepts.
- A paid cancellation creates a refund-required state; it does not claim money moved.
- Gateway refund request, provider processing and completed refund are distinct facts.
- Manual bank refunds are recorded only after the operator completes the transfer.
- Partial refunds, if ever approved, require explicit records and amount reconciliation.

### Manual transfer rules

- Receipt images are supporting evidence, never proof.
- The operator verifies against the bank statement.
- Payment attempt and order state update in one transaction.
- Submitted proof does not hold inventory forever; expiry policy and admin escalation
  are explicit.

## 11.3 Failure behavior

| Failure | Required behavior |
|---|---|
| Provider session creation fails | Order/stock follow an approved retry or expiry path; no false payment |
| Callback validation times out | Record retryable state and allow provider retry |
| Duplicate callback | Return success without duplicate mutation |
| Amount/currency mismatch | Reject, log security event and alert operator |
| DB transition fails | Do not acknowledge as processed; permit safe retry |
| Email fails after payment | Payment remains valid; outbox retries notification |
| Refund request fails | Retain refund-pending state; do not mark refunded |

## 11.4 Migration Strategy

Payment hardening is a production-release blocker:

1. Add integration tests reproducing each audit finding.
2. Define payment-attempt and refund transition tables/states.
3. Separate event receipt from successful processing or add a processing status and
   retry-safe claim.
4. Scope mutations to the exact payment attempt.
5. Make manual transfer confirmation atomic.
6. Implement explicit refund lifecycle.
7. Reconcile sandbox and one controlled live transaction before release.

Homepage and catalog visual work may proceed before this migration because they do not
touch payment logic. No launch approval is allowed while these issues remain open.

---

# 12. Inventory Architecture

## 12.1 Current State

Each variant stores current stock. Checkout uses conditional, transactional decrement.
Inventory movements are intended as an append-only explanation of stock changes.
Expired holds and cancellations restore inventory.

Audit findings:

- admin product editing can replace stock without a ledger movement;
- repeated or concurrent release/cancellation can restore stock twice;
- variant update scoping is not constrained by both variant and product;
- some bank-transfer states may hold inventory indefinitely.

## 12.2 Recommended State

Inventory is governed by a single service boundary.

### Concepts

- **Available stock** — current sellable quantity.
- **Reservation/hold** — quantity removed or reserved for a pending order according to
  the current implementation model.
- **Movement** — immutable signed delta with reason, actor/source and reference.
- **Adjustment** — administrator-authorized correction recorded as a movement.
- **Release** — idempotent reversal tied to the original order/reservation.

### Required rules

1. Every stock change and movement record commit atomically.
2. A release atomically claims an eligible order/reservation state.
3. Repeating the same release key cannot change stock twice.
4. Admin edits use an adjustment action, never an arbitrary stock assignment.
5. Variant updates are scoped by variant ID and product ID.
6. Negative sellable stock is rejected.
7. Reconciliation compares the projection with movement history and reports drift.
8. Returns/restocks identify the order item and actual received quantity.

## 12.3 Inventory flow

~~~mermaid
stateDiagram-v2
    [*] --> Available
    Available --> Reserved: order placed
    Reserved --> Sold: payment confirmed
    Reserved --> Available: hold expired or valid cancellation
    Sold --> Available: approved return restocked
    Available --> Available: audited adjustment
~~~

This is a conceptual flow. The current database may represent reservation as a stock
decrement rather than a separate reservation table. A new reservation table is not
required unless hardening analysis shows it simplifies correctness.

## 12.4 Migration Strategy

1. Add concurrency tests for last-unit purchase and double release.
2. Introduce idempotent inventory service operations.
3. Route admin stock edits through adjustment operations.
4. Fix variant ownership scoping.
5. Define bank-transfer expiry behavior for submitted-but-unverified proof.
6. Add scheduled reconciliation reporting.
7. Consider a reservation table only if the existing projection model cannot satisfy
   the invariants cleanly.

---

# 13. Order Lifecycle

## 13.1 State model

Order, payment and fulfilment are independent state axes. They must not be collapsed
into one ambiguous status.

### Order axis

Recommended conceptual states:

- pending
- confirmed
- cancelled
- completed

### Payment axis

- unpaid
- awaiting_gateway
- awaiting_transfer
- awaiting_verification
- paid
- refund_required
- refund_processing
- partially_refunded, only if partial refunds are approved
- refunded
- payment_failed
- expired

### Fulfilment axis

- unfulfilled
- processing
- partially_shipped
- shipped
- delivered
- returned

The exact names must be reconciled with current database values during hardening.
Business meaning, not naming preference, governs migration.

## 13.2 Current State

Orders already support purchase snapshots, multiple payment attempts, fulfilment
states, parcels, customer history, guest lookup, cancellation/refund behavior and
admin notes/actions. Some transition rules are distributed across large service/action
files rather than centralized.

## 13.3 Recommended State

An explicit transition service validates:

- source state;
- requested target state;
- actor/capability;
- required evidence;
- transactional side effects;
- emitted domain event;
- audit record.

Illegal transitions fail safely and do not partially mutate related records.

## 13.4 Lifecycle

~~~mermaid
stateDiagram-v2
    [*] --> Pending: order placed
    Pending --> Confirmed: authoritative payment or transfer verification
    Pending --> Cancelled: expiry or eligible cancellation
    Confirmed --> Cancelled: operator-approved cancellation
    Confirmed --> Completed: delivered and settled
    Cancelled --> [*]
    Completed --> [*]
~~~

Payment and fulfilment transitions run alongside this high-level order state. A paid
order cannot be represented as refunded until refund completion is evidenced.

## 13.5 Idempotency

Every external or repeatable lifecycle command requires a stable key:

- provider event ID for payment callbacks;
- job/action claim for hold release;
- shipment/carrier event ID where available;
- refund provider reference;
- explicit action guard for repeated admin operations.

## 13.6 Migration Strategy

- Capture existing transitions in tests.
- Build a transition matrix before modifying states.
- Introduce the transition service behind existing actions.
- Move side effects to committed events/outbox.
- Add database constraints after existing data is normalized.
- Avoid state-name migrations during UI work.

---

# 14. Customer Journey

## 14.1 Target journey

~~~mermaid
flowchart TD
    ARR["Arrive"] --> DISC["Discover"]
    DISC --> EVAL["Evaluate product"]
    EVAL --> SEL["Select variant"]
    SEL --> CART["Review cart"]
    CART --> CHECK["Checkout"]
    CHECK --> PAY["Pay"]
    PAY --> CONF["Confirmation"]
    CONF --> TRACK["Track and receive"]
    TRACK --> POST["Support, review or return"]
~~~

## 14.2 Journey requirements

### Arrival

- Immediately communicate store identity and primary value.
- Provide clear navigation, search and cart state.
- Avoid heavy animation that delays understanding.

### Discovery

- Offer meaningful collections, best sellers and search.
- Preserve selected filters/sort through navigation and pagination.
- Provide recovery suggestions for zero results.

### Evaluation

- Show accurate imagery, price, variants, availability and delivery context.
- Make product claims verifiable.
- Surface trust and policy information near the buying decision.
- Related products must be relevant and must not distract from selection.

### Cart

- Show product/variant, unit price, quantity and subtotal clearly.
- Revalidate stock and authoritative price on the server.
- Make edit/remove actions accessible.
- Explain when final shipping is calculated.

### Checkout

- Guest checkout remains available.
- Minimize fields and group them logically.
- Show final totals before leaving for hosted payment.
- Explain payment method and recovery behavior.
- Never lose order identity if the provider return is interrupted.

### Confirmation and post-purchase

- Provide order number and independently verifiable current status.
- Explain that gateway return is not the source of truth if payment is still processing.
- Send transactional email through a durable path.
- Give signed-in customers history and guests a rate-limited lookup path.

## 14.3 Error and edge journeys

Designs must include:

- unavailable variant after selection;
- last unit purchased by another customer;
- stale price in cart;
- gateway cancelled/failed/unknown result;
- duplicate form submission;
- expired bank-transfer hold;
- delivery split into multiple parcels;
- product archived after purchase;
- account session expired;
- network loss before and after payment redirect.

---

# 15. Admin Journey

## 15.1 Current State

Protected admin pages support products, categories, shipping rates, orders, transfer
verification, parcels and audit activity. Admin access requires role plus 2FA.

The interface is operational but has limited mobile navigation, dashboard summary,
bulk operations, stock-adjustment workflows and monitoring.

## 15.2 Recommended journey

~~~mermaid
flowchart TD
    SIGN["Sign in + 2FA"] --> DASH["Operational overview"]
    DASH --> CAT["Publish catalog"]
    DASH --> ORD["Process orders"]
    DASH --> PAY["Verify payments"]
    DASH --> INV["Adjust inventory"]
    DASH --> SHIP["Manage fulfilment"]
    DASH --> AUD["Review activity and exceptions"]
~~~

## 15.3 Admin principles

- Prioritize exceptions and next actions over decorative analytics.
- Every sensitive action identifies its consequences.
- Admin mutations are audited after successful transactional work or in the same
  transaction where required.
- Stock adjustment requires quantity delta and reason.
- Payment verification displays bank/provider facts separately from customer claims.
- Refund controls distinguish requested from completed.
- Destructive and financial operations require explicit confirmation.
- Tables work with keyboard navigation and narrow screens.
- Bulk operations are introduced only with safe per-row validation and summary results.

## 15.4 Dashboard information hierarchy

Potential dashboard facts must come from reliable current data:

- orders awaiting action;
- transfers awaiting verification;
- payment exceptions;
- low-stock variants;
- shipments needing update;
- failed notification/outbox items;
- recent audited activity.

Revenue and conversion analytics should not be invented from incomplete data. Each
metric requires a definition, date range, currency handling and reconciliation source.

## 15.5 Migration Strategy

- Keep admin unchanged during storefront phases.
- Fix category-count correctness before using it as a dashboard metric.
- Implement critical payment/inventory workflows before visual dashboard expansion.
- Add operational summary queries only after indexing and performance review.
- Treat monitoring/exception queues as higher priority than vanity charts.

---

# 16. AI Architecture (Future-Ready Only)

## 16.1 Position

AI is optional and evidence-driven. No AI implementation is part of Homepage V2,
catalog redesign, checkout or hardening unless separately approved.

AI may assist:

- product discovery when full-text search demonstrably fails;
- product-content drafting for administrator review;
- customer support grounded in approved policies and live order facts;
- merchandising analysis based on real aggregate behavior;
- accessible alternative-text drafting with human verification.

AI must not autonomously:

- set price, discount, stock or shipping;
- confirm payment;
- change order, refund or fulfilment state;
- expose one customer's data to another;
- invent product facts, delivery promises, reviews or policy terms;
- send unreviewed high-impact communications;
- make eligibility or fraud decisions without an approved policy and appeal path.

## 16.2 Current State

PostgreSQL full-text search and trigram matching serve catalog discovery. No AI module,
embedding pipeline, model provider or AI interaction storage is implemented. This is
appropriate at current scale.

## 16.3 Recommended State

Future AI uses a provider-neutral boundary:

~~~mermaid
flowchart TD
    USE["Approved use case"] --> POLICY["Policy and authorization"]
    POLICY --> RET["Scoped retrieval"]
    RET --> MODEL["Model adapter"]
    MODEL --> CHECK["Validation and provenance"]
    CHECK --> HUMAN{"Human approval required?"}
    HUMAN -- Yes --> REVIEW["Admin review"]
    HUMAN -- No --> SAFE["Low-risk response"]
~~~

Architecture seams:

- lib/ai for provider clients, budgets, redaction and common policies;
- a domain-owned service for each use case;
- retrieval scoped to public catalog/policies or the authenticated customer's order;
- structured outputs validated with Zod;
- prompt/version/model metadata for auditable admin drafts;
- cost, latency, failure and usefulness measurement;
- an off switch and deterministic fallback.

## 16.4 Search migration criteria

Semantic or hybrid search is considered only when:

- query logs show material zero-result or irrelevant-result rates;
- spelling/synonym improvements are insufficient;
- an evaluation set exists;
- hybrid ranking outperforms current search;
- latency and monthly cost fit approved budgets;
- embeddings can be refreshed reliably when products change.

pgvector is preferred before adding a separate vector service because Postgres is
already the system of record and catalog scale is modest.

## 16.5 Support assistant safeguards

- Retrieve only approved policies and scoped order facts.
- Authenticate before revealing order data.
- Cite or link the source policy/order status.
- Refuse to promise refunds, delivery dates or product facts not present in sources.
- Escalate ambiguous or financial cases to a human.
- Do not train external models on conversation/customer data by default.
- Publish retention and privacy behavior.

## 16.6 Migration Strategy

1. Add analytics and define the problem.
2. Build an offline evaluation set.
3. Approve privacy, cost and failure behavior.
4. Implement one isolated, low-risk use case.
5. Run in shadow/draft mode.
6. Require human review where claims or customer outcomes are affected.
7. Measure against the deterministic baseline.
8. Expand only if evidence supports it.

---

# 17. Event Flow

## 17.1 Current State

Many side effects, including email, occur inline and best-effort. Webhook events provide
deduplication. Cron releases expired stock holds. The documented outbox is not yet
implemented.

## 17.2 Recommended State

Use domain events for reliable post-transaction side effects without introducing a
broker.

Examples:

- OrderPlaced
- PaymentConfirmed
- PaymentFailed
- TransferSubmitted
- TransferVerified
- HoldExpired
- OrderCancelled
- RefundRequired
- RefundCompleted
- ShipmentCreated
- OrderShipped
- OrderDelivered
- InventoryAdjusted

Events are internal facts, not public API contracts unless explicitly published.

## 17.3 Transactional outbox

~~~mermaid
sequenceDiagram
    participant S as Domain service
    participant DB as PostgreSQL
    participant J as Cron worker
    participant X as Email or integration

    S->>DB: Transaction: state change + outbox row
    DB-->>S: Commit
    J->>DB: Claim pending row
    J->>X: Deliver side effect
    X-->>J: Result
    J->>DB: Mark delivered or schedule retry
~~~

Outbox requirements:

- written in the same transaction as the business fact;
- unique idempotency/deduplication key;
- attempt count and next-attempt time;
- safe concurrent claiming;
- bounded exponential backoff with jitter;
- terminal/dead-letter visibility;
- payload minimization and versioning;
- operator retry capability;
- idempotent consumers.

## 17.4 Event ownership

The module that commits the fact owns the event. Notification templates consume events
but do not decide business state. The outbox is infrastructure, not a replacement for
domain services.

## 17.5 Migration Strategy

1. Start with order confirmation and shipment/refund communications.
2. Introduce outbox schema and worker behind existing notification calls.
3. Make delivery idempotent.
4. Add admin visibility for persistent failures.
5. Extend to courier integrations only when operational volume justifies them.

---

# 18. Caching Strategy

## 18.1 Current State

Catalog and shipping reads use tagged Next.js caching. Product/category mutations
invalidate related tags. Storefront data is rendered primarily through Server
Components. Account, cart, checkout, order and admin data remain dynamic or
user-specific.

## 18.2 Cache classification

| Data | Cache policy |
|---|---|
| Public active product/category reads | Tagged server cache/CDN where safe |
| Product images | Cloudinary/CDN immutable versioned URLs |
| Shipping-rate reference data | Short/tagged cache if not user-specific |
| Search results | Conservative cache or uncached until query patterns justify it |
| Cart | Never public-cache; identity scoped |
| Checkout totals | Never reuse as authority; recompute |
| Account/order history | Private, dynamic and user scoped |
| Admin operations | Dynamic/no-store |
| Payment/callback responses | Never CDN cached |

## 18.3 Tag strategy

Recommended tags are domain-specific and invalidated by successful mutations:

- product:[id]
- product-slug:[slug]
- category:[id]
- category-slug:[slug]
- catalog:list
- shipping:rates
- sitemap

Exact tag names should remain centralized. Broad invalidation is acceptable for small
data only until it creates measurable load.

## 18.4 Safety rules

- Never cache a response containing user-specific or admin data in a shared cache.
- A cache is never the source of truth for money, stock or payment state.
- Mutation invalidation happens after successful commit.
- Cloudflare must not cache authentication, cart, account, checkout, admin, callback or
  webhook routes.
- Webhook/WAF rules must not challenge trusted provider callbacks.
- Cache keys include all query inputs that change output.

## 18.5 Migration Strategy

- Preserve current tagged catalog reads during visual redesign.
- Add tests for invalidation when changing catalog write paths.
- Measure hit rates and origin load before adding new layers.
- Make builds independent of production database availability through preview fixtures
  or isolated preview databases, not by caching production data into builds.

---

# 19. Security Standards

## 19.1 Security posture

Security is a release gate and a design constraint. The threat model includes:

- price and quantity tampering;
- IDOR/customer-data exposure;
- account takeover and admin compromise;
- forged or replayed payment callbacks;
- duplicate financial or inventory operations;
- malicious uploads;
- credential/secret exposure;
- SQL/script injection;
- abuse of public lookup and forms;
- supply-chain vulnerabilities;
- CDN/WAF misconfiguration;
- AI prompt injection and data leakage in future features.

## 19.2 Mandatory application controls

- Validate every untrusted input with Zod at the boundary.
- Authenticate and authorize server-side.
- Scope user queries by session identity in the database query.
- Require role plus 2FA for admin access.
- Recompute all commerce totals server-side.
- Use conditional transactional stock updates.
- Verify payment callbacks independently with the provider.
- Make callback and repeatable job processing idempotent.
- Rate-limit public abuse targets using shared persistent storage.
- Use parameterized ORM queries.
- Escape output through framework defaults; sanitize any future rich HTML.
- Restrict upload type, size, ownership and storage key.
- Record successful admin mutations with actor and context.
- Return safe error messages and log internal detail.

## 19.3 Platform controls

- Validate environment variables at boot.
- Store secrets only in approved environment/secret stores.
- Separate production, preview and local credentials.
- Use test payment keys outside production.
- Set CSP, HSTS, content-type, referrer and clickjacking protections.
- Configure Cloudflare Full (strict), WAF and callback bypass rules carefully.
- Apply least privilege to database and provider credentials where supported.
- Rotate compromised credentials and document ownership.
- Back up and rehearse restore.

## 19.4 Dependency controls

- Lock dependencies with pnpm.
- Review lockfile changes.
- Run dependency audit in CI.
- Remediate high/critical findings before release, or document a time-bounded,
  evidence-backed exception approved by the architect.
- Avoid unmaintained or unnecessary packages.
- Verify framework/auth/provider guidance from primary sources during upgrades.

## 19.5 Current gaps

The Repository Audit's payment, refund, inventory, transaction and dependency findings
are release blockers. The current passing unit tests do not prove the high-risk flows.

## 19.6 AI security

Future AI features must:

- treat retrieved/customer text as untrusted;
- enforce authorization before retrieval;
- separate system policy from retrieved content;
- validate tool/model output;
- prohibit direct financial or state-changing tools by default;
- redact secrets and unnecessary personal data;
- log safe metadata, not sensitive prompts by default;
- set cost and rate limits.

## 19.7 Migration Strategy

1. Convert each critical audit finding into a failing regression test.
2. Fix payment/inventory transaction boundaries.
3. Resolve dependency advisories.
4. add integration/e2e security tests.
5. complete threat-model review and launch checklist.
6. run a focused pre-launch penetration review of auth, checkout, payment callbacks and
   guest order lookup.

---

# 20. Performance Standards

## 20.1 Performance philosophy

Optimize customer-perceived speed and correctness before synthetic vanity scores.
Budgets are enforced on representative mobile hardware/network profiles.

## 20.2 Target budgets

| Metric | Target | Maximum launch threshold |
|---|---:|---:|
| LCP, p75 mobile | ≤ 2.0 s | 2.5 s |
| INP, p75 | ≤ 150 ms | 200 ms |
| CLS, p75 | ≤ 0.05 | 0.10 |
| TTFB, cached public page | ≤ 300 ms | 500 ms |
| Initial JS, critical storefront route | ≤ 120 KB gzip target | Approved exception required |
| Lighthouse performance, representative mobile | ≥ 90 | No regression below approved baseline |
| Image layout shift | 0 expected | 0.02 page total |

Real-user data takes precedence once sufficient samples exist.

## 20.3 Rendering rules

- Server Components by default.
- Client Components only for actual browser interaction.
- Stream independent slow sections where it improves first meaningful content.
- Avoid client-side fetches for data already available on the server.
- Use suspense fallbacks that preserve layout.
- Keep personalization out of shared cached output.

## 20.4 Image rules

- Supply width/height or a stable aspect ratio.
- Use meaningful responsive sizes.
- Use Cloudinary transformations through the storage abstraction.
- Prefer AVIF/WebP negotiation.
- Preload only the actual likely LCP image.
- Lazy-load below-fold imagery.
- Define quality by asset role; do not ship original camera files.
- Preserve alt text independently of optimization.

## 20.5 Data/query rules

- Avoid N+1 queries.
- Select only required columns for high-volume lists.
- Paginate public collections.
- Use EXPLAIN ANALYZE with production-shaped data for critical queries.
- Add indexes from measured plans, not intuition.
- Set operational query timeouts where safe.
- Observe slow queries and connection use.

## 20.6 Animation performance

- Animate transform and opacity where possible.
- Avoid continuously animating large blurred/translucent surfaces.
- Do not animate layout properties on scroll.
- Stop off-screen animation.
- Honor prefers-reduced-motion.

## 20.7 Current State and Migration

### Current State

Server rendering, tag caching, responsive transformed images and Singapore region
alignment provide a good base. Budgets are documented but not enforced. Lighthouse CI,
real-user monitoring and slow-query automation are absent.

### Migration Strategy

1. Record route baselines before visual work.
2. Add bundle and Lighthouse checks during Design System/Homepage implementation.
3. Install web-vitals/error monitoring during hardening.
4. Profile catalog/search SQL against seeded realistic data.
5. Fix regressions in the phase that introduces them.

---

# 21. Accessibility Standards

## 21.1 Conformance

Public customer experiences and admin workflows target WCAG 2.2 AA. Conformance
includes keyboard and assistive-technology behavior, not only automated scans.

## 21.2 Structural standards

- One logical h1 per page.
- Heading levels reflect hierarchy.
- Landmarks use header, nav, main, aside and footer appropriately.
- Provide a visible-on-focus skip link.
- Give multiple navigation regions distinct accessible labels.
- Use lists, tables and forms semantically.
- Set page language correctly.

## 21.3 Interaction standards

- Every action is keyboard operable.
- Focus-visible indicators meet contrast/visibility requirements.
- Touch targets are at least 44 by 44 CSS pixels where practical.
- Dialogs/drawers trap and restore focus correctly.
- Escape closes dismissible overlays.
- No content requires hover alone.
- Drag/reorder interactions have a keyboard alternative.
- Loading does not strand focus.

## 21.4 Form standards

- Every field has a programmatic label.
- Help/error text is connected through aria-describedby.
- Invalid state uses aria-invalid and is not color-only.
- A form-level error summary focuses after failed submission when appropriate.
- Required format and constraints are explained before error.
- Autocomplete tokens are supplied for customer/contact/address data.
- Authentication does not block password managers or paste.

## 21.5 Visual and motion standards

- Normal text contrast is at least 4.5:1; large text at least 3:1.
- UI component/focus boundaries meet non-text contrast.
- Glass surfaces are tested over every supported background/image.
- Information is not encoded by color alone.
- Layout supports 200% text zoom and 400% reflow without loss of function.
- Reduced-motion users receive no nonessential parallax, large movement or autoplay.

## 21.6 Media and content

- Product images have useful alt text; decorative graphics use empty alt.
- Icons with actions have accessible names.
- Price/discount presentation remains understandable to screen readers.
- Status changes are announced without excessive verbosity.
- Language remains clear and does not rely on spatial instructions alone.

## 21.7 Testing

- Automated axe checks on representative routes.
- Keyboard-only journey testing.
- Screen-reader spot checks for navigation, search, product selection, cart, checkout
  and admin forms.
- 200% zoom and narrow reflow.
- High contrast and reduced motion.
- Manual review is required; automated “zero violations” is not acceptance by itself.

## 21.8 Current State and Migration

Existing semantic labels, focus styling, native controls and reduced-motion support are
useful foundations. The skip link, comprehensive described errors, live announcements,
automated axe coverage and glass-surface contrast verification remain to be added.
Implement these with the Design System and each page, not as a final patch.

---

# 22. SEO Standards

## 22.1 Current State

Indexing is intentionally disabled globally. Product/category pages exist, but launch
SEO infrastructure, policy content, structured data and approved brand metadata are
incomplete.

## 22.2 Recommended State

### Indexable

- Homepage
- Active category/collection pages
- Active product pages
- Approved informational and policy pages

### Noindex

- Search-result URLs
- Cart and checkout
- Authentication and account
- Order lookup/details
- Admin
- callback, webhook and error routes
- preview deployments

## 22.3 Metadata standards

- Unique, approved title and description.
- Canonical URL for each indexable page.
- Open Graph and social-image metadata.
- Product availability and price metadata from authoritative data.
- No claims or ratings that are not displayed and supported.
- Stable product/category URLs.

## 22.4 Structured data

Use schema.org types only when data exists:

- Organization
- WebSite and SearchAction when valid
- BreadcrumbList
- Product
- Offer
- AggregateRating only from published legitimate reviews

Server-render JSON-LD, escape serialized values safely and validate with search-engine
tools.

## 22.5 Technical SEO

- robots.ts controls crawler access.
- sitemap.ts includes only canonical active URLs.
- redirects preserve renamed routes/slugs.
- archived/unavailable products follow an approved 404, 410 or retained-page policy.
- pagination and filters avoid index bloat.
- Core Web Vitals and accessible semantic content support discoverability.
- preview/staging is blocked from indexing.

## 22.6 Content and policy requirements

Before launch, approve and publish:

- return/refund policy;
- privacy policy;
- terms of service;
- shipping information;
- contact details;
- accurate brand/company identity.

## 22.7 Migration Strategy

1. Approve brand and policy content.
2. Implement metadata/structured-data helpers.
3. Add robots and sitemap with tests.
4. Validate canonical/noindex behavior.
5. Enable production indexing only after security, payment, content and release gates
   pass.

---

# 23. Component Architecture

## 23.1 Current State

Reusable primitives are Button, Input, Select and Textarea. Reusable domain components
include product cards/grids, gallery, variant picker, cart controls, checkout form,
account/security forms and multiple admin managers. The repository does not contain a
complete shadcn component library despite earlier documentation.

## 23.2 Component layers

| Layer | Responsibility | Examples |
|---|---|---|
| Tokens | visual values and semantic aliases | color, spacing, radius, motion |
| Primitives | accessible generic interaction | button, input, select, dialog |
| Patterns | reusable composed UI with no domain ownership | section header, empty state, price display |
| Domain components | commerce behavior owned by a module | product card, variant picker, cart item |
| Sections | page composition using domain data | hero, featured collection, reviews |
| Routes | data loading, metadata and section assembly | homepage, category, product page |

## 23.3 Storefront shell

Recommended hierarchy:

~~~text
RootLayout
└── StorefrontShell
    ├── SkipLink
    ├── AnnouncementOrTrustBar
    ├── SiteHeader
    │   ├── Brand
    │   ├── PrimaryNavigation
    │   ├── SearchEntry
    │   ├── AccountEntry
    │   └── CartBadge
    ├── Main
    └── SiteFooter
~~~

The wireframe determines exact section presence and order.

## 23.4 Component rules

- Prefer composition over prop-heavy mega-components.
- Server Components own data loading and static composition.
- Client boundaries are placed as low as practical.
- Domain components live with their module.
- Shared components contain no store-specific business logic.
- A reusable component exposes semantic variants, not arbitrary style booleans.
- Loading/error/empty states are part of the component contract.
- Every component works in light/dark modes only if both modes remain approved.
- Avoid duplicating cards or buttons for a single page.

## 23.5 Product card contract

A product card may display:

- authoritative title;
- approved image/fallback and alt behavior;
- current price and compare-at price when valid;
- availability/merchandising badge from explicit rules;
- accessible link to product detail.

It must not independently calculate discounts, infer stock claims or fetch data per
card.

## 23.6 Recommended State and Migration

- Extend the existing primitives rather than installing a parallel UI kit.
- Add only primitives required by an approved design.
- Extract storefront shell during Homepage V2.
- Refactor ProductCard behind current data contracts.
- Keep checkout/auth/admin components unchanged until their phases.
- Add Storybook only if component volume and review workflow justify its maintenance;
  it is not a default requirement.

---

# 24. Design Token Strategy

## 24.1 Purpose

Tokens make the approved visual system consistent, themeable and inexpensive to
change. Components consume semantic tokens instead of embedding arbitrary brand values.

## 24.2 Token tiers

### Foundation tokens

- color palette;
- font families and weights;
- type scale and line heights;
- spacing scale;
- radius scale;
- shadow/elevation scale;
- blur levels;
- border widths;
- breakpoints;
- z-index layers;
- motion durations and easing.

### Semantic tokens

- background, surface and elevated surface;
- text primary, secondary and muted;
- border subtle/strong;
- action primary/secondary/destructive;
- focus ring;
- success, warning, danger and information;
- glass surface, glass border and glass shadow;
- price, discount and availability;
- overlay/scrim.

### Component tokens

Only when a component has a genuine stable need:

- button height/padding;
- input height/border;
- card radius/shadow;
- header height;
- container width/gutter.

## 24.3 Current State

Tailwind 4 and CSS variables already provide a theme/token foundation, including light
and dark behavior. The visual vocabulary is too small to guarantee a complete premium
system.

## 24.4 Recommended State

- CSS variables are the runtime semantic-token source.
- Tailwind utilities consume those variables.
- Raw palette values remain private to the theme definition.
- Semantic naming describes purpose, not a hue.
- Glass tokens define background opacity, border, blur and fallback.
- Contrast is verified for token combinations.
- Product imagery is not recolored by decorative filters.
- Brand tokens are approved in the Design System, not guessed during implementation.

## 24.5 Migration Strategy

1. Inventory existing variables and component values.
2. Approve palette, type, spacing, radius, elevation and glass recipes.
3. Add semantic aliases without breaking existing tokens.
4. Migrate only components touched by the active phase.
5. Remove obsolete values after all consumers move.
6. Prevent arbitrary one-off values through review/lint conventions where practical.

---

# 25. Animation Guidelines

## 25.1 Purpose

Motion explains hierarchy, continuity and response. It is not a substitute for product
imagery or a perpetual background effect.

## 25.2 Motion categories

| Category | Typical duration | Use |
|---|---:|---|
| Immediate feedback | 80–150 ms | press, focus-adjacent state, small indicator |
| Component transition | 150–250 ms | menu, drawer, filter, disclosure |
| Page/section reveal | 250–450 ms | restrained entry when it aids hierarchy |
| Decorative ambient | Exceptional | only if cheap, subtle and stoppable |

Exact values are approved in the Design System.

## 25.3 Rules

- Prefer transform and opacity.
- Use one coherent easing family.
- Do not animate layout height/position continuously.
- Avoid scroll hijacking.
- Avoid large continuous blur, fluid simulation or video by default.
- Do not delay a primary action for entrance animation.
- Product cards do not all animate with long cascades.
- Cart/form success feedback is immediate and announced accessibly.
- Skeletons match final geometry and do not create endless shimmer.

## 25.4 Reduced motion

When prefers-reduced-motion is set:

- remove parallax and large translation;
- make transitions instant or near-instant;
- stop ambient loops;
- preserve state change through non-motion cues.

## 25.5 Current State and Migration

Reduced-motion foundations exist. The project has no complete approved motion system.
Define it with design tokens, implement only the motions shown in approved wireframes
and measure their performance in the page phase.

---

# 26. Responsive Design Rules

## 26.1 Mobile-first model

Base styles target narrow touch devices. Larger breakpoints enhance layout without
changing the meaning or order of core content.

## 26.2 Content widths

- Use a shared page container with fluid gutters.
- Reading content has a narrower measure than product grids.
- Full-bleed media and hero treatments retain safe text padding.
- Very wide screens do not stretch line length or product cards without limit.

Exact values belong in the Design System.

## 26.3 Breakpoint behavior

Breakpoints respond to content pressure, not device brand names. Expected modes:

- compact/mobile;
- medium/tablet;
- wide/desktop;
- optional large desktop refinement.

No business logic depends on a client viewport query.

## 26.4 Grid rules

- Product grids adapt column count to available width and minimum card size.
- Cards preserve stable image ratio and comparable information alignment.
- Filters may move from sidebar to accessible drawer on compact layouts.
- Homepage sections define compact and wide compositions explicitly.
- Horizontal carousels require visible affordances, keyboard support and non-carousel
  fallback consideration.

## 26.5 Navigation rules

- Desktop primary navigation remains concise.
- Mobile menu has focus management, close behavior and scroll control.
- Search and cart remain high-priority at every width.
- Account and admin layouts provide a compact navigation alternative.

## 26.6 Commerce rules

- Variant options are touch-safe and do not require hover.
- Sticky buy controls may be used only if they do not hide content and reflect the
  selected valid variant.
- Cart and checkout totals remain visible near commitment.
- Tables become cards or horizontally scroll with clear context; information is not
  silently removed.

## 26.7 Testing matrix

At minimum verify:

- 320 CSS pixel width;
- 375/390 mobile;
- tablet portrait and landscape;
- 1280 desktop;
- wide desktop;
- 200% zoom and 400% reflow;
- keyboard and touch behavior;
- slow network/loading states.

---

# 27. Coding Standards

## 27.1 Language and naming

- TypeScript strict mode remains enabled.
- Avoid any; use unknown and narrow at boundaries.
- Files use kebab-case.
- React components use PascalCase.
- functions and variables use camelCase.
- database tables and columns use snake_case.
- constants use descriptive names; avoid unexplained magic values.

## 27.2 React/Next.js

- Server Components by default.
- use client only for browser state/events/effects.
- Keep client boundaries small.
- Use framework metadata and image/font facilities correctly.
- Route files coordinate reads and composition; business rules stay in services.
- Treat search params and external values as untrusted.
- Prefer recoverable validation for public URL state.

## 27.3 Domain code

- Zod validation happens at the boundary.
- Repositories contain Drizzle access.
- Services contain business rules and transactions.
- Actions contain transport, auth and safe result mapping.
- Money utilities are centralized and integer-only.
- State transitions are explicit.
- Idempotency is designed, not added after duplicate incidents.

## 27.4 Error handling

- Distinguish validation, authorization, conflict, unavailable and unexpected errors.
- Customer-visible messages are actionable and safe.
- Unexpected errors include correlation context in logs.
- Do not swallow audit, payment or inventory errors when they affect an invariant.
- External calls have timeouts and classified retry behavior.

## 27.5 Imports and boundaries

- Use configured path aliases.
- Respect app → modules → lib.
- Import modules through index.ts except documented client action/schema exceptions.
- Never import provider SDKs outside their adapter.
- Do not disable boundary lint to make an import pass.

## 27.6 Dependencies

- Reuse platform/stack capability first.
- A new dependency requires reason, maintenance assessment, bundle/security impact and
  approval.
- Pin deliberate compatibility versions.
- Review package and lockfile changes.

## 27.7 Comments and documentation

- Comments explain why, risk or non-obvious constraints.
- Do not narrate obvious code.
- Update the relevant architecture/operational document when a decision changes.
- Use an ADR for a material decision that changes boundaries, data model or provider.

## 27.8 Change discipline

- Make the smallest complete change.
- Do not regenerate unchanged files.
- Do not mix refactor, visual redesign and bug fix unless inseparable.
- Preserve user changes in a dirty worktree.
- Build, lint and test after each completed task.

---

# 28. Git Workflow

## 28.1 Branch model

- main is production/release-tracked and protected.
- Work occurs on short-lived focused branches.
- Current V2 foundation branch: feature/commerce-v2.
- Pull requests are preferred before production changes.
- Preview deployments use isolated test configuration.

Recommended branch patterns:

- feature/[scope]
- fix/[scope]
- hardening/[scope]
- docs/[scope]
- chore/[scope]

Examples:

- feature/homepage-v2
- hardening/payment-idempotency
- fix/inventory-double-release
- docs/master-development-guide

## 28.2 Commit conventions

Use Conventional Commit-style messages:

- feat(scope): ...
- fix(scope): ...
- docs(scope): ...
- test(scope): ...
- refactor(scope): ...
- perf(scope): ...
- chore(scope): ...

Commits are small, focused and buildable. A phase is committed only after its defined
scope is complete and reviewed, unless a deliberate checkpoint is requested.

## 28.3 Pull request requirements

A PR describes:

- goal and approved scope;
- affected modules/routes;
- screenshots for visual changes;
- tests and quality gates run;
- accessibility/performance/security implications;
- database migration and rollback, if any;
- known limitations;
- confirmation that unrelated files were not changed.

## 28.4 Review gates

- Architecture boundary review.
- Product/wireframe fidelity review.
- Security/invariant review for commerce changes.
- Responsive and accessibility review.
- Automated quality gates.
- Preview validation.
- Migration/rollback review.

## 28.5 Prohibited workflow

- Direct unreviewed production changes.
- Force-pushing shared protected branches.
- Combining unrelated phases in one PR.
- Committing secrets or production customer data.
- Using production payment credentials in preview.
- Applying unreviewed migrations through schema push.

---

# 29. Testing Strategy

## 29.1 Current State

Vitest unit testing exists with 51 passing tests across six files at audit time. Lint
and strict TypeScript pass. Playwright, transaction/service integration tests,
automated accessibility tests, Lighthouse enforcement and production-shaped database
testing are not in place.

## 29.2 Test layers

| Layer | Purpose | Examples |
|---|---|---|
| Static | fast structural correctness | TypeScript, ESLint, boundary rules |
| Unit | deterministic business/helper rules | money, validation, transition decisions |
| Component | interactive/accessibility behavior | variant picker, filters, dialogs |
| Integration | database transactions and module cooperation | checkout totals, stock, payment transition |
| End-to-end | critical user/operator journeys | browse to paid order, transfer verification |
| Non-functional | launch quality | axe, Lighthouse, load, security and restore |

## 29.3 Mandatory critical tests

### Commerce

- two concurrent buyers of the last unit;
- tampered price/discount/shipping ignored or rejected;
- duplicate order submission;
- stale cart price/stock handling;
- hold expiry idempotency;
- cancellation cannot restock twice;
- admin adjustment always writes a movement;
- variant update cannot affect another product.

### Payments

- forged callback rejected;
- provider validation timeout remains retryable;
- duplicate valid callback is a no-op;
- amount/currency mismatch rejected;
- one attempt's callback does not rewrite other attempts;
- manual verification is atomic;
- refund required is not refund completed;
- callback DB failure retries safely.

### Identity/privacy

- IDOR attempts for addresses/orders/sessions fail;
- guest order lookup requires both matching facts and rate limiting;
- admin without role or 2FA cannot access/mutate;
- session revocation works;
- export/deletion re-verification works;
- anonymization transaction cannot half-complete.

### Storefront

- search/filter/sort/pagination state;
- product/category not-found and empty states;
- responsive navigation and cart;
- keyboard product/variant/cart journeys;
- metadata/canonical/noindex behavior.

## 29.4 Test data

- Use deterministic factories and seeded, production-shaped data.
- Never copy real customer data into tests.
- Preview databases are isolated.
- Payment provider tests use sandbox or recorded safe fixtures; no secrets in fixtures.
- Time-dependent behavior uses controlled clocks.

## 29.5 CI gates

Minimum:

1. dependency install from lockfile;
2. lint;
3. strict typecheck;
4. unit tests;
5. integration tests for affected domains;
6. production build against approved preview data strategy;
7. selected Playwright/axe journeys;
8. dependency/security audit;
9. Lighthouse budgets for affected public pages.

## 29.6 Acceptance

A passing build is necessary but not sufficient. A phase passes only when:

- approved requirements are implemented and no extras added;
- tests cover its risks;
- manual visual/responsive review passes;
- accessibility checks pass;
- performance does not regress beyond budget;
- documentation matches behavior;
- the diff contains no unrelated changes.

## 29.7 Migration Strategy

1. Stabilize a Node 22 CI environment matching the project engine.
2. Add a local/preview database test harness.
3. Write regression tests for critical audit findings.
4. Introduce Playwright and axe for core journeys.
5. Add Lighthouse and bundle budgets.
6. Add load, backup/restore and synthetic checkout checks before launch.

---

# 30. Future Roadmap

This roadmap replaces autonomous interpretation of legacy phase names. Work receives
one explicitly approved phase/task at a time.

## Phase A — Foundation

### A1 Repository Audit

Status: complete and approved.

### A2 Software Architecture Specification

Status: this document.

Exit gate:

- all required architecture areas defined;
- current/recommended/migration distinctions present;
- Product Owner and Chief Software Architect approval.

### A3 Master Development Guide

Scope:

- repeatable development workflow;
- branch and commit rules;
- implementation rules;
- testing, review, security, performance, accessibility and release checklists;
- session prompts and handoff format.

### A4 Design System

Scope:

- approved brand direction;
- token values;
- typography, color, spacing, radius, elevation and glass recipes;
- primitive/pattern inventory;
- motion and responsive specifications;
- accessibility contrast evidence.

No commerce logic changes.

### A5 Homepage Wireframe

Scope:

- information hierarchy;
- section purpose and content contract;
- desktop/mobile behavior;
- loading/empty/error considerations;
- component reuse map;
- approved copy/data requirements.

## Phase B — Product Experience

### B1 Homepage V2

Implement only the approved homepage wireframe and required shared storefront shell.
Freeze checkout, auth and admin.

### B2 Product Listing V2

Improve categories, collection grids, filters, sort, pagination and recovery states
without changing catalog correctness rules.

### B3 Product Details V2

Improve gallery, product facts, variant selection, delivery/trust context and
merchandising hierarchy.

### B4 Search Experience

Improve full-text search UX, synonyms/spelling only when justified, filters and
zero-result recovery. Collect privacy-safe search-quality analytics before AI.

Phase B exit:

- approved visual fidelity;
- responsive and WCAG 2.2 AA checks;
- Core Web Vitals/bundle budgets;
- no changes to protected commerce modules unless separately approved.

## Phase C — Commerce Experience

### C1 Cart

Improve cart presentation and recovery while preserving server authority.

### C2 Checkout

Improve form and payment-method experience only after critical commerce regression
tests exist. Do not mix visual changes with payment-state fixes in the same review.

### C3 Customer Account

Unify storefront shell, order visibility and security usability without weakening
authorization.

Phase C exit:

- guest and signed-in journeys pass;
- totals/stock/payment invariants pass integration tests;
- accessibility and failure-path testing complete.

## Phase D — Hardening and Launch Gate

This phase is mandatory before commercial launch, even if visual phases are complete.
Critical fixes may be pulled earlier if the live system processes real orders.

### D1 Payment correctness

- callback retry/idempotency;
- attempt isolation;
- atomic transfer verification;
- accurate refund lifecycle.

### D2 Inventory correctness

- double-release protection;
- ledger-backed admin adjustments;
- variant ownership;
- bank-transfer expiry and reconciliation.

### D3 Dependency and platform security

- remediate high/moderate advisories;
- validate Node 22 release environment;
- review headers, Cloudflare and secrets.

### D4 Test and observability

- database integration tests;
- Playwright/axe;
- Lighthouse/bundle gates;
- error/web-vitals monitoring;
- outbox visibility and synthetic checks.

### D5 SEO, policies and operational readiness

- policy/contact pages;
- email domain;
- production payment verification;
- robots, sitemap, canonical and JSON-LD;
- backups, restore rehearsal and admin runbooks.

Phase D exit:

- no unresolved critical audit finding;
- all mandatory CI and manual gates pass;
- live payment and refund rehearsal complete;
- go-live checklist approved.

## Phase E — Trust and Growth

Potential independently approved capabilities:

- verified reviews with moderation;
- coupons/promotions with atomic limits;
- wishlist;
- recently viewed;
- evidence-based recommendations;
- responsible abandoned-cart communication.

Each requires its own data, abuse, consent, accessibility, measurement and rollback
design.

## Phase F — Evidence-Driven AI

Potential capabilities:

- hybrid search;
- human-reviewed product-content assistance;
- grounded customer support;
- merchandising insight.

Entry gate:

- measurable problem;
- evaluation set and deterministic baseline;
- approved privacy/cost/failure behavior;
- human-oversight plan;
- independent off switch.

## Roadmap sequencing rule

Architecture and experience design may precede hardening. Public commercial launch may
not. If the current site begins handling real money before Phase D, D1 and D2 become
immediate priority regardless of the visual roadmap.

---

# 31. Architecture Decision Summary

| Decision | Status | Reason |
|---|---|---|
| Modular monolith | Preserve | Lowest complexity consistent with current scale |
| Next.js App Router/RSC | Preserve | Strong server-first storefront model |
| Neon PostgreSQL + Drizzle | Preserve | Relational/transactional fit |
| Better Auth | Preserve | Existing mature identity foundation |
| Cloudinary abstraction | Preserve seam | Provider can change without module rewrites |
| Server Actions first | Preserve | First-party app needs no redundant REST layer |
| Integer poisha/BDT | Non-negotiable | Financial correctness |
| Order snapshots | Non-negotiable | Historical correctness |
| Conditional stock updates | Non-negotiable | Oversell protection |
| Postgres outbox | Recommended | Durable side effects without broker |
| Glass/liquid UI | Controlled | Brand distinction subject to contrast/performance |
| Full-text search first | Preserve | Appropriate scale and cost |
| AI last/evidence-driven | Preserve | Avoid cost and unreliable complexity |
| Microservices/message broker | Rejected | No justified need |
| Marketplace scope | Rejected | Different product and architecture |

---

# 32. Governance and Change Control

## 32.1 Roles

- **Product Owner** decides business scope, priority, claims, policies and acceptance.
- **Chief Software Architect & UX Director** defines architecture, experience,
  standards and phase specifications.
- **Implementation Engineer (Work)** implements only the approved task, reports
  evidence and does not make product decisions.

## 32.2 Architecture change process

A proposed change to stack, module ownership, database invariants, payment/inventory
state, route identity or external provider requires:

1. problem statement and evidence;
2. options and trade-offs;
3. security/performance/cost/operations impact;
4. migration and rollback plan;
5. Architecture Decision Record;
6. approval before implementation.

## 32.3 Definition of architectural completion

An architecture phase is complete when:

- the specification is internally consistent;
- current behavior is not misrepresented;
- recommendations have migration paths;
- non-goals and protected modules are explicit;
- risks and launch blockers are visible;
- implementation tasks can be bounded without re-deriving the architecture.

---

# Appendix A — Protected Invariants

These remain binding in every phase:

1. Money is integer minor units with currency.
2. Client-supplied prices/totals/discounts are never trusted.
3. Order items and addresses are purchase-time snapshots.
4. Stock decrements are conditional and transactional.
5. Payment callbacks are independently verified and idempotent.
6. User data is session-owner scoped in the query.
7. Server Action input is validated.
8. Successful admin mutations are audited.
9. Admin access requires role and second factor.
10. Public abuse targets are persistently rate-limited.
11. Payment attempts are not collapsed.
12. Inventory changes remain explainable.
13. Cancellation does not imply completed refund.
14. AI cannot enter authoritative money, payment, inventory or order transitions.

# Appendix B — Protected Areas During Storefront V2

Unless a separate hardening task is approved, Homepage/Product Experience work must not
modify:

- authentication/session guards;
- account ownership logic;
- cart ownership;
- checkout/order placement transactions;
- SSLCommerz adapters or callbacks;
- bank-transfer verification;
- order/payment/refund states;
- stock reservation/release;
- shipping calculations;
- admin operations;
- database schemas/migrations;
- money utilities;
- storage provider abstraction.

# Appendix C — Terminology

| Term | Meaning |
|---|---|
| Action | First-party mutation through a Next.js Server Action |
| Attempt | One payment try, preserved independently |
| Domain event | A committed business fact used for side effects |
| Hold | Inventory allocated to a pending order for a bounded period |
| Idempotent | Repeating the same command/event has no additional effect |
| Minor unit | Poisha; one hundredth of one BDT |
| Module | Cohesive domain boundary inside the modular monolith |
| Outbox | PostgreSQL table that durably queues post-commit side effects |
| Projection | Current stock value derived/maintained from inventory changes |
| RSC | React Server Component |
| SAS | Software Architecture Specification |
| Snapshot | Purchase-time copy that must not change with live catalog data |

# Appendix D — Implementation Session Contract

Every future Work session should receive:

- the exact current phase and bounded task;
- approved specification/wireframe references;
- protected modules;
- acceptance criteria;
- required tests and quality gates;
- commit/push instructions.

Work must:

1. inspect the relevant current code and documentation;
2. describe any conflict before implementation;
3. reuse existing components and architecture;
4. modify only required files;
5. build, lint and test after each completed task;
6. stop when the approved scope is complete;
7. report changed files, tests, risks and unresolved blockers;
8. avoid product or architecture decisions not explicitly delegated.

---

End of Software Architecture Specification.
