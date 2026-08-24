import 'server-only'

import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { env } from '@/lib/env'

import { isOnlineGateway } from './provider'
import { handleGatewayNotification, PaymentError } from './service'

const HOSTS = {
  sandbox: 'https://sandbox.sslcommerz.com',
  live: 'https://securepay.sslcommerz.com',
} as const

export type GatewayReconciliationResult = 'ok' | 'late-cancelled' | 'duplicate' | 'pending'

type TransactionQueryElement = {
  status?: unknown
  tran_id?: unknown
  val_id?: unknown
  tran_date?: unknown
}

type TransactionQueryResponse = {
  APIConnect?: unknown
  no_of_trans_found?: unknown
  element?: unknown
}

function assertOrderNumber(orderNumber: string) {
  if (!/^[A-Z0-9-]{4,32}$/i.test(orderNumber)) {
    throw new PaymentError('Invalid order number.')
  }
}

export function findSuccessfulValidationId(
  response: TransactionQueryResponse,
  orderNumber: string,
): string | null {
  if (response.APIConnect !== 'DONE' || !Array.isArray(response.element)) return null

  const successful = (response.element as TransactionQueryElement[])
    .filter((row) => {
      const status = String(row.status ?? '').toUpperCase()
      return (
        String(row.tran_id ?? '') === orderNumber &&
        (status === 'VALID' || status === 'VALIDATED') &&
        typeof row.val_id === 'string' &&
        row.val_id.length > 0
      )
    })
    .sort((a, b) => String(b.tran_date ?? '').localeCompare(String(a.tran_date ?? '')))

  return successful.length > 0 ? String(successful[0]?.val_id) : null
}

async function querySuccessfulValidationId(orderNumber: string): Promise<string | null> {
  const { SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD, SSLCOMMERZ_SANDBOX } = env
  if (!SSLCOMMERZ_STORE_ID || !SSLCOMMERZ_STORE_PASSWORD) {
    throw new Error('SSLCommerz is not configured')
  }

  const host = SSLCOMMERZ_SANDBOX ? HOSTS.sandbox : HOSTS.live
  const url = new URL(`${host}/validator/api/merchantTransIDvalidationAPI.php`)
  url.searchParams.set('tran_id', orderNumber)
  url.searchParams.set('store_id', SSLCOMMERZ_STORE_ID)
  url.searchParams.set('store_passwd', SSLCOMMERZ_STORE_PASSWORD)
  url.searchParams.set('v', '1')
  url.searchParams.set('format', 'json')

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`SSLCommerz transaction query failed: ${res.status}`)

  const data = (await res.json()) as TransactionQueryResponse
  if (data.APIConnect !== 'DONE') {
    throw new Error(`SSLCommerz transaction query was not accepted: ${String(data.APIConnect ?? 'unknown')}`)
  }

  return findSuccessfulValidationId(data, orderNumber)
}

export async function reconcileGatewayOrder(
  orderNumber: string,
): Promise<GatewayReconciliationResult> {
  assertOrderNumber(orderNumber)

  const order = await db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
  })
  if (!order) throw new PaymentError('Order not found.')
  if (!isOnlineGateway(order.paymentMethod)) {
    throw new PaymentError('This order is not an SSLCommerz payment.')
  }
  if (order.paymentStatus === 'paid') return 'duplicate'

  const valId = await querySuccessfulValidationId(orderNumber)
  if (!valId) return 'pending'

  return handleGatewayNotification('sslcommerz', valId)
}
