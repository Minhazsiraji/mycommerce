import { describe, expect, it } from 'vitest'

import { loginSchema, passwordSchema, registerSchema } from './schema'

describe('passwordSchema', () => {
  it('rejects passwords under 10 characters', () => {
    expect(passwordSchema.safeParse('short123').success).toBe(false)
  })

  it('accepts a 10-character password', () => {
    expect(passwordSchema.safeParse('0123456789').success).toBe(true)
  })

  it('rejects passwords over 128 characters', () => {
    // Long inputs are an Argon2 denial-of-service vector, so the cap is enforced
    // before hashing rather than left to the hasher.
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
    // Sign-in must accept whatever was previously valid; raising the minimum
    // should never lock people out of their own accounts.
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'old' }).success).toBe(true)
  })
})
