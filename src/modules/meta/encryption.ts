import 'server-only'

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import { env } from '@/lib/env'

const VERSION = 'v1'

function key() {
  const seed = env.INTEGRATION_ENCRYPTION_KEY ?? env.BETTER_AUTH_SECRET
  return createHash('sha256').update(`mycommerce:meta-integration:${seed}`).digest()
}

export function encryptCredential(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join(':')
}

export function decryptCredential(value: string) {
  const [version, ivRaw, tagRaw, encryptedRaw] = value.split(':')
  if (version !== VERSION || !ivRaw || !tagRaw || !encryptedRaw) throw new Error('Unsupported encrypted credential')

  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivRaw, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}
