/**
 * Seeds the catalog with placeholder products so the storefront has something
 * to render before real inventory exists.
 *
 *   node --env-file=.env.local --conditions=react-server --import tsx scripts/seed.ts
 *   node --env-file=.env.local --conditions=react-server --import tsx scripts/seed.ts --reset
 *
 * Refuses to run when products already exist unless --reset is passed, which
 * deletes every product, category and stored image first. It never touches
 * users, so admin accounts survive.
 *
 * Placeholder images are generated here rather than fetched, so seeding works
 * offline and pulls nothing unexpected into the media library.
 */
import { deflateSync } from 'node:zlib'

import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { storage, STORAGE_FOLDERS } from '@/lib/storage'
import * as service from '@/modules/catalog/service'
import { categories, productImages, products } from '@/modules/catalog/schema'
import { categoryInputSchema, productInputSchema } from '@/modules/catalog/validators'

// ---------------------------------------------------------------- png writer

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf: Buffer): number {
  let c = 0xffffffff
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff]! ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

/** Solid-colour PNG. Uniform rows compress to almost nothing. */
function solidPng(size: number, [r, g, b]: [number, number, number]): Buffer {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // truecolour RGB

  const row = Buffer.alloc(1 + size * 3)
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r
    row[2 + x * 3] = g
    row[3 + x * 3] = b
  }

  const raw = Buffer.concat(Array.from({ length: size }, () => row))

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// -------------------------------------------------------------------- fixtures

type Seed = {
  category: string
  title: string
  slug: string
  brand?: string
  description: string
  colour: [number, number, number]
  variants: { sku: string; title?: string; price: string; stock: string; compareAtPrice?: string }[]
}

const CATEGORIES = [
  { name: 'Footwear', slug: 'footwear', children: [
    { name: 'Running', slug: 'running' },
    { name: 'Casual', slug: 'casual' },
  ] },
  { name: 'Apparel', slug: 'apparel', children: [{ name: 'T-Shirts', slug: 't-shirts' }] },
  { name: 'Accessories', slug: 'accessories', children: [] },
]

