import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { connection } from 'next/server'

import { formatBdt } from '@/lib/money'
import { storage } from '@/lib/storage'
import { listCategories, listProductsForAdmin, productFiltersSchema } from '@/modules/catalog'

export const metadata: Metadata = { title: 'Products' }

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-500',
  draft: 'bg-amber-500/15 text-amber-600',
  archived: 'bg-neutral-500/15 text-(--color-muted)',
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  await connection()

  const raw = await searchParams
  const filters = productFiltersSchema.parse(raw)

  const [{ rows, total, pageSize }, categories] = await Promise.all([
    listProductsForAdmin(filters),
    listCategories(),
  ])

  const lastPage = Math.max(1, Math.ceil(total / pageSize))

  // The object form keeps typedRoutes happy — a built-up string is not a
  // statically known route, but `pathname` plus `query` is.
  const pageHref = (page: number) => ({
    pathname: '/admin/products' as const,
    query: {
      ...(filters.q ? { q: filters.q } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-(--color-muted)">
            {total} {total === 1 ? 'product' : 'products'}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center rounded-md bg-(--color-accent) px-4 text-sm font-medium text-(--color-accent-fg) hover:opacity-90"
        >
          New product
        </Link>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={filters.q ?? ''}
          placeholder="Search products…"
          aria-label="Search products"
          className="h-10 min-w-56 flex-1 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={filters.status ?? ''}
          aria-label="Filter by status"
          className="h-10 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <select
          name="categoryId"
          defaultValue={filters.categoryId ?? ''}
          aria-label="Filter by category"
          className="h-10 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-md border border-(--color-border) px-4 text-sm hover:bg-(--color-surface)"
        >
          Apply
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-(--color-border) px-6 py-16 text-center">
          <p className="font-medium">No products yet</p>
          <p className="mt-1 text-sm text-(--color-muted)">
            {total === 0 && !filters.q
              ? 'Create your first product to see it on the storefront.'
              : 'No products match those filters.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-(--color-border)">
          <table className="w-full min-w-3xl text-sm">
            <thead className="bg-(--color-surface) text-left text-(--color-muted)">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">From</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-(--color-border)">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      {p.imageKey ? (
                        <Image
                          src={storage.url(p.imageKey, { width: 80, height: 80, fit: 'cover' })}
                          alt=""
                          width={40}
                          height={40}
                          className="size-10 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <span className="size-10 shrink-0 rounded bg-(--color-surface)" />
                      )}
                      <span>
                        <span className="font-medium underline-offset-4 hover:underline">
                          {p.title}
                        </span>
                        {p.brand ? (
                          <span className="block text-xs text-(--color-muted)">{p.brand}</span>
                        ) : null}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[p.status] ?? ''}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--color-muted)">{p.categoryName ?? '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {p.fromPrice == null ? '—' : formatBdt(Number(p.fromPrice))}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums ${
                      Number(p.totalStock) === 0 ? 'text-(--color-danger)' : ''
                    }`}
                  >
                    {Number(p.totalStock)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lastPage > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-(--color-muted)">
            Page {filters.page} of {lastPage}
          </span>
          <div className="flex gap-2">
            {filters.page > 1 ? (
              <Link
                href={pageHref(filters.page - 1)}
                className="rounded-md border border-(--color-border) px-3 py-1.5 hover:bg-(--color-surface)"
              >
                Previous
              </Link>
            ) : null}
            {filters.page < lastPage ? (
              <Link
                href={pageHref(filters.page + 1)}
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
