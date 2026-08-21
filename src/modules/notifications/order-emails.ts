import 'server-only'

import { formatBdt } from '@/lib/money'
import { STORE_CONFIG } from '@/lib/store-config'
import { taxLineLabel } from '@/lib/tax'

import { escapeHtml, sendMail } from './mailer'

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
  taxAmount: number
  items: OrderLine[]
  recipient: string
}

const BASE = process.env.BETTER_AUTH_URL ?? ''

/**
 * `heading` and `intro` are escaped here because they carry interpolated user
 * and admin text. `body` is not — it is HTML this file built, and every value
 * inside it was escaped at the point it was inserted.
 */
function shell(heading: string, intro: string, body: string, action?: { label: string; url: string }) {
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111">
      <h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(heading)}</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px;color:#444">${escapeHtml(intro)}</p>
      ${body}
      ${
        action
          ? `<p style="margin:24px 0 0"><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px">${escapeHtml(action.label)}</a></p>`
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
          ${escapeHtml(i.productTitle)}${i.variantTitle ? ` · ${escapeHtml(i.variantTitle)}` : ''} × ${i.quantity}
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
      ${
        order.taxAmount > 0
          ? `<tr>
        <td style="font-size:14px;color:#666">${escapeHtml(taxLineLabel(STORE_CONFIG.tax))}${STORE_CONFIG.tax.mode === 'inclusive' ? ' — included' : ''}</td>
        <td style="font-size:14px;text-align:right">${formatBdt(order.taxAmount)}</td>
      </tr>`
          : ''
      }
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

export function sendOrderPlacedCod(order: OrderSummary) {
  return sendMail({
    to: order.email,
    subject: `Order ${order.orderNumber} confirmed`,
    html: shell(
      'Thanks — your order is confirmed',
      `Your cash-on-delivery order is confirmed, ${order.recipient}. Please pay ${formatBdt(order.total)} to the courier when it arrives.`,
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
    ? `<p style="font-size:15px;margin:0 0 8px">Tracking number: <strong>${escapeHtml(parcel.trackingNumber)}</strong></p>`
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

export function sendOrderDelivered(
  order: Pick<OrderSummary, 'orderNumber' | 'email' | 'recipient'>,
) {
  return sendMail({
    to: order.email,
    subject: `Order ${order.orderNumber} delivered`,
    html: shell(
      'Delivered',
      `Your order arrived, ${order.recipient}. If anything is wrong with it, reply to this email within seven days and we will sort it out.`,
      '',
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
    ? `<p style="font-size:15px;margin:0">We received ${formatBdt(order.total)}. The order will not ship; please contact the store while the refund is completed through the original payment method.</p>`
    : `<p style="font-size:15px;margin:0">No successful payment is recorded for this order.</p>`

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
