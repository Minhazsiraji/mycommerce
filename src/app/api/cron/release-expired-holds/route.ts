import { env } from '@/lib/env'
import { listExpiredHolds, releaseHold } from '@/modules/orders'

/**
 * Returns stock reserved by orders that were never paid.
 *
 * Without this an abandoned checkout holds stock nobody can buy, permanently —
 * the store slowly sells out of things it still has. Windows are set when the
 * order is created: 30 minutes for a gateway checkout, 72 hours for a bank
 * transfer.
 *
 * Idempotent by construction: releasing sets the order to cancelled and clears
 * its hold, so a second run finds nothing.
 */
export async function POST(request: Request) {
  const secret = request.headers.get('authorization')

  // Vercel Cron sends this header; without the check anyone could invoke it.
  if (!env.CRON_SECRET || secret !== `Bearer ${env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expired = await listExpiredHolds()
  const released: string[] = []

  for (const order of expired) {
    try {
      await releaseHold(order.id, 'expired')
      released.push(order.orderNumber)
    } catch (error) {
      // One bad order must not stop the rest being released.
      console.error('[cron] failed to release hold', order.orderNumber, error)
    }
  }

  return Response.json({ checked: expired.length, released })
}
