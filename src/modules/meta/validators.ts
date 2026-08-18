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

export const initiateCheckoutEventSchema = z.object({ eventId: metaEventIdSchema })

const optionalId = z.string().trim().max(80).regex(/^\d*$/, 'Use the numeric ID shown by Meta')

export const metaIntegrationInputSchema = z
  .object({
    enabled: z.boolean(),
    pixelId: optionalId,
    datasetId: optionalId,
    accessToken: z.string().trim().max(4000).optional().default(''),
    clearAccessToken: z.boolean().optional().default(false),
    testEventCode: z.string().trim().max(120),
    domainVerificationCode: z.string().trim().max(255),
  })
  .superRefine((value, context) => {
    if (value.accessToken && value.accessToken.length < 20) {
      context.addIssue({ code: 'custom', path: ['accessToken'], message: 'Access token looks too short' })
    }
    if (value.enabled && !value.pixelId && !value.datasetId) {
      context.addIssue({
        code: 'custom',
        path: ['pixelId'],
        message: 'Add a Pixel ID, a Dataset ID, or turn tracking off',
      })
    }
  })

export type MetaContent = { id: string; quantity: number; item_price: number }

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
