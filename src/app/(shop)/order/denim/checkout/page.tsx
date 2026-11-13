import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import type { Metadata } from 'next'

import { readCart } from '@/modules/cart'
import { getCachedProductBySlug } from '@/modules/catalog'
import { QuickDenimCheckout } from '@/modules/orders/components/quick-denim-checkout'
import { QUICK_DENIM_UNIT_PRICE, isQuickDenimProduct } from '@/lib/moymoy-quick-cod'

export const metadata: Metadata = {
  title: 'সহজ COD অর্ডার | MoyMoy Fashion',
  robots: { index: false, follow: false },
}

export default async function DenimQuickCheckout({ searchParams }: {
  searchParams: Promise<{ product?: string }>
}) {
  await connection()
  const { product: slug } = await searchParams
  if (!slug || !/^[a-z0-9-]{2,180}$/.test(slug)) redirect('/order/denim')

  const [cart, product] = await Promise.all([readCart(), getCachedProductBySlug(slug)])
  if (!product || product.status !== 'active' || !isQuickDenimProduct(product.title)) redirect('/order/denim')
  if (!cart.id || !cart.lines.length || cart.hasIssues || cart.lines.some(line =>
      line.productSlug !== product.slug || line.unitPrice !== QUICK_DENIM_UNIT_PRICE || line.unavailable
    )) redirect(`/order/denim/${product.slug}`)

  return <QuickDenimCheckout
    slug={product.slug}
    lines={cart.lines.map(line => ({
      id: line.id,
      variantId: line.variantId,
      variantTitle: line.variantTitle,
      quantity: line.quantity,
      stock: line.availableStock,
      unitPrice: line.unitPrice,
    }))}
    variants={product.variants.map(v => ({
      id: v.id, title: v.title, stock: v.stock, price: v.price, options: v.options,
    }))}
  />
}
