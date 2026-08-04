'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

/** URLs are built on the server so the client stays provider-agnostic. */
export type GalleryImage = {
  id: string
  url: string
  thumbUrl: string
  /** Higher resolution, requested only when zooming or opening the lightbox. */
  fullUrl: string
  alt: string | null
}

const ZOOM = 2.5

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [activeId, setActiveId] = useState(images[0]?.id)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zooming, setZooming] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const frameRef = useRef<HTMLDivElement>(null)

  const active = images.find((i) => i.id === activeId) ?? images[0]
  const activeIndex = active ? images.indexOf(active) : 0

  const step = useCallback(
    (delta: number) => {
      const next = images[(activeIndex + delta + images.length) % images.length]
      if (next) setActiveId(next.id)
    },
    [activeIndex, images],
  )

  // Escape closes; arrows move between images while the lightbox is open.
  useEffect(() => {
    if (!lightboxOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }

    document.addEventListener('keydown', onKey)
    // Stop the page scrolling behind the overlay.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [lightboxOpen, step])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  if (!active) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-(--color-surface) text-sm text-(--color-muted)">
        No image
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={frameRef}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={onMove}
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-lg bg-(--color-surface)"
      >
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 z-10 cursor-zoom-in"
          aria-label={`Open ${title} at full size`}
        />

        <Image
          src={active.url}
          alt={active.alt ?? title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          // Largest element above the fold, so never lazy-loaded.
          priority
          className="object-cover transition-transform duration-200 ease-out"
          style={{
            transform: zooming ? `scale(${ZOOM})` : 'scale(1)',
            transformOrigin: origin,
          }}
        />

        <span className="pointer-events-none absolute right-3 bottom-3 z-20 rounded-full bg-(--color-bg)/85 px-2.5 py-1 text-xs text-(--color-muted) opacity-0 transition-opacity group-hover:opacity-100">
          Click to enlarge
        </span>
      </div>

      {images.length > 1 ? (
        <ul className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActiveId(image.id)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={image.id === active.id}
                className={`relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                  image.id === active.id ? 'border-(--color-accent)' : 'border-transparent'
                }`}
              >
                <Image src={image.thumbUrl} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, image ${activeIndex + 1} of ${images.length}`}
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
          >
            Close
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
                aria-label="Previous image"
                className="absolute left-4 z-10 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
                aria-label="Next image"
                className="absolute right-4 z-10 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
              >
                →
              </button>
            </>
          ) : null}

          {/*
            A plain <img>, deliberately, not next/image.

            Cloudinary already negotiates format and size, so routing this
            through Vercel's optimizer would process an already-optimised image
            a second time and burn image-optimisation quota for nothing. It is
            also a single known image, so the responsive srcset next/image
            exists to build has no value here — and `fill` needs a resolved
            parent height, which it does not reliably get inside this flex
            overlay.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.fullUrl}
            alt={active.alt ?? title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-4xl object-contain"
          />
        </div>
      ) : null}
    </div>
  )
}
