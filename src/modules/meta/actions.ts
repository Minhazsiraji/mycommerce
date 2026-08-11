'use server'

import { ok, fromZodError, type ActionResult } from '@/lib/action-result'
import { rateLimit } from '@/lib/rate-limit'
import { readCart } from '@/modules/cart'

import * as service from './service'
import { initiateCheckoutEventSchema, viewContentEventSchema } from './validators'

export async function trackViewContent(input: unknown): Promise<ActionResult<null>> {
  const parsed = viewContentEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!service.isCapiConfigured()) return ok(null)

  const limit = await rateLimit('meta-view-content', 120, 3600)
  if (!limit.ok) return ok(null)

  await service.trackViewContent(parsed.data.eventId, parsed.data.variantId)
  return ok(null)
}

export async function trackInitiateCheckout(input: unknown): Promise<ActionResult<null>> {
  const parsed = initiateCheckoutEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!service.isCapiConfigured()) return ok(null)

  const limit = await rateLimit('meta-initiate-checkout', 30, 3600)
  if (!limit.ok) return ok(null)

  const cart = await readCart()
  if (!cart.id || cart.lines.length === 0 || cart.hasIssues) return ok(null)

  await service.trackInitiateCheckout(parsed.data.eventId, cart)
  return ok(null)
}
