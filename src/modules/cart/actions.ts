'use server'

import { refresh } from 'next/cache'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireSession } from '@/modules/accounts'

import * as service from './service'
import { CartError, type CartView } from './service'
import { addToCartSchema, removeLineSchema, updateLineSchema } from './validators'

/**
 * `refresh()` from next/cache, not `revalidatePath` and not a cache tag.
 *
 * The cart is per-visitor, so there is no shared server cache entry to
 * invalidate. What goes stale is the *client's* router cache: the rendered
 * segment it already holds. `revalidatePath` did not touch that — the database
 * updated correctly while the page kept showing the old quantity until a hard
 * reload. This is the API built for exactly that case.
 */
function refreshClient() {
  refresh()
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
    refreshClient()
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
    refreshClient()
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
    refreshClient()
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
