import { describe, expect, it } from 'vitest'

import { placeOrderSchema } from './validators'

const validOrder = {
  email: 'customer@example.com',
  address: {
    recipient: 'Test Customer',
    phone: '01712345678',
    line1: 'House 1',
    city: 'Savar',
    district: 'Dhaka',
    upazila: 'Ashulia',
    postalCode: '1340',
    country: 'BD',
  },
  shippingRateId: '550e8400-e29b-41d4-a716-446655440000',
  paymentMethod: 'sslcommerz' as const,
}

describe('placeOrderSchema', () => {
  it('keeps postcode optional for SSLCommerz', () => {
    const result = placeOrderSchema.safeParse({
      ...validOrder,
      address: { ...validOrder.address, postalCode: '' },
    })

    expect(result.success).toBe(true)
  })

  it('rejects a malformed postcode when one is provided', () => {
    const result = placeOrderSchema.safeParse({
      ...validOrder,
      address: { ...validOrder.address, postalCode: '134' },
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({ path: ['address', 'postalCode'] }),
    )
  })

  it('accepts a valid Bangladesh postcode for SSLCommerz', () => {
    expect(placeOrderSchema.safeParse(validOrder).success).toBe(true)
  })

  it('keeps postcode optional for bank transfer', () => {
    expect(
      placeOrderSchema.safeParse({
        ...validOrder,
        paymentMethod: 'bank_transfer',
        address: { ...validOrder.address, postalCode: '' },
      }).success,
    ).toBe(true)
  })

  it('accepts cash on delivery', () => {
    expect(
      placeOrderSchema.safeParse({
        ...validOrder,
        paymentMethod: 'cod',
        address: { ...validOrder.address, postalCode: '' },
      }).success,
    ).toBe(true)
  })
})
