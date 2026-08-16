import {
  CallbackPayloadTooLarge,
  handleGatewayNotification,
  PaymentError,
  readCallbackForm,
} from '@/modules/payments'

const MAX_CALLBACK_BYTES = 64 * 1024

/**
 * SSLCommerz IPN. The only path by which a gateway order becomes paid.
 *
 * Acknowledge fast: verify, record, respond. Anything slow here causes the
 * provider to time out and retry, and retries amplify whatever is already slow.
 *
 * Invalid commercial data returns 200 because it will not become valid on a
 * retry. Provider, network and database faults return 503 so a real payment is
 * not lost to a transient outage.
 */
export async function POST(request: Request) {
  let valId: string | null = null

  try {
    const form = await readCallbackForm(request, MAX_CALLBACK_BYTES)
    valId = String(form.get('val_id') ?? '')

    if (!valId) {
      console.warn('[sslcommerz] notification with no val_id')
      return Response.json({ received: true }, { status: 200 })
    }

    const result = await handleGatewayNotification(valId)
    return Response.json({ received: true, result }, { status: 200 })
  } catch (error) {
    if (error instanceof CallbackPayloadTooLarge) {
      return Response.json({ error: 'Payload too large' }, { status: 413 })
    }
    // Includes amount mismatches, which are the interesting case: a genuine
    // one means someone tampered with a notification.
    console.error('[sslcommerz] notification failed', { valId, error })
    // Invalid business data will not become valid on retry. Network, provider
    // and database faults might, so return 503 and let SSLCommerz retry them.
    return Response.json(
      { received: error instanceof PaymentError },
      { status: error instanceof PaymentError ? 200 : 503 },
    )
  }
}
