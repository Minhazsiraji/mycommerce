import { connection } from 'next/server'

import { STORE_CONFIG } from '@/lib/store-config'
import { storage } from '@/lib/storage'
import {
  buildGoogleMerchantFeed,
  listMerchantFeedProducts,
  type MerchantProduct,
} from '@/modules/catalog'

export async function GET() {
  // Cache Components may otherwise attempt to prerender a GET route during
  // `next build`. The feed is a live catalogue projection, so wait for an
  // incoming request before touching Postgres.
  await connection()

  const products = await listMerchantFeedProducts()

  const feedProducts: MerchantProduct[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    feedDescription: product.feedDescription,
    brand: product.brand,
    condition: product.condition,
    productCategory: product.productCategory,
    mpn: product.mpn,
    identifierExists: product.identifierExists,
    categoryName: product.category?.name ?? null,
    imageUrls: product.images.map((image) =>
      storage.url(image.r2Key, { width: 1600, height: 1600, fit: 'contain' }),
    ),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      title: variant.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      stock: variant.stock,
      barcode: variant.barcode,
      options: variant.options,
    })),
  }))

  const xml = buildGoogleMerchantFeed(feedProducts, {
    storeName: STORE_CONFIG.name,
    siteUrl: STORE_CONFIG.canonicalUrl,
    currency: STORE_CONFIG.currency,
  })

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
