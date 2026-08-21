import { afterEach, describe, expect, it, vi } from 'vitest'

import { countryPreset } from '@/lib/country-presets'

/**
 * Checkout portability.
 *
 * The address schema used to require a district drawn from a fixed Bangladeshi
 * list, a thana/upazila, and a +880 mobile number. A client anywhere else could
 * brand the storefront but could not take a single order — the limit only
 * surfaced at the first customer's checkout.
 */
async function withCountry(code: string) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_STORE_COUNTRY_CODE', code)
  return import('./validators')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

const usAddress = {
  recipient: 'Dana Reyes',
  phone: '+1 415 555 0134',
  line1: '1200 Market Street',
  line2: 'Apt 4B',
  city: 'San Francisco',
  district: 'California',
  postalCode: '94102',
  country: 'US',
}

describe('a store outside Bangladesh', () => {
  it('accepts an ordinary international address', async () => {
    const { addressInputSchema } = await withCountry('US')
    const parsed = addressInputSchema.parse(usAddress)

    expect(parsed.city).toBe('San Francisco')
    expect(parsed.district).toBe('California')
    expect(parsed.postalCode).toBe('94102')
  })

  it('does not demand a Bangladeshi district', async () => {
    const { addressInputSchema } = await withCountry('US')
    // "California" is not in BD_DISTRICT_SET; under the old schema this threw.
    expect(() => addressInputSchema.parse(usAddress)).not.toThrow()
  })

  it('does not demand a thana or upazila', async () => {
    const { addressInputSchema } = await withCountry('US')
    // usAddress carries no `upazila` at all — the point is that omitting it is
    // valid, and that it lands as empty rather than as undefined, so the
    // NOT NULL column still gets a value.
    const parsed = addressInputSchema.parse(usAddress)
    expect(parsed.upazila).toBe('')
  })

  it('accepts a country without states, leaving the region blank', async () => {
    const { addressInputSchema } = await withCountry('SG')
    const parsed = addressInputSchema.parse({
      ...usAddress,
      district: '',
      city: 'Singapore',
      postalCode: '018956',
      country: 'SG',
    })
    expect(parsed.district).toBe('')
  })

  it('requires a postal code, which is what carriers route on', async () => {
    const { addressInputSchema } = await withCountry('US')
    expect(() => addressInputSchema.parse({ ...usAddress, postalCode: '' })).toThrow()
  })

  it('still requires a recipient, street and city', async () => {
    const { addressInputSchema } = await withCountry('US')
    for (const field of ['recipient', 'line1', 'city'] as const) {
      expect(() => addressInputSchema.parse({ ...usAddress, [field]: '' })).toThrow()
    }
  })

  it('defaults the country to the configured one', async () => {
    const { addressInputSchema } = await withCountry('US')
    const withoutCountry = { ...usAddress, country: undefined }
    expect(addressInputSchema.parse(withoutCountry).country).toBe('US')
  })
})

describe('international phone numbers', () => {
  it('accepts a number with a country code and normalises it', async () => {
    const { phoneSchema } = await withCountry('US')
    expect(phoneSchema.parse('+1 415 555 0134')).toBe('+14155550134')
    expect(phoneSchema.parse('44-20-7946-0958')).toBe('+442079460958')
  })

  it('rejects something that is not a phone number', async () => {
    const { phoneSchema } = await withCountry('US')
    for (const bad of ['', 'not-a-number', '123', '0123456789012345678']) {
      expect(() => phoneSchema.parse(bad)).toThrow()
    }
  })
})

describe('Bangladesh remains one preset, not the base case', () => {
  it('keeps its own rules when configured', async () => {
    const { addressInputSchema, phoneSchema } = await withCountry('BD')

    expect(phoneSchema.parse('01712345678')).toBe('+8801712345678')
    expect(() =>
      addressInputSchema.parse({ ...usAddress, country: 'BD' }),
    ).toThrow()
  })

  it('still refuses a +1 number on a Bangladeshi store', async () => {
    const { phoneSchema } = await withCountry('BD')
    expect(() => phoneSchema.parse('+14155550134')).toThrow()
  })

  it('reaches its rules through configuration, like any client would', async () => {
    expect(countryPreset('BD').addressModel).toBe('bd-administrative')
    expect(countryPreset('US').addressModel).toBe('generic')
    expect(countryPreset('bd').addressModel).toBe('bd-administrative')
    // An unknown code must not fall back to Bangladeshi rules.
    expect(countryPreset('ZZ').addressModel).toBe('generic')
  })
})
