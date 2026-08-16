import { createHmac, timingSafeEqual } from 'node:crypto'

const VERSION = 'v1'
const MAX_ORDERS = 10
const ACCESS_TTL_MS = 7 * 24 * 60 * 60_000
const ORDER_NUMBER = /^[A-Z0-9-]{4,32}$/

function signature(payload: string, secret: string) {
  return createHmac('sha256', secret).update(`${VERSION}.${payload}`).digest()
}

/**
 * Signs the guest order-access list.
 *
 * `httpOnly` prevents browser scripts from reading a cookie; it does not stop a
 * visitor from replacing the cookie in developer tools or a custom HTTP
 * client. The signature is therefore the ownership proof, not the cookie flag.
 */
export function signOrderAccess(orderNumbers: string[], secret: string, now = Date.now()): string {
  const safe = [...new Set(orderNumbers)]
    .filter((value) => ORDER_NUMBER.test(value))
    .slice(0, MAX_ORDERS)
  const payload = Buffer.from(
    JSON.stringify({ orders: safe, expiresAt: now + ACCESS_TTL_MS }),
    'utf8',
  ).toString('base64url')
  return `${VERSION}.${payload}.${signature(payload, secret).toString('base64url')}`
}

/** Returns an empty list for an unsigned, malformed, expired-format or tampered cookie. */
export function verifyOrderAccess(
  value: string | undefined,
  secret: string,
  now = Date.now(),
): string[] {
  if (!value) return []

  const [version, payload, supplied] = value.split('.')
  if (version !== VERSION || !payload || !supplied) return []

  let actual: Buffer
  try {
    actual = Buffer.from(supplied, 'base64url')
  } catch {
    return []
  }

  const expected = signature(payload, secret)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return []

  try {
    const decoded: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (
      !decoded ||
      typeof decoded !== 'object' ||
      !('orders' in decoded) ||
      !Array.isArray(decoded.orders) ||
      !('expiresAt' in decoded) ||
      typeof decoded.expiresAt !== 'number' ||
      !Number.isFinite(decoded.expiresAt) ||
      decoded.expiresAt <= now
    ) return []

    return decoded.orders
      .filter((item): item is string => typeof item === 'string' && ORDER_NUMBER.test(item))
      .slice(0, MAX_ORDERS)
  } catch {
    return []
  }
}
