import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { getCachedActiveProducts, productFiltersSchema } from '@/modules/catalog'
import { ProductGrid } from '@/modules/catalog/components/product-card'

export const metadata: Metadata = { title: 'Search' }

/**
 * Newest arrivals, shown when a query finds nothing or has not been typed.
 *
 * `connection()` marks this per-request. Without it the build fails: this is
 * the only database call on the page, and Next tries to pull it into the static
 * shell, where the Neon driver's WebSocket handshake asks for random bytes
 * before any request data has been read. Declaring the subtree dynamic is the
 * honest description — it streams in behind the skeleton either way.
 */
async function FallbackProducts({ heading = 'New arrivals' }: { heading?: string }) {
  await connection()

  const { rows } = await getCachedActiveProducts({ sort: 'newest', page: 1 })
  if (rows.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
      <ProductGrid products={rows.map((r) => ({ ...r, totalStock: Number(r.totalStock) }))} />
    </section>
  )
}

/** Holds the page height steady while the grid streams in. */
function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="aspect-square animate-pulse rounded-lg bg-(--color-surface)" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-(--color-surface)" />
        </div>
      ))}
    </div>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const raw = await searchParams
  // Relevance ranking only means something when there is a query.
  const filters = productFiltersSchema.parse({ ...raw, sort: raw.sort ?? 'relevance' })

  // An empty search box is a browsing intent, not an error state.
  if (!filters.q) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
          <p className="text-(--color-muted)">
            Type a product, brand or category into the box above.
          </p>
        </div>

        <Suspense fallback={null}>
          <FallbackProducts heading="Or start here" />
        </Suspense>
      </div>
    )
  }

  const { rows, total, pageSize } = await getCachedActiveProducts(filters)
  const lastPage = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Results for “{filters.q}”
        </h1>
        <p className="text-sm text-(--color-muted)">
          {total} {total === 1 ? 'match' : 'matches'}
        </p>
      </div>

      {rows.length === 0 ? (
        /**
         * A dead end here is an abandoned visit. The customer wanted something
         * and we have not got it under that word, so show what we do have
         * rather than an apology — the same reasoning as the cart and product
         * page recommendations.
         */
        <div className="flex flex-col gap-8">
          <div className="rounded-lg border border-dashed border-(--color-border) px-6 py-10 text-center">
            <p className="font-medium">Nothing matched “{filters.q}”</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-(--color-muted)">
              Try fewer words, or a brand or category name. You can also browse everything below.
            </p>
          </div>

          <Suspense fallback={<GridSkeleton />}>
            <FallbackProducts />
          </Suspense>
        </div>
      ) : (
        <ProductGrid products={rows.map((r) => ({ ...r, totalStock: Number(r.totalStock) }))} />
      )}

      {lastPage > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-(--color-muted)">
            Page {filters.page} of {lastPage}
          </span>
          <div className="flex gap-2">
            {filters.page > 1 ? (
              <Link
                href={{ pathname: '/search', query: { q: filters.q, page: String(filters.page - 1) } }}
                className="rounded-md border border-(--color-border) px-3 py-1.5 hover:bg-(--color-surface)"
              >
                Previous
              </Link>
            ) : null}
            {filters.page < lastPage ? (
              <Link
                href={{ pathname: '/search', query: { q: filters.q, page: String(filters.page + 1) } }}
                className="rounded-md border border-(--color-border) px-3 py-1.5 hover:bg-(--color-surface)"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
