import { describe, expect, it } from 'vitest'

import {
  addressInputSchema,
  bdPhoneSchema,
  loginSchema,
  passwordSchema,
  registerSchema,
} from './validators'

describe('passwordSchema', () => {
  it('rejects passwords under 10 characters', () => {
    expect(passwordSchema.safeParse('short123').success).toBe(false)
  })

  it('accepts a 10-character password', () => {
    expect(passwordSchema.safeParse('0123456789').success).toBe(true)
  })

  it('rejects passwords over 128 characters', () => {
    expect(passwordSchema.safeParse('a'.repeat(129)).success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('trims surrounding whitespace from the name', () => {
    const result = registerSchema.safeParse({
      name: '  Minhaz  ',
      email: 'test@example.com',
      password: 'correct-horse-battery',
    })
    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Minhaz')
  })

  it('rejects a whitespace-only name', () => {
    const result = registerSchema.safeParse({
      name: '   ',
      email: 'test@example.com',
      password: 'correct-horse-battery',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a malformed email', () => {
    const result = registerSchema.safeParse({
      name: 'Minhaz',
      email: 'not-an-email',
      password: 'correct-horse-battery',
    })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('does not apply the length rule to an existing password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'old' }).success).toBe(true)
  })
})

const validAddress = {
  recipient: 'Minhaz Siraji',
  phone: '01712-345678',
  line1: 'House 1, Road 2',
  city: 'Savar',
  district: 'Dhaka',
  upazila: 'Savar',
  union: 'Tetuljhora',
  country: 'BD',
}

describe('Bangladesh checkout validation', () => {
  it('normalises a local mobile number', () => {
    expect(bdPhoneSchema.parse('01712 345678')).toBe('+8801712345678')
  })

  it('accepts a complete Bangladesh delivery address', () => {
    expect(addressInputSchema.parse(validAddress)).toMatchObject({
      phone: '+8801712345678',
      district: 'Dhaka',
      upazila: 'Savar',
    })
  })

  it('rejects an invented district even if a request bypasses the form', () => {
    const result = addressInputSchema.safeParse({ ...validAddress, district: 'Fake District' })
    expect(result.success).toBe(false)
  })

  it('requires a Thana or Upazila', () => {
    const result = addressInputSchema.safeParse({ ...validAddress, upazila: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a Thana or Upazila from a different city or district', () => {
    const result = addressInputSchema.safeParse({ ...validAddress, upazila: 'Dhanmondi' })
    expect(result.success).toBe(false)
  })

  it('accepts Ashulia under Savar in Dhaka', () => {
    const result = addressInputSchema.safeParse({ ...validAddress, upazila: 'Ashulia' })
    expect(result.success).toBe(true)
  })
})
