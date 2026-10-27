import type { Metadata } from 'next'
import { connection } from 'next/server'

import { listPendingTransfers } from '@/modules/payments'
import { TransferQueue } from '@/modules/payments/components/transfer-queue'

export const metadata: Metadata = { title: 'Manual payments' }

export default async function AdminTransfersPage() {
  await connection()

  const transfers = await listPendingTransfers()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manual payments</h1>
        <p className="text-sm text-(--color-muted)">
          Customers who submitted a bank or bKash transaction reference. Check each against
          the relevant account records before confirming — the reference is a claim, not proof.
        </p>
      </div>

      <TransferQueue
        transfers={transfers.map((t) => ({
          orderId: t.orderId,
          orderNumber: t.orderNumber,
          email: t.email,
          total: t.total,
          reference: t.reference,
          submittedAt: t.submittedAt,
        }))}
      />
    </div>
  )
}
