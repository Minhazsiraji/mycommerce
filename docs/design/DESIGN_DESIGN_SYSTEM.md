# AgentSiraji Commerce V2

## Design Design System (DDS)

| Field | Value |
|---|---|
| Document | Design Design System (DDS) |
| Project | AgentSiraji Commerce V2 |
| Repository | `Minhazsiraji/mycommerce` |
| Status | Design baseline for Product Owner approval; implementation is not authorized by this document alone |
| Version | 1.0 |
| Date | 2026-08-08 |
| Audience | Product Owner, Chief Software Architect, UX Director, implementation engineers, reviewers and content owners |
| Authority | Visual and interaction source of truth beneath the SAS and MDG and above approved wireframes and task prompts |

## Document purpose

This document defines how AgentSiraji Commerce V2 should look, feel and behave across
customer and administrative interfaces. It converts the approved Software Architecture
Specification (SAS) and Master Development Guide (MDG) into an implementation-ready
visual language without designing individual pages.

The DDS is deliberately specific about tokens, component contracts, states,
accessibility and responsive behavior. Future implementation sessions must not invent
local colors, spacing, motion, glass recipes or interaction behavior when this document
already provides a rule.

This document does **not** authorize source changes, define page section order, approve
marketing copy or replace responsive wireframes. A page implementation requires an
approved wireframe and a bounded task prompt in addition to this DDS.

### Authority order

When instructions conflict, use this order:

1. Security and protected commerce invariants in `CLAUDE.md`, the SAS and MDG.
2. Approved Software Architecture Specification.
3. Approved Master Development Guide.
4. This approved Design Design System.
5. The approved page-specific desktop and mobile wireframes.
6. The active, bounded implementation prompt.
7. Existing legacy styles and components.

The most specific lower-level document may refine a higher-level rule but may not
silently contradict it. A conflict must be escalated before implementation.

### Decision vocabulary

- **Current State** — a visual or component behavior verified in the repository.
- **Target State** — the approved V2 design rule defined by this DDS.
- **Migration Rule** — how touched components move toward the Target State without a
  broad rewrite.
- **Required** — mandatory for every applicable implementation.
- **Allowed** — available when the approved wireframe or component purpose justifies it.
- **Prohibited** — must not be implemented without a DDS revision.

### System promise

The system should feel calm, premium and intelligent while remaining unmistakably an
e-commerce experience. Products, prices, availability, delivery facts and buying
actions remain clearer than decorative effects. Glass and motion support hierarchy;
they never compete with commerce.

### Current State summary

The repository currently provides:

- Inter through `next/font`;
- Tailwind CSS 4 and a small semantic CSS-variable palette;
- light, dark and system theme behavior;
- reusable `Button`, `Input`, `Select` and `Textarea` primitives;
- visible focus treatment and a reduced-motion foundation;
- functional product cards, product grids, navigation, search and footer patterns.

The current system is usable but incomplete. It has no formal type scale, spacing
scale, elevation model, glass recipes, component state matrix, icon rules, responsive
container contract or complete semantic color vocabulary.

### Migration principle

Adopt the DDS incrementally:

1. Add semantic aliases without breaking current variables.
2. Migrate only components touched by the approved phase.
3. Preserve domain data contracts and commerce behavior.
4. Do not restyle checkout, authentication or admin during a storefront-only phase.
5. Remove legacy tokens only after every consumer is migrated and verified.
6. Record intentional exceptions with owner, reason and expiry.

---

# 1. Brand Philosophy

## 1.1 Brand idea

AgentSiraji Commerce represents **clear intelligence in service of confident buying**.
The brand combines dependable commerce with a refined, future-facing visual character.
It should feel ambitious enough to represent AgentSiraji's flagship work and grounded
enough to earn trust from a first-time buyer in Bangladesh.

## 1.2 Brand attributes

| Attribute | Expression | Avoid |
|---|---|---|
| Intelligent | Helpful hierarchy, contextual guidance, precise language | Chatbot theatre or unexplained automation |
| Premium | Disciplined typography, space, imagery and material depth | Excess gold, ornamental clutter or fake luxury |
| Trustworthy | Visible facts, stable controls and predictable states | False urgency, hidden conditions or ambiguous prices |
| Human | Warm direct copy and forgiving recovery | Robotic labels, blame or technical error language |
| Modern | Clean geometry, restrained liquid light and responsive motion | Trend stacking, neon overload or novelty navigation |
| Efficient | Fast paths, compact decisions and low cognitive load | Animation delays, excessive steps or oversized chrome |

## 1.3 Brand behavior

- Show evidence before claims.
- Make the next safe action obvious.
- Use confidence, not pressure, to support conversion.
- Treat customer time, attention and data with respect.
- Keep product imagery and verified facts visually dominant.
- Allow moments of delight only after clarity is secured.

## 1.4 Brand voice relationship

This DDS governs the visual delivery of content, not the final content strategy.
Approved copy should be concise, specific and locally understandable. Interface labels
must use customer language rather than internal status names. English is the current
interface language; future Bengali support must fit the same components without
shrinking text below the approved scale.

---

# 2. Visual Identity

## 2.1 Core visual signature

The visual identity combines four elements:

1. A calm pearl-to-ink neutral canvas.
2. A confident indigo core with a restrained cyan light accent.
3. Clear editorial typography with generous but purposeful whitespace.
4. Selective translucent surfaces with crisp edges and soft optical depth.

The signature is not “everything is glass.” Most content sits on solid or nearly solid
surfaces. Glass appears at high-value navigation, contextual overlays, hero framing and
rare highlighted promotional surfaces.

## 2.2 Reference interpretation

References are principles, not templates:

| Reference | Principle to learn | What must not be copied |
|---|---|---|
| Apple | Content focus, optical spacing, material restraint | Product layouts, proprietary visual assets or exact effects |
| visionOS | Layer clarity, depth and legible translucency | Floating everything or headset-specific interaction |
| Linear | Density discipline, fast interactions and dark-mode craft | Product identity, gradients or navigation structure |
| Stripe | Technical clarity, precise hierarchy and controlled color | Illustrations, page compositions or brand palette |
| Shopify | Familiar commerce patterns and operational clarity | Theme templates or admin structure |
| Arc | Expressive but controlled color and soft material edges | Browser chrome or interaction novelty |
| Nothing | Distinctive restraint and confident identity | Dot-matrix imitation or monochrome gimmicks |

## 2.3 Logo and wordmark handling

Until a separate brand-asset specification is approved:

- use an approved text wordmark only;
- preserve clear space equal to the wordmark capital height on all sides;
- never distort, outline, bevel or apply uncontrolled glow;
- use `--text-primary` on light surfaces and `--text-inverse` or approved light
  treatment on dark surfaces;
- do not create an icon mark during page implementation;
- never use “MyCommerce” as final public branding after approved brand migration.

## 2.4 Visual priority order

1. Product and buying facts.
2. Primary decision/action.
3. Navigation and orientation.
4. Trust and recovery information.
5. Brand expression.
6. Decorative atmosphere.

If a visual treatment weakens an earlier item to strengthen a later item, remove or
reduce it.

---

# 3. Design Principles

## 3.1 Clarity before spectacle

Every screen must be understandable without animation, gradients or AI. Product title,
price, image, selection state, availability and primary action must remain clear in a
static screenshot.

## 3.2 Familiar behavior, distinctive material

Use conventional e-commerce behavior for logo, search, cart, filters, forms and
checkout. Create distinction through composition, type, imagery, proportion and
materials rather than hidden controls or unfamiliar gestures.

## 3.3 One dominant action

Each component or decision region has one visually dominant action. Secondary actions
must not imitate the primary action. Destructive actions use distinct semantics and are
never made attractive through decorative color.

## 3.4 Product-first hierarchy

Decoration must frame products, not compete with them. Product photography cannot be
obscured by heavy gradients, glass glare, animated blobs or text overlays that reduce
recognition.

## 3.5 Accessible by construction

Contrast, keyboard behavior, focus, zoom, touch size and reduced motion are component
inputs. They are not post-build fixes.

## 3.6 Progressive enhancement

Essential navigation and commerce remain available without advanced animation or AI.
JavaScript enhances interaction; it does not carry the only readable state.

## 3.7 Honest states

Loading, unavailable, empty, error and success states must be explicit. Do not use
fabricated inventory pressure, fake reviews, false timers or decorative “verified”
labels.

## 3.8 Token discipline

Components consume semantic tokens. Arbitrary hex colors, spacing, radii, shadows,
z-index values and transition times are prohibited in implementation unless a DDS
amendment approves them.

---

# 4. Target User Experience

## 4.1 Experience objective

A first-time customer should feel oriented within seconds, understand why the store is
credible, find relevant products quickly and reach a buying decision without visual or
technical friction. A returning customer should move faster because controls and state
remain stable across visits and devices.

## 4.2 Emotional sequence

| Stage | Desired feeling | Design response |
|---|---|---|
| Arrival | “This is polished and legitimate.” | Calm canvas, strong brand entry, real trust facts |
| Discovery | “I can find what suits me.” | Obvious search, legible collections, scannable cards |
| Evaluation | “I understand the product.” | High-quality media, structured facts, truthful price and availability |
| Commitment | “I know what happens next.” | Clear action, delivery/payment facts, no surprise totals |
| Waiting | “The system is working.” | Stable loading geometry and explicit progress |
| Recovery | “I can fix this.” | Actionable errors, preserved input, clear alternative paths |
| Completion | “My order is safe.” | Clear confirmation, order identity and next steps |

## 4.3 Audience considerations

- Mobile-first Bangladesh shopping behavior.
- Mixed network quality and device capability.
- Gen-Z expectations for polish, motion and visual confidence.
- Buyers who still need familiar controls, COD/payment clarity and trust evidence.
- Future bilingual content and longer Bengali labels.
- Operators who require dense but readable administrative interfaces.

## 4.4 Experience constraints

- Never trade perceived modernity for slower product discovery.
- Never rely on hover for meaning or action.
- Never hide total cost, stock truth or required selection.
- Never place AI between a customer and a deterministic commerce action.
- Never make a mobile customer traverse decorative content to reach core controls.

---

# 5. Design Language

## 5.1 Name

The V2 design language is **Clear Liquid Commerce**.

“Clear” represents trust, directness and readable hierarchy. “Liquid” represents
adaptive composition, soft optical depth and modern motion. “Commerce” keeps visual
experimentation subordinate to buying tasks.

## 5.2 Material families

| Material | Role | Frequency |
|---|---|---:|
| Canvas | Page background and visual breathing space | Dominant |
| Solid surface | Product and information content | Frequent |
| Soft surface | Grouping, neutral emphasis and form regions | Frequent |
| Glass surface | Navigation, overlays and approved highlights | Selective |
| Ink surface | Premium dark emphasis or inverse region | Rare |
| Liquid light | Decorative gradient glow behind safe content layers | Rare |

## 5.3 Shape language

- Containers use soft continuous corners, not inflated bubble shapes.
- Interactive controls use moderate radii and crisp focus outlines.
- Pills are reserved for compact status, filter chips and segmented options.
- Product media uses consistent geometry across a collection.
- Decorative liquid forms stay behind content and never define hit targets.

## 5.4 Density language

