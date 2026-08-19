'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useSyncExternalStore } from 'react'

import { META_CONSENT_EVENT, type MetaConsent } from '@/modules/meta/consent'
import { readMetaConsent } from '@/modules/meta/components/client'

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
  }, [consent, enabled, pathname, tagId])

  return null
}
