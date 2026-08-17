import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { formatBdt, toDecimalString } from '@/lib/money'
import { getSiteUrl } from '@/lib/site-metadata'
import { storage } from '@/lib/storage'
import { getCachedProductBySlug, getCachedRelatedProducts } from '@/modules/catalog'
import { ProductGallery } from '@/modules/catalog/components/product-gallery'
import { ProductGrid } from '@/modules/catalog/components/product-card'
import { VariantPicker } from '@/modules/catalog/components/variant-picker'
import { ViewContentTracker } from '@/modules/meta/components/event-trackers'
import { minorToMetaValue } from '@/modules/meta'

type Params = { params: Promise<{ slug: string }> }

function productDescription(product: {
  title: string
  description: string | null
  category: { name: string } | null
}) {
  if (product.description?.trim()) return product.description.trim()

  return `Shop ${product.title}${product.category ? ` in ${product.category.name}` : ''} at SirajiBD. View current price, availability and product details for customers in Bangladesh.`
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  await connection()

  const { slug } = await params
  const product = await getCachedProductBySlug(slug)
  if (!product || product.status !== 'active') return {}

  const description = productDescription(product)
  const canonicalUrl = new URL(`/p/${slug}`, getSiteUrl()).href
  const image = product.images[0]
    ? storage.url(product.images[0].r2Key, { width: 1200, height: 630, fit: 'cover' })
    : undefined

  return {
    title: product.title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: product.title,
      description,
      images: image ? [image] : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: product.title,
      description,
      images: image ? [image] : undefined,
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
  const canonicalUrl = new URL(`/p/${product.slug}`, getSiteUrl()).href
  const description = productDescription(product)
  const productImageUrls = product.images.map((image) =>
    storage.url(image.r2Key, { width: 1200, height: 1200, fit: 'contain' }),
  )
  const breadcrumbItems = [
    { name: 'Home', item: getSiteUrl().href },
    ...(product.category
      ? [{ name: product.category.name, item: new URL(`/c/${product.category.slug}`, getSiteUrl()).href }]
      : []),
    { name: product.title, item: canonicalUrl },
  ]
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description,
    url: canonicalUrl,
    ...(productImageUrls.length ? { image: productImageUrls } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.category ? { category: product.category.name } : {}),
    ...(initialVariant?.sku ? { sku: initialVariant.sku } : {}),
    ...(product.variants.length
      ? {
          offers: product.variants.map((variant) => ({
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'BDT',
            price: toDecimalString(variant.price),
            availability:
              variant.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            ...(variant.sku ? { sku: variant.sku } : {}),
          })),
        }
      : {}),
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }

  return (
    <div className="flex flex-col gap-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />

      {initialVariant ? (
        <ViewContentTracker
          variantId={initialVariant.id}
          contentName={product.title}
          value={minorToMetaValue(initialVariant.price)}
        />
      ) : null}
      <nav aria-label="Breadcrumb" className="text-sm text-(--color-muted)">
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
        {' / '}
        <span aria-current="page">{product.title}</span>
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
