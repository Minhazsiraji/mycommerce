'use server'

import { ok, fromZodError, type ActionResult } from '@/lib/action-result'
import { rateLimit } from '@/lib/rate-limit'
import { readCart } from '@/modules/cart'

import * as service from './service'
import {
  contactEventSchema,
  initiateCheckoutEventSchema,
  leadEventSchema,
  viewContentEventSchema,
} from './validators'

export async function trackViewContent(input: unknown): Promise<ActionResult<null>> {
  const parsed = viewContentEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!(await service.isCapiConfigured())) return ok(null)

  const limit = await rateLimit('meta-view-content', 120, 3600)
  if (!limit.ok) return ok(null)

  await service.trackViewContent(parsed.data.eventId, parsed.data.variantId)
  return ok(null)
}

export async function trackInitiateCheckout(input: unknown): Promise<ActionResult<null>> {
  const parsed = initiateCheckoutEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!(await service.isCapiConfigured())) return ok(null)

  const limit = await rateLimit('meta-initiate-checkout', 30, 3600)
  if (!limit.ok) return ok(null)

  const cart = await readCart()
  if (!cart.id || cart.lines.length === 0 || cart.hasIssues) return ok(null)

  await service.trackInitiateCheckout(parsed.data.eventId, cart)
  return ok(null)
}

export async function trackContact(input: unknown): Promise<ActionResult<null>> {
  const parsed = contactEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!(await service.isCapiConfigured())) return ok(null)

  const limit = await rateLimit('meta-contact', 30, 3600)
  if (!limit.ok) return ok(null)

  await service.trackContact(parsed.data.eventId, parsed.data.method)
  return ok(null)
}

/**
 * Reusable Lead delivery. No storefront surface calls this yet — it exists so
 * the AgentSiraji.com Store-Audit form (a separate app) can be wired to a
 * consistent, deduplicated Lead path without reimplementing CAPI.
 */
export async function trackLead(input: unknown): Promise<ActionResult<null>> {
  const parsed = leadEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!(await service.isCapiConfigured())) return ok(null)

  const limit = await rateLimit('meta-lead', 30, 3600)
  if (!limit.ok) return ok(null)

  await service.trackLead(parsed.data.eventId, {
    value: parsed.data.value,
    currency: parsed.data.currency,
    contentName: parsed.data.contentName,
  })
  return ok(null)
}
