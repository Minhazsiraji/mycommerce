import type { Metadata } from 'next'
import { connection } from 'next/server'

import { listFraudBlocks } from '@/modules/fraud'
import { FraudManager } from '@/modules/fraud/components/fraud-manager'

export const metadata: Metadata = { title: 'Fraud controls' }

export default async function FraudPage() {
  await connection()
  const blocks = await listFraudBlocks()
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fraud controls</h1>
        <p className="mt-1 text-sm text-(--color-muted)">
          Review and block phone numbers, emails, or IP addresses from placing orders.
        </p>
      </div>
      <FraudManager blocks={blocks} />
    </div>
  )
}
