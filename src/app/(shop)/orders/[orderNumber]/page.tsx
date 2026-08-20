import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { env } from '@/lib/env'
import { formatBdt } from '@/lib/money'
import { getEffectiveGoogleConfig } from '@/modules/google'
import { GooglePurchaseTracker } from '@/modules/google/components/purchase-tracker'
import { getVisibleOrder, listShipments } from '@/modules/orders'
import { MetaPurchasePayload } from '@/modules/meta/components/meta-purchase-payload'
import { buildMetaPurchaseData, purchaseEventId } from '@/modules/meta'
import { BankTransferInstructions } from '@/modules/payments/components/bank-transfer-instructions'
import { PayNowPanel } from '@/modules/payments/components/pay-now-panel'
import { PaymentConfirmingRefresh } from '@/modules/payments/components/payment-confirming-refresh'

export const metadata: Metadata = { title: 'Your order', robots: { index: false } }

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  cod_pending: {
    title: 'Order confirmed — cash on delivery',
    body: 'Pay the total to the courier when your order arrives. We will email you when it ships.',
  },
  awaiting_transfer: {
    title: 'Order placed — awaiting your transfer',
    body: 'Send the amount below, then submit your transaction reference. We confirm within one working day.',
  },
  awaiting_verification: {
    title: 'Reference received',
    body: 'We are checking your transfer against our bank statement. You will get an email once it clears.',
  },
  unpaid: {
    title: 'Order placed — payment pending',
    body: 'Complete payment to confirm your order. Your items are held for 30 minutes.',
  },
  paid: {
    title: 'Order confirmed',
    body: 'Payment received. We will email you when it ships.',
  },
  failed: {
    title: 'Payment did not go through',
    body: 'Nothing was charged. You can try paying again below.',
  },
  refunded: {
    title: 'Order refunded',
    body: 'The payment has been returned to you.',
  },
}

function fulfilmentCopy(status: string, paymentMethod: string) {
  if (status === 'processing') {
    return {
      title: 'Order is being prepared',
      body: 'Your order is confirmed and is being prepared for dispatch.',
    }
  }
  if (status === 'shipped') {
    return {
      title: 'Your order has shipped',
      body:
        paymentMethod === 'cod'
          ? 'Your parcel is on the way. Pay the courier when it arrives.'
          : 'Your parcel is on the way. Tracking details are shown below when available.',
    }
  }
  if (status === 'delivered') {
    return {
      title: 'Order delivered',
      body: 'This order has been marked delivered. Thank you for shopping with SirajiBD.',
    }
  }
  return null
}

/**
 * The order page's dynamic half, inside its own Suspense boundary.
 *
 * Per-request reads on this route have historically produced a non-hydrating
 * subtree. Critical recovery and conversion controls therefore use progressive
 * HTML/server mechanisms rather than assuming client effects or click handlers
 * will wake up.
 */
