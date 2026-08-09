# SirajiBD Content Guide

| Field | Value |
|---|---|
| Document | Content Guide |
| Public brand | SirajiBD |
| Platform identity | AgentSiraji Commerce V2 — internal/portfolio use only |
| Version | 0.11 |
| Status | Partially approved — remaining release gates documented |
| Date | 2026-08-09 |
| Owner | Product Owner |
| Applies to | Storefront, product/category content, lifecycle messages, support, SEO, social content and future AI surfaces |
| Does not authorize | New features, policies, offers, claims, channels, data sources or legal terms |

## Version History

| Version | Date | Author/owner | Summary |
|---|---|---|---|
| 0.11 | 2026-08-09 | Product Owner with Work documentation support | Product Owner explicitly ratified the complete strategic foundation: public and platform identities, positioning, primary audience, brand personality, Homepage purpose and primary action, in addition to the previously approved Vision, Mission, Promise, Hero and launch-language policy. The document remains partially approved because operational, legal, SEO and Brand Story gates are unresolved. |
| 0.10 | 2026-08-09 | Product Owner with Work documentation support | Product Owner approved the Brand Vision, Brand Mission, Brand Promise, complete Homepage Hero copy set and English-first launch language strategy. Brand Story, homepage SEO copy and operational/legal gates remain unresolved. |
| 0.9 | 2026-08-09 | Product Owner with Work documentation support | First strategic draft based on the approved public name, launch audience, homepage action, DDS and homepage wireframes. Final customer-facing copy remains subject to Product Owner approval. |

## How to Use This Guide

This document is the single content authority for SirajiBD. It defines what the
brand means, how it speaks, what it may claim and how customer-facing copy is
approved. It complements, and does not replace, the Repository Audit, Software
Architecture Specification, Master Development Guide, Design Design System,
responsive wireframes and Component Library.

The following labels are normative:

| Status | Meaning | May ship? |
|---|---|---:|
| **Approved** | Explicitly selected by the Product Owner or already established by an authoritative project source | Yes, subject to live-data and route checks |
| **Draft — owner approval required** | Recommended wording derived from approved strategy | No |
| **Missing** | A required business fact, policy, route or asset has not been supplied | No |
| **Conditionally rendered** | Copy may appear only when an authoritative system confirms the underlying fact | Only when the condition is true |
| **Gated** | A feature, data source, consent process or policy must be approved and implemented first | No, until the gate passes |
| **Not applicable for Homepage V2** | Valid future content outside the current implementation scope | No |

### Authority order

When sources conflict, apply this order:

1. Applicable law and approved legal/policy text.
2. Authoritative commerce data and enabled production configuration.
3. Product Owner-approved business facts and offers.
4. This Content Guide.
5. Page wireframes and component contracts.
6. Task prompts and implementation choices.

No copy may override price, inventory, delivery, payment, order, refund or product
truth returned by the owning system.

### Approved strategic foundation

| Decision | Approved value |
|---|---|
| Public store name | **SirajiBD** |
| Platform/portfolio name | **AgentSiraji Commerce V2**; not shown as the main customer brand |
| Launch positioning | **Smart, trustworthy everyday shopping for Bangladesh** |
| Primary launch customer | **Young professionals** |
| Brand personality | **Modern, honest, intelligent, reliable and friendly** |
| Homepage primary action | **Browse categories** |
| Homepage job | Help customers quickly enter the right shopping path |
| Visual/content principle | Clear intelligence in service of confident buying |

---

# 1. Brand Identity

## 1.1 Public identity

**Approved — Product Owner, 2026-08-09**

The public-facing store is **SirajiBD**. Use this exact capitalization in headings,
navigation, metadata, email signatures and customer support. Do not write `Siraji BD`,
`SirajiBd`, `SIRAJIBD` or `MyCommerce` as the final brand unless a constrained technical
identifier requires a different form.

## 1.2 Platform relationship

**Approved — Product Owner, 2026-08-09**

AgentSiraji Commerce V2 describes the technology/platform and portfolio project. It is
not the store name and must not compete with SirajiBD in the customer journey. A future
approved colophon may say “Technology by AgentSiraji,” but Homepage V2 does not require
or authorize it.

## 1.3 Brand descriptor

**Approved — Product Owner, 2026-08-09:** Smart, trustworthy everyday shopping for
Bangladesh.

This is a positioning descriptor, not a mandatory tagline on every surface. It must not
be used to imply that recommendations are AI-generated or that every product is
independently certified.

---

# 2. Brand Vision

**Approved — Product Owner, 2026-08-09**

> To become a trusted modern shopping destination where people across Bangladesh can
> discover useful products with clarity and confidence.

The vision is aspirational. Do not rewrite it as “Bangladesh’s most trusted store,”
“number one,” “largest” or another unverified market-leadership claim.

---

# 3. Brand Mission

**Approved — Product Owner, 2026-08-09**

> SirajiBD helps busy people discover practical products quickly through clear
> information, honest presentation and a simple path from browsing to order tracking.

The mission focuses on the customer problem. It does not claim exclusive products,
lowest prices, instant delivery or AI capabilities.

---

# 4. Brand Promise

**Approved — Product Owner, 2026-08-09**

> Clear choices. Honest information. A shopping journey you can understand.

Operational interpretation:

