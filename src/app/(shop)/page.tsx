import Link from 'next/link'

import { listActiveProducts } from '@/modules/catalog'
import { ProductGrid } from '@/modules/catalog/components/product-card'

/**
 * Next cannot tell that `listActiveProducts` reads a database, so without this
 * the page is prerendered at build time — frozen against whatever the catalog
 * held when the deploy ran. A product published afterwards would never appear.
 *
 * docs/05-performance.md wants these pages static with tag-based revalidation,
 * which needs Next's `use cache` (and the actions' existing `updateTag` calls
 * to hang off it). That is the outstanding performance task; correctness first.
 */
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { rows, total } = await listActiveProducts({ sort: 'newest', page: 1 })

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">New arrivals</h1>
        <p className="text-(--color-muted)">
          {total === 0
            ? 'Nothing published yet.'
            : `${total} ${total === 1 ? 'product' : 'products'} available.`}
        </p>
      </section>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-(--color-border) px-6 py-20 text-center">
          <p className="font-medium">The store is empty</p>
          <p className="mt-1 text-sm text-(--color-muted)">
            Products appear here once they are published from the admin.
          </p>
          <Link href="/admin/products" className="mt-4 inline-block text-sm underline underline-offset-4">
            Go to admin
          </Link>
        </div>
      ) : (
        <ProductGrid products={rows.map((r) => ({ ...r, totalStock: Number(r.totalStock) }))} />
      )}
    </div>
  )
}
