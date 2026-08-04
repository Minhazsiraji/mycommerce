import Link from 'next/link'

import { getCachedActiveProducts } from '@/modules/catalog'
import { ProductGrid } from '@/modules/catalog/components/product-card'

export default async function HomePage() {
  // Cached and tag-invalidated, so this is served without touching the
  // database and still updates the moment a product is published.
  const { rows, total } = await getCachedActiveProducts({ sort: 'newest', page: 1 })

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
