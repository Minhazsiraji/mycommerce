import type { Route } from 'next'
import { redirect } from 'next/navigation'

import { env } from '@/lib/env'

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

  if (!orderNumber) redirect('/')

  const query = status === 'success' ? '' : `?payment=${status ?? 'cancelled'}`
  redirect(`${env.BETTER_AUTH_URL}/orders/${orderNumber}${query}` as Route)
}

export async function GET(request: Request) {
  return handle(request)
}

export async function POST(request: Request) {
  return handle(request)
}
