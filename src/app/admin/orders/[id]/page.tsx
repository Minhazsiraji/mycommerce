import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'

import { formatBdt } from '@/lib/money'
import { getOrderById, listShipments } from '@/modules/orders'
import { OrderAdminActions } from '@/modules/orders/components/order-admin-actions'
import { OrderNotes } from '@/modules/orders/components/order-notes'
import { OrderParcels } from '@/modules/orders/components/order-parcels'
import { GatewayPaymentRecheck } from '@/modules/payments/components/gateway-payment-recheck'

export const metadata: Metadata = { title: 'Order' }

const label = (s: string) => s.replace(/_/g, ' ')

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()

  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const parcels = await listShipments(order.id)
  const address = order.shippingAddress

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/orders"
          className="text-sm text-(--color-muted) underline underline-offset-4"
        >
          ← Orders
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
          {order.orderNumber}
        </h1>
        <p className="text-sm text-(--color-muted)">
          {order.createdAt.toLocaleString('en-GB')} · {label(order.paymentMethod)} ·{' '}
          {label(order.paymentStatus)}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3 rounded-lg border border-(--color-border) p-5">
            <h2 className="text-sm font-semibold">Items</h2>

            <ul className="flex flex-col gap-2 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span className="min-w-0">
                    {item.productTitle}
                    {item.variantTitle ? ` · ${item.variantTitle}` : ''}
                    <span className="block text-xs text-(--color-muted)">
                      SKU {item.sku} · {formatBdt(item.unitPrice)} × {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums">{formatBdt(item.lineTotal)}</span>
                </li>
              ))}
            </ul>

            <dl className="flex flex-col gap-1 border-t border-(--color-border) pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-(--color-muted)">Subtotal</dt>
                <dd className="tabular-nums">{formatBdt(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--color-muted)">Delivery</dt>
                <dd className="tabular-nums">
                  {order.shippingCost === 0 ? 'Free' : formatBdt(order.shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatBdt(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-(--color-border) p-5">
            <OrderAdminActions
              orderId={order.id}
              fulfillmentStatus={order.fulfillmentStatus}
              cancelled={order.status === 'cancelled'}
              paid={order.paymentStatus === 'paid'}
              collectOnDelivery={
                order.paymentMethod === 'cod' && order.paymentStatus === 'cod_pending'
              }
            />
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-6">
          <section className="flex flex-col gap-2 rounded-lg border border-(--color-border) p-5 text-sm">
            <h2 className="text-sm font-semibold">Deliver to</h2>
            <address className="text-(--color-muted) not-italic">
              {address.recipient}
              <br />
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}
              <br />
              {address.union ? `${address.union}, ` : ''}
              {address.upazila ? `${address.upazila}, ` : ''}{address.district}
              <br />
              {address.city}
              {address.postalCode ? ` ${address.postalCode}` : ''}
              <br />
              <a href={`tel:${address.phone}`} className="underline underline-offset-4">
                {address.phone}
              </a>
            </address>
            <p className="text-xs text-(--color-muted)">{order.email}</p>
            {order.checkoutIp ? (
              <p className="text-xs text-(--color-muted)">Checkout IP: {order.checkoutIp}</p>
            ) : null}
          </section>

          {order.paymentMethod === 'sslcommerz' && order.paymentStatus !== 'paid' ? (
            <GatewayPaymentRecheck orderNumber={order.orderNumber} />
          ) : null}

          <OrderParcels orderId={order.id} parcels={parcels} />

          <OrderNotes orderId={order.id} notes={order.notes} />
        </aside>
      </div>
    </div>
  )
}
