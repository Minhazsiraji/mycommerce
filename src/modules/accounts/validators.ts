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

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