- show the real price and applicable terms;
- distinguish confirmed facts from promotional language;
- make delivery and payment information visible when authoritative;
- explain what happens after an action;
- preserve a clear order-tracking and recovery path;
- correct inaccurate content instead of defending it.

This promise is about communication and behavior. It is not a guarantee that every
delivery, payment or product experience will be error-free.

---

# 5. Core Values

| Value | Content behavior | Prohibited behavior |
|---|---|---|
| Clarity | Lead with the fact or next action | Hiding conditions in fine print |
| Honesty | Use evidence before claims | Fake reviews, rankings, scarcity or guarantees |
| Usefulness | Explain what helps a decision | Decorative copy that delays discovery |
| Respect | Protect time, attention and personal data | Pressure, blame, spam or unnecessary data requests |
| Reliability | Keep labels, policies and status language consistent | Contradictory messages across channels |
| Progress | Improve through verified learning | Calling novelty “AI” without customer value |

---

# 6. Target Customers

## 6.1 Primary launch audience

**Approved — Product Owner, 2026-08-09:** Young professionals in Bangladesh.

Content should serve people who are time-conscious, digitally comfortable and expect a
modern mobile experience but still need familiar commerce controls and clear local
payment, delivery and recovery information.

## 6.2 Audience needs

- enter a relevant category quickly;
- scan products without dense promotional noise;
- understand price, availability and variants;
- see delivery/payment facts only when verified;
- complete key tasks on a mobile device and mixed-quality network;
- track or recover an order without unnecessary support contact;
- trust the store without fabricated badges or pressure tactics.

## 6.3 Audience boundaries

The platform may serve other customers, but launch messaging must not dilute itself into
“everything for everyone.” Do not add student-, family-, fashion- or gadget-specific
positioning until assortment and customer evidence justify it.

---

# 7. Customer Personas

Personas are decision tools, not invented testimonials or demographic facts.

## 7.1 Primary working persona — The Time-Conscious Professional

**Status:** Draft research persona; validate after launch.

| Dimension | Working definition |
|---|---|
| Context | Balances work and personal responsibilities; often shops in short sessions |
| Primary need | Find a useful product quickly and understand the buying conditions |
| Friction | Noisy pages, vague prices, unclear delivery, hidden terms, unreliable status |
| Trust signal | Specific product facts, readable total, enabled payment methods, order recovery |
| Preferred path | Homepage → category → product → cart/checkout |
| Content response | Short hierarchy, plain labels, proof before claims, obvious next action |

## 7.2 Returning customer scenario

**Status:** Approved behavioral scenario, not a separate demographic persona.

A returning customer should be able to search, revisit categories, check the cart,
access the account or track an order without rereading brand material.

## 7.3 Research requirement

Validate real customer language through search terms, support questions, purchase
patterns and consented interviews. Do not publish fictional names, quotes, ages, jobs or
income levels as if research has occurred.

---

# 8. Positioning Statement

**Approved strategic position; wording draft for internal use:**

> For young professionals in Bangladesh who want useful products without a confusing
> shopping experience, SirajiBD is a modern everyday store that makes discovery and
> buying clearer through honest information, familiar commerce patterns and direct
> recovery paths.

This statement guides internal decisions. It is not required as customer-facing copy.

---

# 9. Unique Selling Proposition

## 9.1 Approved direction

SirajiBD differentiates through **clarity, modern product discovery and truth-controlled
commerce content**.

## 9.2 Customer-facing draft

**Draft — owner approval required:**

> Useful products. Clear choices. Shopping built for modern Bangladesh.

## 9.3 Constraint

Do not claim exclusivity, lowest price, fastest delivery, largest selection, guaranteed
quality or AI personalization until separately evidenced and approved. A disciplined
experience can be distinctive without a superlative.

---

# 10. Value Proposition

| Customer need | SirajiBD value | Required proof/system |
|---|---|---|
| Fast discovery | Category-first navigation and search | Published categories and working routes |
| Confident evaluation | Clear product, price, variant and availability information | Authoritative catalog/inventory data |
| Predictable checkout | Visible enabled delivery/payment choices and totals | Shipping/payment configuration |
| Recovery | Account/order lookup and tracking path | Working routes and order data |
| Modern experience | Responsive, accessible and focused presentation | DDS and Design QA acceptance |

**Draft short value proposition:**

> Browse useful products, understand the details and move from discovery to order with
> less uncertainty.

---

# 11. Tone of Voice

## 11.1 Voice attributes

**Approved — Product Owner, 2026-08-09:** Modern, honest, intelligent, reliable and
friendly.

| Attribute | Sounds like | Does not sound like |
|---|---|---|
| Modern | Direct, calm and digitally fluent | Trend-chasing slang |
| Honest | Specific about facts and limits | Overconfident or evasive |
| Intelligent | Anticipates the next useful question | Technical, robotic or patronizing |
| Reliable | Consistent labels and next steps | Vague reassurance |
| Friendly | Human, respectful and helpful | Forced humor or excessive enthusiasm |

## 11.2 Tone by context

| Context | Tone |
|---|---|
| Discovery | Clear, energetic and concise |
| Product evaluation | Factual and structured |
| Checkout/payment | Calm, exact and reassuring without guarantees |
| Success | Warm and explicit about what happens next |
| Error | Direct, non-blaming and recovery-focused |
| Delay/uncertainty | Transparent about what is known and what the customer can do |
| Legal/policy | Plain, complete and neutral |
| Social media | Helpful, relevant and conversational |

