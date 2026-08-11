'use client'

import type { MetaCustomData } from '../validators'
import {
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
    _sirajiMetaPixelId?: string
  }
}

export type { MetaCustomData }

export function newBrowserEventId(eventName: string) {
  return `${eventName.toLowerCase()}:${crypto.randomUUID()}`
}

export function readMetaConsent(): MetaConsent {
  if (typeof document === 'undefined') return 'unset'
  const value = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${META_CONSENT_COOKIE}=`))
    ?.split('=')[1]
  return parseMetaConsent(value)
}

export function writeMetaConsent(consent: Exclude<MetaConsent, 'unset'>) {
  const value = consent === 'granted' ? META_CONSENT_GRANTED : META_CONSENT_DENIED
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${META_CONSENT_COOKIE}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
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
