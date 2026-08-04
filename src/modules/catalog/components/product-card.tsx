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
    <Link href={`/p/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-(--color-surface)">
        {product.imageKey ? (
          <Image
            src={storage.url(product.imageKey, { width: 600, height: 600, fit: 'cover' })}
            alt={product.title}
            fill
            // Phones never download the desktop asset. See docs/05-performance.md.
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-(--color-muted)">
            No image
          </div>
        )}

        {soldOut ? (
          <span className="absolute top-2 left-2 rounded-full bg-(--color-bg)/90 px-2 py-1 text-xs font-medium">
            Sold out
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5">
        {product.brand ? (
          <span className="text-xs text-(--color-muted)">{product.brand}</span>
        ) : null}
        <h3 className="text-sm font-medium underline-offset-4 group-hover:underline">
          {product.title}
        </h3>
        <span className="text-sm tabular-nums">
          {product.fromPrice == null ? '—' : formatBdt(Number(product.fromPrice))}
        </span>
      </div>
    </Link>
  )
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.slug} product={product} priority={i < 4} />
      ))}
    </div>
  )
}