---

# 12. Writing Style Rules

1. Lead with the customer’s task, fact or outcome.
2. Use short sentences and familiar words.
3. Prefer active voice: “Track your order,” not “Order tracking can be accessed.”
4. Use sentence case for headings, labels and buttons.
5. Use one dominant action per decision region.
6. Name the destination: “Browse categories,” not “Explore now.”
7. Put conditions beside the claim, not in a distant footnote.
8. Use `you` where helpful; avoid repeated `we` statements.
9. Use numerals for prices, quantities, dates and delivery windows.
10. Format money through the approved BDT formatter; never hand-format conflicting
    decimals or separators.
11. Avoid exclamation marks in operational messages. Marketing copy normally uses no
    more than one.
12. Avoid all caps except short established abbreviations.
13. Do not use emojis in core UI, checkout, error, legal or transactional copy.
14. Never expose internal enums, database names, provider errors or developer language.
15. Do not use “click” when the action may be tapped, submitted by keyboard or spoken.

### Preferred vocabulary

| Prefer | Avoid |
|---|---|
| Browse categories | Shop now everywhere |
| Search products | Discover magic |
| Delivery | Logistics solution |
| Your cart | Shopping basket/cart interchangeably |
| Order confirmed | Successful order placed successfully |
| Try again | Oops! |
| View your order | Check it out |
| Currently unavailable | Sold out forever / gone! |

---

# 13. Bengali vs English Rules

## 13.1 Launch rule

**Approved — Product Owner, 2026-08-09:** English is the primary launch interface,
matching the current repository and approved DDS. A future Bengali release must be a
complete localization; the system must remain ready for it.

## 13.2 Mixed-language rule

- Do not mix Bangla and English within one core instruction merely to sound modern.
- Product/brand names and established payment names remain in their official form.
- Social content may use natural Bangla, English or a deliberate bilingual format when
  a campaign brief approves it.
- Do not transliterate Bangla into Latin characters for permanent UI labels.
- Never place essential translated text inside an image.

## 13.3 Future Bengali localization

A Bengali release requires an approved font, translation ownership, glossary, number
and address policy, layout stress testing, accessibility QA and complete route coverage.
Do not ship isolated Bengali buttons within an otherwise English transaction flow.

---

# 14. Homepage Messaging

## 14.1 Message hierarchy

1. SirajiBD is a clear, modern shopping destination for Bangladesh.
2. The fastest first action is to browse a relevant category.
3. Product and commerce facts provide confidence.
4. Optional promotions, social proof and retention content appear only after their
   gates pass.

## 14.2 Required homepage content states

| Section | Content status |
|---|---|
| Header and search | Approved structure; final labels in this guide |
| Announcement bar | Conditionally rendered from verified facts only |
| Hero | Approved copy below; destination and live-data checks still apply |
| Featured categories | Data-driven; category names/descriptions require catalog approval |
| Best sellers | Gated by authoritative ranking definition and window |
| New arrivals | Data-driven by published product date/order |
| Promotional banner | Gated by approved active campaign and terms |
| Trust/why buy | Conditionally rendered from verified operational facts |
| Reviews | Gated by real moderated review source and consented attribution |
| Brand story | Draft copy; owner approval required |
| Newsletter | Gated by backend, consent, privacy and success/error behavior |
| Footer | Approved labels plus only live routes and configured facts |

---

# 15. Hero Content

## 15.1 Approved Homepage V2 copy

**Status: Approved — Product Owner, 2026-08-09**

| Element | Copy |
|---|---|
| Eyebrow | Optional; omit for initial release |
| H1 | **Smarter everyday shopping for modern life in Bangladesh.** |
| Support copy | Browse practical products with clear prices and a simple shopping experience built for Bangladesh. |
| Primary CTA | **Browse categories** |
| Secondary CTA | **Search products** |
| Trust cue | Omit unless one concise verified delivery/payment fact is available |

## 15.2 Hero rules

- Keep the H1 between 6 and 12 words where possible.
- Use one to three short support sentences; the recommended copy uses one.
- Keep at most two actions and make Browse categories dominant.
- Do not say “AI-powered,” “best products,” “premium quality,” “lowest price,” “fastest
  delivery” or “secure payment” without approved evidence and defined meaning.
- Do not bake hero text into media.
- The CTA must resolve to an existing category-discovery destination.

---

# 16. Homepage Section Copy

All copy below is **Draft — owner approval required** unless marked data-driven.

| Section | Heading | Supporting copy / rule | Empty/omission rule |
|---|---|---|---|
| Featured categories | Browse by category | Find the right place to start. | If no approved categories exist, omit; do not show placeholders. |
| Best sellers | Popular right now | Use only with an approved ranking window; optional subcopy must disclose context where needed. | Omit until the ranking gate passes. |
| New arrivals | New arrivals | Recently published products from SirajiBD. | Show the page-level catalog recovery state if no products exist. |
| Promotional banner | Campaign-defined | Every headline, price, date and term comes from an approved active campaign. | Omit when missing, expired or invalid. |
| Why buy from us | Shopping with more clarity | Show only distinct verified facts that add information beyond the trust bar. | Omit unsupported items. |
| Reviews | What customers say | Real moderated reviews only. | Omit the entire section until the review gate passes. |
| Brand story | Built for clearer everyday shopping | SirajiBD is designed to help busy people find useful products without unnecessary noise. We focus on straightforward information, familiar shopping patterns and a clear next step. | Omit until copy is approved; never invent company history. |
| Newsletter | Useful updates, when they matter | Get approved product and store updates. Consent and frequency language must be explicit. | Omit until backend/privacy/consent gates pass. |

