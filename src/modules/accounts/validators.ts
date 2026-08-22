import { z } from 'zod'

import {
  BD_DISTRICT_SET,
  canonicalBdArea,
  canonicalBdCity,
} from '@/lib/bd-locations'
import { countryPreset } from '@/lib/country-presets'
import { STORE_CONFIG } from '@/lib/store-config'

const PRESET = countryPreset(STORE_CONFIG.countryCode)

export const ADDRESS_PRESET = PRESET

/**
 * Client-safe validators, shared by forms and server code.
 *
 * These live apart from `schema.ts` deliberately: that file defines Drizzle
 * tables, and importing it from a client component pulls the entire ORM into the
 * browser bundle. Keep this file free of any server-only import.
 *
 * The client copy gives immediate feedback; the server copy is the one that decides.
 */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Enter a valid email address'))

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
 * A delivery address, shaped by the store's country preset.
 *
 * Phone is always required, because couriers call before delivering — an order
 * without a reachable number is an order that does not arrive. What counts as
 * valid comes from the preset, so a Bangladeshi store keeps its mobile-format
 * rules and an international store is not forced to pretend it has a district.
 */
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .refine((value) => PRESET.phone.pattern.test(value), { message: PRESET.phone.message })
  // Stored in one canonical form so support can search for a number and find it.
  .transform(PRESET.phone.normalize)

/** Kept: the Meta module and existing call sites import this name. */
export const bdPhoneSchema = phoneSchema

const isBdModel = PRESET.addressModel === 'bd-administrative'

/**
 * The `district` and `upazila` columns carry the region and sub-area for every
 * country, rather than being renamed. Orders snapshot the whole address as JSON
 * at purchase time, so a rename would leave historical orders describing fields
 * that no longer exist — a migration that buys nothing a comment cannot.
 */
const regionSchema = isBdModel
  ? z.string().trim().refine((value) => BD_DISTRICT_SET.has(value), 'Choose a valid Bangladesh district')
  : z.string().trim().max(80).default('')

const areaSchema = isBdModel
  ? z.string().trim().min(2, `Choose a ${PRESET.labels.area}`).max(80)
  : z.string().trim().max(80).default('')

const postalCodeSchema =
  PRESET.fields.postalCode === 'required'
    ? z.string().trim().min(1, `Enter a ${PRESET.labels.postalCode}`).max(12)
    : z.string().trim().max(12).optional()

export const addressInputSchema = z
  .object({
    recipient: z.string().trim().min(1, 'Required').max(80),
    phone: phoneSchema,
    line1: z.string().trim().min(1, 'Required').max(160),
    line2: z.string().trim().max(160).optional(),
    city: z.string().trim().min(2, 'Choose a city or town').max(80),
    district: regionSchema,
    upazila: areaSchema,
    union: z.string().trim().max(80).optional(),
    postalCode: postalCodeSchema,
    country: z.string().trim().length(2).default(STORE_CONFIG.countryCode),
  })
  .superRefine((value, context) => {
    // The cascade only exists in the Bangladeshi model. Elsewhere there is no
    // authoritative list to check a city or area against.
    if (!isBdModel) return
    if (!BD_DISTRICT_SET.has(value.district)) return

    const city = canonicalBdCity(value.district, value.city)
    if (!city) {
      context.addIssue({
        code: 'custom',
        path: ['city'],
        message: 'Choose a city or town for the selected district',
      })
      return
    }

    if (!canonicalBdArea(value.district, city, value.upazila)) {
      context.addIssue({
        code: 'custom',
        path: ['upazila'],
        message: 'Choose a Thana or Upazila for the selected city and district',
      })
    }
  })

export type AddressInput = z.infer<typeof addressInputSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