Storefront presentation is spacious; operational interfaces are efficient. Premium
does not mean every section is oversized. Whitespace communicates grouping and
priority, while product grids preserve useful information density.

## 5.5 Prohibited visual patterns

- Glass on every card.
- Multiple competing accent gradients in one viewport.
- Large permanent background animation.
- Low-contrast gray text used as the main information color.
- Excessive rounded pills for normal buttons and inputs.
- Glowing primary text or prices.
- 3D perspective interactions on commerce controls.
- Decorative icons without semantic value.
- Fake AI sparkles on non-AI features.

---

# 6. Color System

## 6.1 Foundation palette

Foundation colors are private inputs. Components use semantic aliases from section
48, not these names directly.

### Neutral foundations

| Token | Hex | Intended role |
|---|---:|---|
| `pearl-0` | `#FFFFFF` | Pure surface and inverse text |
| `pearl-50` | `#F7F8FC` | Light canvas |
| `pearl-100` | `#F0F2F8` | Soft light surface |
| `pearl-200` | `#E2E6F0` | Light border |
| `pearl-300` | `#CBD1DE` | Strong light border |
| `slate-500` | `#697186` | Muted light-theme text |
| `slate-600` | `#4D5568` | Secondary light-theme text |
| `ink-800` | `#1A1E2B` | Elevated dark surface |
| `ink-850` | `#121620` | Dark surface |
| `ink-900` | `#0B0E15` | Dark canvas |
| `ink-950` | `#07090E` | Deep inverse/overlay |
| `ink-text` | `#111421` | Primary light-theme text |

### Brand foundations

| Token | Hex | Intended role |
|---|---:|---|
| `indigo-50` | `#EEF2FF` | Brand soft surface |
| `indigo-200` | `#C7D2FE` | Decorative light |
| `indigo-400` | `#818CF8` | Dark-theme brand accent |
| `indigo-500` | `#6366F1` | Decorative brand midpoint |
| `indigo-600` | `#4F46E5` | Primary action |
| `indigo-700` | `#4338CA` | Primary action hover |
| `cyan-200` | `#A5F3FC` | Decorative liquid highlight |
| `cyan-500` | `#06B6D4` | Decorative accent only |
| `cyan-700` | `#0E7490` | Accessible information accent |

### Feedback foundations

| Purpose | Light theme | Dark theme |
|---|---:|---:|
| Success | `#047857` | `#6EE7B7` |
| Warning | `#A14B08` | `#FBBF24` |
| Danger | `#B91C1C` | `#FCA5A5` |
| Information | `#0369A1` | `#7DD3FC` |

## 6.2 Light semantic palette

| Semantic token | Value |
|---|---:|
| `--background-canvas` | `#F7F8FC` |
| `--background-subtle` | `#F0F2F8` |
| `--surface-primary` | `#FFFFFF` |
| `--surface-secondary` | `#F7F8FC` |
| `--surface-elevated` | `#FFFFFF` |
| `--surface-inverse` | `#111421` |
| `--surface-selected` | `#EEF2FF` |
| `--surface-disabled` | `#F0F2F8` |
| `--text-primary` | `#111421` |
| `--text-secondary` | `#4D5568` |
| `--text-muted` | `#697186` |
| `--text-inverse` | `#FFFFFF` |
| `--border-subtle` | `#E2E6F0` |
| `--border-strong` | `#CBD1DE` |
| `--action-primary` | `#4F46E5` |
| `--action-primary-hover` | `#4338CA` |
| `--action-primary-text` | `#FFFFFF` |
| `--action-destructive` | `#B91C1C` |
| `--action-destructive-hover` | `#991B1B` |
| `--action-destructive-text` | `#FFFFFF` |
| `--focus-ring` | `#4F46E5` |

## 6.3 Dark semantic palette

| Semantic token | Value |
|---|---:|
| `--background-canvas` | `#0B0E15` |
| `--background-subtle` | `#121620` |
| `--surface-primary` | `#121620` |
| `--surface-secondary` | `#1A1E2B` |
| `--surface-elevated` | `#202534` |
| `--surface-inverse` | `#F7F8FC` |
| `--surface-selected` | `#25264A` |
| `--surface-disabled` | `#1A1E2B` |
| `--text-primary` | `#F7F8FC` |
| `--text-secondary` | `#CBD1DE` |
| `--text-muted` | `#AAB1C0` |
| `--text-inverse` | `#0B0E15` |
| `--border-subtle` | `#303646` |
| `--border-strong` | `#454C5F` |
| `--action-primary` | `#A5B4FC` |
| `--action-primary-hover` | `#C7D2FE` |
| `--action-primary-text` | `#0B0E15` |
| `--action-destructive` | `#FCA5A5` |
| `--action-destructive-hover` | `#FECACA` |
| `--action-destructive-text` | `#0B0E15` |
| `--focus-ring` | `#A5B4FC` |

## 6.4 Feedback token triplets

| State | Light text / surface / border | Dark text / surface / border |
|---|---|---|
| Success | `#047857` / `#ECFDF5` / `#A7F3D0` | `#6EE7B7` / `#0B2A22` / `#166B55` |
| Warning | `#A14B08` / `#FFF7ED` / `#FED7AA` | `#FBBF24` / `#30200D` / `#7C4A0B` |
| Danger | `#B91C1C` / `#FEF2F2` / `#FECACA` | `#FCA5A5` / `#321416` / `#7F1D1D` |
| Information | `#0369A1` / `#F0F9FF` / `#BAE6FD` | `#7DD3FC` / `#0B2432` / `#075985` |

## 6.5 Commerce semantics

- Price uses `--text-primary`; price must not depend on accent color for importance.
- Compare-at price uses `--text-muted` plus a semantic line-through.
- Discount uses `--feedback-danger-text` only when the source data proves the
  comparison.
- In-stock uses `--feedback-success` with text/icon, never a green dot alone.
- Low-stock styling requires an approved inventory rule; the DDS does not authorize the
  claim.
- Out-of-stock uses `--text-secondary` and an explicit label.
- Payment, order and shipment status colors map to a restricted status-token set; raw
  database status strings never choose colors dynamically.

## 6.6 Color usage limits

- One dominant brand action color per decision region.
- Decorative cyan cannot be used for body text on light backgrounds.
- Feedback colors are reserved for state, not decoration.
- Black `#000000` and pure red/green are prohibited as normal UI shortcuts.
- Disabled controls use reduced emphasis but remain legible; opacity alone is not the
  only state cue.

---

# 7. Gradient System

## 7.1 Approved gradients

| Token | Definition | Use |
|---|---|---|
| `--gradient-brand` | `linear-gradient(135deg, #4338CA 0%, #6366F1 55%, #0E7490 100%)` | Rare brand panels or approved hero material |
| `--gradient-brand-soft` | `linear-gradient(135deg, rgba(99,102,241,.16), rgba(6,182,212,.08))` | Light-theme ambient surface |
| `--gradient-brand-soft-dark` | `linear-gradient(135deg, rgba(129,140,248,.20), rgba(6,182,212,.10))` | Dark-theme ambient surface |
| `--gradient-pearl` | `linear-gradient(180deg, rgba(255,255,255,.96), rgba(247,248,252,.88))` | Light elevated material |
| `--gradient-ink` | `linear-gradient(180deg, rgba(32,37,52,.96), rgba(11,14,21,.96))` | Dark inverse material |
| `--gradient-scrim-up` | `linear-gradient(180deg, transparent 35%, rgba(7,9,14,.72) 100%)` | Text protection over approved imagery |

## 7.2 Gradient rules

- A gradient may use no more than three color stops.
- Decorative gradients remain beneath a solid or verified glass content layer.
- Text never uses gradient fill in commerce-critical contexts.
- Product photography is not tinted to force palette conformity.
- Gradient angle and stops come from tokens; local variants require design approval.
- Dark and light theme gradients are separately tested.
- Gradients must not imply unavailable interactive affordance.

## 7.3 Liquid-light rule

Liquid light may appear as a blurred, static radial glow behind a component. The glow
must use a pseudo-element or non-semantic decorative element, be clipped, use
`pointer-events: none`, be hidden from assistive technology and stop animating under
reduced motion. Continuous blur animation is prohibited.

---

# 8. Glass / Liquid UI Rules

## 8.1 Glass recipes

| Recipe | Background | Border | Blur | Shadow | Use |
|---|---|---|---:|---|---|
| Glass subtle light | `rgba(255,255,255,.72)` | `rgba(255,255,255,.70)` | 12 px | Elevation 1 | Header or compact floating control |
| Glass strong light | `rgba(255,255,255,.84)` | `rgba(203,209,222,.72)` | 18 px | Elevation 2 | Drawer/dialog surface over mixed background |
| Glass subtle dark | `rgba(18,22,32,.72)` | `rgba(255,255,255,.12)` | 12 px | Elevation 1 dark | Header or compact floating control |
| Glass strong dark | `rgba(18,22,32,.86)` | `rgba(255,255,255,.16)` | 18 px | Elevation 2 dark | Drawer/dialog surface over mixed background |

## 8.2 Required glass anatomy

Every glass surface has:

1. A tested semantic background.
2. A visible edge/border.
3. Controlled backdrop blur.
4. A solid-color fallback when backdrop filtering is unsupported.
5. Content contrast verified over the worst supported background.
6. No continuously animated blur or shadow.

## 8.3 Approved use

- Primary storefront navigation when the wireframe specifies it.
- Search suggestion panel.
- Mobile navigation drawer.
- Modal and drawer shells.
- A selected hero content frame.
- Rare floating contextual controls.

## 8.4 Prohibited use

- Every product card in a dense grid.
- Form fields over photography.
- Checkout totals or payment instructions over uncontrolled imagery.
- Long reading surfaces.
- Error messages where transparency reduces legibility.
- Nested glass beyond two visible layers.
- Glass on devices where the effect causes measurable scroll or interaction jank.

## 8.5 Liquid edge treatment

A one-pixel highlight may be placed on the light-facing edge using a pseudo-element.
It must remain subtle, cannot cover focus outlines and cannot simulate a false control
boundary.

---

# 9. Background System

## 9.1 Background layers

| Layer | Token | Role |
|---|---|---|
| Page canvas | `--background-canvas` | Default page field |
| Section alternate | `--background-subtle` | Separate long content regions |
| Solid content | `--surface-primary` | Cards, forms and readable content |
| Raised content | `--surface-elevated` | Menus, popovers and dialogs |
| Inverse field | `--surface-inverse` | Rare premium emphasis |
| Ambient light | approved gradient token | Decorative depth behind protected content |

## 9.2 Composition rules

- Use no more than three materially different background layers in one viewport.
- Alternate section backgrounds must communicate grouping, not create stripes for
  every section.
- A decorative image background requires a text-protection layer.
- Full-bleed backgrounds retain safe container gutters for content.
- Product media backgrounds are neutral and consistent within a collection.
- Backgrounds never encode required status alone.

## 9.3 Noise and texture

A very subtle static noise texture may be approved for large brand surfaces if its
compressed cost is small and it introduces no visible pattern at normal zoom. Noise is
never placed over body copy, product photography or form fields. CSS or a tiny local
asset is preferred to a remote texture.

---

# 10. Typography

## 10.1 Typeface

Inter remains the approved primary typeface because it is already self-hosted through
`next/font`, renders clearly across Latin numerals and UI sizes, and avoids a new
dependency or network request. The system fallback is:

