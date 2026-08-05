import 'server-only'

import { formatBdt } from '@/lib/money'

import { sendMail } from './mailer'

/**
 * Transactional order emails.
 *
 * Sent directly rather than through an outbox. A durable queue is the right
 * answer eventually — see docs/01-architecture.md — but an email that fails
 * must never fail the order, so every caller treats these as best-effort and
 * logs rather than throws. Getting that wrong costs a sale; a missing
 * "shipped" email costs a support message.
 */

type OrderLine = { productTitle: string; variantTitle: string | null; quantity: number; lineTotal: number }

type OrderSummary = {
  orderNumber: string
  email: string
  total: number
  subtotal: number
  shippingCost: number
  items: OrderLine[]
  recipient: string
}

const BASE = process.env.BETTER_AUTH_URL ?? ''

function shell(heading: string, intro: string, body: string, action?: { label: string; url: string }) {
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111">
      <h1 style="font-size:20px;margin:0 0 12px">${heading}</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px;color:#444">${intro}</p>
      ${body}
      ${
        action
          ? `<p style="margin:24px 0 0"><a href="${action.url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px">${action.label}</a></p>`
          : ''
      }
      <p style="font-size:12px;color:#888;margin:28px 0 0">MyCommerce</p>
    </div>
  `
}

function itemsTable(order: OrderSummary) {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#444">
          ${i.productTitle}${i.variantTitle ? ` · ${i.variantTitle}` : ''} × ${i.quantity}
        </td>
        <td style="padding:6px 0;font-size:14px;text-align:right;white-space:nowrap">${formatBdt(i.lineTotal)}</td>
      </tr>`,
    )
    .join('')

  return `
    <table style="width:100%;border-collapse:collapse">
      ${rows}
      <tr><td colspan="2" style="border-top:1px solid #e5e5ea;padding-top:8px"></td></tr>
      <tr>
        <td style="font-size:14px;color:#666">Subtotal</td>
        <td style="font-size:14px;text-align:right">${formatBdt(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="font-size:14px;color:#666">Delivery</td>
        <td style="font-size:14px;text-align:right">${order.shippingCost === 0 ? 'Free' : formatBdt(order.shippingCost)}</td>
      </tr>
      <tr>
        <td style="font-size:15px;font-weight:600;padding-top:4px">Total</td>
        <td style="font-size:15px;font-weight:600;text-align:right;padding-top:4px">${formatBdt(order.total)}</td>
      </tr>
    </table>
  `
}

export function sendOrderConfirmed(order: OrderSummary) {
  return sendMail({
    to: order.email,
    subject: `Order ${order.orderNumber} confirmed`,
    html: shell(
      'Thanks — your order is confirmed',
      `We have your payment, ${order.recipient}. We will email you again when it ships.`,
      itemsTable(order),
      { label: 'View your order', url: `${BASE}/orders/${order.orderNumber}` },
    ),
  })
}

export function sendOrderShipped(
  order: Pick<OrderSummary, 'orderNumber' | 'email' | 'recipient'>,
  parcel: { carrier: string; trackingNumber: string | null },
) {
  const tracking = parcel.trackingNumber
    ? `<p style="font-size:15px;margin:0 0 8px">Tracking number: <strong>${parcel.trackingNumber}</strong></p>`
    : ''

  return sendMail({
    to: order.email,
    subject: `Order ${order.orderNumber} is on its way`,
    html: shell(
      'Your order has shipped',
      `It is with ${parcel.carrier} now, ${order.recipient}.`,
      tracking,
      { label: 'View your order', url: `${BASE}/orders/${order.orderNumber}` },
    ),
  })
}

export function sendOrderCancelled(
  order: Pick<OrderSummary, 'orderNumber' | 'email' | 'recipient' | 'total'>,
  reason: string,
  wasPaid: boolean,
) {
  const refund = wasPaid
    ? `<p style="font-size:15px;margin:0">We are refunding ${formatBdt(order.total)}. Depending on your bank this can take a few working days to appear.</p>`
    : `<p style="font-size:15px;margin:0">Nothing was charged.</p>`

  return sendMail({
    to: order.email,
    subject: `Order ${order.orderNumber} cancelled`,
    html: shell(
      'Your order was cancelled',
      `${reason}`,
      refund,
      { label: 'Browse the store', url: BASE || '#' },
    ),
  })
}
