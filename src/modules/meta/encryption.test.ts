import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: {
    BETTER_AUTH_SECRET: 'a-test-auth-secret-that-is-definitely-longer-than-32-characters',
    INTEGRATION_ENCRYPTION_KEY: undefined,
  },
}))

import { decryptCredential, encryptCredential } from './encryption'

describe('Meta integration credential encryption', () => {
  it('round-trips without storing plaintext', () => {
    const secret = 'EAA-test-access-token-that-must-never-be-returned-to-browser'
    const encrypted = encryptCredential(secret)
    expect(encrypted).not.toContain(secret)
    expect(encrypted.startsWith('v1:')).toBe(true)
    expect(decryptCredential(encrypted)).toBe(secret)
  })

  it('rejects tampered ciphertext', () => {
    const encrypted = encryptCredential('EAA-another-long-test-token-for-integrity-checks')
    const parts = encrypted.split(':')
    parts[3] = `${parts[3]}A`
    expect(() => decryptCredential(parts.join(':'))).toThrow()
  })
})
