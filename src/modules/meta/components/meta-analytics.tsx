'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import {
  META_CONSENT_EVENT,
  META_PRIVACY_OPEN_EVENT,
  type MetaConsent,
} from '../consent'
import { readMetaConsent, writeMetaConsent } from './client'

function bootPixel(pixelId: string) {
  if (!window.fbq) {
    const fbq: NonNullable<Window['fbq']> = (...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args)
      else (fbq.queue ??= []).push(args)
    }
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    fbq.push = fbq
    window.fbq = fbq
    window._fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  if (window._sirajiMetaPixelId !== pixelId) {
    window.fbq('init', pixelId)
    window._sirajiMetaPixelId = pixelId
  }

  window.fbq('consent', 'grant')
  window.dispatchEvent(new Event('sirajibd:pixel-ready'))
}

export function MetaAnalytics({ pixelId, enabled }: { pixelId?: string; enabled: boolean }) {
  const pathname = usePathname()
  const consent = useSyncExternalStore(
    (onChange) => {
      window.addEventListener(META_CONSENT_EVENT, onChange)
      return () => window.removeEventListener(META_CONSENT_EVENT, onChange)
    },
    readMetaConsent,
    () => 'unset' as MetaConsent,
  )
  const [choicesOpen, setChoicesOpen] = useState(false)
  const lastPage = useRef<string | undefined>(undefined)

  useEffect(() => {
    const openChoices = () => setChoicesOpen(true)
    const closeChoices = () => setChoicesOpen(false)

    window.addEventListener(META_CONSENT_EVENT, closeChoices)
    window.addEventListener(META_PRIVACY_OPEN_EVENT, openChoices)
    return () => {
      window.removeEventListener(META_CONSENT_EVENT, closeChoices)
      window.removeEventListener(META_PRIVACY_OPEN_EVENT, openChoices)
    }
  }, [])

  useEffect(() => {
    if (!pixelId || consent !== 'granted') {
      if (consent === 'denied' && window.fbq) window.fbq('consent', 'revoke')
      return
    }

    bootPixel(pixelId)
    if (lastPage.current !== pathname) {
      window.fbq?.('track', 'PageView')
      lastPage.current = pathname
    }
  }, [consent, pathname, pixelId])

  if (!enabled || (consent !== 'unset' && !choicesOpen)) return null

  return (
    <section
      role="dialog"
      aria-label="Analytics privacy choices"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-(--radius-xl) border border-(--color-border) bg-(--color-bg) p-5 shadow-(--shadow-3)"
    >
      <h2 className="font-semibold">Your privacy choices</h2>
      <p className="mt-2 text-sm leading-6 text-(--color-muted)">
        Essential cookies keep your cart, account and checkout working. With your permission,
        optional analytics such as Meta and Google help us measure product views, checkout and
        completed orders. Advertising and analytics tracking stays off unless you allow it.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => writeMetaConsent('denied')}
          className="min-h-11 rounded-md border border-(--color-border) px-5 text-sm font-medium"
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={() => writeMetaConsent('granted')}
          className="min-h-11 rounded-md bg-(--color-accent) px-5 text-sm font-medium text-(--color-accent-fg)"
        >
          Allow analytics
        </button>
      </div>
    </section>
  )
}

export function PrivacyChoicesButton({ enabled }: { enabled: boolean }) {
  if (!enabled) return null

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(META_PRIVACY_OPEN_EVENT))}
      className="min-h-11 text-xs underline underline-offset-4 hover:text-(--text-primary)"
    >
      Privacy choices
    </button>
  )
}