### Header labels

| Purpose | Approved label |
|---|---|
| Search field | Search products |
| Account | Account |
| Cart | Cart |
| Mobile menu | Menu |
| Category navigation | Use the approved catalog category name |

### Footer draft

| Element | Copy/status |
|---|---|
| Brand line | **Draft:** Clearer everyday shopping for Bangladesh. |
| Shop group | Shop |
| Order group | Orders |
| Account group | Account |
| Order recovery | Track your order |
| Search | Search products |
| Copyright | © SirajiBD |
| Payment line | Conditionally assembled from enabled, verified payment methods only |

---

# 17. CTA Library

## 17.1 Approved core actions

| Intent | Primary copy | Alternative allowed copy |
|---|---|---|
| Enter catalog | Browse categories | View categories |
| Search | Search products | View all results |
| Product detail | View product | — |
| Add item | Add to cart | Select options, when required first |
| View cart | View cart | Go to cart |
| Checkout | Continue to checkout | — |
| Order | Place order / Continue to payment | Use the label matching the actual next step |
| Order recovery | Track your order | View your order |
| Retry | Try again | Retry payment only when safe and outcome is known |
| Back to catalog | Continue shopping | Browse the store |

## 17.2 CTA rules

- Begin with a verb.
- Describe the immediate result, not the eventual business goal.
- Never use a false action such as “Buy now” when variants or checkout steps remain.
- Never change a button label to create urgency.
- Pending labels preserve meaning: `Adding…`, `Submitting…`, `Checking…`.
- Destructive actions name the consequence: `Cancel order`, not `Confirm`.

---

# 18. Product Copy Rules

## 18.1 Product title

Use the customer-recognizable product name. Add only attributes that distinguish the
item or variant. Do not keyword-stuff brand, category, size and benefits into one title.

Recommended pattern:

`[Brand, when real] + [Product name] + [Distinguishing attribute]`

## 18.2 Product description hierarchy

1. One-sentence factual summary.
2. Key features tied to observable or supplied facts.
3. Specifications/materials/dimensions.
4. Usage and care instructions from authoritative source.
5. Package contents.
6. Safety, warranty or compatibility information when applicable.

## 18.3 Claims

- Attribute claims require supplier/manufacturer evidence.
- Performance, health, environmental, safety and durability claims require specific
  substantiation and approval.
- Do not convert subjective supplier adjectives into facts.
- Never use AI to infer composition, compatibility, country of origin or usage.
- Price and discount copy comes from authoritative commerce data, not rich text.
- Stock and variant availability come from inventory, not product description.

## 18.4 Product status copy

| State | Preferred copy |
|---|---|
| Available | In stock, only when authoritative |
| Temporarily unavailable | Currently unavailable |
| Variant required | Choose [attribute] |
| Low stock | Show only if approved threshold and authoritative count support it |
| Missing details | Omit the field or flag for content completion; do not guess |

---

# 19. Category Copy Rules

- Category names are short, stable customer terms.
- A category description explains the contents, not the store’s ambition.
- Use one unique H1 per category page.
- Avoid overlapping categories created only for SEO.
- Do not place unverified promotions in category descriptions.
- Filters and breadcrumbs reuse the authoritative category/attribute vocabulary.
- Empty category copy offers a real recovery path; it does not imply stock is coming
  unless a publication plan confirms it.

**Draft category intro pattern:**

> Browse [category] for [clear use/context]. Compare the available options and choose
> the details that fit your needs.

Every filled placeholder requires category-owner approval.

---

# 20. Trust Messaging

## 20.1 Truth rule

Trust is earned by verifiable behavior. Never create “Trusted,” “Verified,” “100%
secure,” “Guaranteed,” “Authentic” or accreditation badges as decoration.

## 20.2 Allowed trust sources

| Fact | Source required |
|---|---|
| Delivery coverage/window | Active shipping configuration |
| Free-delivery threshold | Active eligible shipping rates and conditions |
| Payment methods | Enabled production payment configuration |
| Order tracking | Working order lookup/account routes |
| Return/refund rights | Approved published policy |
| Review/rating | Moderated, consented and attributable review system |
| Product authenticity | Documented supplier/product evidence and approved process |

## 20.3 Approved structural copy

- `Delivery in [configured range] days` — conditionally rendered.
- `Free delivery over [configured amount]` — conditionally rendered with applicable
  terms.
- `Track your order` — permitted while the route works.
- Payment method names — conditionally rendered from enabled configuration.

---

# 21. Shipping Messaging

- Use **delivery** in normal customer UI; use **shipping** for policy/industry context
  where clearer.
- Never hard-code a nationwide promise, charge, threshold or delivery window.
- Present ranges as ranges, not an average disguised as certainty.
- State when cost is calculated at checkout.
- A district not covered by an active rate receives a direct recovery message.
- Courier names and tracking numbers appear only when assigned.

| Context | Approved pattern |
|---|---|
| Summary | Delivery in `[min–max]` days |
| Threshold | Free delivery over `[amount]` |
| Cart | Delivery charge calculated at checkout |
| No rate | No delivery option covers that district yet. |
| Awaiting district | Choose a district to see delivery options. |

