'use server'

import { refresh } from 'next/cache'
import { after } from 'next/server'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireSession } from '@/modules/accounts'
import { trackAddToCart } from '@/modules/meta'

import * as service from './service'
import { CartError, type CartView } from './service'
import { addToCartSchema, removeLineSchema, updateLineSchema } from './validators'

/**
 * Cart-page quantity/removal mutations still refresh the current route after
 * persistence so the optimistic client state is reconciled with authoritative
 * stock and pricing. Product-page Add to Cart deliberately does NOT do this:
 * refreshing the whole product route made a one-line cart write wait on an
 * expensive server-component rerender. Its header badge is updated locally by
 * a client event instead.
 */
function refreshClient() {
  refresh()
}

function toResult(error: unknown): ActionResult<never> {
  if (error instanceof CartError) return fail('conflict', error.message)
  throw error
}

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

    // Do not refresh() here. The product page does not depend on cart state and
    // a refresh forces all of its dynamic server components to run again before
    // the action feels complete. The client updates the cart badge after this
    // authoritative write succeeds.
    return ok(null)
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
