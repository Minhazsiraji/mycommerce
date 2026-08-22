import type { Metadata } from 'next'
import { connection } from 'next/server'

import {
  getGoogleAdminState,
  googleAdminFormDefaults,
  listPurchaseDiagnostics,
} from '@/modules/google'
import { GoogleIntegrationForm } from '@/modules/google/components/google-integration-form'

export const metadata: Metadata = { title: 'Google integration' }

export default async function GoogleIntegrationPage() {
  await connection()

  const [state, diagnostics] = await Promise.all([
    getGoogleAdminState(),
    listPurchaseDiagnostics().catch(() => []),
  ])
  const settings = state.settings

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-(--color-muted)">Integrations</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Google</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--color-muted)">
          Manage the Google tag and purchase measurement for this store without hard-coding any store identity into the application. Existing Vercel configuration can remain as a fallback until Admin-managed settings take over.
        </p>
      </div>

      <GoogleIntegrationForm
        initial={googleAdminFormDefaults(settings, state.effective)}
        status={state.effective}
      />

      {/*
        Why each recent order did or did not report a purchase. The order page
        itself cannot answer this: its copy reads "Order confirmed — payment
        received" whenever paymentStatus is paid, whatever `status` says, so an
        order that is correctly ineligible looks identical to one that is not.
      */}
      {diagnostics.length > 0 ? (
        <section className="flex flex-col gap-3 rounded-lg border border-(--color-border) p-5">
          <div>
            <h2 className="font-semibold">Recent orders — purchase reporting</h2>
            <p className="text-sm text-(--color-muted)">
              Whether each order emits a Google <code>purchase</code>, and why.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="border-b border-(--color-border) text-left text-xs text-(--color-muted)">
                <tr>
                  <th className="px-3 py-2 font-medium">Order</th>
                  <th className="px-3 py-2 font-medium">Method</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Payment</th>
                  <th className="px-3 py-2 font-medium">Reports?</th>
                  <th className="px-3 py-2 font-medium">Why</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((row) => (
                  <tr key={row.orderNumber} className="border-b border-(--color-border) last:border-0">
                    <td className="px-3 py-2 font-medium tabular-nums">{row.orderNumber}</td>
                    <td className="px-3 py-2 text-(--color-muted)">{row.paymentMethod}</td>
                    <td className="px-3 py-2 text-(--color-muted)">{row.status}</td>
                    <td className="px-3 py-2 text-(--color-muted)">{row.paymentStatus}</td>
                    <td className="px-3 py-2 font-medium">{row.eligible ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2 text-xs text-(--color-muted)">{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
