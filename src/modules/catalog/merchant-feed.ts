import { escapeHtml } from '@/lib/escape-html'

export type MerchantVariant = {
  id: string
  sku: string
  title: string | null
  price: number
  compareAtPrice: number | null
  stock: number
  barcode: string | null
  options: Record<string, string>
}

export type MerchantProduct = {
  id: string
  slug: string
  title: string
  description: string | null
  feedDescription: string | null
  brand: string | null
  condition: string
  productCategory: string | null
  mpn: string | null
  identifierExists: boolean
  categoryName: string | null
  imageUrls: string[]
  variants: MerchantVariant[]
}

export type MerchantFeedConfig = {
  storeName: string
  siteUrl: string
  currency: string
}

function money(minor: number, currency: string) {
  return `${(minor / 100).toFixed(2)} ${currency}`
}

function condition(value: string) {
  if (value === 'used') return 'used'
  if (value === 'refurbished') return 'refurbished'
  return 'new'
}

function optionValue(options: Record<string, string>, names: string[]) {
  for (const [key, value] of Object.entries(options)) {
    if (names.includes(key.trim().toLowerCase()) && value.trim()) return value.trim()
  }
  return null
}

function variantOption(options: Record<string, string>) {
  const entries = Object.entries(options)
    .map(([key, value]) => [key.trim(), value.trim()] as const)
    .filter(([key, value]) => key && value)
  return entries.length ? entries.map(([key, value]) => `${key}:${value}`).join(',') : null
}

function tag(name: string, value: string | null | undefined) {
  if (!value) return ''
  return `<${name}>${escapeHtml(value)}</${name}>`
}

export function buildGoogleMerchantFeed(products: MerchantProduct[], config: MerchantFeedConfig) {
  const siteUrl = config.siteUrl.replace(/\/$/, '')
  const items: string[] = []

  for (const product of products) {
    if (!product.imageUrls[0] || product.variants.length === 0) continue

    const description =
      product.feedDescription?.trim() ||
      product.description?.trim() ||
      `${product.title} available from ${config.storeName}.`
    const hasVariants = product.variants.length > 1

    for (const variant of product.variants) {
      const link = new URL(`/p/${product.slug}`, `${siteUrl}/`)
      if (hasVariants) link.searchParams.set('variant', variant.id)

      const displayTitle = hasVariants && variant.title?.trim()
        ? `${product.title} - ${variant.title.trim()}`
        : product.title
      const color = optionValue(variant.options, ['color', 'colour'])
      const size = optionValue(variant.options, ['size'])
      const variantOptions = variantOption(variant.options)
      const hasGtin = product.identifierExists && Boolean(variant.barcode?.trim())
      const hasMpn = Boolean(product.mpn?.trim())
      const hasBrand = Boolean(product.brand?.trim())
      const discounted = variant.compareAtPrice != null && variant.compareAtPrice > variant.price

      items.push(
        [
          '<item>',
          tag('g:id', (variant.sku || variant.id).slice(0, 50)),
          tag('title', displayTitle.slice(0, 150)),
          tag('description', description),
          tag('link', link.href),
          tag('g:canonical_link', `${siteUrl}/p/${product.slug}`),
          tag('g:image_link', product.imageUrls[0]),
          ...product.imageUrls.slice(1, 11).map((url) => tag('g:additional_image_link', url)),
          tag('g:availability', variant.stock > 0 ? 'in_stock' : 'out_of_stock'),
          tag('g:price', money(discounted ? variant.compareAtPrice! : variant.price, config.currency)),
          discounted ? tag('g:sale_price', money(variant.price, config.currency)) : '',
          tag('g:condition', condition(product.condition)),
          hasBrand ? tag('g:brand', product.brand!.trim()) : '',
          hasGtin ? tag('g:gtin', variant.barcode!.trim()) : '',
          hasMpn ? tag('g:mpn', product.mpn!.trim()) : '',
          !hasGtin && !hasMpn && !hasBrand && !product.identifierExists
            ? tag('g:identifier_exists', 'no')
            : '',
          product.productCategory?.trim()
            ? tag('g:google_product_category', product.productCategory.trim())
            : '',
          product.categoryName ? tag('g:product_type', product.categoryName) : '',
          hasVariants ? tag('g:item_group_id', product.id.slice(0, 50)) : '',
          hasVariants ? tag('g:item_group_title', product.title.slice(0, 150)) : '',
          color ? tag('g:color', color) : '',
          size ? tag('g:size', size) : '',
          hasVariants && variantOptions ? tag('g:variant_option', variantOptions) : '',
          '</item>',
        ].join(''),
      )
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '<channel>',
    tag('title', `${config.storeName} product feed`),
    tag('link', siteUrl),
    tag('description', `Active products available from ${config.storeName}`),
    ...items,
    '</channel>',
    '</rss>',
  ].join('')
}
