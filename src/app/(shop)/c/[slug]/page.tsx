import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  getCategoryBySlug,
  listActiveProducts,
  listCategories,
  productFiltersSchema,
} from '@/modules/catalog'
import { ProductGrid } from '@/modules/catalog/components/product-card'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  return category ? { title: category.name, description: category.description ?? undefined } : {}
}

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
] as const

export default async function CategoryPage({
  params,
  searchParams,
}: Params & { searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params
  const filters = productFiltersSchema.parse(await searchParams)

  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  // A top-level category shows everything beneath it, not just products
  // assigned to the parent directly.
  const all = await listCategories()
  const childIds = all.filter((c) => c.parentId === category.id).map((c) => c.id)

  const { rows, total, pageSize } = await listActiveProducts(filters, {
    categoryIds: [category.id, ...childIds],
  })

  const lastPage = Math.max(1, Math.ceil(total / pageSize))

  const hrefFor = (overrides: Record<string, string>) => ({
    pathname: `/c/${slug}` as const,
    query: {
      ...(filters.sort !== 'newest' ? { sort: filters.sort } : {}),
      ...(filters.page > 1 ? { page: String(filters.page) } : {}),
      ...overrides,
    },
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
        {category.description ? (
          <p className="max-w-2xl text-(--color-muted)">{category.description}</p>
        ) : null}
      </div>

      {childIds.length > 0 ? (
        <nav className="flex flex-wrap gap-2">
          {all
            .filter((c) => c.parentId === category.id)
            .map((child) => (
              <Link
                key={child.id}
                href={`/c/${child.slug}`}
                className="rounded-full border border-(--color-border) px-3 py-1.5 text-sm hover:bg-(--color-surface)"
              >
                {child.name}
              </Link>
            ))}
        </nav>
      ) : null}

      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-(--color-muted)">
          {total} {total === 1 ? 'product' : 'products'}
        </span>
        <div className="flex gap-2">
          {SORTS.map((option) => (
            <Link
              key={option.value}
              href={hrefFor({ sort: option.value, page: '1' })}
              className={`rounded-md px-2 py-1 ${
                filters.sort === option.value
                  ? 'bg-(--color-surface) font-medium'
                  : 'text-(--color-muted) hover:text-(--color-fg)'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--color-border) px-6 py-20 text-center text-(--color-muted)">
          Nothing in this category yet.
        </p>
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
                href={hrefFor({ page: String(filters.page - 1) })}
                className="rounded-md border border-(--color-border) px-3 py-1.5 hover:bg-(--color-surface)"
              >
                Previous
              </Link>
            ) : null}
            {filters.page < lastPage ? (
              <Link
                href={hrefFor({ page: String(filters.page + 1) })}
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
