import { describe, expect, it } from 'vitest'

// @ts-expect-error -- plain ESM module shared with the release-gate script.
import { auditFile } from '../../scripts/clone-audit-rules.mjs'

const audit = auditFile as (
  relativePath: string,
  content: string,
  options?: { allowStoreDefaults?: boolean },
) => string[]

/**
 * The gate's own regression suite.
 *
 * `pnpm clone:audit` passing tells you nothing unless the rules can also fail.
 * Each case below reintroduces one real class of clone blocker — several of
 * which shipped undetected — and asserts the gate rejects it.
 */
describe('the clone gate rejects', () => {
  it.each([
    [
      'a store name in customer-facing prose',
      'export const Terms = () => <p>SirajiBD does not warrant every product.</p>',
    ],
    ['a bare production origin', "const canonical = 'https://sirajibd.com/terms'"],
    ['a business email address', "const support = 'business@sirajibd.com'"],
    ['a Google tag id', "gtag('config', 'GT-K4LJG7CS')"],
    ['a Meta pixel id', "fbq('init', '1234567890123456')"],
    ['a Resend API key', "const key = 're_abcdefghijklmnopqrstuvwxyz'"],
    ['a Meta access token', "const token = 'EAA" + 'x'.repeat(45) + "'"],
    ['a database connection string', "const url = 'postgresql://user:pw@ep-x.neon.tech/db'"],
    ['a Cloudinary credential URL', "const url = 'cloudinary://key:secret@cloud'"],
  ])('%s', (_label, source) => {
    expect(audit('src/example.tsx', source)).not.toHaveLength(0)
  })

  it('a store name that only appears in a JSX attribute', () => {
    expect(audit('src/example.tsx', '<PolicyPage summary="Contact SirajiBD support" />')).not.toHaveLength(0)
  })

  it('reports the file it found the problem in', () => {
    const [failure] = audit('src/app/(shop)/terms/page.tsx', '<p>SirajiBD</p>')
    expect(failure).toContain('src/app/(shop)/terms/page.tsx')
  })
})

describe('the clone gate accepts', () => {
  it.each([
    ['configured identity', 'export const Terms = () => <p>{STORE_CONFIG.name} warrants nothing.</p>'],
    ['a derived host', 'const canonical = `https://${STORE_HOST}/terms`'],
    ['a configured contact address', 'const support = env.STORE_CONTACT_EMAIL'],
    ['an environment-provided tag', 'gtag("config", env.NEXT_PUBLIC_GOOGLE_TAG_ID)'],
    ['an ordinary long number that is not an id', 'const timestamp = 1756000000'],
  ])('%s', (_label, source) => {
    expect(audit('src/example.tsx', source)).toHaveLength(0)
  })

  it('a comment describing the original deployment', () => {
    // History belongs in comments; comments never reach a customer.
    const source = [
      '/** Kept because SirajiBD shipped this before the rename. */',
      '// SirajiBD was the first store on this codebase.',
      'export const value = STORE_CONFIG.name',
    ].join('\n')

    expect(audit('src/example.ts', source)).toHaveLength(0)
  })

  it('the frozen storage namespace', () => {
    // Renaming a persisted key would revoke real visitors' consent, so the
    // literal stays and must not trip the gate.
    const source = "const legacy = `sirajibd_meta_${eventId}`\nconst e = 'sirajibd:pixel-ready'"
    expect(audit('src/modules/meta/purchase-payload.ts', source)).toHaveLength(0)
  })

  it('the one file allowed to hold the defaults', () => {
    const source = "const name = process.env.STORE_NAME ?? 'SirajiBD'"
    expect(audit('src/lib/store-config.ts', source, { allowStoreDefaults: true })).toHaveLength(0)
    // ...and only because it was exempted, not because the rule is toothless.
    expect(audit('src/lib/store-config.ts', source)).not.toHaveLength(0)
  })
})