`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

A future Bengali typeface requires a separate localization review for glyph coverage,
metrics, bundle size and layout behavior. Do not assume Inter is the final Bengali
face.

## 10.2 Weight set

| Weight | Value | Use |
|---|---:|---|
| Regular | 400 | Body, descriptions and controls |
| Medium | 500 | Labels, navigation and supporting emphasis |
| Semibold | 600 | Headings, price emphasis and primary buttons |
| Bold | 700 | Rare campaign/display emphasis only |

Do not load unused font weights. Thin weights are prohibited because they lose clarity
on low-density screens and translucent backgrounds.

## 10.3 Typographic principles

- Sentence case is the default for labels and headings.
- All-caps is limited to short eyebrows/status labels with tracking.
- Body text uses a maximum measure of 65–72 characters.
- Display headings use balanced line wrapping where supported and tested.
- Numerals in prices must remain clear; tabular numerals may be used in aligned
  financial/admin data.
- Underlines remain visible for links inside prose.
- Never reduce essential text below 12 px; customer-facing body text defaults to 16 px.
- Bengali and English text must not be forced into fixed-height containers.

---

# 11. Font Scale

## 11.1 Type tokens

| Token | Size / line height | Weight | Typical role |
|---|---:|---:|---|
| `--text-xs` | 12 / 16 px | 400–600 | Metadata, compact badges |
| `--text-sm` | 14 / 20 px | 400–600 | Supporting UI, secondary actions |
| `--text-base` | 16 / 24 px | 400–500 | Default body and mobile form text |
| `--text-lg` | 18 / 28 px | 400–600 | Lead body and card emphasis |
| `--text-xl` | 20 / 28 px | 500–600 | Small section title |
| `--text-2xl` | 24 / 32 px | 600 | Card/compact section heading |
| `--text-3xl` | 30 / 38 px | 600 | Mobile page/section heading |
| `--text-4xl` | 36 / 44 px | 600 | Desktop section/page heading |
| `--text-5xl` | 48 / 56 px | 600–700 | Responsive display heading |
| `--text-6xl` | 64 / 68 px | 600–700 | Large approved brand display only |

## 11.2 Fluid display rule

Display type may use `clamp()` between approved endpoints. Example semantic contract:

`--text-display: clamp(2.5rem, 2rem + 2.5vw, 4rem)`

Body, form and price sizes must not use viewport scaling that becomes unreadable at
either extreme.

## 11.3 Tracking tokens

| Token | Value | Use |
|---|---:|---|
| `--tracking-tight` | `-0.025em` | Large display headings |
| `--tracking-heading` | `-0.015em` | Standard headings |
| `--tracking-normal` | `0` | Body and controls |
| `--tracking-wide` | `0.06em` | Short uppercase eyebrows only |

---

# 12. Spacing System

## 12.1 Base scale

The spacing system uses a 4 px base with two optical half-steps.

| Token | Value | Typical use |
|---|---:|---|
| `--space-0` | 0 | Reset |
| `--space-0_5` | 2 px | Optical/icon adjustment only |
| `--space-1` | 4 px | Tight internal gap |
| `--space-2` | 8 px | Icon/text gap |
| `--space-3` | 12 px | Compact control grouping |
| `--space-4` | 16 px | Default component padding/gap |
| `--space-5` | 20 px | Comfortable component padding |
| `--space-6` | 24 px | Card padding/mobile gutter |
| `--space-8` | 32 px | Group/desktop gutter |
| `--space-10` | 40 px | Large group separation |
| `--space-12` | 48 px | Section internal spacing |
| `--space-16` | 64 px | Compact section separation |
| `--space-20` | 80 px | Standard desktop section separation |
| `--space-24` | 96 px | Large desktop section separation |
| `--space-32` | 128 px | Rare brand-stage spacing |

## 12.2 Spacing rules

- Adjacent elements use a scale token, never an arbitrary margin.
- Internal padding is normally smaller than separation between groups.
- Mobile section spacing is typically 48–64 px; desktop is typically 64–96 px.
- Dense admin tables may use 8–12 px vertical cell padding but must retain 44 px
  interactive targets.
- Component spacing may use logical properties to support future direction changes.
- Negative spacing is prohibited except for a documented optical overlap in an
  approved component.

---

# 13. Grid System

## 13.1 Container tokens

| Token | Value |
|---|---:|
| `--container-reading` | 720 px |
| `--container-content` | 1152 px |
| `--container-wide` | 1280 px |
| `--container-max` | 1440 px for rare full editorial composition |

The existing `max-w-6xl` shell maps naturally to `--container-content` and is preserved
until an approved wireframe requires a wider composition.

## 13.2 Gutters

| Viewport mode | Gutter |
|---|---:|
| Compact, under 640 px | 16 px minimum; 20 px preferred when content permits |
| Small/medium, 640–1023 px | 24 px |
| Wide, 1024–1439 px | 32 px |
| Large, 1440 px and above | 40–48 px |

## 13.3 Column model

- Compact: 4 conceptual columns.
- Tablet: 8 conceptual columns.
- Desktop: 12 conceptual columns.
- Column gaps use 16 px compact, 20–24 px medium and 24–32 px wide.
- Components may use CSS Grid auto-fit/minmax when fixed columns create poor product
  widths.

## 13.4 Product grid contract

- Minimum practical product-card content width: 220 px.
- Preferred storefront card width: 240–320 px.
- Two compact columns are allowed only when imagery, titles and prices remain legible
  at 320 px viewport width.
- Product media aspect ratio remains stable across a grid.
- Grid alignment does not force titles into fixed heights that clip content.
- A horizontal product carousel requires explicit wireframe approval and accessible
  controls; a grid is the default.

## 13.5 Reading order

Visual repositioning cannot create a keyboard or screen-reader order different from
the intended content sequence. Source order follows meaning; grid placement enhances
it.

---

# 14. Border Radius

## 14.1 Radius scale

| Token | Value | Use |
|---|---:|---|
| `--radius-xs` | 4 px | Tiny indicators only |
| `--radius-sm` | 8 px | Compact controls, badges |
| `--radius-md` | 12 px | Buttons, inputs, menus |
| `--radius-lg` | 16 px | Cards and panels |
| `--radius-xl` | 24 px | Hero/collection surfaces and drawers |
| `--radius-2xl` | 32 px | Rare large brand surface |
| `--radius-pill` | 999 px | Chips, status and circular controls |

## 14.2 Radius rules

- Child radii equal the parent radius minus the internal inset where visible.
- Form controls within one region share a radius family.
- A page must not mix more than three visible radius levels without justification.
- Pills are not the default button shape.
- Product image and card radii remain coordinated.
- Focus rings follow the control's radius and remain outside clipping.

---

# 15. Shadow System

## 15.1 Light-theme shadows

| Token | CSS value |
|---|---|
| `--shadow-0` | `none` |
| `--shadow-1` | `0 1px 2px rgba(17,20,33,.06), 0 4px 12px rgba(17,20,33,.04)` |
| `--shadow-2` | `0 8px 24px rgba(17,20,33,.08), 0 2px 8px rgba(17,20,33,.05)` |
| `--shadow-3` | `0 16px 48px rgba(17,20,33,.12), 0 4px 16px rgba(17,20,33,.06)` |
| `--shadow-focus` | `0 0 0 3px rgba(79,70,229,.28)` |

## 15.2 Dark-theme shadows

| Token | CSS value |
|---|---|
| `--shadow-1` | `0 1px 2px rgba(0,0,0,.28), 0 6px 16px rgba(0,0,0,.18)` |
| `--shadow-2` | `0 10px 30px rgba(0,0,0,.34), 0 2px 8px rgba(0,0,0,.22)` |
| `--shadow-3` | `0 20px 60px rgba(0,0,0,.44), 0 4px 18px rgba(0,0,0,.26)` |
| `--shadow-focus` | `0 0 0 3px rgba(165,180,252,.36)` |

## 15.3 Shadow rules

- Border and surface change establish structure before shadow.
- Product cards at rest use `--shadow-0` or `--shadow-1`.
- Hover may move one elevation level only.
- Dark-theme elevation uses surface lightness plus restrained shadow.
- Colored/glowing shadows are prohibited on commerce controls.
- Shadow animation is avoided; use transform/opacity and surface transition where
  needed.

---

# 16. Elevation Levels

| Level | Typical surface | Layer token | Shadow |
|---:|---|---:|---|
| 0 | Page canvas, flat section | `--z-base` | None |
| 1 | Card, sticky utility | `--z-raised` | Shadow 1 |
| 2 | Popover, search suggestions | `--z-dropdown` | Shadow 2 |
| 3 | Sticky navigation, drawer | `--z-sticky` / `--z-drawer` | Shadow 2–3 |
| 4 | Modal | `--z-modal` | Shadow 3 |
| 5 | Toast/critical transient feedback | `--z-toast` | Shadow 3 |

## 16.1 Z-index tokens

| Token | Value |
|---|---:|
| `--z-base` | 0 |
| `--z-raised` | 10 |
| `--z-dropdown` | 30 |
| `--z-sticky` | 40 |
| `--z-drawer` | 50 |
| `--z-modal` | 60 |
| `--z-toast` | 70 |

Local z-index escalation is prohibited. A new layer requires a system-level decision.

## 16.2 Elevation behavior

- Elevation represents interaction/layer relationship, not importance alone.
- Focus outlines remain visible above component content.
- Overlays use an approved scrim and prevent background interaction.
- Sticky elements must not cover focused controls or anchored content.

---

# 17. Blur Rules

## 17.1 Blur scale

| Token | Value | Use |
|---|---:|---|
| `--blur-none` | 0 | Solid surfaces |
| `--blur-sm` | 8 px | Compact subtle glass |
| `--blur-md` | 12 px | Standard glass |
| `--blur-lg` | 18 px | Strong overlay glass |
| `--blur-xl` | 24 px | Rare static ambient light only |

## 17.2 Constraints

- Backdrop blur above 18 px requires visual and performance evidence.
- Large viewport-sized surfaces use no continuous blur animation.
- Blur is removed or reduced when device performance testing shows interaction cost.
- Text itself is never blurred during state transitions.
- A blurred surface still has a solid fallback background.
- Nested blur is limited to two layers and requires contrast verification.

---

# 18. Transparency Rules

## 18.1 Opacity tokens

| Token | Value | Use |
|---|---:|---|
| `--opacity-muted` | .72 | Secondary decorative content, never primary text |
| `--opacity-disabled` | .48 | Disabled control layer with additional state cue |
| `--opacity-scrim` | .56 light / .68 dark | Modal/drawer background separation |
| `--opacity-glass-subtle` | .72 | Standard glass background |
| `--opacity-glass-strong` | .84 light / .86 dark | Strong glass background |

## 18.2 Rules

- Primary and secondary text use solid semantic colors, not parent opacity.
- Disabled state combines opacity with `disabled`, cursor and semantic state.
- Images may not be faded to make unreadable text overlays appear acceptable.
- Any text-bearing transparent surface must pass contrast on the worst supported image
  or fall back to a solid surface.
- Transparency must not make boundaries invisible in high-contrast mode.

---

# 19. Iconography

## 19.1 Style

- Rounded geometric outline icons.
- Default 1.75–2 px optical stroke at 24 px.
- Square view box, normally `0 0 24 24`.
- Round line caps and joins where appropriate.
- Filled icons are reserved for selected/active state or compact status.
- Icons inherit `currentColor`.

## 19.2 Sizes

| Token | Size | Use |
|---|---:|---|
| `--icon-xs` | 14 px | Compact metadata |
| `--icon-sm` | 16 px | Inline labels |
| `--icon-md` | 20 px | Standard controls |
| `--icon-lg` | 24 px | Navigation and standalone actions |
| `--icon-xl` | 32 px | Empty-state/supporting illustration |

## 19.3 Rules

- An icon never replaces a critical label unless the meaning is universally familiar
  and an accessible name is present.
- Icon-only controls have a minimum 44 x 44 px target.
- Decorative icons use `aria-hidden="true"`.
- Status icons appear with text.
- Do not mix unrelated icon families in one interface.
- The existing small inline SVG approach may continue until an approved component
  volume justifies a library; a dependency requires MDG approval.
- Brand/product logos are assets, not interface icons.

---

# 20. Illustration Style

## 20.1 Role

Illustration supports onboarding, empty states, educational content and future AI
explanation. It does not replace product photography or fabricate product capabilities.

## 20.2 Style contract

- Simplified dimensional forms with soft geometric construction.
- Pearl, indigo and restrained cyan palette.
- One clear focal object and generous negative space.
- Soft shadow and limited translucent material.
- No generic stock “corporate people” style.
- No humanoid robot as the default symbol for AI.
- No medical, financial or sustainability symbolism without evidence and approval.

## 20.3 Technical requirements

- Prefer optimized SVG for simple static illustration.
- Raster illustration requires explicit dimensions, responsive sizes and modern
  delivery format.
- Decorative illustration uses empty alt; informative illustration receives concise
  alt or adjacent text.
- Light and dark surfaces require approved variants or a neutral container.
- Animation is optional and must preserve meaning when absent.

---

# 21. Photography Style

## 21.1 Product photography

Product photography is evidence. It must show the actual product accurately before it
creates atmosphere.

- Use consistent lighting and color temperature within a collection.
- Use neutral or softly tonal backgrounds that preserve product color accuracy.
- Primary imagery should show the entire product without aggressive crop.
- Supporting imagery may show scale, detail, texture and use context.
- Do not use AI-generated imagery as a substitute for the real product.
- Do not remove defects, alter color or add features during retouching.
- Avoid text embedded in the primary product image.

## 21.2 Aspect ratios

| Asset role | Preferred ratio | Crop behavior |
|---|---:|---|
| Product grid primary | 4:5 | Consistent centered crop |
| Product detail primary | 1:1 or 4:5 according to category | Contain important product boundaries |
| Collection/editorial | 3:2 or 16:10 | Art-directed crop |
| Wide brand/banner | 16:9 minimum | Subject safe area defined per responsive crop |
| Avatar/reviewer | 1:1 | Face/object centered; optional asset only |

The page wireframe chooses among approved ratios. A grid never mixes ratios without an
explicit editorial purpose.

## 21.3 Lifestyle photography

- Show believable context relevant to the product and local customer.
- Preserve skin-tone and product-color accuracy.
- Leave intentional negative space only where approved text may sit.
- Avoid generic luxury props that misrepresent price or positioning.
- Keep diverse representation authentic and non-tokenistic.
- Obtain and record usage rights, consent and expiry where applicable.

## 21.4 Image treatment

- Use no decorative filter that changes product truth.
- Apply overlays only to protect text, using approved scrim gradients.
- Use controlled border radius from the surface hierarchy.
- Provide meaningful alt text based on visible product information, not SEO stuffing.
- Use the storage abstraction, responsive `sizes` and a stable aspect ratio.
- Only the actual likely LCP image receives priority loading.

---

# 22. Button System

## 22.1 Variants

| Variant | Purpose | Visual treatment |
|---|---|---|
| Primary | One dominant safe action in a decision region | Solid `--action-primary`, high-contrast text |
| Secondary | Important alternative action | Solid/elevated surface, strong border, primary text |
| Tertiary | Low-emphasis inline action | Transparent, text/icon emphasis on hover/focus |
| Destructive | Delete/cancel irreversible or high-risk action | Danger semantic, explicit label |
| Quiet destructive | Lower-emphasis destructive alternative | Neutral surface with danger text/border |
| Icon | Familiar compact action | Square/circle target with accessible name |
| Link | Navigation inside prose or compact region | Underline or clearly link-like treatment |

## 22.2 Sizes

| Size | Height | Horizontal padding | Text | Icon |
|---|---:|---:|---:|---:|
| Small | 40 px | 14 px | 14 px | 16 px |
| Medium | 44 px | 18 px | 14–16 px | 18–20 px |
| Large | 52 px | 24 px | 16 px | 20 px |
| Hero | 56 px | 28 px | 16–18 px | 20 px |
| Icon only | 44 px minimum square | — | — | 20–24 px |

Small is for dense non-primary interfaces. Primary mobile commerce actions use medium
or large.

## 22.3 State contract

Every button provides:

- default;
- hover on hover-capable devices;
- active/pressed;
- focus-visible with external high-contrast ring;
- disabled using the native attribute when applicable;
- pending/loading while preventing accidental duplicate submission;
- success only when confirmation materially helps;
- error outside the button through an actionable message.

## 22.4 Behavior rules

- Labels start with a clear verb where appropriate.
- Width follows content by default; full width is intentional on compact layouts.
- Loading preserves button width and label context; an indicator may accompany hidden
  or unchanged text.
- Do not change “Place order” to an unlabeled spinner.
- Primary and destructive actions never share equal visual emphasis side by side.
- Disabled controls explain the condition nearby when it is not self-evident.
- Buttons do not use shadows stronger than Elevation 1 at rest.
- Press feedback uses a small transform no larger than 1 px or scale `.98` and is
  removed under reduced motion when it adds no meaning.

## 22.5 Migration

The current `Button` supports `primary` and `ghost` at 40 px. Extend its semantic
variant and size API only in the phase that needs each variant. Preserve existing
callers; do not introduce a second button primitive.

---

# 23. Input Fields

## 23.1 Anatomy

1. Persistent visible label.
2. Optional hint/format text.
3. Input container.
4. Optional leading/trailing semantic control.
5. Error or success message linked programmatically.

Placeholder text is an example, not a label.

## 23.2 Dimensions

| Mode | Minimum height | Horizontal padding | Text size |
|---|---:|---:|---:|
| Standard storefront | 48 px | 14–16 px | 16 px |
| Comfortable/hero search | 52–56 px | 18–20 px | 16 px |
| Dense admin | 40–44 px | 12–14 px | 14–16 px |
| Multiline | 120 px minimum | 14–16 px | 16 px |

Mobile form text is at least 16 px to avoid browser zoom.

## 23.3 Visual states

| State | Treatment |
|---|---|
| Default | Primary surface, subtle border |
| Hover | Strong border where pointer hover exists |
| Focus | Strong border plus `--focus-ring`; no layout change |
| Filled | Same structure; content remains primary |
| Disabled | Secondary surface, readable muted text, native disabled semantics |
| Read-only | Secondary surface and explicit read-only behavior |
| Error | Danger border/icon/message; not color alone |
| Success | Use only when useful; success icon/message, not permanent green field |

## 23.4 Input rules

- Use correct `type`, `inputMode`, `autocomplete` and name.
- Labels and errors connect with `htmlFor`, `aria-describedby` and `aria-invalid`.
- Password inputs support password managers, paste and optional visibility control.
- Prefixes/suffixes cannot be mistaken for editable text.
- Currency is stored/validated by commerce logic; display adornments never change the
  authoritative amount.
- Clear buttons have accessible names and do not remove text unexpectedly.
- Validation normally occurs on submit or after blur, not as punitive per-keystroke
  noise.
- Preserve recoverable input after server errors.

## 23.5 Migration

The current `Input` already generates an ID and connects error text. Keep that
contract. Update tokens and sizing only when the owning feature is in scope.

---

# 24. Select Components

## 24.1 Native-first rule

Use native `<select>` for straightforward single-choice forms. Build a custom listbox,
combobox or command selector only when search, rich option content or multi-selection
is an approved requirement and the full keyboard/accessibility contract can be met.

## 24.2 Anatomy and states

- Visible label.
- Optional hint.
- Selection field with a consistent chevron.
- Placeholder option only when “no selection” is valid.
- Default, hover, focus, disabled, error and loading states.
- Error/help text connected through `aria-describedby`.

## 24.3 Rules

- Field dimensions match section 23.
- Options use customer-facing labels, not database codes.
- A required select cannot submit its placeholder as valid data.
- Long option text wraps or truncates with an accessible full value.
- Mobile custom selectors must not fight native scrolling or the on-screen keyboard.
- Selected state cannot rely on color alone.
- Combobox results announce count and selection changes without excessive live output.

## 24.4 Migration

The current `Select` should gain described-error linkage before visual expansion. Do
not replace it with a UI package solely for styling.

---

# 25. Cards

## 25.1 Card roles

| Card type | Purpose | Default material |
|---|---|---|
| Content card | Group related information | Solid surface |
| Action card | Offer one clear action | Solid/elevated surface |
| Media card | Pair image and concise content | Solid surface, coordinated media radius |
| Selection card | Represent a selectable option | Solid surface with explicit selected state |
| Status card | Summarize a state/next step | Soft surface with semantic status treatment |
| Promotional card | Approved merchandising message | Brand soft or rare glass/gradient material |

## 25.2 Anatomy

A card may contain media, eyebrow/status, title, description, metadata and actions.
Only include layers needed by its purpose. The whole card may be a link when there is
one destination; nested interactive controls inside a full-card link are prohibited.

## 25.3 Card rules

- Default radius: `--radius-lg`; large editorial card: `--radius-xl`.
- Default padding: 20–24 px; compact card: 16 px.
- Use border or shadow according to context, not both at high strength.
- Hover elevation appears only if the card is interactive.
- Selected cards use border/ring and an icon/text cue.
- Card titles preserve semantic heading order.
- Do not force unrelated content to equal heights.
- Glass cards are exceptional and require approved background context.
- Cards must remain understandable when motion and hover are absent.

---

# 26. Product Card

## 26.1 Purpose

The product card supports comparison and movement to product detail. It does not make
inventory, discount or recommendation decisions and does not fetch its own data.

## 26.2 Required content contract

- Authoritative product title.
- Approved primary image, stable ratio and fallback.
- Current server-provided price.
- Compare-at price only when valid server data exists.
- Link to product detail.
- Availability treatment when the contract provides it.

## 26.3 Optional content

- Approved category/brand metadata.
- Data-backed “New”, “Best seller” or offer badge.
- Valid rating summary once a real review system exists.
- Wishlist control only after the feature is approved.
- Secondary swatch/variant preview only if it does not imply unverified stock.

## 26.4 Visual hierarchy

1. Product media.
2. Product name.
3. Current price.
4. Supporting metadata.
5. Optional validated badge/action.

Media uses 4:5 by default. Content uses 12–16 px top separation. Titles are normally
16 px/24, medium weight; price is 16–18 px/24, semibold. Compare-at price is 14 px/20.

## 26.5 Interaction

- The product-detail link owns the primary card action.
- Hover may lift media by 1–2 px or adjust shadow one level; it cannot reveal the only
  critical information.
- Keyboard focus is visible around the linked region.
- Quick-add is not assumed; it requires variant-safe behavior and wireframe approval.
- Image swaps on hover are optional, do not auto-run on touch and must not cause layout
  shift.
- Badge, price and stock states remain understandable to assistive technology.

## 26.6 Truth rules

- The card never calculates discount percentage independently.
- “Low stock” requires an approved threshold and real inventory data.
- “Best seller” requires an approved measurement window and source.
- Ratings/review counts are never hard-coded or fabricated.
- AI recommendation labels disclose why the card is shown when that feature exists.

## 26.7 Migration

Refactor the existing product card behind its current domain contract during its
approved page phase. Do not create homepage-specific, category-specific and search-
specific duplicates when semantic variants can serve the real difference.

---

# 27. Collection Card

## 27.1 Purpose

A collection card represents a navigable product grouping, customer need or approved
editorial theme. It never impersonates an individual product.

## 27.2 Content contract

- Approved collection/category name.
- Destination link.
- Representative image or restrained graphic.
- Optional concise description or item count from authoritative data.
- Optional action cue such as “Explore collection.”

## 27.3 Variants

| Variant | Use |
|---|---|
| Image-led | Strong approved collection photography |
| Editorial | Image plus short explanatory text |
| Compact | Navigation-focused grid or horizontal list |
| Feature | Rare large promotional grouping from an approved wireframe |

## 27.4 Rules

- Text over imagery uses the approved scrim and passes contrast.
- The full card can be one semantic link.
- Collection images use a consistent ratio within one set.
- Item counts are omitted when data is unavailable; never guessed.
- Decorative collection labels do not create duplicate category taxonomy.
- Hover and motion are supplemental, never the only destination cue.

---

# 28. Navigation

## 28.1 Navigation hierarchy

| Level | Purpose |
|---|---|
| Utility/trust | Delivery, payment or approved store-wide fact |
| Primary | Brand, major categories, search, account and cart |
| Secondary | Local section/category navigation where justified |
| Contextual | Breadcrumbs, tabs or in-page orientation |

## 28.2 Global rules

- Logo/wordmark links home.
- Search and cart remain high priority at every width.
- Primary category count stays concise; overflow uses an approved disclosure pattern.
- Multiple `<nav>` landmarks have unique accessible labels.
- Active state uses text weight, indicator and/or `aria-current`; not color alone.
- Navigation works with keyboard, touch, zoom and long translated labels.
- Sticky behavior is approved in wireframes and must not hide anchor targets.
- The navigation shell stays primarily server-rendered; client behavior is isolated.

## 28.3 Trust/announcement bar

- Shows only configured, verifiable facts.
- Remains secondary to primary navigation.
- Avoids autoplay marquees and false urgency.
- On compact screens it may scroll as a controlled region only with visible meaning;
  hiding lower-priority detail is preferable to a perpetual ticker.
- Dismissal is used only for temporary announcements and preserves preference.

## 28.4 Breadcrumbs

- Use on hierarchy-rich pages, not automatically on every screen.
- The current page is plain text or `aria-current="page"`.
- Mobile may visually shorten intermediate items without changing semantic meaning.
- Structured data must match visible breadcrumb truth.

---

# 29. Footer

## 29.1 Purpose

The footer provides trust, service recovery, core navigation and legal/company
identity. It is not a dumping ground for nonexistent pages or SEO keyword lists.

## 29.2 Content groups

- Brand and concise approved promise.
- Shop/category navigation.
- Order tracking and account recovery routes.
- Shipping, returns, privacy, terms and contact after those pages exist.
- Approved payment/delivery facts.
- Social links only when official and maintained.

## 29.3 Visual rules

- Solid or inverse surface is preferred over glass.
- Use clear columns on wide screens and stacked/accordion behavior only when accessible
  and justified on mobile.
- Heading labels are 12–14 px semibold; links are at least 14 px with 44 px practical
  touch spacing.
- Avoid low-contrast link walls.
- Do not show generic placeholders, dead links or fake accreditations.
- Newsletter, if approved, has explicit consent and is not preselected.

## 29.4 Migration

The existing footer correctly avoids dead links and surfaces order tracking. Preserve
that behavior. Expand content only when corresponding routes and approved copy exist.

---

# 30. Hero Section

## 30.1 System role

Hero is a reusable brand/merchandising section type, not a page wireframe. It
communicates one approved proposition and one dominant next action.

## 30.2 Allowed anatomy

- Optional eyebrow.
- One clear heading.
- Concise supporting text.
- One primary and at most one secondary action.
- Product/editorial media or approved abstract brand material.
- Optional verified trust cue.

## 30.3 Variants

| Variant | Suitable use |
|---|---|
| Product-led | One real flagship product or category |
| Collection-led | Approved collection story |
| Brand-led | Store promise with restrained liquid-light material |
| Split | Content and media in separate responsive regions |
| Immersive | Rare full-width editorial image with protected text |

## 30.4 Rules

- Mobile reading order is intentional, not a compressed desktop grid.
- Heading normally uses `--text-4xl` to fluid display scale; not every hero uses the
  maximum size.
- Supporting copy stays within roughly 50–60 characters per line.
- Calls to action remain visible without waiting for animation.
- Hero media has a stable aspect ratio and subject-safe responsive crop.
- No auto-advancing hero carousel.
- No background video by default.
- Glass framing is optional and follows section 8.
- Hero content and exact placement belong to the approved wireframe.

---

# 31. Search UI

## 31.1 Search roles

| Role | Contract |
|---|---|
| Search entry | Clear, persistent route into product discovery |
| Search field | Labeled query input with submit/clear behavior |
| Suggestions | Optional server-backed terms/products/categories |
| Results header | Query, total and recovery/filter context |
| No results | Helpful alternatives without fabricated matches |

## 31.2 Search field

- Uses `type="search"` and a programmatic label.
- Placeholder is concise, for example “Search products”.
- Submit works with Enter and an explicit control where appropriate.
- Clear control is labeled, appears only when useful and returns focus predictably.
- Query remains visible on the result page.
- Search uses URL state so deep links, refresh and Back work.

## 31.3 Suggestions panel

- Appears only when a suggestion feature is approved and data-backed.
- Uses an accessible combobox/listbox pattern with complete keyboard behavior.
- Distinguishes categories, queries and products through labels/structure.
- Does not show unsupported AI-generated product claims.
- Limits results to a scannable number and provides a “View all results” path.
- Uses Glass strong or solid elevated material with contrast-safe fallback.
- Closes on Escape and restores/retains focus appropriately.

## 31.4 Result states

- Loading preserves search/header/filter geometry.
- Zero results repeats the safe query text, suggests spelling/category recovery and
  never invents results.
- Malformed filters fall back to a recoverable valid state rather than a server error.
- Search ranking is not visually presented as “AI” unless an actual approved AI
  feature contributes.

---

# 32. AI Assistant UI

## 32.1 Status

AI UI is future-ready only. This DDS defines its safety and visual contract but does
not authorize an assistant, dependency, model provider, data collection or launch.

## 32.2 Entry patterns

Allowed future patterns after approval:

- Contextual “Help me choose” entry near discovery.
- Search refinement assistance.
- Product-comparison explanation.
- Support triage with clear escalation.
- Admin drafting/merchandising assistance with human approval.

A persistent floating chatbot is not the default. Entry placement requires evidence
that it helps the journey and does not cover commerce controls.

## 32.3 Visual identity

- Use the same component system; do not create a separate neon/robot aesthetic.
- A restrained indigo/cyan indicator may identify generated assistance.
- Use an “AI-assisted” text label where provenance matters; sparkles alone are
  insufficient.
- User and assistant content must be visually distinguishable without color alone.
- Generated recommendations show source/criteria or a concise “Why this” explanation
  when available.

## 32.4 Interaction contract

- State what the assistant can and cannot do.
- Show progress without fake typing delays.
- Provide cancel/stop for long generation.
- Preserve the user's query when an error occurs.
- Offer deterministic navigation and human/support recovery.
- Allow feedback without coercive prompts.
- Never represent uncertain model output as verified product, delivery, price, stock,
  policy or medical/safety fact.

## 32.5 Authority boundaries

The AI assistant must never independently:

- change price or promotion;
- claim stock or delivery not returned by authoritative services;
- add a different product/variant without explicit customer confirmation;
- place, cancel or refund an order;
- approve a bank transfer or payment;
- modify inventory;
- publish customer-visible content without the required approval workflow.

## 32.6 Privacy and accessibility

- Explain relevant data use before sensitive input.
- Avoid requesting payment secrets, passwords or unnecessary personal information.
- Responses are readable as normal document content and keyboard navigable.
- Status updates use restrained live regions.
- Conversation is not the only route to core functionality.
- Model failures do not block search, cart or checkout.

---

# 33. Empty States

## 33.1 Anatomy

1. Optional simple icon/illustration.
2. Specific state title.
3. One-sentence explanation.
4. One clear recovery action.
5. Optional secondary path.

## 33.2 Types

| Type | Example response |
|---|---|
| First use | Explain value and approved first action |
| No results | Preserve query and offer discovery alternatives |
| Filtered empty | Offer clear-filters action without discarding query unexpectedly |
| Empty cart | Return to shopping/collection discovery |
| No account orders | Explain state; do not imply error |
| Unpublished store/admin | Give operator-safe next step, never expose admin to customers |

## 33.3 Rules

- Do not blame the customer.
- Do not use jokes in financial, order or error-sensitive contexts.
- Do not add decorative action choices that create indecision.
- Customer-facing empty states never link to admin routes.
- Empty states use solid/soft surfaces; large glass effects are unnecessary.
- Illustration is optional; helpful text and recovery are required.

---

# 34. Loading States

## 34.1 Priority order

1. Preserve final layout geometry.
2. Keep already available content usable.
3. Communicate what is pending.
4. Avoid false progress or distracting motion.

## 34.2 Patterns

| Duration/context | Pattern |
|---|---|
| Under about 300 ms | Usually no indicator; avoid flash |
| Component fetch/action | Inline spinner/progress plus stable label |
| Page region | Geometry-matched skeleton |
| Multi-step operation | Explicit stage/progress only when stages are real |
| Navigation | Route loading shell preserving orientation |

## 34.3 Rules

- Primary action pending states prevent duplicate submission.
- A loading button preserves its width and accessible label.
- Independent slow sections may stream without blocking the shell.
- Never block an entire page for one noncritical region.
- Focus remains stable.
- Screen-reader announcements are concise and not repeated on every skeleton item.
- A timeout/unavailable path replaces indefinite loading.

---

# 35. Error States

## 35.1 Error levels

| Level | Presentation | Example |
|---|---|---|
| Field | Inline message linked to control | Invalid phone format |
| Form | Focusable summary plus field errors | Checkout validation failures |
| Component | Local error panel and retry/recovery | Recommendations unavailable |
| Page | Clear page error with safe navigation | Catalog data unavailable |
| System | Global service notice only when scope is truly global | Maintenance event |

## 35.2 Error anatomy

- What happened in customer language.
- What remains safe/preserved.
- Exact recovery action.
- Alternative path when retry is inappropriate.
- Support/correlation reference only when helpful and safe.

## 35.3 Rules

- Never expose stack traces, SQL, provider internals or secrets.
- Do not use “Something went wrong” without a recovery path when a more specific safe
  message is available.
- Errors use danger semantics plus icon/title/text, not red alone.
- Financial errors distinguish failed, pending and unknown outcomes; never invite
  blind repeated payment.
- Preserve form input unless security requires clearing it.
- Destructive failures explain whether the operation completed.
- AI failure is local and cannot become a store-wide error state.

---

# 36. Skeleton Loaders

## 36.1 Geometry

- Match the final component's image ratio, line count and block dimensions.
- Use the same grid and spacing tokens as loaded content.
- Do not render more skeleton cards than the expected first viewport needs.
- Avoid creating false controls that appear interactive.

## 36.2 Appearance

| Theme | Base | Highlight |
|---|---|---|
| Light | `#E2E6F0` | `#F0F2F8` |
| Dark | `#252B3A` | `#303646` |

