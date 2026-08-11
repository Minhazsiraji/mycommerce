'use server'

import { refresh } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { parseBdt } from '@/lib/money'
import { rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { paymentCallbackOrigin } from '@/lib/request-origin'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'

import * as service from './service'
import { PaymentError } from './service'

const submitSchema = z.object({
  orderNumber: z.string().trim().min(4).max(32),
  reference: z.string().trim().min(3, 'Enter the transaction reference').max(120),
})

const confirmSchema = z.object({
  orderId: z.uuid(),
  /** Typed by the admin from the bank statement, then matched to the total. */
  observedAmount: z.string().transform((value, ctx) => {
    try {
      return parseBdt(value)
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Enter the amount you saw, e.g. 2560' })
      return z.NEVER
    }
  }),
})

function toResult(error: unknown): ActionResult<never> {
  if (error instanceof PaymentError) return fail('conflict', error.message)
  throw error
}

export async function startGatewayPayment(
  orderNumber: unknown,
): Promise<ActionResult<{ redirectUrl: string }>> {
  const parsed = z.string().trim().min(4).max(32).safeParse(orderNumber)
  if (!parsed.success) return fail('validation', 'Invalid order.')

  // Each call opens a session at SSLCommerz. Retrying a failed card is normal;
  // doing it thirty times a minute is not.
  const limit = await rateLimit('gateway-session', 15, 3600)
  if (!limit.ok) return fail('conflict', tooManyRequests(limit.retryAfter))

  try {
    const requestOrigin = (await headers()).get('origin')
    return ok(await service.startGatewayPayment(parsed.data, paymentCallbackOrigin(requestOrigin)))
  } catch (error) {
    if (error instanceof PaymentError) return toResult(error)
    // Configuration or provider trouble; the message would leak internals.
    console.error('[payments] gateway session failed', error)
    return fail('unavailable', 'Online payment is unavailable right now. Try bank transfer.')
  }
}

export async function switchToBankTransfer(orderNumber: unknown): Promise<ActionResult<null>> {
  const parsed = z.string().trim().min(4).max(32).safeParse(orderNumber)
  if (!parsed.success) return fail('validation', 'Invalid order.')

  try {
    await service.switchToBankTransfer(parsed.data)
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function submitTransferReference(input: unknown): Promise<ActionResult<null>> {
  const parsed = submitSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  // Reachable by a guest holding only an order number; correcting a mistyped
  // reference is expected, flooding the admin queue is not.
  const limit = await rateLimit('transfer-reference', 20, 3600)
  if (!limit.ok) return fail('conflict', tooManyRequests(limit.retryAfter))

  try {
    await service.submitTransferReference(parsed.data.orderNumber, parsed.data.reference)
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function confirmTransfer(input: unknown): Promise<ActionResult<null>> {
  const session = await requireRole('admin')

  const parsed = confirmSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  try {
    await service.confirmTransfer({
      orderId: parsed.data.orderId,
      observedAmount: parsed.data.observedAmount,
      adminUserId: session.user.id,
    })
    // The highest-trust action in the admin: one person deciding, from a bank
    // statement, that money arrived. The amount they say they saw is the record.
    await recordAudit(session, {
      action: 'transfer.confirmed',
      entityType: 'order',
      entityId: parsed.data.orderId,
      detail: { observedAmount: parsed.data.observedAmount },
    })
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function rejectTransfer(
  orderId: unknown,
  reason: unknown,
): Promise<ActionResult<null>> {
  const session = await requireRole('admin')

  const id = z.uuid().safeParse(orderId)
  const why = z.string().trim().min(1).max(200).safeParse(reason)
  if (!id.success || !why.success) return fail('validation', 'A reason is required.')

  try {
    await service.rejectTransfer(id.data, why.data)
    await recordAudit(session, {
      action: 'transfer.rejected',
      entityType: 'order',
      entityId: id.data,
      detail: { reason: why.data },
    })
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}
