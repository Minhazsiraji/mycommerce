import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { LEGACY_CONSENT_COOKIE, META_CONSENT_COOKIE } from './consent'
import { migrateLegacyConsent, readMetaConsent } from './components/client'

/**
 * A minimal `document.cookie`, because the real semantics are what this
 * migration turns on: reading concatenates, writing sets one pair, and Max-Age=0
 * deletes. The rename is only safe if a stored privacy choice survives it.
 */
function installCookieJar() {
  const jar = new Map<string, string>()

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      get cookie() {
        return [...jar].map(([name, value]) => `${name}=${value}`).join('; ')
      },
      set cookie(entry: string) {
        const [pair = '', ...attributes] = entry.split('; ')
        const [name = '', value = ''] = pair.split('=')
        if (attributes.some((attribute) => /^Max-Age=0$/i.test(attribute))) jar.delete(name)
        else jar.set(name, value)
      },
    },
  })

  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: { protocol: 'https:' },
  })

  return jar
}

let jar: Map<string, string>

beforeEach(() => {
  jar = installCookieJar()
})

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'document')
  Reflect.deleteProperty(globalThis, 'location')
})

describe('reading consent across the rename', () => {
  it('reads the generic cookie', () => {
    jar.set(META_CONSENT_COOKIE, 'granted_v1')
    expect(readMetaConsent()).toBe('granted')
  })

  it('still honours a choice stored under the old name', () => {
    jar.set(LEGACY_CONSENT_COOKIE, 'granted_v1')
    expect(readMetaConsent()).toBe('granted')
  })

  it('keeps a refusal a refusal', () => {
    // The dangerous failure: a missed legacy "denied" reads as "unset", the
    // banner reappears, and tracking may start for someone who said no.
    jar.set(LEGACY_CONSENT_COOKIE, 'denied_v1')
    expect(readMetaConsent()).toBe('denied')
    expect(readMetaConsent()).not.toBe('unset')
  })

  it('prefers the generic cookie when both exist', () => {
    jar.set(META_CONSENT_COOKIE, 'denied_v1')
    jar.set(LEGACY_CONSENT_COOKIE, 'granted_v1')
    expect(readMetaConsent()).toBe('denied')
  })

  it('reports unset when nothing is stored', () => {
    expect(readMetaConsent()).toBe('unset')
  })
})

describe('migrating the stored choice', () => {
  it.each([
    ['granted_v1', 'granted'],
    ['denied_v1', 'denied'],
  ])('carries %s across and clears the old cookie', (stored, expected) => {
    jar.set(LEGACY_CONSENT_COOKIE, stored)

    migrateLegacyConsent()

    expect(jar.get(META_CONSENT_COOKIE)).toBe(stored)
    expect(jar.has(LEGACY_CONSENT_COOKIE)).toBe(false)
    expect(readMetaConsent()).toBe(expected)
  })

  it('does not overwrite a newer choice made under the generic cookie', () => {
    jar.set(META_CONSENT_COOKIE, 'denied_v1')
    jar.set(LEGACY_CONSENT_COOKIE, 'granted_v1')

    migrateLegacyConsent()

    expect(jar.get(META_CONSENT_COOKIE)).toBe('denied_v1')
  })

  it('does nothing for a first-time visitor', () => {
    migrateLegacyConsent()
    expect(jar.size).toBe(0)
    expect(readMetaConsent()).toBe('unset')
  })

  it('is safe to run on every mount', () => {
    jar.set(LEGACY_CONSENT_COOKIE, 'granted_v1')

    migrateLegacyConsent()
    migrateLegacyConsent()

    expect(jar.get(META_CONSENT_COOKIE)).toBe('granted_v1')
    expect(jar.has(LEGACY_CONSENT_COOKIE)).toBe(false)
  })
})

describe('the namespace is no longer client-specific', () => {
  it('names the store-neutral cookie', () => {
    expect(META_CONSENT_COOKIE).toBe('commerce_analytics_consent')
    expect(META_CONSENT_COOKIE).not.toMatch(/sirajibd/i)
  })
})
