import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { formatBdt } from '@/lib/money'
import { storage } from '@/lib/storage'
import { getCachedProductBySlug } from '@/modules/catalog'
import { ProductGallery } from '@/modules/catalog/components/product-gallery'
import { VariantPicker } from '@/modules/catalog/components/variant-picker'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
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

  return (
    <div className="flex flex-col gap-10">
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

      <div className="grid gap-10 lg:grid-cols-2">
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
    </div>
  )
}