Any claim such as “same day,” “24-hour,” “nationwide,” “guaranteed” or “free delivery”
without conditions is prohibited unless an approved live rule makes it true.

---

# 22. Payment Messaging

## 22.1 Current supported architecture

The repository currently contains SSLCommerz gateway payment and manual bank transfer
paths. The gateway may expose card, bKash, Nagad, Rocket and internet banking when the
production merchant configuration supports them.

## 22.2 Publication rule

- Show only methods enabled and tested in production.
- Do not advertise COD; it is not authorized by the current SirajiBD specification.
- Do not describe a payment as successful until the authoritative payment state confirms
  it.
- Distinguish pending, failed, cancelled, awaiting verification, paid and refunded.
- Do not tell customers to retry blindly when the outcome is unknown.
- Manual transfer instructions and accounts must come from secure configuration, never
  this document or an image.

## 22.3 Approved patterns

| Context | Copy pattern |
|---|---|
| Gateway option | Card, bKash, Nagad or Rocket — only when enabled |
| Transfer option | Bank transfer |
| Redirect | You’ll continue to the payment provider to complete payment. |
| Unavailable | Online payment is unavailable right now. Choose another available method or try again later. |
| Verification | We received your transfer details and will update the order after verification. |

Do not use “100% secure.” Describe the actual flow or provider instead.

---

# 23. Return & Refund Messaging

**Status: Missing — blocks public return/refund promises and policy links.**

The existing transactional email mentions contacting the store within seven days, but
that sentence is not a complete approved return policy. Before publication, the Product
Owner must approve at minimum:

- eligibility by product/category and condition;
- reporting window and evidence requirements;
- exclusions;
- return delivery responsibility/cost;
- replacement versus refund choice;
- inspection and approval process;
- refund method and expected timeline;
- cancellation rules;
- damaged, wrong and missing-item process;
- contact channel and operating hours;
- legally required consumer rights.

Until then:

- do not claim “easy returns,” “hassle-free returns,” “money-back guarantee” or a fixed
  refund time;
- do not add a Returns link that leads to a missing page;
- transactional messages may report the actual order/refund state without inventing a
  general policy;
- obtain appropriate Bangladesh legal review before launch.

---

# 24. SEO Rules

1. Write for the customer’s task first.
2. Give every indexable page one descriptive H1.
3. Keep visible copy and metadata consistent.
4. Use canonical URLs and valid crawl/index rules determined by implementation.
5. Avoid keyword lists, hidden text and repeated city/category doorway pages.
6. Product structured data must match visible price, currency, availability and product
   identity.
7. Do not add review, rating or offer schema without valid authoritative data.
8. Do not claim “official,” “best,” “cheapest” or “authentic” in metadata without proof.
9. Alt text describes the image; it is not a keyword container.
10. Preview/staging remains `noindex` until production launch approval.

---

# 25. Meta Title Rules

- Target a concise, unique title that normally fits around 50–60 characters; meaning is
  more important than a rigid count.
- Put the page/topic first and SirajiBD last where useful.
- Do not repeat the same keyword.
- Do not add promotional punctuation or unverified superlatives.

**Homepage draft — owner approval required:**

> SirajiBD | Smarter Everyday Shopping in Bangladesh

**Template patterns:**

- `[Category] | SirajiBD`
- `[Product name] | SirajiBD`
- `Search results for “[safe query]” | SirajiBD`

---

# 26. Meta Description Rules

- Describe the real page and customer value in one or two natural sentences.
- Aim for roughly 140–160 characters without cutting essential meaning.
- Do not promise delivery, discounts or product breadth not visible on the page.
- Each important indexable page receives unique copy.

**Homepage draft — owner approval required:**

> Browse practical everyday products through a clear, modern shopping experience built
> for customers across Bangladesh.

Final length and rendering must be checked after approval.

---

# 27. Image Copy Rules

## 27.1 Alt text

- Describe meaningful visible content and relevant product identity.
- Include variant/color only when visible and useful.
- Use empty alt text for purely decorative images.
- Do not begin with “Image of” or “Picture of.”
- Do not add price, promotion or stock information to alt text.
- Do not infer material, usage, person identity or product effect.

## 27.2 Text on images

- Essential H1, price, terms, CTA and product facts remain HTML text.
- Approved campaign art may contain decorative copy only when an equivalent accessible
  text treatment exists and responsive crops do not remove meaning.
- Media Guide owns filenames, crops, ratios, priority and approved asset-specific alt
  text.

---

# 28. Promotional Copy Rules

**Status: Gated by an approved active campaign.**

Every promotion requires:

- promotion/campaign ID and owner;
- exact eligible products/customers;
- benefit and calculation source;
- start and end date/time with timezone;
- exclusions and stacking rules;
- stock/quantity limitations when real;
- destination route;
- customer-visible terms;
- expiry/failure behavior;
- approval record.

Do not use countdowns, “ending soon,” “only X left,” crossed-out prices, percentage
savings, “free,” “exclusive” or urgency language unless authoritative rules make every
part true. Expired or incomplete promotion content returns `null` and leaves no gap.

---

# 29. Review & Testimonial Rules

**Status: Gated. Homepage V2 must omit the section until the gate passes.**

Required gate:

