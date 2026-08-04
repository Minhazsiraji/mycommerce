import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'

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
 */

export async function getCachedActiveProducts(
  filters: ProductFilters,
  options?: { categoryIds?: string[] },
) {
  'use cache'
  cacheTag(CATALOG_TAGS.products)
  cacheLife('max')

  return repo.listActiveProducts(filters, options)
}

export async function getCachedProductBySlug(slug: string) {
  'use cache'
  cacheTag(CATALOG_TAGS.products)
  cacheLife('max')

  return repo.getProductBySlug(slug)
}

export async function getCachedCategories() {
  'use cache'
  cacheTag(CATALOG_TAGS.categories)
  cacheLife('max')

  return repo.listCategories()
}

export async function getCachedCategoryBySlug(slug: string) {
  'use cache'
  cacheTag(CATALOG_TAGS.categories)
  cacheLife('max')

  return repo.getCategoryBySlug(slug)
}
