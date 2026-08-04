'use client'

import Image from 'next/image'
import { useState } from 'react'

/** URLs are built on the server so the client stays provider-agnostic. */
export type GalleryImage = { id: string; url: string; thumbUrl: string; alt: string | null }

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [activeId, setActiveId] = useState(images[0]?.id)
  const active = images.find((i) => i.id === activeId) ?? images[0]

  if (!active) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-(--color-surface) text-sm text-(--color-muted)">
        No image
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-(--color-surface)">
        <Image
          src={active.url}
          alt={active.alt ?? title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          // The largest element above the fold, so never lazy-loaded.
          priority
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex gap-3 overflow-x-auto">
          {images.map((image) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActiveId(image.id)}
                aria-label={`Show image ${images.indexOf(image) + 1}`}
                aria-pressed={image.id === active.id}
                className={`relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                  image.id === active.id ? 'border-(--color-accent)' : 'border-transparent'
                }`}
              >
                <Image
                  src={image.thumbUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
