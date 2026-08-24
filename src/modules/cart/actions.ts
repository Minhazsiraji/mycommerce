'use server'

import { refresh } from 'next/cache'
import { after } from 'next/server'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireSession } from '@/modules/accounts'
import { trackAddToCart } from '@/modules/meta'

import * as service from './service'
import { CartError } from './service'
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

/**
 * Cart mutations return only acknowledgement.
 *
 * The UI never consumes a freshly re-read CartView from these actions: the cart
 * page is optimistic and the product page only needs success/failure. Re-reading
 * the entire cart after every write added a second database round trip before
 * the button could settle. `refresh()` remains the authoritative sync mechanism
 * for server-rendered consumers such as the header badge.
 */
export async function addToCart(input: unknown): Promise<ActionResult<null>> {
  const parsed = addToCartSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const variant = await service.addToCart(parsed.data)
    const eventId = parsed.data.eventId
    if (eventId) {
      after(() =>
        trackAddToCart({
          eventId,
          variant,
          quantity: parsed.data.quantity,
        }).catch((error) => console.error('[meta] AddToCart delivery failed', error)),
      )
    }
    refreshClient()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function updateLineQuantity(input: unknown): Promise<ActionResult<null>> {
  const parsed = updateLineSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    await service.updateLineQuantity(parsed.data.lineId, parsed.data.quantity)
    refreshClient()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function removeLine(input: unknown): Promise<ActionResult<null>> {
  const parsed = removeLineSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    await service.removeLine(parsed.data.lineId)
    refreshClient()
    return ok(null)
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
