import type { Metadata } from 'next'

import { listCategories, listProductsForAdmin } from '@/modules/catalog'
import { CategoryManager } from '@/modules/catalog/components/category-manager'

export const metadata: Metadata = { title: 'Categories' }

export default async function AdminCategoriesPage() {
  const categories = await listCategories()

  // Product counts come from one listing rather than a query per category.
  const { rows } = await listProductsForAdmin({ sort: 'newest', page: 1 })
  const counts = new Map<string, number>()
  for (const product of rows) {
    const name = product.categoryName
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-(--color-muted)">Two levels maximum.</p>
      </div>

      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          parentId: c.parentId,
          productCount: counts.get(c.name) ?? 0,
        }))}
      />
    </div>
  )
}
