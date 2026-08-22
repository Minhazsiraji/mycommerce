import { z } from 'zod'

/** The pages a client can replace. Slugs match their routes. */
export const POLICY_SLUGS = ['terms', 'privacy', 'returns', 'shipping', 'about'] as const

export type PolicySlug = (typeof POLICY_SLUGS)[number]

export const POLICY_LABELS: Record<PolicySlug, string> = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  returns: 'Returns & Refunds',
  shipping: 'Shipping & Delivery',
  about: 'About',
}

/** Legally required before a store takes money, in most places we can sell. */
export const REQUIRED_POLICY_SLUGS: PolicySlug[] = ['terms', 'privacy', 'returns']

export const policyPageInputSchema = z.object({
  slug: z.enum(POLICY_SLUGS),
  title: z.string().trim().min(1, 'Enter a title.').max(120, 'Use 120 characters or fewer.'),
  summary: z
    .string()
    .trim()
    .min(1, 'Enter a short summary.')
    .max(500, 'Use 500 characters or fewer.'),
  body: z
    .string()
    .trim()
    .min(1, 'Enter the policy text.')
    .max(60_000, 'Use 60,000 characters or fewer.'),
})

export type PolicyPageInput = z.output<typeof policyPageInputSchema>

/**
 * Empty means "not stated", not zero — a zero-day return window is a real
 * policy someone might set, so it cannot double as the absent value.
 */
const optionalDays = z
  .union([z.number(), z.string(), z.null()])
  // Optional at the key level too: the Admin form omits a field it has no value
  // for, and an omitted period means the same as a cleared one.
  .optional()
  .transform((value) => {
    if (value === null || value === undefined || value === '') return null
    return typeof value === 'number' ? value : Number(value)
  })
  .refine((value) => value === null || (Number.isInteger(value) && value >= 0 && value <= 365), {
    message: 'Enter a whole number of days between 0 and 365, or leave it empty.',
  })

export const policySettingsInputSchema = z
  .object({
    returnWindowDays: optionalDays,
    refundProcessingMinDays: optionalDays,
    refundProcessingMaxDays: optionalDays,
  })
  .superRefine((value, context) => {
    const { refundProcessingMinDays: min, refundProcessingMaxDays: max } = value
    if (min !== null && max !== null && min > max) {
      context.addIssue({
        code: 'custom',
        path: ['refundProcessingMaxDays'],
        message: 'The longest refund time cannot be shorter than the shortest.',
      })
    }
  })

export type PolicySettingsInput = z.output<typeof policySettingsInputSchema>

/**
 * Splits authored text into paragraphs for rendering.
 *
 * Deliberately not a markdown parser: this text is rendered on a page every
 * customer sees, and adding a parser would mean either trusting its HTML output
 * or sanitising it. Blank-line-separated paragraphs cover what a policy needs
 * and cannot carry a script.
 */
export function policyParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}
