import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { formatBdt } from '@/lib/money'
import { storage } from '@/lib/storage'
import { getCachedProductBySlug, getCachedRelatedProducts } from '@/modules/catalog'
import { ProductGallery } from '@/modules/catalog/components/product-gallery'
import { ProductGrid } from '@/modules/catalog/components/product-card'
import { VariantPicker } from '@/modules/catalog/components/variant-picker'
import { ViewContentTracker } from '@/modules/meta/components/event-trackers'
import { minorToMetaValue } from '@/modules/meta'
import { getSiteUrl } from '@/lib/site-metadata'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  await connection()

  const { slug } = await params
  const product = await getCachedProductBySlug(slug)
  if (!product || product.status !== 'active') return {}

  return {
    title: product.title,
    description: product.description ?? undefined,
    openGraph: {
      title: product.title,
      description: product.description ?? undefined,
      images: product.images[0]
        ? [storage.url(product.images[0].r2Key, { width: 1200, height: 630, fit: 'cover' })]
        : [],
    },
  }
}

export default async function ProductPage({ params }: Params) {
  await connection()

  const { slug } = await params
  const product = await getCachedProductBySlug(slug)

  // Draft and archived products must not be reachable by guessing the URL.
  if (!product || product.status !== 'active') notFound()

  /**
   * Three sizes rather than one. The displayed image stays modest so the page
   * loads fast; hover-zoom scales it 2.5x, so it needs the headroom of a larger
   * source; the lightbox gets the largest. Cloudinary generates each on demand,
   * so the extra sizes cost nothing until someone actually zooms.
   */
  const images = product.images.map((image) => ({
    id: image.id,
    alt: image.alt,
    url: storage.url(image.r2Key, { width: 1400, height: 1400, fit: 'cover' }),
    fullUrl: storage.url(image.r2Key, { width: 2000, height: 2000, fit: 'contain' }),
    thumbUrl: storage.url(image.r2Key, { width: 128, height: 128, fit: 'cover' }),
  }))

  const cheapest = product.variants.reduce<number | null>(
    (min, v) => (min == null || v.price < min ? v.price : min),
    null,
  )
  const initialVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0]
  const structuredData = initialVariant ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.feedDescription || product.description || undefined,
    image: images.map((image) => image.url),
    sku: initialVariant.sku,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    mpn: product.mpn || undefined,
    ...(initialVariant.barcode && initialVariant.gtinType
      ? { [initialVariant.gtinType]: initialVariant.barcode }
      : {}),
    itemCondition: `https://schema.org/${product.condition === 'new' ? 'NewCondition' : product.condition === 'used' ? 'UsedCondition' : 'RefurbishedCondition'}`,
    offers: {
      '@type': 'Offer',
      url: new URL(`/p/${product.slug}`, getSiteUrl()).href,
      priceCurrency: 'BDT',
      price: (initialVariant.price / 100).toFixed(2),
      availability: initialVariant.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: `https://schema.org/${product.condition === 'new' ? 'NewCondition' : product.condition === 'used' ? 'UsedCondition' : 'RefurbishedCondition'}`,
    },
  } : null

  return (
    <div className="flex flex-col gap-10">
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
      ) : null}
      {initialVariant ? (
        <ViewContentTracker
          variantId={initialVariant.id}
          contentName={product.title}
          value={minorToMetaValue(initialVariant.price)}
        />
      ) : null}
      <nav className="text-sm text-(--color-muted)">
        <Link href="/" className="hover:text-(--color-fg)">
          Home
        </Link>
        {product.category ? (
          <>
            {' / '}
            <Link href={`/c/${product.category.slug}`} className="hover:text-(--color-fg)">
              {product.category.name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="storefront-card grid gap-8 p-4 sm:p-6 lg:grid-cols-2 lg:gap-10">
        <ProductGallery images={images} title={product.title} />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            {product.brand ? (
              <span className="text-sm text-(--color-muted)">{product.brand}</span>
            ) : null}
            <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
          </div>

          {product.variants.length > 0 ? (
            <VariantPicker
              title={product.title}
              variants={product.variants.map((v) => ({
                id: v.id,
                title: v.title,
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                stock: v.stock,
              }))}
            />
          ) : (
            <p className="text-2xl font-semibold tabular-nums">
              {cheapest == null ? '—' : formatBdt(cheapest)}
            </p>
          )}

          {product.description ? (
            <div className="flex flex-col gap-2 border-t border-(--color-border) pt-6">
              <h2 className="text-sm font-medium">Description</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-(--color-muted)">
                {product.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Streams in separately so it never delays the product itself — the
          thing the visitor actually came for. */}
      <Suspense fallback={null}>
        <RelatedProducts productId={product.id} categoryId={product.categoryId} />
      </Suspense>
    </div>
  )
}

async function RelatedProducts({
  productId,
  categoryId,
}: {
  productId: string
  categoryId: string | null
}) {
  const related = await getCachedRelatedProducts({ excludeProductId: productId, categoryId })

  if (related.length === 0) return null

  return (
    <section className="flex flex-col gap-6 border-t border-(--color-border) pt-10">
      <h2 className="text-xl font-semibold tracking-tight">You might also like</h2>
      <ProductGrid products={related.map((r) => ({ ...r, totalStock: Number(r.totalStock) }))} />
    </section>
  )
}
