import { z } from 'zod'

import { parseBdt } from '@/lib/money'

/** Shared by client and server. No Drizzle imports. */

const bdtAmount = z.string().transform((value, ctx) => {
  try {
    return parseBdt(value)
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Enter an amount like 60 or 120.50' })
    return z.NEVER
  }
})

const optionalBdtAmount = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null
    try {
      return parseBdt(value)
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Enter an amount like 2000' })
      return z.NEVER
    }
  })

export const shippingRateInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Required').max(80),
    description: z.string().trim().max(200).optional(),
    cost: bdtAmount,
    freeOverSubtotal: optionalBdtAmount,
    /** Comma-separated in the form; empty means "everywhere else". */
    districts: z
      .string()
      .trim()
      .optional()
      .transform((value) =>
        (value ?? '')
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
      ),
    estimatedDaysMin: z.coerce.number().int().min(0).max(60),
    estimatedDaysMax: z.coerce.number().int().min(0).max(60),
    position: z.coerce.number().int().min(0).default(0),
    active: z.coerce.boolean().default(true),
  })
  .refine((r) => r.estimatedDaysMax >= r.estimatedDaysMin, {
    message: 'Maximum days cannot be less than minimum',
    path: ['estimatedDaysMax'],
  })

export type ShippingRateInput = z.infer<typeof shippingRateInputSchema>
