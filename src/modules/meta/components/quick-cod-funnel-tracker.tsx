'use client'

import { useEffect, useRef } from 'react'

import { META_CONSENT_EVENT, META_PIXEL_READY_EVENT } from '../consent'
import { trackInitiateCheckout } from '../actions'
import { buildCheckoutEventData } from '../checkout-event-data'
import { newBrowserEventId, readMetaConsent, trackBrowserEvent } from './client'

/**
 * Quick COD uses the existing opt-in only. No popups, silent consent grants or
 * tracking when consent is unset/denied. Browser + CAPI get the SAME event id.
 *
 * This component does not block or delay placing a real order.
 */
export function QuickCodFunnelTracker({
  lines,
}: {
  lines: Array<{ variantId: string; quantity: number; unitPrice: number }>
}) {
  const fired = useRef(false)

  useEffect(() => {
    const sendIfAllowed = () => {
      if (fired.current || readMetaConsent() !== 'granted' || lines.length === 0) return

      const eventId = newBrowserEventId('initiatecheckout')
      const data = buildCheckoutEventData(lines)
      if (!trackBrowserEvent('InitiateCheckout', data, eventId)) return

      fired.current = true
      // The server reads the current, authoritative cart and independently
      // enforces its consent cookie before sending the deduplicated CAPI event.
      void trackInitiateCheckout({ eventId }).catch(() => undefined)
    }

    sendIfAllowed()
    // The checkout can hydrate before the parent component boots the Pixel.
    window.addEventListener(META_PIXEL_READY_EVENT, sendIfAllowed)
    window.addEventListener(META_CONSENT_EVENT, sendIfAllowed)
    return () => {
      window.removeEventListener(META_PIXEL_READY_EVENT, sendIfAllowed)
      window.removeEventListener(META_CONSENT_EVENT, sendIfAllowed)
    }
  }, [lines])

  return null
}
