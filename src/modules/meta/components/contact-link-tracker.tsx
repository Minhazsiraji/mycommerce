'use client'

import { useEffect } from 'react'

import { trackContact } from '../actions'
import { newBrowserEventId, readMetaConsent, trackBrowserEvent } from './client'

type ContactMethod = 'email' | 'phone' | 'whatsapp' | 'messenger'

/**
 * Maps a link's href to a contact channel, or null if it is an ordinary link.
 * Recognition is by scheme/host shape, not by a hard-coded list of the current
 * store's links — any `mailto:`, `tel:`, WhatsApp or Messenger link anywhere in
 * the storefront is picked up automatically.
 */
export function classifyContactHref(href: string): ContactMethod | null {
  const value = href.trim()
  const lower = value.toLowerCase()

  if (lower.startsWith('mailto:')) return 'email'
  if (lower.startsWith('tel:') || lower.startsWith('sms:')) return 'phone'
  if (lower.startsWith('whatsapp:')) return 'whatsapp'
  if (lower.startsWith('fb-messenger:')) return 'messenger'

  let host: string
  try {
    host = new URL(value, window.location.origin).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }

  if (host === 'wa.me' || host === 'api.whatsapp.com' || host === 'web.whatsapp.com') {
    return 'whatsapp'
  }
  if (host === 'm.me' || host === 'messenger.com') return 'messenger'

  return null
}

/**
 * Site-wide Contact instrumentation.
 *
 * A single delegated listener watches every click; when it lands on a
 * contact-intent link and analytics consent is granted, it emits one Meta
 * `Contact` event. Browser Pixel and server CAPI are handed the same `eventId`
 * so Meta deduplicates the pair. Each channel fires at most once per page load
 * to keep an impatient double-click from double-counting.
 */
export function ContactLinkTracker({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return

    const fired = new Set<ContactMethod>()

    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!anchor) return

      const method = classifyContactHref(anchor.getAttribute('href') ?? '')
      if (!method || fired.has(method)) return
      if (readMetaConsent() !== 'granted') return

      fired.add(method)
      const eventId = newBrowserEventId('contact')
      trackBrowserEvent('Contact', { content_name: method }, eventId)
      void trackContact({ eventId, method })
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [enabled])

  return null
}
