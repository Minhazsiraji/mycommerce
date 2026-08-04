'use server'

import { revalidatePath } from 'next/cache'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireSession } from '@/modules/accounts'

import * as service from './service'
import { CartError, type CartView } from './service'
import { addToCartSchema, removeLineSchema, updateLineSchema } from './validators'

/**
 * The cart is per-visitor and never cached, so these use `revalidatePath`
 * rather than a cache tag — there is no shared cache entry to invalidate, only
 * this request's rendered output.
 */
function refresh() {
  revalidatePath('/', 'layout')
}

function toResult(error: unknown): ActionResult<never> {
  if (error instanceof CartError) return fail('conflict', error.message)
  throw error
}

export async function addToCart(input: unknown): Promise<ActionResult<CartView>> {
  const parsed = addToCartSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    await service.addToCart(parsed.data)
    refresh()
    return ok(await service.readCart())
  } catch (error) {
    return toResult(error)
  }
}

export async function updateLineQuantity(input: unknown): Promise<ActionResult<CartView>> {
  const parsed = updateLineSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    await service.updateLineQuantity(parsed.data.lineId, parsed.data.quantity)
    refresh()
    return ok(await service.readCart())
  } catch (error) {
    return toResult(error)
  }
}

export async function removeLine(input: unknown): Promise<ActionResult<CartView>> {
  const parsed = removeLineSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    await service.removeLine(parsed.data.lineId)
    refresh()
    return ok(await service.readCart())
  } catch (error) {
    return toResult(error)
  }
}

/** Called by the client once immediately after a successful sign-in. */
export async function mergeGuestCart(): Promise<ActionResult<null>> {
  const session = await requireSession()

  await service.mergeGuestCartIntoUser(session.user.id)
  refresh()
  return ok(null)
}