Radius follows the destination component. A subtle one-cycle/fade or slow background
shift is allowed; continuous high-contrast shimmer is prohibited.

## 36.3 Accessibility and motion

- Skeleton containers are hidden from the accessibility tree when they convey no
  useful information.
- The region may expose one concise loading status.
- Under reduced motion, shimmer becomes static or a near-static opacity treatment.
- Skeletons are replaced atomically enough to avoid focus or layout disruption.

---

# 37. Toast Notifications

## 37.1 Appropriate use

Use toasts for transient confirmation or low-risk status that does not require the
customer to make a decision. Persistent or critical information stays inline.

## 37.2 Variants

- Neutral/information.
- Success.
- Warning.
- Error with an inline persistent alternative when recovery matters.

## 37.3 Anatomy

- Status icon.
- Short title or message.
- Optional one-word/short recovery action.
- Dismiss control with accessible name.

## 37.4 Behavior

- Desktop placement: top-right or bottom-right according to approved shell; one system
  position is selected during component implementation.
- Mobile placement: safe-area-aware top or bottom stack that does not cover navigation,
  cart actions or keyboard.
- Maximum three visible; additional notifications queue.
- Success may auto-dismiss after 4–6 seconds.
- Errors requiring action do not disappear automatically.
- Hover/focus pauses dismissal.
- Status is announced with appropriate `role="status"` or `role="alert"`.
- Never use a toast as the only confirmation of order/payment state.

