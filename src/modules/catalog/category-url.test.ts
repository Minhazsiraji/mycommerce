import { describe, expect, it } from 'vitest'

import { categoryHref, categoryQuery } from './category-url'

const base = { brand: [] as string[], sort: 'newest' as const, page: 1 }

describe('Category V2 URL normalization', () => {
  it('omits defaults and serializes in the approved order', () => {
    expect(categoryHref('shoes', { ...base, brand: ['Nike'], inStock: true, minPrice: 1000, sort: 'price-asc', page: 2 })).toBe('/c/shoes?brand=Nike&minPrice=1000&inStock=1&sort=price-asc&page=2')
  })

  it('sorts and deduplicates repeated brands', () => {
    expect(categoryQuery({ ...base, brand: ['Zeta', 'Alpha', 'Zeta'] }).getAll('brand')).toEqual(['Alpha', 'Zeta'])
  })

  it('resets pagination through an override', () => {
    expect(categoryHref('shoes', { ...base, page: 4 }, { sort: 'price-desc', page: 1 })).toBe('/c/shoes?sort=price-desc')
  })
})
