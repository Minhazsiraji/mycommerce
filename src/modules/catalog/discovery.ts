import 'server-only'

import { asc, isNull } from 'drizzle-orm'

import { db } from '@/lib/db'
import { CURRENCY, toDecimalString } from '@/lib/money'
import { getSiteUrl } from '@/lib/site-metadata'
import { storage } from '@/lib/storage'
import { productImages, products, productVariants } from './schema'

export async function getDiscoveryReadiness() {
  const rows = await db.query.products.findMany({
    with: {
      category: true,
      images: { orderBy: [asc(productImages.position)] },
      variants: {
        where: isNull(productVariants.archivedAt),
        orderBy: [asc(productVariants.position)],
      },
    },
    orderBy: [asc(products.title)],
  })

  return rows.map((product) => {
    const issues: string[] = []
    if (product.status !== 'active') issues.push('Product is not active')
    if (!product.description && !product.feedDescription) issues.push('Description is missing')
    if (!product.brand) issues.push('Brand is missing')
    if (!product.category) issues.push('Category is missing')
    if (!product.images.length) issues.push('Image is missing')
    if (!product.variants.length) issues.push('Sellable variant is missing')
    if (product.identifierExists && !product.mpn && !product.variants.some((v) => v.barcode)) {
      issues.push('MPN or barcode is required when an identifier exists')
    }
    for (const variant of product.variants) {
      if (variant.barcode && !variant.gtinType) issues.push(`${variant.sku}: identifier type is missing`)
    }
    return { product, issues, ready: product.discoveryEligible && issues.length === 0 }
  })
}

function csv(value: unknown) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

export async function buildDiscoveryCsv() {
  const readiness = await getDiscoveryReadiness()
  const header = [
    'id','title','description','link','image_link','availability','price','currency','brand',
    'condition','gtin','gtin_type','mpn','identifier_exists','product_type',
  ]
  const lines = [header.map(csv).join(',')]
  const site = getSiteUrl()

  for (const { product, ready } of readiness) {
    if (!ready) continue
    for (const variant of product.variants) {
      lines.push([
        variant.sku,
        product.title,
        product.feedDescription || product.description,
        new URL(`/p/${product.slug}`, site).href,
        product.images[0] ? storage.url(product.images[0].r2Key, { width: 1200, height: 1200, fit: 'cover' }) : '',
        variant.stock > 0 ? 'in_stock' : 'out_of_stock',
        toDecimalString(variant.price),
        CURRENCY,
        product.brand,
        product.condition,
        variant.barcode,
        variant.gtinType,
        product.mpn,
        product.identifierExists ? 'yes' : 'no',
        product.productCategory || product.category?.name,
      ].map(csv).join(','))
    }
  }
  return `${lines.join('\n')}\n`
}
