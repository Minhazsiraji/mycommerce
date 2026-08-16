import { describe, expect, it } from 'vitest'

import { ratesForDistrict } from './shipping-rate-selection'

const dhaka = { name: 'Inside Dhaka', districts: ['Dhaka'] }
const outside = { name: 'Outside Dhaka', districts: [] }

describe('ratesForDistrict', () => {
  it('does not show the outside-Dhaka fallback for a Dhaka address', () => {
    expect(ratesForDistrict([dhaka, outside], 'Dhaka')).toEqual([dhaka])
  })

  it('uses the fallback when no district-specific rate exists', () => {
    expect(ratesForDistrict([dhaka, outside], 'Rajshahi')).toEqual([outside])
  })

  it('requires a district before offering a delivery rate', () => {
    expect(ratesForDistrict([dhaka, outside], '')).toEqual([])
  })
})
