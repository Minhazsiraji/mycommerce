import 'server-only'

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

import { env } from '@/lib/env'

const VERSION = 'v1'
const ALGORITHM = 'aes-256-gcm'

function encryptionKey() {
  const raw = env.INTEGRATIONS_ENCRYPTION_KEY
  if (!raw) throw new Error('INTEGRATIONS_ENCRYPTION_KEY is required to store admin-managed integration secrets')

  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) {
    throw new Error('INTEGRATIONS_ENCRYPTION_KEY must decode to exactly 32 bytes')
  }
  return key
}

export function integrationEncryptionReady() {
  if (!env.INTEGRATIONS_ENCRYPTION_KEY) return false
  try {
    return Buffer.from(env.INTEGRATIONS_ENCRYPTION_KEY, 'base64').length === 32
  } catch {
    return false
  }
}

export function encryptIntegrationSecret(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return [VERSION, iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.')
}

export function decryptIntegrationSecret(payload: string) {
  const [version, ivRaw, tagRaw, ciphertextRaw] = payload.split('.')
  if (version !== VERSION || !ivRaw || !tagRaw || !ciphertextRaw) {
    throw new Error('Unsupported encrypted integration secret')
  }

  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(ivRaw, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextRaw, 'base64url')),
    decipher.final(),
  ])
  return plaintext.toString('utf8')
}