- real review source and schema;
- moderation/publication policy;
- consented attribution;
- provenance and product relationship;
- privacy-safe display;
- correction/removal process;
- accessible component behavior;
- structured-data eligibility review.

Rules:

- Never author a customer review on behalf of a customer.
- Never turn brand copy, support praise or private messages into a review without
  explicit permission and context.
- Never hide negative reviews only to protect the score; moderation must follow the
  approved policy.
- Never fabricate names, avatars, ratings, “verified purchase” or review counts.
- Paid/incentivized testimonials require clear disclosure and legal review.

---

# 30. AI Assistant Language Rules

**Status: Future — not applicable for Homepage V2.**

If an AI assistant is later approved:

- identify it as AI where customer expectations could be affected;
- distinguish generated guidance from authoritative product/order facts;
- state uncertainty and source/provenance where relevant;
- never claim to complete payment, approve refund, reserve stock or change an order
  without a deterministic authorized workflow;
- never invent product specifications, medical/safety advice, availability or policy;
- provide a non-AI path for core commerce tasks;
- avoid pretending to be a human employee;
- use concise, locally understandable language;
- request no passwords, payment credentials or unnecessary personal data;
- offer human support when the approved escalation path exists.

Suggested boundary copy is a future product decision, not approved here.

---

# 31. Error Message Style

## 31.1 Pattern

`What happened` + `what remains safe/known` + `exact recovery action`.

## 31.2 Examples

| Situation | Preferred copy |
|---|---|
| Product load | We couldn’t load these products. Try again, or browse another category. |
| Search empty | No products matched “[safe query].” Check the spelling or browse categories. |
| Cart conflict | This item changed while you were shopping. Review the updated cart before continuing. |
| Payment unavailable | Online payment is unavailable right now. Choose another available method or try again later. |
| Order lookup | Check the order number and email address. |
| Rate limit | Too many attempts. Try again in `[time]`. |

## 31.3 Rules

- Do not use “Oops,” jokes, blame or technical detail.
- Never expose stack traces, SQL, provider internals or secrets.
- Financial copy must not imply failure when the result is unknown.
- Preserve safe user input and explain whether an action completed.
- Provide a valid alternative when retry is not appropriate.

---

# 32. Empty State Copy

| Context | Heading | Recovery |
|---|---|---|
| Empty catalog, customer-facing | No products are available yet. | Browse categories only if populated; otherwise provide a configured contact/retry path. |
| Empty category | No products in this category yet. | Browse other categories. |
| Empty cart | Your cart is empty. | Browse categories. |
| No orders | No orders yet. | Browse categories. |
| No search results | No products matched your search. | Check the spelling or browse categories. |

Rules:

- Customer-facing states never link to admin routes.
- Do not promise future stock or publication without a confirmed plan.
- Do not repeat large empty cards across every optional homepage section; omit optional
  sections instead.
- Keep recovery actions specific and real.

---

# 33. Email Copy Style

- Lead with the order/account event in the subject and heading.
- Include identifiers required to recognize the event, but minimize personal data.
- State what happened, what happens next and the safe action.
- Escape all customer/admin-generated values.
- Do not fail an order solely because a best-effort email failed.
- Never ask for passwords or full payment credentials by email.
- Use SirajiBD as the signature after brand migration.
- Give promotional email a separate consent/unsubscribe system; transactional consent
  does not authorize marketing.

### Transactional subject patterns

- `Order [number] confirmed`
- `Order [number] is on its way`
- `Order [number] delivered`
- `Order [number] cancelled`
- `Payment update for order [number]`

The exact status must come from authoritative order/payment state.

---

# 34. SMS/WhatsApp Style

**Status: Style defined; channel capability and consent are not authorized by this
document.**

- Begin with `SirajiBD:` when sender identity is not otherwise clear.
- Put the event and safe action in the first lines.
- Keep messages concise; link only to approved SirajiBD domains.
- Include the order number when needed, not unnecessary customer details.
- Never request OTP, password, PIN or full card/mobile-wallet credentials.
- Separate transactional notifications from promotional consent.
- Respect opt-out, frequency, quiet-hour and applicable legal/provider requirements.
- Use Bangla or English according to an approved customer preference/localization rule;
  do not create inconsistent hybrid templates.

**Draft transactional pattern:**

> SirajiBD: Order [number] is confirmed. View the latest status: [approved link]

No sending integration is approved by this copy pattern.

---

# 35. Social Media Voice

- Be useful before promotional.
- Use natural audience language without forcing youth slang.
- Show the real product and real conditions.
- Keep campaign claims consistent with product pages and checkout.
- State price, offer period, eligibility and delivery/payment conditions where relevant.
- Do not manufacture comments, screenshots, scarcity or customer stories.
- Do not present a generated image as real product evidence.
- Respond calmly to complaints; move personal/order details to an approved private
  channel.
- Do not delete criticism merely because it is negative; follow moderation policy.

### Social post structure

1. One customer-relevant hook.
2. One clear product/use truth.
3. Essential offer/condition facts, if approved.
4. One action.
5. Relevant, restrained tags.

---

# 36. Legal Content Rules

**Status: Missing legal/policy package. Requires appropriate Bangladesh legal review.**

Before production launch, approve and publish applicable:

