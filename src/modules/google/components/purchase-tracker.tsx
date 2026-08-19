'use client'

import { useCallback, useEffect, useRef } from 'react'

import { META_CONSENT_EVENT } from '@/modules/meta/consent'
import { readMetaConsent } from '@/modules/meta/components/client'

type GooglePurchaseItem = {
  item_id: string
  item_name: string
  price: number
  quantity: number
  item_variant?: string
}

type GoogleWindow = Window & {
  gtag?: (...args: unknown[]) => void
}

export function GooglePurchaseTracker({
  enabled,
  transactionId,
  value,
  currency,
  shipping,
  items,
}: {
  enabled: boolean
  transactionId: string
  value: number
  currency: string
  shipping: number
  items: GooglePurchaseItem[]
}) {
  const sent = useRef(false)

  const attempt = useCallback(() => {
    if (sent.current || !enabled || readMetaConsent() !== 'granted') return

    const storageKey = `commerce_google_purchase_${transactionId}`
    try {
      if (localStorage.getItem(storageKey)) {
        sent.current = true
        return
      }
    } catch {
      // A stable transaction_id still protects downstream reporting from most
      // replay even when hardened browsers block localStorage.
    }

    const gtag = (window as GoogleWindow).gtag
    if (!gtag) return

    gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      shipping,
      items,
    })

    try {
      localStorage.setItem(storageKey, '1')
    } catch {
      // Tracking succeeded; storage availability must not affect the order UI.
    }
    sent.current = true
  }, [currency, enabled, items, shipping, transactionId, value])

  useEffect(() => {
    attempt()
    window.addEventListener(META_CONSENT_EVENT, attempt)
    window.addEventListener('commerce:google-tag-ready', attempt)
    return () => {
      window.removeEventListener(META_CONSENT_EVENT, attempt)
      window.removeEventListener('commerce:google-tag-ready', attempt)
    }
  }, [attempt])

  return null
}
