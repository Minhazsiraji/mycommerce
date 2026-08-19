import { describe, expect, it } from 'vitest'

import { buildGoogleMerchantFeed, type MerchantProduct } from './merchant-feed'

const product: MerchantProduct = {
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'canvas-shoe',
  title: 'Canvas Shoe & Lace',
  description: 'Everyday canvas shoe',
  feedDescription: null,
  brand: null,
  condition: 'new',
  productCategory: 'Apparel & Accessories > Shoes',
  mpn: null,
  identifierExists: false,
  categoryName: 'Footwear',
  imageUrls: ['https://images.example.com/main.jpg', 'https://images.example.com/side.jpg'],
  variants: [
    {
      id: '22222222-2222-2222-2222-222222222222',
      sku: 'SHOE-BLK-42',
      title: 'Black / 42',
      price: 129900,
      compareAtPrice: 149900,
      stock: 3,
      barcode: null,
      options: { colour: 'Black', size: '42' },
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      sku: 'SHOE-BLK-43',
      title: 'Black / 43',
      price: 129900,
      compareAtPrice: null,
      stock: 0,
      barcode: null,
      options: { colour: 'Black', size: '43' },
    },
  ],
}

describe('Google Merchant XML feed', () => {
  it('uses the required Google namespace and exact active variant commerce facts', () => {
    const xml = buildGoogleMerchantFeed([product], {
      storeName: 'Example Shop',
      siteUrl: 'https://shop.example.com',
      currency: 'BDT',
    })

    expect(xml).toContain('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">')
    expect(xml).toContain('<g:id>SHOE-BLK-42</g:id>')
    expect(xml).toContain('<g:availability>in_stock</g:availability>')
    expect(xml).toContain('<g:availability>out_of_stock</g:availability>')
    expect(xml).toContain('<g:price>1499.00 BDT</g:price>')
    expect(xml).toContain('<g:sale_price>1299.00 BDT</g:sale_price>')
    expect(xml).toContain('<g:identifier_exists>no</g:identifier_exists>')
    expect(xml).toContain('<g:item_group_id>11111111-1111-1111-1111-111111111111</g:item_group_id>')
    expect(xml).toContain('<g:color>Black</g:color>')
    expect(xml).toContain('<g:size>42</g:size>')
    expect(xml).toContain('variant=22222222-2222-2222-2222-222222222222')
  })

  it('escapes XML text and skips products with no image', () => {
    const xml = buildGoogleMerchantFeed([
      product,
      { ...product, id: 'no-image', slug: 'no-image', imageUrls: [] },
    ], {
      storeName: 'Example & Shop',
      siteUrl: 'https://shop.example.com/',
      currency: 'BDT',
    })

    expect(xml).toContain('Canvas Shoe &amp; Lace')
    expect(xml).toContain('Example &amp; Shop product feed')
    expect(xml).not.toContain('/p/no-image')
  })

  it('does not publish the storefront identity as a fallback product brand', () => {
    const xml = buildGoogleMerchantFeed([
      { ...product, brand: 'Example Shop' },
    ], {
      storeName: 'Example Shop',
      siteUrl: 'https://shop.example.com',
      currency: 'BDT',
    })

    expect(xml).not.toContain('<g:brand>Example Shop</g:brand>')
    expect(xml).toContain('<g:identifier_exists>no</g:identifier_exists>')
  })

  it('keeps a distinct real product brand', () => {
    const xml = buildGoogleMerchantFeed([
      { ...product, brand: 'Acme' },
    ], {
      storeName: 'Example Shop',
      siteUrl: 'https://shop.example.com',
      currency: 'BDT',
    })

    expect(xml).toContain('<g:brand>Acme</g:brand>')
  })
})
