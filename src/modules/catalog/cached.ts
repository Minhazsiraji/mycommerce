import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'

import { withDbRetry } from '@/lib/db/retry'

import * as repo from './repository'
import { CATALOG_TAGS } from './tags'
import type { ProductFilters } from './validators'

/**
 * Cached storefront reads. Admin screens deliberately do NOT use these — an
 * operator editing a product must see the database, not a cached copy.
 *
 * `cacheLife('max')` because freshness is driven by tags, not by a clock: the
 * catalog actions call `updateTag`, so there is no window during which a page
 * is stale, and no time-based expiry to pay for.
 *
 * Every read is wrapped in `withDbRetry`. These run during prerendering, so a
 * dropped Neon socket does not just serve one visitor a 500 — it fails the
 * build and therefore the deploy. That happened twice before this was added.
 */

export async function getCachedActiveProducts(
  filters: ProductFilters,
  options?: { categoryIds?: string[]; limit?: number },
) {
  'use cache'
  cacheTag(CATALOG_TAGS.products)
  cacheLife('max')

  return withDbRetry(() => repo.listActiveProducts(filters, options), 'listActiveProducts')
}

export async function getCachedProductBySlug(slug: string) {
  'use cache'
  cacheTag(CATALOG_TAGS.products)
  cacheLife('max')

  return withDbRetry(() => repo.getProductBySlug(slug), 'getProductBySlug')
}

export async function getCachedRelatedProducts(input: {
  excludeProductId: string
  categoryId: string | null
}) {
  'use cache'
  cacheTag(CATALOG_TAGS.products)
  cacheLife('max')

  return withDbRetry(() => repo.listRelatedProducts(input), 'listRelatedProducts')
}

export async function getCachedCategories() {
  'use cache'
  cacheTag(CATALOG_TAGS.categories)
  cacheLife('max')

  return withDbRetry(() => repo.listCategories(), 'listCategories')
}

export async function getCachedCategoryBySlug(slug: string) {
  'use cache'
  cacheTag(CATALOG_TAGS.categories)
  cacheLife('max')

  return withDbRetry(() => repo.getCategoryBySlug(slug), 'getCategoryBySlug')
}
