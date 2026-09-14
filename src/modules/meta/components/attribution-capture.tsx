'use client'

import { useEffect } from 'react'

import {
  FBC_COOKIE,
  META_ATTRIBUTION_COOKIE,
  META_ATTRIBUTION_MAX_AGE_SECONDS,
  mergeAttribution,
  parseAttributionCookie,
  parseAttributionFromUrl,
  synthesizeFbc,
} from '../attribution'
import { META_CONSENT_EVENT } from '../consent'
import { readMetaConsent } from './client'

function readCookie(name: string): string | undefined {
  const raw = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1)
  if (raw === undefined) return undefined
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function writeCookie(name: string, value: string) {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${value}; Max-Age=${META_ATTRIBUTION_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`
}

/**
 * First-party capture of inbound ad context.
 *
 * Deliberately consent-gated: `fbclid`, `utm_*` and campaign identifiers are
 * advertising data, so nothing is stored until the visitor allows analytics. A
 * visitor who consents after landing keeps whatever ad params are still on the
 * URL; a click lost before consent is simply not recorded, which is the correct
 * privacy outcome.
 *
 * When a Meta click id is present and the canonical `_fbc` cookie has not been
 * written yet, this mirrors it in the exact format fbevents.js uses, so the
 * server Purchase event carries `fbc` even if the Pixel script is slow or the
 * order page never runs it.
 */
export function MetaAttributionCapture({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return

    const capture = () => {
      if (readMetaConsent() !== 'granted') return

      const incoming = parseAttributionFromUrl(window.location.href)
      const existing = parseAttributionCookie(readCookie(META_ATTRIBUTION_COOKIE))

      // Nothing new and nothing stored — do not plant an empty cookie.
      if (!existing && !incoming.fbclid && !incoming.utm && !incoming.adParams) return

      const merged = mergeAttribution(existing, incoming)
      writeCookie(META_ATTRIBUTION_COOKIE, encodeURIComponent(JSON.stringify(merged)))

      if (merged.fbclid && !readCookie(FBC_COOKIE)) {
        writeCookie(FBC_COOKIE, synthesizeFbc(merged.fbclid, Date.now()))
      }
    }

    capture()
    window.addEventListener(META_CONSENT_EVENT, capture)
    return () => window.removeEventListener(META_CONSENT_EVENT, capture)
  }, [enabled])

  return null
}
