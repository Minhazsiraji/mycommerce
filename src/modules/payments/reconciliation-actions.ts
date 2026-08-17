'use server'

import { refresh } from 'next/cache'
import { z } from 'zod'

import { fail, ok, type ActionResult } from '@/lib/action-result'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'

import { reconcileGatewayOrder, type GatewayReconciliationResult } from './reconciliation'
import { PaymentError } from './service'

export async function reconcileGatewayOrderForAdmin(
  orderNumber: unknown,
): Promise<ActionResult<{ result: GatewayReconciliationResult }>> {
  const session = await requireRole('admin')
  const parsed = z.string().trim().regex(/^[A-Z0-9-]{4,32}$/i).safeParse(orderNumber)
  if (!parsed.success) return fail('validation', 'Invalid order number.')

  try {
    const result = await reconcileGatewayOrder(parsed.data)

    await recordAudit(session, {
      action: 'payment.sslcommerz.reconciled',
      entityType: 'order',
      entityId: parsed.data,
      detail: { result },
    })

    refresh()
    return ok({ result })
  } catch (error) {
    if (error instanceof PaymentError) return fail('conflict', error.message)
    console.error('[payments] SSLCommerz reconciliation failed', {
      orderNumber: parsed.data,
      error,
    })
    return fail('unavailable', 'Could not check SSLCommerz right now. Try again shortly.')
  }
}
