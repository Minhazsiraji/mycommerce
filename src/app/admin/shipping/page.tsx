import type { Metadata } from 'next'
import { connection } from 'next/server'

import { listRates } from '@/modules/shipping'
import { ShippingManager } from '@/modules/shipping/components/shipping-manager'

export const metadata: Metadata = { title: 'Delivery' }

export default async function AdminShippingPage() {
  await connection()

  const rates = await listRates()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Delivery</h1>
        <p className="text-sm text-(--color-muted)">
          Charges, coverage and free-delivery thresholds. Nothing here is fixed in code — these
          are the numbers customers see at checkout.
        </p>
      </div>

      <ShippingManager rates={rates} />
    </div>
  )
}
