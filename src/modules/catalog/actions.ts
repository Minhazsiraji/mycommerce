'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { STORAGE_FOLDERS, storage, type UploadSignature } from '@/lib/storage'
import { requireRole } from '@/modules/accounts'

import * as service from './service'
import { CatalogError } from './service'
import {
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
 */
function invalidate(...tags: string[]) {
  for (const tag of tags) updateTag(tag)
}

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
  await requireRole('admin')

  const parsed = productInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const product = await service.createProduct(parsed.data)
    invalidate('products:list', 'sitemap')
    return ok({ id: product.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function updateProduct(
  rawId: unknown,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  if (!id.success) return fail('validation', 'Invalid product id.')

  const parsed = productInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const product = await service.updateProduct(id.data, parsed.data)
    invalidate(`product:${product.id}`, 'products:list', 'sitemap')
    return ok({ id: product.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function setProductStatus(
  rawId: unknown,
  rawStatus: unknown,
): Promise<ActionResult<{ id: string }>> {
  await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  const status = productStatusSchema.safeParse(rawStatus)
  if (!id.success || !status.success) return fail('validation', 'Invalid request.')

  try {
    const product = await service.setProductStatus(id.data, status.data)
    invalidate(`product:${product.id}`, 'products:list', 'sitemap')
    return ok({ id: product.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function createCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireRole('admin')

  const parsed = categoryInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const category = await service.createCategory(parsed.data)
    if (!category) return fail('unexpected', 'Could not create the category.')
    invalidate('categories', 'products:list', 'sitemap')
    return ok({ id: category.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function updateCategory(
  rawId: unknown,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  if (!id.success) return fail('validation', 'Invalid category id.')

  const parsed = categoryInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const category = await service.updateCategory(id.data, parsed.data)
    invalidate('categories', `category:${category.id}`, 'products:list', 'sitemap')
    return ok({ id: category.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function deleteCategory(rawId: unknown): Promise<ActionResult<null>> {
  await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  if (!id.success) return fail('validation', 'Invalid category id.')

  try {
    await service.deleteCategory(id.data)
    invalidate('categories', `category:${id.data}`, 'sitemap')
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
  await requireRole('admin')

  try {
    return ok(storage.createUploadSignature({ folder: STORAGE_FOLDERS.products }))
  } catch {
    // The thrown message names env vars; do not surface it to the browser.
    return fail('unavailable', 'Image uploads are not configured.')
  }
}

export async function attachImage(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireRole('admin')

  const parsed = attachImageSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const image = await service.attachImage(parsed.data)
    invalidate(`product:${parsed.data.productId}`, 'products:list')
    return ok({ id: image.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function removeImage(rawId: unknown): Promise<ActionResult<null>> {
  await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  if (!id.success) return fail('validation', 'Invalid image id.')

  try {
    const image = await service.removeImage(id.data)
    invalidate(`product:${image.productId}`, 'products:list')
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function reorderImages(input: unknown): Promise<ActionResult<null>> {
  await requireRole('admin')

  const parsed = reorderSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    await service.reorderImages(parsed.data.productId, parsed.data.ids)
    invalidate(`product:${parsed.data.productId}`, 'products:list')
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}
