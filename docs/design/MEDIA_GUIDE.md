# SirajiBD Media Guide

| Field | Value |
|---|---|
| Document | Media Guide |
| Public brand | SirajiBD |
| Platform identity | AgentSiraji Commerce V2 — internal/portfolio use only |
| Version | 0.9 |
| Status | Planning baseline — standards approved by prior specifications; asset approvals pending |
| Date | 2026-08-09 |
| Owner | Product Owner |
| Applies to | Storefront, catalog, transactional, SEO, social and future AI-assisted media |
| Current implementation scope | Homepage V2 planning; no application code or media created by this document |

## Version History

| Version | Date | Author/owner | Summary |
|---|---|---|---|
| 0.9 | 2026-08-09 | Product Owner with Work documentation support | First repository-audited media standard aligned with the approved SAS, MDG, DDS, Homepage wireframes, Component Library and Content Guide. Records the current product-image pipeline and the absence of approved checked-in Homepage/brand assets. |

## How to Use This Guide

This document is the media authority for SirajiBD. It defines what media is required,
what exists, how assets must be created and approved, and how they behave across devices.
It does not authorize a claim, promotion, review, product representation, person likeness,
policy or feature.

Use these status labels exactly:

| Status | Meaning | May ship? |
|---|---|---:|
| **Approved** | Exact asset, usage, rights, crop and accessibility treatment approved by the Product Owner | Yes, subject to technical QA |
| **Existing — audit required** | Media may exist in production storage or catalog data, but this documentation pass did not verify every asset and right | Only after audit |
| **Required — missing** | Release or a specific section needs the asset and no approved asset exists | No |
| **Optional — missing** | The experience has an approved non-media fallback | Yes, with the fallback |
| **Gated** | Content, data, consent, policy or feature approval must exist before the asset may be used | No, until the gate passes |
| **Future** | Valid later requirement outside Homepage V2 | No for Homepage V2 |
| **Not applicable** | The surface should not use media for this purpose | Yes without media |
| **Rejected/retired** | Asset must not be selected or delivered | No |

### Authority order

When sources conflict, apply this order:

1. Applicable law, license, consent, privacy and approved policy requirements.
2. Product truth, real catalog data and authoritative operational configuration.
3. Product Owner-approved brand, campaign and content decisions.
4. This Media Guide.
5. Content Guide and Design Design System.
6. Component Library and page wireframes.
7. Implementation task prompts.

Media never overrides product color, condition, dimensions, included items, price,
availability, offer terms, delivery facts or customer rights.

---

# 1. Approved Brand Foundation

All media must express the following approved decisions:

| Decision | Approved value | Media implication |
|---|---|---|
| Public brand | SirajiBD | Customer-facing brand assets say SirajiBD, not AgentSiraji Commerce |
| Platform identity | AgentSiraji Commerce V2 | May appear only in internal/portfolio material unless a later colophon is approved |
| Positioning | Smart, trustworthy everyday shopping for Bangladesh | Prefer useful product clarity and believable local context over spectacle |
| Audience | Young professionals | Calm, contemporary and time-respectful compositions; no forced youth slang or stereotypes |
| Personality | Modern, honest, intelligent, reliable and friendly | Clean hierarchy, accurate media, restrained effects and approachable people/context |
| Homepage purpose | Enter the right shopping path quickly | Media supports category recognition and product discovery; it does not delay the CTA |
| Primary action | Browse categories | Hero composition must protect the CTA and make category discovery visually obvious |
| Language | English first; complete Bengali later | No essential language is baked into an image; future localization must not require new photography |

## 1.1 Visual promise

SirajiBD media should help a customer answer one of four questions:

1. What is this product or category?
2. Is the representation believable and accurate?
3. Is this relevant to my everyday life?
4. What can I do next?

An asset that answers none of these questions should justify its performance and
attention cost or be removed.

---

# 2. Repository Media Audit

## 2.1 Audit scope

The audit covered tracked repository files, source references, catalog schema, product
media components, storage abstraction, Next.js image configuration, CSP image sources,
current Homepage implementation and all approved planning documents.

It did not query or export the live production database or Cloudinary account. Production
catalog assets therefore require a separate inventory before release.

## 2.2 Verified current capabilities

| Capability | Current state | Decision |
|---|---|---|
| Product image records | `product_images` stores provider key, optional alt, order and product relation | Preserve; media truth stays catalog-owned |
| Image delivery | `src/lib/storage` abstraction with Cloudinary implementation | Preserve provider seam; do not construct provider URLs in components |
| Responsive format | Cloudinary `quality:auto` and `format:auto`; Next config prefers AVIF/WebP | Preserve; do not maintain duplicate hand-exported delivery formats |
| Product upload | Admin direct upload to Cloudinary, currently images up to 5 MB | Existing capability; validate type, dimensions, rights and alt workflow before V2 release |
| Product gallery | Responsive main image, thumbnails and lightbox | Existing — audit/refine against V2 ratio and focus requirements |
| Product cards | Next Image with responsive `sizes`; current card media is square | Existing — extend to the DDS 4:5 V2 grid ratio |
| Missing-product state | Text fallback says `No image` | Existing — redesign visually without hiding missing truth |
| Remote image allowlist | `res.cloudinary.com` only, plus same-origin/data/blob in CSP | Preserve unless a security-reviewed provider change is approved |
| Interface icons | Small inline SVGs in current shell | Preserve for current icon volume; no icon dependency is authorized |
| Homepage hero/category/story media system | No implementation or asset source | Missing; follow the approved fallback/gating rules below |

## 2.3 Verified repository asset inventory

