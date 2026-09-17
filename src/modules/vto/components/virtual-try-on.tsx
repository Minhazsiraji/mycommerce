'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

import { VTO_BASE_URL, VTO_PUBLIC_KEY, VTO_SDK_URL } from '../config'

type VariantSelectedEvent = CustomEvent<{ variantId?: string }>

export function VirtualTryOn({
  productId,
  initialVariantId,
  productTitle,
  productImageUrl,
}: {
  productId: string
  initialVariantId: string
  productTitle: string
  productImageUrl?: string
}) {
  const [variantId, setVariantId] = useState(initialVariantId)
  const [availableKey, setAvailableKey] = useState<string | null>(null)

  useEffect(() => {
    const onVariantSelected = (event: Event) => {
      const next = (event as VariantSelectedEvent).detail?.variantId
      if (next) setVariantId(next)
    }
    window.addEventListener('commerce:variant-selected', onVariantSelected)
    return () => window.removeEventListener('commerce:variant-selected', onVariantSelected)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const query = new URLSearchParams({
      publicKey: VTO_PUBLIC_KEY,
      externalProductId: productId,
      externalVariantId: variantId,
    })

    fetch(`${VTO_BASE_URL}/api/v1/sdk/availability?${query.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setAvailableKey(data?.available ? `${productId}:${variantId}` : null))
      .catch(() => {
        if (!controller.signal.aborted) setAvailableKey(null)
      })

    return () => controller.abort()
  }, [productId, variantId])

  const availabilityKey = `${productId}:${variantId}`
  const visibilityClass = availableKey === availabilityKey ? '' : 'hidden'

  return (
    <>
      <Script src={VTO_SDK_URL} strategy="afterInteractive" />
      <button
        type="button"
        data-agentsiraji-vto
        data-vto-base-url={VTO_BASE_URL}
        data-public-key={VTO_PUBLIC_KEY}
        data-product-id={productId}
        data-variant-id={variantId}
        data-product-title={productTitle}
        data-product-image={productImageUrl}
        className={`${visibilityClass} w-full rounded-xl border border-(--color-fg) px-5 py-3 font-medium transition hover:bg-(--color-fg) hover:text-(--color-bg)`}
      >
        Virtual Try-On
      </button>
      <p className={`${visibilityClass} text-xs text-(--color-muted)`}>
        Powered by AgentSiraji VTO · Your clean result stays private.
      </p>
    </>
  )
}
