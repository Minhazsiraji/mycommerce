import { describe, expect, it } from 'vitest'

import {
  productFiltersSchema,
  productInputSchema,
  slugify,
  variantInputSchema,
} from './validators'

const validVariant = {
  sku: 'SKU-1',
  price: '1999',
  stock: '5',
  weightGrams: '400',
  options: {},
  compareAtPrice: '',
}

describe('slugify', () => {
  it('produces url-safe slugs', () => {
    expect(slugify('Nike Air Zoom')).toBe('nike-air-zoom')
    expect(slugify('  Spaced  Out  ')).toBe('spaced-out')
    expect(slugify('Symbols!@#$%Here')).toBe('symbols-here')
  })

  it('strips accents rather than dropping the character', () => {
    expect(slugify('Café Crème')).toBe('cafe-creme')
  })

  it('never leaves a trailing hyphen', () => {
    expect(slugify('Trailing---')).toBe('trailing')
    expect(slugify('a'.repeat(130) + ' !')).not.toMatch(/-$/)
  })
})

describe('variantInputSchema', () => {
  it('converts price text to poisha', () => {
    const r = variantInputSchema.safeParse({ ...validVariant, price: '1999.50' })
    expect(r.success).toBe(true)
    expect(r.data?.price).toBe(199950)
  })

  it('treats an empty compare-at price as null', () => {
    const r = variantInputSchema.safeParse(validVariant)
    expect(r.data?.compareAtPrice).toBeNull()
  })

  it('treats an omitted compare-at price as null', () => {
    // A form always posts a string, but callers that build input directly
    // should not have to supply an empty one.
    const withoutIt = { ...validVariant, compareAtPrice: undefined }
    const r = variantInputSchema.safeParse(withoutIt)
    expect(r.success).toBe(true)
    expect(r.data?.compareAtPrice).toBeNull()
  })

  it('rejects a compare-at price that is not above the price', () => {
    for (const compareAtPrice of ['1999', '1500']) {
      const r = variantInputSchema.safeParse({ ...validVariant, compareAtPrice })
      expect(r.success, compareAtPrice).toBe(false)
    }
    expect(variantInputSchema.safeParse({ ...validVariant, compareAtPrice: '2500' }).success).toBe(
      true,
    )
  })

  it('rejects negative stock and malformed money', () => {
    expect(variantInputSchema.safeParse({ ...validVariant, stock: '-1' }).success).toBe(false)
    expect(variantInputSchema.safeParse({ ...validVariant, price: 'free' }).success).toBe(false)
  })
})

describe('productInputSchema', () => {
  const base = { title: 'Nike Air Zoom', slug: 'nike-air-zoom', variants: [validVariant] }

  it('accepts a well-formed product', () => {
    expect(productInputSchema.safeParse(base).success).toBe(true)
  })

  it('requires at least one variant', () => {
    // Invariant: every product has a variant, even single-option products.
    expect(productInputSchema.safeParse({ ...base, variants: [] }).success).toBe(false)
  })

  it('rejects a malformed slug', () => {
    for (const slug of ['Nike Air', 'nike_air', '-nike', 'nike-', '']) {
      expect(productInputSchema.safeParse({ ...base, slug }).success, slug).toBe(false)
    }
  })

  it('defaults status to draft so nothing publishes by accident', () => {
    expect(productInputSchema.safeParse(base).data?.status).toBe('draft')
  })
})

describe('productFiltersSchema', () => {
  it('treats empty native-form select values as absent filters', () => {
    expect(productFiltersSchema.parse({ categoryId: '', status: '' })).toMatchObject({
      categoryId: undefined,
      status: undefined,
      sort: 'newest',
      page: 1,
    })
  })
})
