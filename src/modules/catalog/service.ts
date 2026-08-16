import 'server-only'

import { storage, type UploadedAsset } from '@/lib/storage'

import * as repo from './repository'
import type { CategoryInput, ProductInput } from './validators'

/**
 * Catalog business rules. Actions handle auth, validation and cache
 * invalidation; everything that decides *whether* something is allowed lives
 * here, so it is testable without a request.
 */

export class CatalogError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message)
  }
}

/** Duplicate SKUs inside one product are always a copy-paste mistake. */
function assertUniqueSkus(input: ProductInput) {
  const seen = new Set<string>()

  for (const v of input.variants) {
    const sku = v.sku.toLowerCase()
    if (seen.has(sku)) throw new CatalogError(`Duplicate SKU: ${v.sku}`, 'variants')
    seen.add(sku)
  }
}

async function assertSlugAvailable(slug: string, exceptId?: string) {
  if (await repo.slugExists(slug, exceptId)) {
    throw new CatalogError('That slug is already used by another product.', 'slug')
  }
}

export async function createProduct(input: ProductInput) {
  assertUniqueSkus(input)
  await assertSlugAvailable(input.slug)
  return repo.insertProductWithVariants(input)
}

export async function updateProduct(id: string, input: ProductInput) {
  assertUniqueSkus(input)
  await assertSlugAvailable(input.slug, id)

  const existing = await repo.getProductById(id)
  if (!existing) throw new CatalogError('Product not found.')

  return repo.updateProductWithVariants(id, input)
}

export async function setProductStatus(id: string, status: 'draft' | 'active' | 'archived') {
  const product = await repo.setProductStatus(id, status)
  if (!product) throw new CatalogError('Product not found.')
  return product
}

/**
 * Categories are capped at two levels. Deeper trees make breadcrumbs, filtering
 * and navigation disproportionately complex for a single store, and the cost
 * shows up in every query that touches them.
 */
async function assertValidParent(parentId: string | null, selfId?: string) {
  if (!parentId) return

  if (parentId === selfId) {
    throw new CatalogError('A category cannot be its own parent.', 'parentId')
  }

  const parent = await repo.getCategoryById(parentId)
  if (!parent) throw new CatalogError('That parent category does not exist.', 'parentId')

  if (parent.parentId) {
    throw new CatalogError('Categories can only nest two levels deep.', 'parentId')
  }

  // Moving a category under a parent would orphan its own children at depth 3.
  if (selfId) {
    const all = await repo.listCategories()
    if (all.some((c) => c.parentId === selfId)) {
      throw new CatalogError(
        'This category has sub-categories, so it cannot become a sub-category itself.',
        'parentId',
      )
    }
  }
}

export async function createCategory(input: CategoryInput) {
  await assertValidParent(input.parentId)

  const existing = await repo.getCategoryBySlug(input.slug)
  if (existing) throw new CatalogError('That slug is already used.', 'slug')

  // `.returning()` yields an array, so the row is optional to the type system.
  // Callers should not each have to re-check; fail here instead.
  const row = await repo.insertCategory(input)
  if (!row) throw new CatalogError('Could not create the category.')
  return row
}

export async function updateCategory(id: string, input: CategoryInput) {
  await assertValidParent(input.parentId, id)

  const existing = await repo.getCategoryBySlug(input.slug)
  if (existing && existing.id !== id) throw new CatalogError('That slug is already used.', 'slug')

  const row = await repo.updateCategory(id, input)
  if (!row) throw new CatalogError('Category not found.')
  return row
}

export async function deleteCategory(id: string) {
  const inUse = await repo.countProductsInCategory(id)
  if (inUse > 0) {
    throw new CatalogError(
      `${inUse} product${inUse === 1 ? '' : 's'} still use this category. Move them first.`,
    )
  }

  const children = (await repo.listCategories()).filter((c) => c.parentId === id)
  if (children.length) {
    throw new CatalogError('This category has sub-categories. Delete or move those first.')
  }

  await repo.deleteCategory(id)
}

export async function attachImage(input: { productId: string; key: string; alt?: string }) {
  const product = await repo.getProductById(input.productId)
  if (!product) throw new CatalogError('Product not found.')

  let asset: UploadedAsset
  try {
    asset = await storage.inspect(input.key)
  } catch {
    throw new CatalogError('The uploaded image could not be verified. Upload it again.')
  }

  const allowedFormats = new Set(['jpg', 'png', 'webp', 'avif'])
  const validDimensions =
    Number.isFinite(asset.width) &&
    Number.isFinite(asset.height) &&
    asset.width > 0 &&
    asset.height > 0 &&
    asset.width <= 12_000 &&
    asset.height <= 12_000
  const valid =
    asset.key === input.key &&
    allowedFormats.has(asset.format) &&
    Number.isFinite(asset.bytes) &&
    asset.bytes > 0 &&
    asset.bytes <= 5 * 1024 * 1024 &&
    validDimensions

  if (!valid) {
    await storage.delete(input.key).catch(() => {})
    throw new CatalogError('Use a JPG, PNG, WebP or AVIF image up to 5 MB.')
  }

  const row = await repo.insertImage(input)
  if (!row) throw new CatalogError('Could not attach the image.')
  return row
}

/**
 * Removes the database row first, then the stored object.
 *
 * Ordering matters: if storage deletion fails we are left with an orphaned file,
 * which costs a little money. The reverse order would leave a row pointing at a
 * missing image, which renders as a broken product page. Prefer the cheap
 * failure.
 */
export async function removeImage(id: string) {
  const image = await repo.getImage(id)
  if (!image) throw new CatalogError('Image not found.')

  await repo.deleteImage(id)

  try {
    await storage.delete(image.r2Key)
  } catch (error) {
    console.error('[catalog] orphaned storage object', image.r2Key, error)
  }

  return image
}

export async function reorderImages(productId: string, ids: string[]) {
  const images = await repo.getImagesByIds(ids)

  // Every id must belong to this product, or a crafted request could reorder
  // another product's images.
  if (images.length !== ids.length || images.some((i) => i.productId !== productId)) {
    throw new CatalogError('Those images do not all belong to this product.')
  }

  await repo.reorderImages(productId, ids)
}
