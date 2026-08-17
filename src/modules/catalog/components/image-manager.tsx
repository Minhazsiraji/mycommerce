'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

import { attachImage, createImageUploadSignature, removeImage, reorderImages } from '../actions'

/**
 * URLs are computed on the server and passed in — building a Cloudinary URL here
 * would put vendor knowledge in the browser and defeat the storage abstraction.
 * After an upload we refresh so the server hands back the new URL.
 */
export type ManagedImage = { id: string; url: string; alt: string | null }

const MAX_BYTES = 5 * 1024 * 1024

export function ImageManager({
  productId,
  images,
}: {
  productId: string
  images: ManagedImage[]
}) {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  async function upload(files: FileList) {
    setError(undefined)
    setBusy(true)

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image.`)
          continue
        }
        if (file.size > MAX_BYTES) {
          setError(`${file.name} is larger than 5 MB.`)
          continue
        }

        const signed = await createImageUploadSignature()
        if (!signed.ok) {
          setError(signed.error.message)
          return
        }

        const body = new FormData()
        for (const [k, v] of Object.entries(signed.data.fields)) body.append(k, v)
        body.append('file', file)

        // Straight to the provider — the file never passes through our server,
        // so product photos never hit the serverless request body limit.
        const res = await fetch(signed.data.uploadUrl, { method: 'POST', body })
        if (!res.ok) {
          setError(`Upload failed for ${file.name}.`)
          return
        }

        const uploaded: { public_id?: string } = await res.json()
        if (!uploaded.public_id) {
          setError('The upload service returned an unexpected response.')
          return
        }

        const attached = await attachImage({ productId, key: uploaded.public_id })
        if (!attached.ok) {
          setError(attached.error.message)
          return
        }
      }

      if (fileInput.current) fileInput.current.value = ''
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const next = [...images]
    const target = index + direction
    const a = next[index]
    const b = next[target]
    if (!a || !b) return

    next[index] = b
    next[target] = a

    setBusy(true)
    try {
      const result = await reorderImages({ productId, ids: next.map((i) => i.id) })
      if (!result.ok) setError(result.error.message)
      else router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this image?')) return

    setBusy(true)
    try {
      const result = await removeImage(id)
      if (!result.ok) setError(result.error.message)
      else router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-(--color-muted)">Images</h2>
        <span className="text-xs text-(--color-muted)">First image is used on product cards</span>
      </div>

      {images.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--color-border) px-6 py-10 text-center text-sm text-(--color-muted)">
          No images yet.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {images.map((image, i) => (
            <li
              key={image.id}
              className="flex flex-col gap-2 rounded-lg border border-(--color-border) p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, already sized by the provider */}
              <img
                src={image.url}
                alt={image.alt ?? ''}
                className="aspect-square w-full rounded object-cover"
              />
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={i === 0 || busy}
                    onClick={() => move(i, -1)}
                    className="rounded border border-(--color-border) px-1.5 disabled:opacity-40"
                    aria-label="Move earlier"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={i === images.length - 1 || busy}
                    onClick={() => move(i, 1)}
                    className="rounded border border-(--color-border) px-1.5 disabled:opacity-40"
                    aria-label="Move later"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(image.id)}
                  className="text-(--color-danger) underline underline-offset-4 disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && upload(e.target.files)}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          {busy ? 'Working…' : 'Upload images'}
        </Button>
        <span className="text-xs text-(--color-muted)">
          JPG, PNG or WebP up to 5 MB. Recommended: 1200 × 1200 px, 1:1 square.
        </span>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </section>
  )
}