---

# 38. Modal Design

## 38.1 Appropriate use

Modals are for focused decisions that must temporarily interrupt the underlying
context: confirmation, compact detail, authentication prompt or high-value choice.
They are not mini pages or a container for complex checkout flows.

## 38.2 Anatomy

- Scrim.
- Dialog surface.
- Title and optional description connected to dialog semantics.
- Content region.
- Clear action region.
- Close control when dismissal is allowed.

## 38.3 Sizes

| Token | Max width | Use |
|---|---:|---|
| Small | 400 px | Confirmation |
| Medium | 560 px | Standard form/detail |
| Large | 720 px | Complex approved content |

On compact screens a modal may approach full width with 16 px safe margin. Content
scrolls inside when required; critical actions remain reachable without covering
content.

## 38.4 Behavior

- Use the platform `<dialog>` where it meets requirements or an accessible equivalent.
- Move focus to the meaningful initial element.
- Trap focus while open and restore it to the trigger.
- Escape closes dismissible dialogs.
- Clicking the scrim closes only low-risk dismissible dialogs.
- Destructive confirmation defaults focus to the safe action, not destruction.
- Background is inert and does not scroll.
- Entry/exit use motion tokens and reduced-motion alternatives.

---

# 39. Drawer Design

## 39.1 Appropriate use

