'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useSyncExternalStore } from 'react'

import {
  META_CONSENT_EVENT,
  readMetaConsent,
  type MetaConsent,
} from '@/modules/meta/components/analytics-consent'

import {
  GOOGLE_PURCHASE_ELEMENT_ID,
  googlePurchaseStorageKey,
  parseGooglePurchasePayload,
} from '../purchase-event'

type GoogleWindow = Window & {
  dataLayer?: unknown[][]
  gtag?: (...args: unknown[]) => void
  _commerceGoogleTagId?: string
}

function googleWindow() {
  return window as GoogleWindow
}

function bootGoogleTag(tagId: string) {
  const w = googleWindow()
  w.dataLayer ??= []
  w.gtag ??= (...args: unknown[]) => {
    w.dataLayer!.push(args)
  }

  if (!document.querySelector(`script[data-google-tag="${tagId}"]`)) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`
    script.dataset.googleTag = tagId
    document.head.appendChild(script)
  }

  if (w._commerceGoogleTagId !== tagId) {
    w.gtag('js', new Date())
    w.gtag('config', tagId, { send_page_view: false })
    w._commerceGoogleTagId = tagId
  }

  window.dispatchEvent(new Event('commerce:google-tag-ready'))
}

/**
 * Emits the order page's `purchase` payload, at most once per order.
 *
 * Runs here rather than on the order page because this component hydrates and
 * that page's subtree does not — see the note in `purchase-tracker.tsx`.
 *
 * Deduplication is by order number in `localStorage`, so a reload, a second tab
 * or a back-navigation cannot report the same sale twice. The key is written
 * *before* the event is sent: if `gtag` throws, the worst case is one lost
 * event, which is far better than a duplicated one inflating revenue.
 */
function emitPurchaseOnce(): boolean {
  const block = document.getElementById(GOOGLE_PURCHASE_ELEMENT_ID)
  const payload = parseGooglePurchasePayload(block?.textContent)
  if (!payload) return false

  const gtag = googleWindow().gtag
  if (!gtag) return false

  const key = googlePurchaseStorageKey(payload.transaction_id)
  try {
    if (localStorage.getItem(key)) return true
    localStorage.setItem(key, '1')
  } catch {
    // Hardened browsers can refuse storage. The stable transaction_id still
    // lets Google discard the duplicate on its side.
  }

  gtag('event', 'purchase', payload)
  return true
}

export function GoogleAnalytics({ tagId, enabled }: { tagId?: string; enabled: boolean }) {
  const pathname = usePathname()
  const lastPage = useRef<string | undefined>(undefined)
  const consent = useSyncExternalStore(
    (onChange) => {
      window.addEventListener(META_CONSENT_EVENT, onChange)
      return () => window.removeEventListener(META_CONSENT_EVENT, onChange)
    },
    readMetaConsent,
    () => 'unset' as MetaConsent,
  )

  useEffect(() => {
    if (!enabled || !tagId || consent !== 'granted') return

    bootGoogleTag(tagId)
    if (lastPage.current !== pathname) {
      googleWindow().gtag?.('event', 'page_view', {
        page_location: window.location.href,
        page_path: pathname,
      })
      lastPage.current = pathname
    }

    if (emitPurchaseOnce()) return

    /**
     * The payload block may not be in the DOM yet.
     *
     * The order page is dynamic and streams in after this layout has hydrated,
     * so on a fresh load the JSON arrives *after* this effect first runs.
     * Watching for it is the honest way to express "emit when the payload
     * appears" — a fixed timeout would be a guess about how slow the database
     * is, and would silently lose the event whenever that guess was wrong.
     */
    const observer = new MutationObserver(() => {
      if (emitPurchaseOnce()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [consent, enabled, pathname, tagId])

  return null
}