async function OrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ payment?: string; c?: string; paymentError?: string }>
}) {
  await connection()

  const { orderNumber } = await params
  const order = await getVisibleOrder(orderNumber)
  const {
    payment: returnStatus,
    c: confirmAttemptRaw,
    paymentError,
  } = await searchParams

  // Clamped rather than trusted: this rides in the URL, so a hand-edited value
  // must not be able to drive an unbounded refresh loop.
  const confirmAttempt = Math.min(Math.max(Number(confirmAttemptRaw) || 0, 0), 99)

  if (!order) redirect(`/orders/lookup?order=${encodeURIComponent(orderNumber)}`)

  const [shipments, googleConfig] = await Promise.all([
    listShipments(order.id),
    getEffectiveGoogleConfig().catch(() => ({
      enabled: false,
      source: 'disabled' as const,
      purchaseTrackingEnabled: false,
    })),
  ])
  const confirmingPayment = returnStatus === 'success' && order.paymentStatus === 'unpaid'
  const fulfilment = fulfilmentCopy(order.fulfillmentStatus, order.paymentMethod)
  const copy = order.status === 'cancelled'
    ? order.paymentStatus === 'paid'
      ? {
          title: 'Order cancelled — payment received',
          body: 'The order will not ship. Please contact the store so the refund can be completed.',
        }
      : order.paymentStatus === 'refunded'
        ? { title: 'Order cancelled and refunded', body: 'The payment has been returned.' }
        : { title: 'Order cancelled', body: 'No successful payment is recorded for this order.' }
    : confirmingPayment
      ? {
          title: 'Payment received — confirming',
          body: 'Your payment was completed. We are confirming it now; you do not need to pay again.',
        }
      : fulfilment && (order.paymentStatus === 'paid' || order.paymentStatus === 'cod_pending')
        ? fulfilment
        : (STATUS_COPY[order.paymentStatus] ?? STATUS_COPY.unpaid!)
  const address = order.shippingAddress
  const isPaidConfirmed = order.paymentStatus === 'paid' && order.status === 'confirmed'

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      {isPaidConfirmed ? (
        <>
          {/* Same builder the CAPI delivery uses, so browser and server cannot
              describe the same sale differently. */}
          <MetaPurchasePayload
            eventId={purchaseEventId(order.id)}
            data={buildMetaPurchaseData(order)}
          />
          <GooglePurchaseTracker
            enabled={googleConfig.enabled && googleConfig.purchaseTrackingEnabled}
            order={order}
          />
        </>
      ) : null}

      {confirmingPayment ? (
        <PaymentConfirmingRefresh orderNumber={order.orderNumber} attempt={confirmAttempt} />
      ) : null}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="text-(--color-muted)">{copy.body}</p>
        <p className="text-sm">
          Order <span className="font-medium tabular-nums">{order.orderNumber}</span>
        </p>
      </div>

      {order.status === 'cancelled' ? (
        <p className="rounded-lg bg-(--color-danger)/10 px-4 py-3 text-sm text-(--color-danger)">
          {order.paymentStatus === 'paid'
            ? 'Payment arrived after this order was cancelled and its stock was released. Do not reorder from this page; contact the store about the refund.'
            : order.paymentStatus === 'refunded'
              ? 'This order was cancelled and the payment was refunded.'
              : 'This order was cancelled. No successful payment is recorded.'}
        </p>
      ) : order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'awaiting_transfer' ? (
        <BankTransferInstructions
          orderNumber={order.orderNumber}
          amount={order.total}
          bank={{
            accountName: env.BANK_ACCOUNT_NAME ?? null,
            accountNumber: env.BANK_ACCOUNT_NUMBER ?? null,
            bankName: env.BANK_NAME ?? null,
            branch: env.BANK_BRANCH ?? null,
          }}
        />
      ) : order.paymentMethod === 'sslcommerz' &&
        !confirmingPayment &&
        (order.paymentStatus === 'unpaid' || order.paymentStatus === 'failed') ? (
        <PayNowPanel
          orderNumber={order.orderNumber}
          amount={order.total}
          errorCode={paymentError}
        />
      ) : null}

      {shipments.length > 0 ? (
        <section className="storefront-card flex flex-col gap-3 p-5 text-sm">
          <h2 className="text-sm font-semibold">Delivery status</h2>
          <p className="capitalize text-(--color-muted)">{order.fulfillmentStatus}</p>
          <ul className="flex flex-col gap-3 border-t border-(--color-border) pt-3">
            {shipments.map((shipment) => (
              <li key={shipment.id} className="flex flex-col gap-1">
                <span className="font-medium">{shipment.carrier}</span>
                {shipment.trackingNumber ? (
                  <span className="text-(--color-muted)">
                    Tracking number: <span className="font-medium text-(--color-text)">{shipment.trackingNumber}</span>
                  </span>
                ) : (
                  <span className="text-(--color-muted)">Tracking number will be added when available.</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="storefront-card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold">Items</h2>

        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span className="min-w-0">
                {item.productTitle}
                {item.variantTitle ? ` · ${item.variantTitle}` : ''}
                <span className="text-(--color-muted)"> × {item.quantity}</span>
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

      <section className="storefront-card flex flex-col gap-2 p-5 text-sm">
        <h2 className="text-sm font-semibold">Delivering to</h2>
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
          {address.phone}
        </address>
      </section>

      <Link href="/" className="text-sm underline underline-offset-4">
        ← Continue shopping
      </Link>
    </div>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-9 w-2/3 animate-pulse rounded bg-(--color-surface)" />
        <div className="h-5 w-full animate-pulse rounded bg-(--color-surface)" />
      </div>
      <div className="h-40 animate-pulse rounded-lg bg-(--color-surface)" />
      <div className="h-32 animate-pulse rounded-lg bg-(--color-surface)" />
    </div>
  )
}

export default function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ payment?: string; c?: string; paymentError?: string }>
}) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetail params={params} searchParams={searchParams} />
    </Suspense>
  )
}
