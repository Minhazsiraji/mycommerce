import { z } from 'zod'

import { bdPhoneSchema, emailSchema } from '@/modules/accounts/validators'

export const fraudKindSchema = z.enum(['phone', 'email', 'ip'])

const ipSchema = z.union([z.ipv4(), z.ipv6()])

export const fraudBlockSchema = z
  .object({
    kind: fraudKindSchema,
    value: z.string(),
    reason: z.string().trim().min(3, 'Add a short reason').max(300),
  })
  .transform((input, ctx) => {
    const value = input.value.trim()
    const schema =
      input.kind === 'phone' ? bdPhoneSchema : input.kind === 'email' ? emailSchema : ipSchema
    const parsed = schema.safeParse(value)
    if (!parsed.success) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: `Enter a valid ${input.kind}` })
      return z.NEVER
    }
    return {
      ...input,
      value: input.kind === 'email' ? parsed.data.toLowerCase() : parsed.data,
    }
  })

export const revokeFraudBlockSchema = z.object({ id: z.uuid() })