Drawers support mobile navigation, filters, cart preview or contextual detail that
benefits from preserving page context. They do not replace dedicated routes for long
or shareable workflows.

## 39.2 Placement

| Context | Placement |
|---|---|
| Mobile navigation | Left or full-height logical start |
| Filters on compact screens | Bottom sheet or logical side according to wireframe |
| Cart/context preview | Logical end on wide screens; approved bottom sheet on compact |
| Action chooser | Bottom sheet on touch devices |

## 39.3 Anatomy and behavior

- Scrim, surface, title, close control, content and optional fixed action region.
- Width: min(`90vw`, 400 px) for standard side drawer unless wireframe specifies more.
- Bottom sheet uses `--radius-xl` on top corners and respects safe-area insets.
- Focus is trapped/restored; Escape closes when dismissible.
- Swipe-to-close is never the only close method.
- Background scroll is locked without losing the original scroll position.
- Sticky actions do not cover scrollable content.
- Glass strong or solid elevated material is allowed; contrast fallback is required.

---

# 40. Mobile Navigation

## 40.1 Priority

At compact widths the persistent priority order is:

1. Brand/home.
2. Search.
3. Cart state.
4. Menu/categories.
5. Account.

The approved wireframe decides exact placement. This section defines behavior, not a
page composition.

## 40.2 Menu behavior

- Use a labeled menu button with expanded state.
- Open an accessible drawer or full-screen panel.
- Show concise category hierarchy with disclosure only where necessary.
- Preserve a visible search entry.
- Provide account/order paths without displacing primary discovery.
- Close on destination navigation, explicit close and Escape.
- Restore focus to the menu trigger.
- Prevent background interaction and scroll.

## 40.3 Touch and layout

- Interactive rows are at least 44 px high; 48–52 px is preferred.
- Safe-area insets are respected.
- Long category names wrap rather than shrink.
- No hover-only submenu.
- Horizontal category scrolling is allowed only for a concise secondary set and must
  remain keyboard accessible.
- Bottom navigation is not the default; it requires page-level journey evidence and a
  DDS amendment because it changes shell hierarchy.

## 40.4 Mobile search

Search may expand inline or open a dedicated search surface. It must focus predictably,
show an obvious close/back action, retain the query and avoid being hidden by the
on-screen keyboard.

---

# 41. Desktop Navigation

## 41.1 Structure

Desktop navigation uses a concise horizontal primary system with:

- wordmark/home link;
- approved top-level categories;
- search entry;
- account entry;
- cart entry with accessible state;
- optional theme control when theme choice remains approved.

The wireframe determines whether search is an inline field, expanding control or
dedicated surface. The system must remain understandable without expansion animation.

## 41.2 Dimensions

| Element | Target |
|---|---:|
| Primary header height | 64–72 px |
| Compact sticky header | 56–64 px when approved |
| Navigation target | 44 px minimum height |
| Wordmark safe height | 24–32 px according to final asset |
| Category gap | 20–28 px |

## 41.3 Behavior

- Categories fit without squeezing search/actions below practical sizes.
- Overflow uses an explicit “More” disclosure, not clipped text.
- Active state is available without requiring client route state in a shared cached
  layout; route-owned context may provide it where architecture permits.
- Dropdown/mega menu appears only when taxonomy depth requires it and has full keyboard
  behavior.
- Hover intent can delay opening briefly but focus/click work immediately.
- Sticky glass is allowed only when the wireframe approves it and scroll performance
  remains within budget.
- Header transitions do not cause content layout shift.

## 41.4 Mega-menu constraints

A mega menu requires real category depth, not visual ambition. It must:

- group links under semantic headings;
- avoid promotional imagery that overwhelms navigation;
- open/close through keyboard and pointer;
- remain within the viewport at zoom;
- use an elevated solid or strong-glass surface;
- never be the only way to reach a category.

---

# 42. Responsive Breakpoints

## 42.1 Breakpoint tokens

Use the existing Tailwind breakpoint model unless an approved content-pressure test
proves a need to change it.

| Token | Minimum width | Mode |
|---|---:|---|
| Base | 0 | Compact/mobile-first |
| `sm` | 640 px | Large mobile/small layout enhancement |
| `md` | 768 px | Tablet/medium composition |
| `lg` | 1024 px | Small laptop/wide navigation |
| `xl` | 1280 px | Standard desktop |
| `2xl` | 1536 px | Large desktop refinement |

Breakpoints describe layout capacity, not device names. Components may use container
queries in the future when parent width genuinely governs behavior and browser support
and implementation cost are approved.

## 42.2 Required viewport tests

| Context | Width |
|---|---:|
| Narrow mobile | 320 px |
| Common mobile | 375/390 px |
| Large mobile | 430 px |
| Tablet portrait | 768 px |
| Tablet landscape/small laptop | 1024 px |
| Desktop | 1280/1440 px |
| Wide desktop | 1920 px spot check |

Also test reduced viewport height, landscape mobile, 200% zoom, 400% reflow and
content stress.

## 42.3 Responsive rules

- Base CSS defines the complete narrow-screen experience.
- Larger modes enhance, reveal space and change composition without changing business
  meaning.
- No commerce rule depends on `window.innerWidth`.
- No required content exists only in one breakpoint.
- Reordered visuals preserve logical DOM/focus order.
- Grid changes occur when content needs them, not to match a device marketing width.
- At 320 px there is no page-level horizontal scroll; deliberate scroll regions are
  clearly bounded.
- Images define stable dimensions/crops at every mode.
- Touch controls remain large on touch-capable wide devices.

---

# 43. Motion Principles

## 43.1 Purpose

Motion may:

- confirm input;
- explain state change;
- preserve spatial context;
- reveal hierarchy;
- add a restrained moment of brand character.

Motion may not delay buying, hide final state, simulate system progress, create urgency
or compensate for unclear layout.

## 43.2 Motion hierarchy

| Priority | Motion type | Example |
|---:|---|---|
| 1 | Immediate feedback | Press, selection, validation |
| 2 | Spatial transition | Drawer, modal, disclosure |
| 3 | Content continuity | Image change, filter result update |
| 4 | Restrained entrance | Approved hero/section reveal |
| 5 | Ambient brand motion | Rare, optional and stoppable |

Higher-numbered motion is removed first when performance, accessibility or attention
conflicts occur.

## 43.3 Properties

- Prefer `transform` and `opacity`.
- Color/background transitions are allowed for small static controls.
- Avoid animating width, height, top, left, box-shadow and large backdrop-filter areas.
- Use discrete state change for price, stock, order and payment truth.
- Stop nonessential motion when off-screen or document visibility changes.
- No scroll hijacking, forced parallax or long card cascades.

## 43.4 Reduced motion

With `prefers-reduced-motion: reduce`:

- remove parallax and large translation;
- remove ambient loops and autoplay;
- use instant or near-instant opacity/state changes;
- preserve focus, confirmation and all information;
- do not replace visible feedback with nothing.

---

# 44. Animation Timing

## 44.1 Duration tokens

| Token | Duration | Use |
|---|---:|---|
| `--duration-instant` | 80 ms | Press/color acknowledgment |
| `--duration-fast` | 120 ms | Small hover/focus-adjacent state |
| `--duration-base` | 180 ms | Standard component transition |
| `--duration-moderate` | 240 ms | Popover/disclosure |
| `--duration-slow` | 320 ms | Drawer/modal movement |
| `--duration-reveal` | 420 ms | Rare approved content reveal |

Animations above 500 ms require explicit design approval. Deliberate progress follows
real operation time, not these decorative tokens.

## 44.2 Easing tokens

