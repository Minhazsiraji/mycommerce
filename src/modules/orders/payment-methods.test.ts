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
    expect(canFulfilBeforeCollection('bkash_manual', 'awaiting_transfer')).toBe(false)
  })

  it('keeps manual bKash pending until an owner verifies the transaction', () => {
    expect(initialPaymentState('bkash_manual')).toEqual({
      orderStatus: 'pending',
      paymentStatus: 'awaiting_transfer',
      paymentAttemptStatus: 'awaiting_verification',
      holdMinutes: 72 * 60,
    })
  })
})
