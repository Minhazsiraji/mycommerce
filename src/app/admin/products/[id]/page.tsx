import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { storage } from '@/lib/storage'
import { getProductById, listCategories } from '@/modules/catalog'
import { ImageManager } from '@/modules/catalog/components/image-manager'
import { ProductForm } from '@/modules/catalog/components/product-form'

export const metadata: Metadata = { title: 'Edit product' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([getProductById(id), listCategories()])

  if (!product) notFound()

  // URLs are built here so the client component stays vendor-agnostic.
  const images = product.images.map((image) => ({
    id: image.id,
    alt: image.alt,
    url: storage.url(image.r2Key, { width: 400, height: 400, fit: 'cover' }),
  }))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-(--color-muted) underline underline-offset-4"
        >
          ← Products
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{product.title}</h1>
          {product.status === 'active' ? (
            <Link
              href={`/p/${product.slug}`}
              target="_blank"
              className="text-sm underline underline-offset-4"
            >
              View on store ↗
            </Link>
          ) : null}
        </div>
      </div>

      <ImageManager productId={product.id} images={images} />

      <hr className="border-(--color-border)" />

      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          brand: product.brand,
          categoryId: product.categoryId,
          status: product.status,
          variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            title: v.title,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
            weightGrams: v.weightGrams,
          })),
        }}
      />
    </div>
  )
}
