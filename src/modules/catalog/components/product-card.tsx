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
      className="group flex h-full min-w-0 flex-col gap-2 sm:gap-3 rounded-(--radius-xl) border border-white/70 bg-(image:--gradient-brand-soft) p-1.5 shadow-(--shadow-1) backdrop-blur-[12px] transition-[transform,border-color,box-shadow] duration-(--duration-base) ease-(--ease-standard) hover:-translate-y-0.5 hover:border-(--border-interactive) hover:shadow-(--shadow-2) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring) motion-reduce:transform-none sm:p-3 dark:border-white/20"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface-secondary)">
        {product.imageKey ? (
          <Image
            src={storage.url(product.imageKey, { width: 560, height: 700, fit: 'cover' })}
            alt={product.title}
            fill
            // Phones never download the desktop asset. See docs/05-performance.md.
            sizes="(max-width: 359px) 100vw, (max-width: 639px) 50vw, (max-width: 1023px) 33vw, 264px"
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

      <div className="flex h-[4.75rem] flex-col gap-0.5 px-1 pb-1 sm:h-[6.5rem]">
        {product.brand ? (
          <span className="truncate text-[10px] text-(--text-muted) sm:text-xs">{product.brand}</span>
        ) : null}
        <h3 className="line-clamp-2 min-h-8 text-xs font-medium text-(--text-primary) underline-offset-4 group-hover:underline sm:min-h-12 sm:text-base">
          {product.title}
        </h3>
        <span className="mt-auto text-xs font-semibold sm:text-base text-(--text-primary) tabular-nums ">
          {product.fromPrice == null ? '—' : formatBdt(Number(product.fromPrice))}
        </span>
      </div>
    </Link>
  )
}

export function ProductGrid({
  products,
  priorityCount = 2,
}: {
  products: ProductCardData[]
  priorityCount?: number
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product, i) => (
        <li key={product.slug}>
          <ProductCard product={product} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  )
}
