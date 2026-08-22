import { describe, expect, it } from 'vitest'

import { availablePaymentMethods } from './payment-methods'

/**
 * Payment-provider portability.
 *
 * Checkout used to render all three options unconditionally, so a clone with no
 * SSLCommerz credentials still offered "Pay securely through SSLCommerz" and
 * only found out it could not settle when a customer picked it. SSLCommerz is
 * one provider this software supports, not something it requires.
 */
describe('a store offers only what it can settle', () => {
  it('offers everything when everything is configured', () => {
    expect(availablePaymentMethods({ sslcommerz: true, bankTransfer: true })).toEqual([
      'cod',
      'bank_transfer',
      'sslcommerz',
    ])
  })

  it('hides SSLCommerz when its credentials are absent', () => {
    const methods = availablePaymentMethods({ sslcommerz: false, bankTransfer: true })

    expect(methods).not.toContain('sslcommerz')
    expect(methods).toEqual(['cod', 'bank_transfer'])
  })

  it('hides bank transfer when no bank details are configured', () => {
    expect(availablePaymentMethods({ sslcommerz: true, bankTransfer: false })).toEqual([
      'cod',
      'sslcommerz',
    ])
  })

  it('still lets a bare clone trade with cash on delivery', () => {
    // The floor: a store that has configured no gateway at all can open.
    expect(availablePaymentMethods({ sslcommerz: false, bankTransfer: false })).toEqual(['cod'])
  })

  it('can be left with nothing, rather than silently pretending COD works', () => {
    expect(availablePaymentMethods({ sslcommerz: false, bankTransfer: false, cod: false })).toEqual(
      [],
    )
  })

  it('puts the default-selected method first', () => {
    // The form selects paymentMethods[0]; an unconfigured method must never
    // end up preselected.
    for (const configured of [
      { sslcommerz: false, bankTransfer: false },
      { sslcommerz: true, bankTransfer: false },
      { sslcommerz: false, bankTransfer: true },
    ]) {
      expect(availablePaymentMethods(configured)[0]).toBe('cod')
    }
  })
})
