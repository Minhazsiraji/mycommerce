import 'server-only'

import { and, asc, count, desc, eq, inArray, notInArray, sql } from 'drizzle-orm'

import { db } from '@/lib/db'

import { categories, productImages, products, productVariants } from './schema'
import type { CategoryInput, ProductFilters, ProductInput } from './validators'

/**
 * The only place Drizzle is called for catalog data. Services and actions go
 * through here; components never touch either.
 */

export const PAGE_SIZE = 24

/**
 * Aggregates over the joined variants, NOT correlated subqueries.
 *
 * Drizzle only qualifies column names when the outer query has a join. Without
 * one, `where ${productVariants.productId} = ${products.id}` compiles to
 * `where "product_id" = "id"`, both of which resolve inside the subquery — so it
 * silently compares product_variants.product_id to product_variants.id, matches
 * nothing, and returns NULL. It produces wrong data rather than an error, which
 * is exactly the kind of bug that reaches production. A LEFT JOIN with GROUP BY
 * is also one pass instead of two subqueries per row.
 */
const fromPrice = sql<number>`min(${productVariants.price})::int`
const totalStock = sql<number>`coalesce(sum(${productVariants.stock}), 0)::int`

/**
 * First image per product, fetched separately and merged.
 *
 * One extra query for the whole page, not one per product — and it avoids
 * needing DISTINCT ON or a lateral join in the main aggregate query.
 */
async function firstImageByProduct(productIds: string[]): Promise<Map<string, string>> {
  if (!productIds.length) return new Map()

  const rows = await db
    .select({ productId: productImages.productId, key: productImages.r2Key })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(asc(productImages.position))

  const first = new Map<string, string>()
  for (const row of rows) {
    if (!first.has(row.productId)) first.set(row.productId, row.key)
  }
  return first
}

// ---------------------------------------------------------------- categories

export function listCategories() {
  return db.query.categories.findMany({
    orderBy: [asc(categories.position), asc(categories.name)],
  })
}

export function getCategoryById(id: string) {
  return db.query.categories.findFirst({ where: eq(categories.id, id) })
}

export function getCategoryBySlug(slug: string) {
  return db.query.categories.findFirst({ where: eq(categories.slug, slug) })
}

export async function countProductsInCategory(id: string): Promise<number> {
  const [row] = await db.select({ n: count() }).from(products).where(eq(products.categoryId, id))
  return row?.n ?? 0
}

export async function insertCategory(input: CategoryInput) {
  const [row] = await db.insert(categories).values(input).returning()
  return row
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const [row] = await db
    .update(categories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning()
  return row
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id))
}

// ------------------------------------------------------------------ products

export function getProductById(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      variants: { orderBy: [asc(productVariants.position), asc(productVariants.sku)] },
      images: { orderBy: [asc(productImages.position)] },
    },
  })
}

export function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      category: true,
      variants: { orderBy: [asc(productVariants.position), asc(productVariants.sku)] },
      images: { orderBy: [asc(productImages.position)] },
    },
  })
}

export async function slugExists(slug: string, exceptId?: string): Promise<boolean> {
  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    columns: { id: true },
  })
  return row ? row.id !== exceptId : false
}

/**
 * Admin listing — every status, newest first, with aggregate stock so the table
 * can flag what is out of stock without a second round trip.
 */
