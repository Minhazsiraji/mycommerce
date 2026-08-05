import { z } from 'zod'

import { addressInputSchema } from '@/modules/accounts/validators'

/**
 * Checkout input.
 *
 * Note what is absent: no prices, no shipping cost, no total. The client sends
 * what it chose — variants are already in the cart, an address, a delivery
 * option id, a payment method — and every figure is recomputed server-side
 * inside the order transaction. This is invariant 2 in CLAUDE.md and the single
 * most security-relevant shape in the codebase.
 */
export const placeOrderSchema = z.object({
  /** Required even when signed in: the confirmation has to reach someone. */
  email: z.email('Enter a valid email address'),
  address: addressInputSchema,
  /** Id only — the cost is looked up and re-quoted on the server. */
  shippingRateId: z.uuid(),
  paymentMethod: z.enum(['sslcommerz', 'bank_transfer']),
  notes: z.string().trim().max(500).optional(),
  /** Signed-in customers can keep the address for next time. */
  saveAddress: z.coerce.boolean().default(false),
})

export const guestLookupSchema = z.object({
  orderNumber: z.string().trim().min(4).max(32),
  // Both required: an order number alone would let anyone enumerate orders.
  email: z.email(),
})

export const submitTransferSchema = z.object({
  orderNumber: z.string().trim().min(4).max(32),
  reference: z.string().trim().min(3, 'Enter the transaction reference').max(120),
})

export const orderFiltersSchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  paymentStatus: z
    .enum(['unpaid', 'awaiting_transfer', 'awaiting_verification', 'paid', 'failed', 'refunded'])
    .optional(),
  fulfillmentStatus: z.enum(['unfulfilled', 'processing', 'shipped', 'delivered']).optional(),
  page: z.coerce.number().int().min(1).default(1),
})

export const fulfillmentUpdateSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(['unfulfilled', 'processing', 'shipped', 'delivered']),
})

export const shipmentSchema = z.object({
  orderId: z.uuid(),
  carrier: z.string().trim().min(1, 'Which courier?').max(80),
  trackingNumber: z.string().trim().max(120).optional(),
})

export const cancelOrderSchema = z.object({
  orderId: z.uuid(),
  reason: z.string().trim().min(1, 'A reason is required').max(200),
})

export type OrderFilters = z.infer<typeof orderFiltersSchema>
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>
