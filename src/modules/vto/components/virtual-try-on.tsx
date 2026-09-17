'use client'

import { useEffect, useRef, useState } from 'react'

import { VTO_BASE_URL, VTO_PUBLIC_KEY } from '../config'

type ResultState = {
  token: string
  assetId: string
  imageUrl: string
  remaining: number
}

function anonymousId() {
  const key = 'sirajibd-vto-anonymous-id'
  let value = localStorage.getItem(key)
  if (!value) {
    value = crypto.randomUUID()
    localStorage.setItem(key, value)
  }
  return value
}

export function VirtualTryOn({
  catalogItemId,
  productTitle,
  productImageUrl,
}: {
  catalogItemId: string
  productTitle: string
  productImageUrl?: string
}) {
  const [open, setOpen] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('Choose a clear full-body photo.')
  const [result, setResult] = useState<ResultState | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
    if (result?.imageUrl) URL.revokeObjectURL(result.imageUrl)
  }, [preview, result?.imageUrl])

  function choosePhoto(file: File | null) {
    if (preview) URL.revokeObjectURL(preview)
    setPhoto(file)
    setPreview(file ? URL.createObjectURL(file) : null)
    setStatus(file ? 'Photo ready. Accept consent, then generate.' : 'Choose a clear full-body photo.')
  }

  async function jsonRequest(path: string, init: RequestInit) {
    const response = await fetch(`${VTO_BASE_URL}${path}`, init)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || `request_failed_${response.status}`)
    return data
  }
  async function generate() {
    if (!photo || !consent || busy) return
    setBusy(true)
    setShareUrl(null)
    try {
      setStatus('Starting secure try-on session…')
      const session = await jsonRequest('/api/v1/sdk/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: VTO_PUBLIC_KEY, anonymousId: anonymousId() }),
      })
      const auth = { Authorization: `Bearer ${session.sessionToken}` }
      await jsonRequest('/api/v1/sdk/consent', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accepted: true, policyVersion: 'vto-consent-v1' }),
      })
      setStatus('Uploading your photo privately…')
      const form = new FormData()
      form.append('photo', photo)
      const asset = await jsonRequest('/api/v1/sdk/assets', {
        method: 'POST', headers: auth, body: form,
      })
      setStatus('Generating your virtual try-on…')
      const job = await jsonRequest('/api/v1/sdk/jobs', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogItemId, personAssetId: asset.asset.id }),
      })
      const run = await jsonRequest(`/api/v1/sdk/jobs/${job.job.id}/run`, {
        method: 'POST', headers: auth,
      })
      const resultResponse = await fetch(
        `${VTO_BASE_URL}/api/v1/sdk/results/${run.job.resultAssetId}`,
        { method: 'POST', headers: auth },
      )
      if (!resultResponse.ok) throw new Error('result_fetch_failed')
      const imageUrl = URL.createObjectURL(await resultResponse.blob())
      setResult({
        token: session.sessionToken,
        assetId: run.job.resultAssetId,
        imageUrl,
        remaining: job.job.remainingGenerations ?? 0,
      })
      setStatus('Your virtual try-on is ready.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.'
      setStatus(message === 'generation_limit_reached' ? 'You reached the try-on limit for this item.' : message)
    } finally {
      setBusy(false)
    }
  }
  async function getBrandedBlob() {
    if (!result) return null
    const response = await fetch(
      `${VTO_BASE_URL}/api/v1/sdk/results/${result.assetId}/export`,
      { method: 'POST', headers: { Authorization: `Bearer ${result.token}` } },
    )
    if (!response.ok) throw new Error('export_failed')
    return response.blob()
  }

  async function save() {
    try {
      const blob = await getBrandedBlob()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'sirajibd-virtual-try-on.jpg'
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setStatus('Branded image saved.')
    } catch {
      setStatus('Could not save the branded image. Please try again.')
    }
  }
  async function createShareLink() {
    if (!result) return
    try {
      const data = await jsonRequest(`/api/v1/sdk/results/${result.assetId}/share-link`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${result.token}` },
      })
      setShareUrl(data.url)
      setStatus('Share link created. Copy it and share anywhere.')
    } catch {
      setStatus('Could not create a share link. Please try again.')
    }
  }

  async function copyShareLink() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setStatus('Share link copied.')
    } catch {
      setStatus('Copy failed. Select the link below and copy it manually.')
    }
  }

  const canGenerate = Boolean(photo && consent && !busy)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-(--color-fg) px-5 py-3 font-medium transition hover:bg-(--color-fg) hover:text-(--color-bg)"
      >
        Virtual Try-On
      </button>
      {open ? (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Virtual try-on for ${productTitle}`}
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-(--color-bg) p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-[0.18em] text-(--color-muted)">AGENTSIRAJI VTO</p>
                <h2 className="mt-1 text-2xl font-semibold">Try {productTitle} virtually</h2>
                <p className="mt-1 text-sm text-(--color-muted)">Upload a clear photo. Maximum 3 generations per item.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border px-3 py-1.5 text-sm">
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <section className="rounded-2xl border border-(--color-border) p-4">
                <p className="font-medium">Product</p>
                {productImageUrl ? (
                  <img src={productImageUrl} alt={productTitle} className="mt-3 aspect-square w-full rounded-xl object-contain" />
                ) : null}
              </section>
              <section className="rounded-2xl border border-(--color-border) p-4">
                <p className="font-medium">Your photo</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-3 w-full rounded-xl border-2 border-dashed border-(--color-border) p-4 text-left"
                >
                  {preview ? (
                    <div className="flex items-center gap-3">
                      <img src={preview} alt="Selected photo" className="h-20 w-16 rounded-lg object-cover" />
                      <div><p className="font-medium">Photo ready</p><p className="text-xs text-(--color-muted)">Choose another photo</p></div>
                    </div>
                  ) : (
                    <><p className="font-medium">Choose full-body photo</p><p className="text-xs text-(--color-muted)">JPG, PNG or WebP</p></>
                  )}
                </button>
                <label className="mt-4 flex gap-2 text-sm leading-5">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>I consent to using this photo only for my virtual try-on.</span>
                </label>
                <button
                  type="button"
                  disabled={!canGenerate}
                  onClick={generate}
                  className="mt-4 w-full rounded-xl bg-(--color-fg) px-5 py-3 font-medium text-(--color-bg) disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy ? 'Generating…' : 'Generate virtual try-on'}
                </button>
                <p className="mt-3 text-sm text-(--color-muted)">{status}</p>
              </section>
            </div>

            {result ? (
              <section className="mt-5 rounded-2xl border border-(--color-border) p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="font-medium">Your result</p><p className="text-xs text-(--color-muted)">{result.remaining} generations remaining for this item.</p></div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={save} className="rounded-lg border px-3 py-2 text-sm">Save branded image</button>
                    <button type="button" onClick={createShareLink} className="rounded-lg bg-(--color-fg) px-3 py-2 text-sm text-(--color-bg)">Create share link</button>
                  </div>
                </div>
                <img src={result.imageUrl} alt="Virtual try-on result" className="mt-4 max-h-[680px] w-full rounded-xl bg-black/5 object-contain" />
                {shareUrl ? (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input readOnly value={shareUrl} className="min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-2 text-xs" />
                    <button type="button" onClick={copyShareLink} className="rounded-lg border px-3 py-2 text-sm">Copy link</button>
                    <a href={shareUrl} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-2 text-center text-sm">Open link</a>
                  </div>
                ) : null}
                <p className="mt-3 text-xs text-(--color-muted)">The in-store result stays clean. Saved/shared copies carry the AgentSiraji VTO watermark.</p>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
