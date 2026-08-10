import type { Route } from 'next'
import type { CategoryFilters } from './validators'

export function categoryQuery(filters: CategoryFilters, overrides: Partial<CategoryFilters> = {}) {
  const next = { ...filters, ...overrides }
  const query = new URLSearchParams()
  if (next.subcategory) query.set('subcategory', next.subcategory)
  for (const brand of [...new Set(next.brand)].sort()) query.append('brand', brand)
  if (next.minPrice != null) query.set('minPrice', String(next.minPrice))
  if (next.maxPrice != null) query.set('maxPrice', String(next.maxPrice))
  if (next.inStock) query.set('inStock', '1')
  if (next.sort !== 'newest') query.set('sort', next.sort)
  if (next.page > 1) query.set('page', String(next.page))
  return query
}

export function categoryHref(slug: string, filters: CategoryFilters, overrides: Partial<CategoryFilters> = {}): Route {
  const query = categoryQuery(filters, overrides).toString()
  return `/c/${slug}${query ? `?${query}` : ''}` as Route
}

export function hasCategoryFilters(filters: CategoryFilters) {
  return Boolean(filters.subcategory || filters.brand.length || filters.minPrice != null || filters.maxPrice != null || filters.inStock)
}
