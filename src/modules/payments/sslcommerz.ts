import 'server-only'

import { env } from '@/lib/env'
import { CURRENCY, toDecimalString } from '@/lib/money'
import type { AddressSnapshot } from '@/modules/orders'

/**
 * SSLCommerz — an aggregator, not a wallet. One integration covers cards,
 * bKash, Nagad, Rocket and internet banking (docs/03-api.md).
 *
 * Sandbox and live differ only by host and credentials, so this file serves
 * both and there is no second code path to keep in step.
 */

const HOSTS = {
  sandbox: 'https://sandbox.sslcommerz.com',
  live: 'https://securepay.sslcommerz.com',
}

function config() {
  const { SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD, SSLCOMMERZ_SANDBOX } = env

  if (!SSLCOMMERZ_STORE_ID || !SSLCOMMERZ_STORE_PASSWORD) {
    throw new Error('SSLCommerz is not configured')
  }

  return {
    storeId: SSLCOMMERZ_STORE_ID,
    storePassword: SSLCOMMERZ_STORE_PASSWORD,
    host: SSLCOMMERZ_SANDBOX ? HOSTS.sandbox : HOSTS.live,
  }
}

export type SessionInput = {
  orderNumber: string
  amount: number
  customer: { name: string; email: string; phone: string }
  address: AddressSnapshot
  baseUrl: string
}

/**
 * Opens a hosted checkout and returns the URL to send the customer to.
 *
 * Redirect-based, with no card fields on our side — which is exactly what keeps
 * the store in PCI SAQ A (docs/04-security.md).
 */
export async function createSession(input: SessionInput): Promise<{ redirectUrl: string }> {
  const { storeId, storePassword, host } = config()
  const suppliedPostcode = input.address.postalCode?.trim()
  const returnOrder = `&order=${encodeURIComponent(input.orderNumber)}`

  if (suppliedPostcode && !/^\d{4}$/.test(suppliedPostcode)) {
    throw new Error('Postcode must be four digits when provided')
  }

  // SSLCommerz requires both postcode fields even though postcode is optional
  // in our Bangladesh checkout. Use a valid neutral fallback only at the
  // provider boundary; the saved customer address remains blank.
  const gatewayPostcode = suppliedPostcode || '1000'

  const body = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    // Decimal at the provider boundary; minor units everywhere inside.
    // Must be the ungrouped form — a thousands separator is rejected outright.
    total_amount: toDecimalString(input.amount),
    // Follows store configuration so the charged currency cannot drift from the
    // one displayed and reported. SSLCommerz settles BDT for Bangladeshi
    // merchants; a store configured otherwise needs a provider that supports it.
    currency: CURRENCY,
    tran_id: input.orderNumber,

    success_url: `${input.baseUrl}/api/webhooks/sslcommerz/return?status=success${returnOrder}`,
    fail_url: `${input.baseUrl}/api/webhooks/sslcommerz/return?status=fail${returnOrder}`,
    cancel_url: `${input.baseUrl}/api/webhooks/sslcommerz/return?status=cancel${returnOrder}`,
    // The only one that decides anything. The three above are just where the
    // browser lands and are never trusted.
    ipn_url: `${input.baseUrl}/api/webhooks/sslcommerz`,

    cus_name: input.customer.name,
    cus_email: input.customer.email,
    cus_phone: input.customer.phone,
    cus_add1: input.address.line1,
    cus_city: input.address.city,
    cus_state: input.address.district,
    cus_postcode: gatewayPostcode,
    cus_country: 'Bangladesh',

    /**
     * Declaring a shipping method makes the whole ship_* block mandatory —
     * omitting it is rejected with "'ship_name' is missing" rather than being
     * treated as optional. Same address as the order, since that is where the
     * goods actually go.
     */
    shipping_method: 'Courier',
    ship_name: input.address.recipient,
    ship_add1: input.address.line1,
    ship_add2: input.address.line2 ?? '',
    ship_city: input.address.city,
    ship_state: input.address.district,
    ship_postcode: gatewayPostcode,
    ship_country: 'Bangladesh',

    num_of_item: '1',
    product_name: `Order ${input.orderNumber}`,
    product_category: 'General',
    product_profile: 'physical-goods',
  })

  const res = await fetch(`${host}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) throw new Error(`SSLCommerz session request failed: ${res.status}`)

  const data: { status?: string; GatewayPageURL?: string; failedreason?: string } = await res.json()

  if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
    throw new Error(`SSLCommerz refused the session: ${data.failedreason ?? data.status}`)
  }

  return { redirectUrl: data.GatewayPageURL }
}

export type ValidatedPayment = {
  valid: boolean
  orderNumber: string
  /** Integer poisha, converted back from the decimal the API returns. */
  amount: number
  currency: string
  providerRef: string
  raw: Record<string, unknown>
}

/**
 * Verifies a notification by asking SSLCommerz directly.
 *
 * The IPN body is NOT self-authenticating the way a signed Stripe webhook is —
 * anyone who knows the URL can post to it. The only trustworthy answer comes
 * from calling the validation API with the `val_id` and reading what it says.
 * Trusting the posted body is the most likely way to ship a forged-payment
 * hole here, so this is the single path by which an order becomes paid.
 */
export async function validatePayment(valId: string): Promise<ValidatedPayment> {
  const { storeId, storePassword, host } = config()

  const url = new URL(`${host}/validator/api/validationserverAPI.php`)
  url.searchParams.set('val_id', valId)
  url.searchParams.set('store_id', storeId)
  url.searchParams.set('store_passwd', storePassword)
  url.searchParams.set('format', 'json')

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`SSLCommerz validation request failed: ${res.status}`)

  const data: Record<string, unknown> = await res.json()
  const status = String(data.status ?? '')

  return {
    // VALIDATED means it was already validated once — still a genuine payment.
    valid: status === 'VALID' || status === 'VALIDATED',
    orderNumber: String(data.tran_id ?? ''),
    amount: Math.round(Number(data.amount ?? 0) * 100),
    currency: String(data.currency ?? ''),
    providerRef: String(data.bank_tran_id ?? data.val_id ?? valId),
    raw: data,
  }
}
