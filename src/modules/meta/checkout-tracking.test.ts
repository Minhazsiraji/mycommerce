import { describe, expect, it } from 'vitest'

import { buildCheckoutEventData } from './checkout-event-data'
import { buildConsentedCodLeadMatch } from './lead-match'
import { hashUserData } from './normalization'

describe('Quick COD marketing safety', () => {
  it('builds an accurate two-color InitiateCheckout payload in BDT', () => {
    const first = 'bb726d43-52b9-4e0b-9b84-310563b5b501'
    const second = 'dfaa4e6a-300c-4d45-b483-101c1dd3a002'
    const payload = buildCheckoutEventData([
      { variantId: first, quantity: 1, unitPrice: 75000 },
      { variantId: second, quantity: 1, unitPrice: 75000 },
    ])
    expect(payload).toMatchObject({
      currency: 'BDT',
      content_ids: [first, second],
      content_type: 'product',
      num_items: 2,
      value: 1500,
      contents: [
        { id: first, quantity: 1, item_price: 750 },
        { id: second, quantity: 1, item_price: 750 },
      ],
    })
  })

  it('hashes customer data rather than sending COD buyer phone/email as plaintext', () => {
    const info = buildConsentedCodLeadMatch({
      recipient: 'Example Buyer',
      email: 'Buyer@Example.com',
      phone: '01712 345678',
      city: 'Dhaka City',
      district: 'Dhaka',
      country: 'BD',
      postalCode: null,
      userId: null,
      clientIpAddress: '192.0.2.1',
      clientUserAgent: 'Example UA',
      fbp: 'fb.1.1730000000000.test',
      fbc: null,
    })
    expect(info.em).toEqual([hashUserData('buyer@example.com')])
    expect(info.ph).toEqual([hashUserData('8801712345678')])
    expect(info.client_user_agent).toBe('Example UA')
    expect(info.fbp).toBe('fb.1.1730000000000.test')
    expect(info.zp).toBeUndefined()
    expect(info.fbc).toBeUndefined()
    expect(JSON.stringify(info)).not.toContain('01712')
    expect(JSON.stringify(info)).not.toContain('buyer@example.com')
  })
})
