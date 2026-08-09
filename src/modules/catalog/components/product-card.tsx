import Image from 'next/image'
import Link from 'next/link'

import { formatBdt } from '@/lib/money'
import { storage } from '@/lib/storage'

export type ProductCardData = {
  slug: string
  title: string
  brand: string | null
  fromPrice: number | null
  totalStock: number
  imageKey: string | null
}

/**
 * Server component — it calls `storage.url`, which keeps provider knowledge off
 * the client. `priority` is passed for above-the-fold cards so the LCP image is
 * not lazy-loaded.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData
  priority?: boolean
}) {
  const soldOut = Number(product.totalStock) === 0

  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex min-w-0 flex-col gap-3 rounded-(--radius-lg) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)"
    >
      <div className="relative aspect-square overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface-secondary) shadow-(--shadow-1) transition-[transform,box-shadow] duration-(--duration-base) ease-(--ease-standard) group-hover:-translate-y-0.5 group-hover:shadow-(--shadow-2) motion-reduce:transform-none">
        {product.imageKey ? (
          <Image
            src={storage.url(product.imageKey, { width: 600, height: 600, fit: 'cover' })}
            alt={product.title}
            fill
            // Phones never download the desktop asset. See docs/05-performance.md.
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-(image:--gradient-brand-soft) px-4 text-center text-xs font-medium text-(--text-muted)">
            Image unavailable
          </div>
        )}

        {soldOut ? (
          <span className="absolute top-2 left-2 rounded-(--radius-pill) bg-(--surface-primary)/90 px-2 py-1 text-xs font-medium text-(--text-secondary) backdrop-blur-sm">
            Sold out
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5">
        {product.brand ? (
          <span className="text-xs text-(--text-muted)">{product.brand}</span>
        ) : null}
        <h3 className="line-clamp-2 text-sm font-medium text-(--text-primary) underline-offset-4 group-hover:underline sm:text-base">
          {product.title}
        </h3>
        <span className="text-sm font-semibold text-(--text-primary) tabular-nums sm:text-base">
          {product.fromPrice == null ? '—' : formatBdt(Number(product.fromPrice))}
        </span>
      </div>
    </Link>
  )
}

export function ProductGrid({
  products,
  priorityCount = 4,
}: {
  products: ProductCardData[]
  priorityCount?: number
}) {
  return (
    <ul className="grid grid-cols-1 gap-x-4 gap-y-8 min-[360px]:grid-cols-2 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product, i) => (
        <li key={product.slug}>
          <ProductCard product={product} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  )
}
