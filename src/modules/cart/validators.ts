import { z } from 'zod'

import { metaEventIdSchema } from '@/modules/meta/validators'

/** Shared by client and server. No Drizzle imports — see modules/catalog/validators.ts. */

/**
 * A per-line ceiling that is not about stock.
 *
 * Stock is checked separately and authoritatively at checkout. This exists so a
 * crafted request cannot ask for two billion of something and have the total
 * overflow a 32-bit integer column on the way to the payment gateway.
 */
export const MAX_LINE_QUANTITY = 99

export const addToCartSchema = z.object({
  variantId: z.uuid(),
  quantity: z.coerce.number().int().min(1).max(MAX_LINE_QUANTITY).default(1),
  eventId: metaEventIdSchema.optional(),
})

export const updateLineSchema = z.object({
  lineId: z.uuid(),
  /** Zero removes the line — the same gesture as pressing minus to nothing. */
  quantity: z.coerce.number().int().min(0).max(MAX_LINE_QUANTITY),
})

export const removeLineSchema = z.object({
  lineId: z.uuid(),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
