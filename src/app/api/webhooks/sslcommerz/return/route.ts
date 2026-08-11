import { redirect } from 'next/navigation'

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

  // SSLCommerz posts the transaction back as form data on success and cancel.
  if (request.method === 'POST') {
    const form = await request.formData().catch(() => null)
    orderNumber = String(form?.get('tran_id') ?? '')
  }

  if (!orderNumber) orderNumber = url.searchParams.get('tran_id') ?? ''

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

  const outcome = status === 'failed' || status === 'cancelled' ? status : 'cancelled'
  const query = status === 'success' ? '' : `?payment=${outcome}`

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
