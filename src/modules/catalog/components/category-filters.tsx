import Link from 'next/link'

import { formatBdt } from '@/lib/money'
import { categoryHref } from '../category-url'
import type { CategoryFilters } from '../validators'

export function CategoryFiltersPanel({ slug, filters, brands, priceMin, priceMax }: { slug: string; filters: CategoryFilters; brands: { label: string; count: number }[]; priceMin: number | null; priceMax: number | null }) {
  return (
    <form action={`/c/${slug}`} method="get" className="space-y-6">
      {filters.sort !== 'newest' ? <input type="hidden" name="sort" value={filters.sort} /> : null}
      {filters.subcategory ? <input type="hidden" name="subcategory" value={filters.subcategory} /> : null}
      <fieldset className="space-y-3">
        <legend className="font-semibold">Price</legend>
        {priceMin != null && priceMax != null ? <p className="text-xs text-(--text-muted)">{formatBdt(priceMin)}–{formatBdt(priceMax)}</p> : null}
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-(--text-secondary)">Minimum<input name="minPrice" inputMode="numeric" defaultValue={filters.minPrice} className="mt-1 min-h-11 w-full rounded-(--radius-md) border bg-(--surface-primary) px-3 text-sm" /></label>
          <label className="text-xs text-(--text-secondary)">Maximum<input name="maxPrice" inputMode="numeric" defaultValue={filters.maxPrice} className="mt-1 min-h-11 w-full rounded-(--radius-md) border bg-(--surface-primary) px-3 text-sm" /></label>
        </div>
      </fieldset>
      <fieldset className="space-y-3"><legend className="font-semibold">Availability</legend><label className="flex min-h-11 items-center gap-3"><input type="checkbox" name="inStock" value="1" defaultChecked={filters.inStock} className="size-5" /> In stock only</label></fieldset>
      {brands.length ? <fieldset className="space-y-2"><legend className="mb-2 font-semibold">Brand</legend>{brands.map((brand) => <label key={brand.label} className="flex min-h-11 items-center justify-between gap-3"><span className="flex items-center gap-3"><input type="checkbox" name="brand" value={brand.label} defaultChecked={filters.brand.includes(brand.label)} className="size-5" />{brand.label}</span><span className="text-xs text-(--text-muted)">{brand.count}</span></label>)}</fieldset> : null}
      <div className="flex gap-2"><button className="min-h-11 flex-1 rounded-(--radius-md) bg-(--action-primary) px-4 font-medium text-(--action-primary-text)">Apply filters</button><Link href={categoryHref(slug, { brand: [], sort: 'newest', page: 1 })} className="flex min-h-11 items-center rounded-(--radius-md) border px-4 text-sm font-medium">Clear</Link></div>
    </form>
  )
}
