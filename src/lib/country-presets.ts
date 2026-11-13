/**
 * How a store's country shapes its checkout.
 *
 * Bangladesh addressing is not a special case of a generic address — it is a
 * cascade (district -> city -> thana/upazila) validated against a fixed list,
 * and a courier here will not deliver without it. A generic address is the
 * opposite: free text, an optional region, and a postal code that carries the
 * routing. Trying to express one as a loosened version of the other produces a
 * form that is wrong in both countries.
 *
 * So each country selects a preset. Bangladesh is one preset, not the base
 * case, and SirajiBD reaches it through exactly the same configuration a client
 * would use.
 *
 * Declarative on purpose: this file lives in lib/ and must not import the
 * district tables, which are large and belong to the accounts module. A preset
 * names the model; the module applies it.
 */

export type FieldMode = 'hidden' | 'optional' | 'required'

export type AddressModel = 'bd-administrative' | 'generic'

export type CountryPreset = {
  addressModel: AddressModel
  labels: {
    region: string
    city: string
    /** Sub-city area: thana/upazila in BD, unused in the generic model. */
    area: string
    postalCode: string
  }
  fields: {
    region: FieldMode
    area: FieldMode
    union: FieldMode
    postalCode: FieldMode
  }
  phone: {
    pattern: RegExp
    message: string
    /** Canonical storage form, so support can search a number and find it. */
    normalize: (value: string) => string
  }
}

const stripSeparators = (value: string) => value.replace(/[\s-]/g, '')

function normalizeBdLocalPhone(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('00880')) digits = digits.slice(5)
  else if (digits.startsWith('880')) digits = digits.slice(3)
  if (digits.startsWith('88') && digits.slice(2).startsWith('01')) digits = digits.slice(2)
  // +8801XXXXXXXXX and 008801XXXXXXXXX lose the leading domestic zero
  // when the country prefix is stripped; restore it for courier-ready 01 numbers.
  if (/^1[3-9]\\d{8}$/.test(digits)) digits = `0${digits}`
  return digits
}

const BANGLADESH: CountryPreset = {
  addressModel: 'bd-administrative',
  labels: {
    region: 'District',
    city: 'City or town',
    area: 'Thana or Upazila',
    postalCode: 'Postcode',
  },
  fields: {
    region: 'required',
    area: 'required',
    union: 'optional',
    postalCode: 'optional',
  },
  phone: {
    // Accept local and common international forms, but always store/display 01XXXXXXXXX.
    pattern: /^(?:\+?880|00880|0)1[3-9]\d{8}$/,
    message: 'Enter a valid Bangladesh mobile number, e.g. 01636057402',
    normalize: normalizeBdLocalPhone,
  },
}

/**
 * Everywhere else. Deliberately permissive: rejecting a valid foreign address
 * because we modelled its country wrong costs a real sale, and we cannot
 * enumerate the world's administrative divisions. The postal code is required
 * because it is what most carriers actually route on.
 */
const GENERIC: CountryPreset = {
  addressModel: 'generic',
  labels: {
    region: 'State, province or region',
    city: 'City or town',
    area: 'Area',
    postalCode: 'Postal or ZIP code',
  },
  fields: {
    region: 'optional',
    area: 'hidden',
    union: 'hidden',
    postalCode: 'required',
  },
  phone: {
    // E.164 shape without claiming to know each country's numbering plan.
    pattern: /^\+?[1-9]\d{6,14}$/,
    message: 'Enter a valid phone number, including country code',
    normalize: (value) => `+${stripSeparators(value).replace(/^\+/, '')}`,
  },
}

const PRESETS: Record<string, CountryPreset> = { BD: BANGLADESH }

export function countryPreset(countryCode: string): CountryPreset {
  return PRESETS[countryCode.trim().toUpperCase()] ?? GENERIC
}

export const GENERIC_PRESET = GENERIC
