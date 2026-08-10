# Category V2 Feature Charter

| Field | Decision |
|---|---|
| Milestone | 2 — Category V2 |
| Status | Planning only |
| Product | SirajiBD Commerce |
| Primary route | `/c/[slug]` |
| Predecessor | Homepage V2, released and frozen |

## Why we are building it

Category V2 must turn the Homepage's “Browse categories” promise into a fast, clear,
shareable product-discovery journey and establish governed collection patterns for later
Product Listing and Search milestones.

## Problem it solves

The current route lists active products, direct subcategories, three sorts, and paginated
results. It lacks the complete UX, URL, SEO, filtering, hierarchy, recovery, accessibility,
and measurement contract required for production-quality discovery.

## What it will solve

- Clear hierarchy and movement from Home to Category to Product Detail.
- Truthful identity, description, subcategories, counts, products, and recovery states.
- Deterministic URL-backed filters, sorting, pagination, canonical, and index rules.
- Responsive, accessible desktop, tablet, and mobile discovery.

## What it will not solve

- Product Detail, Search V2, Wishlist, recommendations, personalization, or AI Search.
- Cart, checkout, payment, inventory, authentication, account, order, or admin changes.
- Deeper taxonomy, marketplace/multi-vendor, multi-warehouse, or multi-currency behavior.
- Autonomous merchandising, invented badges/scarcity, or inferred product facts.

## Success metrics

- Measure Category-to-product click-through, filter/sort use, and zero-result rate after
  privacy/analytics approval.
- All supported URLs preserve valid state across refresh, sharing, Back, and Forward.
- No open Critical/Major defect; WCAG 2.2 AA gates pass.
- LCP p75 mobile ≤2.0 s target/2.5 s maximum; CLS p75 ≤0.05 target; zero image shift.
- Initial JavaScript ≤120 KB gzip target or approved exception; no N+1 query.

## Out of scope

- UI/code before planning approval; new architecture, routes, dependencies, or schemas.
- Cursor pagination or product facets without evidence and Commerce Spec approval.
- Homepage changes except separately approved bug/security/critical-regression work.

## Exit condition

Research → Planning → UX → Commerce Logic → Component Contracts → Validation Criteria
→ Implementation → Validation Sprint → Production Release.
