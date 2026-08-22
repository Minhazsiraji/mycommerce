import { STORE_CONFIG } from './store-config'

export const POLICY_LAST_UPDATED = 'August 18, 2026'

export const STORE_TRUST_ROUTES = [
  { href: '/returns', label: 'Returns & Refunds', group: 'customer-care' },
  { href: '/shipping', label: 'Shipping & Delivery', group: 'customer-care' },
  { href: '/contact', label: 'Contact Us', group: 'customer-care' },
  { href: '/about', label: `About ${STORE_CONFIG.name}`, group: 'company' },
  { href: '/privacy', label: 'Privacy Policy', group: 'legal' },
  { href: '/terms', label: 'Terms & Conditions', group: 'legal' },
] as const

export type StoreTrustRoute = (typeof STORE_TRUST_ROUTES)[number]

export function routesFor(group: StoreTrustRoute['group']) {
  return STORE_TRUST_ROUTES.filter((route) => route.group === group)
}
