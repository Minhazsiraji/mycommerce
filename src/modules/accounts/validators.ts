import { z } from 'zod'

/**
 * Client-safe validators, shared by forms and server code.
 *
 * These live apart from `schema.ts` deliberately: that file defines Drizzle
 * tables, and importing it from a client component pulls the entire ORM into the
 * browser bundle. Keep this file free of any server-only import.
 *
 * The client copy gives immediate feedback; the server copy is the one that decides.
 */

export const emailSchema = z.email('Enter a valid email address')

// Length only. Composition rules (a digit, a symbol, a capital) push people
// toward predictable substitutions without adding real entropy; length and a
// breach check do more. Better Auth enforces the minimum server-side too.
export const passwordSchema = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(128, 'Use at most 128 characters')

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  email: emailSchema,
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
})

export const forgotPasswordSchema = z.object({ email: emailSchema })

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})

/**
 * A delivery address.
 *
 * Phone is required and validated against Bangladeshi mobile formats, because
 * couriers here call before delivering — an order without a reachable number is
 * an order that does not arrive. Accepts 01XXXXXXXXX, +8801XXXXXXXXX and
 * 8801XXXXXXXXX, since customers type all three.
 */
export const bdPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .refine((value) => /^(?:\+?880|0)1[3-9]\d{8}$/.test(value), {
    message: 'Enter a valid mobile number, e.g. 01712345678',
  })
  // Stored in one canonical form so support can search for a number and find it.
  .transform((value) => (value.startsWith('0') ? `+88${value}` : `+${value.replace(/^\+/, '')}`))

export const addressInputSchema = z.object({
  recipient: z.string().trim().min(1, 'Required').max(80),
  phone: bdPhoneSchema,
  line1: z.string().trim().min(1, 'Required').max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(1, 'Required').max(80),
  district: z.string().trim().min(1, 'Required').max(80),
  postalCode: z.string().trim().max(12).optional(),
  country: z.string().trim().length(2).default('BD'),
})

export type AddressInput = z.infer<typeof addressInputSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
