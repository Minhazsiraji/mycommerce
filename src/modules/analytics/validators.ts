import { z } from 'zod'

export const analyticsPresetSchema = z.enum(['today', '7d', '30d', '90d', 'month', 'year', 'all', 'custom'])
export const analyticsGroupSchema = z.enum(['auto', 'day', 'month', 'year'])

const dateText = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined)

export const analyticsFiltersSchema = z
  .object({
    preset: analyticsPresetSchema.optional().catch('30d').default('30d'),
    group: analyticsGroupSchema.optional().catch('auto').default('auto'),
    from: dateText,
    to: dateText,
    categoryId: z.string().uuid().optional().catch(undefined),
    productId: z.string().uuid().optional().catch(undefined),
  })
  .transform((value) => ({
    ...value,
    preset: value.preset === 'custom' && (!value.from || !value.to) ? ('30d' as const) : value.preset,
  }))

export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>
export type AnalyticsGroup = z.infer<typeof analyticsGroupSchema>
