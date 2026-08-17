import { z } from 'zod'

const internalDestination = z
  .string()
  .trim()
  .min(1, 'Enter a destination.')
  .max(200, 'Use 200 characters or fewer.')
  .refine(
    (value) =>
      (/^\/(?!\/)/.test(value) && !value.includes('\\')) || /^#[A-Za-z][\w:-]*$/.test(value),
    'Use an internal path such as /search or a section such as #categories.',
  )

const optionalAnnouncement = z
  .string()
  .trim()
  .max(90, 'Use 90 characters or fewer.')
  .transform((value) => value || null)

export const storefrontSettingsInputSchema = z.object({
  announcementEnabled: z.boolean(),
  announcementDeliveryText: optionalAnnouncement,
  announcementOfferText: optionalAnnouncement,
  heroEnabled: z.boolean(),
  heroTitle: z.string().trim().min(1, 'Enter a headline.').max(140, 'Use 140 characters or fewer.'),
  heroDescription: z
    .string()
    .trim()
    .min(1, 'Enter a description.')
    .max(320, 'Use 320 characters or fewer.'),
  heroPrimaryLabel: z
    .string()
    .trim()
    .min(1, 'Enter a button label.')
    .max(40, 'Use 40 characters or fewer.'),
  heroPrimaryHref: internalDestination,
  heroSecondaryLabel: z
    .string()
    .trim()
    .min(1, 'Enter a button label.')
    .max(40, 'Use 40 characters or fewer.'),
  heroSecondaryHref: internalDestination,
  heroBrandText: z
    .string()
    .trim()
    .min(1, 'Enter the main brand text.')
    .max(40, 'Use 40 characters or fewer.'),
  heroBrandAccent: z.string().trim().max(20, 'Use 20 characters or fewer.'),
  footerBrandText: z
    .string()
    .trim()
    .min(1, 'Enter the main footer brand text.')
    .max(40, 'Use 40 characters or fewer.'),
  footerBrandAccent: z.string().trim().max(20, 'Use 20 characters or fewer.'),
  footerDescription: z
    .string()
    .trim()
    .min(1, 'Enter a footer description.')
    .max(240, 'Use 240 characters or fewer.'),
  footerCopyright: z
    .string()
    .trim()
    .min(1, 'Enter copyright text.')
    .max(100, 'Use 100 characters or fewer.'),
})

export type StorefrontSettingsInput = z.output<typeof storefrontSettingsInputSchema>
