'use client'

import type { MetaCustomData } from '../validators'
import {
  LEGACY_CONSENT_COOKIE,
  META_CONSENT_COOKIE,
  META_CONSENT_DENIED,
  META_CONSENT_EVENT,
  META_CONSENT_GRANTED,
  parseMetaConsent,
  type MetaConsent,
} from '../consent'

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void
      queue?: unknown[][]
      loaded?: boolean
      version?: string
      push?: (...args: unknown[]) => void
    }
    _fbq?: Window['fbq']
    _commerceMetaPixelId?: string
  }
}

export type { MetaCustomData }

export function newBrowserEventId(eventName: string) {
  return `${eventName.toLowerCase()}:${crypto.randomUUID()}`
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`))
    ?.split('=')[1]
}

export function readMetaConsent(): MetaConsent {
  if (typeof document === 'undefined') return 'unset'
  return parseMetaConsent(readCookie(META_CONSENT_COOKIE) ?? readCookie(LEGACY_CONSENT_COOKIE))
}

function persistConsent(value: string) {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${META_CONSENT_COOKIE}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
}

/**
 * Carries a pre-rename choice onto the generic cookie, once, then clears the old
 * one. Runs on mount rather than inside `readMetaConsent` so that reading a
 * visitor's privacy choice stays free of side effects.
 */
export function migrateLegacyConsent() {
  if (typeof document === 'undefined') return
  if (readCookie(META_CONSENT_COOKIE)) return

  const legacy = readCookie(LEGACY_CONSENT_COOKIE)
  if (!legacy) return

  persistConsent(legacy)
  document.cookie = `${LEGACY_CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
}

export function writeMetaConsent(consent: Exclude<MetaConsent, 'unset'>) {
  const value = consent === 'granted' ? META_CONSENT_GRANTED : META_CONSENT_DENIED
  persistConsent(value)
  window.dispatchEvent(new CustomEvent(META_CONSENT_EVENT, { detail: consent }))

  if (window.fbq) window.fbq('consent', consent === 'granted' ? 'grant' : 'revoke')
}

export function trackBrowserEvent(
  eventName: 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Contact' | 'Search',
  customData: MetaCustomData,
  eventId?: string,
) {
  if (readMetaConsent() !== 'granted' || !window.fbq) return false
  if (eventId) window.fbq('track', eventName, customData, { eventID: eventId })
  else window.fbq('track', eventName, customData)
  return true
}
