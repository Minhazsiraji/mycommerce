'use server'

import { refresh } from 'next/cache'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { requireRole } from '@/modules/accounts'
import { ShippingError } from '@/modules/shipping'

import * as repo from './repository'
import * as service from './service'
import { CheckoutError, OutOfStockError } from './service'
import {
  cancelOrderSchema,
  fulfillmentUpdateSchema,
  placeOrderSchema,
  shipmentSchema,
} from './validators'

function toResult(error: unknown): ActionResult<never> {
  // Out-of-stock is the one a customer is most likely to hit, and the message
  // names the product so they know which line to fix.
  if (error instanceof OutOfStockError) return fail('conflict', error.message)
  if (error instanceof CheckoutError) return fail('conflict', error.message)
  if (error instanceof ShippingError) return fail('conflict', error.message)
  throw error
}

export async function setFulfillmentStatus(input: unknown): Promise<ActionResult<null>> {
  await requireRole('admin')

  const parsed = fulfillmentUpdateSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const row = await repo.setFulfillmentStatus(parsed.data.orderId, parsed.data.status)
    if (!row) return fail('not_found', 'Order not found.')
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function addShipment(input: unknown): Promise<ActionResult<null>> {
  await requireRole('admin')

  const parsed = shipmentSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    await repo.addShipment({
      orderId: parsed.data.orderId,
      carrier: parsed.data.carrier,
      trackingNumber: parsed.data.trackingNumber || null,
    })
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function cancelOrder(input: unknown): Promise<ActionResult<null>> {
  await requireRole('admin')

  const parsed = cancelOrderSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    await repo.cancelOrder(parsed.data.orderId, parsed.data.reason)
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function placeOrder(
  input: unknown,
): Promise<ActionResult<{ orderNumber: string; paymentMethod: string }>> {
  const parsed = placeOrderSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    const order = await service.placeOrder(parsed.data)
    refresh()
    return ok({ orderNumber: order.orderNumber, paymentMethod: order.paymentMethod })
  } catch (error) {
    return toResult(error)
  }
}
