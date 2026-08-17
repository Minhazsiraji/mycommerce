'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { STORAGE_FOLDERS, storage, type UploadSignature } from '@/lib/storage'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'

import * as service from './service'
import { CatalogError } from './service'
import { CATALOG_TAGS } from './tags'
import {
  attachCategoryImageSchema,
  attachImageSchema,
  categoryInputSchema,
  productInputSchema,
  productStatusSchema,
  reorderSchema,
} from './validators'

/**
 * Every action here: validate, authorize, delegate, revalidate. No business
 * logic — that lives in service.ts.
 */

const idSchema = z.uuid()

/**
 * `updateTag` rather than `revalidateTag`: it is Server-Action-only and gives
 * read-your-own-writes, so an admin who saves a product sees the change on the
 * very next render instead of a stale copy.
 *
 * Tags come from the shared constants in tags.ts — see the note there on why
 * these are not per-product.
 */
function invalidate(...tags: string[]) {
  for (const tag of tags) updateTag(tag)
}

const { products: PRODUCTS, categories: CATEGORIES } = CATALOG_TAGS

/** Turns an expected domain error into a form message; anything else rethrows. */
function toResult(error: unknown): ActionResult<never> {
  if (error instanceof CatalogError) {
    return fail(
      'conflict',
      error.message,
      error.field ? { [error.field]: error.message } : undefined,
    )
  }
  throw error
}

export async function createProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await requireRole('admin')

  const parsed = productInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const product = await service.createProduct(parsed.data)
    await recordAudit(admin, {
      action: 'product.created',
      entityType: 'product',
      entityId: product.id,
      detail: { title: parsed.data.title },
    })
    invalidate(PRODUCTS)
    return ok({ id: product.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function updateProduct(
  rawId: unknown,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  if (!id.success) return fail('validation', 'Invalid product id.')

  const parsed = productInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const product = await service.updateProduct(id.data, parsed.data)
    await recordAudit(admin, {
      action: 'product.updated',
      entityType: 'product',
      entityId: product.id,
      detail: { title: parsed.data.title },
    })
    invalidate(PRODUCTS)
    return ok({ id: product.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function setProductStatus(
  rawId: unknown,
  rawStatus: unknown,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  const status = productStatusSchema.safeParse(rawStatus)
  if (!id.success || !status.success) return fail('validation', 'Invalid request.')

  try {
    const product = await service.setProductStatus(id.data, status.data)
    await recordAudit(admin, {
      action: 'product.status_changed',
      entityType: 'product',
      entityId: product.id,
      detail: { status: status.data },
    })
    invalidate(PRODUCTS)
    return ok({ id: product.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function createCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await requireRole('admin')

  const parsed = categoryInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const category = await service.createCategory(parsed.data)
    await recordAudit(admin, {
      action: 'category.created',
      entityType: 'category',
      entityId: category.id,
      detail: { name: parsed.data.name },
    })
    invalidate(CATEGORIES, PRODUCTS)
    return ok({ id: category.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function updateCategory(
  rawId: unknown,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  if (!id.success) return fail('validation', 'Invalid category id.')

  const parsed = categoryInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const category = await service.updateCategory(id.data, parsed.data)
    await recordAudit(admin, {
      action: 'category.updated',
      entityType: 'category',
      entityId: category.id,
      detail: { name: parsed.data.name },
    })
    invalidate(CATEGORIES, PRODUCTS)
    return ok({ id: category.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function deleteCategory(rawId: unknown): Promise<ActionResult<null>> {
  const admin = await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  if (!id.success) return fail('validation', 'Invalid category id.')

  try {
    await service.deleteCategory(id.data)
    await recordAudit(admin, { action: 'category.deleted', entityType: 'category', entityId: id.data })
    invalidate(CATEGORIES, PRODUCTS)
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

/**
 * Credentials for a direct browser upload. The file never passes through our
 * server, which keeps large product photos clear of the request body limit.
 */
export async function createImageUploadSignature(): Promise<ActionResult<UploadSignature>> {
  // Not audited: issuing a signature changes nothing. The `image.attached` entry
  // that follows a real upload is the one worth keeping.
  await requireRole('admin')

  try {
    return ok(storage.createUploadSignature({ folder: STORAGE_FOLDERS.products }))
  } catch {
    // The thrown message names env vars; do not surface it to the browser.
    return fail('unavailable', 'Image uploads are not configured.')
  }
}

export async function createCategoryImageUploadSignature(): Promise<
  ActionResult<UploadSignature>
> {
  await requireRole('admin')

  try {
    return ok(storage.createUploadSignature({ folder: STORAGE_FOLDERS.categories }))
  } catch {
    return fail('unavailable', 'Image uploads are not configured.')
  }
}

export async function attachCategoryImage(input: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await requireRole('admin')

  const parsed = attachCategoryImageSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const category = await service.attachCategoryImage(parsed.data)
    await recordAudit(admin, {
      action: 'category.image_updated',
      entityType: 'category',
      entityId: category.id,
    })
    invalidate(CATEGORIES)
    return ok({ id: category.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function attachImage(input: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await requireRole('admin')

  const parsed = attachImageSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const image = await service.attachImage(parsed.data)
    await recordAudit(admin, {
      action: 'image.attached',
      entityType: 'product',
      entityId: parsed.data.productId,
      detail: { imageId: image.id },
    })
    invalidate(PRODUCTS)
    return ok({ id: image.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function removeImage(rawId: unknown): Promise<ActionResult<null>> {
  const admin = await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  if (!id.success) return fail('validation', 'Invalid image id.')

  try {
    await service.removeImage(id.data)
    await recordAudit(admin, { action: 'image.removed', entityType: 'image', entityId: id.data })
    invalidate(PRODUCTS)
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function reorderImages(input: unknown): Promise<ActionResult<null>> {
  const admin = await requireRole('admin')

  const parsed = reorderSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    await service.reorderImages(parsed.data.productId, parsed.data.ids)
    await recordAudit(admin, {
      action: 'image.reordered',
      entityType: 'product',
      entityId: parsed.data.productId,
    })
    invalidate(PRODUCTS)
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}
