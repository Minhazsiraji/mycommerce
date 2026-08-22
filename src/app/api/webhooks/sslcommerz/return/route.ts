import { redirect } from 'next/navigation'

import {
  handleGatewayNotification,
  readCallbackForm,
  reconcileGatewayOrder,
} from '@/modules/payments'

const MAX_CALLBACK_BYTES = 64 * 1024

/**
 * Where the customer's browser lands after the gateway.
 *
 * This decides NOTHING about payment. It is a redirect and nothing more: the
 * return trip is trivially forged and routinely lost on flaky mobile
 * connections, so treating it as proof would mean anyone could mark their own
 * order paid by visiting a URL. The IPN handler is the authority; this page may
 * well render before it arrives, which is why the order page shows "payment
 * pending" rather than a result.
 */
async function handle(request: Request) {
  const url = new URL(request.url)
  const status = url.searchParams.get('status')

  let orderNumber = ''
  let valId = ''

  if (request.method === 'POST') {
    const form = await readCallbackForm(request, MAX_CALLBACK_BYTES).catch(() => null)
    orderNumber = String(form?.get('tran_id') ?? '')
    valId = String(form?.get('val_id') ?? '')
  }

  if (!orderNumber) orderNumber = url.searchParams.get('tran_id') ?? ''
  if (!orderNumber) orderNumber = url.searchParams.get('order') ?? ''

  if (!/^[A-Z0-9-]{4,32}$/i.test(orderNumber)) redirect('/')

  if (status === 'success') {
    // Fast path: when SSLCommerz reposts val_id, validate it immediately.
    if (valId) {
      await handleGatewayNotification('sslcommerz', valId).catch((error) => {
        console.error('[sslcommerz] success return validation failed', { orderNumber, error })
      })
    }

    // Recovery path: some gateway/browser combinations return successfully
    // without a val_id, and IPN can be delayed or missed. Query SSLCommerz by
    // our merchant transaction id, obtain a provider val_id only from a
    // VALID/VALIDATED transaction, and run it through the same authoritative
    // validation/amount/currency checks. This remains safe even if the IPN won
    // the race because settlement is idempotent.
    await reconcileGatewayOrder(orderNumber).catch((error) => {
      console.error('[sslcommerz] success return reconciliation failed', { orderNumber, error })
    })
  }

  const outcome = status === 'failed' || status === 'cancelled' ? status : 'cancelled'
  const query = status === 'success' ? '?payment=success' : `?payment=${outcome}`

  redirect(`/orders/${encodeURIComponent(orderNumber)}${query}`)
}

export async function GET(request: Request) {
  return handle(request)
}

export async function POST(request: Request) {
  return handle(request)
}