| Token | CSS value | Use |
|---|---|---|
| `--ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | General movement |
| `--ease-enter` | `cubic-bezier(0, 0, .2, 1)` | Entering content |
| `--ease-exit` | `cubic-bezier(.4, 0, 1, 1)` | Exiting content |
| `--ease-spring-soft` | `cubic-bezier(.2, .8, .2, 1)` | Restrained brand/press response |

Do not invent local cubic Bézier curves.

## 44.3 Sequencing

- Parent/child stagger is limited to 30–50 ms and no more than six visible items.
- Product grids do not animate every card on routine navigation.
- Primary content appears immediately; decoration may follow.
- Exit is normally faster than entry.
- Route transitions cannot create a blank waiting stage.

---

# 45. Micro-interactions

## 45.1 Approved patterns

| Interaction | Feedback |
|---|---|
| Button press | 1 px/`.98` press plus state color; optional under no-reduction |
| Add to cart | Immediate pending state, then badge/status confirmation |
| Select option | Border/ring, check indicator and accessible selected state |
| Favorite future action | Icon fill plus text/status; optimistic only with safe rollback |
| Input validation | Border/icon/message without shake |
| Copy action | Label changes briefly to “Copied” plus status announcement |
| Theme change | 180–200 ms color transition when motion allowed |
| Drawer/menu | Translate/fade with focus management |
| Product image thumbnail | Clear selected ring; short crossfade if geometry is stable |

## 45.2 Rules

- Feedback begins within 100 ms of input unless waiting for authoritative confirmation.
- Optimistic UI is not used for payment, stock decrement, refund or order state.
- Success animation cannot substitute for readable confirmation.
- No confetti for routine actions; order completion celebration requires separate
  approval and must be motion-safe.
- No shake errors, rubber-band controls or game-like reward loops.
- Haptics are not assumed on the web and cannot be the only feedback.

---

# 46. Accessibility Color Rules

## 46.1 Contrast requirements

- Normal text: at least 4.5:1 against its effective background.
- Large text: at least 3:1 when it meets WCAG large-text definition.
- UI boundaries, icons that convey meaning and focus indicators: at least 3:1 against
  adjacent colors.
- Disabled controls remain identifiable, though inactive component contrast has a WCAG
  exception; explanatory text still meets normal text contrast.
- Placeholder is supplemental and should target 4.5:1 where practical.

## 46.2 Glass verification

Token contrast on a flat background is insufficient for glass. Every text-bearing
glass recipe is tested over:

- the lightest supported background;
- the darkest supported background;
- the highest-contrast approved image crop;
- decorative indigo/cyan glow;
- light and dark theme.

If any supported combination fails, increase opacity/add a scrim or use a solid
surface. Text shadow is not a general contrast fix.

## 46.3 Status rules

- Pair color with icon, label, pattern or border.
- Success, warning, danger and information have separate text/surface/border tokens.
- Never use green/red alone to distinguish payment or stock states.
- Charts, if later approved, use accessible palettes and direct labels.

## 46.4 Focus and forced colors

- Focus ring uses a two-layer or outline/offset treatment that remains visible against
  both canvas and component.
- Do not remove outlines without an equal or stronger replacement.
- Test Windows forced-colors/high-contrast behavior.
- Use system colors/`forced-color-adjust` carefully where custom decoration obscures
  essential boundaries.

---

# 47. Dark Theme Rules

## 47.1 Theme model

The three-state model remains:

1. System preference when no explicit selection exists.
2. Explicit light.
3. Explicit dark.

The theme choice is respected before first paint to avoid a flash. Native `color-scheme`
matches the active theme.

## 47.2 Dark material behavior

- Canvas is near-black `#0B0E15`, not pure black.
- Elevation is shown primarily through lighter surfaces and borders, then shadow.
- Primary text is soft white `#F7F8FC`, not pure white everywhere.
- Brand primary becomes light indigo with dark text for reliable action contrast.
- Glass opacity increases slightly in dark mode.
- Product photography is not dimmed globally.
- Feedback colors use lighter dark-theme variants but preserve semantic meaning.

## 47.3 Dark-theme constraints

- Do not invert images or logos automatically.
- Do not reuse light shadows unchanged.
- Avoid large pure-white surfaces that cause glare; use theme surfaces.
- Borders remain visible without creating a bright grid around every component.
- Low-contrast “premium black” typography is prohibited.
- Review browser autofill, native controls, form validation and selection color.

## 47.4 Theme transition

When reduced motion is not requested, canvas, surface, text and border colors may
transition using `--duration-base`. Do not animate every descendant independently or
transition images, layout, blur and shadow during theme change.

---

# 48. Component Tokens

## 48.1 Token tiers

1. **Foundation:** raw palette, spacing, type, radius, shadow, blur and motion values.
2. **Semantic:** purpose-based values such as surface, text, action and feedback.
3. **Component:** stable dimensions/recipes for a real reusable component.

Component tokens are created only when multiple variants/states genuinely share the
value. A component token must map to semantic/foundation tokens rather than duplicate a
raw color.

## 48.2 Core semantic token registry

| Group | Required tokens |
|---|---|
| Background | `canvas`, `subtle`, `inverse`, `scrim` |
| Surface | `primary`, `secondary`, `elevated`, `selected`, `disabled` |
| Text | `primary`, `secondary`, `muted`, `inverse`, `link`, `on-brand` |
| Border | `subtle`, `strong`, `interactive`, `selected`, `danger` |
| Action | `primary`, `primary-hover`, `primary-active`, `secondary`, `tertiary`, `destructive` |
| Feedback | `success`, `warning`, `danger`, `information` text/surface/border triplets |
| Glass | `subtle`, `strong`, `border`, `highlight`, `fallback` |
| Commerce | `price`, `compare-price`, `discount`, `in-stock`, `out-of-stock` |
| Focus | `ring`, `ring-offset`, `ring-width` |

## 48.3 Initial component tokens

| Component | Tokens |
|---|---|
| Button | height small/medium/large/hero, padding, gap, radius |
| Input/select | height standard/dense, padding, radius, border width |
| Card | padding compact/standard, radius, border, elevation |
| Product card | media ratio, content gap, title size, price size |
| Navigation | header height, compact height, target height |
| Container | reading/content/wide/max widths, responsive gutter |
| Overlay | scrim, modal widths, drawer width, safe inset |
| Toast | width, gap, radius, elevation, stack gap |

## 48.4 State matrix

Every interactive component documents applicable states:

| State | Required visual | Required semantics |
|---|---|---|
| Default | Resting treatment | Correct native role/name |
| Hover | Supplemental pointer cue | No meaning unique to hover |
| Focus-visible | High-contrast external ring | DOM focus remains on control |
| Active/pressed | Immediate response | `aria-pressed` only when toggle semantics apply |
| Selected | Ring/border/icon/text cue | Native/ARIA selected state |
| Disabled | Reduced emphasis plus stable text | Native `disabled` where possible |
| Loading | Stable geometry and progress cue | Busy/status semantics when needed |
| Error | Icon/text/border | Connected error and invalid state |
| Success | Concise confirmation | Status announcement when needed |

---

# 49. CSS Variable Strategy

## 49.1 Runtime source of truth

CSS custom properties are the runtime source for themeable semantic tokens. Tailwind
utilities consume those variables. Raw foundation values remain in the theme layer and
are not scattered through components.

Recommended conceptual structure:

```css
@theme {
  /* Font and utility-generating foundation aliases. */
}

:root {
  /* Shared scale: space, radius, motion, container and type. */
  /* Light semantic theme: background, surface, text, border and actions. */
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* Dark semantic overrides. */
  }
}

:root[data-theme='dark'] {
  /* Explicit dark semantic overrides. */
}
```

## 49.2 Naming

- Use purpose-first names: `--surface-elevated`, not `--gray-2` in components.
- Use stable scale names for foundations: `--space-6`, `--radius-lg`.
- Use component scope only for a stable contract: `--button-height-md`.
- Do not name tokens after a page: `--homepage-card-blue` is prohibited.
- Do not encode light/dark in consumer names; themes override one semantic name.
- Use full words when ambiguity would outlive typing convenience.

## 49.3 Tailwind usage

- Prefer utilities that resolve approved CSS variables.
- Arbitrary values are limited to documented layout math or temporary migration and
  require review.
- Do not repeat long utility strings across several components; extract a primitive or
  semantic variant when reuse is real.
- Avoid dynamic string construction that Tailwind cannot discover.
- Keep conditional styling semantic and enumerable.

## 49.4 Migration mapping

| Current token | Target alias | Rule |
|---|---|---|
| `--color-bg` | `--background-canvas` | Keep compatibility alias during migration |
| `--color-surface` | `--surface-secondary` | Preserve until touched components migrate |
| `--color-fg` | `--text-primary` | Map without changing meaning |
| `--color-muted` | `--text-muted` | Verify contrast after mapping |
| `--color-border` | `--border-subtle` | Add strong/interactive aliases as needed |
| `--color-accent` | `--action-primary` | Preserve current value in light theme initially |
| `--color-accent-fg` | `--action-primary-text` | Rename semantically |
| `--color-accent-soft` | `--surface-selected` | Verify selected-state use |
| `--color-danger` | `--feedback-danger-text` | Add surface/border tokens |
| `--color-success` | `--feedback-success-text` | Add surface/border tokens |

## 49.5 Adoption rules

1. Inventory consumers before changing a legacy token.
2. Add aliases first.
3. Migrate the component in the active phase.
4. Validate light/dark, forced colors, contrast and visual regressions.
5. Remove aliases only when `rg` confirms no consumers and the removal is in scope.
6. Do not convert the entire repository during Homepage V2.

---

# 50. Future UI Expansion Rules

## 50.1 Entry gate

A new primitive, pattern, component variant, visual material or motion enters the
system only when:

- an approved product requirement needs it;
- existing components cannot satisfy the requirement without semantic distortion;
- accessibility behavior is defined;
- responsive and state behavior is defined;
- light/dark behavior is defined when both themes remain supported;
- performance/bundle impact is acceptable;
- duplication and maintenance cost are understood.

## 50.2 Reuse hierarchy

Before creating anything new:

1. Reuse an existing primitive unchanged.
2. Compose existing primitives.
3. Add a semantic variant to an existing component.
4. Extract a pattern after repeated verified use.
5. Create a new primitive only for a distinct interaction contract.
6. Propose a dependency only when platform/CSS/existing code cannot safely deliver it.

## 50.3 Change control

- Token changes that alter the whole product require Product Owner/UX approval and a
  visual regression plan.
- New component APIs require documentation of variants, states and examples.
- Page-specific exceptions do not automatically become system rules.
- Temporary exceptions have an owner, reason and removal trigger.
- Deprecate before removing a widely used component/token.
- Do not fork the design system for admin; use denser variants of shared semantics.
- Do not introduce a second UI kit alongside current primitives.

## 50.4 AI expansion

Every new AI UI pattern must pass the MDG AI entry gate and define:

- user value and evidence;
- model authority boundary;
- data/provenance display;
- loading, cancellation and failure behavior;
- human escalation;
- cost/rate limit behavior;
- accessibility and non-AI fallback;
- evaluation and removal criteria.

## 50.5 Localization expansion

Future Bengali/localized UI must:

