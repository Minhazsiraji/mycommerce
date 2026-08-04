import type { Metadata } from 'next'
import Link from 'next/link'

import { getCachedActiveProducts, productFiltersSchema } from '@/modules/catalog'
import { ProductGrid } from '@/modules/catalog/components/product-card'

export const metadata: Metadata = { title: 'Search' }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const raw = await searchParams
  // Relevance ranking only means something when there is a query.
  const filters = productFiltersSchema.parse({ ...raw, sort: raw.sort ?? 'relevance' })

  if (!filters.q) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-(--color-muted)">Type something into the box above to find products.</p>
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
        <div className="rounded-lg border border-dashed border-(--color-border) px-6 py-20 text-center">
          <p className="font-medium">Nothing matched that</p>
          <p className="mt-1 text-sm text-(--color-muted)">
            Try fewer words, or a brand or category name.
          </p>
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
