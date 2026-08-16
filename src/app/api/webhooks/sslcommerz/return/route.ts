import { redirect } from 'next/navigation'

import { handleGatewayNotification, readCallbackForm } from '@/modules/payments'

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

  // SSLCommerz posts the transaction back as form data on success and cancel.
  if (request.method === 'POST') {
    const form = await readCallbackForm(request, MAX_CALLBACK_BYTES).catch(() => null)
    orderNumber = String(form?.get('tran_id') ?? '')
    valId = String(form?.get('val_id') ?? '')
  }

  if (!orderNumber) orderNumber = url.searchParams.get('tran_id') ?? ''

  // Some gateway/browser combinations return without reposting tran_id. The
  // callback created for this session carries the order number as a
  // redirect-only fallback. It cannot change payment state; only the verified
  // IPN handler can mark the order paid.
  if (!orderNumber) orderNumber = url.searchParams.get('order') ?? ''

  /**
   * Both values come from the request, so neither is trusted into a URL.
   *
   * The fixed origin prefix already rules out an off-site redirect, but
   * unencoded input in a Location header is the response-splitting shape, and
   * `..%2f` in the path segment would walk out of /orders. Order numbers are
   * `MC-XXXXXX-XXXXXX`, so anything else is not a real return trip; the status
   * is narrowed to the three values the gateway actually sends.
   */
  if (!/^[A-Z0-9-]{4,32}$/i.test(orderNumber)) redirect('/')

  // IPN and the browser return are independent requests and can arrive in
  // either order. Verify the gateway's val_id here as well so the customer
  // does not land on a stale unpaid page while a successful IPN is in flight.
  // The service is idempotent, so an IPN that won the race makes this a no-op.
  if (status === 'success' && valId) {
    await handleGatewayNotification(valId).catch((error) => {
      console.error('[sslcommerz] success return verification failed', { error })
    })
  }

  const outcome = status === 'failed' || status === 'cancelled' ? status : 'cancelled'
  const query = status === 'success' ? '?payment=success' : `?payment=${outcome}`

  // Stay on the deployment SSLCommerz returned to. Preview orders live in an
  // isolated database, so sending this browser to the configured Production
  // origin would make a valid Preview order appear to be missing.
  redirect(`/orders/${encodeURIComponent(orderNumber)}${query}`)
}

export async function GET(request: Request) {
  return handle(request)
}

export async function POST(request: Request) {
  return handle(request)
}
