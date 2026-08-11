import 'server-only'

import { callerId, rateLimit } from '@/lib/rate-limit'

import * as repo from './repository'

const BLOCKED_MESSAGE =
  'We cannot accept this order automatically. Please contact the store for assistance.'

export async function assessCheckout(input: { email: string; phone: string }) {
  const ip = await callerId()
  const email = input.email.trim().toLowerCase()

  const [phoneBlock, emailBlock, ipBlock] = await Promise.all([
    repo.findActiveBlock('phone', input.phone),
    repo.findActiveBlock('email', email),
    repo.findActiveBlock('ip', ip),
  ])

  if (phoneBlock || emailBlock || ipBlock) {
    return { allowed: false as const, ip, message: BLOCKED_MESSAGE }
  }

  // IP limiting already exists. These extra buckets stop a fraudster rotating
  // networks while repeatedly using the same delivery identity.
  const [phoneVelocity, emailVelocity] = await Promise.all([
    rateLimit('place-order-phone', 3, 3600, input.phone),
    rateLimit('place-order-email', 5, 3600, email),
  ])
  if (!phoneVelocity.ok || !emailVelocity.ok) {
    return { allowed: false as const, ip, message: BLOCKED_MESSAGE }
  }

  const history = await repo.countRecentProblemOrders({ phone: input.phone, email, ip })
  if (history.phone_count >= 3 || history.email_count >= 4 || history.ip_count >= 6) {
    return { allowed: false as const, ip, message: BLOCKED_MESSAGE }
  }

  return { allowed: true as const, ip, message: '' }
}
