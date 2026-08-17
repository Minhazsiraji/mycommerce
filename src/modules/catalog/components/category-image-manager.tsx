'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

import { attachCategoryImage, createCategoryImageUploadSignature } from '../actions'

const MAX_BYTES = 5 * 1024 * 1024

export function CategoryImageManager({
  category,
}: {
  category: { id: string; name: string; imageUrl: string | null }
}) {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  async function upload(file: File) {
    setError(undefined)

    if (!file.type.startsWith('image/')) {
      setError(`${file.name} is not an image.`)
      return
    }
    if (file.size > MAX_BYTES) {
      setError(`${file.name} is larger than 5 MB.`)
      return
    }

    setBusy(true)
    try {
      const signed = await createCategoryImageUploadSignature()
      if (!signed.ok) {
        setError(signed.error.message)
        return
      }

      const body = new FormData()
      for (const [key, value] of Object.entries(signed.data.fields)) body.append(key, value)
      body.append('file', file)

      const response = await fetch(signed.data.uploadUrl, { method: 'POST', body })
      if (!response.ok) {
        setError(`Upload failed for ${file.name}.`)
        return
      }

      const uploaded: { public_id?: string } = await response.json()
      if (!uploaded.public_id) {
        setError('The upload service returned an unexpected response.')
        return
      }

      const attached = await attachCategoryImage({
        categoryId: category.id,
        key: uploaded.public_id,
      })
      if (!attached.ok) {
        setError(attached.error.message)
        return
      }

      if (fileInput.current) fileInput.current.value = ''
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="flex items-center gap-2">
      {category.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, provider-sized
        <img
          src={category.imageUrl}
          alt=""
          className="size-12 shrink-0 rounded-md border border-(--color-border) object-cover"
        />
      ) : (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md border border-dashed border-(--color-border) text-[10px] text-(--color-muted)">
          No image
        </span>
      )}
      <span className="flex flex-col items-start gap-1">
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
          }}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          {busy ? 'Working…' : category.imageUrl ? 'Replace image' : 'Upload image'}
        </Button>
        <span className="max-w-56 text-[10px] leading-tight text-(--color-muted)">
          JPG, PNG or WebP up to 5 MB. Recommended: 1200 × 1200 px, 1:1 square.
        </span>
        {error ? (
          <span role="alert" className="max-w-56 text-[10px] text-(--color-danger)">
            {error}
          </span>
        ) : null}
      </span>
    </span>
  )
}
