import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'

import { requireRole } from '@/modules/accounts'
import { listAuditLogs } from '@/modules/admin'

export const metadata: Metadata = { title: 'Activity' }

/** Entries whose entity is an order link back to it; the rest are text only. */
const ORDER_ACTIONS = /^(order|transfer)\./

export default async function ActivityPage() {
  await connection()
  await requireRole('admin')

  const entries = await listAuditLogs(200)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-(--color-muted)">
          Every change made from the admin, newest first. This log cannot be edited.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-lg border border-(--color-border) p-5 text-sm text-(--color-muted)">
          Nothing recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-(--color-border)">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="border-b border-(--color-border) text-left text-xs text-(--color-muted)">
              <tr>
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">Who</th>
                <th className="px-4 py-2 font-medium">Action</th>
                <th className="px-4 py-2 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-(--color-border) last:border-0">
                  <td className="px-4 py-2 whitespace-nowrap text-(--color-muted) tabular-nums">
                    {entry.createdAt.toLocaleString('en-GB')}
                  </td>
                  <td className="px-4 py-2 text-(--color-muted)">{entry.actorEmail}</td>
                  <td className="px-4 py-2 font-medium">
                    {entry.entityId && ORDER_ACTIONS.test(entry.action) ? (
                      <Link
                        href={`/admin/orders/${entry.entityId}`}
                        className="underline underline-offset-4"
                      >
                        {entry.action}
                      </Link>
                    ) : (
                      entry.action
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-(--color-muted)">
                    {entry.detail ? JSON.stringify(entry.detail) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
