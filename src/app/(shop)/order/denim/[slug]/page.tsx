import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { getCachedProductBySlug } from '@/modules/catalog'
import { QuickDenimSelector } from '@/modules/orders/components/quick-denim-selector'
import { storage } from '@/lib/storage'
import { isQuickDenimProduct, QUICK_DENIM_UNIT_PRICE } from '@/lib/moymoy-quick-cod'

export const metadata: Metadata = {
  title: 'ডেনিম কালার ও সাইজ নির্বাচন | MoyMoy Fashion',
  robots: { index: false, follow: false },
}

export default async function DirectDenimProduct({ params }: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getCachedProductBySlug(slug)
  if (!product || product.status !== 'active' || !isQuickDenimProduct(product.title) ||
      !product.variants.some(v => v.price === QUICK_DENIM_UNIT_PRICE && v.stock > 0)) notFound()

  return (
    <QuickDenimSelector
      slug={product.slug}
      title={product.title}
      images={product.images.map(image => ({
        url: storage.url(image.r2Key, { width: 1200, height: 1400, fit: 'contain' }),
        alt: image.alt || product.title,
      }))}
      variants={product.variants.map(v => ({
        id: v.id, title: v.title, price: v.price, stock: v.stock, options: v.options,
      }))}
    />
  )
}
