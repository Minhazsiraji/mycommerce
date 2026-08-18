import { describe, expect, it } from 'vitest'

import { STORE_TRUST_ROUTES, routesFor } from './store-policies'

describe('store trust route registry', () => {
  it('keeps the six public trust pages unique and separate', () => {
    const hrefs = STORE_TRUST_ROUTES.map((route) => route.href)

    expect(new Set(hrefs).size).toBe(hrefs.length)
    expect(hrefs).toEqual([
      '/returns',
      '/shipping',
      '/contact',
      '/about',
      '/privacy',
      '/terms',
    ])
  })

  it('keeps return, privacy and terms as distinct customer-facing destinations', () => {
    expect(STORE_TRUST_ROUTES.find((route) => route.href === '/returns')?.group).toBe('customer-care')
    expect(STORE_TRUST_ROUTES.find((route) => route.href === '/privacy')?.group).toBe('legal')
    expect(STORE_TRUST_ROUTES.find((route) => route.href === '/terms')?.group).toBe('legal')
  })

  it('provides the intended footer groups', () => {
    expect(routesFor('customer-care').map((route) => route.href)).toEqual([
      '/returns',
      '/shipping',
      '/contact',
    ])
    expect(routesFor('company').map((route) => route.href)).toEqual(['/about'])
    expect(routesFor('legal').map((route) => route.href)).toEqual(['/privacy', '/terms'])
  })
})
