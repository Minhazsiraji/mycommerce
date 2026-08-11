import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { connection } from 'next/server'

import { getSiteUrl, isIndexableEnvironment } from '@/lib/site-metadata'
import {
  categoryFiltersSchema,
  getCachedActiveProducts,
  getCachedCategories,
  getCachedCategoryBySlug,
  getCachedCategoryFacetData,
  categoryHref,
  categoryQuery,
  hasCategoryFilters,
} from '@/modules/catalog'
import { CategoryFiltersPanel } from '@/modules/catalog/components/category-filters'
import { CategoryFilterSheet } from '@/modules/catalog/components/category-filter-sheet'
import { ProductGrid } from '@/modules/catalog/components/product-card'

type RawQuery = Record<string, string | string[] | undefined>
type Params = { params: Promise<{ slug: string }>; searchParams: Promise<RawQuery> }
const ALLOWED_KEYS = new Set(['subcategory', 'brand', 'minPrice', 'maxPrice', 'inStock', 'sort', 'page'])

function parseQuery(raw: RawQuery) {
  return categoryFiltersSchema.safeParse(raw)
}

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  await connection()

  const [{ slug }, raw] = await Promise.all([params, searchParams])
  const category = await getCachedCategoryBySlug(slug)
  if (!category) return {}
  const all = await getCachedCategories()
  const categoryIds = [category.id, ...all.filter((item) => item.parentId === category.id).map((item) => item.id)]
  const { total } = await getCachedActiveProducts({ sort: 'newest', page: 1 }, { categoryIds, limit: 1 })
  const parsed = parseQuery(raw)
  const filters = parsed.success ? parsed.data : null
  const filtered = filters ? hasCategoryFilters(filters) : true
  const sorted = filters ? filters.sort !== 'newest' : true
  const canonicalQuery = filters && !filtered && !sorted && filters.page > 1 ? `?page=${filters.page}` : ''
  const indexable = isIndexableEnvironment() && total > 0 && !filtered && !sorted

  return {
    title: category.name,
    description: category.description ?? undefined,
    alternates: { canonical: new URL(`/c/${slug}${canonicalQuery}`, getSiteUrl()).href },
    robots: { index: indexable, follow: isIndexableEnvironment() },
  }
}

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
] as const

