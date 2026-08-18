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
    const tampered = `${encrypted.slice(0, -1)}${encrypted.endsWith('A') ? 'B' : 'A'}`
    expect(() => decryptIntegrationSecret(tampered)).toThrow()
  })
})