export async function listProductsForAdmin(filters: ProductFilters) {
  const where = and(
    filters.status ? eq(products.status, filters.status) : undefined,
    filters.categoryId ? eq(products.categoryId, filters.categoryId) : undefined,
    filters.q
      ? sql`${products.searchVector} @@ websearch_to_tsquery('english', ${filters.q})`
      : undefined,
  )

  const [rows, [totals]] = await Promise.all([
    db
      .select({
        id: products.id,
        slug: products.slug,
        title: products.title,
        status: products.status,
        brand: products.brand,
        categoryName: categories.name,
        fromPrice,
        totalStock,
        variantCount: sql<number>`count(${productVariants.id})::int`,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .where(where)
      .groupBy(products.id, categories.name)
      .orderBy(desc(products.createdAt))
      .limit(PAGE_SIZE)
      .offset((filters.page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(products).where(where),
  ])

  const images = await firstImageByProduct(rows.map((r) => r.id))

  return {
    rows: rows.map((r) => ({ ...r, imageKey: images.get(r.id) ?? null })),
    total: totals?.n ?? 0,
    pageSize: PAGE_SIZE,
  }
}

/**
 * Storefront listing — active products only. Relevance sorting is only
 * meaningful with a query, so callers fall back to newest without one.
 */
export async function listActiveProducts(filters: ProductFilters) {
  const tsQuery = filters.q ? sql`websearch_to_tsquery('english', ${filters.q})` : null

  const where = and(
    eq(products.status, 'active'),
    filters.categoryId ? eq(products.categoryId, filters.categoryId) : undefined,
    tsQuery ? sql`${products.searchVector} @@ ${tsQuery}` : undefined,
  )

  const orderBy = (() => {
    switch (filters.sort) {
      case 'price-asc':
        return [asc(fromPrice)]
      case 'price-desc':
        return [desc(fromPrice)]
      case 'relevance':
        return tsQuery
          ? [desc(sql`ts_rank(${products.searchVector}, ${tsQuery})`), desc(products.createdAt)]
          : [desc(products.createdAt)]
      default:
        return [desc(products.createdAt)]
    }
  })()

  const [rows, [totals]] = await Promise.all([
    db
      .select({
        id: products.id,
        slug: products.slug,
        title: products.title,
        brand: products.brand,
        fromPrice,
        totalStock,
      })
      .from(products)
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .where(where)
      .groupBy(products.id)
      .orderBy(...orderBy)
      .limit(PAGE_SIZE)
      .offset((filters.page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(products).where(where),
  ])

  const images = await firstImageByProduct(rows.map((r) => r.id))

  return {
    rows: rows.map((r) => ({ ...r, imageKey: images.get(r.id) ?? null })),
    total: totals?.n ?? 0,
    pageSize: PAGE_SIZE,
  }
}

export function listActiveProductSlugs() {
  return db
    .select({ slug: products.slug, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.status, 'active'))
}

/**
 * Product and variants are written together: a product without a variant has no
 * price and no stock, so it must never exist even briefly.
 */
export async function insertProductWithVariants(input: ProductInput) {
  return db.transaction(async (tx) => {
    const [product] = await tx
      .insert(products)
      .values({
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        brand: input.brand ?? null,
        categoryId: input.categoryId,
        status: input.status,
      })
      .returning()

    if (!product) throw new Error('Product insert returned no row')

    await tx.insert(productVariants).values(
      input.variants.map((v, i) => ({
        productId: product.id,
        sku: v.sku,
        title: v.title ?? null,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: v.stock,
        weightGrams: v.weightGrams,
        options: v.options,
        position: i,
      })),
    )

    return product
  })
}

export async function updateProductWithVariants(id: string, input: ProductInput) {
  return db.transaction(async (tx) => {
    const [product] = await tx
      .update(products)
      .set({
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        brand: input.brand ?? null,
        categoryId: input.categoryId,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning()

    if (!product) throw new Error('Product not found')

    const keptIds = input.variants.map((v) => v.id).filter((v): v is string => Boolean(v))

    // Variants dropped from the form are removed. Safe in P1 because nothing
    // references them yet; once orders exist (P2) this becomes an archive flag,
    // since order_items must keep pointing somewhere.
    await tx.delete(productVariants).where(
      keptIds.length
        ? and(eq(productVariants.productId, id), notInArray(productVariants.id, keptIds))
        : eq(productVariants.productId, id),
    )

    for (const [i, v] of input.variants.entries()) {
      const values = {
        productId: id,
        sku: v.sku,
        title: v.title ?? null,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: v.stock,
        weightGrams: v.weightGrams,
        options: v.options,
        position: i,
        updatedAt: new Date(),
      }

      if (v.id) {
        await tx.update(productVariants).set(values).where(eq(productVariants.id, v.id))
      } else {
        await tx.insert(productVariants).values(values)
      }
    }

    return product
  })
}

export async function setProductStatus(id: string, status: 'draft' | 'active' | 'archived') {
  const [row] = await db
    .update(products)
    .set({ status, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning()
  return row
}

// -------------------------------------------------------------------- images

export async function insertImage(input: { productId: string; key: string; alt?: string }) {
  const [{ n } = { n: 0 }] = await db
    .select({ n: count() })
    .from(productImages)
    .where(eq(productImages.productId, input.productId))

  const [row] = await db
    .insert(productImages)
    .values({
      productId: input.productId,
      r2Key: input.key,
      alt: input.alt ?? null,
      position: n,
    })
    .returning()

  return row
}

export function getImage(id: string) {
  return db.query.productImages.findFirst({ where: eq(productImages.id, id) })
}

export async function deleteImage(id: string) {
  await db.delete(productImages).where(eq(productImages.id, id))
}

export async function reorderImages(productId: string, ids: string[]) {
  await db.transaction(async (tx) => {
    for (const [i, id] of ids.entries()) {
      await tx
        .update(productImages)
        .set({ position: i })
        .where(and(eq(productImages.id, id), eq(productImages.productId, productId)))
    }
  })
}

export function getImagesByIds(ids: string[]) {
  return db.query.productImages.findMany({ where: inArray(productImages.id, ids) })
}
