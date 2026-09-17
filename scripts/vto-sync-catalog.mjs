import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
const baseUrl = process.env.NEXT_PUBLIC_VTO_BASE_URL ?? 'https://agentsiraji-vto.vercel.app'
const apiKey = process.env.VTO_CATALOG_API_KEY
const cloudName = process.env.CLOUDINARY_CLOUD_NAME

if (!apiKey) throw new Error('VTO_CATALOG_API_KEY is required')
if (!cloudName) throw new Error('CLOUDINARY_CLOUD_NAME is required')

const modeBySlug = new Map([
  ['classic-polo-shirt', 'upper_body'],
  ['cotton-crew-neck-tee', 'upper_body'],
  ['hooded-sweatshirt', 'upper_body'],
  ['regular-fit-jeans', 'lower_body'],
  ['slim-fit-oxford-shirt', 'upper_body'],
])

const rows = await sql`
  select p.id, p.slug, p.title, v.id as variant_id, v.sku,
    (select pi.r2_key from product_images pi where pi.product_id=p.id order by pi.position limit 1) as image_key
  from products p
  join categories c on c.id=p.category_id
  join product_variants v on v.product_id=p.id and v.archived_at is null
  where p.status='active' and c.slug='apparel'
  order by p.title, v.position
`
let synced = 0
for (const row of rows) {
  const tryonMode = modeBySlug.get(row.slug)
  if (!tryonMode) continue
  if (!row.image_key) throw new Error(`missing image for ${row.slug}`)

  const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fit,f_auto,h_1200,q_auto,w_1200/v1/${row.image_key}`
  const response = await fetch(`${baseUrl}/api/v1/catalog`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      externalProductId: row.id,
      externalVariantId: row.variant_id,
      sku: row.sku,
      title: row.title,
      primaryImageUrl: imageUrl,
      category: 'apparel',
      tryonMode,
      status: 'active',
      metadata: { merchantSlug: row.slug, source: 'sirajibd-commerce' },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`VTO sync failed for ${row.slug}: ${response.status} ${body}`)
  }
  synced += 1
  console.log(`synced ${row.slug} / ${row.sku}`)
}

console.log(`VTO catalog sync complete: ${synced} variant(s)`)