- seller/company identity and contact details;
- terms of sale/use;
- privacy notice and cookie/analytics disclosures;
- shipping/delivery policy;
- cancellation, return, replacement and refund policy;
- payment terms;
- warranty/product-specific terms;
- marketing consent and unsubscribe rules;
- review/testimonial policy;
- accessibility/contact route;
- legally required notices.

Rules:

- Plain language summaries may aid understanding but never replace binding policy text.
- Copy must not waive mandatory consumer rights.
- Do not paste another store’s legal text or generate final legal terms without review.
- Legal links appear only when the routes exist and content is approved.
- Policy versions and effective dates require an audit trail.

---

# 37. Prohibited Claims

Unless separately evidenced, scoped and approved, never publish:

- Bangladesh’s number one, best, largest, leading or most trusted store;
- cheapest, lowest price or unbeatable price;
- fastest, instant, same-day or guaranteed delivery;
- free delivery without the active threshold and conditions;
- 100% secure, risk-free or guaranteed payment;
- authentic, original, certified or official without product/supplier evidence;
- premium quality, highest quality or lifetime quality;
- medically proven, safe for everyone, eco-friendly or sustainable;
- guaranteed results, performance or compatibility;
- only X left, selling fast, trending or bestseller without authoritative definitions;
- five-star ratings, review counts or verified-customer labels without real review data;
- hassle-free/easy returns, money-back guarantee or fixed refund speed without policy;
- AI-powered, personalized by AI or intelligent recommendations without an approved AI
  system that materially performs that role;
- “nationwide COD”; COD is not currently authorized for SirajiBD;
- fake countdowns, false urgency, hidden conditions or misleading crossed-out prices.

---

# 38. Glossary

| Term | Approved meaning/use |
|---|---|
| SirajiBD | Public customer-facing store brand |
| AgentSiraji Commerce V2 | Internal/portfolio platform identity |
| Category | Authoritative catalog grouping visible to customers |
| Product | Catalog item with its own identity/content |
| Variant | Purchasable product option such as size/color |
| Availability | Inventory-derived ability to purchase; never copy-authored |
| Cart | Customer’s current collection of intended items |
| Checkout | Process of confirming address, delivery, payment and order |
| Delivery | Customer-facing term for moving an order to the recipient |
| Shipping rate | Configured delivery option/cost/window in the shipping domain |
| Order confirmed | Use only for the project’s authoritative confirmed state |
| Payment pending | Outcome not final; do not label paid or failed |
| Refund | Authoritative reversal process/state; not synonymous with cancellation |
| Best seller | Gated ranking based on an approved metric and time window |
| New arrival | Published product classified through the approved catalog rule |
| Review | Real customer-authored feedback under the approved review system |
| Testimonial | Approved attributed endorsement; not automatically a product review |
| Promotion | Time/eligibility-bound commercial offer with authoritative rules |
| Trust claim | Customer-facing statement requiring verifiable evidence |
| Gated content | Content omitted until required policy/data/system approval exists |

---

# 39. Content Governance

## 39.1 Ownership

| Content class | Accountable owner | Required reviewers |
|---|---|---|
| Brand strategy and homepage promise | Product Owner | UX/content; legal when claim-sensitive |
| Product facts | Catalog/content owner | Supplier/evidence owner; compliance where needed |
| Price, discount and stock | Commerce systems | Engineering/domain owner |
| Delivery facts | Shipping owner/system | Operations |
| Payment language | Payment owner/system | Finance/security/legal as applicable |
| Returns/refunds/legal | Product Owner | Operations and qualified legal review |
| Reviews/testimonials | Reviews/content owner | Privacy/moderation/legal as applicable |
| SEO | Content/SEO owner | Product Owner; engineering for technical SEO |
| Transactional messages | Domain owner | Content, security/privacy and operations |
| Promotions | Campaign owner | Product Owner, finance/operations and legal when needed |
| AI content | AI feature owner | Product Owner, domain, privacy/security and evaluation owner |

## 39.2 Content source record

Every claim-sensitive item should record:

- content ID/location;
- owner;
- source/evidence;
- approval status and approver;
- effective/expiry date when applicable;
- affected routes/channels;
- localization status;
- last verification date;
- removal/update trigger.

## 39.3 Change levels

| Change | Version impact | Approval |
|---|---|---|
| Typo that preserves meaning | Patch/document history | Content owner |
| Copy refinement without strategy/policy change | Minor | Product Owner/content owner |
| New positioning, promise, policy or claim rule | Major/minor according to scope | Product Owner plus required domain/legal reviewers |
| Live price/stock/delivery/payment update | Data/config change, not manual guide edit | Owning authoritative system |

## 39.4 Review cadence

- Verify evergreen brand copy at least quarterly and before major campaigns.
- Verify time-bound campaigns before activation and at expiry.
- Verify product claims when supplier/source data changes.
- Verify policy copy when operations, law, providers or customer rights change.
- Remove stale content promptly; do not leave expired content as historical decoration.

---

# 40. Approval Workflow

## 40.1 Workflow

1. **Request:** define surface, audience, goal and authoritative facts.
2. **Draft:** use this guide and label every unresolved fact.
3. **Evidence check:** verify product, price, stock, promotion, delivery, payment and
   policy claims with their owners.
4. **Content review:** check hierarchy, voice, accessibility, localization and channel
   fit.
5. **Domain review:** obtain operations, finance, privacy, security, legal or AI review
   where the content crosses those boundaries.
