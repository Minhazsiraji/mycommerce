import { describe, expect, it } from 'vitest'
import { isQuickDenimProduct, quickDenimShipping, QUICK_DENIM_UNIT_PRICE } from './moymoy-quick-cod'

describe('MoyMoy quick COD pricing', () => {
  it('recognises denim names', () => {
    expect(isQuickDenimProduct('Men Semi Baggy Pant')).toBe(true)
    expect(isQuickDenimProduct('Cotton Shirt')).toBe(false)
    expect(isQuickDenimProduct('Girls Baggy Jeans')).toBe(false)
    expect(isQuickDenimProduct("Women's Baggy Jeans")).toBe(false)
  })
  it('quotes Dhaka City one-piece delivery at Tk 80', () => {
    expect(quickDenimShipping(1, 'Dhaka', 'Dhaka City').cost).toBe(8000)
  })
  it('quotes other destinations at Tk 120', () => {
    expect(quickDenimShipping(1, 'Dhaka', 'Savar').cost).toBe(12000)
    expect(quickDenimShipping(1, 'Chattogram', 'Chattogram City').cost).toBe(12000)
  })
  it('makes mixed two-piece orders free anywhere', () => {
    expect(QUICK_DENIM_UNIT_PRICE * 2).toBe(150000)
    expect(quickDenimShipping(2, 'Dhaka', 'Dhaka City').cost).toBe(0)
    expect(quickDenimShipping(2, 'Rajshahi', 'Rajshahi City').cost).toBe(0)
  })
  it('rejects impossible quantities', () => {
    expect(() => quickDenimShipping(0, 'Dhaka', 'Dhaka City')).toThrow()
    expect(() => quickDenimShipping(11, 'Dhaka', 'Dhaka City')).toThrow()
  })
})
