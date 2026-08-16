import { describe, expect, it } from 'vitest'

import { canFulfilBeforeCollection, initialPaymentState } from './payment-methods'

describe('checkout payment methods', () => {
  it('accepts COD without counting it as collected revenue', () => {
    expect(initialPaymentState('cod')).toEqual({
      orderStatus: 'confirmed',
      paymentStatus: 'cod_pending',
      paymentAttemptStatus: 'awaiting_collection',
      holdMinutes: null,
    })
  })

  it('only permits unpaid fulfilment for COD awaiting collection', () => {
    expect(canFulfilBeforeCollection('cod', 'cod_pending')).toBe(true)
    expect(canFulfilBeforeCollection('sslcommerz', 'unpaid')).toBe(false)
    expect(canFulfilBeforeCollection('bank_transfer', 'awaiting_transfer')).toBe(false)
  })
})