const PRODUCTS: Seed[] = [
  {
    category: 'running', title: 'Aero Glide Runner', slug: 'aero-glide-runner', brand: 'Stride',
    description: 'A lightweight daily trainer with responsive foam and a breathable knit upper. Built for long weekday runs on road and track.',
    colour: [58, 90, 160],
    variants: [
      { sku: 'AGR-40', title: 'EU 40', price: '6,450', stock: '6', compareAtPrice: '7,900' },
      { sku: 'AGR-42', title: 'EU 42', price: '6,450', stock: '3', compareAtPrice: '7,900' },
      { sku: 'AGR-44', title: 'EU 44', price: '6,450', stock: '0' },
    ],
  },
  {
    category: 'running', title: 'Trail Breaker GTX', slug: 'trail-breaker-gtx', brand: 'Stride',
    description: 'Aggressive lugged outsole and a water-resistant shell for wet, uneven trails.',
    colour: [34, 110, 84],
    variants: [
      { sku: 'TBG-41', title: 'EU 41', price: '8,900', stock: '4' },
      { sku: 'TBG-43', title: 'EU 43', price: '8,900', stock: '2' },
    ],
  },
  {
    category: 'running', title: 'Pace Setter Lite', slug: 'pace-setter-lite', brand: 'Kinetic',
    description: 'A stripped-back racing flat for tempo work and race day.',
    colour: [196, 78, 62],
    variants: [{ sku: 'PSL-1', price: '5,200', stock: '9' }],
  },
  {
    category: 'casual', title: 'Canvas Low Top', slug: 'canvas-low-top', brand: 'Everyday',
    description: 'A simple cotton canvas sneaker with a vulcanised rubber sole. Goes with everything.',
    colour: [212, 200, 180],
    variants: [
      { sku: 'CLT-S', title: 'Small', price: '2,750', stock: '12' },
      { sku: 'CLT-M', title: 'Medium', price: '2,750', stock: '8' },
      { sku: 'CLT-L', title: 'Large', price: '2,750', stock: '5' },
    ],
  },
  {
    category: 'casual', title: 'Suede Desert Boot', slug: 'suede-desert-boot', brand: 'Everyday',
    description: 'Crepe sole, unlined suede upper. Softens with wear.',
    colour: [150, 108, 66],
    variants: [{ sku: 'SDB-1', price: '4,600', stock: '3', compareAtPrice: '5,800' }],
  },
  {
    category: 't-shirts', title: 'Essential Cotton Tee', slug: 'essential-cotton-tee', brand: 'Everyday',
    description: 'Mid-weight combed cotton with a set-in collar that holds its shape after washing.',
    colour: [40, 40, 44],
    variants: [
      { sku: 'ECT-S', title: 'S', price: '890', stock: '20' },
      { sku: 'ECT-M', title: 'M', price: '890', stock: '18' },
      { sku: 'ECT-L', title: 'L', price: '890', stock: '11' },
      { sku: 'ECT-XL', title: 'XL', price: '950', stock: '0' },
    ],
  },
  {
    category: 't-shirts', title: 'Oversized Boxy Tee', slug: 'oversized-boxy-tee', brand: 'Everyday',
    description: 'A dropped-shoulder, wide-body cut in heavier 240gsm cotton.',
    colour: [232, 228, 220],
    variants: [
      { sku: 'OBT-M', title: 'M', price: '1,250', stock: '7' },
      { sku: 'OBT-L', title: 'L', price: '1,250', stock: '4' },
    ],
  },
  {
    category: 'accessories', title: 'Heavy Canvas Tote', slug: 'heavy-canvas-tote', brand: 'Everyday',
    description: '16oz canvas with reinforced handles and an internal pocket.',
    colour: [176, 160, 128],
    variants: [{ sku: 'HCT-1', price: '1,450', stock: '15' }],
  },
  {
    category: 'accessories', title: 'Leather Card Holder', slug: 'leather-card-holder', brand: 'Everyday',
    description: 'Full-grain leather, four slots, no stitching on the spine so it stays slim.',
    colour: [92, 58, 48],
    variants: [{ sku: 'LCH-1', price: '1,850', stock: '6', compareAtPrice: '2,400' }],
  },
]

// ------------------------------------------------------------------------ run

const reset = process.argv.includes('--reset')
const existing = await db.select({ id: products.id }).from(products)

if (existing.length && !reset) {
  console.error(
    `${existing.length} product(s) already exist. Re-run with --reset to delete them and reseed.`,
  )
  process.exit(1)
}

if (reset && existing.length) {
  for (const image of await db.select().from(productImages)) {
    await storage.delete(image.r2Key).catch(() => {})
  }
  await db.delete(products)
  await db.delete(categories)
  console.log('cleared existing catalog')
}

const bySlug = new Map<string, string>()

for (const top of CATEGORIES) {
  const parent = await service.createCategory(
    categoryInputSchema.parse({ name: top.name, slug: top.slug }),
  )
  bySlug.set(top.slug, parent.id)

  for (const child of top.children) {
    const row = await service.createCategory(
      categoryInputSchema.parse({ name: child.name, slug: child.slug, parentId: parent.id }),
    )
    bySlug.set(child.slug, row.id)
  }
}

console.log(`created ${bySlug.size} categories`)

for (const seed of PRODUCTS) {
  const product = await service.createProduct(
    productInputSchema.parse({
      title: seed.title,
      slug: seed.slug,
      brand: seed.brand,
      description: seed.description,
      status: 'active',
      categoryId: bySlug.get(seed.category) ?? null,
      variants: seed.variants,
    }),
  )

  const asset = await storage.upload({
    data: solidPng(900, seed.colour),
    folder: STORAGE_FOLDERS.products,
  })
  await service.attachImage({ productId: product.id, key: asset.key })

  console.log(`  ${seed.title}  (${seed.variants.length} variant(s))`)
}

const total = await db.select({ id: products.id }).from(products)
const active = await db.select({ id: products.id }).from(products).where(eq(products.status, 'active'))
console.log(`\nseeded ${total.length} products, ${active.length} active`)
