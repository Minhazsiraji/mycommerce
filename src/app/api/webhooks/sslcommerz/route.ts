import { handleGatewayNotification } from '@/modules/payments'

/**
 * SSLCommerz IPN. The only path by which a gateway order becomes paid.
 *
 * Acknowledge fast: verify, record, respond. Anything slow here causes the
 * provider to time out and retry, and retries amplify whatever is already slow.
 *
 * Always returns 200, even on failure. A non-200 makes SSLCommerz retry
 * indefinitely, which does not help — a payment that failed validation will
 * fail it again. Problems are logged for a human instead.
 */
export async function POST(request: Request) {
  let valId: string | null = null

  try {
    const form = await request.formData()
    valId = String(form.get('val_id') ?? '')

    if (!valId) {
      console.warn('[sslcommerz] notification with no val_id')
      return Response.json({ received: true }, { status: 200 })
    }

    const result = await handleGatewayNotification(valId)
    return Response.json({ received: true, result }, { status: 200 })
  } catch (error) {
    // Includes amount mismatches, which are the interesting case: a genuine
    // one means someone tampered with a notification.
    console.error('[sslcommerz] notification failed', { valId, error })
    return Response.json({ received: true }, { status: 200 })
  }
}
