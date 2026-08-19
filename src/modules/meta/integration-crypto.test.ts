import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: {
    INTEGRATIONS_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
  },
}))

import {
  decryptIntegrationSecret,
  encryptIntegrationSecret,
  integrationEncryptionReady,
} from './integration-crypto'

describe('integration secret encryption', () => {
  it('encrypts and authenticates a secret without storing plaintext', () => {
    const secret = 'EAAB-example-sensitive-meta-token'
    const encrypted = encryptIntegrationSecret(secret)

    expect(encrypted).toMatch(/^v1\./)
    expect(encrypted).not.toContain(secret)
    expect(decryptIntegrationSecret(encrypted)).toBe(secret)
    expect(integrationEncryptionReady()).toBe(true)
  })

  it('rejects tampered ciphertext', () => {
    const encrypted = encryptIntegrationSecret('another-sensitive-token')
    const parts = encrypted.split('.')
    expect(parts).toHaveLength(4)

    // Flip an actual ciphertext byte rather than the final Base64 character.
    // Changing only trailing Base64 padding bits can decode to the exact same
    // bytes, which made this security test nondeterministically pass or fail.
    const ciphertext = Buffer.from(parts[2]!, 'base64')
    ciphertext[0] = ciphertext[0]! ^ 0x01
    const tampered = [parts[0], parts[1], ciphertext.toString('base64'), parts[3]].join('.')

    expect(() => decryptIntegrationSecret(tampered)).toThrow()
  })
})
