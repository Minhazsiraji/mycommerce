'use client'

import { useEffect, useState } from 'react'

import { VTO_BASE_URL, VTO_PUBLIC_KEY, VTO_SDK_URL } from '../config'

type VariantSelectedEvent = CustomEvent<{ variantId?: string }>
type VtoSdk = {
  open: (options: {
    baseUrl: string
    publicKey: string
    productId: string
    variantId: string
    productTitle: string
    productImageUrl?: string
  }) => Promise<unknown>
}

declare global {
  interface Window {
    AgentSirajiVTO?: VtoSdk
  }
}

let sdkPromise: Promise<VtoSdk> | null = null

function loadVtoSdk() {
  if (window.AgentSirajiVTO) return Promise.resolve(window.AgentSirajiVTO)
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = VTO_SDK_URL
    script.async = true
    script.onload = () => {
      if (window.AgentSirajiVTO) resolve(window.AgentSirajiVTO)
      else reject(new Error('vto_sdk_unavailable'))
    }
    script.onerror = () => reject(new Error('vto_sdk_load_failed'))
    document.head.append(script)
  })

  return sdkPromise
}

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
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    const onVariantSelected = (event: Event) => {
      const next = (event as VariantSelectedEvent).detail?.variantId
      if (next) setVariantId(next)
    }
    window.addEventListener('commerce:variant-selected', onVariantSelected)
    return () => window.removeEventListener('commerce:variant-selected', onVariantSelected)
  }, [])

  useEffect(() => {
    let disposed = false
    let controller: AbortController | null = null

    const checkAvailability = () => {
      if (disposed) return
      controller = new AbortController()
      const query = new URLSearchParams({
        publicKey: VTO_PUBLIC_KEY,
        externalProductId: productId,
        externalVariantId: variantId,
      })

      fetch(`${VTO_BASE_URL}/api/v1/sdk/availability?${query.toString()}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!disposed) setAvailableKey(data?.available ? `${productId}:${variantId}` : null)
        })
        .catch(() => {
          if (!disposed && !controller?.signal.aborted) setAvailableKey(null)
        })
    }

    if (document.readyState === 'complete') checkAvailability()
    else window.addEventListener('load', checkAvailability, { once: true })

    return () => {
      disposed = true
      controller?.abort()
      window.removeEventListener('load', checkAvailability)
    }
  }, [productId, variantId])

  const availabilityKey = `${productId}:${variantId}`
  const visible = availableKey === availabilityKey

  async function openTryOn() {
    if (opening) return
    setOpening(true)
    try {
      const sdk = await loadVtoSdk()
      await sdk.open({
        baseUrl: VTO_BASE_URL,
        publicKey: VTO_PUBLIC_KEY,
        productId,
        variantId,
        productTitle,
        productImageUrl,
      })
    } catch (error) {
      console.error('[AgentSiraji VTO]', error)
    } finally {
      setOpening(false)
    }
  }

  if (!visible) return null

  return (
    <>
      <button
        type="button"
        onClick={openTryOn}
        disabled={opening}
        className="w-full rounded-xl border border-(--color-fg) px-5 py-3 font-medium transition hover:bg-(--color-fg) hover:text-(--color-bg) disabled:cursor-wait disabled:opacity-60"
      >
        {opening ? 'Opening Virtual Try-On…' : 'Virtual Try-On'}
      </button>
      <p className="text-xs text-(--color-muted)">
        Powered by AgentSiraji VTO · Your clean result stays private.
      </p>
    </>
  )
}