No checked-in `.avif`, `.webp`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`,
`.mp4`, `.webm` or `.mov` asset was found during this audit.

This means the repository currently has:

- no approved SirajiBD logo or wordmark file;
- no favicon or application icon;
- no Homepage hero image;
- no category editorial images;
- no Homepage promotional or brand-story media;
- no Open Graph/social-sharing image;
- no illustration library;
- no checked-in video;
- no asset manifest recording ownership, rights, expiry, alt text or crop approval.

Inline interface SVG markup is source code, not an approved brand-asset inventory.

## 2.4 Production inventory requirement

Before Homepage V2 release, an authorized person must export or inspect the active
catalog media records without publishing secrets and record:

- product ID, slug and image order;
- storage key or stable internal asset ID;
- original dimensions, format and byte size;
- alt text status;
- primary/supporting role;
- product/variant/color represented;
- owner/source and usage rights;
- duplicate, broken or orphan status;
- crop QA result for 4:5 cards and approved product-detail ratio.

The production audit updates the asset register; it must not paste signed URLs, API keys
or storage credentials into this file.

---

# 3. Media Principles

1. **Truth before atmosphere.** Product media is evidence first.
2. **Products before decoration.** Media must not compete with price, title, variant or action.
3. **One focal subject.** Avoid busy collage treatments for core commerce surfaces.
4. **HTML owns meaning.** Headings, price, terms, stock, CTAs and essential translations remain real text.
5. **Local relevance without stereotype.** Bangladesh context should be believable and specific only when supported.
6. **Stable geometry.** Every delivered image has explicit dimensions or a reserved ratio.
7. **Art-directed crops.** A narrow crop is approved, not accidental.
8. **Performance is a content constraint.** An attractive asset that breaks the page budget is not release-ready.
9. **Fallbacks remain useful.** Missing or failed media must not break discovery or conversion.
10. **Rights travel with the asset.** Unknown provenance means the asset is not approved.

---

# 4. Media Types and Allowed Roles

| Media type | Allowed role | Homepage V2 status |
|---|---|---|
| Real product photography | Product cards, product detail and approved product-led editorial | Required for publishable products; inventory audit pending |
| Category/editorial photography | Featured category recognition | Optional per card; text fallback is approved |
| Brand-led abstract material | Hero fallback and restrained supporting backgrounds | Allowed; CSS/token implementation preferred over raster |
| Lifestyle photography | Hero, category, brand story or campaign when truthful and rights-cleared | Optional/gated by exact surface |
| Interface icons | Navigation, trust facts, actions and statuses | Allowed as approved inline SVG |
| Illustrations | Empty states, education and future AI explanation | Optional/future |
| Customer/reviewer media | Reviews only with consent and moderated source | Gated |
| Promotional artwork | Active approved campaign only | Gated |
| Video | Product demonstration or approved editorial story | Future; no Homepage V2 background video |
| Generated imagery | Decorative/editorial use under Section 25 | Restricted; never product evidence |
| Third-party logos/badges | Actual enabled provider/partner with written use authority | Gated; never decorative trust theatre |

---

# 5. Photography Direction

## 5.1 Product photography

- Show the actual sellable product accurately.
- Primary image shows the complete product with comfortable edge clearance.
- Use consistent light direction, color temperature and background within a category.
- Use neutral white, pearl, very light gray or a restrained tonal surface that preserves color.
- Secondary images may show scale, detail, texture, packaging, included items and truthful use.
- If color differs by variant, represent and label each variant accurately.
- Do not hide defects, recolor the product, add absent features or imply included accessories.
- Do not use a supplier render as documentary photography unless it is labeled and verified.
- Avoid essential copy, price badges, delivery claims and promotional stickers inside the primary image.

## 5.2 Lifestyle photography

- Show plausible everyday contexts relevant to Bangladesh and the intended product use.
- Cast, styling, locations and props should feel contemporary without implying unaffordable luxury.
- Preserve accurate skin tone and product color.
- Leave negative space only when the selected responsive crop protects the subject.
- Do not stage unsafe, illegal or product-incompatible use.
- Do not imply a customer endorsement merely because a person appears with a product.
- Model/property releases are required where applicable.

## 5.3 Brand/editorial photography

Brand photography should feel clear, calm and useful. Use real moments, organized
compositions, natural materials and controlled light. Avoid generic corporate teams,
warehouse claims, founder stories or local-business scenes unless they truthfully
represent SirajiBD and have owner approval.

## 5.4 Retouching limits

Allowed:

- exposure, white balance and lens correction;
- dust/background cleanup that does not change the item;
- perspective correction;
- consistent crop and tonal balancing;
- privacy-safe removal of incidental identifying information.

Prohibited:

- changing product color, texture, construction or included contents;
- removing a real limitation or defect that materially changes expectation;
- compositing a product into an implausible use case;
- adding certification, rating, badge or packaging not present;
- slimming, reshaping or skin retouching that misrepresents a person;
- using filters that destroy color accuracy.

---

# 6. Background, Lighting and Composition

| Element | Standard |
|---|---|
| Background | Neutral/soft tonal; visually consistent within a card grid |
| Light | Soft, directional and color-consistent; retain real texture |
| Shadow | Natural or restrained; no floating cutout unless the category style intentionally uses it |
| Framing | One focal object; product edge clearance normally 8–12% of frame |
| Horizon | Level unless an approved editorial composition requires otherwise |
| Depth | Enough separation for clarity; excessive blur must not hide product context |
| Glass/liquid material | Applied by UI tokens where possible, not baked into product evidence |
| Text-safe space | Intentional and crop-tested; core Homepage V2 copy still remains outside media on mobile |

---

# 7. Color Accuracy and Theme Behavior

- Authoring and export use sRGB unless the approved delivery pipeline documents another web-safe profile.
- Remove unsupported embedded profiles only after visual comparison.
- Check representative assets on calibrated light and dark UI surfaces.
- Product media is never inverted or recolored for dark theme.
- A neutral media container may change by theme; the product pixels do not.
- Transparent assets need a visible light/dark QA pair and a fallback background.
- Text over an approved image uses the DDS scrim and must pass contrast on the worst approved crop.
- Do not rely on the image color to communicate status or action.

---

# 8. Aspect-Ratio System

| Role | Required/preferred ratio | Rule |
|---|---:|---|
| Product grid primary | **4:5** | V2 standard; consistent across one grid |
| Product detail primary | **4:5** or **1:1** | Choose by category and keep the gallery consistent |
| Product detail supporting | 4:5, 1:1 or detail crop | May vary only when thumbnail/gallery geometry communicates it safely |
| Category card | **4:5** preferred | Text fallback allowed; one set may not mix ratios |
| Hero desktop | **4:3** preferred within split region | Separate approved crop or focal-point-safe master |
| Hero tablet | **16:10** or **4:3** | Select the crop that preserves subject and hierarchy |
| Hero mobile | **4:5** | Copy precedes media; no text baked into crop |
| Promotional banner desktop | **16:9** | Gated; qualification remains HTML text |
| Promotional banner mobile | **4:5** or **1:1** | Separate art direction normally required |
| Brand story desktop | **3:2** or **4:3** | Editorial crop |
| Brand story mobile | **4:5** | Media precedes copy per wireframe |
| Reviewer/avatar | **1:1** | Optional and gated by consent |
| Open Graph/social share | **1200:630** | Dedicated composition; keep safe zone clear |
| Social feed portrait | **4:5** | Campaign-only derivative, not a storefront source |
| Social story/reel | **9:16** | Campaign/video only; protect UI-safe zones |

CSS must reserve the chosen ratio before the asset loads. `object-fit` and focal position
are part of the asset approval record, not arbitrary per-component styling.

---

# 9. Responsive Crop and Safe-Area Rules

## 9.1 Crop approval

Every art-directed asset is reviewed at minimum at 320, 390, 768, 1024, 1440 and 1920
px page widths in its real component. Approval must cover:

- focal subject retained;
- faces, hands, product boundaries and important context not cut accidentally;
- no crop creates a misleading product representation;
- contrast remains valid;
- adjacent copy does not collide with the subject;
- no embedded mark or decorative text is removed;
- long English and future Bengali content do not force a damaging crop.

## 9.2 Focal point

Record a focal point as normalized `x` and `y` values from `0` to `1`, or use `center`
when truly safe. A future media model may store this value; until then it belongs in the
asset register and approved component mapping.

## 9.3 Safe-area guidance

| Asset | Primary safe area |
|---|---|
| Hero desktop | Keep the subject within the central 70%; preserve the inner edge nearest copy |
| Hero mobile | Keep critical subject within central 80% width and middle 70% height |
| Promotional desktop | Keep subject/mark within central 80%; qualification/CTA remain HTML |
| Open Graph | Keep brand and focal content within central 80% width and 70% height |
| 9:16 social | Keep essential content clear of top/bottom platform overlays; validate per publishing platform |

Safe-area percentages are QA starting points, not permission to embed essential text.

---

# 10. Source Dimensions

These are source-master targets, not a request for the browser to download the master.
The delivery layer must generate responsive derivatives.

| Asset role | Preferred source dimensions | Minimum accepted when visibly sharp |
|---|---:|---:|
| Product 4:5 | 2000 × 2500 px | 1200 × 1500 px |
| Product 1:1 | 2000 × 2000 px | 1200 × 1200 px |
| Category 4:5 | 1600 × 2000 px | 960 × 1200 px |
| Hero desktop 4:3 | 2000 × 1500 px | 1440 × 1080 px |
| Hero mobile 4:5 | 1200 × 1500 px | 800 × 1000 px |
| Promotional desktop 16:9 | 1920 × 1080 px | 1280 × 720 px |
| Promotional mobile 4:5 | 1200 × 1500 px | 800 × 1000 px |
| Brand story 3:2 | 1800 × 1200 px | 1200 × 800 px |
| Reviewer/avatar 1:1 | 800 × 800 px | 400 × 400 px |
| Open Graph | 1200 × 630 px | 1200 × 630 px |
| Social feed portrait | 1080 × 1350 px | 1080 × 1350 px |
| Social square | 1080 × 1080 px | 1080 × 1080 px |
| Social story/reel | 1080 × 1920 px | 1080 × 1920 px |

Upscaling a small image does not make it compliant. Vector marks and illustrations do
not use raster dimension targets but still require a defined viewBox and display QA.

---

# 11. Formats and Encoding

## 11.1 Source masters

| Source type | Preferred format | Notes |
|---|---|---|
| Photography | High-quality JPEG or lossless production master | Keep archival source outside the delivery repo when appropriate |
| Transparent raster | PNG master | Use only when transparency is required |
| Simple illustration/icon/logo | SVG | Sanitize; no scripts, external references or embedded tracking |
| Delivered photography | AVIF/WebP negotiated automatically | Use storage/Next image pipeline, not manual `<picture>` duplication by default |
| Open Graph fallback | JPEG or PNG, 1200 × 630 | Verify crawler compatibility and file size |
| Animation | WebM/MP4 only after approval | Provide poster and accessible equivalent; no animated GIF for long animation |

## 11.2 Delivery rules

- Use `storage.url()` for provider-backed catalog media.
- Use Next Image for responsive storefront images unless a documented existing exception applies.
- Do not import Cloudinary directly outside the storage adapter.
- Do not add a second image CDN or unlisted remote host without architecture/security review.
- Do not commit duplicate AVIF, WebP and JPEG derivatives when the delivery pipeline generates them.
- Preserve immutable/versioned delivery behavior so replacements invalidate safely.
- Strip unnecessary EXIF, GPS and device metadata before public delivery.

---

# 12. File Naming and Identity

Use lowercase kebab case for logical source names:

`{brand-or-domain}-{surface}-{subject}-{ratio}-{locale}-v{NN}.{ext}`

Examples:

- `sirajibd-home-hero-everyday-4x5-en-v01.jpg`
- `sirajibd-category-accessories-4x5-neutral-v02.jpg`
- `product-{stable-product-id}-primary-4x5-v01.jpg`
- `product-{stable-product-id}-detail-texture-1x1-v01.jpg`
- `sirajibd-og-home-1200x630-en-v01.jpg`

Rules:

- Do not use `final`, `new`, `latest`, spaces, dates without purpose or camera filenames.
- Do not expose customer names, phone numbers, order numbers or sensitive identifiers.
- A storage provider may generate its own key; retain the logical name in the asset
  register rather than relying on a mutable public URL.
- Variant and color identifiers must match authoritative catalog vocabulary.
- Replacement requires a new asset version and approval record, not silent overwrite.

---

# 13. Recommended Asset Organization

No folders are created by this guide. When implementation begins, use this ownership
model unless the SAS/MDG review selects an equivalent:

| Asset class | Recommended owner/location |
|---|---|
| Product media | Catalog database + storage abstraction under product-owned folders |
| Dynamic campaign media | Future campaign/content owner + storage abstraction |
| Stable SirajiBD marks/favicons/OG fallback | `public/media/brand/` after approval |
| Stable Homepage editorial media | `public/media/home/` only if truly build-owned; otherwise storage-backed content owner |
| Interface icons | Sanitized inline SVG or approved shared icon component |
| Illustrations | `public/media/illustrations/` after approval |
| Media manifest | `docs/design/media/ASSET_REGISTER.md` or structured admin/content data when volume justifies it |

Do not create a parallel image-loader or hard-code Cloudinary URLs in page components.

---

# 14. Homepage V2 Asset Register

## 14.1 Release baseline

| ID | Surface | Asset | Status | Blocks Homepage V2? | Approved fallback/gate |
|---|---|---|---|---:|---|
| `BR-01` | Global | SirajiBD wordmark/logo | Required — missing | **Yes** for final branded launch | Text wordmark may be used during implementation only if Product Owner approves it as the launch mark |
| `BR-02` | Browser/PWA | Favicon/application mark | Required — missing | **Yes** for final production launch | Temporary framework/default icon prohibited |
| `HP-01` | Hero | Desktop/tablet editorial media | Optional — missing | No | DDS brand-led liquid-light CSS fallback |
| `HP-02` | Hero | Mobile 4:5 editorial media | Optional — missing | No | Same approved media-free fallback; do not fake product/lifestyle imagery |
| `HP-03` | Featured categories | Category media set | Optional — missing; data integration absent | No | CategoryCard `text-fallback`; all category names/routes remain authoritative |
| `HP-04` | Product sections | Product primary images | Existing — audit required | Yes per affected product | Product with missing media may use honest fallback only if catalog release policy permits it |
| `HP-05` | Promotional banner | Desktop/mobile campaign media | Gated | No; section omitted | Active approved campaign with complete terms and asset rights |
| `HP-06` | Trust indicators | Inline fact icons | Existing pattern; V2 set not finalized | No | Text carries meaning; approved inline SVG only |
| `HP-07` | Why buy from us | Supporting icons/illustration | Optional — missing | No | Text-only verified reasons; section omitted if facts are insufficient |
| `HP-08` | Reviews | Reviewer/product media | Gated | No; section omitted | Real moderated review source and consented attribution |
| `HP-09` | Brand story | Editorial/founder/operations media | Gated and missing | No; section omitted | Approved Brand Story copy, truthful media, rights and live destination |
| `HP-10` | Newsletter | Supporting media | Not applicable | No | Newsletter itself remains gated; no decorative image needed |
| `SEO-01` | Homepage metadata | Open Graph image | Required — missing | Yes for public launch/social QA | Approved 1200 × 630 branded composition |
| `SOC-01` | Social profiles | SirajiBD avatar/cover set | Future for site implementation | No | Approve separately per channel |

## 14.2 Initial Homepage decision

Homepage V2 implementation may proceed without hero photography, category imagery,
promotion, reviews or Brand Story media because the approved wireframes define safe
fallbacks or omission. It may not invent these assets merely to fill the layout.

Final public launch still requires an approved SirajiBD brand mark/favicon decision and
Open Graph asset. Product cards require an audited, honest media/fallback policy.

---

# 15. Brand Identity Assets

## 15.1 Required package

| Asset | Preferred form | Required variants |
|---|---|---|
| Primary wordmark | Sanitized SVG | Light-surface and dark-surface behavior |
| Compact mark | Sanitized SVG | Square-safe; readable at 24–32 px |
| Favicon | ICO/PNG generated from approved compact mark | 16, 32 and browser-required sizes |
| Application icon | PNG from approved master | 192 and 512 px if PWA/app metadata uses them |
| Monochrome mask | SVG/PNG as platform requires | Only if browser/platform use is implemented |
| Open Graph brand lockup | Raster composition | 1200 × 630 |

## 15.2 Usage rules

- Use `SirajiBD` exactly; do not make AgentSiraji the customer-facing master brand.
- Do not stretch, skew, outline, glow or apply unapproved gradients.
- Preserve clear space defined when the final mark is approved.
- Do not put the mark on low-contrast uncontrolled imagery.
- Do not use a logo as alt text when adjacent visible brand text already conveys it;
  decorative duplicates use empty alt.
- A text wordmark is acceptable only as an explicitly approved brand treatment, not as
  an accidental placeholder that silently becomes permanent.

---

# 16. Hero Media Specification

| Field | Desktop/tablet | Mobile |
|---|---|---|
| Role | Support the approved proposition and category-entry action | Reinforce proposition after copy/actions |
| Ratio | 4:3 preferred; 16:10 at some tablet widths | 4:5 |
| Source | 2000 × 1500 preferred | 1200 × 1500 preferred |
| Subject | Real approved product/category/lifestyle context or restrained brand material | Same truth; crop independently approved |
| Text | No essential text embedded | No essential text embedded |
| DOM/order | Media beside copy in split layout | Copy and CTAs precede media |
| Priority | Only if it is the actual LCP candidate | Only page-wide likely LCP image receives priority |
| Alt | Describe meaningful visible subject; empty for abstract decorative material | Same, based on the mobile crop |
| Failure | Render copy/actions on approved solid/liquid-light surface | Same; preserve ratio only when useful, otherwise collapse decorative media safely |

Prohibited hero treatments:

- slideshow or auto-advancing carousel;
- autoplay background video;
- fake marketplace scale or warehouse imagery;
- model/customer endorsement without consent/context;
- AI-generated product evidence;
- embedded H1, CTA, price, discount or delivery claim;
- parallax or motion required to understand the content.

---

# 17. Category Media Specification

Category media should help a customer recognize the destination, not imply a product is
included or available when it is not.

| Field | Rule |
|---|---|
| Ratio | 4:5 across the complete Featured Categories set |
| Source | 1600 × 2000 preferred |
| Subject | Representative real product/context from that active category, or approved abstract category material |
| Label | Visible HTML category name; never image-only |
| Alt | Empty when the visible category label fully names the destination and image is representative decoration; descriptive only when it adds meaningful information |
| Loading | Lazy below hero with accurate `sizes` |
| Missing | Use CategoryCard text fallback; do not mix obvious placeholders with approved photography |
| Data | Active category ID, name and route remain catalog authority |

The current category schema has no image field. Homepage V2 must therefore use the
text-fallback or an architecture-approved mapping/data extension; a page-local array of
untracked image URLs is not authorized.

---

# 18. Product Media Specification

## 18.1 Required sequence

For a publishable product, the ideal sequence is:

1. Primary full-product image.
2. Alternate angle or rear/side view.
3. Detail/texture/construction view.
4. Scale or truthful use-context view.
5. Packaging/included-items view when it affects expectation.
6. Variant-specific image where color/style differs materially.

The exact count depends on product complexity. Do not add duplicate angles to inflate the
gallery.

## 18.2 Primary product contract

| Field | Rule |
|---|---|
| Ratio | 4:5 for V2 product grids |
| Resolution | 2000 × 2500 preferred; 1200 × 1500 minimum |
| Crop | Complete product visible; centered or recorded focal point |
| Background | Consistent within category/grid |
| Text | No price/promotion/stock badge baked in |
| Truth | Exact sellable item/variant; included props clearly distinguished |
| Alt | Product name plus visible differentiator only; no claim or keyword stuffing |
| Priority | At most the actual LCP product image page-wide |

## 18.3 Product-detail contract

- Gallery order is authoritative and stable.
- Thumbnail alt may be empty when its control has an accessible label.
- Zoom/fullscreen media must not request an unnecessarily large asset until opened.
- Lightbox controls retain keyboard, focus and close behavior.
- Missing image does not substitute an unrelated product.
- Failed image delivery preserves product title, price and actions where commerce rules
  allow the product to remain published.

## 18.4 Variant media

- Associate media with a variant only when the data model and selector can do so reliably.
- Never switch media to an approximate color not represented by the chosen variant.
- Alt text may include approved color/variant when visible and useful.
- If variant-media mapping is absent, copy must not promise that the gallery updates by selection.

---

# 19. Promotional Media Specification

**Status: Gated.** A promotional asset requires an approved campaign record containing
owner, scope, benefit, eligibility, start/end timestamps with timezone, terms,
destination, evidence and withdrawal behavior.

Rules:

- Campaign ID belongs in the asset record.
- Price, percentage, deadline, coupon, stock or eligibility text remains HTML when used
  on the website.
- A social derivative may contain approved copy only when the publishing brief, terms
  and accessible caption carry the same meaning.
- Create separate desktop and mobile crops when one composition cannot protect the subject.
- Expired or withdrawn campaign media is retired immediately and cannot become a generic banner.
- No countdown, fake urgency, fake before/after or unverified saving.
- Promotional media always links to a live, matching destination.

---

# 20. Trust and Payment Media

- Prefer text plus small approved inline icons over third-party badge images.
- A shield, lock or check mark must not imply certification, fraud protection or a
  guarantee unless the accompanying verified text defines it.
- Payment marks appear only for methods enabled in production and permitted by brand rules.
- Do not download unofficial payment logos from search results.
- Do not render remote trust-badge scripts or review widgets.
- Delivery, payment, return and security meaning remains text; icons are decorative.
- If a provider mark is required, record source URL, permission, version and expiry.

---

# 21. Review and Testimonial Media

**Status: Gated.** No review schema, moderation workflow or consented attribution source
currently authorizes review media.

Before use, record:

- review ID and source;
- publication/moderation status;
- exact approved attribution;
- customer consent for name, photo and quote;
- consent scope and withdrawal route;
- product/order relationship when claimed;
- rating scale and date;
- media rights and expiry.

Avatars are optional. Never use stock faces, generated people or staff/friends as
decorative “customers.” If consent is absent, omit the image and use the approved
attribution policy; do not fabricate initials or identity detail.

---

# 22. Brand Story Media

**Status: Gated and missing.** Render the Brand Story section only after the copy,
destination and exact media are approved.

Allowed subjects include real founder/operations/product-curation context that truthfully
supports the approved story. Prohibited subjects include generic warehouses, invented
teams, fake office scenes, supplier facilities presented as SirajiBD property and
unlicensed founder/customer likenesses.

| Field | Desktop | Mobile |
|---|---|---|
| Ratio | 3:2 or 4:3 | 4:5 |
| Order | Split with copy where readable | Media before copy |
| Loading | Lazy | Lazy |
| Alt | Concise visible subject/context | Based on actual mobile crop |
| Failure | Copy may remain only if story/destination still makes sense | Same |

---

# 23. Iconography

- Use the DDS outline style with rounded joins and consistent optical weight.
- Standard sizes are 16, 20, 24 and 32 px per DDS tokens.
- Icon-only controls have at least a 44 × 44 px target and accessible name.
- Decorative icons use `aria-hidden="true"`.
- Status icons always appear with text.
- Do not mix unrelated icon families.
- Current small inline SVG practice may continue; an icon library needs MDG dependency approval.
- Sanitize SVG; prohibit scripts, external resources, event handlers and embedded analytics.
- Brand/product/provider logos are assets, not interface icons.

## 23.1 Required Homepage icon set

| Role | Status | Rule |
|---|---|---|
| Menu, close, search, account, cart | Existing patterns/extension required | Functional icons retain visible/accessible labels as component contract requires |
| Delivery/payment trust facts | Existing inline pattern; facts gated | Text is authoritative; icon decorative |
| Category fallback | Optional | Do not invent category meaning with ambiguous glyphs |
| Why buy from us | Gated by verified reason | One consistent family; no fake accreditation marks |
| Social links | Missing/configuration-gated | Render only official live profiles |

---

# 24. Illustration

Illustration may support empty states, education and future AI explanation. It must not
replace product evidence.

Style:

- simplified dimensional forms;
- pearl, indigo and restrained cyan palette;
- one focal object and generous negative space;
- soft shadow and limited translucent material;
- no generic corporate people;
- no humanoid robot as the default AI symbol;
- no sustainability, medical, financial or certification symbolism without evidence.

Technical rules:

- prefer optimized sanitized SVG;
- define a viewBox and intrinsic ratio;
- target under 25 KB for simple UI illustration unless an approved complexity exception exists;
- decorative illustrations use empty alt;
- informative illustrations need adjacent explanation or concise alt;
- provide light/dark variants or a neutral container;
- meaning survives when animation is removed.

---

# 25. AI-Generated Asset Governance

AI-generated media is not automatically approved. It may be considered for restrained
abstract brand material, non-evidentiary illustration, early internal concepts and
campaign ideation after review.

## 25.1 Never allowed as

- the real product or a substitute for missing product photography;
- evidence of product color, features, dimensions, materials or performance;
- a real customer, reviewer, founder, employee, supplier, warehouse or delivery operation;
- proof of certification, sustainability, safety, medical result or social impact;
- an undisclosed before/after result;
- a fake screenshot, message, order, rating or endorsement;
- a near-copy of a living artist, competitor campaign, protected character or third-party brand asset.

## 25.2 Required generation record

| Field | Requirement |
|---|---|
| Asset ID | Stable internal ID |
| Intended surface | Exact component/channel |
| Model/tool | Provider and model/version when available |
| Prompt/brief | Stored privately where it contains no secrets |
| Reference sources | Rights and permitted use recorded |
| Generation date | ISO date |
| Human editor | Named responsible owner |
| Edits | Material retouch/composition changes |
| Truth review | Confirms asset is decorative/editorial, not evidence |
| Rights review | Provider terms and reference rights checked |
| Disclosure decision | Required/not required and reason |
| Product Owner approval | Exact asset and usage |
| Retirement trigger | Campaign end, rights change, confusion or replacement |

## 25.3 Review standard

Inspect hands, faces, text, logos, packaging, cultural details, architecture, product
geometry and implied claims. Generated imagery that could reasonably be mistaken for
real SirajiBD operations must be rejected or clearly reframed/disclosed under an
approved policy.

---

# 26. Video and Motion Media

Homepage V2 does not authorize background video, autoplay hero video or animated product
cards.

Future product/editorial video requirements:

- genuine product/use demonstration;
- no unsupported performance claim;
- 1080p source preferred, with responsive delivery strategy approved;
- MP4/WebM delivery as required by tested browsers;
- poster image with stable aspect ratio;
- captions for meaningful speech and text alternative/transcript where appropriate;
- muted autoplay only when nonessential, platform-compliant and explicitly approved;
- visible native/accessible controls for meaningful video;
- no audio autoplay;
- reduced-data and reduced-motion behavior;
- below-fold lazy loading and no third-party player by default;
- duration, file size and CDN cost approved per use case.

Animated GIF is not an acceptable substitute for long video. Short decorative animation
must preserve meaning when frozen and cannot become the LCP bottleneck.

---

# 27. Open Graph and Social-Sharing Media

## 27.1 Homepage Open Graph asset

| Field | Requirement |
|---|---|
| Logical filename | `sirajibd-og-home-1200x630-en-v01.jpg` |
| Dimensions | Exactly 1200 × 630 px |
| Brand | SirajiBD only |
| Message | Match approved Homepage proposition; no unsupported claim |
| Safe area | Central 80% width and 70% height |
| Text | Short supporting brand lockup allowed; equivalent metadata remains authoritative |
| Format | JPEG or PNG after preview QA |
| Alt | Concise description through metadata when supported |
| Status | Required — missing |

## 27.2 Product/category sharing

- Use the real primary product/category asset when it remains legible at share crop.
- If a generated Open Graph composition is implemented, it must bind authoritative
  title/price/availability and never cache stale commerce truth beyond owning tags.
- Do not add review stars, discount or availability if the visible page/source cannot support it.
- Validate previews on representative services without exposing staging pages to indexing.

---

# 28. Social Campaign Asset Rules

Social media may use portrait, square, story or video derivatives, but campaign truth
still comes from the Content Guide and campaign record.

| Surface | Standard canvas | Note |
|---|---:|---|
| Feed portrait | 1080 × 1350 | Preferred for product/campaign visibility |
| Feed square | 1080 × 1080 | Use only when composition remains clear |
| Story/Reel | 1080 × 1920 | Protect platform UI areas; caption essential conditions |
| Link/share | 1200 × 630 | Match website metadata |

- Use real product images for product selling.
- State price/offer/eligibility/dates in the caption and landing page even if artwork includes them.
- Do not fabricate comments, messages, review cards, stock alerts or customer photos.
- Do not publish mixed-language art by accident; follow the approved campaign language brief.
- Archive the source, caption, campaign ID, approval and publication dates together.

---

# 29. Accessibility and Alt Text

## 29.1 Decision tree

1. Does the image provide information not already conveyed nearby?
   - Yes: write concise alt describing the visible, relevant information.
   - No: use empty alt when decorative/redundant.
2. Is the image inside a link/control?
   - Ensure the control has one useful accessible name; do not repeat visible label.
3. Is it product evidence?
   - Name the product and visible differentiator; do not infer unseen facts.
4. Is it complex information?
   - Provide adjacent structured text; alt alone is insufficient.

## 29.2 Product alt patterns

| Situation | Pattern |
|---|---|
| Primary product | `[Product name]` or `[Product name], [visible approved color/view]` |
| Alternate angle | `[Product name], rear view` |
| Detail | `[Product name], close view of [visible detail]` |
| Packaging | `[Product name] with [visible included packaging/items]` |
| Decorative category media | Empty alt when visible category label fully conveys destination |

Do not start with “Image of” or “Picture of.” Do not add price, stock, promotion, SEO
keywords, material, benefit or person identity unless visibly verifiable and relevant.

## 29.3 Captions

Use captions only when context, attribution, date, location, disclosure or limitation
helps interpretation. A caption is not a place to hide offer conditions.

---

# 30. Performance Budgets

The SAS/MDG page budgets remain authoritative:

| Metric | Target | Maximum/release rule |
|---|---:|---:|
| LCP, p75 mobile | ≤ 2.0 s | 2.5 s |
| CLS, p75 | ≤ 0.05 | 0.10 |
| Initial JS, critical storefront route | ≤ 120 KB gzip target | Exception required |
| Image layout shift | 0 expected | 0.02 page total |
| Above-fold product image | < 90 KB target from current performance guide | 150 KB maximum |

Media rules:

- only the actual likely LCP image receives priority/preload;
- below-fold media lazy-loads;
- provide accurate responsive `sizes`;
- reserve dimensions/aspect ratio before load;
- use AVIF/WebP negotiation through approved delivery;
- avoid double optimization of already transformed full-size lightbox media;
- do not load desktop dimensions on compact mobile widths;
- no per-card client fetch or third-party media script;
- measure on representative mobile network/hardware, not desktop cache alone;
- record transfer size for the selected LCP crop at each release checkpoint.

The 90/150 KB product-image values are not automatic allowances for every Homepage
image. Hero and editorial media need route-level measurement so the total page still
meets the LCP target.

---

# 31. Loading, Failure and Missing-Media Behavior

| Surface | Loading | Failure/missing |
|---|---|---|
| Hero | Approved copy/actions render immediately; reserve ratio only for selected media | Use approved brand-led CSS/liquid-light fallback |
| Category card | Stable card geometry if image exists | Use consistent text fallback; never broken icon |
| Product card | Stable 4:5 media area | Honest unavailable-media treatment; do not use another product |
| Product gallery | Reserve selected ratio and thumbnail geometry | Keep product facts/actions; display clear fallback according to publish policy |
| Promotion | Copy/terms may render only for valid campaign | Omit section if asset/campaign fails release validation |
| Reviews | Future matched skeleton only when real data streams | Omit entire gated section; never sample testimonials |
| Brand story | Quiet reserved media if selected | Copy-only only when separately approved; otherwise omit section |
| Open Graph | N/A at runtime | Use approved static fallback; never framework/default preview for launch |

Do not show endless shimmer, layout jumps, browser broken-image icons, dominant red error
states for decorative media, or retry loops that block the primary action.

---

# 32. Security, Privacy and Metadata

- Strip GPS and sensitive EXIF before public delivery.
- Do not expose signed upload URLs, API keys or provider secrets in documents or client logs.
- Validate MIME type and actual decodability; extension alone is insufficient.
- Sanitize SVG and prohibit scripts, event handlers, external resource loads and embedded tracking.
- Preserve the CSP/Next remote allowlist; any new host requires security review and tests.
- Do not put customer/order/personal data in filenames, public IDs, alt text or metadata.
- Obtain consent for identifiable people and record withdrawal/expiry.
- Blur/redact incidental addresses, labels, screens, documents and license plates when not essential.
- Reject supplier assets with unknown rights or embedded third-party marks.
- Admin previews must not execute active content from uploaded files.

---

# 33. Licensing, Consent and Provenance

Every approved non-trivial asset needs a source record:

| Field | Required value |
|---|---|
| Asset ID | Stable internal identifier |
| Logical filename | Human-readable versioned name |
| Media type | Product, editorial, campaign, illustration, logo, video, etc. |
| Owner | Business/domain owner |
| Creator/source | Photographer, supplier, designer, provider or internal source |
| Rights basis | Owned, commissioned, licensed, supplier permission or generated-policy record |
| License/contract reference | Internal reference; do not publish confidential contract text |
| Permitted channels | Web, social, ads, email, portfolio, etc. |
| Territory | Bangladesh/global as applicable |
| Start/expiry | ISO dates or no expiry with basis |
| Identifiable people/property | Release reference and restrictions |
| Product truth review | Reviewer/date |
| Content/brand approval | Approver/date |
| Accessibility | Alt/caption decision |
| Crop variants | Ratio, focal point and approval |
| Retirement trigger | Expiry, campaign end, catalog withdrawal or replacement |

“Found online,” “from Google,” “from supplier chat” or “AI generated” is not sufficient
rights evidence.

---

# 34. Asset Intake Workflow

1. Define surface, customer purpose and owning content/data.
2. Assign stable asset ID and intended role.
3. Receive source/master through an approved channel.
4. Record creator, rights, consent, expiry and restrictions.
5. Verify product/brand/campaign truth.
6. Check technical integrity, dimensions, color profile and metadata.
7. Create only required art-directed crops.
8. Draft alt/caption and disclosure decision.
9. Run responsive, light/dark, contrast and performance preview.
10. Obtain Product Owner and required domain approval.
11. Upload through the owning storage path; never hard-code a temporary URL.
12. Bind asset to authoritative product/content record.
13. QA delivery, fallback, analytics and cache invalidation.
14. Publish and record effective version/date.
15. Monitor confusion, broken delivery, expiry and replacement needs.

---

# 35. Rejection and Retirement Rules

Reject or retire an asset when:

- it misrepresents the product, variant, included items or context;
- ownership, license or consent is missing, expired or withdrawn;
- it contains an unsupported claim or stale campaign term;
- it exposes personal or sensitive information;
- it fails required responsive crops or accessibility treatment;
- it cannot meet the route performance budget;
- it duplicates a stronger asset without adding decision value;
- it uses the wrong public brand;
- it is generated media that may be mistaken for real product/customer/operations evidence;
- the product, category, campaign, review or destination is retired.

Retirement removes the asset from active mappings and caches according to the owning
system. Historical order records must preserve necessary product identity without
silently mutating evidence relied on by the customer.

---

# 36. Media QA Matrix

| Check | Brand | Product | Category | Hero/editorial | Campaign | Review | Video |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Product Owner approval | Yes | Policy + catalog owner | Yes | Yes | Yes | Yes | Yes |
| Rights/provenance | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Truth/claim review | Brand | Product | Category | Context | Full terms | Source/consent | Product/context |
| Alt/caption decision | Yes | Yes | Yes | Yes | Yes | Yes | Captions/transcript |
| Responsive crop | Use-dependent | Yes | Yes | Yes | Yes | If image | Yes |
| Light/dark preview | Yes | Container | Container | Yes | Yes | Yes | Poster/controls |
| Performance measurement | Small asset | Yes | Yes | Yes | Yes | Yes | Yes |
| Failure fallback | Yes | Yes | Yes | Yes | Omit | Omit | Poster/text |
| Expiry/retirement | Version | Catalog | Catalog | Version | Required | Consent/source | Version |

---

# 37. Homepage V2 Media Release Checklist

## 37.1 Required before implementation selection

- [x] Public brand and platform roles approved.
- [x] Hero copy and action hierarchy approved.
- [x] English-first launch rule approved.
- [x] Media-free hero fallback approved by DDS/wireframes.
- [x] Category text fallback approved by Component Library.
- [x] Gated sections may be omitted without layout gaps.
- [ ] Product Owner approves the exact SirajiBD wordmark treatment.
- [ ] Product Owner approves whether hero launches with media or CSS fallback.
- [ ] Product Owner approves whether Featured Categories launch text-only or with an asset set.
- [ ] Production catalog media audit completed.
- [ ] Product-image 4:5 crop/fallback policy approved.

## 37.2 Required before public production launch

- [ ] SirajiBD logo/wordmark files approved and integrated.
- [ ] Favicon/application icons approved and integrated where used.
- [ ] Homepage Open Graph image approved and preview-tested.
- [ ] Every visible product media item passes truth, rights, alt and crop review.
- [ ] Broken/orphan catalog media resolved.
- [ ] Only live destinations and authorized brand/provider marks appear.
- [ ] Hero/category/editorial assets, if used, have mobile and desktop crop approval.
- [ ] Promotion/review/Brand Story media is omitted unless its gate passes.
- [ ] LCP, CLS and image transfer budgets pass on representative mobile tests.
- [ ] Light/dark, 320–1920 px, zoom, reduced-motion and failure states pass.
- [ ] No essential English/Bengali content is embedded in imagery.
- [ ] No secret, personal metadata or unapproved third-party host is exposed.

---

# 38. Media Definition of Done

An asset is complete only when:

- it has a stable ID, logical filename and owner;
- exact surface and purpose are recorded;
- source, rights, consent, territory and expiry are known;
- product/content/campaign truth is verified;
- required dimensions and format are available;
- responsive ratios, focal points and crops are approved;
- alt, caption and disclosure decisions are recorded;
- light/dark and worst-crop contrast pass;
- loading, failure and missing behavior pass;
- delivery uses the approved storage/image abstraction;
- responsive `sizes`, priority and lazy-loading behavior are correct;
- transfer and page-performance budgets pass;
- security/privacy metadata checks pass;
- Product Owner and required domain reviewers approve the exact version;
- retirement conditions are recorded.

---

# 39. Ownership and Approval

| Role | Responsibility |
|---|---|
| Product Owner | Brand direction, exact asset approval, campaigns, claims and final acceptance |
| Catalog owner/merchandiser | Product identity, variant accuracy, image order and alt/source facts |
| Content owner | Surface purpose, copy/media consistency, captions and localization |
| Designer/creator | Source quality, composition, crops, exports and handoff record |
| Engineering | Storage integration, responsive delivery, fallback, security and cache behavior |
| Accessibility reviewer | Alt/caption semantics, contrast and media-control behavior |
| Performance reviewer | LCP candidate, sizes, bytes, lazy loading and regression evidence |
| Legal/privacy/operations | Rights, releases, sensitive data and regulated/operational claims as applicable |

No single creator may self-authorize unknown product facts, rights or customer consent.

---

# 40. Next Owner Decisions

The Media Guide is ready as a planning baseline. The next decisions should be made with
the Product Owner before Homepage V2 coding selects assets:

1. **Launch wordmark:** approve a text-only SirajiBD wordmark for v1 or commission a
   primary wordmark plus compact mark.
2. **Hero treatment:** use the approved media-free Clear Liquid fallback at launch or
   supply real desktop/mobile hero media.
3. **Featured Categories:** launch with consistent text fallbacks or supply a complete
   approved 4:5 category set.
4. **Product media policy:** decide whether a product may be active without an approved
   primary image, after the live catalog audit.
5. **Open Graph asset:** approve one 1200 × 630 SirajiBD composition before public launch.

These decisions affect media selection, not the approved Content Guide strategy. Missing
campaign, review, Brand Story, newsletter or AI media does not block Homepage V2 because
those sections remain gated or safely omitted.

---

## Appendix A — Asset Record Template

| Field | Value |
|---|---|
| Asset ID | |
| Logical filename | |
| Status | Required — missing / Existing — audit required / Approved / Gated / Retired |
| Surface/component | |
| Purpose | |
| Subject/product/category/campaign ID | |
| Source/creator | |
| Rights basis/reference | |
| Consent/release | |
| Permitted channels/territory | |
| Start/expiry | |
| Original dimensions/format/bytes | |
| Approved ratios/crops | |
| Focal point | |
| Alt text | |
| Caption/disclosure | |
| Light/dark behavior | |
| Loading/priority | |
| Fallback | |
| Storage key/path | |
| Truth reviewer/date | |
| Accessibility reviewer/date | |
| Product Owner approval/date | |
| Retirement trigger | |

## Appendix B — Product Media Audit Template

| Product ID/slug | Image order | Asset ID/key | Role | Ratio | Alt | Rights | Truth | Crop | Broken/orphan | Action |
|---|---:|---|---|---:|---|---|---|---|---|---|
| _Complete from the authorized production catalog audit_ | | | | | | | | | | |

## Appendix C — Permanent Rules

- SirajiBD is the customer-facing brand; AgentSiraji Commerce V2 is internal/portfolio.
- Product photography is evidence and cannot be fabricated.
- Essential meaning remains HTML text.
- One page-wide likely LCP image receives priority.
- Media uses stable geometry, responsive derivatives and approved storage boundaries.
- Missing media uses an approved fallback or removes the gated section.
- Unknown rights, consent or provenance means the asset is not approved.
- Generated media never impersonates real products, customers, reviews or operations.
- No implementation prompt may silently override these rules.
