'use client'

import { useEffect, useRef, useState } from 'react'

import { CURRENCY } from '@/lib/money'

import { trackInitiateCheckout, trackViewContent } from '../actions'
import { newBrowserEventId, readMetaConsent, trackBrowserEvent } from './client'
import { META_CONSENT_EVENT, META_PIXEL_READY_EVENT } from '../consent'
import { legacyMetaPurchaseStorageKey, metaPurchaseStorageKey } from '../purchase-payload'
import type { MetaCustomData } from '../validators'

function useConsentedEvent(send: () => boolean, key: string) {
  const sent = useRef<string | undefined>(undefined)

  useEffect(() => {
    const attempt = () => {
      if (sent.current === key) return
      if (send()) sent.current = key
    }

    attempt()
    window.addEventListener(META_CONSENT_EVENT, attempt)
    window.addEventListener(META_PIXEL_READY_EVENT, attempt)
    return () => {
      window.removeEventListener(META_CONSENT_EVENT, attempt)
      window.removeEventListener(META_PIXEL_READY_EVENT, attempt)
    }
  }, [key, send])
}

export function ViewContentTracker({
  variantId,
  contentName,
  value,
}: {
  variantId: string
  contentName: string
  value: number
}) {
  const [eventId] = useState(() => newBrowserEventId('viewcontent'))
  const data: MetaCustomData = {
    content_ids: [variantId],
    content_name: contentName,
    content_type: 'product',
    contents: [{ id: variantId, quantity: 1, item_price: value }],
    currency: CURRENCY,
    value,
  }

  useConsentedEvent(() => {
    if (readMetaConsent() !== 'granted') return false
    trackBrowserEvent('ViewContent', data, eventId)
    void trackViewContent({ eventId, variantId })
    return true
  }, eventId)
  return null
}

export function InitiateCheckoutTracker({ data }: { data: MetaCustomData }) {
  const [eventId] = useState(() => newBrowserEventId('initiatecheckout'))

  useConsentedEvent(() => {
    if (readMetaConsent() !== 'granted') return false
    trackBrowserEvent('InitiateCheckout', data, eventId)
    void trackInitiateCheckout({ eventId })
    return true
  }, eventId)
  return null
}

export function PurchaseTracker({ eventId, data }: { eventId: string; data: MetaCustomData }) {
  useConsentedEvent(() => {
    const storageKey = metaPurchaseStorageKey(eventId)
    try {
      if (localStorage.getItem(storageKey)) return true
      if (localStorage.getItem(legacyMetaPurchaseStorageKey(eventId))) return true
    } catch {
      // Storage can be unavailable in hardened/private browsers; Meta's stable
      // event id still deduplicates a repeat.
    }
    if (!trackBrowserEvent('Purchase', data, eventId)) return false
    try {
      localStorage.setItem(storageKey, '1')
    } catch {
      // Tracking succeeded; lack of local storage must not break the order page.
    }
    return true
  }, eventId)
  return null
}

export function SearchTracker({ query }: { query: string }) {
  useConsentedEvent(() => {
    return trackBrowserEvent('Search', { search_string: query })
  }, `search:${query}`)
  return null
}
