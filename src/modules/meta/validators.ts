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

/** Contact-intent channels a storefront link can express. */
export const contactMethodSchema = z.enum(['email', 'phone', 'whatsapp', 'messenger'])

export const contactEventSchema = z.object({
  eventId: metaEventIdSchema,
  method: contactMethodSchema,
})

/**
 * Lead is low-trust by nature — a browser POST cannot be allowed to assert an
 * authoritative sale. `value` is accepted only as a soft qualifier, bounded,
 * and paired with an explicit ISO-4217 currency or dropped.
 */
export const leadEventSchema = z.object({
  eventId: metaEventIdSchema,
  value: z.number().nonnegative().max(100_000_000).optional(),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  contentName: z.string().trim().min(1).max(100).optional(),
})

const metaId = z.string().trim().max(40).refine(
  (value) => value === '' || /^\d{5,40}$/.test(value),
  'Use the numeric ID shown in Meta Events Manager',
)

export const metaIntegrationInputSchema = z.object({
  trackingEnabled: z.boolean(),
  pixelId: metaId,
  datasetId: metaId,
  accessToken: z.string().trim().max(4096),
  clearAccessToken: z.boolean().default(false),
  testEventCode: z.string().trim().max(120),
  domainVerification: z
    .string()
    .trim()
    .max(255)
    .refine(
      (value) => value === '' || /^[A-Za-z0-9_-]+$/.test(value),
      'Use only the verification content value from Meta, not the full meta tag',
    ),
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
  /** ISO 4217, whatever the store is configured for — not a fixed 'BDT'. */
  currency?: string
  num_items?: number
  search_string?: string
  value?: number
}