6. **Product Owner approval:** approve exact final copy and status.
7. **Implementation:** bind copy to the correct data/configuration; do not hard-code
   dynamic commerce truth.
8. **QA:** test responsive stress, accessibility, routes, states, metadata and content
   gates.
9. **Release:** record version/effective date and owner.
10. **Monitor:** correct confusion, stale facts and mismatch using real evidence.

## 40.2 Homepage V2 content release gate

Homepage implementation may begin after the Product Owner resolves or explicitly
accepts omission of the following:

- [x] Approve/revise Brand Vision.
- [x] Approve/revise Brand Mission.
- [x] Approve/revise Brand Promise.
- [x] Approve/revise Hero H1, support copy and CTAs.
- [ ] Approve/revise Brand Story copy.
- [x] Approve launch language rule (English primary; complete Bengali localization later).
- [ ] Approve homepage SEO title and meta description.
- [ ] Supply/approve real category names and descriptions through catalog data.
- [ ] Verify live delivery coverage/window/threshold facts or approve omission.
- [ ] Verify enabled production payment methods or approve omission.
- [ ] Approve seller identity/contact and required legal/policy routes before production.
- [ ] Approve omission of Best Sellers until ranking gate passes.
- [ ] Approve omission of Reviews until review gate passes.
- [ ] Approve omission of Newsletter until consent/backend/privacy gates pass.
- [ ] Approve omission of Promotional Banner unless an active campaign exists.
- [ ] Confirm no unapproved trust, COD, AI or market-leadership claim is present.

## 40.3 Content Definition of Done

Content is complete only when:

- it has an explicit status and accountable owner;
- all factual claims have evidence or authoritative data binding;
- all destinations and customer actions work;
- dynamic commerce truth is not duplicated in prose;
- mobile, long-copy, zoom and screen-reader presentation are checked;
- errors and empty states give a safe recovery path;
- legal/privacy/consent review is complete where applicable;
- metadata matches visible content;
- expiry/removal behavior exists for time-bound copy;
- the Product Owner approved the exact release version;
- the final implementation passes the Design QA Checklist.

---

## Appendix A — Homepage V2 Approved/Omitted Baseline

| Content item | Baseline decision |
|---|---|
| Brand | SirajiBD |
| Audience | Young professionals |
| Primary action | Browse categories |
| Positioning | Smart, trustworthy everyday shopping for Bangladesh |
| Language | English-first launch; complete Bengali localization later |
| Hero copy | Approved; destination and live-data checks still apply |
| Category content | Real catalog data only |
| New arrivals | Real published products only |
| Best sellers | Omit until ranking gate passes |
| Delivery/payment facts | Render only from verified configuration |
| COD | Do not claim or display |
| Promotion | Omit without approved active campaign |
| Reviews | Omit until backend/moderation/consent gate passes |
| Newsletter | Omit until backend/consent/privacy gate passes |
| AI assistant | Future; not part of Homepage V2 |
| Return/refund promise | Do not publish until policy approval |
| Dead legal/social links | Never render |

## Appendix B — Product Owner Approval Record

Use this table when promoting the guide to version 1.0.

| Item | Final decision/copy | Status | Approver | Date |
|---|---|---|---|---|
| Public brand | SirajiBD | Approved | Product Owner | 2026-08-09 |
| Platform identity | AgentSiraji Commerce V2 — internal/portfolio use only | Approved | Product Owner | 2026-08-09 |
| Positioning | Smart, trustworthy everyday shopping for Bangladesh | Approved | Product Owner | 2026-08-09 |
| Primary launch audience | Young professionals in Bangladesh | Approved | Product Owner | 2026-08-09 |
| Brand personality | Modern, honest, intelligent, reliable and friendly | Approved | Product Owner | 2026-08-09 |
| Homepage purpose | Help customers quickly enter the right shopping path | Approved | Product Owner | 2026-08-09 |
| Vision | To become a trusted modern shopping destination where people across Bangladesh can discover useful products with clarity and confidence. | Approved | Product Owner | 2026-08-09 |
| Mission | SirajiBD helps busy people discover practical products quickly through clear information, honest presentation and a simple path from browsing to order tracking. | Approved | Product Owner | 2026-08-09 |
| Promise | Clear choices. Honest information. A shopping journey you can understand. | Approved | Product Owner | 2026-08-09 |
| Hero eyebrow | Omit for the initial release | Approved | Product Owner | 2026-08-09 |
| Hero H1 | Smarter everyday shopping for modern life in Bangladesh. | Approved | Product Owner | 2026-08-09 |
| Hero support | Browse practical products with clear prices and a simple shopping experience built for Bangladesh. | Approved | Product Owner | 2026-08-09 |
| Primary CTA | Browse categories | Approved | Product Owner | 2026-08-09 |
| Secondary CTA | Search products | Approved | Product Owner | 2026-08-09 |
| Hero trust cue | Omit unless one concise verified delivery/payment fact is available | Approved conditional rule | Product Owner | 2026-08-09 |
| Brand Story | Pending | Draft | — | — |
| Language strategy | English-first launch; complete Bengali localization later | Approved | Product Owner | 2026-08-09 |
| Homepage SEO title | Pending | Draft | — | — |
| Homepage meta description | Pending | Draft | — | — |
| Returns/refunds policy | Missing | Missing | — | — |
| Homepage optional sections | Omit until individual gates pass | Approved baseline | Product Owner | 2026-08-09 |
