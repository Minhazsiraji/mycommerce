'use server'

import { refresh } from 'next/cache'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { ShippingError } from '@/modules/shipping'

import * as service from './service'
import { CheckoutError, OutOfStockError } from './service'
import { placeOrderSchema } from './validators'

function toResult(error: unknown): ActionResult<never> {
  // Out-of-stock is the one a customer is most likely to hit, and the message
  // names the product so they know which line to fix.
  if (error instanceof OutOfStockError) return fail('conflict', error.message)
  if (error instanceof CheckoutError) return fail('conflict', error.message)
  if (error instanceof ShippingError) return fail('conflict', error.message)
  throw error
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
