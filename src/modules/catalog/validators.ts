import { z } from 'zod'

import { parseBdt } from '@/lib/money'

/**
 * Shared by client and server. No Drizzle imports here — a client component
 * that needs a validator must not drag the ORM into the browser bundle.
 *
 * Admins type money as ordinary BDT text ('1,999.50'); these schemas convert it
 * to integer poisha at the boundary, so nothing downstream sees a decimal.
 */

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only')

/** Accepts text, emits poisha. */
const bdtAmount = z.string().transform((value, ctx) => {
  try {
    return parseBdt(value)
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Enter an amount like 1999 or 1999.50' })
    return z.NEVER
  }
})

/** Absent and empty-string both mean "no compare-at price". */
const optionalBdtAmount = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null
    try {
      return parseBdt(value)
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Enter an amount like 1999 or 1999.50' })
      return z.NEVER
    }
  })

export const productStatusSchema = z.enum(['draft', 'active', 'archived'])

export const variantInputSchema = z
  .object({
    id: z.uuid().optional(),
    sku: z.string().trim().min(1, 'Required').max(64),
    title: z.string().trim().max(120).optional(),
    price: bdtAmount,
    compareAtPrice: optionalBdtAmount,
    stock: z.coerce.number().int().min(0, 'Cannot be negative').max(1_000_000),
    weightGrams: z.coerce.number().int().min(0).max(1_000_000).default(0),
    options: z.record(z.string(), z.string()).default({}),
  })
  .refine((v) => v.compareAtPrice === null || v.compareAtPrice > v.price, {
    // A "was" price at or below the current price is either a mistake or
    // misleading pricing. Both are worth blocking at the form.
    message: 'Compare-at price must be higher than the price',
    path: ['compareAtPrice'],
  })

export const productInputSchema = z.object({
  title: z.string().trim().min(1, 'Required').max(200),
  slug: slugSchema,
  description: z.string().trim().max(5000).optional(),
  brand: z.string().trim().max(120).optional(),
  categoryId: z.uuid().nullable().default(null),
  status: productStatusSchema.default('draft'),
  variants: z.array(variantInputSchema).min(1, 'A product needs at least one variant'),
})

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120),
  slug: slugSchema,
  description: z.string().trim().max(1000).optional(),
  parentId: z.uuid().nullable().default(null),
  position: z.coerce.number().int().min(0).default(0),
})

export const productFiltersSchema = z.object({
  q: z.string().trim().max(120).optional(),
  categoryId: z.uuid().optional(),
  status: productStatusSchema.optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'relevance']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
})

export const attachImageSchema = z.object({
  productId: z.uuid(),
  key: z.string().trim().min(1).max(300),
  alt: z.string().trim().max(200).optional(),
})

export const reorderSchema = z.object({
  productId: z.uuid(),
  /** Ids in their new order. */
  ids: z.array(z.uuid()).min(1),
})

/**
 * Derives a slug from a title. Only a starting point — the admin form keeps the
 * field editable, because a slug is a URL that outlives the title.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '')
}

export type ProductInput = z.infer<typeof productInputSchema>
export type VariantInput = z.infer<typeof variantInputSchema>
export type CategoryInput = z.infer<typeof categoryInputSchema>
export type ProductFilters = z.infer<typeof productFiltersSchema>
