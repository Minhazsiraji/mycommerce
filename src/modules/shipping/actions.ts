'use server'

import { refresh } from 'next/cache'
import { z } from 'zod'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireRole } from '@/modules/accounts'

import * as service from './service'
import { ShippingError } from './service'
import { shippingRateInputSchema } from './validators'

const idSchema = z.uuid()

function toResult(error: unknown): ActionResult<never> {
  if (error instanceof ShippingError) return fail('conflict', error.message)
  throw error
}

export async function createShippingRate(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireRole('admin')

  const parsed = shippingRateInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const rate = await service.createRate(parsed.data)
    refresh()
    return ok({ id: rate.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function updateShippingRate(
  rawId: unknown,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  if (!id.success) return fail('validation', 'Invalid delivery option.')

  const parsed = shippingRateInputSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const rate = await service.updateRate(id.data, parsed.data)
    refresh()
    return ok({ id: rate.id })
  } catch (error) {
    return toResult(error)
  }
}

export async function deleteShippingRate(rawId: unknown): Promise<ActionResult<null>> {
  await requireRole('admin')

  const id = idSchema.safeParse(rawId)
  if (!id.success) return fail('validation', 'Invalid delivery option.')

  try {
    await service.deleteRate(id.data)
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}