export default async function CategoryPage({ params, searchParams }: Params) {
  await connection()

  const [{ slug }, raw] = await Promise.all([params, searchParams])
  const parsed = parseQuery(raw)
  if (!parsed.success) redirect(categoryHref(slug, { brand: [], sort: 'newest', page: 1 }))
  const filters = parsed.data

  const category = await getCachedCategoryBySlug(slug)
  if (!category) notFound()
  const all = await getCachedCategories()
  const children = all.filter((item) => item.parentId === category.id)
  const selectedChild = filters.subcategory
    ? children.find((item) => item.slug === filters.subcategory)
    : undefined
  if (filters.subcategory && !selectedChild) redirect(categoryHref(slug, filters, { subcategory: undefined, page: 1 }))

  const normalized = categoryQuery(filters).toString()
  const submitted = new URLSearchParams()
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_KEYS.has(key)) continue
    const values = Array.isArray(raw[key]) ? raw[key] : [raw[key]]
    for (const value of values) if (value != null && value !== '') submitted.append(key, value)
  }
  if (Object.keys(raw).some((key) => !ALLOWED_KEYS.has(key)) || submitted.toString() !== normalized) {
    redirect(categoryHref(slug, filters))
  }

  const categoryIds = selectedChild ? [selectedChild.id] : [category.id, ...children.map((item) => item.id)]
  const [listing, facetData] = await Promise.all([
    getCachedActiveProducts({ sort: filters.sort, page: filters.page }, { categoryIds, categoryFilters: filters }),
    getCachedCategoryFacetData(categoryIds),
  ])
  const { rows, total, pageSize } = listing
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  if (total > 0 && filters.page > lastPage) redirect(categoryHref(slug, filters, { page: lastPage }))

  const selectedCount = filters.brand.length + Number(filters.minPrice != null || filters.maxPrice != null) + Number(Boolean(filters.inStock)) + Number(Boolean(filters.subcategory))
  const start = total ? (filters.page - 1) * pageSize + 1 : 0
  const end = Math.min(filters.page * pageSize, total)
  const breadcrumbItems = [
    { name: 'Home', url: getSiteUrl().href },
    ...(category.parentId ? all.filter((item) => item.id === category.parentId).map((parent) => ({ name: parent.name, url: new URL(`/c/${parent.slug}`, getSiteUrl()).href })) : []),
    { name: category.name, url: new URL(`/c/${category.slug}`, getSiteUrl()).href },
  ]

  return (
    <div className="flex flex-col gap-7">
      <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-2 text-sm text-(--text-muted)"><li><Link href="/" className="hover:text-(--text-primary)">Home</Link></li>{category.parentId ? breadcrumbItems.slice(1, -1).map((item) => <li key={item.url} className="flex items-center gap-2"><span aria-hidden="true">/</span><Link href={new URL(item.url).pathname as Route}>{item.name}</Link></li>) : null}<li className="flex items-center gap-2" aria-current="page"><span aria-hidden="true">/</span>{category.name}</li></ol></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.url })) }).replace(/</g, '\\u003c') }} />

      <header className="space-y-3"><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{category.name}</h1>{category.description ? <p className="max-w-2xl text-(--text-secondary)">{category.description}</p> : null}</header>

      {children.length ? <nav aria-label="Subcategories" className="flex flex-wrap gap-2">{children.map((child) => <Link key={child.id} href={categoryHref(slug, filters, { subcategory: child.slug, page: 1 })} className={`flex min-h-11 items-center rounded-(--radius-pill) border px-4 text-sm transition-colors ${filters.subcategory === child.slug ? 'border-(--border-interactive) bg-(--surface-selected) font-medium' : 'bg-(--surface-primary) hover:border-(--border-strong)'}`}>{child.name}</Link>)}</nav> : null}

      {total === 0 && !hasCategoryFilters(filters) ? <section className="rounded-(--radius-xl) border border-dashed bg-(--surface-primary) px-6 py-20 text-center"><h2 className="text-xl font-semibold">This category is being prepared</h2><p className="mt-2 text-(--text-muted)">Browse another category to discover available products.</p><Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-(--radius-md) bg-(--action-primary) px-5 font-medium text-(--action-primary-text)">Browse store</Link></section> : <>
        <div className="sticky top-2 z-(--z-sticky) flex flex-wrap items-center justify-between gap-3 rounded-(--radius-xl) border border-white/70 bg-(--surface-primary)/80 p-3 shadow-(--shadow-1) backdrop-blur-xl dark:border-white/15">
          <p id="category-result-summary" className="text-sm text-(--text-secondary)">Showing {start}–{end} of {total} {total === 1 ? 'product' : 'products'}</p>
          <div className="flex min-w-0 items-center gap-2"><CategoryFilterSheet selectedCount={selectedCount}><CategoryFiltersPanel slug={slug} filters={filters} brands={facetData.brandComplete ? facetData.brands : []} priceMin={facetData.priceMin} priceMax={facetData.priceMax} /></CategoryFilterSheet><nav aria-label="Sort products" className="flex max-w-[65vw] gap-1 overflow-x-auto rounded-(--radius-md) border bg-(--surface-primary) p-1 [scrollbar-width:none]">{SORTS.map((option) => <Link key={option.value} href={categoryHref(slug, filters, { sort: option.value, page: 1 })} aria-current={filters.sort === option.value ? 'true' : undefined} className={`flex min-h-9 items-center whitespace-nowrap rounded-(--radius-sm) px-3 text-xs sm:text-sm ${filters.sort === option.value ? 'bg-(--surface-selected) font-semibold' : 'text-(--text-secondary) hover:bg-(--surface-secondary)'}`}>{option.label}</Link>)}</nav></div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]"><aside aria-label="Product filters" className="hidden rounded-(--radius-xl) border bg-(--surface-primary)/70 p-5 shadow-(--shadow-1) lg:block"><CategoryFiltersPanel slug={slug} filters={filters} brands={facetData.brandComplete ? facetData.brands : []} priceMin={facetData.priceMin} priceMax={facetData.priceMax} /></aside><section aria-labelledby="category-result-summary" className="min-w-0">{rows.length ? <ProductGrid products={rows.map((row) => ({ ...row, totalStock: Number(row.totalStock) }))} /> : <div className="rounded-(--radius-xl) border border-dashed bg-(--surface-primary) px-6 py-20 text-center"><h2 className="text-xl font-semibold">No products match these filters</h2><p className="mt-2 text-(--text-muted)">Remove a filter or clear all filters to see more products.</p><Link href={categoryHref(slug, { brand: [], sort: 'newest', page: 1 })} className="mt-6 inline-flex min-h-11 items-center rounded-(--radius-md) border px-5 font-medium">Clear all filters</Link></div>}</section></div>

        {lastPage > 1 ? <nav aria-label="Product pages" className="flex items-center justify-between gap-4 border-t pt-6 text-sm"><span className="text-(--text-muted)">Page {filters.page} of {lastPage}</span><div className="flex gap-2">{filters.page > 1 ? <Link href={categoryHref(slug, filters, { page: filters.page - 1 })} className="flex min-h-11 items-center rounded-(--radius-md) border px-4 hover:bg-(--surface-secondary)">Previous</Link> : <span className="flex min-h-11 items-center rounded-(--radius-md) border px-4 opacity-50" aria-disabled="true">Previous</span>}{filters.page < lastPage ? <Link href={categoryHref(slug, filters, { page: filters.page + 1 })} className="flex min-h-11 items-center rounded-(--radius-md) border px-4 hover:bg-(--surface-secondary)">Next</Link> : <span className="flex min-h-11 items-center rounded-(--radius-md) border px-4 opacity-50" aria-disabled="true">Next</span>}</div></nav> : null}
      </>}
    </div>
  )
}