- preserve semantic hierarchy rather than matching English line counts;
- support longer labels and changed line breaks;
- use an approved font with adequate glyph coverage and performance;
- format numbers, dates, addresses and money consistently with product policy;
- avoid text embedded in images;
- be tested at every required breakpoint and zoom level.

## 50.6 Governance outcome

The DDS is considered successfully adopted when future implementation changes can point
to approved tokens, component contracts and state behavior instead of inventing visual
rules inside page files.

---

# Appendix A — Consolidated Token Blueprint

This blueprint is normative. It records the intended names and relationships; it does
not authorize editing `globals.css` in this documentation task.

```css
:root {
  /* Typography */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 4rem;

  /* Spacing */
  --space-0: 0;
  --space-0_5: 0.125rem;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --space-32: 8rem;

  /* Shape */
  --radius-xs: 0.25rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --radius-pill: 999px;

  /* Motion */
  --duration-instant: 80ms;
  --duration-fast: 120ms;
  --duration-base: 180ms;
  --duration-moderate: 240ms;
  --duration-slow: 320ms;
  --duration-reveal: 420ms;
  --ease-standard: cubic-bezier(.2, 0, 0, 1);
  --ease-enter: cubic-bezier(0, 0, .2, 1);
  --ease-exit: cubic-bezier(.4, 0, 1, 1);
  --ease-spring-soft: cubic-bezier(.2, .8, .2, 1);

  /* Layout */
  --container-reading: 45rem;
  --container-content: 72rem;
  --container-wide: 80rem;
  --container-max: 90rem;
  --button-height-sm: 2.5rem;
  --button-height-md: 2.75rem;
  --button-height-lg: 3.25rem;
  --button-height-hero: 3.5rem;
  --input-height-standard: 3rem;
  --input-height-dense: 2.5rem;

  /* Light semantic theme */
  --background-canvas: #F7F8FC;
  --background-subtle: #F0F2F8;
  --surface-primary: #FFFFFF;
  --surface-secondary: #F7F8FC;
  --surface-elevated: #FFFFFF;
  --surface-inverse: #111421;
  --surface-selected: #EEF2FF;
  --surface-disabled: #F0F2F8;
  --text-primary: #111421;
  --text-secondary: #4D5568;
  --text-muted: #697186;
  --text-inverse: #FFFFFF;
  --border-subtle: #E2E6F0;
  --border-strong: #CBD1DE;
  --action-primary: #4F46E5;
  --action-primary-hover: #4338CA;
  --action-primary-text: #FFFFFF;
  --action-destructive: #B91C1C;
  --action-destructive-hover: #991B1B;
  --action-destructive-text: #FFFFFF;
  --focus-ring: #4F46E5;
  --feedback-success-text: #047857;
  --feedback-success-surface: #ECFDF5;
  --feedback-success-border: #A7F3D0;
  --feedback-warning-text: #A14B08;
  --feedback-warning-surface: #FFF7ED;
  --feedback-warning-border: #FED7AA;
  --feedback-danger-text: #B91C1C;
  --feedback-danger-surface: #FEF2F2;
  --feedback-danger-border: #FECACA;
  --feedback-info-text: #0369A1;
  --feedback-info-surface: #F0F9FF;
  --feedback-info-border: #BAE6FD;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --background-canvas: #0B0E15;
    --background-subtle: #121620;
    --surface-primary: #121620;
    --surface-secondary: #1A1E2B;
    --surface-elevated: #202534;
    --surface-inverse: #F7F8FC;
    --surface-selected: #25264A;
    --surface-disabled: #1A1E2B;
    --text-primary: #F7F8FC;
    --text-secondary: #CBD1DE;
    --text-muted: #AAB1C0;
    --text-inverse: #0B0E15;
    --border-subtle: #303646;
    --border-strong: #454C5F;
    --action-primary: #A5B4FC;
    --action-primary-hover: #C7D2FE;
    --action-primary-text: #0B0E15;
    --action-destructive: #FCA5A5;
    --action-destructive-hover: #FECACA;
    --action-destructive-text: #0B0E15;
    --focus-ring: #A5B4FC;
    --feedback-success-text: #6EE7B7;
    --feedback-success-surface: #0B2A22;
    --feedback-success-border: #166B55;
    --feedback-warning-text: #FBBF24;
    --feedback-warning-surface: #30200D;
    --feedback-warning-border: #7C4A0B;
    --feedback-danger-text: #FCA5A5;
    --feedback-danger-surface: #321416;
    --feedback-danger-border: #7F1D1D;
    --feedback-info-text: #7DD3FC;
    --feedback-info-surface: #0B2432;
    --feedback-info-border: #075985;
  }
}
```

The explicit `:root[data-theme='dark']` block must mirror the semantic overrides above,
as the current theme model already does. Repetition can be managed through build-time
organization only if it does not change runtime behavior or add an unnecessary tool.

---

# Appendix B — Component Readiness Checklist

A reusable component is ready for implementation review only when all applicable items
pass.

## B.1 Contract

- [ ] Purpose and non-purpose are documented.
- [ ] Data and event inputs are semantic and minimal.
- [ ] Existing primitives/patterns were evaluated first.
- [ ] Business logic stays in the owning domain layer.
- [ ] No page-specific branding leaks into a shared primitive.

## B.2 Visual system

- [ ] Uses approved semantic colors.
- [ ] Uses type, spacing, radius, shadow and motion tokens.
- [ ] Does not introduce arbitrary values.
- [ ] Supports approved light/dark behavior.
- [ ] Glass, if used, follows an approved recipe and fallback.

## B.3 Interaction states

- [ ] Default.
- [ ] Hover where applicable.
- [ ] Focus-visible.
- [ ] Active/pressed or selected where applicable.
- [ ] Disabled.
- [ ] Loading/pending.
- [ ] Empty/unavailable.
- [ ] Error and recovery.
- [ ] Success/confirmation where useful.

## B.4 Accessibility

- [ ] Semantic element/role is correct.
- [ ] Accessible name and description exist.
- [ ] Keyboard behavior is complete.
- [ ] Focus remains visible and predictable.
- [ ] Touch targets meet the practical 44 px minimum.
- [ ] Color and non-text contrast pass.
- [ ] Meaning does not rely on color/motion/hover alone.
- [ ] Reduced motion and forced colors are verified.
- [ ] Zoom/reflow and long text are verified.

## B.5 Performance and responsiveness

- [ ] Server Component by default; client boundary is minimal.
- [ ] No unnecessary dependency or browser listener.
- [ ] Stable layout geometry prevents CLS.
- [ ] Images use correct dimensions, `sizes` and loading priority.
- [ ] Motion uses performant properties.
- [ ] 320, 390, 768, 1024, 1440 and 1920 px spot checks pass.
- [ ] Slow-network state remains usable.

---

# Appendix C — Design QA Evidence Matrix

| Evidence | Required for token change | Primitive | Domain component | Page phase |
|---|:---:|:---:|:---:|:---:|
| Light/dark visual comparison | Yes | Yes | Yes | Yes |
| Contrast verification | Yes | Yes | Yes | Yes |
| Keyboard test | N/A | Yes | Yes | Yes |
| Screen-reader spot check | N/A | Interaction-dependent | Yes | Yes |
| Reduced-motion test | Motion-dependent | Motion-dependent | Motion-dependent | Yes |
| 320 px and zoom/reflow | Scale-dependent | Yes | Yes | Yes |
| Loading/error/empty states | N/A | State-dependent | Yes | Yes |
| Lighthouse/bundle comparison | Impact-dependent | Impact-dependent | Yes | Yes |
| Product/content stress cases | N/A | Input-dependent | Yes | Yes |
| Approved wireframe comparison | N/A | N/A | When shown | Yes |

Visual review uses real or representative catalog content, including long titles, large
BDT values, missing imagery, unavailable variants, validation errors and empty data.
Placeholder-only review is insufficient.

---

# Appendix D — Prohibited Shortcuts

Work must not:

- copy a reference brand's page, component or proprietary visual asset;
- add a UI framework, icon library, animation library or font without dependency
  approval;
- create a second button/input/card system;
- paste raw hex values or arbitrary spacing into page components;
- apply glass to every surface;
- use animation to hide slow loading or unclear hierarchy;
- create testimonials, reviews, badges, stock pressure or trust claims without data;
- place AI branding on deterministic functionality;
- use desktop-only hover as a required interaction;
- reduce text or touch targets to make a crowded wireframe fit;
- change checkout, authentication, payment, inventory or admin styling during an
  unrelated storefront task;
- treat a screenshot at one width as responsive acceptance;
- commit generated visual experiments or unused assets;
- mark the DDS implemented when only tokens were added.

---

# Appendix E — Page-Wireframe Handoff Contract

This DDS intentionally does not define page section order. Every page wireframe must
reference this system and provide:

1. Page purpose and success action.
2. Approved content/section order for desktop and mobile.
3. Component/pattern mapping to DDS contracts.
4. Responsive changes at content-pressure points.
5. Real data requirements and truthful badge/trust rules.
6. Loading, empty, error and unavailable states.
7. Keyboard/focus behavior for overlays and dynamic regions.
8. Media ratio/crop and LCP candidate.
9. Motion annotations using DDS tokens.
10. Explicit exclusions/protected modules.

Where a wireframe needs a component or token not defined here, the design team amends
the DDS or records an approved exception before implementation. Work does not invent
the missing rule.

---

# Appendix F — Phased Adoption Plan

| Stage | DDS adoption scope | Explicit exclusion |
|---|---|---|
| Design approval | Review palette, type, glass, motion and core component contracts | No source changes |
| Responsive wireframes | Map sections and states to DDS components | No UI implementation |
| Component foundation | Add required semantic aliases and touched primitives | No repo-wide restyle |
| Homepage V2 | Storefront shell and homepage-only components from approved wireframes | Checkout, auth, admin unchanged |
| Listing/search V2 | Filters, grids, product cards and search states | Commerce rules unchanged |
| Product detail V2 | Gallery, variants and buy-region presentation | Inventory/pricing authority unchanged |
| Cart/checkout V2 | Visual/interaction migration under commerce invariants | No calculation/payment shortcut |
| Account/admin V2 | Denser variants and operational patterns | No second design system |
| AI UI | Only approved evidence-driven cases | No autonomous commerce authority |

Each stage follows the MDG Definition of Done and reports which DDS tokens/components
were adopted, deferred or intentionally left unchanged.

---

# Appendix G — Approval Decisions Required Before UI Implementation

The Product Owner and UX Director should explicitly approve:

- the public brand name/wordmark treatment;
- the Clear Liquid Commerce direction;
- light and dark semantic palettes;
- indigo primary and cyan decorative accent;
- Inter as the V2 Latin/UI typeface;
- 4:5 default product-grid media ratio;
- radius, glass and elevation intensity;
- navigation behavior selected by responsive wireframes;
- whether dark theme remains a launch feature;
- hero content and media in the page wireframe;
- final toast placement if the system is introduced;
- any future AI entry point and label.

Unapproved content, offers, claims, imagery and page layouts remain outside Work's
authority even after the visual system is approved.

---

## Permanent implementation rule

Future Work sessions must read the SAS, MDG, this DDS and the active approved wireframe
before changing UI. They implement the smallest complete approved scope, reuse existing
components, protect commerce invariants, test every applicable state and stop when the
task is complete. They do not make product or visual decisions that the governing
documents leave unresolved.
