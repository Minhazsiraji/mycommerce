import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'

import { listCategories } from '@/modules/catalog'
import { ProductForm } from '@/modules/catalog/components/product-form'

export const metadata: Metadata = { title: 'New product' }

export default async function NewProductPage() {
  // Admin screens are never cacheable, and each route segment is analysed for
  // prerendering on its own — so this has to be declared here, not just in the
  // layout.
  await connection()

  const categories = await listCategories()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-(--color-muted) underline underline-offset-4"
        >
          ← Products
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">New product</h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}
