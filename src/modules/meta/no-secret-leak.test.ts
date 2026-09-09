import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const META_DIR = join(process.cwd(), 'src/modules/meta')

function readAll(dir: string): { rel: string; source: string }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return readAll(full)
    if (!/\.(ts|tsx)$/.test(entry.name) || entry.name.endsWith('.test.ts')) return []
    return [{ rel: full.slice(META_DIR.length + 1).replace(/\\/g, '/'), source: readFileSync(full, 'utf8') }]
  })
}

const files = readAll(META_DIR)
const clientFiles = files.filter(
  (f) => f.source.startsWith("'use client'") || f.source.startsWith('"use client"'),
)

/**
 * The CAPI token is decrypted from ciphertext and attached as a Bearer header.
 * None of that machinery may be reachable from a browser bundle. The admin
 * integration form deliberately *collects* a token in a write-only field behind
 * `requireRole('admin')`; that is an input, not a leak, so the check targets the
 * stored ciphertext and the crypto/transport code rather than the field name.
 */
const FORBIDDEN_IN_CLIENT = [
  'META_CAPI_ACCESS_TOKEN',
  'access_token_encrypted',
  'accessTokenEncrypted',
  './integration-crypto',
  'decryptIntegrationSecret',
  'encryptIntegrationSecret',
  'graph.facebook.com',
  'Bearer ',
]

describe('Meta CAPI credentials never reach the client', () => {
  it('actually found client components to inspect', () => {
    expect(clientFiles.length).toBeGreaterThan(0)
  })

  for (const file of clientFiles) {
    it(`${file.rel} contains no CAPI secret, crypto or transport code`, () => {
      for (const needle of FORBIDDEN_IN_CLIENT) {
        expect(file.source).not.toContain(needle)
      }
    })
  }

  it('reads the decrypted token only inside server-guarded modules', () => {
    for (const file of files) {
      const usesToken =
        file.source.includes('config.accessToken') || file.source.includes('adminToken')
      if (!usesToken) continue
      const guarded =
        file.source.includes("import 'server-only'") || file.source.startsWith("'use server'")
      expect(guarded, `${file.rel} handles the token without a server guard`).toBe(true)
    }
  })

  it('never names a Meta credential with a NEXT_PUBLIC_ prefix', () => {
    for (const file of files) {
      expect(file.source).not.toMatch(/NEXT_PUBLIC_[A-Z_]*(TOKEN|SECRET|DATASET|ACCESS)/)
    }
  })
})
