import { describe, expect, it } from 'vitest'

import { fraudBlockSchema } from './validators'

describe('fraud block validation', () => {
  it('normalises phone blocks to the checkout format', () => {
    expect(
      fraudBlockSchema.parse({ kind: 'phone', value: '01712345678', reason: 'Fake orders' }),
    ).toMatchObject({ value: '+8801712345678' })
  })

  it('normalises email blocks', () => {
    expect(
      fraudBlockSchema.parse({ kind: 'email', value: ' Buyer@Example.com ', reason: 'Chargeback' }),
    ).toMatchObject({ value: 'buyer@example.com' })
  })

  it('rejects invalid IP blocks', () => {
    expect(
      fraudBlockSchema.safeParse({ kind: 'ip', value: '999.2.3.4', reason: 'Bot traffic' }).success,
    ).toBe(false)
  })
})
