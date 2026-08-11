import { z } from 'zod'

export const metaEventIdSchema = z
  .string()
  .trim()
  .min(10)
  .max(120)
  .regex(/^[a-z][a-z0-9_-]*:[0-9a-f-]{36}$/i, 'Invalid analytics event id')

export const viewContentEventSchema = z.object({
  eventId: metaEventIdSchema,
  variantId: z.uuid(),
})

export const initiateCheckoutEventSchema = z.object({
  eventId: metaEventIdSchema,
})

export type MetaContent = {
  id: string
  quantity: number
  item_price: number
}

export type MetaCustomData = {
  content_ids?: string[]
  content_name?: string
  content_type?: 'product'
  contents?: MetaContent[]
  currency?: 'BDT'
  num_items?: number
  search_string?: string
  value?: number
}
