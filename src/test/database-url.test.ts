import { describe, expect, it } from 'vitest'

// @ts-expect-error -- plain ESM module shared by the operational scripts.
import { describeDatabase, resolveDatabaseUrl } from '../../scripts/database-url.mjs'

const resolve = resolveDatabaseUrl as (env: Record<string, string | undefined>) => {
  url: string | null
  source: string | null
}
const describeDb = describeDatabase as (url: string) => string | null

const CLONE = 'postgresql://u:p@ep-clone-pooler.us-east-1.aws.neon.tech/clone_acceptance?sslmode=require'
const INTEGRATION = 'postgresql://u:p@ep-parent-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

/**
 * Every entry point must mean the same database.
 *
 * A preview once migrated one database while the application queried another;
 * each step reported success and only the data disagreed. The admin promotion
 * script is the sharpest version of that risk — granting admin on the wrong
 * database looks like it worked and leaves the account a customer.
 */
describe('database precedence', () => {
  it('prefers APP_DATABASE_URL when both are set', () => {
    const resolved = resolve({ APP_DATABASE_URL: CLONE, DATABASE_URL: INTEGRATION })

    expect(resolved.url).toBe(CLONE)
    expect(resolved.source).toBe('APP_DATABASE_URL')
  })

  it('uses DATABASE_URL only when there is no override', () => {
    const resolved = resolve({ DATABASE_URL: INTEGRATION })

    expect(resolved.url).toBe(INTEGRATION)
    expect(resolved.source).toBe('DATABASE_URL')
  })

  it('fails safely when neither is set', () => {
    const resolved = resolve({})

    expect(resolved.url).toBeNull()
    expect(resolved.source).toBeNull()
  })

  it('treats an empty or blank override as absent', () => {
    // A variable created but left empty in a dashboard must not resolve to ''
    // and silently take precedence over a working connection string.
    for (const blank of ['', '   ']) {
      const resolved = resolve({ APP_DATABASE_URL: blank, DATABASE_URL: INTEGRATION })
      expect(resolved.url).toBe(INTEGRATION)
      expect(resolved.source).toBe('DATABASE_URL')
    }
  })

  it('trims surrounding whitespace from a pasted value', () => {
    expect(resolve({ APP_DATABASE_URL: `  ${CLONE}  ` }).url).toBe(CLONE)
  })

  it('reads only these two names', () => {
    const resolved = resolve({ POSTGRES_URL: CLONE, NEON_DATABASE_URL: CLONE })
    expect(resolved.url).toBeNull()
  })
})

describe('describing the target for a log line', () => {
  it('names the database and host without credentials', () => {
    const described = describeDb(CLONE)

    expect(described).toContain('clone_acceptance')
    expect(described).toContain('us-east-1.aws.neon.tech')
  })

  it('never leaks the user, password, host or query string', () => {
    const described = describeDb(CLONE)!

    expect(described).not.toContain('u:p')
    expect(described).not.toContain('p@')
    expect(described).not.toContain('ep-clone-pooler')
    expect(described).not.toContain('sslmode')
  })

  it('distinguishes the two databases that were confused', () => {
    expect(describeDb(CLONE)).not.toBe(describeDb(INTEGRATION))
    expect(describeDb(INTEGRATION)).toContain('neondb')
  })

  it('returns null for something unparseable, rather than a half-formed label', () => {
    expect(describeDb('not-a-url')).toBeNull()
  })
})
